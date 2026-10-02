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
