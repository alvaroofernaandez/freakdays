#!/usr/bin/env bash
set -euo pipefail

# Instalador simple y no destructivo de skills globales para OpenCode.
# - No elimina ni sobreescribe archivos del proyecto.
# - Solo intenta registrar skills con `npx skills add`.

if ! command -v npx >/dev/null 2>&1; then
  printf 'Error: npx no está disponible en este entorno.\n' >&2
  exit 1
fi

DRY_RUN="${DRY_RUN:-false}"

install_skill() {
  local repo="$1"
  local skill_name="$2"
  local cmd=(npx skills add "$repo" --skill "$skill_name" --yes --global)

  if [ "$DRY_RUN" = "true" ]; then
    printf '[dry-run] %s\n' "${cmd[*]}"
    return 0
  fi

  printf 'Instalando skill global: %s (%s)\n' "$skill_name" "$repo"
  "${cmd[@]}" || printf 'Aviso: no se pudo instalar %s, continuando...\n' "$skill_name"
}

# Skills globales recomendadas para FreakDays
install_skill "https://github.com/vercel-labs/skills" "find-skills"
install_skill "https://github.com/vercel-labs/agent-skills" "vercel-react-best-practices"
install_skill "https://github.com/vercel-labs/agent-skills" "web-design-guidelines"
install_skill "https://github.com/anthropics/skills" "frontend-design"
install_skill "https://github.com/nextlevelbuilder/ui-ux-pro-max-skill" "ui-ux-pro-max"

printf 'Proceso finalizado. Revisá salida para skills no instaladas.\n'
