// Cabeçalho, linguagens, ritmo (horário dos commits e entregas), open source e tripulação.
// Pouco texto de propósito: número, ícone e gráfico dizem o que cada coisa é.
import { svg, esc, num, f, misturar, barco, icone, logoDa, BRASIL } from "./desenho.mjs";

const EQUIPE = [["Pedro Lahrs", "PL"], ["Vanessa Cristine", "VC"]];

// Linha de onda que se repete a cada `per`, larga o bastante para deslizar um período sem emenda.
function onda(x0, x1, y, amp, per) {
  let d = `M${x0 - per} ${y}`;
  for (let x = x0 - per; x < x1 + per; x += per) d += `q${per / 4} ${-amp} ${per / 2} 0t${per / 2} 0`;
  return d;
}

const ONDAS_CSS = `@keyframes d64{to{transform:translateX(-64px)}}
@keyframes d72{to{transform:translateX(-72px)}}
@keyframes d90{to{transform:translateX(-90px)}}
@keyframes d110{to{transform:translateX(-110px)}}
.balanca{transform-box:view-box;animation:balanca 6s ease-in-out infinite}
@keyframes balanca{0%,100%{transform:translateY(2px) rotate(-2.5deg)}50%{transform:translateY(-3px) rotate(2.5deg)}}`;

// Selo náutico: Curitiba e o ano de fundação girando em volta do mapa do Brasil, com o pino na cidade.
function selo(cx, cy, t) {
  const R = 64, rTexto = 51, escala = 0.56;
  const mx = cx - (BRASIL.largura * escala) / 2, my = cy - (BRASIL.altura * escala) / 2;
  const px = mx + BRASIL.curitiba[0] * escala, py = my + BRASIL.curitiba[1] * escala;
  return `<defs><path id="volta" d="M${cx - rTexto} ${cy}a${rTexto} ${rTexto} 0 1 1 ${2 * rTexto} 0a${rTexto} ${rTexto} 0 1 1 ${-2 * rTexto} 0"/></defs>
<circle cx="${cx}" cy="${cy}" r="${R}" fill="${t.fundo}" stroke="${t.azul}" stroke-width="2"/>
<circle cx="${cx}" cy="${cy}" r="${R - 24}" fill="none" stroke="${t.borda}" stroke-width="1.5"/>
<g class="gira" style="transform-origin:${cx}px ${cy}px"><text class="m" font-size="12.5" fill="${t.sec}"><textPath href="#volta" textLength="${f(2 * Math.PI * rTexto - 8)}" lengthAdjust="spacing">CURITIBA · PARANÁ · DESDE 2025 ·</textPath></text></g>
<path transform="translate(${f(mx)} ${f(my)}) scale(${escala})" d="${BRASIL.d}" fill="${misturar(t.azul, t.fundo, 0.82)}" stroke="${t.azul}" stroke-width="${f(1.3 / escala)}" stroke-linejoin="round"/>
<circle class="pulso" cx="${f(px)}" cy="${f(py)}" r="9" fill="${t.azul}"/>
<circle cx="${f(px)}" cy="${f(py)}" r="3.8" fill="${t.azul}" stroke="${t.fundo}" stroke-width="1.5"/>`;
}

