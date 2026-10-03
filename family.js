/* family.js: the Ventional family file (#/family, #/family/<id>), the Squabbles page (#/squabbles) and the photo album (#/album).
   Who they are (likes, dislikes, interests, opinions with the real computer fact behind each one), how they talk, how they get on each other's nerves,
   and the awkward family photos, year by year. Data lives in family-data.js, the drawings come from cast.js.
   The only thing saved in the browser is which side you took in a squabble (localStorage key cm-family). */
window.CMFamily=(function(){
"use strict";
var KEY="cm-family",app=null,st=null,timers=[];
function E(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function $(s,r){return(r||app).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||app).querySelectorAll(s))}
function hash(s){var x=0;s=String(s);for(var i=0;i<s.length;i++)x=(x*31+s.charCodeAt(i))>>>0;return x}
var NAME={connie:"Connie",emma:"Emma",hiram:"Hiram",ram:"Dad",rhoda:"Mom",floyd:"Grandpa Floyd",winnie:"Grandma Winnie",augusta:"Aunt Gussie",conrad:"Uncle Conrad",tess:"Tessie",nibble:"Nibble",dot:"Dot",viv:"Viv",sandy:"Sandy",mo:"Mo",zack:"Zack",mat:"Mat",toner:"Toner"};
var PET={nibble:1,mat:1,toner:1};
var ORDER=["connie","emma","hiram","ram","rhoda","floyd","winnie","augusta","conrad","tess","dot","viv","sandy","mo","zack","nibble","mat","toner"];
var GROUPS=[["All",null],["Home",["connie","emma","hiram","ram","rhoda"]],["Grandparents",["floyd","winnie"]],["Aunt, uncle and guest",["augusta","conrad","tess"]],["Friends",["dot","viv","sandy","mo","zack"]],["Pets",["nibble","mat","toner"]]];
var TONES=[["petty","Petty"],["loud","Loud"],["cold war","Cold war"],["affectionate","Affectionate"],["recurring","Recurring"]];
var FXN={blink:"Blinked",cutoff:"Cut off",flash:"Flash glare",photobomb:"Photobomb",redeye:"Red eye",squint:"Squinting",tilt:"Crooked",tongue:"Tongue out",tooclose:"Too close",turned:"Looking away"};
var SETN={beach:"the beach",campsite:"the campsite",car:"the car",den:"the den",garage:"the garage",kitchen:"the kitchen",livingroom:"the living room",mall:"the mall",pool:"the pool",porch:"the porch",restaurant:"a restaurant",stairs:"the stairs",studio:"a photo studio",yard:"the yard"};
/* Dad and Uncle Conrad change clothes for the occasion; everyone else keeps their look */
var OCC=[[/beach|pool/,"hawaii"],[/camping/,"fishing"],[/garage/,"garage"],[/museum|anniversary/,"tux"],[/road trip/,"road"],[/christmas|new year/,"winter"],[/thanksgiving/,"grill"],[/band/,"biker"],[/reunion/,"golf"]];

/* ---------- saved state ---------- */
function blank(){return{v:1,votes:{}}}
function load(){var o=null;try{o=JSON.parse(localStorage.getItem(KEY)||"null")}catch(e){}if(!o||typeof o!=="object"||Array.isArray(o))o=blank();o.votes=o.votes&&typeof o.votes==="object"&&!Array.isArray(o.votes)?o.votes:{};return o}
function write(){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}}

/* ---------- people ---------- */
function F(id){return CMCast.FAMILY.filter(function(x){return x.id===id})[0]||{id:id,n:NAME[id]||id,role:"",born:0,bio:""}}
function P(id){return FAMDATA.profiles[id]}
function arrive(id){var g=P(id).g,y=9999;g.forEach(function(x){if(x[0]<y)y=x[0]});return y}
function noteAt(id,year){var g=P(id).g,n=null;g.forEach(function(x){if(x[0]<=year)n=x});return n}
function av(id,sz,o){o=o||{};if(typeof CMCast==="undefined")return"";var opt={tall:!PET[id]};if(o.famOpts&&typeof CMCast.famOpts==="function"){var f=CMCast.famOpts(id);for(var k in f)opt[k]=f[k]}
 ["mood","holds","outfit","flip"].forEach(function(k){if(o[k])opt[k]=o[k]});try{return CMCast.svg(id,sz,opt)}catch(e){return""}}
function chip(id){return'<a class="fa-who" href="#/family/'+E(id)+'"><span aria-hidden="true">'+av(id,28)+"</span>"+E(NAME[id]||id)+"</a>"}
function chips(ids){return'<span class="fa-whos">'+ids.map(chip).join(" ")+"</span>"}
function crumb(label){return'<p class="fa-up"><a href="#/family">The Family file</a> / '+E(label)+"</p>"}

