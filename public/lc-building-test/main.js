(function(){
  // 表紙が見えている間は、下の応募ボタンを隠す
  var first=document.querySelector('[data-first]'), bar=document.querySelector('.sticky');
  if(bar){
    if(first && 'IntersectionObserver' in window){ new IntersectionObserver(function(e){ bar.classList.toggle('hide', e[0].isIntersecting); },{ threshold:0.15 }).observe(first); }
    else bar.classList.remove('hide');
  }
  // 早番・遅番の切り替え
  var tabs=document.querySelectorAll('[role="tab"]');
  [].forEach.call(tabs,function(t){ t.addEventListener('click',function(){
    [].forEach.call(tabs,function(o){ o.setAttribute('aria-selected', o===t ? 'true':'false'); });
    [].forEach.call(document.querySelectorAll('[role="tabpanel"]'),function(p){ p.hidden = p.id!==t.getAttribute('aria-controls'); });
  }); });
  // 応募フォーム（見本。送信はしない）
  var form=document.querySelector('form.form');
  if(form) form.addEventListener('submit',function(e){ e.preventDefault(); var d=form.querySelector('.done'); if(d) d.hidden=false; });
})();