export function cabecalho(t) {
  const W = 1200, H = 280;
  const linhas = [
    [194, 9, 72, t.azul, 2.6, 7], [224, 7, 90, t.fraco, 2, 11], [250, 5, 110, t.borda, 2, 15],
  ].map(([y, amp, per, cor, largura, seg]) =>
    `<path style="animation:d${per} ${seg}s linear infinite" d="${onda(560, W, y, amp, per)}" fill="none" stroke="${cor}" stroke-width="${largura}" stroke-linecap="round"/>`).join("\n");
  const css = `${ONDAS_CSS}
.gira{transform-box:view-box;animation:gira 48s linear infinite}
@keyframes gira{to{transform:rotate(360deg)}}
.pulso{transform-box:fill-box;transform-origin:center;animation:pulso 2.4s ease-out infinite}
@keyframes pulso{0%{transform:scale(.4);opacity:.55}100%{transform:scale(1.7);opacity:0}}`;
  const corpo = `<defs>
<linearGradient id="esmaece" x1="560" x2="760" y1="0" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>
<mask id="ondas"><rect x="560" y="0" width="${W - 560}" height="${H}" fill="url(#esmaece)"/></mask>
<clipPath id="moldura"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="15"/></clipPath>
</defs>
<text x="42" y="150" class="g" font-size="100" font-weight="800" fill="${t.tinta}" letter-spacing="-4">Konecz</text>
<text x="48" y="202" class="g" font-size="30" font-weight="500" fill="${t.texto}">Desenvolvimento de software <tspan fill="${t.azul}" font-weight="700">IA-first</tspan></text>
<g clip-path="url(#moldura)"><g mask="url(#ondas)">
${linhas}
</g></g>
${selo(712, 134, t)}
<g class="balanca" style="transform-origin:1062px 224px;animation-duration:7.5s;animation-delay:-2s">${barco(1031, 175, 2.6, { casco: t.tinta, vela: t.fundo, linha: t.tinta, traco: 2 })}</g>
<g class="balanca" style="transform-origin:878px 194px">${barco(794, 61, 7, { casco: t.azul, vela: t.papel, linha: t.tinta, traco: 3.2 })}</g>`;
  return svg(W, H, t, corpo, css);
}

