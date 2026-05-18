import { Router } from 'express';
import { query, queryOne } from '../db';

export const tasksRouter = Router();

const TASK_FIELDS = [
  'titulo', 'projeto_id', 'prioridade', 'status',
  'prazo', 'notas', 'subtarefas', 'reuniao_id',
  'valor_negocio', 'okrs',
];

// GET /api/tasks?projeto_id=...
tasksRouter.get('/', async (req, res) => {
  try {
    if (req.query.projeto_id) {
      const rows = await query(
        'SELECT * FROM tasks WHERE projeto_id = $1 ORDER BY criado_em DESC',
        [req.query.projeto_id]
      );
      return res.json(rows);
    }
    const rows = await query('SELECT * FROM tasks ORDER BY criado_em DESC');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// GET /api/tasks/hoje — tarefas com prazo <= hoje e não concluídas
tasksRouter.get('/hoje', async (_req, res) => {
  try {
    const hoje = new Date().toISOString().split('T')[0];
    const rows = await query(
      `SELECT * FROM tasks
       WHERE prazo <= $1
         AND status NOT IN ('concluido','cancelado')
       ORDER BY prioridade ASC`,
      [hoje]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// GET /api/tasks/:id
tasksRouter.get('/:id', async (req, res) => {
  try {
    const row = await queryOne('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Não encontrado' });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// POST /api/tasks
tasksRouter.post('/', async (req, res) => {
  const cols: string[] = [];
  const placeholders: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  for (const f of TASK_FIELDS) {
    if (req.body[f] !== undefined) {
      cols.push(f);
      if (f === 'subtarefas') {
        placeholders.push(`$${i}::jsonb`);
      } else if (f === 'okrs') {
        placeholders.push(`$${i}::text[]`);
      } else {
        placeholders.push(`$${i}`);
      }
      values.push(f === 'subtarefas' ? JSON.stringify(req.body[f]) : req.body[f]);
      i++;
    }
  }

  try {
    const row = await queryOne(
      `INSERT INTO tasks (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
      values
    );
    res.status(201).json(row);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// PATCH /api/tasks/:id
tasksRouter.patch('/:id', async (req, res) => {
  const allFields = [...TASK_FIELDS, 'concluido_em'];
  const updates: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  // Status → auto-set concluido_em
  if (req.body.status === 'concluido' && req.body.concluido_em === undefined) {
    req.body.concluido_em = new Date().toISOString();
  } else if (req.body.status && req.body.status !== 'concluido') {
    req.body.concluido_em = null;
  }

  for (const f of allFields) {
    if (req.body[f] !== undefined) {
      if (f === 'subtarefas') {
        updates.push(`${f} = $${i}::jsonb`);
        values.push(JSON.stringify(req.body[f]));
      } else if (f === 'okrs') {
        updates.push(`${f} = $${i}::text[]`);
        values.push(req.body[f]);
      } else {
        updates.push(`${f} = $${i}`);
        values.push(req.body[f] === null ? null : req.body[f]);
      }
      i++;
    }
  }
  if (!updates.length) return res.status(400).json({ error: 'Nada para atualizar' });
  values.push(req.params.id);

  try {
    const row = await queryOne(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// DELETE /api/tasks/:id
tasksRouter.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});
