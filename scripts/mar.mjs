// Mar de commits: o calendário de contribuições em 3D, com a projeção calculada aqui (SVG puro, sem WebGL).
// Cada dia é uma coluna, e a altura é o volume do dia. A onda é CSS: uma animação por diagonal da grade,
// então o navegador move só ~60 grupos. A ordem de desenho (do fundo para a frente) vale com qualquer altura.
import { svg, num, f, misturar, icone, mesCurto } from "./desenho.mjs";

const W = 1200;
const AREA = { x: 48, y: 150, w: 1104, h: 330 }; // o mar ocupa a largura toda; a altura do cartão sai dele
const GIRO = (11 * Math.PI) / 180; // giro da grade em torno do eixo vertical: a semana atual fica mais perto
const ELEVACAO = (34 * Math.PI) / 180; // altura do olhar sobre o mar
const LARGURA = 0.8; // largura da coluna; o vão que sobra desenha o quadriculado
const BASE = 0.22; // espessura da água parada
const ALTURA = 4.4; // altura da maior onda
const AMPLITUDE = 0.26; // balanço da onda, em unidades da grade
const PERIODO = 7; // segundos por balanço
const CRISTAS = 2.4; // cristas que cabem no mar ao mesmo tempo
const LAJE = 1.7; // profundidade do corte de água na frente

