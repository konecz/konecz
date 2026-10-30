// Cabeçalho, linguagens, ritmo (horário dos commits e entregas) e tripulação, nas cores do GitHub com o azul do
// konecz.com e o traço dele: a fita e o barco de papel em linhas finas, em 3D e em movimento.
// Pouco texto de propósito: número, ícone e gráfico dizem o que cada coisa é.
import { svg, esc, num, f, misturar, icone, logoDa } from "./desenho.mjs";
import { fita, barco } from "./origami.mjs";

const EQUIPE = [["Pedro Lahrs", "PL"], ["Vanessa Cristine", "VC"]];

// Entrada dos gráficos quando a imagem carrega: anel enchendo, barra subindo, fatia abrindo do centro.
const ENTRADA = `.enche{animation:enche 1.8s cubic-bezier(.3,0,.2,1) both}
@keyframes enche{from{stroke-dashoffset:var(--c)}}
.sobe{transform-box:fill-box;transform-origin:50% 100%;animation:sobe 1.2s cubic-bezier(.3,0,.2,1) both}
@keyframes sobe{from{transform:scaleY(0)}}
.abre{transform-box:view-box;animation:abre 1.2s cubic-bezier(.3,0,.2,1) both}
@keyframes abre{from{transform:scale(0)}}
.flutua{animation:flutua 6s ease-in-out infinite}
@keyframes flutua{0%,100%{transform:translateY(3px)}50%{transform:translateY(-3px)}}`;

// A abertura do site: «Konecz AI Factory» e a fita da logo girando em 3D, em linhas azuis finas.
export function cabecalho(t) {
  const W = 1200, H = 300;
  const corpo = `<text x="44" y="150" class="g" font-size="104" font-weight="800" fill="${t.tinta}" letter-spacing="-5">Konecz</text>
<text x="48" y="222" class="g" font-size="56" font-weight="700" fill="${t.azul}" letter-spacing="-2">AI Factory</text>
${fita(1000, H / 2, 250, t.azul)}`;
  return svg(W, H, t, corpo);
}

// Fatia que arredonda para 0,0% mas existe vira "<0,1%".
const pct = (v) => (v > 0 && v < 0.05 ? "<0,1%" : `${v.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`);

