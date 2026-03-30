const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/anuncios', require('./routes/anuncios'));
app.use('/api/auth',     require('./routes/auth'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mensaje: 'Autos Premium CR API funcionando' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

app.get('/api/config', (req, res) => {
  res.json({ anthropicKey: process.env.ANTHROPIC_KEY });
});