export function mar(t, d) {
  const semanas = d.contribuicoes.semanas;
  const nx = semanas.length, ny = 7, vao = (1 - LARGURA) / 2;
  const ativos = semanas.flat().filter((c) => c?.n > 0).map((c) => c.n).sort((a, b) => a - b);
  const maior = ativos.at(-1) ?? 1;
  const cortes = [0.25, 0.5, 0.75].map((p) => ativos[Math.floor(p * (ativos.length - 1))] ?? 0);
  const nivel = (n) => (n > 0 ? 1 + cortes.filter((c) => n > c).length : 0);
  const altura = (n) => BASE + (n > 0 ? (ALTURA * Math.log1p(n)) / Math.log1p(maior) : 0);
  const topoLaje = BASE - AMPLITUDE - 0.05, fundoLaje = topoLaje - LAJE, pe = topoLaje - 0.8;

  const cg = Math.cos(GIRO), sg = Math.sin(GIRO), se = Math.sin(ELEVACAO), ce = Math.cos(ELEVACAO);
  const bruto = (x, y, z) => [x * cg - y * sg, (x * sg + y * cg) * se - z * ce];

  // Enquadramento: a grade inteira, com as cristas no alto do balanço, encostada no topo da AREA.
  const pontos = [[0, 0], [nx, 0], [0, ny], [nx, ny]].map(([x, y]) => bruto(x, y, fundoLaje));
  semanas.forEach((s, x) => s.forEach((c, y) => pontos.push(bruto(x, y, altura(c?.n ?? 0) + AMPLITUDE))));
  const us = pontos.map((p) => p[0]), vs = pontos.map((p) => p[1]);
  const [u0, u1, v0, v1] = [Math.min(...us), Math.max(...us), Math.min(...vs), Math.max(...vs)];
  const escala = Math.min(AREA.w / (u1 - u0), AREA.h / (v1 - v0));
  const ox = AREA.x + (AREA.w - (u1 - u0) * escala) / 2 - u0 * escala;
  const oy = AREA.y - v0 * escala;
  const p = (x, y, z) => { const [u, v] = bruto(x, y, z); return [ox + u * escala, oy + v * escala]; };
  const caminho = (...pts) => `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join("L")}Z`;

  const cores = t.mar.map((topo) => ({ topo, frente: misturar(topo, t.sombra, 0.16), lado: misturar(topo, t.sombra, 0.3) }));
  const coluna = (x, y, n) => {
    const z = altura(n), c = cores[nivel(n)];
    const x0 = x + vao, x1 = x0 + LARGURA, y0 = y + vao, y1 = y0 + LARGURA;
    return `<path d="${caminho(p(x0, y1, z), p(x1, y1, z), p(x1, y1, pe), p(x0, y1, pe))}" fill="${c.frente}"/>`
      + `<path d="${caminho(p(x1, y0, z), p(x1, y1, z), p(x1, y1, pe), p(x1, y0, pe))}" fill="${c.lado}"/>`
      + `<path d="${caminho(p(x0, y0, z), p(x1, y0, z), p(x1, y1, z), p(x0, y1, z))}" fill="${c.topo}"/>`;
  };

  // Uma diagonal por grupo (x + y constante): nenhuma coluna de uma diagonal encobre outra da mesma.
  // O atraso negativo põe cada diagonal num ponto do balanço; a crista anda para a frente e para a direita.
  const diagonais = nx + ny - 1;
  const atraso = (k) => -f((((-k * CRISTAS) / diagonais) % 1 + 1) % 1 * PERIODO * 100) / 100;
  const grupos = [];
  for (let k = 0; k < diagonais; k++) {
    let colunas = "";
    for (let x = Math.max(0, k - ny + 1); x <= Math.min(nx - 1, k); x++) colunas += coluna(x, k - x, semanas[x][k - x]?.n ?? 0);
    grupos.push(`<g class="o" style="animation-delay:${atraso(k)}s">${colunas}</g>`);
  }

  // O corte de água na frente e na direita esconde o pé das colunas.
  const xa = vao, xb = nx - vao, ya = vao, yb = ny - vao;
  const laje = `<path d="${caminho(p(xa, ya, topoLaje), p(xb, ya, topoLaje), p(xb, yb, topoLaje), p(xa, yb, topoLaje))}" fill="${cores[0].lado}"/>`;
  const corte = `<path d="${caminho(p(xa, yb, topoLaje), p(xb, yb, topoLaje), p(xb, yb, fundoLaje), p(xa, yb, fundoLaje))}" fill="url(#lf)"/>
<path d="${caminho(p(xb, ya, topoLaje), p(xb, yb, topoLaje), p(xb, yb, fundoLaje), p(xb, ya, fundoLaje))}" fill="url(#ll)"/>`;

  // Meses gravados no corte, deitados no plano da frente.
  const inicios = semanas.map((s, x) => [x, s.find((c) => c?.data.endsWith("-01"))]).filter(([, c]) => c);
  if (!inicios.length || inicios[0][0] >= 3) inicios.unshift([0, semanas[0].find(Boolean)]);
  const meses = inicios.map(([x, dia]) => {
    const [ax, ay] = p(x + vao + 0.15, yb, topoLaje - LAJE * 0.66);
    const nome = mesCurto(dia.data);
    return `<text transform="matrix(${f(cg * 1000) / 1000} ${f(sg * se * 1000) / 1000} 0 ${f(ce * 1000) / 1000} ${f(ax)} ${f(ay)})" class="m" font-size="15" letter-spacing="1" fill="${t.lajeTexto}">${nome}</text>`;
  }).join("");

  // Hoje: o último dia do calendário leva o barquinho de papel, balançando junto com a sua diagonal.
  // O dia recorde ganha um troféu flutuando em cima da coluna.
  const xh = nx - 1, yh = semanas[xh].findLastIndex(Boolean);
  const nHoje = semanas[xh][yh].n;
  const barco = barco3d(p, xh + 0.5, yh + 0.5, altura(nHoje), t);
  const [rx, ry] = p(xh + 0.5, yh + 0.5, altura(nHoje));
  const [lx, ly] = p(xh + 0.5, yh + 0.5, altura(nHoje) + 3.2);
  const marcaHoje = `<g class="o" style="animation-delay:${atraso(xh + yh)}s">
<g class="b" style="transform-origin:${f(rx)}px ${f(ry)}px">${barco}</g>
<text x="${f(lx)}" y="${f(ly)}" text-anchor="middle" class="m" font-size="17" fill="${t.tinta}">${num(nHoje)}</text>
</g>`;
  const r = numeros(semanas);
  const [tx, ty] = p(r.recorde.x + 0.5, r.recorde.y + 0.5, altura(r.recorde.n) + 0.7);
  const marcaRecorde = `<g class="o" style="animation-delay:${atraso(r.recorde.x + r.recorde.y)}s">${icone("trophy", tx - 12, ty - 24, 24, t.tinta)}</g>`;

  // Os números ficam no canto de baixo à esquerda, que a diagonal do mar deixa livre; ícone no lugar de legenda.
  const [ax, ay] = p(xa, yb, fundoLaje), [bx, by] = p(xb, yb, fundoLaje);
  const yNum = Math.ceil(ay + ((760 - ax) * (by - ay)) / (bx - ax) + 72);
  const H = Math.ceil(Math.max(yNum + 48, by + 48));
  const maiorDaSemana = Math.max(...r.semana.dias, 1);
  const semana = r.semana.dias.map((n, i) => {
    const h = Math.max(2, (n / maiorDaSemana) * 30);
    return `<rect x="${i * 5}" y="${f(30 - h)}" width="3.6" height="${f(h)}" rx="1" fill="${t.azul}"/>`;
  }).join("");
  const simbolos = [
    (x) => icone("calendar", x, yNum - 32, 32, t.azul), // contribuições do ano (commits, PRs, revisões), não só commits
    (x) => icone("flame", x, yNum - 32, 32, t.azul),
    (x) => icone("trophy", x, yNum - 32, 32, t.azul),
    (x) => `<g transform="translate(${x} ${yNum - 31})">${semana}</g>`,
  ];
  let xk = 48;
  const kpis = [d.contribuicoes.total, r.seguidos, r.recorde.n, r.semana.soma].map((valor, i) => {
    const texto = num(valor), x = xk;
    xk += 44 + texto.length * 26 + 52;
    return `${simbolos[i](x)}
<text x="${x + 44}" y="${yNum}" class="g" font-size="46" font-weight="800" fill="${t.tinta}" letter-spacing="-1.4">${texto}</text>`;
  }).join("\n");

  const desloca = f(AMPLITUDE * escala * ce * 100) / 100;
  const css = `.o{animation:o ${PERIODO}s ease-in-out infinite}
@keyframes o{0%,100%{transform:translateY(${desloca}px)}50%{transform:translateY(-${desloca}px)}}
.b{transform-box:view-box;animation:b ${PERIODO * 0.75}s ease-in-out infinite}
@keyframes b{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}`;

  const corpo = `<defs>
<linearGradient id="lf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.laje[0]}"/><stop offset="1" stop-color="${t.laje[1]}"/></linearGradient>
<linearGradient id="ll" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.lajeLado[0]}"/><stop offset="1" stop-color="${t.lajeLado[1]}"/></linearGradient>
</defs>
<text x="48" y="88" class="g" font-size="38" font-weight="800" fill="${t.tinta}" letter-spacing="-.8">Mar de commits</text>
${kpis}
${laje}
${grupos.join("\n")}
${corte}
${meses}
${marcaRecorde}
${marcaHoje}`;
  return svg(W, H, t, corpo, css);
}

