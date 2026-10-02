/* connie.js: everything about Connie Ventional and her family.
   #/connie     who she is, her family, and her story (a scrapbook of real computer history)
   #/funnies    the Sunday funnies: eleven strips and eleven one-panel gags
   #/closet     pick her look, accessory and color; locked ones say how to unlock them
   #/memman     Memory Manager, a small game: fit the game into 640K by editing CONFIG.SYS
   #/stickers   a printable sticker sheet
   Drawing comes from cast.js. Saved in this browser only, under "cm-connie" (look, accessory, stars, funnies read). */
window.CMConnie=(function(){
 var app,io=null;
 function E(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
 function $(q,r){return(r||app).querySelector(q)}function $$(q,r){return Array.prototype.slice.call((r||app).querySelectorAll(q))}
 function sv(o){var s=CMCast.state();for(var k in o)s[k]=o[k];try{localStorage.setItem("cm-connie",JSON.stringify(s))}catch(e){}}
 function link(h,t,c){return'<a class="btn'+(c?" "+c:"")+'" href="'+h+'">'+t+"</a>"}
 function nav(cur){var t=[["connie","Her story"],["funnies","The Funnies"],["memman","Memory Manager"],["closet","Closet"],["stickers","Stickers"]];return'<nav class="tbar noprint" aria-label="Meet Connie">'+t.map(function(x){return'<a href="#/'+x[0]+'"'+(x[0]===cur?' aria-current="page"':"")+">"+x[1]+"</a>"}).join("")+"</nav>"}

 /* ------------------------------------------------------------------ her story */
 var FACTS=[["Full name","Connie Ventional (Connie for short)"],["Born","August 12, 1981, the same day IBM announced the Personal Computer"],["Height","640K, give or take the BIOS"],["Lives","The first 640K, which everybody calls conventional memory"],["Favorite food","Free kilobytes"],["Pet peeve","\u201cNot enough memory\u201d"],["Hobby","Loading things high"],["Shoes","Gold contacts, naturally"],["Motto","There is always room for one more, if you load it high."]];
 var STORY=[
  ["August 12, 1981","The day everybody was born","Connie arrived the same day as the IBM Personal Computer, which is why she insists the cake was meant for her. The first PCs came with 16K or 64K of memory installed, but the plan had room for 640K, and her parents named her after the plan. Her father, Ram, put it plainly at the christening: 640K was a lot. Nobody in the room argued. In 1981, nobody could."],
  ["1981 to 1983","A house with a very specific floor plan","The chip inside the PC could point at exactly one megabyte of memory and not a byte more, so the house had one megabyte of rooms. The bottom 640K was the family home. The top 384K was set aside for the neighbors: the video card, the BIOS, the adapter cards. The family called it the upper floor and mostly stayed off it. A famous line about 640K being enough for anybody is usually pinned on a certain software founder, who says he never said it. The Ventionals prefer to say nobody remembers."],
  ["1983","Tessie moves in","A houseguest named Tessie R. Resident knocked on the door and said she would only be a minute. She was a TSR, a Terminate and Stay Resident program, the kind that lets go of the keyboard and then waits quietly in memory until you press the right hotkey. Pop-up notepads and calculators worked this way. Tessie did terminate. She also stayed resident, in the hallway, where she has eaten about 16K of the family\u2019s memory every day since."],
  ["1985","Emma 386 and the window","In October the 80386 chip came out, and the Ventionals welcomed Emma 386, who was born knowing she could use more room than anyone else in the house. The trouble was the floor plan. Her extra room sat outside the house, so a clever arrangement called expanded memory slid it in through one small window, 64K at a time, called a page frame. Emma has been very patient about explaining the window ever since. Whether or not you asked."],
  ["1988","Hiram moves upstairs","Little Hiram was named for a bit of cleverness that came with the Himem.sys rule: the first 64K above the one-megabyte line could be reached from the old house with a clever trick on the A20 line. That sliver was called the high memory area, and Hiram claimed it for his bunk. He is not coming down. The family\u2019s doorman, a rule named HIMEM.SYS, decides who gets up the stairs, and Hiram has become very good at saying please."],
  ["1991","Dad rearranges the house","MS-DOS 5.0 arrived in June with two new tricks. DOS=HIGH moved the heavy furniture into Hiram\u2019s loft, and LOADHIGH let drivers move into the unused rooms on the upper floor. Uncle Conrad set it all up in CONFIG.SYS, and Auntie Autoexec ran her morning list in AUTOEXEC.BAT. For the first time in ten years there was room to move around the living room, and Connie noticed that it felt strange to be able to stretch."],
  ["1993","MemMaker, Doom and Tessie\u2019s long goodbye","In March MS-DOS 6 brought a wizard called MemMaker that would rearrange the house for you, restart twice, and gain you a few kilobytes. In December a game called Doom moved in down the street with a trick of its own: a DOS extender that climbed straight out of the 640K house into the huge flat memory a Pentium could see. Connie waved from the front door. She was not jealous. She just wanted to know how it got out."],
  ["1995 and after","The walls come down","In August, Windows 95 made most of the old rules unnecessary. Programs could ask for big flat rooms without anyone shuffling drivers up a staircase. Memory sticks grew from kilobytes to megabytes to gigabytes. The family still lives in the first 640K, in a museum, where Uncle Conrad still sets up CONFIG.SYS every morning and the rent is very reasonable. Connie says that if you ever feel like you are squeezing too much into too little, you are always welcome to load it high."]];
 function story(){var h='<section class="cv"><h2>Meet Connie</h2><div class="cv-hero">'+mascot(128,"happy",undefined,true)+'<div><p class="cv-lead"><b>Connie Ventional</b> is the museum\u2019s mascot: a memory module with a bow, big eyes and a lot of opinions about where to put things. She lives in the first 640K (the conventional kind, hence the name) with a large and very organized family of computer parts.</p><p>Pick her look in <a href="#/closet">the closet</a>, read her family in <a href="#/funnies">the Funnies</a>, or help her squeeze a game into memory in <a href="#/memman">Memory Manager</a>.</p></div></div>';
  h+='<h3 class="sub">Connie\u2019s file</h3><dl class="cv-file">'+FACTS.map(function(f){return"<div><dt>"+E(f[0])+"</dt><dd>"+E(f[1])+"</dd></div>"}).join("")+"</dl>";
  h+='<h3 class="sub">The family</h3><p class="cv-note">Names are period: the parents and grandparents have names from before the war and the baby boom, the kids have names from their own decade. Each one is a pun on how the PC remembered things.</p><div class="cv-fam">'+CMCast.FAMILY.map(function(p){return'<div class="cv-card"><div class="cv-spr">'+CMCast.svg(p.id,88,fo(p.id,{tall:p.id==="connie"}))+'</div><b>'+E(p.n)+'</b><small>'+E(p.role)+", born "+p.born+"</small><p>"+E(p.bio)+"</p>"+hangs(p.id)+"</div>"}).join("")+"</div>";
  h+='<h3 class="sub">Her story</h3><p class="cv-note">A scrapbook. The dates and the computer history are real. The family is not.</p><ol class="cv-story">'+STORY.map(function(c){return"<li><small>"+E(c[0])+"</small><h4>"+E(c[1])+"</h4><p>"+E(c[2])+"</p></li>"}).join("")+"</ol>";
  h+='<h3 class="sub">Take her with you</h3><p>'+link("#/stickers","Print stickers for your laptop","pri")+" "+link("#/funnies","Read the Funnies")+" "+link("#/closet","Open the closet")+" "+link("#/memman","Play Memory Manager")+'</p><p class="cv-note">Connie Ventional and her family are original characters made for this museum. Any resemblance to a real memory module is entirely intentional.</p></section>';
  app.innerHTML=nav("connie")+h}

 /* ------------------------------------------------------------------ the funnies */
 var SUN=function(y,m,d){return"Sunday, "+["January","February","March","April","May","June","July","August","September","October","November","December"][m-1]+" "+d+", "+y};
 function P(scene,who,cap){return{s:scene,w:who,c:cap||""}}
 var STRIPS=[
  {t:"Happy Birthday to Us",d:SUN(1990,8,12),p:[
   P("party",[["connie","happy","I was born the same day as the IBM PC!"]],"Connie\u2019s ninth birthday."),
   P("party",[["dot","happy","Did the PC get a cake too?"],["connie","happy","Theirs came with 16K. Mine came with room for 640K."]]),
   P("party",[["ram","happy","Make a wish, honey."],["connie","sleep","Hmm..."]]),
   P("party",[["connie","wow","A little more memory, please!"],["emma","happy","Wishes above 640K go through me."]])]},
  {t:"640K Is Plenty",d:SUN(1987,12,6),p:[
   P("room",[["ram","happy","Nobody could ever fill 640K."]]),
   P("room",[["connie","happy",""],["emma","happy",""],["hiram","happy",""],["tess","happy",""],["nibble","happy",""]],"Six years later."),
   P("room",[["emma","oops","Dad, my half is full."],["tess","happy","Mine is full of mine."]]),
   P("room",[["ram","oops","Who is going to Grandma\u2019s? She has 40 megs."],["winnie","happy","Send them over!"]])]},
  {t:"Emma\u2019s Window",d:SUN(1988,6,5),p:[
   P("hall",[["connie","happy","Emma, I need the big box of crayons."]]),
   P("hall",[["emma","happy","Page frame rules. One 64K box at a time."]],"A little window in the wall."),
   P("hall",[["connie","oops","That is the paste."],["emma","wink","Swap?"]]),
   P("hall",[["connie","oops","Next time I am using the closet."],["emma","happy","Closet is extended memory. Needs a driver."]],"Four swaps later.")]},
  {t:"Hiram Lives Upstairs",d:SUN(1989,3,5),p:[
   P("room",[["ram","happy","Hiram! Dinner!"]]),
   P("night",[["hiram","wink","I am in the high memory area!"]],"The first 64K above the one-megabyte line."),
   P("room",[["rhoda","oops","How does he even get up there?"],["connie","happy","Past HIMEM. You have to ask nicely."]]),
   P("night",[["hiram","happy","DOS said there is more room in the loft than the house."],["connie","wink","That is the plan for 1991."]])]},
  {t:"Mom Is Read-Only",d:SUN(1989,10,1),p:[
   P("kitchen",[["connie","happy","Mom, can I stay up till ten?"],["rhoda","happy","No."]]),
   P("kitchen",[["connie","oops","Please? It is the weekend."],["rhoda","happy","No."]]),
   P("kitchen",[["connie","oops","Dad, can you change her mind?"],["ram","oops","I tried in \u201983. Write-protected."]]),
   P("kitchen",[["rhoda","wink","You can read the rules any time, sweetheart."],["connie","sleep","...but not edit them."]])]},
  {t:"Auntie Autoexec",d:SUN(1991,2,3),p:[
   P("room",[["augusta","happy","Rise and shine! First, make your bed."]],"6:00 a.m."),
   P("room",[["augusta","happy","Second, brush your teeth. Third, breakfast. Fourth, the mouse."],["connie","sleep","zzz"]]),
   P("room",[["connie","oops","Why do you always go first?"],["augusta","happy","Because then everything else works."]]),
   P("room",[["conrad","happy","I run before she does, you know."],["augusta","oops","Conrad. Always showing off."]])]},
  {t:"Tessie Stays Resident",d:SUN(1992,9,6),p:[
   P("hall",[["ram","oops","Tessie, it has been nine years. Time to go."],["tess","happy","Okay!"]]),
   P("yard",[["tess","happy","Bye!"]],"Terminated."),
   P("hall",[["tess","happy","I am still here."]],"...and stay resident."),
   P("room",[["connie","oops","She ate my 16K."],["tess","happy","Sorry. Nom."]])]},
  {t:"Disk Seven of Fourteen",d:SUN(1992,11,1),p:[
   P("desk",[["floyd","happy","Installing the new game!"]]),
   P("desk",[["floyd","happy","Insert disk 2."],["winnie","happy","Back in my day we had one disk."]]),
   P("desk",[["floyd","oops","Insert disk 7."]],"An hour later."),
   P("desk",[["winnie","wink","Floyd, you should have bought the CD-ROM."],["floyd","oops","I am on disk 13."],["connie","wow","There are 14."]])]},
  {t:"Nobody Invited Zack",d:SUN(1993,1,3),p:[
   P("hall",[["connie","oops","Mom, there is a package at the door."]]),
   P("hall",[["ram","oops","Who ordered a very small box?"]],"A tiny parcel marked ZACK.ZIP."),
   P("hall",[["zack","wow","Unzipping... 1 of 1!"]]),
   P("room",[["rhoda","oops","We did not invite you."],["zack","happy","I was tiny a minute ago. I swear."]])]},
  {t:"MemMaker",d:SUN(1993,5,2),p:[
   P("desk",[["conrad","happy","New wizard! MemMaker will fix the whole house."]]),
   P("desk",[["conrad","happy","Restart."],["connie","oops","Again?"]],"Two reboots later."),
   P("desk",[["connie","wow","How much did we gain?"],["conrad","happy","Four kilobytes."]]),
   P("desk",[["connie","happy","That is one crayon."],["conrad","wow","In this house that is a crayon box!"]])]},
  {t:"Mo Is on the Line",d:SUN(1994,4,3),p:[
   P("kitchen",[["rhoda","oops","Who is on the phone?"],["connie","happy","Mo. She is online."]]),
   P("kitchen",[["mo","wow","KSSSHHH-BEEEE-DOOO-WEEE"],["rhoda","oops","Three hours?"]]),
   P("kitchen",[["ram","oops","I need to call the plumber."],["mo","happy","Connecting..."]]),
   P("kitchen",[["ram","sleep","We are getting a second line."],["mo","happy","Still connecting..."]])]}];
 var GAGS=[
  {s:"hall",w:[["hiram","happy","I am not short. I am in the high memory area."]],c:"Hiram, age 4, on a very tall stool."},
  {s:"room",w:[["connie","happy",""],["emma","happy",""],["hiram","happy",""],["tess","happy",""]],c:"\u201cThere is always room for one more. If you load it high.\u201d"},
  {s:"kitchen",w:[["ram","oops","Where did my other 384K go?"],["rhoda","happy","Video and the BIOS took it, dear."]],c:"Dad does the math at the kitchen table."},
  {s:"hall",w:[["emma","wink","I swear it all fits. One 64K box at a time."]],c:"Emma explains the window."},
  {s:"room",w:[["winnie","happy","Forty whole megabytes. I will never fill it."],["floyd","oops","...dear."]],c:"Grandma Winnie, 1987."},
  {s:"hall",w:[["tess","happy","I terminated. I am also resident."]],c:"Behind the sofa, again."},
  {s:"yard",w:[["zack","happy","Nobody ordered me. I just got here."]],c:"Zack, newly unzipped."},
  {s:"room",w:[["augusta","happy","Ten things before breakfast. In order. Every day."]],c:"Auntie Autoexec with a clipboard."},
  {s:"room",w:[["nibble","happy",""]],c:"Nibble: half a byte, twice the personality."},
  {s:"party",w:[["dot","happy","Happy Birthday! Happy Birthday! Happy Birthday!"]],c:"Dot Matrix prints in triplicate. Loudly."},
  {s:"kitchen",w:[["sandy","oops","It is my IRQ!"],["dot","oops","No, it is MINE!"]],c:"Family dinner, IRQ 5 edition."}];
 function pnl(p,big){var ch=p.w.map(function(w){return'<div class="cc-w">'+(w[2]?'<p class="cc-b">'+E(w[2])+"</p>":"")+CMCast.svg(w[0],(big?[0,112,88,68,56,48]:[0,92,70,54,46,40])[Math.min(p.w.length,5)],{mood:w[1]})+"</div>"}).join("");return'<div class="cc-p sc-'+p.s+'">'+(p.c?'<p class="cc-c">'+E(p.c)+"</p>":"")+'<div class="cc-s">'+ch+"</div></div>"}
 function funnies(){var read=CMCast.state().read,n=CMCast.readCount();
  var h=nav("funnies")+'<section class="cf"><div class="cf-mast"><small>Conventional Memory Daily Press</small><h2>The Sunday Funnies</h2><small>Eleven strips and eleven gags. All the news that fits in 640K.</small></div>'
   +'<p class="cf-prog" id="cfprog">'+(n>=CMCast.FUN_TOTAL?"You read every one. The Aerobics 1985 look is unlocked in the closet.":"Read them all to unlock a look for Connie: <b>"+Math.min(n,CMCast.FUN_TOTAL)+" of "+CMCast.FUN_TOTAL+"</b> so far.")+"</p>"
   +'<h3 class="cf-sec">Connie &amp; Co.</h3>'
   +STRIPS.map(function(s,i){return'<article class="cf-strip" data-k="s'+(i+1)+'"><header><b>'+E(s.t)+"</b><small>"+E(s.d)+'</small></header><div class="cf-row">'+s.p.map(function(p){return pnl(p)}).join("")+"</div></article>"}).join("")
   +'<h3 class="cf-sec">Around the House</h3><div class="cf-gags">'+GAGS.map(function(g,i){return'<figure class="cf-gag" data-k="g'+(i+1)+'"><div class="cf-ring">'+pnl({s:g.s,w:g.w,c:""},true)+"</div><figcaption>"+E(g.c)+"</figcaption></figure>"}).join("")+"</div>"
   +'<p class="cv-note">Drawn on a 24 by 24 pixel grid by a very small committee of memory chips. Reading all of them counts toward a look for Connie. <a href="#/closet">Closet</a></p></section>';
  app.innerHTML=h;
  var items=$$("[data-k]");
  function mark(k){var st=CMCast.state();if(st.read[k])return;st.read[k]=1;try{localStorage.setItem("cm-connie",JSON.stringify(st))}catch(e){}var c=CMCast.readCount(),el=$("#cfprog");if(el)el.innerHTML=c>=CMCast.FUN_TOTAL?"You read every one. The Aerobics 1985 look is unlocked in the closet. <a href=\"#/closet\">Open the closet</a>":"Read them all to unlock a look for Connie: <b>"+c+" of "+CMCast.FUN_TOTAL+"</b> so far."}
  if("IntersectionObserver" in window){io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&e.target.dataset.k){var k=e.target.dataset.k;setTimeout(function(){if(document.body.contains(e.target))mark(k)},900)}})},{threshold:.5});items.forEach(function(x){io.observe(x)})}
  else items.forEach(function(x){mark(x.dataset.k)})}

 /* ------------------------------------------------------------------ the closet */
 var mood="happy";
