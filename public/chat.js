(function(){

var API = 'https://autospremiumcostarica.com/api';
var history = [];
var isOpen = false;
var isLoading = false;

// Inyectar estilos
var style = document.createElement('style');
style.textContent = `
  #apcr-chat-btn { z-index: 99999 !important;
    position: fixed; bottom: 24px; right: 24px; z-index: 2147483647;
    width: 60px; height: 60px; border-radius: 50%;
    background: linear-gradient(135deg, #0051BA, #0066e0);
    border: none; cursor: pointer; box-shadow: 0 4px 20px rgba(0,81,186,0.5);
    display: flex; align-items: center; justify-content: center;
    font-size: 26px; transition: transform .2s;
  }
  #apcr-chat-btn:hover { transform: scale(1.1); }
  #apcr-chat-bubble {
    position: fixed; bottom: 94px; right: 24px; z-index: 2147483646;
    background: #002D47; border: 1px solid rgba(0,81,186,0.4);
    border-radius: 14px; width: 360px; max-height: 520px;
    display: none; flex-direction: column;
    box-shadow: 0 8px 40px rgba(0,0,0,0.5); overflow: hidden;
  }
  #apcr-chat-bubble.open { display: flex; }
  #apcr-chat-header {
    background: linear-gradient(135deg, #002D47, #001a2e);
    padding: 16px 18px; border-bottom: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: space-between;
  }
  #apcr-chat-header-info { display: flex; align-items: center; gap: 10px; }
  #apcr-chat-avatar {
    width: 36px; height: 36px; background: #0051BA; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 800; color: #fff; flex-shrink: 0;
    font-family: Inter, sans-serif;
  }
  #apcr-chat-title { font-size: 14px; font-weight: 700; color: #fff; font-family: Inter, sans-serif; }
  #apcr-chat-subtitle { font-size: 11px; color: #4ade80; font-family: Inter, sans-serif; }
  #apcr-chat-close {
    background: transparent; border: none; color: rgba(255,255,255,0.4);
    font-size: 18px; cursor: pointer; padding: 4px;
  }
  #apcr-chat-close:hover { color: #fff; }
  #apcr-chat-messages {
    flex: 1; overflow-y: auto; padding: 16px; display: flex;
    flex-direction: column; gap: 12px; max-height: 350px;
  }
  #apcr-chat-messages::-webkit-scrollbar { width: 4px; }
  #apcr-chat-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
  .apcr-msg { display: flex; gap: 8px; align-items: flex-start; }
  .apcr-msg.user { flex-direction: row-reverse; }
  .apcr-msg-bubble {
    max-width: 80%; padding: 10px 14px; border-radius: 12px;
    font-size: 13px; line-height: 1.6; font-family: Inter, sans-serif;
  }
  .apcr-msg.bot .apcr-msg-bubble {
    background: #0d1929; color: rgba(255,255,255,0.85);
    border: 1px solid rgba(255,255,255,0.08); border-radius: 4px 12px 12px 12px;
  }
  .apcr-msg.user .apcr-msg-bubble {
    background: #0051BA; color: #fff;
    border-radius: 12px 4px 12px 12px;
  }
  .apcr-msg-avatar {
    width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; font-family: Inter, sans-serif;
  }
  .apcr-msg.bot .apcr-msg-avatar { background: #0051BA; color: #fff; }
  .apcr-msg.user .apcr-msg-avatar { background: rgba(255,255,255,0.1); color: #fff; }
  .apcr-car-card {
    background: #0a1525; border: 1px solid rgba(0,81,186,0.3);
    border-radius: 10px; padding: 12px; margin-top: 8px; cursor: pointer;
    transition: border-color .2s;
  }
  .apcr-car-card:hover { border-color: #0051BA; }
  .apcr-car-name { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 4px; }
  .apcr-car-meta { font-size: 11px; color: rgba(255,255,255,0.4); margin-bottom: 6px; }
  .apcr-car-price { font-size: 15px; font-weight: 800; color: #fff; }
  .apcr-car-loc { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 4px; }
  .apcr-typing {
    display: flex; gap: 4px; align-items: center; padding: 10px 14px;
    background: #0d1929; border-radius: 4px 12px 12px 12px;
    border: 1px solid rgba(255,255,255,0.08); width: fit-content;
  }
  .apcr-dot {
    width: 6px; height: 6px; background: rgba(255,255,255,0.4);
    border-radius: 50%; animation: apcr-bounce 1.2s infinite;
  }
  .apcr-dot:nth-child(2) { animation-delay: .2s; }
  .apcr-dot:nth-child(3) { animation-delay: .4s; }
  @keyframes apcr-bounce {
    0%,80%,100%{transform:scale(0.8);opacity:.4}
    40%{transform:scale(1.2);opacity:1}
  }
  .apcr-suggestions {
    display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px;
  }
  .apcr-suggestion {
    background: rgba(0,81,186,0.15); border: 1px solid rgba(0,81,186,0.3);
    color: #6ab4ff; font-size: 11px; padding: 5px 10px; border-radius: 20px;
    cursor: pointer; font-family: Inter, sans-serif; transition: background .2s;
  }
  .apcr-suggestion:hover { background: rgba(0,81,186,0.3); }
  #apcr-chat-input-area {
    padding: 12px; border-top: 1px solid rgba(255,255,255,0.07);
    display: flex; gap: 8px; align-items: center;
  }
  #apcr-chat-input {
    flex: 1; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px; color: #fff; padding: 9px 14px; font-size: 13px;
    font-family: Inter, sans-serif; outline: none;
  }
  #apcr-chat-input:focus { border-color: #0051BA; }
  #apcr-chat-input::placeholder { color: rgba(255,255,255,0.25); }
  #apcr-chat-send {
    width: 36px; height: 36px; background: #0051BA; border: none;
    border-radius: 50%; color: #fff; font-size: 16px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: background .2s;
  }
  #apcr-chat-send:hover { background: #0040a0; }
  #apcr-chat-send:disabled { opacity: .5; cursor: not-allowed; }
`;
document.head.appendChild(style);

// HTML del widget
var widget = document.createElement('div');
widget.innerHTML = `
  <button id="apcr-chat-btn" title="Buscar con IA">🤖</button>
  <div id="apcr-chat-bubble">
    <div id="apcr-chat-header">
      <div id="apcr-chat-header-info">
        <div id="apcr-chat-avatar">AP</div>
        <div>
          <div id="apcr-chat-title">Asistente de Autos Premium CR</div>
          <div id="apcr-chat-subtitle">● En línea</div>
        </div>
      </div>
      <button id="apcr-chat-close">✕</button>
    </div>
    <div id="apcr-chat-messages"></div>
    <div id="apcr-chat-input-area">
      <input id="apcr-chat-input" type="text" placeholder="Buscar un auto...">
      <button id="apcr-chat-send">➤</button>
    </div>
  </div>
`;
document.body.appendChild(widget);

function fmt(n){ return n ? '₡'+parseInt(n).toLocaleString('es-CR') : 'Consultar'; }

function addMsg(role, content){
  var msgs = document.getElementById('apcr-chat-messages');
  var div = document.createElement('div');
  div.className = 'apcr-msg ' + role;
  div.innerHTML = '<div class="apcr-msg-avatar">'+(role==='bot'?'AP':'Vos')+'</div><div class="apcr-msg-bubble">'+content+'</div>';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

function addTyping(){
  var msgs = document.getElementById('apcr-chat-messages');
  var div = document.createElement('div');
  div.className = 'apcr-msg bot';
  div.id = 'apcr-typing';
  div.innerHTML = '<div class="apcr-msg-avatar">AP</div><div class="apcr-typing"><div class="apcr-dot"></div><div class="apcr-dot"></div><div class="apcr-dot"></div></div>';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function removeTyping(){
  var t = document.getElementById('apcr-typing');
  if(t) t.remove();
}

function showWelcome(){
  var suggs = ['Toyota Corolla bajo 10 palos', 'SUV con menos de 50mil km', 'Auto eléctrico en San José', 'Pickup 4x4 en Guanacaste'];
  var html = '¡Hola! 👋 Soy el asistente de <strong>Autos Premium CR</strong>. Describime el auto que buscás y te ayudo a encontrarlo.<div class="apcr-suggestions">'+suggs.map(function(s){return'<div class="apcr-suggestion" onclick="window.apcrSend(\''+s+'\')">'+s+'</div>';}).join('')+'</div>';
  addMsg('bot', html);
}

async function processMessage(text){
  if(isLoading) return;
  isLoading = true;
  document.getElementById('apcr-chat-send').disabled = true;

  history.push({role:'user', content: text});
  addMsg('user', text);
  addTyping();

  try {
    var configRes = await fetch(API+'/config');
    var config = await configRes.json();
    var key = config.anthropicKey;

    var systemPrompt = `Sos un asistente de búsqueda de autos para Autos Premium CR, un clasificado de vehículos usados en Costa Rica.

Tu trabajo es interpretar lo que busca el usuario y convertirlo en parámetros de búsqueda, luego presentar los resultados de forma amigable.

Cuando el usuario describa lo que busca, respondé con un JSON así:
{"action":"search","params":{"marca":"Toyota","precio_max":10000000,"km_max":80000,"provincia":"San José"}}

Solo incluí los campos que el usuario mencionó. Campos disponibles: marca, modelo, precio_min, precio_max, km_max, anio_min, anio_max, provincia, combustible.

Si el usuario saluda o hace preguntas generales, respondé normalmente sin JSON.
Si el usuario pregunta por un auto específico que vio, pedile más detalles.
Siempre respondé en español costarricense, de forma amigable y concisa.`;

    var aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: systemPrompt,
        messages: history
      })
    });

    var aiData = await aiRes.json();
    var aiText = aiData.content[0].text;
    history.push({role:'assistant', content: aiText});

    removeTyping();

    // Intentar parsear como acción de búsqueda
    var jsonMatch = aiText.match(/\{[\s\S]*"action"[\s\S]*\}/);
    if(jsonMatch){
      try{
        var action = JSON.parse(jsonMatch[0]);
        if(action.action === 'search'){
          await doSearch(action.params);
        }
      } catch(e){
        addMsg('bot', aiText);
      }
    } else {
      addMsg('bot', aiText);
    }

  } catch(e){
    removeTyping();
    addMsg('bot', 'Hubo un error. Intentá de nuevo.');
    console.error(e);
  }

  isLoading = false;
  document.getElementById('apcr-chat-send').disabled = false;
}

