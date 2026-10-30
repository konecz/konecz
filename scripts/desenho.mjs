// Peças comuns dos cartões: temas, moldura do SVG, fontes e ícones embutidos e formatação.
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

// As cores do próprio GitHub (o cartão some no README) com o azul do konecz.com de acento, como as linhas brancas
// sobre o azul no site: desenho em linhas finas azuis, texto nos neutros do GitHub, sem cor de estado nem gradiente.
const tema = (fundo, cartao, trilha, borda, tinta, sec, fraco, azul, azulClaro) => ({
  fundo, cartao, trilha, borda, tinta, texto: tinta, sec, fraco, azul, azulClaro,
  // O mar vai do cinza do GitHub (nível 0) ao azul cheio (a crista).
  mar: [trilha, misturar(trilha, azul, 0.3), misturar(trilha, azul, 0.55), misturar(trilha, azul, 0.78), azul],
  sombra: misturar(fundo, "#000000", 0.6), laje: azul, lajeLado: misturar(azul, "#000000", 0.3), lajeTexto: "#ffffff",
});
export const temas = {
  claro: tema("#ffffff", "#f6f8fa", "#eff2f5", "#d1d9e0", "#1f2328", "#59636e", "#818b98", "#1f56e0", "#7ea2ff"),
  escuro: tema("#0d1117", "#151b23", "#212830", "#3d444d", "#f0f6fc", "#9198a1", "#656c76", "#4d82ff", "#8fb0ff"),
};

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
