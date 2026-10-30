// A fita e o barco de papel do konecz.com, no mesmo traço da página: objetos em 3D desenhados só com linhas finas
// (as listras da logo), mais claras na frente e mais apagadas atrás. A geometria é a de src/fita.ts e src/papel.ts do
// site. Para mexer dentro de um <img> do GitHub (sem JS), cada linha é calculada em alguns quadros de um ciclo que
// fecha em si mesmo, e o SMIL interpola o caminho entre um quadro e o outro.
import { f } from "./desenho.mjs";

const lerp = (a, b, u) => a + (b - a) * u;
const unit = (a) => {
  const n = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / n, a[1] / n, a[2] / n];
};
const cruz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const caminho = (pts) => `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(" ")}`;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Um atributo que muda em `quadros` valores ao longo de `dur` segundos e volta ao primeiro.
function anima(nome, valores, dur) {
  if (valores.every((v) => v === valores[0])) return "";
  return `<animate attributeName="${nome}" dur="${dur}s" repeatCount="indefinite" values="${[...valores, valores[0]].join(";")}"/>`;
}
const opac = (v) => (Math.round(v * 100) / 100).toString();

// ---------------------------------------------------------------- a fita
const LINHAS = 12, PONTOS = 80, TRECHO = 10;

function centro(s) {
  const x = 0.5 * Math.sin(2 * s) * (1 - 0.2 * Math.cos(s)) + 0.07 * Math.sin(s) - 0.06 * Math.cos(s);
  const y = 0.92 * Math.cos(s) + 0.1;
  const z = 0.32 * Math.sin(s);
  const a = (14 * Math.PI) / 180; // a inclinação da logo
  return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z];
}
const BASE = Array.from({ length: PONTOS + 1 }, (_, i) => {
  const s = (2 * Math.PI * i) / PONTOS, c = centro(s);
  const t = unit(centro(s + 1e-3).map((v, k) => v - c[k]));
  const n = unit(cruz(t, [0, 0, 1]));
  return { s, c, n, b: cruz(t, n), largura: 0.17 * (1 - 0.32 * Math.cos(s)) };
});

// A fita girando no espaço, com a torção correndo por ela, numa caixa de `alto` px com o centro em (cx, cy).
// O giro vai e volta e a torção dá uma volta inteira no ciclo, então o último quadro emenda no primeiro.
export function fita(cx, cy, alto, cor, { ciclo = 24, quadros = 16, traco = 1.5 } = {}) {
  const escala = alto / 2.45;
  const trechos = []; // [linha][trecho] → { d: [], o: [] }
  for (let q = 0; q < quadros; q++) {
    const u = q / quadros;
    const giro = 0.62 * Math.sin(2 * Math.PI * u), fase = 2 * Math.PI * u;
    const inc = 0.18 * Math.sin(2 * Math.PI * u + 1), cg = Math.cos(giro), sg = Math.sin(giro), ci = Math.cos(inc), si = Math.sin(inc);
    for (let k = 0; k < LINHAS; k++) {
      const t = -1 + (2 * k) / (LINHAS - 1);
      for (let j = 0; j * TRECHO < PONTOS; j++) {
        const pts = [];
        let somaZ = 0;
        for (let i = j * TRECHO; i <= Math.min(PONTOS, (j + 1) * TRECHO); i++) {
          const p = BASE[i], theta = p.s / 2 + fase, d = t * p.largura;
          const ct = Math.cos(theta) * d, st = Math.sin(theta) * d;
          let x = p.c[0] + ct * p.n[0] + st * p.b[0], y = p.c[1] + ct * p.n[1] + st * p.b[1], z = p.c[2] + ct * p.n[2] + st * p.b[2];
          [x, z] = [x * cg + z * sg, -x * sg + z * cg];
          [y, z] = [y * ci - z * si, y * si + z * ci];
          const persp = 3.2 / (3.2 - z);
          pts.push([cx + x * escala * persp, cy - y * escala * persp]);
          somaZ += z;
        }
        const tr = ((trechos[k] ??= [])[j] ??= { d: [], o: [] });
        tr.d.push(caminho(pts));
        tr.o.push(opac(clamp(0.55 + (somaZ / pts.length) * 1.1, 0.16, 1)));
      }
    }
  }
  const corpo = trechos.flat().map((tr) =>
    `<path d="${tr.d[0]}" stroke-opacity="${tr.o[0]}">${anima("d", tr.d, ciclo)}${anima("stroke-opacity", tr.o, ciclo)}</path>`).join("");
  return `<g fill="none" stroke="${cor}" stroke-width="${traco}" stroke-linecap="round" stroke-linejoin="round">${corpo}</g>`;
}

