/* Lab, part 2: #/rigs (Dream rig) and #/walk/<year> (guided walk through a year). Loaded by lab.js. */
(function(){
"use strict";
var app;
function $(s,r){return(r||app).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||app).querySelectorAll(s))}
function E(s){return esc(String(s==null?"":s))}
function ld(k,d){try{var v=JSON.parse(localStorage.getItem(k)||"null");return v&&typeof v==="object"?v:d}catch(e){return d}}
function sv(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function back(){return'<p class="noprint"><a class="btn" href="#/more">Site map</a> <a class="btn" href="#/">Home</a></p>'}
function tlHref(r){return"#/timeline/"+String(r[0]).slice(0,4)+"/"+encodeURIComponent(r[2])}

/* ================================================================== Dream rig */
// Typical hardware of the era. Resources are the common factory defaults; real cards varied by revision and jumpers.
var BOARDS=[
 {id:"b386",n:"386 AT clone",y:"1988-92",cls:3,isa:6,pci:0,agp:0,vlb:0,mhz:[25,33,40],ram:[1,2,4,8,16],cpu:"386DX"},
 {id:"b486",n:"486 VLB and ISA",y:"1992-95",cls:4,isa:5,pci:0,agp:0,vlb:2,mhz:[33,66,100,133],ram:[4,8,16,32,64],cpu:"486DX"},
 {id:"b586",n:"Pentium, Socket 7 (PCI and ISA)",y:"1995-98",cls:5,isa:3,pci:4,agp:0,vlb:0,mhz:[75,100,133,166,200,233],ram:[8,16,32,64,128],cpu:"Pentium"},
 {id:"b686",n:"Pentium II/III, Slot 1 (AGP, PCI, one ISA)",y:"1997-2000",cls:6,isa:1,pci:5,agp:1,vlb:0,mhz:[233,300,350,450,550,733],ram:[32,64,128,256,512],cpu:"Pentium II/III"},
 {id:"b7",n:"Socket A (AGP and PCI, no ISA)",y:"2000-02",cls:7,isa:0,pci:5,agp:1,vlb:0,mhz:[700,900,1200],ram:[128,256,512],cpu:"Athlon"}];
var OSES=[
 {id:"dos",n:"MS-DOS 6.22",cls:2,ram:0.5,rec:1},{id:"w31",n:"Windows 3.11",cls:3,ram:4,rec:8},{id:"w95",n:"Windows 95",cls:4,ram:8,rec:16,mhz:50},{id:"w98",n:"Windows 98 SE",cls:4,ram:16,rec:32,mhz:66},{id:"wme",n:"Windows Me",cls:5,ram:32,rec:64,mhz:150}];
// bus: ISA, VLB, PCI, AGP. irq/dma/io = defaults; irqs = alternatives you can jumper. pci cards are steered by the BIOS and never clash.
var DEVS=[
 {id:"v-isa",k:"video",n:"Trident ISA VGA, 1 MB",bus:"ISA",vram:1,io:"3C0",y:[1989,1995]},
 {id:"v-vlb",k:"video",n:"S3 805 VLB, 1 MB",bus:"VLB",vram:1,io:"3C0",y:[1992,1996]},
 {id:"v-trio",k:"video",n:"S3 Trio64 PCI, 2 MB",bus:"PCI",vram:2,y:[1995,1999]},
 {id:"v-mill",k:"video",n:"Matrox Millennium PCI, 4 MB",bus:"PCI",vram:4,y:[1995,1999]},
 {id:"v-rage",k:"video",n:"ATI Rage Pro AGP, 8 MB",bus:"AGP",vram:8,y:[1997,2001]},
 {id:"v-tnt",k:"video",n:"Riva TNT2 AGP, 32 MB",bus:"AGP",vram:32,y:[1999,2002]},
 {id:"v-gf",k:"video",n:"GeForce 256 AGP, 32 MB",bus:"AGP",vram:32,y:[1999,2002]},
 {id:"v-trioP",k:"video",n:"S3 Trio64 PCI, 2 MB",bus:"PCI",vram:2,y:[1995,1999],hide:1},
 {id:"s-adl",k:"sound",n:"AdLib",bus:"ISA",io:"388",y:[1987,1993],mu:/adlib/i},
 {id:"s-pro",k:"sound",n:"Sound Blaster Pro",bus:"ISA",io:"220",irq:7,irqs:[2,5,7,10],dma:1,y:[1991,1996],mu:/sound blaster pro/i},
 {id:"s-16",k:"sound",n:"Sound Blaster 16",bus:"ISA",io:"220",irq:5,irqs:[2,5,7,10],dma:1,hdma:5,mpu:"330",y:[1992,1998],mu:/sound blaster 16/i},
 {id:"s-awe",k:"sound",n:"Sound Blaster AWE32",bus:"ISA",io:"220",irq:5,irqs:[2,5,7,10],dma:1,hdma:5,mpu:"330",y:[1994,1998],mu:/awe32/i},
 {id:"s-gus",k:"sound",n:"Gravis UltraSound",bus:"ISA",io:"220",irq:11,irqs:[3,5,7,11,12,15],dma:1,y:[1992,1997],mu:/ultrasound|gravis/i},
 {id:"s-pci",k:"sound",n:"Ensoniq AudioPCI",bus:"PCI",y:[1997,2002]},
 {id:"m-mpu",k:"extra",n:"MPU-401 MIDI interface (for an MT-32 or SC-55)",bus:"ISA",io:"330",irq:9,irqs:[2,9,10],y:[1987,1999],mu:/mpu|mt-32|sc-55|sound canvas|midi/i},
 {id:"m-mod",k:"extra",n:"Internal 33.6k modem (COM2)",bus:"ISA",io:"2F8",irq:3,irqs:[3,4,5,9,10],y:[1993,1999],mu:/modem/i},
 {id:"m-wmod",k:"extra",n:"PCI soft modem",bus:"PCI",y:[1998,2002]},
 {id:"n-ne",k:"extra",n:"NE2000 Ethernet (ISA)",bus:"ISA",io:"300",irq:10,irqs:[3,5,9,10,11,15],y:[1990,1998]},
 {id:"n-pci",k:"extra",n:"3Com PCI Ethernet",bus:"PCI",y:[1996,2002]},
 {id:"c-scsi",k:"extra",n:"Adaptec 1542 SCSI (ISA)",bus:"ISA",io:"330",irq:11,irqs:[9,10,11,12,14,15],dma:5,y:[1990,1998],mu:/scsi/i},
 {id:"c-pscsi",k:"extra",n:"Adaptec 2940 SCSI (PCI)",bus:"PCI",y:[1994,2002]},
 {id:"j-game",k:"extra",n:"Game port card",bus:"ISA",io:"201",y:[1985,1999],mu:/joystick|game port|flightstick/i},
 {id:"i-mouse",k:"extra",n:"Serial mouse (COM1)",bus:"onboard",io:"3F8",irq:4,y:[1985,2002],mu:/mouse/i},
 {id:"i-zip",k:"extra",n:"Parallel Zip drive (LPT1)",bus:"onboard",io:"378",irq:7,irqs:[5,7],y:[1995,2002],mu:/zip/i}];
var FIXED=[[0,"System timer"],[1,"Keyboard"],[2,"Cascade to IRQ 9-15"],[6,"Floppy controller (DMA 2)"],[8,"Real-time clock"],[13,"Math coprocessor"],[14,"Primary IDE"],[15,"Secondary IDE"]];
var RS={board:"b586",ci:3,ri:2,os:"w95",video:"v-trio",devs:["s-16"],irq:{},saved:ld("cm-rigs",{l:[]}).l||[]};
function board(){return BOARDS.filter(function(b){return b.id===RS.board})[0]}
function dev(id){return DEVS.filter(function(d){return d.id===id})[0]}
function osOf(){return OSES.filter(function(o){return o.id===RS.os})[0]}
function myIrq(d){return RS.irq[d.id]!=null&&d.irqs&&d.irqs.indexOf(RS.irq[d.id])>=0?RS.irq[d.id]:d.irq}
function parts(){var all=[dev(RS.video)].concat(RS.devs.map(dev)).filter(Boolean);return all}
function check(){var b=board(),P=parts(),irq={},io={},dma={},errs=[],warn=[],used={ISA:0,PCI:0,AGP:0,VLB:0};
 function add(map,key,d,why){if(key==null)return;(map[key]=map[key]||[]).push({d:d,w:why||""})}
 FIXED.forEach(function(f){add(irq,f[0],{n:f[1],fixed:1})});
 // COM1 and LPT1 are on the board; the mouse and Zip take them by name instead.
 var hasMouse=RS.devs.indexOf("i-mouse")>=0,hasZip=RS.devs.indexOf("i-zip")>=0,hasModem=RS.devs.indexOf("m-mod")>=0;
 if(!hasMouse)add(irq,4,{n:"COM1 (free for a mouse)",fixed:1,soft:1});
 if(!hasModem)add(irq,3,{n:"COM2 (free)",fixed:1,soft:1});
 if(!hasZip)add(irq,7,{n:"LPT1 printer port",fixed:1,soft:1});
 P.forEach(function(d){if(used[d.bus]!=null)used[d.bus]++;
  var q=myIrq(d);if(d.bus!=="PCI"&&d.bus!=="AGP"&&q!=null)add(irq,q,d);
  if(d.io)add(io,d.io,d);if(d.mpu)add(io,d.mpu,{n:d.n+" (MPU-401 port)",id:d.id,k:d.k});
  if(d.dma!=null)add(dma,d.dma,d);if(d.hdma!=null)add(dma,d.hdma,{n:d.n+" (16-bit DMA)",id:d.id,k:d.k})});
 function clash(map,label,fmt){Object.keys(map).forEach(function(k){var l=map[k].filter(function(x){return!x.d.soft});if(l.length>1)errs.push(label+" "+fmt(k)+" is claimed by "+l.map(function(x){return x.d.n}).join(" and "))})}
 clash(irq,"IRQ",function(k){return k});clash(io,"I/O port",function(k){return k+"h"});clash(dma,"DMA",function(k){return k});
 var fixedIrq=P.filter(function(d){return d.id==="s-16"||d.id==="s-awe"});
 if(used.ISA>b.isa)errs.push("This board has "+b.isa+" ISA slot"+(b.isa===1?"":"s")+" and you used "+used.ISA+".");
 if(used.PCI>b.pci)errs.push("This board has "+b.pci+" PCI slot"+(b.pci===1?"":"s")+" and you used "+used.PCI+".");
 if(used.AGP>b.agp)errs.push(b.agp?"Only one AGP slot.":"This board has no AGP slot.");
 if(used.VLB>b.vlb)errs.push(b.vlb?"This board has "+b.vlb+" VL-Bus slots.":"This board has no VL-Bus slot.");
 var cpu=cpuOpt(),ram=ramOpt(),os=osOf();
 if(cpu.cls<os.cls||(os.mhz&&cpu.mhz<os.mhz))errs.push(os.n+" needs at least a "+(GXCLS[os.cls]||"")+(os.mhz?" at "+os.mhz+" MHz":"")+".");
 if(ram<os.ram)errs.push(os.n+" needs at least "+gxRam(os.ram)+" of RAM.");else if(ram<os.rec)warn.push(os.n+" runs better with "+gxRam(os.rec)+" of RAM.");
 var vd=dev(RS.video);if(vd&&vd.bus==="AGP"&&os.id==="w95")warn.push("Windows 95 has no real AGP support in its first releases. Windows 98 handles it better.");
 if(vd&&vd.bus==="PCI"&&!b.pci)errs.push("This board has no PCI slots for that video card.");
 if(P.some(function(d){return d.id==="s-gus"})&&P.some(function(d){return d.id==="s-16"||d.id==="s-awe"}))warn.push("The Gravis UltraSound and Sound Blaster together need careful jumpering and drivers; many games only expect one.");
 return{irq:irq,io:io,dma:dma,errs:errs,warn:warn,used:used,rig:{n:b.cpu+" "+cpu.mhz,cls:cpu.cls,mhz:cpu.mhz,ram:ram,vram:vd?vd.vram:1}}}
function cpuOpt(){var b=board(),mh=b.mhz[Math.min(RS.ci,b.mhz.length-1)];var cls=b.cls;if(b.id==="b686")cls=mh>=450?7:6;if(b.id==="b586")cls=5;return{cls:cls,mhz:mh,l:b.cpu+" "+mh+" MHz"}}
function ramOpt(){var b=board();return b.ram[Math.min(RS.ri,b.ram.length-1)]}
function availDevs(k){var b=board(),y0=+b.y.slice(0,4),y1=+(b.y.slice(5).length===2?b.y.slice(0,2)+b.y.slice(5):b.y.slice(5));return DEVS.filter(function(d){if(d.hide||d.k!==k)return false;if(d.bus==="PCI"&&!b.pci)return false;if(d.bus==="AGP"&&!b.agp)return false;if(d.bus==="VLB"&&!b.vlb)return false;if(d.bus==="ISA"&&!b.isa)return false;return d.y[0]<=y1&&d.y[1]>=y0})}
function museumFor(d){if(!d.mu)return null;return ALLITEMS.filter(function(it){return d.mu.test(it.name)})[0]||null}
function autoResolve(){var guard=0;while(guard++<30){var c=check();if(!c.errs.some(function(e){return/^IRQ/.test(e)}))break;var fixed=false;var P=parts();for(var i=0;i<P.length&&!fixed;i++){var d=P[i];if(!d.irqs||d.bus==="PCI")continue;var q=myIrq(d),map=c.irq[q]||[];if(map.filter(function(x){return!x.d.soft}).length<2)continue;
   for(var j=0;j<d.irqs.length;j++){var t=d.irqs[j];if(!(c.irq[t]||[]).some(function(x){return!x.d.soft})){RS.irq[d.id]=t;fixed=true;break}}}
  if(!fixed)break}}
function rigGames(R){var out={run:0,ok:0,no:0,list:[]};Object.keys(GX).forEach(function(t){var x=GX[t];if(!x.n||(x.n.cls==null&&x.n.mhz==null&&x.n.ramMB==null))return;var a=gxMeets(R,x.n);if(a.ok===null)return;if(a.ok){var b=x.m?gxMeets(R,x.m):null;if(b&&b.ok)out.run++;else out.ok++;out.list.push([t,b&&b.ok?2:1,x])}else out.no++});return out}
function loadMuseum(k){var mus=ITEMS.map(gxParseItemRig).filter(Boolean),r=mus[+k];if(!r)return;var id=r.cls<=3?"b386":r.cls===4?"b486":r.cls===5?"b586":(r.cls===6||r.year<2000)?"b686":"b7";RS.board=id;var b=board();var ci=0;b.mhz.forEach(function(m,i){if(m<=r.mhz)ci=i});RS.ci=ci;var ri=0;b.ram.forEach(function(m,i){if(m<=r.ram)ri=i});RS.ri=ri;RS.os=r.cls<=3?"w31":r.cls===4?"w95":"w98";fixVideo()}
function fixVideo(){var av=availDevs("video");if(!av.some(function(d){return d.id===RS.video}))RS.video=(av[Math.min(2,av.length-1)]||av[0]||{}).id;RS.devs=RS.devs.filter(function(id){var d=dev(id);return d&&availDevs(d.k).some(function(x){return x.id===id})});RS.ci=Math.min(RS.ci,board().mhz.length-1);RS.ri=Math.min(RS.ri,board().ram.length-1)}
function summary(){var c=check(),b=board(),cpu=cpuOpt(),P=parts();return b.n+": "+cpu.l+", "+gxRam(ramOpt())+" RAM, "+osOf().n+". Parts: "+P.map(function(d){return d.n}).join("; ")+". "+(c.errs.length?"Problems: "+c.errs.join(" "):"Boots clean.")}
function cardPng(){var c=check(),b=board(),cpu=cpuOpt(),g=rigGames(c.rig),W=1200,H=630,cv=document.createElement("canvas");cv.width=W;cv.height=H;var x=cv.getContext("2d");
 x.fillStyle="#0000aa";x.fillRect(0,0,W,H);x.fillStyle="#c0c0c0";x.fillRect(24,24,W-48,H-48);x.fillStyle="#000080";x.fillRect(24,24,W-48,46);x.fillStyle="#fff";x.font="bold 28px 'Courier New',monospace";x.textBaseline="middle";x.fillText("C:\\RIGS\\DREAM.CFG",44,47);
 x.fillStyle="#000";x.textBaseline="alphabetic";x.font="bold 46px 'Courier New',monospace";x.fillText(b.cpu+" "+cpu.mhz+" MHz",50,140);x.font="30px 'Courier New',monospace";x.fillStyle="#222";
 var lines=[b.n,gxRam(ramOpt())+" RAM, "+osOf().n].concat(parts().map(function(d){return"+ "+d.n}));lines.slice(0,9).forEach(function(l,i){x.fillText(l.length>52?l.slice(0,50)+"...":l,50,190+i*40)});
 x.fillStyle=c.errs.length?"#aa0000":"#007700";x.font="bold 36px 'Courier New',monospace";x.fillText(c.errs.length?c.errs.length+" conflict"+(c.errs.length>1?"s":""):"Boots clean",720,170);x.fillStyle="#000";x.font="30px 'Courier New',monospace";x.fillText(g.run+g.ok+" games run",720,230);x.fillText("("+g.run+" well, "+g.ok+" minimum)",720,270);
 x.fillStyle="#000080";x.font="bold 30px 'Courier New',monospace";x.fillText("ConventionalMemory.io",50,570);return cv.toDataURL("image/png")}
function rigs(){
 fixVideo();
 function draw(){var b=board(),c=check(),cpu=cpuOpt(),mus=ITEMS.map(gxParseItemRig).filter(Boolean),g=rigGames(c.rig),os=osOf();
  function sel(id,label,opts,cur){return'<label>'+label+' <select id="'+id+'">'+opts.map(function(o){return'<option value="'+E(o[0])+'"'+(String(o[0])===String(cur)?" selected":"")+'>'+E(o[1])+'</option>'}).join("")+'</select></label>'}
  function devPick(k,title){var av=availDevs(k);return'<fieldset class="rg-f"><legend>'+title+'</legend>'+av.map(function(d){var on=k==="video"?RS.video===d.id:RS.devs.indexOf(d.id)>=0,m=museumFor(d);return'<label class="rg-o'+(on?" on":"")+'"><input type="'+(k==="video"?"radio":"checkbox")+'" name="'+k+'" data-d="'+d.id+'"'+(on?" checked":"")+'> <b>'+E(d.n)+'</b> <small>'+E(d.bus)+(d.irq!=null&&d.bus!=="PCI"?" &middot; IRQ "+myIrq(d):"")+'</small>'+(m?' <a class="rg-mu" href="#/item/'+E(m.id)+'" title="You have one in the museum">&#9733; museum</a>':"")+'</label>'}).join("")+'</fieldset>'}
  var jump=parts().filter(function(d){return d.irqs&&d.bus!=="PCI"&&d.bus!=="AGP"}).map(function(d){return'<label>'+E(d.n)+' IRQ <select data-j="'+d.id+'">'+d.irqs.map(function(q){return'<option'+(q===myIrq(d)?" selected":"")+'>'+q+'</option>'}).join("")+'</select></label>'}).join(" ");
  var irqRows=[];for(var q=0;q<16;q++){var l=c.irq[q]||[],real=l.filter(function(x){return!x.d.soft}),bad=real.length>1;irqRows.push('<tr class="'+(bad?"rg-bad":real.length?"rg-used":"")+'"><td>'+q+'</td><td>'+(l.length?l.map(function(x){return E(x.d.n)}).join(", "):'<span class="tn">free</span>')+(bad?' <b>CONFLICT</b>':"")+'</td></tr>')}
  var saved=RS.saved;
  app.innerHTML='<section class="rigs"><h2>Dream rig</h2><p>Wire up a period PC. Pick a board, CPU, RAM, an OS and the cards, then watch the resource map: two ISA cards on the same IRQ will fight, just like they did. Games on file are checked against the CPU, RAM and video memory you chose. Resource defaults are the common factory settings.</p>'
   +'<div class="rg-top">'+sel("rb","Board",BOARDS.map(function(x){return[x.id,x.n+" ("+x.y+")"]}),RS.board)+' '+sel("rcpu","CPU",b.mhz.map(function(m,i){return[i,b.cpu+" "+m+" MHz"]}),RS.ci)+' '+sel("rram","RAM",b.ram.map(function(m,i){return[i,gxRam(m)]}),RS.ri)+' '+sel("ros","OS",OSES.map(function(o){return[o.id,o.n]}),RS.os)
   +(mus.length?' <label>Start from a museum machine <select id="rmu"><option value="">...</option>'+mus.map(function(r,i){return'<option value="'+i+'">'+E(r.n)+'</option>'}).join("")+'</select></label>':"")+'</div>'
   +'<div class="rg-cols"><div>'+devPick("video","Video card")+devPick("sound","Sound card")+devPick("extra","Other cards and ports")+'</div><div>'
   +'<div class="rg-stat '+(c.errs.length?"bad":"good")+'" role="status"><b>'+(c.errs.length?c.errs.length+" problem"+(c.errs.length>1?"s":""):"Boots clean")+'</b>'+(c.errs.length?'<ul>'+c.errs.map(function(e){return'<li>'+E(e)+'</li>'}).join("")+'</ul>':'<p>No conflicts. '+g.run+' games run well and '+g.ok+' run at minimum on this '+E(b.cpu)+'.</p>')+(c.warn.length?'<ul class="rg-w">'+c.warn.map(function(e){return'<li>'+E(e)+'</li>'}).join("")+'</ul>':"")+'</div>'
   +'<p class="noprint"><button class="btn" id="rauto" type="button">Auto-resolve IRQs</button> <button class="btn" id="rrand" type="button">Random rig</button></p>'+(jump?'<p class="rg-j"><b>Jumpers:</b> '+jump+'</p>':"")
   +'<p class="tn">Slots used: ISA '+c.used.ISA+'/'+b.isa+(b.pci?', PCI '+c.used.PCI+'/'+b.pci:"")+(b.agp?', AGP '+c.used.AGP+'/'+b.agp:"")+(b.vlb?', VLB '+c.used.VLB+'/'+b.vlb:"")+'</p>'
   +'<h3 class="sub">IRQ map</h3><div class="mx-wrap"><table class="ctab rg-t"><thead><tr><th>IRQ</th><th>Used by</th></tr></thead><tbody>'+irqRows.join("")+'</tbody></table></div></div></div>'
   +'<h3 class="sub">What it can play</h3><p>'+(g.run+g.ok)+' of the games on file run on this rig: <b>'+g.run+'</b> well, <b>'+g.ok+'</b> at minimum, <b>'+g.no+'</b> not yet. <a href="#/runs">Open the full checker</a>.</p><p class="chips">'+g.list.filter(function(x){return x[1]===2}).sort(function(a,b){return(gxDebut(b[2])[1]||"")>(gxDebut(a[2])[1]||"")?1:-1}).slice(0,8).map(function(x){return'<a class="btn" href="#/timeline/'+String(gxDebut(x[2])[1]).slice(0,4)+'/'+encodeURIComponent(x[0])+'">'+E(x[0])+'</a>'}).join(" ")+'</p>'
   +'<h3 class="sub noprint">Save and share</h3><p class="noprint"><input id="rn" placeholder="Name this build" size="22"> <button class="btn" id="rsv" type="button">Save</button> <button class="btn" id="rcp" type="button">Copy as text</button> <button class="btn" id="rpng" type="button">Download card (PNG)</button> <span class="tn" id="rm" role="status"></span></p>'
   +(saved.length?'<ul class="rg-sv noprint">'+saved.map(function(s,i){return'<li><button class="btn" data-ld="'+i+'" type="button">Load</button> '+E(s.n)+' <button class="btn" data-dl="'+i+'" type="button" aria-label="Delete '+E(s.n)+'">&times;</button></li>'}).join("")+'</ul>':"")+back()+'</section>';wire()}
 function wire(){
  $("#rb").onchange=function(){RS.board=this.value;RS.ci=1;RS.ri=1;fixVideo();draw()};$("#rcpu").onchange=function(){RS.ci=+this.value;draw()};$("#rram").onchange=function(){RS.ri=+this.value;draw()};$("#ros").onchange=function(){RS.os=this.value;draw()};
  var mu=$("#rmu");if(mu)mu.onchange=function(){if(this.value!=="")loadMuseum(this.value);draw()};
  $$("input[data-d]").forEach(function(i){i.onchange=function(){var id=i.dataset.d,d=dev(id);if(d.k==="video")RS.video=id;else{var x=RS.devs.indexOf(id);if(i.checked&&x<0)RS.devs.push(id);else if(!i.checked&&x>=0)RS.devs.splice(x,1)}draw()}});
  $$("select[data-j]").forEach(function(s){s.onchange=function(){RS.irq[s.dataset.j]=+s.value;draw()}});
  $("#rauto").onclick=function(){autoResolve();draw()};
  $("#rrand").onclick=function(){var b=BOARDS[Math.floor(Math.random()*BOARDS.length)];RS.board=b.id;RS.ci=Math.floor(Math.random()*b.mhz.length);RS.ri=Math.floor(Math.random()*b.ram.length);RS.os=OSES[Math.min(OSES.length-1,Math.max(0,b.cls-2+Math.floor(Math.random()*2)))].id;RS.irq={};RS.devs=[];fixVideo();RS.video=availDevs("video")[Math.floor(Math.random()*availDevs("video").length)].id;[["sound",1],["extra",2]].forEach(function(p){var av=availDevs(p[0]);for(var i=0;i<p[1]&&av.length;i++){var d=av[Math.floor(Math.random()*av.length)];if(RS.devs.indexOf(d.id)<0)RS.devs.push(d.id)}});draw()};
  $("#rsv").onclick=function(){var n=$("#rn").value.trim()||"Build "+(RS.saved.length+1);if(RS.saved.length>=8)RS.saved.shift();RS.saved.push({n:n,s:JSON.parse(JSON.stringify({board:RS.board,ci:RS.ci,ri:RS.ri,os:RS.os,video:RS.video,devs:RS.devs,irq:RS.irq}))});sv("cm-rigs",{l:RS.saved});draw()};
  $$("[data-ld]").forEach(function(b){b.onclick=function(){var s=RS.saved[+b.dataset.ld].s;RS.board=s.board;RS.ci=s.ci;RS.ri=s.ri;RS.os=s.os;RS.video=s.video;RS.devs=s.devs.slice();RS.irq=Object.assign({},s.irq);fixVideo();draw()}});
  $$("[data-dl]").forEach(function(b){b.onclick=function(){RS.saved.splice(+b.dataset.dl,1);sv("cm-rigs",{l:RS.saved});draw()}});
  $("#rcp").onclick=function(){var t=summary(),m=$("#rm");if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){m.textContent="Copied."},function(){m.textContent=t});else m.textContent=t};
  $("#rpng").onclick=function(){var a=document.createElement("a");a.href=cardPng();a.download="dream-rig.png";document.body.appendChild(a);a.click();a.remove()}}
 draw()}

