const router = require('express').Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.get('/', async (req, res) => {
  try {
    const { marca, anio_min, anio_max, precio_min, precio_max, km_max, provincia, estado, page = 1, limit = 12 } = req.query;
    let conditions = [];
    let params = [];
    let i = 1;

    if (marca)      { conditions.push(`marca ILIKE $${i++}`); params.push(`%${marca}%`); }
    if (anio_min)   { conditions.push(`anio >= $${i++}`);     params.push(anio_min); }
    if (anio_max)   { conditions.push(`anio <= $${i++}`);     params.push(anio_max); }
    if (precio_min) { conditions.push(`precio >= $${i++}`);   params.push(precio_min); }
    if (precio_max) { conditions.push(`precio <= $${i++}`);   params.push(precio_max); }
    if (km_max)     { conditions.push(`km <= $${i++}`);       params.push(km_max); }
    if (provincia)  { conditions.push(`provincia ILIKE $${i++}`); params.push(`%${provincia}%`); }

    const estadoFiltro = estado || 'activo';
    conditions.push(`estado = $${i++}`);
    params.push(estadoFiltro);

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const offset = (page - 1) * limit;

    const query = `
      SELECT * FROM anuncios
      ${where}
      ORDER BY destacado DESC, creado_en DESC
      LIMIT $${i++} OFFSET $${i++}
    `;
    params.push(limit, offset);

    const result = await db.query(query, params);
    const total  = await db.query(`SELECT COUNT(*) FROM anuncios ${where}`, params.slice(0, -2));

    res.json({ anuncios: result.rows, total: parseInt(total.rows[0].count), page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    await db.query('UPDATE anuncios SET visitas = visitas + 1 WHERE id = $1', [req.params.id]);
    const result = await db.query('SELECT * FROM anuncios WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Anuncio no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', upload.array('fotos', 15), async (req, res) => {
  try {
    const { titulo, marca, modelo, anio, km, precio, combustible, transmision, color, motor, descripcion, vendedor_nombre, vendedor_telefono, provincia, canton, fuente, facebook_post_id } = req.body;
    const fotos = req.files ? req.files.map((f, idx) => ({ url: '/uploads/' + f.filename, orden: idx, es_principal: idx === 0 })) : [];

    const result = await db.query(`
      INSERT INTO anuncios (titulo, marca, modelo, anio, km, precio, combustible, transmision, color, motor, descripcion, vendedor_nombre, vendedor_telefono, provincia, canton, fuente, facebook_post_id, fotos)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
      RETURNING *`,
      [titulo || `${marca} ${modelo} ${anio}`, marca, modelo, anio, km, precio, combustible, transmision, color, motor, descripcion, vendedor_nombre, vendedor_telefono, provincia, canton, fuente || 'manual', facebook_post_id || null, JSON.stringify(fotos)]
    );
    res.status(201).json(result.rows[0]);
    // Notificar por WhatsApp
    try{
      const { notificarWhatsApp } = require('../index');
      notificarWhatsApp(result.rows[0]);
    }catch(e){}
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/estado', async (req, res) => {
  try {
    const { estado } = req.body;
    const result = await db.query(
      'UPDATE anuncios SET estado = $1, actualizado_en = NOW() WHERE id = $2 RETURNING *',
      [estado, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM anuncios WHERE id = $1', [req.params.id]);
    res.json({ mensaje: 'Anuncio eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

