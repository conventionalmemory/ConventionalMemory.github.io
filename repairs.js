/* repairs.js: the Repair Bench (#/repairs and #/repairs/<guide>).
   Our own step lists for the repairs that are not capacitor swaps (batteries, belts, lasers, cartridge slots, drives, keyboards and more).
   Tick off the cautions, the parts, the tools and each step. Everything saves in this browser only (localStorage key cm-repair).
   The Ventional family helps at the bench. Data lives in repairs-data.js; the family comes from cast.js. */
window.CMRepair=(function(){
"use strict";
var KEY="cm-repair",app=null,st=null;
function E(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function $(s,r){return(r||app).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||app).querySelectorAll(s))}
function today(){var d=new Date();return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2)}

/* ---------- the family ---------- */
var NAME={connie:"Connie",emma:"Emma",hiram:"Hiram",ram:"Dad",rhoda:"Mom",floyd:"Grandpa Floyd",winnie:"Grandma Winnie",augusta:"Aunt Gussie",conrad:"Uncle Conrad",tess:"Tessie",nibble:"Nibble",dot:"Dot",viv:"Viv",sandy:"Sandy",mo:"Mo",zack:"Zack",mat:"Mat",toner:"Toner"};
var HOLD={ram:"iron",rhoda:"clipboard",floyd:"floppy",emma:"magnifier",hiram:"controller",dot:"clipboard",sandy:"walkman",zack:"book",mo:"phone",augusta:"clipboard",conrad:"clipboard",winnie:"book",viv:"pencil",tess:"flag"};
var PET={nibble:1,mat:1,toner:1};
function av(id,sz,o){o=o||{};if(typeof CMCast==="undefined")return"";
 var opt={tall:!PET[id]};if(typeof CMCast.famOpts==="function"){var f=CMCast.famOpts(id);for(var k in f)opt[k]=f[k]}
 if(o.holds)opt.holds=o.holds;if(o.mood)opt.mood=o.mood;
 try{return CMCast.svg(id,sz,opt)}catch(e){return""}}
function crew(id,line,holds,cls){return'<div class="rc-crew'+(cls?" "+cls:"")+'"><span class="rc-av" aria-hidden="true">'+av(id,48,{holds:holds||HOLD[id]})+'</span><p><b>'+E(NAME[id]||id)+':</b> '+E(line)+'</p></div>'}
/* who looks after which kind of repair, and what they say about it */
var KIND_CREW={
 Battery:["rhoda","Batteries leak. Gloves, goggles, and a window open. Then you tell me when you are done."],
 Optical:["hiram","Nope, not coming down. I only need to know if it plays the game. Take your time with the laser. Anyway."],
 Belt:["floyd","A belt is a small rubber band with a big opinion about whether the drive spins."],
 Drive:["floyd","I have disks in every drive in the house. Do not ask which of them work."],
 Controller:["hiram","Nope, the stick is not supposed to drift. Fix it so I can win. Anyway."],
 Video:["emma","Technically, no picture is a signal problem until it is not (I will count the cables, twice)."],
 Power:["rhoda","Anything that plugs into the wall gets my full attention. Unplug first. Always."],
 Display:["conrad","Technically, screens are fussy. *sigh* I read the manual twice before touching one."],
 Case:["viv","Yellow plastic is a color problem, and I take color problems personally."],
 Cleaning:["toner","I am an expert in mess. Let me show you how to leave less of it."],
 Diagnosis:["mo","A beep means connected. Silence means keep looking. I have beeped at everything."],
 Cartridge:["hiram","Nope, blowing on it does not help. Clean it properly. Anyway."],
 Keyboard:["dot","I type everything in triplicate. A dead key is a personal insult."],
 Memory:["emma","Technically: (1) reseat it, (2) count again, and (3) sorry, count once more."],
 Other:["ram","Take your time. Any job is a good job when the good iron is warm."]};
