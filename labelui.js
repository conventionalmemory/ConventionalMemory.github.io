/* Pages for the label printer: #/labels (set up, preview, print) and #/scan (look up a label, check off inventory).
   Needs qr.js and labelprint.js, which toys.js loads first. */
var CMLabelUI=(function(){
 var app,sel={},prev=null,cancel=false,stopCam=null;
 function E(s){return esc(s==null?"":String(s))}
 function $(s){return app.querySelector(s)}
 function $$(s){return[].slice.call(app.querySelectorAll(s))}
 function ld(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}}
 function sv(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
 function pool(all){return ALLITEMS.filter(function(i){return all||!i.draft})}
 function opt(v,t,cur){return'<option value="'+E(v)+'"'+(String(v)===String(cur)?" selected":"")+'>'+E(t)+'</option>'}

 /* ---------------------------------------------------------------- #/labels */
 function labels(el,arg){app=el;unmount();var S=CMLabel.load(),all=!!ADMINVIEW||(ld("cm-labelall",0)===1),focus=arg?(ALLITEMS.filter(function(i){return i.id===arg})[0]||itemByTag(arg)):null;
  if(focus&&focus.draft)all=true;prev=focus?focus.cm:null;sel={};if(focus&&focus.cm)sel[focus.cm]=1;
  var BT=CMLabel.supported();
  app.innerHTML='<section class="lbl"><h2>Print labels</h2>'
  +'<p>Every exhibit gets a permanent label number (CM-0007) and a QR code that opens its page on this site. Stick the label on the item, then scan it with any phone camera, or with the <a href="#/scan">Scan page</a>, to see it in the catalog.</p>'
  +'<div class="lb-card"><h3>1. Printer</h3><p id="lbst" role="status" class="lb-st">'+(BT?"Not connected.":"This browser cannot print over Bluetooth. Use Chrome on a computer or an Android phone. You can still download label images or use the browser print dialog below.")+'</p>'
  +'<p><button class="btn pri" id="lbcon" type="button"'+(BT?"":" disabled")+'>Connect printer</button> <button class="btn" id="lbcon2" type="button"'+(BT?"":" disabled")+'>Show all Bluetooth devices</button> <button class="btn" id="lbtest" type="button"'+(BT?"":" disabled")+'>Test print</button> <button class="btn" id="lbdis" type="button" hidden>Disconnect</button></p>'
  +'<p class="tn">Experimental. Turn the printer on, pick it from the list Chrome shows (use the second button if yours is not listed). If nothing prints, or the picture is cut off or shifted, try Test print and the Advanced settings below. Download and browser print always work.</p></div>'
  +'<div class="lb-card"><h3>2. Label</h3><div class="lb-row">'
  +'<label>Size <select id="lbsz">'+CMLabel.SIZES.map(function(z){return opt(z[0],z[1],S.size)}).join("")+'</select></label>'
  +'<span id="lbcu"'+(S.size==="custom"?"":" hidden")+'><label>Width mm <input id="lbw" type="number" min="15" max="80" value="'+E(S.w)+'" class="mx-n"></label> <label>Height mm <input id="lbh" type="number" min="10" max="100" value="'+E(S.h)+'" class="mx-n"></label></span>'
  +'<label>Code <select id="lbst2">'+opt("qr","QR code",S.style)+opt("both","QR code and Code 128 bars",S.style)+opt("c128","Code 128 bars only",S.style)+'</select></label></div>'
  +'<p><label>Web address in the QR code <input id="lbbase" type="url" class="lb-url" value="'+E(S.base)+'"></label></p>'
  +'<p class="tn">Labels you stick on things carry this address forever, so only change it if the site moves. Right now the code opens <code id="lbex"></code></p>'
  +'<p id="lbwarn" class="tn" role="status"></p><p><button class="btn" id="lbrb" type="button">Reset to the museum address</button></p>'
  +'<details><summary>Advanced printer settings</summary><div class="lb-row">'
  +'<label>Darkness (1 to 15) <input id="lbde" type="number" min="1" max="15" value="'+E(S.dens)+'" class="mx-n"></label>'
  +'<label>Speed (1 slow, 5 fast) <input id="lbsp" type="number" min="1" max="5" value="'+E(S.speed)+'" class="mx-n"></label>'
  +'<label>Shift right mm <input id="lbsh" type="number" min="-10" max="10" step="0.5" value="'+E(S.shift)+'" class="mx-n"></label>'
  +'<label>Label type <select id="lbmd">'+opt("0a","Labels with gaps",S.media)+opt("0b","Continuous roll",S.media)+opt("26","Labels with black marks",S.media)+'</select></label>'
  +'<label>Error correction <select id="lbec">'+opt("L","Low (smaller code, easier to scan)",S.ecc)+opt("M","Medium",S.ecc)+'</select></label>'
  +'<label><input type="checkbox" id="lbslow"'+(S.slow?" checked":"")+'> Slow mode (smaller, slower Bluetooth packets, if it stalls or prints garbage)</label></div></details></div>'
  +'<div class="lb-card lb-pv"><h3>Preview</h3><div id="lbpv" class="lb-pvbox"></div><p class="tn" id="lbpc"></p></div>'
  +'<div class="lb-card"><h3>3. Pick labels</h3><p><input id="lbq" type="search" placeholder="Filter by name or number" class="lb-q" aria-label="Filter labels"> <label><input type="checkbox" id="lbdr"'+(all?" checked":"")+'> Include exhibits not on the public site yet</label></p>'
  +'<p><button class="btn" id="lbsa" type="button">Select all shown</button> <button class="btn" id="lbsn" type="button">Select none</button> <label>Copies <input id="lbcp" type="number" min="1" max="20" value="'+E(S.copies)+'" class="mx-n"></label></p>'
  +'<div id="lbl-list" class="lb-list"></div>'
  +'<p class="lb-act"><button class="btn pri" id="lbpr" type="button"'+(BT?"":" disabled")+'>Print selected to the label printer</button> <button class="btn" id="lbstop" type="button" hidden>Stop</button> <button class="btn" id="lbdl" type="button">Download PNG</button> <button class="btn" id="lbbr" type="button">Print with the browser</button></p>'
  +'<p id="lbmsg" class="tn" role="status"></p></div></section>';
  var ST=S;
  function rows(){var q=$("#lbq").value.toLowerCase().trim(),a=$("#lbdr").checked;return pool(a).filter(function(i){return!q||(i.name+" "+(i.maker||"")+" "+(i.cm?CMLabel.tagNo(i.cm):"")).toLowerCase().indexOf(q)>=0})}
  function readSettings(){var s=CMLabel.load();s.size=$("#lbsz").value;if(s.size==="custom"){s.w=$("#lbw").value;s.h=$("#lbh").value}s.style=$("#lbst2").value;s.base=$("#lbbase").value;s.dens=$("#lbde").value;s.speed=$("#lbsp").value;s.shift=$("#lbsh").value;s.media=$("#lbmd").value;s.ecc=$("#lbec").value;s.slow=$("#lbslow").checked;s.copies=$("#lbcp").value;s=CMLabel.fix(s);return s}
  function items(){return pool($("#lbdr").checked).filter(function(i){return i.cm&&sel[i.cm]})}
  function list(){var r=rows();$("#lbl-list").innerHTML=r.length?r.map(function(i){var n=i.cm?CMLabel.tagNo(i.cm):"";return'<label class="lb-r'+(i.cm===prev?" cur":"")+(i.cm?"":" off")+'"><input type="checkbox" data-cm="'+E(i.cm||"")+'"'+(i.cm?"":" disabled")+(i.cm&&sel[i.cm]?" checked":"")+'> <b>'+E(n||"no number yet")+'</b> '+E(i.name)+(i.draft?' <small class="tn">not public yet</small>':"")+' <button type="button" class="btn lb-v" data-pv="'+E(i.cm||"")+'"'+(i.cm?"":" disabled")+'>Preview</button></label>'}).join(""):'<p class="empty">No exhibits match.</p>';
   $$("#lbl-list input[data-cm]").forEach(function(c){c.onchange=function(){var k=+c.dataset.cm;if(c.checked){sel[k]=1;prev=k}else delete sel[k];count();pv()}});
   $$("#lbl-list [data-pv]").forEach(function(b){b.onclick=function(){prev=+b.dataset.pv;pv();$$("#lbl-list .lb-r").forEach(function(r){r.classList.remove("cur")});b.parentNode.classList.add("cur")}});count()}
  function count(){var n=items().length;$("#lbpr").textContent="Print "+n+" selected to the label printer";$("#lbpr").disabled=!CMLabel.supported()||!n;$("#lbdl").disabled=!n;$("#lbbr").disabled=!n}
  function pv(){var s=readSettings(),it=ALLITEMS.filter(function(i){return i.cm===prev})[0]||pool(true).filter(function(i){return i.cm})[0],box=$("#lbpv");
   $("#lbex").textContent=s.base+"#/t/7";var w=$("#lbwarn"),own=typeof SITE_URL==="string"?SITE_URL:s.base;
   w.textContent=s.base!==own?"Careful: this is not the museum's own address ("+own+"). Labels printed with it will open somewhere else. Reset it unless you changed domains.":(/github\.io/.test(own)?"Tip: your own domain keeps printed stickers working if the site ever moves. See the README, \"Your own domain\".":"");w.className="tn"+(s.base!==own?" bad":"");
   if(!it){box.innerHTML='<p class="empty">No exhibit has a label number yet. Save once in Admin and they are assigned.</p>';return}
   try{var c=CMLabel.render(CMLabel.info(it,s),s),im=new Image();im.src=c.toDataURL("image/png");im.alt="Preview of label "+CMLabel.tagNo(it.cm);im.className="lb-img";im.style.width=Math.round(s.w*5.2)+"px";box.innerHTML="";box.appendChild(im);
    $("#lbpc").textContent=CMLabel.tagNo(it.cm)+": "+s.w+" x "+s.h+" mm at 203 dpi, QR opens "+CMLabel.urlFor(it,s)}catch(e){box.innerHTML='<p class="empty">Could not draw the label: '+E(e.message)+'</p>'}}
  function changed(){var s=readSettings();CMLabel.save(s);$("#lbcu").hidden=$("#lbsz").value!=="custom";pv()}
  ["#lbsz","#lbw","#lbh","#lbst2","#lbbase","#lbde","#lbsp","#lbsh","#lbmd","#lbec","#lbslow","#lbcp"].forEach(function(q){var e=$(q);if(e){e.onchange=changed;if(e.type==="number"||e.type==="url")e.oninput=changed}});
  $("#lbrb").onclick=function(){$("#lbbase").value=typeof SITE_URL==="string"?SITE_URL:"";changed()};
  $("#lbq").oninput=list;$("#lbdr").onchange=function(){sv("cm-labelall",this.checked?1:0);list()};
  $("#lbsa").onclick=function(){rows().forEach(function(i){if(i.cm)sel[i.cm]=1});list()};$("#lbsn").onclick=function(){sel={};list();pv()};
  function status(t,bad){var e=$("#lbst");if(e){e.textContent=t;e.className="lb-st"+(bad?" bad":"")}}
  function msg(t,bad){var e=$("#lbmsg");if(e){e.textContent=t;e.className="tn"+(bad?" bad":"")}}
  function connected(){status("Connected to "+CMLabel.deviceName()+".");$("#lbdis").hidden=false}
  function doConnect(all){status("Waiting for you to pick the printer...");CMLabel.connect(all).then(connected,function(e){status(/cancel|chosen|No device selected/i.test(e.message)?"No printer chosen.":"Could not connect: "+e.message,!/cancel|chosen|No device selected/i.test(e.message))})}
  $("#lbcon").onclick=function(){doConnect(false)};$("#lbcon2").onclick=function(){doConnect(true)};
  $("#lbdis").onclick=function(){CMLabel.disconnect();this.hidden=true;status("Disconnected.")};
  if(CMLabel.connected())connected();
  $("#lbtest").onclick=function(){var s=readSettings();msg("Sending a test label...");CMLabel.printCanvas(CMLabel.testCanvas(s),s).then(function(){msg("Sent. The border should sit just inside the label edges, with the cross in the middle. If it is shifted sideways, adjust Shift right.")},function(e){msg("Could not print: "+e.message,true)})};
  $("#lbpr").onclick=function(){var s=readSettings(),l=items();if(!l.length)return;cancel=false;$("#lbstop").hidden=false;$("#lbpr").disabled=true;
   CMLabel.printMany(l.map(function(i){return CMLabel.info(i,s)}),s,function(n,t,it){msg("Printing "+n+" of "+t+": "+it.tag)},function(){return cancel}).then(function(n){msg(cancel?"Stopped after "+n+".":"Sent "+n+" label"+(n===1?"":"s")+".")},function(e){msg("Stopped: "+e.message,true)}).then(function(){$("#lbstop").hidden=true;count()})};
  $("#lbstop").onclick=function(){cancel=true};
  $("#lbdl").onclick=function(){var s=readSettings(),l=items(),i=0;msg("Downloading "+l.length+" image"+(l.length===1?"":"s")+"...");(function nx(){if(i>=l.length){msg("Done. Import the PNG files into the Phomemo app, or print them from any program.");return}var it=l[i++];CMLabel.download(CMLabel.render(CMLabel.info(it,s),s),CMLabel.tagNo(it.cm)+".png");setTimeout(nx,350)})()};
  $("#lbbr").onclick=function(){var s=readSettings(),l=items(),sheet=document.createElement("div"),st=document.createElement("style");sheet.id="lbsheet";
   l.forEach(function(it){for(var k=0;k<s.copies;k++){var im=new Image();im.src=CMLabel.render(CMLabel.info(it,s),s).toDataURL("image/png");im.alt=CMLabel.tagNo(it.cm);sheet.appendChild(im)}});
   st.textContent="#lbsheet{display:none}@media print{@page{size:"+s.w+"mm "+s.h+"mm;margin:0}html,body{background:#fff!important}body>*:not(#lbsheet){display:none!important}#lbsheet{display:block}#lbsheet img{display:block;width:"+s.w+"mm;height:"+s.h+"mm;page-break-after:always;break-after:page;image-rendering:pixelated}}";
   document.body.appendChild(st);document.body.appendChild(sheet);var done=function(){window.removeEventListener("afterprint",done);sheet.remove();st.remove()};window.addEventListener("afterprint",done);setTimeout(function(){window.print();setTimeout(function(){if(document.getElementById("lbsheet"))done()},60000)},150)};
  list();pv();changed()}

 /* ---------------------------------------------------------------- #/scan */
 function digitsOnly(s){return String(s).replace(/\D/g,"")}
 function resolve(raw){var v=String(raw||"").trim();if(!v)return null;var m=v.match(/#\/t\/(?:cm-?)?0*(\d{1,6})\b/i);if(m)return{it:itemByTag(m[1]),how:"tag"};
  m=v.match(/#\/item\/([a-z0-9-]+)/i);if(m){var x=ALLITEMS.filter(function(i){return i.id===m[1]})[0];return{it:x||null,how:"link"}}
  if(/^(?:cm[-\s]?)?\d{1,6}$/i.test(v))return{it:itemByTag(v),how:"tag"};
  var d=digitsOnly(v);if(d.length>=8){var u=ALLITEMS.filter(function(i){return i.upc&&digitsOnly(i.upc)===d})[0];return{it:u||null,how:"upc"}}
  return{it:null,how:"text"}}
 function scan(el){app=el;unmount();var inv=ld("cm-inv",{}),mode=ld("cm-invmode",0)===1;
  app.innerHTML='<section class="scn"><h2>Scan a label</h2><p>Use a handheld scanner (it types the code and presses Enter), your phone camera, or type a number like <b>CM-0007</b>. You can also just point a phone camera at a label: the QR code opens the exhibit directly.</p>'
  +'<p><input id="sci" class="hq-in" type="text" inputmode="text" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Scan or type CM-0007" aria-label="Scan or type a label number"></p>'
  +'<p><button class="btn" id="scc" type="button" hidden>Scan with camera</button> <label><input type="checkbox" id="sci2"'+(mode?" checked":"")+'> Inventory mode: check off what I scan</label></p>'
  +'<video id="scv" playsinline muted hidden class="hq-v"></video><div id="scr" aria-live="polite"></div><div id="sct"></div></section>';
  var inp=$("#sci");
  function track(){var t=$("#sct");if(!mode){t.innerHTML="";return}var l=ALLITEMS.filter(function(i){return i.cm}),done=l.filter(function(i){return inv[i.cm]}),miss=l.filter(function(i){return!inv[i.cm]});
   t.innerHTML='<h3 class="sub">Inventory</h3><p><b>'+done.length+'</b> of '+l.length+' checked off.</p><div class="lb-bar" role="progressbar" aria-valuemin="0" aria-valuemax="'+l.length+'" aria-valuenow="'+done.length+'"><i style="width:'+(l.length?Math.round(done.length/l.length*100):0)+'%"></i></div>'
    +(miss.length?'<details><summary>Not scanned yet ('+miss.length+')</summary><ul class="pl-sr">'+miss.map(function(i){return'<li><b>'+E(CMLabel.tagNo(i.cm))+'</b> <a href="#/item/'+E(i.id)+'">'+E(i.name)+'</a></li>'}).join("")+'</ul></details>':'<p class="empty">Everything has been scanned.</p>')
    +'<p><button class="btn" id="scrs" type="button">Start a new inventory</button></p>';
   var r=$("#scrs");if(r)r.onclick=function(){if(r.dataset.sure){inv={};sv("cm-inv",inv);track()}else{r.dataset.sure="1";r.textContent="Click again to clear the list"}}}
  function show(raw){var r=resolve(raw),out=$("#scr");if(!r){out.innerHTML="";return}
   if(!r.it){out.innerHTML='<div class="hq-c no"><b class="hq-n">NOT FOUND</b><p>Nothing matches "'+E(raw)+'". Try the number printed on the label.</p></div>';return}
   var it=r.it;if(mode&&it.cm){inv[it.cm]=Date.now();sv("cm-inv",inv)}
   out.innerHTML='<div class="hq-c yes"><b class="hq-n">'+E(CMLabel.tagNo(it.cm)||"FOUND")+(mode?" CHECKED OFF":"")+'</b><div class="grid">'+card(it)+'</div>'+(it.draft?'<p class="tn">Not on the public site yet.</p>':"")+'</div>';track()}
  inp.onkeydown=function(e){if(e.key==="Enter"){e.preventDefault();show(inp.value);inp.select()}};
  $("#sci2").onchange=function(){mode=this.checked;sv("cm-invmode",mode?1:0);track()};
  var sc=$("#scc");if(window.BarcodeDetector&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia){sc.hidden=false;sc.onclick=function(){if(stopCam){stopCam();return}var v=$("#scv"),det;try{det=new BarcodeDetector({formats:["qr_code","code_128"]})}catch(e){det=new BarcodeDetector()}var stop=false,st=null;
    stopCam=function(){stop=true;if(st)st.getTracks().forEach(function(t){t.stop()});v.hidden=true;sc.textContent="Scan with camera";stopCam=null};
    navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}}).then(function(s){st=s;v.srcObject=s;v.hidden=false;v.play();sc.textContent="Stop camera";var last="",lt=0;(function tick(){if(stop)return;det.detect(v).then(function(b){if(b&&b.length){var t=b[0].rawValue,now=Date.now();if(t!==last||now-lt>2500){last=t;lt=now;inp.value=t;show(t)}}setTimeout(tick,350)},function(){setTimeout(tick,600)})})()},function(){stopCam();$("#scr").innerHTML='<p class="empty">The camera is not available. Allow camera access, or type the number.</p>'})}}
  track();inp.focus()}
 function unmount(){cancel=true;if(stopCam)stopCam()}
 return{labels:labels,scan:scan,unmount:unmount,resolve:resolve}
})();
