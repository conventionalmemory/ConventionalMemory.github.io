/* palette.js: the search box that finds everything. Press / or Ctrl+K (Cmd+K on a Mac), or tap the Search tab.
   One list: pages and features, exhibits in the museum, and timeline entries. Connie points the way. */
(function(){
var P=null,input,list,box,last=null,sel=-1,rows=[];
function E(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function ic(n,s){try{return typeof px==="function"?px(n||"chip",s):""}catch(e){return""}}
function connie(){try{if(window.CMCast)return CMCast.svg("connie",40,{mood:"wink"})}catch(e){}return ic("smile",28)}
var HELLO=["Where to?","Looking for something?","Type a word and I will point.","Ask away. I know every shelf."],TRY=["kiosk","Voodoo","Doom","jukebox","Commodore","modem","1995","books"];
function words(q){return String(q||"").toLowerCase().replace(/[^a-z0-9. +#'-]+/g," ").split(/\s+/).filter(Boolean)}
function rank(name,hay,w,q){var n=name.toLowerCase();if(!w.every(function(x){return hay.indexOf(x)>=0}))return 0;if(n===q)return 100;if(n.indexOf(q)===0)return 80;if((" "+n).indexOf(" "+q)>=0)return 60;return 40}
function search(q){var w=words(q),qq=w.join(" "),out=[];if(!w.length)return out;
 if(typeof findPages==="function")findPages(qq,4).forEach(function(x){out.push({k:"Pages",t:x.t,d:x.d,h:x.h,i:x.i||"flag",s:200})});
 var it=[];if(typeof ITEMS!=="undefined")ITEMS.forEach(function(x){var hay=[x.name,x.maker,x.model,(x.tags||[]).join(" "),x.year].join(" ").toLowerCase(),s=rank(x.name||"",hay,w,qq);if(s)it.push({k:"Exhibits",t:x.name,d:[x.maker,x.year].filter(Boolean).join(", "),h:"#/item/"+x.id,i:"box",s:s})});
 it.sort(function(a,b){return b.s-a.s}).slice(0,4).forEach(function(x){out.push(x)});
 var tl=[];if(typeof TL!=="undefined")TL.forEach(function(r){var x=(typeof TLX!=="undefined"&&TLX[r[2]])||{},hay=[r[2],x.maker,r[0]].join(" ").toLowerCase(),s=rank(String(r[2]),hay,w,qq);if(s)tl.push({k:"Timeline",t:String(r[2]),d:String(r[0]).slice(0,4)+(x.maker?", "+x.maker:""),h:"#/timeline/"+String(r[0]).slice(0,4)+"/"+encodeURIComponent(r[2]),i:r[1]==="bk"?"book":"clock",s:s})});
 tl.sort(function(a,b){return b.s-a.s}).slice(0,6).forEach(function(x){out.push(x)});
 return out}
function recents(){try{if(window.CMRecent)return CMRecent.list().slice(0,6).map(function(r){return{k:"Recently viewed",t:r.t,d:"",h:r.h,i:"clock"}})}catch(e){}return[]}
function paint(q){var h="",k="",n=0;rows=q&&words(q).length?search(q):recents();
 rows.forEach(function(r){if(r.k!==k){k=r.k;h+='<li class="pal-h" role="presentation">'+E(k)+'</li>'}h+='<li role="presentation"><a role="option" id="pal-o'+n+'" class="pal-r" href="'+E(r.h)+'" data-i="'+n+'"><i>'+ic(r.i,22)+'</i><b>'+E(r.t)+'</b>'+(r.d?'<small>'+E(r.d)+'</small>':"")+'</a></li>';n++});
 if(q&&words(q).length){h+='<li role="presentation"><a role="option" id="pal-o'+n+'" class="pal-r pal-all" href="#/search/'+encodeURIComponent(q)+'" data-i="'+n+'"><i>'+ic("bulb",22)+'</i><b>See every result for &ldquo;'+E(q)+'&rdquo;</b></a></li>';rows.push({h:"#/search/"+encodeURIComponent(q)});n++}
 if(!rows.length||(q&&n===1)){h='<li class="pal-none" role="presentation">'+(q?'Hmm, I could not find &ldquo;'+E(q)+'&rdquo;. Try fewer letters, or open <a href="#/more">All pages</a>.':'Try: '+TRY.slice(0,5).map(function(t){return'<a href="#/search/'+encodeURIComponent(t)+'">'+E(t)+'</a>'}).join(", "))+'</li>'+h}
 list.innerHTML=h;sel=-1;if(n)pick(0)}
function pick(i){var a=list.querySelectorAll(".pal-r");if(!a.length)return;sel=(i+a.length)%a.length;a.forEach(function(x,j){x.setAttribute("aria-selected",j===sel?"true":"false");x.classList.toggle("on",j===sel)});input.setAttribute("aria-activedescendant",a[sel].id);a[sel].scrollIntoView({block:"nearest"})}
function build(){P=document.createElement("div");P.id="pal";P.className="pal";P.hidden=true;
 P.innerHTML='<div class="pal-bg" data-x="1"></div><div class="pal-box" role="dialog" aria-modal="true" aria-label="Search the museum"><div class="pal-top"><span class="pal-c"></span><span class="pal-q"></span><button type="button" class="pal-x" data-x="1" aria-label="Close search">Esc</button></div><input id="pal-in" type="search" autocomplete="off" autocapitalize="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="pal-ls" aria-label="Search pages, exhibits and the timeline" placeholder="Search pages, exhibits, the timeline..."><ul id="pal-ls" class="pal-ls" role="listbox" aria-label="Results"></ul><p class="pal-f">Up and down to move, Enter to go, Esc to close</p></div>';
 document.body.appendChild(P);input=P.querySelector("#pal-in");list=P.querySelector("#pal-ls");box=P.querySelector(".pal-box");
 input.addEventListener("input",function(){paint(input.value)});
 input.addEventListener("keydown",function(e){if(e.key==="ArrowDown"){e.preventDefault();pick(sel+1)}else if(e.key==="ArrowUp"){e.preventDefault();pick(sel-1)}else if(e.key==="Enter"){var a=list.querySelectorAll(".pal-r")[sel];if(a){e.preventDefault();go(a.getAttribute("href"))}else if(input.value.trim()){e.preventDefault();go("#/search/"+encodeURIComponent(input.value.trim()))}}else if(e.key==="Tab"){e.preventDefault();pick(sel+(e.shiftKey?-1:1))}});
 P.addEventListener("click",function(e){if(e.target.closest("[data-x]")){close();return}var a=e.target.closest("a");if(a){e.preventDefault();go(a.getAttribute("href"))}});
 list.addEventListener("mousemove",function(e){var a=e.target.closest(".pal-r");if(a&&+a.dataset.i!==sel)pick(+a.dataset.i)});
 document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!P.hidden){e.preventDefault();close()}},true)}
function go(h){close();if(/^#\//.test(h))location.hash=h;else location.href=h}
function open(pre){if(!P)build();var q=typeof pre==="string"?pre:"";last=document.activeElement;P.hidden=false;document.documentElement.classList.add("pal-on");
 P.querySelector(".pal-c").innerHTML=connie();P.querySelector(".pal-q").textContent=HELLO[Math.floor(Math.random()*HELLO.length)];input.value=q;paint(q);input.focus();input.select()}
function close(){if(!P||P.hidden)return;P.hidden=true;document.documentElement.classList.remove("pal-on");try{if(last&&last.focus)last.focus()}catch(e){}}
window.CMPal={open:open,close:close,search:search};
document.addEventListener("keydown",function(e){var t=e.target||{},typing=/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable;
 if((e.key==="k"||e.key==="K")&&(e.ctrlKey||e.metaKey)&&!e.altKey){e.preventDefault();open();return}
 if(e.key==="/"&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!typing){if(/^#\/catalog/.test(location.hash)&&document.getElementById("q"))return;e.preventDefault();open()}});
})();
