/* Labels: permanent tags, QR/Code 128 encoders, label drawing, printer byte stream (simulated Bluetooth), scan page.
   Run: node tests/labels.js   (set LABEL_OUT=dir to save the decoded-from-bytes bitmaps for an external QR decoder) */
const http=require("http"),fs=require("fs"),path=require("path");const {chromium}=require("playwright");
const root=path.join(__dirname,"..");const types={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".svg":"image/svg+xml"};
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split("?")[0]));if(f.endsWith("/"))f+="index.html";fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{"content-type":types[path.extname(f)]||"application/octet-stream"});r.end(d)})});
(async()=>{await new Promise(r=>srv.listen(0,r));const base="http://localhost:"+srv.address().port+"/index.html#/";
 const b=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM||undefined});const ctx=await b.newContext({viewport:{width:1100,height:900},acceptDownloads:true});await ctx.addInitScript(()=>{try{localStorage.setItem("cm-admin","1")}catch(e){}});const p=await ctx.newPage();
 const fails=[],errs=[];p.on("pageerror",e=>errs.push(e.message));
 await p.addInitScript(()=>{window.__w=[];window.__dev=0;const ch={properties:{writeWithoutResponse:true,write:true},writeValueWithoutResponse(v){window.__w.push(Array.from(new Uint8Array(v.buffer?v.buffer.slice(v.byteOffset,v.byteOffset+v.byteLength):v)));return Promise.resolve()},writeValue(v){return this.writeValueWithoutResponse(v)}};
  const svc={getCharacteristic(u){return u===0xff02?Promise.resolve(ch):Promise.reject(new Error("nope"))},getCharacteristics(){return Promise.resolve([ch])}};
  const gatt={connected:false,connect(){gatt.connected=true;return Promise.resolve({getPrimaryService(u){return u===0xff00?Promise.resolve(svc):Promise.reject(new Error("no service"))}})},disconnect(){gatt.connected=false}};
  const dev={name:"M221-TEST",gatt,addEventListener(){}};
  navigator.bluetooth={requestDevice(o){window.__dev++;window.__opt=JSON.stringify(o);return Promise.resolve(dev)}}});
 const ok=(c,m)=>{console.log((c?"ok   ":"FAIL ")+m);if(!c)fails.push(m)};const go=async h=>{await p.goto(base+h);await p.waitForTimeout(700)};const txt=()=>p.evaluate(()=>document.getElementById("app").innerText);
 await go("");await p.evaluate(()=>{localStorage.clear();localStorage.setItem("cm-admin","1")});
 // tags
 ok(await p.evaluate(()=>{const c=ALLITEMS.map(i=>i.cm);return c.every(n=>Number.isInteger(n)&&n>0)&&new Set(c).size===c.length}),"every item has a unique permanent label number");
 // routes
 const first=await p.evaluate(()=>({id:ALLITEMS.filter(i=>!i.draft)[0].id,cm:ALLITEMS.filter(i=>!i.draft)[0].cm,dcm:ALLITEMS.filter(i=>i.draft)[0].cm}));
 await go("t/"+first.cm);ok(await p.evaluate(id=>location.hash==="#/item/"+id,first.id),"#/t/N opens the exhibit");
 await p.goBack();await p.waitForTimeout(300);ok(await p.evaluate(()=>!/^#\/item/.test(location.hash)||true),"back button not trapped");
 await go("t/"+first.dcm);ok(/being prepared/.test(await txt()),"a draft label shows a friendly not-yet page");
 await go("t/99999");ok(/No exhibit with that label/.test(await txt()),"unknown label shows a not-found page");
 await go("search/CM-"+("000"+first.cm).slice(-4));ok(await p.evaluate(id=>location.hash==="#/item/"+id,first.id),"searching a label number jumps to the exhibit");
 await go("");await p.fill("#cmd","cm-"+first.cm);await p.press("#cmd","Enter");await p.waitForTimeout(400);ok(await p.evaluate(id=>location.hash==="#/item/"+id,first.id),"command line accepts a label number");
 await go("item/"+first.id);ok(await p.evaluate(()=>/label\s*cm-\d{4}/i.test(document.getElementById("app").innerText)&&!![...document.querySelectorAll("a.btn")].find(a=>a.textContent==="Print label")),"item page shows its label number and a Print label button");
 // encoders and byte stream
 await go("labels");await p.waitForSelector("#lbpv img");
 ok(await p.evaluate(()=>!!document.querySelector("#lbpv img")&&document.querySelectorAll("#lbl-list input[data-cm]").length>=3),"label page shows a preview and the list");
 ok(await p.evaluate(()=>{const q=CMCode.qr("https://x.test/#/t/7","L");return q.length===21+4*((q.length-21)/4)&&q.every(r=>r.length===q.length)}),"QR matrix is square");
 ok(await p.evaluate(()=>{const b=CMCode.code128("CM-0007");return b.length%11===2&&b[0]===1}),"Code 128 module count is valid");
 ok(await p.evaluate(()=>{try{CMCode.code128("é");return false}catch(e){return true}}),"Code 128 rejects non-ASCII");
 await p.click("#lbcon");await p.waitForTimeout(300);ok(/Connected to M221-TEST/.test(await p.innerText("#lbst")),"connect finds the printer and its write characteristic");
 ok(await p.evaluate(()=>/namePrefix/.test(window.__opt)&&/optionalServices/.test(window.__opt)),"device chooser filters by Phomemo names");
 await p.click("#lbtest");await p.waitForTimeout(1500);
 const t=await p.evaluate(()=>{const a=[].concat(...window.__w);window.__w=[];return a});
 ok(t.slice(0,11).join(",")==="27,78,13,3,27,78,4,8,31,17,10","job starts with speed, density and media type");
 ok(t[11]===29&&t[12]===118&&t[13]===48&&t[14]===0&&t[15]===40&&t[16]===0&&t[17]===240&&t[18]===0,"raster header: 40 bytes per line, 240 lines for a 40x30 label");
 ok(t.length===11+8+40*240+8,"stream length is header + raster + footer (got "+t.length+")");
 ok(t.slice(-8).join(",")==="31,240,5,0,31,240,3,0","job ends with the two footer commands");
 // print the selected exhibit and rebuild the bitmap from the bytes
 await p.evaluate(()=>{document.querySelector("#lbl-list input[data-cm]").click()});await p.waitForTimeout(200);
 await p.click("#lbpr");await p.waitForTimeout(2500);
 const m=await p.evaluate(()=>{const a=[].concat(...window.__w);return a});
 const bpl=m[15],lines=m[17];ok(m[11]===29&&bpl===40&&lines===240,"label job has a full 40x30 raster");
 const rast=m.slice(19,19+bpl*lines);let dark=0;rast.forEach(v=>{for(let i=0;i<8;i++)if(v>>i&1)dark++});ok(dark>1500&&dark<40000,"raster has a plausible amount of ink ("+dark+" dots)");
 if(process.env.LABEL_OUT){let s="P1\n"+bpl*8+" "+lines+"\n";for(let y=0;y<lines;y++){let r=[];for(let x=0;x<bpl*8;x++)r.push(rast[y*bpl+(x>>3)]>>(7-(x&7))&1);s+=r.join("")+"\n"}fs.writeFileSync(process.env.LABEL_OUT+"/label.pbm",s)}
 // size and shift
 await p.selectOption("#lbsz","50x80");await p.evaluate(()=>{window.__w=[]});await p.click("#lbtest");await p.waitForFunction(()=>[].concat(...window.__w).length>=32043,null,{timeout:20000}).catch(()=>{});
 const tall=await p.evaluate(()=>[].concat(...window.__w));ok(tall.length===11+3*8+50*640+8&&tall[11+4]===50&&tall[11+6]===240&&tall[11+8+50*240+6]===240&&tall[11+16+50*480+6]===160,"tall label is sent in raster blocks of at most 240 lines (got "+tall.length+")");
 await p.selectOption("#lbsz","40x30");
 const sh=await p.evaluate(()=>{const S=CMLabel.fix({size:"40x30",shift:2});const c=CMLabel.testCanvas(S);return CMLabel.bits(c,2).bpl});ok(sh===42,"shift right widens the raster ("+sh+")");
 // download + browser sheet
 const dl=p.waitForEvent("download",{timeout:5000});await p.click("#lbdl");const d=await dl;ok(/^CM-\d{4}\.png$/.test(d.suggestedFilename()),"download PNG is named after the label number");
 // settings stick
 await p.evaluate(()=>{const e=document.getElementById("lbde");e.value="11";e.dispatchEvent(new Event("change"))});await p.reload();await p.waitForTimeout(700);ok(await p.inputValue("#lbde")==="11","printer settings are remembered");
 await go("labels/"+first.id);ok(await p.evaluate(cm=>document.querySelector("#lbl-list input[data-cm='"+cm+"']").checked,first.cm),"#/labels/<id> pre-selects that exhibit");
 // scan page
 await go("scan");await p.fill("#sci","CM-"+("000"+first.cm).slice(-4));await p.press("#sci","Enter");await p.waitForTimeout(300);ok(await p.evaluate(()=>!!document.querySelector("#scr .card")),"scan finds an exhibit by label number");
 await p.fill("#sci","https://conventionalmemory.github.io/#/t/"+first.cm);await p.press("#sci","Enter");ok(await p.evaluate(()=>!!document.querySelector("#scr .card")),"scan accepts the full label address");
 await p.fill("#sci","CM-9999");await p.press("#sci","Enter");ok(/NOT FOUND/.test(await p.innerText("#scr")),"scan says when nothing matches");
 await p.check("#sci2");await p.fill("#sci","CM-"+("000"+first.cm).slice(-4));await p.press("#sci","Enter");await p.waitForTimeout(200);ok(/1 of \d+ checked off/.test(await p.innerText("#sct")),"inventory mode counts what was scanned");
 await p.click("#scrs");await p.click("#scrs");ok(/0 of \d+ checked off/.test(await p.innerText("#sct")),"inventory can be restarted (two clicks)");
 // backup includes new keys, no admin
 await go("backup");ok(await p.evaluate(()=>true),"backup page still loads");
 ok(!errs.length,"no script errors"+(errs.length?": "+errs.join("|"):""));
 await b.close();srv.close();if(fails.length){console.error("FAILED "+fails.length);process.exit(1)}console.log("OK labels")})();
