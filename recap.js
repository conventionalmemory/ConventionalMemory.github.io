/* recap.js: the Recap Bench (#/recap and #/recap/<machine>).
   Pick a machine, tick off each capacitor as you replace it, add your own, paste a list, get a shopping list and a tool list.
   Everything saves in this browser only (localStorage key cm-recap). The whole Ventional family helps, and they turn up as you make progress.
   Data lives in recap-data.js; the family comes from cast.js. */
window.CMRecap=(function(){
"use strict";
var KEY="cm-recap",app=null,st=null,M=null,live=0;
function E(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function $(s,r){return(r||app).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||app).querySelectorAll(s))}
function fmt(n){return String(+n)}
function today(){var d=new Date();return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2)}

/* ---------- the family ---------- */
var NAME={connie:"Connie",emma:"Emma",hiram:"Hiram",ram:"Dad",rhoda:"Mom",floyd:"Grandpa Floyd",winnie:"Grandma Winnie",augusta:"Aunt Gussie",conrad:"Uncle Conrad",tess:"Tessie",nibble:"Nibble",dot:"Dot",viv:"Viv",sandy:"Sandy",mo:"Mo",zack:"Zack",mat:"Mat",toner:"Toner"};
/* the order they arrive at the bench as you make progress; Connie is always there */
var ARRIVE=["emma","hiram","ram","rhoda","floyd","winnie","augusta","conrad","dot","viv","sandy","mo","zack","tess","nibble","mat","toner"];
var PET={nibble:1,mat:1,toner:1};
var HOLD={ram:"iron",rhoda:"clipboard",floyd:"floppy",emma:"magnifier",hiram:"controller",dot:"clipboard",sandy:"walkman",zack:"book",mo:"phone",augusta:"clipboard",conrad:"clipboard",winnie:"book",viv:"pencil",tess:"flag"};
function av(id,sz,o){o=o||{};if(typeof CMCast==="undefined")return"";
 var opt={tall:!PET[id]};if(typeof CMCast.famOpts==="function"){var f=CMCast.famOpts(id);for(var k in f)opt[k]=f[k]}
 if(o.holds)opt.holds=o.holds;if(o.mood)opt.mood=o.mood;
 try{return CMCast.svg(id,sz,opt)}catch(e){return""}}
function crew(id,line,holds,cls){if(window.CMBub)return CMBub.html(id,NAME[id]||id,line,av(id,48,{holds:holds||HOLD[id]}),{cls:"rc-crew"+(cls?" "+cls:"")});return'<div class="rc-crew'+(cls?" "+cls:"")+'"><span class="rc-av" aria-hidden="true">'+av(id,48,{holds:holds||HOLD[id]})+'</span><p><b>'+E(NAME[id]||id)+':</b> '+E(line)+'</p></div>'}
var STEP_CREW={photo:["floyd","Disk 7 of 14 taught me this. Take the picture first."],safe:["rhoda","Rules first. Unplugged means unplugged, and nothing is up for discussion."],open:["ram","Sort the screws. 640K was plenty. Screw holes never were."],clean:["toner","I know a lot about mess. Keep mine off your board."],pol:["viv","Mark it in color. I do sixteen on a good day."],off:["nibble","Small parts are my department. I once ran off with a resistor."],pads:["emma","Technically, a lifted pad is an addressing error. Check them all."],on:["augusta","In order, smallest first, no questions until you are done."],flux:["dot","Print it. Check every joint. In triplicate, and loud."],short:["mo","A beep means connected. For a short, that is the wrong kind of connected."],test:["sandy","Turn it up to eleven. If it crackles, it is not IRQ 5 this time."]};
var GROUP_CREW={Soldering:["ram","Dad bought the good iron in 1986 and it still works."],Handling:["zack","Folded small, that is me. Small hands for small parts."],Testing:["conrad","Test before you load anything. That is how I set up the whole family."],Cleaning:["toner","Clean as you go. Pawprints are not a flux."],Safety:["rhoda","Read-only means no changing the rules."],"Opening it up":["floyd","Keep every screw in your shirt pocket. Or a muffin tin."]};

/* ---------- saved state ---------- */
function blank(){return{v:1,g:{br:"pan"},m:{},sum:{caps:0,full:0}}}
function load(){var o=null;try{o=JSON.parse(localStorage.getItem(KEY)||"null")}catch(e){}
 if(!o||typeof o!=="object"||Array.isArray(o))o=blank();o.g=o.g&&typeof o.g==="object"?o.g:{br:"pan"};o.m=o.m&&typeof o.m==="object"?o.m:{};o.sum=o.sum&&typeof o.sum==="object"?o.sum:{caps:0,full:0};return o}
var saved=true;
function write(){try{localStorage.setItem(KEY,JSON.stringify(st));saved=true}catch(e){saved=false}}
function mst(id){var m=st.m[id];if(!m||typeof m!=="object"){m=st.m[id]={}}m.d=m.d&&typeof m.d==="object"?m.d:{};m.c=Array.isArray(m.c)?m.c:[];m.s=m.s&&typeof m.s==="object"?m.s:{};m.t=m.t&&typeof m.t==="object"?m.t:{};m.sf=m.sf&&typeof m.sf==="object"?m.sf:{};m.n=typeof m.n==="string"?m.n:"";m.ty=/^(smd|th)$/.test(m.ty)?m.ty:"";m.sp=/^(0|1|25|50)$/.test(String(m.sp))?String(m.sp):"1";m.need=m.need!==0;m.tab=/^(caps|shop|know|do|docs|notes)$/.test(m.tab)?m.tab:"";m.rv=typeof m.rv==="string"&&/^[\w.-]{1,24}$/.test(m.rv)?m.rv:"";return m}
function byId(id){return RECAP.filter(function(x){return x.id===id})[0]}

/* ---------- rows ---------- */
function bvis(b,ms){return!b.revs||!ms.rv||b.revs.indexOf(ms.rv)>=0}
function rowsOf(mach,ms){var out=[];
 mach.boards.forEach(function(b){if(!bvis(b,ms))return;b.rows.forEach(function(r,gi){var n=r.n||1;
  for(var k=1;k<=n;k++){var id=b.id+":"+(r.ref||("g"+gi+"-"+k));
   out.push({id:id,b:b.id,bn:b.n,ref:r.ref||"",lab:r.ref?"":(fmt(r.uf)+" µF "+fmt(r.v)+" V"+(n>1?" #"+k+" of "+n:"")),uf:r.uf,v:r.v,ty:r.ty||"",note:r.note||"",pr:r.pr||0,custom:false})}})});
 ms.c.forEach(function(c){var n=Math.max(1,Math.min(+c.n||1,60));
  for(var k=1;k<=n;k++)out.push({id:"x:"+c.id+":"+k,b:c.b||"x",bn:c.b==="x"||!c.b?"My additions":((mach.boards.filter(function(b){return b.id===c.b})[0]||{}).n||"My additions"),ref:c.r||"",lab:c.r?"":(fmt(c.u)+" µF "+fmt(c.v)+" V"+(n>1?" #"+k+" of "+n:"")),uf:c.u,v:c.v,ty:c.t||"",note:c.note||"",custom:true,cid:c.id})});
 return out}
function stats(mach){var ms=mst(mach.id),rows=rowsOf(mach,ms),d=rows.filter(function(r){return ms.d[r.id]}).length;return{rows:rows,total:rows.length,done:d,pct:rows.length?Math.round(d/rows.length*100):0,ms:ms}}
function summary(){st=st||load();var caps=0,full=0;RECAP.forEach(function(m){var s=stats(m);caps+=s.done;if(s.total>=4&&s.done===s.total)full++});return{caps:caps,full:full}}
function persist(){var s=summary();st.sum={caps:s.caps,full:s.full};write()}
function effTy(r,ms){return r.ty||ms.ty||""}

/* ---------- buying ---------- */
var BRAND={pan:"Panasonic",nic:"Nichicon",any:""};
function partQ(uf,v,ty){var br=BRAND[st.g.br]||"";return[br,fmt(uf)+"uF",fmt(v)+"V",ty==="smd"?"SMD":ty==="ax"?"axial":ty==="th"?"radial":"","electrolytic capacitor"].filter(Boolean).join(" ")}
function aff(){return typeof affOn==="function"&&affOn()}
function stores(q,lab){if(!aff()||!q)return"";var a=affUrl("amazon",q),e=affUrl("ebay",q),rel=' target="_blank" rel="sponsored noopener noreferrer"';
 return(a?'<a class="rc-buy" href="'+E(a)+'"'+rel+'>'+E(lab||"Amazon")+'</a>':"")+(e?'<a class="rc-buy rc-e" href="'+E(e)+'"'+rel+'>eBay</a>':"")}
/* Capacitor kits Console5 sells for this machine (kits-data.js: [name, page name]). Each links straight to its page in their store. */
var C5="https://console5.com/store/";
function kitList(mach){var k=typeof KITS!=="undefined"&&KITS[mach.id]||[];return k.filter(function(x){return x&&x[0]&&/^[a-z0-9-]{3,160}$/.test(x[1]||"")})}
function c5Link(k,cls){return'<a class="'+(cls||"rc-buy rc-c")+'" href="'+E(C5+k[1]+".html")+'" target="_blank" rel="noopener noreferrer">'+E(cls?k[0]:"Console5 kit")+'</a>'}
function kitsHtml(mach){var ks=kitList(mach);if(!ks.length)return"";
 var li=function(k){return'<li><a href="'+E(C5+k[1]+".html")+'" target="_blank" rel="noopener noreferrer"><b>'+E(k[0])+'</b></a></li>'};
 return'<section class="rc-c5 noprint" aria-labelledby="rc-kith"><h3 class="sub" id="rc-kith">Console5 capacitor kits for this machine</h3><p class="tn">Console5 sells ready-made capacitor kits, so you do not have to build the list yourself. Kits come in different versions. Match the board number in the kit name to yours, and check the listing before you buy.</p>'
  +(ks.length>4?'<details class="rc-more"><summary>Show all '+ks.length+' kits</summary><ul class="rc-guides">'+ks.map(li).join("")+'</ul></details>':'<ul class="rc-guides">'+ks.map(li).join("")+'</ul>')+'</section>'}
