/* The Bookshelf page (#/books and /books/): which timeline books sit on which shelf, and which family member minds each shelf.
   Every book is a timeline entry of kind "bk" (title, author, publisher and other facts live in timeline-data.js and timeline-extra.js).
   Shelf: {id, h heading, intro, reader [family id, options, Connie's line], books [timeline titles]} */
var BOOKSHELF=[
{"id":"sierra","h":"The Sierra shelf","intro":"Two people at a kitchen table in 1980 start a company that makes adventure games. Four decades later, you can read how it went.","reader":["zack",{holds:"book"},"Zack Zip is the neighbor kid, and he is in every adventure party. He has read the Sierra books and says he was in them. He was not.",{lay:"peek",cap:"Reading in the bookstore, unpaid."}],"books":["Not All Fairy Tales Have Happy Endings","Once Upon a Point and Click","Hackers: Heroes of the Computer Revolution"]},
{"id":"doom","h":"Doom, id and the shooters","intro":"Two guys, one 386 and a lot of pizza. These books cover the people, the code and the cultural earthquake.","reader":["emma",{holds:"controller"},"Emma 386 says Doom ran on a 386, so these books are basically about her. Nobody has been brave enough to disagree.",{lay:"bubble",cap:"Playing, not reading, in 386 mode."}],"books":["Masters of Doom","Doom Guy: Life in First Person","Game Engine Black Book: DOOM","Rocket Jump: Quake and the Golden Age of First-Person Shooters","Stairway to Badass: The Making and Remaking of Doom"]},
{"id":"blizzard","h":"Blizzard and Diablo","intro":"A dungeon, a town of people who really need your help and, somewhere, a secret cow level.","reader":["nibble",{holds:"pizza"},"Nibble has read the cow level chapter nine times. He says it is nothing like his wheel. He says he has not been back since.",{lay:"box",cap:"Reading chapter nine, with a snack."}],"books":["Stay Awhile and Listen, Book I","Stay Awhile and Listen, Book II"]},
{"id":"consoles","h":"Consoles, Nintendo and Atari","intro":"Before the 90s PC took over the living room, there was a box under the TV. These are the best books about it.","reader":["sandy",{holds:"controller",acc:"shades"},"Sandy Blaster takes sides in every console war, loudly, on IRQ 5. She says Sega did it better. Nobody has asked her.",{lay:"screen",cap:"Taking sides, loudly."}],"books":["Console Wars","Game Over: How Nintendo Zapped an American Industry","The Ultimate History of Video Games","Replay: The History of Video Games","Racing the Beam","Atari Inc.: Business Is Fun","Super Mario: How Nintendo Conquered America"]},
{"id":"makers","h":"How games actually get made","intro":"Behind every great game there is a crunch, a miracle, and a build that would not compile. Here is the real story.","reader":["hiram",{holds:"laptop"},"Hiram says he has read all of these from the loft, where no one can see him. He says he has also written a game. We have not seen that either.",{lay:"peek",cap:"Writing a game nobody has seen."}],"books":["Blood, Sweat, and Pixels","Press Reset","The Making of Prince of Persia: Journals 1985-1993","ZZT (Boss Fight Books)"]},
{"id":"design","h":"Game design and virtual worlds","intro":"What makes a game fun, what makes a world feel alive, and where multiplayer came from.","reader":["rhoda",{holds:"pencil"},"My mom, Rhoda, says every game is rules you can read but cannot edit. She is read-only. She has strong opinions on these.",{lay:"note",cap:"Marking up the rules."}],"books":["A Theory of Fun for Game Design","Designing Virtual Worlds","Dungeons and Dreamers","Playing at the World"]},
{"id":"history","h":"Computer history","intro":"The people, the garages and the companies that put a computer on every desk.","reader":["floyd",{holds:"book"},"Grandpa Floyd Dysk says he was there for all of it. He was not. He was a floppy. He was in a shirt pocket.",{lay:"sign",cap:"He was there. Allegedly."}],"books":["Hackers: Heroes of the Computer Revolution","Accidental Empires","The Soul of a New Machine","Commodore: A Company on the Edge","Insanely Great","Dealers of Lightning","Where Wizards Stay Up Late","The Cuckoo's Egg","Code: The Hidden Language of Computer Hardware and Software"]},
{"id":"fun","h":"Just for fun","intro":"Novels with the same energy as the games.","reader":["toner",{holds:"book"},"Toner, our puppy, thinks the cat in Dungeon Crawler Carl is personally his responsibility. He has left a pawprint on the cover.",{lay:"peek",cap:"Guarding the cat."}],"books":["Dungeon Crawler Carl","Ready Player One (novel)"]}
];

