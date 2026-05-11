import { existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const cwd = process.cwd();
const eslintConfigCandidates = [
  "eslint.config.js",
  "eslint.config.mjs",
  "eslint.config.cjs",
  ".eslintrc",
  ".eslintrc.js",
  ".eslintrc.cjs",
  ".eslintrc.json",
  ".eslintrc.yaml",
  ".eslintrc.yml",
];

const hasEslintConfig = eslintConfigCandidates.some((file) =>
  existsSync(join(cwd, file))
);

if (!hasEslintConfig) {
  console.log(
    "[lint] No se detectó configuración de ESLint. Script no destructivo: se omite lint por ahora."
  );
  process.exit(0);
}

const pnpmCmd = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const result = spawnSync(pnpmCmd, ["exec", "eslint", "."], {
  stdio: "inherit",
});

process.exit(result.status ?? 1);
