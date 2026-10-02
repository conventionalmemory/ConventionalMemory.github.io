/* Catalog (#/catalog). One page, one set of controls:
   search (with suggestions) > departments > Show / Sort / View > More filters.
   Views: Cards, List, Table, Shelf, Book (the mail-order catalog, catbook.js), By year. "Not here yet" is a Show option, not a view.
   Every choice lives in the address (#/catalog?c=Laptops&v=list), so Back, bookmarks and shared links all work.
   A big collection (24+ exhibits) opens on the aisle signs (catfront.js); a small one opens straight on the exhibits. */
var CATST={q:"",cats:{},dec:"",min:0,sort:"",status:"",group:"",view:"",show:"ex",shown:48,panel:false,all:false};
var CATVIEWS=[["cards","Cards"],["list","List"],["table","Table"],["shelf","Shelf"],["book","Book"],["years","By year"]];
var CATFRONT_MIN=24;
function catView(){var v=CATST.view;if(!v){try{v=localStorage.getItem("cm-catview")||(localStorage.getItem("cm-catmode")==="book"?"book":"")}catch(e){}if(!/^(cards|list|table|shelf|book|years)$/.test(v||""))v="cards"}return v}
function catalog(){
 var S=CATST,hs=location.hash,pm=/^#\/catalog\/cat\/(.+)$/.exec(hs),uq=/^#\/catalog\?(.*)$/.exec(hs),keep=null;
 try{keep=history.state&&history.state.catKeep||null}catch(e){}
 /* read the address */
 S.q="";S.cats={};S.dec="";S.min=0;S.status="";S.show="ex";S.all=false;S.sort="";S.group="";S.view="";
 if(pm){S.cats[decodeURIComponent(pm[1])]=true}
 else if(uq){var P={};uq[1].split("&").forEach(function(kv){var i=kv.indexOf("=");if(i>0)try{P[kv.slice(0,i)]=decodeURIComponent(kv.slice(i+1).replace(/\+/g," "))}catch(e){}});
  if(P.q)S.q=P.q.slice(0,80);if(P.c)P.c.split("|").forEach(function(c){if(c)S.cats[c]=true});if(/^\d{4}$/.test(P.d||""))S.dec=P.d;if(P.t)S.status=P.t.slice(0,40);if(+P.m>0)S.min=Math.min(600,+P.m);
  if(/^(cards|list|table|shelf|book|years)$/.test(P.v||""))S.view=P.v;else if(P.v==="dir")S.view="dir";else if(P.n==="rows")S.view="list";else if(P.n==="table")S.view="table";
  if(P.v==="next"||P.x==="next")S.show="next";if(P.a==="1")S.all=true;if(/^(score|old|new|name)$/.test(P.s||""))S.sort=P.s;if(/^(none|cat|dec|az)$/.test(P.g||""))S.group=P.g}
 var view=S.view||catView();
 var cats={},decs={},sts={};
 ITEMS.forEach(function(i){cats[i.cat]=(cats[i.cat]||0)+1;var d=i.year?Math.floor(i.year/10)*10:0;if(d)decs[d]=(decs[d]||0)+1;if(i.status)sts[i.status]=(sts[i.status]||0)+1});
 var catKeys=Object.keys(cats),useFront=typeof CMFront!=="undefined"&&ITEMS.length>=CATFRONT_MIN;
 var soon=typeof DRAFTS!=="undefined"?DRAFTS.length:0,hint=true;try{hint=localStorage.getItem("cm-cathint")!=="1"}catch(e){}
 var SORTSEL='<label class="csel">Sort <select id="s" aria-label="Sort"><option value="">Catalog order</option><option value="score">Highest score</option><option value="old">Oldest first</option><option value="new">Newest first</option><option value="name">Name A to Z</option></select></label>';
 var VSEL='<label class="csel cvsel">View <select id="vw" aria-label="View">'+CATVIEWS.map(function(v){return'<option value="'+v[0]+'">'+v[1]+'</option>'}).join("")+'</select></label>';
 var legend='<details class="clegend"><summary>What do the badges mean?</summary><dl><dt>Score (540K)</dt><dd>A rating out of 640K, the amount of DOS conventional memory. More K is cooler. '+SCALE.filter(function(t){return t.min>0}).map(function(t){return esc(t.l)+" "+t.min+"K+"}).join(", ")+'.</dd><dt>Working, Repair...</dt><dd>What shape the exhibit is in.</dd><dt>x2</dt><dd>The museum has two of them.</dd><dt>Not here yet</dt><dd>Things the timeline says exist that the museum is still hunting for.</dd></dl></details>';
 app.innerHTML='<section class="catw"><h2>Catalog</h2>'
  +(hint?'<p class="chint" id="ch"><b>Tip:</b> type to search, pick a department, or change the view. Everything you choose stays in the address, so you can share it. Press <kbd>/</kbd> to search from anywhere. <button type="button" class="btn" id="chx">Got it</button></p>':"")
  +'<div class="csearch"><div class="cbox"><input id="q" type="search" role="combobox" aria-expanded="false" aria-controls="qs" aria-autocomplete="list" autocomplete="off" placeholder="Search names, makers, years, label numbers (press /)" aria-label="Search the catalog" value="'+esc(S.q)+'"><ul id="qs" class="qs" role="listbox" hidden></ul></div><button class="btn" id="sur" type="button">Surprise me</button></div>'
  +'<div class="cchips cstrip" id="cc" role="group" aria-label="Departments"><button type="button" class="chip" data-c="*" aria-pressed="false">All <b>'+ITEMS.length+'</b></button>'+catKeys.map(function(c){return'<button type="button" class="chip" data-c="'+esc(c)+'" aria-pressed="false">'+(typeof pxCat==="function"?pxCat(c,14):"")+esc(c)+' <b>'+cats[c]+'</b></button>'}).join("")+'</div>'
  +'<div class="ctools2" id="ct"><span class="cseg" id="cs" role="group" aria-label="Show"><button type="button" class="btn" data-x="ex" aria-pressed="false">In the museum</button><button type="button" class="btn" data-x="next" aria-pressed="false">Not here yet</button></span>'
  +SORTSEL+VSEL+'<span class="cviews" role="group" aria-label="View">'+CATVIEWS.map(function(v){return'<button type="button" class="btn" data-v="'+v[0]+'" aria-pressed="false">'+v[1]+'</button>'}).join("")+'</span>'
  +'<button class="btn" id="fb" type="button" aria-expanded="false" aria-controls="fp">More filters</button></div>'
  +'<div id="fp" class="cpanel" hidden><div class="cdisp"><label class="csel">Group by <select id="gp" aria-label="Group by"><option value="">Automatic</option><option value="none">No grouping</option><option value="cat">Department</option><option value="dec">Decade</option><option value="az">First letter</option></select></label>'
  +'<label class="cmin">Minimum score: <b id="mv">0</b>K <input id="mn" type="range" min="0" max="600" step="50" value="'+S.min+'" aria-label="Minimum score"></label></div>'
  +'<div class="cchips" id="cd" role="group" aria-label="Decades and condition">'+Object.keys(decs).sort().map(function(d){return'<button type="button" class="chip dec" data-d="'+d+'" aria-pressed="false">'+d+'s <b>'+decs[d]+'</b></button>'}).join("")+Object.keys(sts).map(function(t){return'<button type="button" class="chip st" data-t="'+esc(t)+'" aria-pressed="false">'+esc(t)+' <b>'+sts[t]+'</b></button>'}).join("")+'</div>'
  +(typeof tagBrowse==="function"?tagBrowse():"")+legend+'</div>'
  +'<div id="fr"></div><div id="res"><div class="cback" id="cbk"><button class="btn" id="bk" type="button">◄ Back to the aisles</button></div>'
  +'<div id="af" class="cact"></div><p id="cn" class="tn" role="status"></p><div id="jm"></div><div id="g"></div><p id="more" class="cmore"></p><p id="soon" class="csoon"></p></div></section>';
 var q=document.getElementById("q"),so=document.getElementById("s"),vw=document.getElementById("vw"),g=document.getElementById("g"),mn=document.getElementById("mn"),gp=document.getElementById("gp"),fp=document.getElementById("fp"),fb=document.getElementById("fb"),fr=document.getElementById("fr"),res=document.getElementById("res"),qs=document.getElementById("qs");
 so.value=S.sort;gp.value=S.group;mn.value=S.min;
 var lastIds=[];
 if(useFront){fr.innerHTML=CMFront.html(ITEMS);CMFront.wire(fr,ITEMS,{dept:function(c){S.cats={};S.cats[c]=true;S.all=false;S.shown=48;run();window.scrollTo(0,0)},go:function(v){S.view=v==="dir"?"dir":(v==="shelf"?"shelf":v==="years"?"years":"");S.all=true;S.shown=48;if(v==="next")S.show="next";run();window.scrollTo(0,0)}})}
 function saved(v){try{localStorage.setItem("cm-catview",v)}catch(e){}}
 function itemNo(it){return it.cm?"CM-"+("0000"+it.cm).slice(-4):(typeof CMBook!=="undefined"&&CMBook.itemNo?CMBook.itemNo(it):"")}
 function nokey(){return!(q.value||S.dec||S.status||S.min>0||Object.keys(S.cats).some(function(k){return S.cats[k]}))}
 function isIdle(){return useFront&&!S.all&&nokey()&&S.show==="ex"&&!S.view}
 function match(i){var t=(i.name+" "+i.maker+" "+i.year+" "+i.cat+" "+(i.acc||"")+" "+(i.tags||[]).join(" ")+" "+(i.text||"")+" "+(i.cm?"cm-"+("0000"+i.cm).slice(-4):"")+" "+Object.keys(i.specs||{}).map(function(k){return i.specs[k]}).join(" ")).toLowerCase();var okc=Object.keys(S.cats).filter(function(k){return S.cats[k]});
  return t.indexOf(S.q.toLowerCase())>=0&&(!okc.length||okc.indexOf(i.cat)>=0)&&(!S.dec||(i.year&&Math.floor(i.year/10)*10===+S.dec))&&(!S.status||i.status===S.status)&&(S.min<=0||(i.score!=null&&i.score>=S.min))}
 /* ---- views ---- */
 function wrapCard(i){return'<div class="cw">'+card(i)+'<button type="button" class="ql" data-ql="'+esc(i.id)+'" aria-label="Quick look at '+esc(i.name)+'">Quick look</button></div>'}
 function row(i){return'<a class="crw" href="#/item/'+esc(i.id)+'"><span class="crw-p">'+pic(i)+'</span><span class="crw-n"><b>'+esc(i.name)+'</b><small>'+esc(i.maker||"")+(i.year?" &middot; "+i.year:"")+' &middot; '+esc(itemNo(i))+'</small></span><span class="crw-c">'+(typeof pxCat==="function"?pxCat(i.cat,14):"")+esc(i.cat)+'</span><span class="crw-s">'+(i.score!=null?'<i style="width:'+(i.score/640*100)+'%;background:'+tier(i.score).c+'"></i><em>'+i.score+'K</em>':"")+'</span>'+(i.status?'<span class="tag">'+esc(i.status)+'</span>':'')+'</a>'}
 function tbl(l){return'<div class="mx-wrap"><table class="ctab"><thead><tr><th>No.</th><th>Name</th><th>Maker</th><th>Year</th><th>Department</th><th>Score</th><th>Condition</th></tr></thead><tbody>'+l.map(function(i){return'<tr><td>'+esc(itemNo(i))+'</td><td><a href="#/item/'+esc(i.id)+'">'+esc(i.name)+'</a></td><td>'+esc(i.maker||"")+'</td><td>'+(i.year||"")+'</td><td>'+esc(i.cat)+'</td><td>'+(i.score!=null?i.score+'K':"")+'</td><td>'+esc(i.status||"")+'</td></tr>'}).join("")+'</tbody></table></div>'}
 function shelf(l){var h='<p class="tn">Every spine is an exhibit. Taller means a higher score. Hover or tab to a spine to read its full title.</p><div class="shelfw"><div class="shelf">'+l.map(function(i,n){var sc=i.score==null?200:i.score,ht=130+sc/640*130,c=i.score!=null?tier(i.score).c:"#808080",w=40+((hstr?hstr(i.name):n)%3)*8;return'<a class="spine" href="#/item/'+esc(i.id)+'" style="height:'+ht.toFixed(0)+'px;width:'+w+'px;background:'+c+';color:'+inkOn(c)+'" aria-label="'+esc(i.name+(i.year?", "+i.year:"")+(i.score!=null?", "+tier(i.score).l:""))+'" data-n="'+esc(i.name)+'" data-m="'+esc((i.maker||"")+(i.year?" · "+i.year:"")+(i.score!=null?" · "+i.score+"K "+tier(i.score).l:""))+'"><i class="spx">'+(typeof pxCat==="function"?pxCat(i.cat,16):"")+'</i><span>'+esc(i.name)+'</span><small>'+(i.year?String(i.year).slice(2):"")+'</small></a>'}).join("")+'</div><div class="shtip" role="tooltip" hidden></div></div>';return h}
 function shelfWire(){var w=document.querySelector(".shelfw");if(!w)return;var t=w.querySelector(".shtip");function show(e){var a=e.target.closest&&e.target.closest(".spine");if(!a)return;t.innerHTML="<b></b><span></span>";t.firstChild.textContent=a.dataset.n;t.lastChild.textContent=a.dataset.m;t.hidden=false;var wr=w.getBoundingClientRect(),ar=a.getBoundingClientRect(),tw=t.offsetWidth,x=ar.left-wr.left+ar.width/2-tw/2;x=Math.max(4,Math.min(x,wr.width-tw-4));var y=Math.max(2,ar.top-wr.top-t.offsetHeight-8);t.style.left=x+"px";t.style.top=y+"px"}function hide(){t.hidden=true}w.addEventListener("mouseover",show);w.addEventListener("focusin",show);w.addEventListener("mouseout",function(e){var r=e.relatedTarget;if(!r||!r.closest||!r.closest(".spine"))hide()});w.addEventListener("focusout",hide)}
 function years(l){var by={};l.forEach(function(i){var y=i.year||0;(by[y]=by[y]||[]).push(i)});return'<div class="tm">'+Object.keys(by).sort(function(a,b){a=+a||9999;b=+b||9999;return a-b}).map(function(y){return'<div class="tmy"><a class="tmh" href="#/timeline/'+y+'">'+(+y||"Undated")+'</a>'+by[y].map(function(i){return'<a class="tmi" href="#/item/'+esc(i.id)+'"><span class="tmd"></span>'+esc(i.name)+(i.score!=null?' <small>'+i.score+'K</small>':'')+'</a>'}).join("")+'</div>'}).join("")+'</div>'}
 function nextUp(){var seen={},rows=[];ITEMS.forEach(function(it){var r=typeof tlRowOfItem==="function"?tlRowOfItem(it):null;if(!r)return;tlLinks(r[2]).forEach(function(l){if(tlOwn(l[0])||seen[l[0]])return;var row=TL.filter(function(z){return z[2]===l[0]})[0];if(!row||!/^(hw|sw|gt|gn|gc)$/.test(row[1]))return;seen[l[0]]=1;rows.push({r:row,rel:l[1],from:it})})});
  rows.sort(function(a,b){return a.r[0]<b.r[0]?-1:1});
  return'<p class="tn">Things on the timeline that are connected to the collection but not in it yet: sequels, rivals, upgrades, and what ran on what is here. Click one to read about it.</p>'+(rows.length?'<div class="nu">'+rows.map(function(x){return'<a class="nui" href="#/timeline" data-tl="'+esc(x.r[2])+'"><b>'+esc(x.r[2])+'</b><span>'+esc(String(x.r[0]).slice(0,4))+(x.r[3]?" &middot; "+esc(x.r[3].replace(/ \(.*$/,"")):"")+'</span><small>'+esc(x.rel)+' of '+esc(x.from.name)+'</small></a>'}).join("")+'</div>':'<div class="empty">Nothing connected yet.</div>')}
 function gmode(){return S.group||(ITEMS.length<CATFRONT_MIN?"none":"cat")}
 function gkey(i,m){return m==="cat"?i.cat:m==="dec"?(i.year?Math.floor(i.year/10)*10+"s":"Undated"):(String(i.name||"?").charAt(0).toUpperCase().replace(/[^A-Z]/,"#"))}
 function draw(l,v){return v==="list"?'<div class="crows">'+l.map(row).join("")+'</div>':v==="table"?tbl(l):'<div class="grid">'+l.map(wrapCard).join("")+'</div>'}
 function slug2(k){return"grp-"+String(k).replace(/[^a-z0-9]+/gi,"-")}
 function syncUrl(){var P=[];function add(k,v){P.push(k+"="+encodeURIComponent(v))}var v=S.view||catView();if(S.q)add("q",S.q);var cs=Object.keys(S.cats).filter(function(k){return S.cats[k]});if(cs.length)add("c",cs.join("|"));if(S.dec)add("d",S.dec);if(S.status)add("t",S.status);if(S.min>0)add("m",S.min);if(S.show==="next")add("x","next");if(S.view&&S.view!=="cards")add("v",S.view);if(S.all)add("a","1");if(S.sort)add("s",S.sort);if(S.group)add("g",S.group);
  var filt=P.some(function(x){return/^(q|c|d|t|m|v|a|x)=/.test(x)});var t="#/catalog"+(filt||S.sort||S.group?"?"+P.join("&"):"");if(location.hash!==t&&/^#\/catalog/.test(location.hash)){try{history.replaceState(history.state,"",t)}catch(e){}}}
 /* ---- suggestions and "did you mean" ---- */
 function words(){var w={};ITEMS.forEach(function(i){[i.name,i.maker,i.cat].forEach(function(s){String(s||"").split(/\s+/).forEach(function(x){x=x.replace(/[^A-Za-z0-9]/g,"");if(x.length>2)w[x.toLowerCase()]=x})})});return w}
 function didYouMean(t){if(typeof lev!=="function")return"";var W=words(),best="",bd=9;t.toLowerCase().split(/\s+/).forEach(function(x){if(x.length<3)return;Object.keys(W).forEach(function(k){var d=lev(x,k);if(d<bd&&d<=Math.max(1,Math.floor(x.length/3))){bd=d;best=W[k]}})});return best}
 var sugIdx=-1,sugList=[];
 function suggest(){var t=q.value.trim().toLowerCase();sugList=[];if(t.length<1){closeSug();return}
  var tagIt=typeof itemByTag==="function"&&/^(cm[-\s]?)?\d{1,6}$/i.test(t)?itemByTag(t):null;if(tagIt&&!tagIt.draft)sugList.push({k:"Exhibit",t:tagIt.name+" ("+itemNo(tagIt)+")",href:"#/item/"+tagIt.id});
  ITEMS.filter(function(i){return i.name.toLowerCase().indexOf(t)>=0}).sort(function(a,b){return(a.name.toLowerCase().indexOf(t)===0?0:1)-(b.name.toLowerCase().indexOf(t)===0?0:1)}).slice(0,5).forEach(function(i){sugList.push({k:"Exhibit",t:i.name+(i.year?" ("+i.year+")":""),href:"#/item/"+i.id})});
  var mk={};ITEMS.forEach(function(i){if(i.maker&&i.maker!=="Unknown"&&i.maker.toLowerCase().indexOf(t)>=0)mk[i.maker]=1});Object.keys(mk).slice(0,2).forEach(function(m){sugList.push({k:"Maker",t:m,href:"#/maker/"+encodeURIComponent(m)})});
  catKeys.filter(function(c){return c.toLowerCase().indexOf(t)>=0}).slice(0,2).forEach(function(c){sugList.push({k:"Department",t:c,cat:c})});
  if(t.length>=2)sugList.push({k:"Timeline",t:'Search the timeline for "'+q.value.trim()+'"',href:"#/search/"+encodeURIComponent(q.value.trim())});
  qs.innerHTML=sugList.map(function(s,n){return'<li id="qs'+n+'" role="option" data-n="'+n+'" aria-selected="false"><small>'+esc(s.k)+'</small> '+esc(s.t)+'</li>'}).join("");qs.hidden=!sugList.length;q.setAttribute("aria-expanded",!qs.hidden);sugIdx=-1;q.removeAttribute("aria-activedescendant")}
 function closeSug(){qs.hidden=true;q.setAttribute("aria-expanded","false");sugIdx=-1}
 function pick(n){var s=sugList[n];if(!s)return;closeSug();if(s.cat){S.cats={};S.cats[s.cat]=true;S.q="";q.value="";S.all=false;S.shown=48;run();return}location.hash=s.href}
 function mark(){[].forEach.call(qs.children,function(li,n){li.setAttribute("aria-selected",n===sugIdx);li.classList.toggle("on",n===sugIdx)});if(sugIdx>=0)q.setAttribute("aria-activedescendant","qs"+sugIdx);else q.removeAttribute("aria-activedescendant")}
 /* ---- the main render ---- */
 function run(){var idle=isIdle();syncUrl();fr.hidden=!idle;res.hidden=idle;document.getElementById("cc").hidden=idle;document.getElementById("ct").hidden=idle;
  var v=S.view||catView(),okc=Object.keys(S.cats).filter(function(k){return S.cats[k]});
  document.querySelectorAll("[data-c]").forEach(function(b){var all=b.dataset.c==="*",on=all?!okc.length:!!S.cats[b.dataset.c];b.classList.toggle("on",on);b.setAttribute("aria-pressed",on)});
  document.querySelectorAll("[data-d]").forEach(function(b){var on=S.dec===b.dataset.d;b.classList.toggle("on",on);b.setAttribute("aria-pressed",on)});
  document.querySelectorAll("[data-t]").forEach(function(b){var on=S.status===b.dataset.t;b.classList.toggle("on",on);b.setAttribute("aria-pressed",on)});
  document.querySelectorAll("[data-v]").forEach(function(b){var on=v===b.dataset.v&&S.show==="ex";b.classList.toggle("pri",on);b.setAttribute("aria-pressed",on)});
  document.querySelectorAll("[data-x]").forEach(function(b){var on=S.show===b.dataset.x;b.classList.toggle("pri",on);b.setAttribute("aria-pressed",on)});
  vw.value=/^(cards|list|table|shelf|book|years)$/.test(v)?v:"cards";document.getElementById("mv").textContent=S.min;
  var nf=(S.dec?1:0)+(S.status?1:0)+(S.min>0?1:0)+(S.group?1:0);fb.textContent="More filters"+(nf?" ("+nf+")":"");fp.hidden=!S.panel;fb.setAttribute("aria-expanded",S.panel);fb.classList.toggle("pri",S.panel);
  var nx=S.show==="next";so.disabled=nx;vw.disabled=nx;document.querySelectorAll("[data-v]").forEach(function(b){b.disabled=nx});
  if(idle)return;
  document.getElementById("cbk").hidden=!useFront;
  var jm=document.getElementById("jm"),mo=document.getElementById("more"),cn=document.getElementById("cn"),af=document.getElementById("af"),sn=document.getElementById("soon");jm.innerHTML="";mo.innerHTML="";g.className="";sn.innerHTML="";
  if(nx){af.innerHTML="";cn.textContent="";g.innerHTML=nextUp();lastIds=[];return}
  var r=ITEMS.filter(match);
  if(S.sort==="score")r.sort(function(a,b){return(b.score||0)-(a.score||0)});else if(S.sort==="old")r.sort(function(a,b){return a.year-b.year});else if(S.sort==="new")r.sort(function(a,b){return b.year-a.year});else if(S.sort==="name"||(gmode()==="az"&&!S.sort))r.sort(function(a,b){return a.name.localeCompare(b.name)});
  lastIds=r.map(function(i){return i.id});
  var act=[];if(S.q)act.push(["q",'Search: "'+S.q+'"']);okc.forEach(function(k){act.push(["c:"+k,k])});if(S.dec)act.push(["d",S.dec+"s"]);if(S.status)act.push(["t",S.status]);if(S.min>0)act.push(["m","Score "+S.min+"K+"]);
  af.innerHTML=act.map(function(a){return'<button type="button" class="chip on" data-xx="'+esc(a[0])+'" aria-label="Remove filter '+esc(a[1])+'">'+esc(a[1])+' &times;</button>'}).join("")+(act.length>1?'<button class="btn" id="clr" type="button">Clear all</button>':"");
  var paged=v==="cards"||v==="list"||v==="table";
  cn.textContent=v==="book"?"The Book shows every exhibit. Use Cards or List to filter.":"Showing "+Math.min(r.length,paged?S.shown:r.length)+" of "+r.length+(r.length!==ITEMS.length?" matching ("+ITEMS.length+" in the museum)":" exhibit"+(r.length===1?"":"s"));
  var cl=document.getElementById("clr");if(cl)cl.onclick=function(){S.q="";S.cats={};S.dec="";S.status="";S.min=0;q.value="";S.shown=48;run()};
  if(soon&&r.length===ITEMS.length)sn.innerHTML="+ "+soon+" more exhibit"+(soon===1?" is":"s are")+" being catalogued. <a href=\"#/catalog?x=next\">See what the museum is still hunting for.</a>";
  if(v==="book"&&window.CMBook){g.innerHTML='<div id="bkmount"></div>';CMBook.mount(document.getElementById("bkmount"));return}
  if(!r.length){var dm=S.q?didYouMean(S.q):"";g.innerHTML=conW('<div class="empty"><p>Nothing matches'+(S.q?' "'+esc(S.q)+'"':" those filters")+'.</p>'+(dm?'<p>Did you mean <button type="button" class="btn" id="dym">'+esc(dm)+'</button>?</p>':"")+'<p><button type="button" class="btn" id="clr2">Clear everything</button>'+(S.q?' <a class="btn" href="#/search/'+encodeURIComponent(S.q)+'">Search the timeline</a>':"")+'</p></div>');
   var d1=document.getElementById("dym");if(d1)d1.onclick=function(){S.q=dm;q.value=dm;S.shown=48;run()};document.getElementById("clr2").onclick=function(){S.q="";S.cats={};S.dec="";S.status="";S.min=0;q.value="";run()};return}
  if(paged){var vis=r.slice(0,S.shown),h="",gm=v==="cards"||v==="list"?gmode():"none";
   if(gm==="none")h=draw(vis,v);else{var keys=[],by={};vis.forEach(function(i){var k=gkey(i,gm);if(!by[k]){by[k]=[];keys.push(k)}by[k].push(i)});if(gm!=="cat")keys.sort();
    if(keys.length>1)jm.innerHTML='<div class="cjump" role="navigation" aria-label="Jump to a group">'+keys.map(function(k){return'<button type="button" class="chip" data-j="'+slug2(k)+'">'+esc(k)+' <b>'+by[k].length+'</b></button>'}).join("")+'</div>';
    h=keys.map(function(k){return'<h3 class="cgh" id="'+slug2(k)+'">'+(gm==="cat"&&typeof pxCat==="function"?pxCat(k,16):"")+esc(k)+' <small>'+by[k].length+'</small></h3>'+draw(by[k],v)}).join("")}
   g.innerHTML=h;
   if(r.length>S.shown)mo.innerHTML='<button class="btn pri" id="sm" type="button">Show '+Math.min(24,r.length-S.shown)+' more</button> <button class="btn" id="sa" type="button">Show all '+r.length+'</button>'}
  else g.innerHTML=v==="dir"?dir(r):v==="shelf"?shelf(r):years(r);
  if(v==="shelf")shelfWire()}
 /* ---- events ---- */
 function reset(){S.shown=48}
 q.oninput=function(){S.q=q.value;reset();run();suggest()};
 q.onfocus=function(){if(q.value)suggest()};q.onblur=function(){setTimeout(closeSug,160)};
 q.onkeydown=function(e){if(e.key==="ArrowDown"&&sugList.length){e.preventDefault();sugIdx=(sugIdx+1)%sugList.length;mark()}else if(e.key==="ArrowUp"&&sugList.length){e.preventDefault();sugIdx=(sugIdx-1+sugList.length)%sugList.length;mark()}else if(e.key==="Enter"){if(sugIdx>=0){e.preventDefault();pick(sugIdx)}else closeSug()}else if(e.key==="Escape"){closeSug()}};
 qs.onmousedown=function(e){var li=e.target.closest("li");if(li){e.preventDefault();pick(+li.dataset.n)}};
 so.onchange=function(){S.sort=so.value;run()};gp.onchange=function(){S.group=gp.value;run()};mn.oninput=function(){S.min=+mn.value;reset();run()};
 vw.onchange=function(){S.view=vw.value;saved(S.view);S.all=true;run()};
 fb.onclick=function(){S.panel=!S.panel;run()};
 document.getElementById("cs").onclick=function(e){var b=e.target.closest("[data-x]");if(b){S.show=b.dataset.x;S.all=true;run()}};
 document.querySelector(".cviews").onclick=function(e){var b=e.target.closest("[data-v]");if(b&&!b.disabled){S.view=b.dataset.v;saved(S.view);S.show="ex";S.all=true;run()}};
 document.getElementById("cc").onclick=function(e){var b=e.target.closest("[data-c]");if(!b)return;if(b.dataset.c==="*")S.cats={};else S.cats[b.dataset.c]=!S.cats[b.dataset.c];S.show="ex";S.all=true;reset();run()};
 document.getElementById("cd").onclick=function(e){var b=e.target.closest("[data-d]");if(b){S.dec=S.dec===b.dataset.d?"":b.dataset.d;reset();run();return}b=e.target.closest("[data-t]");if(b){S.status=S.status===b.dataset.t?"":b.dataset.t;reset();run()}};
 document.getElementById("af").onclick=function(e){var b=e.target.closest("[data-xx]");if(!b)return;var k=b.dataset.xx;if(k==="q"){S.q="";q.value=""}else if(k==="d")S.dec="";else if(k==="t")S.status="";else if(k==="m"){S.min=0;mn.value=0}else if(k.indexOf("c:")===0)S.cats[k.slice(2)]=false;reset();run()};
 document.getElementById("bk").onclick=function(){S.q="";S.cats={};S.dec="";S.status="";S.min=0;S.show="ex";S.view="";S.all=false;q.value="";mn.value=0;run();window.scrollTo(0,0)};
 document.getElementById("jm").onclick=function(e){var b=e.target.closest("[data-j]");if(!b)return;var t=document.getElementById(b.dataset.j);if(t)t.scrollIntoView({behavior:document.documentElement.getAttribute("data-motion")==="off"?"auto":"smooth",block:"start"})};
 document.getElementById("more").onclick=function(e){if(e.target.id==="sm"){S.shown+=24;run()}else if(e.target.id==="sa"){S.shown=1e9;run()}};
 document.getElementById("sur").onclick=function(){var l=ITEMS.filter(match);if(!l.length)l=ITEMS;location.hash="#/item/"+l[Math.floor(Math.random()*l.length)].id};
 var chx=document.getElementById("chx");if(chx)chx.onclick=function(){try{localStorage.setItem("cm-cathint","1")}catch(e){}document.getElementById("ch").remove()};
 /* leaving for an item: remember the scroll position and the list, so Back lands in the same place and the item page can step through it */
 function leave(){try{history.replaceState({catKeep:{y:window.scrollY,shown:S.shown}},"");sessionStorage.setItem("cm-catlist",JSON.stringify({ids:lastIds.slice(0,500),h:location.hash}))}catch(e){}}
 g.addEventListener("click",function(e){var n=e.target.closest("[data-tl]");if(n){e.preventDefault();var r=TL.filter(function(z){return z[2]===n.dataset.tl})[0];if(r){window.TLJUMP=r[2];location.hash="#/timeline/"+String(r[0]).slice(0,4)}return}
  var ql=e.target.closest("[data-ql]");if(ql){e.preventDefault();quick(ql.dataset.ql,ql);return}
  if(e.target.closest('a[href^="#/item/"]'))leave()});
 /* ---- quick look ---- */
 var qlFocus=null;
 function quick(id,from){var it=ITEMS.filter(function(x){return x.id===id})[0];if(!it)return;qlFocus=from||document.activeElement;var d=document.getElementById("qlk");if(d)d.remove();
  var pos=lastIds.indexOf(id),sp=Object.keys(it.specs||{}).slice(0,5).map(function(k){return'<dt>'+esc(k)+'</dt><dd>'+esc(it.specs[k])+'</dd>'}).join("");
  d=document.createElement("div");d.id="qlk";d.className="qlk";d.setAttribute("role","dialog");d.setAttribute("aria-modal","true");d.setAttribute("aria-labelledby","qlt");
  d.innerHTML='<div class="qlb"><button type="button" class="btn qlx" id="qlc" aria-label="Close quick look">Close</button><div class="qlp">'+pic(it)+'</div><div class="qli"><h3 id="qlt">'+esc(it.name)+'</h3><p class="tn">'+esc((it.maker&&it.maker!=="Unknown"?it.maker+" · ":"")+(it.year||"")+" · "+it.cat+(itemNo(it)?" · "+itemNo(it):""))+'</p>'+(it.score!=null?'<p><span class="tag">'+it.score+'K</span> '+esc(tier(it.score).l)+'</p>':"")+'<p>'+esc(String(it.text||it.notes||"").slice(0,260))+'</p>'+(sp?'<dl class="qls">'+sp+'</dl>':"")
   +'<p class="qla"><a class="btn pri" href="#/item/'+esc(it.id)+'" id="qlo">Open the full page</a>'+(pos>0?' <button type="button" class="btn" id="qlp">◄ Previous</button>':"")+(pos>=0&&pos<lastIds.length-1?' <button type="button" class="btn" id="qln">Next ►</button>':"")+'</p></div></div>';
  document.body.appendChild(d);var c=document.getElementById("qlc");c.focus();
  function close(){d.remove();document.removeEventListener("keydown",key,true);if(qlFocus&&document.body.contains(qlFocus))qlFocus.focus()}
  function key(e){if(e.key==="Escape"){e.preventDefault();close()}else if(e.key==="Tab"){var f=[].slice.call(d.querySelectorAll("a[href],button")).filter(function(x){return!x.disabled});if(!f.length)return;var a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}}
  document.addEventListener("keydown",key,true);c.onclick=close;d.onclick=function(e){if(e.target===d)close()};
  document.getElementById("qlo").onclick=function(){leave();close()};
  var p=document.getElementById("qlp"),nx=document.getElementById("qln");if(p)p.onclick=function(){close();quick(lastIds[pos-1],qlFocus)};if(nx)nx.onclick=function(){close();quick(lastIds[pos+1],qlFocus)}}
 if(keep){S.shown=Math.max(S.shown,keep.shown||48)}
 run();
 if(keep){try{history.replaceState(null,"")}catch(e){}window.scrollTo(0,keep.y||0)}}
document.addEventListener("keydown",function(e){if(e.key==="/"&&!/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement||{}).tagName||"")&&location.hash.indexOf("#/catalog")===0){var q=document.getElementById("q");if(q){e.preventDefault();q.focus()}}});