/* Shared markup for the Bookshelf, used by the app (#/books) and the web page (/books/), so both look the same.
   Colors live in style.css (.k-sierra and friends); the icons are small outline shapes that take the cover's accent color. */
var BOOKICON={
 sierra:'<path d="M3 18h18l-1.5-9-4.5 4-3-7-3 7-4.5-4z"/><path d="M4 21h16"/>',
 doom:'<path d="M13 2 5 14h6l-1 8 9-13h-6z"/>',
 blizzard:'<path d="M14.5 3.5 20.5 3.5 20.5 9.5 9 21l-3-3z"/><path d="M5 19l-2 2M7.5 13.5l3 3"/>',
 consoles:'<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 10v5M4.5 12.5h5"/><circle cx="16" cy="11.5" r="1.1"/><circle cx="18.7" cy="14" r="1.1"/>',
 makers:'<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/>',
 design:'<path d="M12 2 21 7.5v9L12 22 3 16.5v-9z"/><path d="M12 2v20M3 7.5l18 9M21 7.5l-18 9"/>',
 history:'<rect x="4" y="3" width="16" height="11" rx="1.5"/><path d="M8 18h8M12 14v4M7 21h10"/>',
 fun:'<path d="M12 21c-5-3.5-8-6.5-8-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 11c0 3.5-3 6.5-8 10z"/>'};
