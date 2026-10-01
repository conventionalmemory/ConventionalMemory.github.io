// MEMORY MAZE, a trivia maze for ConventionalMemory.io
// A nod to Encarta '95's MindMaze, dressed like a Sierra mystery from 1989 (EGA palette, a ticking clock, a house at night).
// The questions come from the museum catalog (ITEMS) and the timeline (TL). Only dates confirmed against a source are used as answers.
(function(){
"use strict";
var C={k:"#000000",b:"#0000AA",g:"#00AA00",c:"#00AAAA",r:"#AA0000",m:"#AA00AA",n:"#AA5500",l:"#AAAAAA",d:"#555555",B:"#5555FF",G:"#55FF55",C:"#55FFFF",R:"#FF5555",M:"#FF55FF",y:"#FFFF55",w:"#FFFFFF"};
var W=320,H=136,FLOOR=78,COLS=5,ROWS=4,ROOMS=COLS*ROWS,MIDNIGHT=240,PENALTY=32;
var S=null,host=null,cvs=null,cx=null,raf=0,last=0,onKey=null,onKeyUp=null,keys={},D={},patCache={},roomCache={},deps=null;
var DIRS=[["N",0,-1],["E",1,0],["S",0,1],["W",-1,0]],OPP={N:"S",S:"N",E:"W",W:"E"};
var NAMES=["Boot Room","Sound Card Salon","Floppy Library","Green Phosphor Lounge","BIOS Basement","Modem Nook","Cable Closet","Cartridge Gallery","Keyboard Parlor","Patch Panel Pantry","Beige Box Bedroom","Dial-Up Den","Scanline Solarium","Upper Memory Attic","Extended Memory Wing","Expansion Slot Corridor","Turbo Button Terrace","Diagnostic Lab"];
var FLAVOR=["Rain lashes the tall windows.","A grandfather clock ticks. It sounds a little like a hard drive seeking.","Something hums inside the walls. Probably the fridge. Probably.","The floor creaks in a way that feels like a warning.","A lamp flickers. Somewhere a power supply sighs.","The air smells like warm plastic and old carpet.","Thunder rolls. The whole house loses a K.","You are certain that portrait blinked."];
var MATT_LINES=["Matt: \"Every item in here has a story. Some of the stories are about a shipping error.\"","Matt: \"Do not touch that. I have not finished cataloging it. Or fixing it.\"","Matt: \"If it boots, it goes in the museum. If it does not boot, it goes in the museum faster.\""];
var TONY_LINES=["Tony: \"Don't touch anything warm. Or cold. Or that clicks.\"","Tony: \"I can fix that. Give me a screwdriver and a bad idea.\"","Tony: \"Somebody left a jumper on the wrong pins. It was me. Keep walking.\""];
var AUNT=["Auntie Autoexec: \"Dear, the master disk is that way. I have always known. I just never got asked.\"","Auntie Autoexec: \"Take your time. Actually, do not. It is nearly midnight.\""];
var STATIC=[
["How much conventional memory could a DOS program use?","640K",["256K","512K","1024K"]],
["What does the HIMEM.SYS driver manage?","Extended memory",["Expanded memory cards","The hard drive cache","The sound card"]],
["Which file did DOS read at startup to load device drivers?","CONFIG.SYS",["WIN.INI","COMMAND.COM","SYSTEM.DAT"]],
["Which file did DOS run at startup for your own commands?","AUTOEXEC.BAT",["STARTUP.EXE","BOOT.INI","RUN.SYS"]],
["What is the 384K between 640K and 1 MB called?","The upper memory area",["The high score area","Video swap space","The BIOS cache"]],
["Which CPU first brought protected mode to the PC?","The 80286",["The 8088","The 6502","The Pentium"]],
["Which CPU was the first 32-bit chip in the x86 family?","The 80386",["The 80286","The 8086","The 80186"]],
["Which came first on the PC: CGA, EGA or VGA?","CGA",["EGA","VGA","They shipped together"]],
["How many colors does VGA mode 13h show at once?","256",["16","64","4096"]],
["How many colors does standard EGA show at once?","16",["4","256","64 at once from a palette of 16"]],
["What did the Turbo button on a 386 case usually do?","Slowed the CPU for old software",["Overclocked the CPU","Cleared memory","Parked the disk heads"]],
["What did DOS=HIGH (from DOS 5.0) do?","Loaded part of DOS into the high memory area",["Made the screen brighter","Raised the baud rate","Turned on a speaker"]],
["What does BBS stand for?","Bulletin Board System",["Basic Boot Sector","Binary Byte Storage","Baud Bit Sync"]],
["What does IRQ stand for?","Interrupt Request",["Internal Read Queue","Input Register Query","Interface Reset Quick"]],
["What does ISA stand for on old expansion slots?","Industry Standard Architecture",["Integrated System Adapter","Intel Slot Alliance","Internal Serial Array"]],
["Which key combination warm-boots a DOS PC?","Ctrl+Alt+Del",["Alt+F4","Ctrl+Z","Shift+Esc"]],
["What was the standard DOS prompt on the first hard drive?","C:\\>",["A:\\>","$ ","READY."]],
["Which file extension did DOS batch files use?",".BAT",[".SCR",".CMD",".EXE"]],
["What does the DOS wildcard * match?","Any run of characters",["Exactly one character","Only numbers","Only file extensions"]],
["Which game series stars Guybrush Threepwood?","Monkey Island",["King's Quest","Space Quest","Full Throttle"]],
["Which extender let Doom use protected mode memory?","DOS/4GW",["HIMEM.SYS","QEMM","DOSSHELL"]],
["What did the SETVER command do?","Told a program to see a different DOS version",["Set the volume","Set the video mode","Set the verbose flag for the boot"]],
["How much did a standard high-density 3.5-inch floppy hold?","1.44 MB",["360 KB","720 MB","100 MB"]],
["Which Encarta '95 feature was a maze you escaped by answering questions?","MindMaze",["Sound Maze","Mosaic","Word Search 95"]],
["What did EMM386.EXE provide?","Upper memory blocks and expanded memory emulation",["Sound card drivers","A screen saver","Disk compression"]],
["Which Windows version first added TrueType fonts?","Windows 3.1",["Windows 1.0","Windows 3.0","Windows 95"]],
["In DOS, what usually refers to the first floppy drive?","A:",["C:","Z:","F1"]],
["What does the DOS command CHKDSK do?","Checks a disk and reports its status",["Formats a disk","Checks the keyboard","Checks for viruses only"]],
["What does 'baud' roughly measure on a modem?","Signal changes per second",["Bytes per file","Volts on the line","Ring count"]],
["What is the first part of the Konami code?","Up, Up, Down, Down",["Left, Right, Left, Right","B, A, B, A","Start, Select"]]];
var MAKERS=["IBM","Apple","Commodore","Atari","Sega","Nintendo","Creative Labs","Microsoft","Intel","Roland","Toshiba","Compaq","Tandy","Sinclair","Sierra","LucasArts","id Software","Blizzard","Origin Systems","Sony"];

/* ---------- small helpers ---------- */
var seed=1;function R(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}
function ri(n){return Math.floor(R()*n)}
function pick(a){return a[ri(a.length)]}
function shuf(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=ri(i+1),t=a[i];a[i]=a[j];a[j]=t}return a}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function dn(d){var p=String(d).split("-"),y=+p[0],m=p[1]?+p[1]:7,dd=p[2]?+p[2]:15;return y*372+(m-1)*31+dd}
function prec(d){return String(d).split("-").length}
function yr(d){return +String(d).slice(0,4)}
function clock(m){var t=20*60+m,h=Math.floor(t/60)%24,mm=t%60,ap=h>=12?"PM":"AM",h12=h%12||12;return h12+":"+String(mm).padStart(2,"0")+" "+ap}

/* ---------- questions ---------- */
function mk(text,right,wrongs,tag){var o=shuf([right].concat(wrongs.slice(0,3)));return{q:text,o:o,c:o.indexOf(right),tag:tag||""}}
function group(k){return k==="gt"||k==="gn"||k==="gc"?"g":k==="w"||k==="u"||k==="e"?"x":k}
function nameOf(r){return r[2].replace(/ \(film\)$/,"")}
function qYear(r,lvl){var y=yr(r[0]),sp=[9,5,2][lvl],o=[],n=0;
 while(o.length<3&&n++<80){var v=y+Math.round((R()*2-1)*sp*1.5);if(v!==y&&o.indexOf(v)<0&&v>=1970&&v<=2011)o.push(v)}
 for(var k=1;o.length<3;k++){if(o.indexOf(y+k)<0&&y+k<=2011)o.push(y+k);else if(o.indexOf(y-k)<0)o.push(y-k)}
 var g=group(r[1]),t=nameOf(r),q=g==="g"?'In what year was the game "'+t+'" released?':r[1]==="m"?'In what year did the movie "'+t+'" open?':g==="x"?"In what year did this happen: "+t+"?":'In what year did the "'+t+'" come out?';
 return mk(q,String(y),o.map(String),"year")}
function qFirst(list){var g=group(pick(list)[1]),c=shuf(list.filter(function(r){return group(r[1])===g&&prec(r[0])>=2})),o=[];
 for(var i=0;i<c.length&&o.length<4;i++){if(o.every(function(x){return Math.abs(dn(x[0])-dn(c[i][0]))>=90}))o.push(c[i])}
 if(o.length<4)return null;var f=o.slice().sort(function(a,b){return dn(a[0])-dn(b[0])})[0];
 var q=g==="g"?"Which of these games came out first?":g==="m"?"Which of these movies opened first?":g==="x"?"Which of these happened first?":"Which of these was released first?";
 return mk(q,nameOf(f),o.filter(function(x){return x!==f}).map(nameOf),"first")}
function qPrice(list,r){var g=list.filter(function(x){return x[1]===r[1]&&x!==r&&/^\$[\d,.]+$/.test(x[3])&&x[3]!==r[3]}),seen={},o=[];
 shuf(g).forEach(function(x){if(!seen[x[3]]&&o.length<3){seen[x[3]]=1;o.push(x[3])}});
 if(o.length<3)return null;return mk('What was the US launch price of the "'+nameOf(r)+'"?',r[3],o,"price")}
function qItem(it){var t=R(),o=[],y=it.year;
 if(t<.5&&y){for(var d=1;o.length<3;d++){var v=y+(o.length%2?d:-d);if(v>=1970&&v!==y&&o.indexOf(v)<0)o.push(v)}return mk('In what year was the "'+it.name+'" released?',String(y),o.map(String),"item")}
 if(it.maker&&it.maker!=="Unknown"){var w=shuf(MAKERS.filter(function(m){return m!==it.maker})).slice(0,3);return mk('Who made the "'+it.name+'"?',it.maker,w,"item")}
 return null}

/* ---- extra question kinds: drawn from the timeline, its detail data, and the museum's own items ---- */
function tx(r){return(D.x&&D.x[r[2]])||null}
function cleanPrice(p){return/^\$[\d,.]+( \([^)]*\))?$/.test(p||"")?p:""}
function qMaker(list){var c=list.filter(function(r){var x=tx(r);return x&&x.maker&&(r[1]==="hw"||r[1]==="sw"||group(r[1])==="g")});if(c.length<6)return null;var r=pick(c),x=tx(r),ms=[];
 shuf(c).forEach(function(z){var m=tx(z).maker;if(group(z[1])===group(r[1])&&m!==x.maker&&ms.indexOf(m)<0&&ms.length<3)ms.push(m)});if(ms.length<3)return null;
 return mk((group(r[1])==="g"?'Which company published the game "':'Which company made the "')+nameOf(r)+'"?',x.maker,ms,"maker")}
