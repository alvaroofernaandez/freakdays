.DEFAULT_GOAL := help

.PHONY: help install dev dev-web dev-api dev-down \
        build build-web build-api \
        test test-web test-api test-watch test-coverage \
        lint typecheck \
        prisma-generate-web prisma-generate-api prisma-migrate-web prisma-migrate-api \
        prisma-studio-web prisma-studio-api \
        approve-builds

# ── Colors ──────────────────────────────────────────────────────────────────
CYAN  := \033[36m
RESET := \033[0m
BOLD  := \033[1m

help: ## Show available commands
	@echo ""
	@echo "$(BOLD)FreakDays Monorepo$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-26s$(RESET) %s\n", $$1, $$2}'
	@echo ""

# ── Install ──────────────────────────────────────────────────────────────────
install: ## Install all dependencies (monorepo)
	pnpm install

approve-builds: ## Approve build scripts for Prisma + NestJS (run once after install)
	pnpm approve-builds

# ── Dev ───────────────────────────────────────────────────────────────────────
dev: ## Start full stack (API + frontend, coordinated)
	pnpm dev

dev-web: ## Start frontend only (Nuxt)
	pnpm dev:web

dev-api: ## Start backend only (NestJS)
	pnpm dev:api

dev-down: ## Stop local Docker services (PostgreSQL)
	pnpm dev:down

# ── Build ─────────────────────────────────────────────────────────────────────
build: ## Build all packages
	pnpm build

build-web: ## Build frontend (Nuxt)
	pnpm --filter freak-days build

build-api: ## Build backend (NestJS)
	pnpm --filter freak-days-api build

# ── Test ──────────────────────────────────────────────────────────────────────
test: ## Run all tests
	pnpm test

test-web: ## Run frontend tests (Vitest)
	pnpm --filter freak-days test

test-api: ## Run backend tests (Jest)
	pnpm --filter freak-days-api test

test-watch: ## Run frontend tests in watch mode
	pnpm --filter freak-days test:watch

test-coverage: ## Run frontend tests with coverage report
	pnpm --filter freak-days test:coverage

# ── Quality ───────────────────────────────────────────────────────────────────
lint: ## Lint all packages
	pnpm lint

typecheck: ## Type-check frontend (Nuxt + TypeScript)
	pnpm typecheck

# ── Prisma — Web (Supabase) ───────────────────────────────────────────────────
prisma-generate-web: ## Generate Prisma client for frontend
	pnpm --filter freak-days prisma:generate

prisma-migrate-web: ## Run Prisma migrations for frontend DB
	pnpm --filter freak-days prisma:migrate

prisma-studio-web: ## Open Prisma Studio for frontend DB
	pnpm --filter freak-days prisma:studio

# ── Prisma — API (PostgreSQL) ─────────────────────────────────────────────────
prisma-generate-api: ## Generate Prisma client for backend
	pnpm --filter freak-days-api prisma:generate

prisma-migrate-api: ## Run Prisma migrations for backend DB
	pnpm --filter freak-days-api prisma:migrate:dev

prisma-studio-api: ## Open Prisma Studio for backend DB
	pnpm --filter freak-days-api prisma:studio