/* ---------- photos ---------- */
function stamp(a){var y=a.y,oc=a.oc.toLowerCase(),H=hash(a.id),m=1+H%12,d=1+(H>>3)%28;
 if(/christmas/.test(oc)){m=12;d=25}else if(/thanksgiving/.test(oc)){m=11;d=22}else if(/new year|y2k/.test(oc)||/y2k/.test(a.id)){m=12;d=31}else if(a.id==="day-one"){m=8;d=12}
 var mm=("0"+m).slice(-2),dd=("0"+d).slice(-2);return y>=2000?y+"."+mm+"."+dd:"'"+String(y).slice(2)+" "+m+" "+d}
function outfitFor(id,a){if(id!=="ram"&&id!=="conrad")return"";var o="";OCC.forEach(function(r){if(!o&&r[0].test(a.oc.toLowerCase()))o=r[1]});return o}
function has(a,k){return a.fx.indexOf(k)>=0}
/* one picture: the scene, the people, and whatever went wrong with it */
function picture(a,o){o=o||{};var H=hash(a.id),w=a.w.slice(),mood={},k,i;for(k in a.m)mood[k]=a.m[k];
 var humans=w.filter(function(x){return!PET[x]});
 function free(pool){pool=pool.length?pool:w;for(var j=0;j<pool.length;j++){var c=pool[(H+j)%pool.length];if(!mood[c])return c}return pool[H%pool.length]}
 var t={};
 if(has(a,"blink")){t.blink=free(humans);mood[t.blink]="sleep"}
 if(has(a,"squint")){t.squint=free(humans);if(!mood[t.squint])mood[t.squint]="wink"}
 if(has(a,"redeye"))t.redeye=free(humans);
 if(has(a,"tongue")){t.tongue=free(humans);if(!mood[t.tongue])mood[t.tongue]="wink"}
 if(has(a,"turned")){t.turned=humans.length>1?humans[1]:w[0];if(!mood[t.turned])mood[t.turned]="wow"}
 var bomb="";if(has(a,"photobomb")){var pref=["tess","zack","toner","mat","nibble","hiram","emma","sandy"];for(i=0;i<pref.length&&!bomb;i++)if(w.indexOf(pref[i])>=0&&w.length>1)bomb=pref[i];if(!bomb&&w.length>1)bomb=w[w.length-1]}
 var rest=humans.filter(function(x){return x!==bomb}),pets=w.filter(function(x){return PET[x]&&x!==bomb}),out="",n=rest.length,pos=[];
 var back=n<=4?0:Math.ceil(n/2),front=n-back;
 function row(list,ww,bot){var kk=list.length,step=kk>1?Math.min(ww*0.95,(92-ww)/(kk-1)):0,total=ww+step*(kk-1),l0=50-total/2;list.forEach(function(id,j){pos.push({id:id,l:l0+j*step,b:bot,w:ww})})}
 if(n){if(!back)row(rest,Math.min(30,Math.floor(92/Math.max(n,1))+(n>2?2:0)),6);else{row(rest.slice(0,back),19,30);row(rest.slice(back),22,4)}}
 var cutId=has(a,"cutoff")&&pos.length?pos[pos.length-1]:null;if(cutId)cutId.l=100-cutId.w*0.42;
 pets.forEach(function(id,j){pos.push({id:id,l:8+(j+0.5)*(84/pets.length)-6,b:0,w:12,pet:1})});
 if(bomb)pos.push({id:bomb,l:H%2?-5:68,b:-9,w:PET[bomb]?26:34,bomb:1});
 pos.forEach(function(p){var oo={mood:mood[p.id],holds:a.h[p.id]},of=outfitFor(p.id,a);if(of)oo.outfit=of;if(t.turned===p.id)oo.flip=1;
  var cls="fa-p"+(p.bomb?" fa-bomb":"")+(t.turned===p.id?" fa-turn":"")+(p.pet?" fa-pet":""),extra="";
  if(t.redeye===p.id)extra+='<i class="fa-re" style="left:26%"></i><i class="fa-re" style="left:59%"></i>';
  if(t.tongue===p.id)extra+='<i class="fa-tg"></i>';
  out+='<div class="'+cls+'" data-id="'+E(p.id)+'" style="left:'+p.l.toFixed(1)+"%;bottom:"+p.b+"%;width:"+p.w+'%">'+av(p.id,120,oo)+extra+"</div>"});
 var era=a.y<1990?"fa-e80":a.y<2000?"fa-e90":"fa-e00",fx=a.fx.map(function(x){return"fa-x-"+x}).join(" ");
 var alt="Family photo, "+a.y+": "+a.t+". "+a.w.map(function(x){return NAME[x]||x}).join(", ")+" at "+(SETN[a.set]||a.set)+".";
 return'<div class="fa-img '+era+" "+fx+'" role="img" aria-label="'+E(alt)+'"><div class="fa-scene fa-s-'+E(a.set)+'"></div><div class="fa-cast" aria-hidden="true">'+out+'</div><div class="fa-glare" aria-hidden="true"></div><b class="fa-date" aria-hidden="true">'+E(stamp(a))+"</b></div>"}
