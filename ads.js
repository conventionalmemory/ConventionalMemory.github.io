/* ads.js - tribute ads. Loaded before app.js; uses helpers defined there (esc, safeUrl, hstr, rng, fmtDate, dyear, AD_SKY, TL, ITEMS).
   Everything here is drawn or built from the catalog and timeline data. Store names are made up and nothing can be ordered. */

/* ---------- product illustrations (EGA palette, drawn as SVG) ---------- */
function prodKind(it){var s=(it.cat+" "+it.type+" "+it.name+" "+(it.model||"")).toLowerCase();
 if(/laptop|notebook|subnote|portable computer|libretto|thinkpad/.test(s))return"laptop";
 var ik=typeof iconKind==="function"?iconKind(s):"";if(ik)return ik;
 if(/sound card|sound blaster|soundcard|expansion card|video card|graphics card|adlib|gravis|wavetable|isa|pci|agp|controller card|network card|nic\b/.test(s))return"card";
 if(/keyboard/.test(s))return"keyboard";
 if(/midi|synth|sound module|roland|mt-32|sc-55|module/.test(s))return"synth";
 if(/monitor|crt|display/.test(s))return"monitor";
 if(/mouse|trackball/.test(s))return"mouse";
 if(/joystick|gamepad|controller|gravis|thrustmaster/.test(s))return"joystick";
 if(/floppy|disk\b|diskette|cartridge/.test(s))return"disk";
 if(/modem|network|ethernet|hub/.test(s))return"modem";
 if(/printer|laserjet|deskjet|dot matrix/.test(s))return"printer";
 if(/hard drive|hard disk|cd-rom|drive|storage/.test(s))return"drive";
 if(/desktop|tower|computer|pc\b|system|amiga|apple|macintosh|atari/.test(s))return"tower";
 return"box"}
