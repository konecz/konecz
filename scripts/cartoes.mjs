// Cabeçalho, painel (linguagens, horário dos commits, entregas) e open source.
import { svg, esc, num, f, misturar, rotulo, aoVivo, barco, diaMes } from "./desenho.mjs";

// Linha de onda que se repete a cada `per`, larga o bastante para deslizar um período sem emenda.
function onda(x0, x1, y, amp, per) {
  let d = `M${x0 - per} ${y}`;
  for (let x = x0 - per; x < x1 + per; x += per) d += `q${per / 4} ${-amp} ${per / 2} 0t${per / 2} 0`;
  return d;
}

export function cabecalho(t, d) {
  const W = 1200, H = 300;
  const linhas = [
    [214, 9, 72, t.azul, 2.6, 7], [244, 7, 90, t.fraco, 2, 11], [270, 5, 110, t.borda, 2, 15],
  ].map(([y, amp, per, cor, largura, seg]) =>
    `<path style="animation:d${per} ${seg}s linear infinite" d="${onda(560, W, y, amp, per)}" fill="none" stroke="${cor}" stroke-width="${largura}" stroke-linecap="round"/>`).join("\n");
  const css = `@keyframes d72{to{transform:translateX(-72px)}}
@keyframes d90{to{transform:translateX(-90px)}}
@keyframes d110{to{transform:translateX(-110px)}}
.balanca{transform-box:view-box;animation:balanca 6s ease-in-out infinite}
@keyframes balanca{0%,100%{transform:translateY(2px) rotate(-2.5deg)}50%{transform:translateY(-3px) rotate(2.5deg)}}`;
  const corpo = `<defs>
<linearGradient id="esmaece" x1="560" x2="760" y1="0" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>
<mask id="ondas"><rect x="560" y="0" width="${W - 560}" height="${H}" fill="url(#esmaece)"/></mask>
<clipPath id="moldura"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="15"/></clipPath>
</defs>
${rotulo(48, 64, "konecz.com")}
${aoVivo(1152, 64, d.geradoEm, t, "end")}
<text x="42" y="164" class="g" font-size="96" font-weight="800" fill="${t.tinta}" letter-spacing="-4">Konecz</text>
<text x="48" y="210" class="g" font-size="30" font-weight="500" fill="${t.texto}">Desenvolvimento de software <tspan fill="${t.azul}" font-weight="700">IA-first</tspan></text>
${rotulo(48, 252, "curitiba/pr · 25°25′s 49°16′o · desde 2025")}
<g clip-path="url(#moldura)"><g mask="url(#ondas)">
${linhas}
</g></g>
<g class="balanca" style="transform-origin:1062px 244px;animation-duration:7.5s;animation-delay:-2s">${barco(1031, 197, 2.6, { casco: t.tinta, vela: t.fundo, linha: t.tinta, traco: 2 })}</g>
<g class="balanca" style="transform-origin:878px 214px">${barco(794, 81, 7, { casco: t.azul, vela: t.papel, linha: t.tinta, traco: 3.2 })}</g>`;
  return svg(W, H, t, corpo, css);
}

function setor(cx, cy, r0, r1, a0, a1) {
  const ponto = (r, a) => `${f(cx + r * Math.cos(a))} ${f(cy + r * Math.sin(a))}`;
  return `M${ponto(r1, a0)}A${f(r1)} ${f(r1)} 0 0 1 ${ponto(r1, a1)}L${ponto(r0, a1)}A${r0} ${r0} 0 0 0 ${ponto(r0, a0)}Z`;
}

const pct = (v) => v.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function cabecaPainel(x, titulo, numero, legenda, t) {
  return `${rotulo(x, 64, titulo)}
<text x="${x - 2}" y="124" class="g" font-size="52" font-weight="800" fill="${t.tinta}" letter-spacing="-1.6">${numero}</text>
<text x="${x}" y="154" class="m" font-size="16" fill="${t.sec}">${esc(legenda)}</text>`;
}

