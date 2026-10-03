/* Fun extras for ConventionalMemory.io: the idle screensaver, the dial-up modem, and the Konami code.
   Commands in the footer prompt: screensaver, dial. Nothing here sends data anywhere. */
(function(){
"use strict";
var AC=null,saver=null,idle=null,IDLE_MS=120000;
function motionOk(){return document.documentElement.getAttribute("data-motion")!=="off"}
function actx(){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)()}catch(e){}return AC}
/* ---- dial-up modem ---- */
var ROW=[697,770,852,941],COL=[1209,1336,1477],KEYS="123456789*0#";
function modemSound(){var a=actx();if(!a)return null;var out=a.createGain();out.gain.value=.12;out.connect(a.destination);var t=a.currentTime+.05;
 function tone(f,t0,d,type,g,f2){var o=a.createOscillator(),v=a.createGain();o.type=type||"sine";o.frequency.setValueAtTime(f,t0);if(f2)o.frequency.linearRampToValueAtTime(f2,t0+d);v.gain.setValueAtTime(g||.5,t0);v.gain.setValueAtTime(0,t0+d);o.connect(v);v.connect(out);o.start(t0);o.stop(t0+d+.02)}
 "5550142".split("").forEach(function(c,i){var k=KEYS.indexOf(c),r=Math.floor(k/3),cl=k%3;tone(ROW[r],t+i*.16,.1,"sine",.4);tone(COL[cl],t+i*.16,.1,"sine",.4)});
 t+=1.4;tone(2100,t,.9,"sine",.5);t+=1;tone(1200,t,.25,"square",.25);tone(2400,t+.25,.25,"square",.25);tone(980,t+.5,.3,"sawtooth",.22,1650);t+=.9;
 var nb=a.createBuffer(1,a.sampleRate*3,a.sampleRate),d=nb.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length*.4);
 var ns=a.createBufferSource();ns.buffer=nb;var bp=a.createBiquadFilter();bp.type="bandpass";bp.Q.value=2;bp.frequency.setValueAtTime(1200,t);bp.frequency.linearRampToValueAtTime(2800,t+1.2);bp.frequency.linearRampToValueAtTime(900,t+3);var ng=a.createGain();ng.gain.value=.5;ns.connect(bp);bp.connect(ng);ng.connect(out);ns.start(t);
 for(var j=0;j<8;j++)tone(1200+j*140,t+3+j*.07,.07,"square",.2);
 return{stop:function(){try{out.gain.setTargetAtTime(0,a.currentTime,.05)}catch(e){}},len:t+3.6-a.currentTime}}
function modem(){var ov=document.createElement("div");ov.className="fx-term";ov.setAttribute("role","dialog");ov.setAttribute("aria-label","Dial-up modem");ov.innerHTML="<pre></pre><p>Press any key or click to hang up</p>";document.body.appendChild(ov);var pre=ov.querySelector("pre"),snd=modemSound(),tm=[];
 var L=[["ATZ\nOK\n",0],["ATDT 555-0142\n",300],["\nDIALING...\n",1500],["\nCARRIER DETECTED\n",3600],["NEGOTIATING... 14400... 28800... 33600...\n",5200],["\nCONNECT 56000/ARQ/V90/LAPM\n\nWelcome to the Conventional Memory BBS.\nYou are caller number "+(Math.floor(Math.random()*9000)+1000)+".\nNo flame wars, please.\n",7600]];
 if(!snd)L=[["ATDT 555-0142\nCONNECT 56000\n\n(Your browser has no audio, so you missed the best part.)\n",0]];
 L.forEach(function(l){tm.push(setTimeout(function(){pre.textContent+=l[0]},l[1]))});
 function done(){tm.forEach(clearTimeout);if(snd)snd.stop();ov.remove();document.removeEventListener("keydown",done)}tm.push(setTimeout(done,snd?13000:6000));ov.onclick=done;setTimeout(function(){document.addEventListener("keydown",done)},300)}
