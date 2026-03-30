window.addEventListener('load', function(){
  var btn = document.getElementById('apcr-chat-btn');
  var bubble = document.getElementById('apcr-chat-bubble');
  if(btn){
    document.body.appendChild(btn);
    document.body.appendChild(bubble);
    btn.style.cssText = 'position:fixed!important;bottom:24px!important;right:24px!important;z-index:2147483647!important;width:60px!important;height:60px!important;border-radius:50%!important;background:linear-gradient(135deg,#0051BA,#0066e0)!important;border:none!important;cursor:pointer!important;font-size:26px!important;display:flex!important;align-items:center!important;justify-content:center!important;';
    bubble.style.cssText = 'position:fixed!important;bottom:94px!important;right:24px!important;z-index:2147483646!important;width:360px!important;max-height:520px!important;background:#002D47!important;border:1px solid rgba(0,81,186,0.4)!important;border-radius:14px!important;overflow:hidden!important;box-shadow:0 8px 40px rgba(0,0,0,0.5)!important;flex-direction:column!important;';
  }
});
