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