function tags(a){return a.fx.map(function(x){return'<span class="fa-fx">'+E(FXN[x]||x)+"</span>"}).join(" ")}
/* a photo you can turn over: the front, and the back where somebody wrote on it */
function figure(a,o){o=o||{};var tilt=(((hash(a.id)%5)-2)*0.6).toFixed(1);
 return'<figure class="fa-ph'+(o.big?" fa-big":"")+'" id="ph-'+E(a.id)+'" data-id="'+E(a.id)+'" style="--tilt:'+tilt+'deg"><div class="fa-front">'+picture(a)+"</div>"
  +'<div class="fa-backs" hidden><p class="fa-wr"><i>Written on the back by '+E(NAME[a.by]||a.by)+':</i></p><p class="fa-hand">'+E(a.c)+'</p><dl><dt>Where and when</dt><dd>'+E(a.oc.charAt(0).toUpperCase()+a.oc.slice(1))+", "+E(SETN[a.set]||a.set)+", "+a.y+"</dd><dt>What was going on</dt><dd>"+E(a.aw)+"</dd><dt>The story</dt><dd>"+E(a.n)+"</dd><dt>Everybody</dt><dd>"+chips(a.w)+"</dd></dl></div>"
  +'<figcaption><a class="fa-t" href="#/album/'+E(a.id)+'"><b>'+E(a.t)+"</b></a> <small>"+a.y+"</small><span class=\"fa-cap\">"+E(a.c)+"</span>"+tags(a)+'<button type="button" class="btn fa-flip" aria-pressed="false">Turn it over</button></figcaption></figure>'}
function wirePhotos(root){$$(".fa-ph",root).forEach(function(f){var b=$(".fa-flip",f),fr=$(".fa-front",f),bk=$(".fa-backs",f);if(!b||b.__w)return;b.__w=1;
 b.onclick=function(){var on=bk.hidden;bk.hidden=!on;fr.hidden=on;b.setAttribute("aria-pressed",on?"true":"false");b.textContent=on?"Turn it back":"Turn it over";f.classList.toggle("fa-turned",on)}})}

