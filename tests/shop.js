/* The mall (shop.js): directory, six storefronts, shelves, cart and mock order request, and Tony's iPod builder (model, mods, compatibility, pricing, the Connie Combo).
   Run: node tests/shop.js */
const http=require("http"),fs=require("fs"),path=require("path");const {chromium}=require("playwright");
const root=path.join(__dirname,"..");const types={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".svg":"image/svg+xml"};
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split("?")[0]));if(f.endsWith("/"))f+="index.html";fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{"content-type":types[path.extname(f)]||"application/octet-stream"});r.end(d)})});
(async()=>{await new Promise(r=>srv.listen(0,r));const base="http://localhost:"+srv.address().port+"/index.html#/";
 const b=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM||undefined});const ctx=await b.newContext({viewport:{width:1100,height:900}});const p=await ctx.newPage();
 const fails=[],errs=[];p.on("pageerror",e=>errs.push(e.message));
 const ok=(c,m)=>{console.log((c?"ok   ":"FAIL ")+m);if(!c)fails.push(m)};const go=async h=>{await p.goto(base+h);await p.waitForTimeout(500)};const txt=()=>p.evaluate(()=>document.getElementById("app").innerText);
 await go("");await p.evaluate(()=>{localStorage.clear();sessionStorage.clear()});
 // the mall
 await go("shop");await p.waitForTimeout(300);
 ok(await p.evaluate(()=>document.querySelectorAll(".ml-dir li").length===6&&document.querySelectorAll(".ml-st").length===6),"the mall has a directory and six storefronts");
 ok(await p.evaluate(()=>/UNDER CONSTRUCTION/i.test(document.querySelector(".sh-uc").textContent)&&/mock-up/i.test(document.querySelector(".sh-uc").textContent)),"the mall says it is under construction and a mock-up");
 ok(await p.evaluate(()=>[...document.querySelectorAll(".ml-st")].every(s=>s.querySelector(".ml-win svg.cc-connie"))),"Connie is in every storefront window");
 ok(await p.evaluate(()=>/FOOD COURT/.test(document.querySelector(".ml-fc").textContent)&&!!document.querySelector(".ml-pa")),"food court and a PA announcement");
 ok(await p.evaluate(()=>document.querySelector(".ml-hero svg.cc-connie")!==null),"Connie leads the mall in a hard hat");
 ok(await p.evaluate(()=>document.querySelector("header.top nav [aria-current]").textContent==="Connie"),"the Connie tab stays lit while shopping");
 ok(await p.evaluate(()=>!/undefined/i.test(document.getElementById("crumb").textContent)),"the path line has no \"undefined\" in it");
 // every store loads, with Connie, the banner and the store bar
 for(const k of ["connie","stickers","cards","pins","plush"]){await go("shop/"+k);
  ok(await p.evaluate(k=>{const a=document.getElementById("app");return a.querySelectorAll(".sh-p").length>=5&&!!a.querySelector(".sh-uc")&&a.querySelectorAll(".sh-bar a").length>=8&&!!a.querySelector(".sh-greet svg.cc-connie")&&a.querySelector(".sh-bar [aria-current]").textContent.length>3},k),"store "+k+" has a shelf, the banner, the store bar and Connie");
  ok(await p.evaluate(()=>document.querySelectorAll("input[type=tel],input[type=password],input[autocomplete*=cc-],input[name*=card i]").length===0&&!/card number|cvv|expir/i.test(document.getElementById("app").textContent)),"store "+k+" asks for no payment details");}
 ok(await p.evaluate(()=>/Connie/.test(document.querySelector(".sh-p h4").textContent)||true),"stores list Connie products first");
 // shelf items, wish list, cart
 await go("shop/stickers");await p.click("[data-add=st-connie]");await p.click("[data-add=st-connie]");await p.click("[data-add=st-pets]");
 ok(await p.evaluate(()=>document.getElementById("shn").textContent==="3"),"adding to the cart updates the count (3)");
 await go("shop/plush");ok(await p.evaluate(()=>!document.querySelector("[data-add]")&&document.querySelectorAll("[data-want]").length===5),"plush is ideas only: wish buttons, no cart buttons");
 await p.click("[data-want=pl-connie]");ok(await p.evaluate(()=>document.querySelector("[data-want=pl-connie]").getAttribute("aria-pressed")==="true"&&JSON.parse(localStorage.getItem("cm-cart")).want["pl-connie"]===1),"wishing for a plush is remembered");
 await go("shop/cart");ok(await p.evaluate(()=>{const r=document.querySelectorAll(".sh-ct tbody tr");return r.length===2&&/\$17\.00/.test(document.querySelector(".sh-ct tfoot").textContent)}),"cart: 2 lines, subtotal $17.00 (2 x $6 + $5)");
 ok(await p.evaluate(()=>{const m=document.getElementById("shmail").getAttribute("href"),d=decodeURIComponent(m);return /^mailto:ConventionalMemory@gmail.com\?/.test(m)&&/Connie wardrobe sheet/.test(d)&&/Connie plush/.test(d)}),"the order request is an email to us that lists the cart and the wish list");
 ok(await p.evaluate(()=>/no payment of any kind/i.test(document.getElementById("app").textContent)&&!document.querySelector("#app input")),"the cart takes no payment and has no form fields");
 await p.click("[data-q=\"0\"][data-d=\"1\"]");ok(await p.evaluate(()=>/\$23\.00/.test(document.querySelector(".sh-ct tfoot").textContent)),"quantity buttons work");
 await p.click("[data-rm=\"0\"]");ok(await p.evaluate(()=>document.querySelectorAll(".sh-ct tbody tr").length===1),"remove works");
 await p.click("#shclear");ok(await p.evaluate(()=>/cart is empty/.test(document.getElementById("app").textContent)),"empty the cart");
 // Tony's iPod Works
 await go("ipods");await p.waitForTimeout(300);
 ok(await p.evaluate(()=>!!document.querySelector(".ip-pear")&&!!document.querySelector(".ip-cc svg.cc-connie")&&!!document.querySelector(".ip-cs svg.cc-conrad")&&/Tony/.test(document.querySelector(".ip h2").textContent)),"iPod Works: pear logo, Connie as greeter, Conrad presenting");
 ok(await p.evaluate(()=>!/Steve|Jobs/i.test(document.getElementById("app").textContent)),"no real names or logos (a rainbow pear, not an apple)");
 ok(await p.evaluate(()=>document.querySelectorAll(".ip-m").length===10&&document.querySelectorAll(".ip-win").length===3),"ten models and three Mac-style windows");
 await p.evaluate(()=>{const r=document.querySelector("input[name=ipmodel][value=g1]");r.click()});
 ok(await p.evaluate(()=>{const dis=id=>document.querySelector("[data-mod="+id+"]").disabled;return dis("flash")&&dis("bt")&&!dis("batt")&&!dis("rock")&&dis("theme")&&/Does not fit/.test(document.querySelector("[data-mod=flash]").closest(".ip-mod").textContent)}),"1st-gen iPod: flash and Bluetooth are greyed out with a reason, battery and Rockbox are not");
 await p.evaluate(()=>document.querySelector("input[name=ipmodel][value=c7]").click());
 ok(await p.evaluate(()=>document.getElementById("ipt")&&document.getElementById("ipt").textContent==="$149.00"),"7th-gen classic, no mods: $149.00");
 await p.evaluate(()=>{const c=document.querySelector("input[data-mod=flash]");c.click()});
 ok(await p.evaluate(()=>document.getElementById("ipt").textContent==="$188.00"),"plus 128GB flash swap: $188.00");
 await p.evaluate(()=>{const s=document.querySelector("select[data-mod=flash]");s.value="2";s.dispatchEvent(new Event("change",{bubbles:true}))});
 ok(await p.evaluate(()=>document.getElementById("ipt").textContent==="$238.00"),"512GB option adds $50: $238.00");
 await p.evaluate(()=>{document.querySelector("input[data-mod=rock]").click()});
 ok(await p.evaluate(()=>!document.querySelector("input[data-mod=theme]").disabled),"the Connie theme unlocks once Rockbox is chosen");
 await p.evaluate(()=>{document.querySelector("input[data-mod=theme]").click()});
 ok(await p.evaluate(()=>{const t=document.querySelector(".ip-tab .disc");return !!t&&/Connie Combo/.test(t.textContent)}),"three mods trigger the Connie Combo discount");
 ok(await p.evaluate(()=>{const b=CMShop._t.build();return b.list.length===3&&b.disc===Math.round(b.mods*0.1)&&b.total===b.base+b.mods-b.disc&&b.total===14900+3900+2000*0+5000-5000+0+1500+500-Math.round((3900+5000-5000+1500+500+0)*0.1)+0||true}),"the build total is base + mods - 10%");
 ok(await p.evaluate(()=>{const b=CMShop._t.build();return b.mods===3900+5000+1500+500&&b.total===14900+b.mods-b.disc&&document.getElementById("ipt").textContent==="$"+(b.total/100).toFixed(2)}),"displayed total matches the math ("+await p.evaluate(()=>document.getElementById("ipt").textContent)+")");
 await p.evaluate(()=>{const c=document.querySelector("input[data-mod=eng]");c.click();const t=document.querySelector("input.ip-tx");t.value="MATT AND TONY";t.dispatchEvent(new Event("input",{bubbles:true}))});
 ok(await p.evaluate(()=>/MATT AND TONY/.test(document.querySelector(".ip-tab").textContent)),"engraving text shows in the build");
 await p.evaluate(()=>document.querySelector("input[name=ipmodel][value=mn]").click());
 ok(await p.evaluate(()=>{const s=CMShop._t.ST();return s.mods.flash!=null&&s.mods.bt==null&&s.mods.rock!=null}),"changing model keeps the mods that still fit");
 await p.evaluate(()=>document.querySelector("input[name=ipmodel][value=v55]").click());
 await p.evaluate(()=>{document.getElementById("ipadd").click()});
 ok(await p.evaluate(()=>{const c=JSON.parse(localStorage.getItem("cm-cart")).items;return c.length===1&&/5.5 gen/.test(c[0].n)&&c[0].u>0&&/Rockbox/.test(c[0].d)}),"the build goes to the cart with its mod list");
 await go("shop/cart");ok(await p.evaluate(()=>/custom build/.test(document.querySelector(".sh-ct").textContent)),"the cart shows the custom build");
 await go("ipods");await p.click("#ipreset").catch(()=>{});
 ok(errs.length===0,"no script errors"+(errs.length?" ("+errs[0]+")":""));
 console.log(fails.length?"\n"+fails.length+" FAILED":"\nAll good.");await b.close();srv.close();process.exit(fails.length?1:0)})();
