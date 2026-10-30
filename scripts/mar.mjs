// Mar de commits: o calendário de contribuições como um mar de linhas em 3D, no traço do mar do barco no konecz.com
// (src/papel.ts). Cada linha corre o ano de ponta a ponta numa faixa dos dias da semana, e a altura da água é o
// volume do dia. As linhas da frente pintam o fundo embaixo de si e cobrem as de trás, como a água da frente cobre o
// casco no site. O balanço é CSS, uma animação por linha com o atraso andando de trás para a frente: a ondulação
// vem chegando. O barco de papel navega no dia de hoje, junto com a linha dele.
import { svg, num, f, icone } from "./desenho.mjs";

const inicial = (dia) => "JFMAMJJASOND"[Number(dia.slice(5, 7)) - 1];
import { barco as barcoDePapel } from "./origami.mjs";

const W = 1200;
const AREA = { x: 48, y: 130, w: 1104, h: 360 }; // o mar ocupa a largura toda; a altura do cartão sai dele
const GIRO = (11 * Math.PI) / 180; // giro em torno do eixo vertical: a semana atual fica mais perto
const ELEVACAO = (30 * Math.PI) / 180; // altura do olhar sobre o mar
const ALTURA = 7; // altura da maior onda
const FUNDO_DO_DIA = 2.6; // profundidade de cada dia da semana, para o mar não ficar uma tira
const POR_DIA = 3; // linhas por dia da semana (as do meio alisam a superfície entre um dia e o outro)
const PASSO = 0.25; // pontos por semana ao longo da linha
const PERIODO = 6; // segundos por balanço
const BALANCO = 5; // px do balanço
const CRISTAS = 1.5; // ondulações que cabem do fundo à frente ao mesmo tempo

const suave = (u) => u * u * (3 - 2 * u);

