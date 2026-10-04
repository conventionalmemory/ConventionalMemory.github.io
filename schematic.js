/* schematic.js: circuit drawings, redrawn by us in one plain style, with the parts listed beside them.
   Data is in schematic-data.js. Each drawing is a list of shapes on a 10 unit grid:
     ["w",x,y,x,y,...]            wire (a polyline)          ["j",x,y]  junction dot
     ["r",x,y,"v"|"h",label,o]    resistor, centre x,y, leads reach 20 each way
     ["c"|"ce",x,y,"v"|"h",label,o] capacitor or electrolytic (+ on the left or top), leads reach 10
     ["d"|"z"|"led",x,y,"u"|"d"|"l"|"r",label,o] diode, zener or LED, o = the way the banded end (cathode) points, leads reach 15
     ["f",x,y,label,o]            fuse, horizontal, leads reach 20
     ["q",x,y,"npn"|"pnp",label,o] transistor, x,y = middle of the base plate. Base (x-20,y), collector (x+14,y-24), emitter (x+14,y+24)
     ["coil",x,y,label,o]         relay coil, pin 1 at (x-16,y-26), pin 2 at (x-16,y+26)
     ["sw",x,y,o]                 relay contact: pole (x,y), O contact (x-16,y+40), S contact (x+32,y+40). Arm rests on O.
     ["g",x,y]                    ground, wire arrives at (x,y)   ["port",x,y]  connection point drawn as a circle, wire leaves at (x,y+6)
     ["box",x,y,w,h]              shaded area                  ["t",x,y,text,"s"|"m"|"e",cls]  text (start, middle, end)
   o = {k:"part key to light up", s:"l"|"r"|"t"|"b" (side for the label)}. Nothing here draws a part from a real board, so the
   placement is ours; what is wired to what is read from the source drawing. */
