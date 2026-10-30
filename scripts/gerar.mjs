// Gera os cartões SVG do perfil (claro e escuro) com os números ao vivo do GitHub.
// Uso: node scripts/gerar.mjs [--saida pasta] [--dados arquivo.json] [--gravar-dados arquivo.json]
//   --dados desenha a partir de um JSON já coletado, sem rede; sem ele, coleta com $GITHUB_TOKEN ou o token do gh.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { coletar } from "./coletar.mjs";
import { temas } from "./desenho.mjs";
import { mar } from "./mar.mjs";
import { cabecalho, linguagens, ritmo, tripulacao } from "./cartoes.mjs";

const { values: opcoes } = parseArgs({
  options: { saida: { type: "string", default: "saida" }, dados: { type: "string" }, "gravar-dados": { type: "string" } },
});

let dados;
if (opcoes.dados) {
  dados = JSON.parse(readFileSync(opcoes.dados, "utf8"));
} else {
  const token = process.env.GITHUB_TOKEN || execFileSync("gh", ["auth", "token"], { encoding: "utf8" }).trim();
  dados = await coletar(token, process.env.PERFIL_LOGIN || "konecz");
}
if (opcoes["gravar-dados"]) writeFileSync(opcoes["gravar-dados"], JSON.stringify(dados, null, 1));

const cartoes = { cabecalho, mar, linguagens, ritmo, tripulacao };
mkdirSync(opcoes.saida, { recursive: true });
for (const [nome, desenhar] of Object.entries(cartoes)) {
  for (const [tema, t] of Object.entries(temas)) writeFileSync(join(opcoes.saida, `${nome}-${tema}.svg`), desenhar(t, dados));
}
console.log(`cartões gerados em ${opcoes.saida}/ (${dados.geradoEm})`);
