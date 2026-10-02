// ---- EDIT HERE: your socials and your catalog ----
var HANDLE="ConventionalMemory";
var EMAIL="conventionalmemory@gmail.com"; // your contact address, used by the mailbox
var SITE_URL="https://conventionalmemory.github.io/"; // the one place the public address lives (set to https://conventionalmemory.io/ once the custom domain is live)
var SITE_HOST=SITE_URL.replace(/^https?:\/\//,"").replace(/\/$/,"");
try{if(window.top!==window.self){document.documentElement.style.display="none";window.top.location.replace(window.self.location.href)}}catch(e){document.documentElement.style.display="none"} // no clickjacking: a meta CSP cannot set frame-ancestors
var REPO={owner:"conventionalmemory",repo:"ConventionalMemory.github.io",branch:"main"}; // where the Admin page saves changes
var UPDATED="09/30/2026"; // shown in the footer; change it when you update the site
var SOCIALS=[
 {n:"YouTube",u:"https://www.youtube.com/@ConventionalMemory"},
 {n:"TikTok",u:"https://www.tiktok.com/@ConventionalMemory"},
 {n:"Instagram",u:"https://www.instagram.com/ConventionalMemory"},
 {n:"Facebook",u:"https://www.facebook.com/ConventionalMemory"}
];
// Wanted list and current projects. Entries flagged sample are hidden from visitors.
var WANTED=[
 {name:"Roland SC-55",type:"Sound or MIDI",priority:"High",note:"Sample entry. Say which revision you want and what condition is acceptable.",sample:true}
];
var NOW=[
 {t:"Toshiba Libretto 110CT build",note:"Sample entry. A short progress note, like what you fixed this week.",item:"toshiba-libretto-110ct",sample:true}
];
// Era context: PCS feeds the "high-end PC" sections and timeline. Games, movies, hardware and events live in timeline-data.js.
// PCS: a high-end desktop PC of that time (approximate and general).
var PCS=[
 {y:1981,cpu:"Intel 8088, 4.77 MHz",ram:"16 to 256 KB",video:"CGA color or monochrome text",sound:"PC speaker beeps",storage:"Cassette port or 5.25-inch floppy drives",ex:"IBM PC (5150)"},
 {y:1984,cpu:"Intel 80286, 6 to 8 MHz",ram:"256 to 512 KB",video:"EGA, 16 colors",sound:"PC speaker",storage:"1.2 MB floppy, around 20 MB hard disk",ex:"IBM PC/AT"},
 {y:1987,cpu:"Intel 80386, 16 to 20 MHz",ram:"1 to 4 MB",video:"VGA, 256 colors at 320 x 200",sound:"AdLib FM card or PC speaker",storage:"40 to 80 MB hard disk",ex:"IBM PS/2 Model 80, Compaq Deskpro 386"},
 {y:1990,cpu:"Intel 80486, 25 to 33 MHz",ram:"4 MB",video:"VGA, some Super VGA",sound:"AdLib or Sound Blaster",storage:"80 to 200 MB hard disk",ex:"A 486 tower"},
 {y:1993,cpu:"486DX2-66, or the first Pentiums at 60 and 66 MHz",ram:"8 MB",video:"Super VGA, 1 MB",sound:"Sound Blaster 16",storage:"250 to 500 MB hard disk, double-speed CD-ROM",ex:"A 486 or early Pentium tower"},
 {y:1995,cpu:"Pentium, 90 to 133 MHz",ram:"16 MB",video:"PCI SVGA, 2 MB",sound:"Sound Blaster 16 or AWE32",storage:"1 GB hard disk, 4x CD-ROM",ex:"A Windows 95 Pentium PC"},
 {y:1997,cpu:"Pentium II, 233 to 300 MHz (or Pentium MMX)",ram:"32 to 64 MB",video:"3dfx Voodoo add-in 3D card",sound:"Sound Blaster AWE64",storage:"4 to 6 GB hard disk, 24x CD-ROM",ex:"A Pentium II tower"},
 {y:1998,cpu:"Pentium II, 333 to 450 MHz",ram:"64 to 128 MB",video:"AGP card such as Voodoo2 or Riva TNT",sound:"Sound Blaster Live!",storage:"8 to 10 GB hard disk, DVD-ROM appearing",ex:"A Pentium II tower"},
 {y:1999,cpu:"Pentium III, 450 to 600 MHz, or AMD Athlon",ram:"128 MB",video:"AGP card such as TNT2 or GeForce 256",sound:"Sound Blaster Live!",storage:"10 to 20 GB hard disk, DVD-ROM",ex:"A Pentium III tower"},
 {y:2000,cpu:"Pentium III or Athlon, up to 1 GHz",ram:"128 to 256 MB",video:"GeForce 2 class AGP card",sound:"Sound Blaster Live!",storage:"20 to 40 GB hard disk, CD-RW",ex:"A Pentium III or Athlon tower"}
];
// Review scale: score 0-640 ("K of conventional memory free"). Each tier starts at "min".
// n = the joke name from DOS history, l = the plain-English verdict, d = what it means, c = the EGA color used for it.
var MQ=["Welcome to the museum! Please keep your hands and 5.25 inch floppies inside the cart at all times. Thank you for visiting!",
 "Please do not blow on the cartridges. We checked, it never worked. Thank you for visiting!",
 "You have 3 unread messages on AOL. Please stand by while the modem screams.",
 "Now with 100% more shareware! Register today to unlock the good levels.",
 "Be kind, rewind. Be kinder, defrag.",
 "Attention visitors: the Turbo button is not a real button. Please do not press it. Press it anyway.",
 "Please wait while we load HIMEM.SYS. This may take a moment, or three.",
 "Best viewed in Netscape Navigator 3.0 at 800 x 600. Bring a snack.",
 "Our exhibits are totally tubular and certified Y2K compliant!",
 "Caution: exhibits may contain traces of CRT, dust and pure nostalgia.",
 "Insert Disk 2 to continue. Insert Disk 3. Insert Disk 4. Insert Disk 5.",
 "Hot tip: if it does not work, try a different IRQ. If that does not work, try a different IRQ.",
 "Welcome to the information superhighway. Please keep to the right of the modem.",
 "Did you save your game? You did not save your game.",
 "This site has been visited by absolutely dozens of people since 1995 (give or take 31 years).",
 "No running in the aisles. Also no defragmenting during an earthquake.",
 "Mind the gap between your RAM and your ambitions.",
 "Free gift with every visit: one (1) fond memory of a beige box.",
 "Please keep all hands, feet and joysticks inside the cart at all times.",
 "Stay tuned, more exhibits are loading at 2400 baud."];
var SCALE=[
 {min:0,n:"Format C:",l:"Bogus",c:"#aa0000",d:"Total bummer, dude. Broken, flaky or just not worth the shelf space. Talk to the hand. (Are you sure? Y/N)"},
 {min:100,n:"Abort, Retry, Fail?",l:"Whack",c:"#ff5555",d:"Not cool. It limps along if you are patient, so it is for completists only. As if!"},
 {min:200,n:"Not enough memory",l:"Not bad, dude",c:"#aa5500",d:"Does the job with a few quirks. Not exactly all that, but fine if you find one cheap."},
 {min:300,n:"Runs from a boot disk",l:"Tubular",c:"#ffff55",d:"A little fiddling and then it is a good time. Worth having, no doubt."},
 {min:400,n:"Loads high",l:"Phat",c:"#55ff55",d:"Smooth, fun and easy to live with. A solid pick, totally money."},
 {min:500,n:"Turbo button ON",l:"Radical",c:"#00aaaa",d:"Wicked fast and mega fun. Get some. Easy to recommend."},
 {min:600,n:"640K free!",l:"Da bomb!",c:"#55ffff",d:"All that and a bag of chips. The cream of the collection, with nearly all 640K left for the good stuff."}
];
// Spec sheet template per type, in groups. An item only shows the specs you fill in, so a printer never shows CPU or RAM.
// Anything you add that is not listed here still appears, under "Other specs".
var SPEC_TYPES={
 "Computer":{"Processor and memory":["CPU","CPU speed","FPU","Cache","RAM installed","RAM maximum","RAM type"],
  "Storage":["Storage","Floppy drives","Optical drive","Removable media"],
  "Display and graphics":["Display","Resolution","Colors","Graphics","Video RAM"],
  "Sound and input":["Sound","Keyboard","Pointing device"],
  "Ports and expansion":["Ports","Expansion slots","Networking","Modem"],
  "Power and physical":["Power supply","Battery","Weight","Dimensions","Case color"],
  "Board and software":["Motherboard or chipset","Form factor","BIOS version","OS shipped","Bundled software"]},
 "Console or handheld":{"Hardware":["Generation","CPU","RAM","Video","Audio"],"Media and ports":["Media type","Controller ports","Video output"],"Power and region":["Power","Region"]},
 "Game or software":{"Release":["Publisher","Developer","Genre","Players","Version or revision","Language","Region","Age rating","UPC or SKU"],
  "Media":["Platform","Format","Number of disks","Disk size","Disk density","Number of discs","Number of cartridges","Capacity","Install size"],
  "Requirements":["Minimum CPU","Minimum RAM","Video support","Sound support","Input support"],
  "Protection and packaging":["Copy protection","Manual","Packaging","Extras and feelies","Registration card"]},
 "Expansion card":{"Hardware":["Bus","Chipset","Onboard memory","Ports and connectors","Card length"],"Configuration":["Default IRQ","Default DMA","Default I/O address","Jumpers and switches"],"Software":["Drivers included","Compatible with"]},
 "Sound or MIDI":{"Sound":["Synthesis","Polyphony","Channels","Sample rate","Memory"],"Connections":["Connectors","Compatible software"]},
 "Peripheral":{"Hardware":["Kind","Switch type","Layout","Buttons","Resolution or DPI"],"Connection":["Connector","Interface","Cable length","Power","Compatible systems"]},
 "Storage":{"Drive":["Kind","Capacity","Interface","Form factor","Speed or RPM","Cache","Access time"],"Geometry":["Heads","Cylinders","Sectors"]},
 "Monitor":{"Display":["Diagonal size","Display type","Max resolution","Refresh rate","Dot pitch"],"Connections":["Inputs","Speakers","Power draw"]},
 "Printer":{"Printing":["Technology","Resolution","Speed","Paper size","Pins"],"Connections and supplies":["Interface","Fonts or memory","Ribbon or cartridge"]},
 "Other":{}
};
// Also per item: type (a SPEC_TYPES key), msrp, model, partno, rev, upc, disc (year discontinued), made (date code), country, works (Working, Partly working, Untested, Not working), notes (repairs and mods), status (Display, Storage, Repair, Loaned, Sold), qty, acquired, has ["Box","Manual"], tags [], links [{t,u}], acc (auto CM-0001 if blank), cond (Working, Untested, For parts...), specs {"Label":"Value"}.
// Per item: photos ["url or data: URI"], videos [{t,u}], audio [{t,src}], got, thoughts, score (0-640),
// wiki {t:"Article title",u:"url",summary:"snapshot text"}
// ---- end of editable data ----
var app=document.getElementById("app");
// Placeholder text left in sample entries ("Sample: ...", "Example: ...") is never shown to visitors.
function ph(v){return typeof v==="string"&&/^(sample|example)\b/i.test(v.trim())}
function unex(v){return typeof v==="string"?v.replace(/^(example|sample)( entry)?[:.]\s*/i,""):v}
function guessCat(it){var t=(it.name+" "+(it.text||"")).toLowerCase(),m={"Computer":"Computers","Console or handheld":"Consoles and handhelds","Expansion card":"Expansion cards","Sound or MIDI":"Sound and MIDI","Peripheral":"Peripherals","Storage":"Storage","Monitor":"Monitors","Printer":"Printers","Game or software":"Games and software"};if(it.type&&m[it.type])return m[it.type];return/console|game boy|playstation|nintendo|sega|atari/.test(t)?"Consoles and handhelds":/sound|midi|synth/.test(t)?"Sound and MIDI":/keyboard|mouse|joystick|modem|scanner|webcam/.test(t)?"Peripherals":/game|software|program/.test(t)?"Games and software":/disk|drive|tape|storage/.test(t)?"Storage":"Computers"}
/* An item linked to a timeline entry (it.tl) shows that entry's details wherever the item has none of its own.
   Only descriptive facts are shared. The item's changelog, notes, photos and private fields never touch the timeline. */
function tlInherit(it){delete it.tlShared;if(!it.tl||typeof TL==="undefined")return;var r=TL.filter(function(z){return z[2]===it.tl})[0];if(!r)return;var x=(typeof TLX!=="undefined"&&TLX[r[2]])||{},f=[];
 if((!it.maker||it.maker==="Unknown")&&x.maker){it.maker=x.maker;f.push("maker")}
 if(!it.rel&&!it.year){it.rel=r[0];it.year=+String(r[0]).slice(0,4);if(!r[5])it.relx=true;f.push("release date")}
 if(!it.msrp&&r[3]){it.msrp=r[3];f.push("price")}
 if(!it.text&&(r[4]||x.detail)){it.text=[r[4],x.detail].filter(Boolean).join(" ");f.push("description")}
 var sp=x.specs||{};Object.keys(sp).forEach(function(k){it.specs=it.specs||{};if(!it.specs[k]){it.specs[k]=String(sp[k]);if(f.indexOf("specs")<0)f.push("specs")}});
 it.tlShared=f}
function prepItems(){ITEMS.forEach(function(it){tlInherit(it);if(!it.cat||it.cat==="Other")it.cat=guessCat(it);if(!it.maker)it.maker="Unknown";if(!it.year&&it.rel)it.year=+String(it.rel).slice(0,4);
 ["got","thoughts","cond","acquired"].forEach(function(k){if(ph(it[k])){if(/^(sample|example):/i.test(it[k].trim())&&k!=="thoughts"&&k!=="got"){it[k]=unex(it[k])}else delete it[k]}});
 if(it.text)it.text=unex(it.text);
 if(it.credit&&/replace it with/i.test(it.credit))it.credit="Illustration";
 (it.log||[]).forEach(function(l){l.n=unex(l.n)});(it.extras||[]).forEach(function(x){if(x.note)x.note=/^(example|sample)$/i.test(x.note.trim())?"":unex(x.note);if(!x.note)delete x.note});
 (it.videos||[]).forEach(function(v){v.t=unex(v.t).replace(/\s*\(opens the [^)]*\)/i,"")});
 it.audio=(it.audio||[]).filter(function(a){return!/placeholder/i.test(a.t||"")});
 if(it.log)it.log.forEach(function(l){});
});
 ITEMS.forEach(function(it,i){if(!it.acc)it.acc="CM-"+String(i+1).padStart(4,"0")})}
