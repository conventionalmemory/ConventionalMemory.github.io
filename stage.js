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
  A.go=function(x2,secs,n){var d=x2-A.x;A.x=x2;if(Math.abs(d)>1)A.face(d);el.style.transition=mo()?"left "+secs+"s linear":"none";el.style.left=X(x2)+"%";if(n)A.anim(n)};
  A.prop=function(kind,txt){var p=el.querySelector(".stg-p");p.className="stg-p"+(kind?" pp-"+kind:"");p.innerHTML=kind==="crate"?"<b>"+E(txt||"")+"</b>":""};
  A.fit=function(){if(bub.hidden||!box)return;var br=box.getBoundingClientRect(),r,dx=0;bub.className="stg-b";bub.style.transform="";bub.style.removeProperty("--tx");r=bub.getBoundingClientRect();
   if(r.top<br.top+2){bub.className="stg-b stgside "+(A.x>50?"stgl":"stgr");r=bub.getBoundingClientRect();if(r.right>br.right-3){bub.className="stg-b stgside stgl"}else if(r.left<br.left+3){bub.className="stg-b stgside stgr"}return}
   if(r.left<br.left+3)dx=br.left+3-r.left;else if(r.right>br.right-3)dx=br.right-3-r.right;
   if(dx){bub.style.transform="translateX(calc(-50% + "+dx+"px))";bub.style.setProperty("--tx",(-dx)+"px")}};
  A.say=function(t,ms){bub.textContent=t;bub.hidden=false;el.style.zIndex=30;A.fit();if(ms)T(function(){A.hush()},ms)};
  A.hush=function(){bub.hidden=true;el.style.zIndex=z};
  /* little pixel effects: puff, spark, heart, note, star */
  A.fx=function(kind,dx,dy){if(!mo())return;var f=document.createElement("i");f.className="stg-fx fx-"+kind;f.style.left=(50+(dx||0))+"%";f.style.top=(dy==null?8:dy)+"%";el.appendChild(f);setTimeout(function(){if(f.parentNode)f.parentNode.removeChild(f)},1300)};
  A.draw();A.face(o.face||(x>56&&x<=100?-1:1));cast.push(A);return A}
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
  c=mk("connie",112);c.go(56,2.8,"stroll");T(function(){c.anim("point");c.say("Dad, it is already in pieces.",2600)},3000);T(function(){r.say("Page one says do not take it apart.",2400);c.anim("nod")},5400);
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
  c.say(brief(d.line||"Look who is here!"),3400);T(function(){g.anim(({emma:"hop",hiram:"hop",zack:"shiver",dot:"talk",sandy:"dance",viv:"dance",nibble:"hop",mat:"hop",toner:"hop",tess:"shiver",floyd:"nod",winnie:"nod",mo:"shiver"})[id]||"wave");g.say(d.gl||"Hi!",2600);g.fx("heart",0,0)},3200);T(function(){c.anim("hop")},3300)};
 SC.closet=function(){deco("banner",50,6,"FASHION SHOW");deco("mirror",86,20);deco("rack",12,26);var c=mk("connie",50,{w:130}),e=mk("emma",22,{w:78}),h=mk("hiram",78,{w:74}),L=[],i=0;try{L=CMCast.LOOK_ORDER.filter(function(l){return CMCast.unlocked("look",l).ok})}catch(x){}if(!L.length)L=["classic"];
  c.anim("dance");e.anim("cheer");h.anim("hop");c.say("Fashion show! Today only.",2400);T(function(){e.say("Ten out of ten.",1800)},2800);T(function(){h.say("I vote for the bow.",1800)},4600);
  function sw(){var l=L[i++%L.length];c.draw({look:l,acc:"none"});c.fx("star",34,2);if(mo())T(sw,1500)}T(sw,1400)};
 SC.mall=function(){scn("barrier",50);scn("cone",30);scn("cone",70);deco("banner",50,9,"GRAND OPENING: SOON");var c=mk("connie",42,{w:124,opts:{look:"explorer"}}),o=mk("conrad",14,{w:84,opts:{outfit:"keynote"}}),m=mk("mat",74,{w:58}),t=mk("toner",86,{w:58});c.anim("point");c.say("The mall is under construction.",3000);T(function(){c.say("Grand opening: soon.",2400)},3200);o.anim("nod");T(function(){o.say("One more thing...",2400)},1500);m.anim("scurry");T(function(){m.say("Click.",1200)},4200);t.anim("hop");T(function(){t.say("Woof. (Smudge.)",1500)},5000)};
 SC.menu=function(){var ids=["emma","ram","hiram","rhoda","dot","sandy"],xs=[10,24,76,90,66,34],i,c=mk("connie",50,{w:130});deco("banner",50,9,"PRESS ANY BUTTON");c.anim("wave talk");c.say("Touch any button!",5000);
  ids.forEach(function(id,k){var a=mk(id,xs[k],{w:72});a.anim(k%2?"wave":"hop")});every(function(){var a=cast[1+Math.floor(Math.random()*(cast.length-1))];if(a)a.fx("heart",0,0)},1100)};
 var BY={item:["carry","dust","shelve"],hw:["bench","garage"],game:["arcade","music"],quote:["print","kitchen"],fact:["kitchen","storage"],family:["family"],closet:["closet"],mall:["mall"],menu:["menu"]};

 return{mount:function(el){box=el;box.classList.add("stg");box.innerHTML="";return this},
  run:function(kind,data){if(!box)return;clear();box.innerHTML="";var s=SC[kind]?kind:(BY[kind]?pick("by"+kind,BY[kind]):"dust");if(BY[kind]&&last===s&&BY[kind].length>1)s=pick("by"+kind,BY[kind]);last=s;
   try{SC[s](data||{})}catch(e){box.innerHTML=""}every(refit,300);refit();return s},
  stop:function(){clear();if(box)box.innerHTML=""},scenes:Object.keys(SC),by:BY}})();