function linguagens(x, t, d) {
  const total = d.linguagens.reduce((s, [, v]) => s + v, 0) || 1;
  const top = d.linguagens.slice(0, 5);
  const resto = d.linguagens.slice(5).reduce((s, [, v]) => s + v, 0);
  const linhas = resto > 0 ? [...top, ["outras", resto]] : top;
  const barras = linhas.map(([nome, v], i) => {
    const y = 208 + i * 38, w = Math.max(4, (v / linhas[0][1]) * 140);
    const cor = nome === "outras" ? t.fraco : misturar(t.azul, t.fundo, i * 0.13);
    return `<text x="${x}" y="${y + 6}" class="m" font-size="16" fill="${t.tinta}">${esc(nome)}</text>
<rect x="${x + 120}" y="${y - 5}" width="140" height="11" rx="5.5" fill="${t.trilha}"/>
<rect x="${x + 120}" y="${y - 5}" width="${f(w)}" height="11" rx="5.5" fill="${cor}"/>
<text x="${x + 336}" y="${y + 6}" text-anchor="end" class="m" font-size="16" fill="${t.texto}">${pct((v / total) * 100)}%</text>`;
  }).join("\n");
  return `${cabecaPainel(x, "linguagens", num(d.repositorios), "repositórios", t)}\n${barras}`;
}

function horario(x, t, d) {
  const cx = x + 168, cy = 312, r0 = 34, r1 = 98;
  const horas = d.commits.porHora, maior = Math.max(...horas, 1);
  const pico = horas.indexOf(maior);
  const passo = (2 * Math.PI) / 24, folga = 0.035;
  const fatias = horas.map((n, h) => {
    const a = h * passo - Math.PI / 2;
    const r = r0 + 3 + (r1 - r0 - 3) * Math.sqrt(n / maior);
    const cor = h === pico ? t.azul : misturar(t.azulClaro, t.fundo, 0.55 - 0.45 * (n / maior));
    return `<path d="${setor(cx, cy, r0 + 3, r, a + folga, a + passo - folga)}" fill="${cor}"/>`;
  }).join("");
  const marcas = [[0, "0h"], [6, "6h"], [12, "12h"], [18, "18h"]].map(([h, txt]) => {
    const a = h * passo - Math.PI / 2, r = r1 + 22;
    return `<text x="${f(cx + r * Math.cos(a))}" y="${f(cy + r * Math.sin(a) + 5.5)}" text-anchor="middle" class="m" font-size="15" fill="${t.sec}">${txt}</text>`;
  }).join("");
  return `${cabecaPainel(x, "horário dos commits", num(d.commits.total), "commits na main · 12 meses", t)}
<circle cx="${cx}" cy="${cy}" r="${r1}" fill="none" stroke="${t.trilha}" stroke-width="1.5" stroke-dasharray="2 5"/>
<circle cx="${cx}" cy="${cy}" r="${r0}" fill="none" stroke="${t.trilha}" stroke-width="1.5"/>
${fatias}
${marcas}
<text x="${cx}" y="${cy + 5}" text-anchor="middle" class="g" font-size="25" font-weight="800" fill="${t.tinta}">${pico}h</text>
<text x="${cx}" y="${cy + 22}" text-anchor="middle" class="m" font-size="13" fill="${t.sec}">pico</text>`;
}

function entregas(x, t, d) {
  const dias = d.prs.porDia, x0 = x, x1 = x + 336, topo = 212, base = 392;
  const maior = Math.max(...dias.map((c) => c.n), 1);
  const passo = (x1 - x0) / dias.length, larg = passo - 3;
  const barras = dias.map((c, i) => {
    const h = c.n > 0 ? Math.max(3, (c.n / maior) * (base - topo)) : 0;
    const hoje = i === dias.length - 1;
    const cor = hoje ? t.azul : misturar(t.azulClaro, t.fundo, 0.25);
    return h ? `<rect x="${f(x0 + i * passo + 1.5)}" y="${f(base - h)}" width="${f(larg)}" height="${f(h)}" rx="2" fill="${cor}"/>`
      : `<rect x="${f(x0 + i * passo + 1.5)}" y="${base - 2}" width="${f(larg)}" height="2" rx="1" fill="${t.trilha}"/>`;
  }).join("");
  // Uma marca por semana embaixo, com o dia e o mês de cada segunda-feira.
  const marcas = dias.map((c, i) => new Date(`${c.dia}T12:00:00Z`).getUTCDay() !== 1 ? "" :
    `<text x="${f(x0 + i * passo + passo / 2)}" y="${base + 26}" text-anchor="middle" class="m" font-size="15" fill="${t.sec}">${c.dia.slice(8, 10)}/${c.dia.slice(5, 7)}</text>`).join("");
  const hoje = dias.at(-1).n;
  return `${cabecaPainel(x, "entregas", num(d.prs.integrados), `PRs integrados · ${num(d.prs.abertos)} em aberto`, t)}
<line x1="${x0}" y1="${topo}" x2="${x1}" y2="${topo}" stroke="${t.trilha}" stroke-width="1.5" stroke-dasharray="2 5"/>
<text x="${x0}" y="${topo - 12}" class="m" font-size="15" fill="${t.sec}">${num(maior)} no melhor dia</text>
<text x="${x1}" y="${topo - 12}" text-anchor="end" class="m" font-size="15" fill="${t.azul}">${num(hoje)} hoje</text>
${barras}
${marcas}`;
}