function srect(x,y,w,h,f,s,r){return'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+f+'"'+(s?' stroke="'+s+'" stroke-width="2"':"")+(r?' rx="'+r+'"':"")+'/>'}
function prodObj(k,R,P){var o="",i,j;
 if(k==="laptop"){o+='<polygon points="46,44 194,44 186,118 54,118" fill="#aaaaaa" stroke="#000" stroke-width="3"/><polygon points="56,52 184,52 178,110 62,110" fill="#0000aa" stroke="#555" stroke-width="2"/>'+'<text x="68" y="76" font-family="monospace" font-size="13" fill="#fff">C:\\&gt;_</text>'+srect(68,88,60,4,"#55ffff")+srect(68,97,40,4,"#ffff55")
  +'<polygon points="30,124 210,124 226,146 14,146" fill="#888" stroke="#000" stroke-width="3"/>';for(i=0;i<3;i++)for(j=0;j<14;j++)o+=srect(38+j*11+i*3,128+i*5,8,3,"#333");o+=srect(96,140,48,4,"#555")}
 else if(k==="card"){o+=srect(24,56,190,80,"#00aa00","#000")+srect(24,56,10,80,"#c0c0c0","#000")+'<rect x="24" y="52" width="10" height="90" fill="#aaa" stroke="#000" stroke-width="2"/>'
  +srect(56,136,140,10,"#ffaa00","#000");for(i=0;i<22;i++)o+=srect(58+i*6,138,3,8,"#ffff55");
  o+=srect(60,70,46,30,"#111","#000")+srect(118,70,34,22,"#111","#000")+srect(162,74,40,16,"#111","#000")+srect(70,108,28,14,"#222","#000");
  for(i=0;i<10;i++)o+='<line x1="'+(60+i*5)+'" y1="70" x2="'+(60+i*5)+'" y2="66" stroke="#ccc" stroke-width="1.5"/>';
  for(i=0;i<5;i++)o+='<circle cx="'+(120+i*14)+'" cy="112" r="5" fill="#0000aa" stroke="#000"/>';
  o+=srect(2,72,22,12,"#333","#000")+srect(2,92,22,12,"#333","#000")+srect(2,112,22,12,"#333","#000")+'<circle cx="13" cy="78" r="3" fill="#55ff55"/><circle cx="13" cy="98" r="3" fill="#ff5555"/><circle cx="13" cy="118" r="3" fill="#55ffff"/>'}
 else if(k==="keyboard"){o+='<polygon points="20,70 220,70 232,130 8,130" fill="#c8c8c8" stroke="#000" stroke-width="3"/>';
  for(i=0;i<4;i++)for(j=0;j<15;j++){var w=(i===3&&j>3&&j<9)?0:1;o+=srect(22+j*13.4-i*1.5+ (i*2),76+i*11,10.5,8,"#eee","#666")}
  o+=srect(72,120,86,7,"#eee","#666")+srect(196,72,18,5,"#0000aa")+'<circle cx="26" cy="74" r="2" fill="#0f0"/>'}
 else if(k==="synth"){o+=srect(8,54,224,84,"#222","#000",3)+srect(8,54,224,10,"#444")+srect(20,72,86,30,"#88aa00","#000")+'<text x="26" y="92" font-family="monospace" font-size="12" fill="#113300">MT&gt;PART 1  VOL</text>'
  for(i=0;i<6;i++)o+='<circle cx="'+(126+i*16)+'" cy="86" r="6" fill="#ddd" stroke="#000"/><line x1="'+(126+i*16)+'" y1="86" x2="'+(126+i*16+3)+'" y2="80" stroke="#000" stroke-width="2"/>';
  for(i=0;i<8;i++)o+=srect(20+i*17,112,12,8,i%3?"#888":"#aa0000","#000");for(i=0;i<3;i++)o+='<circle cx="'+(178+i*16)+'" cy="124" r="4" fill="#000" stroke="#aaa"/>';o+='<circle cx="30" cy="62" r="2.5" fill="#f00"/>'}
 else if(k==="monitor"){o+=srect(40,28,160,108,"#bdb7a8","#000",8)+srect(52,40,136,80,"#003300","#000",6)+'<text x="62" y="64" font-family="monospace" font-size="13" fill="#55ff55">READY.</text>'+srect(62,74,60,3,"#55ff55")+srect(62,84,40,3,"#55ff55")+srect(94,136,52,10,"#bdb7a8","#000")+srect(70,146,100,8,"#bdb7a8","#000")+'<circle cx="176" cy="128" r="3" fill="#0f0"/>'}
 else if(k==="mouse"){o+='<path d="M120 54 C150 54 160 82 160 116 C160 140 142 148 120 148 C98 148 80 140 80 116 C80 82 90 54 120 54Z" fill="#dcd8c8" stroke="#000" stroke-width="3"/><line x1="120" y1="54" x2="120" y2="96" stroke="#000" stroke-width="3"/><path d="M82 96 H158" stroke="#000" stroke-width="3"/><path d="M120 54 C120 30 110 24 96 14" fill="none" stroke="#000" stroke-width="3"/>'}
 else if(k==="joystick"){o+=srect(50,110,140,34,"#333","#000",6)+'<line x1="120" y1="112" x2="120" y2="52" stroke="#555" stroke-width="12"/><circle cx="120" cy="46" r="18" fill="#aa0000" stroke="#000" stroke-width="3"/>'+'<circle cx="80" cy="128" r="8" fill="#ff5555" stroke="#000" stroke-width="2"/><circle cx="160" cy="128" r="8" fill="#5555ff" stroke="#000" stroke-width="2"/>'}
 else if(k==="disk"){o+=srect(62,34,116,112,"#222","#000",4)+srect(86,34,68,44,"#c0c0c0","#000")+srect(136,40,10,32,"#222")+srect(78,96,84,50,"#f2f2f2","#000")+'<text x="84" y="116" font-family="monospace" font-size="11" fill="#0000aa">DISK 1 OF 3</text>'+srect(84,124,72,2,"#aa0000")+srect(84,132,60,2,"#aa0000")}
 else if(k==="modem"){o+=srect(24,84,192,54,"#d8d2c0","#000",4)+srect(24,74,192,12,"#bdb7a8","#000");var lb=["HS","AA","CD","OH","RD","SD","TR","MR"];for(i=0;i<8;i++)o+='<circle cx="'+(48+i*20)+'" cy="104" r="4" fill="'+(i%3?"#55ff55":"#ff5555")+'" stroke="#000"/><text x="'+(44+i*20)+'" y="124" font-family="monospace" font-size="8" fill="#000">'+lb[i]+'</text>';o+='<path d="M216 100 C236 100 236 60 210 50" fill="none" stroke="#000" stroke-width="3"/>'}
 else if(k==="printer"){o+=srect(40,90,160,46,"#d8d2c0","#000",4)+srect(58,44,124,50,"#f2f2f2","#000")+'<line x1="66" y1="56" x2="170" y2="56" stroke="#777"/><line x1="66" y1="66" x2="150" y2="66" stroke="#777"/><line x1="66" y1="76" x2="160" y2="76" stroke="#777"/>'+srect(70,120,100,6,"#333")+'<circle cx="184" cy="106" r="3" fill="#0f0"/>'}
 else if(k==="drive"){o+=srect(30,58,180,80,"#bdb7a8","#000",4)+srect(46,84,120,10,"#222")+srect(46,102,60,6,"#555")+'<circle cx="186" cy="76" r="4" fill="#0f0" stroke="#000"/>'+srect(176,100,22,22,"#888","#000")+'<text x="48" y="76" font-family="monospace" font-size="11" fill="#000">READ / WRITE</text>'}
 else if(k==="tower"){o+=srect(62,24,116,124,"#d0c9b5","#000",4)+srect(72,36,96,16,"#aaa","#000")+srect(72,58,96,16,"#aaa","#000")+srect(72,80,96,10,"#555","#000")+srect(84,84,50,2,"#000")+srect(72,98,44,10,"#111","#000")+'<circle cx="150" cy="106" r="4" fill="#0f0" stroke="#000"/><circle cx="162" cy="106" r="4" fill="#f00" stroke="#000"/>'+srect(72,118,96,6,"#aaa","#000")+srect(72,130,96,6,"#aaa","#000")+'<text x="106" y="47" font-family="monospace" font-size="9" fill="#000">TURBO</text>'}
 else{o+=typeof prodObj2==="function"?prodObj2(k,R,P||["#d0c9b5","#a8a290","#0000aa"]):""}
 return o}
function prodSvg(it,w,h,uid){var kind=prodKind(it),R=rng(hstr(it.name||"x")),sk=AD_SKY[Math.floor(R()*AD_SKY.length)],g="pg"+uid,o='<svg viewBox="0 0 240 180" width="'+w+'" height="'+h+'" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Drawing of '+esc(it.name)+'" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="'+g+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+sk[0]+'"/><stop offset="1" stop-color="'+sk[1]+'"/></linearGradient></defs><rect width="240" height="180" fill="url(#'+g+')"/>',i;
 for(i=0;i<14;i++){var a=i*Math.PI/7,a2=a+Math.PI/14;o+='<polygon points="120,90 '+(120+Math.cos(a)*260).toFixed(0)+","+(90+Math.sin(a)*260).toFixed(0)+" "+(120+Math.cos(a2)*260).toFixed(0)+","+(90+Math.sin(a2)*260).toFixed(0)+'" fill="#fff" opacity=".10"/>'}
 for(i=0;i<26;i++)o+=srect(Math.floor(R()*238),Math.floor(R()*170),R()<.2?2:1,R()<.2?2:1,"#fff");
 o+='<ellipse cx="122" cy="156" rx="90" ry="9" fill="#000" opacity=".45"/>'+prodObj(kind,R,typeof PAL!=="undefined"?PAL[Math.floor(R()*PAL.length)]:null);
 return o+'</svg>'}

/* game and hardware posters: theme by title keywords so a "Space Quest" does not look like a "King's Quest" */
var AD_THEMES=[["space|star|galax|cosmic|alien|moon|planet|orbit|astro|zone|wing commander|xeno|mars|rocket|nova|cyber",0],["king|dragon|knight|castle|sword|realm|dungeon|magic|wizard|ultima|might|heroes|legend|zork|kyrandia|quest for glory|conquest|camelot|crown",1],["race|speed|car|drive|rally|grand prix|nascar|need for|road|motor|indy|bike|turbo|formula",2],["police|mystery|murder|detective|crime|noir|hunt|larry|manhunter|blackwell|colonel|dagger|secret|case|clue|sherlock",3],["sea|island|ocean|pirate|monkey|dive|submar|boat|ship|fish|reef|cove",4],["war|battle|command|tank|army|soldier|doom|quake|wolfenstein|duke|shadow|blood|marine|strike|storm|commando|fps|shot",5]];
function themeOf(t){t=t.toLowerCase();for(var i=0;i<AD_THEMES.length;i++)if(new RegExp(AD_THEMES[i][0]).test(t))return AD_THEMES[i][1];return-1}
function hwKindOfTitle(t){var s=t.toLowerCase();
 if(/laptop|notebook|libretto|thinkpad|portable|lte|omnibook|palmtop|handheld|t1100|presario 1|pda|jornada|zaurus/.test(s))return"laptop";
 if(/laserjet|deskjet|printer/.test(s))return"printer";if(/monitor|display|trinitron|multisync/.test(s))return"monitor";
 if(/sound|audio|blaster|canvas|adlib|ultrasound|graphics|card|vga|adapter|voodoo|riva|geforce|radeon|matrox|s3 |nvidia|3dfx|creative/.test(s))return"card";
 if(/keyboard/.test(s))return"keyboard";if(/mouse/.test(s))return"mouse";if(/joystick|gamepad|controller/.test(s))return"joystick";
 if(/modem|ethernet|network/.test(s))return"modem";if(/drive|cd-rom|dvd|zip|disk/.test(s))return"drive";if(/sc-55|mt-32|sc-88|midi|synth/.test(s))return"synth";
 return"tower"}
function themeScene(idx,R,sk){var o="",i,x;
 if(idx===1){o+='<circle cx="140" cy="38" r="16" fill="'+sk[2]+'"/>';o+='<polygon points="0,110 26,86 52,100 82,70 112,98 150,80 180,104 180,150 0,150" fill="#000" opacity=".5"/>';
  o+=srect(52,60,76,66,"#7a7a7a","#000")+srect(44,50,20,76,"#8a8a8a","#000")+srect(116,50,20,76,"#8a8a8a","#000");for(i=0;i<3;i++)o+=srect(44+i*7,44,5,8,"#8a8a8a","#000")+srect(116+i*7,44,5,8,"#8a8a8a","#000");
  o+='<path d="M78 126 V96 A12 12 0 0 1 102 96 V126Z" fill="#1a0a00" stroke="#000" stroke-width="2"/><polygon points="90,20 90,44 108,32" fill="#aa0000"/><line x1="90" y1="16" x2="90" y2="50" stroke="#000" stroke-width="2"/>';o+=srect(0,126,180,24,"#005500");for(i=0;i<20;i++)o+=srect(Math.floor(R()*176),128+Math.floor(R()*20),2,3,"#55ff55")}
 else if(idx===2){o+='<circle cx="90" cy="70" r="26" fill="'+sk[2]+'"/>';o+='<polygon points="0,84 180,84 180,150 0,150" fill="#222"/><polygon points="80,84 100,84 172,150 8,150" fill="#555"/>';for(i=0;i<5;i++){var yy=90+i*i*3+i*2;o+=srect(88,yy,4,3+i,"#ffff55")}
  o+='<polygon points="62,128 118,128 112,110 68,110" fill="#aa0000" stroke="#000" stroke-width="2"/>'+srect(66,124,52,10,"#ff5555","#000")+'<circle cx="72" cy="136" r="7" fill="#111" stroke="#000"/><circle cx="110" cy="136" r="7" fill="#111" stroke="#000"/>'}
 else if(idx===3){for(i=0;i<9;i++){var bh=40+Math.floor(R()*60),bx=i*21-4;o+=srect(bx,130-bh,19,bh,"#111","#000");for(var j=0;j<Math.floor(bh/14);j++)if(R()<.55)o+=srect(bx+4,136-bh+j*14,4,5,"#ffff55")+(R()<.5?srect(bx+11,136-bh+j*14,4,5,"#ffff55"):"")}
  o+='<circle cx="140" cy="30" r="14" fill="#ddd" opacity=".9"/>'+srect(0,130,180,20,"#000")+'<polygon points="70,130 76,100 86,100 92,130" fill="#000"/><circle cx="81" cy="94" r="7" fill="#000"/><polygon points="72,100 90,100 100,112 62,112" fill="#000"/><rect x="66" y="120" width="30" height="3" fill="#ffff55" opacity=".6"/>'}
 else if(idx===4){o+='<circle cx="140" cy="36" r="16" fill="'+sk[2]+'"/>';o+=srect(0,90,180,60,"#0000aa");for(i=0;i<8;i++)o+='<path d="M'+(i*24-6)+' '+(96+(i%3)*10)+' q6 -6 12 0 q6 6 12 0" fill="none" stroke="#55ffff" stroke-width="2"/>';
  o+='<polygon points="52,90 128,90 118,110 62,110" fill="#8a5a1a" stroke="#000" stroke-width="2"/><line x1="90" y1="90" x2="90" y2="34" stroke="#000" stroke-width="3"/><polygon points="90,36 90,84 130,84" fill="#eee" stroke="#000" stroke-width="2"/><polygon points="90,44 90,84 58,84" fill="#ddd" stroke="#000" stroke-width="2"/>'}
 else if(idx===5){o+='<circle cx="140" cy="36" r="18" fill="#ff5555" opacity=".85"/>';o+='<polygon points="0,110 30,90 60,104 96,84 130,106 180,92 180,150 0,150" fill="#000" opacity=".6"/>';for(i=0;i<6;i++)o+='<line x1="'+(20+i*28)+'" y1="0" x2="'+(10+i*28)+'" y2="150" stroke="#ffaa00" stroke-width="1" opacity=".4"/>';
  o+=srect(0,120,180,30,"#3a2a1a")+'<polygon points="60,120 66,96 88,96 94,120" fill="#333" stroke="#000" stroke-width="2"/><rect x="66" y="80" width="22" height="18" fill="#556b2f" stroke="#000" stroke-width="2"/><rect x="88" y="86" width="34" height="5" fill="#222" stroke="#000"/><circle cx="130" cy="88" r="3" fill="#ffff55"/><circle cx="138" cy="88" r="2" fill="#ffaa00"/>'}
 return o}
function adArtX(r,w,h,uid){return typeof artFor==="function"?artFor(r,w,h,uid):adArtLegacy(r,w,h,uid)}
function adArtLegacy(r,w,h,uid){var kind=r[1];
 if(kind==="hw"||kind==="pe"||kind==="sw"&&/os|windows|dos/i.test(r[2])){if(kind==="hw"||kind==="pe"){var k=hwKindOfTitle(r[2]);return prodSvg({name:r[2],cat:k==="laptop"?"laptop":k,type:"",model:""},w,h,uid)}return null}
 if(kind!=="gt"&&kind!=="gn"&&kind!=="sw")return null;var idx=themeOf(r[2]);if(idx<0||idx===0)return null;
 var R=rng(hstr(r[2])),sk=AD_SKY[Math.floor(R()*AD_SKY.length)],g="ag"+uid,o='<svg viewBox="0 0 180 150" width="'+w+'" height="'+h+'" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Generated artwork for '+esc(r[2])+'" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="'+g+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+(idx===3?"#000":sk[0])+'"/><stop offset="1" stop-color="'+sk[1]+'"/></linearGradient></defs><rect width="180" height="150" fill="url(#'+g+')"/>',i;
 for(i=0;i<16;i++)o+=srect(Math.floor(R()*178),Math.floor(R()*60),1,1,"#fff");
 return o+themeScene(idx,R,sk)+'</svg>'}

/* ---------- item ads: built from the museum record and the timeline ---------- */
var SPEC_PRIO={laptop:["CPU speed","CPU","RAM installed","Display","Storage","Sound","Battery","Weight"],card:["Audio","Bus","Chipset","Video RAM","Memory","Interfaces","Sound"],keyboard:["Switch type","Layout","Connector","Interface"],synth:["Synthesis","Polyphony","Channels","Connectors"],monitor:["Diagonal size","Max resolution","Refresh rate","Dot pitch"],tower:["CPU speed","CPU","RAM installed","Storage","Graphics","Sound"],mouse:["Buttons","Resolution or DPI","Connector"],joystick:["Buttons","Connector","Interface"],drive:["Capacity","Interface","Speed or RPM","Access time"],modem:["Speed","Interface","Standards"],printer:["Technology","Resolution","Speed","Interface"],disk:["Capacity"],box:[]};
var AD_HEAD={laptop:["Your whole office. Your whole pocket.","Take the desk with you.","Small on the outside. All DOS on the inside."],card:["Give your PC a voice.","Turn the beige box up to eleven.","Hear what you have been missing."],keyboard:["Type like you mean it.","Built to outlast the computer.","Every key, a decision."],synth:["A full band in one box.","Real music from a real MIDI cable.","Your games never sounded so grown up."],monitor:["See it. Believe it.","Flicker-free is a promise. Nearly."],tower:["The power under the hood is a lot.","Big beige. Bigger plans."],mouse:["Point. Click. Conquer.","Rolls on any desk. Any desk with a pad."],joystick:["Fly it like you stole it.","Now you are in control."],drive:["Room to grow. Then room to grow again.","More space, fewer floppies."],modem:["Dial in. Log on. Hang up on the phone line.","Your line to the world. Please stay off the phone."],printer:["Paper, but faster.","Black on white, on demand."],disk:["Insert disk 1 to begin."],box:["New. Improved. Vintage."]};
function priceOf(it){if(it.msrp)return{t:it.msrp,est:false};var n=it.name.toLowerCase(),best=null;
 TL.forEach(function(r){if(r[3]&&(n.indexOf(r[2].toLowerCase())>=0||r[2].toLowerCase().indexOf(n)>=0)&&Math.abs(dyear(r[0])-(it.year||0))<=1)best=r});
 return best?{t:best[3],est:/\*$/.test(best[3])}:{t:"MSRP ?",est:true,none:true}}
function firstSentence(t){if(!t)return"";var m=String(t).match(/^.{20,180}?[.!?](\s|$)/);return m?m[0].trim():String(t).slice(0,160)}
function shortVal(v,n){v=String(v).replace(/\s+/g," ");return v.length>n?v.slice(0,n-1).replace(/[\s,;(]+\S*$/,"")+"...":v}
function chipVal(v){v=String(v).replace(/\s+/g," ");var m=v.split(/[(,;]| with | plus /)[0].trim();return m.length>22?m.slice(0,21).replace(/\s+\S*$/,"")||m.slice(0,21):m}
function pickSpecs(it,k){var sp=it.specs||{},out=[],pr=SPEC_PRIO[k]||[],seen={};pr.forEach(function(p){if(sp[p]&&!seen[p]){seen[p]=1;out.push([p,sp[p]])}});Object.keys(sp).forEach(function(p){if(!seen[p]&&sp[p]&&out.length<8){seen[p]=1;out.push([p,sp[p]])}});return out}
function sameMaker(it){var mk=(it.maker||"").split(/[\s\/,(]/)[0].toLowerCase();if(mk.length<3||mk==="unknown")return[];var n=it.name.toLowerCase(),d=it.year||0;
 return TL.filter(function(r){return(r[1]==="hw"||r[1]==="sw"||r[1]==="w")&&(r[2].toLowerCase().indexOf(mk)>=0||(r[4]||"").toLowerCase().indexOf(mk)>=0)&&n.indexOf(r[2].toLowerCase())<0&&r[2].toLowerCase().indexOf(n)<0})
  .sort(function(a,b){return Math.abs(dyear(a[0])-d)-Math.abs(dyear(b[0])-d)}).slice(0,6).sort(function(a,b){return a[0]<b[0]?-1:1})}
function priceBig(p){if(p.none)return"?";var m=String(p.t).match(/[$£¥][\d,.]+/);return m?m[0]:String(p.t).slice(0,9)}
function czSeason(d){var m=+String(d).slice(5,7)||0;return m>=11||m===12?"HOLIDAY GIFT GUIDE":m>=6&&m<=8?"SUMMER SOFTWARE SAVINGS":m>=1&&m<=2?"NEW YEAR NEW ARRIVALS":m>=3&&m<=5?"SPRING PC SPECIALS":"BACK TO SCHOOL PC PICKS"}
function czLogo(name){var w=String(name).split(" ");return'<span class="cz-logo"><b>'+esc(w[0])+'</b> <em>'+esc(w.slice(1).join(" "))+'</em></span>'}
function czFlag(p,est){return'<span class="cz-price'+(p.est||est?" est":"")+'" aria-label="Price '+esc(p.t)+'"><i>'+(p.none?"PRICE":p.est||est?"EST. PRICE":"LAUNCH PRICE")+'</i><b>'+esc(priceBig(p))+(p.est&&!p.none&&priceBig(p).slice(-1)!=="*"?"*":"")+'</b></span>'}
function czHead(store,left,right){return'<div class="cz-head"><div class="cz-hl">'+czLogo(store)+'<span class="cz-sub">'+esc(left)+'</span></div><div class="cz-hr">'+esc(right)+'</div></div>'}
function czBox(r,i){var p=guessPrice(r,dyear(r[0]));return'<article class="cz-box"><div class="cz-art">'+adArt(r,150,125,"z"+i)+'<span class="cz-spine"></span></div><h4>'+esc(r[2])+'</h4><p class="cz-meta">'+(r[1]==="hw"?"Hardware":"Game or software")+' &middot; '+esc(adWhen(r).replace("COMING","Ships"))+'</p>'+czFlag(p)+'<p class="cz-tag">'+esc(adTag(r))+'</p></article>'}
function adShelf(picks){if(!picks.length)return"";var d=picks[0][0];
 return'<section class="cz cz-shelf" aria-label="Tribute advertisement">'+czHead(adStore(picks[0]),"Coming soon: reserve yours today","Computers, software & games")
  +'<div class="cz-row">'+picks.map(czBox).join("")+'</div>'
  +'<table class="cz-tbl"><caption>Release schedule</caption><thead><tr><th>Title</th><th>Ships</th><th>Price</th></tr></thead><tbody>'+picks.map(function(r){var p=guessPrice(r,dyear(r[0]));return'<tr><td>'+esc(r[2])+'</td><td>'+esc(fmtDate(r[0]))+(r[5]?"":"*")+'</td><td>'+esc(p.t)+'</td></tr>'}).join("")+'</tbody></table>'
  +'<p class="cz-fine">Tribute ad in the style of 1990s computer software store flyers. Made-up store, real timeline data. Nothing here can be ordered. Prices marked * are estimates and dates marked * are unconfirmed.</p></section>'}
function adBanner(r){var p=guessPrice(r,dyear(r[0]));
 return'<aside class="cz cz-bar" aria-label="Tribute advertisement"><div class="cz-art sm">'+adArt(r,72,60,"b")+'</div><div class="cz-bt">'+czLogo(adStore(r))+'<b>'+esc(r[2])+'</b><span>'+esc(adWhen(r))+'</span></div>'+czFlag(p)+'<button class="adx" type="button" aria-label="Close this ad">&times;</button></aside>'}
function adBar(picks){var gone=false;try{gone=sessionStorage.getItem("cm-adx")==="1"}catch(e){}return picks.length&&!gone?adBanner(picks[0]):""}
function adItem(it){var k=prodKind(it),p=priceOf(it),sp=pickSpecs(it,k),head=(AD_HEAD[k]||AD_HEAD.box),h=head[hstr(it.name)%head.length],
  ph=it.photos&&it.photos.length?safeUrl(it.photos[0],"img"):"",art=ph?'<img src="'+esc(ph)+'" alt="'+esc(it.name)+'" loading="lazy">':prodSvg(it,240,180,"i"),
  store=(k==="card"||k==="synth"||k==="keyboard"||k==="mouse"||k==="joystick"||k==="disk"||k==="drive"||k==="modem")?"Bit Barn Computers":(k==="laptop"||k==="tower"||k==="monitor"||k==="printer")?"Bit Barn Computers":"Bargain Bytes Software",
  when=it.rel||it.year||"",
  feats=sp.slice(0,6).map(function(s){return'<li><b>'+esc(s[0])+':</b> '+esc(shortVal(s[1],70))+'</li>'}).join(""),
  chips=sp.slice(0,4).map(function(s){return'<div class="cz-chip"><b>'+esc(chipVal(s[1]))+'</b><span>'+esc(s[0])+'</span></div>'}).join(""),
  ex=(it.extras||[]),mark={Have:"[x]",Want:"[ ]",Missing:"[!]",Optional:"[ ]"},
  exl=ex.slice(0,7).map(function(e){return'<li class="e-'+esc((e.s||"").toLowerCase())+'"><code>'+(mark[e.s]||"[ ]")+'</code> '+esc(e.n)+' <small>'+esc(e.s||"")+'</small></li>'}).join(""),
  lg=logsOf(it),mk=sameMaker(it),
  file=[["Status",it.status],["Working",it.works],["Condition",it.cond],["On hand",(it.qty||1)+" in the museum"],["Log entries",lg.length?lg.length+" (latest "+fmtDate(lg[0].d)+")":"none yet"]].filter(function(x){return x[1]}).map(function(x){return'<div><span>'+esc(x[0])+'</span><b>'+esc(shortVal(x[1],46))+'</b></div>'}).join(""),
  sc=it.score!=null?scoreBlock(it.score):"";
 return'<section class="cz cz-item" aria-label="Tribute advertisement for '+esc(it.name)+'">'+czHead(store,czSeason(when),"Computers, software & games"+(when?" · "+fmtDate(when)+(it.relx?"*":""):""))
 +'<div class="cz-main"><div class="cz-figure"><div class="cz-art big">'+art+'</div>'+czFlag(p)+'<span class="cz-new">'+("IN THE MUSEUM")+'</span></div>'
 +'<div class="cz-copy"><h3 class="cz-h">'+esc(h)+'</h3><p class="cz-name">'+esc(it.name)+(it.maker&&it.maker!=="Unknown"?' <em>by '+esc(it.maker)+'</em>':"")+'</p>'+(it.text?'<p class="cz-sub2">'+esc(firstSentence(it.text))+'</p>':"")+(feats?'<ul class="cz-feat">'+feats+'</ul>':'<p class="cz-sub2">Specs coming soon.</p>')+'</div></div>'
 +(chips?'<div class="cz-chips">'+chips+'</div>':"")
 +'<div class="cz-cols"><div class="cz-panel"><h4>From the museum file</h4>'+file+(sc?'<div class="cz-sc">'+sc+'</div>':"")+'</div>'
 +(exl?'<div class="cz-panel"><h4>Accessories checklist</h4><ul class="cz-ex">'+exl+'</ul></div>':"")
 +'<div class="cz-coupon"><h4>Mail-in coupon</h4><p>Item <b>'+esc(it.name)+'</b></p>'+(it.model?'<p>Model <b>'+esc(it.model)+'</b></p>':"")+(it.partno?'<p>Part no. <b>'+esc(it.partno)+'</b></p>':"")+'<p>Price <b>'+esc(p.none?"see your dealer":p.t)+'</b></p><p>Qty [_] &nbsp; Ship to [__________]</p><small>Cut along the dotted line. Not a real coupon: nothing can be bought here.</small></div></div>'
 +(mk.length?'<div class="cz-more"><h4>Also from '+esc(it.maker)+'</h4><ul>'+mk.map(function(r){return'<li><a href="#/timeline/'+dyear(r[0])+'"><b>'+esc(fmtDate(r[0]))+(r[5]?"":"*")+'</b> '+esc(r[2])+(r[3]?' <span>'+esc(r[3])+'</span>':"")+'</a></li>'}).join("")+'</ul></div>':"")
 +'<p class="cz-fine">Tribute ad in the style of 1990s computer software store flyers. Made-up store, real museum data. * means unconfirmed or estimated.</p></section>'}