// Bolha com o logo em azul, a fatia em número dentro e o anel que enche até ela; sem logo, o nome escrito.
// JS e TS têm as letras vazadas: o fundo da bolha aparece nelas.
function bolha(cx, cy, r, g, t, atraso) {
  const c = 2 * Math.PI * (r + 9), cheio = Math.max(0.001, Math.min(g.parte, 0.999)) * c;
  const anel = `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r + 9)}" fill="none" stroke="${t.trilha}" stroke-width="5"/>
<circle class="enche" style="--c:${f(c)};animation-delay:${atraso}s" transform="rotate(-90 ${f(cx)} ${f(cy)})" cx="${f(cx)}" cy="${f(cy)}" r="${f(r + 9)}" fill="none" stroke="${t.azul}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${f(c)} ${f(c)}" stroke-dashoffset="${f(c - cheio)}"/>
<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${t.cartao}"/>`;
  // Dentro da bolha: o logo (ou o nome) em cima e a fatia embaixo; por fora, só o anel.
  const fatia = `<text x="${f(cx)}" y="${f(cy + r * 0.62)}" text-anchor="middle" class="m" font-size="15" fill="${t.tinta}">${esc(pct(g.parte * 100))}</text>`;
  if (!g.logo) {
    // Nome inteiro se couber com 15 px ou mais; senão, as duas primeiras letras.
    const cabe = (r * 1.5) / (g.nome.length * 0.62);
    const texto = cabe >= 15 ? g.nome : g.nome.slice(0, 2);
    const tam = Math.min(22, cabe >= 15 ? cabe : (r * 1.5) / (texto.length * 0.62));
    return `${anel}
<text x="${f(cx)}" y="${f(cy - r * 0.12 + tam * 0.36)}" text-anchor="middle" class="g" font-size="${f(tam)}" font-weight="800" fill="${t.azul}">${esc(texto)}</text>
${fatia}`;
  }
  const lado = r * 0.82, x = cx - lado / 2, y = cy - r * 0.18 - lado / 2;
  return `${anel}
<path transform="translate(${f(x)} ${f(y)}) scale(${Math.round((lado / 24) * 1000) / 1000})" d="${g.logo.d}" fill="${t.azul}"/>
${fatia}`;
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

// Todas as linguagens, do mesmo tamanho: só o anel cheio até a fatia diz quanto cada uma tem.
// Até 8 por linha, da maior para a menor; a última linha fica centralizada.
export function linguagens(t, d) {
  const lista = gruposDeLinguagens(d);
  const W = 1200, R = 46, POR_LINHA = 8, passo = 138, LINHA = 142, TOPO = 104;
  const linhas = Math.max(1, Math.ceil(lista.length / POR_LINHA)), H = TOPO + linhas * LINHA - 10;
  const desenho = lista.map((g, i) => {
    const linha = Math.floor(i / POR_LINHA), naLinha = Math.min(POR_LINHA, lista.length - linha * POR_LINHA);
    const cx = (W - passo * naLinha) / 2 + (i % POR_LINHA) * passo + passo / 2, cy = TOPO + linha * LINHA + R + 9;
    return `<g class="flutua" style="animation-duration:${(5.5 + (i % 3) * 0.9).toFixed(1)}s;animation-delay:-${(i * 1.3).toFixed(1)}s">
${bolha(cx, cy, R, g, t, f(0.15 + i * 0.06))}
</g>`;
  }).join("\n");
  const corpo = `${icone("repo", 48, 44, 24, t.sec)}<text x="82" y="64" class="m" font-size="20" fill="${t.tinta}">${num(d.repositorios)}</text>
${icone("code", 140, 44, 24, t.sec)}<text x="174" y="64" class="m" font-size="20" fill="${t.tinta}">${num(lista.length)}</text>
${desenho}`;
  return svg(W, H, t, corpo, ENTRADA);
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
    return `<path class="abre" style="transform-origin:${cx}px ${cy}px;animation-delay:${f(0.2 + h * 0.04)}s" d="${setor(cx, cy, r0 + 4, r, a + folga, a + passo - folga)}" fill="${cor}"/>`;
  }).join("");
  const marcas = [[0, "0h"], [6, "6h"], [12, "12h"], [18, "18h"]].map(([h, txt]) => {
    const a = h * passo - Math.PI / 2, r = r1 + 24;
    return `<text x="${f(cx + r * Math.cos(a))}" y="${f(cy + r * Math.sin(a) + 5.5)}" text-anchor="middle" class="m" font-size="15" fill="${t.sec}">${txt}</text>`;
  }).join("");
  return `${marcador("git-commit", 48, 84, num(d.commits.total), t)}
<circle cx="${cx}" cy="${cy}" r="${r1}" fill="none" stroke="${t.trilha}" stroke-width="1.5" stroke-dasharray="2 5"/>
<circle cx="${cx}" cy="${cy}" r="${r0}" fill="none" stroke="${t.trilha}" stroke-width="1.5"/>
${fatias}
<g class="gira" style="transform-origin:${cx}px ${cy}px"><line x1="${cx}" y1="${cy - r0 - 2}" x2="${cx}" y2="${cy - r1 - 8}" stroke="${t.azul}" stroke-width="2" stroke-linecap="round"/><circle cx="${cx}" cy="${cy - r1 - 8}" r="4" fill="${t.azul}"/></g>
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
    return `<rect class="sobe" style="animation-delay:${f(0.3 + i * 0.035)}s" x="${f(bx)}" y="${f(base - h)}" width="${f(larg)}" height="${f(h)}" rx="2.5" fill="${hoje ? t.azul : misturar(t.azulClaro, t.fundo, 0.25)}"/>`
      + (hoje ? `<text x="${f(bx + larg / 2)}" y="${f(base - h - 10)}" text-anchor="middle" class="m vivo" font-size="16" fill="${t.azul}">${num(c.n)}</text>` : "");
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
${entregas(t, d)}`, `${ENTRADA}
.gira{transform-box:view-box;animation:gira 24s linear infinite}
@keyframes gira{to{transform:rotate(360deg)}}`);
}

// Quem toca a Konecz: cada um no seu barco de papel, no traço do site, navegando no seu pedaço de mar.
export function tripulacao(t) {
  const W = 1200, H = 300;
  const barcos = EQUIPE.map(([nome], i) => {
    const cx = 200 + i * 540, cy = 178;
    return `${barco(cx, cy, 92, { cor: t.azul, fundo: t.fundo, atraso: i * 0.37, giro0: i ? -0.35 : 0.35 })}
<text x="${cx + 130}" y="${cy + 12}" class="g" font-size="32" font-weight="800" fill="${t.tinta}" letter-spacing="-.5">${esc(nome)}</text>`;
  }).join("\n");
  const cabeca = `${icone("people", 48, 44, 24, t.sec)}<text x="82" y="64" class="m" font-size="20" fill="${t.tinta}">${EQUIPE.length}</text>`;
  return svg(W, H, t, `${cabeca}\n${barcos}`);
}
