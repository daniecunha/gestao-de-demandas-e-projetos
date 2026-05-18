import { Router } from 'express';
import { query, queryOne } from '../db';

export const meetingsRouter = Router();

const MEETING_FIELDS = [
  'titulo', 'data_hora', 'duracao_min', 'tipo',
  'projeto_ids', 'participantes', 'pauta', 'decisoes',
  'encaminhamentos', 'notas_gerais',
];

const JSONB_FIELDS = new Set(['pauta', 'decisoes', 'encaminhamentos']);
const ARRAY_FIELDS = new Set(['projeto_ids', 'participantes']);

// GET /api/meetings
meetingsRouter.get('/', async (_req, res) => {
  try {
    const rows = await query('SELECT * FROM meetings ORDER BY data_hora DESC');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// GET /api/meetings/proximas
meetingsRouter.get('/proximas', async (_req, res) => {
  try {
    const agora = new Date().toISOString();
    const rows = await query(
      'SELECT * FROM meetings WHERE data_hora >= $1 ORDER BY data_hora ASC LIMIT 5',
      [agora]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// GET /api/meetings/:id
meetingsRouter.get('/:id', async (req, res) => {
  try {
    const row = await queryOne('SELECT * FROM meetings WHERE id = $1', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Não encontrado' });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

function buildCols(body: Record<string, unknown>, fields: string[]) {
  const cols: string[] = [];
  const placeholders: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  for (const f of fields) {
    if (body[f] !== undefined) {
      cols.push(f);
      if (JSONB_FIELDS.has(f)) {
        placeholders.push(`$${i}::jsonb`);
        values.push(JSON.stringify(body[f]));
      } else if (ARRAY_FIELDS.has(f)) {
        placeholders.push(`$${i}::text[]`);
        values.push(body[f]);
      } else {
        placeholders.push(`$${i}`);
        values.push(body[f]);
      }
      i++;
    }
  }
  return { cols, placeholders, values, i };
}

// POST /api/meetings
meetingsRouter.post('/', async (req, res) => {
  const { cols, placeholders, values } = buildCols(req.body, MEETING_FIELDS);
  try {
    const row = await queryOne(
      `INSERT INTO meetings (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
      values
    );
    res.status(201).json(row);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// PATCH /api/meetings/:id
meetingsRouter.patch('/:id', async (req, res) => {
  const updates: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  for (const f of MEETING_FIELDS) {
    if (req.body[f] !== undefined) {
      if (JSONB_FIELDS.has(f)) {
        updates.push(`${f} = $${i}::jsonb`);
        values.push(JSON.stringify(req.body[f]));
      } else if (ARRAY_FIELDS.has(f)) {
        updates.push(`${f} = $${i}::text[]`);
        values.push(req.body[f]);
      } else {
        updates.push(`${f} = $${i}`);
        values.push(req.body[f]);
      }
      i++;
    }
  }
  if (!updates.length) return res.status(400).json({ error: 'Nada para atualizar' });
  values.push(req.params.id);

  try {
    const row = await queryOne(
      `UPDATE meetings SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// DELETE /api/meetings/:id
meetingsRouter.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM meetings WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});
