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

// Notificación WhatsApp
async function notificarWhatsApp(anuncio){
  try{
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: process.env.TWILIO_WHATSAPP_TO,
      body: `🚗 *Nuevo anuncio publicado*\n\n*${anuncio.marca||''} ${anuncio.modelo||''} ${anuncio.anio||''}*\n💰 ${anuncio.precio ? '₡'+parseInt(anuncio.precio).toLocaleString('es-CR') : 'Precio no indicado'}\n🛣️ ${anuncio.km ? anuncio.km.toLocaleString()+' km' : '—'}\n📍 ${anuncio.provincia||'—'}\n👤 ${anuncio.vendedor_nombre||'—'}\n📞 ${anuncio.vendedor_telefono||'—'}\n\n🔗 https://autospremiumcostarica.com/admin.html`
    });
    console.log('✅ WhatsApp enviado');
  } catch(e){
    console.error('❌ Error WhatsApp:', e.message);
  }
}
module.exports.notificarWhatsApp = notificarWhatsApp;

// Store OTPs temporalmente en memoria
const otpStore = new Map();

app.post('/api/otp/enviar', async (req, res) => {
  try {
    const { telefono } = req.body;
    if(!telefono) return res.status(400).json({ error: 'Teléfono requerido' });
    
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expira = Date.now() + 10 * 60 * 1000; // 10 minutos
    otpStore.set(telefono, { codigo, expira });

    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: 'whatsapp:+506' + telefono.replace(/[^0-9]/g,''),
      body: '🔐 *Autos Premium CR*\n\nTu código de verificación es:\n\n*' + codigo + '*\n\nVálido por 10 minutos. No lo compartas con nadie.'
    });

    console.log('✅ OTP enviado a', telefono);
    res.json({ ok: true });
  } catch(e) {
    console.error('❌ Error OTP:', e.message);
    res.status(500).json({ error: 'Error enviando código' });
  }
});

app.post('/api/otp/verificar', (req, res) => {
  try {
    const { telefono, codigo } = req.body;
    const otp = otpStore.get(telefono);
    if(!otp) return res.status(400).json({ error: 'Código no encontrado o expirado' });
    if(Date.now() > otp.expira) {
      otpStore.delete(telefono);
      return res.status(400).json({ error: 'Código expirado' });
    }
    if(otp.codigo !== codigo) return res.status(400).json({ error: 'Código incorrecto' });
    otpStore.delete(telefono);
    res.json({ ok: true, verificado: true });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/og/detalle', async (req, res) => {
  try {
    const { id } = req.query;
    const result = await require('./db').query('SELECT * FROM anuncios WHERE id = $1', [id]);
    const a = result.rows[0];
    if (!a) return res.redirect('/detalle.html?id=' + id);
    const foto = a.fotos && a.fotos[0] ? 'https://autospremiumcostarica.com' + a.fotos[0].url : 'https://autospremiumcostarica.com/og-image.png';
    const titulo = `${a.marca} ${a.modelo} ${a.anio} — Autos Premium CR`;
    const desc = `${a.km ? a.km.toLocaleString('es-CR') + ' km · ' : ''}${a.combustible || ''} · ₡${parseInt(a.precio).toLocaleString('es-CR')}`;
    res.send(`<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<title>${titulo}</title>
<meta property="og:title" content="${titulo}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${foto}">
<meta property="og:url" content="https://autospremiumcostarica.com/detalle.html?id=${id}">
property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0;url=/detalle.html?id=${id}">
</head><body></body></html>`);
  } catch(e) {
    res.redirect('/detalle.html?id=' + req.query.id);
  }
});