// Fatia que arredonda para 0,0% mas existe vira "<0,1%".
const pct = (v) => (v > 0 && v < 0.05 ? "<0,1%" : `${v.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`);
const luz = (cor) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(cor.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Cor do logo que aparece bem no tema: logo escuro demais no fundo escuro clareia um pouco, e claro demais no fundo claro escurece.
const corDoLogo = (cor, t) => {
  if (t.fundo === "#0d1117") return luz(cor) < 0.3 ? misturar(cor, "#ffffff", 0.45) : cor;
  return luz(cor) > 0.85 ? misturar(cor, "#000000", 0.6) : cor;
};

// Arco em volta da bolha, do topo em sentido horário, do tamanho da fatia.
function arco(cx, cy, r, parte) {
  const a = -Math.PI / 2 + Math.min(parte, 0.999) * 2 * Math.PI;
  return `M${f(cx)} ${f(cy - r)}A${f(r)} ${f(r)} 0 ${parte > 0.5 ? 1 : 0} 1 ${f(cx + r * Math.cos(a))} ${f(cy + r * Math.sin(a))}`;
}

// Bolha com o logo oficial e o anel da fatia; JS e TS têm as letras vazadas, então ganham o fundo do logo original.
function bolha(cx, cy, b, t) {
  const cor = b.logo ? corDoLogo(b.logo.cor, t) : t.sec;
  const anel = `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(b.r + 9)}" fill="none" stroke="${t.trilha}" stroke-width="5"/>
<path d="${arco(cx, cy, b.r + 9, b.parte)}" fill="none" stroke="${cor}" stroke-width="5" stroke-linecap="round"/>`;
  if (!b.logo && !b.resto) {
    // Nome inteiro se couber com 15 px ou mais; senão, as duas primeiras letras.
    const cabe = (b.r * 1.6) / (b.nome.length * 0.62);
    const texto = cabe >= 15 ? b.nome : b.nome.slice(0, 2);
    const tam = Math.min(30, cabe >= 15 ? cabe : (b.r * 1.6) / (texto.length * 0.62));
    return `${anel}<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(b.r)}" fill="${t.trilha}"/>
<text x="${f(cx)}" y="${f(cy + tam * 0.36)}" text-anchor="middle" class="g" font-size="${f(tam)}" font-weight="800" fill="${t.sec}">${texto}</text>`;
  }
  if (!b.logo) {
    return `${anel}<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(b.r)}" fill="${t.trilha}"/>
<text x="${f(cx)}" y="${f(cy + 7)}" text-anchor="middle" class="g" font-size="20" font-weight="700" fill="${t.sec}">+${b.resto}</text>`;
  }
  const lado = b.r * 1.04, x = cx - lado / 2, y = cy - lado / 2;
  const vazado = { javascript: "#000000", typescript: "#ffffff" }[b.logo.slug];
  const fundo = vazado ? `<rect x="${f(x + lado * 0.04)}" y="${f(y + lado * 0.04)}" width="${f(lado * 0.92)}" height="${f(lado * 0.92)}" fill="${vazado}"/>` : "";
  return `${anel}<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(b.r)}" fill="${misturar(cor, t.fundo, 0.86)}"/>
${fundo}<path transform="translate(${f(x)} ${f(y)}) scale(${Math.round((lado / 24) * 1000) / 1000})" d="${b.logo.d}" fill="${cor}"/>`;
}

// Etiqueta na cor da linguagem, com a fatia em número.
function etiqueta(cx, y, texto, cor, t) {
  const w = texto.length * 9.6 + 22;
  const letra = luz(cor) > 0.5 ? "#0b1220" : "#ffffff";
  return `<rect x="${f(cx - w / 2)}" y="${y - 15}" width="${f(w)}" height="30" rx="15" fill="${cor}"/>
<text x="${f(cx)}" y="${y + 5.5}" text-anchor="middle" class="m" font-size="16" fill="${cor === t.sec ? t.fundo : letra}">${esc(texto)}</text>`;
}

// Linguagens agrupadas pelo logo (Go e Go Template viram uma), da maior para a menor, com a fatia de cada.
function gruposDeLinguagens(d) {
  const grupos = new Map();
  for (const [nome, bytes] of d.linguagens) {
    const logo = logoDa(nome), chave = logo?.slug ?? nome;
    const g = grupos.get(chave) ?? { nome, logo, bytes: 0 };
    g.bytes += bytes;
    grupos.set(chave, g);
  }
  const lista = [...grupos.values()].sort((a, b) => b.bytes - a.bytes);
  const total = lista.reduce((s, g) => s + g.bytes, 0) || 1;
  return lista.map((g) => ({ ...g, parte: g.bytes / total }));
}
const VISIVEIS = 6;

export function linguagens(t, d) {
  const W = 1200, H = 344, MAIOR = 92, MENOR = 30, VAO = 34, CHAO = 262; // as bolhas encostam no mesmo chão
  const lista = gruposDeLinguagens(d);
  // As 6 maiores aparecem sempre; a que não tem logo em LOGOS ganha o nome escrito na bolha.
  const bolhas = lista.slice(0, VISIVEIS);
  const resto = lista.slice(VISIVEIS);
  if (resto.length) bolhas.push({ resto: resto.length, parte: resto.reduce((s, g) => s + g.parte, 0) });
  for (const b of bolhas) b.r = Math.max(MENOR, MAIOR * Math.sqrt(b.parte / bolhas[0].parte));

  const largura = bolhas.reduce((s, b) => s + 2 * (b.r + 12), 0) + VAO * (bolhas.length - 1);
  let x = (W - largura) / 2;
  const desenho = bolhas.map((b, i) => {
    const cx = x + b.r + 12, cy = CHAO - b.r - 12;
    x += 2 * (b.r + 12) + VAO;
    const cor = b.logo ? corDoLogo(b.logo.cor, t) : t.sec;
    return `<g class="flutua" style="animation-duration:${(5.5 + (i % 3) * 0.9).toFixed(1)}s;animation-delay:-${(i * 1.3).toFixed(1)}s">
${bolha(cx, cy, b, t)}
</g>
${etiqueta(cx, CHAO + 32, pct(b.parte * 100), cor, t)}${b.resto ? seta(cx, CHAO + 62, t) : ""}`;
  }).join("\n");
  const css = `.flutua{animation:flutua 6s ease-in-out infinite}
@keyframes flutua{0%,100%{transform:translateY(4px)}50%{transform:translateY(-4px)}}`;
  const corpo = `${icone("repo", 48, 44, 24, t.sec)}<text x="82" y="64" class="m" font-size="20" fill="${t.tinta}">${num(d.repositorios)}</text>
${desenho}`;
  return svg(W, H, t, corpo, css);
}

// Setinha embaixo do +N: o cartão é o <summary> de um <details> no README, e clicar abre as outras linguagens.
const seta = (cx, y, t) => `<path d="M${f(cx - 9)} ${y - 4}l9 8l9-8" fill="none" stroke="${t.sec}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;

// As linguagens que ficaram no +N, todas do mesmo tamanho, que aparecem ao abrir o cartão de linguagens.
// Até 7 por linha; a última linha fica centralizada.
export function linguagensMais(t, d) {
  const resto = gruposDeLinguagens(d).slice(VISIVEIS);
  const W = 1200, R = 40, VAO = 44, POR_LINHA = 7, LINHA = 178, passo = 2 * (R + 12) + VAO;
  const linhas = Math.ceil(resto.length / POR_LINHA), H = linhas ? 214 + (linhas - 1) * LINHA : 1;
  const desenho = resto.map((g, i) => {
    const linha = Math.floor(i / POR_LINHA), naLinha = Math.min(POR_LINHA, resto.length - linha * POR_LINHA);
    const CHAO = 136 + linha * LINHA;
    const cx = (W - passo * naLinha + VAO) / 2 + (i % POR_LINHA) * passo + R + 12, cy = CHAO - R - 12;
    return `${bolha(cx, cy, { ...g, r: R }, t)}
${etiqueta(cx, CHAO + 32, pct(g.parte * 100), g.logo ? corDoLogo(g.logo.cor, t) : t.sec, t)}`;
  }).join("\n");
  return svg(W, H, t, desenho);
}

function setor(cx, cy, r0, r1, a0, a1) {
  const ponto = (r, a) => `${f(cx + r * Math.cos(a))} ${f(cy + r * Math.sin(a))}`;
  return `M${ponto(r1, a0)}A${f(r1)} ${f(r1)} 0 0 1 ${ponto(r1, a1)}L${ponto(r0, a1)}A${r0} ${r0} 0 0 0 ${ponto(r0, a0)}Z`;
}

// Número com ícone na frente, no lugar de um rótulo escrito.
const marcador = (nome, x, y, valor, t, tam = 34) => `${icone(nome, x, y - tam * 0.78, tam * 0.78, t.azul)}
<text x="${f(x + tam * 1.05)}" y="${y}" class="g" font-size="${tam}" font-weight="800" fill="${t.tinta}" letter-spacing="-1">${valor}</text>`;

// Relógio de 24 h: cada fatia é uma hora do dia (fuso de Curitiba), o tamanho é quantos commits caíram nela.
function relogio(t, d) {
  const cx = 312, cy = 196, r0 = 42, r1 = 118;
  const horas = d.commits.porHora, maior = Math.max(...horas, 1), pico = horas.indexOf(maior);
  const passo = (2 * Math.PI) / 24, folga = 0.035;
  const fatias = horas.map((n, h) => {
    const a = h * passo - Math.PI / 2;
    const r = r0 + 4 + (r1 - r0 - 4) * Math.sqrt(n / maior);
    const cor = h === pico ? t.azul : misturar(t.azulClaro, t.fundo, 0.55 - 0.45 * (n / maior));
    return `<path d="${setor(cx, cy, r0 + 4, r, a + folga, a + passo - folga)}" fill="${cor}"/>`;
  }).join("");
  const marcas = [[0, "0h"], [6, "6h"], [12, "12h"], [18, "18h"]].map(([h, txt]) => {
    const a = h * passo - Math.PI / 2, r = r1 + 24;
    return `<text x="${f(cx + r * Math.cos(a))}" y="${f(cy + r * Math.sin(a) + 5.5)}" text-anchor="middle" class="m" font-size="15" fill="${t.sec}">${txt}</text>`;
  }).join("");
  return `${marcador("git-commit", 48, 84, num(d.commits.total), t)}
<circle cx="${cx}" cy="${cy}" r="${r1}" fill="none" stroke="${t.trilha}" stroke-width="1.5" stroke-dasharray="2 5"/>
<circle cx="${cx}" cy="${cy}" r="${r0}" fill="none" stroke="${t.trilha}" stroke-width="1.5"/>
${fatias}
${marcas}
${icone("clock", cx - 9, cy - 30, 18, t.sec)}
<text x="${cx}" y="${cy + 18}" text-anchor="middle" class="g" font-size="26" font-weight="800" fill="${t.tinta}">${pico}h</text>`;
}

// PRs integrados por dia; a barra de hoje em azul cheio, com o número em cima.
function entregas(t, d) {
  const dias = d.prs.porDia, x0 = 648, x1 = 1152, topo = 132, base = 318;
  const maior = Math.max(...dias.map((c) => c.n), 1);
  const passo = (x1 - x0) / dias.length, larg = passo - 4;
  const barras = dias.map((c, i) => {
    const h = c.n > 0 ? Math.max(3, (c.n / maior) * (base - topo)) : 0;
    const hoje = i === dias.length - 1;
    const bx = x0 + i * passo + 2;
    if (!h) return `<rect x="${f(bx)}" y="${base - 2}" width="${f(larg)}" height="2" rx="1" fill="${t.trilha}"/>`;
    return `<rect x="${f(bx)}" y="${f(base - h)}" width="${f(larg)}" height="${f(h)}" rx="2.5" fill="${hoje ? t.azul : misturar(t.azulClaro, t.fundo, 0.25)}"/>`
      + (hoje ? `<text x="${f(bx + larg / 2)}" y="${f(base - h - 10)}" text-anchor="middle" class="m" font-size="16" fill="${t.azul}">${num(c.n)}</text>` : "");
  }).join("");
  const marcas = dias.map((c, i) => new Date(`${c.dia}T12:00:00Z`).getUTCDay() !== 1 ? "" :
    `<text x="${f(x0 + i * passo + passo / 2)}" y="${base + 28}" text-anchor="middle" class="m" font-size="15" fill="${t.sec}">${c.dia.slice(8, 10)}/${c.dia.slice(5, 7)}</text>`).join("");
  return `${marcador("git-merge", x0, 84, num(d.prs.integrados), t)}
${icone("git-pull-request", 900, 64, 22, t.sec)}<text x="930" y="84" class="m" font-size="20" fill="${t.texto}">${num(d.prs.abertos)}</text>
<line x1="${x0}" y1="${topo}" x2="${x1}" y2="${topo}" stroke="${t.trilha}" stroke-width="1.5" stroke-dasharray="2 5"/>
<text x="${x1}" y="${topo - 10}" text-anchor="end" class="m" font-size="15" fill="${t.sec}">${num(maior)}</text>
${barras}
${marcas}`;
}

export function ritmo(t, d) {
  const W = 1200, H = 380;
  return svg(W, H, t, `${relogio(t, d)}
<line x1="600" y1="48" x2="600" y2="${H - 48}" stroke="${t.borda}" stroke-width="1.5"/>
${entregas(t, d)}`);
}

const curto = (n) => (n >= 1000 ? `${(n / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil` : num(n));

// Quadradinhos de diff do GitHub: verde para linhas novas, vermelho para as removidas.
function diff(x, y, { mais, menos }, t) {
  const total = mais + menos || 1, verdes = Math.round((mais / total) * 5), vermelhos = Math.min(5 - verdes, Math.ceil((menos / total) * 5));
  const quadrados = [0, 1, 2, 3, 4].map((i) => {
    const cor = i < verdes ? t.verde : i < verdes + vermelhos ? t.vermelho : t.trilha;
    return `<rect x="${x + i * 13}" y="${y - 12}" width="11" height="11" rx="2" fill="${cor}"/>`;
  }).join("");
  return `${quadrados}<text x="${x + 74}" y="${y - 1}" class="m" font-size="16" fill="${t.verde}">+${num(mais)}</text>
<text x="${x + 82 + (num(mais).length + 1) * 9.6}" y="${y - 1}" class="m" font-size="16" fill="${t.vermelho}">−${num(menos)}</text>`;
}

// Contribuições em projetos de fora, uma linha por repositório: relato → PR → revisão → integração.
// O barquinho navega no trecho onde a contribuição está agora.
export function openSource(t, d) {
  const repos = new Map();
  for (const it of d.openSource) {
    const r = repos.get(it.repo) ?? { ...it, prs: [], issues: [] };
    (it.tipo === "pr" ? r.prs : r.issues).push(it);
    repos.set(it.repo, r);
  }
  const linhas = [...repos.values()].slice(0, 3);
  const W = 1200, alto = 136, topo = 92, H = topo + Math.max(1, linhas.length) * alto + 8;
  const nPrs = d.openSource.filter((i) => i.tipo === "pr").length, nIssues = d.openSource.length - nPrs;
  const corpo = linhas.map((r, i) => {
    const y0 = topo + i * alto, cy = y0 + 46;
    const [dono, nome] = r.repo.split("/");
    const issue = r.issues[0], pr = r.prs[0];
    const nos = [];
    if (issue) nos.push({ icone: issue.estado === "aberto" ? "issue-opened" : "issue-closed", rotulo: `#${issue.numero}`, feito: true });
    if (pr) {
      nos.push({ icone: "git-pull-request", rotulo: `#${pr.numero}`, feito: true });
      nos.push({ icone: "eye", feito: pr.revisado || !!pr.integrado });
      nos.push({ icone: "git-merge", feito: !!pr.integrado });
    } else if (issue) nos.push({ icone: "check", feito: issue.estado !== "aberto" });
    const atual = nos.findIndex((n) => !n.feito);
    const xs = nos.map((_, j) => 1128 - (nos.length - 1 - j) * 116);
    const trilha = nos.slice(1).map((n, j) => n.feito
      ? `<line x1="${xs[j]}" y1="${cy}" x2="${xs[j + 1]}" y2="${cy}" stroke="${t.azul}" stroke-width="3"/>`
      : `<line x1="${xs[j]}" y1="${cy}" x2="${xs[j + 1]}" y2="${cy}" stroke="${t.fraco}" stroke-width="2" stroke-dasharray="5 6"/>`).join("");
    const circulos = nos.map((n, j) => {
      const fundo = n.feito ? t.azul : t.fundo, cor = n.feito ? "#ffffff" : j === atual ? t.azul : t.fraco;
      const anel = n.feito ? "" : ` stroke="${j === atual ? t.azul : t.fraco}" stroke-width="2"${j === atual ? "" : ` stroke-dasharray="4 4"`}`;
      return `<g${j === atual ? ` class="vivo"` : ""}><circle cx="${xs[j]}" cy="${cy}" r="22" fill="${fundo}"${anel}/>${icone(n.icone, xs[j] - 11, cy - 11, 22, cor)}</g>`
        + (n.rotulo ? `<text x="${xs[j]}" y="${cy + 48}" text-anchor="middle" class="m" font-size="15" fill="${t.sec}">${n.rotulo}</text>` : "");
    }).join("\n");
    const bx = atual > 0 ? (xs[atual - 1] + xs[atual]) / 2 : null;
    const navegando = bx === null ? "" : `<g class="balanca" style="transform-origin:${f(bx)}px ${cy}px">${barco(bx - 12 * 1.9, cy + 2 - 19 * 1.9, 1.9, { casco: t.azul, vela: t.papel, linha: t.tinta, traco: 1.8 })}</g>`;
    const avatar = r.avatar ? `<clipPath id="av${i}"><circle cx="82" cy="${cy}" r="34"/></clipPath>
<image href="${r.avatar}" x="48" y="${cy - 34}" width="68" height="68" clip-path="url(#av${i})"/>
<circle cx="82" cy="${cy}" r="34" fill="none" stroke="${t.borda}" stroke-width="1.5"/>` : `${icone("repo", 66, cy - 16, 32, t.sec)}`;
    const xf = 158 + curto(r.estrelas).length * 9.6 + 30;
    const numeros = `${icone("star", 134, cy + 26, 18, t.sec)}<text x="158" y="${cy + 41}" class="m" font-size="16" fill="${t.texto}">${curto(r.estrelas)}</text>
${icone("repo-forked", xf, cy + 26, 18, t.sec)}<text x="${xf + 24}" y="${cy + 41}" class="m" font-size="16" fill="${t.texto}">${curto(r.forks)}</text>
${pr?.linhas ? diff(xf + 24 + curto(r.forks).length * 9.6 + 30, cy + 42, pr.linhas, t) : ""}`;
    const separa = i > 0 ? `<line x1="48" y1="${y0 - 10}" x2="1152" y2="${y0 - 10}" stroke="${t.borda}" stroke-width="1"/>` : "";
    return `${separa}
${avatar}
<text x="134" y="${cy - 14}" class="m" font-size="15" fill="${t.sec}">${esc(dono)}</text>
<text x="134" y="${cy + 12}" class="g" font-size="25" font-weight="700" fill="${t.tinta}">${esc(nome)}</text>
${numeros}
${trilha}
${circulos}
${navegando}`;
  }).join("\n");
  const cabeca = `${icone("git-pull-request", 48, 44, 24, t.sec)}<text x="82" y="64" class="m" font-size="20" fill="${t.tinta}">${nPrs}</text>
${icone("issue-opened", 124, 44, 24, t.sec)}<text x="158" y="64" class="m" font-size="20" fill="${t.tinta}">${nIssues}</text>`;
  return svg(W, H, t, `${cabeca}\n${corpo}`, ONDAS_CSS);
}

