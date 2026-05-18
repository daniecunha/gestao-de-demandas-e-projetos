import { Router } from 'express';
import { query, queryOne } from '../db';

export const reportsRouter = Router();

const REPORT_FIELDS = [
  'periodo_ref', 'data_inicio', 'data_fim',
  'projetos_snapshot', 'destaques', 'riscos', 'proximos_passos',
];
const JSONB_FIELDS = new Set(['projetos_snapshot']);
const ARRAY_FIELDS = new Set(['destaques', 'riscos', 'proximos_passos']);

// GET /api/reports
reportsRouter.get('/', async (_req, res) => {
  try {
    const rows = await query('SELECT * FROM reports ORDER BY gerado_em DESC');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// GET /api/reports/:id
reportsRouter.get('/:id', async (req, res) => {
  try {
    const row = await queryOne('SELECT * FROM reports WHERE id = $1', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Não encontrado' });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// POST /api/reports
reportsRouter.post('/', async (req, res) => {
  const cols: string[] = [];
  const placeholders: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  for (const f of REPORT_FIELDS) {
    if (req.body[f] !== undefined) {
      cols.push(f);
      if (JSONB_FIELDS.has(f)) {
        placeholders.push(`$${i}::jsonb`);
        values.push(JSON.stringify(req.body[f]));
      } else if (ARRAY_FIELDS.has(f)) {
        placeholders.push(`$${i}::text[]`);
        values.push(req.body[f]);
      } else {
        placeholders.push(`$${i}`);
        values.push(req.body[f]);
      }
      i++;
    }
  }

  try {
    const row = await queryOne(
      `INSERT INTO reports (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
      values
    );
    res.status(201).json(row);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// PATCH /api/reports/:id
reportsRouter.patch('/:id', async (req, res) => {
  const updatableFields = [...REPORT_FIELDS, 'exportado_em'];
  const updates: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  for (const f of updatableFields) {
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
      `UPDATE reports SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// POST /api/reports/:id/exportar — marca timestamp de exportação
reportsRouter.post('/:id/exportar', async (req, res) => {
  try {
    const row = await queryOne(
      'UPDATE reports SET exportado_em = NOW() WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// DELETE /api/reports/:id
reportsRouter.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM reports WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});