function bkE(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function bkIcon(sh,sz){return'<svg class="bkx" viewBox="0 0 24 24" width="'+(sz||22)+'" height="'+(sz||22)+'" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+(BOOKICON[sh]||BOOKICON.history)+'</svg>'}
/* o: {id, shelf, name, au, y, pub, pg, why, href (timeline page or ""), amz, ebay, aud (urls or "")} */
function bkCard(o){var long=o.name.length>34?" bkc-xs":o.name.length>20?" bkc-sm":"",rel=' target="_blank" rel="sponsored noopener noreferrer"';
 var meta=[o.y?'<span>'+bkE(o.y)+'</span>':"",o.pg?'<span>'+o.pg+' pages</span>':"",o.pub?'<span>'+bkE(o.pub)+'</span>':""].filter(Boolean).join("");
 var cv='<div class="bkc-cover" aria-hidden="true">'+bkIcon(o.shelf,26)+'<b>'+bkE(o.name)+'</b><span>'+bkE(o.au)+'</span></div>';
 var btn=(o.amz?'<a class="bkbtn bkb-a" href="'+bkE(o.amz)+'"'+rel+'>Find on Amazon</a>':"")+(o.ebay?'<a class="bkbtn bkb-e" href="'+bkE(o.ebay)+'"'+rel+'>Find on eBay</a>':"");
 return'<article class="bk k-'+bkE(o.shelf)+long+'" id="bk-'+bkE(o.id)+'">'+(o.href?'<a class="bkc-lk" href="'+bkE(o.href)+'" tabindex="-1" aria-hidden="true">'+cv+'</a>':cv)
  +'<div class="bkc-b"><h4>'+(o.href?'<a href="'+bkE(o.href)+'">'+bkE(o.name)+'</a>':bkE(o.name))+'</h4>'+(o.au?'<p class="bkc-au">by '+bkE(o.au)+'</p>':"")+(meta?'<p class="bkc-meta">'+meta+'</p>':"")+'<p class="bkc-why">'+bkE(o.why)+'</p>'
  +(btn?'<div class="bkc-btns">'+btn+'</div>'+(o.aud?'<p class="bkc-aud"><a href="'+bkE(o.aud)+'"'+rel+'>Audiobook on Amazon</a></p>':""):"")+'</div></article>'}
function bkSpine(o){return'<a class="spine k-'+bkE(o.shelf)+'" href="'+bkE(o.href)+'"'+(o.attr||"")+' title="'+bkE(o.name+(o.au?", "+o.au:""))+'" aria-label="'+bkE(o.name+(o.au?" by "+o.au:"")+(o.y?", "+o.y:""))+'" style="height:'+o.h+'px;width:'+o.w+'px"><i></i><span>'+bkE(o.name)+'</span><small>'+bkE(String(o.y).slice(2))+'</small></a>'}

/* books.js: the Bookshelf page. A spine shelf (taller means more pages), then the shelves with a family reader on each.
   Books are timeline entries of kind "bk"; the affiliate links come from gear.js and affiliate.js. */
var LISTEN=["sandy",{holds:"walkman"},"Most of these come as audiobooks, which is how Sandy reads them. She does the commute on a Walkman with the volume at eleven. Look for the audiobook link under each book.",{lay:"bubble",cap:"Sandy, listening to Masters of Doom for the ninth time."}];
window.CMBooks=(function(){
 var app,SHELF_OF={};BOOKSHELF.forEach(function(s){s.books.forEach(function(t){SHELF_OF[t]=SHELF_OF[t]||s.id})});
 function E(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
 function row(t){return TL.filter(function(r){return r[2]===t})[0]}
 function info(t){var r=row(t)||["","bk",t,"","",""],x=(typeof TLX!=="undefined"&&TLX[t])||{},sp=x.specs||{};return{t:t,r:r,x:x,sp:sp,name:String(t).replace(/ \((book|novel|Boss Fight Books)\)$/,""),au:sp.Author||"",pub:sp.Publisher||"",pg:+sp.Pages||0,y:String(r[0]).slice(0,4)}}
 function urls(b){if(typeof affOn!=="function"||!affOn())return{};var fs=gearFinds(gearCtx(b.t,b.pub,b.t),b.t,b.pub),f=fs[0],g=fs[1];if(!f)return{};return{amz:affUrl("amazon",f[1]),ebay:affUrl("ebay",f[1]),aud:g?affUrl("amazon",g[1]):""}}
 function spines(){var seen={},h="";BOOKSHELF.forEach(function(s){s.books.forEach(function(t){if(seen[t])return;seen[t]=1;var b=info(t);
  h+=bkSpine({shelf:s.id,name:b.name,au:b.au,y:b.y,href:"#/books",attr:' data-b="'+E(t)+'"',h:(120+Math.round(Math.min(b.pg||320,800)/800*140)),w:34+(hstr(t)%3)*8})})});
  return'<div class="shelfw bks-shelfw"><div class="bks-shelf">'+h+'</div></div>'}
 function card(t){var b=info(t),u=urls(b);return bkCard({id:hstr(t),shelf:SHELF_OF[t],name:b.name,au:b.au,y:b.y,pub:b.pub.replace(/ \(original\).*/,""),pg:b.pg,why:b.r[4],href:"#/timeline/"+b.y+"/"+encodeURIComponent(t),amz:u.amz,ebay:u.ebay,aud:u.aud})}
 function reader(rd){if(typeof CMCast==="undefined"||!rd||!CMCast.cameoHtml)return"";return CMCast.cameoHtml([rd[0],rd[1],rd[2],rd[3]],rd[2],function(id,o,sz,cls){var pr=id==="connie"&&!o.holds&&o.acc==null;return'<div class="'+cls+'">'+(pr&&typeof mascot==="function"?mascot(sz,o.mood||"wink",undefined,false):CMCast.svg(id,sz,o))+'</div>'})}
 function mount(el){app=el;
  var h='<section class="bks"><h2>The Bookshelf</h2><div class="bks-in">'+(typeof mascot==="function"?mascot(88,"wink",undefined,true):"")+'<div><p class="sp-lead">Books on computer history, game history and how it all gets made, from Sierra and Doom to consoles, virtual worlds and a very violent cat. Each spine is a book, and taller means more pages.</p><p class="tn">Every book is also a <a href="#/timeline">timeline</a> entry. '+(typeof AFF_SHORT!=="undefined"&&typeof affOn==="function"&&affOn()?E(AFF_SHORT)+" <a href=\"#/disclosure\">Disclosure</a>":"")+'</p></div></div>'+spines();
  h+=reader(LISTEN);
  BOOKSHELF.forEach(function(s){h+='<h3 class="bks-h k-'+s.id+'" id="sh-'+s.id+'">'+bkIcon(s.id,26)+E(s.h)+'</h3><p>'+E(s.intro)+'</p>'+reader(s.reader)+'<div class="bkgrid">'+s.books.map(card).join("")+'</div>'});
  h+='<p class="tn">Want the web version for sharing? It lives at <a href="/books/">/books/</a>.</p></section>';app.innerHTML=h;
  var sh=app.querySelector(".bks-shelf");if(sh)sh.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest(".spine");if(!a)return;e.preventDefault();var t=a.getAttribute("data-b"),el2=document.getElementById("bk-"+hstr(t));if(el2){el2.scrollIntoView({behavior:"smooth",block:"center"});el2.classList.add("bk-on");setTimeout(function(){el2.classList.remove("bk-on")},1600)}})}
 return{mount:mount,unmount:function(){}}})();