// Quem toca a Konecz: cada um no seu barco, com as iniciais pintadas no casco.
export function tripulacao(t) {
  const W = 1200, H = 244, NIVEL = 194, S = 5;
  const barcos = EQUIPE.map(([nome, iniciais], i) => {
    const x = 60 + i * 560, centro = x + 12 * S;
    const casco = i === 0 ? t.azul : t.tinta, letra = i === 0 ? "#ffffff" : t.fundo;
    return `<g class="balanca" style="transform-origin:${centro}px ${NIVEL}px;animation-duration:${6 + i * 1.3}s;animation-delay:-${i * 2}s">
${barco(x, NIVEL - 19 * S, S, { casco, vela: t.papel, linha: t.tinta, traco: 2.4 })}
<text x="${centro}" y="${NIVEL - 5}" text-anchor="middle" class="g" font-size="17" font-weight="800" fill="${letra}" letter-spacing="1">${iniciais}</text>
</g>
<text x="${x + 136}" y="${NIVEL - 30}" class="g" font-size="32" font-weight="800" fill="${t.tinta}" letter-spacing="-.5">${esc(nome)}</text>`;
  }).join("\n");
  const agua = `<clipPath id="moldura"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="15"/></clipPath>
<g clip-path="url(#moldura)">
<path style="animation:d72 8s linear infinite" d="${onda(0, W, NIVEL + 2, 7, 72)}" fill="none" stroke="${t.azul}" stroke-width="2.4" stroke-linecap="round"/>
<path style="animation:d110 14s linear infinite" d="${onda(0, W, NIVEL + 28, 5, 110)}" fill="none" stroke="${t.borda}" stroke-width="2" stroke-linecap="round"/>
</g>`;
  const cabeca = `${icone("people", 48, 44, 24, t.sec)}<text x="82" y="64" class="m" font-size="20" fill="${t.tinta}">${EQUIPE.length}</text>`;
  return svg(W, H, t, `${cabeca}\n${agua}\n${barcos}`, ONDAS_CSS);
}
