/* menu.js: the top menu. Every section gets an icon and a drop-down that lists its pages (read from pages.js, so a new
   page added there shows up here by itself). On a phone, tapping a section opens its list; on a computer, point at it or
   press the little arrow. The label itself still goes to the section page. */
(function(){
var nav=document.querySelector("header.top nav"),hd=document.querySelector("header.top");if(!nav||!hd||typeof SITE==="undefined")return;
function E(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function ic(n,s){try{if(n==="connie"&&window.CMCast)return CMCast.svg("connie",s+4,{});return typeof px==="function"?px(n,s):""}catch(e){return""}}
var ICON={catalog:"box",timeline:"clock",explore:"globe",read:"book",play:"gamepad",connie:"connie",stuff:"floppy",community:"smile",search:"bulb"};
var HERE={};SITE.forEach(function(g){g.i.forEach(function(x){if(x[0]!=="--")HERE[x[0]]=x})});
function pick(){var o=[];for(var i=0;i<arguments.length;i++){var x=HERE[arguments[i]];if(x)o.push(x)}return o}
/* the sections: id -> {title, blurb, link, groups:[[label,[tiles]]]}. Catalog, Timeline and Search go straight to their page. */
var P={};
SITE.forEach(function(g){var gs=[],cur=null;g.i.forEach(function(x){if(x[0]==="--"){cur=[x[1],[]];gs.push(cur)}else{if(!cur){cur=["",[]];gs.push(cur)}cur[1].push(x)}});P[g.id]={t:g.t,d:g.d,l:"#/hub/"+g.id,g:gs}});
var open=null,btnOf={},panel=document.createElement("div"),tm=0,NARROW=window.matchMedia?matchMedia("(max-width:899px),(hover:none)"):{matches:false};
panel.id="mnp";panel.className="mnp";panel.hidden=true;hd.appendChild(panel);
function motion(){return document.documentElement.getAttribute("data-motion")!=="off"}
function html(id){var s=P[id],h='<div class="mnp-h"><b>'+E(s.t)+'</b><span>'+E(s.d)+'</span></div><div class="mnp-c">',n=0;
 s.g.forEach(function(g){h+='<div class="mnp-g">'+(g[0]?'<h4>'+E(g[0])+'</h4>':'');g[1].forEach(function(x){h+='<a class="mnp-i" href="'+E(x[0])+'" style="--d:'+Math.min(n++,14)*22+'ms"><i>'+ic(x[3],22)+'</i><b>'+E(x[1])+'</b><small>'+E(x[2])+'</small></a>'});h+='</div>'});
 return h+'</div><div class="mnp-f"><a href="'+E(s.l)+'">'+"See all of "+E(s.t)+' &rarr;</a><a href="#/more">&#9776; All pages</a></div>'}
function place(a){var r=a.getBoundingClientRect(),vw=document.documentElement.clientWidth,w=Math.min(vw-16,open==="explore"||open==="play"?640:520),nb=nav.getBoundingClientRect(),top=Math.round(nb.bottom+2);
 var l=NARROW.matches?8:Math.max(8,Math.min(r.left,vw-w-8));panel.style.cssText="top:"+top+"px;left:"+Math.round(l)+"px;width:"+Math.round(NARROW.matches?vw-16:w)+"px;max-height:"+Math.max(160,window.innerHeight-top-14)+"px"}
function show(id,a){clearTimeout(tm);if(open===id&&!panel.hidden)return;open=id;panel.innerHTML=html(id);panel.setAttribute("aria-label",P[id].t+" menu");panel.dataset.s=id;place(a);panel.hidden=false;
 panel.classList.remove("on");void panel.offsetWidth;panel.classList.add("on");mark(id)}
function mark(id){var b;for(b in btnOf){btnOf[b].setAttribute("aria-expanded",b===id?"true":"false");btnOf[b].classList.toggle("on",b===id)}nav.querySelectorAll("a[data-s]").forEach(function(a){a.classList.toggle("mn-open",a.dataset.s===id)})}
function hide(back){clearTimeout(tm);if(panel.hidden)return;panel.hidden=true;panel.classList.remove("on");var was=open;open=null;mark("");if(back&&btnOf[was])btnOf[was].focus()}
function later(){clearTimeout(tm);tm=setTimeout(hide,260)}
nav.querySelectorAll("a[data-s]").forEach(function(a){var id=a.dataset.s;if(!ICON[id])return;
 var tx=document.createElement("span");tx.className="mn-t";while(a.firstChild)tx.appendChild(a.firstChild);a.appendChild(tx);
 var i=document.createElement("i");i.className="mn-i";i.innerHTML=ic(ICON[id],16);a.insertBefore(i,a.firstChild);
 if(id==="connie")a.setAttribute("href","#/hub/connie");
 if(!P[id])return;
 var b=document.createElement("button");b.type="button";b.className="mn-c";b.setAttribute("aria-label",P[id].t+" menu");b.setAttribute("aria-expanded","false");b.setAttribute("aria-controls","mnp");b.innerHTML="<span></span>";a.after(b);btnOf[id]=b;a.dataset.mn=b.dataset.mn="1";
 b.addEventListener("click",function(){if(open===id&&!panel.hidden)hide();else{show(id,a);var f=panel.querySelector("a");if(f&&!NARROW.matches)f.focus()}});
 a.addEventListener("click",function(e){if(NARROW.matches){e.preventDefault();if(open===id&&!panel.hidden)hide();else show(id,a)}else hide()});
 function over(){if(NARROW.matches||!window.matchMedia||!matchMedia("(hover:hover)").matches)return;clearTimeout(tm);tm=setTimeout(function(){show(id,a)},open&&!panel.hidden?0:110)}
 [a,b].forEach(function(el){el.addEventListener("mouseenter",over);el.addEventListener("mouseleave",later)});
 a.addEventListener("keydown",function(e){if(e.key==="ArrowDown"&&!NARROW.matches){e.preventDefault();show(id,a);var f=panel.querySelector("a");if(f)f.focus()}})});
/* a link in the panel: shut it, go there */
panel.addEventListener("click",function(e){if(e.target.closest("a"))hide()});
panel.addEventListener("mouseenter",function(){clearTimeout(tm)});panel.addEventListener("mouseleave",later);
panel.addEventListener("keydown",function(e){var L=[].slice.call(panel.querySelectorAll("a")),i=L.indexOf(document.activeElement);
 if(e.key==="Escape"){hide(true)}else if(e.key==="ArrowDown"||e.key==="ArrowRight"){e.preventDefault();L[(i+1)%L.length].focus()}else if(e.key==="ArrowUp"||e.key==="ArrowLeft"){e.preventDefault();L[(i-1+L.length)%L.length].focus()}});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!panel.hidden)hide(true)});
document.addEventListener("click",function(e){if(!panel.hidden&&!e.target.closest("#mnp")&&!e.target.closest("header.top nav"))hide()});
document.addEventListener("focusin",function(e){if(!panel.hidden&&!e.target.closest("#mnp")&&!e.target.closest("header.top nav"))hide()});
window.addEventListener("hashchange",function(){hide()});window.addEventListener("resize",function(){hide()});window.addEventListener("scroll",function(){if(!panel.hidden&&NARROW.matches)hide()},{passive:true});
/* the All pages button, top right */
var ap=document.getElementById("allp");if(!ap){var u=hd.querySelector(".utl");if(u){ap=document.createElement("a");ap.id="allp";ap.className="btn";ap.href="#/more";ap.textContent="All pages";u.insertBefore(ap,u.firstChild)}}
if(ap){var sp=document.createElement("span");sp.className="ap-i";sp.innerHTML=ic("folder",16);ap.insertBefore(sp,ap.firstChild);ap.insertBefore(document.createTextNode(" "),ap.childNodes[1])}
})();