function qDev(list){var c=list.filter(function(r){var x=tx(r);return x&&x.dev&&group(r[1])==="g"});if(c.length<6)return null;var r=pick(c),x=tx(r),ms=[];
 shuf(c).forEach(function(z){var m=tx(z).dev;if(m!==x.dev&&ms.indexOf(m)<0&&ms.length<3)ms.push(m)});if(ms.length<3)return null;
 return mk('Which studio developed "'+nameOf(r)+'"?',x.dev,ms,"dev")}
function qSpec(list){var keys=["CPU","RAM installed","Graphics","Sound","Genre","Platform","Format","Players"],c=[];
 list.forEach(function(r){var x=tx(r);if(x&&x.specs)keys.forEach(function(k){if(x.specs[k]&&String(x.specs[k]).length<40)c.push([r,k])})});if(c.length<8)return null;
 var p=pick(c),r=p[0],k=p[1],v=String(tx(r).specs[k]),w=[];
 shuf(c.filter(function(z){return z[1]===k})).forEach(function(z){var u=String(tx(z[0]).specs[k]);if(u!==v&&w.indexOf(u)<0&&w.length<3)w.push(u)});if(w.length<3)return null;
 var nm=nameOf(r),q=k==="CPU"?'Which processor did the "'+nm+'" use?':k==="RAM installed"?'How much RAM did the "'+nm+'" ship with?':k==="Genre"?'What genre is "'+nm+'"?':k==="Platform"?'Which platform was "'+nm+'" made for?':k==="Format"?'What media did "'+nm+'" ship on?':k==="Players"?'How many players does "'+nm+'" support?':'What '+k.toLowerCase()+' did the "'+nm+'" have?';
 return mk(q,v,w,"spec")}
function qSeries(list){var c=[];list.forEach(function(r){var x=tx(r);if(x&&x.links)x.links.forEach(function(l){if((l[1]==="sequel"||l[1]==="successor")&&D.byT[l[0]])c.push([r,D.byT[l[0]]])})});if(c.length<4)return null;
 var p=pick(c),g=group(p[1][1]),w=[];shuf(D.tl.filter(function(z){return group(z[1])===g&&z[2]!==p[1][2]&&z[2]!==p[0][2]&&Math.abs(yr(z[0])-yr(p[1][0]))<=6})).forEach(function(z){if(w.length<3&&w.indexOf(nameOf(z))<0)w.push(nameOf(z))});if(w.length<3)return null;
 return mk('Which of these followed "'+nameOf(p[0])+'"?',nameOf(p[1]),w,"series")}
function pnum(p){var m=String(p).replace(/,/g,"").match(/[\d.]+/);return m?+m[0]||1:1}
function qPriceX(list){var c=list.filter(function(r){return cleanPrice(r[3])&&(r[1]==="hw"||r[1]==="sw"||group(r[1])==="g")});if(c.length<8)return null;var r=pick(c),w=[];
 shuf(c.filter(function(z){var a=pnum(z[3]),b=pnum(r[3]);return group(z[1])===group(r[1])&&a>b/5&&a<b*5})).forEach(function(z){if(z[3]!==r[3]&&w.indexOf(z[3])<0&&w.length<3)w.push(z[3])});if(w.length<3)return null;
 return mk('What was the launch price of "'+nameOf(r)+'"?',r[3],w,"price")}
