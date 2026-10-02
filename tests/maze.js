/* Memory Maze: character select, Connie and Zack in the house, talking, and run-code replay.   Run: node tests/maze.js */
const http=require("http"),fs=require("fs"),path=require("path");const {chromium}=require("playwright");
const root=path.join(__dirname,"..");const types={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".svg":"image/svg+xml"};
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split("?")[0]));if(f.endsWith("/"))f+="index.html";fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{"content-type":types[path.extname(f)]||"application/octet-stream"});r.end(d)})});
(async()=>{await new Promise(r=>srv.listen(0,r));const base="http://localhost:"+srv.address().port+"/index.html#/";
 const b=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM||undefined});const p=await (await b.newContext({viewport:{width:1000,height:900}})).newPage();
 const fails=[],errs=[];p.on("pageerror",e=>errs.push(e.message));const ok=(c,m)=>{console.log((c?"ok   ":"FAIL ")+m);if(!c)fails.push(m)};
 // expose internals for the test only
 const src=fs.readFileSync(path.join(root,"game.js"),"utf8").replace("window.CMGame=Object.freeze({","window.CMGame=Object.freeze({dbg:function(){return {S:S,enter:enter,room:room,talk:talk,makeCode:makeCode,verify:verify,tryDoor:tryDoor,answer:answer,take:take,bfs:bfs}},");
 await p.route("**/game.js*",r=>r.fulfill({contentType:"application/javascript",body:src}));
 await p.addInitScript(()=>{sessionStorage.setItem("cm-boot","1")});
 await p.goto(base+"maze");await p.waitForTimeout(900);
 ok(await p.evaluate(()=>document.querySelectorAll(".gchar").length===2&&document.querySelectorAll(".gcast canvas").length===3&&!!document.querySelector(".gsel svg.mascot")),"select screen has Matt, Tony, Connie, Auntie and Zack");
 ok(await p.evaluate(()=>[...document.querySelectorAll("canvas[data-p]")].every(c=>{const d=c.getContext("2d").getImageData(0,0,60,90).data;let n=0;for(let i=0;i<d.length;i+=4)if(d[i]||d[i+1]||d[i+2]>0xaa)n++;return n>200})),"every character sprite is drawn");
 await p.click('[data-w="matt"]');await p.waitForTimeout(400);
 const kinds=await p.evaluate(()=>{const S=CMGame.dbg().S;return Object.values(S.npcs).sort().join(",")});
 ok(kinds==="aunt,aunt,connie,connie,tony,tony,zack","house has two Auntie, two Connie, Zack and Tony ("+kinds+")");
 for(const who of ["connie","zack","tony","aunt"]){
  await p.evaluate(w=>{const d=CMGame.dbg(),S=d.S;const e=Object.entries(S.npcs).find(x=>x[1]===w);d.enter(+e[0]);S.mem=500},who);await p.waitForTimeout(150);
  await p.keyboard.press("t");await p.waitForTimeout(100);
  const m=await p.evaluate(()=>CMGame.dbg().S.log.slice(-4).join(" ")),mem=await p.evaluate(()=>CMGame.dbg().S.mem);
  ok(new RegExp({connie:"Connie",zack:"Zack",tony:"Tony",aunt:"Auntie"}[who]).test(m),who+" talks");
  if(who==="connie")ok(mem>=508&&mem<=516&&/\+16K/.test(m),"Connie restores 16K of memory");
 }
 // play a whole game perfectly, then the run code must verify
 for(const who of ["matt","tony"]){
  await p.goto(base+"about");await p.waitForTimeout(200);await p.goto(base+"maze");await p.waitForTimeout(600);await p.click('[data-w="'+who+'"]');await p.waitForTimeout(300);
  const res=await p.evaluate(()=>{localStorage.removeItem("cm-maze-code");const d=CMGame.dbg(),S=d.S;let n=0;
   while(S.mode!=="over"&&n++<3000){
    if(S.mode==="q"){d.answer(S.q.c);continue}
    if(d.room().i===S.goal){d.take();continue}
    const st=d.bfs(d.room().i,S.goal);d.tryDoor(st[0].k)}
   const code=localStorage.getItem("cm-maze-code");return {win:!!S.win,mem:S.mem,code,v:code?d.verify(code):null,n}});
  ok(res.win&&res.code&&res.v&&res.v.ok&&res.v.who===who,who+" can win and the run code replays ("+(res.v&&(res.v.ok?res.v.mem+"K":res.v.why))+")");
 }
 ok(errs.length===0,"no script errors"+(errs.length?": "+errs.join("|"):""));
 await b.close();srv.close();if(fails.length){console.error("FAILED "+fails.length);process.exit(1)}console.log("OK maze")})();