var STEP_LINES=[["floyd","Take a photo first. Disk 7 of 14 taught me that, and I still miss disk 7."],["ram","Sort the screws into piles. A screw you cannot find is a screw that wins."],["viv","Mark anything with a polarity in color before it comes off."],["mo","Test it before you close it up. That beep is my favorite sound."],["augusta","In order, one step at a time, and keep the list."],["toner","Pawprints are not a cleaning solution. Wipe it down."],["emma","I counted the screws. There are more than you expect."],["winnie","Buy a spare. You will drop one under the couch."],["conrad","Read the next step before you do this one. Then do this one."],["sandy","Turn the sound all the way up for the test. Then lower it for the neighbors."]];
function stepCrew(g,i,n){if(i===0)return STEP_LINES[0];if(i===n-1)return["hiram","Done? Good. I get to try it first. That is the rule. Nobody wrote it down, but it is the rule."];if(i%3!==0)return null;var k=(i/3+g.id.length)%STEP_LINES.length;return STEP_LINES[Math.floor(k)%(STEP_LINES.length-2)+1]}
var CHEER=[[0,"Ready when you are. Cautions first, then the iron."],[1,"One step down. Keep the pace steady."],[25,"A quarter done. Neat work."],[50,"Halfway. Time for a snack and a stretch."],[75,"Three quarters. The end is in sight."],[99,"One step left. You can do this."],[100,"All done! Power it up. I will hold my breath."]];
function cheer(pct,done){var line=CHEER[0][1];CHEER.forEach(function(c){if(pct>=c[0]&&(c[0]>0||done===0)&&(c[0]!==1||done>0))line=c[1]});return line}
var KINDS=["Battery","Optical","Belt","Drive","Controller","Video","Power","Display","Case","Cleaning","Diagnosis","Cartridge","Keyboard","Memory","Other"];
var WORTH={yes:["Worth doing","Reports say this fix helps on many machines."],maybe:["Try it, but check first","This will not fix every machine. Read the sources first."]};
var TIPK={tip:"Tip",anecdote:"Story",maybe:"Maybe",warning:"Watch out"};
var CATS=["Computers and gear","Consoles and handhelds"];

/* ---------- saved state ---------- */
function blank(){return{v:1,m:{},sum:{done:0,steps:0}}}
function load(){var o=null;try{o=JSON.parse(localStorage.getItem(KEY)||"null")}catch(e){}
 if(!o||typeof o!=="object"||Array.isArray(o))o=blank();o.m=o.m&&typeof o.m==="object"?o.m:{};o.sum=o.sum&&typeof o.sum==="object"?o.sum:{done:0,steps:0};return o}
var saved=true;
function write(){try{localStorage.setItem(KEY,JSON.stringify(st));saved=true}catch(e){saved=false}}
function gst(id){var m=st.m[id];if(!m||typeof m!=="object")m=st.m[id]={};["c","p","t","s"].forEach(function(f){m[f]=m[f]&&typeof m[f]==="object"&&!Array.isArray(m[f])?m[f]:{}});m.n=typeof m.n==="string"?m.n:"";return m}
function byId(id){return REPAIRS.filter(function(x){return x.id===id})[0]}
function stats(g){var m=gst(g.id),n=g.steps.length,d=0;for(var i=0;i<n;i++)if(m.s["s"+i])d++;return{n:n,done:d,pct:n?Math.round(d/n*100):0,ms:m}}
function summary(){st=st||load();var done=0,steps=0;REPAIRS.forEach(function(g){var s=stats(g);steps+=s.done;if(s.n>=4&&s.done===s.n)done++});return{done:done,steps:steps}}
function persist(){var s=summary();st.sum={done:s.done,steps:s.steps};write()}

/* ---------- buying ---------- */
function aff(){return typeof affOn==="function"&&affOn()}
function stores(q,lab){if(!aff()||!q)return"";var a=affUrl("amazon",q),e=affUrl("ebay",q),rel=' target="_blank" rel="sponsored noopener noreferrer"';
 return(a?'<a class="rc-buy" href="'+E(a)+'"'+rel+'>'+E(lab||"Amazon")+'</a>':"")+(e?'<a class="rc-buy rc-e" href="'+E(e)+'"'+rel+'>eBay</a>':"")}
