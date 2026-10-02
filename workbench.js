/* The Workbench page: Matt's tools and supplies with affiliate links (see workbench-data.js and affiliate.js). */
function wbLink(t){var am=typeof affId==="function"?affId("amazon"):"",eb=typeof affId==="function"?affId("ebay"):"",out=[];
 var asin=/^[A-Z0-9]{10}$/.test(String(t.asin||""))?t.asin:"";
 if(am&&asin)out.push('<a href="https://www.amazon.com/dp/'+asin+'?tag='+encodeURIComponent(am)+'" target="_blank" rel="sponsored noopener noreferrer">Amazon</a>');
 else if(am)out.push('<a href="'+esc(affUrl("amazon",t.q||t.n))+'" target="_blank" rel="sponsored noopener noreferrer">Amazon</a>');
 if(eb)out.push('<a href="'+esc(affUrl("ebay",t.q||t.n))+'" target="_blank" rel="sponsored noopener noreferrer">eBay</a>');
 return out.join(" &middot; ")}
function wbVisible(){var st=typeof isStaff==="function"&&isStaff();return(typeof WB_TOOLS!=="undefined"?WB_TOOLS:[]).filter(function(t){return st||!t.draft})}
function workbench(){var l=wbVisible(),st=typeof isStaff==="function"&&isStaff(),photo=typeof WB_PHOTO!=="undefined"&&/^[\w\/.-]{3,80}\.(jpe?g|png|webp)$/i.test(WB_PHOTO)?WB_PHOTO:"";
 var h='<section><h2>The workbench</h2><p>'+esc(typeof WB_INTRO!=="undefined"?WB_INTRO:"")+'</p>'
  +(photo?'<figure class="wbfig"><img src="'+esc(photo)+'" alt="Matt\'s repair workbench" loading="lazy"><figcaption class="tn">The bench.</figcaption></figure>':"")
  +(st&&l.some(function(t){return t.draft})?'<p class="msg">Staff only: tools marked draft are hidden from visitors. Delete <code>draft:true</code> in <code>workbench-data.js</code> once you confirm you use one.</p>':"");
 if(!l.length)h+='<div class="empty">'+(typeof conW==="function"?conW("The bench is being photographed. The tool list lands soon.","oops"):"The tool list lands soon.")+'</div>';
 var groups=[];l.forEach(function(t){var g=t.g||"Tools";if(groups.indexOf(g)<0)groups.push(g)});
 groups.forEach(function(g){h+='<h3 class="sub">'+esc(g)+'</h3><div class="wbl">'+l.filter(function(t){return(t.g||"Tools")===g}).map(function(t){var k=wbLink(t);return'<div class="wbt'+(t.draft?" wbd":"")+'"><b>'+esc(t.n)+(t.draft?' <span class="tag">draft</span>':"")+'</b><p>'+esc(t.why||"")+'</p>'+(k?'<small class="wbk">Find it: '+k+'</small>':"")+'</div>'}).join("")+'</div>'});
 if(typeof affOn==="function"&&affOn())h+='<p class="tn">'+esc(AFF_NOTE)+'</p>';
 app.innerHTML=h+'</section>'}
