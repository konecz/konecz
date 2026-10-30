// Peças comuns dos cartões: temas, moldura do SVG, fontes e ícones embutidos, barquinho e formatação.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const fonte = (arq) => readFileSync(join(raiz, "fontes", arq)).toString("base64");
const FONTES = `@font-face{font-family:G;src:url(data:font/woff2;base64,${fonte("schibsted-grotesk-latin-wght-normal.woff2")}) format("woff2");font-weight:100 900}
@font-face{font-family:M;src:url(data:font/woff2;base64,${fonte("ibm-plex-mono-latin-500-normal.woff2")}) format("woff2");font-weight:500}`;
const ICONES = JSON.parse(readFileSync(join(raiz, "icones/icones.json"), "utf8"));

export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export const num = (n) => n.toLocaleString("pt-BR");
export const f = (n) => Math.round(n * 10) / 10;

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
export const mesCurto = (dia) => MESES[Number(dia.slice(5, 7)) - 1];

// Mistura duas cores #rrggbb (p = 0 fica a primeira, p = 1 a segunda).
export function misturar(a, b, p) {
  const c = (h, i) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  return `#${[0, 1, 2].map((i) => Math.round(c(a, i) + (c(b, i) - c(a, i)) * p).toString(16).padStart(2, "0")).join("")}`;
}

// O azul do konecz.com de ponta a ponta (docs/design.md do site): fundo azul cheio, desenho e texto em branco,
// detalhes em azul-claro, sem cor de estado. No tema escuro do GitHub o azul desce um tom, como no site.
const azul = (fundo, cartao, barra) => ({
  fundo, borda: barra, tinta: "#ffffff", texto: "#ffffff", sec: "#d6e2ff", fraco: "#7f9ff2",
  cartao, trilha: barra, azul: "#ffffff", azulClaro: "#d6e2ff", papel: "#ffffff", escuro: "#0b1a4d",
  // O mar vai do azul do cartão (nível 0) ao branco (a crista).
  mar: [cartao, misturar(cartao, "#ffffff", 0.25), misturar(cartao, "#ffffff", 0.5), misturar(cartao, "#ffffff", 0.75), "#ffffff"],
  sombra: "#0b1a4d", barcoLinha: fundo, laje: misturar(fundo, "#0b1a4d", 0.3), lajeLado: misturar(fundo, "#0b1a4d", 0.45),
  lajeTexto: "#d6e2ff",
});
export const temas = { claro: azul("#1f56e0", "#2f63e6", "#4a78ee"), escuro: azul("#1748c4", "#2457d2", "#3c6ae0") };

export function svg(w, h, t, corpo, css = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">
<style>
${FONTES}
.g{font-family:G,"Schibsted Grotesk",Inter,"Segoe UI",Helvetica,Arial,sans-serif}
.m{font-family:M,"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-weight:500;font-variant-numeric:tabular-nums}
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

// Ícone do Octicons (grade 24) com o canto de cima à esquerda em (x, y).
export function icone(nome, x, y, tam, cor, extra = "") {
  return `<path transform="translate(${f(x)} ${f(y)}) scale(${Math.round((tam / 24) * 1000) / 1000})" d="${ICONES.octicons[nome]}" fill="${cor}"${extra}/>`;
}

// Linguagem do GitHub → logo oficial (Simple Icons). Só o logo da própria linguagem (ou da casa dela, como Go Template e
// PLpgSQL); logo de framework, editor, empresa ou plataforma não vale: sem logo, a bolha mostra o nome escrito.
const LOGOS = {
  PHP: "php", TypeScript: "typescript", JavaScript: "javascript", Elixir: "elixir", Go: "go", "Go Template": "go",
  CSS: "css", Python: "python", HTML: "html5", PLpgSQL: "postgresql", Shell: "gnubash", Dockerfile: "docker",
  "C#": "csharp", // desenho próprio em icones.json: o Simple Icons não tem o logo do C#
  // Biblioteca pronta: linguagens comuns do GitHub (nome do Linguist) → logo, para aparecerem sozinhas quando surgirem.
  Kotlin: "kotlin", Scala: "scala", Groovy: "apachegroovy", Clojure: "clojure", Rust: "rust",
  C: "c", "C++": "cplusplus", Zig: "zig", Nim: "nim", D: "d", V: "v", Odin: "odin", Ada: "ada", Fortran: "fortran",
  "F#": "fsharp", Ruby: "ruby",
  "Jupyter Notebook": "jupyter", R: "r", Julia: "julia", Perl: "perl", Lua: "lua", Luau: "luau",
  Mathematica: "wolframmathematica", Haxe: "haxe", Swift: "swift", Dart: "dart", Haskell: "haskell", OCaml: "ocaml",
  Elm: "elm", PureScript: "purescript", Erlang: "erlang", Gleam: "gleam", Crystal: "crystal", Racket: "racket",
  "Common Lisp": "commonlisp", Reason: "reason", ReScript: "rescript",
  Solidity: "solidity", WebAssembly: "webassembly", CoffeeScript: "coffeescript", Vue: "vuedotjs", Svelte: "svelte",
  Astro: "astro", SCSS: "sass", Sass: "sass", Less: "less", Stylus: "stylus", Pug: "pug", EJS: "ejs", Jinja: "jinja",
  MDX: "mdx", Markdown: "markdown", TeX: "latex", Nix: "nixos",
  CMake: "cmake", Nginx: "nginx", Puppet: "puppet", Nushell: "nushell",
  fish: "fishshell", GraphQL: "graphql", Prisma: "prisma", YAML: "yaml", TOML: "toml", JSON: "json",
  OpenSCAD: "openscad", GLSL: "opengl", LLVM: "llvm",
  Vala: "vala",
};
export const logoDa = (linguagem) => (LOGOS[linguagem] ? { slug: LOGOS[linguagem], ...ICONES.logos[LOGOS[linguagem]] } : null);

// A fita da Konecz (a logo, laço em 8 de listras finas), o desenho parado da abertura do site (public/fita/fita-0.svg).
const fitaSvg = readFileSync(join(raiz, "icones/fita.svg"), "utf8");
export const FITA = {
  caixa: fitaSvg.match(/viewBox="([^"]+)"/)[1].split(" ").map(Number),
  d: [...fitaSvg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]).join(""),
};

// O barquinho de papel da Konecz, em grade 24 (o mesmo desenho do site e do Vigia Pix).
export function barco(x, y, s, { casco, vela, linha, traco = 1.8 }) {
  const sw = f(traco / s * 100) / 100;
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${s})" stroke-linejoin="round" stroke-linecap="round">
<path d="M2.5 14.5h19l-3.2 4.5H5.7z" fill="${casco}" stroke="${casco}" stroke-width="${sw}"/>
<path d="M12 3.5 6 14.5h12z" fill="${vela}" stroke="${linha}" stroke-width="${sw}"/>
<path d="M12 3.5v11M12 3.5 9 14.5" fill="none" stroke="${linha}" stroke-width="${sw}"/>
</g>`;
}
