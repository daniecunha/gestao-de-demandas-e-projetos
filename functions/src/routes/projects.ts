import { Router } from 'express';
import { query, queryOne } from '../db';

export const projectsRouter = Router();

const PROJECT_FIELDS = [
  'nome', 'descricao', 'status', 'tecnologia_id', 'reuniao_origem_id',
  'tecnologias', 'parceiro', 'cor', 'data_inicio', 'data_previsao',
  'contexto', 'valor_negocio', 'okrs',
];

// GET /api/projects
projectsRouter.get('/', async (_req, res) => {
  try {
    const rows = await query('SELECT * FROM projects ORDER BY criado_em DESC');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// GET /api/projects/:id
projectsRouter.get('/:id', async (req, res) => {
  try {
    const row = await queryOne('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Não encontrado' });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// POST /api/projects
projectsRouter.post('/', async (req, res) => {
  const cols: string[] = [];
  const placeholders: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  for (const f of PROJECT_FIELDS) {
    if (req.body[f] !== undefined) {
      cols.push(f);
      // Arrays PostgreSQL precisam de cast
      if (f === 'tecnologias' || f === 'okrs') {
        placeholders.push(`$${i}::text[]`);
      } else {
        placeholders.push(`$${i}`);
      }
      values.push(req.body[f] === null ? null : req.body[f]);
      i++;
    }
  }

  try {
    const row = await queryOne(
      `INSERT INTO projects (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
      values
    );
    res.status(201).json(row);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// PATCH /api/projects/:id
projectsRouter.patch('/:id', async (req, res) => {
  const updates: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  for (const f of PROJECT_FIELDS) {
    if (req.body[f] !== undefined) {
      if (f === 'tecnologias' || f === 'okrs') {
        updates.push(`${f} = $${i}::text[]`);
      } else {
        updates.push(`${f} = $${i}`);
      }
      values.push(req.body[f] === null ? null : req.body[f]);
      i++;
    }
  }
  if (!updates.length) return res.status(400).json({ error: 'Nada para atualizar' });
  values.push(req.params.id);

  try {
    const row = await queryOne(
      `UPDATE projects SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// DELETE /api/projects/:id
projectsRouter.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});