function qDetail(list){var c=list.filter(function(r){var x=tx(r);return x&&x.detail&&x.detail.length>50&&x.detail.length<170&&x.conf!=="low"});if(!c.length)return null;var r=pick(c),x=tx(r),w=[];
 shuf(list.filter(function(z){return z!==r&&group(z[1])===group(r[1])})).forEach(function(z){if(w.length<3)w.push(nameOf(z))});if(w.length<3)return null;
 return mk('Which one is this? '+x.detail.replace(new RegExp(nameOf(r).replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"gi"),"(it)"),nameOf(r),w,"who")}
function qItemX(it){var t=R(),o=[];
 if(t<.25&&it.score!=null&&deps.scale){var v=deps.tier(it.score).l,w=shuf(deps.scale.map(function(z){return z.l}).filter(function(z){return z!==v})).slice(0,3);return mk('What verdict did the museum give the "'+it.name+'"?',v,w,"item")}
 if(t<.45&&it.msrp&&cleanPrice(it.msrp)){var w2=D.items.map(function(z){return z.msrp}).filter(function(z){return cleanPrice(z)&&z!==it.msrp});if(w2.length>=3)return mk('What was the original MSRP of the museum\'s "'+it.name+'"?',it.msrp,shuf(w2).slice(0,3),"item")}
 if(t<.7&&it.specs){var ks=Object.keys(it.specs).filter(function(k){return String(it.specs[k]).length<34}),k=ks.length?pick(ks):null;if(k){var w3=[];D.items.concat().forEach(function(z){if(z.specs&&z.specs[k]&&z.specs[k]!==it.specs[k]&&w3.indexOf(z.specs[k])<0)w3.push(z.specs[k])});D.tl.forEach(function(z){var x=tx(z);if(x&&x.specs&&x.specs[k]&&x.specs[k]!==it.specs[k]&&w3.indexOf(x.specs[k])<0&&w3.length<8)w3.push(x.specs[k])});
   if(w3.length>=3)return mk('In the museum\'s "'+it.name+'", what is the "'+k+'" spec?',String(it.specs[k]),shuf(w3).slice(0,3).map(String),"item")}}
 if(it.cat){var cs=[];D.items.forEach(function(z){if(z.cat&&z.cat!==it.cat&&cs.indexOf(z.cat)<0)cs.push(z.cat)});["Laptops","Computers","Sound cards","Games","Peripherals","Monitors"].forEach(function(z){if(z!==it.cat&&cs.indexOf(z)<0)cs.push(z)});return mk('Which catalog category is the "'+it.name+'" filed under?',it.cat,shuf(cs).slice(0,3),"item")}
 return null}
function qMuseum(ok){if(!D.items.length||ok.length<3)return null;var it=pick(D.items),w=shuf(ok.filter(function(r){return nameOf(r)!==it.name})).slice(0,3).map(nameOf);if(w.length<3)return null;return mk("Which of these is actually in the museum's collection?",it.name,w,"item")}
function qStatic(){var s=pick(STATIC);return mk(s[0],s[1],s[2],"dos")}
function qGame(list){var PCP=["DOS","Windows","Mac","Linux","PC-98","FM Towns"],hasPc=function(x){return x.r.some(function(q){return PCP.indexOf(q[0])>=0})},c=list.filter(function(r){return D.gx&&D.gx[r[2]]&&D.gx[r[2]].c!=="low"&&group(r[1])==="g"&&hasPc(D.gx[r[2]])});if(c.length<3)return null;var r=pick(c),x=D.gx[r[2]],pl=[],i;x.r.forEach(function(q){if(pl.indexOf(q[0])<0)pl.push(q[0])});
 var all=[];Object.keys(D.gx).forEach(function(t){D.gx[t].r.forEach(function(q){if(all.indexOf(q[0])<0&&q[0]!=="Other")all.push(q[0])})});
 var kind=R();
 if(kind<.45){var fp=null;x.r.forEach(function(q){if(!fp&&PCP.indexOf(q[0])>=0)fp=q[0]});var w=shuf(PCP.filter(function(p){return pl.indexOf(p)<0})).slice(0,3);if(!fp||w.length<3)return null;return mk('Which PC system was "'+nameOf(r)+'" first released for?',fp,w,"firstsys")}
 if(kind<.7&&pl.length>=3){var last=x.r[x.r.length-1][0];if(last==="Other"||last===x.r[0][0])return null;var w2=shuf(all.filter(function(p){return p!==last&&p!==x.r[0][0]})).slice(0,3);if(w2.length<3)return null;return mk('Which of these systems got "'+nameOf(r)+'" last?',last,w2,"lastsys")}
 if(x.n&&x.c==="high"&&!/knowledge/i.test(x.s||"")&&x.n.ramMB!=null&&x.n.ramMB>=1){var ram=x.n.ramMB,o=[ram*2,ram*4,Math.max(1,ram/2),ram*8].filter(function(v,j,a){return v!==ram&&a.indexOf(v)===j}).slice(0,3);if(o.length<3)return null;var f2=function(v){return v+" MB"};return mk('About how much RAM did "'+nameOf(r)+'" list as its minimum on a PC?',f2(ram),o.map(f2),"minram")}
 return null}
function nextQ(era,lvl){
 var wide=[4,6,9][lvl>=0?Math.min(lvl,2):0]+0,ok=D.tl.filter(function(r){return Math.abs(yr(r[0])-era)<=4}),okw=D.tl.filter(function(r){return Math.abs(yr(r[0])-era)<=9}),tries=0,q=null;
 while(!q&&tries++<40){var t=R();
  if(t<.16)q=qStatic();
  else if(t<.28&&D.items.length)q=qItem(pick(D.items));
  else if(t<.38&&D.items.length)q=qItemX(pick(D.items));
  else if(t<.42)q=qMuseum(ok);
  else if(t<.52&&ok.length>8)q=qFirst(ok);
  else if(t<.60)q=qPriceX(okw);
  else if(t<.68)q=qMaker(okw);
  else if(t<.73)q=qDev(okw);
  else if(t<.80)q=qSpec(okw);
  else if(t<.85)q=qSeries(okw);
  else if(t<.88)q=qDetail(okw);
  else if(t<.95)q=qGame(okw);
  else if(ok.length)q=qYear(pick(ok),lvl);
  if(q&&S.used[q.q])q=null}
 if(!q){q=qStatic();var n=0;while(S.used[q.q]&&n++<40)q=qStatic()}
 S.used[q.q]=1;return q}

/* ---------- maze ---------- */
function idx(c,r){return r*COLS+c}
function makeMaze(){var rooms=[],i;
 for(i=0;i<ROOMS;i++)rooms.push({i:i,c:i%COLS,r:Math.floor(i/COLS),d:{},st:{}});
 var seen={},stack=[idx(0,ROWS-1)];seen[stack[0]]=1;
 function open(a,b,dir){a.d[dir]={to:b.i,locked:R()>.22};b.d[OPP[dir]]={to:a.i,locked:a.d[dir].locked}}
 while(stack.length){var a=rooms[stack[stack.length-1]],nb=[];
  DIRS.forEach(function(d){var c=a.c+d[1],r=a.r+d[2];if(c>=0&&c<COLS&&r>=0&&r<ROWS&&!seen[idx(c,r)])nb.push([d[0],rooms[idx(c,r)]])});
  if(!nb.length){stack.pop();continue}
  var p=pick(nb);open(a,p[1],p[0]);seen[p[1].i]=1;stack.push(p[1].i)}
 for(i=0;i<3;i++){var a2=pick(rooms),d2=pick(DIRS),c2=a2.c+d2[1],r2=a2.r+d2[2];
  if(c2>=0&&c2<COLS&&r2>=0&&r2<ROWS&&!a2.d[d2[0]])open(a2,rooms[idx(c2,r2)],d2[0])}
 return rooms}