/* The buying strip at the top of a machine page: Amazon, eBay, then Console5's own kit page(s). */
function getItHtml(mach){var ks=kitList(mach),q=mach.kit||(mach.n+" capacitor kit"),a=aff()?stores(q,"Amazon"):"";if(!a&&!ks.length)return"";
 var c=!ks.length?"":ks.length===1?c5Link(ks[0]):'<details class="rc-c5d"><summary class="rc-buy rc-c">Console5 kits ('+ks.length+')</summary><ul class="rc-c5l">'+ks.map(function(k){return'<li>'+c5Link(k,"rc-c5a")+'</li>'}).join("")+'</ul></details>';
 return'<div class="rc-getit noprint" id="rc-getit"><b>Get the parts</b> '+a+c+'<small>Match the board number before you buy. Kits come in versions.</small></div>'}
function discl(){return aff()&&typeof AFF_SHORT!=="undefined"?'<p class="tn rc-aff">'+E(AFF_SHORT)+' <a href="#/disclosure">Details</a></p>':""}
function shopList(mach,ms,rows){var need=ms.need?rows.filter(function(r){return!ms.d[r.id]}):rows,map={},keys=[];
 need.forEach(function(r){var ty=effTy(r,ms),k=r.uf+"|"+r.v+"|"+ty;if(!map[k]){map[k]={uf:r.uf,v:r.v,ty:ty,n:0,pr:0};keys.push(k)}map[k].n++;if(r.pr&&(!map[k].pr||r.pr<map[k].pr))map[k].pr=r.pr});
 var sp=+ms.sp;keys.sort(function(a,b){var x=map[a],y=map[b],px=x.pr||9,py=y.pr||9;return px-py||y.n-x.n||x.uf-y.uf});
 return keys.map(function(k){var p=map[k],extra=sp===0?0:sp===1?1:Math.max(1,Math.ceil(p.n*sp/100));p.x=extra;p.buy=p.n+extra;p.q=partQ(p.uf,p.v,p.ty);return p})}
function tyLab(t){return t==="smd"?"surface mount":t==="ax"?"axial":t==="th"?"through-hole":"type not set"}
function listText(mach,items){return mach.n+" capacitor shopping list\n"+items.map(function(p){return p.buy+" x "+fmt(p.uf)+" uF "+fmt(p.v)+" V ("+tyLab(p.ty)+")"+(p.x?" including "+p.x+" spare":"")}).join("\n")+"\n(from conventionalmemory.io/#/recap/"+mach.id+")"}

function csvText(mach,items){return"Qty,Capacitance (uF),Voltage (V),Type,Note\n"+items.map(function(p){return[p.buy,fmt(p.uf),fmt(p.v),tyLab(p.ty),p.x?"includes "+p.x+" spare":""].join(",")}).join("\n")+"\n"}
function assortQ(ms){return(BRAND[st.g.br]?BRAND[st.g.br]+" ":"")+(ms.ty==="smd"?"SMD electrolytic capacitor assortment kit":ms.ty==="th"?"radial electrolytic capacitor assortment kit":"electrolytic capacitor assortment kit")}
function saveCsv(name,txt){try{var a=document.createElement("a"),u=URL.createObjectURL(new Blob([txt],{type:"text/csv"}));a.href=u;a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(u)},500);return true}catch(e){return false}}

/* ---------- parse a pasted list ---------- */
function parseList(txt){var ok=[],bad=[];String(txt||"").split(/\r?\n/).slice(0,120).forEach(function(line){line=line.replace(/^\s+|\s+$/g,"");if(!line)return;
 var u=line.match(/(\d+(?:[.,]\d+)?)\s*(?:u|µ|μ)\s*f\b/i),v=line.replace(u?u[0]:"","").match(/(\d+(?:[.,]\d+)?)\s*v\b/i);
 if(!u||!v){bad.push(line);return}
 var q=line.match(/^(\d{1,3})\s*x\s/i),rf=line.match(/^([A-Za-z]{1,3}\d{1,3})\b/);
 var uf=+u[1].replace(",","."),vv=+v[1].replace(",","."),t=/smd|surface/i.test(line)?"smd":/axial/i.test(line)?"ax":/radial|through|\bth\b/i.test(line)?"th":"";
 if(!(uf>0&&uf<=100000&&vv>0&&vv<=1000)){bad.push(line);return}
 ok.push({r:rf&&!q?rf[1].toUpperCase():"",u:uf,v:vv,t:t,n:q?Math.min(60,+q[1]):1})});
 return{ok:ok,bad:bad}}