var HANG={manuals:["Manuals","#/manuals"],workbench:["Workbench","#/workbench"],journal:["Repair journal","#/journal"],runs:["Does it run?","#/runs"],advisor:["Advisor","#/advisor"],compare:["Compare","#/compare"],scale:["The scale","#/scale"],backup:["Backup","#/backup"],install:["Install","#/install"],daily:["Daily Dig","#/daily"],today:["Today","#/today"],kiosk:["Demo kiosk","#/kiosk"],jukebox:["Jukebox","#/jukebox"],labels:["Labels","#/labels"],adlab:["Ad Lab","#/adlab"],follow:["Follow","#/follow"],trophies:["Trophies","#/trophies"],prizes:["Prize counter","#/prizes"],gate:["The staff door","#/staff"],nf:["Every page that does not exist",""]};
 function hangs(id){var o=[];Object.keys(CMCast.CAMEO).forEach(function(k){if(CMCast.CAMEO[k][0]===id&&HANG[k])o.push(HANG[k][1]?'<a href="'+HANG[k][1]+'">'+E(HANG[k][0])+"</a>":E(HANG[k][0]))});return o.length?'<small class="cv-at">You will find them on: '+o.join(", ")+".</small>":""}
 function fo(id,extra){var o=CMCast.famOpts(id);for(var k in extra)o[k]=extra[k];return o}
 var GUYS=[["conrad","Uncle Conrad","Config.sys in human form. Bow tie, mustache, strong opinions about jumpers."],["ram","Raymond (Dad)","Reads the manual first. Always. Has the khaki shorts to prove it."]];
 function famTile(id,kind,val,name,note,on){var o={tall:1,mood:"happy"},f=CMCast.famGet(id);o.outfit=kind==="o"?val:f.o;o.color=kind==="c"?val:f.c;o.acc=kind==="a"?(val||undefined):(f.a||undefined);
  return'<div class="cl-t'+(on?" on":"")+'"><button type="button" class="cl-b" data-fam="'+id+'" data-fk="'+kind+'" data-fv="'+val+'" aria-pressed="'+(on?"true":"false")+'">'+CMCast.svg(id,84,o)+"<b>"+E(name)+"</b><small>"+(on?"Wearing":E(note))+"</small></button></div>"}
 function famCloset(){var h='<h3 class="sub">The guys\u2019 closet</h3><p class="cv-note">Uncle Conrad and Raymond have wardrobes too: '+CMCast.OUTFIT_ORDER.length+' outfits, any board color and a few accessories. All free. What you pick shows on the family page and on the sticker sheet.</p>';
  GUYS.forEach(function(g){var id=g[0],f=CMCast.famGet(id);
   h+='<h4 class="sub">'+E(g[1])+'</h4><div class="cl-top"><div class="cl-prev">'+CMCast.svg(id,170,fo(id,{tall:1}))+"</div><p>"+E(g[2])+" Wearing: <b>"+E(CMCast.OUTFITS[f.o].n)+"</b>.</p></div>";
   h+='<div class="cl-grid">'+CMCast.OUTFIT_ORDER.map(function(k){var O=CMCast.OUTFITS[k];return famTile(id,"o",k,O.n,O.note,f.o===k)}).join("")+"</div>";
   h+='<div class="cl-grid">'+["","blue","gold","red","purple","black","green"].map(function(k){return famTile(id,"c",k,k?CMCast.COLORS[k].n+" board":"His own color","A new coat of board.",f.c===k)}).join("")+"</div>";
   h+='<div class="cl-grid">'+["","none","shades","fl","headset"].map(function(k){return famTile(id,"a",k,k===""?"Outfit\u2019s own":CMCast.ACCS[k].n,k===""?"Whatever goes with it.":"Added to the outfit.",(f.a||"")===k)}).join("")+"</div>"});
  return h}
 function tile(kind,id,name,note,cur,state){var u=state;var svg=kind==="look"?CMCast.svg("connie",96,{look:id,acc:"none",mood:"happy",skin:CMCast.cur().skin}):kind==="acc"?CMCast.svg("connie",96,{look:CMCast.cur().look,acc:id,mood:"happy"}):CMCast.svg("connie",96,{look:CMCast.cur().look,acc:CMCast.cur().acc,skin:id,mood:"happy"});
  return'<div class="cl-t'+(u.ok?"":" lock")+(cur?" on":"")+'">'+(u.ok?'<button type="button" class="cl-b" data-kind="'+kind+'" data-id="'+id+'" aria-pressed="'+(cur?"true":"false")+'">'+svg+"<b>"+E(name)+"</b><small>"+(cur?"Wearing":E(note))+"</small></button>":'<div class="cl-l">'+svg+"<b>"+E(name)+'</b><small class="cl-why">Locked. '+E(u.why)+"</small>"+(u.at?'<a class="btn" href="'+u.at+'">'+(/prize/.test(u.at)?"Prize counter":"Go")+"</a>":"")+"</div>")+"</div>"}
 function closet(){var c=CMCast.cur(),h=nav("closet")+'<section class="cv"><h2>Connie\u2019s closet</h2><div class="cl-top"><div class="cl-prev">'+CMCast.svg("connie",200,{tall:1,mood:mood,look:c.look,acc:c.acc,skin:c.skin})+'</div><div><p>Pick a look, an accessory and a color. She wears them everywhere on the site: on the prize counter, in the not-found page, in the Memory Maze. Some are free, some cost tickets from the <a href="#/prizes">prize counter</a>, and some can only be earned by playing.</p><p class="cl-moods" role="group" aria-label="Preview mood">'
   +["happy","wink","wow","love","oops","sleep"].map(function(m){return'<button type="button" class="btn'+(m===mood?" pri":"")+'" data-mood="'+m+'">'+m+"</button>"}).join(" ")+'</p><p><button type="button" class="btn" id="clrand">Surprise me</button> <a class="btn" href="#/stickers">Print stickers</a></p><p class="cv-note">Wearing: <b>'+E(CMCast.LOOKS[c.look].n)+"</b>, "+E(CMCast.ACCS[c.acc].n.toLowerCase())+", "+E(CMCast.COLORS[c.skin].n.toLowerCase())+'. Stars in Memory Manager: <b>'+CMCast.stars()+" of "+3*CMCast.LEVELS+"</b>. Funnies read: <b>"+Math.min(CMCast.readCount(),CMCast.FUN_TOTAL)+" of "+CMCast.FUN_TOTAL+"</b>.</p></div></div>";
  h+='<h3 class="sub">Looks</h3><div class="cl-grid">'+CMCast.LOOK_ORDER.map(function(id){var L=CMCast.LOOKS[id];return tile("look",id,L.n,L.note,c.look===id,CMCast.unlocked("look",id))}).join("")+"</div>";
  h+='<h3 class="sub">Accessories</h3><div class="cl-grid">'+CMCast.ACC_ORDER.map(function(id){var A=CMCast.ACCS[id];return tile("acc",id,A.n,A.note||"Just Connie.",c.acc===id,CMCast.unlocked("acc",id))}).join("")+"</div>";
  h+='<h3 class="sub">Colors</h3><div class="cl-grid">'+CMCast.COLOR_ORDER.map(function(id){return tile("color",id,CMCast.COLORS[id].n,"A new coat of board.",c.skin===id,CMCast.unlocked("color",id))}).join("")+"</div>"+famCloset()+"</section>";
  app.innerHTML=h;
  $$("[data-kind]").forEach(function(b){b.onclick=function(){var k=b.dataset.kind,id=b.dataset.id;if(k==="look"&&CMCast.cur().look===id)return;CMCast.save(k==="look"?{look:id}:k==="acc"?{acc:id}:{skin:id});closet()}});
  $$("[data-fam]").forEach(function(b){b.onclick=function(){var p={};p[b.dataset.fk]=b.dataset.fv;CMCast.famSet(b.dataset.fam,p);closet()}});
  $$("[data-mood]").forEach(function(b){b.onclick=function(){mood=b.dataset.mood;closet()}});
  $("#clrand").onclick=function(){function pickOK(kind,list){var ok=list.filter(function(i){return CMCast.unlocked(kind,i).ok});return ok[Math.floor(Math.random()*ok.length)]}CMCast.save({look:pickOK("look",CMCast.LOOK_ORDER),acc:pickOK("acc",CMCast.ACC_ORDER),skin:pickOK("color",CMCast.COLOR_ORDER)});closet()}}

 /* ------------------------------------------------------------------ stickers */
 var SLOGANS=[["LOADHIGH","Load it high."],["READ-ONLY","Mom said so."],["640K","Is plenty."],["DO NOT TOUCH MY PINS","Thank you."],["TESSIE WAS HERE","And still is."],["ABORT, RETRY, FAIL?","Connie says retry."]];
 function stickers(){var h=nav("stickers")+'<section class="cv cs"><h2>Stickers</h2><p class="noprint">Print a sheet and put Connie on your laptop, your toolbox or your lunch box. Use sticker paper if you have it, or plain paper and a glue stick. Looks you have not unlocked stay off the sheet until you earn them. <button class="btn pri" id="stprint" type="button">Print this sheet</button></p><p class="noprint"><b>Print-ready sheets</b> (8.5 x 11 in, 300 dpi PNG, with cut guides): <a href="stickers/conventional-memory-stickers-1-connie-looks.png" download>Connie\'s wardrobe</a> &middot; <a href="stickers/conventional-memory-stickers-2-the-ventional-family.png" download>The Ventional family</a> &middot; <a href="stickers/conventional-memory-stickers-3-museum-jokes-1.png" download>Museum jokes 1</a> &middot; <a href="stickers/conventional-memory-stickers-3-museum-jokes-2.png" download>Museum jokes 2</a> &middot; <a href="stickers/conventional-memory-stickers-4-laptop-size-connie.png" download>Big Connie</a> &middot; <a href="stickers/conventional-memory-stickers-5-uncle-conrad.png" download>Uncle Conrad</a> &middot; <a href="stickers/conventional-memory-stickers-6-raymond.png" download>Raymond</a> &middot; <a href="stickers/conventional-memory-stickers-7-big-guys.png" download>Big Uncle and Dad</a></p><div class="cs-sheet">';
  CMCast.LOOK_ORDER.forEach(function(l){if(!CMCast.unlocked("look",l).ok)return;h+='<div class="cs-s round">'+CMCast.svg("connie",120,{tall:1,look:l,acc:"none",mood:"happy",label:CMCast.LOOKS[l].n})+"<b>"+E(CMCast.LOOKS[l].n)+"</b></div>"});
  [["emma","Emma 386"],["hiram","Himmy"],["tess","Tessie"],["zack","Zack"],["floyd","Floyd"],["winnie","Winnie"],["augusta","Auntie Autoexec"],["conrad","Conrad"],["ram","Raymond"],["nibble","Nibble"]].forEach(function(p){h+='<div class="cs-s round">'+CMCast.svg(p[0],100,fo(p[0],{tall:p[0]!=="nibble"}))+"<b>"+E(p[1])+"</b></div>"});
  [["conrad","Conrad",["biker","hawaii","wizard","desk","tux"]],["ram","Raymond",["grill","garage","cowboy","golf","fishing"]]].forEach(function(g){g[2].forEach(function(k){h+='<div class="cs-s round">'+CMCast.svg(g[0],100,{tall:1,outfit:k})+"<b>"+E(g[1]+": "+CMCast.OUTFITS[k].n)+"</b></div>"})});
  SLOGANS.forEach(function(s){h+='<div class="cs-s tag"><b>'+E(s[0])+"</b><small>"+E(s[1])+"</small></div>"});
  h+='</div><p class="cv-note noprint">Connie and her family are original characters. Print for yourself, or for friends.</p></section>';app.innerHTML=h;$("#stprint").onclick=function(){window.print()}}

 /* ------------------------------------------------------------------ Memory Manager */
 var DRV=[["mouse","Mouse driver","MOUSE.COM",17,"Because pointing is a human right."],["cd","CD-ROM driver","MSCDEX.EXE",40,"A driver plus MSCDEX. Hungry."],["sound","Sound card driver","SBDRV.COM",24,"Beeps in stereo."],["cache","Disk cache","SMARTDRV.EXE",28,"Speeds up everything except this game."],["doskey","Command recall","DOSKEY.COM",4,"Up arrow brings back your last command."],["net","Network stack","NETBIND.EXE",56,"For the LAN party. Hungry too."],["ansi","Pretty colors","ANSI.SYS",4,"Escape codes. Just for fun."]];
 var DOS_LOW=54,DOS_HIGH=6,HIMEM_K=1,EMM_K=3;
 var LV=[
  {t:"The boot disk",g:"Castle of the Gremlin 3",need:560,req:["mouse"],himem:0,emm:0,umb:0,blk:0,say:"Plain DOS, no tricks yet. Keep only what the game needs.",win:"Fits. The gremlins were not expecting you."},
  {t:"Dos=High",g:"Space Quest for Beginners",need:560,req:["mouse","sound"],himem:1,emm:0,umb:0,blk:0,say:"HIMEM.SYS opens the high memory area, and DOS=HIGH lets DOS itself move in. That is a lot of free room for one line.",win:"DOS moved into Hiram\u2019s loft. Hiram says hi."},
  {t:"The upper floor",g:"Myst-y Island CD",need:570,req:["mouse","cd","sound"],himem:1,emm:1,umb:100,blk:100,say:"Now add EMM386 and the drivers can move up to the upper memory blocks. That is what LOADHIGH is for.",win:"All three drivers went upstairs. Nobody downstairs noticed."},
  {t:"A tight upper floor",g:"Wing Commando II",need:600,req:["mouse","cd","sound"],himem:1,emm:1,umb:64,blk:64,say:"Only 64K of upper room this time. Send the biggest ones up and leave the smallest downstairs.",win:"The big drivers took the good rooms. Smart."},
  {t:"LAN party",g:"Death Arena Network",need:600,req:["mouse","sound","net"],himem:1,emm:1,umb:100,blk:100,say:"The network stack eats 56K. You can only fit so many upstairs, so choose wisely.",win:"Four players, zero crashes."},
  {t:"Cut into blocks",g:"Space Trader Deluxe",need:585,req:["mouse","cd","sound"],himem:1,emm:1,umb:96,blk:32,say:"The upper floor is split into small rooms, 32K at most. Anything bigger has to stay downstairs.",win:"The CD driver did not fit upstairs, so you left it downstairs. Right call."},
  {t:"No EMM386 allowed",g:"Flight Simulator 5.0 (a very particular one)",need:570,req:["mouse","cd"],himem:1,emm:0,umb:0,blk:0,say:"This game crashes if EMM386 is loaded. No upper floor for you. DOS=HIGH has to do the heavy lifting.",win:"No EMM386 and still enough memory. That is the craft."},
  {t:"The final config",g:"Grand Prix Online",need:585,req:["mouse","cd","sound","net"],himem:1,emm:1,umb:100,blk:64,say:"Everything is needed and not everything fits upstairs. Work out what to send up and what to leave.",win:"A perfect CONFIG.SYS. Uncle Conrad weeps with joy."}];
 /* free conventional memory for a setting; ok=false if the setting is not allowed */
 function calc(L,s){var low=s.doshigh?DOS_HIGH:DOS_LOW,ok=true,why="",hi=0;if(s.himem)low+=HIMEM_K;if(s.emm)low+=EMM_K;
  if(s.doshigh&&!s.himem){ok=false;why="DOS=HIGH needs HIMEM.SYS first."}if(s.emm&&!s.himem){ok=false;why="EMM386 needs HIMEM.SYS first."}
  DRV.forEach(function(d){var m=s.drv[d[0]]||0;if(m===1)low+=d[3];else if(m===2){hi+=d[3];if(!s.emm){ok=false;why=d[1]+" cannot go high without EMM386.EXE."}else if(d[3]>L.blk){ok=false;why=d[1]+" is "+d[3]+"K and the biggest upper block is "+L.blk+"K."}}});
  if(hi>L.umb){ok=false;why="Upper memory is "+L.umb+"K and you tried to put "+hi+"K up there."}
  return{free:640-low,low:low,hi:hi,ok:ok,why:why}}
 function passes(L,s){var c=calc(L,s);if(!c.ok)return false;return L.req.every(function(id){return(s.drv[id]||0)>0})&&c.free>=L.need}
 /* the best that can be done: every setting of the required drivers (the optional ones stay off) */
 function bestSafe(L){return bestPlan(L).free}
 function bestPlan(L){var b=-1,bt=null,sc,k,n=L.req.length,m=Math.pow(2,n);for(sc=0;sc<8;sc++){var h=!!(sc&1),e=!!(sc&2),dh=!!(sc&4);if((h&&!L.himem)||(e&&!L.emm)||(dh&&!L.himem))continue;
   for(k=0;k<m;k++){var t={himem:h,emm:e,doshigh:dh,drv:{}},q=k;L.req.forEach(function(id){t.drv[id]=1+(q%2);q=Math.floor(q/2)});var c=calc(L,t);if(c.ok&&c.free>b){b=c.free;bt=t}}}return{free:b,t:bt}}
 function planText(L){var P=bestPlan(L),t=P.t,o=[];if(t.himem)o.push("HIMEM.SYS on");if(t.emm)o.push("EMM386.EXE on");if(t.doshigh)o.push("DOS=HIGH on");L.req.forEach(function(id){var d=DRV.filter(function(x){return x[0]===id})[0];o.push(d[1]+": "+["off","Low","High"][t.drv[id]])});return o.join("; ")+". That leaves "+P.free+"K free."}
 function hiWhy(L,s,d){if(!L.himem)return{t:"There is no upper memory on this level yet, so everything has to load Low. Later levels add EMM386, and that is what opens the upper floor."};if(!L.emm)return{t:"This level does not allow EMM386, so there is no upper floor. Use DOS=HIGH and keep the drivers Low."};if(!s.emm)return{t:"Loading High needs EMM386.EXE (and HIMEM.SYS under it). Tick them in CONFIG.SYS above, or press the button.",fix:1};if(d[3]>L.blk)return{t:d[1]+" is "+d[3]+"K, but the biggest free room upstairs is "+L.blk+"K. It cannot go High, so it stays Low."};return null}
 function starsFor(L,s){var c=calc(L,s),b=bestSafe(L);return c.free>=b?3:c.free>=b-10?2:1}
 var MM=null;
 function fresh(i){return{lv:i,himem:false,emm:false,doshigh:false,drv:{},msg:"",ok:null}}
 function fileOf(L,s){var cfg=["REM CONFIG.SYS"],bat=["@ECHO OFF","REM AUTOEXEC.BAT"];if(s.himem)cfg.push("DEVICE=C:\\DOS\\HIMEM.SYS");if(s.emm)cfg.push("DEVICE=C:\\DOS\\EMM386.EXE NOEMS");cfg.push(s.doshigh?(s.emm?"DOS=HIGH,UMB":"DOS=HIGH"):(s.emm?"DOS=UMB":"DOS=LOW"));cfg.push("FILES=30","BUFFERS=20");
  DRV.forEach(function(d){var m=s.drv[d[0]]||0;if(!m)return;var nm="C:\\"+d[2];if(/\.SYS$/.test(d[2])){cfg.push((m===2?"DEVICEHIGH=":"DEVICE=")+nm)}else bat.push((m===2?"LH ":"")+nm)});
  return cfg.join("\n")+"\n\n"+bat.join("\n")}
 function bar(L,s){var c=calc(L,s),h="",tot=640;function seg(k,cls,t){if(k<=0)return;h+='<span class="mm-s '+cls+'" style="flex:'+k+' 1 0" title="'+E(t)+" "+k+'K"></span>'}
  seg(s.doshigh?DOS_HIGH:DOS_LOW,"dos","DOS");if(s.himem)seg(HIMEM_K,"sys","HIMEM");if(s.emm)seg(EMM_K,"sys","EMM386");
  DRV.forEach(function(d){if((s.drv[d[0]]||0)===1)seg(d[3],"drv",d[1])});seg(Math.max(0,c.free),"free","Free");return'<div class="mm-bar" role="img" aria-label="'+c.free+'K free of 640K">'+h+"</div>"}
 function mmUnlocked(){var o={},n=0;[["look","sysop"],["look","grunge"],["acc","headset"],["acc","halo"]].forEach(function(x){o[x[0]+x[1]]=CMCast.unlocked(x[0],x[1]).ok});return o}
 function memman(args){if(!MM)MM=fresh(0);var i=Math.max(0,Math.min(LV.length-1,(+args&&+args[0]||0)>0?+args[0]-1:MM.lv));MM.lv=i;draw()}
 function draw(){var s=MM,L=LV[s.lv],c=calc(L,s),st=CMCast.state().stars,mood=s.ok===true?"wow":s.ok===false?"oops":"happy";
  var h=nav("memman")+'<section class="mm"><h2>Memory Manager</h2><p class="cv-note">Fit the game into memory. Turn drivers on, decide whether each one loads low or high, and press Run. Your stars unlock looks for Connie in <a href="#/closet">the closet</a>.</p>';
  var firstTime=!Object.keys(st).some(function(k){return +st[k]>0});
  h+='<details class="mm-how"'+(firstTime?" open":"")+'><summary>How to play (and what the words mean)</summary><ol><li><b>Read the goal.</b> Every game needs some free <i>conventional memory</i> (the first 640K) and a few drivers, like the mouse or sound card.</li><li><b>Turn drivers on.</b> Each driver row has three buttons: <b>Off</b> (not loaded), <b>Low</b> (uses conventional memory, which is what you are short of) and <b>High</b> (loads in the upper memory area, so it costs you nothing down low).</li><li><b>Unlock High.</b> High is greyed out until the PC allows it. You need <b>HIMEM.SYS</b> and <b>EMM386.EXE</b> ticked in CONFIG.SYS. Click a greyed High button any time and Connie tells you what is missing. Each driver also has to fit in the biggest free upper block, and the upper floor has a total size.</li><li><b>Tick DOS=HIGH</b> (needs HIMEM.SYS) to move most of DOS out of your way: it uses 6K low instead of 54K. That is the biggest single win.</li><li><b>Watch the bar.</b> The green part is free memory. When it reaches the number the game needs, press <b>Run</b>.</li><li><b>Stars.</b> One star for fitting, two for getting within 10K of the best possible, three for the best. Stuck? Use <b>Hint</b> below the table, or <b>Show a solution</b>.</li></ol><dl class="mm-gl"><dt>Conventional memory</dt><dd>The first 640K, where DOS programs run. Everything you load low eats into it.</dd><dt>Upper memory area</dt><dd>The leftover 384K between 640K and 1MB. EMM386 lets drivers live there.</dd><dt>HIMEM.SYS</dt><dd>Opens memory above 1MB and the high memory area. Hiram\u2019s loft.</dd><dt>EMM386.EXE</dt><dd>Makes the upper memory blocks usable. Emma\u2019s trick.</dd><dt>LOADHIGH (LH) / DEVICEHIGH</dt><dd>The commands that put a program in the upper memory. This is what the High button does.</dd></dl></details>';
  h+='<div class="mm-lv" role="group" aria-label="Level">'+LV.map(function(x,k){var got=Math.min(3,+st[k+1]||0),open=k===0||(+st[k]||0)>=1;return'<button type="button" class="btn'+(k===s.lv?" pri":"")+'" data-lv="'+k+'"'+(open?"":" disabled")+' aria-label="Level '+(k+1)+(open?"":" locked")+", "+got+' stars">'+(k+1)+'<small>'+(open?"\u2605".repeat(got)+"\u2606".repeat(3-got):"\u{1F512}")+"</small></button>"}).join("")+"</div>";
  h+='<div class="mm-top">'+mascot(80,mood)+'<div><h3 class="sub">Level '+(s.lv+1)+": "+E(L.t)+'</h3><p class="mm-goal"><b>'+E(L.g)+"</b> needs <b>"+L.need+"K</b> free and these drivers: <b>"+L.req.map(function(id){return E(DRV.filter(function(d){return d[0]===id})[0][1])}).join(", ")+".</b></p><p class=\"mm-say\">Connie: \u201c"+E(L.say)+"\u201d</p></div></div>";
  h+='<p class="mm-mach">Your PC: 640K conventional'+(L.umb?", "+L.umb+"K upper memory, largest free block "+L.blk+"K":", no upper memory")+(L.himem?"":", no HIMEM.SYS")+(L.himem&&!L.emm?", EMM386 is not allowed":"")+".</p>";
  h+='<p class="cv-note">'+(!L.himem?"On this level there is no HIMEM.SYS yet, so every driver loads Low. Later levels add the tricks, one at a time.":!L.emm?"On this level EMM386 is not allowed (the game crashes with it), so use DOS=HIGH and keep drivers Low.":"HIMEM.SYS and EMM386.EXE are both available here. Tick them to unlock the High buttons.")+"</p>";
  h+=bar(L,s)+'<p class="mm-free" aria-live="polite"><b>'+c.free+"K</b> free of 640K. Need "+L.need+"K. "+(c.ok?"":'<span class="mm-bad">'+E(c.why)+"</span>")+"</p>";
  h+='<fieldset class="mm-sys"><legend>CONFIG.SYS</legend><label><input type="checkbox" data-sys="himem"'+(s.himem?" checked":"")+(L.himem?"":" disabled")+"> HIMEM.SYS <small>("+HIMEM_K+"K)</small></label> <label><input type=\"checkbox\" data-sys=\"emm\""+(s.emm?" checked":"")+(L.emm?"":" disabled")+"> EMM386.EXE <small>("+EMM_K+"K)</small></label> <label><input type=\"checkbox\" data-sys=\"doshigh\""+(s.doshigh?" checked":"")+(L.himem?"":" disabled")+"> DOS=HIGH <small>(DOS uses "+DOS_HIGH+"K instead of "+DOS_LOW+"K)</small></label></fieldset>";
  h+='<div class="mm-drv"><div class="mm-hd"><b>Driver</b><b>Size</b><b>Load</b></div>'+DRV.map(function(d){var m=s.drv[d[0]]||0,req=L.req.indexOf(d[0])>=0,canHi=L.emm&&s.emm&&d[3]<=L.blk;return'<div class="mm-r"><div><b>'+E(d[1])+"</b>"+(req?' <em class="mm-req">needed</em>':"")+"<small>"+E(d[2])+". "+E(d[4])+"</small></div><span>"+d[3]+'K</span><span class="mm-ch" role="radiogroup" aria-label="'+E(d[1])+' load">'+["Off","Low","High"].map(function(l,k){return'<label class="mm-o'+(m===k?" on":"")+(k===2&&!canHi?" na":"")+'"'+(k===2&&!canHi?' title="Not available yet. Click to find out why."':"")+'><input type="radio" name="d-'+d[0]+'" data-d="'+d[0]+'" value="'+k+'"'+(m===k?" checked":"")+">"+l+"</label>"}).join("")+"</span></div>"}).join("")+"</div>";
  if(s.tip){h+='<div class="mm-tip" role="status"><b>Why not High?</b> '+E(s.tip.t)+(s.tip.fix?' <button type="button" class="btn" id="mmfix">Turn on HIMEM and EMM386 for me</button>':"")+"</div>"}
  if(s.hint){h+='<div class="mm-tip" role="status"><b>Hint:</b> '+E(s.hint)+"</div>"}
  h+='<p><button type="button" class="btn" id="mmhint">Hint</button> <button type="button" class="btn" id="mmsol">Show a solution</button></p>';
  h+='<details class="mm-code"><summary>See the files this builds</summary><pre>'+E(fileOf(L,s))+"</pre></details>";
  h+='<p><button type="button" class="btn pri" id="mmrun">Run '+E(L.g)+'</button> <button type="button" class="btn" id="mmreset">Start over</button></p><div class="mm-out" role="status" aria-live="polite">'+(s.msg||"")+"</div></section>";
  app.innerHTML=h;
  $$("[data-lv]").forEach(function(b){b.onclick=function(){MM=fresh(+b.dataset.lv);draw()}});
  $$("[data-sys]").forEach(function(b){b.onchange=function(){var k=b.dataset.sys;s[k]=b.checked;if(k==="himem"&&!b.checked){s.emm=false;s.doshigh=false;DRV.forEach(function(d){if(s.drv[d[0]]===2)s.drv[d[0]]=1})}if(k==="emm"&&!b.checked)DRV.forEach(function(d){if(s.drv[d[0]]===2)s.drv[d[0]]=1});s.msg="";s.hint=null;s.tip=null;s.ok=null;draw();var f=$('[data-sys="'+k+'"]');if(f)f.focus()}});
  $$("[data-d]").forEach(function(b){b.onchange=function(){var dd=DRV.filter(function(x){return x[0]===b.dataset.d})[0];if(+b.value===2){var w=hiWhy(L,s,dd);if(w){s.tip=w;s.tipd=dd[1];s.msg="";draw();var f0=$('[data-d="'+b.dataset.d+'"]:checked');if(f0)f0.focus();return}}s.tip=null;s.hint=null;s.drv[b.dataset.d]=+b.value;s.msg="";s.ok=null;draw();var f=$('[data-d="'+b.dataset.d+'"]:checked');if(f)f.focus()}});
  if($("#mmfix"))$("#mmfix").onclick=function(){s.himem=true;s.emm=true;s.tip=null;s.msg="";s.ok=null;draw()};
  $("#mmhint").onclick=function(){var q=[];if(L.himem&&!s.himem)q.push("Start by ticking HIMEM.SYS.");else if(L.himem&&!s.doshigh)q.push("Tick DOS=HIGH: it frees about 48K on its own.");else if(L.emm&&!s.emm)q.push("Tick EMM386.EXE so the drivers can move upstairs.");else{var P=bestPlan(L),big=L.req.map(function(id){return DRV.filter(function(x){return x[0]===id})[0]}).sort(function(a,b){return b[3]-a[3]})[0];q.push(P.t.emm?"Send the largest drivers High first (the "+big[1].toLowerCase()+" is "+big[3]+"K), then check the bar.":"Only turn on what the game needs and keep it Low. Every K counts.")}s.hint=q[0];s.tip=null;draw()};
  $("#mmsol").onclick=function(){s.hint=planText(L);s.tip=null;draw()};
  $("#mmreset").onclick=function(){MM=fresh(s.lv);draw()};
  $("#mmrun").onclick=function(){var cc=calc(L,s),miss=L.req.filter(function(id){return!(s.drv[id]>0)});
   if(!cc.ok){s.msg='<p class="mm-bad">Bad or missing command in CONFIG.SYS: '+E(cc.why)+"</p>";s.ok=false}
   else if(miss.length){s.msg='<p class="mm-bad">'+E(L.g)+" cannot find: "+miss.map(function(id){return E(DRV.filter(function(d){return d[0]===id})[0][1])}).join(", ")+". Turn it on first.</p>";s.ok=false}
   else if(cc.free<L.need){s.msg='<p class="mm-bad">Not enough memory to run '+E(L.g)+".<br>"+cc.free+"K free, "+L.need+"K needed.</p><p>Hint: what can go up, and what can you turn off?</p>";s.ok=false}
   else{var before=mmUnlocked(),stars=starsFor(L,s),old=+CMCast.state().stars[s.lv+1]||0,ss=CMCast.state();ss.stars[s.lv+1]=Math.max(old,stars);try{localStorage.setItem("cm-connie",JSON.stringify(ss))}catch(e){}
    var after=mmUnlocked(),nu=[];if(!before.looksysop&&after.looksysop)nu.push("the BBS Sysop look");if(!before.lookgrunge&&after.lookgrunge)nu.push("the Grunge look");if(!before.accheadset&&after.accheadset)nu.push("the Sysop headset");if(!before.acchalo&&after.acchalo)nu.push("the Power LED halo");
    s.ok=true;s.msg='<p class="mm-good"><b>'+cc.free+"K free. "+E(L.win)+"</b></p><p>"+"\u2605".repeat(stars)+"\u2606".repeat(3-stars)+(stars<3?" (a perfect setup leaves "+bestSafe(L)+"K free)":" Perfect!")+"</p>"+(nu.length?'<p class="mm-new">Unlocked: '+nu.join(" and ")+'. <a href="#/closet">Open the closet</a></p>':"")+(s.lv<LV.length-1?'<p><button type="button" class="btn pri" id="mmnext">Next level</button></p>':'<p>You cleared every level.</p>')}
   draw();var nx=$("#mmnext");if(nx)nx.onclick=function(){MM=fresh(s.lv+1);draw()}}}

 return{mount:function(el,page,args){app=el;try{if(page==="connie")story();else if(page==="funnies")funnies();else if(page==="closet")closet();else if(page==="stickers")stickers();else if(page==="memman")memman(args)}catch(e){app.innerHTML='<section><h2>Something broke</h2><p class="empty">This page could not load ('+E(e.message)+").</p></section>"}},
  unmount:function(){if(io){io.disconnect();io=null}},
  _t:{LV:LV,DRV:DRV,calc:calc,best:bestSafe,passes:passes,starsFor:starsFor,STRIPS:STRIPS,GAGS:GAGS,STORY:STORY}}})();
