/* cast.js: Connie Ventional, her wardrobe, and the whole Ventional family as little pixel people.
   Everything here is drawn from rectangles on a 24 by 24 grid, so the same drawing is used by the site mascot (icons.js),
   the closet, the Funnies, the sticker sheet and the family album. Nothing is an image file.

   CMCast.folk(cfg)       -> a drawing as groups of rectangles (see parts below)
   CMCast.svg(id, o)      -> inner SVG markup for a cast member ("connie", "emma", ...)
   CMCast.connieCfg(o)    -> the settings for Connie wearing a look, an accessory and a color
   CMCast.cur()           -> what Connie is wearing now (from this browser)
   CMCast.unlocked(k,id)  -> {ok, why} for a look, accessory or color
   Looks and accessories are plain data in LOOKS and ACCS, so adding one is one entry. */
var CMCast=(function(){
 var GD="#ffd54a",GS="#b8861b",K="#1a1030",SIL="#cfcfd8",SKIN="#ffe0c0",PIN="#c9c9d2";

 /* body colors ("skins"). b = board, d = dark edge, hr = hair */
 var COLORS={green:{n:"Green",b:"#1f9d55",d:"#0b4a28",hr:"#7a3b1e"},blue:{n:"Blue",b:"#2f6fe0",d:"#10306b",hr:"#e8c34a"},gold:{n:"Gold",b:"#e0b030",d:"#6b4d08",hr:"#3a2410"},pink:{n:"Pink",b:"#e0509a",d:"#6b1a45",hr:"#2a1a4a"},
  red:{n:"Red",b:"#d0402f",d:"#5a1410",hr:"#2a1a4a"},purple:{n:"Purple",b:"#7a4fd0",d:"#2d1766",hr:"#e8c34a"},black:{n:"Black",b:"#34343e",d:"#0c0c10",hr:"#e8e8f0"}};

 /* looks: what she wears. sk(x,y) is the skirt pixel color, hem is the lace color, shorts replaces the skirt.
    unlock: free, tickets (prize counter) or play (earned) */
 var LOOKS={
  classic:{n:"Classic",sk:"#ff5fa2",hem:"#fff",bow:"#ff5fa2",knot:"#fff",clip:"heart",note:"The pink tutu. The one everybody knows.",u:{t:"free"}},
  punk:{n:"Punk",sk:"#16161a",hem:"#c0143c",studs:1,bow:"#16161a",knot:"#e8e8ee",clip:"pin",streak:"#22d3ee",wrist:1,liner:1,note:"Studs, a safety pin and a cyan streak.",u:{t:"free"}},
  skate:{n:"Skater",shorts:"#4b5563",bow:"#d6322a",knot:"#fff",clip:"star",note:"Shorts, no skirt, ready for the half-pipe.",u:{t:"free"}},
  plaid:{n:"Plaid punk",plaid:1,bow:"#16161a",knot:"#c0143c",clip:"pin",wrist:1,liner:1,hem:"#16161a",note:"Red tartan and a very loud 1991 attitude.",u:{t:"tickets",n:12,id:"lk-plaid"}},
  check:{n:"Racer",check:1,bow:"#d6322a",knot:"#fff",clip:"none",hem:"#fff",note:"Checkered flag skirt for the Pole Position fans.",u:{t:"tickets",n:12,id:"lk-check"}},
  cyber:{n:"Cyber",sk:"#13a5a8",hem:"#aef3f0",trace:1,bow:"#13a5a8",knot:"#fff",clip:"bolt",streak:"#ffd54a",note:"A skirt made of circuit traces.",u:{t:"tickets",n:20,id:"lk-cyber"}},
  prom:{n:"Prom night",sk:"#6f7be0",hem:"#d9dcff",sparkle:1,bow:"#d9dcff",knot:"#6f7be0",clip:"star",corsage:1,note:"Periwinkle gown, corsage, and a slow dance with a 3.5 inch floppy.",u:{t:"tickets",n:30,id:"lk-prom"}},
  aerobics:{n:"Aerobics 1985",sk:"#18c3b5",hem:"#ff5fa2",stripe:"#ff5fa2",bow:"#ffe14a",knot:"#ff5fa2",clip:"none",band:1,wrist:"neon",note:"Sweatband, neon wristbands, leotard skirt. Feel the burn.",u:{t:"play",why:"Read every strip and gag in the Funnies."}},
  sysop:{n:"BBS Sysop",sk:"#1d2b53",hem:"#4ad66d",dots:"#4ad66d",bow:"#4ad66d",knot:"#fff",clip:"none",glasses:"round",note:"Round glasses, navy skirt, status lights. 14,400 baud and proud.",u:{t:"play",why:"Earn 10 stars in Memory Manager."}},
  hacker:{n:"Hacker",sk:"#0c0f14",matrix:1,hem:"#35e06a",hair:"#2c3340",bow:"#2c3340",knot:"#35e06a",clip:"none",note:"Hood up, green text raining down her skirt.",u:{t:"play",why:"Reach 100 XP in the games."}},
  explorer:{n:"Basement explorer",sk:"#a8793a",pockets:1,hem:"#6e4a1f",hat:"hard",note:"Hard hat with a lamp, work skirt, brave face.",u:{t:"play",why:"Find your way out of the Memory Maze basement."}},
  grunge:{n:"Grunge",flannel:1,hem:"#16161a",beanie:1,note:"Flannel, beanie, no bow, maximum shrug.",u:{t:"play",why:"Earn all 24 stars in Memory Manager."}}};
 var LOOK_ORDER=["classic","punk","skate","plaid","check","cyber","prom","aerobics","sysop","hacker","explorer","grunge"];

 /* accessories. slot: where it draws. Only one at a time. */
 var ACCS={
  none:{n:"Nothing",u:{t:"free"}},
  hp:{n:"Headphones",note:"The big foam kind.",u:{t:"free"}},
  fl:{n:"Floppy clip",note:"A 3.5 inch floppy as a hair clip.",u:{t:"free"}},
  joy:{n:"Joystick hat",note:"Eight directions and a fire button.",u:{t:"tickets",n:10,id:"ac-joy"}},
  shades:{n:"80s shades",note:"Too cool for the BIOS screen.",u:{t:"tickets",n:10,id:"ac-shades"}},
  prop:{n:"Propeller beanie",note:"For very serious hackers.",u:{t:"tickets",n:15,id:"ac-prop"}},
  crown:{n:"Little crown",note:"Queen of the 640K.",u:{t:"tickets",n:40,id:"ac-crown"}},
  headset:{n:"Sysop headset",note:"Picks up the phone line on the first ring.",u:{t:"play",why:"Earn 6 stars in Memory Manager."}},
  halo:{n:"Power LED halo",note:"A steady green glow.",u:{t:"play",why:"Clear all 8 Memory Manager levels."}}};
 var ACC_ORDER=["none","hp","fl","joy","shades","prop","crown","headset","halo"];
 var COLOR_PRIZE={blue:["sk-blue",15],pink:["sk-pink",15],gold:["sk-gold",40],red:["sk-red",20],purple:["sk-purple",20],black:["sk-black",25]};
 var COLOR_ORDER=["green","blue","pink","gold","red","purple","black"];
 var FUN_TOTAL=22,LEVELS=8;

 function ld(k,d){try{var v=JSON.parse(localStorage.getItem(k)||"null");return v==null?d:v}catch(e){return d}}
 function conState(){var s=ld("cm-connie",{});if(!s||typeof s!=="object")s={};s.stars=s.stars&&typeof s.stars==="object"?s.stars:{};s.read=s.read&&typeof s.read==="object"?s.read:{};return s}
 function stars(){var s=conState().stars,t=0,i;for(i=1;i<=LEVELS;i++)t+=Math.min(3,+s[i]||0);return t}
 function cleared(){var s=conState().stars,n=0,i;for(i=1;i<=LEVELS;i++)if((+s[i]||0)>=1)n++;return n}
 function readCount(){return Object.keys(conState().read).length}
 function owns(id){var p=ld("cm-prizes",{});return Array.isArray(p.own)&&p.own.indexOf(id)>=0}
 function unlockTable(kind,id){return kind==="look"?(LOOKS[id]&&LOOKS[id].u):kind==="acc"?(ACCS[id]&&ACCS[id].u):kind==="color"?(id==="green"?{t:"free"}:COLOR_PRIZE[id]?{t:"tickets",n:COLOR_PRIZE[id][1],id:COLOR_PRIZE[id][0]}:null):null}
 /* has she unlocked it? why = what to do if not */
 function unlocked(kind,id){var u=unlockTable(kind,id);if(!u)return{ok:false,why:"Unknown."};
  if(u.t==="free")return{ok:true,why:""};
  if(u.t==="tickets")return{ok:owns(u.id),why:"Buy it at the prize counter for "+u.n+" tickets.",at:"#/prizes"};
  var xp=(ld("cm-play",{xp:0}).xp)||0,st=stars();
  if(kind==="look"){
   if(id==="aerobics")return{ok:readCount()>=FUN_TOTAL,why:u.why+" ("+Math.min(readCount(),FUN_TOTAL)+" of "+FUN_TOTAL+")",at:"#/funnies"};
   if(id==="sysop")return{ok:st>=10,why:u.why+" ("+st+" of 10)",at:"#/memman"};
   if(id==="hacker")return{ok:xp>=100,why:u.why+" ("+Math.min(xp,100)+" of 100)",at:"#/play"};
   if(id==="explorer"){var ok=false;try{ok=!!localStorage.getItem("cm-maze-code")}catch(e){}return{ok:ok,why:u.why,at:"#/maze"}}
   if(id==="grunge")return{ok:st>=3*LEVELS,why:u.why+" ("+st+" of "+3*LEVELS+")",at:"#/memman"}}
  if(kind==="acc"){
   if(id==="headset")return{ok:st>=6,why:u.why+" ("+st+" of 6)",at:"#/memman"};
   if(id==="halo")return{ok:cleared()>=LEVELS,why:u.why+" ("+cleared()+" of "+LEVELS+")",at:"#/memman"}}
  return{ok:false,why:u.why||""}}
 function cur(){var s=conState(),p=ld("cm-prizes",{});var look=LOOKS[s.look]?s.look:"classic",acc=ACCS[s.acc]?s.acc:"none",skin=COLORS[p.skin]?p.skin:"green";return{look:look,acc:acc,skin:skin}}
 function save(o){var s=conState();if(o.look&&LOOKS[o.look])s.look=o.look;if(o.acc!=null&&ACCS[o.acc])s.acc=o.acc;try{localStorage.setItem("cm-connie",JSON.stringify(s))}catch(e){}
  if(o.skin&&COLORS[o.skin]){var p=ld("cm-prizes",{});p.skin=o.skin;try{localStorage.setItem("cm-prizes",JSON.stringify(p))}catch(e){}}}

 /* ---------------------------------------------------------------- the drawing */
 /* 3 by 5 pixel digits for stamps */
 var GL={"0":["XXX","X.X","X.X","X.X","XXX"],"1":[".X.","XX.",".X.",".X.","XXX"],"2":["XXX","..X","XXX","X..","XXX"],"3":["XXX","..X","XXX","..X","XXX"],"4":["X.X","X.X","XXX","..X","..X"],"5":["XXX","X..","XXX","..X","XXX"],"6":["XXX","X..","XXX","X.X","XXX"],"7":["XXX","..X","..X","..X","..X"],"8":["XXX","X.X","XXX","X.X","XXX"],"9":["XXX","X.X","XXX","..X","XXX"],"K":["X.X","X.X","XX.","X.X","X.X"]};
 function G0(){return{legl:[],legr:[],arml:[],armr:[],body:[],bow:[],eyes:[],cheek:[],mouth:[],accF:[]}}
 /* the one drawing routine. c = {b,d,hr, hair, look pieces..., acc, mood} */
 function folk(c){
  var G=G0(),cur,b=c.b,d=c.d,hr=c.hair||c.hr,mood=c.mood||"happy",acc=c.acc||"none",bowCol=c.bow;
  function r(x,y,w,h,f){cur.push([x,y,w,h,f])}
  function sk(x,y){if(c.plaid)return x%4===0?"#16161a":(y===20?"#f2c14e":"#b3202a");if(c.flannel)return x%3===0?"#16161a":(y===20?"#c9b458":"#2f6b3a");
   if(c.check)return(x+y)%2?"#16161a":"#f4f4f4";if(c.trace)return((y===20&&x%3===0)||(y===19&&x%4===1))?"#0b6b6e":c.sk;
   if(c.matrix)return((x*7+y*3)%5===0)?"#35e06a":c.sk;if(c.sparkle)return((x*5+y)%7===0)?"#fff":c.sk;
   if(c.stripe)return(y===20)?c.stripe:c.sk;if(c.dots)return(y===20&&x%3===0)?c.dots:c.sk;if(c.pockets)return((x===7||x===8||x===15||x===16)&&y>=19&&y<=20)?"#7a5428":c.sk;
   if(c.rgb)return["#e8402f","#2fb34a","#2f6fe0"][x%3];return c.sk}
  /* legs and gold-contact shoes: each shoe is a little comb of gold fingers */
  cur=G.legl;r(8,19,1,4,PIN);r(6,22,5,1,GD);r(7,22,1,1,"#fff6b0");r(6,23,1,1,GS);r(8,23,1,1,GS);r(10,23,1,1,GS);
  cur=G.legr;r(15,19,1,4,PIN);r(13,22,5,1,GD);r(14,22,1,1,"#fff6b0");r(13,23,1,1,GS);r(15,23,1,1,GS);r(17,23,1,1,GS);
  if(c.socks){cur=G.legl;r(7,21,3,1,"#fff");cur=G.legr;r(14,21,3,1,"#fff")}
  /* arms */
  cur=G.arml;r(2,11,3,1,GD);r(1,10,2,3,SKIN);if(c.wrist){var wc=c.wrist==="neon"?"#ff3d9a":"#16161a";r(2,10,1,3,wc);if(c.wrist!=="neon")r(2,11,1,1,SIL)}
  cur=G.armr;r(19,11,3,1,GD);r(21,10,2,3,SKIN);if(c.wrist){r(21,10,1,3,wc);if(c.wrist!=="neon")r(21,11,1,1,SIL)}
  if(c.sleeve){cur=G.arml;r(1,10,3,3,c.sleeve);cur=G.armr;r(20,10,3,3,c.sleeve)}
  if(c.holds==="mug"){cur=G.arml;r(0,11,3,3,"#f4f4f4");r(0,11,3,1,"#c0143c");r(3,11,1,2,"#f4f4f4");r(1,9,1,1,"#ffffff99");r(2,8,1,1,"#ffffff66")}
  if(c.holds==="manual"){cur=G.armr;r(21,10,3,4,"#fff");r(21,10,1,4,"#2f6fe0");r(22,11,2,1,"#2f6fe0");r(22,13,2,1,"#c8c8d4")}
  cur=G.body;
  /* hair behind the head */
  var st=c.hairStyle||"bob";
  if(st==="bob"){r(3,5,18,14,hr);r(2,8,1,9,hr);r(21,8,1,9,hr);r(2,17,2,2,hr);r(20,17,2,2,hr);r(1,18,2,1,hr);r(21,18,2,1,hr)}
  else if(st==="long"){r(3,5,18,15,hr);r(2,8,1,12,hr);r(21,8,1,12,hr)}
  else if(st==="pony"||st==="short"||st==="bun"||st==="spike"||st==="comb"||st==="cap"||st==="bald"){r(3,5,18,4,hr)}
  if(st==="pony"){r(21,3,2,3,hr);r(22,6,1,7,hr);r(21,12,2,2,hr)}
  /* the head: a green board with a dark edge */
  r(4,6,16,13,d);r(5,7,14,11,b);r(5,7,14,1,"#ffffff44");
  if(c.holes){for(var hy=8;hy<=16;hy+=2){r(4,hy,1,1,"#fff");r(19,hy,1,1,"#fff")}}
  for(var k=6;k<=17;k+=2)if(k!==12)r(k,18,1,1,GD);
  r(5,16,3,2,"#1a1a1a");r(5,16,1,1,"#8a8a8a");r(16,16,3,2,"#1a1a1a");r(18,16,1,1,"#8a8a8a");
  if(c.zip){for(var zy=7;zy<=17;zy++)r(11,zy,1,1,zy%2?SIL:"#6b6b78");r(10,7,3,1,"#e0a526");r(11,8,1,2,"#e0a526")}
  /* skirt (a pleated tutu with a lace hem) or shorts */
  if(c.shorts){r(5,19,6,3,c.shorts);r(13,19,6,3,c.shorts);r(5,19,14,1,"#2f3640");r(11,19,2,1,GD);r(5,21,6,1,"#3a424e");r(13,21,6,1,"#3a424e")}
  else if(c.skirt!==0){var x,h;for(x=5;x<19;x++)r(x,19,1,1,sk(x,19));for(x=4;x<20;x++)r(x,20,1,1,sk(x,20));
   if(!c.plain){for(h=4;h<20;h++)if(h!==8&&h!==15)r(h,21,1,1,h%2?(c.hem||"#fff"):sk(h,21))}else{for(h=4;h<20;h++)if(h!==8&&h!==15)r(h,21,1,1,sk(h,21))}
   if(c.studs)[5,9,13,17].forEach(function(sx){r(sx,20,1,1,SIL)})}
  if(c.cardigan){r(3,17,3,5,c.cardigan);r(18,17,3,5,c.cardigan);r(3,17,3,1,"#ffffff44");r(18,17,3,1,"#ffffff44");r(11,19,1,1,"#fff");r(11,21,1,1,"#fff")}
  if(c.pearls){for(var px=6;px<=17;px+=2)r(px,18,1,1,"#fff")}
  if(c.scarf){r(4,18,16,1,c.scarf);r(15,19,2,3,c.scarf)}
  if(c.bowtie){r(9,18,2,2,"#c0143c");r(13,18,2,2,"#c0143c");r(11,18,2,2,"#7a0a24")}
  /* shirts, jackets and the rest of the grown-up wardrobe */
  if(c.shorts&&c.shortsPat){var sp=c.shortsPat;
   if(sp==="plaid"){r(5,20,6,1,"#ffffff66");r(13,20,6,1,"#ffffff66");r(7,19,1,3,"#ffffff44");r(16,19,1,3,"#ffffff44")}
   if(sp==="hawaii"){[[6,19,"#fff"],[8,20,"#ffd54a"],[9,21,"#fff"],[6,21,"#ffd54a"],[14,19,"#ffd54a"],[16,20,"#fff"],[17,21,"#ffd54a"],[14,21,"#fff"]].forEach(function(q){r(q[0],q[1],1,1,q[2])})}
   if(sp==="camo"){[[5,19,2,1],[8,20,2,1],[6,21,2,1],[13,20,2,1],[16,19,2,1],[15,21,3,1]].forEach(function(q){r(q[0],q[1],q[2],q[3],"#2c3a22")})}}
  if(c.jacket){var jk=c.jacket;r(3,17,4,5,jk);r(17,17,4,5,jk);r(3,17,4,1,"#ffffff33");r(17,17,4,1,"#ffffff33");r(7,18,1,3,"#ffffff22");r(16,18,1,3,"#ffffff22");
   if(c.studs){[18,19,20,21].forEach(function(y){r(3,y,1,1,SIL)});[18,20].forEach(function(y){r(20,y,1,1,SIL)})}
   if(c.pens){r(4,18,1,2,"#2f6fe0");r(5,18,1,2,"#c0143c");r(6,18,1,1,"#222")}}
  if(c.turtle){var tu=c.turtle;r(5,18,14,2,tu);r(8,17,8,1,tu);r(8,17,8,1,"#ffffff1a");r(5,20,14,1,tu);r(5,18,14,1,"#ffffff22");r(6,19,12,1,"#00000033")}
  if(c.vest){r(5,18,3,4,c.vest);r(16,18,3,4,c.vest);r(5,18,3,1,"#ffffff33");r(16,18,3,1,"#ffffff33");r(6,20,1,1,GD);r(17,20,1,1,GD)}
  if(c.tie){r(9,18,2,1,"#fff");r(13,18,2,1,"#fff");r(11,18,2,1,c.tie);r(11,19,2,3,c.tie);r(11,19,1,1,"#ffffff44")}
  if(c.apron){r(7,18,10,4,c.apron);r(7,18,10,1,"#ffffff55");r(9,17,1,1,c.apron);r(14,17,1,1,c.apron);r(9,20,6,1,"#00000033");r(7,21,10,1,"#00000022")}
  if(c.overalls){r(8,18,8,4,c.overalls);r(8,17,1,1,c.overalls);r(15,17,1,1,c.overalls);r(8,18,1,1,GD);r(15,18,1,1,GD);r(10,20,4,1,"#00000033");r(10,19,4,1,"#ffffff22")}
  if(c.belt){r(5,19,14,1,"#7a4a1e");r(11,19,2,1,GD);r(5,20,3,2,"#9a6a2e");r(16,20,3,2,"#9a6a2e");r(18,17,1,3,"#b0764a");r(17,16,3,1,SIL)}
  if(c.bandana){r(6,17,12,1,c.bandana);r(7,18,10,1,c.bandana);r(9,19,6,1,c.bandana);r(11,20,2,1,c.bandana);r(8,18,1,1,"#fff");r(12,19,1,1,"#fff");r(15,18,1,1,"#fff")}
  /* hair in front */
  if(st==="bob"||st==="long"){r(3,3,18,4,hr);r(4,2,16,1,hr);r(5,7,5,1,hr);r(14,7,5,1,hr);r(9,7,6,1,hr);r(3,7,2,6,hr);r(19,7,2,6,hr);r(5,3,3,1,"#ffffff44");r(6,5,2,1,"#ffffff33")}
  else if(st==="short"||st==="pony"||st==="bun"){r(4,3,16,4,hr);r(5,2,14,1,hr);r(4,7,4,1,hr);r(16,7,4,1,hr);r(3,5,2,5,hr);r(19,5,2,5,hr);r(6,3,3,1,"#ffffff44");
   if(st==="bun"){r(10,0,4,3,hr);r(11,-1,2,1,hr);r(10,0,1,1,"#ffffff44")}}
  else if(st==="spike"){r(4,3,16,4,hr);r(5,1,2,2,hr);r(9,0,2,3,hr);r(13,0,2,3,hr);r(17,1,2,2,hr);r(7,2,2,1,hr);r(11,1,2,2,hr);r(15,2,2,1,hr);r(6,7,3,1,hr);r(15,7,3,1,hr)}
  else if(st==="comb"){r(3,5,2,7,hr);r(19,5,2,7,hr);r(4,4,3,2,hr);r(17,4,3,2,hr);r(9,4,6,1,hr)}
  else if(st==="fringe"){r(3,5,2,8,hr);r(19,5,2,8,hr);r(4,4,2,2,hr);r(18,4,2,2,hr);r(7,5,10,1,hr);r(9,4,6,1,hr);r(9,7,5,1,"#ffffff55")}
  else if(st==="cap"){r(4,2,16,5,c.cap||"#2f6fe0");r(5,1,14,1,c.cap||"#2f6fe0");r(4,6,16,1,"#0000004d");r(3,7,18,1,c.cap||"#2f6fe0");r(11,0,2,1,"#ffffff66");r(8,3,8,2,"#ffffff55")}
  if(c.streak){r(9,3,1,5,c.streak);r(9,7,2,1,c.streak)}
  /* looks that sit on her head */
  if(c.band){r(4,5,16,1,"#ff3d9a");r(4,6,16,1,"#18c3b5")}
  if(c.hat==="hard"){r(5,0,14,4,"#ffd54a");r(4,3,16,1,"#e0a526");r(11,-1,2,1,"#e0a526");r(10,0,4,2,"#fff6b0");r(11,1,2,1,"#fff");r(6,1,2,1,"#ffffff88")}
  var hc=c.hatCol||"#555";
  if(c.hat==="fedora"){r(7,-1,10,4,hc);r(11,-1,2,1,"#00000044");r(7,2,10,1,"#c0143c");r(3,3,18,1,hc);r(7,-1,10,1,"#ffffff33")}
  if(c.hat==="top"){r(7,-5,10,8,hc);r(7,2,10,1,"#c0143c");r(4,3,16,1,hc);r(8,-5,2,6,"#ffffff22")}
  if(c.hat==="cowboy"){r(7,0,10,3,hc);r(8,-1,3,1,hc);r(13,-1,3,1,hc);r(7,2,10,1,"#00000055");r(2,3,20,1,hc);r(1,2,2,1,hc);r(21,2,2,1,hc);r(8,0,2,1,"#ffffff33")}
  if(c.hat==="bucket"){r(6,0,12,3,hc);r(3,3,18,1,hc);r(6,2,12,1,"#00000033");r(8,-1,8,1,hc);r(7,0,2,1,"#ffffff44")}
  if(c.hat==="wizard"){r(8,1,8,2,hc);r(9,-1,6,2,hc);r(10,-3,4,2,hc);r(12,-5,2,2,hc);r(14,-6,1,1,hc);r(3,3,18,1,hc);r(8,2,8,1,GD);r(10,0,1,1,"#fff");r(13,-2,1,1,"#fff");r(11,1,1,1,"#ffe14a")}
  if(c.hat==="chef"){r(7,-1,10,4,"#fff");r(6,-3,4,3,"#fff");r(10,-4,4,4,"#fff");r(14,-3,4,3,"#fff");r(7,2,10,1,"#b8b8c8");r(7,-1,1,3,"#d8d8e4");r(6,-3,4,1,"#c8c8d8");r(10,-4,4,1,"#c8c8d8");r(14,-3,4,1,"#c8c8d8");r(16,-1,1,3,"#d8d8e4")}
  if(c.hat==="visor"){r(5,2,14,1,"#fff");r(3,3,18,1,hc);r(2,4,20,1,hc);r(5,2,14,1,"#ffffff")}
  if(c.beanie){r(3,0,18,6,c.beanieCol||"#8d8d96");r(3,2,18,1,"#6f6f78");r(3,4,18,1,"#6f6f78");r(3,5,18,1,"#a8a8b2");r(10,-2,4,2,"#e8e8f0");r(11,-3,2,1,"#e8e8f0")}
  /* accessories that sit behind the bow */
  if(acc==="hp"){r(4,1,16,1,"#222");r(3,2,1,3,"#222");r(20,2,1,3,"#222");r(0,7,4,6,"#222");r(1,8,2,4,"#4a9eff");r(1,8,2,1,"#bfe3ff");r(20,7,4,6,"#222");r(21,8,2,4,"#4a9eff");r(21,8,2,1,"#bfe3ff");r(3,4,1,3,"#222");r(20,4,1,3,"#222")}
  if(acc==="headset"){r(4,1,16,1,"#2a2a33");r(3,2,1,3,"#2a2a33");r(20,2,1,3,"#2a2a33");r(1,7,3,5,"#2a2a33");r(2,8,1,3,"#c0143c");r(19,7,3,5,"#2a2a33");r(19,8,1,3,"#c0143c");r(3,12,1,3,"#2a2a33");r(4,14,3,1,"#2a2a33");r(7,14,1,2,"#c0143c")}
  if(acc==="joy"){r(3,0,9,3,"#222");r(4,0,7,1,"#666");r(5,1,1,1,GD);r(9,1,1,1,"#4ad66d");r(7,-3,1,3,"#bbb");r(6,-5,3,3,"#ff3b30");r(6,-5,1,1,"#fff")}
  if(acc==="prop"){r(6,0,12,3,"#3a7bd5");r(6,0,4,3,"#d6322a");r(14,0,4,3,"#ffd54a");r(10,0,4,3,"#3a7bd5");r(11,-1,2,1,"#222");r(5,-2,14,1,"#ffd54a");r(5,-3,2,1,"#d6322a");r(17,-3,2,1,"#3a7bd5");r(6,0,12,1,"#ffffff44")}
  if(acc==="crown"){r(6,0,12,2,GD);r(6,-2,2,2,GD);r(11,-3,2,3,GD);r(16,-2,2,2,GD);r(6,1,12,1,GS);r(8,0,1,1,"#d6322a");r(11,0,2,1,"#4a9eff");r(15,0,1,1,"#4ad66d");r(6,-2,1,1,"#fff6b0");r(11,-3,1,1,"#fff6b0")}
  if(acc==="halo"){r(8,-4,8,1,"#fff6a0");r(7,-3,1,2,"#ffe14a");r(16,-3,1,2,"#ffe14a");r(8,-2,8,1,"#ffe14a");r(9,-4,2,1,"#fff")}
  /* bow with ribbon-cable streamers (not when a hat takes the spot) */
  cur=G.bow;
  if(bowCol&&!c.hat&&!c.beanie){r(13,0,3,3,bowCol);r(16,1,2,2,c.knot||"#fff");r(18,0,3,3,bowCol);r(13,0,1,1,"#ffffff88");r(18,0,1,1,"#ffffff88");r(14,2,1,1,"#00000044");r(20,2,1,1,"#00000044");
   r(16,3,1,3,"#ff3b30");r(17,3,1,3,GD);r(18,3,1,3,"#4ad66d")}
  /* hair clip */
  cur=G.body;
  if(acc==="fl"){r(1,2,6,6,"#1d3f9e");r(2,2,4,2,"#b8b8b8");r(4,2,1,2,"#555");r(2,5,4,3,"#fff");r(3,6,2,1,"#9fb0ff")}
  else if(acc==="none"||acc==="shades"){var cl=c.clip;
   if(cl==="heart"){r(2,3,1,1,"#ff3d7f");r(4,3,1,1,"#ff3d7f");r(2,4,3,1,"#ff3d7f");r(3,5,1,1,"#ff3d7f");r(2,3,1,1,"#ffb0cd")}
   if(cl==="pin"){r(2,3,4,1,SIL);r(5,4,1,1,SIL);r(2,4,1,1,SIL);r(2,5,4,1,"#8a8a96");r(3,4,2,1,"#555")}
   if(cl==="bolt"){r(4,3,2,1,GD);r(3,4,2,1,GD);r(4,5,2,1,GD);r(3,6,1,1,GD)}
   if(cl==="star"){r(3,3,1,3,GD);r(2,4,3,1,GD)}}
  /* eyes */
  cur=G.eyes;var f=mood,E=function(){};
  if(f==="oops"){r(6,10,3,1,"#fff");r(7,9,1,3,"#fff");r(14,10,3,1,"#fff");r(15,9,1,3,"#fff");r(6,10,3,1,"#000");r(14,10,3,1,"#000");r(6,13,1,2,"#7fd8ff");r(16,13,1,2,"#7fd8ff")}
  else if(f==="wow"){r(6,9,3,4,"#fff");r(14,9,3,4,"#fff");r(7,10,1,2,"#000");r(15,10,1,2,"#000");r(5,8,1,1,K);r(17,8,1,1,K);r(6,8,1,1,K);r(16,8,1,1,K)}
  else if(f==="sleep"){r(6,12,3,1,K);r(14,12,3,1,K);r(5,11,1,1,K);r(17,11,1,1,K);cur=G.accF;r(19,-4,4,1,"#fff");r(21,-3,1,1,"#fff");r(20,-2,1,1,"#fff");r(19,-1,4,1,"#fff");cur=G.eyes}
  else if(f==="love"){[[6,10],[14,10]].forEach(function(e){r(e[0],e[1],1,1,"#ff2d6f");r(e[0]+2,e[1],1,1,"#ff2d6f");r(e[0],e[1]+1,3,1,"#ff2d6f");r(e[0]+1,e[1]+2,1,1,"#ff2d6f");r(e[0],e[1],1,1,"#ffb0cd")})}
  else{r(6,9,3,1,K);r(14,9,3,1,K);if(!c.noLash){r(5,9,1,1,K);r(17,9,1,1,K);r(5,8,1,1,K);r(17,8,1,1,K)}
   if(c.liner){r(4,10,1,1,K);r(18,10,1,1,K);r(5,10,1,1,"#6b3fa0");r(17,10,1,1,"#6b3fa0")}
   r(6,10,3,4,K);r(6,10,2,2,"#fff");r(8,12,1,1,"#9fe8ff");r(8,13,1,1,"#4a3a7a");
   if(f==="wink"){r(14,10,3,4,b);r(14,12,3,1,K);r(13,11,1,1,K);r(17,11,1,1,K)}
   else{r(14,10,3,4,K);r(14,10,2,2,"#fff");r(16,12,1,1,"#9fe8ff");r(16,13,1,1,"#4a3a7a")}}
  /* things worn on the face */
  cur=G.accF;
  if(acc==="shades"){r(5,9,5,4,"#111");r(13,9,5,4,"#111");r(10,10,3,1,"#111");r(6,10,2,1,"#6b7bd0");r(14,10,2,1,"#6b7bd0");r(5,9,5,1,"#333");r(13,9,5,1,"#333");r(4,10,1,1,"#111");r(18,10,1,1,"#111")}
  if(c.glasses==="round"){var gc=c.gcol||"#e0a526";r(5,9,5,1,gc);r(5,14,5,1,gc);r(5,9,1,6,gc);r(9,9,1,6,gc);r(13,9,5,1,gc);r(13,14,5,1,gc);r(13,9,1,6,gc);r(17,9,1,6,gc);r(10,10,3,1,gc);r(6,10,1,1,"#ffffff88");r(14,10,1,1,"#ffffff88")}
  if(c.glasses==="brow"){var gb=c.gcol||"#111";r(5,8,5,2,gb);r(13,8,5,2,gb);r(5,10,1,5,gb);r(9,10,1,5,gb);r(13,10,1,5,gb);r(17,10,1,5,gb);r(5,14,5,1,"#777");r(13,14,5,1,"#777");r(10,9,3,1,gb);r(6,10,1,1,"#ffffff88");r(14,10,1,1,"#ffffff88")}
  if(c.glasses==="cat"){var gc2=c.gcol||"#c0143c";r(5,10,5,1,gc2);r(5,14,5,1,gc2);r(5,10,1,5,gc2);r(9,10,1,5,gc2);r(13,10,5,1,gc2);r(13,14,5,1,gc2);r(13,10,1,5,gc2);r(17,10,1,5,gc2);r(4,9,1,1,gc2);r(18,9,1,1,gc2);r(10,11,3,1,gc2)}
  if(c.freckles){r(7,14,1,1,"#a0522d");r(9,14,1,1,"#a0522d");r(14,14,1,1,"#a0522d");r(16,14,1,1,"#a0522d")}
  if(c.corsage){cur=G.armr;r(21,10,1,1,"#fff");r(21,11,1,1,"#ff8aa8");r(22,10,1,1,"#ffd0e0");cur=G.accF}
  /* cheeks, mouth */
  cur=G.cheek;r(5,14,2,2,c.blush||"#ff8aa8");r(17,14,2,2,c.blush||"#ff8aa8");r(5,14,1,1,"#ffb0c8");r(17,14,1,1,"#ffb0c8");
  cur=G.mouth;var L=c.lips||(c.liner?"#8c0f2c":"#c0143c");
  if(f==="oops"){r(9,16,5,1,L);r(8,15,1,1,L);r(14,15,1,1,L)}
  else if(f==="wow"){r(10,15,3,3,L);r(11,16,1,1,"#40000e")}
  else{r(10,15,1,1,L);r(11,16,2,1,L);r(13,15,1,1,L);if(!c.noGloss)r(11,15,2,1,c.liner?"#c2304f":"#ff7a96")}
  if(c.stache){r(8,14,7,1,c.stache);r(7,15,1,1,c.stache);r(15,15,1,1,c.stache)}
  if(c.goatee){r(10,17,4,1,c.goatee);r(10,18,4,1,c.goatee);r(11,19,2,1,c.goatee)}
  return G}

 function rects(a){var o="",i,q;for(i=0;i<a.length;i++){q=a[i];o+='<rect x="'+q[0]+'" y="'+q[1]+'" width="'+q[2]+'" height="'+q[3]+'" fill="'+q[4]+'"/>'}return o}
 function grp(cls,a){return a.length?'<g class="'+cls+'">'+rects(a)+'</g>':""}
 /* groups keep the names the mascot animations use, so the same drawing walks, waves and blinks wherever it goes */
 function inner(G,wrap){var s=grp("mc-legl",G.legl)+grp("mc-legr",G.legr)+grp("mc-arml",G.arml)+grp("mc-armr",G.armr)+rects(G.body)+grp("mc-bow",G.bow)+grp("mc-eyes",G.eyes)+rects(G.accF)+rects(G.cheek)+grp("mc-mouth",G.mouth);return wrap===false?s:'<g class="mc-all">'+s+'</g>'}

 function connieCfg(o){o=o||{};var cu=cur(),sk=COLORS[o.skin||cu.skin]||COLORS.green,lk=LOOKS[o.look||cu.look]||LOOKS.classic,c={},k;
  for(k in sk)c[k]=sk[k];for(k in lk)c[k]=lk[k];if(lk.hair)c.hr=lk.hair;
  c.acc=o.acc!=null?o.acc:cu.acc;c.mood=o.mood||"happy";if(o.look==="explorer"||lk.hat)c.hat=lk.hat;return c}

 /* ---------------------------------------------------------------- the family */
 var CAST={
  connie:{n:"Connie Ventional",b:null},
  emma:{n:"Emma 386 Ventional",cfg:{b:"#7a4fd0",d:"#2d1766",hr:"#2a1a4a",hairStyle:"pony",sk:"#7a4fd0",hem:"#d9c8ff",bow:"#ffd54a",knot:"#fff",glasses:"round",gcol:"#ff3d9a",plain:0,clip:"none",blush:"#d9a0ff"}},
  hiram:{n:"Hiram Ventional",cfg:{b:"#e8892f",d:"#6b3a0b",hr:"#7a3b1e",hairStyle:"cap",cap:"#2f6fe0",shorts:"#2f6fe0",noLash:1,freckles:1,noGloss:1,lips:"#a0522d"}},
  ram:{n:"Raymond Ventional",cfg:{b:"#4a73b8",d:"#17305e",hr:"#9a9aa6",hairStyle:"short",shorts:"#b8a77a",socks:1,stache:"#8a8a94",noLash:1,glasses:"round",gcol:"#555",blush:"#c08070",lips:"#9a4a3a",noGloss:1,holds:"manual"}},
  rhoda:{n:"Rhoda Ventional",cfg:{b:"#2fa39a",d:"#0c4a46",hr:"#3a2410",hairStyle:"bob",sk:"#8a3d7a",hem:"#e8c8e0",plain:0,pearls:1,scarf:"#e8c34a",bow:null,clip:"none",blush:"#f0a090"}},
  augusta:{n:"Augusta Batch",cfg:{b:"#9b7fd0",d:"#3a2670",hr:"#d8d8e0",hairStyle:"bun",sk:"#5a4a7a",hem:"#e0d8f0",cardigan:"#c0506a",glasses:"cat",gcol:"#c0143c",pearls:1,bow:null,clip:"none",blush:"#e0a0b0"}},
  conrad:{n:"Conrad Figsys",cfg:{b:"#7a8f3a",d:"#2c3a0c",hr:"#7a5a3a",hairStyle:"fringe",shorts:"#5a4a3a",bowtie:1,glasses:"brow",gcol:"#1a1a1a",noLash:1,stache:"#7a5a3a",goatee:"#7a5a3a",noGloss:1,lips:"#8a4a3a",blush:"#c09070",holds:"mug"}},
  dot:{n:"Dot Matrix",cfg:{b:"#f2e8d0",d:"#6b5a3a",hr:"#c0143c",hairStyle:"bob",holes:1,sk:"#222",hem:"#fff",bow:"#222",knot:"#fff",stripe:"#8ee08a",clip:"none",blush:"#f0a090"}},
  viv:{n:"Vivian G. Adapter",cfg:{b:"#27b3c8",d:"#0b4a55",hr:"#2a1a4a",hairStyle:"long",rgb:1,hem:"#fff",plain:0,bow:"#fff",knot:"#2fb34a",clip:"star"}},
  sandy:{n:"Sandy Blaster",cfg:{b:"#f2c230",d:"#7a5a08",hr:"#7a3b1e",hairStyle:"pony",sk:"#e8402f",hem:"#fff",bow:"#2f6fe0",knot:"#fff",acc:"hp",clip:"none"}},
  mo:{n:"Maureen “Mo” Dem",cfg:{b:"#8a8f9b",d:"#2c3038",hr:"#e8e8f0",hairStyle:"short",sk:"#3a3f4a",hem:"#c8ccd8",acc:"headset",bow:null,clip:"none",blush:"#d0a0a0"}},
  zack:{n:"Zachary Zip",cfg:{b:"#4a7fd0",d:"#10306b",hr:"#e0a526",hairStyle:"spike",zip:1,shorts:"#444c5a",noLash:1,noGloss:1,lips:"#a0522d",freckles:1}}};
 var CAST_ORDER=["connie","emma","hiram","ram","rhoda","augusta","conrad","dot","viv","sandy","mo","zack"];

 /* the ones who are not memory chips: Grandpa Floyd (a floppy), Grandma Winnie (a hard drive), Tessie (a TSR gremlin), Nibble (half a byte) */
 /* the four special characters are built from the same groups as everyone else, so they blink, wave and tap too */
 function sp(){var G=G0(),o={G:G,cur:null,r:function(x,y,w,h,f){o.cur.push([x,y,w,h,f])},to:function(n){o.cur=G[n]}};o.to("body");return o}
 function floyd(mood){var q=sp(),r=q.r,to=q.to;
  to("legl");r(8,19,1,4,PIN);r(6,22,5,1,"#6b6b78");r(6,23,5,1,"#444");to("legr");r(15,19,1,4,PIN);r(13,22,5,1,"#6b6b78");r(13,23,5,1,"#444");
  to("arml");r(2,11,3,1,"#8a6a4a");r(1,10,2,3,SKIN);to("armr");r(19,11,3,1,"#8a6a4a");r(21,10,2,3,SKIN);
  to("body");r(3,3,18,17,"#242a5e");r(4,4,16,15,"#2f3a86");r(17,3,3,3,"#e8e8ee");r(18,3,1,1,"#242a5e");/* write-protect notch */
  r(7,3,9,5,"#c9c9d2");r(8,3,2,4,"#6b6b78");r(7,3,9,1,"#e8e8ee");/* metal shutter */
  r(5,9,14,9,"#f4efe0");r(5,9,14,1,"#e0d8c0");r(5,17,14,1,"#d8d0b8");r(4,17,16,1,"#00000033");r(3,19,18,1,"#1a1e4a");
  to("eyes");r(7,11,3,3,K);r(7,11,1,1,"#fff");r(14,11,3,3,K);r(14,11,1,1,"#fff");
  to("accF");r(6,11,5,1,"#6b6b78");r(13,11,5,1,"#6b6b78");r(6,14,5,1,"#6b6b78");r(13,14,5,1,"#6b6b78");r(5,11,1,4,"#6b6b78");r(10,11,1,1,"#6b6b78");r(11,11,2,1,"#6b6b78");r(18,11,1,4,"#6b6b78");
  to("mouth");r(8,15,8,1,"#b0b0b0");r(9,16,6,1,"#d8d0b8");r(10,16,4,1,mood==="oops"?"#8c0f2c":"#c0143c");return q.G}
 function winnie(mood){var q=sp(),r=q.r,to=q.to;
  to("legl");r(8,19,1,4,PIN);r(6,22,5,1,"#e8a0b8");r(6,23,5,1,"#b0607a");to("legr");r(15,19,1,4,PIN);r(13,22,5,1,"#e8a0b8");r(13,23,5,1,"#b0607a");
  to("arml");r(2,11,3,1,"#c8a8d8");r(1,10,2,3,SKIN);to("armr");r(19,11,3,1,"#c8a8d8");r(21,10,2,3,SKIN);
  to("body");r(2,3,20,5,"#c8d8f0");r(1,5,2,6,"#c8d8f0");r(21,5,2,6,"#c8d8f0");r(4,2,16,1,"#c8d8f0");r(6,1,12,1,"#c8d8f0");r(5,3,3,1,"#ffffff");/* a fresh perm */
  r(3,6,18,14,"#4a5260");r(4,7,16,12,"#9aa4b4");r(4,7,16,1,"#c8d0dc");r(5,8,1,1,"#4a5260");r(18,8,1,1,"#4a5260");r(5,17,1,1,"#4a5260");r(18,17,1,1,"#4a5260");/* screws */
  r(9,19,6,1,"#fff");r(10,19,1,1,"#e8e8f0");r(12,19,1,1,"#e8e8f0");/* pearls */
  to("eyes");r(6,12,3,3,K);r(6,12,1,1,"#fff");r(15,12,3,3,K);r(15,12,1,1,"#fff");
  to("accF");r(5,12,5,1,"#c0143c");r(14,12,5,1,"#c0143c");r(5,15,5,1,"#c0143c");r(14,15,5,1,"#c0143c");r(5,12,1,4,"#c0143c");r(9,12,1,4,"#c0143c");r(14,12,1,4,"#c0143c");r(18,12,1,4,"#c0143c");r(10,13,4,1,"#c0143c");
  to("cheek");r(4,15,2,1,"#e8a0a0");r(18,15,2,1,"#e8a0a0");
  to("mouth");r(8,17,8,1,"#fff");r(10,16,4,1,"#c0143c");r(11,16,2,1,"#c0143c");return q.G}
 function tess(mood){var q=sp(),r=q.r,to=q.to;
  to("legl");r(7,20,3,3,"#2a8a3a");r(6,22,5,1,"#1a5a24");to("legr");r(14,20,3,3,"#2a8a3a");r(13,22,5,1,"#1a5a24");
  to("arml");r(2,12,3,1,"#2a8a3a");r(1,10,2,3,"#3ab04a");to("armr");r(19,12,3,1,"#2a8a3a");r(21,10,2,3,"#3ab04a");
  to("body");r(2,3,2,5,"#2a8a3a");r(20,3,2,5,"#2a8a3a");r(1,2,2,3,"#3ab04a");r(21,2,2,3,"#3ab04a");
  r(4,6,16,14,"#1a5a24");r(5,7,14,12,"#3ab04a");r(5,7,14,1,"#7fe08a");r(8,5,8,2,"#1a5a24");
  r(9,19,6,3,"#ffd54a");r(10,20,4,1,"#b8861b");/* a stolen 16K, held in both hands like a sandwich */
  to("eyes");r(6,10,4,4,"#fff");r(14,10,4,4,"#fff");r(7,11,2,3,"#222");r(15,11,2,3,"#222");r(7,11,1,1,"#fff");r(15,11,1,1,"#fff");
  to("mouth");r(7,16,10,2,"#222");r(8,16,1,1,"#fff");r(10,16,1,1,"#fff");r(12,16,1,1,"#fff");r(14,16,1,1,"#fff");r(15,16,1,1,"#fff");return q.G}
 function nibble(){var q=sp(),r=q.r,to=q.to;
  to("legl");r(8,21,2,1,"#e8a0a0");to("legr");r(14,21,2,1,"#e8a0a0");
  to("body");r(6,10,3,3,"#c89060");r(15,10,3,3,"#c89060");r(7,11,1,1,"#e8a0a0");r(16,11,1,1,"#e8a0a0");r(5,13,14,8,"#8a5a30");r(6,12,12,9,"#d8a870");r(7,11,10,1,"#d8a870");r(7,14,10,6,"#f4e0c0");
  r(11,15,2,1,"#e8a0a0");r(10,17,4,1,"#f4e0c0");r(10,18,4,3,"#d8a870");r(11,19,2,2,"#222");r(11,19,1,1,"#fff");/* a stamp: half a byte */
  to("eyes");r(8,13,2,2,"#222");r(14,13,2,2,"#222");r(8,13,1,1,"#fff");r(14,13,1,1,"#fff");
  to("mouth");r(11,16,2,1,"#c0143c");return q.G}

 /* the family pets: Mat, a wired mouse, and Toner, a toner-cartridge puppy */
 function mat(mood){var q=sp(),r=q.r,to=q.to;
  to("legl");r(7,19,3,3,"#b8ae8a");r(6,21,4,1,"#8a8060");to("legr");r(14,19,3,3,"#b8ae8a");r(14,21,4,1,"#8a8060");r(17,20,3,1,"#2a2a33");r(19,19,2,1,"#2a2a33");r(20,18,1,1,"#2a2a33");/* the tail is the cable */
  to("arml");r(3,12,3,2,"#d8cfae");to("armr");r(18,12,3,2,"#d8cfae");
  to("body");r(4,6,4,4,"#6b5f3a");r(5,7,2,2,"#e8a0b8");r(16,6,4,4,"#6b5f3a");r(17,7,2,2,"#e8a0b8");/* ears */
  r(5,8,14,12,"#6b5f3a");r(6,9,12,10,"#d8cfae");r(6,9,12,1,"#ffffff66");r(6,9,12,4,"#cfc59e");r(11,9,2,5,"#6b5f3a");r(6,13,12,1,"#6b5f3a");/* two buttons */
  to("eyes");
  if(mood==="sleep"){r(8,16,2,1,K);r(14,16,2,1,K)}
  else if(mood==="love"){r(8,15,2,2,"#ff2d6f");r(14,15,2,2,"#ff2d6f");r(8,15,1,1,"#ffb0cd")}
  else if(mood==="wow"){r(8,14,3,3,"#fff");r(14,14,3,3,"#fff");r(9,15,1,1,K);r(15,15,1,1,K);r(7,13,1,1,K);r(17,13,1,1,K)}
  else{r(8,15,2,2,K);r(8,15,1,1,"#fff");if(mood==="wink"){r(14,16,2,1,K)}else{r(14,15,2,2,K);r(14,15,1,1,"#fff")}if(mood==="oops"){r(18,13,1,3,"#7fd8ff")}}
  to("cheek");r(6,17,2,1,"#e8a0b8");r(16,17,2,1,"#e8a0b8");to("mouth");if(mood==="oops"||mood==="wow"){r(11,17,2,2,"#c0143c")}else{r(11,17,2,1,"#c0143c");r(11,16,2,1,"#e8a0b8")}return q.G}
 function toner(mood){var q=sp(),r=q.r,to=q.to;
  to("legl");r(6,19,4,3,"#2a2a33");r(6,21,4,1,"#6b6b78");to("legr");r(14,19,4,3,"#2a2a33");r(14,21,4,1,"#6b6b78");
  to("arml");r(1,10,3,6,"#14141a");r(1,10,3,1,"#3a3a46");to("armr");r(20,10,3,6,"#14141a");r(20,10,3,1,"#3a3a46");r(21,5,1,4,"#2a2a33");r(22,4,1,2,"#2a2a33");/* ears flop, tail wags */
  to("body");r(4,6,16,14,"#14141a");r(5,7,14,12,"#2a2a33");r(5,7,14,1,"#4a4a58");r(9,5,6,2,"#14141a");r(10,4,4,1,"#3a3a46");/* the cartridge handle */
  r(7,15,10,4,"#f4f4f4");r(8,16,3,1,"#c0143c");r(12,16,4,1,"#6b6b78");r(8,18,8,1,"#c8c8d4");r(6,12,2,1,"#6b6b78");r(16,9,1,1,"#6b6b78");r(18,13,1,1,"#6b6b78");r(8,9,1,1,"#6b6b78");/* a label and a few smudges */
  to("eyes");
  if(mood==="sleep"){r(7,11,4,1,"#fff");r(13,11,4,1,"#fff")}
  else if(mood==="love"){r(7,9,4,4,"#ff2d6f");r(13,9,4,4,"#ff2d6f");r(8,10,1,1,"#ffb0cd");r(14,10,1,1,"#ffb0cd")}
  else if(mood==="wow"){r(7,9,4,4,"#fff");r(13,9,4,4,"#fff");r(8,11,2,1,"#111");r(14,11,2,1,"#111");r(6,8,2,1,"#fff");r(16,8,2,1,"#fff")}
  else{r(7,9,4,4,"#fff");r(13,9,4,4,"#fff");r(8,10,2,3,"#111");r(8,10,1,1,"#fff");if(mood==="wink"){r(13,11,4,1,"#fff")}else{r(14,10,2,3,"#111");r(14,10,1,1,"#fff")}if(mood==="oops"){r(19,8,1,3,"#7fd8ff")}}
  to("mouth");if(mood==="wow"||mood==="oops"){r(11,13,2,3,"#111")}else{r(10,13,4,1,"#111");r(11,14,2,2,"#ff7a96")}return q.G}

 /* inner SVG markup for a named cast member. o = {mood, size...} */

 /* ---- the guys' wardrobe (Conrad and Raymond). Each outfit lists what it changes; "classic" is how they always look. */
 var OUTFITS={
  classic:{n:"Classic",note:"How they have always looked.",cfg:{}},
  desk:{n:"Sysadmin",note:"Short sleeves, a tie and a pocket full of pens.",cfg:{bowtie:0,jacket:"#e8e8ee",pens:1,tie:"#c0143c"}},
  fishing:{n:"Fishing trip",note:"Bucket hat and a vest with eleven pockets.",cfg:{bowtie:0,hat:"bucket",hatCol:"#c8b560",vest:"#a89a5a",shorts:"#8a7a4a"}},
  grill:{n:"Grill master",note:"Chef hat, apron and absolute confidence.",cfg:{bowtie:0,hat:"chef",apron:"#c0392b"},acc:"shades"},
  lab:{n:"Lab coat",note:"For anything that needs a clipboard.",cfg:{bowtie:0,jacket:"#f4f4f8",pens:1,tie:"#2f6fe0",shorts:"#3a424e"}},
  hawaii:{n:"Vacation",note:"Loud shorts, cool shades, no plans.",cfg:{bowtie:0,shorts:"#ff7a3d",shortsPat:"hawaii"},acc:"shades"},
  garage:{n:"Garage",note:"Overalls, a red cap and a tool belt.",cfg:{bowtie:0,hairStyle:"cap",cap:"#d6322a",overalls:"#2f5fb8",shorts:"#2f5fb8",belt:1}},
  tux:{n:"Tuxedo",note:"Top hat and a bow tie, for the wedding.",cfg:{bowtie:1,hat:"top",hatCol:"#16161a",jacket:"#16161a",shorts:"#16161a"}},
  keynote:{n:"Keynote",note:"Black turtleneck, round glasses, jeans. One more thing.",cfg:{bowtie:0,turtle:"#16161a",sleeve:"#16161a",shorts:"#4a6a9a",glasses:"round",gcol:"#c8c8d4"}},
  cowboy:{n:"Cowpoke",note:"Cowboy hat, vest and a red bandana.",cfg:{bowtie:0,hat:"cowboy",hatCol:"#8a5a2b",vest:"#6b3a1b",bandana:"#c0143c",shorts:"#2f4f8a"}},
  biker:{n:"Biker",note:"Black leather, studs and shades.",cfg:{bowtie:0,jacket:"#1a1a1f",studs:1,bandana:"#c0143c",shorts:"#222228"},acc:"shades"},
  wizard:{n:"BIOS wizard",note:"Pointy hat. Knows every jumper setting.",cfg:{bowtie:0,hat:"wizard",hatCol:"#4b2f9a",jacket:"#4b2f9a"}},
  winter:{n:"Winter",note:"Beanie, scarf and a puffy vest.",cfg:{bowtie:0,beanie:1,beanieCol:"#2f6b8a",scarf:"#c0392b",vest:"#2f6b8a",shorts:"#3a424e"}},
  golf:{n:"Weekend golf",note:"Visor, plaid shorts, a lot of opinions.",cfg:{bowtie:0,hat:"visor",hatCol:"#2f8a4a",shorts:"#2f8a4a",shortsPat:"plaid"}},
  road:{n:"Road trip",note:"Camo shorts, a trucker cap and a cooler.",cfg:{bowtie:0,hairStyle:"cap",cap:"#556b2f",shorts:"#4a5a32",shortsPat:"camo"},acc:"fl"}};
 var OUTFIT_ORDER=["classic","desk","fishing","grill","lab","hawaii","garage","tux","keynote","cowboy","biker","wizard","winter","golf","road"];
 var OUTFIT_FOR={conrad:1,ram:1};
 var HEAD_ACC={hp:1,joy:1,prop:1,crown:1,halo:1,headset:1};
 function famState(){var s=conState();return s.fam||{}}
 /* what a guy is wearing right now: {o:outfit,c:color,a:accessory or null for the outfit's own} */
 function famGet(id){var f=famState()[id]||{};return{o:OUTFITS[f.o]?f.o:"classic",c:COLORS[f.c]?f.c:"",a:f.a&&ACCS[f.a]?f.a:""}}
 function famSet(id,patch){var s=conState();s.fam=s.fam||{};var f=s.fam[id]=s.fam[id]||{};for(var k in patch)f[k]=patch[k];try{localStorage.setItem("cm-connie",JSON.stringify(s))}catch(e){}}
 function famOpts(id){if(!OUTFIT_FOR[id])return{};var f=famGet(id);return{outfit:f.o,color:f.c,acc:f.a||undefined,fam:1}}
 function castSvg(id,o){o=o||{};
  if(id==="connie")return inner(folk(connieCfg(o)));
  if(id==="floyd")return inner(floyd(o.mood));if(id==="winnie")return inner(winnie(o.mood));if(id==="tess")return inner(tess(o.mood));if(id==="nibble")return inner(nibble());if(id==="mat")return inner(mat(o.mood));if(id==="toner")return inner(toner(o.mood));
  var s=CAST[id];if(!s||!s.cfg)return"";var c={},k;for(k in s.cfg)c[k]=s.cfg[k];c.mood=o.mood||"happy";
  if(OUTFIT_FOR[id]||o.outfit){var ou=OUTFITS[o.outfit];if(ou){for(k in ou.cfg)c[k]=ou.cfg[k]}
   if(o.color&&COLORS[o.color]){c.b=COLORS[o.color].b;c.d=COLORS[o.color].d}
   var ac=o.acc!=null?o.acc:(ou&&ou.acc)||"none";if(ACCS[ac]&&!((c.hat||c.beanie||c.hairStyle==="cap")&&HEAD_ACC[ac]))c.acc=ac}if(c.skirt==null&&!c.shorts&&!c.sk)c.sk="#555";return inner(folk(c))}
 /* a whole standalone <svg> for comics, cards and stickers */
 function svgOf(id,size,o){o=o||{};var h=size*(o.tall?1.3:1);var dl=0,q;for(q=0;q<id.length;q++)dl+=id.charCodeAt(q);return'<svg class="cc cc-'+id+(o.cls?" "+o.cls:"")+'" style="--cd:-'+((dl%30)/10)+'s" viewBox="0 '+(o.tall?"-6":"0")+' 24 '+(o.tall?"31":"24")+'" width="'+size+'" height="'+h+'" shape-rendering="crispEdges" role="img" aria-label="'+(o.label||(CAST[id]?CAST[id].n:id))+'" xmlns="http://www.w3.org/2000/svg">'+castSvg(id,o)+"</svg>"}


 /* Cameos: where the family turns up around the site, each for a reason that fits who they are. Connie always introduces them. [who, outfit options, what Connie says] */
 var CAMEO={
  manuals:["ram",{},"That is my dad, Raymond. He reads the manual first. Always. He is reading this one right now."],
  workbench:["ram",{outfit:"garage"},"My dad, Raymond, in his garage clothes. It is technically his workbench. He lent it to the museum and counts the screwdrivers."],
  journal:["ram",{outfit:"desk"},"Raymond again. He keeps a repair journal too. It is mostly what he paid for each screw."],
  runs:["conrad",{outfit:"lab"},"My Uncle Conrad. He has tuned his CONFIG.SYS since 1983 and has never called it finished. Ask him about jumpers. Only jumpers."],
  advisor:["conrad",{outfit:"desk"},"Uncle Conrad, our unofficial compatibility department. Mug in hand, he will tell you what fits. With a sigh, he will tell you what does not."],
  compare:["emma",{},"My sister Emma 386. She can borrow more room than I can, and she compares everything. Including me. I lose."],
  scale:["hiram",{},"My little brother Hiram lives above the 640K line, which is why this scale stops here. He says the view is great. He will not come down to prove it."],
  backup:["floyd",{},"Grandpa Floyd Dysk backs up everything to disk. Disk 7 of 14 is around here somewhere. It is always disk 7."],
  install:["winnie",{},"Grandma Winnie Chester lives on the hard drive. She says installing a program is just a guest moving in. She checks references."],
  daily:["augusta",{},"My Aunt Augusta, known as Auntie Autoexec. She runs the same list every morning whether anyone asked or not. Nobody has ever asked."],
  today:["augusta",{},"Auntie Autoexec starts the day at boot, loudly, in the same order. Ask her to change it. Go on."],
  kiosk:["tess",{},"This is Tessie, our TSR. She stays resident. We tried to evict her in 1983 and now she runs the demo."],
  jukebox:["sandy",{},"Sandy Blaster does the sound for the family. She would like you to turn it up. That is all she ever says."],
  labels:["dot",{},"My best friend Dot Matrix prints the labels. Slowly, loudly and with great affection."],
  adlab:["viv",{},"Viv G. Adapter does our graphics. She says 256 colors is plenty and 16 is a lifestyle."],
  follow:["mo",{},"This is Mo Dem. She will connect you at 2400 baud. Please do not pick up the phone."],
  trophies:["nibble",{},"Nibble, our hamster, runs the wheel in the hallway. That is where the tickets come from. (It is not, but he believes it.)"],
  prizes:["nibble",{},"Nibble keeps the tickets safe. He says. We counted. Please count again."],
  gate:["rhoda",{},"My mom, Rhoda, on the door. She is read-only. You can look, but you cannot edit."],
  search:["mat",{},"This is Mat, our pet mouse. He clicks on everything, which is how this page got so many results."],
  report:["toner",{},"Toner, our puppy, signs every printout with a pawprint. That smudge is not a bug. It is a signature."],
  nf:["zack",{},"That was Zack. Nobody invited him, and he turns up on every page that does not exist."]};
 var FAMILY=[
  {id:"connie",n:"Connie Ventional",born:1981,role:"Our heroine",bio:"A memory module with a bow, born the same day as the IBM PC. She lives in the first 640K and shares what she has."},
  {id:"emma",n:"Emma 386 Ventional",born:1985,role:"Little sister",bio:"Born the year of the 386, so she can borrow more room than anyone in the house. Will explain page frames if you let her. Do not let her."},
  {id:"hiram",n:"Hiram “Himmy” Ventional",born:1988,role:"Little brother",bio:"Hi-Ram for short. He lives in the loft above the one-megabyte line, in room nobody else thought to use. He is never coming down."},
  {id:"ram",n:"Raymond “Ram” Ventional",born:1952,role:"Dad",bio:"Works nights at the county data center. Tube socks, mustache, a firm belief that 640K will be plenty. He was right in 1981."},
  {id:"rhoda",n:"Rhoda Ventional (née Reed-Only)",born:1954,role:"Mom",bio:"Read-only. Her rules cannot be changed, only read. She has been known to call bedtime write-protected."},
  {id:"floyd",n:"Grandpa Floyd Dysk",born:1924,role:"Grandpa",bio:"A floppy. Carries everything in his shirt pocket, 360K at a time. Ask him about disk 7 of 14. Do not ask twice."},
  {id:"winnie",n:"Grandma Winnie Chester",born:1926,role:"Grandma",bio:"A Winchester drive, and the first in the family with room to spare: 40 megabytes. She says she will never fill it up."},
  {id:"augusta",n:"Aunt Augusta “Gussie” Batch",born:1949,role:"Aunt, known as Auntie Autoexec",bio:"Runs first thing every morning, does everything on her list in order, and takes no questions until she is done. You know her from the Memory Maze."},
  {id:"conrad",n:"Uncle Conrad Figsys",born:1947,role:"Uncle",bio:"Sets up the family before anything else happens. Tells you what to load and where. If Conrad is wrong, nothing starts."},
  {id:"tess",n:"Tessie R. Resident",born:1983,role:"The houseguest",bio:"Terminated at the front door, stayed resident in the hallway. Sits on 16K of the family’s memory. Has never once been invited."},
  {id:"nibble",n:"Nibble",born:1982,role:"Family pet (hamster)",bio:"The family hamster. Half a byte, twice the personality."},
  {id:"dot",n:"Dorothy “Dot” Matrix",born:1981,role:"Best friend",bio:"Prints everything she says, loudly, in triplicate."},
  {id:"viv",n:"Vivian G. Adapter",born:1987,role:"Friend",bio:"Sixteen colors on a good day, 256 on a great one. Dresses accordingly."},
  {id:"sandy",n:"Sandy Blaster",born:1989,role:"Friend",bio:"Loud. Always on IRQ 5. Always arguing with somebody about IRQ 5."},
  {id:"mo",n:"Maureen “Mo” Dem",born:1979,role:"Friend",bio:"Connects slowly, makes a lot of noise doing it, and ties up the phone line all evening."},
  {id:"zack",n:"Zachary “Zack” Zip",born:1989,role:"The neighbor kid",bio:"Shows up folded small and unfolds in the living room. Nobody invited him. You know him from the Memory Maze."},
  {id:"mat",n:"Mat the Mouse",born:1984,role:"Family pet",bio:"A wired mouse with a long tail, born the year the Macintosh made the mouse famous. Lives under the mouse pad and chases the cursor. Has never caught it. Needs no memory at all."},
  {id:"toner",n:"Toner",born:1986,role:"Family pet",bio:"A toner cartridge who thinks he is a puppy. Leaves a fine black pawprint on everything he loves. Dot says she prints faster. Toner does not care. Toner wants to play."}];


 /* ---- trading cards (used by About for Matt and Tony, and by the Cards page for the family) */
 function esc2(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
 /* o = {id,n,hp,type,art(html),stats:[[label,0-10|text]],move:[name,text],flavor,no,rar,col,holo} */
 function card(o){var st=o.stats.map(function(x){var v=x[1];if(typeof v==="number"){var p="",i;for(i=0;i<10;i++)p+="<i"+(i<v?' class="on"':"")+"></i>";return"<dt>"+esc2(x[0])+'</dt><dd class="pp" aria-label="'+v+' of 10">'+p+"</dd>"}return"<dt>"+esc2(x[0])+"</dt><dd>"+esc2(v)+"</dd>"}).join("");
  return'<article class="tc'+(o.holo?" holo":"")+'" data-card="'+esc2(o.id)+'" style="--tc:'+(o.col||"#2fa39a")+'"><header><b>'+esc2(o.n)+"</b><span>"+esc2(o.hp)+'</span></header><div class="tc-art">'+o.art+'<em class="tc-shine" aria-hidden="true"></em></div><p class="tc-type">'+esc2(o.type)+'</p><dl class="tc-st">'+st+'</dl><p class="tc-mv"><b>'+esc2(o.move[0])+".</b> "+esc2(o.move[1])+'</p><p class="tc-fl">\u201c'+esc2(o.flavor)+'\u201d</p><footer><span>'+esc2(o.no)+"</span><span>"+esc2(o.rar)+"</span></footer></article>"}

 /* ---- the animation library. Every character is an <svg class="cc"> made of named groups (mc-all, mc-arml, mc-armr, mc-legl, mc-legr, mc-bow, mc-eyes, mc-mouth),
    so one set of CSS animations (style.css, "animation library") works on all of them. Use: CMCast.play(svgElement,"cheer") or "wave talk" for two at once.
    once = how many ms a one-shot lasts before the character returns to idle. Nothing moves when the visitor has motion turned off. */
 var ANIMS=[
  {k:"wave",n:"Wave",d:"Right arm up and down. The hello."},
  {k:"hop",n:"Hop",d:"A little jump, over and over. Good news."},
  {k:"cheer",n:"Cheer",d:"Both arms up and hopping. Level cleared."},
  {k:"dance",n:"Dance",d:"Sway, tap and wiggle the bow."},
  {k:"talk",n:"Talk",d:"The mouth opens and closes. Use with a speech bubble."},
  {k:"think",n:"Think",d:"A head tilt and eyes glancing around."},
  {k:"point",n:"Point",d:"Right arm out, pointing at something."},
  {k:"nod",n:"Nod",d:"Yes, yes, absolutely yes."},
  {k:"shiver",n:"Shiver",d:"A fast tremble. Cold, nervous or just loaded too high."},
  {k:"sleep",n:"Sleep",d:"Eyes shut and slow breathing."},
  {k:"peek",n:"Peek in",d:"Slides in from the side, once.",once:1100},
  {k:"walk",n:"Walk in",d:"Strolls in from the left with tapping feet, once.",once:2100},
  {k:"turn",n:"Turn around",d:"A flip, like turning to face the other way, once.",once:1300},
  {k:"bow",n:"Take a bow",d:"A deep bow, once.",once:1700},
  {k:"stroll",n:"Stroll",d:"Walking along: feet tapping and a little bob. Pair it with a move in position."},
  {k:"carry",n:"Carry",d:"Both arms up, holding a crate. Combine with stroll: \u201cstroll carry\u201d."},
  {k:"dust",n:"Dust",d:"Right arm swings back and forth with a feather duster."},
  {k:"stir",n:"Stir",d:"A small circular stir, for cooking."},
  {k:"solder",n:"Solder",d:"A steady, tiny hand tremor over a circuit board."},
  {k:"read",n:"Read",d:"A slow lean in and nod, reading the manual."},
  {k:"scurry",n:"Scurry",d:"Side to side, quick. For pets and for Zack."}];
 function stopAnim(el){if(!el)return;clearTimeout(el._ant);var c=(el.getAttribute("class")||"").split(/\s+/).filter(function(x){return x&&x.indexOf("an-")!==0});el.setAttribute("class",c.join(" "))}
 function play(el,names,ms){if(!el||!names)return;stopAnim(el);var c=(el.getAttribute("class")||"").split(/\s+/).filter(Boolean),once=0;
  names.split(" ").forEach(function(n){c.push("an-"+n);var a=ANIMS.filter(function(x){return x.k===n})[0];if(a&&a.once)once=Math.max(once,a.once)});
  el.setAttribute("class",c.join(" "));ms=ms||once;if(ms)el._ant=setTimeout(function(){stopAnim(el)},ms)}
 return{CAMEO:CAMEO,OUTFITS:OUTFITS,OUTFIT_ORDER:OUTFIT_ORDER,OUTFIT_FOR:OUTFIT_FOR,famGet:famGet,famSet:famSet,famOpts:famOpts,COLORS:COLORS,LOOKS:LOOKS,LOOK_ORDER:LOOK_ORDER,ACCS:ACCS,ACC_ORDER:ACC_ORDER,COLOR_PRIZE:COLOR_PRIZE,COLOR_ORDER:COLOR_ORDER,FUN_TOTAL:FUN_TOTAL,LEVELS:LEVELS,CAST:CAST,CAST_ORDER:CAST_ORDER,FAMILY:FAMILY,
  card:card,ANIMS:ANIMS,play:play,stopAnim:stopAnim,folk:folk,inner:inner,rects:rects,connieCfg:connieCfg,castSvg:castSvg,svg:svgOf,cur:cur,save:save,unlocked:unlocked,state:conState,stars:stars,cleared:cleared,readCount:readCount,GL:GL}})();