function discl(){return aff()&&typeof AFF_SHORT!=="undefined"?'<p class="tn rc-aff">'+E(AFF_SHORT)+' These links only search by name. <a href="#/disclosure">Details</a></p>':""}
function bar(pct,lab){return'<div class="rc-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+pct+'" aria-label="'+E(lab||"Progress")+'"><i style="width:'+pct+'%"></i></div>'}
function motion(){return document.documentElement.getAttribute("data-motion")==="on"}

/* ---------- links to other parts of the museum ---------- */
function tlLinks(g){return g.machines.filter(function(n){return typeof TL!=="undefined"&&TL.some(function(r){return r[2]===n})}).map(function(n){var r=TL.filter(function(x){return x[2]===n})[0];return'<a href="#/timeline/'+String(r[0]).slice(0,4)+'/'+encodeURIComponent(n)+'">'+E(n)+'</a>'})}
function recapLinks(g){var RC=window.CMRel&&CMRel.recaps;if(!RC)return[];var seen={},out=[];RC.forEach(function(m){if(m[2].some(function(n){return g.machines.indexOf(n)>=0})&&!seen[m[0]]){seen[m[0]]=1;out.push('<a href="#/recap/'+E(m[0])+'">Recap the '+E(m[1])+'</a>')}});return out.slice(0,6)}
function otherLinks(g){return REPAIRS.filter(function(o){return o.id!==g.id&&o.machines.some(function(n){return g.machines.indexOf(n)>=0})}).slice(0,6).map(function(o){return'<a href="#/repairs/'+E(o.id)+'">'+E(o.title)+'</a>'})}

/* ---------- the index ---------- */
function card(g){var s=stats(g),on=s.done>0;
 return'<a class="rc-card'+(on?" on":"")+'" href="#/repairs/'+E(g.id)+'" data-kind="'+E(g.kind)+'"><b>'+E(g.title)+'</b><span class="rc-yr">'+E(g.level)+'</span><small>'+E(g.kind)+" · about "+g.minutes+" minutes"+(g.machines.length>1?" · "+g.machines.length+" machines":"")+'</small>'
  +(WORTH[g.worth]?'<span class="rc-chip rc-w-'+E(g.worth)+'">'+E(WORTH[g.worth][0])+'</span>':"")
  +(on?bar(s.pct,g.title+" progress")+'<small>'+s.done+" of "+s.n+" steps</small>":"")+'</a>'}
function index(){
 var started=REPAIRS.filter(function(g){return stats(g).done>0});
 var kinds=KINDS.filter(function(k){return REPAIRS.some(function(g){return g.kind===k})});
 var h='<section class="rc"><h2>The Repair Bench</h2><div class="rc-hero">'+av("connie",120,{holds:"meter",mood:"wink"})+'<div><p class="sp-lead">Not every old machine needs new capacitors. Some need a fresh battery, a new belt, a clean cartridge slot or a laser that has been adjusted. Pick your repair, tick off the cautions, the parts and each step, and your progress stays right here in this browser.</p><p class="tn">Connie says: read the cautions, then take your time. <a href="#/recap">Looking for capacitor swaps? Try the Recap Bench.</a></p></div></div>';
 if(started.length)h+='<h3 class="sub">My repairs</h3><div class="rc-grid">'+started.map(card).join("")+'</div>';
 h+='<h3 class="sub">Find a repair</h3><p class="rc-find noprint"><label for="rp-q">Search</label> <input id="rp-q" type="search" maxlength="40" placeholder="battery, Dreamcast, belt, Amiga" autocomplete="off"> <button class="btn" type="button" id="rp-sur">Surprise me</button> <span class="tn" id="rp-qn" role="status"></span></p>'
  +'<p class="rc-chips noprint" role="group" aria-label="Kind of repair"><button type="button" class="rc-chip2 on" data-kk="">All <small>'+REPAIRS.length+'</small></button>'+kinds.map(function(k){return'<button type="button" class="rc-chip2" data-kk="'+E(k)+'">'+E(k)+' <small>'+REPAIRS.filter(function(g){return g.kind===k}).length+'</small></button>'}).join("")+'</p>'
  +CATS.map(function(c){var gs=REPAIRS.filter(function(g){return g.cat===c});return gs.length?'<section class="rc-cat" data-cat="'+E(c)+'"><h4 class="rc-cath">'+E(c)+' <small>'+gs.length+'</small></h4><div class="rc-grid">'+gs.map(card).join("")+'</div><p class="rc-mp noprint"><button type="button" class="btn" data-more></button></p></section>':""}).join("")
  +'<div class="rc-two noprint"><div class="rc-crew"><span class="rc-av" aria-hidden="true">'+av("rhoda",56,{holds:"clipboard"})+'</span><p><b>Mom:</b> The cautions are read-only. If a guide says stop and ask a professional, stop. Anything with a tube or a mains supply is not a weekend project.</p></div></div>'
  +'<h3 class="sub">Not on the list?</h3><p>Tell us what you are fixing. <a class="btn" href="#/follow">Ask us to add one</a> <a class="btn" href="#/recap">The Recap Bench</a> <a class="btn" href="#/journal">Repair journal</a> <a class="btn" href="#/backup">Back up my bench</a></p>'
  +discl()+'<p class="tn">Steps are written from the sources linked on each guide, and a few from general technique, and they say which. Boards and models vary. Work safely, and at your own risk.</p></section>';
 app.innerHTML=h;wireIndex()}
function wireIndex(){var q=$("#rp-q"),kind="",LIM=8,open={},secs=$$(".rc-cat");
 function apply(){var t=q.value.toLowerCase().trim(),n=0;
  secs.forEach(function(sec,si){var match=0,shown=0;$$(".rc-card",sec).forEach(function(a){var g=byId(a.getAttribute("href").replace("#/repairs/","")),hit=g&&(!kind||g.kind===kind)&&(!t||(g.title+" "+g.machines.join(" ")+" "+g.kind+" "+g.symptom).toLowerCase().indexOf(t)>=0),vis=hit&&(!!t||!!kind||!!open[si]||shown<LIM);if(hit)match++;if(vis){shown++;n++}a.hidden=!vis});
   sec.hidden=!match;var mb=$("[data-more]",sec);if(mb){var rest=match-shown;mb.parentNode.hidden=rest<=0;mb.textContent="Show "+rest+" more"}});
  $$(".rc-card").forEach(function(a){if(a.closest(".rc-cat"))return;var g=byId(a.getAttribute("href").replace("#/repairs/","")),hit=g&&(!kind||g.kind===kind)&&(!t||(g.title+" "+g.machines.join(" ")+" "+g.kind+" "+g.symptom).toLowerCase().indexOf(t)>=0);a.hidden=!hit});
  $("#rp-qn").textContent=(t||kind)?(n?n+" found":"Nothing found. Ask us to add it below."):""}
 q.oninput=apply;apply();
 var h=function(e){var t=e.target.closest&&e.target.closest("button");if(!t)return;
  if(t.hasAttribute("data-kk")){kind=t.getAttribute("data-kk");$$("[data-kk]").forEach(function(x){x.className="rc-chip2"+(x===t?" on":"")});apply();return}
  if(t.hasAttribute("data-more")){secs.forEach(function(sec,i){if(sec.contains(t))open[i]=true});apply();return}
  if(t.id==="rp-sur"){var cs=$$(".rc-cat .rc-card");if(cs.length)location.hash=cs[Math.floor(Math.random()*cs.length)].getAttribute("href")}};
 app.addEventListener("click",h);mount._h=[["click",h]]}

/* ---------- a guide ---------- */
function head(g,s){var done=s.done===s.n&&s.n>0;
 return'<div class="rc-top"><div class="rc-ci" id="rc-ci">'+av("connie",96,{holds:"meter",mood:done?"love":"wink"})+'</div><div class="rc-prog"><h3 class="rc-pn">'+E(g.title)+'</h3><div id="rc-bar">'+bar(s.pct,"Steps done")+'</div><p id="rc-count" class="rc-ct"><b>'+s.done+'</b> of '+s.n+' steps done ('+s.pct+'%)</p><p id="rc-say" class="rc-say" role="status"><b>Connie:</b> '+E(cheer(s.pct,s.done))+'</p></div></div>'}
function listHtml(items,key,ms,kind){return'<ul class="rc-tl">'+items.map(function(x,i){var id=key+i,on=!!ms[kind][id];
 return'<li class="'+(on?"done":"")+'"><label><input type="checkbox" data-'+kind+'="'+id+'"'+(on?" checked":"")+'> <b>'+E(x.n)+'</b></label>'+(x.why?'<small>'+E(x.why)+'</small>':"")+(aff()&&x.q?'<span class="rc-tiers noprint">'+stores(x.q,"Amazon")+'</span>':"")+'</li>'}).join("")+'</ul>'}
function cautionHtml(g,ms){var cs=g.cautions;if(!cs.length)return"";
 return'<div class="rc-warn" role="note" id="rp-before"><b>Before you start</b><p class="tn">Tick each one so you know you read it.</p><ul class="rc-tl rc-sf">'+cs.map(function(c,i){var on=!!ms.c["c"+i];return'<li class="'+(on?"done":"")+'"><label><input type="checkbox" data-c="c'+i+'"'+(on?" checked":"")+'> '+E(c)+'</label></li>'}).join("")+'</ul></div>'}
function stepsHtml(g,ms){return'<ol class="rc-steps">'+g.steps.map(function(x,i){var on=!!ms.s["s"+i],c=stepCrew(g,i,g.steps.length);
 return'<li class="'+(on?"done":"")+'"><label><input type="checkbox" data-s="s'+i+'"'+(on?" checked":"")+'> <b>'+E(x.t)+'</b></label><p class="rc-tip">'+E(x.d)+'</p>'+(c?crew(c[0],c[1],"","rc-sc"):"")+'</li>'}).join("")+'</ol>'}
function tipsHtml(g){var ts=g.tips;if(!ts.length)return"";
 var kinds=Object.keys(TIPK).filter(function(k){return ts.some(function(t){return t.k===k})});
 return'<h3 class="sub" id="rp-tips">Tips, tales and maybes</h3>'+crew("floyd","Other people found these out the hard way. Some of it is one person's lucky fix. I keep notes on all of it, mostly.","floppy")
  +'<p class="rc-tf noprint" role="group" aria-label="Show">Show: <button type="button" class="btn lnk on" data-tk="">All ('+ts.length+')</button>'+kinds.map(function(k){return'<button type="button" class="btn lnk" data-tk="'+k+'">'+TIPK[k]+' ('+ts.filter(function(t){return t.k===k}).length+')</button>'}).join("")+'</p>'
  +'<ul class="rc-hints rc-tl2">'+ts.map(function(t){return'<li data-k="'+E(t.k)+'"><span class="rc-chip rc-k-'+E(t.k)+'">'+E(TIPK[t.k]||"Tip")+'</span> <span class="rc-conf rc-conf-'+E(String(t.conf).toLowerCase())+'">'+E(t.conf)+' confidence</span><p>'+E(t.t)+'</p>'+(t.src?'<a class="rc-src" href="'+E(t.src)+'" target="_blank" rel="noopener noreferrer">Read the source</a>':'<small class="tn">General technique, no source.</small>')+'</li>'}).join("")+'</ul>'}
function sourcesHtml(g){if(!g.sources.length)return'<h3 class="sub" id="rp-src">Sources</h3><div class="rc-warn" role="note"><b>No source to credit yet.</b><p>We wrote this one from general technique. Treat it as a starting point, and read or watch a guide for your exact model before you begin. If you know a good one, <a href="#/follow">tell us</a> and we will link it.</p></div>';
 return'<h3 class="sub" id="rp-src">Guides we used</h3><p class="tn">We wrote the steps in our own words from these. They have the photos and the full detail, so please read them and support their authors.</p><ul class="rc-guides">'+g.sources.map(function(s){return'<li><a href="'+E(s.u)+'" target="_blank" rel="noopener noreferrer"><b>'+E(s.t)+'</b></a> <span class="rc-k">'+E(s.kind)+'</span><small>by '+E(s.by)+'. '+E(s.note)+'</small></li>'}).join("")+'</ul>'}
function guide(g){var s=stats(g),ms=s.ms,tl=tlLinks(g),rc=recapLinks(g),ot=otherLinks(g),kc=KIND_CREW[g.kind]||KIND_CREW.Other;
 var h='<section class="rc"><p class="noprint"><a href="#/repairs">← All repairs</a></p><h2>'+E(g.title)+'</h2><p class="sp-lead">'+E(g.blurb)+'</p><p class="tn"><b>'+E(g.kind)+'</b> · '+E(g.level)+' · about '+g.minutes+' minutes · '+(WORTH[g.worth]?'<b>Our take: '+E(WORTH[g.worth][0])+'.</b> '+E(WORTH[g.worth][1]):"")+'</p>';
 if(tl.length)h+='<p class="tn">On the timeline: '+tl.slice(0,8).join(", ")+(tl.length>8?" and "+(tl.length-8)+" more":"")+'</p>';
 h+=crew(kc[0],kc[1]);
 h+='<div class="rc-sym"><b>You are in the right place if:</b> '+E(g.symptom)+'</div>';
 h+=cautionHtml(g,ms);
 h+='<div class="rc-head" id="rc-head">'+head(g,s)+'</div><div id="rc-done"></div>';
 if(g.revisions)h+='<h3 class="sub" id="rp-rev">Board revisions and models</h3><p>'+E(g.revisions)+'</p>';
 h+='<p class="noprint rc-jump">Jump to: <a href="#/repairs/'+E(g.id)+'" data-j="rp-parts">Parts</a> <a href="#/repairs/'+E(g.id)+'" data-j="rp-tools">Tools</a> <a href="#/repairs/'+E(g.id)+'" data-j="rp-steps">Steps</a>'+(g.tips.length?' <a href="#/repairs/'+E(g.id)+'" data-j="rp-tips">Tips</a>':"")+' <a href="#/repairs/'+E(g.id)+'" data-j="rp-src">Sources</a></p>';
 if(g.parts.length)h+='<h3 class="sub" id="rp-parts">Parts you may need</h3>'+crew("winnie","Buy a spare of anything small. You will drop one under the couch.","")+listHtml(g.parts,"p",ms,"p");
 if(g.tools.length)h+='<h3 class="sub" id="rp-tools">Your tools</h3><p class="tn">Tick what you already have.</p>'+listHtml(g.tools,"t",ms,"t");
 h+=discl();
 h+='<h3 class="sub" id="rp-steps">Step by step</h3>'+stepsHtml(g,ms);
 h+=tipsHtml(g)+sourcesHtml(g)+(typeof libSecHtml==="function"?libSecHtml(g.machines):"");
 h+='<section class="rc-nt" aria-labelledby="rc-nth"><h3 class="sub" id="rc-nth">Bench notes</h3>'+crew("tess","I live in the hallway and remember everything. Write it down.","")+'<p><label for="rc-notes" class="sr">Bench notes</label><textarea id="rc-notes" rows="4" maxlength="4000" placeholder="Model, what you found, what you ordered, what to do differently next time.">'+E(ms.n)+'</textarea></p>'+(saved?"":'<p class="msg err">This browser would not save. Your progress will be lost when you close the page. Check that cookies and site data are allowed.</p>')+'</section>';
 if(rc.length||ot.length||tl.length)h+='<h3 class="sub">Keep going</h3><ul class="rc-exl">'+(rc.length?'<li><b>Capacitors too?</b> '+rc.join(" · ")+'</li>':"")+(ot.length?'<li><b>More repairs for the same machines:</b> '+ot.join(" · ")+'</li>':"")+'</ul>';
 h+='<p class="tn">Steps are written from the sources above and boards and models vary, so check what is in front of you. A repair can involve hot tools, chemicals and, on some machines, dangerous voltages. You do it at your own risk.</p>'
  +'<p class="noprint"><a class="btn" href="#/repairs">All repairs</a> <a class="btn" href="#/backup">Back up my bench</a> <a class="btn" href="/repairs/'+E(g.id)+'/">Web version for sharing</a> <button class="btn" type="button" id="rc-print">Print the checklist</button></p></section>';
 app.innerHTML=h;wireGuide(g)}
function refresh(g,msg){var s=stats(g);var b=$("#rc-bar");if(b)b.innerHTML=bar(s.pct,"Steps done");var c=$("#rc-count");if(c)c.innerHTML="<b>"+s.done+"</b> of "+s.n+" steps done ("+s.pct+"%)";
 var say=$("#rc-say");if(say)say.innerHTML="<b>Connie:</b> "+E(msg||cheer(s.pct,s.done));var ci=$("#rc-ci");if(ci)ci.innerHTML=av("connie",96,{holds:"meter",mood:s.done===s.n&&s.n?"love":"wink"});
 var dn=$("#rc-done");if(dn){if(s.done===s.n&&s.n>0){var ms=s.ms;if(!ms.t1)ms.t1=today();write();dn.innerHTML='<div class="rc-win" role="status">'+crew("hiram","It is done! Can I try it now? I called it before anyone else.","controller")+'<p><b>Repair complete.</b> Power it up, test it, and write down what you found in the bench notes. Then <a href="#/journal">log it in the repair journal</a>.</p></div>'}else dn.innerHTML=""}}
function wireGuide(g){var ms=gst(g.id);
 var onChange=function(e){var el=e.target;if(!el||!app.contains(el))return;
  var f=null;["c","p","t","s"].forEach(function(k){if(el.hasAttribute("data-"+k))f=k});if(!f)return;
  var key=el.getAttribute("data-"+f);if(el.checked)ms[f][key]=1;else delete ms[f][key];
  var li=el.closest("li");if(li)li.className=el.checked?"done":"";
  if(f==="s"){if(!ms.t0)ms.t0=today();var s=stats(g);if(s.done<s.n)ms.t1="";persist();refresh(g,el.checked?(s.done+" of "+s.n+". Nice work."):"Unchecked. No problem.")}else write()};
 var onClick=function(e){var tk=e.target.closest&&e.target.closest("button[data-tk]");if(tk){var kk=tk.getAttribute("data-tk");$$("[data-tk]").forEach(function(b){b.className="btn lnk"+(b===tk?" on":"")});$$(".rc-tl2 li").forEach(function(li){li.hidden=!!kk&&li.getAttribute("data-k")!==kk});return}
  var ja=e.target.closest&&e.target.closest("a[data-j]");if(ja){e.preventDefault();var tg=document.getElementById(ja.getAttribute("data-j"));if(tg){tg.scrollIntoView({behavior:motion()?"smooth":"auto",block:"start"});if(!tg.hasAttribute("tabindex"))tg.setAttribute("tabindex","-1");try{tg.focus({preventScroll:true})}catch(x){}}return}
  if(e.target.id==="rc-print")window.print()};
 var onInput=function(e){if(e.target.id==="rc-notes"){ms.n=e.target.value.slice(0,4000);write()}};
 app.addEventListener("change",onChange);app.addEventListener("click",onClick);app.addEventListener("input",onInput);
 mount._h=[["change",onChange],["click",onClick],["input",onInput]];refresh(g)}

function unmount(){if(app&&mount._h){mount._h.forEach(function(x){app.removeEventListener(x[0],x[1])});mount._h=null}}
function mount(el,args){unmount();app=el;st=load();args=args||[];var id=(args[0]||"").toLowerCase(),g=id&&byId(id);
 if(g){guide(g);document.title=g.title+" | Conventional Memory"}
 else{index();document.title="The Repair Bench | Conventional Memory"}}
return{mount:mount,unmount:unmount,summary:summary,guides:REPAIRS}})();
