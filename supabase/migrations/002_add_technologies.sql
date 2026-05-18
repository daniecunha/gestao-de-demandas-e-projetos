-- ============================================================
-- Migração 002 — Tabela de Tecnologias / Plataformas
-- Versão: 002 | Maio 2026
-- ============================================================

-- ============================================================
-- TECNOLOGIAS (plataformas e sistemas)
-- ============================================================
CREATE TABLE IF NOT EXISTS technologies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        VARCHAR(255) NOT NULL,
  descricao   TEXT         NOT NULL DEFAULT '',
  cor         VARCHAR(7)   NOT NULL DEFAULT '#2E75B6',
  icone       VARCHAR(50)  NOT NULL DEFAULT 'cpu',
  criado_em   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Adicionar FK tecnologia_id em projects (nullable para não quebrar dados existentes)
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS tecnologia_id UUID REFERENCES technologies(id) ON DELETE SET NULL;

-- Índice de desempenho
CREATE INDEX IF NOT EXISTS idx_projects_tecnologia_id ON projects(tecnologia_id);

-- RLS
ALTER TABLE technologies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_technologies" ON technologies FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- DADOS INICIAIS — Tecnologias mais comuns
-- ============================================================
INSERT INTO technologies (nome, descricao, cor, icone) VALUES
  ('OutSystems',  'Plataforma low-code OutSystems para desenvolvimento de aplicações',     '#CC0000', 'zap'),
  ('SAP',         'Sistemas e módulos SAP (ERP, BW, HANA, etc.)',                          '#0070F2', 'database'),
  ('RPA',         'Automação robótica de processos (UiPath, Automation Anywhere, etc.)',   '#FF6B00', 'bot'),
  ('IA',          'Inteligência Artificial, Machine Learning e modelos de linguagem',      '#7C3AED', 'brain')
ON CONFLICT DO NOTHING;