function bfs(from,to){var prev={},q=[from],seen={};seen[from]=1;
 while(q.length){var x=q.shift();if(x===to)break;var rm=S.rooms[x];
  Object.keys(rm.d).forEach(function(k){var t=rm.d[k].to;if(!seen[t]){seen[t]=1;prev[t]={f:x,k:k};q.push(t)}})}
 var path=[],cur=to;while(cur!==from&&prev[cur]){path.unshift(prev[cur]);cur=prev[cur].f}return path}
function depths(){var d={},q=[S.start];d[S.start]=0;var mx=0;
 while(q.length){var x=q.shift();Object.keys(S.rooms[x].d).forEach(function(k){var t=S.rooms[x].d[k].to;if(d[t]===undefined){d[t]=d[x]+1;mx=Math.max(mx,d[t]);q.push(t)}})}
 return{d:d,mx:mx}}

/* ---------- game state ---------- */
function exhibitFor(rm,pool){var e=pool.shift();return e}
function newGame(who,sd){
 seed=sd||((Date.now()&0xffffff)^0x5bd1e995);
 S={seed0:seed,acts:[],who:who,mem:640,min:0,taken:0,hints:who==="matt"?3:1,pen:who==="tony"?16:PENALTY,used:{},msg:"",room:0,px:40,py:112,dir:1,step:0,mode:"play",q:null,door:null,sound:false,talk:{},moves:0,flash:0,fade:0,log:[],npcs:{}};
 S.rooms=makeMaze();S.start=idx(0,ROWS-1);S.goal=idx(COLS-1,0);S.room=S.start;
 var dp=depths();S.mx=dp.mx;
 var names=shuf(NAMES),pool=[],real=D.items.slice();
 shuf(real).forEach(function(it){pool.push({kind:"item",it:it,title:it.name,year:it.year,note:it.thoughts&&!it.sample?it.thoughts:(it.text||"")})});
 var hw=shuf(D.tl.filter(function(r){return r[5]&&(r[1]==="hw"||r[1]==="sw")}));
 S.rooms.forEach(function(rm){
  rm.depth=dp.d[rm.i];rm.era=Math.round(1981+rm.depth/S.mx*29);rm.wall=pick([["b","k"],["g","k"],["r","k"],["m","k"],["d","k"]]);rm.floor=pick([["n","k"],["n","r"],["d","n"]]);rm.decor=[];
  rm.name=rm.i===S.start?"Front Hall":rm.i===S.goal?"The Vault":names.pop();
  if(rm.i!==S.start&&rm.i!==S.goal){var e=pool.length?pool.shift():null;if(!e){var best=hw.filter(function(r){return Math.abs(yr(r[0])-rm.era)<=6});var r=best.length?best[ri(best.length)]:hw[ri(hw.length)];e={kind:"tl",title:nameOf(r),year:yr(r[0]),date:r[0],price:r[3],note:r[4]}}rm.ex=e}
  var n=2+ri(3),pos=[24,70,110,210,250,290];shuf(pos).slice(0,n).forEach(function(x){rm.decor.push({t:pick(["window","clock","bookcase","painting","plant","window","lamp"]),x:x})});
 });
 S.rooms[S.goal].ex={kind:"goal",title:"Master Boot Disk",year:1981,note:"The disk that started it all."};
 var ids=S.rooms.map(function(r){return r.i}).filter(function(i){return i!==S.start&&i!==S.goal});
 var far=ids.filter(function(i){return S.rooms[i].depth>=3});S.gr={room:pick(far.length?far:ids),wait:0};
 shuf(ids).slice(0,3).forEach(function(i){S.npcs[i]="aunt"});
 var other=who==="matt"?"tony":"matt";shuf(ids).slice(0,2).forEach(function(i){if(!S.npcs[i])S.npcs[i]=other});
 enter(S.start,null,true)}
function room(){return S.rooms[S.room]}
function say(t){S.msg=t;var el=host.querySelector("#gmsg");if(el)el.innerHTML=esc(t).replace(/\n/g,"<br>");S.log.push(t)}
function hud(){var m=host.querySelector("#gmem"),c=host.querySelector("#gclock"),l=host.querySelector("#gloc"),h=host.querySelector("#ghint");
 if(m){m.textContent=S.mem+"K";m.parentNode.querySelector("i").style.width=Math.max(0,S.mem/640*100)+"%"}
 if(c)c.textContent=clock(S.min);if(l)l.textContent=room().name+", "+room().era;if(h)h.textContent="Hints: "+S.hints;
 var sb=host.querySelector("#gsound");if(sb)sb.textContent="Sound: "+(S.sound?"on":"off");
 var sc=host.querySelector("#gtake");if(sc)sc.textContent="Take ("+S.taken+")"}
function beep(f,d){if(!S.sound)return;try{var A=window.AudioContext||window.webkitAudioContext,a=deps.ac||(deps.ac=new A()),o=a.createOscillator(),g=a.createGain();o.type="square";o.frequency.value=f;g.gain.value=.04;o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+d)}catch(e){}}
function enter(i,dir,first){
 S.room=i;var rm=room();
 if(dir==="N"){S.px=160;S.py=FLOOR+40}else if(dir==="S"){S.px=160;S.py=FLOOR+14}else if(dir==="E"){S.px=14;S.py=FLOOR+26}else if(dir==="W"){S.px=W-14;S.py=FLOOR+26}
 S.fade=1;var t=rm.name+" ("+rm.era+")\n"+pick(FLAVOR);
 if(rm.ex&&!rm.taken)t+="\nOn a pedestal: "+rm.ex.title+(rm.ex.year?" ("+rm.ex.year+")":"")+".";
 if(S.npcs[i]&&!S.talk[i])t+="\n"+({aunt:"Auntie Autoexec is here.",matt:"Matt is here.",tony:"Tony is here."})[S.npcs[i]]+" (Talk)";
 if(i===S.goal&&!first){t="THE VAULT. The Master Boot Disk glows on its pedestal. Take it!"}
 if(!first&&S.gr.room!==i){var near=Object.keys(rm.d).some(function(k){return rm.d[k].to===S.gr.room});if(near)t+="\nSomething chitters in the next room."}
 say(first?"You are "+(S.who==="matt"?"Matt":"Tony")+". The Master Boot Disk has vanished from the museum vault, the storm has knocked out the exit, and midnight is coming. Reach the Vault before the clock strikes twelve. Answer the locked doors' questions to pass. Wrong answers cost memory.\n"+t:t);
 hud();if(S.gr.room===i&&!first)gremlin()}
function moveGremlin(){var path=bfs(S.gr.room,S.room);if(path.length)S.gr.room=path[0].f===S.gr.room?S.rooms[S.gr.room].d[path[0].k].to:S.gr.room}
function gremlin(){S.mode="q";var q=nextQ(room().era,2);S.q=q;S.door={gremlin:true};showQ("The Memory Gremlin leaps out. \"Answer me, or I take "+S.pen+"K!\"")}

