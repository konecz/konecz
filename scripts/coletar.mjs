// Coleta os números do perfil na API GraphQL do GitHub, com o token do dono da conta.
// Só saem daqui agregados: nome de repositório privado não entra no resultado.
const ENDPOINT = "https://api.github.com/graphql";
export const FUSO = "America/Sao_Paulo";
const DIAS_ENTREGAS = 28;

async function consultar(token, query, variables = {}) {
  for (let tentativa = 1; ; tentativa++) {
    let motivo;
    try {
      const resp = await fetch(ENDPOINT, {
        method: "POST",
        headers: { authorization: `bearer ${token}`, "content-type": "application/json", "user-agent": "konecz-perfil" },
        body: JSON.stringify({ query, variables }),
        signal: AbortSignal.timeout(30_000),
      });
      const corpo = await resp.json();
      if (resp.ok && !corpo.errors) return corpo.data;
      motivo = `HTTP ${resp.status}: ${JSON.stringify(corpo.errors ?? corpo).slice(0, 300)}`;
    } catch (erro) {
      motivo = erro.message;
    }
    if (tentativa === 3) throw new Error(`GitHub GraphQL falhou: ${motivo}`);
    await new Promise((ok) => setTimeout(ok, 3000 * tentativa));
  }
}

const PERFIL = `query($login:String!, $integrados:String!, $abertos:String!, $fora:String!) {
  user(login:$login) {
    id
    contributionsCollection { contributionCalendar { totalContributions
      weeks { contributionDays { date weekday contributionCount } } } }
    repositories(first:100, ownerAffiliations:OWNER, isFork:false) {
      totalCount
      nodes { owner { login } name defaultBranchRef { name }
        languages(first:30, orderBy:{field:SIZE, direction:DESC}) { edges { size node { name } } } }
    }
  }
  integrados: search(query:$integrados, type:ISSUE) { issueCount }
  abertos: search(query:$abertos, type:ISSUE) { issueCount }
  fora: search(query:$fora, type:ISSUE, first:6) { nodes { __typename
    ... on PullRequest { number title url state merged createdAt mergedAt closedAt reviewDecision additions deletions
      reviews { totalCount } repository { ...repoDeFora } }
    ... on Issue { number title url state createdAt closedAt repository { ...repoDeFora } } } }
}
fragment repoDeFora on Repository {
  nameWithOwner stargazerCount forkCount owner { avatarUrl(size:112) }
}`;

const HISTORICO = `query($dono:String!, $nome:String!, $autor:ID!, $desde:GitTimestamp!, $depois:String) {
  repository(owner:$dono, name:$nome) { defaultBranchRef { target { ... on Commit {
    history(first:100, after:$depois, author:{id:$autor}, since:$desde) {
      totalCount pageInfo { hasNextPage endCursor } nodes { authoredDate } } } } } }
}`;

const MESCLADOS = `query($busca:String!, $depois:String) {
  search(query:$busca, type:ISSUE, first:100, after:$depois) {
    pageInfo { hasNextPage endCursor } nodes { ... on PullRequest { mergedAt } } }
}`;

const diaLocal = new Intl.DateTimeFormat("en-CA", { timeZone: FUSO, year: "numeric", month: "2-digit", day: "2-digit" });
const horaLocal = new Intl.DateTimeFormat("en-GB", { timeZone: FUSO, hour: "2-digit", hourCycle: "h23" });

async function horasDosCommits(token, repos, autor, desde) {
  const porHora = Array(24).fill(0);
  let total = 0;
  await Promise.all(repos.filter((r) => r.defaultBranchRef).map(async (r) => {
    let depois = null;
    do {
      const d = await consultar(token, HISTORICO, { dono: r.owner.login, nome: r.name, autor, desde, depois });
      const h = d.repository?.defaultBranchRef?.target?.history;
      if (!h) return;
      if (depois === null) total += h.totalCount;
      for (const c of h.nodes) porHora[Number(horaLocal.format(new Date(c.authoredDate)))]++;
      depois = h.pageInfo.hasNextPage ? h.pageInfo.endCursor : null;
    } while (depois);
  }));
  return { total, porHora };
}

