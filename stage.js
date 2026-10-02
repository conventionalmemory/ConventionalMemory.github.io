/* stage.js: the museum at work. A little animated stage where Connie and her family carry things in, dust, cook, solder, print and cheer.
   Used by the demo kiosk (toys.js) and free to use anywhere: CMStage.mount(element) once, then CMStage.run("carry",{name:"IBM PC"}).
   Scenes (pick one by name, or let the kiosk pick one that fits the slide):
     carry    Connie carries a crate in and sets it on the display stand (Emma dusts nearby)      kinds: item
     dust     Emma dusts the shelf, Connie sweeps, Himmy bounces on the stool                       kinds: item
     bench    Uncle Conrad solders at the bench, Connie points, Mat clicks                          kinds: hw
     arcade   Himmy and Zack at the arcade cabinet, Connie runs over to cheer                       kinds: game
     print    Dot prints, Mo is on the phone, Toner follows Connie                                  kinds: quote
     kitchen  Mom cooks, Dad reads the manual, Auntie Autoexec checks the list                      kinds: fact, quote
     storage  Grandpa Floyd carries disks, Grandma Winnie watches, Tessie sneaks in                 kinds: fact
     family   Connie welcomes one family member, given as {who:"emma"}                              kinds: family
     closet   Connie dances through her looks while Emma and Himmy cheer                            kinds: closet
     mall     Connie in a hard hat, Mat and Toner, Conrad presenting                                kinds: mall
     menu     Everybody lines up and waves at the visitor                                           kinds: menu
   Connie is the biggest and is on every scene. Animations come from CMCast.play (see the Animations page, #/animations). Reduced motion shows the finished tableau, no walking. */
