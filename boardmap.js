/* Board charts for the Recap Bench. Every board here is drawn by us from numbers: where each capacitor sits is read by eye from the real board
   and rounded, and the board outline and chips are our own simple shapes. Nothing is traced or copied from anyone's picture.
   Boards with no map yet get an honest, value-grouped layout instead of pretend positions.   window.CMBoard */
window.CMBoard=(function(){
var MAPS=typeof BMAP!=="undefined"?BMAP:{};
function E(s){return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function fmt(n){var s=String(Math.round(n*1000)/1000);return s.replace(/^0\./,"0.")}
function vcls(v){return v<=10?"v1":v<=25?"v2":v<=63?"v3":v<=250?"v4":"v5"}
function rad(uf){var r=0.8+0.45*Math.log(Math.max(0.1,uf)*10)/Math.LN10;return Math.min(3.2,Math.max(0.9,r))}
function has(id){return!!MAPS[id]}
function r1(n){return Math.round(n*10)/10}

function cap(row,x,y,i,done,lp,RR){var R=RR||rad(row.uf),t=(row.ref||fmt(row.uf)+" µF")+", "+fmt(row.uf)+" µF, "+fmt(row.v)+" V",lab=row.ref||"";
 return'<g class="bm-cap '+vcls(row.v)+(done?" done":"")+(row.pr===1?" pr":"")+'" data-id="'+E(row.id)+'" data-t="'+E(t)+'" data-n="'+E(row.note||"")+'" tabindex="0" role="button" aria-pressed="'+(done?"true":"false")+'" aria-label="'+E(t+(done?", replaced":", not replaced")+". Press to change.")+'" transform="translate('+r1(x)+" "+r1(y)+')" style="--i:'+(i%12)+'">'
  +'<circle class="bm-hit" r="'+r1(R+2)+'"/><g class="bm-in"><circle class="bm-ring" r="'+r1(R+1.1)+'"/><circle class="bm-body" r="'+r1(R)+'"/>'
  +'<path class="bm-str" d="M0 '+r1(-R)+"A"+r1(R)+" "+r1(R)+" 0 0 0 0 "+r1(R)+'Z"/><path class="bm-ck" d="M'+r1(-R*0.5)+" "+r1(R*0.05)+"L"+r1(-R*0.1)+" "+r1(R*0.45)+"L"+r1(R*0.55)+" "+r1(-R*0.45)+'"/></g>'
  +(lab?'<text class="bm-ref" x="'+r1(lp?lp[0]:0)+'" y="'+r1(lp?lp[1]:R+3.1)+'"'+(lp&&lp[2]!=="middle"?' text-anchor="'+lp[2]+'"':"")+'>'+E(lab)+"</text>":"")+"</g>"}


/* put each label where it overlaps the fewest neighbours: below, above, right, then left */
function place(items,obst){var boxes=obst.slice(),out=[];
 function hit(a,b){return a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1]}
 items.forEach(function(it){var R=it.R||rad(it.row.uf),w=(it.row.ref||"").length*1.35+0.6,h=2.5,best=null,cs=[["middle",0,R+2.9],["middle",0,-R-1.1],["start",R+0.9,0.9],["end",-R-0.9,0.9]];
  cs.forEach(function(c){var x0=c[0]==="middle"?it.x-w/2:c[0]==="start"?it.x+c[1]:it.x+c[1]-w,y1=it.y+c[2],bx=[x0,y1-h+0.3,x0+w,y1+0.5],cost=0;
   boxes.forEach(function(q){if(hit(bx,q))cost+=1});items.forEach(function(o){if(o!==it){var Ro=o.R||rad(o.row.uf);if(hit(bx,[o.x-Ro,o.y-Ro,o.x+Ro,o.y+Ro]))cost+=1.5}});
   if(bx[0]<0||bx[2]>100)cost+=3;if(!best||cost<best.cost)best={cost:cost,c:c,bx:bx}});
  boxes.push(best.bx);out.push([best.c[0]==="middle"?0:best.c[1],best.c[2],best.c[0]])});
 return out}
/* a board we have mapped: caps go where the real ones are */
function mapped(map,rows,ms){var placed=[],tray=[],h=map.h,out="";
 var vn={};/* when a map only shows the value of each part (colour-coded, or no printed refs), caps of one value are interchangeable, so each takes the next spot of its value (map.v) and carries no ref label */
 rows.forEach(function(r){var p=r.ref&&map.c[r.ref];if(!p&&map.v){var k=fmt(r.uf)+"|"+fmt(r.v),a=map.v[k];if(!a){k=fmt(r.uf)+"|*";a=map.v[k]}var i=vn[k]||0;if(a&&a[i]){p=a[i];vn[k]=i+1;var q={},z;for(z in r)q[z]=r[z];q.ref="";r=q}}if(p)placed.push([r,p]);else tray.push(r)});
 (map.b||[]).forEach(function(b){var cl="bm-pcb"+(b.s?" bm-sub":"");
  out+=(b.p?'<path class="'+cl+'" d="M'+b.p.map(function(q){return q[0]+" "+q[1]}).join("L")+'Z"/>':'<rect class="'+cl+'" x="'+b.x+'" y="'+b.y+'" width="'+b.w+'" height="'+b.h+'" rx="2"/>')
   +'<text class="bm-bn" x="'+r1(b.nx!=null?b.nx:b.x+2)+'" y="'+r1(b.ny!=null?b.ny:(b.s?b.y+b.h-2:b.y+(b.p?b.h-1.6:4.2)))+'">'+E(b.n)+"</text>"});
 (map.ic||[]).forEach(function(m){out+='<rect class="bm-lm" x="'+m[0]+'" y="'+m[1]+'" width="'+m[2]+'" height="'+m[3]+'" rx="0.5"/>'+(m[4]?'<text class="bm-lt" x="'+r1(m[0]+m[2]/2)+'" y="'+r1(m[1]+m[3]/2+0.9)+'">'+E(m[4])+"</text>":"")});
 (map.lm||[]).forEach(function(m){out+='<rect class="bm-lm" x="'+m[0]+'" y="'+m[1]+'" width="'+m[2]+'" height="'+m[3]+'" rx="0.8"/><text class="bm-lt" x="'+r1(m[0]+m[2]/2)+'" y="'+r1(m[1]+m[3]/2+0.9)+'">'+E(m[4])+"</text>"});
 var items=placed.map(function(q){return{row:q[0],x:q[1][0],y:q[1][1]}});
 items.forEach(function(a){var dm=99;items.forEach(function(b){if(a!==b){var d=Math.sqrt((a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y));if(d<dm)dm=d}});a.R=Math.max(0.9,Math.min(rad(a.row.uf),dm*0.47))});
 var lps=place(items,(map.lm||[]).concat(map.ic||[]).map(function(m){return[m[0],m[1],m[0]+m[2],m[1]+m[3]]}));
 placed.forEach(function(q,i){out+=cap(q[0],q[1][0],q[1][1],i,!!ms.d[q[0].id],lps[i],items[i].R)});
 if(tray.length){var y=h+10.5,x=6,ty=h+1,body="";
  tray.forEach(function(r,i){if(x>94){x=6;y+=11}body+=cap(r,x,y,i,!!ms.d[r.id]);x+=11});
  out+='<rect class="bm-pcb bm-sub bm-tray" x="0" y="'+r1(ty)+'" width="100" height="'+r1(y+5.5-ty)+'" rx="2"/><text class="bm-bn" x="2" y="'+r1(h+5)+'">Not placed on the map</text>'+body;h=y+7.5}
 return{svg:out,h:h}}

/* a board we have not mapped yet: grouped by value, and it says so */
function grouped(rows,ms){var g={},keys=[];rows.forEach(function(r){var k=r.v+"|"+r.uf;if(!g[k]){g[k]=[];keys.push(k)}g[k].push(r)});
 keys.sort(function(a,b){var x=g[a][0],y=g[b][0];return x.v-y.v||x.uf-y.uf});
 var y=8,out="",n=0;
 keys.forEach(function(k){var a=g[k],R=rad(a[0].uf),per=Math.max(1,Math.floor((100-34)/(R*2+5))),lines=Math.ceil(a.length/per),i;
  out+='<text class="bm-gl" x="3" y="'+r1(y+1)+'">'+E(fmt(a[0].uf)+" µF")+'</text><text class="bm-gl bm-gv" x="3" y="'+r1(y+5)+'">'+E(fmt(a[0].v)+" V")+"</text>";
  a.forEach(function(r,j){var cx=34+(j%per)*(R*2+5)+R,cy=y+Math.floor(j/per)*(R*2+8);out+=cap(r,cx,cy,n++,!!ms.d[r.id])});
  y+=Math.max(13,lines*(R*2+8)+4)});
 return{svg:'<rect class="bm-pcb" x="0" y="0" width="100" height="'+r1(y)+'" rx="2"/>'+out,h:y}}

function html(b,rows,ms,o){o=o||{};var map=MAPS[b.id],m=map?mapped(map,rows,ms):grouped(rows,ms),H=r1(m.h+(map?0:0)),leg="";
 [["v1","6 to 10 V"],["v2","16 to 25 V"],["v3","35 to 63 V"],["v4","100 to 250 V"],["v5","350 V up"]].forEach(function(x){leg+='<span><i class="bm-sw bm-'+x[0]+'" aria-hidden="true"></i>'+x[1]+"</span>"});
 var note=map?(map.e?"Positions estimated by eye for this board, so treat them as approximate and check yours before you trust a spot.":"Positions measured from a cap map of this board and redrawn by us in our own style. Close, but boards vary, so check yours before you trust a spot."+(map.v?" This map shows where each value sits, not which reference number is which, so parts of one value are interchangeable here. Any we could not place are listed under the board.":"")):"We have not mapped this board's layout yet. The parts are grouped by value, so do not read this as where they sit.";
 return'<figure class="bm'+(map?"":" bm-g")+'" data-b="'+E(b.id)+'"><figcaption class="bm-plate"><b>'+(map?"Board map":"Parts chart")+'</b> '+E(b.n)+'</figcaption>'
  +'<svg class="bm-svg'+(H>150?" bm-tall":"")+'" viewBox="0 0 100 '+H+'" role="group" aria-label="'+E((map?"Board map of ":"Parts chart for ")+b.n+". "+rows.length+" capacitors. Each one is a button that marks it replaced. The checklist below has the same parts.")+'">'+m.svg+"</svg>"
  +'<div class="bm-say" aria-live="polite"><span class="bm-av" aria-hidden="true">'+(o.av?o.av("connie",44,{holds:"clipboard"}):"")+'</span><div class="cb-t cb-s-speech"><p><b>Connie:</b> <span class="bm-msg">'+(map?"Point at a capacitor and I will read it out. Tap it to mark it replaced.":"Point at a capacitor and I will read it out. I have not drawn this board yet, so these are grouped by value.")+"</span></p></div></div>"
  +'<p class="bm-leg" aria-hidden="true">'+leg+' <span>Bigger circle, bigger µF. The shaded half is the minus side marker.</span></p><p class="tn bm-note">'+note+'</p></figure>'}

function capOf(fig,id){var gs=fig.querySelectorAll(".bm-cap");for(var i=0;i<gs.length;i++)if(gs[i].getAttribute("data-id")===id)return gs[i];return null}
function speak(fig,g){var msg=fig.querySelector(".bm-msg");if(!msg||!g)return;var done=g.classList.contains("done"),n=g.getAttribute("data-n");
 msg.textContent=g.getAttribute("data-t")+". "+(g.classList.contains("pr")?"This one fails often, so start here. ":"")+(n?n+" ":"")+(done?"You have already replaced it. Tap to undo.":"Tap to mark it replaced.")}
function toggle(g){var id=g.getAttribute("data-id"),cb=document.getElementById("rc-"+id);if(cb)cb.click()}
function sync(root,d,motion){var gs=(root||document).querySelectorAll(".bm-cap");for(var i=0;i<gs.length;i++){var g=gs[i],on=!!d[g.getAttribute("data-id")],was=g.classList.contains("done");
  if(on!==was){g.classList.toggle("done",on);g.setAttribute("aria-pressed",on?"true":"false");if(on&&motion){g.classList.add("pop");(function(x){setTimeout(function(){x.classList.remove("pop")},700)})(g)}}}}
function hl(root,id,on){var gs=(root||document).querySelectorAll(".bm-cap");for(var i=0;i<gs.length;i++)gs[i].classList.toggle("hl",on&&gs[i].getAttribute("data-id")===id)}
function wire(root){var figs=(root||document).querySelectorAll(".bm");
 [].forEach.call(figs,function(fig){
  fig.addEventListener("mouseover",function(e){var g=e.target.closest&&e.target.closest(".bm-cap");if(g)speak(fig,g)});
  fig.addEventListener("focusin",function(e){var g=e.target.closest&&e.target.closest(".bm-cap");if(g)speak(fig,g)});
  fig.addEventListener("click",function(e){var g=e.target.closest&&e.target.closest(".bm-cap");if(g){toggle(g);speak(fig,g)}});
  fig.addEventListener("keydown",function(e){var g=e.target.closest&&e.target.closest(".bm-cap");if(g&&(e.key===" "||e.key==="Enter")){e.preventDefault();toggle(g);speak(fig,g)}})});
 [].forEach.call((root||document).querySelectorAll("tr[data-row]"),function(tr){var id=tr.getAttribute("data-row");
  tr.addEventListener("mouseenter",function(){hl(root,id,true)});tr.addEventListener("mouseleave",function(){hl(root,id,false)})})}
return{html:html,wire:wire,sync:sync,hl:hl,has:has,maps:MAPS}})();