/* ---------- the Family file ---------- */
function indexPage(){var yr=2012,grp=0;
 var h='<section class="fa"><h2>The Family file</h2><p class="fa-lead">Everyone in Connie’s house, with what they like, what they cannot stand, what they will argue about at dinner, and the real computer history behind each opinion. The family is invented. The technology is not.</p>'
  +'<p class="fa-links"><a class="btn pri" href="#/album">Open the photo album</a> <a class="btn" href="#/squabbles">Read the squabbles</a> <a class="btn" href="#/connie">Connie’s story</a></p>'
  +'<div class="fa-tm"><label for="fa-yr"><b>Time machine</b> <output id="fa-yo">Now</output></label><input type="range" id="fa-yr" min="1981" max="2012" value="2012" step="1" aria-describedby="fa-tmh"><p id="fa-tmh" class="fa-note">Slide back to see who had arrived by then, and who they were that year. Everyone grows.</p></div>'
  +'<div class="fa-chips" role="group" aria-label="Show">'+GROUPS.map(function(g,i){return'<button type="button" class="btn fa-g'+(i===0?" on":"")+'" data-g="'+i+'" aria-pressed="'+(i===0)+'">'+E(g[0])+"</button>"}).join(" ")+'</div><div class="fa-grid" id="fa-grid"></div>'
  +'<h3 class="sub">Who is close to whom</h3><p class="fa-note">Some bonds are easy. Some are a long negotiation.</p><div class="fa-bonds">'+FAMDATA.bonds.map(function(b){return'<div class="fa-bond"><span class="fa-pair">'+b.w.map(function(x){return'<a href="#/family/'+E(x)+'" aria-label="'+E(NAME[x]||x)+'">'+av(x,44)+"</a>"}).join("")+"</span><div><b>"+b.w.map(function(x){return E(NAME[x]||x)}).join(" and ")+"</b> <small>"+E(b.k)+"</small><p>"+E(b.n)+"</p></div></div>"}).join("")+'</div><p class="noprint"><button type="button" class="btn" id="fa-bmore"></button></p>'
  +'<h3 class="sub">Story threads</h3><p class="fa-note">The long arcs: who they were in 1981, and who they became.</p><div class="fa-threads">'+FAMDATA.threads.map(function(t){return"<details><summary><b>"+E(t.t)+'</b> <span class="fa-whos">'+t.w.map(function(x){return'<span aria-hidden="true">'+av(x,24)+"</span>"}).join("")+'</span></summary><ol class="fa-beats">'+t.b.map(function(b){return"<li><small>"+b[0]+"</small> "+E(b[1])+"</li>"}).join("")+"</ol></details>"}).join("")+"</div>"
  +'<p class="fa-note">Connie Ventional and her family are original characters made for this museum. The dates and the computer history are real.</p></section>';
 app.innerHTML=h;
 function cards(){var list=GROUPS[grp][1]||ORDER;$("#fa-grid").innerHTML=ORDER.filter(function(id){return list.indexOf(id)>=0}).map(function(id){var f=F(id),a=arrive(id),here=yr>=a,nt=noteAt(id,yr),p=P(id);
   return'<a class="fa-card'+(here?"":" fa-away")+'" href="#/family/'+E(id)+'"><span class="fa-spr">'+av(id,96,{famOpts:1})+"</span><b>"+E(f.n)+"</b><small>"+E(f.role)+"</small>"+(here?"<p>"+E(nt?nt[1]:"")+"</p><q>"+E(p.v.say[0])+"</q>":'<p class="fa-soon">Arrives in '+a+".</p>")+"</a>"}).join("")}
 cards();
 var bn=4,bs=$$(".fa-bond");function bonds(){bs.forEach(function(b,i){b.hidden=i>=bn});var r=bs.length-bn,mb=$("#fa-bmore");mb.parentNode.hidden=r<=0;mb.textContent="Show "+Math.min(4,r)+" more ("+r+" left)"}
 $("#fa-bmore").onclick=function(){bn+=4;bonds()};bonds();
 var rg=$("#fa-yr");rg.oninput=function(){yr=+rg.value;$("#fa-yo").textContent=yr===2012?"Now (2012)":String(yr);cards()};
 $$(".fa-g").forEach(function(b){b.onclick=function(){grp=+b.getAttribute("data-g");$$(".fa-g").forEach(function(x){var on=x===b;x.classList.toggle("on",on);x.setAttribute("aria-pressed",on?"true":"false")});cards()}})}