window.CMStage=(function(){
 var box=null,timers=[],last="",li={};
 function mo(){return document.documentElement.getAttribute("data-motion")!=="off"}
 function T(fn,ms){if(!mo()){fn();return}timers.push(setTimeout(fn,ms))}
 function clear(){timers.forEach(clearTimeout);timers=[]}
 function pick(k,arr){li[k]=((li[k]==null?Math.floor(Math.random()*arr.length):li[k]+1))%arr.length;return arr[li[k]]}
 function U(){var h=box?box.clientHeight:220;return Math.max(.55,Math.min(1.15,h/230))}
 function short(s){s=String(s||"");return s.length>18?s.slice(0,16)+"...":s}
 function scn(kind,x,txt){var d=document.createElement("div");d.className="stg-n sn-"+kind;d.style.left=x+"%";if(txt!=null)d.innerHTML=txt;box.appendChild(d);return d}
 function mk(id,x,o){o=o||{};var el=document.createElement("div"),star=id==="connie",w=Math.round((o.w||(star?122:84))*U()),A={id:id,el:el,w:w,cur:""};
  el.className="stg-a"+(star?" star":"");el.style.left=x+"%";el.style.zIndex=o.z||(star?6:3);
  el.innerHTML='<p class="stg-b" hidden></p><span class="stg-p"></span><span class="stg-s"></span>';box.appendChild(el);
  A.draw=function(op){var oo={tall:!(id==="nibble"||id==="mat"||id==="toner"),mood:o.mood||"happy"},k;for(k in(o.opts||{}))oo[k]=o.opts[k];for(k in(op||{}))oo[k]=op[k];
   var s=el.querySelector(".stg-s");s.innerHTML=CMCast.svg(id,w,oo);A.svg=s.firstChild;if(A.cur)CMCast.play(A.svg,A.cur)};
  A.anim=function(n){A.cur=n||"";if(!n)CMCast.stopAnim(A.svg);else CMCast.play(A.svg,n)};
  A.go=function(x2,secs,n){el.style.transition=mo()?"left "+secs+"s linear":"none";el.style.left=x2+"%";if(n)A.anim(n)};
  A.face=function(d){el.classList.toggle("flip",d<0)};
  A.prop=function(kind,txt){var p=el.querySelector(".stg-p");p.className="stg-p"+(kind?" pp-"+kind:"");p.innerHTML=kind==="crate"?"<b>"+(txt||"")+"</b>":""};
  A.say=function(t,ms){var b=el.querySelector(".stg-b");b.textContent=t;b.hidden=false;if(ms)T(function(){b.hidden=true},ms)};
  A.hush=function(){el.querySelector(".stg-b").hidden=true};
  A.draw();return A}
 function cs(){var o={};try{o=CMCast.famOpts("connie")}catch(e){}return o}

 var SC={};
 SC.carry=function(d){var nm=short(d.name),c,e;scn("plinth",70);scn("shelf",14);
  c=mk("connie",-14);c.prop("crate",nm||"FRAGILE");c.go(58,3.4,"stroll carry");c.say(pick("cy",["Coming through!","Careful, careful!","Heavy! Fascinating, but heavy."]),1900);
  e=mk("emma",92,{w:78});e.face(-1);e.anim("dust");e.say("Dusting. Again.",2400);
  T(function(){c.prop("");c.anim("bow");scn("item",70,"<b>"+E(nm||"?")+"</b>")},3500);
  T(function(){c.anim("wave talk");c.say(d.name?"I carried in the "+short(d.name)+" myself. It is older than the intern.":"Another one for the shelf!",2200)},5200);
  T(function(){c.anim("nod")},6900)};
 SC.dust=function(){scn("shelf",50);var e=mk("emma",20,{w:80}),c,h;e.anim("stroll dust");e.go(78,5.2);T(function(){e.face(-1);e.go(24,5)},5300);
  c=mk("connie",-12);c.prop("broom");c.go(55,3,"stroll");c.say("Sweeping! Not dancing. Sweeping.",2200);T(function(){c.anim("dance");c.say("Okay, a little dancing.",2200)},3200);
  h=mk("hiram",90,{w:70});h.anim("hop");h.say("I can reach the top shelf. Nobody else can.",2600)};
 SC.bench=function(d){scn("bench",30);var o=mk("conrad",30,{w:88,opts:{outfit:"lab"}}),c,m;o.anim("solder");o.say("Hold still, little capacitor.",2400);
  c=mk("connie",-12);c.go(54,2.6,"stroll");T(function(){c.anim("point");c.say(pick("cb",["Uncle Conrad is fixing "+(d.name?short(d.name):"a classic")+".","If it sparks, it is working."]),2800)},2700);
  m=mk("mat",84,{w:60});m.anim("scurry");T(function(){o.say("Not you, Mat.",2000)},4300)};
 SC.arcade=function(){scn("arcade",32);var h=mk("hiram",26,{w:74}),z=mk("zack",40,{w:74}),c;h.anim("cheer");z.anim("shiver");z.say("Nobody ordered a high score.",2200);
  c=mk("connie",-12);c.go(60,2.8,"stroll");T(function(){c.anim("cheer");c.say(pick("ca",["Level cleared!","One more quarter!","I want a turn."]),2800)},2900)};
 SC.print=function(d){scn("printer",22);var dot=mk("dot",22,{w:80}),mo2=mk("mo",78,{w:80}),c,t;scn("phone",88);dot.anim("talk");dot.say("Printing! Printing! Printing!",2400);mo2.anim("shiver");mo2.say("Connecting...",2400);
  c=mk("connie",-12);c.prop("crate","MAIL");c.go(52,3,"stroll carry");t=mk("toner",-30,{w:56});t.go(40,3.4,"stroll");
  T(function(){c.prop("");c.anim("wave talk");c.say(pick("cp",["Dot printed the quote. Three copies.","That is overheard, not overprinted."]),2800);t.anim("hop")},3200)};
 SC.kitchen=function(){scn("stove",20);scn("table",76);var r=mk("rhoda",20,{w:84}),a=mk("ram",78,{w:84}),g=mk("augusta",92,{w:78}),c;r.prop("spoon");r.anim("stir");r.say("Dinner at six. It is read-only.",2600);a.anim("read");T(function(){a.say("It says to preheat.",2200)},2800);g.face(-1);g.anim("nod");
  c=mk("connie",-12);c.prop("crate","SOUP");c.go(50,3,"stroll carry");T(function(){c.prop("");c.anim("wave talk");c.say(pick("ck",["Mom is cooking. Dad is reading the oven manual.","Auntie has a list for dinner too."]),2800)},3200)};
 SC.storage=function(){scn("drive",84);var f=mk("floyd",-12,{w:80}),w=mk("winnie",84,{w:84}),t,c;f.prop("crate","DISK 7");f.go(60,3.6,"stroll carry");w.anim("nod");w.say("Forty megabytes. Plenty of room.",2800);T(function(){f.prop("");f.anim("shiver");f.say("Disk 7 of 14...",2200)},3700);
  t=mk("tess",-5,{w:70});T(function(){t.go(40,2.4,"stroll");t.say("(nom)",1500)},1500);c=mk("connie",30,{w:122});c.anim("think");T(function(){c.say("Tessie, that is not a snack.",2600);c.anim("point")},4200)};
 SC.family=function(d){var id=d.who||"emma",g,c=mk("connie",34);c.anim("wave");g=mk(id,-12,{w:id==="connie"?122:88,opts:{outfit:id==="conrad"||id==="ram"?"classic":undefined}});g.go(66,3,"stroll");
  c.say(d.line||"Look who is here!",3200);T(function(){g.anim(({emma:"hop",hiram:"hop",zack:"shiver",dot:"talk",sandy:"dance",viv:"dance",nibble:"hop",mat:"hop",toner:"hop",tess:"shiver",floyd:"nod",winnie:"nod",mo:"shiver"})[id]||"wave");g.say(d.gl||"Hi!",2600)},3200);T(function(){c.anim("hop")},3300)};
 SC.closet=function(){var c=mk("connie",50,{w:132}),e=mk("emma",22,{w:78}),h=mk("hiram",78,{w:74}),L=[],i=0;try{L=CMCast.LOOK_ORDER.filter(function(l){return CMCast.unlocked("look",l).ok})}catch(x){}if(!L.length)L=["classic"];
  c.anim("dance");e.anim("cheer");h.anim("hop");c.say("Fashion show! Today only.",2400);
  function sw(){var l=L[i++%L.length];c.draw({look:l,acc:"none"});if(mo())T(sw,1500)}T(sw,1400)};
 SC.mall=function(){scn("barrier",52);var c=mk("connie",38,{w:126,opts:{look:"explorer"}}),o=mk("conrad",16,{w:84,opts:{outfit:"keynote"}}),m=mk("mat",70,{w:58}),t=mk("toner",82,{w:58});c.anim("point");c.say("The mall is under construction. Grand opening: soon.",3600);o.say("One more thing...",2800);o.anim("nod");m.anim("scurry");t.anim("hop")};
 SC.menu=function(){var ids=["emma","ram","hiram","rhoda","dot","sandy"],xs=[10,24,76,90,66,34],i,c=mk("connie",50,{w:132});c.anim("wave talk");c.say("Touch any button!",5000);
  ids.forEach(function(id,k){var a=mk(id,xs[k],{w:72});a.anim(k%2?"wave":"hop")})};
 var BY={item:["carry","dust"],hw:["bench"],game:["arcade"],quote:["print","kitchen"],fact:["kitchen","storage"],family:["family"],closet:["closet"],mall:["mall"],menu:["menu"]};
 function E(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}

 return{mount:function(el){box=el;box.classList.add("stg");box.innerHTML="";return this},
  run:function(kind,data){if(!box)return;clear();box.innerHTML="";var s=SC[kind]?kind:(BY[kind]?pick("by"+kind,BY[kind]):"dust");if(BY[kind]&&last===s&&BY[kind].length>1)s=pick("by"+kind,BY[kind]);last=s;
   try{SC[s](data||{})}catch(e){box.innerHTML=""}return s},
  stop:function(){clear();if(box)box.innerHTML=""},scenes:Object.keys(SC),by:BY}})();