export function painel(t, d) {
  const W = 1200, H = 476;
  const divisa = (x) => `<line x1="${x}" y1="48" x2="${x}" y2="${H - 48}" stroke="${t.borda}" stroke-width="1.5"/>`;
  const corpo = `${linguagens(48, t, d)}
${divisa(408)}
${horario(432, t, d)}
${divisa(792)}
${entregas(816, t, d)}`;
  return svg(W, H, t, corpo);
}

// Contribuições em projetos de fora: cada PR com a trilha aberto → revisão → integrado, ao vivo.
export function openSource(t, d) {
  const itens = [...d.openSource.filter((i) => i.tipo === "pr"), ...d.openSource.filter((i) => i.tipo === "issue")].slice(0, 3);
  const W = 1200, linha = 112, H = 112 + Math.max(1, itens.length) * linha;
  // Corta o título numa palavra inteira para caber antes da trilha.
  const curto = (s, n) => {
    if (s.length <= n) return s;
    const corte = s.slice(0, n - 1), espaco = corte.lastIndexOf(" ");
    return `${(espaco > n * 0.6 ? corte.slice(0, espaco) : corte).replace(/[\s:,;.-]+$/, "")}…`;
  };
  const linhas = itens.map((it, i) => {
    const y = 96 + i * linha;
    const pr = it.tipo === "pr";
    const detalhe = pr
      ? `PR #${it.numero} · aberto em ${diaMes(it.criado)}${it.integrado ? ` · integrado em ${diaMes(it.integrado)}` : ""}`
      : `issue #${it.numero} · ${it.estado === "aberto" ? "aberta" : "fechada"} · ${diaMes(it.criado)}`;
    const fechado = it.estado === "fechado" && !it.integrado;
    const passos = pr
      ? [["aberto", true], ["revisão", it.revisado || !!it.integrado], [fechado ? "fechado" : "integrado", !!it.integrado]]
      : [["relatada", true], ["resolvida", it.estado !== "aberto"]];
    const xs = passos.map((_, j) => 1112 - (passos.length - 1 - j) * 112);
    const texto = `<text x="48" y="${y + 20}" class="m" font-size="16" fill="${t.sec}">${esc(it.repo)}</text>
<text x="48" y="${y + 54}" class="g" font-size="24" font-weight="700" fill="${t.tinta}">${esc(curto(it.titulo, Math.floor((xs[0] - 90) / 13)))}</text>
<text x="48" y="${y + 82}" class="m" font-size="16" fill="${t.sec}">${esc(detalhe)}</text>`;
    const cy = y + 38;
    const trilha = passos.slice(1).map(([, feito], j) => feito
      ? `<line x1="${xs[j]}" y1="${cy}" x2="${xs[j + 1]}" y2="${cy}" stroke="${t.azul}" stroke-width="3"/>`
      : `<line x1="${xs[j]}" y1="${cy}" x2="${xs[j + 1]}" y2="${cy}" stroke="${t.fraco}" stroke-width="2" stroke-dasharray="5 6"/>`).join("");
    // O próximo passo ainda não feito pulsa: é onde a contribuição está agora.
    const atual = passos.findIndex(([, feito]) => !feito);
    const nos = passos.map(([nome, feito], j) => `${feito
      ? `<circle cx="${xs[j]}" cy="${cy}" r="9" fill="${t.azul}"/>`
      : `<circle${j === atual ? ` class="vivo"` : ""} cx="${xs[j]}" cy="${cy}" r="8" fill="${t.fundo}" stroke="${j === atual ? t.azul : t.fraco}" stroke-width="2"/>`}
<text x="${xs[j]}" y="${cy + 36}" text-anchor="middle" class="m" font-size="15" fill="${feito ? t.tinta : t.sec}">${nome}</text>`).join("\n");
    const separa = i > 0 ? `<line x1="48" y1="${y - 8}" x2="1152" y2="${y - 8}" stroke="${t.borda}" stroke-width="1"/>` : "";
    return `${separa}\n${texto}\n${trilha}\n${nos}`;
  }).join("\n");
  const vazio = itens.length ? "" : `<text x="48" y="140" class="g" font-size="20" fill="${t.sec}">Nenhuma contribuição externa no momento.</text>`;
  const corpo = `${rotulo(48, 64, "open source")}
${linhas}${vazio}`;
  return svg(W, H, t, corpo);
}