/* ---- Konami code: modem + a one-time XP gift on the play profile ---- */
var KC=["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"],kp=0;
function gift(){try{var p=JSON.parse(localStorage.getItem("cm-play")||"null")||{xp:0,badges:{},st:{}};p.st=p.st||{};if(p.st.konami)return false;p.st.konami=1;p.xp=(p.xp||0)+30;localStorage.setItem("cm-play",JSON.stringify(p));return true}catch(e){return false}}
document.addEventListener("keydown",function(e){if(/^(INPUT|TEXTAREA|SELECT)$/.test((e.target||{}).tagName))return;var k=e.key.length===1?e.key.toLowerCase():e.key;if(k===KC[kp]){kp++;if(kp===KC.length){kp=0;var g=gift();modem();var t=document.createElement("div");t.className="fx-toast";t.setAttribute("role","status");t.textContent=g?"Cheat code accepted! +30 XP on your play profile.":"Cheat code accepted. You already took the XP.";document.body.appendChild(t);setTimeout(function(){t.remove()},4000)}}else kp=k===KC[0]?1:0});
/* ---- screensaver: a bouncing museum window ---- */
function names(){var a=[];if(typeof ITEMS!=="undefined")ITEMS.forEach(function(i){a.push([i.name,String(i.year||"")])});if(typeof TL!=="undefined")TL.forEach(function(r){if(/^(hw|pe)$/.test(r[1]))a.push([r[2],r[0].slice(0,4)])});return a.length?a:[["Conventional Memory",""]]}
function startSaver(){if(saver||!motionOk())return;var N=names(),c=document.createElement("canvas");c.className="fx-saver";c.setAttribute("aria-hidden","true");document.body.appendChild(c);var g=c.getContext("2d"),W,H,x=40,y=40,vx=2.2,vy=1.7,cur=N[0],hue=0,flash=0,stars=[];
 function size(){W=c.width=innerWidth;H=c.height=innerHeight;stars=[];for(var i=0;i<90;i++)stars.push([Math.random()*W,Math.random()*H,Math.random()*2+.5])}size();addEventListener("resize",size);
 var cols=["#55ffff","#ffff55","#ff55ff","#55ff55","#ff5555","#ffffff"],run=1;
 function frame(){if(!run)return;g.fillStyle="#000";g.fillRect(0,0,W,H);g.fillStyle="#555";stars.forEach(function(s){s[0]-=s[2]*.4;if(s[0]<0)s[0]=W;g.fillRect(s[0],s[1],s[2],s[2])});
  g.font="bold 22px 'Courier New',monospace";var tw=Math.max(240,g.measureText(cur[0]).width+40),bw=tw,bh=84;x+=vx;y+=vy;var hit=0;if(x<=0||x+bw>=W){vx=-vx;hit++}if(y<=0||y+bh>=H){vy=-vy;hit++}x=Math.max(0,Math.min(W-bw,x));y=Math.max(0,Math.min(H-bh,y));
  if(hit){hue=(hue+1)%cols.length;cur=N[Math.floor(Math.random()*N.length)];if(hit>1)flash=30}
  var col=cols[hue];g.fillStyle=flash>0&&flash%6<3?"#fff":"#c0c0c0";g.fillRect(x,y,bw,bh);g.fillStyle=col==="#ffffff"?"#0000aa":"#000080";g.fillRect(x,y,bw,24);g.fillStyle=col;g.font="bold 15px 'Courier New',monospace";g.fillText("C:\\MUSEUM\\"+(cur[1]||"ITEM")+".ITM",x+6,y+17);g.fillStyle="#000";g.font="bold 22px 'Courier New',monospace";g.fillText(cur[0],x+16,y+58);if(flash>0)flash--;requestAnimationFrame(frame)}
 function stop(){run=0;removeEventListener("resize",size);c.remove();saver=null;["mousemove","keydown","mousedown","touchstart","wheel"].forEach(function(ev){removeEventListener(ev,stop,true)});arm()}
 saver={stop:stop};setTimeout(function(){["mousemove","keydown","mousedown","touchstart","wheel"].forEach(function(ev){addEventListener(ev,stop,true)})},600);requestAnimationFrame(frame)}
function arm(){clearTimeout(idle);if(saver)return;idle=setTimeout(function(){if(/#\/(admin|builder|maze|kiosk)/.test(location.hash)||document.hidden){arm();return}startSaver()},IDLE_MS)}
["mousemove","keydown","mousedown","touchstart","scroll"].forEach(function(ev){addEventListener(ev,arm,{passive:true})});arm();
/* ---- era mode banner (set on the Era page) ---- */
function eraThemeName(y){return y<=1983?"amber":y<=1989?"green":y<=1995?"ega":""}
function era(){var y=null;try{y=sessionStorage.getItem("cm-era")}catch(e){}if(y!=null&&!/^\d{4}$/.test(String(y)))y=null;var o=document.querySelector(".fx-era");if(o)o.remove();if(!y)return;if(/^#\/(admin|builder)/.test(location.hash)){var t0=0;try{t0=+localStorage.getItem("cm-theme")||0}catch(e){}if(typeof setTheme==="function")setTheme(t0);return}var n=eraThemeName(+y),r=document.documentElement;if(n)r.setAttribute("data-theme",n);else r.removeAttribute("data-theme");var b=document.createElement("div");b.className="fx-era";b.setAttribute("role","status");b.innerHTML="ERA MODE "+y+' <a href="#/era/'+y+'">change</a> <button type="button">exit</button>';b.querySelector("button").onclick=eraOff;document.body.appendChild(b)}
function eraOff(){var t=0;try{sessionStorage.removeItem("cm-era");t=+localStorage.getItem("cm-theme")||0}catch(e){}if(typeof setTheme==="function")setTheme(t);var o=document.querySelector(".fx-era");if(o)o.remove()}
/* ---- optional click sounds (Jukebox page turns them on) ---- */
var sfxOn=false,sctx=null;function sfx(){try{sfxOn=localStorage.getItem("cm-sfx")==="1"}catch(e){sfxOn=false}}
document.addEventListener("click",function(e){if(!sfxOn||!e.target.closest||!e.target.closest(".btn,button,a"))return;try{sctx=sctx||new(window.AudioContext||window.webkitAudioContext)();var o=sctx.createOscillator(),g=sctx.createGain(),t=sctx.currentTime;o.type="square";o.frequency.setValueAtTime(880,t);o.frequency.setValueAtTime(1320,t+.03);g.gain.setValueAtTime(.04,t);g.gain.exponentialRampToValueAtTime(.001,t+.08);o.connect(g);g.connect(sctx.destination);o.start(t);o.stop(t+.09)}catch(x){}},true);
sfx();era();
window.CMFun={saver:startSaver,modem:modem,era:era,eraOff:eraOff,sfx:sfx};
})();
