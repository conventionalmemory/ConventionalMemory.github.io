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
   if(m.status===404)return{sha:null,items:clone(C.ITEMS),created:true};
   if(!m.ok)throw new Error(errText(m));
   return gh(repo()+"/contents/"+FILE+"?ref="+encodeURIComponent(C.REPO.branch),{accept:"application/vnd.github.raw+json",text:true}).then(function(t){
    if(!t.ok)throw new Error(errText(t));return{sha:m.json.sha,items:parseItems(t.text)}})})
 }).then(function(d){S={sha:d.sha,items:d.items,dirty:!!d.created,photos:[],created:!!d.created};
   if(pass){vaultSave(tok,pass).then(function(){note={t:'ok',m:'Unlocked, and the token is now saved encrypted on this device. Next time just type your passphrase.'};render()},function(e){note={t:'err',m:'Unlocked, but could not save the token: '+e.message};render()})}
   note=d.created?{t:"ok",m:"Unlocked. items.js is not in the repository yet, so the current page's items are loaded. Save to GitHub to create it."}:{t:"ok",m:"Unlocked. Loaded "+S.items.length+" items from GitHub."};
   view="list";bump()
 }).catch(function(e){tok=null;S=null;note={t:"err",m:String(e.message||e)}}).then(function(){busy=false;render()})}
