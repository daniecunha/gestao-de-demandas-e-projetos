-- ============================================================
-- Migração 003 — Valor para o Negócio, OKRs e vínculos de Reunião
-- Versão: 003 | Maio 2026
-- ============================================================

-- ─── Projetos: valor, OKRs e reunião de origem ──────────────
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS valor_negocio    TEXT     NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS okrs             TEXT[]   NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS reuniao_origem_id UUID    REFERENCES meetings(id) ON DELETE SET NULL;

-- ─── Tarefas: valor e OKRs ───────────────────────────────────
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS valor_negocio TEXT   NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS okrs          TEXT[] NOT NULL DEFAULT '{}';

-- ─── Índices ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_projects_reuniao_origem ON projects(reuniao_origem_id);
