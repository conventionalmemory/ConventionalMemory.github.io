/* The "shelf" box on item and timeline pages: parts to keep a machine running, further reading, and a way to find one.
   Everything is chosen by category, era and a few keywords. These are suggestions made by the museum, and each is a
   plain search link (see affiliate.js), so nothing here promises that a part fits. */
var GEAR_BOOKS=[
 [/\b(altair|mits|homebrew|apple i\b|apple 1\b|kenbak|sol-20|imsai|processor technology)/,"Hackers: Heroes of the Computer Revolution","Hackers Heroes of the Computer Revolution Steven Levy"],
 [/\b(altair|mits|imsai|tandy trs-80|trs-80|commodore pet|kim-1|apple i\b|apple ii\b|osborne)/,"Fire in the Valley","Fire in the Valley Freiberger Swaine"],
 [/\b(apple|macintosh|lisa|newton|ipod|iphone|powerbook|imac)\b/,"Revolution in the Valley","Revolution in the Valley Andy Hertzfeld"],
 [/\b(xerox|alto|star 8010)/,"Dealers of Lightning","Dealers of Lightning Xerox PARC Hiltzik"],
 [/\b(microsoft|ms-dos|windows|bill gates|altair basic)\b/,"Hard Drive: Bill Gates and the Making of the Microsoft Empire","Hard Drive Bill Gates Making of the Microsoft Empire"],
 [/\b(ibm pc|ibm 5150|ibm personal computer|ibm 5160|pc xt|pc at)\b/,"Blue Magic: The IBM Personal Computer","Blue Magic IBM Personal Computer Chposky Leonsis"],
 [/\b(commodore|amiga|vic-20|c64|c128|commodore 64)\b/,"On the Edge: The Spectacular Rise and Fall of Commodore","On the Edge Spectacular Rise and Fall of Commodore Bagnall"],
 [/\b(atari|pong|2600|vcs|video computer system|lynx|jaguar)\b/,"Atari Inc.: Business Is Fun","Atari Inc Business Is Fun Goldberg Vendel"],
 [/\b(atari 2600|vcs|video computer system|pitfall|combat|adventure \(atari)/,"Racing the Beam: The Atari Video Computer System","Racing the Beam Atari Video Computer System Montfort Bogost"],
 [/\b(nintendo|nes\b|famicom|game boy|super mario|zelda|metroid|snes|super nes)\b/,"Game Over: How Nintendo Zapped an American Industry","Game Over How Nintendo Zapped an American Industry David Sheff"],
 [/\b(sega|genesis|mega drive|sonic|dreamcast|saturn|game gear)\b/,"Console Wars","Console Wars Sega Nintendo Blake Harris"],
 [/\b(id software|doom|quake|wolfenstein|carmack|romero)\b/,"Masters of Doom","Masters of Doom David Kushner"],
 [/\b(diablo|blizzard north)\b/,"Stay Awhile and Listen","Stay Awhile and Listen David Craddock Diablo Blizzard"],
 [/\b(lucasarts|lucasfilm games|monkey island|day of the tentacle|x-wing|maniac mansion|full throttle)\b/,"Rogue Leaders: The Story of LucasArts","Rogue Leaders The Story of LucasArts"],
 [/\b(ultima|origin systems|richard garriott)\b/,"Explore/Create","Explore Create Richard Garriott"],
 [/\b(tetris)\b/,"Tetris: The Games People Play","Tetris The Games People Play Box Brown"],
 [/\b(minecraft)\b/,"Minecraft: The Unlikely Tale of Markus Notch Persson","Minecraft Unlikely Tale of Markus Notch Persson"],
 [/\b(pixar|luxo|toy story)\b/,"The Pixar Touch","The Pixar Touch David Price"],
 [/\b(linux|torvalds|minix)\b/,"Just for Fun: The Story of an Accidental Revolutionary","Just for Fun Linus Torvalds David Diamond"],
 [/\b(arpanet|internet|tcp\/ip|ethernet|usenet|bbs\b|modem)\b/,"Where Wizards Stay Up Late","Where Wizards Stay Up Late Hafner Lyon"],
 [/\b(world wide web|www|berners-lee|html|mosaic|netscape)\b/,"Weaving the Web","Weaving the Web Tim Berners-Lee"],
 [/\b(data general|eclipse|minicomputer|dec |vax|pdp-)\b/,"The Soul of a New Machine","The Soul of a New Machine Tracy Kidder"]
];
var GEAR_GENERIC=[[/^(hw|pe)$/,"The Innovators","The Innovators Walter Isaacson"]];
var GEAR_VIDEO={arcade:/arcade/,console:/console|playstation|nintendo|sega|xbox|atari|game ?boy|dreamcast|saturn|genesis/};
function gearCtx(name,maker,key){var it=null,row=null;try{it=(typeof ITEMS!=="undefined"?ITEMS:[]).filter(function(x){return x.id===key})[0]||null;if(!it&&typeof TL!=="undefined")row=TL.filter(function(x){return x[2]===key})[0]||null}catch(e){}
 var c={it:it,row:row,kind:"",yr:0,ty:"",cat:"",nm:String(name||"").toLowerCase(),mk:String(maker||"").toLowerCase()};
 if(it){c.yr=+it.year||0;c.ty=String(it.type||"").toLowerCase();c.cat=String(it.cat||"").toLowerCase()}
 else if(row){c.yr=parseInt(row[0],10)||0;c.kind=row[1]}
 return c}
function gearParts(c,name,maker){var out=[];function add(l,q){if(out.length<5&&!out.some(function(o){return o[1]===q}))out.push([l,q])}
 var nm=c.nm,t=nm+" "+c.mk,yr=c.yr,comp=0,lap=0,con=0,midi=0,kb=0,mon=0,cam=0,card=0,hand=0;
 if(c.it){if(/cable|adapter|charger|power tap|surge|manual|book|magazine|\blot\b|bulk|battery|replacement|print ad|handbook|controller|cartridge|game only|panel/.test(nm)||/books|ephemera|games and software|power protection|cables/.test(c.cat)||c.ty==="game or software")return out;
  comp=/^(computer|laptop)$/.test(c.ty);lap=c.ty==="laptop"||/laptops/.test(c.cat);con=c.ty==="game console";midi=c.cat==="midi";kb=c.cat==="keyboards";mon=c.ty==="monitor";cam=c.ty==="camera"||c.cat==="cameras";card=c.ty==="expansion card"}
 else if(c.row){if(!/^(hw|pe)$/.test(c.kind))return out;
  comp=/laptop|notebook|thinkpad|powerbook|macintosh|\bimac\b|\bpc\b|computer|amiga|atari st|commodore/.test(nm);lap=/laptop|notebook|thinkpad|powerbook|libretto|omnibook|vaio/.test(nm);con=/game ?boy|\bnes\b|famicom|snes|super nintendo|nintendo 64|n64|playstation|genesis|mega drive|dreamcast|saturn|console|game gear|lynx|master system/.test(nm);midi=/midi|sound canvas|\bsc-55|\bmt-32|\bsc-88/.test(nm);kb=/keyboard/.test(nm);mon=/monitor|\bcrt\b/.test(nm);cam=/mavica|camera|\bdc\d+/.test(nm);card=/sound blaster|voodoo|graphics card|sound card|\bgus\b|adlib/.test(nm);hand=/ipod|palm|pda|zune|newton|walkman|discman/.test(nm)}
 else return out;
 var q0=affQ(name,maker);
 var apple=/macintosh|powerbook|imac|apple/.test(t),other=/amiga|commodore|atari|c64|vic-20/.test(t),handheld=/game ?boy|game gear|lynx|\bpsp\b|nintendo ds|\bgba\b|wonderswan|neo geo pocket/.test(t);
 if(comp&&(!yr||yr<=2006)&&!other){
  if(apple)add("PRAM and clock battery (match the type for your model)","Macintosh PRAM battery 3.6V lithium");
  else if(!yr||yr>=1984)add("CMOS and clock battery (check which type your board uses)","CMOS battery CR2032 3V");
  if(lap)add("Replacement battery pack for "+name,q0+" replacement battery");
  if(apple&&yr&&yr<1999)add("SCSI2SD, a solid state replacement for a SCSI hard drive","SCSI2SD SCSI hard drive replacement");
  else if(!apple&&yr&&yr>=1992&&yr<=2002){add("IDE to CompactFlash adapter, replaces a dying hard drive","IDE to CompactFlash adapter");add("CompactFlash card for old computers","CompactFlash card 8GB industrial")}
  else if(!apple&&yr&&yr<1992)add("XT-IDE card, lets an old PC use a CompactFlash card","XT-IDE ISA card compact flash");
  if(!apple&&yr&&yr>=1987&&yr<=2001){add("Gotek USB floppy drive emulator","Gotek floppy drive emulator");add("3.5 inch floppy disks, 1.44 MB","3.5 inch floppy disks 1.44MB")}}
 if(con){if(!handheld){add("Controller for "+name,q0+" controller");add("Power supply for "+name,q0+" AC adapter power supply")}
  if(/game ?boy/.test(t))add("Tri-wing and gamebit screwdriver set for Nintendo","Nintendo tri-wing gamebit screwdriver set");else if(/\bnes\b|famicom|snes|super nintendo|nintendo 64|n64/.test(t))add("Cartridge and console cleaning kit","Nintendo cartridge cleaning kit isopropyl")}
 if(midi){add("5 pin MIDI cable","5 pin MIDI cable");add("USB to MIDI interface","USB MIDI interface 1 in 1 out")}
 if(cam){if(/mavica|floppy/.test(t))add("3.5 inch floppy disks, 1.44 MB","3.5 inch floppy disks 1.44MB");add("Battery for "+name,q0+" battery")}
 if(hand)add("Replacement battery for "+name,q0+" replacement battery");
 if(kb){add("PS/2 to USB adapter","PS/2 to USB adapter keyboard");add("Keycap puller and keyboard cleaning kit","keycap puller keyboard cleaning kit")}
 if(mon)add("VGA cable","VGA cable male to male");
 if(comp||con||kb||cam||card||midi||hand){add("Electronics contact cleaner","DeoxIT contact cleaner");add("99% isopropyl alcohol for cleaning boards","99% isopropyl alcohol")}
 return out}
function gearBooks(c){var out=[],txt=c.nm+" "+c.mk;if(c.kind==="bk")return out;GEAR_BOOKS.forEach(function(b){if(out.length<2&&b[0].test(txt)&&!out.some(function(o){return o[0]===b[1]}))out.push([b[1],b[2]])});
 if(!out.length&&/^(hw)$/.test(c.kind)&&c.yr&&c.yr<1995)GEAR_GENERIC.forEach(function(g){out.push([g[1],g[2]])});return out.slice(0,2)}
/* The words that name an event's subject, for a book search: keep names and numbers, drop the verbs ("introduced", "decided", "first runs"). */
function topicQ(name){var drop=/^(a|an|the|of|in|on|at|to|by|for|and|is|are|was|were|first|new|its|it|goes|go|sale|sends|sent|runs|ships|shipped|released|release|introduced|introduces|launched|launches|published|publishes|incorporated|founded|decided|signed|settle|settles|sues|sue|announced|announces|becomes|opens|opened|debuts|premieres|unveiled|unveils|ruling|v\.?|vs\.?)$/i;
 var t=String(name||"").replace(/\([^)]*\)/g," ").replace(/[^\w .&'+-]+/g," ").split(/\s+/).filter(function(w){return w&&!drop.test(w)&&(/^[A-Z0-9]/.test(w)||/^\d/.test(w))});return t.slice(0,6).join(" ")}
/* What to look for, as a list: [label, search words]. Every catalog item and every timeline entry gets at least one, and the kinds that
   come in several forms get several (a movie on disc, its soundtrack, a poster). All are plain searches, never one specific listing,
   so they still work after a particular listing is gone. */
function gearFinds(c,name,maker){var q=affQ(name,maker);if(!q)return[];var out=[];function add(l,w){out.push([l,w])}
 if(c.row){var k=c.kind,t=topicQ(name)||q;
  if(k==="m"){add("Find it on Blu-ray or DVD",q+" Blu-ray DVD");if(c.yr&&c.yr<2006)add("Find it on VHS",q+" VHS");add("Find the soundtrack",q+" soundtrack");add("Find a poster",q+" movie poster")}
  else if(/^(gt|gn|gc)$/.test(k)){add("Find a copy",q+" game");add("Find the manual or strategy guide",q+" strategy guide manual");add("Find the soundtrack or merchandise",q+" soundtrack")}
  else if(/^(hw|pe)$/.test(k)){add("Find one of your own",q);add("Find manuals and paperwork",q+" manual");add("Find accessories",q+" accessories")}
  else if(k==="bk"){var ax=(typeof TLX!=="undefined"&&TLX[name]&&TLX[name].specs&&TLX[name].specs.Author)||"",bq=(String(name).replace(/ \((book|novel|Boss Fight Books)\)$/,"")+" "+ax).trim();var ib=(typeof TLX!=="undefined"&&TLX[name]&&TLX[name].specs&&TLX[name].specs.ISBN||"").replace(/[^0-9X]/gi,"");add("Find a copy",BOOKS+(/^(97[89]\d{10}|\d{9}[\dXx])$/.test(ib)?ib:bq));add("Find the audiobook",bq+" audiobook")}
  else if(k==="sw"){add("Find a boxed copy",q+" software");add("Find the manual",q+" manual")}
  else if(k==="u"){add("Find books about it",t+" book")}
  else{add("Find books about it",t+" book");add("Find vintage memorabilia",t+" vintage")}
  return out}
 if(c.it){var nm=c.nm,ty=c.ty,cat=c.cat;
  if(ty==="game or software"||/games and software/.test(cat)){add("Find another copy",q);add("Find the manual or strategy guide",q+" manual guide")}
  else if(/books|ephemera/.test(cat))add("Find another copy",q);
  else if(/cable|adapter|battery|charger|power tap|surge/.test(nm)||/cables|power protection|parts and tools/.test(cat)){add("Find another",q);add("Find a spare",q+" spare")}
  else{add("Find another one",q);add("Find manuals and paperwork",q+" manual");add("Find accessories",q+" accessories")}
  return out}
 /* anything else (a catalog row on the timeline, an odd kind): at least look for one */
 add("Find one of your own",q);add("Find manuals and paperwork",q+" manual");return out}
function gearFind(c,name,maker){var f=gearFinds(c,name,maker)[0];return f?{l:f[0],q:f[1]}:null}
function affShelf(name,maker,key){if(!affOn())return"";var c=gearCtx(name,maker,key),parts=gearParts(c,name,maker),books=gearBooks(c),fs=gearFinds(c,name,maker);
 if(!parts.length&&!books.length&&!fs.length)return"";
 function li(l,q){var a=affUrl("amazon",q),e=affUrl("ebay",q);if(!a&&!e)return"";return"<li>"+esc(l)+" "+(e?'<a href="'+esc(e)+'" target="_blank" rel="sponsored noopener noreferrer">eBay</a>':"")+(e&&a?" &middot; ":"")+(a?'<a href="'+esc(a)+'" target="_blank" rel="sponsored noopener noreferrer">Amazon</a>':"")+"</li>"}
 var h='<div class="affb affs">';
 if(parts.length)h+='<h4 class="sub">Keep it running</h4><ul class="refs">'+parts.map(function(p){return li(p[0],p[1])}).join("")+'</ul>';
 if(books.length)h+='<h4 class="sub">Further reading</h4><ul class="refs">'+books.map(function(b){return li(b[0],b[1])}).join("")+'</ul>';
 if(fs.length)h+='<ul class="refs shf-l">'+fs.map(function(f){var a=affUrl("amazon",f[1]),e=affUrl("ebay",f[1]);return'<li class="shf"><b>'+esc(f[0])+':</b> '+(e?'<a href="'+esc(e)+'" target="_blank" rel="sponsored noopener noreferrer">eBay</a>':"")+(e&&a?" &middot; ":"")+(a?'<a href="'+esc(a)+'" target="_blank" rel="sponsored noopener noreferrer">Amazon</a>':"")+"</li>"}).join("")+"</ul>";
 return h+(parts.length||books.length||fs.length?'<p class="affd tn">'+esc(AFF_SHORT)+' <a href="#/disclosure">Details</a></p>':"")+'</div>'}
