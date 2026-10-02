/* Builds og.png (1200 x 630), the picture shown when a page is shared or appears in search results with an image.
   Run: node tools/build-og.js   (uses playwright, the same as the sticker sheets) */
const fs=require("fs"),path=require("path"),vm=require("vm");const {chromium}=require("playwright");const root=path.join(__dirname,"..");
const cs={window:{},localStorage:{getItem(){return null},setItem(){}},document:{},console};vm.createContext(cs);
vm.runInContext(fs.readFileSync(path.join(root,"cast.js"),"utf8")+";this.CMCast=window.CMCast||CMCast",cs);
const C=cs.CMCast,svg=(id,w,o)=>C.svg(id,w,Object.assign({tall:1,mood:"happy"},o||{}));
const html='<!doctype html><meta charset="utf-8"><style>@font-face{font-family:M;src:local("DejaVu Sans Mono")}body{margin:0;width:1200px;height:630px;background:#000080;color:#fff;font-family:"DejaVu Sans Mono","Courier New",monospace;position:relative;overflow:hidden}'
 +'.scan{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,.18) 0 2px,transparent 2px 5px)}'
 +'.t{position:absolute;left:60px;top:96px;width:640px}.k{font-size:30px;color:#55ffff;letter-spacing:.06em}h1{font-size:74px;line-height:1.02;margin:.15em 0 .25em}.s{font-size:31px;line-height:1.3;color:#e8e8ff}.u{position:absolute;left:60px;bottom:44px;font-size:30px;color:#ffff55}'
 +'.f{position:absolute;bottom:0;background:#0a0a55;left:0;right:0;height:96px}svg{position:absolute;image-rendering:pixelated}</style><body><div class="f"></div>'
 +'<div class="t"><div class="k">C:\\&gt;DIR /MUSEUM</div><h1>Conventional Memory</h1><div class="s">Vintage computers, 3,000 milestones of computer and game history, and retro games.</div></div><div class="u">ConventionalMemory.io_</div>'
 +'<div style="position:absolute;left:740px;top:80px">'+svg("connie",330)+'</div><div style="position:absolute;left:1010px;top:300px">'+svg("emma",150)+'</div><div style="position:absolute;left:690px;top:380px">'+svg("hiram",130)+'</div><div style="position:absolute;left:1040px;top:130px">'+svg("mat",110,{tall:0})+'</div><div class="scan"></div></body>';
(async()=>{const b=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM||undefined});const p=await b.newPage({viewport:{width:1200,height:630}});await p.setContent(html);await p.waitForTimeout(300);await p.screenshot({path:path.join(root,"og.png")});await b.close();console.log("wrote og.png")})();
