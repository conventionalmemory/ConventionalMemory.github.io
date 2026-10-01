/* Admin page for ConventionalMemory.io  (#/admin)
   There is no server behind this site, so GitHub is the login. You paste a fine-grained
   personal access token that can only touch this one repository. GitHub checks it on every
   request, so only the token holder can save changes. Changes are saved as commits to items.js
   (and photos/), and GitHub Pages republishes the site a minute or two later.
   The token is kept in memory only. It can also be saved encrypted with a passphrase (see the vault below). */
(function(){
"use strict";
var C,host=null,tok=null,PP=null,S=null,view="list",editing=null,q="",note=null,idle=0,busy=false;
var API="https://api.github.com",FILE="items.js";
var TFILE="timeline-edits.js",THEAD="// Edits to timeline entries made from the Admin page (#/admin). Keyed by the entry's title.\n// d date, k kind, p price, n note, s source, x extra detail (maker, dev, detail, specs).\n// Catalog items link to an entry with their \"tl\" field and show its details where they have none of their own.\n",TAPPLY="function tlApplyEdits(E){window.TLBASE=window.TLBASE||{};Object.keys(E).forEach(function(t){var e=E[t],r=TL.filter(function(z){return z[2]===t})[0];if(!r)return;var X=(window.TLX=window.TLX||{});\n if(!TLBASE[t])TLBASE[t]={r:r.slice(),x:JSON.parse(JSON.stringify(X[t]||{}))};\n if(e.d!=null)r[0]=e.d;if(e.k)r[1]=e.k;if(e.p!=null)r[3]=e.p;if(e.n!=null)r[4]=e.n;if(e.s!=null)r[5]=e.s;\n if(e.x){var b=X[t]||(X[t]={});Object.keys(e.x).forEach(function(k){if(k===\"specs\")b.specs=Object.assign({},b.specs||{},e.x.specs);else b[k]=e.x[k]})}})}\ntlApplyEdits(TLE);\n",TV=null;
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

/* ---------- encrypted token vault (optional) ----------
   Threat model, plainly:
   - The token is encrypted with AES-256-GCM. The key comes from your passphrase through PBKDF2-SHA-256 (600,000 rounds, random 16-byte salt).
   - GCM authenticates the data, so any tampering with the saved blob makes decryption fail. The blob is also bound to this site and repository (AAD).
   - Someone who copies the blob off your computer can try passphrases offline. Nothing on a static site can stop that, so the passphrase must be strong:
     12+ characters and not guessable. The "Generate" button makes a random 100-bit one.
   - Online guessing in this page is slowed by a growing delay, and the saved token is erased after 10 failed tries in a row.
   - Only a fine-grained token limited to this one repository, with an expiry, is accepted. If it ever leaks, revoke it on GitHub. */
var VKEY="cm-gh-vault",FKEY="cm-gh-vault-fail",ITER=600000,MAXFAIL=10;
function hasVault(){try{var o=JSON.parse(localStorage.getItem(VKEY)||"null");return !!(o&&o.c)}catch(e){return false}}
function b2s(a){var s="",u=new Uint8Array(a);for(var i=0;i<u.length;i++)s+=String.fromCharCode(u[i]);return btoa(s)}
function s2b(t){var s=atob(t),a=new Uint8Array(s.length);for(var i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return a}
function aad(){return new TextEncoder().encode("cm-vault|2|"+location.origin+"|"+C.REPO.owner+"/"+C.REPO.repo)}
function vKey(pass,salt,it){return crypto.subtle.importKey("raw",new TextEncoder().encode(pass),"PBKDF2",false,["deriveKey"]).then(function(k){return crypto.subtle.deriveKey({name:"PBKDF2",salt:salt,iterations:it,hash:"SHA-256"},k,{name:"AES-GCM",length:256},false,["encrypt","decrypt"])})}
var COMMON=["password","passphrase","123456","qwerty","letmein","welcome","conventional","memory","github","admin","iloveyou","dragon","monkey"];
function passProblem(p){if(p.length<12)return"Use at least 12 characters.";var l=p.toLowerCase();for(var i=0;i<COMMON.length;i++)if(l.indexOf(COMMON[i])>=0)return"That contains a very guessable word. Use the Generate button or a random phrase.";
 var u={};for(var j=0;j<p.length;j++)u[p[j]]=1;if(Object.keys(u).length<7)return"Use more different characters.";
 var cls=(/[a-z]/.test(p)?1:0)+(/[A-Z]/.test(p)?1:0)+(/\d/.test(p)?1:0)+(/[^A-Za-z0-9]/.test(p)?1:0);if(p.length<20&&cls<3)return"Mix upper case, lower case, digits or symbols, or make it 20+ characters.";return""}
function genPass(){var A="abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789",lim=256-(256%A.length),out="",b;while(out.length<20){b=crypto.getRandomValues(new Uint8Array(1))[0];if(b<lim)out+=A[b%A.length]}return out.replace(/(.{5})(?=.)/g,"$1-")}
function vaultSave(token,pass){if(!(window.crypto&&crypto.subtle))return Promise.reject(new Error("This browser cannot encrypt (it needs https)."));
 var salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
 return vKey(pass,salt,ITER).then(function(k){return crypto.subtle.encrypt({name:"AES-GCM",iv:iv,additionalData:aad()},k,new TextEncoder().encode(token))}).then(function(ct){localStorage.setItem(VKEY,JSON.stringify({v:2,i:ITER,s:b2s(salt),n:b2s(iv),c:b2s(ct)}));localStorage.removeItem(FKEY)})}
function failState(){try{return JSON.parse(localStorage.getItem(FKEY)||"null")||{n:0,t:0}}catch(e){return{n:0,t:0}}}
function waitLeft(){var f=failState();if(!f.n)return 0;var w=Math.min(300,Math.pow(2,f.n-1))*1000;return Math.max(0,f.t+w-Date.now())}
function vaultOpen(pass){var o;try{o=JSON.parse(localStorage.getItem(VKEY))}catch(e){}
 if(!o||!o.c)return Promise.reject(new Error("No saved token on this device."));
 if(o.v!==2||o.i<ITER||o.i>5000000||typeof o.s!=="string"||typeof o.n!=="string"||typeof o.c!=="string"){vaultForget();return Promise.reject(new Error("The saved token was in an old or damaged format, so it was removed. Paste the token again."))}
 var w=waitLeft();if(w>0)return Promise.reject(new Error("Too many wrong tries. Wait "+Math.ceil(w/1000)+" seconds."));
 var salt,iv,ct;try{salt=s2b(o.s);iv=s2b(o.n);ct=s2b(o.c)}catch(e){vaultForget();return Promise.reject(new Error("The saved token was damaged, so it was removed. Paste the token again."))}
 return vKey(pass,salt,o.i).then(function(k){return crypto.subtle.decrypt({name:"AES-GCM",iv:iv,additionalData:aad()},k,ct)}).then(function(pt){localStorage.removeItem(FKEY);return new TextDecoder().decode(pt)},function(){var f=failState();f.n++;f.t=Date.now();
   if(f.n>=MAXFAIL){vaultForget();localStorage.removeItem(FKEY);throw new Error("Too many wrong tries. The saved token was erased. Paste the token again.")}
   localStorage.setItem(FKEY,JSON.stringify(f));throw new Error("Wrong passphrase, or the saved data was changed. "+(MAXFAIL-f.n)+" tries left.")})}
function vaultForget(){try{localStorage.removeItem(VKEY);localStorage.removeItem(FKEY)}catch(e){}}
var pasteMode=false;
function unlock(token,remember,pass){tok=token.trim();busy=true;render();
 if(!/^github_pat_[A-Za-z0-9_]{20,250}$/.test(tok)){tok=null;busy=false;note={t:"err",m:"Only fine-grained tokens are accepted. They start with github_pat_ and can be limited to this one repository. Classic tokens (ghp_) are too powerful."};render();return}
 gh(repo()).then(function(r){
  if(!r.ok)throw new Error(errText(r));
  if(r.json.permissions&&r.json.permissions.push===false)throw new Error("This token can read the repository but not write to it. Give it Contents: Read and write.");
  return gh(repo()+"/contents/"+FILE+"?ref="+encodeURIComponent(C.REPO.branch)).then(function(m){
   if(m.status===404)return{sha:null,items:clone(window.ALLITEMS||C.ITEMS),created:true};
   if(!m.ok)throw new Error(errText(m));
   return gh(repo()+"/contents/"+FILE+"?ref="+encodeURIComponent(C.REPO.branch),{accept:"application/vnd.github.raw+json",text:true}).then(function(t){
    if(!t.ok)throw new Error(errText(t));return{sha:m.json.sha,items:parseItems(t.text)}})})
 }).then(function(d){var tu=repo()+"/contents/"+TFILE+"?ref="+encodeURIComponent(C.REPO.branch);return gh(tu).then(function(m){if(m.status===404){d.tle={};d.tsha=null;return d}if(!m.ok)throw new Error(errText(m));return gh(tu,{accept:"application/vnd.github.raw+json",text:true}).then(function(t){if(!t.ok)throw new Error(errText(t));d.tle=tparse(t.text);d.tsha=m.json.sha;return d})})
 }).then(function(d){S={sha:d.sha,items:d.items,orig:clone(d.items),cimgAdd:{},dirty:!!d.created,photos:[],created:!!d.created,tle:d.tle||{},tsha:d.tsha||null,tleDirty:false};
   if(pass){vaultSave(tok,pass).then(function(){note={t:'ok',m:'Unlocked, and the token is now saved encrypted on this device. Next time just type your passphrase.'};render()},function(e){note={t:'err',m:'Unlocked, but could not save the token: '+e.message};render()})}
   note=d.created?{t:"ok",m:"Unlocked. items.js is not in the repository yet, so the current page's items are loaded. Save to GitHub to create it."}:{t:"ok",m:"Unlocked. Loaded "+S.items.length+" items from GitHub."};
   try{localStorage.setItem("cm-admin","1")}catch(e){}
   view="list";goHash();bump()
 }).catch(function(e){tok=null;S=null;note={t:"err",m:String(e.message||e)}}).then(function(){busy=false;render()})}
function lock(m){tok=null;PP=null;S=null;QC={};editing=null;view="list";clearTimeout(idle);note=m?{t:"ok",m:m}:null;render()}
var hid=0;document.addEventListener("visibilitychange",function(){if(document.hidden){hid=setTimeout(function(){if(tok&&!(S&&S.dirty))lock("Locked after the tab was in the background for 5 minutes.")},5*60*1000)}else clearTimeout(hid)});
function bump(){clearTimeout(idle);if(tok)idle=setTimeout(function(){if(S&&S.dirty){bump();return}lock("Locked after 20 minutes of no activity.")},20*60*1000)}
function save(){if(!S||busy)return;busy=true;note={t:"ok",m:"Saving to GitHub..."};render();
 var chain=Promise.resolve();
 S.photos.forEach(function(p){chain=chain.then(function(){return gh(repo()+"/contents/"+p.path,{method:"PUT",body:{message:"Admin: add photo "+p.path,content:p.b64,branch:C.REPO.branch}}).then(function(r){if(!r.ok&&r.status!==422)throw new Error(errText(r))})})});
 chain.then(function(){if(!S.photos.length&&!S.created&&JSON.stringify(S.items)===JSON.stringify(S.orig))return{ok:true,skip:true};var body={message:"Admin: update catalog ("+S.items.length+" items)",content:b64enc(serialize(S.items)),branch:C.REPO.branch};if(S.sha)body.sha=S.sha;return gh(repo()+"/contents/"+FILE,{method:"PUT",body:body})})
 .then(function(r){if(!r.ok)throw new Error(errText(r));if(!r.skip)S.sha=r.json.content.sha;return putTle()}).then(function(){try{alog(diffItems(),S.photos.length)}catch(e){}S.orig=clone(S.items);view="list";S.dirty=false;S.qn=0;S.photos=[];S.created=false;
   C.ITEMS.length=0;S.items.forEach(function(i){if(!i.draft)C.ITEMS.push(clone(i))});try{window.ALLITEMS=S.items.map(clone);window.DRAFTS=S.items.filter(function(i){return i.draft})}catch(e){}C.prep();
   note={t:"ok",m:"Saved. The public site updates in a minute or two. Refresh it then to see the change."}})
 .catch(function(e){note={t:"err",m:String(e.message||e)}}).then(function(){busy=false;render()})}

/* ---------- views ---------- */
function shell(inner){return'<section class="adm bld"><h2>Admin</h2>'+(note?'<div class="msg '+note.t+'" role="status">'+esc(note.m)+'</div>':"")+inner+'</section>'}
function lockedView(){var hv=hasVault()&&!pasteMode;
 var setup='<h3 class="sub">One-time setup</h3><ol><li>On GitHub open <b>Settings &gt; Developer settings &gt; Personal access tokens &gt; Fine-grained tokens &gt; Generate new token</b>.</li><li>Under <b>Repository access</b> choose <b>Only select repositories</b> and pick <b>'+esc(C.REPO.owner+"/"+C.REPO.repo)+'</b>.</li><li>Under <b>Permissions &gt; Repository permissions</b> set <b>Contents</b> to <b>Read and write</b>. Nothing else.</li><li>Set an expiry (90 days is a good choice), generate it and copy it.</li></ol>';
 if(hv)return shell('<p>Sign in with GitHub to add, edit or remove museum items. A token is saved on this device, locked with your passphrase.</p>'
  +'<label for="vp">Passphrase</label><input id="vp" type="password" autocomplete="current-password" spellcheck="false">'
  +'<p><button class="btn pri" id="vgo" type="button"'+(busy?" disabled":"")+'>'+(busy?"Checking...":"Unlock")+'</button> <button class="btn" id="vnew" type="button">Use a different token</button> <button class="btn" id="vfg" type="button">Forget saved token</button></p>'
  +'<p class="tn">The token is encrypted (AES-256, key from your passphrase) and never leaves this browser except to api.github.com.</p>');
 return shell('<p>Sign in with GitHub to add, edit or remove museum items. There is no separate password: GitHub is the login, so only someone holding a token for this repository can change the site.</p>'+setup
 +'<label for="tk">Token</label><input id="tk" type="password" autocomplete="off" spellcheck="false" placeholder="github_pat_...">'
 +'<label for="pp">Passphrase to save it on this device (optional, 12+ characters)</label><input id="pp" type="password" autocomplete="new-password" spellcheck="false" placeholder="leave blank to not save"><p><button class="btn" id="gen" type="button">Generate a strong one</button> <span id="genout" class="tn"></span></p>'
 +'<p><button class="btn pri" id="go" type="button"'+(busy?" disabled":"")+'>'+(busy?"Checking...":"Unlock")+'</button>'+(hasVault()?' <button class="btn" id="vback" type="button">Back to saved token</button>':'')+'</p>'
 +'<p class="tn">With a passphrase, the token is stored encrypted in this browser (AES-256-GCM, 600,000 PBKDF2 rounds) so you only paste it once. Without one it stays in this page only. It is sent to api.github.com and nowhere else, and the page locks after 20 idle minutes. Use a random passphrase from a password manager: a copied browser profile can be guessed at offline, and only a strong passphrase stops that.</p>')}
var lf="all",ls="az";
function mbar(m){return'<span class="mbar" title="'+m.done+' of '+m.total+' fields filled"><i style="width:'+m.pct+'%"></i></span> <small class="mpc">'+m.pct+'%</small>'}
function listView(){var items=S.items,ql=q.toLowerCase(),tot=0,dn=0;
 var all=items.map(function(it,i){var m=qMeter(it);tot+=m.total;dn+=m.done;return{it:it,i:i,m:m}});
 var vis=all.filter(function(x){var it=x.it;if(ql&&(it.name+" "+(it.maker||"")+" "+it.id+" "+(it.cat||"")).toLowerCase().indexOf(ql)<0)return false;
  return lf==="all"||(lf==="inc"&&x.m.pct<100)||(lf==="done"&&x.m.pct>=100)||(lf==="nophoto"&&!(it.photos||[]).length)||(lf==="notl"&&!qTL(it))||(lf==="draft"&&it.draft)||(lf==="live"&&!it.draft)});
 vis.sort(function(a,b){return ls==="low"?a.m.pct-b.m.pct||a.it.name.localeCompare(b.it.name):ls==="new"?(b.it.year||0)-(a.it.year||0):a.it.name.localeCompare(b.it.name)});
 var all100=tot?Math.round(dn*100/tot):0;
 var chips=[["all","All"],["inc","Incomplete"],["done","Complete"],["nophoto","No photo"],["draft","Drafts ("+items.filter(function(i){return i.draft}).length+")"],["live","Published"]].map(function(c){return'<button class="chip'+(lf===c[0]?" on":"")+'" data-lf="'+c[0]+'" type="button">'+c[1]+'</button>'}).join("");
 return shell('<p>Signed in to <b>'+esc(C.REPO.owner+"/"+C.REPO.repo)+'</b>, branch '+esc(C.REPO.branch)+'. '+items.length+' items. '+(S.dirty?'<span class="tag want">Unsaved changes</span>':'<span class="tag">Saved</span>')+(S.photos.length?' <span class="tag">'+S.photos.length+' photo(s) waiting</span>':"")+'</p>'
 +'<div class="qhero"><div><b>Catalog completeness</b> '+mbar({done:dn,total:tot,pct:all100})+'<br><small class="tn">'+(tot-dn)+' blank fields across '+items.length+' items.</small></div><span><button class="btn pri" id="qgo" type="button">Start the Fill-in Quest</button> <button class="btn" id="qph" type="button">Photo Safari</button></span></div>'
 +potwHtml()+qaddHtml()+'<p class="abar"><button class="btn pri" id="add" type="button">Add item (full form)</button> <button class="btn'+(S.dirty?' pri':'')+'" id="sv" type="button"'+(busy||!S.dirty&&!S.photos.length?" disabled":"")+'>Review and save</button> <button class="btn" id="bulk" type="button" title="Fill every blank field the timeline knows an exact match for">Auto-fill from timeline</button> '
 +(S.undo&&S.undo.length?'<button class="btn" id="ud" type="button">Undo delete ('+esc(S.undo[S.undo.length-1].it.name)+')</button> ':"")
 +'<button class="btn" id="gaudit" type="button">Photo audit</button> <button class="btn" id="ghealth" type="button">Health check</button> <button class="btn" id="gtools" type="button">Bulk tools</button> <button class="btn" id="gstudio" type="button">Studio</button> <button class="btn" id="gtle" type="button">Timeline editor</button> <button class="btn" id="dl" type="button">Download items.js backup</button> <button class="btn" id="lk" type="button">Lock</button></p>'
 +'<div class="tools"><input id="aq" type="search" placeholder="Search items" aria-label="Search items" value="'+esc(q)+'">'+chips+'<select id="ls" aria-label="Sort"><option value="az"'+(ls==="az"?" selected":"")+'>A to Z</option><option value="low"'+(ls==="low"?" selected":"")+'>Least complete first</option><option value="new"'+(ls==="new"?" selected":"")+'>Newest first</option></select></div>'
 +(vis.length?vis.map(function(x){var bl=qFields(x.it).filter(function(f){return!qNA(x.it,f)&&!qHas(x.it,f)}).map(qShort);
  return '<div class="row qrow"><span><b>'+esc(x.it.name)+'</b>'+(x.it.draft?' <span class="tag want">Draft</span>':'')+(x.it.src?' <span class="tag">'+esc(x.it.src==="ebay"?"eBay":"ShopGoodwill")+'</span>':'')+' <small class="tn">'+esc(x.it.maker||"")+', '+esc(x.it.rel||x.it.year||"")+'</small><br>'+mbar(x.m)+(bl.length?' <small class="tn">Missing: '+esc(bl.slice(0,3).join(", "))+(bl.length>3?" and "+(bl.length-3)+" more":"")+'</small>':' <small class="tn">All filled in</small>')+'</span>'
  +'<span class="rb">'+(bl.length?'<button class="btn" data-q="'+x.i+'" type="button">Quest</button> ':"")+(x.it.draft?'<button class="btn pri" data-pub="'+x.i+'" type="button">Publish</button> ':'')+'<button class="btn" data-e="'+x.i+'" type="button">Edit</button> <button class="btn" data-c="'+x.i+'" type="button">Copy</button> <button class="btn danger" data-d="'+x.i+'" type="button">Delete</button></span></div>'}).join(""):'<p class="empty">No items match.</p>')
 +'<p class="tn">Changes are only saved when you press Save to GitHub. Deleting can be undone until you leave this page. Deleting an item does not delete its photo files from the repository.</p>')}
function field(id,label,val,extra){return'<div class="fld"><label for="'+id+'">'+esc(label)+'</label><input id="'+id+'" placeholder=" " value="'+esc(val==null?"":val)+'" '+(extra||"")+'></div>'}
function area(id,label,val,h){return'<label for="'+id+'">'+esc(label)+'</label><textarea id="'+id+'" placeholder=" " style="min-height:'+(h||80)+'px">'+esc(val||"")+'</textarea>'}

// ---- Private (admin only) fields: encrypted with the admin passphrase, so the public site only ever holds ciphertext ----
var PRIV=[["paid","What I paid"],["seller","Bought from"],["value","Estimated value now"],["loc","Storage location"],["serial","Serial number"],["pnotes","Private notes"]];
function paad(){return new TextEncoder().encode("cm-priv|1|"+C.REPO.owner+"/"+C.REPO.repo)}
function encPriv(obj,pass){var salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
 return vKey(pass,salt,ITER).then(function(k){return crypto.subtle.encrypt({name:"AES-GCM",iv:iv,additionalData:paad()},k,new TextEncoder().encode(JSON.stringify(obj)))}).then(function(ct){return{v:1,i:ITER,s:b2s(salt),n:b2s(iv),c:b2s(ct)}})}
function decPriv(o,pass){if(!o||o.v!==1||o.i<ITER||o.i>5000000)return Promise.reject(new Error("The private data is in an unknown format."));
 return vKey(pass,s2b(o.s),o.i).then(function(k){return crypto.subtle.decrypt({name:"AES-GCM",iv:s2b(o.n),additionalData:paad()},k,s2b(o.c))}).then(function(pt){return JSON.parse(new TextDecoder().decode(pt))},function(){throw new Error("Wrong passphrase for the private fields.")})}
function privSection(){var e=editing,it=e.it;
 if(!e.privOk){return'<fieldset><legend>Private fields (admin only)</legend><p class="tn">These are encrypted with your passphrase before saving. Visitors never see them.</p>'
  +'<label for="pvp">'+(it.privEnc?'Passphrase to open the private fields':'Passphrase to lock the private fields (use your admin passphrase)')+'</label><input id="pvp" type="password" autocomplete="off"><p><button class="btn" id="pvo" type="button">'+(it.privEnc?"Open private fields":"Start private fields")+'</button></p></fieldset>'}
 return'<fieldset><legend>Private fields (admin only, encrypted)</legend><p class="tn">Saved encrypted. The public site only ever holds scrambled text for these.</p><div class="two">'+PRIV.filter(function(f){return f[0]!=="pnotes"}).map(function(f){return field("pv_"+f[0],f[1],e.priv[f[0]])}).join("")+'</div>'+area("pv_pnotes","Private notes",e.priv.pnotes,70)+'</fieldset>'}
function readPriv(){if(!editing||!editing.privOk)return;PRIV.forEach(function(f){var el=host&&host.querySelector("#pv_"+f[0]);if(el){var v=el.value.trim();if(v)editing.priv[f[0]]=v;else delete editing.priv[f[0]]}})}
function openPriv(pass){var e=editing;if(!pass){e.privMsg="Type the passphrase first.";render();return}
 if(!e.it.privEnc){var pr=passProblem(pass);if(pr){note={t:"err",m:"Private passphrase: "+pr};render();return}PP=pass;e.priv={};e.privOk=true;render();return}
 decPriv(e.it.privEnc,pass).then(function(o){PP=pass;e.priv=o||{};e.privOk=true;render()},function(er){note={t:"err",m:er.message};render()})}
// ---- Autofill: timeline first, then Wikipedia ----
var CATMAP={"Computer":"Computers","Console or handheld":"Consoles and handhelds","Expansion card":"Expansion cards","Sound or MIDI":"Sound and MIDI","Peripheral":"Peripherals","Storage":"Storage","Monitor":"Monitors","Printer":"Printers","Game or software":"Games and software"};
function nk(s){return String(s).toLowerCase().replace(/[^a-z0-9]+/g," ").trim()}
function tlMatches(q){q=nk(q);if(q.length<2)return[];var w=q.split(" "),out=[];
 (C.TL||[]).forEach(function(r){if(!/^(hw|pe|sw|gt|gn|gc)$/.test(r[1]))return;var t=nk(r[2]),sc=0;if(t===q)sc=100;else if(t.indexOf(q)>=0)sc=60-Math.min(30,t.length-q.length);else{var hit=w.filter(function(x){return t.indexOf(x)>=0}).length;if(hit===w.length)sc=40;else if(hit&&hit>=Math.ceil(w.length/2)&&w.length>1)sc=15+hit}
  if(sc)out.push({r:r,sc:sc})});
 out.sort(function(a,b){return b.sc-a.sc});return out.slice(0,6)}
function tlItem(it,r){var x=(C.TLX||{})[r[2]]||{},n={};
 var ty=x.type&&C.SPEC_TYPES[x.type]?x.type:(/^(sw|gt|gn|gc)$/.test(r[1])?"Game or software":"Computer");
 if(!it.name)it.name=r[2];if(!it.maker&&x.maker)it.maker=x.maker;if(!it.rel){it.rel=r[0];it.year=+r[0].slice(0,4);if(!r[5])it.relx=true}
 if(!it.msrp&&r[3])it.msrp=r[3].replace(/\*$/," (estimated)");
 if(!it.cat)it.cat=CATMAP[ty]||"Computers";
 if(!it.text){it.text=[r[4],x.detail].filter(Boolean).join(" ")}
 var known={};var g=C.SPEC_TYPES[ty]||{};Object.keys(g).forEach(function(k){g[k].forEach(function(f){known[f]=1})});
 var sp=Object.assign({},it.specs||{});var src=Object.assign({},x.specs||{});
 if(ty==="Game or software"){if(x.maker&&!src.Publisher)src.Publisher=x.maker;if(x.dev&&!src.Developer)src.Developer=x.dev}
 Object.keys(src).forEach(function(k){if(!sp[k])sp[k]=String(src[k])});
 it.specs=sp;it.type=ty;
 var tg=(it.tags||[]).slice();var dec=String(r[0]).slice(0,3)+"0s";[dec,r[1]==="hw"||r[1]==="pe"?"hardware":"software"].forEach(function(t){if(tg.indexOf(t)<0)tg.push(t)});it.tags=tg;return it}
function fillFromTL(r){var it=tlItem(collectSoft(),r);
 editing.it=it;editing.lookupNote="Filled from the timeline entry \""+r[2]+"\". Check every field, then adjust.";render()}
function wikiOk(u){return/^https:\/\/en\.wikipedia\.org\/wiki\/[^\s]+$/.test(u||"")}
function wikiSearch(q){var u="https://en.wikipedia.org/w/api.php?action=opensearch&format=json&origin=*&limit=5&namespace=0&search="+encodeURIComponent(q);
 return fetch(u,{credentials:"omit",referrerPolicy:"no-referrer"}).then(function(r){if(!r.ok)throw new Error("Wikipedia answered "+r.status);return r.json()}).then(function(j){var t=j[1]||[],d=j[2]||[],l=j[3]||[];return t.map(function(x,i){return{t:String(x),d:String(d[i]||""),u:l[i]}}).filter(function(x){return wikiOk(x.u)})})}
var WSKIP=/^(references|external links|see also|notes|further reading|footnotes|bibliography|sources|citations|gallery)$/i,WPREF=["overview","description","history","design","hardware","specifications","features","gameplay","development","release","reception","legacy","sales","software","models","variants","versions"];
var WMAP={"manufacturer":"maker","publisher":"maker","publishers":"maker","developer":"dev","developers":"dev","designer":"maker","operating system":"OS shipped","cpu":"CPU","processor":"CPU","memory":"RAM installed","ram":"RAM installed","storage":"Storage","display":"Display","graphics":"Graphics","sound":"Sound","mass":"Weight","weight":"Weight","dimensions":"Dimensions","power":"Power supply","battery":"Battery","connectivity":"Ports","ports":"Ports","genre":"Genre","genres":"Genre","mode":"Players","modes":"Players","platform":"Platform","platforms":"Platform","media":"Format","input":"Input support","bus":"Bus","chipset":"Chipset","resolution":"Resolution","polyphony":"Polyphony","synthesis":"Synthesis"};
function wclean(el){el.querySelectorAll("sup,style,script,.reference,.noprint,.mw-ref,.hlist-separator").forEach(function(n){n.remove()});el.querySelectorAll("br").forEach(function(n){n.replaceWith("; ")});el.querySelectorAll("li").forEach(function(n){n.append("; ")});
 return el.textContent.replace(/\[[^\]]*\]/g,"").replace(/\s+/g," ").replace(/(;\s*)+$/,"").replace(/;\s*;/g,";").trim()}
function wdate(v){var M={january:1,february:2,march:3,april:4,may:5,june:6,july:7,august:8,september:9,october:10,november:11,december:12},m,y;
 if((m=/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/.exec(v))&&M[m[2].toLowerCase()])return m[3]+"-"+String(M[m[2].toLowerCase()]).padStart(2,"0")+"-"+String(+m[1]).padStart(2,"0");
 if((m=/([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/.exec(v))&&M[m[1].toLowerCase()])return m[3]+"-"+String(M[m[1].toLowerCase()]).padStart(2,"0")+"-"+String(+m[2]).padStart(2,"0");
 if((m=/([A-Za-z]+)\s+(\d{4})/.exec(v))&&M[m[1].toLowerCase()])return m[2]+"-"+String(M[m[1].toLowerCase()]).padStart(2,"0");
 return(y=/\b(19[6-9]\d|20[0-2]\d)\b/.exec(v))?y[1]:""}
function wparse(html){var doc=new DOMParser().parseFromString(html,"text/html"),box=doc.querySelector("table.infobox"),rows=[];
 if(box)box.querySelectorAll("tr").forEach(function(tr){var th=tr.querySelector("th"),td=tr.querySelector("td");if(th&&td&&!td.querySelector("table")){var k=wclean(th.cloneNode(true)),v=wclean(td.cloneNode(true));if(k&&v&&k.length<40)rows.push([k,v.slice(0,200)])}});return rows}
function wsections(text){var parts=String(text||"").split(/\n=+ (.+?) =+\n/),out=[],see=[];
 for(var i=1;i<parts.length;i+=2){var h=parts[i].trim(),body=(parts[i+1]||"").replace(/\n=+ .+? =+\n[\s\S]*/,"").trim();
  if(/^see also$/i.test(h)){see=body.split("\n").map(function(x){return x.trim()}).filter(function(x){return x&&x.length<60}).slice(0,8);continue}
  if(WSKIP.test(h)||body.length<120)continue;
  var t=body.replace(/\n{2,}/g,"\n\n");if(t.length>1500){t=t.slice(0,1500);var p=Math.max(t.lastIndexOf(". "),t.lastIndexOf(".\n"));if(p>500)t=t.slice(0,p+1)}
  out.push({h:h,t:t})}
 out.sort(function(a,b){var x=WPREF.indexOf(a.h.toLowerCase()),y=WPREF.indexOf(b.h.toLowerCase());return(x<0?99:x)-(y<0?99:y)});
 return{sections:out.slice(0,6),see:see}}
function fillFromWiki(c){var T=encodeURIComponent(c.t.replace(/ /g,"_")),base="https://en.wikipedia.org/w/api.php?format=json&origin=*&redirects=1&";
 var get=function(u){return fetch(u,{credentials:"omit",referrerPolicy:"no-referrer"}).then(function(r){if(!r.ok)throw new Error("Wikipedia answered "+r.status);return r.json()})};
 editing.lookupNote="Reading the whole Wikipedia article...";render();
 Promise.all([get(base+"action=parse&prop=text&disablelimitreport=1&disableeditsection=1&page="+T),get(base+"action=query&prop=extracts|pageimages&explaintext=1&exsectionformat=wiki&pithumbsize=640&titles="+T)]).then(function(res){
  var html=res[0].parse&&res[0].parse.text?res[0].parse.text["*"]:"",rows=wparse(html),pg=res[1].query&&res[1].query.pages?res[1].query.pages[Object.keys(res[1].query.pages)[0]]:{},ex=String(pg.extract||"");
  var lead=ex.split(/\n=+ /)[0].trim(),ws=wsections(ex),title=String(pg.title||c.t),page="https://en.wikipedia.org/wiki/"+encodeURIComponent(title.replace(/ /g,"_")).replace(/%2F/g,"/").replace(/%3A/g,":");
  var it=collectSoft(),sp=Object.assign({},it.specs||{}),facts={},nspec=0;
  rows.forEach(function(r){var k=r[0].toLowerCase(),v=r[1],tg=WMAP[k];
   if(k==="release date"||k==="released"||k==="introduced"||k==="first release"||k==="initial release"||k==="release"){var d=wdate(v);if(d&&!it.rel){it.rel=d;it.year=+d.slice(0,4)}return}
   if(/^(introductory|launch|retail|original) ?price$|^price$|^msrp$/.test(k)){if(!it.msrp)it.msrp=v.split(";")[0].slice(0,60);return}
   if(k==="discontinued"){var y=/\b(19\d\d|20\d\d)\b/.exec(v);if(y&&!it.disc)it.disc=+y[1];return}
   if(tg==="maker"){if(!it.maker)it.maker=v.split(";")[0].slice(0,60);return}
   if(tg==="dev"){if(C.SPEC_TYPES[it.type||"Other"]&&(it.type==="Game or software")){if(!sp.Developer){sp.Developer=v.slice(0,120);nspec++}}else if(!it.maker)it.maker=v.split(";")[0].slice(0,60);return}
   if(tg){if(!sp[tg]){sp[tg]=v.slice(0,160);nspec++}return}
   if(/^(type|image|caption|logo|website|also known as|codename|units sold|discontinued)$/.test(k))return;
   if(Object.keys(facts).length<14)facts[r[0]]=v.slice(0,160)});
  if(!it.name)it.name=title;if(!it.text&&lead)it.text=lead.split("\n")[0].slice(0,600);
  var img=pg.thumbnail&&/^https:\/\/upload\.wikimedia\.org\//.test(pg.thumbnail.source||"")?pg.thumbnail.source:"";
  it.specs=sp;it.wiki={t:title,u:page,summary:lead.slice(0,1200)};if(ws.sections.length)it.wiki.sections=ws.sections;if(Object.keys(facts).length)it.wiki.facts=facts;if(ws.see.length)it.wiki.see=ws.see;if(img)it.wiki.img=img;
  editing.it=it;editing.lookupNote="Imported from Wikipedia: "+nspec+" spec"+(nspec===1?"":"s")+", "+Object.keys(facts).length+" infobox facts, "+ws.sections.length+" article section"+(ws.sections.length===1?"":"s")+(img?", and the lead image":"")+". They show on the item page with credit. Check them, then adjust.";render()
 }).catch(function(e){editing.lookupNote="Could not reach Wikipedia: "+e.message;render()})}
function lookupView(){var e=editing,h='<fieldset><legend>Quick fill</legend><p class="tn">Type a name and I will look for it in the timeline first, then on Wikipedia. Nothing is saved until you press the Add button below, so you can change anything.</p><div class="two"><div class="fld"><label for="lq">Name to look up</label><input id="lq" value="'+esc(e.lq||"")+'" placeholder="for example Sound Blaster 16"></div></div><p><button class="btn pri" id="lgo" type="button">Look it up</button></p>';
 if(e.lookupNote)h+='<div class="msg ok" role="status">'+esc(e.lookupNote)+'</div>';
 if(e.lres){h+='<h4>In the timeline</h4>'+(e.lres.tl.length?'<ul class="lk">'+e.lres.tl.map(function(m,i){var x=(C.TLX||{})[m.r[2]]||{};return'<li><button class="btn" data-lt="'+i+'" type="button">Use this</button> <b>'+esc(m.r[2])+'</b> <span class="tn">'+esc(m.r[0])+(m.r[3]?", "+esc(m.r[3]):"")+(x.maker?", "+esc(x.maker):"")+'</span></li>'}).join("")+'</ul>':'<p class="tn">No timeline match.</p>')
  +'<h4>On Wikipedia</h4>'+(e.lres.wk===null?'<p class="tn">Searching...</p>':e.lres.wk.length?'<ul class="lk">'+e.lres.wk.map(function(m,i){return'<li><button class="btn" data-lw="'+i+'" type="button">Use this</button> <b>'+esc(m.t)+'</b> <span class="tn">'+esc(m.d.slice(0,120))+'</span></li>'}).join("")+'</ul>':'<p class="tn">'+esc(e.lres.werr||"No Wikipedia match.")+'</p>')}
 return h+'</fieldset>'}
function editView(){var it=editing.it,isNew=editing.i<0,ty=it.type||"Other",sp=it.specs||{};
 var g=C.SPEC_TYPES[ty]||{},known={},specs="";
 Object.keys(g).forEach(function(k){specs+='<h3 class="sub">'+esc(k)+'</h3><div class="two">'+g[k].map(function(f){known[f]=1;return field("sp_"+slug(f),f,sp[f],'data-bl="1" data-k="'+esc(f)+'"')}).join("")+'</div>'});
 var other=Object.keys(sp).filter(function(k){return!known[k]}).map(function(k){return k+" | "+sp[k]}).join("\n");
 var ex=(it.extras||[]).map(function(x){return x.n+" | "+(x.s||"Have")+(x.note?" | "+x.note:"")}).join("\n");
 var lg=(it.log||[]).map(function(x){return x.d+" | "+(x.t||"Note")+" | "+(x.n||"")}).join("\n");
 var ph=(it.photos||[]);
 return shell('<p><button class="btn" id="bk" type="button">Back to the list</button></p><h3 class="sub">'+(isNew?"Add an item":"Edit "+esc(it.name))+'</h3>'+(isNew?"":'<p>'+mbar(qMeter(it))+'</p>')+'<p class="tn">Dashed boxes are still blank. <button class="btn" id="nb" type="button">Jump to next blank</button></p>'
 +lookupView()+'<label for="ty">Type</label><select id="ty">'+Object.keys(C.SPEC_TYPES).map(function(k){return'<option'+(k===ty?" selected":"")+'>'+esc(k)+'</option>'}).join("")+'</select>'
 +'<fieldset><legend>Basics</legend><div class="two">'+CORE.map(function(f){return field("f_"+f[0],f[1],it[f[0]],'data-bl="1" '+(f[2]?"required":""))}).join("")+field("f_id","Web address name (id). Lowercase letters, numbers and dashes",it.id||"",isNew?"":"readonly")+'</div>'
 +LISTS.map(function(f){return field("f_"+f[0],f[1],(it[f[0]]||[]).join(", "))}).join("")+LONG.map(function(f){return area("f_"+f[0],f[1],it[f[0]])}).join("")
 +'<label><input type="checkbox" id="f_relx" style="width:auto;display:inline"'+(it.relx?" checked":"")+'> The release date is unconfirmed (shows an asterisk)</label>'
 +'<label><input type="checkbox" id="f_draft" style="width:auto;display:inline"'+(it.draft?" checked":"")+'> Draft: keep it out of the public catalog until I publish it</label>'
 +'<label><input type="checkbox" id="f_sample" style="width:auto;display:inline"'+(it.sample?" checked":"")+'> This is a sample entry</label></fieldset>'
 +'<fieldset><legend>Specs</legend>'+(specs||'<p>No spec template for this type.</p>')+area("f_other","Other specs, one per line: Label | Value",other,60)+'</fieldset>'
 +tlField(it)+'<fieldset><legend>Photos</legend><div class="thumbs">'+ph.map(function(p,i){var u=C.safeUrl(p,"img");return'<figure>'+(u?'<img src="'+esc(u)+'" alt="">':'')+'<figcaption>'+esc(String(p).slice(0,40))+'</figcaption><button class="btn danger" data-rp="'+i+'" type="button">Remove</button></figure>'}).join("")
  +editing.newPhotos.map(function(p,i){return'<figure><img src="'+esc(p.data)+'" alt=""><figcaption>new: '+esc(p.path.replace("photos/",""))+'</figcaption><button class="btn danger" data-rn="'+i+'" type="button">Remove</button></figure>'}).join("")+'</div>'
  +'<label for="pf">Add photos (they are shrunk to 1600 pixels and saved as JPEG in the photos folder)</label><select id="pcrop"><option value="">No crop</option><option value="1.3333">Crop 4:3</option><option value="1">Crop square</option><option value="1.7778">Crop 16:9</option></select> <input id="pf" type="file" accept="image/*" multiple><div id="pdrop" class="noprint" style="border:1px dashed currentColor;padding:8px;margin:6px 0">Or drop photos here</div>'
  +field("pu","Or add a photo by web address (https)","")+'<p><button class="btn" id="pua" type="button">Add that address</button></p>'
  +field("f_credit","Photo credit",it.credit)+'</fieldset>'
 +'<fieldset><legend>Links and media</legend>'+area("f_videos","Videos, one per line: Title | https address",(it.videos||[]).map(function(v){return v.t+" | "+v.u}).join("\n"),60)+area("f_links","Manuals and references, one per line: Title | https address",(it.links||[]).map(function(v){return v.t+" | "+v.u}).join("\n"),60)
 +field("f_wiki","Wikipedia address",it.wiki&&it.wiki.u||"")+area("f_wsum","Wikipedia summary (optional, CC BY-SA text)",it.wiki&&it.wiki.summary||"",60)+'</fieldset>'
 +privSection()+'<fieldset><legend>Accessories and changelog</legend><p class="tn">Ideas: '+esc((C.ACC_HINTS[ty]||[]).join(", "))+'</p>'+area("f_extras","Accessories, one per line: Name | Have, Want, Missing or Optional | note",ex,90)+area("f_log","Changelog, one per line: YYYY-MM-DD | Type | what changed. Types: "+C.LOGTYPES.join(", "),lg,90)+'</fieldset>'
 +'<div class="stick"><button class="btn pri" id="ok" type="button">'+(isNew?"Add to the catalog":"Apply changes")+'</button> <button class="btn" id="cx" type="button">Cancel</button></div><p class="tn">This applies the change here. Press Save to GitHub on the list page to publish it.</p><div id="ferr"></div>')}
/* ---------- completeness and the Fill-in Quest (admin only) ----------
   Every item has a list of fields worth having. The quest walks the blank ones one at a time and pays XP for each.
   Progress (XP, streak, badges) lives in this browser only; the answers go into the catalog like any edit. */
var QKEY="cm-quest",QT=null,QC={},QW={},QA=null,QS={mode:"quick",screen:"map",item:null,skip:{},defer:{},dn:0,boss:null,sp:null,tm:0,msg:null,boom:0,cur:null,pin:null,pop:0};
var QF=[
 {k:"maker",s:"maker",l:"Who made it?",t:"t",xp:10,ph:"Company or publisher"},
 {k:"rel",s:"release date",l:"When did it come out?",t:"t",xp:10,ph:"1998, 1998-11 or 1998-11-03",has:function(it){return!!(it.rel||it.year)}},
 {k:"msrp",s:"MSRP",l:"What did it cost new?",t:"t",xp:10,ph:"$1,995 or about $300"},
 {k:"model",s:"model",l:"What is the model name or number?",t:"t",xp:8,ph:"Model"},
 {k:"photo",s:"photo",l:"Show it off. Add a photo.",t:"p",xp:25,ph:"https address of a photo",hint:"Paste an https address, or choose a picture from this device. It is shrunk to 1600 pixels.",has:function(it){return(it.photos||[]).length>0}},
 {k:"text",s:"description",l:"Describe it in a sentence or two.",t:"a",xp:20},
 {k:"thoughts",s:"my take",l:"What do you think of it?",t:"a",xp:20,hint:"Your own opinion. This is the fun one."},
 {k:"score",s:"score",l:"How many K out of 640K?",t:"n",lo:0,hi:640,xp:15,ph:"0 to 640"},
 {k:"cond",s:"condition",l:"What condition is it in?",t:"t",xp:5,ph:"Mint, Good, Yellowed, For parts"},
 {k:"works",s:"working status",l:"Does it work?",t:"c",xp:5,ch:["Working","Partly working","Untested","Not working"]},
 {k:"country",s:"country",l:"Where was it made?",t:"t",xp:5,ph:"Country of origin"},
 {k:"tags",s:"tags",l:"Add a few tags, separated by commas.",t:"l",xp:5,ph:"1980s, hardware, beige"},
 {k:"links",s:"link",l:"Add a manual or reference link.",t:"u",xp:10,ph:"Title | https://example.com",hint:"One link. A bare https address works too."},
 {k:"wiki",s:"Wikipedia",l:"Which Wikipedia article is it?",t:"w",xp:10,ph:"https://en.wikipedia.org/wiki/..."}];
function qFields(it){var g=C.SPEC_TYPES[it.type||"Other"]||{},out=QF.slice();Object.keys(g).forEach(function(k){g[k].forEach(function(n){out.push({k:"sp:"+n,spec:n,s:n,l:"What is its "+n.toLowerCase()+"?",t:"t",xp:8,ph:n})})});return out}
function qShort(f){return f.s||f.k}
function qNA(it,f){return(it.na||[]).indexOf(f.k)>=0}
function qHas(it,f){if(f.has)return f.has(it);if(f.spec)return!!(it.specs&&it.specs[f.spec]);if(f.k==="links")return(it.links||[]).length>0;if(f.k==="wiki")return!!(it.wiki&&it.wiki.u);if(f.k==="tags")return(it.tags||[]).length>0;return it[f.k]!=null&&String(it[f.k]).trim()!==""}
function qMeter(it){var fs=qFields(it).filter(function(f){return!qNA(it,f)}),d=fs.filter(function(f){return qHas(it,f)}).length;return{done:d,total:fs.length,pct:fs.length?Math.round(d*100/fs.length):100}}
function qTL(it){var k=it.id+"|"+it.name;if(!(k in QC)){var m=tlMatches(it.name||"")[0];QC[k]=m&&m.sc>=60?{r:m.r,x:(C.TLX||{})[m.r[2]]||{},exact:m.sc===100}:null}return QC[k]}
function qSuggest(it,f){var m=qTL(it);if(!m)return null;var r=m.r,x=m.x,v="";
 if(f.k==="maker")v=x.maker||"";else if(f.k==="rel")v=r[0];else if(f.k==="msrp")v=r[3]?r[3].replace(/\*$/," (estimated)"):"";else if(f.k==="text")v=[r[4],x.detail].filter(Boolean).join(" ");else if(f.spec)v=x.specs&&x.specs[f.spec]?String(x.specs[f.spec]):"";
 return v?{v:v,from:r[2],exact:m.exact}:null}
function qApply(it,f,v){v=String(v==null?"":v).trim();if(!v)return"Type something first, or press Skip.";var k=f.k;
 if(f.t==="n"){var n=Number(v);if(!isFinite(n)||n<f.lo||n>f.hi)return"Use a number from "+f.lo+" to "+f.hi+".";it[k]=n}
 else if(k==="rel"){if(!/^\d{4}(-\d\d(-\d\d)?)?$/.test(v))return"Use 1998, 1998-11 or 1998-11-03.";it.rel=v;it.year=+v.slice(0,4)}
 else if(f.t==="l"){var l=v.split(",").map(function(t){return t.trim()}).filter(Boolean);if(!l.length)return"Add at least one tag.";it[k]=l}
 else if(f.t==="p"){var u=C.safeUrl(v,"img");if(!/^https:/i.test(u))return"Use a web address that starts with https://";it.photos=(it.photos||[]).concat([u])}
 else if(f.t==="u"){var p=v.split("|").map(function(t){return t.trim()}),su=C.safeUrl(p.length>1?p[1]:p[0],"link");if(!/^https:/i.test(su))return"Use a link that starts with https://";it.links=(it.links||[]).concat([{t:(p.length>1&&p[0])||su.replace(/^https:\/\//,"").split("/")[0],u:su}])}
 else if(f.t==="w"){if(!wikiOk(v))return"Use an address like https://en.wikipedia.org/wiki/Commodore_64";var t=v.split("/").pop();try{t=decodeURIComponent(t)}catch(e){}it.wiki={t:t.replace(/_/g," "),u:v}}
 else if(f.spec){it.specs=it.specs||{};it.specs[f.spec]=v}
 else it[k]=v;
 return""}
function qLoad(){var o=null;try{o=JSON.parse(localStorage.getItem(QKEY)||"null")}catch(e){}return qLoadDefaults(o)}
function qStore(){try{localStorage.setItem(QKEY,JSON.stringify(QT))}catch(e){}}
var QTITLES=["Boot Sector","Floppy Rookie","Bit Twiddler","Hex Hacker","Cache Hit","TSR Wrangler","Sysop","Overlay Wizard","Himem Hero","Conventional Legend"];
function qLvl(xp){return Math.floor(Math.sqrt(xp/40))+1}
function qIc(n,s){return typeof px==="function"?px(n,s||16):""}
var QX={maker:["gear","The Maker's Mark","Shows under the title on the item page and on every catalog card."],rel:["clock","Date Detective","Puts it on the timeline and sorts the shelf."],msrp:["coin","The Price Hunt","Feeds the price charts and the tribute ad."],model:["key","Model Numbers","A row in the spec table."],photo:["camera","Photo Safari","Replaces the drawn picture on the card, the shelf and the item page."],text:["book","The Storyteller","The main paragraph on the item page."],thoughts:["heart","Hot Take","The My take box on the item page."],score:["trophy","The Verdict","Sets the 640K rating and the color of its shelf spine."],cond:["shield","Inspection","A row in the details table."],works:["bolt","Power-On Test","Shows the working badge."],country:["globe","Made In","A row in the details table."],tags:["flag","Labelmaker","Powers tag pages and search."],links:["folder","Library Card","The manuals and references list."],wiki:["news","Cross-Reference","Adds the Wikipedia summary and credit."],spec:["chip","Spec Sheet Dungeon","A row in the spec table. The Rig checker reads these too."]};
function qx(f){return QX[f.spec?"spec":f.k]||["star",f.s,""]}
var QB=[["first","First Byte","Fill in one field","chip",function(t){return t.filled>=1}],["ten","Ten Fields","Fill in 10 fields","floppy",function(t){return t.filled>=10}],["streak5","Hot Streak","Five answers in a row","bolt",function(t){return t.best>=5}],["combo10","Combo King","Ten answers in a row","crown",function(t){return t.best>=10}],["photo3","Shutterbug","Add 3 photos","camera",function(t){return t.photos>=3}],["photo10","Safari Guide","Add 10 photos","globe",function(t){return t.photos>=10}],["full","Complete Set","Restore one item to 100%","trophy",function(t){return t.full>=1}],["full3","Restorer","Restore 3 items","gear",function(t){return t.full>=3}],["goal","Daily Driver","Hit the daily goal","clock",function(t){return t.goalHit>=1}],["day3","Regular","Play on 3 days","sun",function(t){return t.days>=3}],["spec25","Spec Slayer","Fill in 25 specs","sword",function(t){return t.specs>=25}],["take5","Critic","Write 5 of your own takes","heart",function(t){return t.takes>=5}],["lvl5","Cache Hit","Reach level 5","gem",function(t){return qLvl(t.xp)>=5}],["arch","Archivist","Fill in 100 fields","book",function(t){return t.filled>=100}],["boss1","Boss Slayer","Defeat a boss","skull",function(t){return t.bosses>=1}],["boss5","Dragon Hunter","Defeat 5 bosses","sword",function(t){return t.bosses>=5}],["speed10","Speed Demon","Accept 10 in one Speed Round","bolt",function(t){return t.speedBest>=10}],["coll","Collector","Own 8 different relics","gem",function(t){return Object.keys(t.relics||{}).length>=8}],["giver","Quest Giver","Finish 5 daily quests","flag",function(t){return t.dqDone>=5}]];
var QGOAL=5,LOOT=["You found a working 5.25-inch floppy!","A mint manual falls out of the box.","You rescued a CR2032 before it leaked.","Found a jumper setting that actually works.","A BBS phone number, still ringing.","A forgotten stack of AOL trial discs. Collectible!"];
var AC=null;function snd(seq){if(!QT||QT.mute)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();var t=AC.currentTime;seq.forEach(function(f,i){var o=AC.createOscillator(),g=AC.createGain();o.type="square";o.frequency.value=f;g.gain.setValueAtTime(.05,t+i*.08);g.gain.exponentialRampToValueAtTime(.001,t+i*.08+.1);o.connect(g);g.connect(AC.destination);o.start(t+i*.08);o.stop(t+i*.08+.11)})}catch(e){}}
/* Wikipedia helpers for the quest: a free-licensed lead photo, and infobox facts */
var WB="https://en.wikipedia.org/w/api.php?format=json&origin=*&redirects=1&";
function wget(u){return fetch(u,{credentials:"omit",referrerPolicy:"no-referrer"}).then(function(r){if(!r.ok)throw new Error("Wikipedia answered "+r.status);return r.json()})}
function enc(s){return encodeURIComponent(s)}
var CB="https://commons.wikimedia.org/w/api.php?format=json&origin=*&";
var WSTOP={the:1,a:1,an:1,and:1,with:1,for:1,of:1,in:1,to:1,w:1,by:1,set:1,lot:1,new:1,used:1,rare:1,vintage:1,retro:1,tested:1,working:1,untested:1,accessories:1,laptop:0,computer:0};
function wtoks(s){return String(s||"").toLowerCase().replace(/\([^)]*\)/g," ").replace(/[^a-z0-9]+/g," ").split(" ").filter(function(x){return x&&!WSTOP[x]})}
function wscore(term,maker,text){var tt=wtoks(term),hay=" "+wtoks(text).join(" ")+" ",hit=0,w=0,mh=0;if(!tt.length)return 0;
 tt.forEach(function(t){var wt=/\d/.test(t)?2:1;w+=wt;if(hay.indexOf(" "+t+" ")>=0||(t.length>3&&hay.indexOf(t)>=0))hit+=wt});
 var sc=hit/w;if(maker){var m=wtoks(maker);if(m.length&&m.some(function(t){return hay.indexOf(t)>=0}))sc+=.1}
 if(/\b(logo|icon|diagram|schematic|map|flag|poster|advert|advertisement|screenshot|screen shot|scan|manual|box art|cover|sprite|chart|graph|signature|portrait)\b/i.test(text))sc-=1;
 if(/\b(museum|collection|dsc|img|exhibit)\b/i.test(text)&&sc>0)sc+=.02;return sc}
function wsimple(t){return String(t||"").replace(/\([^)]*\)/g," ").replace(/\b(with|w\/)\b.*$/i,"").replace(/\s+/g," ").trim()}
function wcommons(q,term,maker){return wget(CB+"action=query&generator=search&gsrnamespace=6&gsrlimit=20&gsrsearch="+enc("filetype:bitmap "+q)+"&prop=imageinfo&iiprop=url|mime|size|extmetadata&iiurlwidth=800&iiextmetadatafilter=LicenseShortName|Artist|ImageDescription|ObjectName|NonFree").then(function(j){var out=[];var ps=(j.query&&j.query.pages)||{};Object.keys(ps).forEach(function(k){var p=ps[k],ii=p.imageinfo&&p.imageinfo[0];if(!ii||!/^image\/(jpeg|png|webp)$/.test(ii.mime)||ii.width<400||ii.height<300)return;var md=ii.extmetadata||{};if(md.NonFree)return;
  var fn=p.title.replace(/^File:/,""),desc=String((md.ImageDescription||{}).value||"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim().slice(0,200),obj=String((md.ObjectName||{}).value||""),lic=String((md.LicenseShortName||{}).value||"").slice(0,30),art=String((md.Artist||{}).value||"").replace(/<[^>]*>/g,"").replace(/\s+/g," ").trim().slice(0,60);
  var sc=wscore(term,maker,fn.replace(/\.[a-z]+$/i,"")+" "+obj+" "+desc);out.push({s:"ok",url:ii.thumburl||ii.url,fn:fn,atitle:"",page:"https://commons.wikimedia.org/wiki/File:"+enc(fn.replace(/ /g,"_")),free:true,sc:sc,src:"Commons",why:'Commons file "'+fn.replace(/\.[a-z]+$/i,"").slice(0,70)+'"',credit:"Photo: "+(art||"see the file page")+(lic?", "+lic:"")+", via Wikimedia Commons"})});return out})}
function wwiki(term,maker){return wget(WB+"action=query&generator=search&gsrlimit=5&prop=pageimages&piprop=thumbnail|name&pithumbsize=800&gsrsearch="+enc(term)).then(function(j){var ps=(j.query&&j.query.pages)||{},list=Object.keys(ps).map(function(k){return ps[k]}).filter(function(p){return p.thumbnail&&p.pageimage&&!/\.(svg|gif)$/i.test(p.pageimage)});
  return Promise.all(list.map(function(pg){var fn=pg.pageimage;return wget(WB+"action=query&prop=imageinfo&iiprop=extmetadata&iiextmetadatafilter=LicenseShortName|Artist|NonFree&titles="+enc("File:"+fn)).then(function(k){var p2=k.query.pages[Object.keys(k.query.pages)[0]],md=(p2.imageinfo&&p2.imageinfo[0]&&p2.imageinfo[0].extmetadata)||{},lic=String((md.LicenseShortName||{}).value||"").slice(0,30),free=p2.imagerepository==="shared"&&!md.NonFree,art=String((md.Artist||{}).value||"").replace(/<[^>]*>/g,"").replace(/\s+/g," ").trim().slice(0,60);
   return{s:"ok",url:pg.thumbnail.source,fn:fn,atitle:pg.title,page:"https://en.wikipedia.org/wiki/File:"+enc(fn.replace(/ /g,"_")),free:free,sc:wscore(term,maker,pg.title)+.15,src:"Wikipedia",why:'Lead image of the Wikipedia article "'+pg.title+'"',credit:"Photo: "+(art||"see the file page")+(lic?", "+lic:"")+", via Wikimedia"}}).catch(function(){return null})})).then(function(a){return a.filter(Boolean)})})}
function wimgLoad(key,term,done,maker){var w=QW[key]=QW[key]||{};w.img={s:"load"};w.cands=[];var st=wsimple(term)||term;
 var jobs=[wwiki(term,maker),wcommons(st,term,maker)];if(maker&&st.toLowerCase().indexOf(String(maker).toLowerCase())<0)jobs.push(wcommons(maker+" "+st,term,maker));if(st!==term)jobs.push(wcommons(term,term,maker));
 var errs=0,msg="";
 Promise.all(jobs.map(function(p){return p.catch(function(e){errs++;msg=e.message;return[]})})).then(function(r){var seen={},all=[];r.forEach(function(l){l.forEach(function(c){if(seen[c.fn])return;seen[c.fn]=1;all.push(c)})});
  var good=all.filter(function(c){return c.free&&c.sc>=.5}).sort(function(a,b){return b.sc-a.sc}).slice(0,8);
  if(!good.length&&errs===jobs.length){w.img={s:"err",m:msg};return}
  w.cands=good;w.ci=0;w.img=good.length?good[0]:{s:"none"}}).catch(function(e){w.img={s:"err",m:e.message}}).then(done)}
function candStrip(key,attr){var w=QW[key]||{},c=w.cands||[];if(c.length<2)return"";return'<div class="cps" role="group" aria-label="Other candidate photos"><small class="tn">'+c.length+' candidates. Pick the best one:</small><div class="cpr">'+c.map(function(x,i){return'<button type="button" class="cpb'+(i===w.ci?" on":"")+'" '+attr+'="'+i+'" aria-pressed="'+(i===w.ci)+'" title="'+esc(x.why)+' ('+x.src+')"><img src="'+esc(C.safeUrl(x.url.replace(/width=800|\/800px-/,function(m){return m==="width=800"?"width=160":"/160px-"}),"img")||"")+'" alt="" referrerpolicy="no-referrer" loading="lazy"></button>'}).join("")+'</div></div>'}
function candPick(key,i){var w=QW[key];if(!w||!w.cands||!w.cands[i])return;w.ci=i;w.img=w.cands[i]}
function qWimg(it){var w=QW[it.id]=QW[it.id]||{};if(w.img)return;
 if(typeof CIMG!=="undefined"&&CIMG[it.name]&&typeof cimgUrl==="function"){w.img={s:"ok",url:cimgUrl(it.name,800),page:cimgPage(it.name),why:"A free-licensed Wikimedia Commons photo already on file for this name",free:true,credit:"Photo: Wikimedia Commons contributor, free license (see the file page)"};return}
 wimgLoad(it.id,(it.wiki&&it.wiki.t)||it.name,qSide,it.maker)}
function qWfacts(it){var w=QW[it.id]=QW[it.id]||{};if(w.f)return;w.f={s:"load"};var t=(it.wiki&&it.wiki.t)||it.name;
 wget(WB+"action=query&list=search&srlimit=1&srsearch="+enc(t)).then(function(j){var h=j.query&&j.query.search&&j.query.search[0];if(!h)throw new Error("No Wikipedia article found");var ti=h.title;return wget(WB+"action=parse&prop=text&disablelimitreport=1&disableeditsection=1&page="+enc(ti)).then(function(p){w.f={s:"ok",title:ti,rows:wparse(p.parse&&p.parse.text?p.parse.text["*"]:"")}})})
 .catch(function(e){w.f={s:"err",m:e.message}}).then(function(){qSide()})}
function qWsug(it,f){var w=QW[it.id],r=w&&w.f&&w.f.s==="ok"?w.f.rows:null;if(!r)return null;var v="";
 r.forEach(function(x){var k=x[0].toLowerCase();if(f.k==="rel"&&/^(release date|released|introduced|first release|initial release|release)$/.test(k)&&!v)v=wdate(x[1]);else if(f.k==="msrp"&&/^(introductory|launch|retail|original) ?price$|^price$|^msrp$/.test(k)&&!v)v=x[1].split(";")[0].slice(0,60);else if(f.k==="maker"&&WMAP[k]==="maker"&&!v)v=x[1].split(";")[0].slice(0,60);else if(f.spec&&WMAP[k]===f.spec&&!v)v=x[1].split(";")[0].slice(0,120)});
 return v?{v:v,from:"Wikipedia: "+w.f.title,exact:false,wiki:true}:null}

var RELICS=[["turbo","Turbo Button","common","bolt"],["boot","Boot Disk","common","floppy"],["jumper","Jumper Cap","common","key"],["cr2032","Fresh CR2032","common","coin"],["manual","Mint Manual","common","book"],["ram4","4 MB SIMM","common","ram"],["sbox","Sound Card Box","rare","speaker"],["gcart","Golden Cartridge","rare","cart"],["voodoo","Voodoo Shard","rare","card"],["dial","Dial-up Handshake","rare","modem"],["sealed","Factory Sealed Box","epic","box"],["proto","Prototype Board","epic","chip"],["y2k","The Y2K Disk","epic","gem"],["cache","Infinite Cache","epic","crown"]];
function relicDrop(min){var r=Math.random(),rar=min==="rare"?(r<.8?"rare":"epic"):(r<.7?"common":r<.95?"rare":"epic"),l=RELICS.filter(function(x){return x[2]===rar}),x=l[Math.floor(Math.random()*l.length)];QT.relics=QT.relics||{};QT.relics[x[0]]=(QT.relics[x[0]]||0)+1;return x}
function qBadges(){var n=[];QB.forEach(function(b){if(!QT.badges[b[0]]&&b[4](QT)){QT.badges[b[0]]=1;n.push({n:b[1],d:b[2],ic:b[3]})}});return n}
function relicHtml(){var own=QT.relics||{},n=Object.keys(own).length;return'<div class="qrel"><b>Relics '+n+'/'+RELICS.length+'</b> '+RELICS.map(function(x){var c=own[x[0]];return'<span class="qr r-'+x[2]+(c?" on":"")+'" title="'+esc(c?x[1]+" ("+x[2]+")"+(c>1?" x"+c:""):"Not found yet")+'">'+(c?qIc(x[3],18)+(c>1?'<small>x'+c+'</small>':""):'<small>?</small>')+'</span>'}).join("")+'</div>'}
var DQT=[["fill","Fill in {n} fields",[6,8,12]],["photos","Add {n} photos",[1,2]],["specs","Fill in {n} specs",[4,6,8]],["msrp","Fill in {n} launch prices",[2,3]],["takes","Write {n} of your own takes",[1,2]],["restore","Restore {n} item to 100%",[1]],["boss","Defeat {n} boss",[1]],["speed","Finish {n} Speed Round",[1]]];
function dqEnsure(){var td=C.today();if(QT.dq&&QT.dq.d===td)return QT.dq;var sd=0;for(var i=0;i<td.length;i++)sd=(sd*31+td.charCodeAt(i))>>>0;function r(){sd=(sd*1664525+1013904223)>>>0;return sd/4294967296}
 var pool=DQT.slice(),g=[];while(g.length<3){var t=pool.splice(Math.floor(r()*pool.length),1)[0],n=t[2][Math.floor(r()*t[2].length)];g.push({k:t[0],n:n,l:t[1].replace("{n}",n),c:0,ok:0})}
 QT.dq={d:td,g:g,all:0};return QT.dq}
function dqBump(k,n,ex){var d=dqEnsure();if(!ex){QS.award=QS.award||[];ex=QS.award}
 d.g.forEach(function(g){if(g.k===k&&!g.ok){g.c+=n;if(g.c>=g.n){g.ok=1;QT.xp+=25;QT.dqDone=(QT.dqDone||0)+1;ex.push({n:"Daily quest done",d:g.l+". +25 XP",ic:"flag"})}}});
 if(!d.all&&d.g.every(function(g){return g.ok})){d.all=1;QT.xp+=30;var rl=relicDrop("rare");ex.push({n:"All daily quests done!",d:"+30 XP and the relic "+rl[1],ic:rl[3]})}}
function dqHtml(){var d=dqEnsure();return'<div class="qdq"><b>Daily quests</b> '+d.g.map(function(g){return'<span class="qdg'+(g.ok?" ok":"")+'">'+(g.ok?"&#10003; ":"")+esc(g.l)+' <small>'+Math.min(g.c,g.n)+'/'+g.n+'</small></span>'}).join("")+(d.all?' <small class="tn">All done. Back tomorrow for new ones.</small>':' <small class="tn">+25 XP each, +30 XP and a relic for all three.</small>')+'</div>'}
var BOSSN=["Corrupted Sector","Memory Leak","Blue Screen","Divide Overflow","General Protection Fault","Missing Himem.sys"];
function bossPick(){var c=[];S.items.forEach(function(it){var m=qMeter(it),hp=m.total-m.done;if(hp>=1&&hp<=8)c.push({it:it,hp:hp})});if(!c.length){QS.msg={t:"err",m:"No bosses available: every item is either finished or has more than 8 blanks."};return false}
 var b=c[Math.floor(Math.random()*c.length)];QS.mode="item";QS.item=b.it.id;QS.boss={id:b.it.id,max:b.hp,name:BOSSN[Math.floor(Math.random()*BOSSN.length)]};QS.screen="play";QS.pin=null;QS.skip={};QS.msg={t:"ok",m:"A "+QS.boss.name+" guards "+b.it.name+". It has "+b.hp+" HP. Every answer is a hit."};return true}
function bossBar(it){if(!QS.boss||QS.boss.id!==it.id)return"";var m=qMeter(it),hp=Math.max(0,m.total-m.done),pc=Math.min(100,Math.round(hp*100/QS.boss.max));return'<div class="qboss'+(QS.pop?" hit":"")+'"><b>'+qIc("skull",20)+' BOSS: '+esc(QS.boss.name)+'</b> <span class="mbar bhp"><i style="width:'+pc+'%"></i></span> <small>HP '+hp+'/'+QS.boss.max+'. Defeat it for +40 XP and a relic.</small></div>'}
function qTools(){var md=QS.mode;return'<div class="tools"><button class="chip" id="qmapb" type="button">Level select</button><button class="chip'+(md==="quick"?" on":"")+'" data-qm="quick" type="button">Quick wins</button><button class="chip'+(md==="photo"?" on":"")+'" data-qm="photo" type="button">Photo Safari</button><button class="chip'+(md==="random"?" on":"")+'" data-qm="random" type="button">Surprise me</button><button class="chip'+(QS.boss?" on":"")+'" data-qb="1" type="button">Boss Battle</button><button class="chip'+(md==="speed"?" on":"")+'" data-qm="speed" type="button">Speed Round</button></div>'}
/* speed round: accept or reject answers the timeline already knows, 60 seconds */
function spBuild(){var q=[];S.items.forEach(function(it,i){qFields(it).forEach(function(f){if(f.t==="p"||qNA(it,f)||qHas(it,f))return;var sg=qSuggest(it,f);if(sg&&sg.exact)q.push({i:i,f:f,v:sg.v})})});for(var j=q.length-1;j>0;j--){var k=Math.floor(Math.random()*(j+1)),x=q[j];q[j]=q[k];q[k]=x}return q.slice(0,80)}
function spHtml(){var s=QS.sp;if(!s)s=QS.sp={st:"idle",q:spBuild(),ix:0,end:0,score:0,combo:0,bc:0,acc:0,rej:0};
 if(s.st==="idle")return'<div class="qcard"><h3 class="qq">Speed Round</h3><p class="qwh">60 seconds. The timeline already knows these answers. Read each suggestion, then press <b>Y</b> to accept or <b>N</b> to reject. Each accept scores more as your combo grows. Best so far: <b>'+QT.speedBest+'</b> accepted.</p>'+(s.q.length?'<p><button class="btn pri" id="spgo" type="button">Start (60s)</button> <small class="tn">'+s.q.length+' suggestions ready.</small></p>':'<p class="msg ok">No exact timeline answers are left to confirm. Try Quick wins.</p>')+'</div>';
 if(s.st==="run"){var c=s.q[s.ix],it=S.items[c.i],left=Math.max(0,Math.ceil((s.end-Date.now())/1000));return'<div class="qspeed"><div class="qstat"><span>Time <b id="spt">'+left+'</b>s</span><span>Score <b>'+s.score+'</b></span><span>Combo x'+s.combo+'</span><span>Accepted '+s.acc+'</span></div><div class="qcard"><div class="qitem"><b>'+esc(it.name)+'</b></div><h3 class="qq">'+esc(c.f.l)+'</h3><p class="qsg">Timeline says: <b>'+esc(c.v.length>160?c.v.slice(0,160)+"...":c.v)+'</b></p><p class="abar"><button class="btn pri" id="spy" type="button">Yes, correct (Y)</button> <button class="btn" id="spn" type="button">No, skip (N)</button></p></div></div>'}
 return'<div class="qcard qwin"><h3 class="qq">TIME! '+s.acc+' accepted</h3><p>Score <b>'+s.score+'</b> XP. Best combo x'+s.bc+'. Rejected '+s.rej+'.'+(s.acc>=QT.speedBest&&s.acc>0?' <b>New personal best!</b>':"")+'</p><p class="abar"><button class="btn pri" id="spagain" type="button">Go again</button> <button class="btn" id="spsave" type="button">Review and save</button></p></div>'}
function spEnd(){var s=QS.sp;if(!s||s.st!=="run")return;s.st="end";clearInterval(QS.tm);QS.tm=0;QT.speedRuns=(QT.speedRuns||0)+1;var nb=s.acc>QT.speedBest;if(nb)QT.speedBest=s.acc;QS.award=[];dqBump("speed",1);qBadges().forEach(function(b){QS.award.push(b)});QS.boom=nb?1:0;qStore();snd([523,659,784,1047]);render()}
function spStep(ok){var s=QS.sp;if(!s||s.st!=="run")return;var c=s.q[s.ix];if(!c)return;var it=S.items[c.i];
 if(ok&&!qHas(it,c.f)&&!qApply(it,c.f,c.v)){s.combo++;s.bc=Math.max(s.bc,s.combo);var g=3+Math.min(s.combo,10);s.score+=g;s.acc++;QT.xp+=g;QT.filled++;if(c.f.spec)QT.specs=(QT.specs||0)+1;if(c.f.k==="msrp")dqBump("msrp",1);if(c.f.spec)dqBump("specs",1);dqBump("fill",1);S.dirty=true;S.qn=(S.qn||0)+1;qStore();snd([660])}
 else{s.combo=0;s.rej++;snd([220])}
 s.ix++;if(s.ix>=s.q.length){spEnd();return}render()}
function wireSpeed(){clearInterval(QS.tm);QS.tm=0;var s=QS.sp;if(!s)return;var g=$("spgo");if(g)g.onclick=function(){s.st="run";s.end=Date.now()+60000;render()};
 var y=$("spy");if(y)y.onclick=function(){spStep(true)};var n=$("spn");if(n)n.onclick=function(){spStep(false)};
 var a=$("spagain");if(a)a.onclick=function(){QS.sp=null;render()};var v=$("spsave");if(v)v.onclick=review;
 if(s.st==="run")QS.tm=setInterval(function(){var l=Math.ceil((s.end-Date.now())/1000),el=$("spt");if(el)el.textContent=Math.max(0,l);if(l<=0)spEnd()},250)}
function qNext(){var c=[],pin=QS.pin;
 if(pin){var pi=S.items.findIndex(function(x){return x.id===pin.id});if(pi>=0){var hit=null;qFields(S.items[pi]).forEach(function(f){if(!hit&&!qNA(S.items[pi],f)&&!qHas(S.items[pi],f)&&(f.k===pin.k||pin.k==="specs"&&f.spec))hit=f});if(hit)return{i:pi,f:hit}}QS.pin=null}
 S.items.forEach(function(it,i){if(QS.mode==="item"&&QS.item!==it.id)return;qFields(it).forEach(function(f,n){if(QS.mode==="photo"&&f.k!=="photo")return;if(qNA(it,f)||qHas(it,f)||QS.skip[it.id+"|"+f.k])return;var sg=qSuggest(it,f),w=sg&&sg.exact?0:({t:1,c:1,n:1,l:2,u:2,w:2,p:2,a:3})[f.t];c.push({i:i,f:f,w:QS.mode==="item"?n:w*1000+n+(QS.mode==="photo"?(QS.defer[it.id]||0)*100000:0)})})});
 if(!c.length)return null;if(QS.mode==="random")return c[Math.floor(Math.random()*c.length)];
 c.sort(function(a,b){return a.w-b.w||a.i-b.i});return c[0]}
function qAfter(it,f,before){var t=QT,lv=qLvl(t.xp),m=qMeter(it),td=C.today(),new_=[];
 if(t.day!==td){var y=new Date(td+"T12:00:00");y.setDate(y.getDate()-1);var ys=y.getFullYear()+"-"+String(y.getMonth()+1).padStart(2,"0")+"-"+String(y.getDate()).padStart(2,"0");t.days=t.last===ys?(t.days||0)+1:1;t.day=td;t.today=0}
 t.last=td;t.today=(t.today||0)+1;
 var gain=f.xp+(t.streak>=2?2:0)+(t.streak>=9?3:0),done=before.pct<100&&m.pct>=100,loot="";
 t.xp+=gain;t.filled++;t.streak++;t.best=Math.max(t.best,t.streak);if(f.t==="p")t.photos++;if(f.spec)t.specs=(t.specs||0)+1;if(f.k==="thoughts")t.takes=(t.takes||0)+1;if(done)t.full++;
 if(t.filled%5===0){var b=5+Math.floor(Math.random()*16);t.xp+=b;loot=LOOT[Math.floor(Math.random()*LOOT.length)]+" +"+b+" bonus XP."}
 if(t.today===QGOAL){t.goalHit=(t.goalHit||0)+1;t.xp+=20;loot+=" Daily goal reached! +20 XP."}
 var ex=[];if(loot){var rl=relicDrop();ex.push({n:rl[1],d:rl[2]+" relic",ic:rl[3]});loot+=" You found a relic: "+rl[1]+"!"}
 dqBump("fill",1,ex);if(f.t==="p")dqBump("photos",1,ex);if(f.spec)dqBump("specs",1,ex);if(f.k==="msrp")dqBump("msrp",1,ex);if(f.k==="thoughts")dqBump("takes",1,ex);if(done)dqBump("restore",1,ex);
 if(QS.boss&&QS.boss.id===it.id&&done){t.bosses=(t.bosses||0)+1;t.xp+=40;var br=relicDrop("rare");ex.push({n:"Boss defeated!",d:QS.boss.name+". +40 XP and the relic "+br[1],ic:"skull"});loot+=" BOSS DEFEATED! +40 XP.";QS.boss=null;dqBump("boss",1,ex)}
 QB.forEach(function(b){if(!t.badges[b[0]]&&b[4](t)){t.badges[b[0]]=1;new_.push(b)}});
 var up=qLvl(t.xp)>lv;
 QS.pop=gain;QS.msg={t:"ok",m:"+"+gain+" XP"+(t.streak>=3?" (combo x"+t.streak+")":"")+(loot?" "+loot:"")};QS.loot=!!loot;
 QS.award=[];if(up)QS.award.push({n:"Level "+qLvl(t.xp),d:QTITLES[Math.min(qLvl(t.xp)-1,QTITLES.length-1)],ic:"star"});new_.forEach(function(b){QS.award.push({n:b[1],d:b[2],ic:b[3]})});ex.forEach(function(a){QS.award.push(a)});
 if(done)QS.done={id:it.id,name:it.name};
 QS.boom=(up||new_.length||done||ex.length)?1:0;S.dirty=true;S.qn=(S.qn||0)+1;qStore();
 snd(done?[523,659,784,1047,1319]:up||new_.length?[523,659,784,1047]:[660,880])}
function qStars(p){return"★".repeat(p>=100?3:p>=67?2:p>=34?1:0)+"☆".repeat(p>=100?0:p>=67?1:p>=34?2:3)}
function qPic(it,m){var g=(1-m.pct/100).toFixed(2);return'<div class="qpic'+(m.pct>=100?" gold":"")+'" style="filter:grayscale('+g+') contrast('+(0.9+m.pct/1000).toFixed(2)+')">'+(C.pic?C.pic(it):"")+'</div>'}
function qCandHtml(it,f){var w=QW[it.id]||{},sg=qSuggest(it,f),h="";
 if(f.k==="photo"){var g=w.img;
  if(!g||g.s==="load")return'<div class="qcand"><p class="tn">Searching for a free photo...</p></div>';
  if(g.s==="ok"){var u=C.safeUrl(g.url,"img");return'<div class="qcand"><figure class="qcimg"><img src="'+esc(u)+'" alt="Candidate photo" referrerpolicy="no-referrer"><figcaption><small>'+esc(g.why)+'. <a href="'+esc(C.safeUrl(g.page,"link"))+'" target="_blank" rel="noopener noreferrer">File page</a></small></figcaption></figure>'
   +candStrip(it.id,"data-qc")+(g.free?'<p><button class="btn pri" id="qk" type="button">Yes, keep it (K)</button> <button class="btn" id="qsk" type="button" title="Come back to this one later">Skip for now (S)</button> <button class="btn" id="qnp" type="button">Not it (N)</button></p><p class="tn">Free license on Wikimedia Commons. The credit is saved with the photo.</p>':'<p class="msg err">That image looks non-free (a cover or fair-use image). It is not offered.</p><p><button class="btn" id="qsk" type="button">Skip for now (S)</button> <button class="btn" id="qnp" type="button">Not it (N)</button></p>')+'</div>'}
  return'<div class="qcand"><p class="tn">'+(g.s==="err"?"Wikipedia is not reachable ("+esc(g.m||"")+").":"No free photo found.")+' Paste an https address instead, or choose a file.</p></div>'}
 if(sg)h+='<p class="qsg">'+(sg.wiki?"Wikipedia has: ":"The timeline has: ")+'<b>'+esc(sg.v.length>220?sg.v.slice(0,220)+"...":sg.v)+'</b>'+(sg.exact||sg.wiki?"":' <small>(closest match: '+esc(sg.from)+')</small>')+(sg.wiki?' <small>('+esc(sg.from)+')</small>':"")+' <button class="btn" id="qu" type="button">Use this</button></p>';
 else if(/^(maker|rel|msrp)$/.test(f.k)||f.spec){var wf=w.f;h+=!wf?'<p><button class="btn" id="qw" type="button">Ask Wikipedia</button></p>':wf.s==="load"?'<p class="tn">Asking Wikipedia...</p>':wf.s==="err"?'<p class="tn">Wikipedia: '+esc(wf.m||"not reachable")+'</p>':'<p class="tn">Wikipedia ('+esc(wf.title)+') has no answer for this one.</p>'}
 return'<div class="qcand">'+h+'</div>'}
function qSide(){if(view!=="quest"||!host||!QS.cur)return;var el=$("qcand"),it=S.items[QS.cur.i];if(!el||!it)return;var cf=QS.cur.f;el.innerHTML=qCandHtml(it,cf);wireCand(it,cf)}
function qGo(it,f,v){var b4=qMeter(it),e=qApply(it,f,v);if(e){QS.msg={t:"err",m:e};QS.pop=0;render();return}qAfter(it,f,b4);render()}
function wireCand(it,f){var qu=$("qu");if(qu)qu.onclick=function(){qGo(it,f,qSuggest(it,f).v)};var qw=$("qw");if(qw)qw.onclick=function(){qWfacts(it);qSide()};
 document.querySelectorAll("[data-qc]").forEach(function(b){b.onclick=function(){candPick(it.id,+b.getAttribute("data-qc"));qSide()}});var qk=$("qk");if(qk)qk.onclick=function(){var g=QW[it.id].img,b4=qMeter(it);it.photos=(it.photos||[]).concat([g.url]);if(!it.credit)it.credit=g.credit;qAfter(it,f,b4);render()};
 var sk=$("qsk");if(sk)sk.onclick=function(){if(QS.mode==="photo")QS.defer[it.id]=++QS.dn;else QS.skip[it.id+"|photo"]=1;QS.msg={t:"ok",m:"Skipped for now. "+(QS.mode==="photo"?"It comes back after the other items.":"It comes back next visit.")};QS.pop=0;QT.streak=QT.streak;render()};
 var np=$("qnp");if(np)np.onclick=function(){QW[it.id].img={s:"none"};QS.skip[it.id+"|photo"]=1;QS.msg={t:"ok",m:"Next one."};QS.pop=0;render()}}
function qLoadDefaults(o){return Object.assign({xp:0,filled:0,streak:0,best:0,photos:0,full:0,specs:0,takes:0,days:0,goalHit:0,today:0,mute:false,badges:{},bosses:0,relics:{},dq:null,dqDone:0,speedBest:0,speedRuns:0},o||{})}
function questView(){if(!QT)QT=qLoad();var lv=qLvl(QT.xp),base=40*(lv-1)*(lv-1),nxt=40*lv*lv,pc=Math.round((QT.xp-base)*100/(nxt-base)),td=C.today(),tdn=QT.day===td?QT.today:0;
 var h='<p class="abar"><button class="btn" id="bk" type="button">Back to the list</button> <button class="btn'+(S.dirty?' pri':'')+'" id="sv" type="button"'+(busy||!S.dirty&&!S.photos.length?" disabled":"")+'>Review and save'+(S.qn?' ('+S.qn+' answers)':'')+'</button> <button class="chip" id="qsn" type="button">Sound: '+(QT.mute?"off":"on")+'</button></p>'
 +'<div class="qhud"><div class="qlv"><b>Level '+lv+': '+esc(QTITLES[Math.min(lv-1,QTITLES.length-1)])+'</b> <span class="mbar"><i style="width:'+pc+'%"></i></span> <small>'+QT.xp+' XP, '+(nxt-QT.xp)+' to next</small></div>'
 +'<div class="qstat"><span title="Answers in a row">Combo x'+QT.streak+'</span><span title="Fields filled today">Today '+Math.min(tdn,QGOAL)+'/'+QGOAL+'</span><span title="Days played in a row">Day streak '+(QT.days||0)+'</span><span>Total '+QT.filled+'</span></div>'
 +'<div class="qtrophy">'+QB.map(function(b){var on=QT.badges[b[0]];return'<span class="qbd'+(on?" on":"")+'" title="'+esc(b[1]+": "+b[2])+'">'+(on?qIc(b[3],18):'<small>?</small>')+'<small>'+esc(on?b[1]:"")+'</small></span>'}).join("")+'</div>'+dqHtml()+relicHtml()+'</div>';
 if(QS.award&&QS.award.length){h+='<div class="qaward">'+QS.award.map(function(a){return'<div>'+qIc(a.ic,28)+'<b>'+esc(a.n)+'</b> <small>'+esc(a.d)+'</small></div>'}).join("")+'</div>';QS.award=null}
 if(QS.boom){h+='<div class="qboom" aria-hidden="true">';for(var i=0;i<26;i++)h+='<i style="--x:'+(Math.round(Math.random()*100))+'%;--d:'+(Math.round(Math.random()*500))+'ms;--c:'+["#ff5555","#55ff55","#ffff55","#55ffff","#ff55ff","#5555ff"][i%6]+'"></i>';h+='</div>';QS.boom=0}
 if(QS.screen==="map"){QS.cur=null;var tiles=S.items.map(function(it){return{it:it,m:qMeter(it)}}).filter(function(x){return x.m.pct<100||QS.showDone}).sort(function(a,b){return b.m.pct-a.m.pct||a.it.name.localeCompare(b.it.name)});
  return shell(h+'<h3 class="sub">Pick your cartridge</h3><p class="tn">Every item is a cartridge waiting to be restored. The closer it is to done, the more color it gets back. Almost-finished ones are first.</p>'
   +'<div class="tools"><button class="chip on" data-qm="quick" type="button">Quick wins</button><button class="chip" data-qm="photo" type="button">Photo Safari</button><button class="chip" data-qm="random" type="button">Surprise me</button><button class="chip" data-qb="1" type="button">Boss Battle</button><button class="chip" data-qm="speed" type="button">Speed Round</button><button class="chip'+(QS.showDone?" on":"")+'" id="qsd" type="button">Show finished</button></div>'
   +(tiles.length?'<div class="qmap">'+tiles.map(function(x){return'<button class="qtile" data-qi="'+esc(x.it.id)+'" type="button">'+qPic(x.it,x.m)+'<b>'+esc(x.it.name)+'</b><span class="qst">'+qStars(x.m.pct)+' '+x.m.pct+'%</span></button>'}).join("")+'</div>':'<div class="qcard"><h3 class="qq">Every cartridge is restored!</h3></div>'));}
 if(QS.mode==="speed"){QS.cur=null;return shell(h+qTools()+spHtml())}
 var cur=QS.cur=qNext();
 h+=qTools();
 if(QS.done)h+='<div class="qwin"><b>'+qIc("trophy",28)+' ITEM RESTORED!</b> '+esc(QS.done.name)+' is 100% complete. ★★★</div>';
 if(QS.msg)h+='<div class="msg '+QS.msg.t+'" role="status">'+esc(QS.msg.m)+'</div>';
 QS.done=null;
 if(!cur)return shell(h+'<div class="qcard"><h3 class="qq">'+(QS.mode==="photo"?"No photos left to find.":QS.mode==="item"?"That cartridge is fully restored.":"Quest complete!")+'</h3><p>Nothing left in this mode. Press Save to GitHub to publish, or pick another mode.</p></div>');
 var it=S.items[cur.i],f=cur.f,m=qMeter(it),q=qx(f),inp;
 if(f.t==="a")inp='<textarea id="qv" placeholder="'+esc(f.ph||"")+'" style="min-height:110px"></textarea>';
 else if(f.t==="c")inp='<select id="qv">'+f.ch.map(function(c){return'<option>'+esc(c)+'</option>'}).join("")+'</select>';
 else inp='<input id="qv" placeholder="'+esc(f.ph||"")+'" autocomplete="off">'+(f.t==="p"?'<p><label for="qf">Or choose a picture from this device</label><input id="qf" type="file" accept="image/*"></p>':"");
 var nsp=qFields(it).filter(function(x){return x.spec&&!qNA(it,x)}),dsp=nsp.filter(function(x){return qHas(it,x)}).length;
 var chips=qFields(it).filter(function(x){return!x.spec&&!qNA(it,x)}).map(function(x){var d=qHas(it,x);return'<button class="qchip '+(d?"done":"blank")+(x.k===f.k?" now":"")+'" data-qk="'+esc(x.k)+'" type="button" title="'+esc(qx(x)[1])+'">'+qIc(qx(x)[0],14)+esc(qShort(x))+'</button>'}).join("")
  +(nsp.length?'<button class="qchip '+(dsp===nsp.length?"done":"blank")+(f.spec?" now":"")+'" data-qk="specs" type="button">'+qIc("chip",14)+'specs '+dsp+'/'+nsp.length+'</button>':"");
 return shell(h+bossBar(it)+'<div class="qplay"><div class="qside">'+qPic(it,m)+'<div class="qname"><b>'+esc(it.name)+'</b><br><small class="tn">'+esc(it.maker||"")+' '+esc(it.rel||it.year||"")+'</small></div><p class="qst">'+qStars(m.pct)+' '+mbar(m)+'</p><div class="qchips">'+chips+'</div>'
 +'<p class="tn"><button class="btn" id="qed" type="button">Open full editor</button></p></div>'
 +'<div class="qcard qmain">'+(QS.pop?'<span class="qpop">+'+QS.pop+' XP</span>':"")+(QT.streak>=3?'<span class="qcombo" style="font-size:'+Math.min(34,14+QT.streak)+'px">COMBO x'+QT.streak+'</span>':"")
 +'<div class="qkind">'+qIc(q[0],24)+' <b>'+esc(q[1])+'</b></div><h3 class="qq">'+esc(f.l)+' <span class="tag">+'+f.xp+' XP</span></h3><p class="qwh">'+esc(q[2])+'</p>'+(f.hint?'<p class="tn">'+esc(f.hint)+'</p>':"")
 +'<div id="qcand">'+qCandHtml(it,f)+'</div>'+inp
 +'<p class="abar"><button class="btn pri" id="qa" type="button">Save answer</button> <button class="btn" id="qs" type="button">Skip</button> <button class="btn" id="qn" type="button" title="Hide this field for this item">Does not apply</button></p></div></div>');QS.pop=0}
function wireQuest(){QS.pop=0;$("bk").onclick=function(){view="list";QS.msg=null;render()};$("sv").onclick=review;
 $("qsn").onclick=function(){QT.mute=!QT.mute;qStore();snd([660]);render()};
 host.querySelectorAll("[data-qm]").forEach(function(b){b.onclick=function(){QS.mode=b.dataset.qm;QS.screen="play";QS.pin=null;QS.msg=null;QS.skip={};QS.defer={};QS.boss=null;if(QS.mode==="speed")QS.sp=null;render()}});
 host.querySelectorAll("[data-qb]").forEach(function(b){b.onclick=function(){QS.msg=null;if(bossPick())QS.sp=null;render()}});
 if(QS.mode==="speed"&&QS.screen==="play"){var mb0=$("qmapb");if(mb0)mb0.onclick=function(){QS.screen="map";QS.pin=null;QS.msg=null;QS.boss=null;render()};wireSpeed();return}
 var sd=$("qsd");if(sd)sd.onclick=function(){QS.showDone=!QS.showDone;render()};
 host.querySelectorAll("[data-qi]").forEach(function(b){b.onclick=function(){QS.boss=null;QS.mode="item";QS.item=b.dataset.qi;QS.screen="play";QS.pin=null;QS.msg=null;render();window.scrollTo(0,0)}});
 var mb=$("qmapb");if(mb)mb.onclick=function(){QS.boss=null;QS.screen="map";QS.pin=null;QS.msg=null;render()};
 var cur=QS.cur;if(!cur)return;var it=S.items[cur.i],f=cur.f;
 host.querySelectorAll("[data-qk]").forEach(function(b){b.onclick=function(){QS.pin={id:it.id,k:b.dataset.qk};if(QS.mode!=="item"){QS.mode="item";QS.item=it.id}QS.msg=null;render()}});
 $("qed").onclick=function(){editing={i:cur.i,it:clone(S.items[cur.i]),newPhotos:[],priv:{}};if(!editing.it.photos)editing.it.photos=[];view="edit";note=null;render();window.scrollTo(0,0)};
 $("qa").onclick=function(){qGo(it,f,$("qv").value)};
 $("qv").onkeydown=function(e){if(e.key==="Enter"&&(f.t!=="a"||e.ctrlKey||e.metaKey)){e.preventDefault();$("qa").click()}};

 wireCand(it,f);
 $("qs").onclick=function(){QS.skip[it.id+"|"+f.k]=1;QT.streak=0;qStore();QS.msg={t:"ok",m:"Skipped. It comes back next visit."};QS.pin=null;snd([220]);render()};
 $("qn").onclick=function(){it.na=(it.na||[]).concat([f.k]);S.dirty=true;QS.msg={t:"ok",m:"Marked as not applicable for "+it.name+"."};QS.pin=null;render()};
 var qf=$("qf");if(qf)qf.onchange=function(e){var fl=e.target.files[0];if(!fl)return;shrink(fl).then(function(d){var b4=qMeter(it),path="photos/"+slug(it.id)+"-"+Date.now().toString(36)+".jpg";S.photos.push({path:path,b64:d.split(",")[1]});it.photos=(it.photos||[]).concat([path]);qAfter(it,f,b4);render()},function(er){QS.msg={t:"err",m:er.message};render()})};
 if(f.k==="photo")qWimg(it),qSide();
 if(!busy&&!(f.k==="photo"&&QW[it.id]&&QW[it.id].img&&QW[it.id].img.s==="ok"))$("qv").focus()}
function bulkFill(){var n=0,it2=0;S.items.forEach(function(it){var c=0;qFields(it).forEach(function(f){if(f.t==="p"||qNA(it,f)||qHas(it,f))return;var sg=qSuggest(it,f);if(sg&&sg.exact&&!qApply(it,f,sg.v))c++});if(c){n+=c;it2++}});
 if(n){S.dirty=true;note={t:"ok",m:"Filled "+n+" blank fields on "+it2+" items from the timeline. Look them over, then Save to GitHub."}}else note={t:"ok",m:"Nothing to fill: every blank field has no exact timeline match."};render()}
function qaddMake(name,r,ty){var it={type:ty||"Computer",photos:[],name:name};if(r)tlItem(it,r);else it.cat=CATMAP[it.type]||(it.type+"s");
 var id=slug(it.name)||"item",base=id,n=2;while(S.items.some(function(x){return x.id===id}))id=base+"-"+n++;it.id=id;it.audio=[];S.items.push(it);S.dirty=true;
 QS.mode="item";QS.item=id;QS.screen="play";QS.pin=null;QS.skip={};QS.msg={t:"ok",m:"Added "+it.name+" to the catalog. Now the fun part: fill in the blanks."};QA=null;view="quest";note=null;render();window.scrollTo(0,0)}
function qaddHtml(){var h='<div class="qadd"><label for="qan">Quick add: type a name, press Enter</label><div class="abar"><input id="qan" placeholder="Voodoo2, Sony Mavica FD7, Sega Saturn..." value="'+esc(QA?QA.q:"")+'"><button class="btn pri" id="qab" type="button">Quick add</button></div>';
 if(QA){h+='<div class="qres"><p class="tn">Pick the closest timeline entry and I will pre-fill it, or create a blank one.</p>'+QA.res.map(function(x,i){return'<button class="btn" data-qr="'+i+'" type="button">'+esc(x.r[2])+' <small>('+esc(x.r[0])+')</small></button>'}).join(" ")
  +'<p><label for="qat">Blank item type</label> <select id="qat">'+Object.keys(C.SPEC_TYPES).map(function(k){return'<option'+(k==="Computer"?" selected":"")+'>'+esc(k)+'</option>'}).join("")+'</select> <button class="btn" id="qbk" type="button">Create blank "'+esc(QA.q)+'"</button></p></div>'}
 return h+'</div>'}
/* ---------- GitHub text files, photo audit, timeline photo safari, health check, review ---------- */
function ghText(path){var u=repo()+"/contents/"+path+"?ref="+enc(C.REPO.branch);return gh(u).then(function(m){if(!m.ok)throw new Error(errText(m));return gh(u,{accept:"application/vnd.github.raw+json",text:true}).then(function(t){if(!t.ok)throw new Error(errText(t));return{sha:m.json.sha,text:t.text}})})}
function ghPut(path,text,sha,msg){return gh(repo()+"/contents/"+path,{method:"PUT",body:{message:msg,content:b64enc(text),branch:C.REPO.branch,sha:sha}}).then(function(r){if(!r.ok)throw new Error(errText(r));return r})}
function cimgRemove(text,titles){var set={};titles.forEach(function(t){set[t]=1});var out=[];text.split("\n").forEach(function(l){var m=/^"((?:[^"\\]|\\.)*)":\[/.exec(l);if(m){var k;try{k=JSON.parse('"'+m[1]+'"')}catch(e){k=m[1]}if(set[k])return}out.push(l)});return out.join("\n").replace(/,(\s*\n\};)/,"$1")}
function cimgAdd(text,map){var i=text.indexOf("var CIMG={"),j=text.indexOf("\n};",i);if(i<0||j<0)throw new Error("images-data.js has an unexpected layout");var add="";Object.keys(map).forEach(function(k){add+=",\n"+JSON.stringify(k)+":"+JSON.stringify(map[k])});return text.slice(0,j)+add+text.slice(j)}
function imgTest(u,ms){return new Promise(function(res){var im=new Image(),done=false,t=setTimeout(function(){fin("timeout")},ms||15000);function fin(s){if(done)return;done=true;clearTimeout(t);res(s)}im.onload=function(){fin("ok")};im.onerror=function(){fin("broken")};im.referrerPolicy="no-referrer";im.src=u})}
function pool(list,n,fn){var i=0;function run(){if(i>=list.length)return Promise.resolve();var k=i++;return fn(list[k],k).then(run)}var ws=[];for(var j=0;j<n;j++)ws.push(run());return Promise.all(ws)}
function fin(m){note={t:"ok",m:m}}
/* photo audit */
var PA={res:{},run:0};
function auditTargets(){var t=[];S.items.forEach(function(it){(it.photos||[]).forEach(function(p,i){var u=C.safeUrl(p,"img");if(u)t.push({k:"i:"+it.id+":"+i,u:u,label:it.name,kind:"item",id:it.id})})});if(typeof CIMG!=="undefined")Object.keys(CIMG).forEach(function(k){t.push({k:"c:"+k,u:cimgUrl(k,160),label:k,kind:"cimg"})});return t}
function potwHtml(){var q=tlsQueue();if(!q.length)return"";var wk=Math.floor(Date.now()/6048e5),c=q[wk%Math.min(q.length,40)].r;return'<div class="qhero"><div><b>Photo of the week: '+esc(c[2])+'</b><br><small class="tn">'+esc(c[0])+' has no real photo on the timeline yet. One free Commons photo finishes this week\'s goal.</small></div><button class="btn pri" id="potw" data-t="'+esc(c[2])+'" type="button">Find it now</button></div>'}
function tlHw(){return C.TL.filter(function(r){return/^(hw|pe)$/.test(r[1])})}
function auditView(){var ts=auditTargets(),done=ts.filter(function(t){return PA.res[t.k]}).length,bad=ts.filter(function(t){return PA.res[t.k]&&PA.res[t.k]!=="ok"}),nop=S.items.filter(function(it){return!(it.photos||[]).length}),hw=tlHw(),have=hw.filter(function(r){return typeof CIMG!=="undefined"&&CIMG[r[2]]}).length;
 return shell('<p class="abar"><button class="btn" id="bk" type="button">Back to the list</button></p><h3 class="sub">Photo audit</h3>'
 +'<div class="qhero"><div><b>Timeline hardware with a real photo</b> '+mbar({done:have,total:hw.length,pct:Math.round(have*100/Math.max(1,hw.length))})+'<br><small class="tn">'+have+' of '+hw.length+'. The rest show drawn art.</small></div><button class="btn pri" id="gtls" type="button">Find more (Timeline Photo Safari)</button></div>'
 +'<p>Catalog items without a photo: <b>'+nop.length+'</b> of '+S.items.length+'. '+(nop.length?'<button class="btn" id="qph" type="button">Photo Safari for items</button>':"")+'</p>'
 +'<p>The audit loads every photo link here, in your browser, where Wikimedia is reachable: '+ts.length+' images. '+(PA.run?'Testing '+done+' of '+ts.length+'...':'<button class="btn pri" id="parun" type="button">Run the audit</button>')+'</p>'
 +(done?'<p><b>'+(done-bad.length)+'</b> load fine, <b>'+bad.length+'</b> do not.</p>':"")
 +(bad.length?bad.map(function(t){return'<div class="row"><span><b>'+esc(t.label)+'</b> <small class="tn">'+(t.kind==="cimg"?"timeline photo":"catalog photo")+', '+esc(PA.res[t.k])+'</small></span>'+(t.kind==="item"?'<button class="btn" data-he="'+esc(t.id)+'" type="button">Edit</button>':"")+'</div>'}).join("")+(bad.some(function(t){return t.kind==="cimg"})?'<p><button class="btn danger" id="pafix" type="button">Remove the broken timeline photos from images-data.js</button></p>':""):""))}
function auditRun(){var ts=auditTargets();PA.run=1;PA.res={};render();pool(ts,6,function(t){return imgTest(t.u).then(function(r){PA.res[t.k]=r;if(view==="audit"&&Object.keys(PA.res).length%15===0)render()})}).then(function(){PA.run=0;if(view==="audit")render()})}
function auditFix(){var bad=auditTargets().filter(function(t){return t.kind==="cimg"&&PA.res[t.k]&&PA.res[t.k]!=="ok"}).map(function(t){return t.label});if(!bad.length||busy)return;if(!confirm("Remove "+bad.length+" broken photo links from images-data.js? They will show drawn art instead."))return;
 busy=true;fin("Updating images-data.js...");render();ghText("images-data.js").then(function(f){return ghPut("images-data.js",cimgRemove(f.text,bad),f.sha,"Admin: remove "+bad.length+" broken photo links")}).then(function(){bad.forEach(function(k){delete CIMG[k]});fin("Removed "+bad.length+" broken links. The site updates in a minute or two.")}).catch(function(e){note={t:"err",m:String(e.message||e)}}).then(function(){busy=false;render()})}
/* timeline photo safari: find a free Wikipedia/Commons photo for every timeline hardware entry */
var TLS={rej:{},kept:0,sk:{},sn:0,hist:[],combo:0,msg:null};
function tlsQueue(){var ord={"Console or handheld":0,"Computer":1,"Digital camera":2,"Media player":3,"Expansion card":4,"Sound or MIDI":5},X=C.TLX||{};return tlHw().filter(function(r){return!(typeof CIMG!=="undefined"&&CIMG[r[2]])&&!TLS.rej[r[2]]}).map(function(r){var x=X[r[2]]||{};return{r:r,o:ord[x.type]!=null?ord[x.type]:9}}).sort(function(a,b){return(TLS.sk[a.r[2]]||0)-(TLS.sk[b.r[2]]||0)||a.o-b.o||(a.r[0]<b.r[0]?-1:1)})}
function tlsCand(t){var g=(QW["t:"+t]||{}).img;if(!g||g.s==="load")return'<p class="tn">Searching Wikipedia...</p>';
 if(g.s==="ok"){return'<figure class="qcimg"><img src="'+esc(C.safeUrl(g.url,"img"))+'" alt="Candidate photo" referrerpolicy="no-referrer"><figcaption><small>'+esc(g.why)+'. <a href="'+esc(C.safeUrl(g.page,"link"))+'" target="_blank" rel="noopener noreferrer">File page</a></small></figcaption></figure>'
  +candStrip("t:"+t,"data-tc")+(g.free?'<p><button class="btn pri" id="tk" type="button">Yes, that is it (K)</button> <button class="btn" id="ts" type="button" title="Come back to this one later">Skip for now (S)</button> <button class="btn" id="tn" type="button">Not it (N)</button></p>':'<p class="msg err">That image looks non-free, so it is not offered.</p><p><button class="btn" id="ts" type="button">Skip for now (S)</button> <button class="btn" id="tn" type="button">Next (N)</button></p>')}
 return'<p class="tn">'+(g.s==="err"?"Wikipedia is not reachable ("+esc(g.m||"")+").":"No free photo found.")+'</p><p><button class="btn" id="tn" type="button">Next (N)</button></p>'}
function tlsView(){if(!QT)QT=qLoad();var q=tlsQueue(),cur=q[0],n=Object.keys(S.cimgAdd||{}).length,hw=tlHw(),have=hw.filter(function(r){return typeof CIMG!=="undefined"&&CIMG[r[2]]}).length;
 var h='<p class="abar"><button class="btn" id="bk" type="button">Back to the list</button> <button class="btn" id="tu" type="button"'+(TLS.hist.length?"":" disabled")+'>Undo last keep (U)</button> <button class="btn'+(n?' pri':'')+'" id="tsave" type="button"'+(n&&!busy?"":" disabled")+'>Save '+n+' photo'+(n===1?"":"s")+' to GitHub</button></p><h3 class="sub">Timeline Photo Safari</h3><div class="qhud"><div class="qstat"><span>Combo x'+TLS.combo+'</span><span>Kept this session '+TLS.kept+'</span><span>XP '+QT.xp+'</span><span title="Each kept photo has a 1 in 6 chance of dropping a relic">Relic chance 1 in 6</span></div>'+dqHtml()+'</div>'+(TLS.msg?'<div class="msg ok" role="status">'+esc(TLS.msg)+'</div>':'')
 +'<div class="qhero"><div><b>Real photos on the timeline</b> '+mbar({done:have,total:hw.length,pct:Math.round(have*100/Math.max(1,hw.length))})+'<br><small class="tn">'+have+' of '+hw.length+' hardware entries. '+q.length+' left to try. Only free-licensed Wikimedia Commons images are offered.</small></div></div>';
 if(!cur)return shell(h+'<div class="qcard"><h3 class="qq">Every hardware entry has been tried.</h3></div>');
 var r=cur.r,x=(C.TLX||{})[r[2]]||{};
 return shell(h+'<div class="qcard"><div class="qitem"><b>'+esc(r[2])+'</b> <small class="tn">'+esc(r[0])+' '+esc(x.maker||"")+' '+esc(x.type||"")+'</small></div><h3 class="qq">Is this a photo of it?</h3><p class="qwh">Check that it shows this product (or a close sibling). Up to 8 candidates from Wikipedia and Commons are ranked by how well their titles match; pick the best thumbnail.</p><div id="tlcand">'+tlsCand(r[2])+'</div></div>')}
function tlsRefresh(){var q=tlsQueue()[0];if(!q||view!=="tlsafari")return;var el=$("tlcand");if(!el)return;el.innerHTML=tlsCand(q.r[2]);wireTls(q.r[2])}
function wireTls(t){document.querySelectorAll("[data-tc]").forEach(function(b){b.onclick=function(){candPick("t:"+t,+b.getAttribute("data-tc"));tlsRefresh()}});var k=$("tk");if(k)k.onclick=function(){var g=QW["t:"+t].img;S.cimgAdd=S.cimgAdd||{};var cap=g.src==="Commons"||(g.atitle&&g.atitle.toLowerCase()===t.toLowerCase())?"A "+t:'The Wikipedia photo for "'+(g.atitle||t)+'" (family or related model)';S.cimgAdd[t]=[g.fn,cap.replace(/[<>&"]/g,"")];if(typeof CIMG!=="undefined")CIMG[t]=S.cimgAdd[t];if(!QT)QT=qLoad();TLS.combo++;TLS.kept++;TLS.hist.push(t);var gain=8+Math.min(TLS.combo,5);QT.xp+=gain;QT.photos++;var ex=[],msg="+"+gain+" XP"+(TLS.combo>=3?" (combo x"+TLS.combo+")":"");if(Math.random()<1/6){var rl=relicDrop();ex.push({n:rl[1],d:rl[2]+" relic",ic:rl[3]});msg+=". Relic found: "+rl[1]+"!"}dqBump("photos",1,ex);qBadges().forEach(function(b){ex.push(b)});QS.award=null;TLS.msg=msg+(ex.length?" "+ex.map(function(a){return a.n}).join(", ")+".":"");qStore();snd([660,880]);render()};
 var sk=$("ts");if(sk)sk.onclick=function(){TLS.sk[t]=++TLS.sn;TLS.msg="Skipped "+t+" for now. It comes back after the others.";render()};
 var n=$("tn");if(n)n.onclick=function(){TLS.rej[t]=1;TLS.combo=0;TLS.msg=null;render()}}
function wireTlsView(){$("bk").onclick=function(){view="list";render()};$("tsave").onclick=tlsSave;
 $("tu").onclick=function(){var t=TLS.hist.pop();if(!t)return;delete S.cimgAdd[t];if(typeof CIMG!=="undefined")delete CIMG[t];QT.xp=Math.max(0,QT.xp-8);QT.photos=Math.max(0,QT.photos-1);TLS.kept=Math.max(0,TLS.kept-1);TLS.combo=0;TLS.sk[t]=-1;TLS.msg="Undid the photo for "+t+". It is back on top.";qStore();render()};
 var q=tlsQueue()[0];if(!q)return;var t=q.r[2];wireTls(t);if(!QW["t:"+t])wimgLoad("t:"+t,t,tlsRefresh,((C.TLX||{})[t]||{}).maker)}
function tlsSave(){var m=S.cimgAdd||{},ks=Object.keys(m);if(!ks.length||busy)return;busy=true;fin("Saving "+ks.length+" photo links to images-data.js...");render();
 ghText("images-data.js").then(function(f){return ghPut("images-data.js",cimgAdd(cimgRemove(f.text,ks),m),f.sha,"Admin: add "+ks.length+" timeline photos")}).then(function(){S.cimgAdd={};fin("Saved "+ks.length+" photo links. The site shows them in a minute or two.")}).catch(function(e){note={t:"err",m:String(e.message||e)}}).then(function(){busy=false;render()})}
/* health check */
function healthView(){var it=S.items,rows=[],nk2=function(s){return nk(s).replace(/ copy( \d+)?$/,"")};
 function sec(t,why,list,fn){return'<h3 class="sub">'+esc(t)+' ('+list.length+')</h3><p class="tn">'+esc(why)+'</p>'+(list.length?list.slice(0,12).map(fn).join("")+(list.length>12?'<p class="tn">and '+(list.length-12)+' more.</p>':""):'<p class="tn">None. Nice.</p>')}
 function irow(x,w){return'<div class="row"><span><b>'+esc(x.name)+'</b> <small class="tn">'+esc(w||"")+'</small></span><span class="rb"><button class="btn" data-hq="'+esc(x.id)+'" type="button">Quest</button> <button class="btn" data-he="'+esc(x.id)+'" type="button">Edit</button></span></div>'}
 var seen={},dups=[];it.forEach(function(x){var k=nk2(x.name);if(seen[k])dups.push([seen[k],x]);else seen[k]=x});
 var incomplete=it.map(function(x){return{x:x,m:qMeter(x)}}).filter(function(o){return o.m.pct<50}).sort(function(a,b){return a.m.pct-b.m.pct});
 var names=it.map(function(x){return nk(x.name)});
 var gap=tlHw().filter(function(r){var x=(C.TLX||{})[r[2]]||{};return/^(Computer|Console or handheld|Digital camera|Media player)$/.test(x.type)&&!names.some(function(n){var t=nk(r[2]);return n===t||n.indexOf(t)>=0||t.indexOf(n)>=0})}).sort(function(a,b){return(typeof CIMG!=="undefined"&&CIMG[b[2]]?1:0)-(typeof CIMG!=="undefined"&&CIMG[a[2]]?1:0)||(a[0]<b[0]?-1:1)});
 var A=it.filter(function(x){return x.relx}),B=it.filter(function(x){return/estimat|\*\s*$|about|approx/i.test(x.msrp||"")}),Cn=it.filter(function(x){return!qTL(x)}),D=it.filter(function(x){return!(x.photos||[]).length});
 return shell('<p class="abar"><button class="btn" id="bk" type="button">Back to the list</button></p><h3 class="sub">Health check</h3>'
 +'<div class="qhero"><div><b>'+it.length+' items</b><br><small class="tn">'+D.length+' without a photo, '+incomplete.length+' under half complete, '+dups.length+' possible duplicates.</small></div></div>'
 +sec("Under half complete","Quickest wins for the quest.",incomplete,function(o){return irow(o.x,o.m.pct+"% complete")})
 +sec("Unconfirmed release dates","Marked with an asterisk on the site. Add a source and clear the flag.",A,function(x){return irow(x,x.rel||x.year)})
 +sec("Estimated prices","The MSRP text says estimated, about or ends with a star.",B,function(x){return irow(x,x.msrp)})
 +sec("Possible duplicates","Same name after removing 'copy'.",dups,function(p){return irow(p[1],"same name as "+p[0].id)})
 +sec("Not found on the timeline","The quest cannot suggest answers for these. Check the spelling against the timeline title.",Cn,function(x){return irow(x,"no timeline match")})
 +sec("No photo","Photo Safari finds free ones.",D,function(x){return irow(x,"")})
 +'<h3 class="sub">On the timeline, not in your museum ('+gap.length+')</h3><p class="tn">Computers, consoles, cameras and players. Ones with a real photo are listed first.</p>'
 +gap.slice(0,12).map(function(r){return'<div class="row"><span><b>'+esc(r[2])+'</b> <small class="tn">'+esc(r[0].slice(0,4))+((typeof CIMG!=="undefined"&&CIMG[r[2]])?", has a photo":"")+'</small></span><button class="btn" data-ha="'+esc(r[2])+'" type="button">Add to museum</button></div>'}).join(""))}
/* review before saving, with per-item revert */
function diffItems(){var o={},n={},d={add:[],del:[],chg:[]};S.orig.forEach(function(x){o[x.id]=x});S.items.forEach(function(x){n[x.id]=x;if(!o[x.id])d.add.push(x);else{var ch=[],a=o[x.id];Object.keys(Object.assign({},a,x)).forEach(function(k){if(k==="privEnc")return;var p=sj(a[k]),q=sj(x[k]);if(p!==q)ch.push([k,p,q])});if(ch.length)d.chg.push({it:x,ch:ch})}});S.orig.forEach(function(x){if(!n[x.id])d.del.push(x)});return d}
function sj(v){return JSON.stringify(v,function(k,val){if(val&&typeof val==="object"&&!Array.isArray(val)){var o={};Object.keys(val).sort().forEach(function(x){o[x]=val[x]});return o}return val})}
function sh(j){j=j==null?"(blank)":String(j);return j.length>90?j.slice(0,90)+"...":j}
function reviewView(){var d=diffItems(),h='<p class="abar"><button class="btn" id="bk" type="button">Back</button> <button class="btn pri" id="rvok" type="button"'+(busy?" disabled":"")+'>Confirm: save to GitHub</button></p><h3 class="sub">Review before saving</h3>'
 +'<p><b>'+d.add.length+'</b> added, <b>'+d.chg.length+'</b> changed, <b>'+d.del.length+'</b> removed'+(S.photos.length?', '+S.photos.length+' photo file(s) to upload':"")+'. Nothing is published until you confirm.</p>';
 d.add.forEach(function(x){h+='<div class="row"><span>+ <b>'+esc(x.name)+'</b> <small class="tn">new item</small></span></div>'});
 d.del.forEach(function(x){h+='<div class="row"><span>- <b>'+esc(x.name)+'</b> <small class="tn">removed</small></span><button class="btn" data-rs="'+esc(x.id)+'" type="button">Restore</button></div>'});
 d.chg.forEach(function(c){h+='<details class="rvd" open><summary><b>'+esc(c.it.name)+'</b> <small class="tn">'+c.ch.length+' field'+(c.ch.length===1?"":"s")+' changed</small> <button class="btn" data-rv="'+esc(c.it.id)+'" type="button">Revert this item</button></summary><table class="rvt"><tbody>'+c.ch.map(function(f){return'<tr><th>'+esc(f[0])+'</th><td><del>'+esc(sh(f[1]))+'</del></td><td><ins>'+esc(sh(f[2]))+'</ins></td></tr>'}).join("")+'</tbody></table></details>'});
 if(!d.add.length&&!d.del.length&&!d.chg.length)h+='<p class="empty">No item changes'+(S.photos.length?", only photo uploads":"")+'.</p>';return shell(h)}
function review(){if(!S.dirty&&!S.photos.length)return;view="review";note=null;render();window.scrollTo(0,0)}
function wireMisc(){var bk=$("bk");if(bk)bk.onclick=function(){view="list";render()};
 host.querySelectorAll("[data-he]").forEach(function(b){b.onclick=function(){var i=S.items.findIndex(function(x){return x.id===b.dataset.he});if(i<0)return;editing={i:i,it:clone(S.items[i]),newPhotos:[],priv:{}};if(!editing.it.photos)editing.it.photos=[];view="edit";note=null;render();window.scrollTo(0,0)}});
 host.querySelectorAll("[data-hq]").forEach(function(b){b.onclick=function(){QS.mode="item";QS.item=b.dataset.hq;QS.screen="play";QS.pin=null;QS.msg=null;QS.skip={};view="quest";render();window.scrollTo(0,0)}});
 host.querySelectorAll("[data-ha]").forEach(function(b){b.onclick=function(){var r=C.TL.filter(function(x){return x[2]===b.dataset.ha})[0];if(r)qaddMake(r[2],r)}});
 var g=$("gtls");if(g)g.onclick=function(){view="tlsafari";render();window.scrollTo(0,0)};
 var p=$("qph");if(p)p.onclick=function(){QS.mode="photo";QS.screen="play";QS.skip={};QS.msg=null;view="quest";render()};
 var pr=$("parun");if(pr)pr.onclick=auditRun;var pf=$("pafix");if(pf)pf.onclick=auditFix;
 var ok=$("rvok");if(ok)ok.onclick=save;
 var upd=function(){var d=diffItems();S.dirty=!!(d.add.length||d.del.length||d.chg.length);render()};
 host.querySelectorAll("[data-rv]").forEach(function(b){b.onclick=function(){var i=S.items.findIndex(function(x){return x.id===b.dataset.rv}),o=S.orig.filter(function(x){return x.id===b.dataset.rv})[0];if(i>=0&&o){S.items[i]=clone(o);upd()}}});
 host.querySelectorAll("[data-rs]").forEach(function(b){b.onclick=function(){var o=S.orig.filter(function(x){return x.id===b.dataset.rs})[0];if(o){S.items.push(clone(o));upd()}}})}
/* ---------- bulk tools: CSV, bulk edit, duplicates, backup, activity log ---------- */
var CSVC=["id","name","type","maker","model","year","rel","msrp","cat","cond","works","status","country","tags","text"],ALK="cm-admin-log";
var TOOLS={imp:null,bf:"maker",bv:"",bm:"all",bq:"",msg:null};
function alog(d,ph){try{var l=JSON.parse(localStorage.getItem(ALK)||"[]");l.unshift({t:Date.now(),a:d.add.length,c:d.chg.length,r:d.del.length,p:ph,n:S.items.length});localStorage.setItem(ALK,JSON.stringify(l.slice(0,40)))}catch(e){}}
function csvParse(t){var rows=[],r=[],f="",q=false;for(var i=0;i<t.length;i++){var c=t[i];if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i++}else q=false}else f+=c}else if(c==='"')q=true;else if(c===","){r.push(f);f=""}else if(c==="\n"||c==="\r"){if(c==="\r"&&t[i+1]==="\n")i++;r.push(f);rows.push(r);r=[];f=""}else f+=c}if(f!==""||r.length){r.push(f);rows.push(r)}return rows.filter(function(r){return r.some(function(x){return x.trim()})})}
function csvCell(v){v=v==null?"":Array.isArray(v)?v.join("; "):String(v);if(/^[=+\-@]/.test(v)&&!/^-?\d+(\.\d+)?$/.test(v))v="'"+v;return/[",\n\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}
function csvOut(){return"﻿"+CSVC.join(",")+"\r\n"+S.items.map(function(it){return CSVC.map(function(c){return csvCell(it[c])}).join(",")}).join("\r\n")+"\r\n"}
function dlFile(name,text,type){var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type:type||"text/plain"}));a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},3000)}
function csvPlan(text){var rows=csvParse(text.replace(/^﻿/,""));if(rows.length<2)return{err:"The file has no data rows."};var hd=rows[0].map(function(h){return h.trim().toLowerCase()}),ix={};CSVC.forEach(function(c){var k=hd.indexOf(c);if(k>=0)ix[c]=k});if(ix.id==null&&ix.name==null)return{err:"The first row must include an id or name column."};
 var add=[],upd=[],bad=0;rows.slice(1).forEach(function(r){var o={};Object.keys(ix).forEach(function(c){var v=(r[ix[c]]||"").trim().replace(/^'(?=[=+\-@])/,"");if(v)o[c]=v});if(o.year!=null){var y=+o.year;if(isFinite(y)&&y>=1900&&y<=2100)o.year=y;else{delete o.year;bad++}}if(o.rel&&!/^\d{4}(-\d\d(-\d\d)?)?$/.test(o.rel)){delete o.rel;bad++}if(o.tags)o.tags=o.tags.split(/[;,]/).map(function(t){return t.trim()}).filter(Boolean);
  var hit=o.id?S.items.filter(function(x){return x.id===o.id})[0]:o.name?S.items.filter(function(x){return nk(x.name)===nk(o.name)})[0]:null;if(hit){var o2={};Object.keys(o).forEach(function(c){if(c!=="id"&&JSON.stringify(hit[c])!==JSON.stringify(o[c])&&String(hit[c]==null?"":hit[c])!==String(o[c]))o2[c]=o[c]});if(Object.keys(o2).length)upd.push({it:hit,o:o2})}else if(o.name)add.push(o);else bad++});return{add:add,upd:upd,bad:bad}}
function csvApply(p){var n=0;p.upd.forEach(function(u){Object.keys(u.o).forEach(function(c){if(c!=="id"){u.it[c]=u.o[c];n++}})});p.add.forEach(function(o){var it={type:o.type||"Other",photos:[],audio:[]};Object.keys(o).forEach(function(c){if(c!=="id")it[c]=o[c]});it.cat=it.cat||CATMAP[it.type]||(it.type+"s");var base=slug(o.id||it.name)||"item",id=base,k=2;while(S.items.some(function(x){return x.id===id}))id=base+"-"+k++;it.id=id;S.items.push(it)});S.dirty=true;return n}
function bulkMatch(it){var q=TOOLS.bq.toLowerCase().trim(),m=TOOLS.bm;if(m==="all")return true;if(m==="name")return q&&it.name.toLowerCase().indexOf(q)>=0;if(m==="maker")return q&&(it.maker||"").toLowerCase()===q;if(m==="type")return q&&(it.type||"").toLowerCase()===q;if(m==="cat")return q&&(it.cat||"").toLowerCase()===q;if(m==="tag")return q&&(it.tags||[]).some(function(t){return t.toLowerCase()===q});if(m==="nophoto")return!(it.photos||[]).length;return false}
function dupGroups(){var g={},seen={},out=[];function add(k,it){(g[k]=g[k]||[]).push(it)}S.items.forEach(function(it){var n=nk(it.name).replace(/ copy( \d+)?$/,"");if(n)add("name: "+it.name,{k:"n"+n,it:it});if(it.partno)add("part number: "+it.partno,{k:"p"+nk(it.partno),it:it});if(it.upc)add("barcode: "+it.upc,{k:"u"+it.upc,it:it})});
 var by={};S.items.forEach(function(it){var n="n"+nk(it.name).replace(/ copy( \d+)?$/,""),ks=[n];if(it.partno)ks.push("p"+nk(it.partno));if(it.upc)ks.push("u"+it.upc);ks.forEach(function(k){(by[k]=by[k]||[]).push(it)})});
 Object.keys(by).forEach(function(k){var l=by[k];if(l.length<2)return;var sig=l.map(function(x){return x.id}).sort().join("|");if(seen[sig])return;seen[sig]=1;out.push({why:k[0]==="n"?"same name":k[0]==="p"?"same part number":"same barcode",l:l})});return out}
function toolsView(){var dg=dupGroups(),log=[];try{log=JSON.parse(localStorage.getItem(ALK)||"[]")}catch(e){}var P=TOOLS.imp,f=function(v){return esc(v)};
 var matched=S.items.filter(bulkMatch),h='<p class="abar"><button class="btn" id="bk" type="button">Back to the list</button></p><h3 class="sub">Bulk tools</h3>'+(TOOLS.msg?'<div class="msg '+TOOLS.msg.t+'" role="status">'+esc(TOOLS.msg.m)+'</div>':"")
  +'<div class="qhero"><div><b>Backup and spreadsheet</b><br><small class="tn">Your catalog is only ever in GitHub and this page. Take copies. The CSV opens in Excel or Sheets.</small></div><span><button class="btn pri" id="tbk" type="button">Download full backup (.json)</button> <button class="btn" id="tcsv" type="button">Export CSV</button> <button class="btn" id="tjs" type="button">Download items.js</button></span></div>'
  +'<h3 class="sub">Import from CSV</h3><p class="tn">Columns: '+CSVC.join(", ")+'. Rows that match an existing id or name update only the columns you fill in. Others become new items. Nothing is saved to GitHub until you review and confirm.</p><p><input id="tcf" type="file" accept=".csv,text/csv"></p>'
  +(P&&P.err?'<div class="msg err">'+esc(P.err)+'</div>':P?'<div class="msg ok"><b>'+P.add.length+'</b> new, <b>'+P.upd.length+'</b> to update'+(P.bad?', '+P.bad+' value(s) skipped as invalid':"")+'. <button class="btn pri" id="tapply" type="button">Apply to the catalog</button> <button class="btn" id="tcancel" type="button">Cancel</button></div>'+(P.add.length?'<p class="tn">New: '+P.add.slice(0,8).map(function(o){return f(o.name)}).join(", ")+(P.add.length>8?"...":"")+'</p>':""):"")
  +'<h3 class="sub">Bulk edit</h3><div class="tools"><label>Match <select id="tbm">'+[["all","every item"],["name","name contains"],["maker","maker is"],["type","type is"],["cat","category is"],["tag","has tag"],["nophoto","has no photo"]].map(function(o){return'<option value="'+o[0]+'"'+(TOOLS.bm===o[0]?" selected":"")+'>'+o[1]+'</option>'}).join("")+'</select></label> <input id="tbq" placeholder="text to match" value="'+esc(TOOLS.bq)+'"'+(/^(all|nophoto)$/.test(TOOLS.bm)?" disabled":"")+'> <label>Set <select id="tbf">'+[["maker","maker"],["cat","category"],["type","type"],["cond","condition"],["works","working status"],["status","status"],["country","country"],["addtag","add tag"],["rmtag","remove tag"]].map(function(o){return'<option value="'+o[0]+'"'+(TOOLS.bf===o[0]?" selected":"")+'>'+o[1]+'</option>'}).join("")+'</select></label> to <input id="tbv" value="'+esc(TOOLS.bv)+'"> <button class="btn pri" id="tbgo" type="button"'+(matched.length&&TOOLS.bv.trim()?"":" disabled")+'>Apply to '+matched.length+' item'+(matched.length===1?"":"s")+'</button></div><p class="tn">'+(matched.length?matched.slice(0,6).map(function(x){return f(x.name)}).join(", ")+(matched.length>6?" and "+(matched.length-6)+" more":""):"No items match.")+'</p>'
  +'<h3 class="sub">Possible duplicates ('+dg.length+')</h3>'+(dg.length?dg.slice(0,15).map(function(g){return'<div class="row"><span><small class="tn">'+g.why+'</small><br>'+g.l.map(function(x){return'<b>'+f(x.name)+'</b> <small class="tn">'+f(x.id)+'</small> <button class="btn" data-he="'+f(x.id)+'" type="button">Edit</button>'}).join(" ")+'</span></div>'}).join(""):'<p class="tn">None found. Nice.</p>')
  +'<h3 class="sub">Activity log</h3>'+(log.length?'<table class="rvt"><tbody>'+log.slice(0,15).map(function(l){return'<tr><th>'+esc(new Date(l.t).toLocaleString())+'</th><td>'+l.a+' added, '+l.c+' changed, '+l.r+' removed'+(l.p?", "+l.p+" photo(s)":"")+'; '+l.n+' items total</td></tr>'}).join("")+'</tbody></table><p><button class="btn" id="tlclr" type="button">Clear log</button></p>':'<p class="tn">Saves from this browser will be listed here. GitHub keeps the full history too.</p>');
 return shell(h)}
function wireTools(){TOOLS.msg=null;var g=function(id){return $(id)};
 g("tbk").onclick=function(){dlFile("conventionalmemory-backup-"+C.today()+".json",JSON.stringify({exported:new Date().toISOString(),items:S.items,timelinePhotosPending:S.cimgAdd||{}},null,1),"application/json")};
 g("tcsv").onclick=function(){dlFile("catalog-"+C.today()+".csv",csvOut(),"text/csv")};g("tjs").onclick=function(){$("dl")?$("dl").click():dlFile("items.js",serialize(S.items),"text/javascript")};
 g("tcf").onchange=function(e){var fl=e.target.files[0];if(!fl)return;if(fl.size>2e6){TOOLS.imp={err:"That file is over 2 MB."};render();return}var rd=new FileReader();rd.onload=function(){TOOLS.imp=csvPlan(String(rd.result));render()};rd.readAsText(fl)};
 var ap=g("tapply");if(ap)ap.onclick=function(){var n=csvApply(TOOLS.imp);TOOLS.msg={t:"ok",m:"Applied: "+TOOLS.imp.add.length+" new items, "+TOOLS.imp.upd.length+" updated. Use Review and save when you are ready."};TOOLS.imp=null;render()};var cn=g("tcancel");if(cn)cn.onclick=function(){TOOLS.imp=null;render()};
 var sync=function(){TOOLS.bm=g("tbm").value;TOOLS.bq=g("tbq").value;TOOLS.bf=g("tbf").value;TOOLS.bv=g("tbv").value};
 ["tbm","tbf"].forEach(function(id){g(id).onchange=function(){sync();render()}});["tbq","tbv"].forEach(function(id){g(id).oninput=function(){sync();var m=S.items.filter(bulkMatch).length,b=g("tbgo");b.disabled=!(m&&TOOLS.bv.trim());b.textContent="Apply to "+m+" item"+(m===1?"":"s")}});
 g("tbgo").onclick=function(){sync();var v=TOOLS.bv.trim(),f=TOOLS.bf,n=0;S.items.filter(bulkMatch).forEach(function(it){if(f==="addtag"){it.tags=it.tags||[];if(it.tags.indexOf(v)<0){it.tags.push(v);n++}}else if(f==="rmtag"){var l=(it.tags||[]).filter(function(t){return t!==v});if(l.length!==(it.tags||[]).length){it.tags=l;n++}}else if(it[f]!==v){it[f]=v;n++}});if(n)S.dirty=true;TOOLS.msg={t:"ok",m:n?"Changed "+n+" item"+(n===1?"":"s")+". Use Review and save to publish.":"Nothing needed changing."};render()};
 var cl=g("tlclr");if(cl)cl.onclick=function(){try{localStorage.removeItem(ALK)}catch(e){}render()}}
/* ---------- studio: video plan sheets and a posting calendar ---------- */
var STK="cm-studio",STY=[["","Rest"],["dig","Daily Dig post"],["find","Today's find post"],["video","New video"],["short","Short"],["live","Live"],["other","Other"]],STS={id:""};
function planSheet(it){var site="https://conventionalmemory.github.io/#/item/"+it.id,sp=Object.keys(it.specs||{}).slice(0,6).map(function(k){return"- "+k+": "+it.specs[k]}),yr=+it.year||0,same=yr?C.TL.filter(function(r){return+String(r[0]).slice(0,4)===yr&&/^(hw|gt|gn)$/.test(r[1])&&r[2]!==it.name}).slice(0,5).map(function(r){return r[2]}):[],
  by={Computer:["Boot it cold and show the first screen","Run a classic benchmark or a period game","Show the keyboard, ports and inside if you can open it"],"Console or handheld":["Show a game running on the original screen or TV","Compare the controller feel to a modern one","Show the cartridge or disc slot"],"Digital camera":["Take a photo and show how it looks today","Show the media it records to and how you read it","Compare to a phone shot of the same scene"]}[it.type]||["Show it working, if it works","Show the label, serial and ports","Compare it to something people know today"];
 var cp=typeof inflNote==="function"&&it.msrp&&yr?inflNote(it.msrp,yr):"";
 return"# "+it.name+": video plan\n\n"+"## Title ideas\n- "+it.name+": the story\n- Why the "+it.name+" mattered"+(yr?" in "+yr:"")+"\n- I found a "+it.name+" and here is what it does\n\n"
  +"## Hook (first 3 seconds)\nOpen on the item and one surprising fact. Suggested: "+(it.msrp?"It cost "+it.msrp+(cp?" ("+cp+")":"")+" when it launched.":"Say what it is and why you wanted it.")+"\n\n"
  +"## Facts to hit\n"+["- Maker: "+(it.maker||"?"),"- Released: "+(it.rel||it.year||"?"),it.msrp?"- Launch price: "+it.msrp:"",it.country?"- Made in "+it.country:"",it.score!=null?"- 640K scale score: "+it.score+"K":""].filter(Boolean).join("\n")+(sp.length?"\n"+sp.join("\n"):"")+"\n\n"
  +"## Script outline\n1. Hook\n2. Context: "+(yr?"what else came out in "+yr+(same.length?" ("+same.join(", ")+")":""):"where it sits in computing history")+"\n3. The tour: specs and design\n4. Demo: "+by[0]+"\n5. "+(it.thoughts?"My take: "+it.thoughts:"My take: what I like, what I would change")+"\n6. Call to action: visit the site, check the timeline, tell me your first computer\n\n"
  +"## B-roll shot list\n- Wide shot of the item\n- Close-ups of the label, serial number and ports\n- "+by.join("\n- ")+(it.has&&it.has.length?"\n- What is included: "+it.has.join(", "):"")+"\n- Hands-on shot of the keys or controls\n- Boot screen or first picture\n\n"
  +"## Thumbnail\nBig text: "+it.name.toUpperCase().slice(0,22)+" plus three words of hook. Tight photo of the item on a dark background.\n\n"
  +"## Description\n"+it.name+(it.maker?" by "+it.maker:"")+". Full page, specs and timeline: "+site+"\nShort-form fact cards: https://conventionalmemory.github.io/#/shorts/"+it.id+"\nTags: "+(it.tags||["retro","vintage computers"]).map(function(t){return"#"+t.replace(/\s+/g,"")}).join(" ")+"\n"}
function studioView(){var cal={};try{cal=JSON.parse(localStorage.getItem(STK)||"{}")}catch(e){}var it=S.items.filter(function(x){return x.id===STS.id})[0]||S.items[0],h='<p class="abar"><button class="btn" id="bk" type="button">Back to the list</button></p><h3 class="sub">Studio</h3>'
  +'<p>Plan the video, then plan the week. A sheet is written from the catalog entry, so fill in specs and your take first for a better one.</p><p><label for="stsel">Item</label> <select id="stsel">'+S.items.map(function(x){return'<option value="'+esc(x.id)+'"'+(it&&x.id===it.id?" selected":"")+'>'+esc(x.name)+'</option>'}).join("")+'</select></p>'+(it?'<textarea id="stsheet" readonly rows="16" style="width:100%;font-family:monospace">'+esc(planSheet(it))+'</textarea><p><button class="btn pri" id="stcp" type="button">Copy sheet</button> <button class="btn" id="stdl" type="button">Download .md</button> <a class="btn" target="_blank" rel="noopener" href="#/shorts/'+esc(it.id)+'">Open Shorts mode</a> <span class="tn" id="stm" role="status"></span></p>':"")
  +'<h3 class="sub">Posting calendar (next 28 days)</h3><p class="tn">Saved in this browser. Export it to put it in your calendar app.</p><div class="st-cal">';
 var d0=new Date();for(var i=0;i<28;i++){var d=new Date(d0.getFullYear(),d0.getMonth(),d0.getDate()+i),k=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"),e=cal[k]||{};h+='<div class="st-day"><b>'+["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()]+" "+(d.getMonth()+1)+"/"+d.getDate()+'</b><select data-sd="'+k+'" aria-label="Plan for '+k+'">'+STY.map(function(o){return'<option value="'+o[0]+'"'+(e.k===o[0]?" selected":"")+'>'+o[1]+'</option>'}).join("")+'</select><input data-sn="'+k+'" placeholder="note" value="'+esc(e.n||"")+'" aria-label="Note for '+k+'"></div>'}
 return shell(h+'</div><p><button class="btn" id="stweek" type="button">Fill a sample week pattern</button> <button class="btn" id="stics" type="button">Export calendar (.ics)</button> <button class="btn" id="stclr" type="button">Clear</button></p>')}
function wireStudio(){var cal={};try{cal=JSON.parse(localStorage.getItem(STK)||"{}")}catch(e){}var put=function(){try{localStorage.setItem(STK,JSON.stringify(cal))}catch(e){}};
 var sel=$("stsel");if(sel)sel.onchange=function(){STS.id=sel.value;render()};var sh=$("stsheet"),it=S.items.filter(function(x){return x.id===(sel&&sel.value)})[0];
 var cp=$("stcp");if(cp)cp.onclick=function(){sh.select();if(navigator.clipboard)navigator.clipboard.writeText(sh.value).then(function(){$("stm").textContent="Copied."},function(){$("stm").textContent="Press Ctrl+C."});else $("stm").textContent="Press Ctrl+C."};
 var dd=$("stdl");if(dd)dd.onclick=function(){dlFile(slug(it.name)+"-video-plan.md",sh.value,"text/markdown")};
 host.querySelectorAll("[data-sd]").forEach(function(s){s.onchange=function(){var k=s.dataset.sd;cal[k]=cal[k]||{};cal[k].k=s.value;if(!cal[k].k&&!cal[k].n)delete cal[k];put()}});host.querySelectorAll("[data-sn]").forEach(function(s){s.oninput=function(){var k=s.dataset.sn;cal[k]=cal[k]||{k:""};cal[k].n=s.value;put()}});
 $("stweek").onclick=function(){var d0=new Date();for(var i=0;i<28;i++){var d=new Date(d0.getFullYear(),d0.getMonth(),d0.getDate()+i),k=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"),w=d.getDay(),p={1:"video",3:"short",5:"find",0:"dig"}[w];if(p&&!(cal[k]&&cal[k].k))cal[k]={k:p,n:(cal[k]&&cal[k].n)||""}}put();render()};
 $("stclr").onclick=function(){if(confirm("Clear the whole posting calendar?")){cal={};put();render()}};
 $("stics").onclick=function(){var L=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//ConventionalMemory.io//Studio//EN"];Object.keys(cal).sort().forEach(function(k){var e=cal[k];if(!e.k)return;var lab=STY.filter(function(o){return o[0]===e.k})[0][1],a=k.replace(/-/g,""),n=new Date(k+"T12:00:00");n.setDate(n.getDate()+1);var b=n.getFullYear()+String(n.getMonth()+1).padStart(2,"0")+String(n.getDate()).padStart(2,"0");L.push("BEGIN:VEVENT","UID:cm-"+a+"@conventionalmemory.github.io","DTSTAMP:"+a+"T120000Z","DTSTART;VALUE=DATE:"+a,"DTEND;VALUE=DATE:"+b,"SUMMARY:"+lab+(e.n?": "+e.n.replace(/[\r\n,;]/g," "):""),"END:VEVENT")});L.push("END:VCALENDAR");dlFile("posting-calendar.ics",L.join("\r\n"),"text/calendar")}}

function render(){if(!host)return;if(QS.tm&&view!=="quest"){clearInterval(QS.tm);QS.tm=0}host.innerHTML=!tok||!S?lockedView():view==="edit"?editView():view==="quest"?questView():view==="audit"?auditView():view==="tlsafari"?tlsView():view==="health"?healthView():view==="review"?reviewView():view==="tools"?toolsView():view==="studio"?studioView():view==="tle"?tleView():view==="tlist"?tlistView():listView();wire()}
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
 o.id=id;if(!o.cat)o.cat=(CATMAP[o.type]||(C.SPEC_TYPES[o.type]&&o.type!=="Other"?o.type+"s":"Computers"));
 LISTS.forEach(function(f){var l=val("f_"+f[0]).split(",").map(function(t){return t.trim()}).filter(Boolean);if(l.length)o[f[0]]=l;else delete o[f[0]]});
 LONG.forEach(function(f){var v=host.querySelector("#f_"+f[0]).value.trim();if(v)o[f[0]]=v;else delete o[f[0]]});
 var tlv=val("f_tl");if(tlv){if(!trow(tlv))err.push("No timeline entry is titled \""+tlv+"\"");o.tl=tlv}else delete o.tl;
 var cr=val("f_credit");if(cr)o.credit=cr;else delete o.credit;
 if(host.querySelector("#f_relx").checked)o.relx=true;else delete o.relx;
 if(host.querySelector("#f_sample").checked)o.sample=true;else delete o.sample;if(host.querySelector("#f_draft").checked)o.draft=true;else delete o.draft;
 var sp={};host.querySelectorAll("input[data-k]").forEach(function(i){if(i.value.trim())sp[i.dataset.k]=i.value.trim()});
 pairs(host.querySelector("#f_other").value,"spec").list.forEach(function(p){sp[p[0]]=p[1]});if(Object.keys(sp).length)o.specs=sp;else delete o.specs;
 var v=pairs(host.querySelector("#f_videos").value,"url");if(v.bad)err.push(v.bad);o.videos=v.list;
 var l=pairs(host.querySelector("#f_links").value,"url");if(l.bad)err.push(l.bad);if(l.list.length)o.links=l.list;else delete o.links;
 var w=val("f_wiki");if(w){var wu=C.safeUrl(w,"link");if(!/^https?:/i.test(wu))err.push("The Wikipedia address must start with https://");else{var pw=editing.it.wiki&&editing.it.wiki.u===wu?editing.it.wiki:{};o.wiki=Object.assign({},pw,{t:pw.t||decodeURIComponent(wu.split("/").pop()||"").replace(/_/g," ")||"Wikipedia",u:wu,summary:host.querySelector("#f_wsum").value.trim()})}}else delete o.wiki;
 var ex=pairs(host.querySelector("#f_extras").value,"extra");if(ex.list.length)o.extras=ex.list;else delete o.extras;
 var lg=pairs(host.querySelector("#f_log").value,"log");if(lg.bad)err.push(lg.bad);if(lg.list.length)o.log=lg.list;else delete o.log;
 readPriv();
 o.photos=(editing.it.photos||[]).slice().concat(editing.newPhotos.map(function(p){return p.path}));o.audio=o.audio||[];
 return{o:o,err:err}}
function shrink(file,asp){return new Promise(function(res,rej){var img=new Image(),u=URL.createObjectURL(file);img.onload=function(){var m=1600,r=Math.min(1,m/Math.max(img.width,img.height)),c=document.createElement("canvas");var sx=0,sy=0,sw=img.width,sh=img.height;if(asp){if(sw/sh>asp){sw=Math.round(sh*asp);sx=Math.round((img.width-sw)/2)}else{sh=Math.round(sw/asp);sy=Math.round((img.height-sh)/2)}}r=Math.min(1,m/Math.max(sw,sh));c.width=Math.max(1,Math.round(sw*r));c.height=Math.max(1,Math.round(sh*r));c.getContext("2d").drawImage(img,sx,sy,sw,sh,0,0,c.width,c.height);URL.revokeObjectURL(u);res(c.toDataURL("image/jpeg",.85))};img.onerror=function(){URL.revokeObjectURL(u);rej(new Error("That file is not an image the browser can read."))};img.src=u})}
function wire(){if(!host)return;host.oninput=bump;
 var vg=$("vgo");if(vg){var vp=$("vp");vg.onclick=function(){var p=vp.value;vp.value="";if(!p)return;busy=true;render();vaultOpen(p).then(function(t){busy=false;PP=p;unlock(t,false)},function(e){busy=false;note={t:"err",m:e.message};render()})};vp.onkeydown=function(e){if(e.key==="Enter")vg.click()};$("vnew").onclick=function(){pasteMode=true;note=null;render()};$("vfg").onclick=function(){if(confirm("Remove the saved token from this browser?")){vaultForget();note={t:"ok",m:"Saved token removed."};render()}};if(!busy)vp.focus();return}
 var vb=$("vback");if(vb)vb.onclick=function(){pasteMode=false;note=null;render()};
 var gn=$("gen");if(gn)gn.onclick=function(){var p=genPass();$("pp").value=p;$("genout").textContent="Save this in your password manager now: "+p};
 var g=$("go");if(g){var t=$("tk");g.onclick=function(){var pp=$("pp").value,tv=t.value;if(pp){var pr=passProblem(pp);if(pr){note={t:"err",m:pr};render();return}}pasteMode=false;t.value="";if(pp)PP=pp;unlock(tv,false,pp)};t.onkeydown=function(e){if(e.key==="Enter")g.click()};if(!busy)t.focus();return}
 if(view==="audit"||view==="health"||view==="review"||view==="tools"||view==="studio"){wireMisc();if(view==="tools")wireTools();if(view==="studio")wireStudio();return}
 if(view==="tlist"){$("bk").onclick=function(){view="list";TV=null;render()};$("sv").onclick=review;var tq=$("tq");tq.oninput=function(){TV.q=tq.value;var pos=tq.selectionStart;render();var n=$("tq");n.focus();try{n.setSelectionRange(pos,pos)}catch(e){}};host.querySelectorAll("[data-te]").forEach(function(b){b.onclick=function(){TV={title:b.dataset.te,v:null,q:TV.q};view="tle";render();window.scrollTo(0,0)}});return}
 if(view==="tle"){$("bk").onclick=function(){view="tlist";TV={q:"",q2:0};render()};$("tok").onclick=function(){var v=tleRead(),er=tcommit(TV.title,v);if(er){TV.v=v;$("ferr").innerHTML='<div class="msg err">'+esc(er)+'</div>';return}note={t:"ok",m:"Updated the timeline entry "+TV.title+". Press Save to GitHub to publish."};view="tlist";TV={q:""};render()};return}
 if(view==="tlsafari"){wireTlsView();return}
 if(view==="quest"){wireQuest();return}
 if(view==="edit"){
  $("nb").onclick=function(){var el=host.querySelector("input[data-bl]:placeholder-shown");if(el){el.scrollIntoView({block:"center"});el.focus()}else{$("ferr").innerHTML='<div class="msg ok">No blank basics or specs left.</div>'}};
  $("ty").onchange=function(){editing.it=collectSoft();render()};
  $("f_tl").onchange=function(){editing.it=collectSoft();editing.tfv=null;editing.tlsug=null;render()};
  $("tlsug").onclick=function(){editing.it=collectSoft();editing.tlsug=tlMatches(editing.it.name||val("f_tl")||"");render()};
  host.querySelectorAll("[data-tlp]").forEach(function(b){b.onclick=function(){editing.it=collectSoft();editing.it.tl=editing.tlsug[+b.dataset.tlp].r[2];editing.tlsug=null;editing.tfv=null;render()}});
  var tpl=$("tlpull");if(tpl)tpl.onclick=function(){editing.it=collectSoft();var r=trow(editing.it.tl);if(r)fillFromTL(r)};
  var lg=$("lgo");lg.onclick=function(){var q=val("lq");editing.it=collectSoft();editing.lq=q;editing.lookupNote=null;editing.lres={tl:tlMatches(q),wk:null};render();
   wikiSearch(q).then(function(l){editing.lres.wk=l},function(er){editing.lres.wk=[];editing.lres.werr="Wikipedia is not reachable right now ("+er.message+"). The timeline results above still work."}).then(function(){if(editing&&view==="edit")render()})};
  $("lq").onkeydown=function(e){if(e.key==="Enter")lg.click()};
  host.querySelectorAll("[data-lt]").forEach(function(b){b.onclick=function(){fillFromTL(editing.lres.tl[+b.dataset.lt].r)}});
  host.querySelectorAll("[data-lw]").forEach(function(b){b.onclick=function(){fillFromWiki(editing.lres.wk[+b.dataset.lw])}});
  var po=$("pvo");if(po){po.onclick=function(){editing.it=collectSoft();openPriv($("pvp").value)};$("pvp").onkeydown=function(e){if(e.key==="Enter")po.click()}}
  $("bk").onclick=$("cx").onclick=function(){editing=null;view="list";render()};
  host.querySelectorAll("[data-rp]").forEach(function(b){b.onclick=function(){editing.it=collectSoft();editing.it.photos.splice(+b.dataset.rp,1);render()}});
  host.querySelectorAll("[data-rn]").forEach(function(b){b.onclick=function(){editing.it=collectSoft();editing.newPhotos.splice(+b.dataset.rn,1);render()}});
  $("pua").onclick=function(){var u=C.safeUrl(val("pu"),"img");if(!/^https:/i.test(u)){$("ferr").innerHTML='<div class="msg err">Use a web address that starts with https://</div>';return}editing.it=collectSoft();editing.it.photos=(editing.it.photos||[]).concat([u]);render()};
  var doPh=function(files){files=files.filter(function(f){return /^image\//.test(f.type)});if(!files.length)return;var asp=parseFloat(($("pcrop")||{}).value)||0;var keep=collectSoft(),id=slug(val("f_id")||val("f_name"))||"item";
   var p=Promise.resolve();files.forEach(function(f,n){p=p.then(function(){return shrink(f,asp).then(function(d){editing.newPhotos.push({data:d,b64:d.split(",")[1],path:"photos/"+id+"-"+Date.now().toString(36)+n+".jpg"})})})});
   p.then(function(){editing.it=keep;render()},function(er){$("ferr").innerHTML='<div class="msg err">'+esc(er.message)+'</div>'})};
  $("pf").onchange=function(e){doPh(Array.prototype.slice.call(e.target.files||[]))};
  var pdz=$("pdrop");if(pdz){pdz.ondragover=function(e){e.preventDefault()};pdz.ondrop=function(e){e.preventDefault();doPh(Array.prototype.slice.call(e.dataTransfer.files||[]))}}
  $("ok").onclick=function(){var r=collect();if(r.err.length){$("ferr").innerHTML='<div class="msg err"><b>Fix these first:</b><br>'+r.err.map(esc).join("<br>")+'</div>';return}
   var fin=function(){if(editing.i<0)S.items.push(r.o);else S.items[editing.i]=r.o;
    editing.newPhotos.forEach(function(p){S.photos.push({path:p.path,b64:p.b64})});
    S.dirty=true;note={t:"ok",m:(editing.i<0?"Added ":"Updated ")+r.o.name+". Press Save to GitHub to publish."};editing=null;view="list";render()};
   if(editing.privOk){var has=Object.keys(editing.priv).length;if(!has){delete r.o.privEnc;fin()}else if(!PP){$("ferr").innerHTML='<div class="msg err">Open the private fields with your passphrase first.</div>'}else{encPriv(editing.priv,PP).then(function(pe){r.o.privEnc=pe;fin()},function(er){$("ferr").innerHTML='<div class="msg err">Could not encrypt the private fields: '+esc(er.message)+'</div>'})}}
   else fin()};
  return}
 $("lk").onclick=function(){if(S.dirty&&!confirm("You have unsaved changes. Lock anyway and lose them?"))return;lock("Locked.")};
 $("add").onclick=function(){editing={i:-1,it:{type:"Other",photos:[]},newPhotos:[],priv:{}};if(PP){editing.privOk=true}view="edit";note=null;render()};
 $("sv").onclick=review;
 $("dl").onclick=function(){var b=new Blob([serialize(S.items)],{type:"text/javascript"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="items.js";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},2000)};
 var aq=$("aq");aq.oninput=function(){q=aq.value;var pos=aq.selectionStart;render();var n=$("aq");n.focus();try{n.setSelectionRange(pos,pos)}catch(e){}};
 host.querySelectorAll("[data-e]").forEach(function(b){b.onclick=function(){var i=+b.dataset.e;editing={i:i,it:clone(S.items[i]),newPhotos:[],priv:{}};if(!editing.it.photos)editing.it.photos=[];view="edit";note=null;render();window.scrollTo(0,0);if(PP&&editing.it.privEnc)decPriv(editing.it.privEnc,PP).then(function(o){editing.priv=o||{};editing.privOk=true;render()},function(){})}});
 host.querySelectorAll("[data-d]").forEach(function(b){b.onclick=function(){var i=+b.dataset.d,it=S.items[i];if(!confirm('Delete "'+it.name+'" from the catalog? You can undo until you leave this page.'))return;S.items.splice(i,1);(S.undo=S.undo||[]).push({it:it,i:i});S.dirty=true;note={t:"ok",m:"Removed "+it.name+". Press Undo delete to bring it back, or Save to GitHub to publish."};render()}});
 host.querySelectorAll("[data-c]").forEach(function(b){b.onclick=function(){var src=S.items[+b.dataset.c],cp=clone(src),id=slug(src.id)+"-copy",n=2;while(S.items.some(function(x){return x.id===id}))id=slug(src.id)+"-copy-"+n++;
  delete cp.privEnc;cp.name=src.name+" (copy)";cp.id=id;editing={i:-1,it:cp,newPhotos:[],priv:{}};if(!cp.photos)cp.photos=[];if(PP)editing.privOk=true;view="edit";note={t:"ok",m:"This is a copy of "+src.name+". Change what differs, then Add to the catalog."};render();window.scrollTo(0,0)}});
 host.querySelectorAll("[data-q]").forEach(function(b){b.onclick=function(){QS.mode="item";QS.item=S.items[+b.dataset.q].id;QS.screen="play";QS.pin=null;QS.msg=null;QS.skip={};view="quest";note=null;render();window.scrollTo(0,0)}});
 host.querySelectorAll("[data-pub]").forEach(function(b){b.onclick=function(){var it=S.items[+b.dataset.pub];delete it.draft;S.dirty=true;note={t:"ok",m:"Published "+it.name+". Save to GitHub to make it public."};render()}});
 host.querySelectorAll("[data-lf]").forEach(function(b){b.onclick=function(){lf=b.dataset.lf;render()}});
 $("ls").onchange=function(){ls=this.value;render()};
 $("qgo").onclick=function(){QS.mode="quick";QS.screen="map";QS.skip={};QS.msg=null;view="quest";note=null;render();window.scrollTo(0,0)};
 $("gaudit").onclick=function(){view="audit";render()};var pw=$("potw");if(pw)pw.onclick=function(){TLS.sk[pw.dataset.t]=-2;view="tlsafari";render()};$("ghealth").onclick=function(){view="health";render()};$("gtools").onclick=function(){view="tools";render()};$("gstudio").onclick=function(){view="studio";render()};$("gtle").onclick=function(){view="tlist";TV={q:""};render()};
 $("qph").onclick=function(){QS.mode="photo";QS.screen="play";QS.skip={};QS.msg=null;view="quest";note=null;render();window.scrollTo(0,0)};
 var qab=$("qab");qab.onclick=function(){var v=$("qan").value.trim();if(v.length<2)return;var res=tlMatches(v);if(res.length&&res[0].sc===100&&(!res[1]||res[1].sc<100)){qaddMake(res[0].r[2],res[0].r);return}QA={q:v,res:res};render();var n=$("qan");n.focus()};
 $("qan").onkeydown=function(e){if(e.key==="Enter")qab.click()};
 host.querySelectorAll("[data-qr]").forEach(function(b){b.onclick=function(){var r=QA.res[+b.dataset.qr].r;qaddMake(r[2],r)}});
 var qbk=$("qbk");if(qbk)qbk.onclick=function(){qaddMake(QA.q,null,$("qat").value)};
 $("bulk").onclick=function(){if(confirm("Fill every blank field that has an exact timeline match? You can review the result before saving."))bulkFill()};
 var ud=$("ud");if(ud)ud.onclick=function(){var u=S.undo.pop();S.items.splice(Math.min(u.i,S.items.length),0,u.it);S.dirty=true;note={t:"ok",m:"Brought back "+u.it.name+"."};render()}}

/* ---------- timeline entries linked to catalog items (shared facts live in timeline-edits.js) ---------- */
function tserialize(t){return THEAD+"var TLE="+JSON.stringify(t,null,1)+";\n"+TAPPLY}
function tparse(text){var i=text.search(/^var TLE=/m),j=text.indexOf(";\nfunction tlApplyEdits");if(i<0||j<0)throw new Error("timeline-edits.js is not in the expected format");var v=JSON.parse(text.slice(i+8,j));if(!v||typeof v!=="object"||Array.isArray(v))throw new Error("TLE is not an object");return v}
function trow(t){return(C.TL||[]).filter(function(z){return z[2]===t})[0]}
function tcurRaw(t){var r=trow(t)||[],x=(C.TLX||{})[t]||{},e=(S&&S.tle||{})[t]||{},xx=e.x||{},sp=Object.assign({},x.specs||{},xx.specs||{});
 function pk(a,b,c){return a!=null?a:(b!=null?b:"")}
 return{d:pk(e.d,r[0]),p:pk(e.p,r[3]),s:pk(e.s,r[5]),n:pk(e.n,r[4]),maker:pk(xx.maker,x.maker),dev:pk(xx.dev,x.dev),detail:pk(xx.detail,x.detail),specs:Object.keys(sp).map(function(k){return k+" | "+sp[k]}).join("\n")}}
function tleForm(t,v){var c=v||tcurRaw(t);return'<fieldset><legend>Timeline entry: '+esc(t)+'</legend><p class="tn">Linked catalog items show these facts where they have none of their own. No catalog item can overwrite this entry. Saved to timeline-edits.js.</p><div class="two">'+field("t_d","Date: YYYY, YYYY-MM or YYYY-MM-DD",c.d)+field("t_p","Launch price",c.p)+field("t_s","Source the date was checked against (blank shows an asterisk)",c.s)+field("t_maker","Maker",c.maker)+field("t_dev","Developer",c.dev)+'</div>'+area("t_n","Note (shown on the timeline)",c.n,60)+area("t_detail","Detail",c.detail,70)+area("t_specs","Specs, one per line: Label | Value",c.specs,70)+'</fieldset>'}
function tleRead(){if(!$("t_d"))return null;var f=function(i){return val(i)};return{d:f("t_d"),p:f("t_p"),s:f("t_s"),maker:f("t_maker"),dev:f("t_dev"),n:host.querySelector("#t_n").value.trim(),detail:host.querySelector("#t_detail").value.trim(),specs:host.querySelector("#t_specs").value.trim()}}
function tdiff(t,v){var b=window.TLBASE&&TLBASE[t],r=trow(t)||[],br=b?b.r:r,bx=b?b.x:((C.TLX||{})[t]||{}),e={},x={},err=null;
 if(v.d&&!/^\d{4}(-\d\d(-\d\d)?)?$/.test(v.d))err="Date must look like 1998, 1998-11 or 1998-11-03";
 if(v.d!==(br[0]||""))e.d=v.d;if(v.p!==(br[3]||""))e.p=v.p;if(v.n!==(br[4]||""))e.n=v.n;if(v.s!==(br[5]||""))e.s=v.s;
 ["maker","dev","detail"].forEach(function(k){if(v[k]!==(bx[k]||""))x[k]=v[k]});
 var sp={};v.specs.split("\n").forEach(function(l){var p=l.split("|").map(function(z){return z.trim()});if(p[0]&&p[1]&&p[1]!==String((bx.specs||{})[p[0]]||""))sp[p[0]]=p.slice(1).join(" | ")});if(Object.keys(sp).length)x.specs=sp;
 if(Object.keys(x).length)e.x=x;return{e:e,err:err}}
function tcommit(t,v){var d=tdiff(t,v);if(d.err)return d.err;S.tle=S.tle||{};if(Object.keys(d.e).length)S.tle[t]=d.e;else delete S.tle[t];S.dirty=true;S.tleDirty=true;return null}
function putTle(){if(!S.tleDirty)return Promise.resolve();var body={message:"Admin: update timeline entries",content:b64enc(tserialize(S.tle)),branch:C.REPO.branch};if(S.tsha)body.sha=S.tsha;
 return gh(repo()+"/contents/"+TFILE,{method:"PUT",body:body}).then(function(t){if(!t.ok)throw new Error(errText(t));S.tsha=t.json.content.sha;S.tleDirty=false;try{window.tlApplyEdits(S.tle)}catch(e){}})}
function tleView(){var t=TV.title,li=S.items.filter(function(x){return x.tl===t});
 return shell('<p class="abar"><button class="btn" id="bk" type="button">Back to the timeline editor</button> <button class="btn pri" id="tok" type="button">Apply changes</button></p><h3 class="sub">Edit timeline entry</h3>'+tleForm(t,TV.v)
  +'<p class="tn">Catalog items linked to this entry: '+(li.length?li.map(function(x){return esc(x.name)}).join(", "):"none yet. Link one from an item\'s edit form.")+'</p><p class="tn">This applies the change here. Press Save to GitHub on the list page to publish it.</p><div id="ferr"></div>')}
function tlistView(){var qq=(TV&&TV.q)||"",ql=qq.toLowerCase(),rows=(C.TL||[]).filter(function(r){return/^(hw|pe|sw|gt|gn|gc)$/.test(r[1])&&(!ql||r[2].toLowerCase().indexOf(ql)>=0)}).slice(0,40),ed=S.tle||{};
 return shell('<p class="abar"><button class="btn" id="bk" type="button">Back to the list</button> <button class="btn'+(S.tleDirty?' pri':'')+'" id="sv" type="button"'+(S.dirty?"":" disabled")+'>Review and save</button></p><h3 class="sub">Timeline editor</h3><p class="tn">Edit timeline entries here. This is separate from the catalog: changing an item never changes a timeline entry. Entries you have edited are marked.</p><div class="tools"><input id="tq" type="search" placeholder="Search timeline entries" aria-label="Search timeline entries" value="'+esc(qq)+'"></div>'
  +(rows.length?rows.map(function(r){return'<div class="row"><span><b>'+esc(r[2])+'</b> '+(ed[r[2]]?'<span class="tag want">Edited</span> ':"")+'<small class="tn">'+esc(String(r[0]))+(r[3]?", "+esc(r[3]):"")+'</small></span><span class="rb"><button class="btn" data-te="'+esc(r[2])+'" type="button">Edit</button></span></div>'}).join(""):'<p class="empty">No entries match.</p>')+(rows.length===40?'<p class="tn">Showing the first 40. Type more to narrow it down.</p>':""))}
function goHash(){var m=/^#\/admin\/tle\/(.+)$/.exec(location.hash);if(!m||!S)return;var t;try{t=decodeURIComponent(m[1])}catch(e){return}if(!trow(t))return;TV={title:t,v:null};view="tle";try{history.replaceState(null,"","#/admin")}catch(e){}}
function tlField(it){var ttl=it.tl||"",linked=ttl&&trow(ttl),opts=(C.TL||[]).filter(function(r){return/^(hw|pe|sw|gt|gn|gc)$/.test(r[1])}).map(function(r){return'<option value="'+esc(r[2])+'">'}).join("");
 var sg=editing.tlsug?'<ul class="lk">'+(editing.tlsug.length?editing.tlsug.map(function(m,i){return'<li><button class="btn" data-tlp="'+i+'" type="button">Link</button> <b>'+esc(m.r[2])+'</b> <span class="tn">'+esc(String(m.r[0]).slice(0,4))+'</span></li>'}).join(""):'<li class="tn">No close matches. Type the exact entry title instead.</li>')+'</ul>':"";
 return'<fieldset><legend>Timeline link</legend><p class="tn">Tie this item to a timeline entry. Anything you leave blank on the item is shown from the entry. Your edits here never change the timeline, and the item\'s changelog and notes stay on the catalog side. Timeline entries are edited separately under Timeline editor on the list page.</p><div class="fld"><label for="f_tl">Timeline entry title</label><input id="f_tl" list="tll" value="'+esc(ttl)+'" placeholder=" " autocomplete="off"><datalist id="tll">'+opts+'</datalist></div>'
  +'<p><button class="btn" id="tlsug" type="button">Suggest matches</button>'+(linked?' <button class="btn" id="tlpull" type="button">Fill my blanks from the entry now</button>':"")+'</p>'+sg
  +(ttl&&!linked?'<div class="msg err">No timeline entry is titled "'+esc(ttl)+'".</div>':"")+(linked?'<p class="tn">Linked to "'+esc(ttl)+'" ('+esc(String((trow(ttl)||[])[0]||"").slice(0,4))+').</p>':'<p class="tn">Not linked.</p>')+'</fieldset>'}
function collectSoft(){var r=null;try{r=collect().o}catch(e){}return r||editing.it}
function kd(e){if(!host||/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)||e.ctrlKey||e.metaKey||e.altKey)return;var k=e.key.toLowerCase(),m=view==="tlsafari"?{k:"tk",n:"tn",s:"ts",u:"tu"}:view==="quest"?(QS.mode==="speed"&&QS.screen==="play"?{y:"spy",n:"spn"}:{k:"qk",n:"qnp",s:"qsk"}):null;if(!m||!m[k])return;var el=$(m[k]);if(el&&!el.disabled)el.click()}
function mount(el,ctx){C=ctx;host=el;document.addEventListener("keydown",kd);goHash();render();bump()}
function unmount(){host=null;document.removeEventListener("keydown",kd)}
window.addEventListener("beforeunload",function(e){if(S&&S.dirty){e.preventDefault();e.returnValue=""}});
window.CMAdmin={mount:mount,unmount:unmount,_t:{serialize:serialize,parseItems:parseItems}};
})();
