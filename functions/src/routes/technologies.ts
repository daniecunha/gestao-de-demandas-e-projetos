import { Router } from 'express';
import { query, queryOne } from '../db';

export const technologiesRouter = Router();

// GET /api/technologies
technologiesRouter.get('/', async (_req, res) => {
  try {
    const rows = await query('SELECT * FROM technologies ORDER BY nome ASC');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// GET /api/technologies/:id
technologiesRouter.get('/:id', async (req, res) => {
  try {
    const row = await queryOne('SELECT * FROM technologies WHERE id = $1', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Não encontrado' });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// POST /api/technologies
technologiesRouter.post('/', async (req, res) => {
  const { nome, descricao = '', cor = '#2E75B6', icone = 'cpu' } = req.body;
  try {
    const row = await queryOne(
      `INSERT INTO technologies (nome, descricao, cor, icone)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nome, descricao, cor, icone]
    );
    res.status(201).json(row);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// PATCH /api/technologies/:id
technologiesRouter.patch('/:id', async (req, res) => {
  const fields = ['nome', 'descricao', 'cor', 'icone'];
  const updates: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = $${i++}`);
      values.push(req.body[f]);
    }
  }
  if (!updates.length) return res.status(400).json({ error: 'Nada para atualizar' });
  values.push(req.params.id);

  try {
    const row = await queryOne(
      `UPDATE technologies SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// DELETE /api/technologies/:id
technologiesRouter.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM technologies WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});
