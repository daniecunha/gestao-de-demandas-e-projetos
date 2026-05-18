-- ============================================================
-- Schema Inicial — Sistema de Gestão de Demandas e Projetos
-- Versão: 001 | Maio 2026
-- ============================================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROJETOS
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          VARCHAR(255)  NOT NULL,
  descricao     TEXT          NOT NULL DEFAULT '',
  status        VARCHAR(20)   NOT NULL DEFAULT 'planejamento'
                  CHECK (status IN ('planejamento','em_execucao','aguardando','concluido','pausado')),
  tecnologias   TEXT[]        NOT NULL DEFAULT '{}',
  parceiro      VARCHAR(255)  NOT NULL DEFAULT '',
  cor           VARCHAR(7)    NOT NULL DEFAULT '#2E75B6',
  data_inicio   DATE,
  data_previsao DATE,
  contexto      TEXT          NOT NULL DEFAULT '',
  criado_em     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- REUNIÕES (declarada antes de tasks por FK)
-- ============================================================
CREATE TABLE IF NOT EXISTS meetings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo         VARCHAR(500)  NOT NULL,
  data_hora      TIMESTAMPTZ   NOT NULL,
  duracao_min    INTEGER       NOT NULL DEFAULT 60,
  tipo           VARCHAR(25)   NOT NULL DEFAULT 'interna'
                   CHECK (tipo IN ('alinhamento_gestor','fornecedor','interna','tecnica','outro')),
  projeto_ids    UUID[]        NOT NULL DEFAULT '{}',
  participantes  TEXT[]        NOT NULL DEFAULT '{}',
  pauta          JSONB         NOT NULL DEFAULT '[]',
  decisoes       JSONB         NOT NULL DEFAULT '[]',
  encaminhamentos JSONB        NOT NULL DEFAULT '[]',
  notas_gerais   TEXT          NOT NULL DEFAULT '',
  criado_em      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TAREFAS
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo       VARCHAR(500) NOT NULL,
  projeto_id   UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  prioridade   VARCHAR(10)  NOT NULL DEFAULT 'media'
                 CHECK (prioridade IN ('critica','alta','media','baixa')),
  status       VARCHAR(20)  NOT NULL DEFAULT 'a_fazer'
                 CHECK (status IN ('a_fazer','em_andamento','bloqueado','concluido','cancelado')),
  prazo        DATE,
  notas        TEXT         NOT NULL DEFAULT '',
  subtarefas   JSONB        NOT NULL DEFAULT '[]',
  reuniao_id   UUID         REFERENCES meetings(id) ON DELETE SET NULL,
  criado_em    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  concluido_em TIMESTAMPTZ
);

-- ============================================================
-- RELATÓRIOS EXECUTIVOS
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  periodo_ref         VARCHAR(50)   NOT NULL,
  data_inicio         DATE          NOT NULL,
  data_fim            DATE          NOT NULL,
  projetos_snapshot   JSONB         NOT NULL DEFAULT '[]',
  destaques           TEXT[]        NOT NULL DEFAULT '{}',
  riscos              TEXT[]        NOT NULL DEFAULT '{}',
  proximos_passos     TEXT[]        NOT NULL DEFAULT '{}',
  gerado_em           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  exportado_em        TIMESTAMPTZ
);

-- ============================================================
-- TRIGGER — atualizar atualizado_em em projects
-- ============================================================
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_projects_atualizado_em ON projects;
CREATE TRIGGER trg_projects_atualizado_em
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_atualizado_em();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — habilitar para uso pessoal
-- ============================================================
ALTER TABLE projects  ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports   ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para o anon key (uso pessoal sem auth)
CREATE POLICY "allow_all_projects"  ON projects  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_tasks"     ON tasks     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_meetings"  ON meetings  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_reports"   ON reports   FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- ÍNDICES DE DESEMPENHO
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tasks_projeto_id   ON tasks(projeto_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status        ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_prioridade    ON tasks(prioridade);
CREATE INDEX IF NOT EXISTS idx_tasks_prazo         ON tasks(prazo);
CREATE INDEX IF NOT EXISTS idx_meetings_data_hora  ON meetings(data_hora);
CREATE INDEX IF NOT EXISTS idx_projects_status     ON projects(status);
