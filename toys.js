/* Toy-store features, loaded on demand: #/wish (wish list, Dear Santa letter, shareable list), #/kiosk (demo kiosk),
   #/prizes (prize counter) and #/backup (save and restore everything kept on this device).
   Everything here lives in the browser; nothing is sent anywhere. */
var CMToys=(function(){
 var app,KS={t:0,idle:0,el:null,kh:null,mode:"attract",n:0};
 function E(s){return esc(s==null?"":String(s))}
 function $(s){return app.querySelector(s)}
 function $$(s){return[].slice.call(app.querySelectorAll(s))}
 function ld(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}}
 function sv(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
 function glyph(n,z){return typeof px==="function"?px(n,z||18):""}
 function tlHref(r){return"#/timeline/"+String(r[0]).slice(0,4)+"/"+encodeURIComponent(r[2])}
 function motionOn(){return document.documentElement.getAttribute("data-motion")!=="off"}
 function ebay(q){return"https://www.ebay.com/sch/i.html?_nkw="+encodeURIComponent(q)+"&LH_Sold=0"}
 function sgw(q){return"https://shopgoodwill.com/categories/listing?st="+encodeURIComponent(q)}
 function copy(t,done,fail){if(navigator.clipboard)navigator.clipboard.writeText(t).then(done,fail);else fail()}
 function dl(name,text,type){var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type:type||"text/plain"}));a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500)}

 /* ------------------------------------------------------------------ Wish list */
 function itemById(id){return ALLITEMS.filter(function(i){return i.id===id})[0]}
 function nameOf(k){var v=k.slice(2),r;
  if(k.indexOf("i:")===0){var it=itemById(v);return{n:it?it.name:v,href:it&&!it.draft?"#/item/"+it.id:"",tag:it?"in the museum":""}}
  if(k.indexOf("t:")===0){r=TL.filter(function(z){return z[2]===v})[0];return{n:v,href:r?tlHref(r):"",tag:r?"timeline":""}}
  if(/^[cxw]:/.test(k))return{n:v,href:"",tag:k.charAt(0)==="x"?"accessory":k.charAt(0)==="w"?"museum wanted list":""};
  var g=window.CMLabGap&&CMLabGap(k);return{n:g||"Milestone: "+k,href:"",tag:"milestone"}}
 function rows(){var R={},order=[];function add(k,src,x){if(!k||typeof k!=="string"||k.length>90)return;var r=R[k];if(!r){r=R[k]={k:k,src:[],max:""};order.push(k)}if(r.src.indexOf(src)<0)r.src.push(src);if(x&&x.max)r.max=x.max}
  wishLoad().forEach(function(w){add(w.k,"wish list",w)});
  var M=ld("cm-mine",{});Object.keys(M).forEach(function(k){if(M[k]&&M[k].s==="want")add(k,"my collection")});
  var H=ld("cm-hunt",{want:[],ceil:{}});(H.want||[]).forEach(function(k){add(k,"swap-meet list",{max:(H.ceil||{})[k]})});
  return order.map(function(k){return R[k]})}
 function removeEverywhere(k){wishSave(wishLoad().filter(function(w){return w.k!==k}));var M=ld("cm-mine",{});if(M[k]&&M[k].s==="want"){delete M[k];sv("cm-mine",M)}var H=ld("cm-hunt",{want:[],ceil:{}});H.want=(H.want||[]).filter(function(x){return x!==k});if(H.ceil)delete H.ceil[k];sv("cm-hunt",H)}
 function setMax(k,v){var w=wishLoad(),f=false;w.forEach(function(x){if(x.k===k){x.max=v;f=true}});if(!f)w.push({k:k,t:Date.now(),max:v});wishSave(w)}
 function b64(s){return btoa(unescape(encodeURIComponent(s))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}
 function unb64(s){s=String(s).replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";return decodeURIComponent(escape(atob(s)))}
 function shareCode(keys){return b64(JSON.stringify(keys.slice(0,40).map(function(k){return String(k).slice(0,80)})))}
 function readCode(c){try{var a=JSON.parse(unb64(c));return Array.isArray(a)?a.filter(function(k){return typeof k==="string"&&k.length<=80&&/^[a-z]?:?/.test(k)}).slice(0,40):null}catch(e){return null}}
 function buyLinks(n){return'<a href="'+E(ebay(n))+'" target="_blank" rel="noopener noreferrer">eBay</a> &middot; <a href="'+E(sgw(n))+'" target="_blank" rel="noopener noreferrer">ShopGoodwill</a>'}
 function finder(q){q=q.toLowerCase().trim();if(q.length<2)return[];var w=q.split(/\s+/),out=[];
  ALLITEMS.forEach(function(it){var h=(it.name+" "+(it.maker||"")).toLowerCase();if(w.every(function(x){return h.indexOf(x)>=0}))out.push({k:"i:"+it.id,n:it.name,s:(it.maker||"")+(it.year?" "+it.year:"")})});
  var seen={};TL.forEach(function(r){if(!/^(hw|sw|gt|pe|gn|gc)$/.test(r[1])||seen[r[2]])return;var h=r[2].toLowerCase();if(w.every(function(x){return h.indexOf(x)>=0})){seen[r[2]]=1;out.push({k:"t:"+r[2],n:r[2],s:String(r[0]).slice(0,4)+" timeline"})}});
  return out.slice(0,8)}
 function wish(code){var shared=code?readCode(code):null,mine=!code;
  if(code&&!shared){app.innerHTML='<section><h2>Wish list</h2><p class="empty">That shared list link looks damaged. Ask for a fresh one.</p><p><a class="btn" href="#/wish">My wish list</a></p></section>';return}
  var list=shared?shared.map(function(k){return{k:k,src:[],max:""}}):rows();
  var h='<section class="wsh"><h2>'+(shared?"A wish list from a friend":"My wish list")+'</h2>';
  if(shared)h+='<p>Someone sent you their list. Each item has quick search links, so you can see what is out there. Nothing is bought or tracked from here.</p>';
  else h+='<p>One list for everything you want: circled items from the Wish Book, "Want" marks in My collection, and your swap-meet list. It stays on this device. Circle things in the <a href="#/catalog">mail-order catalog</a>, press <b>Add to wish list</b> on any exhibit, or add one below.</p>';
  if(!mine)h+='<p><button class="btn pri" id="wcopyall" type="button">Copy these to my own list</button> <a class="btn" href="#/wish">My wish list</a></p>';
  if(mine)h+='<div class="wsh-add noprint"><label for="wq">Add something</label> <input id="wq" type="search" placeholder="Sound Blaster, Game Boy, Libretto..." autocomplete="off"><div id="wres" class="wsh-res"></div></div>';
  h+='<div id="wlist">'+listHtml(list,mine)+'</div>';
  if(mine){h+='<div class="wsh-act noprint"><button class="btn pri" id="wlink" type="button">Copy a link to share my list</button> <button class="btn" id="wsan" type="button">Write my Dear Santa letter</button> <button class="btn" id="wprint" type="button">Print</button></div><p id="wmsg" class="tn" role="status"></p><div id="wsanta"></div>'}
  app.innerHTML=h+'</section>';wire(list,mine,shared)}
 function listHtml(list,mine){if(!list.length)return'<p class="empty">Nothing on the list yet. '+(mine?"Search above, or circle something in the catalog.":"")+'</p>';
  return'<ol class="wsh-l">'+list.map(function(r){var n=nameOf(r.k);return'<li><span class="wsh-n">'+(n.href?'<a href="'+E(n.href)+'">'+E(n.n)+'</a>':E(n.n))+(n.tag?' <small class="tn">'+E(n.tag)+'</small>':"")+'</span>'+(mine&&r.src.length?'<small class="tn wsh-s">'+E(r.src.join(", "))+'</small>':"")+'<span class="wsh-b noprint">'+buyLinks(n.n)+'</span>'+(mine?'<label class="wsh-m noprint">Max $ <input data-max="'+E(r.k)+'" inputmode="decimal" value="'+E(r.max||"")+'" size="5" aria-label="Most I would pay for '+E(n.n)+'"></label><button class="btn noprint" data-rm="'+E(r.k)+'" type="button" aria-label="Remove '+E(n.n)+'">&times;</button>':"")+'</li>'}).join("")+'</ol>'}
 function wire(list,mine,shared){
  if(!mine){var c=$("#wcopyall");if(c)c.onclick=function(){var w=wishLoad(),n=0;shared.forEach(function(k){if(!w.some(function(x){return x.k===k})){w.push({k:k,t:Date.now()});n++}});wishSave(w);c.textContent="Copied "+n+" to my list";c.disabled=true};return}
  function redraw(){$("#wlist").innerHTML=listHtml(rows(),true);bindList()}
  function bindList(){$$("[data-rm]").forEach(function(b){b.onclick=function(){removeEverywhere(b.dataset.rm);redraw()}});
   $$("[data-max]").forEach(function(i){i.onchange=function(){var k=i.dataset.max,v=i.value.replace(/[^0-9.]/g,"");i.value=v;setMax(k,v);var H=ld("cm-hunt",{want:[],ceil:{}});if((H.want||[]).indexOf(k)>=0){H.ceil=H.ceil||{};if(v)H.ceil[k]=v;else delete H.ceil[k];sv("cm-hunt",H)}}})}
  bindList();
  var q=$("#wq"),res=$("#wres");q.oninput=function(){var r=finder(q.value),t=q.value.trim();res.innerHTML=(r.length?r.map(function(x){return'<button type="button" class="btn" data-add="'+E(x.k)+'">+ '+E(x.n)+' <small>'+E(x.s)+'</small></button>'}).join(" "):"")+(t.length>=2?' <button type="button" class="btn" data-add="'+E("c:"+t.slice(0,80))+'">+ Add "'+E(t.slice(0,40))+'" as typed</button>':"")};
  res.onclick=function(e){var b=e.target.closest("[data-add]");if(!b)return;var k=b.dataset.add;if(!wishHas(k))wishToggle(k);q.value="";res.innerHTML="";redraw()};
  $("#wlink").onclick=function(){var keys=rows().map(function(r){return r.k});if(!keys.length){$("#wmsg").textContent="Add something first.";return}var u=location.origin+location.pathname+"#/wish/"+shareCode(keys);copy(u,function(){$("#wmsg").textContent="Link copied. Anyone who opens it sees your list (up to 40 items). It does not update if you change the list later."},function(){$("#wmsg").innerHTML="Copy this link: <input readonly value=\""+E(u)+"\" size=\"40\" onfocus=\"this.select()\">"})};
  $("#wprint").onclick=function(){window.print()};
  $("#wsan").onclick=function(){var l=rows();if(!l.length){$("#wmsg").textContent="Add a few things first, then write the letter.";return}
   $("#wsanta").innerHTML='<div class="santa"><p class="noprint"><label for="wnm">Your name</label> <input id="wnm" maxlength="40" value="'+E(ld("cm-wish-name",""))+'"></p><div id="wlet"></div></div>';
   function draw(){var nm=$("#wnm").value.trim();sv("cm-wish-name",nm);$("#wlet").innerHTML='<p>Dear Santa,</p><p>This year I was good (mostly). I fixed more than I broke. For my collection, I would like:</p><ol>'+rows().slice(0,25).map(function(r){return'<li>'+E(nameOf(r.k).n)+(r.max?' <small>(anything up to $'+E(r.max)+' is fair)</small>':"")+'</li>'}).join("")+'</ol><p>I will leave out a cookie and a fresh CR2032.</p><p>Love,<br><b>'+E(nm||"A fellow collector")+'</b></p>'}
   $("#wnm").oninput=draw;draw();$("#wsanta").scrollIntoView({block:"nearest"})}}

 /* ------------------------------------------------------------------ Prize counter */
 var PRIZES=[["st-star","Gold star sticker","sticker","star",3],["st-heart","Heart sticker","sticker","heart",3],["st-ghost","Ghost sticker","sticker","ghost",5],["st-rocket","Rocket sticker","sticker","rocket",8],["st-dino","Dino sticker","sticker","dino",8],["st-ufo","UFO sticker","sticker","ufo",10],["st-gem","Gem sticker","sticker","gem",15],["st-crown","Crown sticker","sticker","crown",25],["st-trophy","Tiny trophy","sticker","trophy",30],
  ["sk-blue","Mem in blue","skin","blue",15],["sk-pink","Mem in pink","skin","pink",15],["sk-gold","Mem in gold","skin","gold",40],["gold-floppy","The Golden Floppy","grand","floppy",100]];
 function prizeState(){var p=ld("cm-prizes",{});p.own=Array.isArray(p.own)?p.own:[];p.spent=+p.spent||0;p.bonus=+p.bonus||0;return p}
 function ticketsOf(p){var xp=(ld("cm-play",{xp:0}).xp)||0;return Math.max(0,Math.floor(xp/3)+p.bonus-p.spent)}
 function todayKey(){var d=new Date();return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()}
 function prizes(){var p=prizeState(),t=ticketsOf(p),claimed=p.day===todayKey(),skin=p.skin||"green";
  var h='<section class="pz"><h2>Prize counter</h2><div class="pz-top"><div class="pz-m">'+mascot(112,"happy",skin)+'<p class="pz-say">'+(t>=3?"You have tickets to spend!":"Play a game to earn tickets.")+'</p></div><div class="pz-t"><b>'+t+'</b><span>tickets</span></div></div>'
   +'<p>Every 3 XP you earn in the <a href="#/play">games</a> is a ticket, and there is one free ticket a day. Spend them on stickers, a new color for Mem, or the grand prize. Prizes stay on this device.</p>'
   +'<p>'+(claimed?'<button class="btn" disabled>Today\'s free ticket is claimed</button>':'<button class="btn pri" id="pzfree" type="button">Claim today\'s free ticket</button>')+'</p>';
  var own=PRIZES.filter(function(x){return p.own.indexOf(x[0])>=0});
  h+='<h3 class="sub">My shelf</h3>'+(own.length?'<div class="pz-shelf">'+own.map(function(x){return'<div class="pz-o">'+(x[2]==="skin"?mascot(48,"happy",x[3]):'<span class="pz-gl'+(x[2]==="grand"?" gold":"")+'">'+px(x[3],44)+'</span>')+'<small>'+E(x[1])+'</small>'+(x[2]==="skin"?'<button class="btn" data-wear="'+x[3]+'" type="button"'+(skin===x[3]?" disabled":"")+'>'+(skin===x[3]?"Wearing":"Use")+'</button>':"")+'</div>'}).join("")+(skin!=="green"?'<div class="pz-o">'+mascot(48,"happy","green")+'<small>Mem in green</small><button class="btn" data-wear="green" type="button">Use</button></div>':"")+'</div>':'<p class="empty">The shelf is empty. Pick something below.</p>');
  h+='<h3 class="sub">The counter</h3><div class="pz-grid">'+PRIZES.filter(function(x){return p.own.indexOf(x[0])<0}).map(function(x){var can=t>=x[4];return'<div class="pz-c"><span class="pz-gl'+(x[2]==="grand"?" gold":"")+'">'+(x[2]==="skin"?mascot(44,"happy",x[3]):px(x[3],40))+'</span><b>'+E(x[1])+'</b><small>'+(x[2]==="grand"?"Grand prize":x[2]==="skin"?"Mascot color":"Sticker")+'</small><button class="btn'+(can?" pri":"")+'" data-buy="'+x[0]+'" type="button"'+(can?"":" disabled")+'>'+x[4]+' tickets'+(can?"":" ("+(x[4]-t)+" more)")+'</button></div>'}).join("")+'</div>'
   +'<p class="tn">Mem is the museum\'s mascot, an original character. Colors you earn show up on the not-found page, the kiosk and here.</p></section>';
  app.innerHTML=h;
  var f=$("#pzfree");if(f)f.onclick=function(){var q=prizeState();if(q.day===todayKey())return;q.day=todayKey();q.bonus+=1;sv("cm-prizes",q);prizes()};
  $$("[data-buy]").forEach(function(b){b.onclick=function(){var q=prizeState(),x=PRIZES.filter(function(z){return z[0]===b.dataset.buy})[0];if(!x||q.own.indexOf(x[0])>=0||ticketsOf(q)<x[4])return;q.spent+=x[4];q.own.push(x[0]);if(x[2]==="skin")q.skin=x[3];sv("cm-prizes",q);prizes()}});
  $$("[data-wear]").forEach(function(b){b.onclick=function(){var q=prizeState();q.skin=b.dataset.wear;sv("cm-prizes",q);prizes()}})}

 /* ------------------------------------------------------------------ Backup and restore */
 var ALLOW=["cm-mine","cm-hunt","cm-wish","cm-wish-name","cm-rigs","cm-rig","cm-play","cm-higher","cm-daily","cm-bingo","cm-tours","cm-trail","cm-photo","cm-boot","cm-ads","cm-adx","cm-theater","cm-fig","cm-credit","cm-prizes","cm-theme","cm-sfx","cm-motion","cm-crt","cm-catmode","cm-booksnd","cm-bkmark","cm-maze-code"];
 var LABEL={"cm-mine":"My collection","cm-hunt":"Swap-meet list","cm-wish":"Wish list","cm-wish-name":"Name on the wish letter","cm-rigs":"Saved dream rigs","cm-rig":"Rig game","cm-play":"Game progress and badges","cm-higher":"Higher or Lower","cm-daily":"Daily Dig","cm-bingo":"Bingo","cm-tours":"Tours","cm-trail":"Cursor trail","cm-photo":"Mystery Photo","cm-boot":"Boot screen","cm-ads":"Ad Lab","cm-adx":"Ad Lab extras","cm-theater":"Theater queue","cm-fig":"Figures","cm-credit":"Credits","cm-prizes":"Prizes and tickets","cm-theme":"Theme","cm-sfx":"Sound effects","cm-motion":"Motion setting","cm-crt":"Screen effect","cm-catmode":"Catalog style","cm-booksnd":"Page-turn sound","cm-bkmark":"Catalog bookmark","cm-maze-code":"Basement code"};
 function present(){var o={};ALLOW.forEach(function(k){try{var v=localStorage.getItem(k);if(v!=null)o[k]=v}catch(e){}});return o}
 function validate(txt){var j;try{j=JSON.parse(txt)}catch(e){return{err:"That file is not a backup (it could not be read)."}}
  if(!j||j.app!=="conventionalmemory"||typeof j.data!=="object"||j.data===null)return{err:"That file is not a Conventional Memory backup."};
  var ok={},skipped=0,total=0;Object.keys(j.data).forEach(function(k){var v=j.data[k];if(ALLOW.indexOf(k)<0||typeof v!=="string"||v.length>200000){skipped++;return}total+=v.length;if(total>1500000){skipped++;return}ok[k]=v});
  return Object.keys(ok).length?{ok:ok,skipped:skipped,date:j.date}:{err:"Nothing in that file can be restored."}}
 function backup(){var cur=present(),ks=Object.keys(cur);
  app.innerHTML='<section class="bkp"><h2>Back up my stuff</h2><p>Everything you do here (collection, wish list, game progress, saved rigs, settings) lives only in this browser. Save it to a file to move it to another device or keep a copy. Nothing is uploaded anywhere. Admin passphrases and tokens are never included.</p>'
   +'<p><button class="btn pri" id="bsave" type="button"'+(ks.length?"":" disabled")+'>Save a backup file ('+ks.length+' items)</button></p>'
   +(ks.length?'<details><summary>What is in it</summary><ul>'+ks.map(function(k){return'<li>'+E(LABEL[k]||k)+' <small class="tn">'+Math.ceil(cur[k].length/1024)+' KB</small></li>'}).join("")+'</ul></details>':'<p class="empty">Nothing saved on this device yet.</p>')
   +'<h3 class="sub">Restore</h3><p><label for="bfile">Choose a backup file</label> <input id="bfile" type="file" accept=".json,application/json"></p><div id="bprev" aria-live="polite"></div>'
   +'<h3 class="sub">Start over</h3><p class="tn">Removes everything listed above from this browser. Your backup file is not affected.</p><p><button class="btn" id="bwipe" type="button">Erase this device\'s saved stuff</button></p><p id="bmsg" class="tn" role="status"></p></section>';
  $("#bsave").onclick=function(){var d=new Date(),n=d.getFullYear()+("0"+(d.getMonth()+1)).slice(-2)+("0"+d.getDate()).slice(-2);dl("conventional-memory-backup-"+n+".json",JSON.stringify({app:"conventionalmemory",v:1,date:d.toISOString(),data:present()},null,1),"application/json");$("#bmsg").textContent="Saved. Keep the file somewhere safe."};
  $("#bfile").onchange=function(){var f=this.files&&this.files[0],pv=$("#bprev");if(!f)return;if(f.size>2000000){pv.innerHTML='<div class="msg err">That file is too large to be a backup.</div>';return}
   var rd=new FileReader();rd.onload=function(){var v=validate(String(rd.result));if(v.err){pv.innerHTML='<div class="msg err">'+E(v.err)+'</div>';return}
    pv.innerHTML='<div class="msg ok"><b>'+Object.keys(v.ok).length+' items found</b>'+(v.date?' from '+E(String(v.date).slice(0,10)):"")+(v.skipped?', '+v.skipped+' skipped (not allowed)':"")+'.<ul>'+Object.keys(v.ok).map(function(k){return'<li>'+E(LABEL[k]||k)+'</li>'}).join("")+'</ul>Restoring replaces what is on this device for these items.</div><p><button class="btn pri" id="brestore" type="button">Restore these</button></p>';
    $("#brestore").onclick=function(){Object.keys(v.ok).forEach(function(k){try{localStorage.setItem(k,v.ok[k])}catch(e){}});$("#bmsg").textContent="Restored. Reloading...";setTimeout(function(){location.reload()},600)}};
   rd.onerror=function(){pv.innerHTML='<div class="msg err">That file could not be read.</div>'};rd.readAsText(f)};
  var w=$("#bwipe");w.onclick=function(){if(w.dataset.sure!=="1"){w.dataset.sure="1";w.textContent="Press again to erase";setTimeout(function(){w.dataset.sure="";w.textContent="Erase this device's saved stuff"},4000);return}ALLOW.forEach(function(k){try{localStorage.removeItem(k)}catch(e){}});try{sessionStorage.removeItem("cm-era")}catch(e){}$("#bmsg").textContent="Erased. Reloading...";setTimeout(function(){location.reload()},600)}}

 /* ------------------------------------------------------------------ Demo kiosk */
 function kStop(){clearInterval(KS.t);clearTimeout(KS.idle);KS.t=0;if(KS.kh)document.removeEventListener("keydown",KS.kh,true);KS.kh=null;if(KS.el){KS.el.remove();KS.el=null}document.documentElement.classList.remove("kiosk-on");try{if(document.fullscreenElement)document.exitFullscreen()}catch(e){}}
 function slides(){var S=[],pool=ITEMS.length?ITEMS:ALLITEMS,i;
  pool.forEach(function(it){S.push(function(){var t=it.score!=null?tier(it.score):null;return'<div class="k-sl k-it"><div class="k-ph">'+pic(it)+'</div><div class="k-tx"><small>FROM THE COLLECTION</small><h3>'+E(it.name)+'</h3><p>'+E((it.maker||"")+(it.year?", "+it.year:""))+'</p>'+(t?'<p class="k-sc" style="background:'+t.c+';color:'+inkOn(t.c)+'">'+it.score+'K '+E(t.l)+'</p>':"")+'<p>'+E(String(it.text||"").replace(/\s+/g," ").slice(0,170))+'</p></div></div>'})});
  var hw=TL.filter(function(r){return/^(hw|pe)$/.test(r[1])&&r[3]&&r[4]});for(i=0;i<8&&hw.length;i++){(function(r){S.push(function(){return'<div class="k-sl"><small>'+E(String(r[0]).slice(0,4))+' ON THE SHELF</small><h3>'+E(r[2])+'</h3><p class="k-p">'+E(String(r[3]).replace(/\*$/," (est.)"))+'</p><p>'+E(String(r[4]).slice(0,200))+'</p></div>'})})(hw[Math.floor(Math.random()*hw.length)])}
  var gm=TL.filter(function(r){return r[1]==="gt"||r[1]==="sw"});for(i=0;i<6&&gm.length;i++){(function(r){S.push(function(){return'<div class="k-sl"><small>NOW PLAYING, '+E(String(r[0]).slice(0,4))+'</small><h3>'+E(r[2])+'</h3><p>'+E(String(r[4]||"").slice(0,200))+'</p></div>'})})(gm[Math.floor(Math.random()*gm.length)])}
  if(typeof QUOTES!=="undefined")for(i=0;i<4;i++){(function(q){S.push(function(){return'<div class="k-sl"><small>OVERHEARD AT THE MUSEUM</small><h3 class="k-q">&ldquo;'+E(q[0])+'&rdquo;</h3><p>'+E(q[1])+'</p></div>'})})(QUOTES[Math.floor(Math.random()*QUOTES.length)])}
  S.push(function(){return'<div class="k-sl"><small>DID YOU KNOW</small><h3>The 640K barrier</h3><p>DOS programs had 640 kilobytes of conventional memory to work with. The museum is named for it.</p></div>'});
  return S}
 function kiosk(auto){
  app.innerHTML='<section><h2>Demo kiosk</h2><div class="k-intro">'+mascot(96,"wow")+'<div><p>Attract mode for a spare screen, like the demo station in a toy-store aisle: slides of exhibits, old prices and quotes cycle on their own. Touch or press any key and a big-button menu appears. It goes back to the slides after 45 idle seconds.</p><p><button class="btn pri" id="kgo" type="button">Start the kiosk</button> <button class="btn" id="kfs" type="button">Start full screen</button></p><p class="tn">Press Escape to leave.</p></div></div></section>';
  $("#kgo").onclick=function(){start(false)};$("#kfs").onclick=function(){start(true)};if(auto===true)start(false);
  function start(fs){kStop();var S=slides(),n=Math.floor(Math.random()*S.length),el=document.createElement("div");el.id="kiosk";el.className="kiosk";el.setAttribute("role","dialog");el.setAttribute("aria-label","Demo kiosk");KS.el=el;
   el.innerHTML='<button type="button" class="kx" id="kexit">Exit kiosk (Esc)</button><div class="k-top">'+mascot(56,"happy")+'<b>CONVENTIONAL MEMORY</b></div><div id="kscr" class="k-scr" aria-live="off"></div><div id="kbar" class="k-bar"></div>';document.body.appendChild(el);document.documentElement.classList.add("kiosk-on");
   if(fs&&el.requestFullscreen)try{el.requestFullscreen()}catch(e){}
   var scr=el.querySelector("#kscr"),bar=el.querySelector("#kbar");KS.mode="attract";
   function show(){if(KS.mode!=="attract")return;scr.className="k-scr"+(motionOn()?" k-in":"");scr.innerHTML=S[n%S.length]();n++;bar.innerHTML='<span class="k-start">PRESS START</span>'}
   function menu(){KS.mode="menu";clearTimeout(KS.idle);scr.className="k-scr";scr.innerHTML='<h3 class="k-h">What would you like to do?</h3><div class="k-menu"><a href="#/catalog" data-book="1">Open the Wish Book</a><a href="#/catalog">Browse the exhibits</a><a href="#/daily">Play the Daily Dig</a><a href="#/walk/1995">Walk through 1995</a><a href="#/rigs">Build a dream rig</a><a href="#/runs">Does it run?</a></div>';bar.innerHTML='<span class="tn">Touch a button. Idle for 45 seconds returns to the slides.</span>';KS.idle=setTimeout(function(){KS.mode="attract";show()},45000)}
   el.addEventListener("click",function(e){if(e.target.closest("#kexit")){location.hash="#/kiosk";kStop();kiosk();return}var a=e.target.closest("a[data-book]");if(a){try{localStorage.setItem("cm-catmode","book")}catch(x){}kStop();return}if(e.target.closest(".k-menu a")){kStop();return}if(KS.mode==="attract")menu();else{clearTimeout(KS.idle);KS.idle=setTimeout(function(){KS.mode="attract";show()},45000)}});
   KS.kh=function(e){if(e.key==="Escape"){kStop();kiosk();return}if(KS.mode==="attract"&&!/^(Shift|Control|Alt|Meta)$/.test(e.key)){e.preventDefault();menu()}};document.addEventListener("keydown",KS.kh,true);
   show();KS.t=setInterval(function(){if(!document.getElementById("kiosk")){kStop();return}show()},7000)}}

 /* ------------------------------------------------------------------ Makers, manuals, labels, start here */
 function makers(){var m={};ALLITEMS.forEach(function(i){if(i.maker&&i.maker!=="Unknown"&&!i.draft){var o=m[i.maker]||(m[i.maker]={n:i.maker,items:[],tl:0});o.items.push(i)}});
  if(typeof TLX!=="undefined")TL.forEach(function(r){var x=TLX[r[2]];if(x&&x.maker&&/^(hw|pe)$/.test(r[1])){var o=m[x.maker]||(m[x.maker]={n:x.maker,items:[],tl:0});o.tl++}});return m}
 function maker(name){var M=makers();
  if(!name){var ks=Object.keys(M).sort(function(a,b){return M[b].items.length-M[a].items.length||M[b].tl-M[a].tl||a.localeCompare(b)});
   app.innerHTML='<section><h2>Makers</h2><p>Every company with something in the museum, and how many machines they made on the timeline. Pick one to see what is here.</p><div class="chips">'+ks.map(function(k){return'<a class="btn'+(M[k].items.length?" pri":"")+'" href="#/maker/'+encodeURIComponent(k)+'">'+E(k)+' <small>'+M[k].items.length+(M[k].tl?" / "+M[k].tl:"")+'</small></a>'}).join(" ")+'</div><p class="tn">First number: exhibits in the museum. Second: hardware entries on the timeline.</p></section>';return}
  var o=M[name];if(!o){app.innerHTML='<section><h2>Makers</h2><p class="empty">No maker called '+E(name)+' on file.</p><p><a class="btn" href="#/maker">All makers</a></p></section>';return}
  var tl=typeof TLX!=="undefined"?TL.filter(function(r){var x=TLX[r[2]];return x&&x.maker===name&&/^(hw|pe)$/.test(r[1])}).sort(function(a,b){return a[0]<b[0]?-1:1}):[];
  var own=function(t){return ITEMS.some(function(i){return i.name===t||(typeof tlOwn==="function"&&tlOwn(t)&&tlOwn(t).id===i.id)})};
  app.innerHTML='<section><h2>'+E(name)+'</h2><p><a href="#/maker">All makers</a></p><h3 class="sub">In the museum ('+o.items.length+')</h3>'+(o.items.length?'<div class="grid">'+o.items.map(card).join("")+'</div>':'<p class="empty">Nothing from '+E(name)+' yet.</p>')
   +(tl.length?'<h3 class="sub">On the timeline ('+tl.length+')</h3><ul class="pl-sr">'+tl.slice(0,60).map(function(r){return'<li><span class="tn">'+E(String(r[0]).slice(0,4))+'</span> <a href="'+tlHref(r)+'">'+E(r[2])+'</a>'+(typeof tlOwn==="function"&&tlOwn(r[2])?' <span class="tag">in the museum</span>':'')+(r[3]?' <small class="tn">'+E(String(r[3]).replace(/\*$/,""))+'</small>':"")+'</li>'}).join("")+'</ul>':"")+'</section>'}
 function manuals(){var L=[];ITEMS.forEach(function(it){(it.links||[]).forEach(function(l){var u=safeUrl(l.u,"link");if(u)L.push({it:it,t:l.t,u:u})});(it.refs||[]).forEach(function(l){var u=safeUrl(l.u,"link");if(u)L.push({it:it,t:l.t,u:u,ref:1})})});
  var by={};L.forEach(function(x){(by[x.it.id]=by[x.it.id]||{it:x.it,l:[]}).l.push(x)});var ks=Object.keys(by).sort(function(a,b){return by[a].it.name.localeCompare(by[b].it.name)});
  app.innerHTML='<section><h2>Manuals and references</h2><p>Every manual, driver page and reference the museum links to, by exhibit. Manuals are added in Admin under Links.</p>'+(ks.length?ks.map(function(k){var g=by[k];return'<h3 class="sub"><a href="#/item/'+E(g.it.id)+'">'+E(g.it.name)+'</a></h3><ul>'+g.l.map(function(x){return'<li><a href="'+E(x.u)+'" target="_blank" rel="noopener noreferrer">'+E(x.t)+'</a>'+(x.ref?' <small class="tn">source</small>':"")+'</li>'}).join("")+'</ul>'}).join(""):'<p class="empty">No manuals or references linked yet.</p>')+'</section>'}
 function labels(){var src=ALLITEMS.filter(function(i){return!i.draft}),base=location.origin+location.pathname;
  app.innerHTML='<section class="lbl"><h2>Print labels</h2><p class="noprint">A sheet of small labels, one per exhibit: item number, name, maker and year, and its web address. Print on label paper or plain paper and cut. Use the checkboxes to pick which ones.</p><p class="noprint"><button class="btn pri" id="lbp" type="button">Print</button> <label><input type="checkbox" id="lball" checked> All</label></p>'
   +'<div class="lbl-g">'+src.map(function(i,n){var no="CM-"+("000"+(ALLITEMS.indexOf(i)+1)).slice(-4);return'<label class="lbl-c"><input type="checkbox" class="noprint lbl-k" data-n="'+n+'" checked><b>'+E(no)+'</b><span class="lbl-n">'+E(i.name)+'</span><small>'+E((i.maker||"")+(i.year?" \u00b7 "+i.year:""))+'</small><code>'+E(base+"#/item/"+i.id).replace(/^https?:\/\//,"")+'</code></label>'}).join("")+'</div></section>';
  $("#lbp").onclick=function(){window.print()};$("#lball").onchange=function(){var on=this.checked;$$(".lbl-k").forEach(function(c){c.checked=on;c.dispatchEvent(new Event("change"))})};
  $$(".lbl-k").forEach(function(c){c.onchange=function(){c.closest(".lbl-c").classList.toggle("off",!c.checked)}})}
 function start(){app.innerHTML='<section class="st"><h2>Start here</h2><div class="k-intro">'+mascot(96,"happy")+'<div><p>Hi, I am Mem. Conventional Memory is a museum of vintage computers, the people who kept them running, and the games and ads that went with them. There is no wrong way in. Pick how you feel:</p></div></div>'
   +'<div class="pl-grid"><a class="hm-tile" href="#/catalog"><i class="hm-ic">'+glyph("tower",28)+'</i><b>I like looking at stuff</b><span>Browse the exhibits: departments, a mail-order catalog and a shelf.</span></a>'
   +'<a class="hm-tile" href="#/walk/1995"><i class="hm-ic">'+glyph("clock",28)+'</i><b>I want to remember</b><span>Walk through a year: the news, the hardware, the games, the ad.</span></a>'
   +'<a class="hm-tile" href="#/daily"><i class="hm-ic">'+glyph("bulb",28)+'</i><b>I want a challenge</b><span>Three timeline questions a day, then the rest of the games.</span></a>'
   +'<a class="hm-tile" href="#/runs"><i class="hm-ic">'+glyph("chip",28)+'</i><b>I tinker</b><span>Does it run? Dream rigs, IRQ conflicts and benchmarks.</span></a>'
   +'<a class="hm-tile" href="#/wish"><i class="hm-ic">'+glyph("heart",28)+'</i><b>I am shopping</b><span>A wish list, swap-meet mode and what to hunt for next.</span></a>'
   +'<a class="hm-tile" href="#/theater"><i class="hm-ic">'+glyph("tv",28)+'</i><b>I just want to watch</b><span>The little CRT theater and the jukebox.</span></a></div>'
   +'<h3 class="sub">Good to know</h3><ul><li>Press <b>/</b> anywhere to search. Type <b>help</b> at the C:\\&gt; prompt in the footer for commands.</li><li>The menu bar groups everything: Catalog, Timeline, Explore, Play, Theater, My stuff, Community.</li><li>Your lists, scores and prizes stay in this browser. <a href="#/backup">Back them up</a> if you care about them.</li><li>Themes, motion and the CRT effect are the three buttons at the top right.</li></ul></section>'}

 return{mount:function(el,page,args){app=el;try{
   if(page==="wish")wish(args[0]);else if(page==="kiosk")kiosk(args[0]==="go");else if(page==="prizes")prizes();else if(page==="backup")backup();else if(page==="maker")maker(args[0]);else if(page==="manuals")manuals();else if(page==="labels")labels();else if(page==="start")start()
  }catch(e){app.innerHTML='<section><h2>Something broke</h2><p class="empty">This page could not load ('+E(e.message)+').</p></section>'}},unmount:function(){kStop()}}})();
