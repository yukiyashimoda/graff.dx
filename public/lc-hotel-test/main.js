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


  // セクションの区切りを、函館の海をイメージしたゆるやかな波にする
  (function(){
    var main=document.querySelector('main'); if(!main) return;
    var kids=[].slice.call(main.children).filter(function(e){ return e.offsetHeight>0 && !e.classList.contains('wave') && !e.classList.contains('bridge'); });
    function bg(e){ var c=getComputedStyle(e).backgroundColor; return (c==='rgba(0, 0, 0, 0)'||c==='transparent') ? 'rgb(255, 255, 255)' : c; }
    function light(c){ var m=c.match(/\d+/g); if(!m) return false; var r=+m[0],g=+m[1],bl=+m[2]; return !(r===255&&g===255&&bl===255) && (r+g+bl)/3>190; }
    var paths=['M0,30 C80,58 160,2 240,26 C320,50 400,8 480,30','M0,26 C70,4 150,54 240,32 C330,10 410,52 480,24','M0,32 C90,8 170,50 250,28 C330,6 410,46 480,30'];
    for(var i=1;i<kids.length;i++){
      var a=kids[i-1], b=kids[i]; if(a.tagName==='HEADER' && a.classList.contains('cv4')) {}
      var ca=bg(a), cb=bg(b), d=paths[i%paths.length];
      var w=document.createElement('div'); w.className='wave'; w.setAttribute('aria-hidden','true');
      // 次の章の背景の英字は、この波と同じ曲線に沿わせて、波のすぐ下に置く
      var gw=b.querySelector('.ghostwave'), word=gw ? gw.textContent.trim() : '';
      if(gw) gw.parentNode.removeChild(gw);
      var txt = word ? '<path id="wv'+i+'" d="'+d+'" transform="translate(0,82)" fill="none"/><text class="wavetext"><textPath href="#wv'+i+'" startOffset="3%">'+word+'</textPath></text>' : '';
      if(ca===cb){
        w.style.background=ca;
        w.innerHTML='<svg viewBox="0 0 480 60" preserveAspectRatio="none"><path d="'+d+'" fill="none" stroke="#2c3e78" stroke-width="1.2" stroke-opacity=".45" vector-effect="non-scaling-stroke"/>'+txt+'</svg>';
      } else {
        w.style.background=ca;
        w.innerHTML='<svg viewBox="0 0 480 60" preserveAspectRatio="none"><path d="'+d+' L480,60 L0,60 Z" fill="'+cb+'"/>'+txt+'</svg>';
      }
      if(b.classList.contains('wavecut')){ w.classList.add('onphoto-top'); w.innerHTML='<svg viewBox="0 0 480 60" preserveAspectRatio="none"><path d="'+d+' L480,0 L0,0 Z" fill="'+ca+'"/><path d="'+d+'" fill="none" stroke="#2c3e78" stroke-width="1.2" stroke-opacity=".45" vector-effect="non-scaling-stroke"/>'+txt+'</svg>'; }
      if(a.classList.contains('wavecut')){ w.classList.add('onphoto-bottom'); }
      // 水色の側だけに紙の質感を重ねる（波の形で切り抜く）
      var la=light(ca), lb=light(cb) && !b.classList.contains('wavecut');
      if(a.classList.contains('wavecut')) la=false;
      if(la||lb){
        var shape = (la&&lb) ? 'M0,0 L480,0 L480,60 L0,60 Z' : (la ? d+' L480,0 L0,0 Z' : d+' L480,60 L0,60 Z');
        var m='url("data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 60" preserveAspectRatio="none"><path d="'+shape+'"/></svg>')+'")';
        var pp=document.createElement('i'); pp.className='paper';
        pp.style.webkitMaskImage=m; pp.style.maskImage=m; pp.style.webkitMaskSize='100% 100%'; pp.style.maskSize='100% 100%';
        w.appendChild(pp);
      }
      // 次の章が水色なら、背景の英字を少しだけ濃くして質感に埋もれないようにする
      if(word && light(cb)){ var wt=w.querySelector('.wavetext'); if(wt) wt.style.fill='#cfd8e6'; }
      b.parentNode.insertBefore(w,b);
    }
  })();

  // 表紙の写真と、ととのいスペースの写真だけ、少しゆっくり動かす
  (function(){
    var els=[].slice.call(document.querySelectorAll('[data-px]'));
    if(!els.length || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    var ticking=false;
    function upd(){
      ticking=false; var vh=window.innerHeight;
      els.forEach(function(el){
        var r=el.getBoundingClientRect(); if(r.bottom<-50 || r.top>vh+50) return;
        var p=((r.top+r.height/2)-vh/2)/(vh/2+r.height/2); p=Math.max(-1,Math.min(1,p));
        var img=el.querySelector('img'); if(img) var dir=parseFloat(el.getAttribute('data-px'))||1; img.style.transform='translate3d(0,'+(dir*p*r.height*0.07).toFixed(1)+'px,0)';
      });
    }
    function on(){ if(!ticking){ ticking=true; requestAnimationFrame(upd); } }
    window.addEventListener('scroll',on,{passive:true}); window.addEventListener('resize',on); upd();
  })();

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

  // トップの「時間帯から探す」から来たら、その時間帯を開く
  if(location.hash){ var t=document.getElementById(location.hash.slice(1)); if(t && t.getAttribute('role')==='tab'){ t.click(); } }

  // 応募フォーム（見本。送信はしない）
  var form=document.querySelector('form.form');
  if(form){
    form.addEventListener('submit',function(ev){ ev.preventDefault(); var d=form.querySelector('.done'); if(d) d.hidden=false; });
  }
})();
