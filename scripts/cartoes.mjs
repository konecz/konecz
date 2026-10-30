// Cabeçalho, linguagens, ritmo (horário dos commits e entregas) e tripulação, no azul do konecz.com.
// Pouco texto de propósito: número, ícone e gráfico dizem o que cada coisa é.
import { svg, esc, num, f, misturar, barco, icone, logoDa, FITA } from "./desenho.mjs";

const EQUIPE = [["Pedro Lahrs", "PL"], ["Vanessa Cristine", "VC"]];

// Linha de onda que se repete a cada `per`, larga o bastante para deslizar um período sem emenda.
function onda(x0, x1, y, amp, per) {
  let d = `M${x0 - per} ${y}`;
  for (let x = x0 - per; x < x1 + per; x += per) d += `q${per / 4} ${-amp} ${per / 2} 0t${per / 2} 0`;
  return d;
}

const ONDAS_CSS = `@keyframes d72{to{transform:translateX(-72px)}}
@keyframes d110{to{transform:translateX(-110px)}}
.balanca{transform-box:view-box;animation:balanca 6s ease-in-out infinite}
@keyframes balanca{0%,100%{transform:translateY(2px) rotate(-2.5deg)}50%{transform:translateY(-3px) rotate(2.5deg)}}`;

// A abertura do site: «Konecz AI Factory» e a fita da logo em linhas brancas finas, flutuando devagar.
export function cabecalho(t) {
  const W = 1200, H = 300, ALTO = 236;
  const [vx, vy, vw, vh] = FITA.caixa, s = ALTO / vh;
  const x = W - 96 - vw * s, y = (H - ALTO) / 2;
  const css = `.flutua{animation:flutua 9s ease-in-out infinite}
@keyframes flutua{0%,100%{transform:translateY(5px)}50%{transform:translateY(-5px)}}`;
  const corpo = `<text x="44" y="150" class="g" font-size="104" font-weight="800" fill="${t.tinta}" letter-spacing="-5">Konecz</text>
<text x="48" y="222" class="g" font-size="56" font-weight="700" fill="${t.sec}" letter-spacing="-2">AI Factory</text>
<g class="flutua"><path transform="translate(${f(x - vx * s)} ${f(y - vy * s)}) scale(${f(s * 1000) / 1000})" d="${FITA.d}" fill="none" stroke="${t.tinta}" stroke-width="${f(1.1 / s * 100) / 100}" stroke-linejoin="round" opacity=".92"/></g>`;
  return svg(W, H, t, corpo, css);
}

// Fatia que arredonda para 0,0% mas existe vira "<0,1%".
const pct = (v) => (v > 0 && v < 0.05 ? "<0,1%" : `${v.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`);

// Arco em volta da bolha, do topo em sentido horário, do tamanho da fatia.
function arco(cx, cy, r, parte) {
  const a = -Math.PI / 2 + Math.min(parte, 0.999) * 2 * Math.PI;
  return `M${f(cx)} ${f(cy - r)}A${f(r)} ${f(r)} 0 ${parte > 0.5 ? 1 : 0} 1 ${f(cx + r * Math.cos(a))} ${f(cy + r * Math.sin(a))}`;
}

