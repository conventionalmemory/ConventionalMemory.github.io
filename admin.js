/* Admin page for ConventionalMemory.io  (#/admin)
   There is no server behind this site, so GitHub is the login. You paste a fine-grained
   personal access token that can only touch this one repository. GitHub checks it on every
   request, so only the token holder can save changes. Changes are saved as commits to items.js
   (and photos/), and GitHub Pages republishes the site a minute or two later.
   The token is kept in memory only (or in this tab's sessionStorage if you tick the box). */
(function(){
"use strict";
var C,host=null,tok=null,S=null,view="list",editing=null,q="",note=null,idle=0,busy=false;
var API="https://api.github.com",FILE="items.js",TKEY="cm-gh-token";
var HEAD="// Museum items. This file is rewritten by the Admin page (#/admin), so edit items there.\n// You can also edit it by hand: keep it valid JSON after \"var ITEMS=\".\n";
var CORE=[["name","Name",1],["maker","Maker or publisher"],["year","Release year (number)"],["rel","Release date: YYYY, YYYY-MM or YYYY-MM-DD"],["msrp","Original MSRP"],["cat","Category (for example Laptops)"],["model","Model"],["partno","Part number"],["rev","Revision"],["upc","UPC or barcode"],["disc","Discontinued (year)"],["made","Manufactured (date code)"],["country","Country of origin"],["cond","Condition"],["works","Working status (Working, Partly working, Untested, Not working)"],["status","Status (Display, Storage, Repair, Loaned, Sold)"],["qty","Quantity"],["acquired","Acquired (date)"],["got","Where I got it"],["score","Score, 0 to 640"]];
var LONG=[["text","Description"],["thoughts","My take"],["notes","Repairs, mods and history of this unit"]];
var LISTS=[["has","Includes (comma separated)"],["tags","Tags (comma separated)"]];
function esc(s){return C.esc(s)}
function clone(o){return JSON.parse(JSON.stringify(o))}
function b64enc(str){var b=new TextEncoder().encode(str),s="";for(var i=0;i<b.length;i+=0x8000)s+=String.fromCharCode.apply(null,b.subarray(i,i+0x8000));return btoa(s)}
function slug(s){return String(s).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
function serialize(items){return HEAD+"var ITEMS="+JSON.stringify(items,null,1)+";\n"}
function parseItems(text){var m=/^var ITEMS=/m.exec(text);if(!m)throw new Error("items.js does not contain a line starting var ITEMS=");var i=m.index;var j=text.lastIndexOf("];");if(j<0)throw new Error("items.js does not end with ];");var v=JSON.parse(text.slice(i+10,j+1));if(!Array.isArray(v))throw new Error("ITEMS is not a list");return v}

/* ---------- GitHub ---------- */
function gh(path,o){o=o||{};var h={"Accept":o.accept||"application/vnd.github+json","Authorization":"Bearer "+tok,"X-GitHub-Api-Version":"2022-11-28"};if(o.body)h["Content-Type"]="application/json";
 return fetch(API+path,{method:o.method||"GET",headers:h,body:o.body?JSON.stringify(o.body):undefined,cache:"no-store",credentials:"omit",referrerPolicy:"no-referrer"}).then(function(r){
  if(o.text)return r.text().then(function(t){return{ok:r.ok,status:r.status,text:t}});
  return r.json().then(function(j){return{ok:r.ok,status:r.status,json:j}},function(){return{ok:r.ok,status:r.status,json:{}}})})}
function repo(){return"/repos/"+encodeURIComponent(C.REPO.owner)+"/"+encodeURIComponent(C.REPO.repo)}
function errText(r){var m=r&&r.json&&r.json.message?r.json.message:"";if(r.status===401)return"GitHub rejected that token (401). Check that you pasted the whole token and that it has not expired.";if(r.status===403)return"GitHub refused the request (403). "+m;if(r.status===404)return"GitHub could not find the repository, or the token has no access to it (404).";if(r.status===409||r.status===422)return"The file on GitHub changed since you unlocked. Lock and unlock to reload it. "+m;return"GitHub error "+r.status+". "+m}
function unlock(token,remember){tok=token.trim();busy=true;render();
 if(!/^[A-Za-z0-9_]{20,255}$/.test(tok)){tok=null;busy=false;note={t:"err",m:"That does not look like a GitHub token. It starts with github_pat_ (fine-grained) or ghp_ (classic)."};render();return}
 gh(repo()).then(function(r){
  if(!r.ok)throw new Error(errText(r));
  if(r.json.permissions&&r.json.permissions.push===false)throw new Error("This token can read the repository but not write to it. Give it Contents: Read and write.");
  return gh(repo()+"/contents/"+FILE+"?ref="+encodeURIComponent(C.REPO.branch)).then(function(m){
   if(m.status===404)return{sha:null,items:clone(C.ITEMS),created:true};
   if(!m.ok)throw new Error(errText(m));
   return gh(repo()+"/contents/"+FILE+"?ref="+encodeURIComponent(C.REPO.branch),{accept:"application/vnd.github.raw+json",text:true}).then(function(t){
    if(!t.ok)throw new Error(errText(t));return{sha:m.json.sha,items:parseItems(t.text)}})})
 }).then(function(d){S={sha:d.sha,items:d.items,dirty:!!d.created,photos:[],created:!!d.created};
   if(remember){try{sessionStorage.setItem(TKEY,tok)}catch(e){}}
   note=d.created?{t:"ok",m:"Unlocked. items.js is not in the repository yet, so the current page's items are loaded. Save to GitHub to create it."}:{t:"ok",m:"Unlocked. Loaded "+S.items.length+" items from GitHub."};
   view="list";bump()
 }).catch(function(e){tok=null;S=null;note={t:"err",m:String(e.message||e)}}).then(function(){busy=false;render()})}
function lock(m){tok=null;S=null;editing=null;view="list";clearTimeout(idle);try{sessionStorage.removeItem(TKEY)}catch(e){}note=m?{t:"ok",m:m}:null;render()}
function bump(){clearTimeout(idle);if(tok)idle=setTimeout(function(){if(S&&S.dirty){bump();return}lock("Locked after 20 minutes of no activity.")},20*60*1000)}
function save(){if(!S||busy)return;busy=true;note={t:"ok",m:"Saving to GitHub..."};render();
 var chain=Promise.resolve();
 S.photos.forEach(function(p){chain=chain.then(function(){return gh(repo()+"/contents/"+p.path,{method:"PUT",body:{message:"Admin: add photo "+p.path,content:p.b64,branch:C.REPO.branch}}).then(function(r){if(!r.ok&&r.status!==422)throw new Error(errText(r))})})});
 chain.then(function(){var body={message:"Admin: update catalog ("+S.items.length+" items)",content:b64enc(serialize(S.items)),branch:C.REPO.branch};if(S.sha)body.sha=S.sha;return gh(repo()+"/contents/"+FILE,{method:"PUT",body:body})})
 .then(function(r){if(!r.ok)throw new Error(errText(r));S.sha=r.json.content.sha;S.dirty=false;S.photos=[];S.created=false;
   C.ITEMS.length=0;S.items.forEach(function(i){C.ITEMS.push(clone(i))});C.prep();
   note={t:"ok",m:"Saved. The public site updates in a minute or two. Refresh it then to see the change."}})
 .catch(function(e){note={t:"err",m:String(e.message||e)}}).then(function(){busy=false;render()})}

/* ---------- views ---------- */
function shell(inner){return'<section class="adm bld"><h2>Admin</h2>'+(note?'<div class="msg '+note.t+'" role="status">'+esc(note.m)+'</div>':"")+inner+'</section>'}
function lockedView(){return shell('<p>Sign in with GitHub to add, edit or remove museum items. There is no separate password: GitHub is the login, so only someone holding a token for this repository can change the site.</p>'
 +'<h3 class="sub">One-time setup</h3><ol><li>On GitHub open <b>Settings &gt; Developer settings &gt; Personal access tokens &gt; Fine-grained tokens &gt; Generate new token</b>.</li><li>Under <b>Repository access</b> choose <b>Only select repositories</b> and pick <b>'+esc(C.REPO.owner+"/"+C.REPO.repo)+'</b>.</li><li>Under <b>Permissions &gt; Repository permissions</b> set <b>Contents</b> to <b>Read and write</b>. Nothing else.</li><li>Set an expiry (90 days is a good choice), generate it and copy it.</li></ol>'
 +'<label for="tk">Token</label><input id="tk" type="password" autocomplete="off" spellcheck="false" placeholder="github_pat_...">'
 +'<label><input type="checkbox" id="rm" style="width:auto;display:inline"> Stay unlocked in this browser tab until I close it</label>'
 +'<p><button class="btn pri" id="go" type="button"'+(busy?" disabled":"")+'>'+(busy?"Checking...":"Unlock")+'</button></p>'
 +'<p class="tn">The token stays in this page only. It is sent to api.github.com and nowhere else, and it is forgotten when you lock, close the tab or leave the page idle for 20 minutes.</p>')}
function listView(){var items=S.items,ql=q.toLowerCase(),vis=items.map(function(it,i){return{it:it,i:i}}).filter(function(x){return!ql||(x.it.name+" "+(x.it.maker||"")+" "+x.it.id+" "+(x.it.cat||"")).toLowerCase().indexOf(ql)>=0});
 return shell('<p>Signed in to <b>'+esc(C.REPO.owner+"/"+C.REPO.repo)+'</b>, branch '+esc(C.REPO.branch)+'. '+items.length+' items. '+(S.dirty?'<span class="tag want">Unsaved changes</span>':'<span class="tag">Saved</span>')+(S.photos.length?' <span class="tag">'+S.photos.length+' photo(s) waiting</span>':"")+'</p>'
 +'<p><button class="btn pri" id="add" type="button">Add item</button> <button class="btn'+(S.dirty?' pri':'')+'" id="sv" type="button"'+(busy||!S.dirty&&!S.photos.length?" disabled":"")+'>Save to GitHub</button> <button class="btn" id="dl" type="button">Download items.js backup</button> <button class="btn" id="lk" type="button">Lock</button></p>'
 +'<div class="tools"><input id="aq" type="search" placeholder="Search items" aria-label="Search items" value="'+esc(q)+'"></div>'
 +(vis.length?vis.map(function(x){return'<div class="row"><span><b>'+esc(x.it.name)+'</b> <small class="tn">'+esc(x.it.maker||"")+', '+esc(x.it.rel||x.it.year||"")+', id '+esc(x.it.id)+'</small></span><button class="btn" data-e="'+x.i+'" type="button">Edit</button> <button class="btn danger" data-d="'+x.i+'" type="button">Delete</button></div>'}).join(""):'<p class="empty">No items match.</p>')
 +'<p class="tn">Changes are only saved when you press Save to GitHub. Deleting an item does not delete its photo files from the repository.</p>')}
function field(id,label,val,extra){return'<div class="fld"><label for="'+id+'">'+esc(label)+'</label><input id="'+id+'" value="'+esc(val==null?"":val)+'" '+(extra||"")+'></div>'}
function area(id,label,val,h){return'<label for="'+id+'">'+esc(label)+'</label><textarea id="'+id+'" style="min-height:'+(h||80)+'px">'+esc(val||"")+'</textarea>'}
function editView(){var it=editing.it,isNew=editing.i<0,ty=it.type||"Other",sp=it.specs||{};
 var g=C.SPEC_TYPES[ty]||{},known={},specs="";
 Object.keys(g).forEach(function(k){specs+='<h3 class="sub">'+esc(k)+'</h3><div class="two">'+g[k].map(function(f){known[f]=1;return field("sp_"+slug(f),f,sp[f],'data-k="'+esc(f)+'"')}).join("")+'</div>'});
 var other=Object.keys(sp).filter(function(k){return!known[k]}).map(function(k){return k+" | "+sp[k]}).join("\n");
 var ex=(it.extras||[]).map(function(x){return x.n+" | "+(x.s||"Have")+(x.note?" | "+x.note:"")}).join("\n");
 var lg=(it.log||[]).map(function(x){return x.d+" | "+(x.t||"Note")+" | "+(x.n||"")}).join("\n");
 var ph=(it.photos||[]);
 return shell('<p><button class="btn" id="bk" type="button">Back to the list</button></p><h3 class="sub">'+(isNew?"Add an item":"Edit "+esc(it.name))+'</h3>'
 +'<label for="ty">Type</label><select id="ty">'+Object.keys(C.SPEC_TYPES).map(function(k){return'<option'+(k===ty?" selected":"")+'>'+esc(k)+'</option>'}).join("")+'</select>'
 +'<fieldset><legend>Basics</legend><div class="two">'+CORE.map(function(f){return field("f_"+f[0],f[1],it[f[0]],f[2]?"required":"")}).join("")+field("f_id","Web address name (id). Lowercase letters, numbers and dashes",it.id||"",isNew?"":"readonly")+'</div>'
 +LISTS.map(function(f){return field("f_"+f[0],f[1],(it[f[0]]||[]).join(", "))}).join("")+LONG.map(function(f){return area("f_"+f[0],f[1],it[f[0]])}).join("")
 +'<label><input type="checkbox" id="f_relx" style="width:auto;display:inline"'+(it.relx?" checked":"")+'> The release date is unconfirmed (shows an asterisk)</label>'
 +'<label><input type="checkbox" id="f_sample" style="width:auto;display:inline"'+(it.sample?" checked":"")+'> This is a sample entry</label></fieldset>'
 +'<fieldset><legend>Specs</legend>'+(specs||'<p>No spec template for this type.</p>')+area("f_other","Other specs, one per line: Label | Value",other,60)+'</fieldset>'
 +'<fieldset><legend>Photos</legend><div class="thumbs">'+ph.map(function(p,i){var u=C.safeUrl(p,"img");return'<figure>'+(u?'<img src="'+esc(u)+'" alt="">':'')+'<figcaption>'+esc(String(p).slice(0,40))+'</figcaption><button class="btn danger" data-rp="'+i+'" type="button">Remove</button></figure>'}).join("")
  +editing.newPhotos.map(function(p,i){return'<figure><img src="'+esc(p.data)+'" alt=""><figcaption>new: '+esc(p.path.replace("photos/",""))+'</figcaption><button class="btn danger" data-rn="'+i+'" type="button">Remove</button></figure>'}).join("")+'</div>'
  +'<label for="pf">Add photos (they are shrunk to 1600 pixels and saved as JPEG in the photos folder)</label><input id="pf" type="file" accept="image/*" multiple>'
  +field("pu","Or add a photo by web address (https)","")+'<p><button class="btn" id="pua" type="button">Add that address</button></p>'
  +field("f_credit","Photo credit",it.credit)+'</fieldset>'
 +'<fieldset><legend>Links and media</legend>'+area("f_videos","Videos, one per line: Title | https address",(it.videos||[]).map(function(v){return v.t+" | "+v.u}).join("\n"),60)+area("f_links","Manuals and references, one per line: Title | https address",(it.links||[]).map(function(v){return v.t+" | "+v.u}).join("\n"),60)
 +field("f_wiki","Wikipedia address",it.wiki&&it.wiki.u||"")+area("f_wsum","Wikipedia summary (optional, CC BY-SA text)",it.wiki&&it.wiki.summary||"",60)+'</fieldset>'
 +'<fieldset><legend>Accessories and changelog</legend><p class="tn">Ideas: '+esc((C.ACC_HINTS[ty]||[]).join(", "))+'</p>'+area("f_extras","Accessories, one per line: Name | Have, Want, Missing or Optional | note",ex,90)+area("f_log","Changelog, one per line: YYYY-MM-DD | Type | what changed. Types: "+C.LOGTYPES.join(", "),lg,90)+'</fieldset>'
 +'<p><button class="btn pri" id="ok" type="button">'+(isNew?"Add to the catalog":"Apply changes")+'</button> <button class="btn" id="cx" type="button">Cancel</button></p><p class="tn">This applies the change here. Press Save to GitHub on the list page to publish it.</p><div id="ferr"></div>')}
function render(){if(!host)return;host.innerHTML=!tok||!S?lockedView():view==="edit"?editView():listView();wire()}
function $(id){return host.querySelector("#"+id)}
function val(id){var e=$(id);return e?e.value.trim():""}
function pairs(text,kind){var out=[],bad=null;text.split("\n").forEach(function(l,n){l=l.trim();if(!l)return;var p=l.split("|").map(function(x){return x.trim()});
 if(kind==="url"){var u=C.safeUrl(p[1],"link");if(!p[0]||!/^https?:/i.test(u)){bad="Line "+(n+1)+": use Title | https address";return}out.push({t:p[0],u:u})}
 else if(kind==="extra"){if(!p[0])return;var st=C.EXST.filter(function(k){return k.toLowerCase()===(p[1]||"").toLowerCase()})[0]||"Have",r={n:p[0],s:st};if(p[2])r.note=p[2];out.push(r)}
 else if(kind==="log"){if(!/^\d{4}-\d\d-\d\d$/.test(p[0]||"")){bad="Changelog line "+(n+1)+": start with a date like 2026-09-30";return}out.push({d:p[0],t:C.LOGTYPES.filter(function(k){return k.toLowerCase()===(p[1]||"").toLowerCase()})[0]||"Note",n:p.slice(2).join(" | ")})}
 else if(kind==="spec"){if(p[0]&&p[1])out.push([p[0],p.slice(1).join(" | ")])}});
 return{list:out,bad:bad}}
function collect(){var o=clone(editing.it),err=[],num=function(id,lo,hi,label){var v=val(id);if(!v){return null}var n=Number(v);if(!isFinite(n)||n<lo||n>hi){err.push(label+" must be a number from "+lo+" to "+hi);return null}return n};
 o.type=val("ty")||"Other";
 CORE.forEach(function(f){var k=f[0];if(k==="year"||k==="score"||k==="qty"||k==="disc")return;var v=val("f_"+k);if(v)o[k]=v;else delete o[k]});
 var y=num("f_year",1900,2100,"Release year");if(y!=null)o.year=y;else delete o.year;
 var sc=num("f_score",0,640,"Score");if(sc!=null)o.score=sc;else delete o.score;
 var qt=num("f_qty",0,100000,"Quantity");if(qt!=null)o.qty=qt;else delete o.qty;
 var dc=num("f_disc",1900,2100,"Discontinued year");if(dc!=null)o.disc=dc;else delete o.disc;
 if(o.rel&&!/^\d{4}(-\d\d(-\d\d)?)?$/.test(o.rel))err.push("Release date must look like 1998, 1998-11 or 1998-11-03");
 if(!o.year&&o.rel&&/^\d{4}/.test(o.rel))o.year=+o.rel.slice(0,4);
 if(!o.name)err.push("Name is required");
 var id=editing.i<0?slug(val("f_id")||o.name||""):editing.it.id;if(!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id))err.push("The id needs lowercase letters, numbers and dashes");
 if(S.items.some(function(x,i){return x.id===id&&i!==editing.i}))err.push("Another item already uses the id "+id);
 o.id=id;
 LISTS.forEach(function(f){var l=val("f_"+f[0]).split(",").map(function(t){return t.trim()}).filter(Boolean);if(l.length)o[f[0]]=l;else delete o[f[0]]});
 LONG.forEach(function(f){var v=host.querySelector("#f_"+f[0]).value.trim();if(v)o[f[0]]=v;else delete o[f[0]]});
 var cr=val("f_credit");if(cr)o.credit=cr;else delete o.credit;
 if(host.querySelector("#f_relx").checked)o.relx=true;else delete o.relx;
 if(host.querySelector("#f_sample").checked)o.sample=true;else delete o.sample;
 var sp={};host.querySelectorAll("input[data-k]").forEach(function(i){if(i.value.trim())sp[i.dataset.k]=i.value.trim()});
 pairs(host.querySelector("#f_other").value,"spec").list.forEach(function(p){sp[p[0]]=p[1]});if(Object.keys(sp).length)o.specs=sp;else delete o.specs;
 var v=pairs(host.querySelector("#f_videos").value,"url");if(v.bad)err.push(v.bad);o.videos=v.list;
 var l=pairs(host.querySelector("#f_links").value,"url");if(l.bad)err.push(l.bad);if(l.list.length)o.links=l.list;else delete o.links;
 var w=val("f_wiki");if(w){var wu=C.safeUrl(w,"link");if(!/^https?:/i.test(wu))err.push("The Wikipedia address must start with https://");else o.wiki={t:decodeURIComponent(wu.split("/").pop()||"").replace(/_/g," ")||"Wikipedia",u:wu,summary:host.querySelector("#f_wsum").value.trim()}}else delete o.wiki;
 var ex=pairs(host.querySelector("#f_extras").value,"extra");if(ex.list.length)o.extras=ex.list;else delete o.extras;
 var lg=pairs(host.querySelector("#f_log").value,"log");if(lg.bad)err.push(lg.bad);if(lg.list.length)o.log=lg.list;else delete o.log;
 o.photos=(editing.it.photos||[]).slice().concat(editing.newPhotos.map(function(p){return p.path}));o.audio=o.audio||[];
 return{o:o,err:err}}
function shrink(file){return new Promise(function(res,rej){var img=new Image(),u=URL.createObjectURL(file);img.onload=function(){var m=1600,r=Math.min(1,m/Math.max(img.width,img.height)),c=document.createElement("canvas");c.width=Math.max(1,Math.round(img.width*r));c.height=Math.max(1,Math.round(img.height*r));c.getContext("2d").drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);res(c.toDataURL("image/jpeg",.85))};img.onerror=function(){URL.revokeObjectURL(u);rej(new Error("That file is not an image the browser can read."))};img.src=u})}
function wire(){if(!host)return;host.oninput=bump;
 var g=$("go");if(g){var t=$("tk");g.onclick=function(){unlock(t.value,$("rm").checked)};t.onkeydown=function(e){if(e.key==="Enter")g.click()};if(!busy)t.focus();return}
 if(view==="edit"){
  $("ty").onchange=function(){editing.it=collectSoft();render()};
  $("bk").onclick=$("cx").onclick=function(){editing=null;view="list";render()};
  host.querySelectorAll("[data-rp]").forEach(function(b){b.onclick=function(){editing.it=collectSoft();editing.it.photos.splice(+b.dataset.rp,1);render()}});
  host.querySelectorAll("[data-rn]").forEach(function(b){b.onclick=function(){editing.it=collectSoft();editing.newPhotos.splice(+b.dataset.rn,1);render()}});
  $("pua").onclick=function(){var u=C.safeUrl(val("pu"),"img");if(!/^https:/i.test(u)){$("ferr").innerHTML='<div class="msg err">Use a web address that starts with https://</div>';return}editing.it=collectSoft();editing.it.photos=(editing.it.photos||[]).concat([u]);render()};
  $("pf").onchange=function(e){var files=Array.prototype.slice.call(e.target.files||[]);if(!files.length)return;var keep=collectSoft(),id=slug(val("f_id")||val("f_name"))||"item";
   var p=Promise.resolve();files.forEach(function(f,n){p=p.then(function(){return shrink(f).then(function(d){editing.newPhotos.push({data:d,b64:d.split(",")[1],path:"photos/"+id+"-"+Date.now().toString(36)+n+".jpg"})})})});
   p.then(function(){editing.it=keep;render()},function(er){$("ferr").innerHTML='<div class="msg err">'+esc(er.message)+'</div>'})};
  $("ok").onclick=function(){var r=collect();if(r.err.length){$("ferr").innerHTML='<div class="msg err"><b>Fix these first:</b><br>'+r.err.map(esc).join("<br>")+'</div>';return}
   if(editing.i<0)S.items.push(r.o);else S.items[editing.i]=r.o;
   editing.newPhotos.forEach(function(p){S.photos.push({path:p.path,b64:p.b64})});
   S.dirty=true;note={t:"ok",m:(editing.i<0?"Added ":"Updated ")+r.o.name+". Press Save to GitHub to publish."};editing=null;view="list";render()};
  return}
 $("lk").onclick=function(){if(S.dirty&&!confirm("You have unsaved changes. Lock anyway and lose them?"))return;lock("Locked.")};
 $("add").onclick=function(){editing={i:-1,it:{type:"Other",photos:[]},newPhotos:[]};view="edit";note=null;render()};
 $("sv").onclick=save;
 $("dl").onclick=function(){var b=new Blob([serialize(S.items)],{type:"text/javascript"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="items.js";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},2000)};
 var aq=$("aq");aq.oninput=function(){q=aq.value;var pos=aq.selectionStart;render();var n=$("aq");n.focus();try{n.setSelectionRange(pos,pos)}catch(e){}};
 host.querySelectorAll("[data-e]").forEach(function(b){b.onclick=function(){var i=+b.dataset.e;editing={i:i,it:clone(S.items[i]),newPhotos:[]};if(!editing.it.photos)editing.it.photos=[];view="edit";note=null;render();window.scrollTo(0,0)}});
 host.querySelectorAll("[data-d]").forEach(function(b){b.onclick=function(){var i=+b.dataset.d,it=S.items[i];if(!confirm('Delete "'+it.name+'" from the catalog? You can still bring it back by not saving, or from GitHub history.'))return;S.items.splice(i,1);S.dirty=true;note={t:"ok",m:"Removed "+it.name+". Press Save to GitHub to publish."};render()}})}
function collectSoft(){var r=null;try{r=collect().o}catch(e){}return r||editing.it}
function mount(el,ctx){C=ctx;host=el;if(!tok){try{var t=sessionStorage.getItem(TKEY);if(t&&!S){tok=t;unlock(t,true);return}}catch(e){}}render();bump()}
function unmount(){host=null}
window.addEventListener("beforeunload",function(e){if(S&&S.dirty){e.preventDefault();e.returnValue=""}});
window.CMAdmin={mount:mount,unmount:unmount,_t:{serialize:serialize,parseItems:parseItems}};
})();
