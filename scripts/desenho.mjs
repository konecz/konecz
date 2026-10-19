// Peças comuns dos cartões: temas, moldura do SVG, fontes e ícones embutidos, barquinho e formatação.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { FUSO } from "./coletar.mjs";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const fonte = (arq) => readFileSync(join(raiz, "fontes", arq)).toString("base64");
const FONTES = `@font-face{font-family:G;src:url(data:font/woff2;base64,${fonte("schibsted-grotesk-latin-wght-normal.woff2")}) format("woff2");font-weight:100 900}
@font-face{font-family:M;src:url(data:font/woff2;base64,${fonte("ibm-plex-mono-latin-500-normal.woff2")}) format("woff2");font-weight:500}`;
const ICONES = JSON.parse(readFileSync(join(raiz, "icones/icones.json"), "utf8"));

// Azul da Konecz sobre neutros; o mar vai da água parada (nível 0) à crista (nível 4).
export const temas = {
  claro: {
    fundo: "#f6f8fb", borda: "#dde3ec", tinta: "#0b1220", texto: "#3a4356", sec: "#687387", fraco: "#a3acbb",
    trilha: "#e6eaf1", azul: "#2465ff", azulClaro: "#7ea2ff", papel: "#ffffff",
    mar: ["#d9e4f8", "#b0c6fa", "#7d9ffc", "#4a7bfe", "#2465ff"], sombra: "#0a1c5c", barcoLinha: "#0b1220",
    laje: ["#2f5ff0", "#0a1c5c"], lajeLado: ["#1d46c9", "#071341"], lajeTexto: "#dbe5ff",
  },
  escuro: {
    fundo: "#0d1117", borda: "#262d38", tinta: "#f0f3f6", texto: "#c3cad5", sec: "#8b94a3", fraco: "#4f5868",
    trilha: "#1b212b", azul: "#4d82ff", azulClaro: "#8fb0ff", papel: "#e9eefb",
    mar: ["#16243f", "#1c3874", "#2754bd", "#3d70f6", "#9ab8ff"], sombra: "#03060c", barcoLinha: "#0d1117",
    laje: ["#1b3c9e", "#0a1640"], lajeLado: ["#132e80", "#060d2a"], lajeTexto: "#b7c8f5",
  },
};

export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export const num = (n) => n.toLocaleString("pt-BR");
export const f = (n) => Math.round(n * 10) / 10;

export const dataHora = (iso) => new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO, day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
}).format(new Date(iso)).replace(",", "");
export const diaMes = (iso) => new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, day: "2-digit", month: "2-digit" }).format(new Date(iso));
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
export const mesCurto = (dia) => MESES[Number(dia.slice(5, 7)) - 1];

// Mistura duas cores #rrggbb (p = 0 fica a primeira, p = 1 a segunda).
export function misturar(a, b, p) {
  const c = (h, i) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  return `#${[0, 1, 2].map((i) => Math.round(c(a, i) + (c(b, i) - c(a, i)) * p).toString(16).padStart(2, "0")).join("")}`;
}

export function svg(w, h, t, corpo, css = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">
<style>
${FONTES}
.g{font-family:G,"Schibsted Grotesk",Inter,"Segoe UI",Helvetica,Arial,sans-serif}
.m{font-family:M,"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-weight:500;font-variant-numeric:tabular-nums}
.r{font-family:M,"IBM Plex Mono",ui-monospace,monospace;font-weight:500;font-size:15px;letter-spacing:1.8px;fill:${t.sec}}
.vivo{animation:vivo 2.4s ease-in-out infinite}
@keyframes vivo{0%,100%{opacity:1}50%{opacity:.25}}
${css}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
<rect width="${w}" height="${h}" rx="16" fill="${t.fundo}"/>
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="15.5" fill="none" stroke="${t.borda}"/>
${corpo}
</svg>
`;
}

// Rótulo de seção: caixa-alta em mono, espaçado, como numa carta náutica.
export const rotulo = (x, y, texto, extra = "") => `<text x="${x}" y="${y}" class="r"${extra}>${esc(texto.toUpperCase())}</text>`;

// Ponto "ao vivo" pulsando, com a hora da última coleta.
export function aoVivo(x, y, iso, t, ancora = "start") {
  const texto = `ao vivo · ${dataHora(iso)}`;
  const largura = texto.length * 9 + 20;
  const x0 = ancora === "end" ? x - largura : x;
  return `<circle class="vivo" cx="${x0 + 5}" cy="${y - 5}" r="5" fill="${t.azul}"/>
<text x="${x0 + 20}" y="${y}" class="m" font-size="15" fill="${t.sec}">${esc(texto)}</text>`;
}

// Ícone do Octicons (grade 24) com o canto de cima à esquerda em (x, y).
export function icone(nome, x, y, tam, cor, extra = "") {
  return `<path transform="translate(${f(x)} ${f(y)}) scale(${Math.round((tam / 24) * 1000) / 1000})" d="${ICONES.octicons[nome]}" fill="${cor}"${extra}/>`;
}

// Linguagem do GitHub → logo oficial (Simple Icons). Linguagens irmãs dividem o logo, como Go e Go Template.
const LOGOS = {
  PHP: "php", TypeScript: "typescript", JavaScript: "javascript", Elixir: "elixir", Go: "go", "Go Template": "go",
  CSS: "css", Python: "python", HTML: "html5", PLpgSQL: "postgresql", Shell: "gnubash", Blade: "laravel", Dockerfile: "docker",
};
export const logoDa = (linguagem) => (LOGOS[linguagem] ? { slug: LOGOS[linguagem], ...ICONES.logos[LOGOS[linguagem]] } : null);

// O barquinho de papel da Konecz, em grade 24 (o mesmo desenho do site e do Vigia Pix).
export function barco(x, y, s, { casco, vela, linha, traco = 1.8 }) {
  const sw = f(traco / s * 100) / 100;
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${s})" stroke-linejoin="round" stroke-linecap="round">
<path d="M2.5 14.5h19l-3.2 4.5H5.7z" fill="${casco}" stroke="${casco}" stroke-width="${sw}"/>
<path d="M12 3.5 6 14.5h12z" fill="${vela}" stroke="${linha}" stroke-width="${sw}"/>
<path d="M12 3.5v11M12 3.5 9 14.5" fill="none" stroke="${linha}" stroke-width="${sw}"/>
</g>`;
}
