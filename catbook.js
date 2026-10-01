/* Mail-order catalog mode (#/catalog): the whole collection laid out like a 1990s software-store mail catalog,
   with a table of contents, category dividers, an index, an order form and real page-turn animation. */
var CMBook=(function(){
 var ST={s:0};
 function E(s){return esc(s)}
 function itemNo(it){var n=ITEMS.indexOf(it)+1;return"CM-"+(n<1000?("000"+n).slice(-4):n)}
 function motionOn(){return document.documentElement.getAttribute("data-motion")!=="off"&&!(window.matchMedia&&matchMedia("(prefers-reduced-motion:reduce)").matches)}
 function wide(){return window.innerWidth>=900}
 function gl(n,s){return typeof pxCat==="function"?pxCat(n,s):""}
 function blurb(it){var t=String(it.text||"").replace(/\s+/g," ").trim();if(!t)return"";var m=t.match(/^.{40,150}?[.!?](\s|$)/);return m?m[0].trim():t.slice(0,130)+(t.length>130?"...":"")}
 function entry(it){var sp=(typeof pickSpecs==="function"?pickSpecs(it,it.type):[]).slice(0,3);
  return'<a class="bk-it" href="#/item/'+E(it.id)+'"><div class="bk-ph">'+pic(it)+(it.score!=null?'<span class="bk-burst" style="background:'+tier(it.score).c+';color:'+inkOn(tier(it.score).c)+'"><b>'+it.score+'K</b><i>'+E(tier(it.score).l)+'</i></span>':"")+'</div>'
   +'<div class="bk-tx"><small class="bk-no">Item No. '+itemNo(it)+(it.status?' &middot; '+E(it.status):"")+'</small><h4>'+E(it.name)+'</h4><p class="bk-mk">'+E(it.maker||"")+(it.year?', '+it.year:"")+'</p>'
   +(sp.length?'<ul>'+sp.map(function(x){return'<li><b>'+E(x[0])+':</b> '+E(String(x[1]).slice(0,34))+'</li>'}).join("")+'</ul>':'<p class="bk-bl">'+E(blurb(it))+'</p>')+'<span class="bk-go">See the exhibit &raquo;</span></div></a>'}
 function build(){
  var cats=[],by={};ITEMS.forEach(function(i){if(!by[i.cat]){by[i.cat]=[];cats.push(i.cat)}by[i.cat].push(i)});
  var per=wide()?4:3,P=[],toc=[];
  P.push({k:"cover"});P.push({k:"toc"});
  cats.forEach(function(c){var l=by[c].slice().sort(function(a,b){return(a.year||0)-(b.year||0)});toc.push({c:c,n:l.length,p:P.length});P.push({k:"div",c:c,n:l.length});
   for(var i=0;i<l.length;i+=per)P.push({k:"items",c:c,l:l.slice(i,i+per)})});
  var idx=ITEMS.map(function(i){return{it:i,p:0}});P.forEach(function(pg,n){if(pg.k==="items")pg.l.forEach(function(it){idx.forEach(function(x){if(x.it===it)x.p=n})})});
  idx.sort(function(a,b){return a.it.name.localeCompare(b.it.name)});
  for(var j=0;j<idx.length;j+=36)P.push({k:"index",l:idx.slice(j,j+36),first:j===0});
  P.push({k:"order"});
  return{P:P,toc:toc,cats:cats}}
 function pageHtml(B,n){var pg=B.P[n];if(!pg)return'<div class="bk-pg bk-blank"></div>';var f='<div class="bk-pn">'+(n>0?'<span>'+(n+1)+'</span><em>Conventional Memory Catalog</em>':'')+'</div>',h;
  if(pg.k==="cover")h='<div class="bk-pg bk-cover"><div class="bk-ct"><small>THE BIG BOOK OF</small><h3>Conventional<br>Memory</h3><p class="bk-sub">MUSEUM CATALOG</p><div class="bk-px">'+gl("Computers",40)+gl("Sound cards",40)+gl("Keyboards",40)+'</div><span class="bk-seal"><b>'+ITEMS.length+'</b>exhibits<br>inside!</span><p class="bk-cs">Volume 1 &middot; '+new Date().getFullYear()+' Edition</p><p class="bk-hint">Click the page or press the right arrow to open</p></div></div>';
  else if(pg.k==="toc")h='<div class="bk-pg"><h3 class="bk-h">What\'s inside</h3><ol class="bk-toc">'+B.toc.map(function(t){return'<li><a href="#" data-p="'+t.p+'"><span>'+gl(t.c,16)+E(t.c)+' <small>('+t.n+')</small></span><i></i><b>'+(t.p+1)+'</b></a></li>'}).join("")+'<li><a href="#" data-p="'+(B.P.length-1-Math.ceil(ITEMS.length/36))+'"><span>Index of every item</span><i></i><b>'+(B.P.length-Math.ceil(ITEMS.length/36))+'</b></a></li><li><a href="#" data-p="'+(B.P.length-1)+'"><span>Order form and how to help</span><i></i><b>'+B.P.length+'</b></a></li></ol><p class="bk-note">Tip: use the arrow keys, swipe, or tap the page corners. Prefer a plain list? Switch to Pro style above.</p>'+f+'</div>';
  else if(pg.k==="div")h='<div class="bk-pg bk-div"><div class="bk-dv"><span class="bk-ic">'+gl(pg.c,48)+'</span><h3>'+E(pg.c)+'</h3><p>'+pg.n+' exhibit'+(pg.n===1?"":"s")+' in this section</p></div>'+f+'</div>';
  else if(pg.k==="items")h='<div class="bk-pg"><h3 class="bk-h sm">'+gl(pg.c,16)+E(pg.c)+'</h3><div class="bk-its">'+pg.l.map(entry).join("")+'</div>'+f+'</div>';
  else if(pg.k==="index")h='<div class="bk-pg"><h3 class="bk-h sm">'+(pg.first?"Index of every item":"Index (continued)")+'</h3><ul class="bk-ix">'+pg.l.map(function(x){return'<li><a href="#" data-p="'+x.p+'"><span>'+E(x.it.name)+'</span><i></i><b>'+(x.p+1)+'</b></a></li>'}).join("")+'</ul>'+f+'</div>';
  else h='<div class="bk-pg bk-order"><h3 class="bk-h">Order form</h3><p>Nothing here is for sale. Every exhibit is part of the museum. But you can still send in your order:</p><div class="bk-ord"><a href="#/wanted"><b>Wanted list</b><span>Help me find these missing pieces.</span></a><a href="#/community"><b>Send a memory</b><span>Tell the story of your first PC.</span></a><a href="#/mine"><b>My collection</b><span>Keep your own own/want/trade lists.</span></a><a href="#/tours"><b>Take a tour</b><span>Guided walks through the timeline.</span></a></div><p class="bk-cut">- - - - - - - cut along the dotted line - - - - - - -</p><p class="bk-note">Thanks for browsing. Please turn back to page 1 any time.</p>'+f+'</div>';
  return h}
 function mount(el){
  var B=build(),N=B.P.length,single=!wide(),busy=0;
  function spreads(){return single?N:Math.floor(N/2)+1}
  function pair(s){return single?[null,s]:[s*2-1,s*2]}
  function clamp(s){return Math.max(0,Math.min(spreads()-1,s))}
  ST.s=clamp(ST.s);
  el.innerHTML='<div class="bk-wrap"><div class="bk-book'+(single?" one":"")+'" id="bkb" tabindex="0" aria-label="Catalog book. Use left and right arrow keys to turn pages."><div class="bk-half bk-L" id="bkl"></div><div class="bk-half bk-R" id="bkr"></div></div>'
   +'<div class="bk-ctl"><button class="btn" id="bkp" type="button">&laquo; Previous</button><label class="bk-jump">Jump to <select id="bkj" aria-label="Jump to a page"></select></label><span id="bkpg" class="tn" role="status"></span><button class="btn pri" id="bkn" type="button">Next &raquo;</button></div></div>';
  var L=el.querySelector("#bkl"),R=el.querySelector("#bkr"),bk=el.querySelector("#bkb"),sel=el.querySelector("#bkj"),lab=el.querySelector("#bkpg");
  sel.innerHTML='<option value="0">Cover</option><option value="1">Contents</option>'+B.toc.map(function(t){return'<option value="'+t.p+'">'+E(t.c)+'</option>'}).join("")+'<option value="'+(N-1)+'">Order form</option>';
  function sOf(p){return single?p:Math.ceil(p/2)}
  function paint(s,lh,rh){var p=pair(s);L.innerHTML=lh==null?pageHtml(B,p[0]):lh;R.innerHTML=rh==null?pageHtml(B,p[1]):rh;
   lab.textContent=(single?"Page "+(s+1):(p[0]>=0&&p[0]<N?"Pages "+(p[0]+1)+"-"+Math.min(N,p[1]+1):"Cover"))+" of "+N;
   var cur=single?s:Math.max(0,p[0]>=0?p[0]:0);var best=0;for(var i=0;i<sel.options.length;i++)if(+sel.options[i].value<=cur)best=i;sel.selectedIndex=best;
   bk.classList.toggle("closed",!single&&s===0);el.querySelector("#bkp").disabled=s===0;el.querySelector("#bkn").disabled=s>=spreads()-1}
  paint(ST.s);
  function go(t){t=clamp(t);if(t===ST.s||busy)return;
   var from=ST.s,dir=t>from?1:-1,pf=pair(from),pt=pair(t);
   if(!motionOn()||Math.abs(t-from)>1&&false){ST.s=t;paint(t);return}
   busy=1;var leaf=document.createElement("div");leaf.className="bk-leaf";
   if(Math.abs(t-from)>1){/* long jump: turn once, landing on target */}
   if(dir>0){leaf.innerHTML='<div class="bk-fr">'+pageHtml(B,pf[1])+'</div><div class="bk-bc">'+(single?'<div class="bk-pg bk-blank"></div>':pageHtml(B,pt[0]))+'</div>';
    paint(from,null,pageHtml(B,pt[1]));R.appendChild(leaf);leaf.style.transform="rotateY(0deg)";
    requestAnimationFrame(function(){requestAnimationFrame(function(){leaf.style.transform="rotateY("+(single?-110:-180)+"deg)";if(single)leaf.style.opacity="0"})})}
   else{leaf.innerHTML='<div class="bk-fr">'+pageHtml(B,pt[1])+'</div><div class="bk-bc">'+(single?'<div class="bk-pg bk-blank"></div>':pageHtml(B,pf[0]))+'</div>';
    paint(from,single?null:pageHtml(B,pt[0]),null);R.appendChild(leaf);leaf.style.transform="rotateY("+(single?-110:-180)+"deg)";if(single)leaf.style.opacity="0";
    requestAnimationFrame(function(){requestAnimationFrame(function(){leaf.style.transform="rotateY(0deg)";leaf.style.opacity="1"})})}
   var done=function(){if(!busy)return;busy=0;ST.s=t;paint(t)};leaf.addEventListener("transitionend",function(e){if(e.target===leaf&&e.propertyName==="transform")done()});setTimeout(done,900)}
  function step(d){go(ST.s+d)}
  el.querySelector("#bkp").onclick=function(){step(-1)};el.querySelector("#bkn").onclick=function(){step(1)};
  sel.onchange=function(){go(sOf(+sel.value))};
  el.addEventListener("click",function(e){var a=e.target.closest("[data-p]");if(a){e.preventDefault();go(sOf(+a.dataset.p));return}
   if(e.target.closest("a"))return;var pg=e.target.closest(".bk-pg");if(!pg)return;var r=pg.getBoundingClientRect();if(e.clientX>r.left+r.width*0.62&&pg.closest("#bkr")||(single&&e.clientX>r.left+r.width*0.62))step(1);else if(e.clientX<r.left+r.width*0.38&&(pg.closest("#bkl")||single))step(-1);else if(ST.s===0)step(1)});
  var kd=function(e){if(!document.body.contains(bk)){document.removeEventListener("keydown",kd);return}if(/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement||{}).tagName||""))return;if(e.key==="ArrowRight"){step(1);e.preventDefault()}else if(e.key==="ArrowLeft"){step(-1);e.preventDefault()}};document.addEventListener("keydown",kd);
  var sx=null;bk.addEventListener("touchstart",function(e){sx=e.touches[0].clientX},{passive:true});bk.addEventListener("touchend",function(e){if(sx==null)return;var d=e.changedTouches[0].clientX-sx;sx=null;if(Math.abs(d)>50)step(d<0?1:-1)},{passive:true});
  var rs=function(){if(!document.body.contains(bk)){window.removeEventListener("resize",rs);return}if(wide()===single){window.removeEventListener("resize",rs);document.removeEventListener("keydown",kd);if(window.CATRE)window.CATRE()}};window.addEventListener("resize",rs)}
 return{mount:mount,itemNo:itemNo}})();
