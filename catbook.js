/* Mail-order catalog mode (#/catalog), v2.
   The collection laid out like a glossy 1990s software-store mail catalog.
   Page turns are a real bending leaf: the page is cut into strips, each strip gets its own angle every
   animation frame, with shading that follows the curl and a shadow cast onto the page underneath.
   Click, press the arrow keys, swipe, or grab a page and drag it. Hover a lower page corner to peek.
   Everything honours the site Motion switch and prefers-reduced-motion. */
var CMBook=(function(){
 var ST={s:0};
 var PAL=["#c3202f","#10307a","#0b7a4b","#d97b00","#7a2a8c","#0c7fa0","#b5380e","#3a3a9e"];
 function E(s){return esc(s)}
 function all(){return window.ALLITEMS||ITEMS}
 function itemNo(it){var n=it.cm||all().indexOf(it)+1;return"CM-"+(n<1000?("000"+n).slice(-4):n)}
 function motionOn(){return document.documentElement.getAttribute("data-motion")!=="off"&&!(window.matchMedia&&matchMedia("(prefers-reduced-motion:reduce)").matches)}
 function wide(){return window.innerWidth>=900}
 function gl(n,s){return typeof pxCat==="function"?pxCat(n,s):""}
 function col(c){return PAL[hstr(String(c))%PAL.length]}
 function blurb(it){var t=String(it.text||"").replace(/\s+/g," ").trim();if(!t)return"";var m=t.match(/^.{40,150}?[.!?](\s|$)/);return m?m[0].trim():t.slice(0,130)+(t.length>130?"...":"")}
 function isNew(it){if(!it.acquired)return false;var d=Date.parse(it.acquired);return!!d&&Date.now()>=d&&(Date.now()-d)<150*864e5}
 function srcSm(it){return typeof srcBadge==="function"?srcBadge(it):""}
 /* ---------- sound: a short paper swish made from filtered noise. Off until the reader turns it on. ---------- */
 var AC=null;
 function sndOn(){try{return localStorage.getItem("cm-booksnd")==="1"}catch(e){return false}}
 function swish(v){if(!sndOn()||!motionOn())return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume();
  var len=Math.floor(AC.sampleRate*(0.14+0.22*(1-v))),b=AC.createBuffer(1,len,AC.sampleRate),d=b.getChannelData(0);for(var i=0;i<len;i++){var t=i/len;d[i]=(Math.random()*2-1)*Math.sin(Math.PI*t)*Math.pow(1-t,0.6)}
  var s=AC.createBufferSource();s.buffer=b;var f=AC.createBiquadFilter();f.type="bandpass";f.Q.value=0.8;f.frequency.setValueAtTime(900,AC.currentTime);f.frequency.exponentialRampToValueAtTime(3200,AC.currentTime+len/AC.sampleRate);
  var g=AC.createGain();g.gain.value=0.16;s.connect(f);f.connect(g);g.connect(AC.destination);s.start()}catch(e){}}
 /* ---------- one catalog entry ---------- */
 function stickers(it,pick){var h="";if(pick)h+='<span class="bk-stk">Staff pick</span>';if(isNew(it))h+='<span class="bk-stk new">NEW!</span>';return h?'<span class="bk-stks">'+h+'</span>':""}
 function entry(it,mode,i,pick){var sp=(typeof pickSpecs==="function"?pickSpecs(it,it.type):[]).slice(0,mode==="big"?5:3),t=it.score!=null?tier(it.score):null;
  return'<a class="bk-it bk-m-'+mode+(wishOn(it)?" wished":"")+'" href="#/item/'+E(it.id)+'" style="--i:'+i+';--c:'+col(it.cat)+'"><div class="bk-ph">'+String(pic(it)).replace(/xMidYMid slice/g,"xMidYMid meet")+stickers(it,pick)+(t?'<span class="bk-burst" style="background:'+t.c+';color:'+inkOn(t.c)+'"><b>'+it.score+'K</b><i>'+E(t.l)+'</i></span>':"")+'</div>'
   +'<div class="bk-tx"><small class="bk-no">Item No. '+itemNo(it)+(it.status?' &middot; '+E(it.status):"")+'</small><h4>'+E(it.name)+'</h4><p class="bk-mk">'+E(it.maker||"")+(it.year?', '+it.year:"")+'</p>'
   +(mode==="big"?'<p class="bk-bl">'+E(blurb(it))+'</p>':"")
   +(sp.length&&mode!=="list"?'<ul>'+sp.map(function(x){return'<li><b>'+E(x[0])+':</b> '+E(String(x[1]).slice(0,34))+'</li>'}).join("")+'</ul>':(mode==="list"?'<p class="bk-bl">'+E(blurb(it))+'</p>':""))
   +srcSm(it)+'<span class="bk-go">See the exhibit &raquo;</span></div><span class="bk-wish'+(wishOn(it)?" on":"")+'" role="button" tabindex="0" data-wish="'+E(it.id)+'" aria-pressed="'+wishOn(it)+'" title="Circle it to add it to your wish list">'+(wishOn(it)?"&#9829; Circled!":"&#9825; Circle it")+'</span></a>'}
 function wishOn(it){return typeof wishHas==="function"&&wishHas("i:"+it.id)}
 /* ---------- the whole book as a list of pages ---------- */
 function build(){
  var cats=[],by={};ITEMS.forEach(function(i){if(!by[i.cat]){by[i.cat]=[];cats.push(i.cat)}by[i.cat].push(i)});
  var one=!wide(),P=[],toc=[],facts={};
  P.push({k:"cover"});P.push({k:"welcome"});P.push({k:"toc"});
  cats.forEach(function(c,ci){var l=by[c].slice().sort(function(a,b){return(a.year||0)-(b.year||0)}),sc=l.filter(function(i){return i.score!=null}).sort(function(a,b){return b.score-a.score}),yrs=l.map(function(i){return i.year}).filter(Boolean);
   facts[c]={c:c,l:l,top:sc[0]||null,min:yrs.length?Math.min.apply(null,yrs):null,max:yrs.length?Math.max.apply(null,yrs):null,avg:sc.length?Math.round(sc.reduce(function(a,i){return a+i.score},0)/sc.length):null};
   if(!one&&P.length%2===0&&P.length>3){var pc=cats[ci-1];P.push({k:"corner",c:pc,f:facts[pc]})}
   toc.push({c:c,n:l.length,p:P.length});P.push({k:"div",c:c,n:l.length,f:facts[c],ci:ci});
   var rem=l.slice(),pi=0;
   while(rem.length){var take=one?3:(pi%2?4:3);take=Math.min(take,rem.length);if(!one&&rem.length-take===1&&take>2)take--;var chunk=rem.splice(0,take);P.push({k:"items",c:c,l:chunk,lay:one?"list":(chunk.length===4?"grid":"hero"),top:facts[c].top});pi++}});
  var idx=ITEMS.map(function(i){return{it:i,p:0}});P.forEach(function(pg,n){if(pg.k==="items")pg.l.forEach(function(it){idx.forEach(function(x){if(x.it===it)x.p=n})})});
  idx.sort(function(a,b){return a.it.name.localeCompare(b.it.name)});
  var per=one?26:46,ixStart=P.length;
  for(var j=0;j<idx.length;j+=per)P.push({k:"index",l:idx.slice(j,j+per),first:j===0});
  if(!one&&P.length%2===0)P.push({k:"corner",c:null,f:null});
  var ordN=P.length;P.push({k:"order"});P.push({k:"back"});
  return{P:P,toc:toc,cats:cats,ix:ixStart,ord:ordN,one:one}}
 function pageHtml(B,n){var pg=B.P[n];if(!pg)return'<div class="bk-pg bk-blank"></div>';
  var f='<div class="bk-pn"><span>'+(n+1)+'</span><em>Conventional Memory &middot; Museum Catalog</em></div>',h;
  var running=pg.c?'<div class="bk-run" style="--c:'+col(pg.c)+'"><span>'+gl(pg.c,16)+E(pg.c)+'</span><i>Section '+(B.cats.indexOf(pg.c)+1)+'</i></div>':"";
  if(pg.k==="cover")h='<div class="bk-pg bk-cover"><div class="bk-foil"></div><div class="bk-ct"><small>THE BIG BOOK OF</small><h3><span>Conventional</span><span>Memory</span></h3><p class="bk-sub">MUSEUM CATALOG</p><div class="bk-px">'+gl("Computers",44)+gl("Sound cards",44)+gl("Keyboards",44)+'</div><span class="bk-seal"><b>'+ITEMS.length+'</b>exhibits<br>inside!</span><p class="bk-cs">Volume 1 &middot; '+new Date().getFullYear()+' Edition</p></div><p class="bk-lab">Mailed to:<br><b>Our Fellow Collector</b></p><p class="bk-hint">Click, tap or drag the page to open &raquo;</p></div>';
  else if(pg.k==="welcome")h='<div class="bk-pg bk-wel"><h3 class="bk-h">Welcome, collector!</h3><p>You are holding the big book of every exhibit in the museum. Flip through it like a mail-order catalog: nothing here is for sale, and everything is worth a look.</p><div class="bk-leg"><div><span class="bk-burst" style="background:#ffd23f;color:#000"><b>320K</b><i>Score</i></span><p>The burst is the exhibit&rsquo;s score out of 640K.</p></div><div><span class="bk-stk">Staff pick</span><p>Highest scored in its section.</p></div><div><span class="bk-stk new">NEW!</span><p>Added to the shelves in the last five months.</p></div><div>'+(typeof srcBadge==="function"?srcBadge({src:"ebay"}):"")+'<p>Found it at an online auction. The tag says where.</p></div></div><h4 class="bk-h2">How to turn the pages</h4><ul class="bk-how"><li>Click a page edge, or press the arrow keys.</li><li>Grab a page and drag it, like paper.</li><li>Hover a lower corner to peek at the next page.</li><li>Use the colored tabs to jump to a section.</li></ul><p class="bk-note">Prefer a plain list or table? Switch to Pro style at the top.</p>'+f+'</div>';
  else if(pg.k==="toc")h='<div class="bk-pg"><h3 class="bk-h">What&rsquo;s inside</h3><ol class="bk-toc">'+B.toc.map(function(t,i){return'<li style="--i:'+i+'"><a href="#" data-p="'+t.p+'" style="--c:'+col(t.c)+'"><span><u></u>'+gl(t.c,16)+E(t.c)+' <small>('+t.n+')</small></span><i></i><b>'+(t.p+1)+'</b></a></li>'}).join("")+'<li style="--i:'+B.toc.length+'"><a href="#" data-p="'+B.ix+'"><span><u></u>Index of every item</span><i></i><b>'+(B.ix+1)+'</b></a></li><li style="--i:'+(B.toc.length+1)+'"><a href="#" data-p="'+B.ord+'"><span><u></u>Order form and how to help</span><i></i><b>'+(B.ord+1)+'</b></a></li></ol>'+f+'</div>';
  else if(pg.k==="div")h='<div class="bk-pg bk-div" style="--c:'+col(pg.c)+'"><div class="bk-dots"></div><div class="bk-dv"><small>SECTION '+(pg.ci+1)+'</small><span class="bk-ic">'+gl(pg.c,64)+'</span><h3>'+E(pg.c)+'</h3><p>'+pg.n+' exhibit'+(pg.n===1?"":"s")+(pg.f&&pg.f.min?' &middot; '+pg.f.min+(pg.f.max>pg.f.min?'-'+pg.f.max:""):"")+'</p>'+(pg.f&&pg.f.top?'<div class="bk-pk"><b>Staff pick</b><span>'+E(pg.f.top.name)+'</span></div>':"")+'</div>'+f+'</div>';
  else if(pg.k==="corner"){var q=pg.f;h=q?'<div class="bk-pg bk-corner" style="--c:'+col(pg.c)+'"><h3 class="bk-h sm">Collector&rsquo;s corner: '+E(pg.c)+'</h3><div class="bk-facts"><div><b>'+q.l.length+'</b><span>exhibits</span></div><div><b>'+(q.min?(q.max>q.min?q.min+"-"+q.max:q.min):"?")+'</b><span>years covered</span></div><div><b>'+(q.avg!=null?q.avg+"K":"?")+'</b><span>average score</span></div></div>'+(q.top?'<div class="bk-spot"><small>Top of the section</small><a href="#/item/'+E(q.top.id)+'"><b>'+E(q.top.name)+'</b><span>'+E(q.top.maker||"")+(q.top.year?', '+q.top.year:"")+' &middot; '+q.top.score+'K</span></a></div>':"")+'<h4 class="bk-h2">Roll call</h4><ul class="bk-roll">'+q.l.slice(0,10).map(function(it){var t=it.score!=null?tier(it.score):null;return'<li><a href="#/item/'+E(it.id)+'"><span>'+E(it.name)+'</span><i></i><em>'+(it.year||"")+'</em>'+(t?'<b style="background:'+t.c+';color:'+inkOn(t.c)+'">'+it.score+'K</b>':"")+'</a></li>'}).join("")+'</ul>'+(q.l.length>10?'<p class="bk-note">...and '+(q.l.length-10)+' more in this section.</p>':"")+'<div class="bk-cut">- - - - clip the coupon - - - -</div><p class="bk-note">Tip: tap any exhibit to open its full page, with specs, history and photos.</p>'+f+'</div>':'<div class="bk-pg bk-corner"><h3 class="bk-h sm">Notes</h3><div class="bk-lines"></div>'+f+'</div>'}
  else if(pg.k==="items"){var also="";if(pg.lay==="hero"&&pg.l.length<3){var ci=B.cats.indexOf(pg.c),more=[];for(var z=1;z<B.cats.length&&more.length<(pg.l.length===1?5:3);z++)more.push(B.toc[(ci+z)%B.toc.length]);also='<div class="bk-also"><b>Also in this catalog</b>'+more.map(function(t){return'<a href="#" data-p="'+t.p+'" class="bk-chip" style="--c:'+col(t.c)+'">'+gl(t.c,16)+E(t.c)+'</a>'}).join("")+'</div>'}
   h='<div class="bk-pg bk-lay-'+pg.lay+(pg.lay==="hero"?" n"+pg.l.length:"")+'">'+running+'<div class="bk-its">'+pg.l.map(function(it,i){return entry(it,pg.lay==="hero"?(i===0?"big":"small"):pg.lay==="list"?"list":"grid",i,pg.top===it)}).join("")+also+'</div>'+f+'</div>'}
  else if(pg.k==="index")h='<div class="bk-pg"><h3 class="bk-h sm">'+(pg.first?"Index of every item":"Index (continued)")+'</h3><ul class="bk-ix">'+pg.l.map(function(x){return'<li><a href="#" data-p="'+x.p+'"><span>'+E(x.it.name)+'</span><i></i><b>'+(x.p+1)+'</b></a></li>'}).join("")+'</ul>'+f+'</div>';
  else if(pg.k==="order")h='<div class="bk-pg bk-order"><h3 class="bk-h">Order form</h3><p>Nothing here is for sale. Every exhibit belongs to the museum. But you can still send in your order:</p><div class="bk-ord"><a href="#/wanted"><b>Wanted list</b><span>Help me find these missing pieces.</span></a><a href="#/community"><b>Send a memory</b><span>Tell the story of your first PC.</span></a><a href="#/mine"><b>My collection</b><span>Keep your own own/want/trade lists.</span></a><a href="#/tours"><b>Take a tour</b><span>Guided walks through the timeline.</span></a></div><p class="bk-cut">- - - - - - - cut along the dotted line - - - - - - -</p><p class="bk-note">Thanks for browsing. Turn back to the front any time.</p>'+f+'</div>';
  else h='<div class="bk-pg bk-backc"><div class="bk-bt"><h3>Thanks for flipping!</h3><p>Please keep this catalog for future reference.</p><div class="bk-bar"></div><small>CM-'+new Date().getFullYear()+'-'+ITEMS.length+'</small></div></div>';
  return h}
 /* ---------- the mounted book ---------- */
 function mount(el){
  var B=build(),N=B.P.length,single=B.one,T=null,raf=0,mark=-1,drag=null,moved=false,q=null;
  try{var mk=localStorage.getItem("cm-bkmark");mark=mk==null||mk===""||!isFinite(+mk)?-1:+mk}catch(e){mark=-1}
  var S=single?N:Math.floor(N/2)+1;
  function pair(s){return single?[null,s]:[s*2-1,s*2]}
  function clamp(s){return Math.max(0,Math.min(S-1,s))}
  ST.s=clamp(ST.s);
  var tabs=single?"":'<div class="bk-tabs">'+B.toc.map(function(t){return'<button type="button" class="bk-tab" data-p="'+t.p+'" data-cat="'+E(t.c)+'" style="--c:'+col(t.c)+'" title="'+E(t.c)+'" aria-label="Jump to '+E(t.c)+'"><span>'+E(t.c.length>6?t.c.slice(0,5)+".":t.c)+'</span></button>'}).join("")+'</div>';
  el.innerHTML='<div class="bk-wrap"><div class="bk-desk"><div class="bk-stage"><div class="bk-book'+(single?" one":"")+'" id="bkb" tabindex="0" aria-label="Catalog book. Use the left and right arrow keys to turn pages."><div class="bk-half bk-L" id="bkl"></div><div class="bk-half bk-R" id="bkr"></div><div class="bk-rib" id="bkrib" hidden></div>'+tabs+'</div></div></div>'
   +'<div class="bk-ctl"><button class="btn" id="bkp" type="button">&laquo; Previous</button><label class="bk-jump">Jump to <select id="bkj" aria-label="Jump to a section"></select></label><span id="bkpg" class="tn" role="status"></span><button class="btn pri" id="bkn" type="button">Next &raquo;</button></div>'
   +'<div class="bk-ctl2"><label class="bk-thumb">Thumb through <input id="bks" type="range" min="0" max="'+(S-1)+'" value="'+ST.s+'" aria-label="Thumb through the pages"></label><button class="btn" id="bkm" type="button" aria-pressed="false">Mark this page</button><button class="btn" id="bkg" type="button" hidden>Go to my mark</button><button class="btn" id="bkz" type="button" aria-pressed="false">Page sound: off</button></div></div>';
  var L=el.querySelector("#bkl"),R=el.querySelector("#bkr"),bk=el.querySelector("#bkb"),sel=el.querySelector("#bkj"),lab=el.querySelector("#bkpg"),rib=el.querySelector("#bkrib"),sld=el.querySelector("#bks"),bm=el.querySelector("#bkm"),bg=el.querySelector("#bkg"),bz=el.querySelector("#bkz");
  sel.innerHTML='<option value="0">Cover</option><option value="2">Contents</option>'+B.toc.map(function(t){return'<option value="'+t.p+'">'+E(t.c)+'</option>'}).join("")+'<option value="'+B.ix+'">Index</option><option value="'+B.ord+'">Order form</option>';
  function sOf(p){return single?p:Math.ceil(p/2)}
  function pageNode(n){var d=document.createElement("div");d.innerHTML=pageHtml(B,n);return d.firstChild}
  function setHalf(h,n,anim){h.innerHTML=pageHtml(B,n);h.classList.remove("bk-in");if(anim&&motionOn()){void h.offsetWidth;h.classList.add("bk-in")}}
  function unit(){bk.style.setProperty("--u",(R.clientWidth/100).toFixed(3)+"px")}
  unit();var ro=window.ResizeObserver?new ResizeObserver(function(){if(!document.body.contains(bk)){ro.disconnect();return}if(!T)unit()}):null;if(ro)ro.observe(bk);
  /* book dressing that depends on the spread: page-stack thickness, centering the closed cover */
  function dress(s,o){var fr=S>1?s/(S-1):0;bk.style.setProperty("--tl",(single?0:2+14*fr).toFixed(1)+"px");bk.style.setProperty("--tr",(single?0:2+14*(1-fr)).toFixed(1)+"px");
   if(!single){var open=o!=null?o:(s===0?0:1);bk.style.transform="translateX("+(-25*(1-open)).toFixed(2)+"%)";L.style.opacity=Math.min(1,open*2.2).toFixed(2)}}
  function chrome(s){var p=pair(s);
   lab.textContent=(single?"Page "+(s+1):(s===0?"Cover":"Pages "+(p[0]+1)+(p[1]<N?"-"+(p[1]+1):"")))+" of "+N;
   var cur=single?s:Math.max(0,p[0]);var best=0;for(var i=0;i<sel.options.length;i++)if(+sel.options[i].value<=cur)best=i;sel.selectedIndex=best;
   el.querySelector("#bkp").disabled=s===0;el.querySelector("#bkn").disabled=s>=S-1;sld.value=s;
   var cat=null;[p[0],p[1]].forEach(function(n){if(n!=null&&B.P[n]&&B.P[n].c)cat=B.P[n].c});
   el.querySelectorAll(".bk-tab").forEach(function(t){t.classList.toggle("on",t.dataset.cat===cat)});
   var here=mark>=0&&(p[0]===mark||p[1]===mark);rib.hidden=!here;bm.textContent=here?"Remove my mark":"Mark this page";bm.setAttribute("aria-pressed",here?"true":"false");bg.hidden=mark<0||here;
   bz.textContent="Page sound: "+(sndOn()?"on":"off");bz.setAttribute("aria-pressed",sndOn()?"true":"false");
   bk.classList.toggle("closed",!single&&s===0)}
  function paint(s,anim){var p=pair(s);if(!single)setHalf(L,p[0],false);setHalf(R,p[1],anim);dress(s);chrome(s)}
  paint(ST.s,false);
  /* ---------- the bending leaf ---------- */
  function makeLeaf(front,back,n){
   var W=R.clientWidth,H=R.clientHeight,sw=W/n,leaf=document.createElement("div"),strips=[],parent=leaf;
   leaf.className="bk-leaf";leaf.style.cssText="width:"+W+"px;height:"+H+"px";
   for(var i=0;i<n;i++){var st=document.createElement("div");st.className="bk-st";st.style.cssText="width:"+(sw+(i<n-1?0.8:0)).toFixed(2)+"px;height:"+H+"px;left:"+(i?sw.toFixed(3):0)+"px";
    var sf=document.createElement("div");sf.className="bk-sf";var fi=document.createElement("div");fi.className="bk-si";fi.style.cssText="width:"+W+"px;height:"+H+"px;left:"+(-i*sw).toFixed(3)+"px";fi.appendChild(front.cloneNode(true));var fs=document.createElement("div");fs.className="bk-ss";sf.appendChild(fi);sf.appendChild(fs);
    var sb=document.createElement("div");sb.className="bk-sb";var bi=document.createElement("div");bi.className="bk-si";bi.style.cssText="width:"+W+"px;height:"+H+"px;left:"+(-(n-1-i)*sw).toFixed(3)+"px";bi.appendChild(back.cloneNode(true));var bs=document.createElement("div");bs.className="bk-ss";sb.appendChild(bi);sb.appendChild(bs);
    st.appendChild(sf);st.appendChild(sb);parent.appendChild(st);parent=st;strips.push({st:st,fs:fs,bs:bs})}
   return{el:leaf,n:n,strips:strips}}
  /* a = 0 flat on the right, 180 flat on the left. Strip angles sum to a, with more turn near the spine mid-flip so the outer edge trails. */
  function setAng(lf,a){var n=lf.n,bend=n===1?0:0.9*Math.sin(Math.PI*a/180),cum=0;
   for(var i=0;i<n;i++){var d=(a/n)*(1+bend*(((n-1)/2-i)/(n/2)));cum+=d;var s=lf.strips[i];s.st.style.transform="rotateY("+(-d).toFixed(3)+"deg)";
    var cr=Math.min(180,Math.max(0,cum)),sh=cr<=90?0.5*Math.pow(cr/90,1.4):0.5*Math.pow((180-cr)/90,1.4);
    s.fs.style.opacity=cr<=90?sh.toFixed(3):0;s.bs.style.opacity=cr>90?sh.toFixed(3):0}}
  /* the shadow the lifted leaf casts on the page underneath, anchored at its moving tip */
  var shR=document.createElement("div"),shL=document.createElement("div");shR.className="bk-shd";shL.className="bk-shd";
  function shade(a){var r=a*Math.PI/180,W=R.clientWidth,al=(0.34*Math.sin(r)).toFixed(3);
   if(a<=90){var e=W*Math.cos(r);shR.style.background="linear-gradient(90deg,transparent "+e.toFixed(0)+"px,rgba(30,15,0,"+al+") "+(e+1).toFixed(0)+"px,transparent "+(e+W*0.3).toFixed(0)+"px)";shR.style.display="";shL.style.display="none"}
   else{var e2=W*(-Math.cos(r));shL.style.background="linear-gradient(270deg,transparent "+(e2).toFixed(0)+"px,rgba(30,15,0,"+al+") "+(e2+1).toFixed(0)+"px,transparent "+(e2+W*0.3).toFixed(0)+"px)";shL.style.display="";shR.style.display="none"}}
  function applyAng(a){if(!T)return;T.a=a;setAng(T.leaf,a);shade(a);if(!single&&(T.from===0||T.to===0))dress(1,a/180)}
  function begin(dir,to,n,a0){
   if(T)return false;var from=ST.s,pf=pair(from),pt=pair(to),front,back;
   T={dir:dir,from:from,to:to,a:0,mode:"anim",leaf:null};
   if(dir>0){front=pageNode(pf[1]);back=single?pageNode(-1):pageNode(pt[0]);setHalf(R,pt[1],true)}
   else{front=pageNode(pt[1]);back=single?pageNode(-1):pageNode(pf[0]);if(!single)setHalf(L,pt[0],true)}
   T.leaf=makeLeaf(front,back,n);R.appendChild(shR);if(!single)L.appendChild(shL);R.appendChild(T.leaf.el);R.classList.add("turning");
   applyAng(a0!=null?a0:(dir>0?0:180));return true}
  function end(commit){if(!T)return;var t=T;T=null;R.classList.remove("turning");[t.leaf.el,shR,shL].forEach(function(n){if(n.parentNode)n.parentNode.removeChild(n)});
   if(commit){ST.s=t.to;var p=pair(t.to);if(t.dir>0){if(!single)setHalf(L,p[0],false)}else setHalf(R,p[1],false);if(single&&t.dir>0){/* R already shows the new page */}dress(t.to);chrome(t.to)}
   else paint(t.from,false);
   unit();if(q!=null){var g=q;q=null;go(g)}}
  function ease(x){return x<0.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2}
  function anim(target,dur,done,linear){if(!T)return;cancelAnimationFrame(raf);var a0=T.a,t0=0,d=Math.max(70,dur*Math.min(1,Math.abs(target-a0)/180+0.2)),tt=T;
   raf=requestAnimationFrame(function tick(now){if(T!==tt)return;if(!t0)t0=now;var x=Math.min(1,(now-t0)/d);applyAng(a0+(target-a0)*(linear?x:ease(x)));if(x<1)raf=requestAnimationFrame(tick);else if(done)done()})}
  function finishTurn(){if(!T)return;end(T.dir>0?T.a>=179.5:T.a<=0.5)}
  function turn(dir,to,fast,after){if(T)return false;to=clamp(to);if(to===ST.s)return false;
   if(!motionOn()){ST.s=to;paint(to,false);after&&after();return true}
   if(!begin(dir,to,fast?1:(single?6:9)))return false;swish(fast?0.9:0.4);
   anim(dir>0?180:0,fast?150:780,function(){finishTurn();after&&after()},fast);return true}
  function go(t){t=clamp(t);if(t===ST.s&&!T)return;
   if(T&&T.mode==="peek"){cancelAnimationFrame(raf);end(false)}
   if(T){q=t;return}
   var from=ST.s,dir=t>from?1:-1,gap=Math.abs(t-from);
   if(gap>1&&motionOn()){var steps=Math.min(5,gap-1),seq=[];for(var i=1;i<=steps;i++)seq.push(from+dir*Math.round(i*(gap-1)/steps));seq.push(t);
    (function next(k){if(k>=seq.length||seq[k]===ST.s){return}var last=k===seq.length-1;if(!turn(dir,seq[k],!last,function(){next(k+1)}))return})(0)}
   else turn(dir,t,false)}
  function step(d){go((q!=null?q:ST.s)+d)}
  /* ---------- hover peek and drag to turn ---------- */
  function absAng(e){var r=R.getBoundingClientRect(),dx=(e.clientX-r.left)/r.width;return Math.acos(Math.max(-1,Math.min(1,dx)))*180/Math.PI}
  function pageSide(e){var r=bk.getBoundingClientRect();return single?"R":(e.clientX>r.left+r.width/2?"R":"L")}
  bk.addEventListener("pointerdown",function(e){if(e.button&&e.button!==0)return;if(!motionOn()||e.target.closest(".bk-tab"))return;if(T&&T.mode!=="peek")return;
   var side=pageSide(e);if(side==="R"&&ST.s>=S-1)return;if(side==="L"&&ST.s<=0)return;
   drag={x:e.clientX,y:e.clientY,side:side,id:e.pointerId,started:false,a0:absAng(e),last:null,lt:0,v:0};moved=false});
  function pm(e){if(!document.body.contains(bk)){window.removeEventListener("pointermove",pm);window.removeEventListener("pointerup",up);window.removeEventListener("pointercancel",up);return}
   if(drag&&drag.id===e.pointerId){var dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    if(!drag.started){if(Math.abs(dx)<8||Math.abs(dy)>Math.abs(dx)*1.2)return;if((drag.side==="R"&&dx>0)||(drag.side==="L"&&dx<0)){drag=null;return}
     if(T&&T.mode==="peek"){cancelAnimationFrame(raf);end(false)}
     var dir=drag.side==="R"?1:-1;if(!begin(dir,clamp(ST.s+dir),single?6:9)){drag=null;return}
     T.mode="drag";drag.started=true;moved=true;bk.classList.add("grab");try{bk.setPointerCapture(e.pointerId)}catch(_){}swish(0.5)}
    if(T&&T.mode==="drag"){var a,W=R.clientWidth;if(single)a=drag.side==="R"?-dx/W*180*1.15:180-dx/W*180*1.15;else a=(drag.side==="R"?0:180)+(absAng(e)-drag.a0);
     a=Math.max(1,Math.min(179,a));if(drag.last!=null)drag.v=(a-drag.last)/Math.max(1,e.timeStamp-drag.lt);drag.last=a;drag.lt=e.timeStamp;applyAng(a)}
    return}
   if(e.pointerType==="touch")return;var r=bk.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom){peekEnd();return}if(T&&T.mode!=="peek")return;
   var side=pageSide(e),edge=side==="R"?(e.clientX-(single?r.left:r.left+r.width/2))/(single?r.width:r.width/2):((r.left+r.width/2)-e.clientX)/(r.width/2),low=(e.clientY-r.top)/r.height>0.55;
   if(edge>0.8&&low&&motionOn()&&((side==="R"&&ST.s<S-1)||(side==="L"&&!single&&ST.s>0))){if(!T)peekStart(side==="R"?1:-1)}else peekEnd()}
  function peekStart(dir){if(T)return;if(!begin(dir,clamp(ST.s+dir),single?4:7))return;T.mode="peek";anim(dir>0?22:158,260)}
  function peekEnd(){if(T&&T.mode==="peek"){var t=T;anim(t.dir>0?0:180,220,function(){if(T===t)end(false)})}}
  function up(e){if(!drag||drag.id!==e.pointerId)return;var d=drag;drag=null;bk.classList.remove("grab");try{bk.releasePointerCapture(e.pointerId)}catch(_){}
   if(!d.started||!T||T.mode!=="drag")return;
   var dir=T.dir,a=T.a,v=d.v,done=dir>0?((a>90&&v>-0.15)||v>0.15):((a<90&&v<0.15)||v<-0.15);
   T.mode="anim";anim(done?(dir>0?180:0):(dir>0?0:180),460,finishTurn);setTimeout(function(){moved=false},80)}
  window.addEventListener("pointermove",pm);window.addEventListener("pointerup",up);window.addEventListener("pointercancel",up);
  bk.addEventListener("pointerleave",peekEnd);bk.addEventListener("dragstart",function(e){e.preventDefault()});
  /* ---------- clicks, keys, controls ---------- */
  el.querySelector("#bkp").onclick=function(){step(-1)};el.querySelector("#bkn").onclick=function(){step(1)};
  sel.onchange=function(){go(sOf(+sel.value))};
  sld.oninput=function(){if(T)return;ST.s=clamp(+sld.value);paint(ST.s,false);swish(0.9)};
  bm.onclick=function(){var p=pair(ST.s),here=mark>=0&&(p[0]===mark||p[1]===mark);mark=here?-1:(p[0]!=null&&p[0]>=0?p[0]:p[1]);try{localStorage.setItem("cm-bkmark",String(mark))}catch(e){}chrome(ST.s)};
  bg.onclick=function(){if(mark>=0)go(sOf(mark))};
  bz.onclick=function(){try{localStorage.setItem("cm-booksnd",sndOn()?"0":"1")}catch(e){}chrome(ST.s);if(sndOn())swish(0.5)};
  function circle(e){var w=e.target.closest&&e.target.closest(".bk-wish");if(!w)return false;e.preventDefault();e.stopPropagation();var on=wishToggle("i:"+w.dataset.wish);w.classList.toggle("on",on);w.setAttribute("aria-pressed",on);w.innerHTML=on?"&#9829; Circled!":"&#9825; Circle it";var a=w.closest(".bk-it");if(a)a.classList.toggle("wished",on);return true}
  el.addEventListener("click",function(e){circle(e)},true);el.addEventListener("keydown",function(e){if((e.key==="Enter"||e.key===" ")&&e.target.classList&&e.target.classList.contains("bk-wish")){circle(e)}},true);
  el.addEventListener("click",function(e){if(moved){e.preventDefault();e.stopPropagation();moved=false;return}
   var a=e.target.closest("[data-p]");if(a){e.preventDefault();go(sOf(+a.dataset.p));return}
   if(e.target.closest("a,button,select,input,label"))return;var pg=e.target.closest(".bk-pg");if(!pg)return;var r=pg.getBoundingClientRect(),inR=!!pg.closest("#bkr");
   if(ST.s===0)step(1);else if(inR&&e.clientX>r.left+r.width*0.62)step(1);else if((!inR||single)&&e.clientX<r.left+r.width*0.38)step(-1)},true);
  var kd=function(e){if(!document.body.contains(bk)){document.removeEventListener("keydown",kd);return}if(/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement||{}).tagName||""))return;
   if(e.key==="ArrowRight"||e.key==="PageDown"){step(1);e.preventDefault()}else if(e.key==="ArrowLeft"||e.key==="PageUp"){step(-1);e.preventDefault()}else if(e.key==="Home"){go(0);e.preventDefault()}else if(e.key==="End"){go(S-1);e.preventDefault()}};document.addEventListener("keydown",kd);
  var rs=function(){if(!document.body.contains(bk)){window.removeEventListener("resize",rs);return}if(wide()===single){window.removeEventListener("resize",rs);document.removeEventListener("keydown",kd);if(window.CATRE)window.CATRE()}};window.addEventListener("resize",rs);
  /* test hook so the checks can freeze a turn at a chosen angle */
  el.__book={begin:function(d){return begin(d,clamp(ST.s+d),single?6:9)},ang:applyAng,end:end,state:function(){return{s:ST.s,S:S,N:N,busy:!!T}},go:go,pages:B.P.length}
 }
 return{mount:mount,itemNo:itemNo}})();
