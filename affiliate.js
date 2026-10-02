/* Affiliate links (Amazon Associates and eBay Partner Network).
   Nothing shows until you fill in your own IDs below. Until then the site has no affiliate links at all.
     AFF.amazon : your Amazon Associates tracking ID, like  conventionalm-20
     AFF.ebay   : your eBay Partner Network campaign ID, a 10 digit number
   The links only search for the product by name; they never show or copy prices. Every box carries the
   disclosure that Amazon and eBay require, and every link is marked rel="sponsored". */
var AFF={amazon:"conventionalm-20",ebay:"",ebayCustom:"cm"};
var AFF_NOTE="Affiliate links: if you buy through them, Conventional Memory earns a small commission at no cost to you. As an Amazon Associate I earn from qualifying purchases.";
function affId(k){var v=String(AFF[k]||"").trim();if(k==="amazon")return/^[a-z0-9][a-z0-9-]{1,38}-\d{2}$/i.test(v)?v:"";if(k==="ebay")return/^\d{8,12}$/.test(v)?v:"";return""}
function affOn(){return!!(affId("amazon")||affId("ebay"))}
function affQ(name,maker){var n=String(name||"").replace(/\s*\((Japan|North America|Europe|US|UK|NA|EU|JP|PAL|NTSC)\)\s*$/i,"").replace(/[^\w .&'+-]+/g," ").replace(/\s+/g," ").trim();if(maker){var m=String(maker).split(/[ ,]/)[0];if(m&&n.toLowerCase().indexOf(m.toLowerCase())<0)n=m+" "+n}return n}
function affUrl(k,q){var id=affId(k);if(!id||!q)return"";var e=encodeURIComponent(q);
 if(k==="amazon")return"https://www.amazon.com/s?k="+e+"&tag="+encodeURIComponent(id);
 return"https://www.ebay.com/sch/i.html?_nkw="+e+"&_sacat=0&mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid="+id+"&customid="+encodeURIComponent(String(AFF.ebayCustom||"cm").replace(/[^\w-]/g,"").slice(0,30))+"&toolid=10001&mkevt=1"}

/* Parts and supplies that usually matter for this kind of machine. These are suggestions by category and era,
   not promises that a part fits: the box says to check the model first. */
function affPartsFor(name,maker,key){var it=null,row=null,yr=0,ty="",cat="",nm=String(name||"").toLowerCase(),out=[];
 try{it=(typeof ITEMS!=="undefined"?ITEMS:[]).filter(function(x){return x.id===key})[0]||null;
  if(!it&&typeof TL!=="undefined")row=TL.filter(function(x){return x[2]===key})[0]||null}catch(e){}
 function add(l,q){if(out.length<6&&!out.some(function(o){return o[1]===q}))out.push([l,q])}
 var comp=0,con=0,midi=0,kb=0,mon=0,cam=0,card=0;
 if(it){yr=+it.year||0;ty=String(it.type||"").toLowerCase();cat=String(it.cat||"").toLowerCase();
  if(/cable|adapter|charger|power tap|surge|manual|book|magazine|\blot\b|bulk|battery|replacement|print ad|handbook|controller|cartridge|game only|panel/.test(nm)||/books|ephemera|games and software|power protection|cables/.test(cat)||ty==="game or software")return out;
  comp=/^(computer|laptop)$/.test(ty);con=ty==="game console";midi=cat==="midi";kb=cat==="keyboards";mon=ty==="monitor";cam=ty==="camera"||cat==="cameras";card=ty==="expansion card"}
 else if(row){yr=parseInt(row[0],10)||0;if(!/^(hw|pe)$/.test(row[1]))return out;
  comp=/laptop|notebook|thinkpad|powerbook|macintosh|\bimac\b|\bpc\b|computer|amiga|atari st|commodore/.test(nm);con=/game ?boy|\bnes\b|famicom|snes|super nintendo|nintendo 64|n64|playstation|genesis|mega drive|dreamcast|saturn|console/.test(nm);midi=/midi|sound canvas|\bsc-55|\bmt-32|\bsc-88/.test(nm);kb=/keyboard/.test(nm);mon=/monitor|\bcrt\b/.test(nm);cam=/mavica|camera|\bdc\d+/.test(nm);card=/sound blaster|voodoo|graphics card|sound card|\bgus\b|adlib/.test(nm)}
 else return out;
 var t=(nm+" "+String(maker||"")).toLowerCase();
 if(comp&&(!yr||yr<=2006)){
  if(/macintosh|powerbook|imac|apple/.test(t))add("PRAM and clock battery (check the exact type for your model)","Macintosh PRAM battery 3.6V lithium");
  else add("CMOS and clock battery (check which type your board uses)","CMOS battery CR2032 3V");
  if(!yr||yr<=2002){add("IDE to CompactFlash adapter, replaces a dying hard drive","IDE to CompactFlash adapter");add("CompactFlash card for old computers","CompactFlash card 8GB industrial")}
  if(yr&&yr<=2001){add("Gotek USB floppy drive emulator","Gotek floppy drive emulator");add("3.5 inch floppy disks, 1.44 MB","3.5 inch floppy disks 1.44MB")}}
 if(con){if(/game ?boy/.test(t))add("Tri-wing and gamebit screwdriver set for Nintendo","Nintendo tri-wing gamebit screwdriver set");else if(/\bnes\b|famicom|snes|super nintendo|nintendo 64|n64/.test(t))add("Cartridge and console cleaning kit","Nintendo cartridge cleaning kit isopropyl")}
 if(midi){add("5 pin MIDI cable","5 pin MIDI cable");add("USB to MIDI interface","USB MIDI interface 1 in 1 out")}
 if(cam&&/mavica|floppy/.test(t))add("3.5 inch floppy disks, 1.44 MB","3.5 inch floppy disks 1.44MB");
 if(kb){add("PS/2 to USB adapter","PS/2 to USB adapter keyboard");add("Keycap puller and keyboard cleaning kit","keycap puller keyboard cleaning kit")}
 if(mon)add("VGA cable","VGA cable male to male");
 if(comp||con||kb||cam||card||midi){add("Electronics contact cleaner","DeoxIT contact cleaner");add("99% isopropyl alcohol for cleaning boards","99% isopropyl alcohol")}
 return out}
/* A small "Find one" box. Returns "" when no IDs are set. */
function affBox(name,maker,label,parts){if(!affOn())return"";var q=affQ(name,maker),a=affUrl("amazon",q),e=affUrl("ebay",q);if(!q||!(a||e))return"";
 function ln(u,t){return u?'<li><a href="'+esc(u)+'" target="_blank" rel="sponsored noopener noreferrer">'+t+'</a></li>':""}
 return'<div class="affb"><h4 class="sub">'+esc(label||"Want one of your own?")+'</h4><ul class="refs">'+ln(e,"Search eBay for "+esc(q))+ln(a,"Search Amazon for "+esc(q))+'</ul>'+affPartList(parts)+'<p class="tn">'+esc(AFF_NOTE)+'</p></div>'}
function affPartList(parts){if(!parts||!parts.length)return"";var am=affId("amazon"),eb=affId("ebay");
 return'<h4 class="sub">Parts and supplies that often come up</h4><ul class="refs">'+parts.map(function(p){var u=am?affUrl("amazon",p[1]):affUrl("ebay",p[1]);return u?'<li><a href="'+esc(u)+'" target="_blank" rel="sponsored noopener noreferrer">'+esc(p[0])+'</a></li>':""}).join("")+'</ul><p class="tn">Check your exact model before you buy; these are common repair parts for machines like this, not a guarantee of fit.</p>'}
/* Inline links for one line of text, such as a wanted accessory. */
function affInline(name,maker){if(!affOn())return"";var q=affQ(name,maker),a=affUrl("amazon",q),e=affUrl("ebay",q);if(!q)return"";
 return' <small class="affi">Find it: '+(e?'<a href="'+esc(e)+'" target="_blank" rel="sponsored noopener noreferrer">eBay</a>':"")+(e&&a?" &middot; ":"")+(a?'<a href="'+esc(a)+'" target="_blank" rel="sponsored noopener noreferrer">Amazon</a>':"")+'</small>'}
function affFooter(){if(!affOn())return;var f=document.querySelector("footer");if(!f||f.querySelector(".affnote"))return;var p=document.createElement("p");p.className="affnote tn";p.textContent=AFF_NOTE;f.appendChild(p)}
document.addEventListener("DOMContentLoaded",affFooter);if(document.readyState!=="loading")affFooter();
