/* Real photographs from Wikimedia Commons (free-licensed files only).
   CIMG[title] = [file name on Commons, what the photo shows]. The site hotlinks the image through
   Special:FilePath and always links the credit to the Commons file page, where the author and the
   exact license are listed. If an image fails to load, the generated drawing stays in place.
   File names were taken from Commons search results; a few show a closely related model, and the
   caption says so. */
var CIMG={
"Roland MT-32":["Roland MT-32.jpg","A Roland MT-32 sound module"],
"Sound Blaster 16":["Sound Blaster 16.JPG","A Sound Blaster 16 ISA card"],
"IBM Model M":["IBM Model M 1391403 keyboard.jpg","An IBM Model M keyboard"],
"IBM Model M keyboard":["IBM Model M 1391403 keyboard.jpg","An IBM Model M keyboard"],
"Toshiba Libretto 110CT":["Libretto 70CT.jpg","A Toshiba Libretto 70CT, a close relative of the 110CT"],
"IBM Personal Computer":["IBM PC 5150.jpg","An IBM PC 5150"],
"Sony Mavica MVC-A7AF":["Pro Mavica MVC-A7AF (1987).jpg","A Pro Mavica MVC-A7AF"],
"Sony Digital Mavica MVC-FD7":["Sony Mavica MVC-FD7 digital camera (52267498373).jpg","A Sony Mavica MVC-FD7"],
"Sony Digital Mavica MVC-FD81":["Sony Digital Mavica MVC-FD81.jpg","A Sony Digital Mavica MVC-FD81"],
"Sony Digital Mavica MVC-FD88":["Sony Mavica MVC-FD88.JPG","A Sony Mavica MVC-FD88"],
"Sony Digital Mavica MVC-FD95":["Sony Mavica MVC-FD95.JPG","A Sony Mavica MVC-FD95"],
"Sony Mavica MVC-FD100":["Sony Mavica MVC-FD100 digital camera - insert a 720k floppy disk (52132518117).jpg","A Sony Mavica MVC-FD100 taking a floppy disk"],
"Apple iPod":["IPod 1G.jpg","A first-generation iPod"],
"Apple iPod classic (6th generation)":["Ipod-classic-6th-gen.jpg","A sixth-generation iPod classic"],
"Apple iPod shuffle (1st generation)":["IPod Shuffle 1st Generation.jpg","A first-generation iPod shuffle"],
"Apple iPod touch (1st generation)":["Ipod-touch-1st-gen.jpg","A first-generation iPod touch"],
"Apple QuickTake 200":["Apple QuickTake 200 Digital Camera.jpg","An Apple QuickTake 200"],
"Atari 2600 (VCS)":["Atari-2600-Wood-4Sw-Set.jpg","A woodgrain four-switch Atari 2600 with controllers"],
"Atari 2600 Jr.":["Atari-2600-Jr-Console-02.jpg","An Atari 2600 Jr."],
"Nintendo Entertainment System (US nationwide)":["NES-Console-Set.jpg","An NES with controllers"],
"Sega Genesis (North America)":["Sega-Genesis-Mod1-Set.jpg","A Sega Genesis Model 1 with controller"],
"Commodore 64":["Commodore-64-Computer-FL.jpg","A Commodore 64"],
"Magnavox Odyssey":["Magnavox-Odyssey-Console-Set.jpg","A Magnavox Odyssey with controllers"],
"Magnavox Odyssey 2":["Magnavox-Odyssey-2-Console-04.jpg","A Magnavox Odyssey 2"],
"Vectrex":["Vectrex-Console-Set.jpg","A Vectrex console with controller"],
"Apple I":["CHM Apple I.JPG","An Apple I at the Computer History Museum"]
};
function cimgUrl(t,w){var c=CIMG[t];return c?"https://commons.wikimedia.org/wiki/Special:FilePath/"+encodeURIComponent(c[0].replace(/ /g,"_"))+"?width="+(w||480):""}
function cimgPage(t){var c=CIMG[t];return c?"https://commons.wikimedia.org/wiki/File:"+encodeURIComponent(c[0].replace(/ /g,"_")):""}
function cimg(t,w,cls){var u=cimgUrl(t,w);return u?'<img class="cm-photo'+(cls?" "+cls:"")+'" src="'+u+'" alt="'+String(CIMG[t][1]).replace(/[<>&"]/g,"")+'" loading="lazy" referrerpolicy="no-referrer" data-t="'+String(t).replace(/[<>&"]/g,"")+'">':""}
function cimgCredit(t){var c=CIMG[t];return c?'<small class="cm-credit" data-t="'+String(t).replace(/[<>&"]/g,"")+'" hidden>Photo: '+String(c[1]).replace(/[<>&"]/g,"")+'. Free-licensed image from <a href="'+cimgPage(t)+'" target="_blank" rel="noopener noreferrer">Wikimedia Commons</a>; author and license are on that page.</small>':""}
document.addEventListener("error",function(e){var t=e.target;if(t&&t.classList&&t.classList.contains("cm-photo")){var f=t.closest(".cm-fig");t.remove();if(f)f.classList.remove("cm-fig")}},true);
document.addEventListener("load",function(e){var t=e.target;if(t&&t.classList&&t.classList.contains("cm-photo")){var k=t.getAttribute("data-t");document.querySelectorAll(".cm-credit").forEach(function(c){if(c.getAttribute("data-t")===k)c.hidden=false})}},true);
