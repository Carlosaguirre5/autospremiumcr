window.selectedFiles = [];
window.addEventListener('load', function(){
  var btn = document.createElement('input');
  btn.type = 'file';
  btn.multiple = true;
  btn.accept = 'image/*';
  btn.style.cssText = 'position:fixed;top:-100px;left:-100px;opacity:0';
  document.body.appendChild(btn);
  btn.addEventListener('change', function(){
    Array.from(this.files).forEach(function(f){
      if(window.selectedFiles.length >= 15) return;
      window.selectedFiles.push(f);
      var reader = new FileReader();
      var idx = window.selectedFiles.length - 1;
      reader.onload = function(e){
        var prev = document.getElementById('photosPreview');
        var div = document.createElement('div');
        div.className = 'photo-thumb';
        div.innerHTML = '<img src="' + e.target.result + '" style="width:100%;height:100%;object-fit:cover">';
        prev.appendChild(div);
        if(idx === 0){
          document.getElementById('prevImg').innerHTML = '<img src="' + e.target.result + '" style="width:100%;height:100%;object-fit:cover">';
        }
      };
      reader.readAsDataURL(f);
    });
    this.value = '';
  });
  var area = document.querySelector('.upload-area');
  area.addEventListener('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    btn.click();
  });
});
