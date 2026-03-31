const router = require('express').Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, telefono, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO usuarios (nombre, email, telefono, password_hash) VALUES ($1,$2,$3,$4) RETURNING id, nombre, email, rol',
      [nombre, email, telefono, hash]
    );
    const token = jwt.sign(
      { id: result.rows[0].id, rol: result.rows[0].rol },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ usuario: result.rows[0], token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (!result.rows.length) return res.status(401).json({ error: 'Credenciales inválidas' });
    const valido = await bcrypt.compare(password, result.rows[0].password_hash);
    if (!valido) return res.status(401).json({ error: 'Credenciales inválidas' });
    const token = jwt.sign(
      { id: result.rows[0].id, rol: result.rows[0].rol },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      usuario: {
        id: result.rows[0].id,
        nombre: result.rows[0].nombre,
        email: result.rows[0].email,
        rol: result.rows[0].rol
      },
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

router.post('/admin/login', async (req, res) => {
  try {
    const { usuario, password } = req.body;
    if(usuario !== process.env.ADMIN_USER || password !== process.env.ADMIN_PASSWORD){
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const token = jwt.sign(
      { rol: 'admin' },
      process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token });
  } catch(err){
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if(!token) return res.status(401).json({ error: 'No autorizado' });
    jwt.verify(token, process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET);
    res.json({ ok: true });
  } catch(err){
    res.status(401).json({ error: 'Token inválido' });
  }
});