/* ---------- questions UI ---------- */
function TOPIC(t){return t==="item"?"Museum items":t==="dos"?"DOS lore":"Timeline"}
function report(){var r=S.rep||{},k=Object.keys(r);return k.length?'<p class="gnote">Trivia report: '+k.map(function(x){return esc(x)+" "+r[x][0]+"/"+r[x][1]}).join(" &middot; ")+'</p>':""}
function showQ(pre){var box=host.querySelector("#gq"),o="";
 var q=S.q,hide=S.hidden||[];
 q.o.forEach(function(t,i){if(hide.indexOf(i)>=0)return;o+='<button type="button" class="btn" data-a="'+i+'"><b>'+"ABCD"[i]+'</b> '+esc(t)+'</button>'});
 box.innerHTML='<p class="gpre">'+esc(pre||"")+'</p><p class="gnote">Topic: '+esc(TOPIC(q.tag))+'</p><p><b>'+esc(q.q)+'</b></p><div class="gopts">'+o+'</div><p><button type="button" class="btn" data-h="1">Ask Auntie Autoexec ('+S.hints+' left)</button></p>';
 box.hidden=false;box.querySelectorAll("[data-a]").forEach(function(b){b.onclick=function(){answer(+b.dataset.a)}});
 var hb=box.querySelector("[data-h]");hb.onclick=useHint;var fb=box.querySelector("[data-a]");if(fb)fb.focus()}
function useHint(){if(S.hints<1||!S.q||S.mode!=="q")return;S.acts.push("h");S.hints--;var w=[];S.q.o.forEach(function(t,i){if(i!==S.q.c)w.push(i)});S.hidden=shuf(w).slice(0,2);showQ("Auntie Autoexec whispers, \"Not those two, dear.\"");hud()}
function answer(i){var q=S.q;if(!q||S.mode!=="q"||S.locked)return;if(!(i===0||i===1||i===2||i===3)||i>=q.o.length||(S.hidden||[]).indexOf(i)>=0)return;S.acts.push(String(i));var ok=i===q.c,box=host.querySelector("#gq");S.hidden=null;S.min+=2;var tp=TOPIC(q.tag),rp=S.rep||(S.rep={});rp[tp]=rp[tp]||[0,0];rp[tp][1]++;if(ok)rp[tp][0]++;
 if(ok){beep(880,.12);box.hidden=true;S.q=null;
  if(S.door&&S.door.gremlin){S.mode="play";S.gr.room=pick(S.rooms.map(function(r){return r.i}).filter(function(x){return x!==S.room&&x!==S.start}));say("The Gremlin shrieks and scuttles away.");hud();return}
  if(S.door&&S.door.finale){win();return}
  var d=S.door;S.rooms[d.from].d[d.dir].locked=false;var back=S.rooms[d.to].d[OPP[d.dir]];if(back)back.locked=false;
  S.mode="play";say("Correct. The lock clicks open.");go(d.from,d.dir)}
 else{beep(160,.3);S.mem-=S.pen;S.flash=6;
  var right=q.o[q.c];box.hidden=true;S.q=null;
  if(S.door&&S.door.gremlin){S.mode="play";say("Wrong. The Gremlin nibbles "+S.pen+"K and cackles. The answer was "+right+".");hud();check();return}
  if(S.door&&S.door.finale){S.mode="play";say("Wrong, and the disk drive spits out a sad noise (-"+S.pen+"K). The answer was "+right+". Try the disk again.");hud();check();return}
  S.mode="play";say("Wrong! That cost "+S.pen+"K of memory. The answer was "+right+". The door stays locked.");hud();check()}
 hud()}
function check(){if(S.mode==="over")return;if(S.mem<=0){S.mem=0;end(false,"DIVIDE OVERFLOW\nYou ran out of conventional memory. The house reboots, and so do you.")}
 else if(S.min>=MIDNIGHT)end(false,"The clock strikes twelve. The lights go out and the Master Boot Disk stays missing.\nAbort, Retry, Fail?")}
function go(from,dir){var d=S.rooms[from].d[dir];S.min+=5;S.moves++;
 if(S.moves%2===0&&S.gr.room!==S.room)moveGremlin();
 enter(d.to,dir);check();hud()}
function tryDoor(dir){var rm=room(),d=rm.d[dir];if(!d||S.mode!=="play")return;S.acts.push(dir.toLowerCase());
 if(!d.locked){go(rm.i,dir);return}
 S.mode="q";S.door={from:rm.i,dir:dir,to:d.to};var lvl=Math.min(2,Math.floor(S.rooms[d.to].depth/(S.mx/3)));S.q=nextQ(S.rooms[d.to].era,lvl);showQ("The door to the "+({N:"north",E:"east",S:"south",W:"west"})[dir]+" is locked. A brass plate reads: ANSWER TO PASS.")}
function look(){var rm=room();if(S.mode!=="play")return;S.acts.push("l");var e=rm.ex;
 if(e&&!rm.taken){var t=e.title+(e.year?" ("+e.year+")":"")+".";if(e.price)t+=" Launch price "+e.price+".";if(e.note)t+="\n"+e.note;if(e.kind==="item")t+="\nFrom the real museum catalog.";say("You study the pedestal.\n"+t)}
 else say(rm.name+". "+pick(FLAVOR))}
function take(){var rm=room();if(S.mode!=="play")return;S.acts.push("k");var e=rm.ex;
 if(!e||rm.taken){say("Nothing here to take. The pedestal is empty.");return}
 if(e.kind==="goal"){S.mode="q";S.door={finale:true};S.q=nextQ(2010,2);showQ("The Master Boot Disk sits in a locked drive. The drive wants proof you deserve it.");return}
 rm.taken=true;S.taken++;S.mem=Math.min(640,S.mem+16);S.min+=1;beep(1200,.08);say("You take the "+e.title+" and slip it into the exhibit case at your belt. Freed 16K of memory.");hud()}
function talk(){var rm=room(),n=S.npcs[rm.i];if(S.mode!=="play")return;S.acts.push("y");
 if(!n){say("You mutter to yourself. The house does not answer.");return}
 if(S.talk[rm.i]){say("They have nothing more to say.");return}S.talk[rm.i]=1;
 if(n==="aunt"){var p=bfs(rm.i,S.goal),dir=p.length?p[0].k:"N";S.hints++;say(pick(AUNT)+"\n(She points "+({N:"north",E:"east",S:"south",W:"west"})[dir]+" and hands you a hint.)")}
 else say(pick(n==="matt"?MATT_LINES:TONY_LINES));hud()}