/* ================================================================== Walk through a year */
function walk(arg){var y=Math.max(1977,Math.min(2012,+arg||1995)),chap=0;
 function rowsOf(f){return TL.filter(function(r){return String(r[0]).slice(0,4)==String(y)&&f(r)})}
 var news=rowsOf(function(r){return/^(e|w|u)$/.test(r[1])}),hw=rowsOf(function(r){return/^(hw|pe)$/.test(r[1])}),games=rowsOf(function(r){return r[1]==="gt"||r[1]==="gn"}),movies=rowsOf(function(r){return r[1]==="m"});
 var pc=pcFor(y),own=ITEMS.filter(function(i){return i.year&&i.year<=y}).sort(function(a,b){return b.year-a.year}).slice(0,6);
 var picks=typeof adPicks==="function"?adPicks({year:y,rel:String(y)}):[];
 function mon(r){var m=String(r[0]).slice(5,7);return m?MON[+m-1]:""}
 function list(a,n){return'<div class="evl">'+a.slice(0,n).map(function(r){return'<a class="evr" href="'+tlHref(r)+'"><i>'+(typeof pxRow==="function"?pxRow(r,16):"")+'</i><span class="evd">'+E(fmtDate(r[0]))+'</span><b>'+E(r[2])+'</b><small>'+E(r[3]?String(r[3]).replace(/ \(.*$/,"").replace(/\*$/,"*"):"")+'</small></a>'}).join("")+'</div>'}
 var CH=[
  ["Welcome","clock",function(){var cp=typeof CPI!=="undefined"&&CPI[y]?CPI_NOW/CPI[y]:0;return'<div class="wk-hero"><b>'+y+'</b><span>'+(news.length+hw.length+games.length)+' things on the timeline happened this year: '+hw.length+' hardware launches, '+games.length+' games, '+news.length+' events'+(movies.length?" and "+movies.length+" movies":"")+'.</span></div>'+(cp?'<p>$1 in '+y+' is about <b>$'+cp.toFixed(2)+'</b> today (approximate).</p>':"")+'<p>This is a guided walk: '+CH.length+' stops, one click each. Use the arrow keys, or the buttons below.</p><p class="wk-yr">'+[-3,-2,-1,1,2,3].map(function(d){var t=y+d;return t>=1977&&t<=2012?'<a class="btn" href="#/walk/'+t+'">'+t+'</a>':""}).join(" ")+'</p>'}],
  ["The news","flag",function(){return news.length?'<p class="tn">Events, month by month.</p>'+list(news.sort(function(a,b){return a[0]<b[0]?-1:1}),14):'<p class="empty">No events on file for '+y+'.</p>'}],
  ["On the shelf","chip",function(){return hw.length?'<p class="tn">Hardware that launched this year, with launch prices where known.</p>'+list(hw.sort(function(a,b){return a[0]<b[0]?-1:1}),14):'<p class="empty">No hardware on file for '+y+'.</p>'}],
  ["What people played","ghost",function(){return games.length?list(games.sort(function(a,b){return(a[1]==="gt"?0:1)-(b[1]==="gt"?0:1)||(a[0]<b[0]?-1:1)}),14)+'<p><a class="btn" href="#/runs">Which machines run them?</a></p>':'<p class="empty">No games on file for '+y+'.</p>'}],
  ["The PC you wanted","tower",function(){var h=pc?'<h3 class="sub">'+E(pc.ex)+'</h3><dl class="tle-sp"><dt>CPU</dt><dd>'+E(pc.cpu)+'</dd><dt>Memory</dt><dd>'+E(pc.ram)+'</dd><dt>Video</dt><dd>'+E(pc.video)+'</dd><dt>Sound</dt><dd>'+E(pc.sound)+'</dd><dt>Storage</dt><dd>'+E(pc.storage)+'</dd></dl>':"";return h+(own.length?'<h3 class="sub">What the museum has from '+y+' or earlier</h3><div class="grid">'+own.slice(0,3).map(card).join("")+'</div>':"")+'<p><a class="btn" href="#/rigs">Build it in Dream rig</a></p>'}],
  ["The ad","star",function(){return picks.length&&typeof adShelf==="function"?'<p class="tn">A made-up store flyer, built from what really shipped after January '+y+'.</p>'+adShelf(picks):'<p class="empty">No flyer for this year yet.</p>'}],
  ["Step inside","globe",function(){var on=false;try{on=sessionStorage.getItem("cm-era")===String(y)}catch(e){}return'<p>Want the whole site to look like '+y+'? Era mode restyles every page to the period.</p><p>'+(on?'<button class="btn" id="wkoff" type="button">Leave era mode</button>':'<button class="btn pri" id="wkon" type="button">Enter era mode for '+y+'</button>')+' <a class="btn" href="#/timeline/'+y+'">Open '+y+' on the timeline</a> <a class="btn" href="#/era/'+y+'">The era page</a> <a class="btn" href="#/jukebox">Jukebox</a></p>'+(movies.length?'<h3 class="sub">At the movies</h3>'+list(movies,6):"")}]];
 function draw(){var c=CH[chap],old=y<=2000;
  app.innerHTML='<section class="walk">'+(old?'<div class="wk-nb" aria-hidden="true"><span>Netscape - [Conventional Memory: '+y+']</span></div>':"")+'<h2>Walk through '+y+'</h2>'
   +'<ol class="wk-dots" role="tablist" aria-label="Stops">'+CH.map(function(x,i){return'<li><button type="button" role="tab" class="'+(i===chap?"on":i<chap?"done":"")+'" data-c="'+i+'" aria-selected="'+(i===chap)+'" aria-label="Stop '+(i+1)+': '+E(x[0])+'">'+(typeof px==="function"?px(x[1],16):"")+'<span>'+E(x[0])+'</span></button></li>'}).join("")+'</ol>'
   +'<div class="wk-pane" role="tabpanel"><h3 class="sub">Stop '+(chap+1)+' of '+CH.length+': '+E(c[0])+'</h3>'+c[2]()+'</div>'
   +'<p class="wk-nav noprint"><button class="btn" id="wkp" type="button"'+(chap?"":" disabled")+'>&laquo; Back</button> <button class="btn pri" id="wkn" type="button"'+(chap<CH.length-1?"":" disabled")+'>Next stop &raquo;</button></p>'+(old?'<p class="wk-sb" aria-hidden="true">Document: Done</p>':"")+back()+'</section>';
  $$("[data-c]").forEach(function(b){b.onclick=function(){chap=+b.dataset.c;draw();window.scrollTo(0,0)}});$("#wkp").onclick=function(){chap--;draw();window.scrollTo(0,0)};$("#wkn").onclick=function(){chap++;draw();window.scrollTo(0,0)};
  var on=$("#wkon");if(on)on.onclick=function(){try{sessionStorage.setItem("cm-era",String(y))}catch(e){}if(window.CMFun&&CMFun.era)CMFun.era();draw()};var off=$("#wkoff");if(off)off.onclick=function(){try{sessionStorage.removeItem("cm-era")}catch(e){}if(window.CMFun&&CMFun.era)CMFun.era();draw()}}
 window.__wkKey=function(e){if(!document.querySelector(".walk")||/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))return;if(e.key==="ArrowRight"&&chap<CH.length-1){chap++;draw()}else if(e.key==="ArrowLeft"&&chap>0){chap--;draw()}};
 if(!window.__wkOn){window.__wkOn=1;document.addEventListener("keydown",function(e){if(window.__wkKey)window.__wkKey(e)})}
 draw()}

window.CMLab2={mount:function(el,page,args){app=el;try{if(page==="rigs")rigs();else if(page==="walk")walk(args[0])}catch(e){app.innerHTML='<section><h2>Something broke</h2><p class="empty">This page could not load ('+E(e.message)+').</p>'+back()+'</section>'}}};
})();
