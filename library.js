/* library.js: the Manuals and Datasheets library (#/library and #/library/<machine>).
   Every document is a PDF in our shared Google Drive folder (data in library-data.js, one Drive file id per row).
   Each link opens the file in a new tab. A library card in this browser (localStorage key cm-lib)
   gets a stamp for each document you open. Dad is the librarian. */
window.CMLibrary=(function(){
"use strict";
var KEY="cm-lib",app=null,st=null,handlers=null;
var KIND={s:["Service manual","Service manuals"],d:["Schematic","Schematics and parts diagrams"],g:["Guide","Install and mod guides"],o:["Operating guide","Operating instructions"],c:["Datasheet","Chip datasheets"]};
var RANKS=[[0,"New card","Dad slides a blank card across the desk."],[1,"Page turner","One stamp. Dad nods once."],[10,"Manual reader","Ten stamps. Dad says that is a good start, and means it."],[40,"Schematic spotter","Forty stamps. You can follow a trace without a finger on the page."],[100,"Chief librarian","A hundred. Dad has a stamp for you that he has never used."],[250,"Keeper of the shelf","Two hundred and fifty. Dad needs to sit down."]];
function E(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function $(s,r){return(r||app).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||app).querySelectorAll(s))}
function load(){var o=null;try{o=JSON.parse(localStorage.getItem(KEY)||"null")}catch(e){}if(!o||typeof o!=="object"||Array.isArray(o)||typeof o.s!=="object"||!o.s)o={s:{}};return o}
var saved=true;function write(){try{localStorage.setItem(KEY,JSON.stringify(st));saved=true}catch(e){saved=false}}
function av(id,sz,o){if(typeof CMCast==="undefined")return"";var opt={tall:true};if(typeof CMCast.famOpts==="function"){var f=CMCast.famOpts(id);for(var k in f)opt[k]=f[k]}if(o)for(var j in o)opt[j]=o[j];try{return CMCast.svg(id,sz,opt)}catch(e){return""}}
function crew(id,name,line,holds){if(window.CMBub)return CMBub.html(id,name,line,av(id,48,{holds:holds||"book"}),{cls:"rc-crew"});return'<div class="rc-crew"><span class="rc-av" aria-hidden="true">'+av(id,48,{holds:holds||"book"})+'</span><p><b>'+E(name)+':</b> '+E(line)+'</p></div>'}

var DOCS=LIB.d.map(function(r,i){return{i:i,t:r[0],k:r[1],kb:r[2],u:r[3],pg:r[4]?r[4].split("|"):[],m:r[5]?r[5].split(","):[],q:(r[0]+" "+r[4]+" "+r[5]).toLowerCase()}});
function href(d){return"https://drive.google.com/file/d/"+d.u+"/view"}
function size(kb){return kb>=1024?(kb/1024).toFixed(1)+" MB":kb+" KB"}
function stamped(){var n=0;DOCS.forEach(function(d){if(st.s[d.u])n++});return n}
function rank(n){var r=RANKS[0];RANKS.forEach(function(x){if(n>=x[0])r=x});return r}
function card(){var n=stamped(),t=DOCS.length,pct=Math.round(n/t*100),r=rank(n);
 return'<div class="lib-card" id="lib-card"><div class="lib-cardh"><b>Library card</b> <span class="lib-rank" id="lib-rank">'+E(r[1])+'</span></div><div class="rc-bar" role="progressbar" aria-valuemin="0" aria-valuemax="'+t+'" aria-valuenow="'+n+'" aria-label="Documents stamped"><i style="width:'+pct+'%"></i></div><p class="tn" id="lib-cardp"><b>'+n+'</b> of '+t+' stamped. '+E(r[2])+'</p>'+(saved?"":'<p class="msg err">This browser would not save your stamps.</p>')+'</div>'}
function item(d){var on=!!st.s[d.u];
 return'<li class="lib-d'+(on?" on":"")+'"><a href="'+E(href(d))+'" target="_blank" rel="noopener noreferrer" data-u="'+E(d.u)+'"><b>'+E(d.t)+'</b></a> <span class="rc-k">'+E(KIND[d.k][0])+'</span> <small>'+size(d.kb)+'</small><span class="lib-st" aria-hidden="true">'+(on?"✔ stamped":"")+'</span></li>'}
function group(title,docs,link,open){return'<details class="lib-g"'+(open?" open":"")+'><summary><b>'+E(title)+'</b> <small>'+docs.length+(docs.length===1?" document":" documents")+'</small></summary>'+(link||"")+'<ul class="lib-l">'+docs.map(item).join("")+'</ul></details>'}
function visible(f){return DOCS.filter(function(d){
 if(f.k&&d.k!==f.k)return false;
 if(f.m&&d.m.indexOf(f.m)<0)return false;
 if(f.q){var w=f.q.split(/\s+/);for(var i=0;i<w.length;i++)if(d.q.indexOf(w[i])<0)return false}
 return true})}
function results(f){var v=visible(f),active=!!(f.q||f.m||f.k),mach=v.filter(function(d){return d.k!=="c"}),chips=v.filter(function(d){return d.k==="c"}),by={},keys=[];
 mach.forEach(function(d){var k=d.pg[0]||"Other";if(!by[k]){by[k]=[];keys.push(k)}by[k].push(d)});
 keys.sort(function(a,b){return a.toLowerCase()<b.toLowerCase()?-1:1});
 var h='<p class="tn" id="lib-n" role="status">'+v.length+" of "+DOCS.length+" documents"+(active?" match.":".")+'</p>';
 if(!v.length)return h+'<p class="empty">Nothing matches. Try a shorter search, a chip number or a machine name.</p>';
 if(mach.length)h+='<h3 class="sub">Machines and systems <small>'+mach.length+'</small></h3>'+keys.map(function(k){var d0=by[k],mid=d0[0].m[0],lk=mid&&LIB.m[mid]?'<p class="tn"><a href="#/recap/'+E(mid)+'">Open the recap bench for '+E(LIB.m[mid])+'</a></p>':"";return group(k,d0,lk,active&&mach.length<=12)}).join("");
 if(chips.length)h+='<h3 class="sub">Chip datasheets <small>'+chips.length+'</small></h3>'+group("All chip datasheets",chips,"",active&&chips.length<=40);
 return h}
function view(args){var mid=(args&&args[0]||"").toLowerCase();if(mid&&!LIB.m[mid])mid="";
 var machOpts=Object.keys(LIB.m).sort(function(a,b){return LIB.m[a]<LIB.m[b]?-1:1}).map(function(k){return'<option value="'+E(k)+'"'+(k===mid?" selected":"")+'>'+E(LIB.m[k])+'</option>'}).join("");
 var kOpts='<option value="">All kinds</option>'+Object.keys(KIND).map(function(k){return'<option value="'+k+'">'+E(KIND[k][1])+'</option>'}).join("");
 app.innerHTML='<section class="lib"><p class="noprint"><a href="#/hub/read">← Read</a></p><h2>Manuals and datasheets</h2>'
  +'<p class="sp-lead">'+DOCS.length+' service manuals, schematics, install guides and chip datasheets for the machines we fix. They open from our shared Google Drive folder.</p>'
  +card()
  +'<form class="lib-f noprint" id="lib-f" role="search" aria-label="Search the library"><label>Search <input id="lib-q" type="search" placeholder="Master System, TDA1301, PS2, 1541" autocomplete="off" maxlength="60"></label> <label>Kind <select id="lib-k">'+kOpts+'</select></label> <label>Machine <select id="lib-m"><option value="">All machines</option>'+machOpts+'</select></label> <button class="btn" type="button" id="lib-r">Surprise me</button></form>'
  +'<div id="lib-res"></div>'
  +'<p class="tn"><a href="https://drive.google.com/drive/folders/'+E(LIB.f)+'" target="_blank" rel="noopener noreferrer">Open the whole shared folder</a>. Chip datasheets are in the chip makers’ words. Check your own board and part numbers before you order anything.</p></section>';
 function run(){var f={q:$("#lib-q").value.trim().toLowerCase().slice(0,60),k:$("#lib-k").value,m:$("#lib-m").value};$("#lib-res").innerHTML=results(f)}
 $("#lib-f").onsubmit=function(e){e.preventDefault()};
 $("#lib-q").oninput=run;$("#lib-k").onchange=run;$("#lib-m").onchange=function(){run();try{history.replaceState(null,"","#/library"+($("#lib-m").value?"/"+$("#lib-m").value:""))}catch(e){}};
 $("#lib-r").onclick=function(){var d=DOCS[Math.floor(Math.random()*DOCS.length)];$("#lib-q").value="";$("#lib-k").value="";$("#lib-m").value="";$("#lib-res").innerHTML=results({q:"",k:"",m:""});var el=$('a[data-u="'+d.u.replace(/"/g,"")+'"]');if(el){var g=el.closest("details");if(g)g.open=true;el.scrollIntoView({block:"center"});el.focus()}};
 run()}
function onClick(e){var a=e.target.closest&&e.target.closest("a[data-u]");if(!a)return;var u=a.getAttribute("data-u");if(!st.s[u]){st.s[u]=1;write();var li=a.closest("li");if(li){li.className+=" on";var s=$(".lib-st",li);if(s)s.textContent="✔ stamped"}
  var n=stamped(),t=DOCS.length,r=rank(n),c=$("#lib-card");if(c){$("#lib-rank").textContent=r[1];$("#lib-cardp").innerHTML="<b>"+n+"</b> of "+t+" stamped. "+E(r[2]);var b=$(".rc-bar",c);b.setAttribute("aria-valuenow",n);$("i",b).style.width=Math.round(n/t*100)+"%"}}}
function unmount(){if(app&&handlers){app.removeEventListener("click",handlers);handlers=null}}
function mount(el,args){unmount();app=el;st=load();view(args||[]);handlers=onClick;app.addEventListener("click",handlers);document.title="Manuals and datasheets | Conventional Memory"}
return{mount:mount,unmount:unmount,docs:DOCS}})();