// Bolha com o logo em branco e o anel preenchido até a fatia da linguagem; sem logo, o nome escrito.
// JS e TS têm as letras vazadas: o azul da bolha aparece nelas.
function bolha(cx, cy, r, g, t) {
  const anel = `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r + 9)}" fill="none" stroke="${t.trilha}" stroke-width="5"/>
<path d="${arco(cx, cy, r + 9, g.parte)}" fill="none" stroke="${t.tinta}" stroke-width="5" stroke-linecap="round"/>
<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${t.cartao}"/>`;
  if (!g.logo) {
    // Nome inteiro se couber com 15 px ou mais; senão, as duas primeiras letras.
    const cabe = (r * 1.6) / (g.nome.length * 0.62);
    const texto = cabe >= 15 ? g.nome : g.nome.slice(0, 2);
    const tam = Math.min(26, cabe >= 15 ? cabe : (r * 1.6) / (texto.length * 0.62));
    return `${anel}
<text x="${f(cx)}" y="${f(cy + tam * 0.36)}" text-anchor="middle" class="g" font-size="${f(tam)}" font-weight="800" fill="${t.tinta}">${esc(texto)}</text>`;
  }
  const lado = r * 1.04, x = cx - lado / 2, y = cy - lado / 2;
  return `${anel}
<path transform="translate(${f(x)} ${f(y)}) scale(${Math.round((lado / 24) * 1000) / 1000})" d="${g.logo.d}" fill="${t.tinta}"/>`;
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
  const W = 1200, R = 38, POR_LINHA = 8, passo = 138, LINHA = 176, TOPO = 108;
  const linhas = Math.max(1, Math.ceil(lista.length / POR_LINHA)), H = TOPO + linhas * LINHA - 10;
  const desenho = lista.map((g, i) => {
    const linha = Math.floor(i / POR_LINHA), naLinha = Math.min(POR_LINHA, lista.length - linha * POR_LINHA);
    const cx = (W - passo * naLinha) / 2 + (i % POR_LINHA) * passo + passo / 2, cy = TOPO + linha * LINHA + R + 9;
    return `${bolha(cx, cy, R, g, t)}
<text x="${f(cx)}" y="${f(cy + R + 46)}" text-anchor="middle" class="m" font-size="17" fill="${t.sec}">${esc(pct(g.parte * 100))}</text>`;
  }).join("\n");
  const corpo = `${icone("repo", 48, 44, 24, t.sec)}<text x="82" y="64" class="m" font-size="20" fill="${t.tinta}">${num(d.repositorios)}</text>
${icone("code", 140, 44, 24, t.sec)}<text x="174" y="64" class="m" font-size="20" fill="${t.tinta}">${num(lista.length)}</text>
${desenho}`;
  return svg(W, H, t, corpo);
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

// Quem toca a Konecz: cada um no seu barco, com as iniciais pintadas no casco.
export function tripulacao(t) {
  const W = 1200, H = 244, NIVEL = 194, S = 5;
  const barcos = EQUIPE.map(([nome, iniciais], i) => {
    const x = 60 + i * 560, centro = x + 12 * S;
    const casco = t.papel, letra = t.fundo;
    return `<g class="balanca" style="transform-origin:${centro}px ${NIVEL}px;animation-duration:${6 + i * 1.3}s;animation-delay:-${i * 2}s">
${barco(x, NIVEL - 19 * S, S, { casco, vela: t.papel, linha: t.fundo, traco: 2.4 })}
<text x="${centro}" y="${NIVEL - 5}" text-anchor="middle" class="g" font-size="17" font-weight="800" fill="${letra}" letter-spacing="1">${iniciais}</text>
</g>
<text x="${x + 136}" y="${NIVEL - 30}" class="g" font-size="32" font-weight="800" fill="${t.tinta}" letter-spacing="-.5">${esc(nome)}</text>`;
  }).join("\n");
  const agua = `<clipPath id="moldura"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="15"/></clipPath>
<g clip-path="url(#moldura)">
<path style="animation:d72 8s linear infinite" d="${onda(0, W, NIVEL + 2, 7, 72)}" fill="none" stroke="${t.tinta}" stroke-width="2.4" stroke-linecap="round"/>
<path style="animation:d110 14s linear infinite" d="${onda(0, W, NIVEL + 28, 5, 110)}" fill="none" stroke="${t.fraco}" stroke-width="2" stroke-linecap="round"/>
</g>`;
  const cabeca = `${icone("people", 48, 44, 24, t.sec)}<text x="82" y="64" class="m" font-size="20" fill="${t.tinta}">${EQUIPE.length}</text>`;
  return svg(W, H, t, `${cabeca}\n${agua}\n${barcos}`, ONDAS_CSS);
}