window.CMSch=(function(){
"use strict";
function E(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function n1(v){return Math.round(v*10)/10}
function T(x,y,a,inner,k){return'<g transform="translate('+n1(x)+" "+n1(y)+")"+(a?" rotate("+a+")":"")+'" class="sc-p"'+(k?' data-p="'+E(k)+'"':"")+">"+inner+"</g>"}
function arrow(x1,y1,x2,y2,len,w){var dx=x2-x1,dy=y2-y1,d=Math.sqrt(dx*dx+dy*dy)||1,ux=dx/d,uy=dy/d,bx=x2-ux*len,by=y2-uy*len;
 return'<path class="sc-f" d="M'+n1(x2)+" "+n1(y2)+" L"+n1(bx-uy*w)+" "+n1(by+ux*w)+" L"+n1(bx+uy*w)+" "+n1(by-ux*w)+' Z"/>'}
var ROT={h:0,v:90,r:0,d:90,l:180,u:-90};
function lab(x,y,text,side,half,o){if(!text)return"";var s=(o&&o.s)||side,tx=x,ty=y,an="start";
 if(s==="l"){tx=x-half-6;an="end";ty=y+4}else if(s==="r"){tx=x+half+6;ty=y+4}else if(s==="t"){ty=y-half-6;an="middle"}else{ty=y+half+14;an="middle"}
 return'<text class="sc-l" x="'+n1(tx)+'" y="'+n1(ty)+'" text-anchor="'+an+'">'+E(text)+"</text>"}
var SH={
 r:function(e){var a=ROT[e[3]],o=e[5];return T(e[1],e[2],a,'<path class="sc-s" d="M-20 0H-12L-9-6L-3 6L3-6L9 6L12 0H20"/>',o&&o.k)+lab(e[1],e[2],e[4],e[3]==="v"?"r":"t",e[3]==="v"?8:8,o)},
 c:function(e){var a=ROT[e[3]],o=e[5];return T(e[1],e[2],a,'<path class="sc-s" d="M-10 0H-2M-2-8V8M2-8V8M2 0H10"/>',o&&o.k)+lab(e[1],e[2],e[4],e[3]==="v"?"r":"t",8,o)},
 ce:function(e){var a=ROT[e[3]],o=e[5];return T(e[1],e[2],a,'<path class="sc-s" d="M-10 0H-2M-2-8V8M2 0H10M2-8Q6 0 2 8"/><path class="sc-s" d="M-8-7H-4M-6-9V-5"/>',o&&o.k)+lab(e[1],e[2],e[4],e[3]==="v"?"r":"t",8,o)},
 d:function(e){return dio(e,"")},
 z:function(e){return dio(e,"z")},
 led:function(e){return dio(e,"led")},
 f:function(e){var o=e[4];return T(e[1],e[2],0,'<path class="sc-s" d="M-20 0H-12M12 0H20"/><rect class="sc-s" x="-12" y="-4" width="24" height="8"/><path class="sc-s" d="M-12 0H12"/>',o&&o.k)+lab(e[1],e[2],e[3],"b",6,o)},
 q:function(e){var pnp=e[3]==="pnp",o=e[5],p='<path class="sc-s" d="M-20 0H0M0-12V12M0-6L14-16V-24M0 6L14 16V24"/>';
  p+=pnp?arrow(14,16,0,6,7,3.2):arrow(0,6,14,16,7,3.2);
  return T(e[1],e[2],0,p,o&&o.k)+lab(e[1]+14,e[2],e[4],"r",4,o)},
 coil:function(e){var o=e[4];return T(e[1],e[2],0,'<path class="sc-s" d="M-16-26V-10M-16 10V26"/><rect class="sc-s" x="-26" y="-10" width="52" height="20"/><path class="sc-s" d="M-26 6L26-6"/>',o&&o.k)+lab(e[1],e[2],e[3],"b",10,o)},
 sw:function(e){var o=e[3];return T(e[1],e[2],0,'<path class="sc-s" d="M0 0L-14 36M-24 40H-8M24 40H40"/><circle class="sc-d" cx="0" cy="0" r="2.4"/><circle class="sc-d" cx="-16" cy="40" r="2.4"/><circle class="sc-d" cx="32" cy="40" r="2.4"/><text class="sc-t" x="-5" y="-6" text-anchor="end">P</text><text class="sc-t" x="-22" y="58" text-anchor="end">O</text><text class="sc-t" x="44" y="34" text-anchor="start">S</text>',o&&o.k)},
 g:function(e){return T(e[1],e[2],0,'<path class="sc-s" d="M0 0V8M-10 8H10M-6 12H6M-2 16H2"/>')},
 port:function(e){return T(e[1],e[2],0,'<circle class="sc-s" cx="0" cy="0" r="6"/><path class="sc-s" d="M-3 0H3M0-3V3"/>')},
 j:function(e){return'<circle class="sc-d" cx="'+e[1]+'" cy="'+e[2]+'" r="2.6"/>'},
 w:function(e){var pts=[],i;for(i=1;i+1<e.length;i+=2)pts.push(e[i]+","+e[i+1]);return'<polyline class="sc-w" points="'+pts.join(" ")+'"/>'},
 box:function(e){return'<rect class="sc-box" x="'+e[1]+'" y="'+e[2]+'" width="'+e[3]+'" height="'+e[4]+'" rx="4"/>'},
 t:function(e){return'<text class="sc-l'+(e[5]?" "+E(e[5]):"")+'" x="'+e[1]+'" y="'+e[2]+'" text-anchor="'+(e[4]==="m"?"middle":e[4]==="e"?"end":"start")+'">'+E(e[3])+"</text>"}
};
function dio(e,kind){var a=ROT[e[3]],o=e[5],p='<path class="sc-s" d="M-15 0H-6M6 0H15"/><path class="sc-s sc-fl" d="M-6-7V7L6 0Z"/>';
 p+=kind==="z"?'<path class="sc-s" d="M10-9L6-7V7L2 9"/>':'<path class="sc-s" d="M6-7V7"/>';
 if(kind==="led")p+='<path class="sc-s" d="M-4-12L-12-20M-9-20L-12-20L-12-17M2-12L-6-20M-3-20L-6-20L-6-17"/>';
 return T(e[1],e[2],a,p,o&&o.k)+lab(e[1],e[2],e[4],e[3]==="u"||e[3]==="d"?"r":"t",kind==="led"?22:8,o)}
function draw(s){var o="";s.els.forEach(function(e){var f=SH[e[0]];if(f)o+=f(e)});return o}
function figure(s,i){var rows=s.parts.map(function(p){return'<tr'+(p[0]?' data-p="'+E(p[0])+'"':"")+'><td>'+E(p[1])+"</td><td><b>"+E(p[2])+"</b>"+(p[3]?" <small>"+E(p[3])+"</small>":"")+"</td></tr>"}).join("");
 return'<figure class="sch" data-s="'+E(s.id)+'"><figcaption class="sch-plate"><b>Circuit</b> '+E(s.t)+"</figcaption>"
  +'<p class="tn sch-hint noprint">Swipe the drawing sideways to see all of it.</p><div class="sch-scroll" tabindex="0" role="region" aria-label="'+E("Drawing of "+s.t+" (scrolls sideways on a small screen)")+'"><svg class="sch-svg" viewBox="0 0 '+s.w+" "+s.h+'" role="img" aria-label="'+E("Circuit drawing: "+s.t+". "+s.alt)+'">'+draw(s)+"</svg></div>"
  +'<div class="sch-body"><p class="sch-how">'+E(s.how)+'</p><table class="sch-parts"><thead><tr><th scope="col">Qty</th><th scope="col">Part</th></tr></thead><tbody>'+rows+"</tbody></table>"
  +(s.opt?'<p class="tn">'+E(s.opt)+"</p>":"")+'<p class="tn sch-by">'+E(s.by)+"</p></div></figure>"}
function list(mid){return(typeof SCH==="undefined"?[]:SCH).filter(function(s){return s.m.indexOf(mid)>=0})}
function html(mid){var l=list(mid);if(!l.length)return"";
 return'<h3 class="sub" id="rc-sch">Circuits <small>'+l.length+"</small></h3><p class=\"tn\">Circuits we redrew in one plain style, with the parts listed. Our own drawing from the source diagram, so check it against the original before you build anything.</p>"+l.map(figure).join("")}
function wire(root){[].forEach.call((root||document).querySelectorAll(".sch"),function(fig){
 function on(k,v){if(!k)return;[].forEach.call(fig.querySelectorAll("[data-p]"),function(el){if(el.getAttribute("data-p")===k)el.classList.toggle("hl",v)})}
 fig.addEventListener("mouseover",function(e){var t=e.target.closest&&e.target.closest("[data-p]");if(t)on(t.getAttribute("data-p"),true)});
 fig.addEventListener("mouseout",function(e){var t=e.target.closest&&e.target.closest("[data-p]");if(t)on(t.getAttribute("data-p"),false)})})}
return{html:html,list:list,wire:wire,figure:figure}})();