/* ---------- one character ---------- */
function profile(id){var f=F(id),p=P(id);if(!p){notFound(id);return}
 var i=ORDER.indexOf(id),prev=ORDER[(i+ORDER.length-1)%ORDER.length],next=ORDER[(i+1)%ORDER.length];
 var sq=FAMDATA.squabbles.filter(function(s){return s.w.indexOf(id)>=0}),ph=FAMDATA.album.filter(function(a){return a.w.indexOf(id)>=0}),bd=FAMDATA.bonds.filter(function(b){return b.w.indexOf(id)>=0}),
  th=FAMDATA.threads.filter(function(t){return t.w.indexOf(id)>=0}),jk=FAMDATA.jokes.filter(function(j){return j.w.indexOf(id)>=0});
 var oc=CMCast.OUTFIT_FOR&&CMCast.OUTFIT_FOR[id]?'<p><label for="fa-of">Try an outfit </label><select id="fa-of">'+CMCast.OUTFIT_ORDER.filter(function(k){return!CMCast.OUTFITS[k].u}).map(function(k){return'<option value="'+E(k)+'">'+E(CMCast.OUTFITS[k].n)+"</option>"}).join("")+"</select></p>":"";
 var h='<section class="fa fa-prof">'+crumb(f.n)+'<h2>'+E(f.n)+'</h2><div class="fa-hero"><div class="fa-big"><button type="button" class="fa-port" id="fa-port" aria-label="Make '+E(NAME[id]||id)+' say something">'+av(id,160,{famOpts:1})+'</button>'+oc+'</div><div><p class="fa-role">'+E(f.role)+", born "+f.born+'</p><p class="fa-lead">'+E(f.bio)+'</p><div class="fa-say" aria-live="polite"><div id="fa-line">'+fbub(id,p.v.say[0])+'</div><button type="button" class="btn" id="fa-again">Say something else</button></div><p class="fa-note"><b>How they talk:</b> '+E(p.v.s)+"</p></div></div>"
  +'<div class="fa-3"><div><h3 class="sub">Likes</h3><ul>'+p.l.map(function(x){return"<li>"+E(x)+"</li>"}).join("")+'</ul></div><div><h3 class="sub">Cannot stand</h3><ul>'+p.d.map(function(x){return"<li>"+E(x)+"</li>"}).join("")+'</ul></div><div><h3 class="sub">Interests</h3><ul>'+p.i.map(function(x){return"<li>"+E(x)+"</li>"}).join("")+"</ul></div></div>"
  +'<h3 class="sub">Opinions, and the real history behind them</h3><div class="fa-ops">'+p.o.map(function(o){return'<div class="fa-op"><h4>'+E(o[0])+'</h4><p class="fa-take">“'+E(o[1])+'”</p><p class="fa-fact"><b>The real tech:</b> '+E(o[2])+"</p></div>"}).join("")+"</div>"
  +'<h3 class="sub">Little things</h3><dl class="fa-dl"><dt>Quirk</dt><dd>'+E(p.q)+"</dd><dt>Afraid of</dt><dd>"+E(p.f)+'</dd><dt>A secret</dt><dd><button type="button" class="btn" id="fa-sb" aria-expanded="false">Tell me the secret</button><span id="fa-secret" hidden>'+E(p.s)+"</span></dd></dl>"
  +'<h3 class="sub">Growing up</h3><ol class="fa-grow">'+p.g.map(function(g){return"<li><b>"+g[0]+"</b> "+E(g[1])+(ph.filter(function(a){return a.y===g[0]}).length?' <a href="#/album/y/'+g[0]+'">Photos from '+g[0]+"</a>":"")+"</li>"}).join("")+"</ol>"
  +(th.length?th.map(function(t){return"<details><summary><b>"+E(t.t)+"</b></summary><ol class=\"fa-beats\">"+t.b.map(function(b){return"<li><small>"+b[0]+"</small> "+E(b[1])+"</li>"}).join("")+"</ol></details>"}).join(""):"")
  +(bd.length?'<h3 class="sub">Who they are close to</h3><div class="fa-bonds">'+bd.map(function(b){var o=b.w.filter(function(x){return x!==id});return'<div class="fa-bond"><span class="fa-pair">'+o.map(function(x){return'<a href="#/family/'+E(x)+'" aria-label="'+E(NAME[x]||x)+'">'+av(x,44)+"</a>"}).join("")+"</span><div><b>"+o.map(function(x){return E(NAME[x]||x)}).join(" and ")+"</b> <small>"+E(b.k)+"</small><p>"+E(b.n)+"</p></div></div>"}).join("")+"</div>":"")
  +(jk.length?'<h3 class="sub">Running jokes</h3><ul class="fa-jk">'+jk.map(function(j){return"<li>"+E(j.t)+' <q>'+E(j.c)+"</q></li>"}).join("")+"</ul>":"")
  +(sq.length?'<h3 class="sub">Squabbles they are in</h3><ul class="fa-sql">'+sq.map(function(s){return'<li><a href="#/squabbles/'+E(s.id)+'"><b>'+E(s.t)+"</b></a> "+E(s.p)+"</li>"}).join("")+"</ul>":"")
  +(ph.length?'<h3 class="sub">In the album</h3><p><a href="#/album/w/'+E(id)+'">See all '+ph.length+" photos with "+E(NAME[id]||id)+'</a></p><div class="fa-minis">'+ph.slice(0,6).map(function(a){return'<a class="fa-mini" href="#/album/'+E(a.id)+'" aria-label="'+E(a.t+", "+a.y)+'">'+picture(a)+"<small>"+a.y+" "+E(a.t)+"</small></a>"}).join("")+"</div>":"")
  +'<p class="fa-pn"><a class="btn" href="#/family/'+prev+'">← '+E(NAME[prev])+'</a> <a class="btn" href="#/family">Everyone</a> <a class="btn" href="#/family/'+next+'">'+E(NAME[next])+" →</a></p></section>";
 app.innerHTML=h;
 var k=0,port=$("#fa-port"),line=$("#fa-line"),curOut="";
 function say(){k=(k+1)%p.v.say.length;line.innerHTML=fbub(id,p.v.say[k]);var s=$("svg",port);if(s&&CMCast.play)CMCast.play(s,"talk",1500)}
 port.onclick=say;$("#fa-again").onclick=say;
 $("#fa-sb").onclick=function(){var s=$("#fa-secret"),on=s.hidden;s.hidden=!on;this.setAttribute("aria-expanded",on?"true":"false");this.textContent=on?"Hide it again":"Tell me the secret"};
 var sel=$("#fa-of");if(sel)sel.onchange=function(){port.innerHTML=av(id,160,{outfit:sel.value})}}

