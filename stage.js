/* stage.js: the museum at work. A little animated stage where Connie and her family carry things in, dust, cook, solder, print and cheer.
   Used by the demo kiosk (toys.js) and free to use anywhere: CMStage.mount(element) once, then CMStage.run("carry",{name:"IBM PC"}).
   Scenes (pick one by name, or let the kiosk pick one that fits the slide):
     carry    Connie carries a crate in and sets it on the display stand, Emma dusts                 kinds: item
     dust     Emma dusts the shelf, Connie sweeps, Himmy bounces on the stool                         kinds: item
     shelve   Dad carries a box to the shelf while Connie directs (left, no, her left)               kinds: item
     bench    Uncle Conrad solders at the bench, Connie points, Mat scurries                          kinds: hw
     garage   Dad reads the manual of something that is already in pieces                             kinds: hw
     arcade   Himmy and Zack at the arcade cabinet, Connie runs over to cheer                         kinds: game
     music    Sandy runs the jukebox, Viv and Connie dance, Dot wants an encore                        kinds: game
     print    Dot prints, Mo is on the phone, Toner follows Connie                                    kinds: quote
     kitchen  Mom cooks, Dad reads the manual, Auntie Autoexec checks the list                        kinds: fact, quote
     storage  Grandpa Floyd carries disks, Grandma Winnie watches, Tessie sneaks in                   kinds: fact
     family   Connie welcomes one family member, given as {who:"emma", line:"...", gl:"Hi!"}          kinds: family
     closet   Connie dances through her looks while Emma and Himmy cheer                              kinds: closet
     mall     Connie in a hard hat, Mat and Toner, Conrad presenting                                  kinds: mall
     menu     Everybody lines up and waves at the visitor                                             kinds: menu
   Connie is the biggest and is on every scene. Moves come from CMCast.play (see the Animations page, #/animations). Reduced motion shows the finished tableau, no walking.
   Tools for scenes: mk(id,x,opts) makes an actor with .go .anim .say .prop .face .fx; scn() adds floor scenery; deco() adds wall decorations.
   Positions are 0 to 100 across a playfield that squeezes toward the middle on very wide stages; below 0 or above 100 is off stage. */
