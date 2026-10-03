/* ipodbench.js: Tony's iPod Bench (#/ipods/bench and #/ipods/bench/<model>).
   For each iPod we sell mods for: an exploded drawing of what is inside (drawn by us, in code, in the iPod Works look),
   the parts in the order a repairer meets them where a published teardown gives that order, and plain facts on the battery,
   storage, flash upgrades, Rockbox, common faults and mods. Data and sources are in ipod-data.js. */
window.CMIpodBench=(function(){
"use strict";
var app=null;
function E(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function $$(q,r){return Array.prototype.slice.call((r||app).querySelectorAll(q))}
function model(id){for(var i=0;i<IPOD.m.length;i++)if(IPOD.m[i].id===id)return IPOD.m[i];return null}
function pear(w){var c=["#5ec04a","#f7d31e","#f5821f","#e03a3e","#963d97","#009ddc"],rows=[[7,2],[6,4],[5,6],[4,8],[3,10],[3,10],[4,8],[5,6],[6,4],[7,2],[8,1]],o="";
 rows.forEach(function(r,i){o+='<rect x="'+r[0]+'" y="'+(i+2)+'" width="'+r[1]+'" height="1" fill="'+c[Math.floor(i*6/rows.length)]+'"/>'});o+='<rect x="9" y="1" width="1" height="2" fill="#5a3a1e"/><rect x="10" y="1" width="2" height="1" fill="#5ec04a"/>';
 return'<svg class="ip-pear" viewBox="0 0 16 14" width="'+w+'" height="'+Math.round(w*14/16)+'" shape-rendering="crispEdges" aria-hidden="true">'+o+"</svg>"}
/* a small pixel iPod for the picker */
function pod(m,w){var nano=m.id==="n2",mini=m.id==="mn",early=m.id==="g1"||m.id==="g3",body=mini?"#c8c8d0":nano?"#c8c8d0":"#f2f2f0",bh=nano?24:26,bw=nano?12:14,o="";
 o+='<rect x="'+(8-bw/2)+'" y="0" width="'+bw+'" height="'+bh+'" fill="#9a9aa0"/><rect x="'+(8-bw/2+1)+'" y="1" width="'+(bw-2)+'" height="'+(bh-2)+'" fill="'+body+'"/><rect x="4" y="3" width="8" height="'+(nano?6:7)+'" fill="#222"/><rect x="5" y="4" width="6" height="'+(nano?4:5)+'" fill="'+(m.id==="g1"||m.id==="g3"||m.id==="g4"||m.id==="mn"?"#b8d8a8":"#8ec8f0")+'"/>';
 var cy=nano?16:17;if(early)o+='<rect x="4" y="'+(cy-4)+'" width="8" height="8" fill="#e4e4e8"/><rect x="6" y="'+(cy-2)+'" width="4" height="4" fill="'+body+'"/>';else o+='<rect x="5" y="'+(cy-4)+'" width="6" height="8" fill="#e4e4e8"/><rect x="4" y="'+(cy-3)+'" width="8" height="6" fill="#e4e4e8"/><rect x="6" y="'+(cy-1)+'" width="4" height="2" fill="'+body+'"/>';
 return'<svg class="ip-pod" viewBox="0 0 16 '+bh+'" width="'+w+'" height="'+Math.round(w*bh/16)+'" shape-rendering="crispEdges" aria-hidden="true">'+o+"</svg>"}

/* ---- the drawing. Each plate is drawn flat in a 76 x 100 box and then tipped over so the stack reads as exploded layers. ---- */
var PW=76,PH=100;
function rect(x,y,w,h,f,s){return'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+f+'"'+(s?' stroke="'+s+'" stroke-width="1"':"")+"/>"}
function plate(k){var o="";
 switch(k){
 case"back":case"shell":o=rect(0,0,PW,PH,"#c9c9d2","#222")+rect(3,3,PW-6,5,"#ffffff88")+rect(3,PH-8,PW-6,5,"#00000022")+(k==="shell"?rect(8,10,PW-16,PH-20,"#b4b4be"):'<circle cx="38" cy="50" r="9" fill="#b0b0ba" stroke="#8a8a94"/>');break;
 case"bezel":o=rect(0,0,PW,16,"#f4f4f2","#222")+rect(0,PH-16,PW,16,"#f4f4f2","#222")+rect(10,5,PW-20,3,"#00000018")+rect(10,PH-11,PW-20,3,"#00000018");break;
 case"bracket":o=rect(0,0,PW,PH,"none","#222")+rect(4,4,PW-8,PH-8,"none","#8a8a94")+rect(0,0,PW,6,"#b4b4be","#222")+rect(0,PH-6,PW,6,"#b4b4be","#222");break;
 case"drive":o=rect(0,0,PW,PH,"#3c3c46","#222")+rect(8,12,PW-16,52,"#9a9aa6","#222")+rect(14,20,PW-28,6,"#d8d8e0")+rect(14,30,PW-40,4,"#d8d8e0")+rect(10,PH-16,PW-20,10,"#d8b840","#222");break;
 case"mdrive":o=rect(14,10,48,56,"#3c3c46","#222")+rect(20,18,36,30,"#9a9aa6","#222")+rect(18,PH-24,40,8,"#d8b840","#222");break;
 case"batt":o=rect(6,8,PW-12,PH-24,"#5b6b8f","#222")+rect(12,14,PW-24,16,"#7d8db3")+rect(30,38,16,3,"#ffffffcc")+rect(37,31,2,17,"#ffffffcc").replace('x="37" y="31" width="2" height="17"','x="37" y="31" width="2" height="17"')+rect(10,PH-14,8,10,"#c04040","#222")+rect(PW-18,PH-14,8,10,"#222","#222");break;
 case"logic":o=rect(0,0,PW,PH,"#3e8e5a","#222")+rect(8,10,22,18,"#1b1b22","#000")+rect(38,12,28,24,"#1b1b22","#000")+rect(10,42,16,16,"#1b1b22","#000")+rect(34,50,12,28,"#1b1b22","#000")+rect(52,44,14,12,"#1b1b22","#000")+rect(8,PH-14,PW-16,8,"#d8b840","#222")+rect(8,36,3,3,"#f4f4f4")+rect(60,70,3,3,"#f4f4f4");break;
 case"lcd":o=rect(0,0,PW,PH,"#222","#000")+rect(8,10,PW-16,56,"#8ec8f0","#000")+rect(8,10,PW-16,5,"#ffffff88")+rect(10,PH-12,PW-20,6,"#d8b840");break;
 case"wheel":o=rect(0,0,PW,PH,"#ececf0","#222")+'<circle cx="38" cy="54" r="30" fill="#dcdce2" stroke="#222"/><circle cx="38" cy="54" r="10" fill="#f6f6f4" stroke="#222"/>'+rect(0,0,PW,10,"#f6f6f4");break;
 case"jack":o=rect(10,34,56,34,"#e8b050","#222")+'<circle cx="26" cy="51" r="9" fill="#222"/><circle cx="26" cy="51" r="4" fill="#9a9aa6"/>'+rect(42,46,18,8,"#f4f4f2","#222")+rect(44,48,6,4,"#222");break;
 case"frame":o=rect(0,0,PW,PH,"none","#222")+rect(5,5,PW-10,PH-10,"#9aa4b8","#222")+rect(14,14,PW-28,PH-28,"#dfe4ee","#222");break;
 default:o=rect(0,0,PW,PH,"#f4f4f2","#222")+rect(8,10,PW-16,38,"#222","#000")+rect(11,13,PW-22,32,"#8ec8f0")+'<circle cx="38" cy="74" r="16" fill="#e4e4e8" stroke="#222"/><circle cx="38" cy="74" r="5" fill="#f6f6f4" stroke="#222"/>'}
 return o}
function drawStack(m){var L=m.layers,n=L.length,step=54,ox=34,top=10,H=top+n*step+20,w=330,o="";
 o+='<svg class="ipb-svg" viewBox="0 0 '+w+" "+H+'" role="img" aria-label="Exploded drawing of the '+E(m.n)+": "+L.map(function(l){return E(l.t)}).join(", ")+'" shape-rendering="crispEdges">';
 /* ribbons first so plates sit on top; the orange ribbon runs from this plate's lower right edge up to the next one down */
 L.forEach(function(l,i){if(l.cable&&i<n-1){var x=ox+PW*1.15*.9+PH*.4,y=top+i*step+PH*.5*.9,y2=top+(i+1)*step+PH*.5*.15;o+='<path d="M'+x.toFixed(1)+" "+y.toFixed(1)+" C"+(x+14)+" "+(y+4)+" "+(x+14)+" "+(y2-4)+" "+(x+2)+" "+y2.toFixed(1)+'" fill="none" stroke="#f5821f" stroke-width="4"/><path d="M'+x.toFixed(1)+" "+y.toFixed(1)+" C"+(x+14)+" "+(y+4)+" "+(x+14)+" "+(y2-4)+" "+(x+2)+" "+y2.toFixed(1)+'" fill="none" stroke="#000" stroke-width="1" stroke-dasharray="1 5"/>'}});
 L.forEach(function(l,i){var y=top+i*step;
  o+='<g class="ipb-pl" data-i="'+i+'" tabindex="0"><g transform="translate('+ox+" "+y+') matrix(1.15 0 .4 .5 0 0)">'+rect(0,5,PW,PH,"#00000040")+plate(l.k)+"</g>"
   +(l.n>=1?'<circle cx="'+(ox-14)+'" cy="'+(y+20)+'" r="10" fill="#fff" stroke="#000" stroke-width="2"/><text x="'+(ox-14)+'" y="'+(y+25)+'" text-anchor="middle" font-size="13" font-weight="700" fill="#000" font-family="Chicago,Geneva,Verdana,sans-serif" shape-rendering="auto">'+l.n+"</text>":'<rect x="'+(ox-18)+'" y="'+(y+17)+'" width="8" height="8" fill="#fff" stroke="#000" stroke-width="2"/>')
   +'<line x1="'+(ox+PW*1.15+PH*.4+6)+'" y1="'+(y+18)+'" x2="'+(w-130)+'" y2="'+(y+18)+'" stroke="#000" stroke-width="1" stroke-dasharray="2 3"/>'
   +'<text x="'+(w-124)+'" y="'+(y+14)+'" font-size="11" font-weight="700" fill="#000" font-family="Geneva,Verdana,sans-serif" shape-rendering="auto">'+wrapT(l.t,19,1)+"</text>"+'<text x="'+(w-124)+'" y="'+(y+27)+'" font-size="11" fill="#000" font-family="Geneva,Verdana,sans-serif" shape-rendering="auto">'+wrapT(l.t,19,2)+"</text></g>"});
 o+="</svg>";return o}
function wrapT(t,w,line){var words=String(t).split(" "),a="",b="",over=false;words.forEach(function(x){if(!over&&(a+" "+x).trim().length<=w)a=(a+" "+x).trim();else{over=true;b=(b+" "+x).trim()}});return E(line===1?a:b)}

function stores(q){if(typeof affOn!=="function"||!affOn()||!q)return"";var a=affUrl("amazon",q),e=affUrl("ebay",q),rel=' target="_blank" rel="sponsored noopener noreferrer"';
 return(a?'<a href="'+E(a)+'"'+rel+">Amazon</a>":"")+(a&&e?" &middot; ":"")+(e?'<a href="'+E(e)+'"'+rel+">eBay</a>":"")}
function win(title,body,cls){return'<div class="ip-win ipb-win'+(cls?" "+cls:"")+'"><div class="ip-tb"><i class="ip-cb"></i><span>'+E(title)+'</span></div><div class="ip-bd">'+body+"</div></div>"}
function bub(id,line){return window.CMBub?CMBub.say(id,line,{sz:48,cls:"ipb-cb"}):""}
function list(a,cls){return'<ul class="'+(cls||"ipb-ul")+'">'+a.map(function(x){return"<li>"+E(x)+"</li>"}).join("")+"</ul>"}

function picker(cur){return'<nav class="ipb-pick" aria-label="Pick an iPod">'+IPOD.m.map(function(m){return'<a class="ipb-pk'+(m.id===cur?" on":"")+'" href="#/ipods/bench/'+m.id+'"'+(m.id===cur?' aria-current="page"':"")+'><span class="ipb-pi">'+pod(m,26)+"</span><b>"+E(m.n)+"</b><small>"+E(m.yrs)+"</small></a>"}).join("")+"</nav>"}
function head(){return'<div class="ip-desk ipb-desk"><div class="ip-menu" aria-hidden="true"><span class="ip-pe">'+pear(14)+'</span><b>File</b><b>Edit</b><b>View</b><b>Specials</b><span class="ip-mt">Tony’s iPod Bench</span></div><div class="ip-store">'
 +'<div class="ip-hero"><div class="ip-sign"><div class="ip-lg">'+pear(54)+'</div><div><h2>Tony’s iPod Bench</h2><p class="ip-sub">What is inside, what goes wrong, and what you can change.</p></div></div></div>'}
function foot(){return'<p class="ip-note ipb-note">These notes are for reading and planning. Opening an iPod can break it, and a lithium battery that is bent, punctured or shorted can burn. Wear eye protection, never pry at a battery, and stop if one is swollen. Facts come from the pages listed under each model, written in our own words. If we could not confirm something, the page says so instead of guessing, and boards and batteries vary, so check your own. Not affiliated with Apple.</p>'
 +'<p class="noprint ipb-nav"><a class="btn" href="#/ipods">Tony’s iPod Works (the store)</a> <a class="btn" href="#/repairs">Repair Bench</a> <a class="btn" href="#/shop">Back to the mall</a></p></div></div>'}

function index(){var h=head()+win("1. Pick your iPod",picker(""),"")
 +'<div class="ipb-cbw">'+bub("conrad","Pick one and I will show you what is inside. I drew every layer myself, and I will tell you when I am guessing.")+"</div>"
 +win("How to read the drawings","<p>Each drawing is an exploded stack. Where a published teardown gives the order the parts come out, the layers are <b>numbered</b> in that order. Where we have not confirmed the order, the layers carry a plain square instead of a number and should be read as a parts list, not a sequence. An orange ribbon between two layers means a ribbon cable joins them. Drawings are not to scale and what is inside each layer is stylised.</p>","")+foot();
 app.innerHTML='<section class="ip ipb">'+h+"</section>"}

function facts(m){return'<table class="ip-tab ipb-tab"><tbody>'+m.facts.map(function(f){return"<tr><th scope=\"row\">"+E(f[0])+"</th><td>"+E(f[1])+"</td></tr>"}).join("")+"</tbody></table>"}
function modsFor(m){var a=IPOD.mods.filter(function(x){return x.fits.indexOf(m.id)>=0});if(!a.length)return'<p class="ip-help">We found no documented mods for this one.</p>';
 return a.map(function(x){return'<div class="ipb-mod"><b>'+E(x.n)+"</b><p>"+E(x.d)+'</p><small>'+x.src.map(function(s){return'<a href="'+E(s[1])+'" target="_blank" rel="noopener noreferrer">'+E(s[0])+"</a>"}).join(" &middot; ")+"</small></div>"}).join("")+'<p class="noprint"><a class="btn" href="#/ipods">Have Tony do it: pick it in the iPod Works</a></p>'}
function detail(m){var h=head()+win("1. Pick your iPod",picker(m.id),"");
 h+='<div class="ipb-cbw">'+bub("conrad",m.blurb)+"</div>";
 if(m.layers.length){
  h+=win("2. Inside the "+m.n,'<div class="ipb-cols"><div class="ipb-fig">'+drawStack(m)+'</div><ol class="ipb-leg">'+m.layers.map(function(l,i){return'<li data-i="'+i+'" tabindex="0"><span class="ipb-no">'+(l.n>=1?l.n:"&#9632;")+"</span><div><b>"+E(l.t)+"</b>"+(l.d?"<small>"+E(l.d)+"</small>":"")+"</div></li>"}).join("")+'</ol></div><p class="ip-help">'+(m.layers.some(function(l){return l.n>=1})?"Numbers show the order a repairer meets the parts in the published teardown. A square means we have not confirmed where that part falls in the order.":"We have not confirmed an order for this model, so every layer has a square. Read it as a parts list.")+" Not to scale. The orange ribbons mark cables.</p>",""
  )}
 else h+=win("2. Inside the "+m.n,'<p class="ip-help">We could not find a teardown for this model that we trust, so we have not drawn it. Better a blank than a guess.</p>',"");
 h+=win("3. Quick facts",facts(m),"");
 if(m.open.length)h+=win("4. How it opens",'<ol class="ipb-ol">'+m.open.map(function(s){return"<li>"+E(s)+"</li>"}).join("")+"</ol>"+(m.tools?'<p class="ip-help"><b>Tools named in the guides:</b> '+E(m.tools)+"</p>":""),"");
 h+=win("5. Change the storage",list(m.flash,"ipb-ul"),"");
 h+=win("6. Rockbox",'<p><b>'+E(m.rbx[0])+".</b> "+E(m.rbx[1])+' <small>Status comes from a copy of the Rockbox wiki page, so check the live wiki before you start.</small></p>',"");
 h+=win("7. What goes wrong",'<table class="ip-tab ipb-tab"><thead><tr><th>You see</th><th>The usual fix</th></tr></thead><tbody>'+m.fail.map(function(f){return"<tr><td>"+E(f[0])+"</td><td>"+E(f[1])+"</td></tr>"}).join("")+"</tbody></table>","");
 h+=win("8. Mods that are documented for it",modsFor(m),"");
 var pt=m.parts.map(function(p){var s=stores(p);return"<li>"+E(p)+(s?' <span class="ipb-st noprint">'+s+"</span>":"")+"</li>"}).join("");
 h+=win("9. Parts to search for",'<p class="ip-help">These links only search by name. Match your exact model, size and part number before you buy.</p><ul class="ipb-ul">'+pt+"</ul>"+(typeof affOn==="function"&&affOn()&&typeof AFF_SHORT!=="undefined"?'<p class="tn">'+E(AFF_SHORT)+' <a href="#/disclosure">Disclosure</a></p>':""),"");
 h+=win("10. What we have not confirmed",list(m.gaps,"ipb-ul")+'<p class="ip-help">Spot something wrong? Tell us and we will fix it.</p>',"ipb-gap");
 h+=win("11. Where this came from",'<ul class="ipb-ul ipb-src">'+m.src.map(function(s){return'<li><a href="'+E(s[1])+'" target="_blank" rel="noopener noreferrer">'+E(s[0])+"</a></li>"}).join("")+"</ul>","");
 h+=foot();app.innerHTML='<section class="ip ipb">'+h+"</section>";
 /* hover or focus a legend row to lift its plate in the drawing, and the other way round */
 var svg=app.querySelector(".ipb-svg");if(svg){var on=function(i,v){$$('[data-i="'+i+'"]').forEach(function(e){e.classList.toggle("on",v)})};
  $$(".ipb-pl, .ipb-leg li").forEach(function(e){var i=e.getAttribute("data-i");e.addEventListener("mouseenter",function(){on(i,true)});e.addEventListener("mouseleave",function(){on(i,false)});e.addEventListener("focus",function(){on(i,true)});e.addEventListener("blur",function(){on(i,false)})})}}

function mount(el,args){app=el;var id=(args&&args[0]||"").toLowerCase(),m=id?model(id):null;if(m)detail(m);else index();document.title=(m?m.n+": inside, repairs and mods":"Tony’s iPod Bench")+" | Conventional Memory"}
return{mount:mount,unmount:function(){app=null},models:function(){return IPOD.m},draw:drawStack}})();
