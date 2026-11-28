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
  // CM：押すとその場でYouTubeを再生する（押すまで読み込まない）
  [].forEach.call(document.querySelectorAll('.cm-b'),function(b){ b.addEventListener('click',function(){
    var f=document.createElement('iframe');
    f.src='https://www.youtube-nocookie.com/embed/'+b.getAttribute('data-yt')+'?autoplay=1&playsinline=1&rel=0';
    f.title='LC GROUPのCM'; f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen=true;
    b.parentNode.replaceChild(f,b);
  }); });
  // 出現アニメーション：画面に入ったら1回だけ出す
  var root=document.documentElement, still=window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!still && 'IntersectionObserver' in window){
    var q=function(s){ return [].slice.call(document.querySelectorAll(s)); };
    var put=function(list,cls,step){ list.forEach(function(el,i){ if(cls==='rv' && el.parentElement && el.parentElement.closest('.rv')) return; el.classList.add(cls); if(step) el.style.setProperty('--d',(i*step)+'ms'); }); };
    put(q('main .sh, main h2, .tx, .h3, .job, .meta, .form, .tel, .jh, .back, [role="tablist"], [role="tabpanel"], #first .jv, main > .jv'),'rv');
    ['.pts','.flow','.nums'].forEach(function(s){ q(s).forEach(function(box){ put([].slice.call(box.children),'rv',70); }); });
    put(q('.cm, .ph-full'),'rvp'); put(q('.ghost'),'rvr'); put(q('#first .jbig'),'rvl');
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); },{ threshold:0.12, rootMargin:'0px 0px -6% 0px' });
    q('.rv, .rvp, .rvr, .rvl').forEach(function(el){ io.observe(el); });
  } else root.classList.remove('js');
  // 応募フォーム（見本。送信はしない）
  var form=document.querySelector('form.form');
  if(form) form.addEventListener('submit',function(e){ e.preventDefault(); var d=form.querySelector('.done'); if(d) d.hidden=false; });
})();
