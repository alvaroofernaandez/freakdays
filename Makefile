.DEFAULT_GOAL := help

.PHONY: help \
        install approve-builds \
        dev dev-web dev-api dev-down \
        build build-web build-api \
        test test-web test-api test-watch \
        coverage coverage-web coverage-api \
        e2e e2e-install e2e-ui \
        lint lint-fix typecheck \
        format format-check \
        audit audit-fix update-deps \
        clean clean-all \
        ci-local \
        prisma-generate prisma-migrate prisma-studio prisma-deploy \
        changeset changeset-status release release-dry

# Color helpers (internal — not displayed by the help target).
CYAN   := \033[36m
GREEN  := \033[32m
YELLOW := \033[33m
RESET  := \033[0m
BOLD   := \033[1m

help: ## Show available commands grouped by section
	@echo ""
	@echo "$(BOLD)FreakDays Monorepo$(RESET)"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} \
		/^# ── [A-Z]/ {sub(/# ── /,"",$$0); sub(/ ─+$$/,"",$$0); printf "\n$(BOLD)$(YELLOW)%s$(RESET)\n", $$0} \
		/^[a-zA-Z0-9_-]+:.*?## .*$$/ {printf "  $(CYAN)%-22s$(RESET) %s\n", $$1, $$2}' \
		$(MAKEFILE_LIST)
	@echo ""

# ── Install ─────────────────────────────────────────────────────────────────
install: ## Install all dependencies (frozen lockfile via pnpm install)
	pnpm install --frozen-lockfile

approve-builds: ## Approve build scripts (run once after a fresh install)
	pnpm approve-builds

# ── Dev ─────────────────────────────────────────────────────────────────────
dev: ## Start the full stack (API + web, coordinated)
	pnpm dev

dev-web: ## Start the web (Nuxt) dev server only
	pnpm dev:web

dev-api: ## Start the API (NestJS) dev server only
	pnpm dev:api

dev-down: ## Stop local Docker services (PostgreSQL)
	pnpm dev:down

# ── Build ───────────────────────────────────────────────────────────────────
build: ## Build all packages
	pnpm build

build-web: ## Build the web package
	pnpm --filter freak-days build

build-api: ## Build the API package
	pnpm --filter freak-days-api build

# ── Test ────────────────────────────────────────────────────────────────────
test: ## Run all unit tests (web + api)
	pnpm test

test-web: ## Run web unit tests (vitest)
	pnpm --filter freak-days test

test-api: ## Run API unit tests (jest)
	pnpm --filter freak-days-api test

test-watch: ## Run web tests in watch mode
	pnpm --filter freak-days test:watch

# ── Coverage ────────────────────────────────────────────────────────────────
coverage: ## Run coverage for both packages
	pnpm test:coverage

coverage-web: ## Run web coverage (vitest)
	pnpm --filter freak-days test:coverage

coverage-api: ## Run API coverage (jest)
	pnpm --filter freak-days-api test:coverage

# ── E2E (Playwright) ────────────────────────────────────────────────────────
e2e: ## Run Playwright E2E suite (builds web first)
	pnpm --filter freak-days build
	pnpm --filter freak-days e2e

e2e-install: ## Install Playwright browsers + system deps
	pnpm --filter freak-days e2e:install

e2e-ui: ## Open Playwright UI mode for interactive debugging
	pnpm --filter freak-days e2e:ui

# ── Quality ─────────────────────────────────────────────────────────────────
lint: ## Lint all packages (ESLint)
	pnpm lint

lint-fix: ## Lint and auto-fix where possible
	pnpm --filter freak-days lint:fix

typecheck: ## Type-check all packages
	pnpm typecheck

format: ## Format the whole repo (Prettier --write)
	pnpm format

format-check: ## Check formatting without writing (CI uses this)
	pnpm format:check

# ── Security & Dependencies ─────────────────────────────────────────────────
audit: ## Run pnpm audit at moderate level (matches CI)
	pnpm audit --audit-level=moderate

audit-fix: ## Try to auto-fix known vulnerabilities
	pnpm audit --fix

update-deps: ## Interactive dependency update across the workspace
	pnpm update -i -r --latest

# ── Cleanup ─────────────────────────────────────────────────────────────────
clean: ## Remove build outputs and cache directories
	rm -rf packages/*/.output packages/*/.nuxt packages/*/dist packages/*/coverage \
	       packages/*/playwright-report packages/*/test-results

clean-all: clean ## clean + nuke node_modules and lockfile (NUCLEAR — re-runs pnpm install)
	rm -rf node_modules packages/*/node_modules
	pnpm install --frozen-lockfile

# ── CI parity ───────────────────────────────────────────────────────────────
ci-local: install format-check lint typecheck test coverage build ## Run the full CI suite locally (mirrors .github/workflows/ci.yml)

# ── Prisma (API only — web Prisma removed in S6) ────────────────────────────
prisma-generate: ## Regenerate the API Prisma client
	pnpm --filter freak-days-api prisma:generate

prisma-migrate: ## Run API Prisma migrations in dev
	pnpm --filter freak-days-api prisma:migrate:dev

prisma-studio: ## Open Prisma Studio against the API database
	pnpm --filter freak-days-api prisma:studio

prisma-deploy: ## Apply pending migrations to a production database
	pnpm --filter freak-days-api prisma:migrate:deploy

# ── Release (Changesets) ────────────────────────────────────────────────────
changeset: ## Create a new changeset describing the current PR's release impact
	pnpm changeset

changeset-status: ## Show pending changesets and projected version bumps
	pnpm changeset:status

release: ## Apply all pending changesets locally (bumps versions + CHANGELOGs)
	pnpm changeset:version

release-dry: ## Show what would happen on the next release without writing files
	pnpm changeset:status --verbose