async function doSearch(params){
  var query = new URLSearchParams();
  Object.keys(params).forEach(function(k){ if(params[k]) query.append(k, params[k]); });
  query.append('limit', 4);

  try {
    var res = await fetch(API+'/anuncios?'+query.toString());
    var data = await res.json();
    var cars = data.anuncios || [];

    if(!cars.length){
      addMsg('bot', 'No encontré vehículos con esas características ahora mismo. ¿Querés que ampliemos la búsqueda? Por ejemplo podés subir el presupuesto o quitar algún filtro.');
      return;
    }

    var html = 'Encontré <strong>'+data.total+'</strong> vehículos. Acá los más relevantes:';
    cars.forEach(function(c){
      var fotos = [];
      try{ fotos = typeof c.fotos==='string'?JSON.parse(c.fotos):(c.fotos||[]); }catch(e){}
      html += '<div class="apcr-car-card" onclick="location.href=\'detalle.html?id='+c.id+'\'">'+
        '<div style="height:80px;background:linear-gradient(135deg,#001a2e,#002D47);border-radius:8px 8px 0 0;overflow:hidden;display:flex;align-items:center;justify-content:center;margin:-12px -12px 10px -12px">'+(fotos.length>0&&fotos[0].url?'<img src="'+fotos[0].url+'" style="width:100%;height:100%;object-fit:cover">':'<span style="font-size:32px">🚗</span>')+'</div>'+
        '<div class="apcr-car-name">'+(c.marca||'')+' '+(c.modelo||'')+' '+(c.anio||'')+'</div>'+
        '<div class="apcr-car-meta">'+(c.km?c.km.toLocaleString()+' km · ':'')+( c.combustible||'')+'</div>'+
        '<div class="apcr-car-price">'+fmt(c.precio)+'</div>'+
        '<div class="apcr-car-loc">📍 '+(c.provincia||'Costa Rica')+'</div>'+
      '</div>';
    });

    if(data.total > 4){
      var searchUrl = 'resultados.html?'+query.toString();
      html += '<div style="margin-top:10px;text-align:center"><a href="'+searchUrl+'" style="color:#6ab4ff;font-size:12px;font-family:Inter,sans-serif">Ver todos los '+data.total+' resultados →</a></div>';
    }

    addMsg('bot', html);

  } catch(e){
    addMsg('bot', 'Error buscando vehículos. Intentá de nuevo.');
  }
}

// Eventos
document.getElementById('apcr-chat-btn').addEventListener('click', function(){
  isOpen = !isOpen;
  var bubble = document.getElementById('apcr-chat-bubble');
  if(isOpen){
    bubble.classList.add('open');
    if(document.getElementById('apcr-chat-messages').children.length === 0) showWelcome();
    document.getElementById('apcr-chat-input').focus();
  } else {
    bubble.classList.remove('open');
  }
});

document.getElementById('apcr-chat-close').addEventListener('click', function(){
  isOpen = false;
  document.getElementById('apcr-chat-bubble').classList.remove('open');
});

document.getElementById('apcr-chat-send').addEventListener('click', function(){
  var input = document.getElementById('apcr-chat-input');
  var text = input.value.trim();
  if(!text) return;
  input.value = '';
  processMessage(text);
});

document.getElementById('apcr-chat-input').addEventListener('keypress', function(e){
  if(e.key === 'Enter'){
    var text = this.value.trim();
    if(!text) return;
    this.value = '';
    processMessage(text);
  }
});

window.apcrSend = function(text){
  processMessage(text);
};

})();
