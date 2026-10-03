/* Manuals and ads: curated links (docs-data.js) plus ready-made searches on the Internet Archive and the web.
   Everything opens on the other site. Nothing is copied here, because scanned manuals and magazine ads are
   still under copyright; the museum links to the copies other archives host. */
var DOCKIND={m:["Manuals","manual"],a:["Magazine and print ads","ad"],b:["Brochures and catalogs","brochure"],r:["Reviews and articles","article"]};
function docList(keys){var out=[],seen={};(keys||[]).forEach(function(k){if(typeof DOCS==="undefined"||!k||!DOCS[k])return;DOCS[k].forEach(function(d){if(!d||!d[2]||seen[d[2]])return;seen[d[2]]=1;out.push(d)})});return out}
function docQ(name,maker){var n=String(name||"").replace(/\s*\((Japan|North America|Europe|US|UK|NA|EU|JP|PAL|NTSC)\)\s*$/i,"").trim();if(maker&&n.toLowerCase().indexOf(String(maker).toLowerCase().split(/[ ,]/)[0])<0)n=maker+" "+n;return n}
function docFind(name,maker){var q=encodeURIComponent('"'+docQ(name,maker)+'"'),q2=encodeURIComponent(docQ(name,maker));
 function a(u,t,why){return'<li><a href="'+u+'" target="_blank" rel="noopener noreferrer">'+t+'</a> <small class="tn">'+why+'</small></li>'}
 return'<ul class="refs dfind">'
  +a("https://archive.org/search?query="+q2+"+manual&and%5B%5D=mediatype%3A%22texts%22","Manuals on the Internet Archive","scanned manuals and guides")
  +a("https://archive.org/search?query="+q+"&sin=TXT","Ads inside scanned magazines","full-text search of Internet Archive magazines")
  +a("https://www.google.com/search?q="+q+"+manual+filetype%3Apdf","PDF manuals on the web","a web search for PDFs")
  +a("https://www.google.com/search?q=site%3Abitsavers.org+"+q,"Bitsavers documents","vintage computer manuals and datasheets")
  +a("https://www.google.com/search?tbm=isch&q="+q+"+vintage+magazine+ad","Vintage ad images","an image search")
  +'</ul>'}
function docSec(keys,name,maker){var l=docList(keys),h="";
 ["m","a","b","r"].forEach(function(k){var g=l.filter(function(d){return d[0]===k});if(!g.length)return;
  h+='<h4 class="sub">'+DOCKIND[k][0]+'</h4><ul class="refs">'+g.map(function(d){var u=typeof safeUrl==="function"?safeUrl(d[2],"link"):"";if(!u)return"";var host=u.replace(/^https?:\/\//,"").split("/")[0].replace(/^www\./,"");return'<li><a href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">'+esc(d[1])+'</a> <small class="tn">'+esc(host)+'</small></li>'}).join("")+'</ul>'});
 return'<div class="docs"><h3 class="sub">Manuals and ads</h3>'+(h||'<p class="tn">No saved manual or ad links for this one yet.</p>')
  +'<details class="dfd"><summary>Look for more (searches on other sites)</summary>'+docFind(name,maker)+'<p class="tn">These open the other site. The museum does not host manuals or magazine scans; they are still under copyright.</p></details>'+(typeof affShelf==="function"?affShelf(name,maker,keys&&keys[0]):"")+'</div>'}

/* Manuals and technical documents from our own Drive folder, for a timeline title or a catalog item that has a machine in the library.
   The title to machine map is tiny (libmap-data.js). The document list (library-data.js) loads the first time one of these is on screen. */
var LIBKIND={s:"Service manual",d:"Schematic",g:"Guide",o:"Operating guide",c:"Datasheet"},LIBORD="sdgoc",libLoading=false;
function libIds(t){var a=Array.isArray(t)?t:[t],out=[];a.forEach(function(x){((typeof LIBMAP!=="undefined"&&LIBMAP[x])||[]).forEach(function(id){if(out.indexOf(id)<0)out.push(id)})});return out}
function libSecHtml(title){var ids=libIds(title);if(!ids.length)return"";
 return'<div class="tle-lib docs" data-ids="'+esc(ids.join(","))+'"><h4 class="sub">Manuals and technical documents</h4><p class="tn">Loading the shelf...</p></div>'}
function libFillOne(el){var ids=(el.getAttribute("data-ids")||"").split(",").filter(Boolean),h="";
 ids.forEach(function(id){var ds=LIB.d.filter(function(r){return r[5]&&r[5].split(",").indexOf(id)>=0}).sort(function(a,b){return LIBORD.indexOf(a[1])-LIBORD.indexOf(b[1])||(a[0].toLowerCase()<b[0].toLowerCase()?-1:1)});if(!ds.length)return;
  var li=function(r){return'<li><a href="https://drive.google.com/file/d/'+esc(r[3])+'/view" target="_blank" rel="noopener noreferrer"><b>'+esc(r[0])+'</b></a> <small class="tn">'+esc(LIBKIND[r[1]]||"")+', '+(r[2]>=1024?(r[2]/1024).toFixed(1)+" MB":r[2]+" KB")+'</small></li>'};
  h+=(ids.length>1?'<p class="tn"><b>'+esc(LIB.m[id]||id)+'</b></p>':"")+'<ul class="refs">'+ds.slice(0,5).map(li).join("")+'</ul>'+(ds.length>5?'<details class="rc-more"><summary>Show '+(ds.length-5)+' more</summary><ul class="refs">'+ds.slice(5).map(li).join("")+'</ul></details>':"")
   +'<p class="tn"><a href="#/library/'+esc(id)+'">All '+ds.length+' for '+esc(LIB.m[id]||id)+' in the library</a></p>'});
 el.setAttribute("data-d","1");
 el.innerHTML='<h4 class="sub">Manuals and technical documents</h4>'+(h?h+'<p class="tn">Shared from our own Google Drive folder. Check your own board and part numbers against them.</p>':'<p class="tn">No documents matched yet.</p>')}
function libFill(){var els=document.querySelectorAll(".tle-lib:not([data-d])");if(!els.length)return;
 function go(){Array.prototype.forEach.call(document.querySelectorAll(".tle-lib:not([data-d])"),libFillOne)}
 if(typeof LIB!=="undefined"){go();return}
 if(libLoading)return;libLoading=true;var sc=document.createElement("script");sc.src="library-data.js";sc.onload=function(){libLoading=false;go()};sc.onerror=function(){libLoading=false;Array.prototype.forEach.call(document.querySelectorAll(".tle-lib:not([data-d])"),function(e){e.setAttribute("data-d","1");e.innerHTML='<h4 class="sub">Manuals and technical documents</h4><p class="tn"><a href="#/library">Open the library</a></p>'})};document.head.appendChild(sc)}
(function(){if(typeof MutationObserver==="undefined"||typeof document==="undefined")return;var q=false;function go(){q=false;libFill()}
 function start(){var o=new MutationObserver(function(){if(!q){q=true;(window.requestAnimationFrame||setTimeout)(go)}});o.observe(document.body,{childList:true,subtree:true});libFill()}
 if(document.body)start();else document.addEventListener("DOMContentLoaded",start)})();
