(function(){
  var root=document.documentElement;

  // 最初の画面の写真を読み込んでから、ローディングを消して最初の画面を出す
  var t0=Date.now(), done=false;
  function go(){ if(done) return; done=true; setTimeout(function(){ root.classList.add('ready'); }, Math.max(0,500-(Date.now()-t0))); }
  var pics=[].slice.call(document.querySelectorAll('.collage img, .jhero img'));
  if(pics.length){
    var left=pics.length;
    pics.forEach(function(img){ if(img.complete) { if(--left===0) go(); } else { img.addEventListener('load',function(){ if(--left===0) go(); }); img.addEventListener('error',function(){ if(--left===0) go(); }); } });
    setTimeout(go,5000);
  } else go();

  // 読み進めると、各部分が静かに出る
  var rv=document.querySelectorAll('.rv');
  if(!('IntersectionObserver' in window)){ [].forEach.call(rv,function(e){ e.classList.add('in'); }); }
  else{
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); },{ rootMargin:'0px 0px -8% 0px' });
    [].forEach.call(rv,function(e){ io.observe(e); });
  }

  // 最初の画面が見えている間は、下の固定ボタンを隠す
  var first=document.querySelector('[data-first]'), bar=document.querySelector('.sticky');
  if(first && bar && 'IntersectionObserver' in window){
    new IntersectionObserver(function(e){ bar.classList.toggle('hide', e[0].isIntersecting); },{ threshold:0.15 }).observe(first);
  } else if(bar){ bar.classList.remove('hide'); }

  // 時間帯の切り替え
  var tabs=document.querySelectorAll('[role="tab"]');
  [].forEach.call(tabs,function(t){
    t.addEventListener('click',function(){
      [].forEach.call(tabs,function(o){ o.setAttribute('aria-selected', o===t ? 'true' : 'false'); });
      [].forEach.call(document.querySelectorAll('[role="tabpanel"]'),function(p){
        var on = p.id === t.getAttribute('aria-controls');
        p.hidden = !on; p.classList.remove('show'); if(on){ void p.offsetWidth; p.classList.add('show'); }
      });
      var sel=document.querySelector('input[name="band"][value="'+t.dataset.band+'"]'); if(sel) sel.checked=true;
    });
  });

  // 応募フォーム（見本。送信はしない）
  var form=document.querySelector('form.form');
  if(form){
    form.addEventListener('submit',function(ev){ ev.preventDefault(); var d=form.querySelector('.done'); if(d) d.hidden=false; });
  }
})();