// ---------------------------------------------------------------- o barco no mar
// As oito faces do barco (src/papel.ts): a vela em duas e o casco com as duas laterais, pontas finas.
const BARCO = [
  [[-0.32, -0.22, 0], [0, 0.55, 0], [0, -0.22, 0]],
  [[0, 0.55, 0], [0.32, -0.22, 0], [0, -0.22, 0]],
  [[-0.82, -0.02, 0], [0, -0.14, 0.22], [-0.42, -0.58, 0.04]],
  [[0, -0.14, 0.22], [0.42, -0.58, 0.04], [-0.42, -0.58, 0.04]],
  [[0, -0.14, 0.22], [0.82, -0.02, 0], [0.42, -0.58, 0.04]],
  [[0, -0.14, -0.22], [0.82, -0.02, 0], [0.42, -0.58, -0.04]],
  [[-0.82, -0.02, 0], [0, -0.14, -0.22], [-0.42, -0.58, -0.04]],
  [[0, -0.14, -0.22], [0.42, -0.58, -0.04], [-0.42, -0.58, -0.04]],
];
const LUZ = unit([0.4, 0.7, 0.6]);
const NIVEL = -0.44; // a linha d'água, um pouco acima do fundo do casco
const LINHAS_DO_MAR = 9;
// A água: duas ondulações cruzadas que andam, com frequências que fecham o ciclo (3 e 2 voltas por ciclo).
const onda = (x, z, u) => 0.035 * Math.sin(2.6 * x + 1.3 * z - 6 * Math.PI * u) + 0.02 * Math.sin(1.9 * z - 1.1 * x - 4 * Math.PI * u);

