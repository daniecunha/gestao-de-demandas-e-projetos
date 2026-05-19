-- 005: Add 'homologacao' task status and task archive support

-- Extend the status check constraint to include homologacao
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks
  ADD CONSTRAINT tasks_status_check
  CHECK (status IN ('a_fazer', 'em_andamento', 'homologacao', 'bloqueado', 'concluido', 'cancelado'));

-- Archive timestamp: set when a completed task is archived, null = active
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS arquivado_em TIMESTAMPTZ DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_arquivado_em ON tasks(arquivado_em);
