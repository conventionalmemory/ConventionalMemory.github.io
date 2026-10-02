/* shop.js: the Conventional Memory Mall. A mock-up (under construction): nothing here can be bought yet.
   #/shop            the mall: a directory and six storefronts
   #/shop/<store>    connie, stickers, cards, pins, plush, ipods
   #/shop/cart       the cart and a mock order request (email, copy or print; no payment of any kind)
   #/ipods           shortcut to Tony's iPod Works
   Prices, stock and what fits what are all placeholders for Tony and Matt to replace. Connie is the anchor store and the star of every window.
   The cart lives in this browser only, under "cm-cart". */
window.CMShop=(function(){
 var app,EMAIL="ConventionalMemory@gmail.com";
 function E(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
 function $(q,r){return(r||app).querySelector(q)}function $$(q,r){return Array.prototype.slice.call((r||app).querySelectorAll(q))}
 function $m(c){return"$"+(c/100).toFixed(2)}
 function sp(id,w,o){return CMCast.svg(id,w,o||{})}

 /* ------------------------------------------------------------------ the cart */
 function ld(){var c={};try{c=JSON.parse(localStorage.getItem("cm-cart")||"{}")||{}}catch(e){}return{items:c.items||[],want:c.want||{}}}
 function sv(c){try{localStorage.setItem("cm-cart",JSON.stringify(c))}catch(e){}}
 function count(){return ld().items.reduce(function(n,i){return n+i.q},0)}
 function addItem(o){var c=ld(),m=c.items.filter(function(i){return i.id===o.id&&i.d===(o.d||"")})[0];if(m)m.q++;else c.items.push({id:o.id,n:o.n,u:o.u,q:1,d:o.d||""});sv(c)}

 /* ------------------------------------------------------------------ the stores */
 var STORES=[
  {k:"connie",no:1,n:"Connie’s Corner",sign:"CONNIE’S CORNER",tag:"The anchor store. Everything Connie.",col:"#38b24a",col2:"#ffd54a",win:["connie"],who:"connie",say:"This is my store. I am also the mannequin."},
  {k:"stickers",no:2,n:"Stick Around",sign:"STICK AROUND",tag:"Sticker sheets for laptops, lunch boxes and toolboxes.",col:"#18c3b5",col2:"#ff3d9a",win:["connie","emma","zack"],who:"zack",say:"Nobody invited me, but I am on the sheet."},
  {k:"cards",no:3,n:"Mint Condition",sign:"MINT CONDITION",tag:"Trading cards of the whole family. Connie is a holofoil.",col:"#1d3f9e",col2:"#ffd54a",win:["connie","ram","conrad"],who:"ram",say:"Sleeves are in aisle two. Read the label first."},
  {k:"pins",no:4,n:"Pin Cushion",sign:"PIN CUSHION",tag:"Enamel pins with gold contacts, naturally.",col:"#7a4fd0",col2:"#ff9ad0",win:["connie","viv","dot"],who:"viv",say:"Sixteen colors per pin, and one of them is glitter."},
  {k:"plush",no:5,n:"Stuff-A-Chip",sign:"STUFF-A-CHIP",tag:"Plush memory modules and pets. A very early idea.",col:"#ff6fa8",col2:"#fff6a0",win:["connie","nibble","toner"],who:"nibble",say:"(squeak)"},
  {k:"ipods",no:6,n:"Tony’s iPod Works",sign:"iPOD WORKS",tag:"Pick an iPod, pick your mods, and we build it.",col:"#9a9aa6",col2:"#e8e8f0",win:["connie","conrad","mat"],who:"conrad",say:"One more thing."}];
 function store(k){return STORES.filter(function(s){return s.k===k})[0]}
 var PA=["Attention, shoppers: the fountain is under construction. So is everything else.","Attention, shoppers: a small black puppy has been seen near the escalator. He has left pawprints on the directory.","Attention, shoppers: Disk 7 of 14 has been found at the information desk. Please collect it, Floyd.","Attention, shoppers: this mall is read-only until the grand opening. Please do not try to edit the floor plan.","Attention, shoppers: there is always room for one more, if you load it high.","Attention, shoppers: the food court will be serving free kilobytes. Seating is limited to 640K."];

 /* products: [id, name, description, price in cents, art kind, sprites, status] ; status: mock (can go in the cart), soon or maybe (can only be wished for) */
 var PROD={
  connie:[
   ["mug","“Load It High” mug","11 oz. Connie on one side, her motto on the other.",1400,"mug",["connie"],"mock"],
   ["tee","Connie Classic tee","Soft cotton, one big Connie, gold contacts on the shoes.",2200,"tee",["connie"],"mock"],
   ["pad","Mouse pad (Mat approved)","Connie on a mouse pad, with a spot at the edge for Mat to nap.",1200,"pad",["connie"],"mock"],
   ["book","CONFIG.SYS notebook","Lined pages. Every page starts with DEVICE=.",1000,"book",["connie"],"mock"],
   ["poster","Sunday Funnies poster","The family at the kitchen table, 18 x 24 in.",1800,"poster",["connie","emma","hiram"],"soon"],
   ["key","Gold-contact keychain","Connie in the corner, a ring through the bow.",800,"key",["connie"],"soon"]],
  stickers:[
   ["st-connie","Connie wardrobe sheet","12 looks on one 8.5 x 11 sheet.",600,"sticker",["connie"],"mock"],
   ["st-family","The Ventional family sheet","The whole family, one very full sheet.",600,"sticker",["emma","hiram","rhoda"],"mock"],
   ["st-jokes","Museum jokes (2 sheets)","Straight off the marquee: IRQ 5, Disk 7 of 14 and more.",800,"sticker",["connie","dot"],"mock"],
   ["st-guys","Conrad and Raymond outfits","Fifteen outfits each: biker, wizard, fishing vest and more.",600,"sticker",["conrad","ram"],"mock"],
   ["st-pets","Mat and Toner pet sheet","The two pets in every mood. Includes a pawprint.",500,"sticker",["mat","toner"],"mock"],
   ["st-big","Big Connie laptop pair","Two 3-inch Connies for a laptop lid.",500,"sticker",["connie"],"mock"],
   ["st-all","The mega pack","Every sheet we make. Connie is on most of them.",2400,"sticker",["connie","emma","conrad","mat"],"mock"]],
  cards:[
   ["tc-starter","Starter pack (5 cards)","Five cards from the family set. Connie is in every pack, because of course she is.",500,"card",["connie"],"mock"],
   ["tc-holo","Holofoil Connie (single)","The only holofoil in the set. Number one of eighteen.",400,"card",["connie"],"mock"],
   ["tc-set","The full family set (18)","Every Ventional, plus the two pets.",2400,"card",["connie","emma","ram"],"mock"],
   ["tc-pets","Pet pack: Mat and Toner","Two cards. One click, one pawprint.",500,"card",["mat","toner"],"mock"],
   ["tc-crew","Creators pack: Matt and Tony","The two museum guys, painted portraits, with stats.",500,"cardimg",["matt","tony"],"soon"],
   ["tc-binder","Nine-pocket binder","Holds the whole set, with room for one more.",1200,"book",["connie"],"soon"]],
  pins:[
   ["pn-connie","Connie classic pin","1.25 in enamel pin, gold plating, locking clasp.",900,"pin",["connie"],"soon"],
   ["pn-halo","Connie with halo","The Memory Manager perfect-run look.",900,"pin",["connie"],"soon"],
   ["pn-640","640K pin","Just the number. Everyone knows.",800,"pin",["connie"],"soon"],
   ["pn-conrad","Uncle Conrad (CONFIG.SYS) pin","Mug included.",900,"pin",["conrad"],"soon"],
   ["pn-pets","Mat and Toner pet pins (2)","Sold as a pair, like they go everywhere.",1200,"pin",["mat","toner"],"soon"],
   ["pn-five","Set of five","Connie, Emma, Himmy, Raymond and Rhoda.",3500,"pin",["connie","emma","hiram"],"soon"]],
  plush:[
   ["pl-connie","Connie plush (8 in)","Soft green board, bow, and gold fingers on the shoes.",2800,"plush",["connie"],"maybe"],
   ["pl-nibble","Nibble plush","Half a byte. Twice the fluff.",1800,"plush",["nibble"],"maybe"],
   ["pl-toner","Toner plush","Black, soft and (we promise) completely smudge-proof.",2000,"plush",["toner"],"maybe"],
   ["pl-mat","Mat the Mouse plush","A wired mouse with a very soft tail.",1800,"plush",["mat"],"maybe"],
   ["pl-tess","Tessie plush","A TSR gremlin. Stays resident on your bed.",2000,"plush",["tess"],"maybe"]]};
 var STATUS={mock:"Mock-up",soon:"Coming soon",maybe:"Maybe someday"};

 /* ------------------------------------------------------------------ art for a product */
 function pic(id,w,o){if(id==="matt"||id==="tony")return'<img src="portraits/'+id+'.png" alt="'+(id==="matt"?"Matt":"Tony")+'" width="'+w+'" height="'+Math.round(w*1.25)+'">';return sp(id,w,o||{tall:id==="connie"})}
 function art(p){var k=p[4],s=p[5],h="";
  if(k==="sticker"){h=s.map(function(x,i){return'<span class="sa-s s'+i+'">'+pic(x,s.length>3?44:s.length>1?64:96)+"</span>"}).join("")}
  else if(k==="pin"){h=s.map(function(x){return'<span class="sa-pi">'+pic(x,s.length>1?54:74,{tall:0})+"</span>"}).join("")}
  else if(k==="card"||k==="cardimg"){h=s.map(function(x,i){return'<span class="sa-c c'+i+'">'+pic(x,s.length>1?58:78)+"</span>"}).join("")}
  else if(k==="poster"){h='<span class="sa-po">'+s.map(function(x){return pic(x,44,{tall:0})}).join("")+"</span>"}
  else h='<span class="sa-in">'+pic(s[0],k==="tee"?84:76)+"</span>";
  return'<div class="sa sa-'+k+'" aria-hidden="true">'+h+"</div>"}

 /* ------------------------------------------------------------------ chrome shared by every shop page */
 function banner(){return'<div class="sh-uc" role="note"><b>UNDER CONSTRUCTION</b><span>This is a mock-up. Nothing here can be bought yet, nothing is charged, and the prices are placeholders. Fill a cart and send us the list: we will write you when the doors open.</span></div>'}
 function bar(cur){var n=count();return'<nav class="tbar sh-bar noprint" aria-label="Mall directory"><a href="#/shop"'+(cur===""?' aria-current="page"':"")+'>Mall directory</a>'+STORES.map(function(s){return'<a href="#/shop/'+s.k+'"'+(cur===s.k?' aria-current="page"':"")+"><i>"+s.no+"</i> "+E(s.n)+"</a>"}).join("")+'<a class="sh-cartl" href="#/shop/cart"'+(cur==="cart"?' aria-current="page"':"")+'>Cart <b id="shn">'+n+"</b></a></nav>"}
 function nextprev(k){var i=STORES.map(function(s){return s.k}).indexOf(k),a=STORES[(i+STORES.length-1)%STORES.length],b=STORES[(i+1)%STORES.length];return'<p class="sh-np noprint"><a class="btn" href="#/shop/'+a.k+'">◀ '+E(a.n)+'</a> <a class="btn" href="#/shop">Back to the mall directory</a> <a class="btn" href="#/shop/'+b.k+'">'+E(b.n)+" ▶</a></p>"}
 function bump(){var o=$("#shn");if(o)o.textContent=count()}

 /* ------------------------------------------------------------------ the mall */
 function mall(){var pa=PA[Math.floor(Math.random()*PA.length)];
  var h=bar("")+'<section class="ml">'+banner()
   +'<div class="ml-top"><div class="ml-hero">'+sp("connie",150,{tall:1,look:"explorer",mood:"happy"})+'</div><div class="ml-sign"><small>Grand opening: soon</small><h2>Conventional Memory Mall</h2><p class="ml-s2">Six stores. One anchor. Zero parking.</p><p class="ml-say"><b>Connie:</b> “Welcome! Every window in here has me in it, which is only fair. Pick a store from the directory, or just walk down the hall.”</p></div></div>'
   +'<div class="ml-dir"><h3>Mall directory</h3><p class="ml-here"><span>★ YOU ARE HERE</span> Main concourse, next to the fountain (closed).</p><ol>'+STORES.map(function(s){return'<li><a href="#/shop/'+s.k+'"><i>'+s.no+"</i><b>"+E(s.n)+"</b><span>"+E(s.tag)+"</span></a></li>"}).join("")+'</ol><p class="ml-cart"><a class="btn" href="#/shop/cart">Your cart ('+count()+")</a></p></div>"
   +'<h3 class="sub">The concourse</h3><div class="ml-floor">'+STORES.map(function(s){return'<a class="ml-st ml-'+s.k+'" href="#/shop/'+s.k+'" style="--c1:'+s.col+";--c2:"+s.col2+'" aria-label="'+E(s.n+": "+s.tag)+'"><i class="ml-awn" aria-hidden="true"></i><b class="ml-sg">'+E(s.sign)+'</b><span class="ml-win" aria-hidden="true">'+s.win.map(function(x){return sp(x,x==="connie"?58:46,x==="connie"?{tall:1,mood:"wink"}:{})}).join("")+'</span><small>'+E(s.tag)+"</small></a>"}).join("")
   +'<div class="ml-fc" aria-hidden="true"><b>FOOD COURT</b><span>Closed for construction. Free kilobytes will be served.</span></div></div>'
   +'<p class="ml-pa" role="status"><b>PA:</b> '+E(pa)+'</p><p class="cv-note">The mall is a pretend 1990s shopping center, and this whole wing is a mock-up while Matt and Tony work out the real thing. Names and prices are placeholders. Connie and her family are original characters.</p></section>';
  app.innerHTML=h}

 /* ------------------------------------------------------------------ a store with a shelf of products */
 function prodCard(p,st){var c=ld(),wanted=!!c.want[p[0]],mock=p[6]==="mock";
  return'<article class="sh-p" data-id="'+E(p[0])+'">'+art(p)+"<h4>"+E(p[1])+"</h4><p>"+E(p[2])+'</p><div class="sh-pr"><b>'+$m(p[3])+'</b><em class="sh-st st-'+p[6]+'">'+STATUS[p[6]]+"</em></div>"
   +(mock?'<button class="btn pri" type="button" data-add="'+E(p[0])+'">Add to cart</button>':'<button class="btn" type="button" data-want="'+E(p[0])+'" aria-pressed="'+wanted+'">'+(wanted?"✓ On my wish list":"I would buy this")+"</button>")+"</article>"}
 function shelf(k){var s=store(k),list=PROD[k]||[];
  var h=bar(k)+'<section class="sh sh-'+k+'" style="--c1:'+s.col+";--c2:"+s.col2+'">'+banner()
   +'<header class="sh-hd"><div class="sh-sg"><small>Store '+s.no+" of "+STORES.length+"</small><h2>"+E(s.n)+"</h2><p>"+E(s.tag)+'</p></div><div class="sh-keep">'+sp(s.who,84,{tall:1})+'<p class="sh-bub">'+E(s.say)+"</p></div></header>"
   +'<p class="sh-greet"><span>'+sp("connie",48,{tall:1,look:"explorer"})+"</span><b>Connie:</b> “"+(k==="connie"?"Welcome to my corner. Everything in here has my face on it.":"I am in the window of every store. I checked.")+"”</p>"
   +'<div class="sh-grid">'+list.map(function(p){return prodCard(p,s)}).join("")+"</div>"
   +'<p class="cv-note">Mock-up prices. Items marked <b>Mock-up</b> can go in the cart. The rest are ideas: tell us which you want and we will build those first.</p>'+nextprev(k)+"</section>";
  app.innerHTML=h;
  $$("[data-add]").forEach(function(b){b.onclick=function(){var p=list.filter(function(x){return x[0]===b.dataset.add})[0];addItem({id:p[0],n:p[1],u:p[3]});bump();b.textContent="Added ✓";setTimeout(function(){b.textContent="Add another"},900)}});
  $$("[data-want]").forEach(function(b){b.onclick=function(){var c=ld();if(c.want[b.dataset.want])delete c.want[b.dataset.want];else c.want[b.dataset.want]=1;sv(c);var on=!!c.want[b.dataset.want];b.setAttribute("aria-pressed",on);b.textContent=on?"✓ On my wish list":"I would buy this"}})}

 /* ------------------------------------------------------------------ Tony's iPod Works */
 var FAMS={early:"1st to 3rd generation",g4:"4th generation and photo",mini:"iPod mini",video:"5th and 5.5 generation (video)",classic:"6th and 7th generation (classic)",nano:"iPod nano (2nd generation)"};
 var MODELS=[
  {id:"g1",n:"iPod 1st generation, 5GB",fam:"early",yr:2001,base:11900,stock:1,fin:["White"],note:"The original scroll wheel. A collector’s piece."},
  {id:"g3",n:"iPod 3rd generation, 15GB",fam:"early",yr:2003,base:6900,stock:2,fin:["White"],note:"Touch buttons in a row, dock connector."},
  {id:"g4",n:"iPod 4th generation, 20GB",fam:"g4",yr:2004,base:4900,stock:3,fin:["White"],note:"The first click wheel."},
  {id:"ph",n:"iPod photo, 30GB",fam:"g4",yr:2004,base:5900,stock:2,fin:["White"],note:"Color screen, album art."},
  {id:"mn",n:"iPod mini, 4GB",fam:"mini",yr:2004,base:5500,stock:4,fin:["Silver","Blue","Pink","Green","Gold"],note:"Aluminum, small and loud-colored."},
  {id:"v5",n:"iPod video (5th gen), 30GB",fam:"video",yr:2005,base:6900,stock:5,fin:["White","Black"],note:"A tiny movie theater."},
  {id:"v55",n:"iPod video (5.5 gen), 80GB",fam:"video",yr:2006,base:8900,stock:3,fin:["White","Black"],note:"Brighter screen, a search function."},
  {id:"n2",n:"iPod nano (2nd gen), 4GB",fam:"nano",yr:2006,base:4500,stock:4,fin:["Silver","Blue","Pink","Green","Black"],note:"Aluminum and thin."},
  {id:"c6",n:"iPod classic (6th gen), 80GB",fam:"classic",yr:2007,base:11900,stock:3,fin:["Silver","Black"],note:"Metal, slim, cover flow."},
  {id:"c7",n:"iPod classic (7th gen), 160GB",fam:"classic",yr:2009,base:14900,stock:2,fin:["Silver","Black"],note:"The last of the click wheels."}];
 var ALL=["early","g4","mini","video","classic","nano"];
 var COL=[["Mirror steel",0],["Black",0],["Gold",500],["Blue",0],["Red",0],["Connie green",0],["Purple",0]];
 var MODS=[
  {id:"flash",g:"Storage",n:"Flash storage swap (SD card adapter)",d:"Out with the spinning disk, in with a memory card. Silent, cooler, faster to wake up, and holds a lot more.",p:3900,fits:["g4","mini","video","classic"],opts:[["128GB",0],["256GB",2000],["512GB",5000],["1TB",11000]]},
  {id:"batt",g:"Power",n:"New battery",d:"A fresh cell. Gets you back to a full day of music.",p:1800,fits:ALL},
  {id:"batx",g:"Power",n:"Extended battery and thick back",d:"A bigger cell in a slightly thicker case. Roughly double the listening.",p:3400,fits:["classic","video"]},
  {id:"usbc",g:"Power",n:"USB-C charging port",d:"A modern port, so the old cable can retire.",p:3500,fits:["classic","video","g4"]},
  {id:"bt",g:"Sound",n:"Bluetooth audio (internal board)",d:"Pair it to wireless headphones or a car, no cable.",p:4500,fits:["classic","video"]},
  {id:"amp",g:"Sound",n:"Audiophile op-amp and capacitor upgrade",d:"Better parts on the output stage. Cleaner highs, tighter low end.",p:5500,fits:["classic","video"]},
  {id:"jack",g:"Sound",n:"New headphone jack and hold switch",d:"Fixes crackling, a loose plug and a stuck hold slider.",p:1800,fits:["g4","mini","video","classic","nano"]},
  {id:"plate",g:"Looks",n:"Custom back plate",d:"Polished mirror steel or an anodized color, fitted over a fresh seal.",p:2500,fits:ALL,opts:COL},
  {id:"face",g:"Looks",n:"Colored faceplate and matching click wheel",d:"A color the factory never made, wheel to match.",p:3000,fits:["g4","video","classic"],opts:COL},
  {id:"eng",g:"Looks",n:"Laser engraving (two lines)",d:"On the back plate. Names, a date, a very small joke.",p:1500,fits:ALL,text:"Engraving text"},
  {id:"conart",g:"Looks",n:"Connie Edition back plate",d:"Connie on the back, gold contacts and all. Our favorite one.",p:2000,fits:ALL},
  {id:"lcd",g:"Looks",n:"New screen with bright LED backlight",d:"Replaces a dim or cracked display.",p:4500,fits:["g4","video","classic"]},
  {id:"rock",g:"Software",n:"Rockbox open-source firmware (dual boot)",d:"Plays FLAC, Opus and more, with themes and gapless playback. The original software stays one button away.",p:1500,fits:["early","g4","mini","video","classic","nano"]},
  {id:"theme",g:"Software",n:"Connie theme for Rockbox",d:"Her icons, a wallpaper and a boot screen that says “Loading high...”.",p:500,fits:["early","g4","mini","video","classic","nano"],needs:"rock"},
  {id:"clean",g:"Care",n:"Deep clean and polish",d:"Scratches buffed out, the wheel scrubbed, the screen cleared.",p:1200,fits:ALL},
  {id:"wheel",g:"Care",n:"Click wheel replacement",d:"For a wheel that skips, sticks or double-clicks.",p:1800,fits:["g4","mini","video","classic"]}];
 var MG=["Storage","Power","Sound","Looks","Software","Care"];
 var ST={m:null,fin:0,mods:{},eng:""};

 function pear(w){var c=["#5ec04a","#f7d31e","#f5821f","#e03a3e","#963d97","#009ddc"],rows=[[7,2],[6,4],[5,6],[4,8],[3,10],[3,10],[4,8],[5,6],[6,4],[7,2],[8,1]],o="",y=0;
  rows.forEach(function(r,i){o+='<rect x="'+r[0]+'" y="'+(i+2)+'" width="'+r[1]+'" height="1" fill="'+c[Math.floor(i*6/rows.length)]+'"/>';y++});o+='<rect x="9" y="1" width="1" height="2" fill="#5a3a1e"/><rect x="10" y="1" width="2" height="1" fill="#5ec04a"/>';
  return'<svg class="ip-pear" viewBox="0 0 16 14" width="'+w+'" height="'+Math.round(w*14/16)+'" shape-rendering="crispEdges" aria-hidden="true">'+o+"</svg>"}
 function podSvg(m,fin,w){var f=(fin||"White").toLowerCase(),body={white:"#f2f2f0",black:"#26262c",silver:"#c8c8d0",blue:"#6aa8e8",pink:"#f08aa8",green:"#7fc96a",gold:"#e0c070"}[f]||"#f2f2f0",edge=f==="black"?"#101014":"#9a9aa0",wheel=f==="black"?"#3a3a44":"#e4e4e8",mini=m.fam==="mini",nano=m.fam==="nano",early=m.fam==="early",o="";
  var bh=nano?24:26,bw=nano?12:14;
  o+='<rect x="'+(8-bw/2)+'" y="0" width="'+bw+'" height="'+bh+'" fill="'+edge+'"/><rect x="'+(8-bw/2+1)+'" y="1" width="'+(bw-2)+'" height="'+(bh-2)+'" fill="'+body+'"/><rect x="'+(8-bw/2+1)+'" y="1" width="'+(bw-2)+'" height="1" fill="#ffffff66"/>';
  o+='<rect x="4" y="3" width="8" height="'+(nano?6:7)+'" fill="#222"/><rect x="5" y="4" width="6" height="'+(nano?4:5)+'" fill="'+(m.fam==="g4"||m.fam==="early"?"#b8d8a8":"#8ec8f0")+'"/><rect x="5" y="4" width="6" height="1" fill="#ffffff88"/>';
  var cy=nano?16:17;
  if(early){o+='<rect x="4" y="'+(cy-4)+'" width="8" height="8" fill="'+wheel+'"/><rect x="6" y="'+(cy-2)+'" width="4" height="4" fill="'+body+'"/><rect x="5" y="'+(cy-3)+'" width="6" height="1" fill="#0002"/>'}
  else{o+='<rect x="5" y="'+(cy-4)+'" width="6" height="8" fill="'+wheel+'"/><rect x="4" y="'+(cy-3)+'" width="8" height="6" fill="'+wheel+'"/><rect x="6" y="'+(cy-1)+'" width="4" height="2" fill="'+body+'"/><rect x="7" y="'+(cy-4)+'" width="2" height="1" fill="#0003"/>'}
  return'<svg class="ip-pod" viewBox="0 0 16 '+bh+'" width="'+w+'" height="'+Math.round(w*bh/16)+'" shape-rendering="crispEdges" role="img" aria-label="'+E(m.n)+'">'+o+"</svg>"}
 function modPrice(m,sel){var o=m.opts&&sel>0?m.opts[sel-1]:(m.opts?m.opts[0]:null);return m.p+(o?o[1]:0)}
 function model(id){return MODELS.filter(function(x){return x.id===id})[0]}
 function build(){var m=ST.m?model(ST.m):null,ch=[],tot=0,base=m?m.base:0,list=[];
  MODS.forEach(function(x){if(ST.mods[x.id]==null||!m)return;var sel=ST.mods[x.id],op=x.opts?x.opts[Math.max(0,sel)]:null,pr=x.p+(op?op[1]:0);list.push({id:x.id,n:x.n+(op?" ("+op[0]+")":"")+(x.text&&ST.eng?" “"+ST.eng+"”":""),p:pr});tot+=pr});
  var disc=list.length>=3?Math.round(tot*0.1):0;return{m:m,base:base,list:list,mods:tot,disc:disc,total:base+tot-disc}}

 function ipods(){var h=bar("ipods")+'<section class="ip">'+banner()
  +'<div class="ip-desk"><div class="ip-menu" aria-hidden="true"><span class="ip-pe">'+pear(14)+'</span><b>File</b><b>Edit</b><b>View</b><b>Specials</b><span class="ip-mt">Tony’s iPod Works</span></div>'
  +'<div class="ip-store"><div class="ip-hero"><div class="ip-sign"><div class="ip-lg">'+pear(54)+'</div><div><h2>Tony’s iPod Works</h2><p class="ip-sub">Authorized by nobody. Built by Tony.</p></div></div>'
  +'<div class="ip-cast"><div class="ip-cs">'+sp("conrad",92,{tall:1,outfit:"keynote",mood:"happy"})+'<p class="ip-bub">One more thing...</p></div><div class="ip-cc">'+sp("connie",150,{tall:1,look:"explorer",mood:"wink"})+'<p class="ip-bub"><b>Connie:</b> I greet. Uncle Conrad presents. Please do not ask him to stop.</p></div><div class="ip-cm">'+sp("mat",54,{})+'<small>the cursor</small></div></div></div>'
  +'<p class="ip-note">Pick the iPod you like, pick what goes in it, and watch the price add up. This is a mock-up: stock, prices and what fits what are placeholders, and Tony will confirm every build by email before anything happens.</p>'
  +'<div class="ip-win"><div class="ip-tb"><i class="ip-cb"></i><span>1. Pick your iPod</span></div><div class="ip-bd" id="ipm"></div></div>'
  +'<div class="ip-win" id="ipw2"><div class="ip-tb"><i class="ip-cb"></i><span>2. Pick your mods</span></div><div class="ip-bd" id="ipo"></div></div>'
  +'<div class="ip-win" id="ipw3"><div class="ip-tb"><i class="ip-cb"></i><span>3. Your build</span></div><div class="ip-bd" id="ips"></div></div>'
  +'</div></div>'+nextprev("ipods")+"</section>";
  app.innerHTML=h;drawModels();drawMods();drawSummary();
  $("#ipm").addEventListener("change",function(e){var t=e.target;if(t.name==="ipmodel"){ST.m=t.value;ST.fin=0;Object.keys(ST.mods).forEach(function(k){var x=MODS.filter(function(y){return y.id===k})[0];if(x.fits.indexOf(model(ST.m).fam)<0)delete ST.mods[k]});drawModels();drawMods();drawSummary()}if(t.name==="ipfin"){ST.fin=+t.value;drawModels();drawSummary()}});
  $("#ipo").addEventListener("change",function(e){var t=e.target,id=t.dataset.mod;if(!id)return;
   if(t.type==="checkbox"){if(t.checked)ST.mods[id]=ST.mods[id]!=null?ST.mods[id]:0;else{delete ST.mods[id];MODS.forEach(function(x){if(x.needs===id)delete ST.mods[x.id]})}drawMods()}
   else if(t.tagName==="SELECT")ST.mods[id]=+t.value;drawSummary()});
  $("#ipo").addEventListener("input",function(e){if(e.target.dataset.txt){ST.eng=e.target.value.slice(0,32);drawSummary()}})}
 function drawModels(){var o=$("#ipm");if(!o)return;o.innerHTML='<p class="ip-help">Stock is what Tony has on the shelf today (mock numbers).</p><div class="ip-models" role="radiogroup" aria-label="iPod model">'+MODELS.map(function(m){var on=ST.m===m.id;return'<label class="ip-m'+(on?" on":"")+'"><input type="radio" name="ipmodel" value="'+m.id+'"'+(on?" checked":"")+'><span class="ip-mp">'+podSvg(m,on?m.fin[ST.fin]:m.fin[0],38)+'</span><span class="ip-mt2"><b>'+E(m.n)+"</b><small>"+m.yr+" · "+E(m.note)+"</small></span><span class=\"ip-mc\"><b>"+$m(m.base)+"</b><small>"+m.stock+" in stock</small></span></label>"}).join("")+"</div>"
   +(ST.m&&model(ST.m).fin.length>1?'<fieldset class="ip-fin"><legend>Finish</legend>'+model(ST.m).fin.map(function(f,i){return'<label><input type="radio" name="ipfin" value="'+i+'"'+(ST.fin===i?" checked":"")+"> "+E(f)+"</label>"}).join(" ")+"</fieldset>":"")}
 function drawMods(){var o=$("#ipo");if(!o)return;var m=ST.m?model(ST.m):null;
  if(!m){o.innerHTML='<p class="ip-help">Pick an iPod first. Mods that do not fit it are greyed out.</p>';return}
  o.innerHTML='<p class="ip-help">For the <b>'+E(m.n)+"</b>. Pick three or more and the <b>Connie Combo</b> takes 10% off the mods.</p>"+MG.map(function(g){var ms=MODS.filter(function(x){return x.g===g});return'<fieldset class="ip-g"><legend>'+g+"</legend>"+ms.map(function(x){var fits=x.fits.indexOf(m.fam)>=0,dis=!fits||(x.needs&&ST.mods[x.needs]==null),on=ST.mods[x.id]!=null&&fits;
    return'<div class="ip-mod'+(dis?" off":"")+(on?" on":"")+'"><label><input type="checkbox" data-mod="'+x.id+'"'+(on?" checked":"")+(dis?" disabled":"")+"> <b>"+E(x.n)+'</b> <span class="ip-pr">'+$m(x.p)+(x.opts?"+":"")+"</span></label><small>"+E(!fits?"Does not fit the "+FAMS[m.fam]+".":(x.needs&&ST.mods[x.needs]==null?"Needs Rockbox first.":x.d))+"</small>"
     +(x.opts&&fits?'<select data-mod="'+x.id+'" aria-label="'+E(x.n)+' option"'+(on?"":" disabled")+">"+x.opts.map(function(op,i){return'<option value="'+i+'"'+(ST.mods[x.id]===i?" selected":"")+">"+E(op[0])+(op[1]?" (+"+$m(op[1])+")":"")+"</option>"}).join("")+"</select>":"")
     +(x.text&&fits?'<input type="text" class="ip-tx" data-mod="'+x.id+'" data-txt="1" maxlength="32" placeholder="'+E(x.text)+'" value="'+E(ST.eng)+'"'+(on?"":" disabled")+' aria-label="'+E(x.text)+'">':"")+"</div>"}).join("")+"</fieldset>"}).join("")}
 function drawSummary(){var o=$("#ips");if(!o)return;var b=build();
  if(!b.m){o.innerHTML='<p class="ip-help">Nothing yet. Pick an iPod to start your build.</p>';return}
  o.innerHTML='<div class="ip-sum"><div class="ip-pic">'+podSvg(b.m,b.m.fin[ST.fin],64)+'</div><table class="ip-tab"><tbody><tr><td>'+E(b.m.n)+" ("+E(b.m.fin[ST.fin])+")</td><td>"+$m(b.base)+"</td></tr>"+b.list.map(function(l){return"<tr><td>+ "+E(l.n)+"</td><td>"+$m(l.p)+"</td></tr>"}).join("")+(b.disc?'<tr class="disc"><td>Connie Combo: 10% off the mods</td><td>-'+$m(b.disc)+"</td></tr>":"")+'<tr><td>A free Connie sticker, because we like you</td><td>$0.00</td></tr></tbody><tfoot><tr><td>Total (mock)</td><td id="ipt">'+$m(b.total)+"</td></tr></tfoot></table></div>"
   +'<p class="ip-help">Shipping, tax and a final check on what fits are worked out by email once the shop is real. No payment is taken here.</p><p><button class="btn pri" type="button" id="ipadd">Add this build to my cart</button> <button class="btn" type="button" id="ipreset">Start over</button> <a class="btn" href="#/shop/cart">Open cart ('+count()+")</a></p><p class=\"ip-ok\" id=\"ipok\" role=\"status\"></p>";
  $("#ipadd").onclick=function(){var d=b.list.map(function(l){return l.n}).join("; ")||"stock, no mods";addItem({id:"ipod-"+b.m.id+"-"+Date.now(),n:b.m.n+" ("+b.m.fin[ST.fin]+") custom build",u:b.total,d:d});bump();$("#ipok").textContent="Added to your cart. Build another, or open the cart to send the list."};
  $("#ipreset").onclick=function(){ST={m:null,fin:0,mods:{},eng:""};drawModels();drawMods();drawSummary()}}

 /* ------------------------------------------------------------------ cart and mock order request */
 function orderText(c){var t=0,L=c.items.map(function(i){t+=i.u*i.q;return i.q+" x "+i.n+" - "+$m(i.u)+" each"+(i.d?"\n    ("+i.d+")":"")});var w=Object.keys(c.want).map(function(id){var n=id;Object.keys(PROD).forEach(function(k){PROD[k].forEach(function(p){if(p[0]===id)n=p[1]})});return n});
  return"Hello Conventional Memory,\n\nThis is a mock order request from the Conventional Memory Mall (the store is not open yet, so nothing is charged).\n\n"+(L.length?L.join("\n")+"\n\nSubtotal (mock, before shipping and tax): "+$m(t)+"\n":"(no cart items)\n")+(w.length?"\nI would also buy: "+w.join(", ")+"\n":"")+"\nPlease write me when the doors open.\n"}
 function cart(){var c=ld(),t=0;c.items.forEach(function(i){t+=i.u*i.q});
  var h=bar("cart")+'<section class="sh sh-cart">'+banner()+'<h2>Your cart</h2>';
  if(!c.items.length)h+='<p class="empty">Your cart is empty. <a href="#/shop">Walk back into the mall</a>.</p>';
  else h+='<table class="sh-ct"><thead><tr><th>Item</th><th>Qty</th><th>Each</th><th>Total</th><th></th></tr></thead><tbody>'+c.items.map(function(i,n){return"<tr><td><b>"+E(i.n)+"</b>"+(i.d?"<small>"+E(i.d)+"</small>":"")+'</td><td class="q"><button type="button" data-q="'+n+'" data-d="-1" aria-label="One fewer">-</button> '+i.q+' <button type="button" data-q="'+n+'" data-d="1" aria-label="One more">+</button></td><td>'+$m(i.u)+"</td><td>"+$m(i.u*i.q)+'</td><td><button type="button" class="btn" data-rm="'+n+'">Remove</button></td></tr>'}).join("")+'</tbody><tfoot><tr><td colspan="3">Subtotal (mock, before shipping and tax)</td><td>'+$m(t)+"</td><td></td></tr></tfoot></table>";
  var ot=orderText(c);
  h+='<div class="sh-order"><h3>Send us your list</h3><p>There is no checkout yet: no card number, no account and no payment of any kind. This sheet is just a request. Send it by email, copy it or print it, and we will write back when the doors open.</p><pre class="sh-pre" id="shpre">'+E(ot)+'</pre><p class="noprint"><a class="btn pri" id="shmail" href="mailto:'+EMAIL+"?subject="+encodeURIComponent("Mall order request")+"&body="+encodeURIComponent(ot)+'">Email this to Conventional Memory</a> <button class="btn" type="button" id="shcopy">Copy</button> <button class="btn" type="button" id="shprint">Print</button> <button class="btn" type="button" id="shclear">Empty the cart</button></p><p class="ip-ok" id="shok" role="status"></p></div>'
   +'<div class="sh-greet"><span>'+sp("connie",48,{tall:1,look:"explorer"})+'</span><b>Connie:</b> “Please note that I am not the cashier. I am the mannequin.”</div>'+nextprev("")+"</section>";
  app.innerHTML=h;
  $$("[data-q]").forEach(function(b){b.onclick=function(){var c2=ld(),i=c2.items[+b.dataset.q];i.q=Math.max(1,i.q+(+b.dataset.d));sv(c2);cart()}});
  $$("[data-rm]").forEach(function(b){b.onclick=function(){var c2=ld();c2.items.splice(+b.dataset.rm,1);sv(c2);cart()}});
  var cb=$("#shcopy");if(cb)cb.onclick=function(){var ok=function(){$("#shok").textContent="Copied."};try{navigator.clipboard.writeText(ot).then(ok,function(){$("#shok").textContent="Select the text above and copy it."})}catch(e){$("#shok").textContent="Select the text above and copy it."}};
  var pb=$("#shprint");if(pb)pb.onclick=function(){window.print()};var cl=$("#shclear");if(cl)cl.onclick=function(){var c2=ld();c2.items=[];sv(c2);cart()}}

 return{mount:function(el,page,args){app=el;try{var k=page==="ipods"?"ipods":(args&&args[0])||"";
   if(k==="cart")cart();else if(k==="ipods")ipods();else if(PROD[k])shelf(k);else mall()}catch(e){app.innerHTML='<section><h2>Something broke</h2><p class="empty">The mall could not load ('+E(e.message)+").</p></section>"}},
  unmount:function(){},_t:{STORES:STORES,PROD:PROD,MODELS:MODELS,MODS:MODS,build:build,ST:function(){return ST}}}})();