// O barco de papel navegando no mar de linhas, como no Software do site, com o centro em (cx, cy) e `unidade` px por
// unidade da folha (o barco tem 1,64 de comprida). `fundo` é a cor que cobre o que fica atrás de cada face.
// Com quadros = 1 sai parado (e sem mar, se `mar` for falso).
export function barco(cx, cy, unidade, { cor, fundo, ciclo = 14, quadros = 16, mar = true, giro0 = 0.35, atraso = 0, traco = 1 }) {
  const faces = [], ondas = [];
  for (let q = 0; q < quadros; q++) {
    const u = q / quadros + atraso;
    const sobe = mar ? onda(0, 0, u) + 0.01 : 0;
    const proa = mar ? Math.atan((onda(0.15, 0, u) - onda(-0.15, 0, u)) / 0.3) * 0.9 : 0;
    const lado = mar ? Math.atan((onda(0, 0.15, u) - onda(0, -0.15, u)) / 0.3) * 0.9 : 0;
    const cp = Math.cos(proa), sp = Math.sin(proa), cl = Math.cos(lado), sl = Math.sin(lado);
    const navega = ([x, y, z]) => {
      [x, y] = [x * cp - y * sp, x * sp + y * cp];
      [y, z] = [y * cl - z * sl, y * sl + z * cl];
      return [x, y + sobe, z];
    };
    const giro = giro0 + 0.25 * Math.sin(2 * Math.PI * u), inclina = 0.32;
    const cg = Math.cos(giro), sg = Math.sin(giro), ci = Math.cos(inclina), si = Math.sin(inclina);
    const projeta = ([x, y, z]) => {
      [x, z] = [x * cg + z * sg, -x * sg + z * cg];
      [y, z] = [y * ci - z * si, y * si + z * ci];
      const persp = 3.4 / (3.4 - z);
      return [cx + x * unidade * persp, cy - y * unidade * persp, z];
    };
    BARCO.forEach((original, i) => {
      const tri = original.map(navega), p = tri.map(projeta);
      const a = tri[1].map((v, k) => v - tri[0][k]), b = tri[2].map((v, k) => v - tri[0][k]);
      const n = unit(cruz(a, b));
      const luz = Math.abs(n[0] * LUZ[0] + n[1] * LUZ[1] + n[2] * LUZ[2]);
      const z = (p[0][2] + p[1][2] + p[2][2]) / 3;
      const face = (faces[i] ??= { z, borda: [], listras: [], o: [] });
      // As listras são paralelas ao primeiro lado; a conta fica a do primeiro quadro, para o caminho interpolar.
      face.n ??= Math.max(3, Math.min(22, Math.round(Math.hypot(p[2][0] - p[0][0], p[2][1] - p[0][1]) / 6)));
      let listras = "";
      for (let l = 1; l < face.n; l++) {
        const w = l / face.n;
        listras += `M${f(lerp(p[0][0], p[2][0], w))} ${f(lerp(p[0][1], p[2][1], w))} ${f(lerp(p[1][0], p[2][0], w))} ${f(lerp(p[1][1], p[2][1], w))}`;
      }
      face.borda.push(`${caminho(p)}Z`);
      face.listras.push(listras);
      face.o.push(clamp(0.3 + 0.6 * luz + z * 0.4, 0.22, 1));
    });
    if (mar) {
      for (let l = 0; l < LINHAS_DO_MAR; l++) {
        const z = -0.75 + (1.5 * l) / (LINHAS_DO_MAR - 1), meia = 1.15 - Math.abs(z) * 0.55;
        const pts = [];
        let somaZ = 0;
        for (let x = -meia; x <= meia + 1e-6; x += 0.1) {
          const [px, py, pz] = projeta([x, NIVEL + onda(x, z, u), z]);
          pts.push([px, py]);
          somaZ += pz;
        }
        const linha = (ondas[l] ??= { frente: z >= -0.01, d: [], cobre: [], o: [] });
        linha.d.push(caminho(pts));
        // A água da frente pinta o fundo embaixo dela e cobre a parte do casco que está dentro d'água.
        linha.cobre.push(`${caminho(pts)}L${f(pts.at(-1)[0])} ${f(cy + unidade * 1.2)}L${f(pts[0][0])} ${f(cy + unidade * 1.2)}Z`);
        linha.o.push(clamp(0.55 + somaZ / pts.length, 0.2, 0.9));
      }
    }
  }
  const agua = (frente) => ondas.filter((o) => o.frente === frente).map((o) =>
    (frente ? `<path d="${o.cobre[0]}" fill="${fundo}" stroke="none">${anima("d", o.cobre, ciclo)}</path>` : "")
    + `<path d="${o.d[0]}" stroke-opacity="${opac(o.o[0])}" stroke-width="${traco * 1.1}">${anima("d", o.d, ciclo)}</path>`).join("");
  const casco = [...faces].sort((a, b) => a.z - b.z).map((fc) =>
    `<path d="${fc.borda[0]}" fill="${fundo}" stroke="none">${anima("d", fc.borda, ciclo)}</path>`
    + `<path d="${fc.listras[0]}" stroke-opacity="${opac(fc.o[0] * 0.85)}">${anima("d", fc.listras, ciclo)}</path>`
    + `<path d="${fc.borda[0]}" stroke-opacity="${opac(Math.min(1, fc.o[0] + 0.1))}" stroke-width="${traco * 1.3}">${anima("d", fc.borda, ciclo)}</path>`).join("");
  return `<g fill="none" stroke="${cor}" stroke-width="${traco}" stroke-linecap="round" stroke-linejoin="round">${agua(false)}${casco}${agua(true)}</g>`;
}