function lock(m){tok=null;PP=null;S=null;QC={};editing=null;view="list";clearTimeout(idle);note=m?{t:"ok",m:m}:null;render()}
var hid=0;document.addEventListener("visibilitychange",function(){if(document.hidden){hid=setTimeout(function(){if(tok&&!(S&&S.dirty))lock("Locked after the tab was in the background for 5 minutes.")},5*60*1000)}else clearTimeout(hid)});
function bump(){clearTimeout(idle);if(tok)idle=setTimeout(function(){if(S&&S.dirty){bump();return}lock("Locked after 20 minutes of no activity.")},20*60*1000)}
function save(){if(!S||busy)return;busy=true;note={t:"ok",m:"Saving to GitHub..."};render();
 var chain=Promise.resolve();
 S.photos.forEach(function(p){chain=chain.then(function(){return gh(repo()+"/contents/"+p.path,{method:"PUT",body:{message:"Admin: add photo "+p.path,content:p.b64,branch:C.REPO.branch}}).then(function(r){if(!r.ok&&r.status!==422)throw new Error(errText(r))})})});
 chain.then(function(){var body={message:"Admin: update catalog ("+S.items.length+" items)",content:b64enc(serialize(S.items)),branch:C.REPO.branch};if(S.sha)body.sha=S.sha;return gh(repo()+"/contents/"+FILE,{method:"PUT",body:body})})
 .then(function(r){if(!r.ok)throw new Error(errText(r));S.sha=r.json.content.sha;S.dirty=false;S.qn=0;S.photos=[];S.created=false;
   C.ITEMS.length=0;S.items.forEach(function(i){C.ITEMS.push(clone(i))});C.prep();
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
  return lf==="all"||(lf==="inc"&&x.m.pct<100)||(lf==="done"&&x.m.pct>=100)||(lf==="nophoto"&&!(it.photos||[]).length)||(lf==="notl"&&!qTL(it))});
 vis.sort(function(a,b){return ls==="low"?a.m.pct-b.m.pct||a.it.name.localeCompare(b.it.name):ls==="new"?(b.it.year||0)-(a.it.year||0):a.it.name.localeCompare(b.it.name)});
 var all100=tot?Math.round(dn*100/tot):0;
 var chips=[["all","All"],["inc","Incomplete"],["done","Complete"],["nophoto","No photo"]].map(function(c){return'<button class="chip'+(lf===c[0]?" on":"")+'" data-lf="'+c[0]+'" type="button">'+c[1]+'</button>'}).join("");
 return shell('<p>Signed in to <b>'+esc(C.REPO.owner+"/"+C.REPO.repo)+'</b>, branch '+esc(C.REPO.branch)+'. '+items.length+' items. '+(S.dirty?'<span class="tag want">Unsaved changes</span>':'<span class="tag">Saved</span>')+(S.photos.length?' <span class="tag">'+S.photos.length+' photo(s) waiting</span>':"")+'</p>'
 +'<div class="qhero"><div><b>Catalog completeness</b> '+mbar({done:dn,total:tot,pct:all100})+'<br><small class="tn">'+(tot-dn)+' blank fields across '+items.length+' items.</small></div><span><button class="btn pri" id="qgo" type="button">Start the Fill-in Quest</button> <button class="btn" id="qph" type="button">Photo Safari</button></span></div>'
 +qaddHtml()+'<p class="abar"><button class="btn pri" id="add" type="button">Add item (full form)</button> <button class="btn'+(S.dirty?' pri':'')+'" id="sv" type="button"'+(busy||!S.dirty&&!S.photos.length?" disabled":"")+'>Save to GitHub</button> <button class="btn" id="bulk" type="button" title="Fill every blank field the timeline knows an exact match for">Auto-fill from timeline</button> '
 +(S.undo&&S.undo.length?'<button class="btn" id="ud" type="button">Undo delete ('+esc(S.undo[S.undo.length-1].it.name)+')</button> ':"")
 +'<button class="btn" id="dl" type="button">Download items.js backup</button> <button class="btn" id="lk" type="button">Lock</button></p>'
 +'<div class="tools"><input id="aq" type="search" placeholder="Search items" aria-label="Search items" value="'+esc(q)+'">'+chips+'<select id="ls" aria-label="Sort"><option value="az"'+(ls==="az"?" selected":"")+'>A to Z</option><option value="low"'+(ls==="low"?" selected":"")+'>Least complete first</option><option value="new"'+(ls==="new"?" selected":"")+'>Newest first</option></select></div>'
 +(vis.length?vis.map(function(x){var bl=qFields(x.it).filter(function(f){return!qNA(x.it,f)&&!qHas(x.it,f)}).map(qShort);
  return'<div class="row qrow"><span><b>'+esc(x.it.name)+'</b> <small class="tn">'+esc(x.it.maker||"")+', '+esc(x.it.rel||x.it.year||"")+'</small><br>'+mbar(x.m)+(bl.length?' <small class="tn">Missing: '+esc(bl.slice(0,3).join(", "))+(bl.length>3?" and "+(bl.length-3)+" more":"")+'</small>':' <small class="tn">All filled in</small>')+'</span>'
  +'<span class="rb">'+(bl.length?'<button class="btn" data-q="'+x.i+'" type="button">Quest</button> ':"")+'<button class="btn" data-e="'+x.i+'" type="button">Edit</button> <button class="btn" data-c="'+x.i+'" type="button">Copy</button> <button class="btn danger" data-d="'+x.i+'" type="button">Delete</button></span></div>'}).join(""):'<p class="empty">No items match.</p>')
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
 (C.TL||[]).forEach(function(r){if(!/^(hw|sw|gt|gn|gc)$/.test(r[1]))return;var t=nk(r[2]),sc=0;if(t===q)sc=100;else if(t.indexOf(q)>=0)sc=60-Math.min(30,t.length-q.length);else{var hit=w.filter(function(x){return t.indexOf(x)>=0}).length;if(hit===w.length)sc=40;else if(hit&&hit>=Math.ceil(w.length/2)&&w.length>1)sc=15+hit}
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
 +'<label><input type="checkbox" id="f_sample" style="width:auto;display:inline"'+(it.sample?" checked":"")+'> This is a sample entry</label></fieldset>'
 +'<fieldset><legend>Specs</legend>'+(specs||'<p>No spec template for this type.</p>')+area("f_other","Other specs, one per line: Label | Value",other,60)+'</fieldset>'
 +'<fieldset><legend>Photos</legend><div class="thumbs">'+ph.map(function(p,i){var u=C.safeUrl(p,"img");return'<figure>'+(u?'<img src="'+esc(u)+'" alt="">':'')+'<figcaption>'+esc(String(p).slice(0,40))+'</figcaption><button class="btn danger" data-rp="'+i+'" type="button">Remove</button></figure>'}).join("")
  +editing.newPhotos.map(function(p,i){return'<figure><img src="'+esc(p.data)+'" alt=""><figcaption>new: '+esc(p.path.replace("photos/",""))+'</figcaption><button class="btn danger" data-rn="'+i+'" type="button">Remove</button></figure>'}).join("")+'</div>'
  +'<label for="pf">Add photos (they are shrunk to 1600 pixels and saved as JPEG in the photos folder)</label><input id="pf" type="file" accept="image/*" multiple>'
  +field("pu","Or add a photo by web address (https)","")+'<p><button class="btn" id="pua" type="button">Add that address</button></p>'
  +field("f_credit","Photo credit",it.credit)+'</fieldset>'
 +'<fieldset><legend>Links and media</legend>'+area("f_videos","Videos, one per line: Title | https address",(it.videos||[]).map(function(v){return v.t+" | "+v.u}).join("\n"),60)+area("f_links","Manuals and references, one per line: Title | https address",(it.links||[]).map(function(v){return v.t+" | "+v.u}).join("\n"),60)
 +field("f_wiki","Wikipedia address",it.wiki&&it.wiki.u||"")+area("f_wsum","Wikipedia summary (optional, CC BY-SA text)",it.wiki&&it.wiki.summary||"",60)+'</fieldset>'
 +privSection()+'<fieldset><legend>Accessories and changelog</legend><p class="tn">Ideas: '+esc((C.ACC_HINTS[ty]||[]).join(", "))+'</p>'+area("f_extras","Accessories, one per line: Name | Have, Want, Missing or Optional | note",ex,90)+area("f_log","Changelog, one per line: YYYY-MM-DD | Type | what changed. Types: "+C.LOGTYPES.join(", "),lg,90)+'</fieldset>'
 +'<div class="stick"><button class="btn pri" id="ok" type="button">'+(isNew?"Add to the catalog":"Apply changes")+'</button> <button class="btn" id="cx" type="button">Cancel</button></div><p class="tn">This applies the change here. Press Save to GitHub on the list page to publish it.</p><div id="ferr"></div>')}
/* ---------- completeness and the Fill-in Quest (admin only) ----------
   Every item has a list of fields worth having. The quest walks the blank ones one at a time and pays XP for each.
   Progress (XP, streak, badges) lives in this browser only; the answers go into the catalog like any edit. */
var QKEY="cm-quest",QT=null,QC={},QW={},QA=null,QS={mode:"quick",screen:"map",item:null,skip:{},msg:null,boom:0,cur:null,pin:null,pop:0};
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
var QB=[["first","First Byte","Fill in one field","chip",function(t){return t.filled>=1}],["ten","Ten Fields","Fill in 10 fields","floppy",function(t){return t.filled>=10}],["streak5","Hot Streak","Five answers in a row","bolt",function(t){return t.best>=5}],["combo10","Combo King","Ten answers in a row","crown",function(t){return t.best>=10}],["photo3","Shutterbug","Add 3 photos","camera",function(t){return t.photos>=3}],["photo10","Safari Guide","Add 10 photos","globe",function(t){return t.photos>=10}],["full","Complete Set","Restore one item to 100%","trophy",function(t){return t.full>=1}],["full3","Restorer","Restore 3 items","gear",function(t){return t.full>=3}],["goal","Daily Driver","Hit the daily goal","clock",function(t){return t.goalHit>=1}],["day3","Regular","Play on 3 days","sun",function(t){return t.days>=3}],["spec25","Spec Slayer","Fill in 25 specs","sword",function(t){return t.specs>=25}],["take5","Critic","Write 5 of your own takes","heart",function(t){return t.takes>=5}],["lvl5","Cache Hit","Reach level 5","gem",function(t){return qLvl(t.xp)>=5}],["arch","Archivist","Fill in 100 fields","book",function(t){return t.filled>=100}]];
var QGOAL=5,LOOT=["You found a working 5.25-inch floppy!","A mint manual falls out of the box.","You rescued a CR2032 before it leaked.","Found a jumper setting that actually works.","A BBS phone number, still ringing.","A forgotten stack of AOL trial discs. Collectible!"];
var AC=null;function snd(seq){if(!QT||QT.mute)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();var t=AC.currentTime;seq.forEach(function(f,i){var o=AC.createOscillator(),g=AC.createGain();o.type="square";o.frequency.value=f;g.gain.setValueAtTime(.05,t+i*.08);g.gain.exponentialRampToValueAtTime(.001,t+i*.08+.1);o.connect(g);g.connect(AC.destination);o.start(t+i*.08);o.stop(t+i*.08+.11)})}catch(e){}}
/* Wikipedia helpers for the quest: a free-licensed lead photo, and infobox facts */
var WB="https://en.wikipedia.org/w/api.php?format=json&origin=*&redirects=1&";
function wget(u){return fetch(u,{credentials:"omit",referrerPolicy:"no-referrer"}).then(function(r){if(!r.ok)throw new Error("Wikipedia answered "+r.status);return r.json()})}
function enc(s){return encodeURIComponent(s)}
function qWimg(it){var w=QW[it.id]=QW[it.id]||{};if(w.img)return;
 if(typeof CIMG!=="undefined"&&CIMG[it.name]&&typeof cimgUrl==="function"){w.img={s:"ok",url:cimgUrl(it.name,800),page:cimgPage(it.name),why:"A free-licensed Wikimedia Commons photo already on file for this name",free:true,credit:"Photo: Wikimedia Commons contributor, free license (see the file page)"};return}
 w.img={s:"load"};var t=(it.wiki&&it.wiki.t)||it.name;
 wget(WB+"action=query&generator=search&gsrlimit=1&prop=pageimages&piprop=thumbnail|name&pithumbsize=800&gsrsearch="+enc(t)).then(function(j){
  var pg=j.query&&j.query.pages?j.query.pages[Object.keys(j.query.pages)[0]]:null;if(!pg||!pg.thumbnail||!pg.pageimage){w.img={s:"none"};return}
  var fn=pg.pageimage;return wget(WB+"action=query&prop=imageinfo&iiprop=extmetadata&iiextmetadatafilter=LicenseShortName|Artist|NonFree&titles="+enc("File:"+fn)).then(function(k){
   var p2=k.query.pages[Object.keys(k.query.pages)[0]],md=(p2.imageinfo&&p2.imageinfo[0]&&p2.imageinfo[0].extmetadata)||{},lic=String((md.LicenseShortName||{}).value||"").slice(0,30),
    free=p2.imagerepository==="shared"&&!md.NonFree,art=String((md.Artist||{}).value||"").replace(/<[^>]*>/g,"").replace(/\s+/g," ").trim().slice(0,60);
   w.img={s:"ok",url:pg.thumbnail.source,page:"https://en.wikipedia.org/wiki/File:"+enc(fn.replace(/ /g,"_")),why:'Lead image of the Wikipedia article "'+pg.title+'"',free:free,credit:"Photo: "+(art||"see the file page")+(lic?", "+lic:"")+", via Wikimedia"}})
 }).catch(function(e){w.img={s:"err",m:e.message}}).then(function(){qSide()})}
function qWfacts(it){var w=QW[it.id]=QW[it.id]||{};if(w.f)return;w.f={s:"load"};var t=(it.wiki&&it.wiki.t)||it.name;
 wget(WB+"action=query&list=search&srlimit=1&srsearch="+enc(t)).then(function(j){var h=j.query&&j.query.search&&j.query.search[0];if(!h)throw new Error("No Wikipedia article found");var ti=h.title;return wget(WB+"action=parse&prop=text&disablelimitreport=1&disableeditsection=1&page="+enc(ti)).then(function(p){w.f={s:"ok",title:ti,rows:wparse(p.parse&&p.parse.text?p.parse.text["*"]:"")}})})
 .catch(function(e){w.f={s:"err",m:e.message}}).then(function(){qSide()})}
function qWsug(it,f){var w=QW[it.id],r=w&&w.f&&w.f.s==="ok"?w.f.rows:null;if(!r)return null;var v="";
 r.forEach(function(x){var k=x[0].toLowerCase();if(f.k==="rel"&&/^(release date|released|introduced|first release|initial release|release)$/.test(k)&&!v)v=wdate(x[1]);else if(f.k==="msrp"&&/^(introductory|launch|retail|original) ?price$|^price$|^msrp$/.test(k)&&!v)v=x[1].split(";")[0].slice(0,60);else if(f.k==="maker"&&WMAP[k]==="maker"&&!v)v=x[1].split(";")[0].slice(0,60);else if(f.spec&&WMAP[k]===f.spec&&!v)v=x[1].split(";")[0].slice(0,120)});
 return v?{v:v,from:"Wikipedia: "+w.f.title,exact:false,wiki:true}:null}
function qNext(){var c=[],pin=QS.pin;
 if(pin){var pi=S.items.findIndex(function(x){return x.id===pin.id});if(pi>=0){var hit=null;qFields(S.items[pi]).forEach(function(f){if(!hit&&!qNA(S.items[pi],f)&&!qHas(S.items[pi],f)&&(f.k===pin.k||pin.k==="specs"&&f.spec))hit=f});if(hit)return{i:pi,f:hit}}QS.pin=null}
 S.items.forEach(function(it,i){if(QS.mode==="item"&&QS.item!==it.id)return;qFields(it).forEach(function(f,n){if(QS.mode==="photo"&&f.k!=="photo")return;if(qNA(it,f)||qHas(it,f)||QS.skip[it.id+"|"+f.k])return;var sg=qSuggest(it,f),w=sg&&sg.exact?0:({t:1,c:1,n:1,l:2,u:2,w:2,p:2,a:3})[f.t];c.push({i:i,f:f,w:QS.mode==="item"?n:w*1000+n})})});
 if(!c.length)return null;if(QS.mode==="random")return c[Math.floor(Math.random()*c.length)];
 c.sort(function(a,b){return a.w-b.w||a.i-b.i});return c[0]}
function qAfter(it,f,before){var t=QT,lv=qLvl(t.xp),m=qMeter(it),td=C.today(),new_=[];
 if(t.day!==td){var y=new Date(td+"T12:00:00");y.setDate(y.getDate()-1);var ys=y.getFullYear()+"-"+String(y.getMonth()+1).padStart(2,"0")+"-"+String(y.getDate()).padStart(2,"0");t.days=t.last===ys?(t.days||0)+1:1;t.day=td;t.today=0}
 t.last=td;t.today=(t.today||0)+1;
 var gain=f.xp+(t.streak>=2?2:0)+(t.streak>=9?3:0),done=before.pct<100&&m.pct>=100,loot="";
 t.xp+=gain;t.filled++;t.streak++;t.best=Math.max(t.best,t.streak);if(f.t==="p")t.photos++;if(f.spec)t.specs=(t.specs||0)+1;if(f.k==="thoughts")t.takes=(t.takes||0)+1;if(done)t.full++;
 if(t.filled%5===0){var b=5+Math.floor(Math.random()*16);t.xp+=b;loot=LOOT[Math.floor(Math.random()*LOOT.length)]+" +"+b+" bonus XP."}
 if(t.today===QGOAL){t.goalHit=(t.goalHit||0)+1;t.xp+=20;loot+=" Daily goal reached! +20 XP."}
 QB.forEach(function(b){if(!t.badges[b[0]]&&b[4](t)){t.badges[b[0]]=1;new_.push(b)}});
 var up=qLvl(t.xp)>lv;
 QS.pop=gain;QS.msg={t:"ok",m:"+"+gain+" XP"+(t.streak>=3?" (combo x"+t.streak+")":"")+(loot?" "+loot:"")};QS.loot=!!loot;
 QS.award=[];if(up)QS.award.push({n:"Level "+qLvl(t.xp),d:QTITLES[Math.min(qLvl(t.xp)-1,QTITLES.length-1)],ic:"star"});new_.forEach(function(b){QS.award.push({n:b[1],d:b[2],ic:b[3]})});
 if(done)QS.done={id:it.id,name:it.name};
 QS.boom=(up||new_.length||done)?1:0;S.dirty=true;S.qn=(S.qn||0)+1;qStore();
 snd(done?[523,659,784,1047,1319]:up||new_.length?[523,659,784,1047]:[660,880])}
function qStars(p){return"★".repeat(p>=100?3:p>=67?2:p>=34?1:0)+"☆".repeat(p>=100?0:p>=67?1:p>=34?2:3)}
function qPic(it,m){var g=(1-m.pct/100).toFixed(2);return'<div class="qpic'+(m.pct>=100?" gold":"")+'" style="filter:grayscale('+g+') contrast('+(0.9+m.pct/1000).toFixed(2)+')">'+(C.pic?C.pic(it):"")+'</div>'}
function qCandHtml(it,f){var w=QW[it.id]||{},sg=qSuggest(it,f),h="";
 if(f.k==="photo"){var g=w.img;
  if(!g||g.s==="load")return'<div class="qcand"><p class="tn">Searching for a free photo...</p></div>';
  if(g.s==="ok"){var u=C.safeUrl(g.url,"img");return'<div class="qcand"><figure class="qcimg"><img src="'+esc(u)+'" alt="Candidate photo" referrerpolicy="no-referrer"><figcaption><small>'+esc(g.why)+'. <a href="'+esc(C.safeUrl(g.page,"link"))+'" target="_blank" rel="noopener noreferrer">File page</a></small></figcaption></figure>'
   +(g.free?'<p><button class="btn pri" id="qk" type="button">Yes, keep it (K)</button> <button class="btn" id="qnp" type="button">Not it (N)</button></p><p class="tn">Free license on Wikimedia Commons. The credit is saved with the photo.</p>':'<p class="msg err">That image looks non-free (a cover or fair-use image). It is not offered.</p><p><button class="btn" id="qnp" type="button">Not it (N)</button></p>')+'</div>'}
  return'<div class="qcand"><p class="tn">'+(g.s==="err"?"Wikipedia is not reachable ("+esc(g.m||"")+").":"No free photo found.")+' Paste an https address instead, or choose a file.</p></div>'}
 if(sg)h+='<p class="qsg">'+(sg.wiki?"Wikipedia has: ":"The timeline has: ")+'<b>'+esc(sg.v.length>220?sg.v.slice(0,220)+"...":sg.v)+'</b>'+(sg.exact||sg.wiki?"":' <small>(closest match: '+esc(sg.from)+')</small>')+(sg.wiki?' <small>('+esc(sg.from)+')</small>':"")+' <button class="btn" id="qu" type="button">Use this</button></p>';
 else if(/^(maker|rel|msrp)$/.test(f.k)||f.spec){var wf=w.f;h+=!wf?'<p><button class="btn" id="qw" type="button">Ask Wikipedia</button></p>':wf.s==="load"?'<p class="tn">Asking Wikipedia...</p>':wf.s==="err"?'<p class="tn">Wikipedia: '+esc(wf.m||"not reachable")+'</p>':'<p class="tn">Wikipedia ('+esc(wf.title)+') has no answer for this one.</p>'}
 return'<div class="qcand">'+h+'</div>'}
function qSide(){if(view!=="quest"||!host||!QS.cur)return;var el=$("qcand"),it=S.items[QS.cur.i];if(!el||!it)return;var cf=QS.cur.f;el.innerHTML=qCandHtml(it,cf);wireCand(it,cf)}
function qGo(it,f,v){var b4=qMeter(it),e=qApply(it,f,v);if(e){QS.msg={t:"err",m:e};QS.pop=0;render();return}qAfter(it,f,b4);render()}
function wireCand(it,f){var qu=$("qu");if(qu)qu.onclick=function(){qGo(it,f,qSuggest(it,f).v)};var qw=$("qw");if(qw)qw.onclick=function(){qWfacts(it);qSide()};
 var qk=$("qk");if(qk)qk.onclick=function(){var g=QW[it.id].img,b4=qMeter(it);it.photos=(it.photos||[]).concat([g.url]);if(!it.credit)it.credit=g.credit;qAfter(it,f,b4);render()};
 var np=$("qnp");if(np)np.onclick=function(){QW[it.id].img={s:"none"};QS.skip[it.id+"|photo"]=1;QS.msg={t:"ok",m:"Next one."};QS.pop=0;render()}}
function qLoadDefaults(o){return Object.assign({xp:0,filled:0,streak:0,best:0,photos:0,full:0,specs:0,takes:0,days:0,goalHit:0,today:0,mute:false,badges:{}},o||{})}
function questView(){if(!QT)QT=qLoad();var lv=qLvl(QT.xp),base=40*(lv-1)*(lv-1),nxt=40*lv*lv,pc=Math.round((QT.xp-base)*100/(nxt-base)),td=C.today(),tdn=QT.day===td?QT.today:0;
 var h='<p class="abar"><button class="btn" id="bk" type="button">Back to the list</button> <button class="btn'+(S.dirty?' pri':'')+'" id="sv" type="button"'+(busy||!S.dirty&&!S.photos.length?" disabled":"")+'>Save to GitHub'+(S.qn?' ('+S.qn+' answers)':'')+'</button> <button class="chip" id="qsn" type="button">Sound: '+(QT.mute?"off":"on")+'</button></p>'
 +'<div class="qhud"><div class="qlv"><b>Level '+lv+': '+esc(QTITLES[Math.min(lv-1,QTITLES.length-1)])+'</b> <span class="mbar"><i style="width:'+pc+'%"></i></span> <small>'+QT.xp+' XP, '+(nxt-QT.xp)+' to next</small></div>'
 +'<div class="qstat"><span title="Answers in a row">Combo x'+QT.streak+'</span><span title="Fields filled today">Today '+Math.min(tdn,QGOAL)+'/'+QGOAL+'</span><span title="Days played in a row">Day streak '+(QT.days||0)+'</span><span>Total '+QT.filled+'</span></div>'
 +'<div class="qtrophy">'+QB.map(function(b){var on=QT.badges[b[0]];return'<span class="qbd'+(on?" on":"")+'" title="'+esc(b[1]+": "+b[2])+'">'+(on?qIc(b[3],18):'<small>?</small>')+'<small>'+esc(on?b[1]:"")+'</small></span>'}).join("")+'</div></div>';
 if(QS.award&&QS.award.length){h+='<div class="qaward">'+QS.award.map(function(a){return'<div>'+qIc(a.ic,28)+'<b>'+esc(a.n)+'</b> <small>'+esc(a.d)+'</small></div>'}).join("")+'</div>';QS.award=null}
 if(QS.boom){h+='<div class="qboom" aria-hidden="true">';for(var i=0;i<26;i++)h+='<i style="--x:'+(Math.round(Math.random()*100))+'%;--d:'+(Math.round(Math.random()*500))+'ms;--c:'+["#ff5555","#55ff55","#ffff55","#55ffff","#ff55ff","#5555ff"][i%6]+'"></i>';h+='</div>';QS.boom=0}
 if(QS.screen==="map"){QS.cur=null;var tiles=S.items.map(function(it){return{it:it,m:qMeter(it)}}).filter(function(x){return x.m.pct<100||QS.showDone}).sort(function(a,b){return b.m.pct-a.m.pct||a.it.name.localeCompare(b.it.name)});
  return shell(h+'<h3 class="sub">Pick your cartridge</h3><p class="tn">Every item is a cartridge waiting to be restored. The closer it is to done, the more color it gets back. Almost-finished ones are first.</p>'
   +'<div class="tools"><button class="chip on" data-qm="quick" type="button">Quick wins</button><button class="chip" data-qm="photo" type="button">Photo Safari</button><button class="chip" data-qm="random" type="button">Surprise me</button><button class="chip'+(QS.showDone?" on":"")+'" id="qsd" type="button">Show finished</button></div>'
   +(tiles.length?'<div class="qmap">'+tiles.map(function(x){return'<button class="qtile" data-qi="'+esc(x.it.id)+'" type="button">'+qPic(x.it,x.m)+'<b>'+esc(x.it.name)+'</b><span class="qst">'+qStars(x.m.pct)+' '+x.m.pct+'%</span></button>'}).join("")+'</div>':'<div class="qcard"><h3 class="qq">Every cartridge is restored!</h3></div>'));}
 var cur=QS.cur=qNext();
 h+='<div class="tools"><button class="chip" id="qmapb" type="button">Level select</button><button class="chip'+(QS.mode==="quick"?" on":"")+'" data-qm="quick" type="button">Quick wins</button><button class="chip'+(QS.mode==="photo"?" on":"")+'" data-qm="photo" type="button">Photo Safari</button><button class="chip'+(QS.mode==="random"?" on":"")+'" data-qm="random" type="button">Surprise me</button></div>';
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
 return shell(h+'<div class="qplay"><div class="qside">'+qPic(it,m)+'<div class="qname"><b>'+esc(it.name)+'</b><br><small class="tn">'+esc(it.maker||"")+' '+esc(it.rel||it.year||"")+'</small></div><p class="qst">'+qStars(m.pct)+' '+mbar(m)+'</p><div class="qchips">'+chips+'</div>'
 +'<p class="tn"><button class="btn" id="qed" type="button">Open full editor</button></p></div>'
 +'<div class="qcard qmain">'+(QS.pop?'<span class="qpop">+'+QS.pop+' XP</span>':"")+(QT.streak>=3?'<span class="qcombo" style="font-size:'+Math.min(34,14+QT.streak)+'px">COMBO x'+QT.streak+'</span>':"")
 +'<div class="qkind">'+qIc(q[0],24)+' <b>'+esc(q[1])+'</b></div><h3 class="qq">'+esc(f.l)+' <span class="tag">+'+f.xp+' XP</span></h3><p class="qwh">'+esc(q[2])+'</p>'+(f.hint?'<p class="tn">'+esc(f.hint)+'</p>':"")
 +'<div id="qcand">'+qCandHtml(it,f)+'</div>'+inp
 +'<p class="abar"><button class="btn pri" id="qa" type="button">Save answer</button> <button class="btn" id="qs" type="button">Skip</button> <button class="btn" id="qn" type="button" title="Hide this field for this item">Does not apply</button></p></div></div>');QS.pop=0}
function wireQuest(){QS.pop=0;$("bk").onclick=function(){view="list";QS.msg=null;render()};$("sv").onclick=save;
 $("qsn").onclick=function(){QT.mute=!QT.mute;qStore();snd([660]);render()};
 host.querySelectorAll("[data-qm]").forEach(function(b){b.onclick=function(){QS.mode=b.dataset.qm;QS.screen="play";QS.pin=null;QS.msg=null;QS.skip={};render()}});
 var sd=$("qsd");if(sd)sd.onclick=function(){QS.showDone=!QS.showDone;render()};
 host.querySelectorAll("[data-qi]").forEach(function(b){b.onclick=function(){QS.mode="item";QS.item=b.dataset.qi;QS.screen="play";QS.pin=null;QS.msg=null;render();window.scrollTo(0,0)}});
 var mb=$("qmapb");if(mb)mb.onclick=function(){QS.screen="map";QS.pin=null;QS.msg=null;render()};
 var cur=QS.cur;if(!cur)return;var it=S.items[cur.i],f=cur.f;
 host.querySelectorAll("[data-qk]").forEach(function(b){b.onclick=function(){QS.pin={id:it.id,k:b.dataset.qk};if(QS.mode!=="item"){QS.mode="item";QS.item=it.id}QS.msg=null;render()}});
 $("qed").onclick=function(){editing={i:cur.i,it:clone(S.items[cur.i]),newPhotos:[],priv:{}};if(!editing.it.photos)editing.it.photos=[];view="edit";note=null;render();window.scrollTo(0,0)};
 $("qa").onclick=function(){qGo(it,f,$("qv").value)};
 $("qv").onkeydown=function(e){if(e.key==="Enter"&&(f.t!=="a"||e.ctrlKey||e.metaKey)){e.preventDefault();$("qa").click()}};
 host.onkeydown=function(e){if(/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))return;var k=e.key.toLowerCase();if(k==="k"&&$("qk"))$("qk").click();else if(k==="n"&&$("qnp"))$("qnp").click()};
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
function render(){if(!host)return;host.innerHTML=!tok||!S?lockedView():view==="edit"?editView():view==="quest"?questView():listView();wire()}
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
 var cr=val("f_credit");if(cr)o.credit=cr;else delete o.credit;
 if(host.querySelector("#f_relx").checked)o.relx=true;else delete o.relx;
 if(host.querySelector("#f_sample").checked)o.sample=true;else delete o.sample;
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
function shrink(file){return new Promise(function(res,rej){var img=new Image(),u=URL.createObjectURL(file);img.onload=function(){var m=1600,r=Math.min(1,m/Math.max(img.width,img.height)),c=document.createElement("canvas");c.width=Math.max(1,Math.round(img.width*r));c.height=Math.max(1,Math.round(img.height*r));c.getContext("2d").drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);res(c.toDataURL("image/jpeg",.85))};img.onerror=function(){URL.revokeObjectURL(u);rej(new Error("That file is not an image the browser can read."))};img.src=u})}
function wire(){if(!host)return;host.oninput=bump;
 var vg=$("vgo");if(vg){var vp=$("vp");vg.onclick=function(){var p=vp.value;vp.value="";if(!p)return;busy=true;render();vaultOpen(p).then(function(t){busy=false;PP=p;unlock(t,false)},function(e){busy=false;note={t:"err",m:e.message};render()})};vp.onkeydown=function(e){if(e.key==="Enter")vg.click()};$("vnew").onclick=function(){pasteMode=true;note=null;render()};$("vfg").onclick=function(){if(confirm("Remove the saved token from this browser?")){vaultForget();note={t:"ok",m:"Saved token removed."};render()}};if(!busy)vp.focus();return}
 var vb=$("vback");if(vb)vb.onclick=function(){pasteMode=false;note=null;render()};
 var gn=$("gen");if(gn)gn.onclick=function(){var p=genPass();$("pp").value=p;$("genout").textContent="Save this in your password manager now: "+p};
 var g=$("go");if(g){var t=$("tk");g.onclick=function(){var pp=$("pp").value,tv=t.value;if(pp){var pr=passProblem(pp);if(pr){note={t:"err",m:pr};render();return}}pasteMode=false;t.value="";if(pp)PP=pp;unlock(tv,false,pp)};t.onkeydown=function(e){if(e.key==="Enter")g.click()};if(!busy)t.focus();return}
 if(view==="quest"){wireQuest();return}
 if(view==="edit"){
  $("nb").onclick=function(){var el=host.querySelector("input[data-bl]:placeholder-shown");if(el){el.scrollIntoView({block:"center"});el.focus()}else{$("ferr").innerHTML='<div class="msg ok">No blank basics or specs left.</div>'}};
  $("ty").onchange=function(){editing.it=collectSoft();render()};
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
  $("pf").onchange=function(e){var files=Array.prototype.slice.call(e.target.files||[]);if(!files.length)return;var keep=collectSoft(),id=slug(val("f_id")||val("f_name"))||"item";
   var p=Promise.resolve();files.forEach(function(f,n){p=p.then(function(){return shrink(f).then(function(d){editing.newPhotos.push({data:d,b64:d.split(",")[1],path:"photos/"+id+"-"+Date.now().toString(36)+n+".jpg"})})})});
   p.then(function(){editing.it=keep;render()},function(er){$("ferr").innerHTML='<div class="msg err">'+esc(er.message)+'</div>'})};
  $("ok").onclick=function(){var r=collect();if(r.err.length){$("ferr").innerHTML='<div class="msg err"><b>Fix these first:</b><br>'+r.err.map(esc).join("<br>")+'</div>';return}
   var fin=function(){if(editing.i<0)S.items.push(r.o);else S.items[editing.i]=r.o;
    editing.newPhotos.forEach(function(p){S.photos.push({path:p.path,b64:p.b64})});
    S.dirty=true;note={t:"ok",m:(editing.i<0?"Added ":"Updated ")+r.o.name+". Press Save to GitHub to publish."};editing=null;view="list";render()};
   if(editing.privOk){var has=Object.keys(editing.priv).length;if(!has){delete r.o.privEnc;fin()}else if(!PP){$("ferr").innerHTML='<div class="msg err">Open the private fields with your passphrase first.</div>'}else{encPriv(editing.priv,PP).then(function(pe){r.o.privEnc=pe;fin()},function(er){$("ferr").innerHTML='<div class="msg err">Could not encrypt the private fields: '+esc(er.message)+'</div>'})}}
   else fin()};
  return}
 $("lk").onclick=function(){if(S.dirty&&!confirm("You have unsaved changes. Lock anyway and lose them?"))return;lock("Locked.")};
 $("add").onclick=function(){editing={i:-1,it:{type:"Other",photos:[]},newPhotos:[],priv:{}};if(PP){editing.privOk=true}view="edit";note=null;render()};
 $("sv").onclick=save;
 $("dl").onclick=function(){var b=new Blob([serialize(S.items)],{type:"text/javascript"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="items.js";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},2000)};
 var aq=$("aq");aq.oninput=function(){q=aq.value;var pos=aq.selectionStart;render();var n=$("aq");n.focus();try{n.setSelectionRange(pos,pos)}catch(e){}};
 host.querySelectorAll("[data-e]").forEach(function(b){b.onclick=function(){var i=+b.dataset.e;editing={i:i,it:clone(S.items[i]),newPhotos:[],priv:{}};if(!editing.it.photos)editing.it.photos=[];view="edit";note=null;render();window.scrollTo(0,0);if(PP&&editing.it.privEnc)decPriv(editing.it.privEnc,PP).then(function(o){editing.priv=o||{};editing.privOk=true;render()},function(){})}});
 host.querySelectorAll("[data-d]").forEach(function(b){b.onclick=function(){var i=+b.dataset.d,it=S.items[i];if(!confirm('Delete "'+it.name+'" from the catalog? You can undo until you leave this page.'))return;S.items.splice(i,1);(S.undo=S.undo||[]).push({it:it,i:i});S.dirty=true;note={t:"ok",m:"Removed "+it.name+". Press Undo delete to bring it back, or Save to GitHub to publish."};render()}});
 host.querySelectorAll("[data-c]").forEach(function(b){b.onclick=function(){var src=S.items[+b.dataset.c],cp=clone(src),id=slug(src.id)+"-copy",n=2;while(S.items.some(function(x){return x.id===id}))id=slug(src.id)+"-copy-"+n++;
  delete cp.privEnc;cp.name=src.name+" (copy)";cp.id=id;editing={i:-1,it:cp,newPhotos:[],priv:{}};if(!cp.photos)cp.photos=[];if(PP)editing.privOk=true;view="edit";note={t:"ok",m:"This is a copy of "+src.name+". Change what differs, then Add to the catalog."};render();window.scrollTo(0,0)}});
 host.querySelectorAll("[data-q]").forEach(function(b){b.onclick=function(){QS.mode="item";QS.item=S.items[+b.dataset.q].id;QS.screen="play";QS.pin=null;QS.msg=null;QS.skip={};view="quest";note=null;render();window.scrollTo(0,0)}});
 host.querySelectorAll("[data-lf]").forEach(function(b){b.onclick=function(){lf=b.dataset.lf;render()}});
 $("ls").onchange=function(){ls=this.value;render()};
 $("qgo").onclick=function(){QS.mode="quick";QS.screen="map";QS.skip={};QS.msg=null;view="quest";note=null;render();window.scrollTo(0,0)};
 $("qph").onclick=function(){QS.mode="photo";QS.screen="play";QS.skip={};QS.msg=null;view="quest";note=null;render();window.scrollTo(0,0)};
 var qab=$("qab");qab.onclick=function(){var v=$("qan").value.trim();if(v.length<2)return;var res=tlMatches(v);if(res.length&&res[0].sc===100&&(!res[1]||res[1].sc<100)){qaddMake(res[0].r[2],res[0].r);return}QA={q:v,res:res};render();var n=$("qan");n.focus()};
 $("qan").onkeydown=function(e){if(e.key==="Enter")qab.click()};
 host.querySelectorAll("[data-qr]").forEach(function(b){b.onclick=function(){var r=QA.res[+b.dataset.qr].r;qaddMake(r[2],r)}});
 var qbk=$("qbk");if(qbk)qbk.onclick=function(){qaddMake(QA.q,null,$("qat").value)};
 $("bulk").onclick=function(){if(confirm("Fill every blank field that has an exact timeline match? You can review the result before saving."))bulkFill()};
 var ud=$("ud");if(ud)ud.onclick=function(){var u=S.undo.pop();S.items.splice(Math.min(u.i,S.items.length),0,u.it);S.dirty=true;note={t:"ok",m:"Brought back "+u.it.name+"."};render()}}
function collectSoft(){var r=null;try{r=collect().o}catch(e){}return r||editing.it}
function mount(el,ctx){C=ctx;host=el;render();bump()}
function unmount(){host=null}
window.addEventListener("beforeunload",function(e){if(S&&S.dirty){e.preventDefault();e.returnValue=""}});
window.CMAdmin={mount:mount,unmount:unmount,_t:{serialize:serialize,parseItems:parseItems}};
})();