/* ---------- run codes: every finished game can be replayed and checked ---------- */
function fnv(t){var h=2166136261;for(var i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function dataHash(){var a=D.items.map(function(i){return i.id||i.name}).join("|"),t=D.tl;return fnv(a+"#"+t.length+"#"+(t[0]||[])[2]+"#"+(t[t.length-1]||[])[2]+"#"+Object.keys(D.x||{}).length+"#"+Object.keys(D.gx||{}).length).toString(36)}
function makeCode(){var body="CM1."+S.who.charAt(0)+"."+S.seed0.toString(36)+"."+S.acts.join("")+"."+S.mem+"."+dataHash();return body+"."+fnv(body+"|cm").toString(36)}
function verify(code){var p=String(code||"").replace(/\s+/g,"").split(".");
 if(p.length!==7||p[0]!=="CM1")return{ok:false,why:"That is not a run code."};
 var body=p.slice(0,6).join(".");if(fnv(body+"|cm").toString(36)!==p[6])return{ok:false,why:"The code has a typo or was altered."};
 var who=p[1]==="m"?"matt":p[1]==="t"?"tony":"",sd=parseInt(p[2],36),acts=p[3],claim=+p[4];
 if(!who||!(sd>0)||!/^[nesw0-3klyh]{0,3000}$/.test(acts)||!(claim>=0&&claim<=640))return{ok:false,why:"The code is malformed."};
 if(p[5]!==dataHash())return{ok:false,stale:true,why:"The catalog or timeline has changed since this run, so it cannot be replayed."};
 var sv={S:S,host:host,seed:seed},res={ok:false,why:"The moves do not lead to a win."};
 try{host=document.createElement("div");host.innerHTML='<div id="gq"></div><div id="gmsg"></div>';S=null;newGame(who,sd);S.replay=true;S.sound=false;
  for(var i=0;i<acts.length&&S.mode!=="over";i++){var c=acts.charAt(i);
   if("nesw".indexOf(c)>=0){var dr=c.toUpperCase();if(S.mode!=="play"||!room().d[dr]){res.why="Move "+(i+1)+" is not possible in that game.";throw 0}tryDoor(dr)}
   else if("0123".indexOf(c)>=0){var n=+c;if(S.mode!=="q"||n>=S.q.o.length||(S.hidden||[]).indexOf(n)>=0){res.why="Answer "+(i+1)+" is not possible in that game.";throw 0}answer(n)}
   else if(c==="h"){if(S.mode!=="q"||S.hints<1){res.why="Hint "+(i+1)+" is not possible in that game.";throw 0}useHint()}
   else{if(S.mode!=="play"){res.why="Action "+(i+1)+" is not possible in that game.";throw 0}if(c==="k")take();else if(c==="l")look();else talk()}}
  if(S.mode==="over"&&S.win&&i===acts.length&&S.mem===claim)res={ok:true,who:who,mem:S.mem,min:S.min,taken:S.taken,code:code};
  else if(S.mode==="over"&&S.win&&S.mem!==claim)res.why="The score in the code does not match the replay."}
 catch(e){if(e!==0)res.why="The replay failed."}
 S=sv.S;host=sv.host;seed=sv.seed;return res}
function bestFromStore(){try{var c=localStorage.getItem("cm-maze-code");if(!c)return null;var v=verify(c);if(v.ok)return{mem:v.mem,ok:true};if(v.stale){var m=+c.split(".")[4];return{mem:m,ok:false}}}catch(e){}return null}
function win(){S.mode="over";S.win=true;var t=deps.tier(S.mem),lbl=t&&t.n?t.n:"",best=0,code=makeCode();
 if(!S.replay){var b=bestFromStore();best=b?b.mem:0;try{if(S.mem>best)localStorage.setItem("cm-maze-code",code)}catch(e){}}
 var left=MIDNIGHT-S.min;if(S.replay)return;
 finish('<h3>You found the Master Boot Disk!</h3><p>'+clock(S.min)+', with '+left+' minutes to spare.</p><pre class="dir">MEM /C\n\nConventional memory free: '+S.mem+'K of 640K\nExhibits collected:       '+S.taken+' of '+(ROOMS-2)+'\nRank on the 640K scale:   '+esc(lbl)+'</pre><p>'+(S.mem>best?"That is your best run in this browser.":"Your best in this browser: "+best+"K.")+'</p><p class="gnote">Run code (anyone can paste it on the Memory Maze start screen to replay and check your score):</p><textarea class="gcode" readonly rows="3" aria-label="Run code">'+esc(code)+'</textarea>')}
function end(win,txt){S.mode="over";finish('<h3>Game over</h3><p>'+esc(txt).replace(/\n/g,"<br>")+'</p>')}
function finish(html){var box=host.querySelector("#gq");box.hidden=false;box.innerHTML=html+report()+'<p><button class="btn pri" type="button" id="gagain">Play again</button> <a class="btn" href="#/">Back to the site</a></p>';
 box.querySelector("#gagain").onclick=function(){box.hidden=true;select()};hud()}

/* ---------- drawing ---------- */
function pat(a,b){var k=a+b;if(patCache[k])return patCache[k];var c=document.createElement("canvas");c.width=2;c.height=2;var x=c.getContext("2d");x.fillStyle=C[a];x.fillRect(0,0,2,2);x.fillStyle=C[b];x.fillRect(0,0,1,1);x.fillRect(1,1,1,1);return patCache[k]=cx.createPattern(c,"repeat")}
function rect(x,X,y,w,h,c){x.fillStyle=C[c];x.fillRect(X,y,w,h)}
function dith(x,X,y,w,h,a,b){x.fillStyle=pat(a,b);x.fillRect(X,y,w,h)}
function person(x,px,py,o,step,dir){var lg=step%2?1:0;
 rect(x,px-3,py-19,6,6,o.skin);rect(x,px-3,py-20,6,2,o.hair);if(o.hat)rect(x,px-4,py-21,8,2,o.hat);rect(x,px-1+dir,py-17,1,1,"k");
 rect(x,px-4,py-13,8,8,o.shirt);rect(x,px-5,py-12,1,6,o.skin);rect(x,px+4,py-12,1,6,o.skin);
 rect(x,px-3,py-5,3,5-lg,o.pants);rect(x,px,py-5,3,4+lg,o.pants);rect(x,px-4,py-1,3,1,"k");rect(x,px,py-1,3,1,"k");
 if(o.extra)o.extra(x,px,py)}
var LOOK={matt:{skin:"R",hair:"n",shirt:"B",pants:"b",extra:function(x,px,py){rect(x,px-2,py-10,4,1,"w")}},
 tony:{skin:"R",hair:"k",hat:"r",shirt:"R",pants:"d",extra:function(x,px,py){rect(x,px-4,py-6,8,1,"n");rect(x,px+2,py-8,2,3,"l")}},
 aunt:{skin:"R",hair:"w",shirt:"m",pants:"m"},gr:{skin:"G",hair:"g",shirt:"g",pants:"g",extra:function(x,px,py){rect(x,px-2,py-18,1,1,"R");rect(x,px+1,py-18,1,1,"R")}}};
function icon(x,e,X,Y){if(!e)return;var t=(e.title||"").toLowerCase();
 if(e.kind==="goal"){rect(x,X-7,Y-10,14,14,"k");rect(x,X-6,Y-9,12,12,"B");rect(x,X-3,Y-9,6,5,"w");rect(x,X-2,Y-2,4,4,"k");rect(x,X-5,Y+1,10,1,"y");return}
 if(/disk|floppy|zip/.test(t)){rect(x,X-6,Y-10,12,12,"d");rect(x,X-4,Y-10,8,4,"l");rect(x,X-4,Y-4,8,5,"w")}
 else if(/card|blaster|adlib|voodoo|geforce|audigy|x-fi|mt-32|synth/.test(t)){rect(x,X-8,Y-6,16,6,"g");rect(x,X-6,Y-8,3,2,"y");rect(x,X+2,Y-8,4,2,"k");rect(x,X-8,Y,16,1,"y")}
 else if(/nintendo|sega|game|playstation|xbox|wii|nes|genesis|saturn|dreamcast|jaguar|3do|lynx|atari|ds\b|psp|portable/.test(t)){rect(x,X-9,Y-6,18,7,"l");rect(x,X-7,Y-5,4,5,"k");rect(x,X+4,Y-4,3,3,"R");rect(x,X-9,Y-1,18,1,"d")}
 else if(/keyboard|model m/.test(t)){rect(x,X-10,Y-5,20,5,"d");for(var i=0;i<5;i++)rect(x,X-9+i*4,Y-4,3,1,"l");rect(x,X-9,Y-2,17,1,"l")}
 else{rect(x,X-8,Y-11,16,11,"l");rect(x,X-6,Y-9,12,7,"k");rect(x,X-5,Y-8,6,1,"G");rect(x,X-5,Y-6,9,1,"G");rect(x,X-6,Y,12,2,"d")}}
function drawDecor(x,d,rm,lit){var X=d.x;
 if(d.t==="window"){rect(x,X-14,14,28,38,"k");rect(x,X-12,16,24,34,lit?"w":"b");rect(x,X-1,16,2,34,"n");rect(x,X-12,32,24,2,"n");if(!lit){dith(x,X-12,16,24,34,"b","k")}}
 else if(d.t==="clock"){rect(x,X-8,10,16,66,"n");rect(x,X-6,12,12,12,"y");rect(x,X-1,14,1,5,"k");rect(x,X,17,4,1,"k");rect(x,X-6,28,12,40,"k");rect(x,X-1,32,2,28,"y");rect(x,X-9,74,18,4,"n")}
 else if(d.t==="bookcase"){rect(x,X-16,10,32,68,"n");rect(x,X-14,12,28,64,"k");for(var s=0;s<4;s++){rect(x,X-14,12+s*16,28,2,"n");for(var b=0;b<6;b++)rect(x,X-13+b*4,14+s*16,3,12,["r","B","g","y","m","c"][(b+s+rm.i)%6])}}
 else if(d.t==="painting"){rect(x,X-16,20,32,24,"y");rect(x,X-14,22,28,20,"b");rect(x,X-14,34,28,8,"g");rect(x,X+4,26,6,6,"y")}
 else if(d.t==="plant"){rect(x,X-5,FLOOR-10,10,10,"r");rect(x,X-2,FLOOR-26,4,16,"g");rect(x,X-9,FLOOR-30,8,6,"G");rect(x,X+1,FLOOR-34,9,6,"g")}
 else if(d.t==="lamp"){rect(x,X-1,FLOOR-30,2,30,"n");rect(x,X-7,FLOOR-40,14,10,"y");dith(x,X-16,FLOOR-40,32,40,"y","k")}}
function roomCanvas(rm){var k=rm.i;if(roomCache[k])return roomCache[k];var c=document.createElement("canvas");c.width=W;c.height=H;var x=c.getContext("2d");
 dith(x,0,0,W,FLOOR,rm.wall[0],rm.wall[1]);rect(x,0,FLOOR-8,W,8,"n");rect(x,0,FLOOR-9,W,1,"k");
 for(var i=0;i<W;i+=40)rect(x,i,FLOOR-8,1,8,"k");
 dith(x,0,FLOOR,W,H-FLOOR,rm.floor[0],rm.floor[1]);for(var j=FLOOR+10;j<H;j+=14)rect(x,0,j,W,1,"k");
 rm.decor.forEach(function(d){drawDecor(x,d,rm,false)});
 if(rm.ex){rect(x,150,FLOOR+2,20,16,"l");rect(x,150,FLOOR+2,20,2,"w");rect(x,152,FLOOR+18,16,2,"d")}
 rect(x,0,H-1,W,1,"k");return roomCache[k]=c}
function doorDraw(x,rm){var dd=rm.d,lk=function(k){return dd[k]&&dd[k].locked};
 function pad(X,Y){rect(x,X-3,Y-1,6,6,"y");rect(x,X-2,Y-4,4,3,"l");rect(x,X-1,Y+1,2,2,"k")}
 if(dd.N){rect(x,146,16,28,FLOOR-14,"n");rect(x,149,20,22,FLOOR-20,lk("N")?"r":"k");if(lk("N"))pad(160,44);else{rect(x,149,20,22,"k");dith(x,149,20,22,FLOOR-20,"k","b")}}
 if(dd.W){rect(x,0,24,16,FLOOR-20+40,"n");rect(x,0,28,12,FLOOR-24+40,lk("W")?"r":"k");if(lk("W"))pad(6,70)}
 if(dd.E){rect(x,W-16,24,16,FLOOR-20+40,"n");rect(x,W-12,28,12,FLOOR-24+40,lk("E")?"r":"k");if(lk("E"))pad(W-6,70)}
 if(dd.S){rect(x,140,H-10,40,10,"n");rect(x,144,H-8,32,8,lk("S")?"r":"k");if(lk("S"))pad(160,H-5)}}
function draw(){var rm=room(),x=cx;x.imageSmoothingEnabled=false;
 x.drawImage(roomCanvas(rm),0,0);
 var lit=S.lightning>0;if(lit){rm.decor.forEach(function(d){if(d.t==="window")drawDecor(x,d,rm,true)})}
 doorDraw(x,rm);
 if(rm.ex&&!rm.taken)icon(x,rm.ex,160,FLOOR+2);
 var sp=[];sp.push({y:S.py,f:function(){person(x,S.px|0,S.py|0,LOOK[S.who],S.step,S.dir)}});
 var n=S.npcs[rm.i];if(n&&n!=="aunt"||n==="aunt")sp.push({y:FLOOR+34,f:function(){person(x,262,FLOOR+34,LOOK[n],0,-1)}});
 if(S.gr.room===rm.i&&S.mode!=="over")sp.push({y:FLOOR+30,f:function(){person(x,56,FLOOR+30,LOOK.gr,S.step,1)}});
 sp.sort(function(a,b){return a.y-b.y}).forEach(function(s){s.f()});
 var dim=Math.max(0,(rm.depth||0)/(S.mx||1)*.0);if(S.fade>0){x.fillStyle="rgba(0,0,0,"+S.fade+")";x.fillRect(0,0,W,H)}
 if(S.flash>0){x.fillStyle=(S.flash%2?C.R:C.r);x.globalAlpha=.35;x.fillRect(0,0,W,H);x.globalAlpha=1}
 if(lit){x.fillStyle="rgba(255,255,255,.25)";x.fillRect(0,0,W,H)}}
function loop(t){raf=requestAnimationFrame(loop);if(!S||!cvs||!document.body.contains(cvs)){return}
 var dt=Math.min(50,t-last)/16.7;last=t;
 if(S.mode==="play"){var dx=0,dy=0;
  if(keys.ArrowLeft||keys.a)dx=-1;if(keys.ArrowRight||keys.d)dx=1;if(keys.ArrowUp||keys.w)dy=-1;if(keys.ArrowDown||keys.s)dy=1;
  if(dx||dy){var sp=1.5*dt;S.px+=dx*sp;S.py+=dy*sp*.7;if(dx)S.dir=dx;S.step=Math.floor(t/140);
   var rm=room();
   if(S.px<5){if(rm.d.W&&S.py>FLOOR+8){S.px=5;tryDoor("W")}else S.px=5}
   if(S.px>W-5){if(rm.d.E&&S.py>FLOOR+8){S.px=W-5;tryDoor("E")}else S.px=W-5}
   if(S.py<FLOOR+6){if(rm.d.N&&Math.abs(S.px-160)<16){S.py=FLOOR+6;tryDoor("N")}else S.py=FLOOR+6}
   if(S.py>H-2){if(rm.d.S&&Math.abs(S.px-160)<18){S.py=H-2;tryDoor("S")}else S.py=H-2}}}
 if(S.fade>0)S.fade=Math.max(0,S.fade-.06*dt);if(S.flash>0&&Math.floor(t/60)%1===0)S.flash=Math.max(0,S.flash-.2*dt);
 if(!S.nextLight)S.nextLight=t+9000+Math.random()*12000;if(t>S.nextLight){S.lightning=8;S.nextLight=t+12000+Math.random()*15000;if(S.mode==="play")say(S.msg.split("\n")[0]+"\nThunder shakes the house.")}
 if(S.lightning>0)S.lightning-=.35*dt;
 draw()}

/* ---------- screens ---------- */
function shell(){host.innerHTML='<section class="gm"><div class="gbar"><b>MEMORY MAZE</b><span id="gloc"></span><span id="gclock">8:00 PM</span><span class="gmemw"><span id="gmem">640K</span><span class="bar"><i></i></span></span></div>'
 +'<div class="gstage"><canvas id="gc" width="'+W+'" height="'+H+'" role="img" aria-label="A side view of the museum room you are in"></canvas><div id="gq" class="gq" hidden></div></div>'
 +'<div class="gmsg" id="gmsg" aria-live="polite"></div>'
 +'<div class="gctl"><div class="gpad"><button class="btn" data-k="ArrowLeft" aria-label="Walk left">&#9664;</button><button class="btn" data-k="ArrowUp" aria-label="Walk up">&#9650;</button><button class="btn" data-k="ArrowDown" aria-label="Walk down">&#9660;</button><button class="btn" data-k="ArrowRight" aria-label="Walk right">&#9654;</button></div>'
 +'<div class="gact"><button class="btn" id="glook" type="button">Look</button><button class="btn" id="gtake" type="button">Take (0)</button><button class="btn" id="gtalk" type="button">Talk</button><button class="btn" id="ghint" type="button">Hints: 0</button><button class="btn" id="gsound" type="button">Sound: off</button></div></div>'
 +'<p class="gnote">Arrow keys or WASD to walk. L look, E take, T talk, H hint, 1 to 4 or A to D to answer. A tribute to Encarta \'95\'s MindMaze, in the colors of 1989. Questions come from the museum and the timeline. <a href="#/">Leave the basement</a></p></section>';
 cvs=host.querySelector("#gc");cx=cvs.getContext("2d");
 host.querySelectorAll("[data-k]").forEach(function(b){var k=b.dataset.k;function dn2(e){e.preventDefault();keys[k]=1}function up(){keys[k]=0}b.onpointerdown=dn2;b.onpointerup=up;b.onpointerleave=up;b.onpointercancel=up});
 host.querySelector("#glook").onclick=look;host.querySelector("#gtake").onclick=take;host.querySelector("#gtalk").onclick=talk;
 host.querySelector("#ghint").onclick=function(){if(S.mode==="q")useHint();else say("Hints work on a question. You have "+S.hints+".")};
 host.querySelector("#gsound").onclick=function(){S.sound=!S.sound;beep(660,.1);hud()}}
function select(){roomCache={};S=null;
 host.innerHTML='<section class="gm"><div class="gbar"><b>MEMORY MAZE</b><span>A Conventional Memory mystery</span></div><div class="gsel"><h2>Who are you tonight?</h2><p>The Master Boot Disk has vanished from the Conventional Memory Museum on a stormy night. The house is a maze of locked doors. Each lock wants a right answer, and every wrong one costs you memory. Find the Vault before midnight.</p>'
 +'<div class="gchars"><button class="gchar" data-w="matt" type="button"><canvas width="60" height="90" data-p="matt"></canvas><b>Matt</b><span>The curator. Knows where everything is and why it is broken. Starts with 3 hints.</span></button>'
 +'<button class="gchar" data-w="tony" type="button"><canvas width="60" height="90" data-p="tony"></canvas><b>Tony</b><span>The tinkerer. Steady hands: wrong answers cost only 16K. Starts with 1 hint.</span></button></div>'
 +'<p class="gnote">Best run in this browser: <b id="gbest">none yet</b>. The characters here are cartoon stand-ins, so they look like nobody in particular. <a href="#/">Back to the site</a></p><h3 class="sub">Check a run code</h3><p class="gnote">Paste a code from someone\'s win screen. The game replays every move and confirms the score, so scores cannot be faked.</p><textarea id="gvin" class="gcode" rows="2" aria-label="Run code"></textarea><p><button class="btn" id="gvgo" type="button">Check it</button> <span id="gvout" aria-live="polite"></span></p></div></section>';
 var bb=bestFromStore();if(bb)host.querySelector("#gbest").textContent=bb.mem+"K free"+(bb.ok?" (checked)":" (unchecked: the museum has changed since)");
 host.querySelectorAll("canvas[data-p]").forEach(function(c){var x=c.getContext("2d");x.imageSmoothingEnabled=false;x.fillStyle=C.b;x.fillRect(0,0,60,90);x.save();x.scale(4,4);person(x,7,20,LOOK[c.dataset.p],0,1);x.restore()});
 host.querySelector("#gvgo").onclick=function(){var r=verify(host.querySelector("#gvin").value),o=host.querySelector("#gvout");o.textContent=r.ok?"Valid. "+(r.who==="matt"?"Matt":"Tony")+" finished at "+clock(r.min)+" with "+r.mem+"K free and "+r.taken+" exhibits.":"Not valid. "+r.why};
 host.querySelectorAll(".gchar").forEach(function(b){b.onclick=function(){begin(b.dataset.w)}})}
function begin(who){shell();keys={};newGame(who);last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)}

/* ---------- lifecycle ---------- */
function onk(e){if(!S||!host||!document.body.contains(host))return;var k=e.key;
 if(S.mode==="q"){var i="1234".indexOf(k);if(i<0)i="abcd".indexOf(k.toLowerCase());if(i>=0&&S.q&&i<S.q.o.length&&(S.hidden||[]).indexOf(i)<0){e.preventDefault();answer(i)}else if(k.toLowerCase()==="h")useHint();return}
 if(S.mode!=="play")return;
 var lk=k.length===1?k.toLowerCase():k;
 if(lk==="l")look();else if(lk==="e")take();else if(lk==="t")talk();else if(lk==="h")say("Hints work on a question. You have "+S.hints+".");
 else if("ArrowLeft ArrowRight ArrowUp ArrowDown a d w s".indexOf(lk)>=0){keys[lk]=1;if(lk.indexOf("Arrow")===0)e.preventDefault()}}
function onku(e){var k=e.key.length===1?e.key.toLowerCase():e.key;keys[k]=0}
function mount(el,d){unmount();host=el;deps=d;D.items=(d.items||[]).filter(function(i){return i&&i.name});
 D.tl=(d.tl||[]).filter(function(r){return r[5]&&(String(r[3]||"").indexOf("*")<0||true)&&r[0]&&r[2]});
 D.x=d.tlx||{};D.gx=d.gx||{};D.byT={};D.tl.forEach(function(r){D.byT[r[2]]=r});patCache={};roomCache={};onKey=onk;onKeyUp=onku;window.addEventListener("keydown",onKey);window.addEventListener("keyup",onKeyUp);select()}
function unmount(){cancelAnimationFrame(raf);raf=0;if(onKey)window.removeEventListener("keydown",onKey);if(onKeyUp)window.removeEventListener("keyup",onKeyUp);onKey=onKeyUp=null;S=null;keys={};host=null;cvs=null}
window.CMGame=Object.freeze({mount:mount,unmount:unmount});
})();