export function mar(t, d) {
  const semanas = d.contribuicoes.semanas;
  const nx = semanas.length, ny = 7;
  const maior = Math.max(1, ...semanas.flat().map((c) => c?.n ?? 0));
  const altura = (n) => (n > 0 ? (ALTURA * Math.log1p(n)) / Math.log1p(maior) : 0);
  const h = semanas.map((s) => Array.from({ length: ny }, (_, y) => altura(s[y]?.n ?? 0)));
  // A superfície entre os dias: interpolação suave nos dois sentidos, com a água parada fazendo uma marola leve.
  const agua = (x, y) => {
    const x0 = Math.min(nx - 1, Math.floor(x)), y0 = Math.min(ny - 1, Math.floor(y));
    const x1 = Math.min(nx - 1, x0 + 1), y1 = Math.min(ny - 1, y0 + 1), u = suave(x - x0), v = suave(y - y0);
    const z = (h[x0][y0] * (1 - u) + h[x1][y0] * u) * (1 - v) + (h[x0][y1] * (1 - u) + h[x1][y1] * u) * v;
    return z + 0.06 * Math.sin(1.7 * x + 2.3 * y);
  };

  const cg = Math.cos(GIRO), sg = Math.sin(GIRO), se = Math.sin(ELEVACAO), ce = Math.cos(ELEVACAO);
  const bruto = (x, y, z) => { y *= FUNDO_DO_DIA; return [x * cg - y * sg, (x * sg + y * cg) * se - z * ce]; };
  const fundo = -0.6; // até onde a água da frente pinta para baixo
  const pontos = [[0, 0, fundo], [nx - 1, 0, fundo], [0, ny - 1, fundo], [nx - 1, ny - 1, fundo]];
  semanas.forEach((s, x) => s.forEach((_, y) => pontos.push([x, y, h[x][y] + 0.3])));
  const us = pontos.map((q) => bruto(...q)[0]), vs = pontos.map((q) => bruto(...q)[1]);
  const [u0, u1, v0, v1] = [Math.min(...us), Math.max(...us), Math.min(...vs), Math.max(...vs)];
  const escala = Math.min(AREA.w / (u1 - u0), AREA.h / (v1 - v0));
  const ox = AREA.x + (AREA.w - (u1 - u0) * escala) / 2 - u0 * escala, oy = AREA.y - v0 * escala;
  const p = (x, y, z) => { const [u, v] = bruto(x, y, z); return [ox + u * escala, oy + v * escala]; };
  const caminho = (pts) => `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(" ")}`;

  // Linhas de trás (y = 0, o domingo) para a frente; cada uma num grupo que balança no seu tempo.
  const total = (ny - 1) * POR_DIA + 1;
  const atraso = (k) => -f(((1 - (k / (total - 1)) * CRISTAS) % 1 + 1) % 1 * PERIODO * 100) / 100;
  const linhas = [];
  for (let k = 0; k < total; k++) {
    const y = k / POR_DIA, pts = [];
    for (let x = 0; x <= nx - 1 + 1e-6; x += PASSO) pts.push(p(x, y, agua(x, y)));
    const cobre = `${caminho(pts)} ${f(p(nx - 1, y, fundo)[0])} ${f(p(nx - 1, y, fundo)[1])} ${f(p(0, y, fundo)[0])} ${f(p(0, y, fundo)[1])}Z`;
    const opacidade = f((0.3 + 0.7 * (k / (total - 1))) * 100) / 100;
    linhas.push({ y, k, desenho: `<path d="${cobre}" fill="${t.fundo}"/><path d="${caminho(pts)}" fill="none" stroke="${t.azul}" stroke-opacity="${opacidade}" stroke-width="${k % POR_DIA ? 1 : 1.6}" stroke-linejoin="round"/>` });
  }

  // Hoje: o barco de papel no dia, por cima do mar e balançando junto com a linha dele; o dia recorde leva o troféu na linha dele.
  const xh = nx - 1, yh = semanas[xh].findLastIndex(Boolean), nHoje = semanas[xh][yh].n;
  const [rx, ry] = p(xh, yh, agua(xh, yh));
  const barco = barcoDePapel(rx, ry - 0.45 * 40, 40, { cor: t.azul, fundo: t.fundo, mar: false, giro0: 0.5, quadros: 12, ciclo: PERIODO, traco: 1.2 });
  const [lx, ly] = p(xh, yh, agua(xh, yh) + 2.6);
  const navega = `<g class="o" style="animation-delay:${atraso(yh * POR_DIA)}s">${barco}<text x="${f(lx)}" y="${f(ly)}" text-anchor="middle" class="m" font-size="17" fill="${t.tinta}">${num(nHoje)}</text></g>`;
  const r = numeros(semanas);
  const [tx, ty] = p(r.recorde.x, r.recorde.y, agua(r.recorde.x, r.recorde.y) + 0.5);
  linhas[r.recorde.y * POR_DIA].desenho += icone("trophy", tx - 12, ty - 26, 24, t.tinta);
  const ondas = linhas.map((l) => `<g class="o" style="animation-delay:${atraso(l.k)}s">${l.desenho}</g>`).join("\n");

  // Meses: um anel por mês embaixo da linha da frente, no meio do mês, cheio até as contribuições dele (o mês mais
  // forte enche o anel), com a inicial dentro; enche quando a imagem carrega, como os das linguagens.
  const porMes = new Map();
  semanas.forEach((s, x) => s.forEach((c, y) => {
    if (!c) return;
    const m = porMes.get(c.data.slice(0, 7)) ?? { soma: 0, xs: 0, dias: 0, data: c.data };
    m.soma += c.n; m.xs += x; m.dias++;
    porMes.set(c.data.slice(0, 7), m);
  }));
  const maiorMes = Math.max(1, ...[...porMes.values()].map((m) => m.soma));
  const RM = 17, C = 2 * Math.PI * RM;
  const meses = [...porMes.values()].filter((m) => m.dias >= 7).map((m, i) => {
    const [mx, my] = p(m.xs / m.dias, ny - 1, fundo);
    const cx = f(mx), cy = f(my + 34), cheio = Math.max(0.001, Math.min(m.soma / maiorMes, 0.999)) * C;
    return `<circle cx="${cx}" cy="${cy}" r="${RM}" fill="none" stroke="${t.trilha}" stroke-width="4.5"/>
<circle class="enche" style="--c:${f(C)};animation-delay:${f(0.3 + i * 0.07)}s" transform="rotate(-90 ${cx} ${cy})" cx="${cx}" cy="${cy}" r="${RM}" fill="none" stroke="${t.azul}" stroke-width="4.5" stroke-linecap="round" stroke-dasharray="${f(C)} ${f(C)}" stroke-dashoffset="${f(C - cheio)}"/>
<text x="${cx}" y="${f(my + 40)}" text-anchor="middle" class="g" font-size="16" font-weight="800" fill="${t.sec}">${inicial(m.data)}</text>`;
  }).join("");

  // Os números ficam no canto de baixo à esquerda, que a diagonal do mar deixa livre; ícone no lugar de legenda.
  const [ax, ay] = p(0, ny - 1, fundo), [bx, by] = p(nx - 1, ny - 1, fundo);
  const yNum = Math.ceil(ay + ((760 - ax) * (by - ay)) / (bx - ax) + 112);
  const H = Math.ceil(Math.max(yNum + 48, by + 70));
  const maiorDaSemana = Math.max(...r.semana.dias, 1);
  const semana = r.semana.dias.map((n, i) => {
    const alto = Math.max(2, (n / maiorDaSemana) * 30);
    return `<rect class="sobe" style="animation-delay:${f(0.2 + i * 0.08)}s" x="${i * 5}" y="${f(30 - alto)}" width="3.6" height="${f(alto)}" rx="1" fill="${t.azul}"/>`;
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

  const css = `.o{animation:o ${PERIODO}s ease-in-out infinite}
@keyframes o{0%,100%{transform:translateY(${BALANCO}px)}50%{transform:translateY(-${BALANCO}px)}}
.sobe{transform-box:fill-box;transform-origin:50% 100%;animation:sobe 1.2s cubic-bezier(.3,0,.2,1) both}
@keyframes sobe{from{transform:scaleY(0)}}
.enche{animation:enche 1.8s cubic-bezier(.3,0,.2,1) both}
@keyframes enche{from{stroke-dashoffset:var(--c)}}`;
  const corpo = `<text x="48" y="88" class="g" font-size="38" font-weight="800" fill="${t.tinta}" letter-spacing="-.8">Mar de commits</text>
${kpis}
${ondas}
${navega}
${meses}`;
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