window.CMStage=(function(){
 var box=null,timers=[],ints=[],last="",li={},cast=[];
 function mo(){return document.documentElement.getAttribute("data-motion")!=="off"}
 function T(fn,ms){if(!mo()){fn();return}timers.push(setTimeout(fn,ms))}
 function every(fn,ms){if(mo())ints.push(setInterval(fn,ms))}
 function clear(){timers.forEach(clearTimeout);ints.forEach(clearInterval);timers=[];ints=[];cast=[]}
 function pick(k,arr){li[k]=((li[k]==null?Math.floor(Math.random()*arr.length):li[k]+1))%arr.length;return arr[li[k]]}
 function U(){var h=box?box.clientHeight:230;return Math.max(.55,Math.min(1.15,h/230))}
 function KX(){var w=box?box.clientWidth:700;return Math.max(.6,Math.min(1,720/w))}
 function X(x){return(x<0||x>100)?x:50+(x-50)*KX()}
 function E(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
 function short(s){s=String(s||"");return s.length>18?s.slice(0,16)+"...":s}
 /* the first sentence, kept short enough for a speech bubble */
 function brief(s,n){s=String(s||"").replace(/\s+/g," ").replace(/^\s+|\s+$/g,"");var m=s.match(/^.*?[.!?](\s|$)/);if(m)s=m[0].replace(/\s+$/,"");n=n||64;if(s.length>n){s=s.slice(0,n-3);s=s.replace(/\s+\S*$/,"")+"..."}return s}
 function scn(kind,x,txt){var d=document.createElement("div");d.className="stg-n sn-"+kind;d.style.left=X(x)+"%";if(txt!=null)d.innerHTML=txt;box.appendChild(d);return d}
 function deco(kind,x,y,txt,vars){var d=document.createElement("div"),k;d.className="stg-d d-"+kind;d.style.left=X(x)+"%";d.style.top=y+"%";if(txt!=null)d.innerHTML=txt;for(k in(vars||{}))d.style.setProperty(k,vars[k]);box.appendChild(d);return d}
 function mk(id,x,o){o=o||{};var el=document.createElement("div"),star=id==="connie",w=Math.round((o.w||(star?120:84))*U()),z=o.z||(star?6:3),A={id:id,el:el,w:w,cur:"",x:x},bub;
  el.className="stg-a"+(star?" star":"");el.style.left=X(x)+"%";if(o.lift)el.style.bottom="calc(4% + "+Math.round(o.lift*U())+"px)";el.style.zIndex=z;
  el.innerHTML='<p class="stg-b" hidden></p><div class="stg-in"><span class="stg-p"></span><span class="stg-s"></span></div>';box.appendChild(el);bub=el.querySelector(".stg-b");
  A.draw=function(op){var oo={tall:!(id==="nibble"||id==="mat"||id==="toner"),mood:o.mood||"happy"},k;for(k in(o.opts||{}))oo[k]=o.opts[k];for(k in(op||{}))oo[k]=op[k];
   var s=el.querySelector(".stg-s");s.innerHTML=CMCast.svg(id,w,oo);A.svg=s.firstChild;if(A.cur)CMCast.play(A.svg,A.cur)};
  A.anim=function(n){A.cur=n||"";if(!n)CMCast.stopAnim(A.svg);else CMCast.play(A.svg,n)};
  A.face=function(d){el.classList.toggle("flip",d<0)};
  A.go=function(x2,secs,n){var d=x2-A.x;A.x=x2;if(Math.abs(d)>1)A.face(d);void el.offsetWidth;el.style.transition=mo()?"left "+secs+"s cubic-bezier(.35,0,.65,1),opacity .3s":"none";el.style.left=X(x2)+"%";if(n)A.anim(n)};
  A.prop=function(kind,txt){var p=el.querySelector(".stg-p");p.className="stg-p"+(kind?" pp-"+kind:"");p.innerHTML=kind==="crate"?"<b>"+E(txt||"")+"</b>":""};
  A.fit=function(){if(bub.hidden||!box)return;var br=box.getBoundingClientRect(),r,dx=0;bub.className="stg-b";bub.style.transform="";bub.style.removeProperty("--tx");r=bub.getBoundingClientRect();
   if(r.top<br.top+2){bub.className="stg-b stgside "+(A.x>50?"stgl":"stgr");r=bub.getBoundingClientRect();if(r.right>br.right-3){bub.className="stg-b stgside stgl"}else if(r.left<br.left+3){bub.className="stg-b stgside stgr"}return}
   if(r.left<br.left+3)dx=br.left+3-r.left;else if(r.right>br.right-3)dx=br.right-3-r.right;
   if(dx){bub.style.transform="translateX(calc(-50% + "+dx+"px))";bub.style.setProperty("--tx",(-dx)+"px")}};
  A.say=function(t,ms){bub.textContent=t;if(window.CMBub){var sk=CMBub.skin(id,t);bub.setAttribute("data-sh",sk.shape);bub.style.setProperty("--hh",sk.hue)}bub.hidden=false;el.style.zIndex=30;A.fit();if(ms)T(function(){A.hush()},ms)};
  A.hush=function(){bub.hidden=true;el.style.zIndex=z};
  /* little pixel effects: puff, spark, heart, note, star */
  A.fx=function(kind,dx,dy){if(!mo())return;var f=document.createElement("i");f.className="stg-fx fx-"+kind;f.style.left=(50+(dx||0))+"%";f.style.top=(dy==null?8:dy)+"%";el.appendChild(f);setTimeout(function(){if(f.parentNode)f.parentNode.removeChild(f)},1300)};
  A.draw();A.face(o.face||(x>56&&x<=100?-1:1));cast.push(A);
  if(mo()&&window.requestAnimationFrame){el.classList.add("stg-pre");requestAnimationFrame(function(){requestAnimationFrame(function(){el.classList.remove("stg-pre")})})}
  return A}
 function refit(){cast.forEach(function(a){a.fit()})}

 var SC={};
 SC.carry=function(d){var nm=short(d.name),c,e;scn("shelf",14);scn("plinth",72);deco("banner",50,9,"NEW ARRIVALS");deco("frame",38,30);deco("frame",84,28,null,{"--c1":"#ff7a9a","--c2":"#ffd54a"});
  c=mk("connie",-14);c.prop("crate",nm||"FRAGILE");c.go(58,3.4,"stroll carry");c.say(pick("cy",["Coming through!","Careful, careful!","Heavy! Fascinating, but heavy."]),1900);
  e=mk("emma",92,{w:78});e.prop("duster");e.anim("dust");e.say("Dusting. Again.",2400);every(function(){e.fx("puff",-30,40)},800);
  T(function(){c.prop("");c.anim("bow");scn("item",72,"<b>"+E(nm||"?")+"</b>");c.fx("star",30,0)},3500);
  T(function(){c.anim("wave talk");c.say(d.name?"The "+nm+" is older than the intern.":"Another one for the shelf!",2400)},5200);
  T(function(){c.anim("nod");e.say("It is spotless. Dusting anyway.",1800)},7000)};
 SC.dust=function(){scn("shelf",70);scn("stool",14);deco("window",34,10);deco("clock",52,12);var e=mk("emma",56,{w:80}),c,h;e.prop("duster");e.anim("stroll dust");e.go(86,3.4);every(function(){e.fx("puff",-30,40)},700);T(function(){e.go(58,3)},3600);
  c=mk("connie",-12);c.prop("broom");c.go(38,3,"stroll");c.say("Sweeping! Not dancing. Sweeping.",2200);T(function(){c.anim("dance");c.say("Okay, a little dancing.",2200)},3200);T(function(){c.anim("");c.say("Hiram, get off the stool.",1800)},6000);
  h=mk("hiram",14,{w:70,lift:24});h.anim("hop");T(function(){h.say("I can reach the top shelf. Nobody else can.",2600)},1000);T(function(){h.say("Not getting off.",1600)},6600)};
 SC.shelve=function(d){var r,c,h;scn("shelf",20);scn("stool",84);deco("frame",42,26);deco("frame",70,30,null,{"--c1":"#4ad66d","--c2":"#14264a"});
  r=mk("ram",-14,{w:84});r.prop("crate","BOX 12");r.go(26,2.6,"stroll carry");
  c=mk("connie",58,{w:120});c.anim("point");T(function(){c.say("A little to the left!",1300)},1800);T(function(){r.go(30,.8);c.say("No, my left.",1300)},3100);T(function(){r.go(22,.8);r.say("That is my left.",1500)},4300);
  T(function(){r.prop("");r.anim("nod");var it=scn("item",20,"<b>BOX 12</b>");it.style.bottom="calc(44% + 48px)";c.anim("cheer");c.fx("star",30,0);c.say("Perfect!",1400)},5500);
  h=mk("hiram",84,{w:70,lift:24});h.anim("hop");T(function(){h.say("I could have reached that.",2000)},5000)};
 SC.bench=function(d){scn("bench",28);deco("lamp",30,0);deco("poster",74,14,"SAFETY<br>FIRST");var o=mk("conrad",28,{w:88,opts:{outfit:"lab"}}),c,m;o.anim("solder");o.say("Hold still, little capacitor.",2400);every(function(){o.fx("spark",20,28)},650);
  c=mk("connie",112);c.go(56,2.6,"stroll");T(function(){c.anim("point");c.say(pick("cb",["Uncle Conrad is fixing "+(d.name?short(d.name):"a classic")+".","If it sparks, it is working.","He says it is only a little smoke."]),2800)},2700);
  m=mk("mat",98,{w:60});m.go(84,2,"scurry");T(function(){m.go(70,2,"scurry")},2200);T(function(){o.say("Not you, Mat.",2000);m.go(94,1.6,"scurry")},4300)};
 SC.garage=function(d){scn("bench",26);deco("lamp",28,0);deco("poster",76,16,"TOOLS<br>GO BACK");var r=mk("ram",26,{w:88,opts:{outfit:"garage"}}),c,m;r.anim("read");T(function(){r.say("Let me read the manual first.",2400)},500);
  c=mk("connie",112);c.go(56,2.8,"stroll");T(function(){c.anim("point");c.say("Dad, it is already in pieces.",2600)},3000);T(function(){r.say("[computer,laptop,console,handheld,audio,storage,network,print,camera,input,display,machine]Page one says do not take it apart.",2400);c.anim("nod")},5400);
  m=mk("mat",90,{w:56});m.anim("scurry");m.go(76,1.6);T(function(){m.go(92,1.8)},2400)};
 SC.arcade=function(){scn("arcade",32);deco("neon",32,10,"INSERT COIN");var h=mk("hiram",24,{w:74}),z=mk("zack",42,{w:74}),c;h.anim("cheer");z.anim("shiver");z.say("Nobody ordered a high score.",2200);T(function(){h.say("I am not short. The cabinet is tall.",2400);h.fx("star",30,6)},2600);
  c=mk("connie",112);c.go(68,2.8,"stroll");T(function(){c.anim("cheer");c.say(pick("ca",["Level cleared!","One more quarter!","My turn. My turn. My turn."]),2800)},3000)};
 SC.music=function(){scn("jukebox",12);deco("neon",50,8,"NOW PLAYING",{"--n":"#ff3d9a"});var s=mk("sandy",28,{w:80}),v=mk("viv",72,{w:80}),d2=mk("dot",90,{w:76}),c;s.anim("nod");s.say("Turn it up!",2000);every(function(){s.fx("note",20,0);v.fx("note",-20,4)},900);
  v.anim("dance");c=mk("connie",-12);c.go(50,2.6,"stroll");T(function(){c.anim("dance");c.say("This is my song. All of them are.",2800)},2800);T(function(){d2.anim("talk");d2.say("Encore! Encore! Encore!",2400)},4400);T(function(){s.say("It is IRQ 5. Do not touch.",2200)},5600)};
 SC.print=function(d){scn("printer",22);scn("phone",88);deco("calendar",56,12);var dot=mk("dot",22,{w:80}),mo2=mk("mo",78,{w:80}),c,t;dot.anim("talk");dot.say("Printing! Printing! Printing!",2400);mo2.anim("shiver");mo2.say("Connecting...",2400);
  c=mk("connie",-12);c.prop("crate","MAIL");c.go(50,3,"stroll carry");t=mk("toner",-30,{w:56});t.go(38,3.4,"stroll");
  T(function(){c.prop("");c.anim("wave talk");c.say(pick("cp",["Dot printed the quote. Three copies.","That is overheard, not overprinted."]),2800);t.anim("hop");t.fx("heart",10,0)},3200);T(function(){t.say("Woof. (Smudge.)",1800);mo2.say("Still connecting...",1800)},5600)};
 SC.kitchen=function(){scn("stove",20);scn("table",76);deco("clock",48,12);deco("window",86,10);var r=mk("rhoda",20,{w:84}),a=mk("ram",78,{w:84}),g=mk("augusta",92,{w:78}),c;r.prop("spoon");r.anim("stir");r.say("Dinner is at six. Dinner is read-only.",2800);a.anim("read");T(function(){a.say("The oven manual says preheat.",2200)},2800);g.anim("nod");T(function(){g.say("Item five: dishes.",1800)},5200);
  c=mk("connie",-12);c.prop("crate","SOUP");c.go(48,3,"stroll carry");T(function(){c.prop("");c.anim("wave talk");c.say(pick("ck",["Mom is cooking. Dad is reading the oven.","Auntie has a list for dinner too."]),2800)},3200)};
 SC.storage=function(){scn("drive",86);deco("sign",30,10,"STORAGE");deco("frame",60,28,null,{"--c1":"#2f3a86","--c2":"#e8e8ee"});var f=mk("floyd",-12,{w:80}),w=mk("winnie",86,{w:84}),t,c;f.prop("crate","DISK 7");f.go(52,3.6,"stroll carry");w.anim("nod");w.say("Forty megabytes. Plenty of room.",1900);T(function(){f.prop("");f.anim("shiver");f.say("Disk 7 of 14...",2200)},3700);
  c=mk("connie",20,{w:120});c.anim("think");t=mk("tess",108,{w:70});T(function(){t.go(68,2.4,"stroll")},1500);T(function(){t.say("(nom)",1400)},2400);T(function(){c.say("Tessie, that is not a snack.",2600);c.anim("point")},4200);T(function(){t.anim("hop");t.say("It was a little bit a snack.",1800)},6200)};
 SC.family=function(d){var id=d.who||"emma",g,c=mk("connie",34);deco("banner",78,9,"WELCOME HOME");deco("frame",12,28);c.anim("wave");g=mk(id,-12,{w:id==="connie"?120:88,opts:{outfit:id==="conrad"||id==="ram"?"classic":undefined}});g.go(66,3,"stroll");
  c.say(trimL(d.line||"Look who is here!",96),3400);T(function(){g.anim(({emma:"hop",hiram:"hop",zack:"shiver",dot:"talk",sandy:"dance",viv:"dance",nibble:"hop",mat:"hop",toner:"hop",tess:"shiver",floyd:"nod",winnie:"nod",mo:"shiver"})[id]||"wave");g.say(d.gl||"Hi!",2600);g.fx("heart",0,0)},3200);T(function(){c.anim("hop")},3300)};
 SC.closet=function(){deco("banner",50,6,"FASHION SHOW");deco("mirror",86,20);deco("rack",12,26);var c=mk("connie",50,{w:130}),e=mk("emma",22,{w:78}),h=mk("hiram",78,{w:74}),L=[],i=0;try{L=CMCast.LOOK_ORDER.filter(function(l){return CMCast.unlocked("look",l).ok})}catch(x){}if(!L.length)L=["classic"];
  c.anim("dance");e.anim("cheer");h.anim("hop");c.say("Fashion show! Today only.",2400);T(function(){e.say("Ten out of ten.",1800)},2800);T(function(){h.say("I vote for the bow.",1800)},4600);
  function sw(){var l=L[i++%L.length];c.draw({look:l,acc:"none"});c.fx("star",34,2);if(mo())T(sw,1500)}T(sw,1400)};
 SC.mall=function(){scn("barrier",50);scn("cone",30);scn("cone",70);deco("banner",50,9,"GRAND OPENING: SOON");var c=mk("connie",42,{w:124,opts:{look:"explorer"}}),o=mk("conrad",14,{w:84,opts:{outfit:"keynote"}}),m=mk("mat",74,{w:58}),t=mk("toner",86,{w:58});c.anim("point");c.say("The mall is under construction.",3000);T(function(){c.say("Grand opening: soon.",2400)},3200);o.anim("nod");T(function(){o.say("One more thing...",2400)},1500);m.anim("scurry");T(function(){m.say("Click.",1200)},4200);t.anim("hop");T(function(){t.say("Woof. (Smudge.)",1500)},5000)};
 SC.menu=function(){var ids=["emma","ram","hiram","rhoda","dot","sandy"],xs=[10,24,76,90,66,34],i,c=mk("connie",50,{w:130});deco("banner",50,9,"PRESS ANY BUTTON");c.anim("wave talk");c.say("Touch any button!",5000);
  ids.forEach(function(id,k){var a=mk(id,xs[k],{w:72});a.anim(k%2?"wave":"hop")});every(function(){var a=cast[1+Math.floor(Math.random()*(cast.length-1))];if(a)a.fx("heart",0,0)},1100)};
 var BY={item:["carry","dust","shelve"],hw:["bench","garage"],game:["arcade","music"],quote:["print","kitchen"],fact:["kitchen","storage"],family:["family"],closet:["closet"],mall:["mall"],menu:["menu"]};


 /* ================================================================== the director
    Scenes can also be composed on the fly from what a slide is about, so new books, movies, games and machines get a scene without anybody
    drawing one. CMStage.run("auto", {kind, name, year, maker, sub, type, dur}) picks a topic (book, game, laptop, audio...), a set, who would care,
    what they hold and say, and spaces the beats across dur milliseconds so the scene finishes before the slide changes. */
 var NOUN={book:"book",movie:"movie",game:"game",software:"program",computer:"machine",laptop:"laptop",console:"console",handheld:"handheld",audio:"sound gear",storage:"drive",network:"modem",print:"printer",camera:"camera",input:"controller",display:"monitor",news:"news",quote:"quote",fact:"fact",machine:"machine"};
 var TOPIC_RX=[["laptop",/laptop|notebook|libretto|thinkpad|powerbook|portable|subnotebook/i],["handheld",/game ?boy|handheld|game gear|lynx|\bpsp\b|nomad|\bpalm|\bpda\b|pocket|nintendo ds/i],
  ["console",/console|\bnes\b|famicom|genesis|mega drive|playstation|xbox|dreamcast|saturn|atari 2600|nintendo 64|\bn64\b|snes|neo geo|\b3do\b|jaguar|colecovision|intellivision|vectrex|\bwii\b|gamecube/i],
  ["audio",/sound|midi|walkman|ipod|synth|speaker|music|audio|mp3|stereo|radio|cassette|headphone|roland|adlib|gravis|soundblaster/i],
  ["storage",/disk|drive|floppy|cd-?rom|\btape\b|\bzip\b|hard |storage|\bjaz\b|\bdvd\b|flash|memory card|\bssd\b|\bram\b|\bsimm|\bdimm/i],
  ["network",/modem|\bbbs\b|internet|network|ethernet|\bweb\b|e-?mail|\baol\b|compuserve|phone|\bfax\b|wi-?fi|browser|usenet|\birc\b|prodigy/i],
  ["print",/printer|plotter|print/i],["camera",/camera|webcam|photo|camcorder/i],["input",/keyboard|mouse|joystick|trackball|gamepad|controller|paddle|light ?pen|tablet/i],["display",/monitor|\bcrt\b|display|screen|\blcd\b|television/i]];
 function topicOf(d){var k=String(d.kind||""),n=(d.name||"")+" "+(d.sub||"")+" "+(d.type||"")+" "+(d.maker||""),i;
  if(d.topic&&RECIPE[d.topic])return d.topic;
  if(k==="bk"||k==="book")return"book";if(k==="m"||k==="movie")return"movie";if(k==="quote")return"quote";if(k==="fact")return"fact";if(/^(e|w|u|event|news)$/.test(k))return"news";
  if(/^(gt|gn|gc|game)$/.test(k))return"game";if(k==="sw"||k==="software")return"software";
  for(i=0;i<TOPIC_RX.length;i++)if(TOPIC_RX[i][1].test(n))return TOPIC_RX[i][0];
  return/^(p|hw|pe|item)$/.test(k)?"computer":"machine"}
 /* the set (piece, slot), wall decorations, a banner, the people who would care (id, what they hold, what they do) and what Connie holds */
 var RECIPE={
  book:{set:[["bookcase","L"],["stool","R"]],deco:[["window",50,12],["clock",66,14]],ban:function(d){return"BOOK CLUB"},c:"book",fx:"star",pool:[["winnie","book","read"],["rhoda","book","read"],["zack","book","scurry"],["emma","magnifier","read"],["floyd","book","nod"],["hiram","book","hop"],["augusta","pencil","nod"]]},
  movie:{set:[["tv","L"],["table","R"]],deco:[["neon",50,10,"NOW SHOWING"],["poster",70,22,"COMING<br>SOON"]],ban:null,c:"pizza",fx:"star",pool:[["viv","pizza","nod"],["nibble","pizza","hop"],["dot","clipboard","talk"],["sandy","tape","dance"],["toner","","hop"],["zack","pizza","shiver"]]},
  game:{set:[["arcade","L"],["stool","R"]],deco:[["neon",50,10,"INSERT COIN"],["poster",72,22,"HIGH<br>SCORES"]],ban:null,c:"controller",fx:"star",pool:[["hiram","controller","hop"],["zack","stick","shiver"],["emma","controller","cheer"],["sandy","walkman","dance"],["viv","controller","nod"],["nibble","","hop"],["mat","mouse","scurry"]]},
  software:{set:[["desk","L"],["drive","R"]],deco:[["banner",50,9,"NEW RELEASE"],["clock",72,14]],ban:null,c:"floppy",fx:"spark",pool:[["floyd","floppy","shiver"],["winnie","laptop","nod"],["conrad","mouse","read"],["augusta","clipboard","nod"],["emma","clipboard","read"],["tess","","hop"]]},
  computer:{set:[["bench","L"],["plinth","R"]],deco:[["lamp",22,0],["poster",74,14,"SAFETY<br>FIRST"]],ban:null,c:"mouse",fx:"spark",pool:[["conrad","iron","solder"],["ram","book","read"],["emma","magnifier","read"],["hiram","laptop","hop"],["mat","mouse","scurry"],["dot","clipboard","talk"]]},
  laptop:{set:[["desk","L"],["stool","R"]],deco:[["window",50,12],["frame",72,26]],ban:null,c:"laptop",fx:"spark",pool:[["hiram","laptop","hop"],["conrad","iron","solder"],["winnie","laptop","nod"],["mo","phone","talk"],["emma","laptop","read"]]},
  console:{set:[["tv","L"],["table","R"]],deco:[["neon",50,10,"PLAYER 2 READY",{"--n":"#ff3d9a"}],["poster",72,22,"CONSOLE<br>WARS"]],ban:null,c:"controller",fx:"star",pool:[["sandy","controller","cheer"],["zack","stick","shiver"],["hiram","controller","hop"],["emma","controller","cheer"],["nibble","","hop"],["viv","controller","nod"]]},
  handheld:{set:[["stool","L"],["table","R"]],deco:[["window",50,12],["clock",70,14]],ban:null,c:"controller",fx:"star",pool:[["hiram","controller","hop"],["zack","controller","shiver"],["emma","controller","cheer"],["sandy","walkman","dance"],["nibble","","hop"]]},
  audio:{set:[["jukebox","L"],["speaker","R"]],deco:[["neon",50,10,"NOW PLAYING",{"--n":"#ff3d9a"}],["frame",74,28]],ban:null,c:"walkman",fx:"note",pool:[["sandy","walkman","dance"],["viv","tape","dance"],["dot","clipboard","talk"],["mo","phone","nod"],["toner","","hop"],["emma","walkman","nod"]]},
  storage:{set:[["drive","L"],["shelf","R"]],deco:[["sign",30,10,"STORAGE"],["frame",62,28,{"--c1":"#2f3a86","--c2":"#e8e8ee"}]],ban:null,c:"floppy",fx:"spark",pool:[["floyd","floppy","shiver"],["winnie","laptop","nod"],["tess","","hop"],["conrad","iron","read"],["augusta","clipboard","nod"]]},
  network:{set:[["phone","L"],["desk","R"]],deco:[["calendar",50,12],["sign",74,10,"ON THE LINE"]],ban:null,c:"phone",fx:"spark",pool:[["mo","phone","shiver"],["conrad","mouse","read"],["emma","laptop","read"],["dot","clipboard","talk"],["zack","","scurry"],["hiram","laptop","hop"]]},
  print:{set:[["printer","L"],["desk","R"]],deco:[["calendar",50,12],["banner",74,9,"PRINT ROOM"]],ban:null,c:"clipboard",fx:"puff",pool:[["dot","clipboard","talk"],["mo","phone","nod"],["toner","","hop"],["augusta","clipboard","nod"],["rhoda","pencil","read"]]},
  camera:{set:[["plinth","L"],["table","R"]],deco:[["banner",50,9,"SAY CHEESE"],["window",74,14]],ban:null,c:"camera",fx:"star",pool:[["viv","camera","nod"],["dot","clipboard","talk"],["zack","camera","scurry"],["nibble","","hop"],["emma","magnifier","read"]]},
  input:{set:[["desk","L"],["stool","R"]],deco:[["frame",50,26],["clock",72,14]],ban:null,c:"mouse",fx:"spark",pool:[["mat","mouse","scurry"],["zack","stick","shiver"],["hiram","controller","hop"],["conrad","mouse","read"],["emma","magnifier","read"]]},
  display:{set:[["tv","L"],["table","R"]],deco:[["lamp",22,0],["frame",74,26]],ban:null,c:"magnifier",fx:"star",pool:[["viv","camera","nod"],["conrad","iron","read"],["emma","magnifier","read"],["ram","book","read"],["hiram","laptop","hop"]]},
  news:{set:[["desk","L"],["table","R"]],deco:[["banner",50,9,"NEWS FLASH"],["calendar",74,14]],ban:null,c:"clipboard",fx:"star",pool:[["augusta","clipboard","nod"],["mo","phone","talk"],["dot","clipboard","talk"],["floyd","book","nod"],["winnie","book","read"],["rhoda","pencil","read"]]},
  quote:{set:[["printer","L"],["phone","R"]],deco:[["calendar",50,12],["banner",72,9,"OVERHEARD"]],ban:null,c:"pencil",fx:"note",pool:[["dot","clipboard","talk"],["mo","phone","nod"],["toner","","hop"],["rhoda","book","read"],["augusta","pencil","nod"]]},
  fact:{set:[["table","L"],["shelf","R"]],deco:[["banner",50,9,"DID YOU KNOW"],["clock",72,14]],ban:null,c:"book",fx:"star",pool:[["rhoda","book","read"],["ram","book","read"],["augusta","clipboard","nod"],["winnie","book","read"],["emma","magnifier","read"]]},
  machine:{set:[["plinth","L"],["shelf","R"]],deco:[["banner",50,9,"NEW ARRIVALS"],["frame",72,26]],ban:null,c:"clipboard",fx:"star",pool:[["emma","duster","dust"],["ram","book","read"],["hiram","","hop"],["conrad","iron","solder"],["mat","mouse","scurry"],["winnie","laptop","nod"]]}};
 /* what a character says, in their own voice. {n} is the name of the thing, {noun} what it is, {yr} the year, {mk} the maker. A line is skipped when it needs something the slide does not have. */
 var VOICE={
  ram:["I have read the manual for the {noun}. Twice.","[computer,laptop,console,handheld,audio,storage,network,print,camera,input,display,machine]Page one says do not take it apart.","Where is the receipt for {n}?","[computer,laptop,console,handheld,audio,storage,network,print,camera,input,display,machine]The {noun} is older than the warranty.","The manual for {n} has a typo. I found it."],
  conrad:["[computer,laptop,console,handheld,audio,storage,network,print,camera,input,display,machine]What are the jumper settings on {n}?","[computer,laptop,console,handheld,audio,storage,network,print,camera,input,display,machine]It needs a driver. Then another driver.","[computer,laptop,console,handheld,audio,storage,network,print,camera,input,display,machine]I will tune the {noun} later. I say that every year.","I checked the {noun}. Then I checked the check."],
  emma:["[software,game,computer,laptop,console,handheld,machine]{n} needs how much memory? Let me check the page frames.","I can borrow more room for {n} than Connie can.","I counted {n} twice.","{n} is from {yr}. I was not born yet. I read about it."],
  hiram:["I could reach {n} from the loft.","I am not short. The {noun} is tall.","I have seen {n} from above. Nice view."],
  zack:["[game,software,book,movie]I finished {n}. I did not.","Found one for a dollar.","I was here first. Nobody saw me.","[book]I read {n} in the store. I did not buy it."],
  nibble:["(squeak) Is {n} made of seeds?","The {noun} is mostly wheel.","(squeak) Seeds for {n}.","I ran the wheel all night for this."],
  mat:["(click click) I clicked {n}.","Clicked it. It is fine.","(click) Did I do that?","Everything is a button if you try."],
  toner:["Woof. (That means {n}.)","Woof! (Smudge.)","Woof. (Pawprint.)","Woof woof. (A very good {noun}.)"],
  winnie:["[software,game,computer,laptop,storage,machine]{n} would fit on my hard drive with room to spare.","I remember when {n} was new. I have the receipt.","Forty megabytes and plenty of room.","I have read it twice. Maybe three times."],
  floyd:["[software,game,storage,computer,machine]{n} came on 14 disks. I lost disk 7.","Back in my day we swapped disks.","Disk 7 of 14. Always disk 7.","I was there for all of {yr}. In a shirt pocket."],
  rhoda:["{n} is read-only, like me.","[computer,laptop,console,handheld,audio,storage,network,print,camera,input,display,machine]Every {noun} started in a garage.","Dinner is at six. {n} can wait.","I have a quote for {n}. It is read-only."],
  augusta:["Item one: {n}. Item two: everything else.","It goes on my boot list. First.","I wrote {n} down at boot.","In order, please. Any order. In order."],
  mo:["Connecting to {n}... still connecting.","{n}, at 2400 baud.","Please do not pick up the phone.","I heard about {n} on the line. It took a while."],
  tess:["(nom) That {noun} was a little bit a snack.","I live in {n} now. Resident.","I stay resident. So does {n}.","(nom) Tastes like {yr}."],
  viv:["{n} would look better in 256 colors.","Sixteen colors is a lifestyle. {n} deserves more.","The picture matters most.","Nice {noun}. More colors, please."],
  dot:["I will print everything about {n}. In triplicate.","Printing! Printing! Printing!","Three copies of {n}. One for the file."],
  sandy:["[computer,laptop,console,software,game,machine,input,display]Does {n} have a sound card? Asking for IRQ 5.","Turn it up!","It sounds better on my card.","{n} is a banger. I said what I said."]};
 var INTRO={
  book:["Book club today: {n}.","New on the shelf: {n}.","{n} came in. Somebody will want to read it.","{n}, from {yr}. Quiet, please. Except me."],
  movie:["Movie night: {n}!","{n}, {yr}. Everybody sit down.","Popcorn for {n}. I brought a slice instead."],
  game:["{n}! I know this one.","Everybody grab a controller. It is {n} time.","{n}, {yr}. A classic.","I have a high score in {n}. It is one."],
  software:["{n} just arrived on disk.","Installing {n}. Please do not touch.","{n}, {yr}. That one needed more RAM."],
  computer:["{n} is on the bench today.","Welcome, {n}, {yr}.","Coming through with {n}!","Look what turned up: {n}."],
  laptop:["{n}! It folds up. It fits in a bag.","This is {n}. Portable. Mostly.","{n}, {yr}. Battery not included."],
  console:["{n}! Player two, get ready.","The {n} is hooked up. Do not touch the cables.","{n}, {yr}. Pick a side."],
  handheld:["{n} fits in a pocket!","Batteries for {n}. Always batteries.","{n}, {yr}. It goes anywhere."],
  audio:["{n}! Turn it up!","This is {n}. Listen closely.","Sound check for {n}!"],
  storage:["{n} is in the storage room.","Spinning up {n}...","{n}, {yr}. Please do not eject."],
  network:["Dialing {n}...","{n}! Do not pick up the phone.","Connecting to {n}. Please hold."],
  print:["{n} is printing. Loudly.","Out comes {n}, one page at a time.","{n}, {yr}. Please do not touch the paper."],
  camera:["Say cheese for {n}!","{n}, {yr}. Smile, everybody.","Look at {n}. Hold still."],
  input:["{n}. Try it, but gently.","This is {n}. It has buttons.","{n}, {yr}. Hands off, Mat."],
  display:["{n}! Look at that picture.","Turning on {n}. Give it a minute to warm up.","{n}, {yr}. Watch the glare."],
  news:["Breaking, from {yr}: {n}.","In the news in {yr}: {n}.","{n}. The record says {yr}."],
  quote:["Overheard in the museum.","Somebody said that. Probably Dot.","I will print that one."],
  fact:["Did you know?","Everybody listen. This one is true.","Write that down."],
  machine:["Look what is on the shelf: {n}.","{n}, in the museum.","Welcome, {n}!"]};
 var OUTRO=["Perfect!","Another one for the museum.","Nobody touch it. Except me.","That is a very good {noun}.","I love this job.","Put it on my wish list."];
 function fillT(t,d,tp){return t.replace(/\{n\}/g,short2(d.name)).replace(/\{noun\}/g,NOUN[tp]||"thing").replace(/\{yr\}/g,d.year||"").replace(/\{mk\}/g,d.maker||"")}
 function short2(s){s=String(s||"it");return s.length>32?s.slice(0,30).replace(/\s+\S*$/,"")+"...":s}
 function okT(t,d,tp){var m=/^\[(-?)([a-z,]+)\]/.exec(t);if(m){var has=m[2].split(",").indexOf(tp)>=0;if(m[1]?has:!has)return false}return!(/\{yr\}/.test(t)&&!d.year)&&!(/\{mk\}/.test(t)&&!d.maker)&&!(/\{n\}/.test(t)&&!d.name)}
 function trimL(s,n){s=String(s).replace(/^\[[-a-z,]+\]/,"");return s.length<=n?s:brief(s,n)}
 function line(arr,d,tp,k,mx){var a=arr.filter(function(t){return okT(t,d,tp)});if(!a.length)a=["Look at that!"];return trimL(fillT(pick(k,a),d,tp).replace(/\.{3}\./g,"..."),mx||84)}
 var RECENT={};
 function fresh(pool,n){var out=[],a=pool.slice().sort(function(x,y){return(RECENT[x[0]]||0)-(RECENT[y[0]]||0)+(Math.random()-.5)*1.2});a.forEach(function(p){if(out.length<n&&!out.some(function(o){return o[0]===p[0]}))out.push(p)});out.forEach(function(p){RECENT[p[0]]=Date.now()});return out}
 function compose(d){d=d||{};var tp=topicOf(d),R=RECIPE[tp]||RECIPE.machine,dur=Math.max(4800,Math.min(15000,+d.dur||7000)),f=function(x){return Math.round(dur*x)},
   LX=18+Math.round(Math.random()*8),RX=76+Math.round(Math.random()*8),slot={L:LX,R:RX},who=fresh(R.pool,2),sup=[],c,a,b,flipSide=Math.random()<.5;
  R.set.forEach(function(s,i){scn(s[0],slot[s[1]]||50)});R.deco.forEach(function(x){if(x[3]&&typeof x[3]==='object')deco(x[0],x[1],x[2],null,x[3]);else deco(x[0],x[1],x[2],x[3]||null,x[4])});
  var ban=R.ban?R.ban(d):"";if(ban)deco("banner",50,9,ban);
  if(d.year&&!ban&&Math.random()<.6)deco("sign",flipSide?30:68,24,"FROM "+d.year);
  /* people at their stations, walking in from the nearest edge */
  who.forEach(function(w,i){var sx=i===0?LX:RX,e=mk(w[0],sx<50?-14:114,{w:80,opts:w[1]?{holds:w[1]}:null,face:sx<50?1:-1});sup.push(e);
   e.go(sx,Math.max(1.4,dur/1000*.28),"stroll");T(function(){e.anim(w[2]==="stroll"?"":w[2]);if(R.fx&&w[2]!=="read"&&w[2]!=="nod")every(function(){e.fx(R.fx,20,24)},900)},f(.3))});
  /* Connie arrives from the other side, then does the talking */
  c=mk("connie",flipSide?-18:118,{w:120,opts:R.c?{holds:R.c}:null});c.go(50,Math.max(1.6,dur/1000*.32),"stroll");
  T(function(){c.anim("");},f(.34));
  var sl=f(.2);
  T(function(){c.anim("wave talk");c.say(line(INTRO[tp]||INTRO.machine,d,tp,"in"+tp),f(.2))},f(.34));
  T(function(){c.anim("")},f(.56));
  if(sup[0])T(function(){var w=who[0];sup[0].say(line(VOICE[w[0]]||VOICE.ram,d,tp,"v"+w[0]),f(.18));sup[0].fx(R.fx||"star",20,0)},f(.5));
  if(sup[1])T(function(){var w=who[1];sup[1].say(line(VOICE[w[0]]||VOICE.ram,d,tp,"v"+w[0]),f(.16))},f(.66));
  T(function(){c.anim("cheer");c.say(line(OUTRO,d,tp,"out"),f(.14));c.fx("star",30,0);sup.forEach(function(e,i){e.fx("heart",0,0)})},f(.8));
  return{topic:tp,actors:["connie"].concat(who.map(function(w){return w[0]})),dur:dur}}

 /* A four-panel comic strip made from the same ingredients as a scene (topic, cast, props, voices), for the Funnies. Returns {t, d, p:[{s, w:[[id, mood, line, options]], c}]}. */
 function strip(d){d=d||{};var tp=topicOf(d),R=RECIPE[tp]||RECIPE.machine,who=fresh(R.pool,2),A=who[0][0],B=who[1][0],pa=who[0][1]?{holds:who[0][1]}:null,pb=who[1][1]?{holds:who[1][1]}:null,
   sc=({book:"room",movie:"room",game:"room",software:"hall",computer:"hall",laptop:"room",console:"room",handheld:"yard",audio:"party",storage:"hall",network:"hall",print:"kitchen",camera:"yard",input:"room",display:"room",news:"hall",quote:"kitchen",fact:"room",machine:"hall"})[tp]||"room",
   L=function(arr,k){return line(arr,d,tp,k,58)},cp=R.c?{holds:R.c}:null;
  return{t:"Fresh from the timeline"+(d.name?": "+short2(d.name):""),d:d.year?String(d.year):"Today",p:[
   {s:sc,w:[["connie","happy",L(INTRO[tp]||INTRO.machine,"si"+tp),cp]],c:(d.year?d.year+". ":"")+"Connie opens the door."},
   {s:sc,w:[["connie","wink","",cp],[A,"happy",L(VOICE[A]||VOICE.ram,"sa"+A),pa]],c:""},
   {s:sc,w:[[B,"happy",L(VOICE[B]||VOICE.ram,"sb"+B),pb],["connie","wow","",cp]],c:""},
   {s:sc,w:[["connie","happy",L(OUTRO,"so"),cp],[A,"happy","",pa]],c:"Everybody agrees. Mostly."}]}}

 return{mount:function(el){box=el;box.classList.add("stg");box.innerHTML="";return this},
  run:function(kind,data){if(!box)return;clear();box.innerHTML="";if(kind==="auto"){box.classList.remove("stg-out");var r;try{r=compose(data||{})}catch(e){box.innerHTML="";r=null}refit();last="auto";return r?"auto:"+r.topic:"auto"}var s=SC[kind]?kind:(BY[kind]?pick("by"+kind,BY[kind]):"dust");if(BY[kind]&&last===s&&BY[kind].length>1)s=pick("by"+kind,BY[kind]);last=s;
   box.classList.remove("stg-out");try{SC[s](data||{})}catch(e){box.innerHTML=""}refit();return s},
  fade:function(){if(box)box.classList.add("stg-out")},strip:strip,topicOf:topicOf,compose:function(d){return compose(d)},topics:Object.keys(RECIPE),stop:function(){clear();if(box)box.innerHTML=""},scenes:Object.keys(SC),by:BY}})();