// PRs integrados por dia (no fuso de Curitiba) nos últimos DIAS_ENTREGAS dias, hoje incluído.
async function entregasPorDia(token, login) {
  const hoje = new Date(`${diaLocal.format(new Date())}T00:00:00Z`);
  const dias = Array.from({ length: DIAS_ENTREGAS }, (_, i) =>
    new Date(hoje.getTime() - (DIAS_ENTREGAS - 1 - i) * 86_400_000).toISOString().slice(0, 10));
  const contagem = new Map(dias.map((dia) => [dia, 0]));
  const busca = `author:${login} is:pr is:merged merged:>=${dias[0]}`;
  let depois = null;
  do {
    const d = await consultar(token, MESCLADOS, { busca, depois });
    for (const pr of d.search.nodes) {
      const dia = diaLocal.format(new Date(pr.mergedAt));
      if (contagem.has(dia)) contagem.set(dia, contagem.get(dia) + 1);
    }
    depois = d.search.pageInfo.hasNextPage ? d.search.pageInfo.endCursor : null;
  } while (depois);
  return dias.map((dia) => ({ dia, n: contagem.get(dia) }));
}

// Avatar do dono do repositório, embutido como data: (o SVG dentro de <img> não carrega nada de fora).
async function embutir(url) {
  const resp = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!resp.ok) return null;
  const tipo = resp.headers.get("content-type") ?? "image/png";
  return `data:${tipo};base64,${Buffer.from(await resp.arrayBuffer()).toString("base64")}`;
}

async function openSource(nos) {
  const avatares = new Map();
  for (const n of nos.filter((n) => n.repository)) {
    const url = n.repository.owner.avatarUrl;
    if (!avatares.has(url)) avatares.set(url, await embutir(url).catch(() => null));
  }
  return nos.filter((n) => n.repository).map((n) => ({
    tipo: n.__typename === "PullRequest" ? "pr" : "issue",
    repo: n.repository.nameWithOwner,
    avatar: avatares.get(n.repository.owner.avatarUrl),
    estrelas: n.repository.stargazerCount,
    forks: n.repository.forkCount,
    linhas: n.__typename === "PullRequest" ? { mais: n.additions, menos: n.deletions } : null,
    numero: n.number,
    titulo: n.title,
    url: n.url,
    estado: n.merged ? "integrado" : n.state === "OPEN" ? "aberto" : "fechado",
    revisado: n.__typename === "PullRequest" && (n.reviews.totalCount > 0 || n.reviewDecision !== null),
    criado: n.createdAt,
    integrado: n.mergedAt ?? null,
  }));
}

export async function coletar(token, login) {
  const p = await consultar(token, PERFIL, {
    login,
    integrados: `author:${login} is:pr is:merged`,
    abertos: `author:${login} is:pr is:open`,
    fora: `author:${login} -user:${login} is:public sort:updated-desc`,
  });
  const usuario = p.user;
  const cal = usuario.contributionsCollection.contributionCalendar;
  const semanas = cal.weeks.map((s) => {
    const dias = Array(7).fill(null);
    for (const d of s.contributionDays) dias[d.weekday] = { data: d.date, n: d.contributionCount };
    return dias;
  });

  const bytes = new Map();
  for (const r of usuario.repositories.nodes) {
    for (const e of r.languages.edges) bytes.set(e.node.name, (bytes.get(e.node.name) ?? 0) + e.size);
  }

  const umAno = new Date(Date.now() - 365 * 86_400_000).toISOString();
  const [commits, porDia] = await Promise.all([
    horasDosCommits(token, usuario.repositories.nodes, usuario.id, umAno),
    entregasPorDia(token, login),
  ]);

  return {
    geradoEm: new Date().toISOString(),
    login,
    contribuicoes: { total: cal.totalContributions, semanas },
    repositorios: usuario.repositories.totalCount,
    linguagens: [...bytes].sort((a, b) => b[1] - a[1]),
    commits,
    prs: { integrados: p.integrados.issueCount, abertos: p.abertos.issueCount, porDia },
    openSource: await openSource(p.fora.nodes),
  };
}