/* ---------- squabbles ---------- */
function fbub(id,t){return window.CMBub?CMBub.say(id,t,{noav:1}):"“"+E(t)+"”"}
function squabCard(s,open){var vote=st.votes[s.id],sides=Object.keys(s.s);
 return'<article class="fa-sq" id="sq-'+E(s.id)+'" data-tone="'+E(s.k)+'" data-w="'+E(s.w.join(" "))+'"><header><span class="fa-pair">'+s.w.map(function(x){return'<a href="#/family/'+E(x)+'" aria-label="'+E(NAME[x]||x)+'">'+av(x,48)+"</a>"}).join("")+'</span><div><h3>'+E(s.t)+'</h3><span class="fa-tone fa-tone-'+E(s.k.replace(/\s/g,""))+'">'+E((TONES.filter(function(t){return t[0]===s.k})[0]||[0,s.k])[1])+'</span></div></header><p class="fa-topic">'+E(s.p)+"</p>"
  +'<div class="fa-bubs">'+sides.map(function(c,j){if(window.CMBub)return CMBub.html(c,NAME[c]||c,s.s[c],av(c,44),{cls:"fa-bub fa-b"+(j%2)+(j%2?" cb-fl":"")});return'<div class="fa-bub fa-b'+(j%2)+'"><span class="fa-bav" aria-hidden="true">'+av(c,44)+'</span><p><b>'+E(NAME[c]||c)+":</b> "+E(s.s[c])+"</p></div>"}).join("")+'</div><p class="fa-fact"><b>The real tech:</b> '+E(s.f)+'</p><p class="fa-out"><b>How it ended:</b> '+E(s.o)+'</p><div class="fa-vote" role="group" aria-label="Whose side are you on?"><span>Whose side are you on?</span> '+sides.map(function(c){return'<button type="button" class="btn fa-v'+(vote===c?" on":"")+'" data-sq="'+E(s.id)+'" data-c="'+E(c)+'" aria-pressed="'+(vote===c)+'">'+E(NAME[c]||c)+"</button>"}).join(" ")+(vote?' <small class="fa-sd">You took '+E(NAME[vote]||vote)+"’s side.</small>":"")+"</div></div></article>"}