// Os números do cartão, tirados do próprio calendário: dias seguidos, recorde e a última semana.
function numeros(semanas) {
  const dias = [];
  semanas.forEach((s, x) => s.forEach((c, y) => c && dias.push({ ...c, x, y })));
  let i = dias.length - 1;
  if (dias[i].n === 0) i--; // o dia de hoje ainda pode ter zero sem quebrar a sequência
  let seguidos = 0;
  while (i >= 0 && dias[i].n > 0) { seguidos++; i--; }
  const ultimos = dias.slice(-7).map((c) => c.n);
  return {
    seguidos,
    recorde: dias.reduce((a, b) => (b.n > a.n ? b : a)),
    semana: { soma: ultimos.reduce((s, n) => s + n, 0), dias: ultimos },
  };
}

// Barquinho de papel em 3D: casco em V (painel da frente, borda de dentro) e a vela no plano do meio.
function barco3d(p, cx, cy, z0, t) {
  const L = 1.5, l = 0.9, alto = 0.7, meia = 0.24, vela = 1.9;
  const z1 = z0 + alto;
  const pt = (x, y, z) => p(cx + x, cy + y, z).map(f).join(" ");
  const dentro = `M${pt(-L, -meia, z1)}L${pt(L, -meia, z1)}L${pt(l, 0, z0 + 0.04)}L${pt(-l, 0, z0 + 0.04)}Z`;
  const frente = `M${pt(-L, meia, z1)}L${pt(L, meia, z1)}L${pt(l, 0, z0 + 0.04)}L${pt(-l, 0, z0 + 0.04)}Z`;
  const vel = `M${pt(0, 0, z1 + vela)}L${pt(-0.8, 0, z1)}L${pt(0.8, 0, z1)}Z`;
  const dobra = `M${pt(0, 0, z1 + vela)}L${pt(0, 0, z1)}M${pt(0, 0, z1 + vela)}L${pt(-0.4, 0, z1)}`;
  return `<g stroke="${t.barcoLinha}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">
<path d="${dentro}" fill="${misturar(t.azul, t.sombra, 0.45)}" stroke="none"/>
<path d="${vel}" fill="${t.papel}"/>
<path d="${dobra}" fill="none"/>
<path d="${frente}" fill="${t.azul}" stroke="${t.azul}"/>
</g>`;
}