prepItems();
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function safeUrl(u,k){u=String(u==null?"":u).trim();if(!u)return "";
 if(/^https?:\/\/[^\s"'<>]+$/i.test(u))return u;
 if(k==="link"&&/^mailto:[^\s"'<>]+$/i.test(u))return u;
 if(k==="img"&&/^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,[A-Za-z0-9+\/=]+$/i.test(u))return u;
 if(k==="audio"&&/^data:audio\/(wav|x-wav|mpeg|mp3|ogg);base64,[A-Za-z0-9+\/=]+$/i.test(u))return u;
 if(/^[A-Za-z0-9_\-\/.]+$/.test(u)&&u.charAt(0)!=="/"&&u.indexOf("..")<0)return u;
 return ""}
function wimg(it){var u=it.wiki&&it.wiki.img;return u&&/^https:\/\/upload\.wikimedia\.org\//.test(u)?safeUrl(u,"img"):""}
function pic(it){var u=it.photos&&it.photos.length?safeUrl(it.photos[0],"img"):wimg(it);if(!u&&typeof cimg==="function"&&CIMG[it.name])return prodSvg(it,240,180,"c"+hstr(String(it.id||it.name)).toString(36))+cimg(it.name,640);return u?'<img src="'+esc(u)+'" alt="'+esc(it.name)+'" loading="lazy">':prodSvg(it,240,180,"c"+hstr(String(it.id||it.name)).toString(36))}
function socials(){return '<div class="socials">'+SOCIALS.map(function(s,i){return '<a class="btn'+(i==0?' pri':'')+'" href="'+esc(safeUrl(s.u,"link"))+'" target="_blank" rel="noopener noreferrer">'+esc(s.n)+'</a>'}).join("")+'</div>'}
function tile(href,big,small,cls,gl){return '<a class="hm-tile '+(cls||"")+'" href="'+href+'">'+(gl&&typeof px==="function"?'<i class="hm-ic">'+px(gl,28)+'</i>':"")+'<b>'+big+'</b><span>'+small+'</span></a>'}
function latestHtml(){var rev=ITEMS.slice().reverse(),nw=rev[0],lv=rev.filter(function(i){return(i.videos||[]).some(function(v){return safeUrl(v.u,"link")})})[0];if(!nw)return"";
 var vd=lv?lv.videos.filter(function(v){return safeUrl(v.u,"link")})[0]:null,vu=vd?safeUrl(vd.u,"link"):"",host=vu?(/youtu/i.test(vu)?"YouTube":/tiktok/i.test(vu)?"TikTok":/instagram/i.test(vu)?"Instagram":/facebook|fb\./i.test(vu)?"Facebook":"the web"):"";
 var rest=rev.slice(1,4);
 return'<section><h2>Latest from the museum</h2><div class="latg"><div><h3 class="sub">Newest exhibit</h3><div class="grid one">'+card(nw)+'</div></div>'+(lv?'<div><h3 class="sub">Latest video</h3><a class="vcard" href="'+esc(vu)+'" target="_blank" rel="noopener noreferrer"><span class="vph">'+pic(lv)+'<i class="vpl" aria-hidden="true">&#9654;</i></span><b>'+esc(vd.t||lv.name)+'</b><small>Watch on '+esc(host)+'</small></a><p class="tn">Featured exhibit: <a href="#/item/'+esc(lv.id)+'">'+esc(lv.name)+'</a></p></div>':"")+'</div>'
  +(rest.length?'<h3 class="sub">More new arrivals</h3><div class="grid">'+rest.map(card).join("")+'</div>':"")+'<p><a class="btn pri" href="#/catalog">Browse the full catalog</a> <a class="btn" href="#/follow">Follow for new videos</a></p></section>'}
function connieCorner(){if(typeof mascot!=="function")return"";var q=["I am the 640K that everyone has heard of and nobody has seen.","My sister is a 386. She has glasses and opinions.","My brother lives upstairs in the High Memory Area.","Sunday funnies are out: nobody invited Zack.","I have a closet. Some outfits you can only win."],i=Math.floor(Math.random()*q.length);
 return'<section class="cn-corner"><h2>Connie\'s corner</h2><div class="k-intro">'+mascot(96,"wink")+'<div><p>&ldquo;'+esc(q[i])+'&rdquo;</p><p class="chips"><a class="btn" href="#/connie">Her story</a> <a class="btn" href="#/funnies">Sunday Funnies</a> <a class="btn" href="#/memman">Play Memory Manager</a> <a class="btn" href="#/closet">Closet</a> <a class="btn" href="#/stickers">Stickers</a></p></div></div></section>'}
function home(){
 var n=ITEMS.length,pct=Math.max(1,n/640*100),sc=ITEMS.filter(function(i){return i.score!=null});
 var avg=sc.length?Math.round(sc.reduce(function(a,i){return a+i.score},0)/sc.length):0;
 var old=ITEMS.slice().sort(function(a,b){return a.year-b.year})[0],top=sc.slice().sort(function(a,b){return b.score-a.score})[0];
 var decs=[1970,1980,1990,2000,2010,2020].map(function(d){return '<a class="btn" href="#/timeline/'+(d===1970?1977:d+5)+'">'+d+'s</a>'}).join(" ")+' <a class="btn" href="#/timeline/'+(1978+Math.floor(Math.random()*34))+'">Random year</a>';
 app.innerHTML='<div class="mq"><span>'+esc(MQ[Math.floor(Math.random()*MQ.length)])+'</span></div>'
 +'<div class="hero"><h1>Conventional Memory</h1><p>Vintage computers and the people who kept them running. Watch the videos, then browse every item in the museum, with photos, audio and the story behind each one.</p>'+socials()+'<p><a href="#/start">New here? Start here.</a> &middot; <a href="#/about">Meet the crew</a> &middot; <a href="#/connie">Meet Connie</a></p></div>'
 +'<nav class="hm-tiles" aria-label="Start here">'+tile("#/catalog",n+" items","Browse the catalog","pri","tower")+tile("#/timeline",TL.length+"+ entries","Explore the timeline","","clock")+tile("#/scale","0K to 640K","How items are rated","","star")+tile("#/wanted","Wanted","Help me find these","","gem")+tile("#/random","Surprise me","Load a random item","","dice")+tile("#/daily","Daily Dig","Three questions a day","","bulb")+tile("#/play","Play","Daily puzzles, rigs, prizes","","ghost")+tile("#/connie","Connie","Meet the mascot and her family","","heart")+tile("#/hub/explore","Explore","Tours, eras, the zoom timeline","","globe")+tile("#/follow","Follow","Videos on 4 platforms","","tv")+'</nav>'
 +paHtml()
 +connieCorner()
 +daily()
 +latestHtml()
 +'<section><h2>Travel through time</h2><p>'+TL.length+' dated entries from 1972 to 2026: computers, games, movies and the industry, side by side. Jump to a decade or a year.</p><p class="chips">'+decs+' <a class="btn" href="#/timeline">Open the timeline</a></p>'+otdInner()+'</section>'
 +'<section><h2>The museum so far</h2><div class="mem" role="img" aria-label="'+n+' items cataloged"><div class="bar"><i style="width:'+pct+'%"></i></div><small>'+n+'K used, '+(640-n)+'K free. One item cataloged per K.</small></div><div class="stats"><div><b>'+n+'</b>items</div><div><b>'+(sc.length?avg+'K':'none')+'</b>average score</div><div><b>'+(old?old.year:'none')+'</b>oldest item</div>'+(top?'<div><b><a href="#/item/'+top.id+'">'+esc(top.name)+'</a></b>top rated, '+top.score+'K</div>':'')+'</div></section>'
 +recentHtml()+nowHtml()+qodHtml()+contactHtml();paWire()}
function cardBack(it){var sp=(typeof pickSpecs==="function"?pickSpecs(it,it.type):[]).slice(0,3);return'<div class="fl-b"><b>'+esc(it.name)+'</b>'+(it.score!=null?'<div class="fl-s"><i style="width:'+(it.score/640*100)+'%;background:'+tier(it.score).c+'"></i></div><small>'+esc(tier(it.score).l)+' &middot; '+it.score+'K</small>':'')+(sp.length?'<dl>'+sp.map(function(x){return'<dt>'+esc(x[0])+'</dt><dd>'+esc(String(x[1]).slice(0,30))+'</dd>'}).join("")+'</dl>':'<p>'+esc((it.text||"").slice(0,110))+'</p>')+'<span class="fl-go">Open exhibit &raquo;</span></div>'}
/* Source badge for items bought online. Neutral text label with an original pixel gavel; the sites' real logos are trademarks, so they are not drawn. */
var SRCN={ebay:"eBay",shopgoodwill:"ShopGoodwill"};
function srcBadge(it,big){if(it&&it.units&&it.units.length>1){var seen={},h="";it.units.forEach(function(u){if(u.src&&SRCN[u.src]&&!seen[u.src]){seen[u.src]=1;h+=srcBadge({src:u.src},big)}});return h}if(!it||!SRCN[it.src])return"";var n=SRCN[it.src];return'<span class="srcb srcb-'+it.src+(big?' big':'')+'" title="Purchased on '+n+'"><svg viewBox="0 0 12 12" width="'+(big?18:12)+'" height="'+(big?18:12)+'" aria-hidden="true" shape-rendering="crispEdges"><path d="M2 1h4v1h1v3H6v1H2V5H1V2h1z" fill="currentColor"/><path d="M6 5h1v1h1v1H7V6H6zM7 7h1v1h1v1h1v1H9V9H8V8H7z" fill="currentColor"/><path d="M1 11h6v1H1z" fill="currentColor"/></svg><b>Bought on '+n+'</b></span>'}
function tagNo(it){return it&&it.cm?"CM-"+("0000"+it.cm).slice(-4):""}
function tagParse(s){var m=String(s==null?"":s).trim().match(/^(?:cm[-\s]?)?0*(\d{1,6})$/i);return m?+m[1]:0}
function itemByTag(s){var n=tagParse(s);return n?ALLITEMS.filter(function(i){return i.cm===n})[0]||null:null}
function tagJump(s){var it=itemByTag(s);if(it&&(!it.draft||ADMINVIEW)){location.replace("#/item/"+it.id);return true}return false}
function tagPageMissing(s){var it=itemByTag(s),n=tagParse(s);app.innerHTML='<section class="nf"><div class="nf-m">'+(typeof mascot==="function"?mascot(96,"oops",undefined,true):"")+'</div><h2>'+(it?"Exhibit "+esc(tagNo(it))+" is being prepared":"No exhibit with that label")+'</h2><p>'+(it?"It is in the museum's storeroom and not on the public site yet. Check back soon.":"Nothing is filed under "+esc(n?"CM-"+("0000"+n).slice(-4):String(s))+". The label may be from a different museum, or the exhibit was retired.")+'</p><p><a class="btn pri" href="#/catalog">Browse the catalog</a> <a class="btn" href="#/search">Search</a></p></section>'}
function card(it){return '<a class="card fl" href="#/item/'+it.id+'"><div class="fl-in"><div class="fl-f"><div class="ph">'+pic(it)+((it.photos||[]).length&&typeof pxCat==="function"?'<i class="pbadge" aria-hidden="true">'+pxCat(it.cat,20)+'</i>':"")+'</div><div class="t"><h3 title="'+esc(it.name)+'">'+(typeof pxCat==="function"?pxCat(it.cat,16):"")+esc(it.name)+'</h3><p class="mk">'+esc(it.maker)+(it.year?' &middot; '+it.year:"")+'</p><p class="tg">'+(it.score!=null?'<span class="tag">'+it.score+'K</span>':'')+(it.status?'<span class="tag">'+esc(it.status)+'</span>':'')+(it.qty>1?'<span class="tag">x'+it.qty+'</span>':'')+'</p>'+srcBadge(it)+'</div></div>'+cardBack(it)+'</div></a>'}
var MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function fmtDate(d){var p=String(d).split("-");return p.length===3?MON[+p[1]-1]+" "+(+p[2])+", "+p[0]:p.length===2?MON[+p[1]-1]+" "+p[0]:p[0]}
function dyear(d){return +String(d).slice(0,4)}
function today(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
var TLK={i:["Museum items","Item"],hw:["Hardware","Hardware"],pe:["Peripherals","Peripheral"],sw:["Software","Software"],gt:["Top games","Top game"],gn:["Notable games","Notable game"],gc:["Comical and obscure games","Obscure game"],e:["Industry events","Industry"],m:["Movies","Movie"],w:["World events","World"],u:["US events","US"],p:["High-end PCs","PC"]};
var TLF={},TLQ="";Object.keys(TLK).forEach(function(k){TLF[k]=1});
function tlEntries(){var e=[];
 if(TLF.i)ITEMS.forEach(function(i){var lr=i.tl?TL.filter(function(z){return z[2]===i.tl})[0]:null;e.push(lr?{d:lr[0],k:"i",i:i,n:lr[4]}:{d:i.rel||String(i.year),k:"i",i:i})});
 var mine=ITEMS.map(function(i){return i.name.toLowerCase()}).concat(ITEMS.map(function(i){return(i.tl||"").toLowerCase()}).filter(Boolean));
 TL.forEach(function(r){var t=r[2].toLowerCase();if(TLF[r[1]]&&!mine.some(function(n){return t.indexOf(n)>=0||n.indexOf(t)>=0}))e.push({d:r[0],k:r[1],t:r[2],p:r[3],n:r[4],s:r[5]})});
 if(TLF.p)PCS.forEach(function(p){e.push({d:String(p.y),k:"p",t:"High-end PC of the year: "+p.cpu+", "+p.ram+" RAM, "+p.video+", "+p.sound,n:p.ex})});
 var q=TLQ.trim().toLowerCase();
 if(q)e=e.filter(function(x){return(x.i?x.i.name+" "+x.i.maker:x.t+" "+(x.n||"")).toLowerCase().indexOf(q)>=0});
 return e.sort(function(a,b){return a.d<b.d?-1:a.d>b.d?1:0})}
function astr(x){var u=x.k==="i"?x.i.relx:x.k==="p"?false:!x.s;return u?'<span class="ast" title="Not confirmed against a source">*</span>':""}
function gamesFor(y){var by={};TL.forEach(function(r){if(r[1]==="gt"||r[1]==="gn"){var yy=dyear(r[0]);(by[yy]=by[yy]||[]).push(r)}});
 var ys=Object.keys(by).map(Number).filter(function(v){return v<=y}).sort(function(a,b){return b-a});
 if(!ys.length)return null;return {y:ys[0],l:by[ys[0]].slice().sort(function(a,b){return(a[1]==="gt"?0:1)-(b[1]==="gt"?0:1)})}}
function pcFor(y){var r=null;PCS.forEach(function(p){if(p.y<=y)r=p});return r}
/* ---------- tribute ads ---------- */
function hstr(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
var AD_SKY=[["#0000aa","#aa00aa","#ffff55"],["#000000","#0000aa","#55ffff"],["#aa0000","#ff5555","#ffff55"],["#00aaaa","#0000aa","#ffffff"],["#aa00aa","#ff55ff","#55ffff"],["#00aa00","#005555","#ffff55"],["#aa5500","#aa0000","#ffff55"]];
function adArt(r,w,h,uid){var ax=adArtX(r,w,h,uid);if(ax)return ax;var R=rng(hstr(r[2])),sk=AD_SKY[Math.floor(R()*AD_SKY.length)],soft=r[1]!=="hw"&&r[1]!=="pe",g="ag"+uid,o='<svg viewBox="0 0 180 150" width="'+w+'" height="'+h+'" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Generated artwork for '+esc(r[2])+'" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="'+g+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+sk[0]+'"/><stop offset="1" stop-color="'+sk[1]+'"/></linearGradient></defs><rect width="180" height="150" fill="url(#'+g+')"/>',i;
 if(soft){var style=Math.floor(R()*2),x;
  for(i=0;i<22;i++)o+='<rect x="'+Math.floor(R()*178)+'" y="'+Math.floor(R()*80)+'" width="'+(R()<.2?2:1)+'" height="'+(R()<.2?2:1)+'" fill="#fff"/>';
  if(style===0){x=40+Math.floor(R()*100);o+='<circle cx="'+x+'" cy="78" r="30" fill="'+sk[2]+'"/>';for(i=0;i<6;i++)o+='<rect x="'+(x-32)+'" y="'+(80+i*5)+'" width="64" height="'+(1+i*.5)+'" fill="'+sk[1]+'"/>';
   o+='<polygon points="0,104 30,72 55,96 85,64 120,98 150,76 180,100 180,150 0,150" fill="#000" opacity=".55"/>';
   o+='<rect y="104" width="180" height="46" fill="#000"/>';for(i=0;i<7;i++)o+='<line x1="90" y1="104" x2="'+(-90+i*60)+'" y2="150" stroke="'+sk[2]+'" stroke-width=".7"/>';for(i=1;i<5;i++)o+='<line x1="0" y1="'+(104+i*i*3)+'" x2="180" y2="'+(104+i*i*3)+'" stroke="'+sk[2]+'" stroke-width=".7"/>'}
  else{x=30+Math.floor(R()*120);o+='<circle cx="'+x+'" cy="62" r="34" fill="'+sk[2]+'" opacity=".95"/><circle cx="'+(x+9)+'" cy="55" r="34" fill="'+sk[0]+'" opacity=".55"/>';o+='<ellipse cx="'+x+'" cy="62" rx="52" ry="9" fill="none" stroke="#fff" stroke-width="2" transform="rotate(-18 '+x+' 62)"/>';
   o+='<polygon points="0,150 0,118 22,100 40,112 66,88 96,110 120,94 150,112 180,96 180,150" fill="#000" opacity=".7"/>';
   for(i=0;i<9;i++)o+='<rect x="'+Math.floor(R()*170)+'" y="'+(112+Math.floor(R()*30))+'" width="3" height="3" fill="'+sk[2]+'"/>'}}
 else{for(i=0;i<8;i++){var a=i*Math.PI/4,x2=90+Math.cos(a)*200,y2=75+Math.sin(a)*200,a2=a+Math.PI/8;o+='<polygon points="90,75 '+x2.toFixed(0)+','+y2.toFixed(0)+' '+(90+Math.cos(a2)*200).toFixed(0)+','+(75+Math.sin(a2)*200).toFixed(0)+'" fill="#fff" opacity=".13"/>'}
  o+='<rect x="46" y="28" width="88" height="66" rx="5" fill="#aaa" stroke="#000" stroke-width="2"/><rect x="54" y="35" width="72" height="50" fill="#0000aa" stroke="#555" stroke-width="2"/><text x="60" y="55" font-family="monospace" font-size="10" fill="#fff">C:\\&gt;_</text><rect x="60" y="62" width="40" height="3" fill="#55ffff"/><rect x="60" y="69" width="28" height="3" fill="#ffff55"/>';
  o+='<rect x="76" y="94" width="28" height="8" fill="#aaa" stroke="#000"/><rect x="52" y="102" width="76" height="12" rx="2" fill="#aaa" stroke="#000" stroke-width="2"/>';for(i=0;i<9;i++)o+='<rect x="'+(56+i*8)+'" y="105" width="6" height="3" fill="#555"/>';
  o+='<rect y="126" width="180" height="24" fill="#000" opacity=".6"/>'}
 return o+'</svg>'}
function adStore(r){return r[1]==="hw"||r[1]==="pe"?"Bit Barn Computers":"Bargain Bytes Software"}
var AD_TAGS_SW=["Clear some room on your hard drive.","Sound card recommended. Volume knob required.","Your mouse will thank you.","Loads high. Plays higher.","Now in glorious 256 colors.","Save often. Trust nobody.","Insert disk 1 to begin."];
var AD_TAGS_HW=["More megahertz than you can shake a floppy at.","The future fits on your desk.","Upgrade before your neighbor does.","Plug in. Power up. Play.","Now with a turbo button, probably."];
function adTag(r){var p=r[1]==="hw"||r[1]==="pe"?AD_TAGS_HW:AD_TAGS_SW;return p[hstr(r[2]+"t")%p.length]}
function dnum(d,up){var p=String(d).split("-"),y=+p[0],m=p[1]?+p[1]:up?12:1,dd=p[2]?+p[2]:up?28:1;return y*372+(m-1)*31+dd-1}
function fine(d){return String(d).length>=7}
function guessPrice(r,y){if(r[3]==="n/a")return {t:"Not sold",est:false};if(r[3])return {t:r[3],est:/\*$/.test(r[3])};
 if(r[1]==="hw"||r[1]==="pe")return {t:"Price TBA*",est:true};
 var pr=y<1990?"$29.95 to $49.95*":y<1996?"$39.95 to $59.95*":y<2000?"$39.99 to $54.99*":y<2006?"$29.99 to $49.99*":"$39.99 to $59.99*";return {t:pr,est:true}}
function adPicks(it){var d0=it.rel||String(it.year);if(!it.year)return [];var a=dnum(d0,false),out=[];
 TL.forEach(function(r){if(["gt","gn","hw","sw"].indexOf(r[1])<0||!fine(r[0]))return;if(r[1]==="hw"&&/game boy|playstation|nintendo|sega|xbox|dreamcast|atari|neo geo|turbografx|3do|jaguar|famicom|genesis|saturn|gamecube|wii|ds\b|psp|kinect|iphone|ipod|kindle|ipad/i.test(r[2]))return;var n=dnum(r[0],false);if(n<=a||n>a+31*9)return;
  var t=r[2].toLowerCase();if(ITEMS.some(function(x){return t.indexOf(x.name.toLowerCase())>=0}))return;out.push({r:r,n:n})});
 out.sort(function(x,y){return x.n-y.n});
 var gm=out.filter(function(x){return x.r[1]==="gt"||x.r[1]==="gn"}),hw=out.filter(function(x){return x.r[1]==="hw"});
 gm.sort(function(x,y){return(x.r[1]==="gt"?0:1)-(y.r[1]==="gt"?0:1)||x.n-y.n});
 var pick=gm.slice(0,2).concat(hw.slice(0,1));if(pick.length<3)pick=pick.concat(gm.slice(2,5-pick.length));
 return pick.slice(0,3).sort(function(x,y){return x.n-y.n}).map(function(x){return x.r})}
function adWhen(r){return "COMING "+fmtDate(r[0]).toUpperCase()+(r[5]?"":"*")}
function eraPane(it){if(!it.year)return"";var d0=it.rel||String(it.year),a=dnum(d0,false),b=dnum(d0,true),P=[],ng=0;
 var gm=typeof gxEra==="function"?gxEra(it,"games"):"";
 if(gm){var mm=/data-n="(\d+)"/.exec(gm);ng=mm?+mm[1]:0}
 else{var near=TL.filter(function(r){var n=dnum(r[0],false);return(r[1]==="gt"||r[1]==="gn")&&fine(r[0])&&n>=a-31*6&&n<=a+31*3});near.sort(function(x,y){return(x[1]==="gt"?0:1)-(y[1]==="gt"?0:1)});near=near.slice(0,12).sort(function(x,y){return dnum(x[0])-dnum(y[0])});ng=near.length;
  if(near.length)gm='<h3 class="sub">Games out around then</h3><div class="evl">'+near.map(function(r){var x=dnum(r[0],false);return'<a class="evr" href="#/timeline/'+dyear(r[0])+'/'+encodeURIComponent(r[2])+'"><i>'+(typeof pxRow==="function"?pxRow(r,16):"")+'</i><span class="evd">'+esc(fmtDate(r[0]))+(r[5]?"":"*")+'</span><b>'+esc(r[2])+'</b><small>'+(x>b?"after":x<a?"before":"same time")+'</small></a>'}).join("")+'</div>';
  else{var g=gamesFor(it.year);if(g){ng=g.l.length;gm='<h3 class="sub">Games around '+g.y+'</h3><p>'+g.l.slice(0,14).map(function(r){return esc(r[2])}).join(", ")+'</p>'}}}
 if(gm)P.push(["games","Games",ng,gm]);
 var ev=TL.filter(function(r){return(r[1]==="e"||r[1]==="hw"||r[1]==="sw")&&fine(r[0])&&Math.abs(dnum(r[0],false)-a)<=31*6&&r[2]!==it.name});
 function evc(r){return'<a class="evr" href="#/timeline/'+dyear(r[0])+'/'+encodeURIComponent(r[2])+'"><i>'+(typeof pxRow==="function"?pxRow(r,16):"")+'</i><span class="evd">'+esc(fmtDate(r[0]))+(r[5]?"":"*")+'</span><b>'+esc(r[2])+'</b></a>'}
 var news=ev.filter(function(r){return r[1]==="e"}).slice(0,10).sort(function(x,y){return dnum(x[0])-dnum(y[0])}),tech=ev.filter(function(r){return r[1]!=="e"}).slice(0,10).sort(function(x,y){return dnum(x[0])-dnum(y[0])});
 if(news.length||tech.length)P.push(["tech","News and tech",news.length+tech.length,'<div class="evcols">'+(news.length?'<div><h3 class="sub">In the news</h3><div class="evl">'+news.map(evc).join("")+'</div></div>':"")+(tech.length?'<div><h3 class="sub">Hardware and software</h3><div class="evl">'+tech.map(evc).join("")+'</div></div>':"")+'</div><p class="tn">Within six months either side. An asterisk means the date is unconfirmed.</p>']);
 var pc=pcFor(it.year);if(pc)P.push(["pc","The PC of the day","","<h3 class=\"sub\">A high-end PC in "+pc.y+"</h3>"+tbl([["CPU",pc.cpu],["RAM",pc.ram],["Video",pc.video],["Sound",pc.sound],["Storage",pc.storage],["Example",pc.ex]])+'<p class="tn">Curated summary, approximate and general. Put it next to the Specs tab.</p>']);
 var lo=typeof gxEra==="function"?gxEra(it,"loot"):"";if(lo)P.push(["loot","Accessories",(lo.match(/<a /g)||[]).length,lo]);
 if(!P.length)return"";
 return'<div class="era2"><div class="ehead"><b>'+esc(String(it.year))+'</b><span>What the world looked like around <i>'+esc(fmtDate(d0))+'</i></span><a class="btn" href="#/timeline/'+it.year+'">Open '+it.year+' on the timeline</a></div>'
  +'<div class="esw noprint" role="tablist" aria-label="Around this date">'+P.map(function(x,i){return'<button type="button" class="chip'+(i?"":" on")+'" role="tab" data-ep="'+x[0]+'" aria-selected="'+(i===0)+'">'+x[1]+(x[2]!==""?' <b>'+x[2]+'</b>':"")+'</button>'}).join("")+'</div>'
  +P.map(function(x,i){return'<div class="ep" data-ep="'+x[0]+'"'+(i?" hidden":"")+'>'+x[3]+'</div>'}).join("")+'</div>'}
function adPane(it){var picks=adPicks(it),h=adItem(it);if(!h)return"";
 return'<p class="tn adn">A made-up 1990s store flyer built from this item\'s own data. Nothing here can be ordered. <button class="btn adh noprint" type="button">New headline</button></p>'+h+(picks.length?'<h3 class="sub">More from the flyer rack</h3>'+adShelf(picks):"")}
var LOGTYPES=["Acquired","Upgrade","Repair","Mod","Clean","Test","Moved","Sold","Note"];
function logsOf(it){return(it.log||[]).slice().sort(function(a,b){return a.d<b.d?1:a.d>b.d?-1:0})}
function ytIdOf(u){var m=String(u||"").match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);return m?m[1]:null}
function tstamp(n){var h=Math.floor(n/3600),m=Math.floor(n%3600/60),r=n%60;return(h?h+":"+(m<10?"0":""):"")+m+":"+(r<10?"0":"")+r}
function jPhoto(it,r){r=String(r||"").trim();var m=r.match(/^photo#(\d+)$/i);if(m)r=(it.photos||[])[+m[1]-1]||"";return r?safeUrl(r,"img"):""}
function caseFile(x){if(!x.sym&&!x.fix)return"";return'<dl class="casef">'+(x.sym?"<dt>Symptom</dt><dd>"+esc(x.sym)+"</dd>":"")+(x.fix?"<dt>Fix</dt><dd>"+esc(x.fix)+"</dd>":"")+"</dl>"}
function baSlider(it,x){var b=jPhoto(it,x.b),a=jPhoto(it,x.a);if(!b||!a)return"";return'<div class="ba noprint" style="--p:50%"><img src="'+esc(b)+'" alt="Before: '+esc(x.n||"")+'" loading="lazy"><img class="ba-a" src="'+esc(a)+'" alt="After: '+esc(x.n||"")+'" loading="lazy"><span class="ba-l">Before</span><span class="ba-r">After</span><input type="range" min="0" max="100" value="50" aria-label="Drag to compare before and after"></div>'}
function logSec(it){var l=logsOf(it);if(!l.length)return"";var hrs=0,parts=[],rep=0;l.forEach(function(x){if(x.hrs)hrs+=+x.hrs;if(x.parts)String(x.parts).split(/\s*,\s*/).forEach(function(p){if(p&&parts.indexOf(p)<0)parts.push(p)});if(/^(Repair|Mod|Upgrade)$/.test(x.t))rep++});
 var sum=hrs||parts.length||rep>1?'<p class="jsum"><b>Repair journal:</b> '+rep+' job'+(rep===1?"":"s")+(hrs?', '+hrs+' hour'+(hrs===1?"":"s")+' of work':"")+(parts.length?', parts used: '+esc(parts.join(", ")):"")+'.</p>':"";
 return sec("Changelog",sum+'<div>'+l.map(function(x){return '<div class="cl"><b>'+esc(fmtDate(x.d))+'</b><span class="tag">'+esc(x.t||"Note")+'</span> '+esc(x.n||"")+(x.hrs?' <small class="tn">('+esc(x.hrs)+' h)</small>':"")+(x.parts?'<small class="tn"> &middot; parts: '+esc(x.parts)+'</small>':"")+caseFile(x)+baSlider(it,x)+'</div>'}).join("")+'</div>')}
function videoPane(it){var vs=(it.videos||[]).filter(function(v){return v&&v.u});if(!vs.length)return"";
 return vs.map(function(v,i){var id=ytIdOf(v.u),u=safeUrl(v.u,"link");if(!u)return"";
  if(!id)return'<div class="vp"><h3 class="sub">'+esc(v.t)+'</h3><p><a class="btn pri" href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">&#9654; Watch on the web</a></p></div>';
  return'<div class="vp" data-yt="'+id+'"><h3 class="sub">'+esc(v.t)+'</h3><div class="vf"><button type="button" class="vplay" aria-label="Play '+esc(v.t)+'"><img src="https://i.ytimg.com/vi/'+id+'/hqdefault.jpg" alt="" loading="lazy"><b>&#9654; Play</b></button></div>'
   +((v.c||[]).length?'<ol class="vch" aria-label="Chapters">'+v.c.map(function(c){return'<li><button type="button" class="chip" data-s="'+(+c.s||0)+'"><b>'+tstamp(+c.s||0)+'</b> '+esc(c.l)+'</button></li>'}).join("")+'</ol>':"")
   +'<p class="tn"><a href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">Open on YouTube</a> &middot; plays through youtube-nocookie.com only after you press play.</p></div>'}).join("")}
function allLogs(){var r=[];ITEMS.forEach(function(it){(it.log||[]).forEach(function(x){r.push({it:it,x:x})})});return r.sort(function(a,b){return a.x.d<b.x.d?1:a.x.d>b.x.d?-1:0})}
function logRow(e){return '<div class="cl"><b>'+esc(fmtDate(e.x.d))+'</b><span class="tag">'+esc(e.x.t||"Note")+'</span> <a href="#/item/'+esc(e.it.id)+'">'+esc(e.it.name)+'</a>: '+esc(e.x.n||"")+caseFile(e.x)+'</div>'}
function recentHtml(){var r=allLogs().slice(0,5);return r.length?'<section><h2>Recent changes</h2>'+r.map(logRow).join("")+'<p><a href="#/changes">See every change</a> &middot; <a href="feed.xml">RSS feed</a></p></section>':""}
function changes(){
 app.innerHTML='<section><h2>Changelog</h2><p>Every upgrade, repair and change to the collection, newest first. <a href="feed.xml">Subscribe with RSS</a>.</p><div class="tools"><select id="lt" aria-label="Type"><option value="">All types</option>'+LOGTYPES.map(function(t){return '<option>'+t+'</option>'}).join("")+'</select></div><div id="ll"></div></section>';
 var r=allLogs(),s=document.getElementById("lt"),ll=document.getElementById("ll");
 function draw(){var l=r.filter(function(e){return !s.value||e.x.t===s.value}),m=null,o="";
  l.forEach(function(e){var mo=String(e.x.d).slice(0,7);if(mo!==m){m=mo;o+='<h3 class="sub">'+esc(fmtDate(mo))+'</h3>'}o+=logRow(e)});
  ll.innerHTML=o||'<div class="empty">No updates yet. Check back soon.</div>'}
 s.onchange=draw;draw()}
function journal(){
 var all=allLogs(),jobs=all.filter(function(e){return/^(Repair|Mod|Upgrade|Clean)$/.test(e.x.t)}),hrs=0,parts={},its={},ba=[];
 jobs.forEach(function(e){if(e.x.hrs)hrs+=+e.x.hrs||0;if(e.x.parts)String(e.x.parts).split(/\s*,\s*/).forEach(function(q){if(q)parts[q]=(parts[q]||0)+1});its[e.it.id]=1;if(baSlider(e.it,e.x))ba.push(e)});
 var pk=Object.keys(parts).sort(function(a,b){return parts[b]-parts[a]||(a<b?-1:1)});
 var h='<section><h2>Repair journal</h2><p>The bench diary: every repair, mod, upgrade and cleaning from the collection, newest first, with before and after photos where there are any. Each machine\'s own page has its full history.</p>'
  +'<div class="stats"><div><b>'+jobs.length+'</b>jobs</div><div><b>'+Object.keys(its).length+'</b>machines worked on</div><div><b>'+(Math.round(hrs*10)/10)+'</b>hours logged</div><div><b>'+pk.length+'</b>different parts</div></div>'
  +(pk.length?'<p class="jsum"><b>Parts used:</b> '+pk.slice(0,24).map(function(q){return esc(q)+(parts[q]>1?" x"+parts[q]:"")}).join(", ")+'.</p>':"");
 if(ba.length)h+='<h3 class="sub">Before and after</h3><div class="jba">'+ba.slice(0,12).map(function(e){return'<div><a href="#/item/'+esc(e.it.id)+'">'+esc(e.it.name)+'</a> <small class="tn">'+esc(fmtDate(e.x.d))+'</small>'+baSlider(e.it,e.x)+'</div>'}).join("")+'</div>';
 h+='<h3 class="sub">All jobs</h3><div class="tools"><select id="jt" aria-label="Type"><option value="">Repairs, mods, upgrades and cleaning</option>'+["Repair","Mod","Upgrade","Clean"].map(function(t){return'<option>'+t+'</option>'}).join("")+'</select></div><div id="jl"></div>';
 if(!jobs.length)h+='<div class="empty">'+(typeof conW==="function"?conW("No repair jobs in the journal yet. Log one on a machine\'s page (Admin, changelog) and it shows up here.","oops"):"No repair jobs yet.")+'</div>';
 app.innerHTML=h+'</section>';
 var sel=document.getElementById("jt"),jl=document.getElementById("jl");
 function draw(){var l=jobs.filter(function(e){return!sel.value||e.x.t===sel.value});jl.innerHTML=l.map(function(e){var ph=(e.it.photos||[])[0],u=ph?safeUrl(ph,"img"):"";return'<div class="cl">'+(u?'<img class="jth" src="'+esc(u)+'" alt="" loading="lazy">':"")+'<b>'+esc(fmtDate(e.x.d))+'</b><span class="tag">'+esc(e.x.t)+'</span> <a href="#/item/'+esc(e.it.id)+'">'+esc(e.it.name)+'</a>: '+esc(e.x.n||"")+(e.x.hrs?' <small class="tn">('+esc(e.x.hrs)+' h)</small>':"")+(e.x.parts?'<small class="tn"> &middot; parts: '+esc(e.x.parts)+'</small>':"")+caseFile(e.x)+baSlider(e.it,e.x)+'</div>'}).join("")||'<p class="empty">Nothing of that type yet.</p>'}
 sel.onchange=draw;draw()}
var EXST=["Have","Want","Missing","Optional"];
var ACC_HINTS={"Computer":["AC adapter","Battery","Manual","Original box","Carrying case","Restore or driver disks","Dock or port replicator","Mouse","Keyboard"],
 "Console or handheld":["Controllers","AV cable","Power adapter","Memory card","Manual","Original box"],
 "Game or software":["Box","Manual","Disks or discs","Registration card","Map or cloth map","Code wheel","Feelies","Reference card"],
 "Expansion card":["Driver disks","Manual","Original box","Slot bracket","Cables"],
 "Sound or MIDI":["Power cable","MIDI cables","Interface card","Manual","Original box"],
 "Peripheral":["Cable","Adapter","Manual","Original box","Driver disk"],
 "Storage":["Cable","Mounting rails","Manual","Drivers","Original box"],
 "Monitor":["Power cable","Video cable","Manual","Stand","Original box"],
 "Printer":["Power cable","Interface cable","Manual","Ribbon or cartridge","Paper"],
 "Other":["Manual","Original box","Cables"]};
function exStat(x){return EXST.indexOf(x.s)>=0?x.s:"Have"}
function phKind(it,u){var m=(it.photoMeta||{})[u];if(m&&m.k)return m.k;return/^https:\/\/(upload|commons)\.wikimedia\.org|wikipedia\.org/.test(String(u))?"stock":"mine"}
function exThumbs(ph,alt,n){var h="";(ph||[]).slice(0,n||3).forEach(function(u){var s=safeUrl(u,"img");if(s)h+='<a href="'+esc(s)+'" target="_blank" rel="noopener noreferrer" title="'+esc(alt)+'"><img src="'+esc(s)+'" alt="'+esc(alt)+'" loading="lazy"></a>'});return h?'<span class="exth">'+h+'</span>':""}
function exSec(it){var e=it.extras||[],rev=ITEMS.filter(function(i){return(i["for"]||[]).indexOf(it.id)>=0&&!e.some(function(x){return x.item===i.id})});if(!e.length&&!rev.length)return "";
 var core=e.filter(function(x){return exStat(x)!=="Optional"}),have=core.filter(function(x){return exStat(x)==="Have"}).length;
 var sum=core.length?'<p>'+(have===core.length?'<span class="tag want">Complete set</span> ':'')+have+' of '+core.length+' pieces in the set.</p>':"";
 return sec("Accessories and companions",sum+e.map(function(x){var s=exStat(x),li=x.item&&ITEMS.filter(function(i){return i.id===x.item})[0],ph=li?(li.photos||[]):(x.photos||[]);
  return '<div class="exi"><span class="tag'+(s==="Want"||s==="Missing"?' want':'')+'">'+s+'</span> '+exThumbs(ph,x.n)+(li?'<a href="#/item/'+esc(x.item)+'">'+esc(x.n)+'</a>':esc(x.n))+(x.note?' <small class="tn">'+esc(x.note)+'</small>':'')+'</div>'}).join("")
  +rev.map(function(i){return'<div class="exi"><span class="tag">In the catalog</span> '+exThumbs(i.photos,i.name)+'<a href="#/item/'+esc(i.id)+'">'+esc(i.name)+'</a>'+(i.maker&&i.maker!=="Unknown"?' <small class="tn">'+esc(i.maker)+'</small>':'')+'</div>'}).join(""))}
function withSec(it){var l=(it["for"]||[]).map(function(id){return ITEMS.filter(function(i){return i.id===id})[0]}).filter(Boolean);if(!l.length)return"";
 return sec("Works with",'<p class="tn">This is an accessory or companion of:</p>'+l.map(function(i){return'<div class="exi">'+exThumbs(i.photos,i.name,1)+'<a href="#/item/'+esc(i.id)+'">'+esc(i.name)+'</a></div>'}).join(""))}
function wantedExtras(){var r=[];ITEMS.forEach(function(it){(it.extras||[]).forEach(function(x){var s=exStat(x);if(s==="Want"||s==="Missing")r.push({it:it,x:x,s:s})})});return r}
function gcd(a,b){return b?gcd(b,a%b):a}
function qod(){var d=new Date(),n=Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5),L=QUOTES.length,st=151;while(gcd(st,L)!==1)st++;return QUOTES[(n*st)%L]}
function qBlock(q){return '<blockquote class="qt"><p>'+esc(q[0])+'</p><div class="qa">'+esc(q[1])+'</div></blockquote>'}
function qodHtml(){return QUOTES.length?'<section><h2>Quote of the day</h2><div id="qbox">'+qBlock(qod())+'</div><p><button class="btn" id="qnew" type="button">Another quote</button> <a class="btn" href="#/quotes">All '+QUOTES.length+' quotes</a></p></section>':""}
function quotesPage(){
 app.innerHTML='<section><h2>Quotes</h2><p>'+QUOTES.length+' quotes about computers, memory, collecting and the past. Where a famous line is disputed, the attribution says so. Lines credited to Conventional Memory are the museum&rsquo;s own.</p><div class="tools"><input id="qs" type="search" placeholder="Search quotes or people" aria-label="Search quotes"></div><p id="qc"></p><div id="ql"></div></section>';
 var qs=document.getElementById("qs");
 function draw(){var t=qs.value.toLowerCase(),l=QUOTES.filter(function(q){return(q[0]+" "+q[1]).toLowerCase().indexOf(t)>=0});document.getElementById("qc").textContent=l.length+" quotes";document.getElementById("ql").innerHTML=l.map(qBlock).join("")}
 qs.oninput=draw;draw()}
function otdInner(){var d=new Date(),k="-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
 var l=TL.filter(function(r){return r[0].length===10&&r[0].slice(4)===k}).map(function(r){return{y:r[0].slice(0,4),k:r[1],t:r[2]}})
  .concat(ITEMS.filter(function(i){return i.rel&&i.rel.length===10&&i.rel.slice(4)===k}).map(function(i){return{y:i.rel.slice(0,4),k:"i",t:i.name}}))
  .sort(function(a,b){return a.y<b.y?-1:1}).slice(0,5);
 return l.length?'<h3 class="sub">On this day</h3>'+l.map(function(r){return '<p class="tl"><b>'+esc(r.y)+'</b><span class="tag">'+esc(TLK[r.k][1])+'</span> '+esc(r.t)+'</p>'}).join("")+'':""}
function tagChips(){var c={};ITEMS.forEach(function(i){(i.tags||[]).forEach(function(t){c[t]=(c[t]||0)+1})});var k=Object.keys(c).sort();
 return k.length?'<p class="chips">'+k.map(function(t){return '<a class="tag" href="#/tag/'+encodeURIComponent(t)+'">'+esc(t)+' ('+c[t]+')</a>'}).join("")+'</p>':""}
function tagBrowse(){var h=tagChips();return h?'<details class="ctags"><summary>Browse by tag</summary>'+h+'</details>':""}
function tagPage(t){var l=ITEMS.filter(function(i){return(i.tags||[]).indexOf(t)>=0});
 app.innerHTML='<section><h2>Tag: '+esc(t)+'</h2><p><a href="#/catalog">Back to the catalog</a></p><div class="grid">'+(l.map(card).join("")||conW('<div class="empty">No items have that tag.</div>'))+'</div></section>'}
function daily(){if(!ITEMS.length)return "";var it=ITEMS[Math.floor(Date.now()/864e5)%ITEMS.length];return '<section><h2>Exhibit of the day</h2><div class="grid">'+card(it)+'</div></section>'}
function cmpSel(it){return ITEMS.length>1?'<p class="noprint"><label>Compare with <select id="cmp"><option value="">Choose an item</option>'+ITEMS.filter(function(x){return x!==it}).map(function(x){return '<option value="'+esc(x.id)+'">'+esc(x.name)+'</option>'}).join("")+'</select></label></p>':""}
function compare(x,y){var A=ITEMS.filter(function(i){return i.id===x})[0],B=ITEMS.filter(function(i){return i.id===y})[0];
 if(!A||!B){dlg("One of those items is not in the catalog.",'<a class="btn" href="#/catalog">Back to the catalog</a>');return}
 var r=[["Released","year"],["Maker","maker"],["Model","model"],["Original MSRP","msrp"]].map(function(f){return [f[0],A[f[1]],B[f[1]]]});
 r.push(["Score",A.score!=null?A.score+"K":"",B.score!=null?B.score+"K":""]);
 [["Type","type"],["Status","status"],["Condition","cond"],["Working","works"]].forEach(function(f){r.push([f[0],A[f[1]],B[f[1]]])});
 var ks=[];[A,B].forEach(function(i){Object.keys(i.specs||{}).forEach(function(k){if(ks.indexOf(k)<0)ks.push(k)})});
 ks.forEach(function(k){r.push([k,(A.specs||{})[k],(B.specs||{})[k]])});
 r=r.filter(function(v){return v[1]||v[2]});
 app.innerHTML='<section><p><a href="#/item/'+esc(A.id)+'">Back to '+esc(A.name)+'</a></p><h2>Compare</h2><p>Highlighted rows differ.</p><div class="scr"><div class="cmp cmph"><b></b><b>'+esc(A.name)+'</b><b>'+esc(B.name)+'</b></div>'
  +r.map(function(v){return '<div class="cmp'+(String(v[1]||"")!==String(v[2]||"")?" df":"")+'"><span>'+esc(v[0])+'</span><span>'+esc(v[1]||"none")+'</span><span>'+esc(v[2]||"none")+'</span></div>'}).join("")+'</div></section>'}
function outOf10(v){return (Math.round(v/64*10)/10).toFixed(1)}
function scoreBlock(v,t){t=t||tier(v);return '<div class="score"><div class="sbar" role="img" aria-label="'+v+'K of 640K free">'+SCALE.map(function(x,i){var hi=i<SCALE.length-1?SCALE[i+1].min:640,w=(hi-x.min)/640*100,f=v>=hi?100:v<=x.min?0:(v-x.min)/(hi-x.min)*100;return '<i style="width:'+w+'%"><b style="width:'+f+'%;background:'+x.c+'"></b></i>'}).join("")+'</div><p class="sline"><b>'+v+'K</b> of 640K free <span class="verdict" style="background:'+t.c+';color:'+inkOn(t.c)+'">'+esc(t.l)+'</span> <span class="tn">"'+esc(t.n)+'", about '+outOf10(v)+' out of 10</span></p><p>'+esc(t.d)+' <a href="#/scale">How the scale works</a></p></div>'}
function scale(){var h='<section><h2>The 640K scale</h2><p><b>How it works:</b> back in the DOS days your programs had to squeeze into 640K of "conventional memory". The more of it you had left free, the better your day went. Same idea here: every item gets a score from 0K to 640K, and <b>more free memory means a better item</b>.</p><p><b>Quick translation:</b> divide by 64 to get a score out of 10. So 320K is a 5 out of 10 and a full 640K is a perfect 10.</p><div class="sbar big" role="img" aria-label="The scale from 0K to 640K">'+SCALE.map(function(x,i){var hi=i<SCALE.length-1?SCALE[i+1].min:640;return '<i style="width:'+(hi-x.min)/640*100+'%"><b style="width:100%;background:'+x.c+'"></b></i>'}).join("")+'</div>';
 SCALE.slice().reverse().forEach(function(t){var i=SCALE.indexOf(t),hi=i<SCALE.length-1?SCALE[i+1].min-1:640;var l=ITEMS.filter(function(x){return x.score!=null&&tier(x.score)===t});
  h+='<div class="tier" style="border-left-color:'+t.c+'"><div class="tierh">'+(typeof px==="function"?px(["skull","bomb","ghost","bug","gear","coin","star","gem","trophy","crown"][i%10],20):"")+' <span class="verdict" style="background:'+t.c+';color:'+inkOn(t.c)+'">'+esc(t.l)+'</span> <b>'+t.min+'K to '+hi+'K</b> <span class="tn">about '+outOf10(t.min)+' to '+outOf10(hi)+' out of 10</span></div><p><b>"'+esc(t.n)+'"</b> '+esc(t.d)+'</p><small class="tn">'+(l.length?l.map(function(x){return '<a href="#/item/'+esc(x.id)+'">'+esc(x.name)+'</a> ('+x.score+'K)'}).join(", "):"No items yet")+'</small></div>'});
 app.innerHTML=h+'<p class="tn">The italic joke names under each verdict are real DOS moments: Format C: wiped a drive, Abort, Retry, Fail? was DOS\'s famously unhelpful error prompt, and LOADHIGH and EMM386 were how you clawed back free memory.</p></section>'}
function dos(it){return(it.name.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,8)||"ITEM")+".ITM"}
function dpath(it){return "C:\\MUSEUM\\"+(it.cat.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,8)||"MISC")+"\\"+dos(it)}
function dlg(msg,btns){app.innerHTML='<section><div class="dlg"><div class="tb">Error</div><p>'+msg+'</p><p>'+btns+'</p></div></section>'}
function dir(list){var t=" Volume in drive C is CONVMEM\n Directory of C:\\MUSEUM\n\n";
 list.forEach(function(i){t+='<a href="#/item/'+i.id+'">'+dos(i).padEnd(12)+'</a> '+(i.score!=null?String(i.score).padStart(4)+"K":"   --")+"  "+String(i.year||"").padEnd(5)+esc(i.name)+"\n"});
 return '<div class="scr"><pre class="dir">'+t+"\n   "+list.length+" file(s)</pre></div>"}
function mem(){var cats={};ITEMS.forEach(function(i){(cats[i.cat]=cats[i.cat]||[]).push(i)});
 function bar(v){var n=Math.round(v/640*10);return "\u2588".repeat(n)+"\u2591".repeat(10-n)}
 var t="Category".padEnd(14)+" "+"Items".padStart(5)+"  Average\n"+"-".repeat(38)+"\n";
 Object.keys(cats).sort().forEach(function(k){var l=cats[k].filter(function(i){return i.score!=null}),a=l.length?Math.round(l.reduce(function(x,i){return x+i.score},0)/l.length):null;
  t+=k.slice(0,14).padEnd(14)+" "+String(cats[k].length).padStart(5)+"  "+(a==null?"n/a":bar(a)+" "+a+"K")+"\n"});
 t+="-".repeat(38)+"\n"+"Total items".padEnd(14)+" "+String(ITEMS.length).padStart(5)+"\n"+"Free".padEnd(14)+" "+String(640-ITEMS.length).padStart(5)+"K of 640K\n";
 app.innerHTML='<section><h2>MEM /C</h2><p>The catalog laid out the way DOS listed memory: one row per category, with the average score as a bar.</p><div class="scr"><pre class="dir">'+esc(t)+'</pre></div></section>'}
var THEMES=[["","Default"],["green","Green phosphor"],["amber","Amber"],["ega","EGA blue"],["clean","Clean, no scanlines"]];
function lbl(b,l,v){b.innerHTML='<span class="bl">'+l+': </span>'+esc(v);b.setAttribute("aria-label",l+": "+v)}
function setMotion(on,save){var r=document.documentElement;r.setAttribute("data-motion",on?"on":"off");var b=document.getElementById("mo");if(b){lbl(b,"Motion",on?"on":"off");b.setAttribute("aria-pressed",on?"true":"false")}if(save)try{localStorage.setItem("cm-motion",on?"1":"0")}catch(e){}}
function initMotion(){var s=null;try{s=localStorage.getItem("cm-motion")}catch(e){}var on=s==null?!matchMedia("(prefers-reduced-motion: reduce)").matches:s==="1";setMotion(on,false);var b=document.getElementById("mo");if(b)b.onclick=function(){on=!on;setMotion(on,true)}}
var CRTM=[["off","off"],["on","CRT"],["max","max CRT"]];
function setCrt(i,save){var m=CRTM[i];document.documentElement.setAttribute("data-crt",m[0]);var b=document.getElementById("cr");if(b)lbl(b,"Screen",m[1]);if(save)try{localStorage.setItem("cm-crt",String(i))}catch(e){}}
function initCrt(){var i=1;try{var s=localStorage.getItem("cm-crt");if(s!=null&&CRTM[+s])i=+s}catch(e){}setCrt(i,false);var b=document.getElementById("cr");if(b)b.onclick=function(){i=(i+1)%CRTM.length;setCrt(i,true)}}
function setTheme(i){var t=THEMES[i],r=document.documentElement;if(t[0])r.setAttribute("data-theme",t[0]);else r.removeAttribute("data-theme");lbl(document.getElementById("th"),"Theme",t[1]);try{localStorage.setItem("cm-theme",i)}catch(e){}}
function boot(){
 try{if(sessionStorage.getItem("cm-boot")||matchMedia("(prefers-reduced-motion: reduce)").matches)return;sessionStorage.setItem("cm-boot","1")}catch(e){}
 var d=document.createElement("div"),m=0,t;d.className="boot";
 d.innerHTML='<pre>Conventional Memory BIOS v1.0\nCopyright (C) Conventional Memory LLC\n\n<span>Memory Test:    0K</span></pre><p>Press any key to skip</p>';
 document.body.appendChild(d);var el=d.querySelector("span"),pre=d.querySelector("pre");
 function done(){clearInterval(t);d.remove();document.removeEventListener("keydown",done)}
 t=setInterval(function(){m+=32;if(m>=640){clearInterval(t);el.textContent="Memory Test: 640K OK";pre.appendChild(document.createTextNode("\n"+ITEMS.length+" items found\nLoading catalog...\n\nYou are now entering the information superhighway!"));setTimeout(done,800)}else el.textContent="Memory Test: "+m+"K"},40);
 d.onclick=done;document.addEventListener("keydown",done)}
function check(){var seen={},rows=[],ok=0;
 ITEMS.forEach(function(i){var p=[];
  if(seen[i.id])p.push("duplicate id");seen[i.id]=1;
  if(!/^[a-z0-9-]+$/.test(i.id||""))p.push("id should use lowercase letters, numbers and dashes");
  if(!i.year)p.push("missing release year");
  if(!i.maker||i.maker==="Unknown")p.push("missing maker");
  if(i.score!=null&&(i.score<0||i.score>640))p.push("score outside 0 to 640");
  if(i.type&&!SPEC_TYPES[i.type])p.push("unknown type "+i.type);
  if(!(i.photos||[]).length)p.push("no photos");
  if(i.type!=="Other"&&!(i.specs&&Object.keys(i.specs).length))p.push("no specs");
  if(!i.wiki)p.push("no reference link");
  if(!i.got)p.push("no acquisition note");if(!i.works)p.push("working status not recorded");
  if(i.sample)p.push("still a sample entry");
  if(i.rel&&!/^\d{4}(-\d\d(-\d\d)?)$/.test(i.rel))p.push("release date should look like 1998, 1998-11 or 1998-11-03");
  if((i.log||[]).some(function(x){return !/^\d{4}-\d\d-\d\d$/.test(x.d||"")}))p.push("a changelog entry has a bad date (use YYYY-MM-DD)");
  if(p.length)rows.push('<div class="src"><b><a href="#/item/'+esc(i.id)+'">'+esc(i.name)+'</a></b> '+esc(i.acc)+', '+comp(i)+'% complete<br>'+esc(p.join(", "))+'</div>');else ok++});
 function q(v){return '"'+String(v==null?"":v).replace(/"/g,'""')+'"'}
 var cols=["acc","name","maker","model","year","rel","disc","cat","type","status","qty","msrp","cond","works","score","acquired"];
 var csv=[cols.join(",")].concat(ITEMS.map(function(i){return cols.map(function(c){return q(i[c])}).join(",")})).join("\n");
 app.innerHTML='<section class="bld"><h2>Data check</h2><p>'+ok+' of '+ITEMS.length+' items have nothing flagged.</p>'+rows.join("")+'<h3 class="sub">Export</h3><p>Copies the public catalog fields as CSV, ready for a spreadsheet.</p><textarea id="csv" readonly></textarea><p><button class="btn pri" id="cc" type="button">Copy CSV</button></p></section>';
 var ta=document.getElementById("csv");ta.value=csv;
 document.getElementById("cc").onclick=function(){try{navigator.clipboard.writeText(csv)}catch(e){ta.select();document.execCommand("copy")}}}
function contactHtml(){var m="mailto:"+EMAIL;
 return '<section><h2>Contact</h2><div class="ctc"><a class="mbox" href="'+m+'?subject=Hello%20from%20ConventionalMemory.io" aria-label="Email me"><svg viewBox="0 0 160 130" role="img" aria-hidden="true"><rect x="70" y="80" width="10" height="50" fill="#7a5a3a" stroke="#333" stroke-width="2"/><path d="M30 82V58Q30 30 75 30Q120 30 120 58V82Z" fill="#c9ced6" stroke="#333" stroke-width="3"/><rect x="42" y="62" width="66" height="8" fill="#333"/><g class="flag"><rect x="118" y="30" width="5" height="36" fill="#d22" stroke="#333" stroke-width="1.5"/><rect x="123" y="30" width="18" height="12" fill="#d22" stroke="#333" stroke-width="1.5"/></g></svg></a>'
 +'<div><p><b>You&rsquo;ve got mail!</b> Click the mailbox to write to me.</p><p><a href="'+m+'?subject=Guestbook">Sign my guestbook</a></p></div></div></section>'}
function nowHtml(){NOW=NOW.filter(function(n){return!n.sample});return NOW.length?'<section><h2>Now working on</h2>'+NOW.map(function(n){return '<div class="src"><b>'+(n.item?'<a href="#/item/'+esc(n.item)+'">'+esc(n.t)+'</a>':esc(n.t))+'</b><p>'+esc(n.note)+'</p></div>'}).join("")+'</section>':""}
function wanted(){var h='<section><h2>Wanted</h2><p>Items I am hunting for. If you have one to sell or donate, message me on any of my socials.</p>'+socials();
 h+=WANTED.filter(function(w){return!w.sample}).length?WANTED.filter(function(w){return!w.sample}).map(function(w){return '<div class="src"><b>'+esc(w.name)+'</b><span class="tag">'+esc(w.priority||"Wanted")+'</span>'+'<br>'+esc(w.type||"")+'<p>'+esc(w.note||"")+'</p></div>'}).join(""):'<div class="empty">Nothing on the list right now.</div>';
 var we=wantedExtras();if(we.length)h+='<h3 class="sub">Accessories and parts</h3>'+we.map(function(w){return '<div class="ex"><span class="tag want">'+w.s+'</span> '+esc(w.x.n)+' for <a href="#/item/'+esc(w.it.id)+'">'+esc(w.it.name)+'</a>'+(w.x.note?' <small class="tn">'+esc(w.x.note)+'</small>':'')+(typeof affInline==="function"?affInline(w.x.n+" "+w.it.name,""):"")+'</div>'}).join("")+(typeof affOn==="function"&&affOn()?'<p class="affd tn">'+esc(AFF_SHORT)+' <a href="#/disclosure">Details</a></p>':"");
 h+=tradeForm();app.innerHTML=h+'</section>';wireTrade()}
function nrm(t){return String(t||"").toLowerCase().replace(/[^a-z0-9 ]+/g," ").replace(/\s+/g," ").trim()}
function tradeCands(){var c=[];WANTED.filter(function(w){return!w.sample}).forEach(function(w){c.push({n:w.name,k:"wanted",pr:w.priority||"Wanted",note:w.note})});
 wantedExtras().forEach(function(w){c.push({n:w.x.n,k:"extra",pr:w.s,it:w.it,note:w.x.note})});return c}
function tradeMatch(q){q=nrm(q);if(q.length<3)return{w:[],have:[]};var qt=q.split(" ").filter(function(t){return t.length>1});
 function sc(n){n=nrm(n);if(!n)return 0;if(n.indexOf(q)>=0||q.indexOf(n)>=0)return 1;var nt=n.split(" ").filter(function(t){return t.length>1}),hit=nt.filter(function(t){return qt.indexOf(t)>=0}).length;return nt.length?hit/Math.max(nt.length,qt.length):0}
 var w=tradeCands().map(function(c){c.s=sc(c.n+(c.it?" "+c.it.name:""));return c}).filter(function(c){return c.s>=.5}).sort(function(a,b){return b.s-a.s});
 var have=ITEMS.filter(function(i){return sc(i.name)>=.6}).slice(0,3);return{w:w,have:have}}
function tradeForm(){return'<h3 class="sub">I have one</h3><div class="trd noprint"><p>Got something that might fit? Type what it is and I will tell you whether it is on the list, then build a message you can send to me on any of my socials. Nothing is sent from this page.</p>'
 +'<div class="two"><div><label for="td_w">What do you have?</label><input id="td_w" autocomplete="off" placeholder="for example: Sound Blaster 16"></div><div><label for="td_c">Condition</label><select id="td_c"><option>Working, tested</option><option>Working, untested</option><option>Not working / for parts</option><option>Complete in box</option></select></div>'
 +'<div><label for="td_o">Offer</label><select id="td_o"><option>Selling</option><option>Trading</option><option>Donating</option><option>Just letting you know</option></select></div><div><label for="td_p">Price or what you want in trade (optional)</label><input id="td_p" autocomplete="off"></div>'
 +'<div><label for="td_l">Where are you? (country or region, optional)</label><input id="td_l" autocomplete="off"></div></div><div id="td_r" aria-live="polite"></div></div>'}
function wireTrade(){var w=app.querySelector("#td_w");if(!w)return;var r=app.querySelector("#td_r"),ids=["td_w","td_c","td_o","td_p","td_l"];
 function msg(){var g=function(i){return app.querySelector("#"+i).value.trim()};var t="Hi! I saw the Wanted list on ConventionalMemory.io. I have: "+g("td_w")+" ("+g("td_c").toLowerCase()+").\nOffer: "+g("td_o").toLowerCase()+(g("td_p")?" - "+g("td_p"):"")+(g("td_l")?"\nLocation: "+g("td_l"):"")+"\nI can send photos. Interested?";return t}
 function draw(){var q=w.value,m=tradeMatch(q),h="";if(nrm(q).length<3){r.innerHTML="";return}
  if(m.w.length)h+='<div class="msg ok"><b>Yes, I am looking for that.</b> '+m.w.slice(0,3).map(function(c){return esc(c.n)+(c.it?' (for <a href="#/item/'+esc(c.it.id)+'">'+esc(c.it.name)+'</a>)':"")+' <span class="tag">'+esc(c.pr)+'</span>'}).join("; ")+'</div>';
  else h+='<p class="tn">It is not on the list right now, but I am always happy to hear about interesting finds.</p>';
  if(m.have.length)h+='<p class="tn">Already in the museum: '+m.have.map(function(i){return'<a href="#/item/'+esc(i.id)+'">'+esc(i.name)+'</a>'}).join(", ")+'. A second copy or a different revision is still interesting.</p>';
  h+='<label for="td_m">Message</label><textarea id="td_m" readonly style="min-height:110px">'+esc(msg())+'</textarea><p><button class="btn pri" id="td_cp" type="button">Copy message</button> '+SOCIALS.map(function(s){var u=safeUrl(s.u,"link");return u?'<a class="btn" href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">Open '+esc(s.n)+'</a>':""}).join(" ")+'</p><p class="tn" id="td_s"></p>';
  r.innerHTML=h;var cp=app.querySelector("#td_cp");cp.onclick=function(){var t=app.querySelector("#td_m").value,st=app.querySelector("#td_s");if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){st.textContent="Copied. Paste it into a message."},function(){st.textContent="Select the text above and copy it."});else st.textContent="Select the text above and copy it."}}
 ids.forEach(function(i){var e=app.querySelector("#"+i);e.oninput=e.onchange=draw})}
function pn(it){var i=ITEMS.indexOf(it),p=ITEMS[i-1],n=ITEMS[i+1],mid='<a class="pnc" href="#/catalog/cat/'+encodeURIComponent(it.cat)+'">All '+esc(it.cat)+'</a>';
 /* arrived from a catalog list: step through that list, and the middle link goes back to it */
 try{var L=JSON.parse(sessionStorage.getItem("cm-catlist")||"null"),k=L&&L.ids?L.ids.indexOf(it.id):-1;
  if(k>=0&&/^#\/catalog/.test(L.h||"")){var byId=function(id){return ITEMS.filter(function(x){return x.id===id})[0]};p=byId(L.ids[k-1]);n=byId(L.ids[k+1]);mid='<a class="pnc" href="'+esc(L.h)+'">Back to the list ('+(k+1)+' of '+L.ids.length+')</a>'}}catch(e){}
 return '<p class="pn"><span>'+(p?'<a href="#/item/'+p.id+'">&#9668; '+esc(p.name)+'</a>':"")+'</span>'+mid+'<span>'+(n?'<a href="#/item/'+n.id+'">'+esc(n.name)+' &#9658;</a>':"")+'</span></p>'}
function related(it){var r=ITEMS.filter(function(x){return x!==it&&(x.cat===it.cat||x.maker===it.maker)}).slice(0,3);
 return r.length?'<h3 class="sub">More like this</h3><div class="grid">'+r.map(card).join("")+'</div>':""}
function inkOn(h){var m=/^#?([0-9a-f]{6})$/i.exec(String(h||""));if(!m)return"#000";var n=parseInt(m[1],16),f=function(v){v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)},L=0.2126*f(n>>16&255)+0.7152*f(n>>8&255)+0.0722*f(n&255);return(L+0.05)/0.05>=1.05/(L+0.05)?"#000":"#fff"}
function tier(v){var t=SCALE[0];SCALE.forEach(function(x){if(v>=x.min)t=x});return t}
function tbl(rows){rows=rows.filter(function(r){return r[1]!==undefined&&r[1]!==null&&r[1]!==""});return rows.length?'<dl>'+rows.map(function(r){return '<dt>'+esc(r[0])+'</dt><dd>'+(r[1]&&r[1].h?r[1].h:esc(r[1]))+'</dd>'}).join("")+'</dl>':""}
function sec(t,body){return body?'<h3 class="sub">'+esc(t)+'</h3>'+body:""}
function comp(it){var f=[it.year,it.maker&&it.maker!=="Unknown",it.model,it.msrp,it.cond,it.works,it.got,it.acquired,it.specs&&Object.keys(it.specs).length,(it.photos||[]).length,it.wiki,it.score!=null,it.thoughts];return Math.round(f.filter(Boolean).length/f.length*100)}
function specSheet(it){var g=SPEC_TYPES[it.type]||{},sp=it.specs||{},used={},h="";
 Object.keys(g).forEach(function(n){var b=sec(n,tbl(g[n].filter(function(k){return sp[k]}).map(function(k){used[k]=1;return [k,sp[k]]})));if(b)h+='<div class="spg">'+b+'</div>'});
 var ob=sec(Object.keys(g).length?"Other specs":"Specs",tbl(Object.keys(sp).filter(function(k){return !used[k]}).map(function(k){return [k,sp[k]]})));if(ob)h+='<div class="spg">'+ob+'</div>';return h?'<div class="specgrid">'+h+'</div>':""}
function factGrid(rows){rows=rows.filter(function(r){return r[1]!==undefined&&r[1]!==null&&r[1]!==""});return rows.length?'<div class="facts">'+rows.map(function(r){return'<div class="fcard"><small>'+esc(r[0])+'</small><b>'+(r[1]&&r[1].h?r[1].h:esc(r[1]))+'</b></div>'}).join("")+'</div>':""}
function clampP(t){t=String(t||"");if(!t)return"";return t.length>260?'<div class="rm"><p>'+esc(t)+'</p><button class="btn rmb" type="button" aria-expanded="false">Read more</button></div>':'<p>'+esc(t)+'</p>'}
function unitsSec(it){var u=it.units||[];if(u.length<2)return"";return sec("My "+u.length+" copies",'<div class="units">'+u.map(function(x,i){var b=x.src&&SRCN[x.src]?'<span class="srcb srcb-'+x.src+'"><b>'+esc(SRCN[x.src])+'</b></span>':"";return'<div class="unit"><b>Copy '+(i+1)+'</b> '+b+(x.works?' <span class="tag">'+esc(x.works)+'</span>':"")+(x.cond?'<p>'+esc(x.cond)+'</p>':"")+(x.note?'<p class="tn">'+esc(x.note)+'</p>':"")+'</div>'}).join("")+'</div>')}
function wikiMore(it){var w=it.wiki;if(!w)return"";var h="",f=w.facts?Object.keys(w.facts):[];
 if(f.length)h+='<dl class="wfacts">'+f.map(function(k){return'<dt>'+esc(k)+'</dt><dd>'+esc(w.facts[k])+'</dd>'}).join("")+'</dl>';
 (w.sections||[]).forEach(function(x,i){h+='<details class="wsec"'+(i===0?" open":"")+'><summary>'+esc(x.h)+'</summary>'+String(x.t).split(/\n{2,}/).map(function(p){return'<p>'+esc(p)+'</p>'}).join("")+'</details>'});
 if((w.see||[]).length)h+='<p class="wsee"><b>See also on Wikipedia:</b> '+w.see.map(function(t){return'<a href="https://en.wikipedia.org/wiki/'+encodeURIComponent(String(t).replace(/ /g,"_"))+'" target="_blank" rel="noopener noreferrer">'+esc(t)+'</a>'}).join(" &middot; ")+'</p>';
 return h?sec("From the Wikipedia article",h+'<small class="tn">Text from Wikipedia, licensed CC BY-SA 4.0. Condensed from the article, which has the full history and references.</small>'):""}
function tlMatch(it){return typeof tlRowOfItem==="function"?tlRowOfItem(it):null}
function connSec(it){var r=tlMatch(it);if(!r||typeof tlLinks!=="function")return"";var l=tlLinks(r[2]);if(!l.length)return"";
 var own=l.filter(function(x){return tlOwn(x[0])}),miss=l.filter(function(x){return!tlOwn(x[0])});
 return sec("Connections on the timeline",'<div class="tle-web">'+tlWeb(r[2],l)+'<p class="tn">Click a box to see it on the timeline. A star means that piece is in the museum too.</p></div>'
  +'<p><b>'+own.length+' of '+l.length+'</b> connected pieces are in the museum'+(own.length?': '+own.map(function(x){return'<a href="#/item/'+esc(tlOwn(x[0]).id)+'">'+esc(x[0])+'</a>'}).join(", "):"")+'.</p>'
  +(miss.length?'<p class="tn">Not here yet: '+miss.slice(0,8).map(function(x){return'<a href="#/timeline" data-tl="'+esc(x[0])+'">'+esc(x[0])+'</a> <small>('+esc(x[1])+')</small>'}).join(", ")+'</p>':""))}
function heroStrip(it){var t=tier(it.score);
 function b(ic,l,v,st){return v?'<span class="ib"'+(st?' style="'+st+'"':"")+'>'+(typeof px==="function"?px(ic,16):"")+'<small>'+esc(l)+'</small><b>'+esc(v)+'</b></span>':""}
 var bd=(it.cm?'<span class="ib" title="Permanent museum label number"><small>Label</small><b>'+esc(tagNo(it))+'</b></span>':"")+b("clock","Released",it.rel?fmtDate(it.rel)+(it.relx?"*":""):it.year)+(it.maker&&it.maker!=="Unknown"?'<a class="ib" href="#/maker/'+encodeURIComponent(it.maker)+'" title="See everything from this maker">'+(typeof px==="function"?px("gear",16):"")+'<small>Maker</small><b>'+esc(it.maker)+'</b></a>':b("gear","Maker",it.maker))+b("coin",/^(free|shareware|included|open source|bundled)/i.test(it.msrp||"")?"Price":"MSRP",it.msrp)+(it.score!=null?b("trophy","Score",it.score+"K, "+t.l,"background:"+t.c+";color:"+inkOn(t.c)+";border-color:"+t.c):"")+b("bolt","Working",it.works)+b("shield","Status",it.status)+b("flag","Type",it.type);
 var y=+it.year,row=y?TL.filter(function(r){return dyear(r[0])===y&&/^(hw|sw|gt|m|pe)$/.test(r[1])&&r[2]!==it.name}):[];
 row=row.sort(function(p,q){return hstr(p[2])-hstr(q[2])}).slice(0,6).sort(function(p,q){return p[0]<q[0]?-1:1});
 var strip=row.length?'<div class="ihs" aria-label="Also in '+y+'"><b>Also in '+y+'</b>'+row.map(function(r){return'<a href="#/timeline/'+y+'/'+encodeURIComponent(r[2])+'" title="'+esc(r[2])+'">'+(typeof pxRow==="function"?pxRow(r,16):"")+'<span>'+esc(r[2])+'</span>'+(r[0].length>4?'<small>'+MON[+r[0].slice(5,7)-1]+'</small>':"")+'</a>'}).join("")+'<a class="btn" href="#/timeline/'+y+'">All of '+y+'</a></div>':"";
 var vds=(it.videos||[]).map(function(v,vi){var u=safeUrl(v.u,"link");if(u&&ytIdOf(v.u)&&vi===0)return'<button type="button" class="btn pri" data-gotab="video">&#9654; Watch: '+esc(v.t)+((v.c||[]).length?' ('+v.c.length+' chapters)':'')+'</button>';return u?'<a class="btn pri" href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">&#9654; '+esc(v.t)+'</a>':""}).join(" ");
 return'<header class="ihero"><div class="tb">'+esc(dpath(it))+'</div><h2>'+esc(it.name)+'</h2><div class="ibs">'+bd+'</div>'+(vds?'<p class="watch"><b>Featured in video:</b> '+vds+'</p>':"")+strip+'</header>'}
var CURIT=null;function folder(it,p){CURIT=it;var tabs=[];var TI={about:"bulb",specs:"chip",mine:"box",era:"clock",ad:"star",history:"floppy",links:"globe",video:"tv"};function tab(id,label,html,n){if(html&&String(html).replace(/<[^>]*>/g,"").trim())tabs.push({id:id,label:label,html:html,n:n})}
 var nsp=Object.keys(it.specs||{}).length,refs=(it.refs||[]).length?sec("Sources",'<ul class="refs">'+it.refs.map(function(r){var u=safeUrl(r.u,"link");return u?'<li><a href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">'+esc(r.t)+'</a></li>':""}).join("")+'</ul>'):"";
 tab("about","About",'<div class="abt"><div class="abl">'+p.photo+'</div><div class="abr">'+cmpSel(it)+(it.src||it.units?'<p class="srcrow">'+srcBadge(it,true)+'</p>':'')+p.sc+(it.story?'<div class="story"><b>The story</b>'+clampP(it.story)+'</div>':"")+clampP(it.text)+(it.thoughts?'<div class="take"><b>My take</b>'+clampP(it.thoughts)+'</div>':"")+sec("At a glance",p.ident)+p.wx+'</div></div>');
 tab("specs","Specs",specSheet(it)+((it.bench||[]).length?'<div class="spg"><h3 class="sub">Benchmarks</h3><div id="benchslot">Loading benchmark results...</div></div>':""),nsp||"");
 tab("video","Video",videoPane(it),(it.videos||[]).length||"");
 tab("era","Era and ad",eraPane(it)+(adPane(it)?sec("The ad",adPane(it)):""));
 tab("history","My copy and history",unitsSec(it)+sec("Collection record",p.coll)+exSec(it)+withSec(it)+(it.notes?sec("Repairs and mods",clampP(it.notes)):"")+logSec(it)+connSec(it)+(typeof gxItemSec==="function"?gxItemSec(it):""));
 tab("links","Links",p.media+p.src+refs+(typeof docSec==="function"?docSec([it.id,it.name],it.name,it.maker):""));
 var cur="about";try{cur=sessionStorage.getItem("cm-itab")||"about"}catch(e){}cur=cur==="mine"?"history":cur==="ad"?"era":cur;if(!tabs.some(function(t){return t.id===cur}))cur=tabs.length?tabs[0].id:"";
 return'<div class="folder" data-cur="'+cur+'"><div class="ftabs noprint" role="tablist" aria-label="Sections">'+tabs.map(function(t,i){return'<button type="button" role="tab" class="ftab'+(t.id===cur?' on':'')+'" data-tab="'+t.id+'" aria-selected="'+(t.id===cur)+'"><b>'+(i+1)+'</b><span>'+(typeof px==="function"&&TI[t.id]?px(TI[t.id],14):"")+t.label+(t.n?' <i>'+t.n+'</i>':'')+'</span></button>'}).join("")+'</div>'+tabs.map(function(t){return'<div class="pane" role="tabpanel" data-pane="'+t.id+'" data-label="'+t.label+'"'+(t.id===cur?'':' hidden')+'>'+t.html+'</div>'}).join("")+'</div>'}
function wireFolder(){var f=app.querySelector(".folder");if(!f)return;var tabs=[].slice.call(f.querySelectorAll(".ftab"));
 function go(id){tabs.forEach(function(b){var on=b.dataset.tab===id;b.classList.toggle("on",on);b.setAttribute("aria-selected",on)});f.querySelectorAll(".pane").forEach(function(p){p.hidden=p.dataset.pane!==id});try{sessionStorage.setItem("cm-itab",id)}catch(e){}var on=f.querySelector(".ftab.on"),tb=f.querySelector(".ftabs");if(on&&tb&&tb.scrollWidth>tb.clientWidth)tb.scrollLeft=Math.max(0,on.offsetLeft-24)}
 app.querySelectorAll("[data-gotab]").forEach(function(b){b.onclick=function(){if(tabs.some(function(t){return t.dataset.tab===b.dataset.gotab})){go(b.dataset.gotab);f.scrollIntoView({block:"start"})}}});
 var bs=document.getElementById("benchslot");if(bs){var it0=CURIT;function fill(){bs.innerHTML=it0&&window.benchSec?benchSec(it0).replace(/<h3 class="sub">Benchmarks<\/h3>/,""):""}if(window.benchSec)fill();else{var sc=document.createElement("script");sc.src="lab.js";sc.onload=fill;sc.onerror=function(){bs.textContent="Benchmarks could not be loaded."};document.body.appendChild(sc)}}
 f.addEventListener("click",function(e){var p=e.target.closest(".vp[data-yt]");if(!p)return;var pl=e.target.closest(".vplay"),ch=e.target.closest("[data-s]");if(!pl&&!ch)return;var st=ch?+ch.dataset.s:0;p.querySelector(".vf").innerHTML='<iframe title="Video player" src="https://www.youtube-nocookie.com/embed/'+p.dataset.yt+'?rel=0&autoplay=1&start='+st+'" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>'});
 tabs.forEach(function(b,i){b.onclick=function(){go(b.dataset.tab)};b.onkeydown=function(e){var n=e.key==="ArrowRight"?1:e.key==="ArrowLeft"?-1:0;if(n){e.preventDefault();var t=tabs[(i+n+tabs.length)%tabs.length];t.focus();go(t.dataset.tab)}}});
 f.querySelectorAll(".esw").forEach(function(sw){sw.onclick=function(e){var b=e.target.closest("[data-ep]");if(!b)return;var w=sw.parentNode;sw.querySelectorAll("[data-ep]").forEach(function(x){var on=x===b;x.classList.toggle("on",on);x.setAttribute("aria-selected",on)});w.querySelectorAll(".ep").forEach(function(x){x.hidden=x.dataset.ep!==b.dataset.ep})}});
 f.querySelectorAll(".rmb").forEach(function(b){b.onclick=function(){var d=b.parentNode,o=d.classList.toggle("open");b.textContent=o?"Show less":"Read more";b.setAttribute("aria-expanded",o)}});
 window.CMFK=function(e){if(!document.querySelector(".folder")||/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)||e.ctrlKey||e.metaKey||e.altKey)return;var n=+e.key;if(n>=1&&n<=tabs.length){go(tabs[n-1].dataset.tab)}};
 if(!window.CMFKon){window.CMFKon=1;document.addEventListener("keydown",function(e){if(window.CMFK)window.CMFK(e)})}}
function wireSheet(it){var cs=app.querySelector(".cs");if(!cs)return;var hero=document.getElementById("hero"),cap=document.getElementById("pcw"),ph=it.photos||[];
 function show(i){var u=safeUrl(ph[i],"img");if(!u)return;hero.innerHTML='<img src="'+esc(u)+'" alt="'+esc(it.name)+'">';cs.querySelectorAll(".csb").forEach(function(b,k){b.classList.toggle("on",k===i)});var m=(it.photoMeta||{})[ph[i]],k=phKind(it,ph[i]);cap.textContent=k==="stock"?"Stock photo. "+((m&&m.c)||"Via Wikimedia"):"My photo"}
 cs.querySelectorAll(".csb").forEach(function(b){b.onclick=function(){show(+b.dataset.ph)}})}
function shareCard(it){
 var W=1200,H=630,old=document.getElementById("shr");if(old)old.remove();
 function wrap(c,t,x,y,mw,lh,max){var w=String(t).split(/\s+/),l="",n=0;for(var i=0;i<w.length;i++){var tt=l?l+" "+w[i]:w[i];if(c.measureText(tt).width>mw&&l){c.fillText(l,x,y);y+=lh;n++;l=w[i];if(n>=max-1){var r=w.slice(i).join(" ");while(c.measureText(r+"\u2026").width>mw&&r.length>1)r=r.slice(0,-1);c.fillText(r+(i<w.length-1||c.measureText(r).width>=mw?"\u2026":""),x,y);return y}}else l=tt}c.fillText(l,x,y);return y}
 function draw(img){var cv=document.createElement("canvas");cv.width=W;cv.height=H;var c=cv.getContext("2d");
  c.fillStyle="#0000aa";c.fillRect(0,0,W,H);c.fillStyle="#c0c0c0";c.fillRect(24,24,W-48,H-48);c.fillStyle="#000080";c.fillRect(24,24,W-48,46);
  c.fillStyle="#fff";c.font="bold 28px 'Courier New',monospace";c.textBaseline="middle";c.fillText("C:\\MUSEUM\\"+String(it.cat||"").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,8)+"\\"+(it.id||"").slice(0,12).toUpperCase().replace(/[^A-Z0-9]/g,"")+".ITM",44,47);
  c.fillStyle="#000";c.fillRect(50,98,500,400);if(img){var r=Math.max(496/img.width,396/img.height),dw=img.width*r,dh=img.height*r;c.save();c.beginPath();c.rect(52,100,496,396);c.clip();c.drawImage(img,52+(496-dw)/2,100+(396-dh)/2,dw,dh);c.restore()}else{c.fillStyle="#222";c.fillRect(52,100,496,396);c.fillStyle="#888";c.font="40px 'Courier New',monospace";c.textAlign="center";c.fillText("no photo yet",300,298);c.textAlign="left"}
  c.fillStyle="#000";c.textBaseline="alphabetic";c.font="bold 54px 'Courier New',monospace";var y=wrap(c,it.name,590,150,560,60,3);
  c.fillStyle="#333";c.font="30px 'Courier New',monospace";y+=48;var meta=[it.maker,it.year,it.cat].filter(Boolean).join("  \u00b7  ");wrap(c,meta,590,y,560,36,2);
  if(it.score!=null){var t=tier(it.score);c.fillStyle="#fff";c.fillRect(590,400,560,24);c.strokeStyle="#000";c.lineWidth=3;c.strokeRect(590,400,560,24);c.fillStyle=t.c;c.fillRect(592,402,556*it.score/640,20);c.fillStyle="#000";c.font="bold 40px 'Courier New',monospace";c.fillText(it.score+"K of 640K  "+t.l,590,462)}
  c.fillStyle="#000080";c.font="bold 30px 'Courier New',monospace";c.fillText("ConventionalMemory.io",590,540);c.fillStyle="#333";c.font="22px 'Courier New',monospace";c.fillText("A retro computing museum",590,570);return cv}
 function show(cv){var url;try{url=cv.toDataURL("image/png")}catch(e){return false}
  var d=document.createElement("div");d.id="shr";d.className="shr";d.setAttribute("role","dialog");d.setAttribute("aria-label","Share card");
  d.innerHTML='<div class="shb"><img alt="Share card for '+esc(it.name)+'" src="'+url+'"><p class="shbt"><button class="btn pri" id="shd" type="button">Download PNG</button> <button class="btn" id="shs" type="button" hidden>Share</button> <button class="btn" id="shl" type="button">Copy link</button> <button class="btn" id="shx" type="button">Close</button></p><p class="tn" id="shm" role="status"></p></div>';
  document.body.appendChild(d);var link=location.origin+location.pathname+"#/item/"+it.id,m=d.querySelector("#shm");
  function close(){d.remove();document.removeEventListener("keydown",esc2);window.removeEventListener("hashchange",close)}window.addEventListener("hashchange",close);function esc2(e){if(e.key==="Escape")close()}document.addEventListener("keydown",esc2);
  d.onclick=function(e){if(e.target===d)close()};d.querySelector("#shx").onclick=close;d.querySelector("#shx").focus();
  d.querySelector("#shd").onclick=function(){var a=document.createElement("a");a.href=url;a.download=(it.id||"item")+"-card.png";document.body.appendChild(a);a.click();a.remove()};
  d.querySelector("#shl").onclick=function(){if(navigator.clipboard)navigator.clipboard.writeText(link).then(function(){m.textContent="Link copied."},function(){m.textContent=link});else m.textContent=link};
  if(navigator.share&&navigator.canShare){cv.toBlob(function(b){if(!b)return;var f=new File([b],(it.id||"item")+"-card.png",{type:"image/png"});if(navigator.canShare({files:[f]})){var s=d.querySelector("#shs");s.hidden=false;s.onclick=function(){navigator.share({files:[f],title:it.name,url:link}).catch(function(){})}}})}
  return true}
 var u=it.photos&&it.photos.length?safeUrl(it.photos[0],"img"):"",svg=document.querySelector(".abl .ph svg");
 function tryImg(src,cors,next){var im=new Image();if(cors)im.crossOrigin="anonymous";im.onload=function(){var cv=draw(im);if(!show(cv))next()};im.onerror=next;im.src=src}
 function plain(){show(draw(null))}
 function viaSvg(){if(!svg)return plain();var x=new XMLSerializer().serializeToString(svg);if(!/xmlns=/.test(x))x=x.replace("<svg",'<svg xmlns="http://www.w3.org/2000/svg"');tryImg("data:image/svg+xml;charset=utf-8,"+encodeURIComponent(x),false,plain)}
 if(u)tryImg(u,!/^data:/.test(u),viaSvg);else viaSvg()}
function item(id){
 var it=ITEMS.filter(function(i){return i.id===id})[0];
 if(!it){dlg("Item not found reading drive C.<br>Abort, Retry, Fail?",'<a class="btn" href="#/">Abort</a> <button class="btn" id="rt" type="button">Retry</button> <a class="btn" href="#/catalog">Fail</a>');document.getElementById("rt").onclick=route;return}
 var ph=it.photos||[],vd=it.videos||[],au=it.audio||[],w=it.wiki;
 var pcap=function(x){var m=(it.photoMeta||{})[x],k=phKind(it,x);return'<small class="pcr">'+(k==="stock"?"Stock photo. "+esc((m&&m.c)||"Via Wikimedia"):"My photo")+'</small>'};
 var gal=ph.length>1?'<div class="gal">'+ph.slice(1).map(function(x){var u=safeUrl(x,"img");return u?'<figure style="margin:0"><div class="ph"><img src="'+esc(u)+'" alt="'+esc(it.name)+' photo" loading="lazy"></div>'+pcap(x)+'</figure>':""}).join("")+'</div>':"";
 var sheet=ph.length>1?'<div class="cs" role="group" aria-label="Photos">'+ph.map(function(x,i){var u=safeUrl(x,"img");return u?'<button type="button" class="csb'+(i===0?' on':'')+'" data-ph="'+i+'" aria-label="Photo '+(i+1)+'"><img src="'+esc(u)+'" alt="" loading="lazy"></button>':""}).join("")+'</div><p class="tn pcw" id="pcw"></p>':"";
 var heroC=ph.length&&phKind(it,ph[0])==="stock"?((it.photoMeta||{})[ph[0]]||{}).c:"";
 var media="";
 if(vd.length)media+=sec("Videos",'<p>'+vd.map(function(v){var u=safeUrl(v.u,"link");return u?'<a class="btn pri" href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">'+esc(v.t)+'</a> ':""}).join("")+'</p>');
 if(au.length)media+=sec("Audio",au.map(function(a){var u=safeUrl(a.src,"audio");return u?'<div class="aud"><span>'+esc(a.t)+'</span><audio controls preload="none" src="'+esc(u)+'"></audio></div>':""}).join(""));
 if(!vd.length&&!au.length)media='<p class="empty">No videos or audio linked yet.</p>';
 if(it.links&&it.links.length)media+=sec("Manuals and references",'<p>'+it.links.map(function(l){var u=safeUrl(l.u,"link");return u?'<a href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">'+esc(l.t)+'</a>':esc(l.t)}).join("<br>")+'</p>');
 var t=tier(it.score),sc=it.score!=null?scoreBlock(it.score,t):"";
 var wu=w?safeUrl(w.u,"link"):"";
 var wx=wikiMore(it);var src=w?'<div class="src"><b>From Wikipedia: '+esc(w.t)+'</b>'+(w.summary?'<p>'+esc(w.summary)+'</p>':'')+(wu?'<a href="'+esc(wu)+'" target="_blank" rel="noopener noreferrer">Read the full article</a>':'')+(w.summary?'<small>Summary text from Wikipedia, licensed CC BY-SA.</small>':'')+'</div>':"";
 var ident=factGrid([["Maker",it.maker],["Model",it.model],["Part number",it.partno],["Revision",it.rev],["Barcode",it.upc],["Released",(it.rel?fmtDate(it.rel):(it.year||""))+(it.rel&&it.relx?"*":"")],["Discontinued",it.disc],["Original MSRP",it.msrp],["Made in",it.country],["Date code",it.made],["Category",it.cat],["Type",it.type]]);
 var coll=factGrid([["Accession",it.acc],["Status",it.status?it.status+(it.qty>1?", quantity "+it.qty:""):""],["Condition",it.cond],["Working",it.works],["Includes",(it.has||[]).join(", ")],["Acquired",it.acquired],["Last changed",logsOf(it)[0]?fmtDate(logsOf(it)[0].d):""],["Where I got it",it.got],["Timeline entry",it.tl?{h:'<a href="#/timeline" data-tl="'+esc(it.tl)+'">'+esc(it.tl)+'</a>'+((it.tlShared||[]).length?' <small class="tn">(shares '+esc(it.tlShared.join(", "))+')</small>':"")}:""],["Bought on",it.src?{h:srcBadge(it,true)}:""],["Tags",(it.tags||[]).length?{h:it.tags.map(function(t){return '<a href="#/tag/'+encodeURIComponent(t)+'">'+esc(t)+'</a>'}).join(", ")}:""],["Record complete",comp(it)+"%"]]);
 var photo='<div class="ph">'+pic(it)+'</div>'+gal+((it.credit||heroC)?'<small style="color:var(--mute)">'+esc(it.credit||heroC)+'</small>':(!(it.photos||[]).length&&wimg(it)?'<small style="color:var(--mute)">Image via Wikipedia. Check the article page for its license.</small>':(!(it.photos||[]).length&&typeof cimgCredit==="function"?cimgCredit(it.name):'')));
 app.innerHTML='<section class="itempage">'+pn(it)+heroStrip(it)
  +'<p class="iact noprint"><a class="btn" href="#/mine/own/i:'+esc(it.id)+'">Add to my collection</a>'+(it.cm&&isStaff()?' <a class="btn" href="#/labels/'+esc(it.id)+'">Print label</a>':"")+' <button class="btn" id="wishb" type="button" aria-pressed="'+wishHas("i:"+it.id)+'">'+(wishHas("i:"+it.id)?"On my wish list":"Add to wish list")+'</button> <a class="btn" href="#/shorts/'+esc(it.id)+'">Shorts mode</a> <a class="btn" href="#/community/fix/'+esc(it.id)+'">Suggest a correction</a> <button class="btn" id="shc" type="button">Share card</button> <button class="btn" id="prt" type="button">Print spec sheet</button></p>'
  +folder(it,{sc:sc,wx:wx,src:src,media:media,ident:ident,coll:coll,photo:photo})+related(it)+'</section>';
 app.querySelectorAll("[data-tl]").forEach(function(n){n.onclick=function(e){e.preventDefault();var t=n.dataset.tl,r=TL.filter(function(z){return z[2]===t})[0];if(r){window.TLJUMP=t;location.hash="#/timeline/"+dyear(r[0])}}});
 app.querySelectorAll(".tlnode").forEach(function(n){var go=function(){var t=n.dataset.go,r=TL.filter(function(z){return z[2]===t})[0];if(r){window.TLJUMP=t;location.hash="#/timeline/"+dyear(r[0])}};n.onclick=go;n.onkeydown=function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();go()}}});
 wireFolder();wireSheet(it);
 var sb=document.getElementById("shc");if(sb)sb.onclick=function(){shareCard(it)};var pb=document.getElementById("prt");if(pb)pb.onclick=function(){window.print()};
 var wb=document.getElementById("wishb");if(wb)wb.onclick=function(){var on=wishToggle("i:"+it.id);wb.setAttribute("aria-pressed",on);wb.textContent=on?"On my wish list":"Add to wish list"};
 var cs=document.getElementById("cmp");if(cs)cs.onchange=function(){if(cs.value)location.hash="#/compare/"+it.id+"/"+cs.value};
 var ah=app.querySelector(".adh");if(ah){var hi=0;ah.onclick=function(){var k=prodKind(it),hd=AD_HEAD[k]||AD_HEAD.box,z=app.querySelector(".cz-h");hi=(hi||hstr(it.name)%hd.length)+1;if(z)z.textContent=hd[hi%hd.length]}}
 app.querySelectorAll(".dl .ph img").forEach(function(im){im.onclick=function(){var d=document.createElement("div");d.className="lb";var i2=document.createElement("img");i2.src=im.src;i2.alt="";d.appendChild(i2);d.onclick=function(){d.remove()};document.body.appendChild(d)}})}
function stats(){
 var n=ITEMS.length,q=0,tot=0,mk={},dec={},st={},wk={},cd={};
 ITEMS.forEach(function(i){var c=i.qty||1;q+=c;var m=String(i.msrp||"").match(/\$\s?([\d,]+(?:\.\d+)?)/);if(m)tot+=parseFloat(m[1].replace(/,/g,""))*c;
  mk[i.maker]=(mk[i.maker]||0)+1;var d=i.year?Math.floor(i.year/10)*10+"s":"Unknown";dec[d]=(dec[d]||0)+1;
  if(i.status)st[i.status]=(st[i.status]||0)+1;if(i.works)wk[i.works]=(wk[i.works]||0)+1;if(i.cond)cd[i.cond]=(cd[i.cond]||0)+1});
 function bars(o,sort){var k=Object.keys(o);if(sort)k.sort(function(a,b){return o[b]-o[a]});else k.sort();var mx=Math.max.apply(null,k.map(function(x){return o[x]}));
  return k.length?k.slice(0,8).map(function(x){return '<div class="br"><span>'+esc(x)+'</span><i style="width:'+(o[x]/mx*100)+'%"></i><b>'+o[x]+'</b></div>'}).join(""):'<p class="empty">Nothing recorded yet.</p>'}
 function pct(f){return n?Math.round(ITEMS.filter(f).length/n*100)+"%":"0%"}
 app.innerHTML='<section><h2>The numbers</h2><div class="stats"><div><b>'+n+'</b>catalog entries</div><div><b>'+q+'</b>total pieces</div><div><b>'+(tot?"$"+Math.round(tot).toLocaleString("en-US"):"none")+'</b>original retail value, in dollars as priced</div><div><b>'+pct(function(i){return(i.photos||[]).length})+'</b>have photos</div><div><b>'+pct(function(i){return i.specs&&Object.keys(i.specs).length})+'</b>have specs</div><div><b>'+pct(function(i){return i.score!=null})+'</b>scored</div><div><b>'+wantedExtras().length+'</b>accessories still wanted</div><div><b>'+ITEMS.filter(function(i){var c=(i.extras||[]).filter(function(x){return exStat(x)!=="Optional"});return c.length&&c.every(function(x){return exStat(x)==="Have"})}).length+'</b>complete sets</div><div><b>'+allLogs().length+'</b>changelog entries</div></div>'
 +sec("By decade",bars(dec,false))+sec("Top makers",bars(mk,true))+sec("By status",bars(st,true))+sec("Working status",bars(wk,true))+sec("Condition",bars(cd,true))+'</section>'}
function follow(){app.innerHTML='<section><h2>Follow @'+HANDLE+'</h2><p>New items and videos go up on all four platforms.</p>'+socials()+'</section>'+contactHtml()}
function loadAdmin(){if(window.CMAdmin){window.CMApp={TL:TL,TLX:typeof TLX!=="undefined"?TLX:{},ITEMS:ITEMS,SPEC_TYPES:SPEC_TYPES,ACC_HINTS:ACC_HINTS,EXST:EXST,LOGTYPES:LOGTYPES,REPO:REPO,esc:esc,safeUrl:safeUrl,today:today,prep:prepItems,fmtDate:fmtDate,pic:pic};CMAdmin.mount(app,window.CMApp);return}
 app.innerHTML='<section><h2>Admin</h2><p>Loading the admin tools.</p></section>';var sc=document.createElement("script");sc.src="admin.js";sc.onload=function(){route()};sc.onerror=function(){app.innerHTML='<section><h2>Admin</h2><p class="empty">The admin tools could not be loaded. Try again in a moment.</p></section>'};document.head.appendChild(sc)}
function loadMore(page,args){if(window.CMMore){CMMore.mount(app,page,args);return}
 app.innerHTML='<section><h2>Loading</h2><p>One moment.</p></section>';var sc=document.createElement("script");sc.src="more.js";sc.onload=function(){route()};sc.onerror=function(){app.innerHTML='<section><h2>Oops</h2><p class="empty">That page could not be loaded. Try again in a moment.</p></section>'};document.head.appendChild(sc)}
function loadLab(page,args){if(window.CMLab){CMLab.mount(app,page,args);return}
 app.innerHTML='<section><h2>Loading</h2><p>One moment.</p></section>';var sc=document.createElement("script");sc.src="lab.js";sc.onload=function(){route()};sc.onerror=function(){app.innerHTML='<section><h2>Oops</h2><p class="empty">That page could not be loaded. Try again in a moment.</p></section>'};document.head.appendChild(sc)}
function loadToys(page,args){if(window.CMToys){CMToys.mount(app,page,args);return}
 app.innerHTML='<section><h2>Loading</h2><p>One moment.</p></section>';var sc=document.createElement("script");sc.src="toys.js";sc.onload=function(){route()};sc.onerror=function(){app.innerHTML='<section><h2>Oops</h2><p class="empty">That page could not be loaded. Try again in a moment.</p></section>'};document.head.appendChild(sc)}
function loadConnie(page,args){if(window.CMConnie){CMConnie.mount(app,page,args);return}
 app.innerHTML='<section><h2>Loading</h2><p>One moment.</p></section>';var sc=document.createElement("script");sc.src="connie.js";sc.onload=function(){route()};sc.onerror=function(){app.innerHTML='<section><h2>Oops</h2><p class="empty">That page could not be loaded. Try again in a moment.</p></section>'};document.head.appendChild(sc)}
function loadPlay(page,args){if(window.CMPlay){CMPlay.mount(app,page,args);return}
 app.innerHTML='<section><h2>Play</h2><p>Loading.</p></section>';var sc=document.createElement("script");sc.src="play.js";sc.onload=function(){route()};sc.onerror=function(){app.innerHTML='<section><h2>Play</h2><p class="empty">The games could not be loaded. Try again in a moment.</p></section>'};document.head.appendChild(sc)}
/* Staff-only tools (labels, scanning, buying tools, post cards, data checks). They are not part of the public museum:
   they stay out of the menus and only open on a device where the admin has been unlocked once (the "cm-admin" flag).
   This is tidiness, not security: nothing private is in these pages, and saving always needs the GitHub token. */
var STAFF_RE=/^(staff|labels|scan|hunt|advisor|today|check|styleguide)$/;
function isStaff(){try{return localStorage.getItem("cm-admin")==="1"}catch(e){return false}}
var STAFF_TOOLS=[["#/admin","Admin","Add, edit and publish items. Sign in with the GitHub token.","tower"],["#/labels","Print labels","Barcode and QR labels for every exhibit, printed straight to the Phomemo.","printer"],["#/scan","Scan a label","Look up an exhibit from its label, or check things off in an inventory.","scanner"],["#/hunt","Swap-meet mode","Do I own this? Is the price OK? Built for the field.","cart"],["#/advisor","What next?","Gaps in the collection and what to hunt for.","flag"],["#/today","Today's find","A ready-to-post card for one piece of history, in three sizes.","camera"],["#/check","Data check","Find missing years, makers, photos and broken ids in the catalog.","chip"],["#/styleguide","Style guide","Every shared component, in every theme.","star"]];
function staffGate(name){app.innerHTML='<section><h2>Staff only</h2><div class="k-intro">'+(typeof mascot==="function"?mascot(80,"oops",undefined,true):"")+'<div><p>Connie is guarding this door. (She is a memory chip. She takes it very seriously.)</p><p>This page is a working tool for the museum curator, so it is not part of the public site.</p></div></div><p>If that is you, unlock <a href="#/admin">Admin</a> once on this device and the staff tools will open here.</p><p><a class="btn pri" href="#/admin">Go to Admin</a> <a class="btn" href="#/">Back to the museum</a></p></section>'}
function staffPage(){app.innerHTML='<section><h2>Staff tools</h2><p class="tn">Working tools for the curator. Visitors never see these.</p><nav class="hm-tiles" aria-label="Staff tools">'+STAFF_TOOLS.map(function(t){return tile(t[0],esc(t[1]),esc(t[2]),"",t[3])}).join("")+'</nav><p class="tn"><button class="btn" id="stfx" type="button">Hide staff tools on this device</button></p></section>';
 document.getElementById("stfx").onclick=function(){try{localStorage.removeItem("cm-admin")}catch(e){}staffMark();location.hash="#/"}}
function staffMark(){var a=document.getElementById("stf");if(a)a.hidden=!isStaff();var w=document.getElementById("wbl");if(w)w.hidden=!(typeof wbVisible==="function"&&wbVisible().length)}
function route(){if(/^#\/?(admin|builder)(\/|$)/.test(location.hash)&&!/admin\.html$/.test(location.pathname)){location.replace("admin.html"+location.hash);return}if(window.CMAdmin)CMAdmin.unmount();if(window.CMToys)CMToys.unmount();if(window.CMMore)CMMore.unmount();if(window.CMConnie)CMConnie.unmount();app.classList.remove("crt");void app.offsetWidth;app.classList.add("crt");var h=hparts();window.scrollTo(0,0);app.oninput=null;staffMark();if(STAFF_RE.test(h[0])&&!isStaff()){staffGate(h[0]);document.title="Staff only | Conventional Memory";return}if(h[0]==="staff"){staffPage();document.title="Staff tools | Conventional Memory";return}if(h[0]!=="item"&&h[0]!=="catalog"&&h[0]!=="t"){try{sessionStorage.removeItem("cm-catlist")}catch(e){}}if(window.CMGame)CMGame.unmount();
 if(h[0]==="t"){if(!tagJump(h[1]))tagPageMissing(decodeURIComponent(h[1]||""));return}
 if(h[0]==="search"&&h[1]&&/^cm[-\s]?\d{1,6}$/i.test(decodeURIComponent(h[1]))&&tagJump(decodeURIComponent(h[1])))return;
 if(h[0]==="random"){location.replace("#/item/"+ITEMS[Math.floor(Math.random()*ITEMS.length)].id);return}
 if(h[0]==="maze"&&window.CMGame)CMGame.mount(app,{quotes:typeof QUOTES!=="undefined"?QUOTES:[],items:ITEMS,tl:TL,tlx:typeof TLX!=="undefined"?TLX:{},gx:typeof GX!=="undefined"?GX:{},tier:tier,scale:SCALE});else if(h[0]==="compare")compare(h[1],h[2]);else if(h[0]==="tag")tagPage(decodeURIComponent(h.slice(1).join("/")));else if(h[0]==="changes")changes();else if(h[0]==="journal")journal();else if(h[0]==="workbench"&&typeof workbench==="function")workbench();else if(h[0]==="disclosure"&&typeof disclosurePage==="function")disclosurePage();else if(h[0]==="quotes")quotesPage();else if(h[0]==="stats")stats();else if(h[0]==="wanted")wanted();else if(h[0]==="check")check();else if(h[0]==="mem")mem();else if(h[0]==="admin"||h[0]==="builder")loadAdmin();else if(h[0]==="play"||h[0]==="styleguide"||h[0]==="daily"||h[0]==="build"||h[0]==="adlab"||h[0]==="higher"||h[0]==="sort"||h[0]==="mystery"||h[0]==="trophies"||h[0]==="search"||h[0]==="today"||h[0]==="bingo"||h[0]==="hangman")loadPlay(h[0],h.slice(1).map(decodeURIComponent));else if(/^(runs|bench|advisor|hunt|rigs|walk)$/.test(h[0]))loadLab(h[0],h.slice(1).map(decodeURIComponent));else if(/^(connie|funnies|closet|memman|stickers)$/.test(h[0]))loadConnie(h[0],h.slice(1).map(decodeURIComponent));else if(/^(wish|kiosk|prizes|backup|maker|manuals|labels|start|scan|about)$/.test(h[0]))loadToys(h[0],h.slice(1).map(decodeURIComponent));else if(/^(more|hub|report|tours|tour|explore|era|zoom|day|mine|jukebox|community|theater|shorts|install)$/.test(h[0]))loadMore(h[0],h.slice(1).map(decodeURIComponent));else if(h[0]==="timeline"){timeline(+h[1]||0,h[2]?decodeURIComponent(h.slice(2).join("/")):"");if(/^\d+$/.test(h[1]||"")&&(+h[1]<TLMIN||+h[1]>TLMAX))app.insertAdjacentHTML("afterbegin",'<p class="msg err" role="status">The timeline covers '+TLMIN+" to "+TLMAX+", so "+esc(h[1])+" is not on it. Showing the closest year.</p>")}else if(h[0]==="scale")scale();else if(h[0]==="catalog")catalog();else if(h[0]==="item")item(h[1]);else if(h[0]==="follow")follow();else if(!h[0]||h[0]==="home")home();else notFound(h.join("/"));
 var qb=document.getElementById("qnew");if(qb)qb.onclick=function(){document.getElementById("qbox").innerHTML=qBlock(QUOTES[Math.floor(Math.random()*QUOTES.length)])};
 var t=app.querySelector("h1,h2"),n=t&&(t.firstChild||t).textContent;document.title=n&&n!=="Conventional Memory"?n+" | Conventional Memory":"Conventional Memory";tabBar(h);navMark();try{if(window.CMFun&&sessionStorage.getItem("cm-era"))CMFun.era()}catch(e){}}
var NAVMAP={workbench:"explore",catalog:"catalog",item:"catalog",compare:"catalog",tag:"catalog",timeline:"timeline",search:"search",tours:"explore",tour:"explore",explore:"explore",era:"explore",zoom:"explore",day:"explore",mem:"explore",scale:"explore",stats:"explore",report:"explore",runs:"explore",bench:"explore",walk:"explore",rigs:"play",advisor:"stuff",hunt:"stuff",quotes:"explore",wish:"stuff",backup:"stuff",maker:"catalog",manuals:"explore",labels:"stuff",scan:"stuff",about:"community",start:"explore",kiosk:"play",prizes:"play",connie:"connie",funnies:"connie",closet:"connie",memman:"connie",stickers:"connie",play:"play",bingo:"play",hangman:"play",today:"play",daily:"play",higher:"play",sort:"play",mystery:"play",build:"play",adlab:"play",maze:"play",theater:"watch",jukebox:"watch",shorts:"watch",mine:"stuff",trophies:"stuff",install:"stuff",community:"community",follow:"community",wanted:"community",changes:"community",check:"community"},
 NAVT={catalog:"Catalog",timeline:"Timeline",search:"Search",explore:"Explore",play:"Play",watch:"Theater",stuff:"My stuff",community:"Community"};

var ROUTE_NAMES=["about","catalog","timeline","search","explore","play","theater","mine","community","wanted","follow","changes","journal","workbench","disclosure","stats","report","mem","scale","era","walk","zoom","day","runs","bench","rigs","daily","bingo","hangman","higher","sort","mystery","trophies","tours","quotes","install","jukebox","wish","kiosk","prizes","backup","maker","manuals","labels","start","connie","funnies","closet","memman","stickers"];
function lev(a,b){var m=[],i,j;for(i=0;i<=a.length;i++)m[i]=[i];for(j=0;j<=b.length;j++)m[0][j]=j;for(i=1;i<=a.length;i++)for(j=1;j<=b.length;j++)m[i][j]=Math.min(m[i-1][j]+1,m[i][j-1]+1,m[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return m[a.length][b.length]}
function notFound(path){var w=String(path).split("/")[0].toLowerCase(),best=ROUTE_NAMES.map(function(n){return[lev(w,n),n]}).sort(function(a,b){return a[0]-b[0]}).slice(0,3).filter(function(x){return x[0]<=Math.max(2,Math.floor(w.length/2))});
 app.innerHTML='<section class="nf"><h2>Page not found</h2><div class="nf-m">'+(typeof mascot==="function"?mascot(96,"oops",undefined,true):"")+'</div><p>There is no page called <b>'+esc(path)+'</b> in the museum. The link may be old or mistyped.</p>'
  +(best.length?'<p>Did you mean: '+best.map(function(x){return'<a class="btn" href="#/'+x[1]+'">'+x[1]+'</a>'}).join(" ")+'</p>':"")
  +'<form id="nfs" class="tools"><input id="nfq" type="search" placeholder="Search the museum" aria-label="Search the museum"> <button class="btn pri" type="submit">Search</button></form><p><a class="btn" href="#/">Home</a> <a class="btn" href="#/catalog">Catalog</a> <a class="btn" href="#/more">Site map</a></p></section>';
 document.getElementById("nfs").onsubmit=function(e){e.preventDefault();var q=document.getElementById("nfq").value.trim();location.hash=q?"#/search/"+encodeURIComponent(q):"#/search"}}
/* Wish list store (browser only). Entries: {k:"i:<item id>" | "t:<timeline name>" | "c:<free text>", n:note, max:price, t:time}. */
var WK="cm-wish";
function wishLoad(){try{var w=JSON.parse(localStorage.getItem(WK)||"[]");return Array.isArray(w)?w.filter(function(x){return x&&typeof x.k==="string"}):[]}catch(e){return[]}}
function wishSave(w){try{localStorage.setItem(WK,JSON.stringify(w.slice(0,300)))}catch(e){}}
function wishHas(k){return wishLoad().some(function(x){return x.k===k})}
function wishToggle(k){var w=wishLoad(),i=-1;w.forEach(function(x,n){if(x.k===k)i=n});if(i>=0)w.splice(i,1);else w.push({k:k,t:Date.now()});wishSave(w);return i<0}

/* Store intercom: a rotating "Attention shoppers" line on the home page, built from what the museum actually has today. */
function aisleNo(cat){var seen=[];ITEMS.forEach(function(i){if(seen.indexOf(i.cat)<0)seen.push(i.cat)});var n=seen.indexOf(cat);return n<0?0:n+1}
function paLines(){var d=new Date(),pool=ITEMS.filter(function(i){return i.photos&&i.photos.length});if(!pool.length)pool=ITEMS;var it=pool.length?pool[(d.getFullYear()*372+d.getMonth()*31+d.getDate())%pool.length]:null,L=[];
 if(it)L.push("Attention shoppers: today's exhibit of the day is the "+it.name+", in aisle "+aisleNo(it.cat)+" ("+it.cat+").");
 L.push("Attention shoppers: the Daily Dig is now open at the Play counter. Three questions, no waiting.");
 L.push("Attention shoppers: "+ITEMS.length+" exhibits are on the floor"+(DRAFTS.length?" and "+DRAFTS.length+" more are being unpacked in the back.":"."));
 L.push("Will the owner of a Sound Blaster set to IRQ 5 please report to the Dream rig counter.");
 L.push("Attention shoppers: the 640K barrier is still intact. Thank you for your patience.");
 L.push("Attention shoppers: see something you like? Circle it in the catalog and it goes on your wish list.");
 L.push("Attention shoppers: tickets from the games can now be redeemed at the prize counter.");
 var o=TL.filter(function(r){return r[0].length>=10&&r[0].slice(5)===String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")});if(o.length){var r=o[Math.floor(Math.random()*o.length)];L.push("On this day in "+r[0].slice(0,4)+": "+r[2]+".")}
 return L}
function paHtml(){var L=paLines();return'<div class="pa" role="note" aria-label="Store announcements"><span class="pa-m">'+(typeof mascot==="function"?mascot(40,"happy"):"")+'</span><span class="pa-t"><b>PA</b> <span id="pat">'+esc(L[0])+'</span></span><button type="button" class="btn noprint" id="pan" aria-label="Next announcement">&#9654;</button></div>'}
function paWire(){var t=document.getElementById("pat"),b=document.getElementById("pan");if(!t)return;var L=paLines(),i=0;function nx(){i=(i+1)%L.length;t.textContent=L[i]}b.onclick=nx;var iv=setInterval(function(){if(!document.getElementById("pat")){clearInterval(iv);return}if(document.documentElement.getAttribute("data-motion")!=="off")nx()},9000)}

/* Related pages share one tab bar, so five stats pages, three daily games, and so on read as one place each. */
var TABSETS=[["Museum stats",[["stats","The numbers"],["report","Collection report"],["mem","Memory map"],["scale","640K scale"]]],
 ["Daily",[["daily","Daily Dig"],["bingo","Retro Bingo"]]],
 ["What's new",[["changes","Recent changes"],["journal","Repair journal"],["follow","Follow"]]],
 ["A year",[["era","Era mode"],["walk","Guided walk"],["day","One day"],["zoom","Zoom"]]],
 ["Machines",[["runs","Does it run?"],["rigs","Dream rig"],["bench","Benchmarks"],["build","Rig challenge"]]],
 ["My lists",[["mine","My collection"],["wish","Wish list"],["backup","Back up"]]]];
function tabBar(h){var set=TABSETS.filter(function(s){return s[1].some(function(t){return t[0]===h[0]})})[0];if(!set||app.querySelector(".tbar"))return;
 var yr=/^\d{4}/.test(h[1]||"")?h[1].slice(0,4):"";
 var bar='<nav class="tbar noprint" aria-label="'+esc(set[0])+'">'+(set[0]==="A year"?'<a href="#/timeline'+(yr?"/"+yr:"")+'">Timeline</a>':"")+set[1].map(function(t){var href="#/"+t[0]+((t[0]==="era"||t[0]==="walk")&&yr?"/"+yr:t[0]==="build"?"/1996":"");return'<a href="'+href+'"'+(t[0]===h[0]?' aria-current="page"':"")+'>'+esc(t[1])+'</a>'}).join("")+'</nav>';
 app.insertAdjacentHTML("afterbegin",bar)}
function hparts(){var r=location.hash.replace(/^#\/?/,"");if(r.indexOf("catalog")===0){var i=r.indexOf("?");if(i>=0)r=r.slice(0,i)}return r.split("/")}
function navMark(){var h=hparts(),k=h[0]==="hub"?h[1]:NAVMAP[h[0]];
 document.querySelectorAll("nav a[data-s]").forEach(function(a){if(a.dataset.s===k){a.setAttribute("aria-current","page");var nv=a.parentNode;if(nv.scrollWidth>nv.clientWidth)nv.scrollLeft=Math.max(0,a.offsetLeft-40)}else a.removeAttribute("aria-current")});
 var nvv=document.querySelector("header.top nav");if(nvv&&!nvv.__f){nvv.__f=1;var fz=function(){nvv.classList.toggle("more",nvv.scrollLeft+nvv.clientWidth<nvv.scrollWidth-2)};nvv.addEventListener("scroll",fz);window.addEventListener("resize",fz);nvv.__z=fz}if(nvv&&nvv.__z)nvv.__z();
 var c=document.getElementById("crumb");if(!c)return;if(!h[0]||h[0]==="home"||h[0]==="admin"){c.hidden=true;return}
 var parts=[],t=app.querySelector("h1,h2"),pg=t?(t.firstChild||t).textContent:"";
 if(k){var hr=k==="catalog"||k==="timeline"||k==="search"?"#/"+k:"#/hub/"+k;parts.push([hr,NAVT[k]])}else if(h[0]==="more")parts.push(["","Site map"]);
 if(h[0]==="item"){c.hidden=true;return}
 else if(h[0]!=="catalog"&&h[0]!=="timeline"&&h[0]!=="search"&&h[0]!=="hub"&&h[0]!=="more"&&pg)parts.push(["",pg]);
 if(h[0]==="item"&&pg)parts.push(["",pg]);
 c.hidden=false;c.innerHTML='<a href="#/">C:\\MUSEUM</a>'+parts.map(function(p){return'\\'+(p[0]?'<a href="'+p[0]+'">'+esc(p[1])+'</a>':'<span aria-current="location">'+esc(p[1])+'</span>')}).join("")+"&gt;"}
window.addEventListener("hashchange",route);route();
document.addEventListener("keydown",function(e){if(e.key==="/"&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!/^(INPUT|TEXTAREA|SELECT)$/.test((e.target||{}).tagName)){e.preventDefault();location.hash="#/search"}});
var ti=0;try{ti=+localStorage.getItem("cm-theme")||0}catch(e){}
initMotion();initCrt();setTheme(ti);document.getElementById("th").onclick=function(){ti=(ti+1)%THEMES.length;setTheme(ti)};
if(!location.hash||location.hash==="#/")boot();
var scs=ITEMS.filter(function(i){return i.score!=null}),mood=scs.length?tier(Math.round(scs.reduce(function(a,i){return a+i.score},0)/scs.length)).n:"unknown";
function beats(){var d=new Date(),t=(d.getUTCHours()*3600+d.getUTCMinutes()*60+d.getUTCSeconds()+3600)%86400;return "@"+String(Math.floor(t/86.4)).padStart(3,"0")}
setInterval(function(){var e=document.getElementById("beat");if(e)e.textContent=beats()},10000);
var vis=String(Math.floor(Math.random()*99000)+1000).padStart(6,"0");
document.getElementById("retro").innerHTML='<div class="rb"></div><p>You are visitor number <span class="cnt" role="img" aria-label="visitor counter, for fun" title="This counter is just for fun">'+vis.split("").map(function(c){return '<b>'+c+'</b>'}).join("")+'</span></p>'
 +'<div class="btns"><a class="b88" href="#/scale">POWERED BY 640K</a><span class="b88">MADE ON A 486</span><span class="b88">BEST VIEWED 800x600</span><span class="b88">Y2K COMPLIANT</span><span class="b88">NO FRAMES!</span><a class="b88" href="#/maze">STAFF ONLY: BASEMENT</a><span class="b88">HAND-CODED</span><span class="b88">WEB DESIGN IS MY PASSION</span><span class="b88">ANY BROWSER</span></div>'
 +'<p class="ring">Currently browsing: 1 (that is you). Mood of the museum: <b>'+esc(mood)+'</b>. Internet Time: <span id="beat">'+beats()+'</span> .beats</p>'
 +'<p class="ring">Museum Ring: <a href="#/item/'+ITEMS[ITEMS.length-1].id+'">[&lt;&lt; Prev]</a> <a href="#/random">[Random]</a> <a href="#/item/'+ITEMS[0].id+'">[Next &gt;&gt;]</a></p>'
 +'<p class="ring">Best viewed with Netscape Navigator 4.0 at 800x600, but it works everywhere. Last updated '+UPDATED+'.</p>';
var cmd=document.getElementById("cmd"),cout=document.getElementById("cout");
var GO={connie:"#/connie",funnies:"#/funnies",closet:"#/closet",memman:"#/memman",stickers:"#/stickers",more:"#/more",map:"#/more",hub:"#/more",explore:"#/hub/explore",spec:"#/explore",tours:"#/tours",era:"#/era/1995",zoom:"#/zoom",theater:"#/theater",tv:"#/theater",jukebox:"#/jukebox",community:"#/community",mine:"#/mine",install:"#/install",search:"#/search",bingo:"#/bingo",hangman:"#/hangman",play:"#/hub/play",games:"#/play",watch:"#/hub/watch",stuff:"#/hub/stuff",trophies:"#/trophies",dir:"#/catalog",catalog:"#/catalog",mem:"#/mem",scale:"#/scale",timeline:"#/timeline",random:"#/random",cls:"#/",home:"#/",follow:"#/follow",admin:"#/admin",wanted:"#/wanted",stats:"#/stats",changes:"#/changes",quotes:"#/quotes",maze:"#/maze",basement:"#/maze"};
cmd.onkeydown=function(e){if(e.key!=="Enter")return;var c=cmd.value.trim().toLowerCase();cmd.value="";
 if(!c){cout.textContent="";return}
 if(/^cm[-\s]?\d{1,6}$/.test(c)){cout.textContent=tagJump(c)?"":"No exhibit with that label.";return}
 if(c==="help"){cout.textContent="Commands: "+Object.keys(GO).join(", ")+", quote, ver";return}
 if(/^(find|search) /.test(c)){cout.textContent="";location.hash="#/search/"+encodeURIComponent(c.replace(/^\w+ /,""));return}
 if((c==="screensaver"||c==="saver")&&window.CMFun){cout.textContent="Starting screensaver. Move the mouse to stop.";setTimeout(CMFun.saver,300);return}
 if((c==="dial"||c==="modem"||c==="atdt")&&window.CMFun){cout.textContent="ATDT 555-0142";CMFun.modem();return}
 if(c==="ver"){cout.textContent="Conventional Memory [Version 1.0]";return}
 var EG={"format c:":"WARNING: ALL DATA ON DRIVE C: WILL BE LOST! Proceed with Format (Y/N)? ... Just kidding. Every item is safe.","win":"This program cannot be run in DOS mode. Try dir.","iddqd":"Degreelessness mode on."};
 var eg=c==="chkdsk"?ITEMS.length+" items cataloged. "+(640-ITEMS.length)+"K free of 640K conventional memory.":EG[c];
 if(eg){cout.textContent=eg;return}
 if(c==="quote"){var qq=QUOTES[Math.floor(Math.random()*QUOTES.length)];cout.textContent=qq[0]+" - "+qq[1];return}
 if(GO[c]){cout.textContent="";location.hash=GO[c]}else cout.textContent="Bad command or file name"}

if("serviceWorker" in navigator&&location.protocol==="https:")navigator.serviceWorker.register("sw.js").catch(function(){});
window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.CMInstallEvt=e});

document.addEventListener("input",function(e){var t=e.target;if(t&&t.matches&&t.matches(".ba input")){t.parentNode.style.setProperty("--p",t.value+"%")}});