/* ---------- pieces of the page ---------- */
function motion(){return document.documentElement.getAttribute("data-motion")==="on"}
function bar(pct,lab){return'<div class="rc-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+pct+'" aria-label="'+E(lab||"Progress")+'"><i style="width:'+pct+'%"></i></div>'}
function cheer(pct,done){var line=RECAP_CHEER[0][1];RECAP_CHEER.forEach(function(c){if(pct>=c[0]&&(c[0]>0||done===0)&&(c[0]!==1||done>0))line=c[1]});return line}
function crewStrip(pct){var n=ARRIVE.length,k=pct>=100?n:Math.floor(pct/100*n);
 return'<div class="rc-strip" aria-label="'+(k+1)+' of '+(n+1)+' family members are at the bench">'+'<span class="rc-s on" title="Connie">'+av("connie",36,{holds:"iron"})+'</span>'+ARRIVE.map(function(id,i){var on=i<k;return'<span class="rc-s'+(on?" on":"")+'" title="'+E(on?NAME[id]:"Not here yet")+'">'+(on?av(id,36,{holds:HOLD[id]}):'<b aria-hidden="true">?</b>')+'</span>'}).join("")+'</div>'}
var REWARDS=[{k:"acc",id:"goggles",n:"Safety goggles",need:"Check off 1 capacitor",test:function(s){return s.caps>=1}},
 {k:"look",id:"bench",n:"Bench Tech look",need:"Check off 10 capacitors",test:function(s){return s.caps>=10}},
 {k:"acc",id:"loupe",n:"Jeweler's loupe",need:"Check off 25 capacitors",test:function(s){return s.caps>=25}},
 {k:"look",id:"recap",n:"Recap Hero look",need:"Finish a whole machine",test:function(s){return s.full>=1}},
 {k:"outfit",id:"solderer",n:"Soldering outfit for Dad and Uncle Conrad",need:"Check off 50 capacitors",test:function(s){return s.caps>=50}}];
function rewardsHtml(){var s=summary();
 return'<section class="rc-rw" aria-labelledby="rc-rw-h"><h3 class="sub" id="rc-rw-h">Bench rewards</h3><p class="tn">Connie and the family earn new things as you work. Everything you check off counts, on every machine. '+s.caps+' capacitor'+(s.caps===1?"":"s")+' so far, '+s.full+' machine'+(s.full===1?"":"s")+' finished.</p><ul class="rc-rwl">'+REWARDS.map(function(r){var ok=r.test(s);return'<li class="'+(ok?"on":"")+'"><span aria-hidden="true">'+(ok?"✓":"•")+'</span> <b>'+E(r.n)+'</b> <small>'+(ok?"Unlocked":E(r.need))+'</small></li>'}).join("")+'</ul><p><a class="btn" href="#/closet">Open the closet</a></p></section>'}

/* ---------- the "can I use this one?" checker ---------- */
function checkerHtml(){return'<section class="rc-ck" aria-labelledby="rc-ck-h"><h3 class="sub" id="rc-ck-h">Can I use this capacitor?</h3>'+crew("mat","I scurry between the old value and the new one. Tell me both.","")+'<div class="rc-ckf"><fieldset><legend>The original</legend><label>µF <input id="ck-ou" type="number" min="0" step="any" inputmode="decimal" value="47"></label> <label>Volts <input id="ck-ov" type="number" min="0" step="any" inputmode="decimal" value="16"></label></fieldset><fieldset><legend>The one you have</legend><label>µF <input id="ck-nu" type="number" min="0" step="any" inputmode="decimal" value="47"></label> <label>Volts <input id="ck-nv" type="number" min="0" step="any" inputmode="decimal" value="25"></label></fieldset></div><p id="ck-out" class="rc-ckr" role="status"></p></section>'}
function verdict(ou,ov,nu,nv){if(!(ou>0&&ov>0&&nu>0&&nv>0))return["Enter all four numbers.","n"];
 if(nv<ov)return["No. The voltage is lower than the original ("+fmt(nv)+" V against "+fmt(ov)+" V). The capacitor could fail. Use "+fmt(ov)+" V or higher.","bad"];
 var ratio=nu/ou,size=nv>ov*2.1?" A much higher voltage rating also means a bigger case, so check that it fits.":" Check that it physically fits.";
 if(ratio>=0.9&&ratio<=1.2)return["Yes. "+fmt(nu)+" µF at "+fmt(nv)+" V is a good match."+size,"ok"];
 if(ratio>1.2&&ratio<=2)return["Probably. It is a bit bigger than the original. That is usually fine for power filtering, but ask first if this one is in an audio or timing circuit."+size,"mid"];
 if(ratio<0.9&&ratio>=0.5)return["Not ideal. It is smaller than the original. Look for the original value."+size,"mid"];
 return["No. "+fmt(nu)+" µF is too far from "+fmt(ou)+" µF. Find the right value.","bad"]}

/* ---------- the pages ---------- */
var CATS=["Consoles and handhelds","Computers","Audio and other gear"];
function intro(){return'<p class="sp-lead">Old capacitors dry out and leak, and the leak eats the board. A recap swaps them for new ones before that happens. Pick your machine, check each capacitor off as you replace it, and your list stays right here, saved in this browser.</p>'}
var WORTH={yes:["Worth a recap","Reports say a recap is a common and useful fix on this one."],maybe:["Check first","A recap is not always the answer here. Look at the guides before you order parts."]};
function hintsHtml(mach){var hs=mach.hints;if(!hs||!hs.length)return'<h3 class="sub" id="rc-start">Where to start</h3>'+crew("conrad","We did not find a clear list of what fails first on this one. Read the guides below, check your board for leaks, and fix what you can see.","")+'<p class="tn">We would rather say that than guess.</p>';
 return'<h3 class="sub" id="rc-start">Where to start</h3>'+crew("conrad","Check these first. They come from write-ups and forum threads, so treat them as clues and not as a diagnosis.","")
  +'<ul class="rc-hints">'+hs.map(function(x){return'<li><b>'+E(x.sym)+'</b>'+(x.conf?' <span class="rc-conf rc-conf-'+E(x.conf.toLowerCase())+'" title="How well supported this is">'+E(x.conf)+' confidence</span>':"")+'<p>'+E(x.say)+'</p>'+(x.src?'<a class="rc-src" href="'+E(x.src)+'" target="_blank" rel="noopener noreferrer">Read the source</a>':"")+'</li>'}).join("")+'</ul>'
  +'<p class="tn">Low means one forum thread or one repair. High means several independent write-ups agree. Where a capacitor fails first, the usual advice is still to recap the whole set so you only open the machine once.</p>'}
var KIND={tip:"Tip",anecdote:"Story",maybe:"Maybe",warning:"Watch out"};
function revsHtml(mach,ms){var rv=mach.revs||[];
 if(!rv.length)return'<h3 class="sub" id="rc-rev">Which board do I have?</h3><p class="tn">We have no board revision notes for this machine yet. Look for a model or board number on the board or the case, and match it against the guides below.</p>';
 var cur=rv.filter(function(r){return r.id===ms.rv})[0],one=rv.length===1;
 var h='<h3 class="sub" id="rc-rev">Which board do I have?</h3>'+crew("viv","Boards changed during production. Find the number printed on yours and pick it here, so the notes match your machine.","pencil");
 if(!one)h+='<p class="noprint"><label for="rc-rv">My board or model</label> <select id="rc-rv"><option value="">Not sure</option>'+rv.map(function(r){return'<option value="'+E(r.id)+'"'+(r.id===ms.rv?" selected":"")+'>'+E(r.n)+'</option>'}).join("")+'</select></p>';
 h+='<div id="rc-rvo" role="status">'+(cur?revOne(cur):(one?revOne(rv[0]):'<p class="tn">Pick yours above to see how to recognize it and what is known about its capacitors. Or read all of them:</p>'))+'</div>';
 if(!one||!cur)h+='<details class="rc-rvall"><summary>All '+rv.length+' revision'+(rv.length===1?"":"s")+' at a glance</summary><div class="rc-rvl">'+rv.map(revOne).join("")+'</div></details>';
 if(rv.note)h+='<p class="tn">'+E(rv.note)+'</p>';
 return h+'<p class="tn">Revision notes come from the sources linked on each one. Many are only partly documented, so check the board in front of you.</p>'}
function revOne(r){return'<div class="rc-rv1"><b>'+E(r.n)+'</b>'+(r.f?' <span class="rc-conf rc-conf-'+E(String(r.f).toLowerCase())+'">'+E(r.f)+' confidence</span>':"")+'<p><i>How to tell:</i> '+E(r.i)+'</p><p><i>Capacitors:</i> '+E(r.c)+'</p><p class="tn">Capacitor list differs from other revisions: '+(r.d===true?"yes":r.d===false?"no":"not known")+'. '+(r.s?'<a class="rc-src" href="'+E(r.s)+'" target="_blank" rel="noopener noreferrer">Source</a>':"")+'</p></div>'}
function tipsHtml(mach){var ts=mach.tips||[];if(!ts.length)return"";
 var kinds=Object.keys(KIND).filter(function(k){return ts.some(function(t){return t.k===k})});
 return'<h3 class="sub" id="rc-tips">Tips, tales and maybes</h3>'+crew("floyd","Everything below was found in write-ups and forum threads. Some of it is one person's lucky fix. I keep notes on all of it, mostly.","floppy")
  +'<p class="rc-tf noprint" role="group" aria-label="Show">Show: <button type="button" class="btn lnk on" data-tk="">All ('+ts.length+')</button>'+kinds.map(function(k){return'<button type="button" class="btn lnk" data-tk="'+k+'">'+KIND[k]+' ('+ts.filter(function(t){return t.k===k}).length+')</button>'}).join("")+'</p>'
  +'<ul class="rc-hints rc-tl2">'+ts.map(function(t){return'<li data-k="'+E(t.k)+'"><span class="rc-chip rc-k-'+E(t.k)+'">'+E(KIND[t.k]||"Tip")+'</span> <b>'+E(t.sym)+'</b> <span class="rc-conf rc-conf-'+E(String(t.conf).toLowerCase())+'">'+E(t.conf)+' confidence</span><p>'+E(t.t)+'</p>'+(t.src?'<a class="rc-src" href="'+E(t.src)+'" target="_blank" rel="noopener noreferrer">Read the source</a>':"")+'</li>'}).join("")+'</ul>'
  +'<p class="tn">These are other people\'s reports, not tested by us. Check part references and values against your own board before you order anything.</p>'}
function cardFor(m){var s=stats(m),started=s.done>0||s.ms.c.length>0;
 return'<a class="rc-card'+(started?" on":"")+'" data-w="'+(m.worth||"")+'" data-l="'+(s.total-s.ms.c.length>0?1:0)+'" data-s="'+(started?1:0)+'" href="#/recap/'+m.id+'"><b>'+E(m.n)+'</b><span class="rc-yr">'+(m.yr||"")+'</span><small>'+(m.ver?(s.total-s.ms.c.length>0?(s.total-s.ms.c.length)+" capacitors listed":""):"Guide links")+(m.ver?"":" and your own list")+'</small>'+(m.worth&&WORTH[m.worth]?'<span class="rc-chip rc-w-'+m.worth+'">'+E(WORTH[m.worth][0])+'</span>':"")+(s.total?bar(s.pct,m.n+" progress")+'<small>'+s.done+' of '+s.total+' done</small>':"")+'</a>'}
function index(){
 var started=RECAP.filter(function(m){var s=stats(m);return s.done>0||s.ms.c.length>0});
 var h='<section class="rc"><h2>The Recap Bench</h2><div class="rc-hero">'+av("connie",120,{holds:"iron",mood:"wink"})+'<div>'+intro()+'<p class="tn">Connie says: look for the leak, mark the polarity, and take your time.</p></div></div>';
 if(started.length)h+='<h3 class="sub">My projects</h3><div class="rc-grid">'+started.map(cardFor).join("")+'</div>';
  h+='<h3 class="sub">Pick a machine</h3><div class="rc-find noprint"><p><label for="rc-q">Find your machine</label> <input id="rc-q" type="search" maxlength="40" placeholder="Game Gear, Amiga, SX-64" autocomplete="off"> <button class="btn" type="button" id="rc-sur">Surprise me</button> <span class="tn" id="rc-qn" role="status"></span></p>'
  +'<p class="rc-chips" role="group" aria-label="Show"><button type="button" class="rc-chip2 on" data-fc="">All <small>'+RECAP.length+'</small></button>'+CATS.map(function(c){var n=RECAP.filter(function(m){return(m.cat||CATS[0])===c}).length;return n?'<button type="button" class="rc-chip2" data-fc="'+E(c)+'">'+E(c)+' <small>'+n+'</small></button>':""}).join("")+'</p>'
  +'<p class="rc-chips" role="group" aria-label="Narrow down"><button type="button" class="rc-chip2 on" data-fs="">Any</button><button type="button" class="rc-chip2" data-fs="worth">Worth a recap</button><button type="button" class="rc-chip2" data-fs="list">Has a capacitor list</button><button type="button" class="rc-chip2" data-fs="mine">My projects</button></p></div>'
  +CATS.map(function(c){var ms=RECAP.filter(function(m){return(m.cat||CATS[0])===c});return ms.length?'<section class="rc-cat" data-cat="'+E(c)+'"><h4 class="rc-cath">'+E(c)+' <small>'+ms.length+'</small></h4><div class="rc-grid">'+ms.map(cardFor).join("")+'</div><p class="rc-mp noprint"><button type="button" class="btn" data-more></button></p></section>':""}).join("")
  +'<p class="tn">Machines marked with a capacitor count have a list you can tick through. The others link to the best guide we found, and you can still add capacitors or paste a list.</p>'
  +'<h3 class="sub">At the bench</h3><div class="rc-tabs noprint" role="tablist" aria-label="Bench extras"><button type="button" class="rc-tab on" role="tab" id="rc-it-ck" data-itab="ck" aria-selected="true" aria-controls="rc-ip-ck">Can I use this capacitor?</button><button type="button" class="rc-tab" role="tab" id="rc-it-rw" data-itab="rw" aria-selected="false" aria-controls="rc-ip-rw" tabindex="-1">My rewards</button><button type="button" class="rc-tab" role="tab" id="rc-it-cr" data-itab="cr" aria-selected="false" aria-controls="rc-ip-cr" tabindex="-1">Meet the crew</button></div>'
  +'<div class="rc-panel" id="rc-ip-ck" data-ipanel="ck" role="tabpanel" aria-labelledby="rc-it-ck">'+checkerHtml()+'</div>'
  +'<div class="rc-panel rc-off" id="rc-ip-rw" data-ipanel="rw" role="tabpanel" aria-labelledby="rc-it-rw">'+rewardsHtml()+'</div>'
  +'<div class="rc-panel rc-off" id="rc-ip-cr" data-ipanel="cr" role="tabpanel" aria-labelledby="rc-it-cr"><p>Everybody in the family has a job at the bench, and they turn up as you check capacitors off.</p><div class="rc-roll">'+["connie"].concat(ARRIVE).map(function(id){var role=({connie:"Cheers you on",emma:"Counts and checks pads",hiram:"Plays the finished machine",ram:"Soldering and screws",rhoda:"The safety rules",floyd:"Photos and screws",winnie:"Spare parts",augusta:"Keeps the steps in order",conrad:"Tools and setup",dot:"Prints the lists",viv:"Marks polarity",sandy:"Tests the sound",mo:"Continuity beeps",zack:"Unzips pasted lists",tess:"Remembers your notes",nibble:"Tiny parts",mat:"Compares capacitors",toner:"Cleanup"})[id];return'<div class="rc-r"><span aria-hidden="true">'+av(id,56,{holds:HOLD[id]||"iron"})+'</span><b>'+E(NAME[id])+'</b><small>'+E(role)+'</small></div>'}).join("")+'</div></div>'
  +'<h3 class="sub">Not on the list?</h3><p>Tell us what you are recapping. Follow the museum and ask, or add your own capacitors on any machine page and keep the list on the bench.</p><p><a class="btn" href="#/follow">Ask us to add one</a> <a class="btn" href="#/workbench">The Workbench</a> <a class="btn" href="#/backup">Back up my bench</a></p>'
  +discl()+'<p class="tn">Capacitor values are shown as published in the guides we link, and boards changed during production. Check the board in front of you. Work safely, and do not open anything with a tube or mains power supply.</p></section>';
 app.innerHTML=h;wireIndex()}
function wireIndex(){var q=$("#rc-q"),fc="",fs="",LIM=8,open={};
 var secs=$$(".rc-cat");
 function apply(){var t=q?q.value.toLowerCase().trim():"",n=0;
  secs.forEach(function(sec,si){var cards=$$(".rc-card",sec),catOk=!fc||sec.getAttribute("data-cat")===fc,match=0,shown=0;
   cards.forEach(function(a){var m=RECAP.filter(function(x){return"#/recap/"+x.id===a.getAttribute("href")})[0],txt=m?(m.n+" "+m.tl.join(" ")).toLowerCase():"",
    hit=catOk&&(!t||txt.indexOf(t)>=0)&&(!fs||(fs==="worth"?a.getAttribute("data-w")==="yes":fs==="list"?a.getAttribute("data-l")==="1":a.getAttribute("data-s")==="1")),vis=hit&&(!!t||!!open[si]||shown<LIM);
    if(hit)match++;if(vis){shown++;n++}a.hidden=!vis});
   sec.hidden=!match;var mb=$("[data-more]",sec);if(mb){var rest=match-shown;mb.parentNode.hidden=rest<=0;mb.textContent="Show "+rest+" more"}});
  $$(".rc-card").forEach(function(a){if(a.closest(".rc-cat"))return;var m=RECAP.filter(function(x){return"#/recap/"+x.id===a.getAttribute("href")})[0],txt=m?(m.n+" "+m.tl.join(" ")).toLowerCase():"";a.hidden=!((!t||txt.indexOf(t)>=0)&&(!fs||(fs==="worth"?a.getAttribute("data-w")==="yes":fs==="list"?a.getAttribute("data-l")==="1":true)))});
  var qn=$("#rc-qn");if(qn)qn.textContent=t?(n?n+" found":"Nothing found. Ask us to add it below."):(!n?"Nothing matches. Try another chip.":"")}
 if(q)q.oninput=apply;
 $$("[data-more]").forEach(function(b,i){b.onclick=function(){open[i]=true;apply()}});
 $$("[data-fc]").forEach(function(b){b.onclick=function(){fc=b.getAttribute("data-fc");$$("[data-fc]").forEach(function(x){x.className="rc-chip2"+(x===b?" on":"")});apply()}});
 $$("[data-fs]").forEach(function(b){b.onclick=function(){fs=b.getAttribute("data-fs");$$("[data-fs]").forEach(function(x){x.className="rc-chip2"+(x===b?" on":"")});apply()}});
 var sr=$("#rc-sur");if(sr)sr.onclick=function(){var cs=$$(".rc-card");if(!cs.length)return;var a=cs[Math.floor(Math.random()*cs.length)];location.hash=a.getAttribute("href")};
 $$("[data-itab]").forEach(function(b){b.onclick=function(){var id=b.getAttribute("data-itab");$$("[data-itab]").forEach(function(x){var on=x===b;x.className="rc-tab"+(on?" on":"");x.setAttribute("aria-selected",on?"true":"false");x.tabIndex=on?0:-1});$$("[data-ipanel]").forEach(function(pn){pn.className="rc-panel"+(pn.getAttribute("data-ipanel")===id?"":" rc-off")})}});
 apply();
 var go=function(){var o=verdict(+$("#ck-ou").value,+$("#ck-ov").value,+$("#ck-nu").value,+$("#ck-nv").value);var el=$("#ck-out");el.className="rc-ckr "+o[1];el.textContent=o[0]};
 ["ck-ou","ck-ov","ck-nu","ck-nv"].forEach(function(i){$("#"+i).oninput=go});go()}

function nextRow(rows,ms,skip){var todo=rows.filter(function(r){return!ms.d[r.id]});if(!todo.length)return null;var hot=todo.filter(function(r){return r.pr===1}),pool=hot.length?hot.concat(todo.filter(function(r){return r.pr!==1})):todo;return pool[(skip||0)%pool.length]}
var skips={};
function nextHtml(mach,b,rows,ms){var r=nextRow(rows,ms,skips[b.id]),ty,left=rows.filter(function(x){return!ms.d[x.id]}).length;
 if(!r)return'<div class="rc-next rc-nx-done" data-nb="'+E(b.id)+'" role="status"><span class="rc-nxav" aria-hidden="true">'+av("connie",44,{holds:"iron",mood:"love"})+'</span><p><b>Board finished.</b> Every capacitor here is replaced. Connie is doing a little dance.</p></div>';
 ty=effTy(r,ms);
 return'<div class="rc-next noprint" data-nb="'+E(b.id)+'" data-nr="'+E(r.id)+'"><span class="rc-nxav" aria-hidden="true">'+av("connie",44,{holds:"iron",mood:"wink"})+'</span><div class="rc-nxt"><small>Next up'+(r.pr===1?" · fails often":"")+' · '+left+' to go</small><b>'+E(r.ref||r.lab)+': '+fmt(r.uf)+' µF, '+fmt(r.v)+' V</b><small>'+E(ty?tyLab(ty):"check the board for the type")+'</small></div><div class="rc-nxb"><button class="btn pri" type="button" data-nd="'+E(r.id)+'">Replaced it</button> '+(left>1?'<button class="btn" type="button" data-ns="'+E(b.id)+'">Another one</button>':"")+'</div></div>'}
function boardHtml(mach,b,s,sel){var ms=s.ms,rows=s.rows.filter(function(r){return r.b===b.id}),d=rows.filter(function(r){return ms.d[r.id]}).length;
 var many=mach.boards.filter(function(x){return bvis(x,ms)}).length>1,rf=ms.rf&&/^(todo|all|done)$/.test(ms.rf)?ms.rf:(rows.length>12?"todo":"all");
 var left=rows.length-d,bv=ms.bv==="list"?"list":"map";
 return'<section class="rc-b" data-b="'+E(b.id)+'" data-rf="'+rf+'" data-bv="'+bv+'"'+(!bvis(b,ms)||many&&sel!==b.id?" hidden":"")+'><h3>'+E(b.n)+' <small>'+d+' of '+rows.length+'</small></h3>'+(b.tip?crew("connie",b.tip,"iron","rc-ctip"):"")
  +(rows.length?nextHtml(mach,b,rows,ms):"")
  +(rows.length?'<p class="noprint rc-bv" role="group" aria-label="View"><button type="button" class="rc-chip2'+(bv==="map"?" on":"")+'" data-bv="map">Board map</button><button type="button" class="rc-chip2'+(bv==="list"?" on":"")+'" data-bv="list">Checklist <small>'+left+' to do</small></button></p>':"")
  +'<div class="rc-bm">'+(window.CMBoard&&rows.length?CMBoard.html(b,rows,ms,{av:av}):"")+'</div><div class="rc-bl">'
  +'<p class="noprint rc-rf" role="group" aria-label="Show"><b>Checklist</b> <button type="button" class="rc-chip2'+(rf==="todo"?" on":"")+'" data-rf="todo">To do <small>'+left+'</small></button><button type="button" class="rc-chip2'+(rf==="all"?" on":"")+'" data-rf="all">All <small>'+rows.length+'</small></button><button type="button" class="rc-chip2'+(rf==="done"?" on":"")+'" data-rf="done">Done <small>'+d+'</small></button> <button class="btn" type="button" data-all="'+E(b.id)+'">Mark all done</button> <button class="btn lnk" type="button" data-none="'+E(b.id)+'">Clear this board</button></p>'
  +'<p class="tn rc-rfe" role="status"'+(rf==="todo"&&left===0||rf==="done"&&d===0?"":" hidden")+'>'+(rf==="todo"?"Nothing left to do on this board.":"Nothing ticked off yet.")+'</p>'
  +'<table class="rc-t"><thead><tr><th scope="col">Done</th><th scope="col">Part</th><th scope="col">Value</th><th scope="col">Volts</th><th scope="col">Type</th><th scope="col">Buy</th></tr></thead><tbody>'+rows.map(function(r){return rowHtml(mach,r,ms)}).join("")+'</tbody></table></div></section>'}
function bgrp(b){var n=b.n;return/\bPSU\b|power supply|power brick|AC adapter/i.test(n)?"Power supplies":/CD board|optical|laser|drive|disc|CD-ROM|\bCD\b|pickup|servo/i.test(n)?"Drives and discs":"Main boards"}
function bpickHtml(mach,s,sel){var vis=mach.boards.filter(function(x){return bvis(x,s.ms)});if(vis.length<2)return"";
 function cnt(b){var rr=s.rows.filter(function(r){return r.b===b.id}),d=rr.filter(function(r){return s.ms.d[r.id]}).length;return[d,rr.length]}
 if(vis.length<=6)return'<div class="rc-bp noprint"><p class="tn"><b>'+vis.length+' boards.</b> Pick yours. One shows at a time.</p><div class="rc-bpg" role="group" aria-label="Boards">'+vis.map(function(b){var c=cnt(b),pct=c[1]?Math.round(c[0]/c[1]*100):0;
  return'<button type="button" class="rc-bpb'+(b.id===sel?" on":"")+'" data-bp="'+E(b.id)+'" aria-pressed="'+(b.id===sel)+'"><b>'+E(b.n)+'</b><small>'+c[0]+' of '+c[1]+(pct===100?" · done":"")+'</small><i style="width:'+pct+'%"></i></button>'}).join("")+'</div></div>';
 var gs=[],gm={};vis.forEach(function(b){var g=bgrp(b);if(!gm[g]){gm[g]=[];gs.push(g)}gm[g].push(b)});
 var cur=vis.filter(function(b){return b.id===sel})[0]||vis[0],cg=bgrp(cur),list=gm[cg],ix=list.indexOf(cur),c=cnt(cur),pct=c[1]?Math.round(c[0]/c[1]*100):0;
 return'<div class="rc-bp noprint"><p class="tn"><b>'+vis.length+' boards.</b> Pick the kind, then your board. One shows at a time.</p>'
  +(gs.length>1?'<p class="rc-chips" role="group" aria-label="Kind of board">'+gs.map(function(g){var dn=gm[g].reduce(function(a,b){return a+cnt(b)[0]},0);return'<button type="button" class="rc-chip2'+(g===cg?" on":"")+'" data-bg="'+E(g)+'">'+E(g)+' <small>'+gm[g].length+'</small></button>'}).join("")+'</p>':"")
  +'<div class="rc-bsel"><button type="button" class="btn" data-bn="-1" aria-label="Previous board"'+(ix<1?" disabled":"")+'>←</button><label class="sr" for="rc-bsel">Board</label><select id="rc-bsel">'+list.map(function(b){var q=cnt(b);return'<option value="'+E(b.id)+'"'+(b.id===cur.id?" selected":"")+'>'+E(b.n)+' ('+q[0]+' of '+q[1]+')</option>'}).join("")+'</select><button type="button" class="btn" data-bn="1" aria-label="Next board"'+(ix>=list.length-1?" disabled":"")+'>→</button></div><div class="rc-bar"><i style="width:'+pct+'%"></i></div></div>'}
function rowHtml(mach,r,ms){var ty=effTy(r,ms),on=!!ms.d[r.id],lab=(r.ref||r.lab);
 return'<tr class="'+(on?"done":"")+'" data-row="'+E(r.id)+'"><td data-l="Done"><input type="checkbox" id="rc-'+E(r.id)+'" data-r="'+E(r.id)+'"'+(on?" checked":"")+' aria-label="Replaced '+E(lab)+'"></td><th scope="row" data-l="Part"><label for="rc-'+E(r.id)+'">'+E(lab)+'</label>'+(r.pr===1?' <span class="rc-hot">Fails often</span>':"")+(r.note?'<small class="rc-n">'+E(r.note)+'</small>':"")+'</th><td data-l="Value">'+fmt(r.uf)+' µF</td><td data-l="Volts">'+fmt(r.v)+' V</td><td data-l="Type">'+E(ty?tyLab(ty):"check board")+'</td><td data-l="Buy" class="noprint">'+stores(partQ(r.uf,r.v,ty),"Amazon")+(r.custom?' <button class="btn lnk" type="button" data-rm="'+E(r.cid)+'">Remove</button>':"")+'</td></tr>'}
function toolsHtml(mach,ms){var gs=[],map={};RECAP_GENERIC.tools.forEach(function(t){if(!map[t.g]){map[t.g]=[];gs.push(t.g)}map[t.g].push(t)});
 return gs.map(function(g){var c=GROUP_CREW[g];return'<div class="rc-tg"><h4>'+E(g)+'</h4>'+(c?crew(c[0],c[1]):"")+'<ul class="rc-tl">'+map[g].map(function(t){var have=!!ms.t[t.id];
  return'<li class="'+(have?"done":"")+'"><label><input type="checkbox" data-tool="'+E(t.id)+'"'+(have?" checked":"")+'> <b>'+E(t.n)+'</b></label><small>'+E(t.why)+'</small>'+(aff()?'<span class="rc-tiers noprint">'+t.t.map(function(x){var u=affUrl("amazon",x[2])||affUrl("ebay",x[2]);return u?'<a class="rc-buy" href="'+E(u)+'" target="_blank" rel="sponsored noopener noreferrer">'+E((x[0]?x[0]+": ":"")+x[1])+'</a>':""}).join("")+'</span>':"")+'</li>'}).join("")+'</ul></div>'}).join("")}
function shopHtml(mach,ms,rows){var items=shopList(mach,ms,rows),tot=items.reduce(function(a,p){return a+p.buy},0);
 var h='<section class="rc-shop" id="rc-shop" aria-labelledby="rc-sh">'+'<h3 class="sub" id="rc-sh">Shopping list</h3>'+crew("winnie","I have room to spare, but buy a few extras. You will drop one under the couch.","")
  +'<div class="rc-ctl noprint"><label>My board uses <select id="rc-ty"><option value="">Not sure</option><option value="smd"'+(ms.ty==="smd"?" selected":"")+'>Surface mount (SMD)</option><option value="th"'+(ms.ty==="th"?" selected":"")+'>Through-hole</option></select></label> <label>Spares <select id="rc-sp"><option value="0"'+(ms.sp==="0"?" selected":"")+'>None</option><option value="1"'+(ms.sp==="1"?" selected":"")+'>1 extra of each</option><option value="25"'+(ms.sp==="25"?" selected":"")+'>25% extra</option><option value="50"'+(ms.sp==="50"?" selected":"")+'>50% extra</option></select></label> <label>Brand <select id="rc-br"><option value="pan"'+(st.g.br==="pan"?" selected":"")+'>Panasonic</option><option value="nic"'+(st.g.br==="nic"?" selected":"")+'>Nichicon</option><option value="any"'+(st.g.br==="any"?" selected":"")+'>Any</option></select></label> <label><input type="checkbox" id="rc-need"'+(ms.need?" checked":"")+'> Only what I still need</label></div>';
 if(!items.length)h+='<p class="empty">'+(rows.length?"Nothing left to buy. Every capacitor on this list is checked off.":"Add capacitors below and the shopping list builds itself.")+'</p>';
 else h+='<table class="rc-t rc-st"><thead><tr><th scope="col">Buy</th><th scope="col">Capacitor</th><th scope="col">Type</th><th scope="col" class="noprint">Where</th></tr></thead><tbody>'+items.map(function(p){return'<tr><td data-l="Buy"><b>'+p.buy+'</b>'+(p.x?'<small class="rc-n"> includes '+p.x+' spare</small>':"")+'</td><th scope="row" data-l="Capacitor">'+fmt(p.uf)+' µF, '+fmt(p.v)+' V'+(p.pr===1?' <span class="rc-hot">Buy first</span>':"")+'</th><td data-l="Type">'+E(tyLab(p.ty))+'</td><td data-l="Where" class="noprint">'+stores(p.q,"Amazon")+(p.buy>=4?stores(p.q+" 10 pcs","Pack of 10"):"")+'</td></tr>'}).join("")+'</tbody></table><p class="tn">'+tot+' capacitor'+(tot===1?"":"s")+' in all.</p>'
  +'<p class="noprint"><button class="btn pri" type="button" id="rc-copy">Copy the list</button> <button class="btn" type="button" id="rc-csv">Download as CSV</button> <button class="btn" type="button" id="rc-print">Print the checklist</button> <span id="rc-cm" class="tn" role="status"></span></p>'+crew("dot","I print everything. Loudly. In triplicate.","clipboard","noprint");
 var hot=items.filter(function(p){return p.pr===1});
 if(hot.length)h=h.replace('<div class="rc-ctl noprint">','<div class="rc-hotbox"><b>Start here.</b> Most reports say these fail first: '+hot.map(function(p){return fmt(p.uf)+" \u00b5F "+fmt(p.v)+" V"}).join(", ")+'. Buy and change these first, test, and you may be done.'+(mach.prsrc?' <small>'+E(mach.prsrc)+'</small>':"")+'</div><div class="rc-ctl noprint">');
 h+=(aff()?'<div class="rc-kits noprint"><h4>Faster for lots of values</h4><p>One search, many values: '+stores(assortQ(ms),"Assortment kit")+' '+stores(mach.kit,"Search for a kit")+' '+stores(mach.n+" recapped","Buy it already recapped")+'</p><p class="tn">Assortments rarely have every value or voltage, so check yours against the list above. Download the list as a CSV to paste into any distributor\u2019s order form, or copy it as text.</p><p class="tn">Kits are made for a specific board number. Check that the listing matches yours. A kit saves a lot of searching, and you still do the soldering.</p></div>':"")+discl()+'</section>';return h}
function stepsHtml(mach,ms){return'<ol class="rc-steps">'+RECAP_GENERIC.steps.map(function(s,i){var c=STEP_CREW[s.id],on=!!ms.s[s.id];
 return'<li class="'+(on?"done":"")+'"><label><input type="checkbox" data-step="'+E(s.id)+'"'+(on?" checked":"")+'> <b>'+E(s.t)+'</b></label><p class="rc-tip">'+E(s.tip)+'</p>'+(c?crew(c[0],c[1],"","rc-sc"):"")+'</li>'}).join("")+'</ol>'}
function safetyHtml(ms){return'<ul class="rc-tl rc-sf">'+RECAP_GENERIC.safety.map(function(s){var on=!!ms.sf[s.id];return'<li class="'+(on?"done":"")+'"><label><input type="checkbox" data-safe="'+E(s.id)+'"'+(on?" checked":"")+'> '+E(s.t)+'</label></li>'}).join("")+'</ul>'}
function guidesHtml(mach){return'<ul class="rc-guides">'+mach.guides.map(function(g){return'<li><a href="'+E(g.u)+'" target="_blank" rel="noopener noreferrer"><b>'+E(g.t)+'</b></a> <span class="rc-k">'+E(g.kind)+'</span><small>by '+E(g.by)+(g.lic?" ("+E(g.lic)+")":"")+'. '+E(g.note||"")+'</small></li>'}).join("")+'</ul>'+mach.guides.filter(function(g){return g.credit}).map(function(g){return'<p class="tn rc-cr">'+E(g.credit)+'</p>'}).join("")}
function extrasHtml(mach){if(!aff())return"";return'<section class="rc-ex noprint" aria-labelledby="rc-exh"><h3 class="sub" id="rc-exh">While you are in there</h3><ul class="rc-exl">'+mach.extras.map(function(x){return'<li><b>'+E(x[2])+'</b> '+stores(x[1],"Amazon")+'</li>'}).join("")+'</ul></section>'}
function booksHtml(){if(!aff())return"";return'<section class="rc-bk noprint" aria-labelledby="rc-bkh"><h3 class="sub" id="rc-bkh">Books for the bench</h3><ul class="rc-exl">'+RECAP_GENERIC.books.map(function(b){var u=affUrl("amazon",BOOKS+b.q),e=affUrl("ebay",BOOKS+b.q),rel=' target="_blank" rel="sponsored noopener noreferrer"';return'<li><b>'+E(b.t)+'</b> <small>'+E(b.why)+'</small> '+(u?'<a class="rc-buy" href="'+E(u)+'"'+rel+'>Amazon</a>':"")+(e?'<a class="rc-buy rc-e" href="'+E(e)+'"'+rel+'>eBay</a>':"")+'</li>'}).join("")+'</ul></section>'}

function addHtml(mach,ms){return'<section class="rc-add noprint" aria-labelledby="rc-ah"><h3 class="sub" id="rc-ah">Add a capacitor, or paste a list</h3>'+crew("hiram","Found one the list missed? Put it in the loft, I mean here.","")
 +'<form id="rc-form" class="rc-ctl"><label>Label (optional) <input id="ax-r" maxlength="12" placeholder="C14" autocomplete="off"></label> <label>µF <input id="ax-u" type="number" min="0.001" max="100000" step="any" required inputmode="decimal"></label> <label>Volts <input id="ax-v" type="number" min="1" max="1000" step="any" required inputmode="decimal"></label> <label>How many <input id="ax-n" type="number" min="1" max="60" value="1" inputmode="numeric"></label> <label>Type <select id="ax-t"><option value="">Not sure</option><option value="smd">Surface mount</option><option value="th">Through-hole</option><option value="ax">Axial</option></select></label> <button class="btn pri" type="submit">Add it</button></form>'
 +crew("zack","Paste a list and I will unzip it. One capacitor per line, like C12 100uF 16V, or 4x 47uF 16V.","")
 +'<p><label for="rc-paste">Paste a list</label><br><textarea id="rc-paste" rows="4" maxlength="4000" placeholder="C12 100uF 16V&#10;4x 47uF 16V SMD"></textarea></p><p><button class="btn" type="button" id="rc-padd">Add these</button> <span id="rc-pm" class="tn" role="status"></span></p></section>'}
function notesHtml(ms){return'<section class="rc-nt" aria-labelledby="rc-nth"><h3 class="sub" id="rc-nth">Bench notes</h3>'+crew("tess","I live in the hallway and remember everything. Write it down.","")+'<p><label for="rc-notes" class="sr">Bench notes</label><textarea id="rc-notes" rows="4" maxlength="4000" placeholder="Board number, what you ordered, what went wrong, what to do next time.">'+E(ms.n)+'</textarea></p>'+(saved?"":'<p class="msg err">This browser would not save. Your progress will be lost when you close the page. Check that cookies and site data are allowed.</p>')+'</section>'}

function head(mach,s){var ms=s.ms,done=s.done===s.total&&s.total>0;
 return'<div class="rc-top"><div class="rc-ci" id="rc-ci">'+av("connie",96,{holds:"iron",mood:done?"love":"wink"})+'</div><div class="rc-prog"><h3 class="rc-pn">'+E(mach.n)+' <small>'+(mach.yr||"")+'</small></h3><div id="rc-bar">'+bar(s.pct,"Capacitors replaced")+'</div><p id="rc-count" class="rc-ct"><b>'+s.done+'</b> of '+s.total+' replaced ('+s.pct+'%)</p><p id="rc-say" class="rc-say" role="status"><b>Connie:</b> '+E(cheer(s.pct,s.done))+'</p></div></div><div id="rc-crew">'+crewStrip(s.pct)+'</div>'}
var TABS=[["caps","Capacitors"],["shop","Shopping list"],["know","Know first"],["do","Do it"],["docs","Docs"],["notes","Notes and checks"]];
var DKIND={s:"Service manual",d:"Schematic",g:"Guide",o:"Operating guide",c:"Datasheet"},DORD="sdgoc";
function manualsHtml(mach){if(typeof LIB==="undefined")return"";
 var ds=LIB.d.filter(function(r){return r[5]&&r[5].split(",").indexOf(mach.id)>=0}).sort(function(a,b){return DORD.indexOf(a[1])-DORD.indexOf(b[1])||(a[0].toLowerCase()<b[0].toLowerCase()?-1:1)});
 if(!ds.length)return'<h3 class="sub" id="rc-man">Manuals and datasheets</h3><p class="tn">We have not matched any service manuals to this machine yet. <a href="#/library">Browse the whole library</a> for chip datasheets and other machines.</p>';
 function li(r){return'<li><a href="'+E("https://drive.google.com/file/d/"+r[3]+"/view")+'" target="_blank" rel="noopener noreferrer" data-lu="'+E(r[3])+'"><b>'+E(r[0])+'</b></a> <span class="rc-k">'+DKIND[r[1]]+'</span><small>'+(r[2]>=1024?(r[2]/1024).toFixed(1)+" MB":r[2]+" KB")+'</small></li>'}
 var top=ds.slice(0,6),rest=ds.slice(6);
 return'<h3 class="sub" id="rc-man">Manuals and datasheets <small>'+ds.length+'</small></h3>'+crew("ram","Page one of the service manual tells you how it comes apart. Read it before you pick up a screwdriver.","book")
  +'<p class="tn">These are the original service documents, shared from our own Google Drive folder. Check your own board against them.</p><ul class="rc-guides">'+top.map(li).join("")+'</ul>'
  +(rest.length?'<details class="rc-more"><summary>Show '+rest.length+' more</summary><ul class="rc-guides">'+rest.map(li).join("")+'</ul></details>':"")
  +'<p class="noprint"><a class="btn" href="#/library/'+E(mach.id)+'">Open these in the library</a></p>'}
function setTab(ms,id,focus){if(!/^(caps|shop|know|do|docs|notes)$/.test(id))return;ms.tab=id;write();
 $$(".rc-tab").forEach(function(b){var on=b.getAttribute("data-tab")===id;b.className="rc-tab"+(on?" on":"");b.setAttribute("aria-selected",on?"true":"false");b.tabIndex=on?0:-1;if(on&&focus)b.focus()});
 $$(".rc-panel").forEach(function(q){q.className="rc-panel"+(q.getAttribute("data-panel")===id?"":" rc-off")})}
function machine(mach){var s=stats(mach),ms=s.ms,rows=s.rows,tl=mach.tl.filter(function(n){return TL.some(function(r){return r[2]===n})});
 var h='<section class="rc"><p class="noprint"><a href="#/recap">← All machines</a></p><h2>Recap: '+E(mach.n)+'</h2><p class="sp-lead">'+E(mach.blurb)+'</p><p class="tn">'+(mach.worth&&WORTH[mach.worth]?'<b>Our take: '+E(WORTH[mach.worth][0])+'.</b> '+E(WORTH[mach.worth][1]):'Difficulty: '+E(mach.lvl))+(tl.length?" · On the timeline: "+tl.map(function(n){var r=TL.filter(function(x){return x[2]===n})[0];return'<a href="#/timeline/'+String(r[0]).slice(0,4)+'/'+encodeURIComponent(n)+'">'+E(n)+'</a>'}).join(", "):"")+'</p>';
 h+=getItHtml(mach);
 if(typeof CMCast!=="undefined"&&CMCast.cameoHtml&&mach.cam)h+=CMCast.cameoHtml([mach.cam[0],mach.cam[1],mach.cam[2],mach.cam[3]],mach.cam[2],function(id,o,sz,cls){return'<div class="'+cls+'">'+(id==="connie"?av("connie",sz,{holds:o.holds,mood:o.mood||"wink"}):CMCast.svg(id,sz,o))+'</div>'});
 h+='<div class="rc-warn" role="note"><b>Before you start</b><ul>'+mach.warn.map(function(w){return'<li>'+E(w)+'</li>'}).join("")+'</ul></div>';
 h+='<div class="rc-head" id="rc-head">'+head(mach,s)+'</div><div id="rc-done"></div>';
 var TAB=ms.tab||((mach.boards.length||ms.c.length)?"caps":"docs");
 function pn(id,inner){return'<div class="rc-panel'+(TAB===id?"":" rc-off")+'" id="rc-p-'+id+'" data-panel="'+id+'" role="tabpanel" aria-labelledby="rc-t-'+id+'">'+inner+'</div>'}
 h+='<div class="rc-tabs noprint" role="tablist" aria-label="Sections of this page">'+TABS.map(function(t){var on=t[0]===TAB;return'<button type="button" class="rc-tab'+(on?" on":"")+'" role="tab" id="rc-t-'+t[0]+'" data-tab="'+t[0]+'" aria-selected="'+on+'" aria-controls="rc-p-'+t[0]+'" tabindex="'+(on?0:-1)+'">'+t[1]+'</button>'}).join("")+'</div>';
 var cp=revsHtml(mach,ms)+'<h3 class="sub" id="rc-caps">Your capacitors</h3>';
 if(mach.boards.length){var vb=mach.boards.filter(function(b){return bvis(b,ms)}),sel=vb.some(function(b){return b.id===ms.bsel})?ms.bsel:(vb[0]&&vb[0].id);cp+=bpickHtml(mach,s,sel)+mach.boards.map(function(b){return boardHtml(mach,b,s,sel)}).join("")}
 else cp+='<p class="rc-nolist">We have not checked a capacitor list for this machine yet, so none is shown. Follow the guide in the Docs tab for your board, then add the capacitors below. They will go on your checklist and shopping list.</p>';
 var mine=rows.filter(function(r){return r.b==="x"||r.custom&&!mach.boards.some(function(b){return b.id===r.b})});
 if(mine.length)cp+='<section class="rc-b" data-b="x"><h3>My additions <small>'+mine.filter(function(r){return ms.d[r.id]}).length+' of '+mine.length+'</small></h3><table class="rc-t"><thead><tr><th scope="col">Done</th><th scope="col">Part</th><th scope="col">Value</th><th scope="col">Volts</th><th scope="col">Type</th><th scope="col">Buy</th></tr></thead><tbody>'+mine.map(function(r){return rowHtml(mach,r,ms)}).join("")+'</tbody></table></section>';
 cp+=addHtml(mach,ms);
 h+=pn("caps",cp);
 h+=pn("shop",'<div id="rc-shopw">'+shopHtml(mach,ms,rows)+'</div>'+kitsHtml(mach)+extrasHtml(mach)+booksHtml());
 h+=pn("know",hintsHtml(mach)+tipsHtml(mach));
 h+=pn("do",'<details class="rc-sec" open><summary><h3 class="sub" id="rc-safe">Safety</h3></summary>'+crew("rhoda","These rules are read-only. Check every one before the iron goes on.","clipboard")+safetyHtml(ms)+'</details>'
  +'<details class="rc-sec" open><summary><h3 class="sub" id="rc-steps">Step by step</h3></summary>'+crew("augusta","Everything on the list, in order, and no questions until you are done.","clipboard")+stepsHtml(mach,ms)+'</details>'
  +'<details class="rc-sec"><summary><h3 class="sub" id="rc-tools">Your tools</h3></summary><p class="tn">Tick what you already have. For anything over about $100, the top, middle and budget picks are shown.</p>'+toolsHtml(mach,ms)+'</details>');
 h+=pn("docs",(mach.guides.length?'<h3 class="sub">Guides we used</h3><p class="tn">We built this bench from these guides. They have the photos and the full detail, so please read them and support their authors.</p>'+guidesHtml(mach):"")+manualsHtml(mach));
 h+=pn("notes",'<div class="rc-two">'+checkerHtml()+rewardsHtml()+'</div>'+notesHtml(ms));
 h+='<p class="tn">Values are shown as published in the guides in the Docs tab, and boards changed during production. Check the board in front of you and the guide for your board number. A recap involves hot tools and, on some machines, dangerous voltages. You do it at your own risk.</p>'+discl()
  +'<p class="noprint"><a class="btn" href="#/recap">All machines</a> <a class="btn" href="#/backup">Back up my bench</a> <a class="btn" href="/recap/'+E(mach.id)+'/">Web version for sharing</a></p></section>';
 app.innerHTML=h;wireMachine(mach);if(window.CMBoard)CMBoard.wire(app);refreshBoards(mach)}

/* ---------- live updates ---------- */
function say(t){var el=$("#rc-say");if(el)el.innerHTML='<b>Connie:</b> '+E(t)}
function refresh(mach,msg){var s=stats(mach),ms=s.ms;
 var hd=$("#rc-bar");if(hd)hd.innerHTML=bar(s.pct,"Capacitors replaced");
 var ct=$("#rc-count");if(ct)ct.innerHTML='<b>'+s.done+'</b> of '+s.total+' replaced ('+s.pct+'%)';
 say(msg||cheer(s.pct,s.done));
 var cw=$("#rc-crew");if(cw)cw.innerHTML=crewStrip(s.pct);
 $$(".rc-b").forEach(function(sec){var b=sec.getAttribute("data-b"),rr=s.rows.filter(function(r){return r.b===b||(b==="x"&&r.b==="x")}),n=rr.filter(function(r){return ms.d[r.id]}).length,sm=$("h3 small",sec);if(sm)sm.textContent=n+" of "+rr.length});
 $$("tr[data-row]").forEach(function(tr){tr.className=ms.d[tr.getAttribute("data-row")]?"done":""});
 if(window.CMBoard)CMBoard.sync(app,ms.d,motion());
 refreshBoards(mach);
 var sw=$("#rc-shopw");if(sw){sw.innerHTML=shopHtml(mach,ms,s.rows)}
 var rw=$$(".rc-rw");rw.forEach(function(el){var n=document.createElement("div");n.innerHTML=rewardsHtml();el.parentNode.replaceChild(n.firstChild,el)});
 var dn=$("#rc-done");if(dn){if(s.total>0&&s.done===s.total){if(!ms.t1){ms.t1=today();write()}dn.innerHTML='<section class="rc-win" aria-live="polite"><h3>Recap complete</h3><div class="rc-party">'+["connie"].concat(ARRIVE).map(function(id){return'<span>'+av(id,56,{holds:HOLD[id]||"iron",mood:"love"})+'</span>'}).join("")+'</div><p>'+E(mach.n)+' is recapped'+(ms.t1?" ("+E(ms.t1)+")":"")+'. Power it up, and have Hiram try the first game. Toner has already left a pawprint on the box.</p><p><a class="btn pri" href="#/closet">See what you unlocked</a> <a class="btn" href="#/recap">Another machine</a></p></section>';if(motion()&&typeof CMCast!=="undefined")$$(".rc-party svg",dn).forEach(function(sv,i){try{CMCast.play(sv,i%2?"cheer":"hop",2600)}catch(e){}})}else dn.innerHTML=""}
 var ci=$("#rc-ci");if(ci&&motion()&&typeof CMCast!=="undefined"){var sv=ci.querySelector("svg");if(sv)try{CMCast.play(sv,"solder",1400)}catch(e){}}
 wireShop(mach)}
function showBoard(mach,ms,id){ms.bsel=id;write();var t=document.createElement("div");t.innerHTML=bpickHtml(mach,stats(mach),id);var old=$(".rc-bp");if(old&&t.firstChild)old.parentNode.replaceChild(t.firstChild,old);
 $$(".rc-b[data-b]").forEach(function(sec){var bb=sec.getAttribute("data-b");if(bb==="x")return;var bo=mach.boards.filter(function(q){return q.id===bb})[0];if(bo&&bvis(bo,ms))sec.hidden=bb!==id})}
function refreshBoards(mach,pulse){var s=stats(mach),ms=s.ms;
 $$(".rc-b[data-b]").forEach(function(sec){var id=sec.getAttribute("data-b"),b=mach.boards.filter(function(x){return x.id===id})[0];if(!b)return;var rows=s.rows.filter(function(r){return r.b===id}),d=rows.filter(function(r){return ms.d[r.id]}).length,left=rows.length-d;
  var nx=$(".rc-next",sec);if(nx&&rows.length){var t=document.createElement("div");t.innerHTML=nextHtml(mach,b,rows,ms);var nn=t.firstChild;nx.parentNode.replaceChild(nn,nx);if(window.CMBoard&&CMBoard.hl)CMBoard.hl(sec,nn.getAttribute("data-nr")||"",!!nn.getAttribute("data-nr"))}
  var bl=$("[data-bv=list] small",sec);if(bl)bl.textContent=left+" to do";var cs=$$(".rc-rf .rc-chip2 small",sec);if(cs.length===3){cs[0].textContent=left;cs[1].textContent=rows.length;cs[2].textContent=d}
  var rf=sec.getAttribute("data-rf"),em=$(".rc-rfe",sec);if(em){em.hidden=!((rf==="todo"&&left===0)||(rf==="done"&&d===0));em.textContent=rf==="todo"?"Nothing left to do on this board.":"Nothing ticked off yet."}});
 var bpe=$(".rc-bp");if(bpe){var ts=document.createElement("div");ts.innerHTML=bpickHtml(mach,s,(mach.boards.filter(function(q){return bvis(q,ms)&&q.id===ms.bsel})[0]||mach.boards.filter(function(q){return bvis(q,ms)})[0]).id);if(ts.firstChild){var fo=document.activeElement&&document.activeElement.id==="rc-bsel";bpe.parentNode.replaceChild(ts.firstChild,bpe);if(fo){var s2=$("#rc-bsel");if(s2)s2.focus()}}}}
function wireShop(mach){var ms=mst(mach.id),rows=stats(mach).rows;
 var t=$("#rc-ty");if(t)t.onchange=function(){ms.ty=t.value;write();refresh(mach,"Noted. I changed the buying links to match.")};
 var sp=$("#rc-sp");if(sp)sp.onchange=function(){ms.sp=sp.value;write();refresh(mach,"Spares added to the list.")};
 var br=$("#rc-br");if(br)br.onchange=function(){st.g.br=br.value;write();refresh(mach,"New brand, new links.")};
 var nd=$("#rc-need");if(nd)nd.onchange=function(){ms.need=nd.checked?1:0;write();refresh(mach)};
 var cp=$("#rc-copy");if(cp)cp.onclick=function(){var txt=listText(mach,shopList(mach,ms,rows)),m=$("#rc-cm");
  function ok(){if(m)m.textContent="Copied."}function no(){if(m)m.textContent="Could not copy. Select the table and copy it by hand."}
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(ok,no);else no()};
 var cv=$("#rc-csv");if(cv)cv.onclick=function(){var m=$("#rc-cm");if(saveCsv(mach.id+"-capacitors.csv",csvText(mach,shopList(mach,ms,rows)))){if(m)m.textContent="Saved."}else if(m)m.textContent="Could not save the file."};
 var pr=$("#rc-print");if(pr)pr.onclick=function(){window.print()}}
function wireMachine(mach){var ms=mst(mach.id);unmount();
app.addEventListener("change",onChange);
 function onChange(e){var el=e.target;if(!el||!app.contains(el))return;
  if(el.id==="rc-bsel"){showBoard(mach,ms,el.value);var sl=$("#rc-bsel");if(sl)sl.focus();return}
  if(el.id==="rc-rv"){ms.rv=/^[\w.-]{1,24}$/.test(el.value)?el.value:"";write();var cr=(mach.revs||[]).filter(function(r){return r.id===ms.rv})[0],o=$("#rc-rvo");if(o)o.innerHTML=cr?revOne(cr):'<p class="tn">Pick yours above to see how to recognize it and what is known about its capacitors. Or read all of them:</p>';if(mach.boards.some(function(b){return b.revs}))machine(mach);return}
  if(el.hasAttribute("data-r")){var id=el.getAttribute("data-r");if(!ms.t0)ms.t0=today();if(el.checked)ms.d[id]=1;else delete ms.d[id];ms.t1=ms.t1&&stats(mach).done===stats(mach).total?ms.t1:"";persist();var s=stats(mach);refresh(mach,el.checked?(s.done+" of "+s.total+". Nice solder work."):"Unchecked. No problem."); return}
  if(el.hasAttribute("data-step")){var k=el.getAttribute("data-step");if(el.checked)ms.s[k]=1;else delete ms.s[k];write();el.closest("li").className=el.checked?"done":"";return}
  if(el.hasAttribute("data-tool")){var k2=el.getAttribute("data-tool");if(el.checked)ms.t[k2]=1;else delete ms.t[k2];write();el.closest("li").className=el.checked?"done":"";return}
  if(el.hasAttribute("data-safe")){var k3=el.getAttribute("data-safe");if(el.checked)ms.sf[k3]=1;else delete ms.sf[k3];write();el.closest("li").className=el.checked?"done":"";return}}
 app.addEventListener("click",onClick);
 function onClick(e){var tb=e.target.closest&&e.target.closest("button[data-tab]");if(tb){setTab(ms,tb.getAttribute("data-tab"));return}var bp=e.target.closest&&e.target.closest("button[data-bp]");if(bp){showBoard(mach,ms,bp.getAttribute("data-bp"));return}
 var bg=e.target.closest&&e.target.closest("button[data-bg]");if(bg){var gn=bg.getAttribute("data-bg"),fb=mach.boards.filter(function(q){return bvis(q,ms)&&bgrp(q)===gn})[0];if(fb)showBoard(mach,ms,fb.id);return}
 var bn=e.target.closest&&e.target.closest("button[data-bn]");if(bn){var vb2=mach.boards.filter(function(q){return bvis(q,ms)}),cur2=vb2.filter(function(q){return q.id===ms.bsel})[0]||vb2[0],gl=vb2.filter(function(q){return bgrp(q)===bgrp(cur2)}),nx2=gl[gl.indexOf(cur2)+(+bn.getAttribute("data-bn"))];if(nx2)showBoard(mach,ms,nx2.id);return}
 var bvb=e.target.closest&&e.target.closest("button[data-bv]");if(bvb){var vv=bvb.getAttribute("data-bv");ms.bv=vv;write();$$(".rc-b[data-b]").forEach(function(x){x.setAttribute("data-bv",vv)});$$("button[data-bv]").forEach(function(x){x.className="rc-chip2"+(x.getAttribute("data-bv")===vv?" on":"")});return}
 var rfb=e.target.closest&&e.target.closest("button[data-rf]");if(rfb){var rv=rfb.getAttribute("data-rf");ms.rf=rv;write();$$(".rc-b[data-b]").forEach(function(x){x.setAttribute("data-rf",rv)});$$("button[data-rf]").forEach(function(x){x.className="rc-chip2"+(x.getAttribute("data-rf")===rv?" on":"")});refreshBoards(mach,false);return}
 var ndb=e.target.closest&&e.target.closest("button[data-nd]");if(ndb){var cbx=document.getElementById("rc-"+ndb.getAttribute("data-nd"));if(cbx)cbx.click();return}
 var nsb=e.target.closest&&e.target.closest("button[data-ns]");if(nsb){var nb=nsb.getAttribute("data-ns");skips[nb]=(skips[nb]||0)+1;refreshBoards(mach,true);return}
var lu=e.target.closest&&e.target.closest("a[data-lu]");if(lu){try{var lo=JSON.parse(localStorage.getItem("cm-lib")||"null");if(!lo||typeof lo.s!=="object"||!lo.s)lo={s:{}};lo.s[lu.getAttribute("data-lu")]=1;localStorage.setItem("cm-lib",JSON.stringify(lo))}catch(x){}return}var tk=e.target.closest&&e.target.closest("button[data-tk]");if(tk){var kk=tk.getAttribute("data-tk");$$("[data-tk]").forEach(function(b){b.className="btn lnk"+(b===tk?" on":"")});$$(".rc-tl2 li").forEach(function(li){li.hidden=!!kk&&li.getAttribute("data-k")!==kk});return}var ja=e.target.closest&&e.target.closest("a[data-j]");if(ja){e.preventDefault();var tg=document.getElementById(ja.getAttribute("data-j"));if(tg){var pp=tg.closest(".rc-panel");if(pp)setTab(ms,pp.getAttribute("data-panel"));var dd=tg.closest("details");if(dd)dd.open=true;tg.scrollIntoView({behavior:motion()?"smooth":"auto",block:"start"});if(!tg.hasAttribute("tabindex"))tg.setAttribute("tabindex","-1");try{tg.focus({preventScroll:true})}catch(x){}}return}var el=e.target.closest&&e.target.closest("button");if(!el||!app.contains(el))return;
  if(el.hasAttribute("data-all")||el.hasAttribute("data-none")){var all=el.hasAttribute("data-all"),b=el.getAttribute("data-all")||el.getAttribute("data-none");stats(mach).rows.filter(function(r){return r.b===b}).forEach(function(r){if(all)ms.d[r.id]=1;else delete ms.d[r.id]});if(all&&!ms.t0)ms.t0=today();persist();$$("input[data-r]").forEach(function(i){i.checked=!!ms.d[i.getAttribute("data-r")]});refresh(mach);return}
  if(el.hasAttribute("data-rm")){var cid=el.getAttribute("data-rm");ms.c=ms.c.filter(function(c){return c.id!==cid});Object.keys(ms.d).forEach(function(k){if(k.indexOf("x:"+cid+":")===0)delete ms.d[k]});persist();machine(mach);return}
  if(el.id==="rc-padd"){var res=parseList($("#rc-paste").value),pm=$("#rc-pm");if(!res.ok.length){pm.textContent=res.bad.length?"I could not read: "+res.bad.slice(0,3).join("; ")+". Use a line like C12 100uF 16V.":"Nothing to add.";return}
   res.ok.forEach(function(o){if(ms.c.length<80)ms.c.push({id:uid(),r:o.r,u:o.u,v:o.v,t:o.t,n:o.n,b:"x"})});persist();machine(mach);var m2=$("#rc-pm");if(m2)m2.textContent="Added "+res.ok.length+(res.bad.length?"; skipped "+res.bad.length:"")+".";return}}
 var f=$("#rc-form");if(f)f.onsubmit=function(e){e.preventDefault();var u=+$("#ax-u").value,v=+$("#ax-v").value,n=Math.max(1,Math.min(60,Math.floor(+$("#ax-n").value)||1));
  if(!(u>0&&u<=100000&&v>0&&v<=1000)){return}if(ms.c.length>=80)return;
  ms.c.push({id:uid(),r:String($("#ax-r").value||"").replace(/[^\w.-]/g,"").slice(0,12),u:u,v:v,t:$("#ax-t").value,n:n,b:"x"});persist();machine(mach)};
 var nt=$("#rc-notes");if(nt)nt.oninput=function(){ms.n=nt.value.slice(0,4000);write()};
 var gi=function(){var o=verdict(+$("#ck-ou").value,+$("#ck-ov").value,+$("#ck-nu").value,+$("#ck-nv").value),el=$("#ck-out");if(el){el.className="rc-ckr "+o[1];el.textContent=o[0]}};
 ["ck-ou","ck-ov","ck-nu","ck-nv"].forEach(function(i){var x=$("#"+i);if(x)x.oninput=gi});gi();
 wireShop(mach);
 var s0=stats(mach);if(s0.total>0&&s0.done===s0.total){refresh(mach)}
 function onKey(e){var t=e.target;if(!t||!t.classList||!t.classList.contains("rc-tab"))return;var ids=TABS.map(function(x){return x[0]}),i=ids.indexOf(t.getAttribute("data-tab")),n=-1;
  if(e.key==="ArrowRight")n=(i+1)%ids.length;else if(e.key==="ArrowLeft")n=(i+ids.length-1)%ids.length;else if(e.key==="Home")n=0;else if(e.key==="End")n=ids.length-1;
  if(n>=0){e.preventDefault();setTab(ms,ids[n],true)}}
 /* a printed checklist should show everything, so open every fold while printing */
 function pOpen(){$$("details.rc-bdet,details.rc-sec,details.rc-more").forEach(function(x){x._wo=x.open;x.open=true})}
 function pBack(){$$("details.rc-bdet,details.rc-sec,details.rc-more").forEach(function(x){if(x._wo!==undefined){x.open=x._wo;x._wo=undefined}})}
 window.addEventListener("beforeprint",pOpen);window.addEventListener("afterprint",pBack);
 mount._h=[["change",onChange],["click",onClick],["keydown",onKey]];mount._w=[["beforeprint",pOpen],["afterprint",pBack]]}
function uid(){return Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-4)}

function unmount(){if(app&&mount._h){mount._h.forEach(function(x){app.removeEventListener(x[0],x[1])});mount._h=null}if(mount._w){mount._w.forEach(function(x){window.removeEventListener(x[0],x[1])});mount._w=null}}
function mount(el,args){unmount();app=el;st=load();args=args||[];var id=(args[0]||"").toLowerCase();
 if(id&&byId(id)){M=byId(id);machine(M);document.title="Recap: "+M.n+" | Conventional Memory"}
 else{M=null;index();document.title="The Recap Bench | Conventional Memory"}}
return{mount:mount,unmount:unmount,summary:summary,machines:RECAP,parseList:parseList,verdict:verdict}})();
