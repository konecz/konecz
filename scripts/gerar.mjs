// Gera os cartões SVG do perfil (claro e escuro) a partir de dados.json.
// Uso: node scripts/gerar.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const dados = JSON.parse(readFileSync(join(raiz, "scripts/dados.json"), "utf8"));
const fonte = (arq) => readFileSync(join(raiz, "fontes", arq)).toString("base64");
const grotesk = fonte("schibsted-grotesk-latin-wght-normal.woff2");
const mono = fonte("ibm-plex-mono-latin-500-normal.woff2");

// Paleta do site konecz.com na sobriedade do Vigia Pix: um azul de acento, neutros e um bloco escuro.
const temas = {
  claro: {
    fundo: "#f3f5f8", tinta: "#0c0f14", texto: "#3b4250", secundario: "#5d6575",
    linha: "#dbe1ea", trilha: "#e6eaf1", grifo: "#2465ff", grifoSuave: "#c9d8ff",
    bloco: "#0a1c5c", blocoTexto: "#e9eefb", blocoSec: "#9fb2e8", blocoLinha: "#22367a",
  },
  escuro: {
    fundo: "#0d1117", tinta: "#f0f3f6", texto: "#c3cad5", secundario: "#8b94a3",
    linha: "#262d38", trilha: "#1b212b", grifo: "#4d82ff", grifoSuave: "#1c2f63",
    bloco: "#0f2366", blocoTexto: "#e9eefb", blocoSec: "#9fb2e8", blocoLinha: "#2a3f88",
  },
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const num = (n) => n.toLocaleString("pt-BR");

function svg(w, h, t, corpo, extraCss = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">
<style>
@font-face{font-family:G;src:url(data:font/woff2;base64,${grotesk}) format("woff2");font-weight:100 900}
@font-face{font-family:M;src:url(data:font/woff2;base64,${mono}) format("woff2");font-weight:500}
.g{font-family:G,"Schibsted Grotesk",Inter,"Segoe UI",Helvetica,Arial,sans-serif}
.m{font-family:M,"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-weight:500;font-variant-numeric:tabular-nums}
${extraCss}
</style>
<clipPath id="c"><rect width="${w}" height="${h}" rx="16"/></clipPath>
<rect width="${w}" height="${h}" rx="16" fill="${t.fundo}"/>
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="15.5" fill="none" stroke="${t.linha}"/>
${corpo}
</svg>
`;
}

// O barquinho de papel da Konecz (o mesmo desenho do rodapé do Vigia Pix, em grade 24).
function barco(x, y, s, { casco, vela, traco = 1.8 }) {
  const sw = traco / s;
  return `<g transform="translate(${x} ${y}) scale(${s})" stroke-linejoin="round" stroke-linecap="round">
  <path d="M2.5 14.5h19l-3.2 4.5H5.7z" fill="${casco}" stroke="${casco}" stroke-width="${sw}"/>
  <path d="M12 3.5 6 14.5h12z" fill="${vela.fundo}" stroke="${vela.cor}" stroke-width="${sw}"/>
  <path d="M12 3.5v11M12 3.5 9 14.5" fill="none" stroke="${vela.cor}" stroke-width="${sw}"/>
</g>`;
}

function onda(x0, x1, y, amp, per, cor, largura) {
  let d = `M${x0} ${y}`;
  for (let x = x0; x < x1; x += per) {
    d += ` q${per / 4} ${-amp} ${per / 2} 0 t${per / 2} 0`;
  }
  return `<path d="${d}" fill="none" stroke="${cor}" stroke-width="${largura}" stroke-linecap="round"/>`;
}

// Título de seção com o grifo (marca-texto na metade de baixo), como no Vigia Pix.
function titulo(x, y, texto, largura, t, tam = 34) {
  return `<rect x="${x - 4}" y="${y - tam * 0.36}" width="${largura + 8}" height="${tam * 0.46}" fill="${t.grifoSuave}"/>
<text x="${x}" y="${y}" class="g" font-size="${tam}" font-weight="800" fill="${t.tinta}" letter-spacing="-.5">${esc(texto)}</text>`;
}

function cabecalho(t) {
  const W = 1200, H = 400;
  const ondas = [
    onda(640, 1170, 268, 10, 64, t.grifo, 2.5),
    onda(600, 1170, 298, 8, 80, t.linha, 2),
    onda(660, 1170, 326, 6, 96, t.linha, 2),
  ].join("\n");
  const barcos = [
    `<g>${barco(780, 92, 8.4, { casco: t.grifo, vela: { fundo: t.fundo, cor: t.tinta }, traco: 3.2 })}</g>`,
    `<g>${barco(1010, 186, 3.4, { casco: t.tinta, vela: { fundo: t.fundo, cor: t.tinta }, traco: 2.2 })}</g>`,
    `<g>${barco(668, 212, 2.4, { casco: t.secundario, vela: { fundo: t.fundo, cor: t.secundario }, traco: 1.8 })}</g>`,
  ].join("\n");
  // Etiquetas em sequência, cada uma depois da anterior.
  let x = 72;
  const pills = [];
  for (const txt of ["Curitiba/PR", "desde 2026", "tecnologia e IA"]) {
    const w = txt.length * 9.1 + 30;
    pills.push(`<rect x="${x}" y="306" width="${w}" height="36" rx="18" fill="none" stroke="${t.linha}" stroke-width="1.5"/>
<text x="${x + w / 2}" y="329" text-anchor="middle" class="m" font-size="15" fill="${t.texto}">${txt}</text>`);
    x += w + 10;
  }
  const corpo = `
<text x="72" y="84" class="m" font-size="16" fill="${t.secundario}" letter-spacing="2">KONECZ.COM</text>
<rect x="64" y="150" width="452" height="44" fill="${t.grifo}"/>
<text x="70" y="190" class="g" font-size="124" font-weight="800" fill="${t.tinta}" letter-spacing="-5">Konecz</text>
<text x="72" y="246" class="g" font-size="27" font-weight="500" fill="${t.texto}">Influencers criados para empresas,</text>
<text x="72" y="280" class="g" font-size="27" font-weight="500" fill="${t.texto}">e o software que faz isso rodar.</text>
${pills.join("\n")}
<g clip-path="url(#c)">
${ondas}
</g>
${barcos}`;
  return svg(W, H, t, corpo);
}

function linguagens(t) {
  const W = 1200, H = 500;
  const total = Object.values(dados.linguagens).reduce((a, b) => a + b, 0);
  const lista = Object.entries(dados.linguagens).sort((a, b) => b[1] - a[1]);
  const top = lista.slice(0, 6);
  const resto = lista.slice(6).reduce((a, [, v]) => a + v, 0);
  const linhas = [...top, ["outras", resto]];
  const x0 = 72, xBarra = 250, wBarra = 520, y0 = 150, passo = 42;
  const maior = linhas[0][1];
  const barras = linhas.map(([nome, v], i) => {
    const y = y0 + i * passo;
    const pct = (v / total) * 100;
    const w = Math.max(6, (v / maior) * wBarra);
    const cor = i === 0 ? t.grifo : nome === "outras" ? t.secundario : t.tinta;
    return `<text x="${x0}" y="${y + 6}" class="m" font-size="18" fill="${t.tinta}">${nome}</text>
<rect x="${xBarra}" y="${y - 9}" width="${wBarra}" height="18" rx="9" fill="${t.trilha}"/>
<rect x="${xBarra}" y="${y - 9}" width="${w.toFixed(1)}" height="18" rx="9" fill="${cor}"/>
<text x="${xBarra + wBarra + 18}" y="${y + 6}" class="m" font-size="18" fill="${t.texto}">${pct.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</text>`;
  }).join("\n");
  const tiles = [
    [num(dados.commits), "commits"],
    [num(dados.prsIntegrados), "PRs integrados"],
    [String(dados.repositorios), "repositórios"],
  ].map(([n, r], i) => {
    const y = 132 + i * 100;
    return `<line x1="900" y1="${y - 6}" x2="1128" y2="${y - 6}" stroke="${t.linha}" stroke-width="1.5"/>
<text x="900" y="${y + 50}" class="g" font-size="52" font-weight="800" fill="${t.tinta}" letter-spacing="-1.5" style="font-variant-numeric:tabular-nums">${n}</text>
<text x="900" y="${y + 78}" class="m" font-size="15" fill="${t.secundario}">${r}</text>`;
  }).join("\n");
  const corpo = `
${titulo(72, 92, "Linguagens", 186, t)}
${barras}
${tiles}
<text x="72" y="${H - 40}" class="m" font-size="13" fill="${t.secundario}">fonte: GitHub, bytes de código nos ${dados.repositorios} repositórios da konecz, ${dados.referencia}</text>`;
  return svg(W, H, t, corpo);
}

function openSource(t) {
  const W = 1200, H = 430;
  const n = dados.openSource.length, wCard = 330, gap = 45, x0 = 72, yCard = 172, hCard = 178;
  const yTrilho = yCard - 34;
  const passos = dados.openSource.map((p, i) => {
    const x = x0 + i * (wCard + gap);
    const cx = x + 24;
    const tracejado = p.pendente ? ` stroke-dasharray="7 6"` : "";
    const cor = p.pendente ? t.secundario : t.tinta;
    const marcador = p.pendente
      ? `<circle cx="${cx}" cy="${yTrilho}" r="15" fill="${t.fundo}" stroke="${t.secundario}" stroke-width="2"${tracejado}/>`
      : `<circle cx="${cx}" cy="${yTrilho}" r="15" fill="${t.grifo}"/>`;
    const wPill = p.estado.length * 8.6 + 26;
    return `<g>
${marcador}
<text x="${cx}" y="${yTrilho + 5}" text-anchor="middle" class="m" font-size="14" fill="${p.pendente ? t.secundario : "#fff"}">${i + 1}</text>
<rect x="${x}" y="${yCard}" width="${wCard}" height="${hCard}" rx="14" fill="none" stroke="${p.pendente ? t.secundario : t.linha}" stroke-width="1.5"${tracejado}/>
<text x="${x + 24}" y="${yCard + 36}" class="m" font-size="13" fill="${t.secundario}" letter-spacing="1">${p.tipo.toUpperCase()}</text>
<text x="${x + 24}" y="${yCard + 72}" class="g" font-size="27" font-weight="800" fill="${cor}" letter-spacing="-.4">${esc(p.titulo)}</text>
<text x="${x + 24}" y="${yCard + 100}" class="g" font-size="16" fill="${t.texto}">${esc(p.detalhe)}</text>
<rect x="${x + 24}" y="${yCard + 120}" width="${wPill}" height="30" rx="15" fill="none" stroke="${p.pendente ? t.secundario : t.grifo}" stroke-width="1.5"${tracejado}/>
<text x="${x + 24 + wPill / 2}" y="${yCard + 140}" text-anchor="middle" class="m" font-size="14" fill="${p.pendente ? t.secundario : t.grifo}">${esc(p.estado)}</text>
</g>`;
  }).join("\n");
  const xFim = x0 + (n - 1) * (wCard + gap) + 24;
  const xMeio = x0 + (n - 2) * (wCard + gap) + 24;
  const corpo = `
${titulo(72, 92, "Open source", 206, t)}
<text x="306" y="92" class="m" font-size="16" fill="${t.secundario}">okfn-brasil/querido-diario-api</text>
<line x1="${x0 + 24}" y1="${yTrilho}" x2="${xMeio}" y2="${yTrilho}" stroke="${t.grifo}" stroke-width="3"/>
<line x1="${xMeio}" y1="${yTrilho}" x2="${xFim}" y2="${yTrilho}" stroke="${t.secundario}" stroke-width="2" stroke-dasharray="7 6"/>
${passos}
<text x="72" y="${H - 34}" class="m" font-size="13" fill="${t.secundario}">Querido Diário, da Open Knowledge Brasil: diários oficiais dos municípios abertos para todo mundo</text>`;
  return svg(W, H, t, corpo);
}

function equipe(t) {
  const W = 1200, H = 450;
  const pessoas = dados.equipe.map((p, i) => {
    const y = 160 + i * 110;
    const fundo = i === 0 ? t.grifo : t.tinta;
    const letra = i === 0 ? "#fff" : t.fundo;
    return `<g>
<circle cx="112" cy="${y}" r="40" fill="${fundo}"/>
<text x="112" y="${y + 10}" text-anchor="middle" class="g" font-size="28" font-weight="800" fill="${letra}">${p.iniciais}</text>
<text x="172" y="${y - 2}" class="g" font-size="30" font-weight="800" fill="${t.tinta}" letter-spacing="-.4">${esc(p.nome)}</text>
<text x="173" y="${y + 26}" class="m" font-size="15" fill="${t.secundario}">${esc(p.papel)}</text>
</g>`;
  }).join("\n");
  const bx = 500, by = 48, bw = 652, bh = H - 96;
  const campos = dados.empresa.map(([k, v], i) => {
    const y = by + 104 + i * 46;
    return `<text x="${bx + 36}" y="${y}" class="m" font-size="13" fill="${t.blocoSec}" letter-spacing="1">${esc(k.toUpperCase())}</text>
<text x="${bx + 176}" y="${y}" class="${k === "CNPJ" ? "m" : "g"}" font-size="${k === "CNPJ" ? 19 : 18}" font-weight="${k === "CNPJ" ? 500 : 600}" fill="${t.blocoTexto}">${esc(v)}</text>`;
  }).join("\n");
  const corpo = `
${titulo(72, 92, "Quem toca", 170, t)}
${pessoas}
<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="16" fill="${t.bloco}"/>
${barco(bx + bw - 76, by + 22, 2, { casco: "#7ea2ff", vela: { fundo: t.bloco, cor: t.blocoTexto }, traco: 1.6 })}
<text x="${bx + 36}" y="${by + 52}" class="g" font-size="22" font-weight="800" fill="#fff">A empresa</text>
<line x1="${bx + 36}" y1="${by + 70}" x2="${bx + bw - 36}" y2="${by + 70}" stroke="${t.blocoLinha}" stroke-width="1.5"/>
${campos}`;
  return svg(W, H, t, corpo);
}

const cartoes = { cabecalho, linguagens, "open-source": openSource, equipe };
for (const [nome, f] of Object.entries(cartoes)) {
  for (const [tema, t] of Object.entries(temas)) {
    writeFileSync(join(raiz, "assets", `${nome}-${tema}.svg`), f(t));
  }
}
console.log("cartões gerados em assets/");