function squabPage(args){var id=args&&args[0]||"",tone="",who="";
 var tally={},LIM=6,shown=LIM;Object.keys(st.votes).forEach(function(k){tally[k]=1});
 var h='<section class="fa"><h2>The Squabbles</h2><p class="fa-lead">Petty fights, loud fights and long cold wars, each one about a real thing that used to go wrong with a PC. Nobody is ever really angry. Everybody is always a little right.</p><p class="fa-links"><a class="btn" href="#/family">The Family file</a> <a class="btn" href="#/album">The photo album</a> <button type="button" class="btn pri" id="fa-rnd">Surprise me</button></p>'
  +'<div class="fa-tools"><div class="fa-chips" role="group" aria-label="Kind of fight"><button type="button" class="btn fa-tn on" data-t="" aria-pressed="true">All</button> '+TONES.map(function(t){return'<button type="button" class="btn fa-tn" data-t="'+E(t[0])+'" aria-pressed="false">'+E(t[1])+"</button>"}).join(" ")+'</div><label for="fa-sw">Who is in it </label><select id="fa-sw"><option value="">Anyone</option>'+ORDER.map(function(c){return'<option value="'+c+'">'+E(NAME[c])+"</option>"}).join("")+'</select> <span id="fa-sc" class="fa-note" aria-live="polite"></span></div>'
  +'<div id="fa-sql">'+FAMDATA.squabbles.map(function(q){return squabCard(q,false)}).join("")+'</div><p class="noprint"><button type="button" class="btn" id="fa-more"></button></p>'
  +'<h3 class="sub">Running jokes</h3><details class="rc-more fa-jk"><summary>These come back. Every family has a few. Show all '+FAMDATA.jokes.length+'</summary><ul class="fa-jokes">'+FAMDATA.jokes.map(function(j){return'<li><p>'+E(j.t)+"</p><q>"+E(j.c)+"</q>"+chips(j.w)+"</li>"}).join("")+"</ul></details></section>";
 app.innerHTML=h;
 function filt(){var n=0,m=0;$$(".fa-sq").forEach(function(c){var ok=(!tone||c.getAttribute("data-tone")===tone)&&(!who||(" "+c.getAttribute("data-w")+" ").indexOf(" "+who+" ")>=0);if(ok)m++;var vis=ok&&(m<=shown||c.getAttribute("data-pin")==="1");c.hidden=!vis;if(vis)n++});$("#fa-sc").textContent=m+" of "+FAMDATA.squabbles.length+" match, "+n+" showing";var mb=$("#fa-more"),rest=m-n;mb.parentNode.hidden=rest<=0;mb.textContent="Show "+Math.min(LIM,rest)+" more ("+rest+" left)"}
 $("#fa-more").onclick=function(){shown+=LIM;filt()};
 function openCard(c,on){var s0=FAMDATA.squabbles.filter(function(x){return x.id===c.id.replace(/^sq-/,"")})[0],nw=document.createElement("div");nw.innerHTML=squabCard(s0,on);var el=nw.firstChild;if(c.hidden)el.hidden=true;if(c.getAttribute("data-pin"))el.setAttribute("data-pin",c.getAttribute("data-pin"));c.parentNode.replaceChild(el,c);return el}
 $$(".fa-tn").forEach(function(b){b.onclick=function(){tone=b.getAttribute("data-t");$$(".fa-tn").forEach(function(x){var on=x===b;x.classList.toggle("on",on);x.setAttribute("aria-pressed",on?"true":"false")});filt()}});
 $("#fa-sw").onchange=function(){who=this.value;filt()};
 $("#fa-rnd").onclick=function(){var vis=$$(".fa-sq").filter(function(c){return(!tone||c.getAttribute("data-tone")===tone)&&(!who||(" "+c.getAttribute("data-w")+" ").indexOf(" "+who+" ")>=0)});if(!vis.length)return;var c=vis[Math.floor(Math.random()*vis.length)];hl(c)};
 app.onclick=function(e){var op=e.target.closest&&e.target.closest(".fa-hear");if(op){var card0=op.closest(".fa-sq"),was=op.getAttribute("aria-expanded")==="true",el0=openCard(card0,!was);var b0=$(".fa-hear",el0);if(b0)b0.focus();return}var b=e.target.closest&&e.target.closest(".fa-v");if(!b)return;var sid=b.getAttribute("data-sq"),c=b.getAttribute("data-c");if(st.votes[sid]===c)delete st.votes[sid];else st.votes[sid]=c;write();
  var s=FAMDATA.squabbles.filter(function(x){return x.id===sid})[0],card=$("#sq-"+sid),nw=document.createElement("div");nw.innerHTML=squabCard(s,true);var el=nw.firstChild;if(card.getAttribute("data-pin"))el.setAttribute("data-pin","1");card.parentNode.replaceChild(el,card);var nb=$('.fa-v[data-c="'+c+'"]',el);if(nb)nb.focus()};
 function hl(c){c.setAttribute("data-pin","1");c.hidden=false;c=openCard(c,true);c.setAttribute("data-pin","1");c.hidden=false;$$(".fa-hl").forEach(function(x){x.classList.remove("fa-hl")});c.classList.add("fa-hl");try{c.scrollIntoView({block:"center"})}catch(e){c.scrollIntoView()}}
 filt();if(id){var c=$("#sq-"+id.replace(/[^\w-]/g,""));if(c)hl(c)}}

