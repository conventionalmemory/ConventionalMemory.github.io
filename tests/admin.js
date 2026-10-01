/* Admin test with GitHub mocked: item link form, separate timeline editor, save writes only what changed.
   Run: node tests/admin.js */
const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),http=require('http');
const root=path.join(__dirname,'..');
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'Content-Type':f.endsWith('.js')?'text/javascript':f.endsWith('.html')?'text/html':'text/plain'});r.end(d)})});
(async()=>{await new Promise(r=>srv.listen(0,r));const BASE='http://localhost:'+srv.address().port;const b=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM||undefined});const pg=await (await b.newContext({viewport:{width:1100,height:1000}})).newPage();
const errs=[],puts=[];pg.on('pageerror',e=>errs.push('PAGEERR '+e.message));
let items=fs.readFileSync(path.join(root,'items.js'),'utf8');
await pg.route('https://api.github.com/**',r=>{const u=r.request().url(),h=r.request().headers(),m=r.request().method();
 if(m==='PUT'){const pd=JSON.parse(r.request().postData());puts.push({f:u.split('/contents/')[1],msg:pd.message,body:Buffer.from(pd.content,'base64').toString()});return r.fulfill({status:200,json:{content:{sha:'new'}}})}
 const raw=/raw/.test(h.accept||'');
 if(/contents\/items\.js/.test(u))return raw?r.fulfill({body:items,contentType:'text/plain'}):r.fulfill({json:{sha:'abc'}});
 if(/contents\/timeline-edits\.js/.test(u))return r.fulfill({status:404,json:{message:'Not Found'}});
 return r.fulfill({json:{permissions:{push:true}}})});
await pg.goto(BASE+'/index.html#/admin');await pg.waitForTimeout(300);await pg.keyboard.press('Enter');await pg.waitForTimeout(800);
await pg.fill('#tk','github_pat_'+'A'.repeat(40));await pg.click('#go');await pg.waitForTimeout(1500);
const txt=()=>pg.evaluate(()=>document.querySelector('.adm').innerText.replace(/\n+/g,' | ').slice(0,500));
console.log('flag',await pg.evaluate(()=>localStorage.getItem('cm-admin')));
// edit the Sound Blaster 16 item
await pg.fill('#aq','Sound Blaster 16');await pg.waitForTimeout(300);await pg.click('[data-e]');await pg.waitForTimeout(500);
console.log('has tl fieldset',await pg.evaluate(()=>!!document.querySelector('#f_tl')),'no t_d',await pg.evaluate(()=>!document.querySelector('#t_d')));
await pg.click('#tlsug');await pg.waitForTimeout(300);await pg.click('[data-tlp]');await pg.waitForTimeout(300);
console.log('linked',await pg.inputValue('#f_tl'));
await pg.click('#ok');await pg.waitForTimeout(300);await pg.click('#sv');await pg.waitForTimeout(300);await pg.click('#rvok');await pg.waitForTimeout(1200);
console.log('puts1',puts.map(p=>p.f));
await pg.click('#gtle');await pg.waitForTimeout(400);console.log(await txt());
await pg.fill('#tq','Apple I');await pg.waitForTimeout(300);await pg.click('[data-te]');await pg.waitForTimeout(400);
console.log('form',await pg.evaluate(()=>[...document.querySelectorAll('.adm input,.adm textarea')].map(e=>e.id).join(',')));
await pg.fill('#t_n','Edited note from tle test.');await pg.click('#tok');await pg.waitForTimeout(300);
await pg.click('#sv');await pg.waitForTimeout(300);await pg.click('#rvok');await pg.waitForTimeout(1200);
console.log('puts2',puts.map(p=>p.f));const tp=puts.find(p=>/timeline-edits/.test(p.f));console.log(tp?tp.body.slice(0,300):'NO TLE PUT');
// standalone tle view
await pg.goto(BASE+'/index.html#/admin/tle/'+encodeURIComponent('Apple I'));await pg.waitForTimeout(800);console.log('hash view',await txt());
console.log(errs.join('\n')||'no errors');await b.close();srv.close();process.exit(errs.length||!puts.some(p=>/timeline-edits/.test(p.f))?1:0)})();