/* ---------- the album ---------- */
function albumPage(args){var mode=args&&args[0]||"",arg=args&&args[1]||"",one=null;
 if(mode&&mode!=="y"&&mode!=="w"){one=FAMDATA.album.filter(function(a){return a.id===mode})[0];if(!one){notFound("album/"+mode);return}}
 if(one)return onePhoto(one);
 var yr=mode==="y"&&/^\d{4}$/.test(arg)?+arg:0,who=mode==="w"&&P(arg)?arg:"",fx="";
 var years=[];FAMDATA.album.forEach(function(a){if(years.indexOf(a.y)<0)years.push(a.y)});
 var h='<section class="fa"><h2>The Family photo album</h2><p class="fa-lead">Thirty-one years of the Ventionals trying to take one good picture. Somebody always blinks. Somebody is always cut off. Tess is somewhere behind everyone. Turn any photo over to read what was written on the back.</p><p class="fa-links"><a class="btn" href="#/family">The Family file</a> <a class="btn" href="#/squabbles">The squabbles</a></p>'
  +'<div class="fa-tools"><label for="fa-ay">Year </label><select id="fa-ay"><option value="0">Every year</option>'+years.map(function(y){return'<option value="'+y+'"'+(y===yr?" selected":"")+">"+y+"</option>"}).join("")+'</select> <label for="fa-aw">Who is in it </label><select id="fa-aw"><option value="">Anyone</option>'+ORDER.map(function(c){return'<option value="'+c+'"'+(c===who?" selected":"")+">"+E(NAME[c])+"</option>"}).join("")+'</select> <label for="fa-ax">What went wrong </label><select id="fa-ax"><option value="">Anything</option>'+Object.keys(FXN).map(function(k){return'<option value="'+k+'">'+E(FXN[k])+"</option>"}).join("")+'</select> <span id="fa-ac" class="fa-note" aria-live="polite"></span></div><div id="fa-list"></div><p class="noprint"><button type="button" class="btn" id="fa-amore"></button></p></section>';
 var PL=12,pshown=PL;
 app.innerHTML=h;
 function draw(){var list=FAMDATA.album.filter(function(a){return(!yr||a.y===yr)&&(!who||a.w.indexOf(who)>=0)&&(!fx||a.fx.indexOf(fx)>=0)}).sort(function(a,b){return a.y-b.y}),o="",cy=0;
  list.slice(0,pshown).forEach(function(a){if(a.y!==cy){if(cy)o+="</div>";cy=a.y;o+='<h3 class="sub fa-yh">'+cy+'</h3><div class="fa-photos">'}o+=figure(a)});if(cy)o+="</div>";
  $("#fa-list").innerHTML=o||'<p class="empty">No photos match. The family says that is the most flattering result.</p>';$("#fa-ac").textContent=list.length+" of "+FAMDATA.album.length+" photos";var am=$("#fa-amore"),rest=list.length-pshown;am.parentNode.hidden=rest<=0;am.textContent="Show "+Math.min(PL,rest)+" more ("+rest+" left)";wirePhotos($("#fa-list"))}
 $("#fa-ay").onchange=function(){yr=+this.value;pshown=PL;draw()};$("#fa-aw").onchange=function(){who=this.value;pshown=PL;draw()};$("#fa-ax").onchange=function(){fx=this.value;pshown=PL;draw()};$("#fa-amore").onclick=function(){pshown+=PL;draw()};draw()}
function onePhoto(a){var list=FAMDATA.album.slice().sort(function(x,y){return x.y-y.y}),i=list.indexOf(a),pv=list[(i+list.length-1)%list.length],nx=list[(i+1)%list.length],same=list.filter(function(x){return x!==a&&x.y===a.y});
 var h='<section class="fa"><p class="fa-up"><a href="#/album">The photo album</a> / '+E(a.t)+"</p><h2>"+E(a.t)+", "+a.y+"</h2>"+figure(a,{big:1})
  +'<p class="fa-lead">'+E(a.n)+'</p><p class="fa-note"><b>What went wrong:</b> '+E(a.aw)+"</p><p>"+tags(a)+"</p><p><b>In the picture:</b> "+chips(a.w)+"</p>"
  +(same.length?'<p><b>More from '+a.y+":</b> "+same.map(function(x){return'<a href="#/album/'+E(x.id)+'">'+E(x.t)+"</a>"}).join(", ")+"</p>":"")
  +'<p class="fa-pn"><a class="btn" href="#/album/'+E(pv.id)+'">← '+pv.y+" "+E(pv.t)+'</a> <a class="btn" href="#/album">All photos</a> <a class="btn" href="#/album/'+E(nx.id)+'">'+nx.y+" "+E(nx.t)+" →</a></p></section>";
 app.innerHTML=h;wirePhotos(app)}

function notFound(x){app.innerHTML='<section class="fa"><h2>Not in the album</h2><p class="empty">Nobody here is called <b>'+E(x)+'</b>.</p><p><a class="btn" href="#/family">The Family file</a> <a class="btn" href="#/album">The photo album</a></p></section>'}

return{mount:function(el,page,args){app=el;st=load();try{if(typeof FAMDATA==="undefined"||typeof CMCast==="undefined")throw new Error("data missing");
  if(page==="family"){if(args&&args[0])profile(args[0]);else indexPage()}else if(page==="squabbles")squabPage(args);else if(page==="album")albumPage(args);else indexPage()}
 catch(e){app.innerHTML='<section><h2>Something broke</h2><p class="empty">This page could not load ('+E(e.message)+").</p></section>"}},
 unmount:function(){timers.forEach(clearTimeout);timers=[];if(app)app.onclick=null},
 _t:{picture:picture,figure:figure,stamp:stamp,arrive:arrive,noteAt:noteAt,ORDER:ORDER}}})();
