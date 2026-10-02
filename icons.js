/* icons.js - a pool of small pixel icons (12 x 12, EGA colors) and the tables that choose one for a kind, category, platform or genre.
   Everything is drawn from the strings below: no image files. Loaded before app.js; uses esc() from app.js at call time. */
var PXC={k:"#000000",w:"#ffffff",g:"#aaaaaa",d:"#555555",r:"#aa0000",R:"#ff5555",b:"#0000aa",B:"#5555ff",c:"#00aaaa",C:"#55ffff",n:"#00aa00",N:"#55ff55",y:"#ffff55",o:"#ff8800",m:"#aa5500",p:"#aa00aa",P:"#ff55ff",t:"#d8c8a0",s:"#8888aa"};
var PXG={
floppy:["kkkkkkkkkk..","kbbggggbbkk.","kbbggggbbbkk","kbbggkgbbbbk","kbbggggbbbbk","kbbbbbbbbbbk","kbwwwwwwwwbk","kbwrrrrrrwbk","kbwwwwwwwwbk","kbwrrrrrwwbk","kbwwwwwwwwbk","kkkkkkkkkkkk"],
cd:["...kkkkkk...","..kCCwwCCk..","kCCwwwwwwCCk","kCwwkkkkwwCk","kCwkggggkwCk","kwwkgkkgkwwk","kwwkgkkgkwwk","kCwkggggkwCk","kCwwkkkkwwCk","kCCwwwwwwCCk","..kCCwwCCk..","...kkkkkk..."].map(function(r){return r.slice(0,12)}),
tower:["..kkkkkkkk..",".kttttttttk.",".ktkkkkkktk.",".ktkddddktk.",".kttttttttk.",".ktkkkkkktk.",".kttttttttk.",".ktgggggggk.",".kttttttttk.",".kttNttrttk.",".kttttttttk.",".kkkkkkkkkk."],
laptop:["..kkkkkkkk..",".kggggggggk.",".kgbbbbbbgk.",".kgbCbbbbgk.",".kgbbbbbbgk.",".kgbbbbbbgk.",".kggggggggk.","kkkkkkkkkkkk","kgtgtgtgtgtk","kgggggggggkk","kkkkkkkkkkk.","............"],
crt:[".kkkkkkkkkk.","kggggggggggk","kgkkkkkkkkgk","kgkNNkkkkkgk","kgkkkkkkkkgk","kgkkkkkkkkgk","kgkkkkkkkkgk","kggggggggNgk","kkkkkkkkkkkk","...kggggk...","..kggggggk..","..kkkkkkkk.."],
mouse:["....kkkk....","..kkgggkkk..",".kgggkgggkk.",".kgggkgggkk.",".kkkkkkkkkk.",".kggggggggk.",".kggggggggk.",".kggggggggk.",".kggggggggk.","..kggggggk..","...kkkkkk...","............"],
keyboard:["............","kkkkkkkkkkkk","kgwgwgwgwgwk","kgggggggggkk","kgwgwgwgwgwk","kgggggggggkk","kgwgwgwgwgwk","kgggggggggkk","kgwwwwwwwwgk","kkkkkkkkkkkk","............","............"],
joystick:["....kkk.....","...kRRRk....","...kRRRk....","....kdk.....","....kdk.....","....kdk.....","kkkkkdkkkkk.","kdddddddddk.","kdRddddBddk.","kdddddddddk.","kkkkkkkkkkk.","............"],
gamepad:["............","............",".kkkkkkkkkk.","kgggggggggk.","kgkgggggRgk.","kkkkgggRgRgk","kgkgggggRgk.","kgggggggggk.","kggkkggkkgk.",".kkk.kkk.kk.","............","............"].map(function(r){return r.slice(0,12)}),
console:["............","kkkkkkkkkkkk","kdddddddddkk","kddkkkkkkddk","kddkddddkddk","kdddddddddkk","kkkkkkkkkkkk",".kgk....kgk.",".kRk....kBk.",".kkk....kkk.","............","............"],
handheld:["..kkkkkkkk..",".kggggggggk.",".kgkkkkkkgk.",".kgkNNNNkgk.",".kgkNNNNkgk.",".kgkkkkkkgk.",".kggggggggk.",".kgkgggRgBk.",".kkkgggRgRk.",".kgkggggggk.",".kggkkggkkk.","..kkkkkkkk.."],
cart:["..kkkkkkkk..",".kdddddddddk",".kdkkkkkkkdk",".kdkRRRRkdk.",".kdkRwwRkdk.",".kdkRRRRkdk.",".kdkkkkkkkdk",".kdddddddddk",".kdddddddddk","..kkdddkkkk.","...kyyykk...","...kkkkk...."].map(function(r){return r.slice(0,12)}),
card:["............","kkkkkkkkkkkk","knnnnnnnnnnk","kntkkkntkkNk","kntkkkntkkNk","knnnnnnnnnnk","knnknnnknnnk","knnnnnnnnnnk","kkkkkkkkkkkk","kyykyykyykyk","kkkkkkkkkkkk","............"],
chip:["..k.k.k.k...","kkkkkkkkkkk.","kdddddddddk.","kdkkkkkkkdk.","kdkdddddkdk.","kdkdkkkdkdk.","kdkdddddkdk.","kdkkkkkkkdk.","kdddddddddk.","kkkkkkkkkkk.","..k.k.k.k...","............"],
ram:["............","kkkkkkkkkkkk","knnnnnnnnnnk","kndkdkdkdknk","kndkdkdkdknk","knnnnnnnnnnk","kkkkkkkkkkkk","kyykyykyykyk","kkkkkkkkkkkk","............","............","............"],
hdd:["kkkkkkkkkkkk","kggggggggggk","kgkkkkkkkkgk","kgkgggggkkgk","kgkgkkkgkkgk","kgkgkdkgkkgk","kgkgkkkgkkgk","kgkgggggkkgk","kgkkkkkkkkgk","kggggggggNgk","kkkkkkkkkkkk","............"],
printer:["...kkkkkk...","...kwwwwk...","...kwkkwk...","kkkkwwwwkkkk","kgggggggggkk","kgggggggRgkk","kkkkkkkkkkkk",".kwwwwwwwwk.",".kwkkkkkkwk.",".kwwwwwwwwk.",".kkkkkkkkkk.","............"],
modem:["............","............","kkkkkkkkkkkk","kgggggggggkk","kgNgRgNgNgkk","kgggggggggkk","kkkkkkkkkkkk",".kk......kk.",".kk......kk.","............","............","............"],
speaker:["..kkkkkkk...",".kgggggggk..",".kgkkkkkgk..",".kgkdddkgk..",".kgkdkdkgk..",".kgkdddkgk..",".kgkkkkkgk..",".kgggggggk..",".kgkkkkkgk..",".kgkdddkgk..",".kgggggggk..","..kkkkkkk..."],
headset:["...kkkkkk...","..kddddddk..",".kd......dk.",".kd......dk.","kkkk....kkkk","kggk....kggk","kggk....kggk","kggk....kggk","kkkk....kkkk","............","............","............"],
mic:["....kkkk....","...kddddk...","...kdwddk...","...kddddk...","...kddddk...","..kkkkkkkk..","..kg....gk..","..kg....gk..","...kg..gk...","....kggk....",".....kk.....","...kkkkkk..."],
ipod:["..kkkkkkkk..","..kwwwwwwk..","..kwCCCCwk..","..kwCCCCwk..","..kwwwwwwk..","..kwwkkwwk..","..kwkwwkwk..","..kwkwwkwk..","..kwwkkwwk..","..kwwwwwwk..","..kkkkkkkk..","............"],
mavica:["............","...kk...kk..","kkkkkkkkkkkk","kggggggggggk","kgkkkkgkBBgk","kgkCCkgkBwgk","kgkCCkgkBBgk","kgkkkkgggggk","kggggggggggk","kkkkkkkkkkkk","............","............"],
camera:["............","...kkkk.....","kkkkkkkkkkkk","kgggggggggkk","kggkkkkkgggk","kggkCCkkgggk","kggkCwkkgRgk","kggkkkkkgggk","kgggggggggkk","kkkkkkkkkkkk","............","............"],
scanner:["............","............","kkkkkkkkkkkk","kgggggggggkk","kwwwwwwwwwwk","kwwwwwwwwwwk","kddddddddddk","kgggggggNgkk","kkkkkkkkkkkk","............","............","............"],
usb:["............","....kkkkkkk.","kkkkkddkdkk.","kgggkkkkkkk.","kgggkddkdkk.","kkkkkkkkkkk.","............","............","............","............","............","............"].map(function(r){return r.slice(0,12)}),
box:["...kkkkkkk..","..kttttttkk.",".kttttttkttk","kkkkkkkkktttk","ktttttttktttk","ktrrrrrtktttk","ktttttttktttk","ktrrrtttktttk","ktttttttkttk.","kkkkkkkkktk..","..........k...","............"].map(function(r){return r.slice(0,12)}),
film:["kkkkkkkkkkkk","kwkkkkkkkkwk","kkkdddddddkk","kwkdddddddwk","kkkdddddddkk","kwkdddddddwk","kkkdddddddkk","kwkdddddddwk","kkkdddddddkk","kwkkkkkkkkwk","kkkkkkkkkkkk","............"],
globe:["...kkkkkk...","..kBBnnBBk..",".kBnnnBBBBk.","kBBnnBBBnnBk","kBBBBBBnnnBk","kBnnBBBBnBBk","kBnnnBBBBBBk","kBBnnBBBBBBk",".kBBBBBBnBk.","..kBBBBBBk..","...kkkkkk...","............"],
news:["kkkkkkkkkkkk","kwwwwwwwwwwk","kwkkkkwdddwk","kwkkkkwdddwk","kwwwwwwwwwwk","kwdddwdddwwk","kwwwwwwwwwwk","kwdddwdddwwk","kwwwwwwwwwwk","kwdddwdddwwk","kkkkkkkkkkkk","............"],
trophy:["kkkkkkkkkkkk","kyyyyyyyyyyk","kyyyyyyyyyyk",".kyyyyyyyyk.","..kyyyyyyk..","...kyyyyk...","....kyyk....","....kyyk....","...kyyyyk...","..kmmmmmmk..","..kmmmmmmk..","..kkkkkkkk.."],
star:[".....kk.....",".....kyk....","....kyyyk...","kkkkkyyykkkk","kyyyyyyyyyyk",".kyyyyyyyyk.","..kyyyyyyk..","..kyyyyyyk..",".kyyykkyyyk.",".kyykk.kyyk.","kyyk....kyyk","kkk......kkk"],
heart:["............",".kkkk..kkkk.","kRRRRkkRRRRk","kRwRRRRRRRRk","kRRRRRRRRRRk","kRRRRRRRRRRk",".kRRRRRRRRk.","..kRRRRRRk..","...kRRRRk...","....kRRk....",".....kk.....","............"],
skull:["..kkkkkkkk..",".kwwwwwwwwk.","kwwwwwwwwwwk","kwkkkwwkkkwk","kwkkkwwkkkwk","kwwwwkkwwwwk",".kwwwwwwwwk.","..kwkwkwkwk.","..kwkwkwkwk.","...kkkkkkk..","............","............"],
sword:["..........kk","........kkwk",".......kwwk.","......kwwk..",".....kwwk...","k...kwwk....","kk.kwwk.....",".kkwwk......","..kkk.......",".kmkkk......","kmk..kk.....","kk.........."],
ship:["......k.....","......kk....","...kkkkwkk..","..kwwwkwwwk.","..kwwwkwwwk.","..kwwwkwwwk.","kkkkkkkkkkkk",".kmmmmmmmmk.","..kmmmmmmk..","BBBBBBBBBBBB",".BBBBBBBBBB.","............"],
car:["............","............","...kkkkkk...","..kRRCCRRk..",".kRRCCCCRRk.","kRRRRRRRRRRk","kRRRRRRRRRRk","kkkkkkkkkkkk",".kdgkkkkgdk.",".kdkkkkkkdk.","..kk....kk..","............"].map(function(r){return r.slice(0,12)}),
plane:[".....kk.....",".....kwk....",".....kwk....","kk...kwk..kk",".kkkkkwkkkk.","..kwwwwwwwk.","...kkkwkkk..",".....kwk....","....kwwwk...","...kwwkwwk..","...kkk.kkk..","............"],
rocket:[".....kk.....","....kwwk....","...kwwwwk...","...kwBBwk...","...kwBBwk...","...kwwwwk...","..kkwwwwkk..",".kRkwwwwkRk.",".kRkkkkkkRk.","..kk.oo.kk..",".....oy.....","......o....."].map(function(r){return r.slice(0,12)}),
ghost:["...kkkkkk...","..kwwwwwwk..",".kwwwwwwwwk.",".kwkkwwkkwk.",".kwkkwwkkwk.",".kwwwwwwwwk.",".kwwwkkwwwk.",".kwwwwwwwwk.",".kwwwwwwwwk.",".kwkwwkwwkk.",".kk.kk.kk...","............"].map(function(r){return r.slice(0,12)}),
key:["..kkkk......",".kyyyyk.....","kyykkyyk....","kyk..kyk....","kyyk.kyk....",".kyyyyk.....","..kyyk......","...kyk......","...kyyk.....","...kyk......","...kyyk.....","....kk......"],
bulb:["...kkkkkk...","..kyyyyyyk..",".kyyywwyyyk.",".kyywyyyyyk.",".kyyyyyyyyk.",".kyyyyyyyyk.","..kyyyyyyk..","...kyyyyk...","...kgggk....","...kgkgk....","....kkk.....","............"],
coin:["...kkkkkk...","..kyyyyyyk..",".kyywwyyyyk.","kyywyyyyyyyk","kyywykkyyyyk","kyywykkyyyyk","kyyyyyyyyyyk","kyyyyyyyyymk",".kyyyyyyymk.","..kmmmmmmk..","...kkkkkk...","............"],
mail:["............","kkkkkkkkkkkk","kwkwwwwwwkwk","kwwkwwwwkwwk","kwwwkwwkwwwk","kwwwwkkwwwwk","kwwwwwwwwwwk","kwwwwwwwwwwk","kkkkkkkkkkkk","............","............","............"],
phone:["..kkkkkkkk..",".kdddddddddk",".kdkkkkkkdk.",".kdkCCCCkdk.",".kdkkkkkkdk.",".kdddddddk..",".kdwdwdwdk..",".kdddddddk..",".kdwdwdwdk..",".kdddddddk..",".kdwdwdwdk..","..kkkkkkk..."].map(function(r){return r.slice(0,12)}),
gear:["....kkkk....","..k.kddk.k..",".kkkkddkkkk.","kkdddddddkk.","kddddkkdddk.","kdddkggkddk.","kdddkggkddk.","kddddkkdddk.","kkdddddddkk.",".kkkkddkkkk.","..k.kddk.k..","....kkkk...."].map(function(r){return r.slice(0,12)}),
book:["............",".kkkkkkkkkk.","kbbbbbbbbbbk","kbwwwwwwwwbk","kbwkkkkkkwbk","kbwwwwwwwwbk","kbwkkkkkwwbk","kbwwwwwwwwbk","kbbbbbbbbbbk",".kwwwwwwwwk.",".kkkkkkkkkk.","............"],
flag:["kk..........","kdkkkkkkkkk.","kdRRRRRRRRRk","kdRRwwwRRRRk","kdRRwwwRRRRk","kdRRRRRRRRRk","kdkRRRRRRRk.","kd.kkkkkkk..","kd..........","kd..........","kd..........","kkk........."],
crown:["............","k...k...k...","kyk.kyk.kyk.","kyykkyykkyyk","kyyyyyyyyyyk","kyRyyyByyyNk","kyyyyyyyyyyk","kmmmmmmmmmmk","kkkkkkkkkkkk","............","............","............"],
gem:["............","..kkkkkkkk..",".kCwCCCCCCk.","kCwCCCCCCCCk","kkkkkkkkkkkk",".kCCCCCCCCk.","..kCCCCCCk..","...kCCCCk...","....kCCk....",".....kk.....","............","............"],
bomb:[".........kk.","........kyk.",".......kk.o.","......kk....","...kkkkk....","..kddddkk...",".kdwddddkk..",".kddddddkk..",".kddddddkk..",".kddddddkk..","..kddddkk...","...kkkkk...."].map(function(r){return r.slice(0,12)}),
shield:["kkkkkkkkkkkk","kbbbbkkRRRRk","kbbbbkkRRRRk","kbbbbkkRRRRk","kkkkkkkkkkkk","kRRRRkkbbbbk","kRRRRkkbbbbk",".kRRRkkbbbk.","..kRRkkbbk..","...kRkkbk...","....kkkk....","............"],
potion:["....kkkk....","....kwwk....","....kwwk....","...kkwwkk...","..kPPPPPPk..",".kPPwPPPPPk.",".kPPwPPPPPk.",".kPPPPPPPPk.",".kPPPPPPPPk.","..kPPPPPPk..","...kkkkkk...","............"],
tree:["....kkkk....","..kknnnnkk..",".knnnNnnnnk.",".knnnnnnnNk.","kknnnnnnnnkk","knnNnnnnnnnk",".kknnnnnnkk.","...kknnkk...",".....kmk....",".....kmk....","....kmmk....","...kkkkkk..."],
castle:["k.k..kk..k.k","kkkk.kk.kkkk","kmmkkmmkkmmk","kmmmmmmmmmmk","kmmkmmmmkmmk","kmmmmkkmmmmk","kmmmmkkmmmmk","kmmmkkkkmmmk","kmmmkkkkmmmk","kmmmkkkkmmmk","kkkkkkkkkkkk","............"],
ufo:["....kkkk....","...kCCCCk...","..kCwCCCCk..","..kCCCCCCk..",".kkkkkkkkkk.","kgggggggggggk","kgyggyggyggk",".kkkkkkkkkk.","...k.kk.k...","..k..kk..k..",".k...kk...k.","............"].map(function(r){return r.slice(0,12)}),
dice:["............","kkkkkkkkkkk.","kwwwwwwwwwk.","kwkkwwwwkkk.","kwkkwwwwkkk.","kwwwwkkwwwk.","kwwwwkkwwwk.","kwkkwwwwkkk.","kwkkwwwwkkk.","kwwwwwwwwwk.","kkkkkkkkkkk.","............"],
cards:["............",".kkkkkkkk...",".kwwwwwwkkk.",".kwRwwwwkwk.",".kwwwwwwkwk.",".kwwRRwwkwk.",".kwwRRwwkwk.",".kwwwwwwkwk.",".kkkkkkkkkk.",".....kkkkkk.","............","............"].map(function(r){return r.slice(0,12)}),
ball:["...kkkkkk...","..kRRRRRRk..",".kRRwwRRRRk.","kRRwwRRRRRRk","kRRRRRRRRRRk","kkkkkkkkkkkk","kRRRRRRRRRRk","kRRRRRRRRRRk",".kRRRRRRRRk.","..kRRRRRRk..","...kkkkkk...","............"],
note:["....kkkkkkk.","....kPPPPPk.","....kk....k.","....k.....k.","....k.....k.","....k.....k.","..kkk...kkk.",".kPPPk.kPPPk",".kPPPk.kPPPk","..kkk...kkk.","............","............"].map(function(r){return r.slice(0,12)}),
clock:["...kkkkkk...","..kwwwwwwk..",".kwwwwkwwwk.","kwwwwwkwwwwk","kwwwwwkwwwwk","kwwwwwkkkwwk","kwwwwwwwwwwk","kwwwwwwwwwwk",".kwwwwwwwwk.","..kwwwwwwk..","...kkkkkk...","............"],
lock:["...kkkkkk...","..kggggggk..","..kg....gk..","..kg....gk..",".kkkkkkkkkk.",".kyyyyyyyyk.",".kyyykkyyyk.",".kyyykkyyyk.",".kyyyyyyyyk.",".kyyyyyyyyk.",".kkkkkkkkkk.","............"],
sun:["....k..k....","k...k..k...k",".k..kkkk..k.","..kkyyyykk..","..kyyyyyyk..","kkkyyyyyykkk","kkkyyyyyykkk","..kyyyyyyk..","..kkyyyykk..",".k..kkkk..k.","k...k..k...k","............"],
bolt:["....kkkkkk..","...kyyyyyk..","..kyyyyyk...",".kyyyyyk....","kyyyyyyyyk..","kkkkyyyyk...","...kyyyk....","...kyyk.....","..kyyk......","..kyk.......",".kyk........",".kk........."],
folder:["............","kkkkk.......","kyyyykkkkkk.","kyyyyyyyyykk","kyyyyyyyyyyk","kyyyyyyyyyyk","kyyyyyyyyyyk","kyyyyyyyyyyk","kyyyyyyyyyyk","kkkkkkkkkkkk","............","............"],
tv:["..k....k....",".k.k..k.k...","..kk..kk....","kkkkkkkkkkk.","kgggggggggkk","kgkkkkkkkgkk","kgkBBBBkgNkk","kgkBBBBkgRkk","kgkkkkkkgggk","kgggggggggkk","kkkkkkkkkkkk",".kk......kk."].map(function(r){return r.slice(0,12)}),
tape:["kkkkkkkkkkkk","kgggggggggkk","kgkkkkkkkgkk","kgkwkkkwkgkk","kgkkkkkkkgkk","kgggggggggkk","kgkgkkkgkgkk","kggkggggkgkk","kkkkkkkkkkkk","............","............","............"],
arcade:["..kkkkkkkk..",".kBBBBBBBBk.",".kBkkkkkkBk.",".kBkNkkkkBk.",".kBkkkkkkBk.",".kBBBBBBBBk.","kkddddddddkk","kdRddBddddkk","kddddddddddk","kdddddddddkk","kkkkkkkkkkk.","............"].map(function(r){return r.slice(0,12)}),
pda:["...kkkkkk...","..kddddddk..","..kdkkkkdk..","..kdkCCkdk..","..kdkCCkdk..","..kdkkkkdk..","..kddddddk..","..kdgddgdk..","..kddddddk..","..kddRddNdk.","...kkkkkk...","............"],
wheel:["...kkkkkk...","..kddddddk..",".kdd....ddk.","kdd..kk..ddk","kd...kk...dk","kdkkkkkkkkdk","kdd..kk..ddk",".kdd.kk.ddk.","..kdd.k.dk..","...kddddk...","....kkkk....","............"],
dpad:["............","....kkkk....","....kggk....",".kkkkggkkkk.",".kggggggggk.",".kggggggggk.",".kkkkggkkkk.","....kggk....","....kggk....","....kkkk....","............","............"].map(function(r){return r.slice(0,12)}),
vr:["............","kkkkkkkkkkkk","kddddddddddk","kdkkkkkkkkdk","kdkCCkkCCkdk","kdkCCkkCCkdk","kdkkkkkkkkdk","kdddkddkdddk","kkkkkkkkkkkk","............","............","............"],
monster:["..k......k..","...k....k...","..kkkkkkkk..",".kkNNkkNNkk.","kkNNNNNNNNkk","kNNkNNNNkNNk","kNNNNNNNNNNk","k.kkkkkkkk.k","k.k......k.k","...kk..kk...","............","............"],
dino:["......kkkk..",".....kNNNNk.",".....kNkNNk.",".....kNNNNk.","k...kNNkkkk.","kk.kNNNk....","kNNNNNNNk...","kNNNNNNNNk..",".kNNNNNNNk..","..kNNkkNNk..","..kk..kkk...","............"],
anchor:["....kkkk....","....kddk....","....kkkk....","...kkddkk...","....kddk....","..k.kddk.k..","..kkkddkkk..","kk..kddk..kk","kdk.kddk.kdk",".kddddddddk.","..kkkddkkk..","....kkkk...."].map(function(r){return r.slice(0,12)}),
smile:["...kkkkkk...","..kyyyyyyk..",".kyyyyyyyyk.","kyykkyykkyyk","kyykkyykkyyk","kyyyyyyyyyyk","kykyyyyyykyk","kyykkkkkkyyk",".kyyyyyyyyk.","..kyyyyyyk..","...kkkkkk...","............"],
bug:["..k......k..","...k.kk.k...","....kRRk....","..kkRRRRkk..","kkkRkRRkRkkk","..kRRRRRRk..","kkkRkRRkRkkk","..kRRRRRRk..","...kRRRRk...","..k.kkkk.k..",".k........k.","............"],
};
var PXN=Object.keys(PXG);
function px(name,size,title){var g=PXG[name]||PXG.chip,s=size||16,o='<svg class="px" viewBox="0 0 12 12" width="'+s+'" height="'+s+'" shape-rendering="crispEdges"'+(title?' role="img" aria-label="'+title.replace(/[<>&"]/g,"")+'"':' aria-hidden="true"')+' xmlns="http://www.w3.org/2000/svg">',y,x,run,c;
 for(y=0;y<12;y++){var row=(g[y]||"").padEnd(12,".");x=0;while(x<12){c=row[x];if(c==="."||!PXC[c]){x++;continue}run=1;while(x+run<12&&row[x+run]===c)run++;o+='<rect x="'+x+'" y="'+y+'" width="'+run+'" height="1" fill="'+PXC[c]+'"/>';x+=run}}
 return o+'</svg>'}
/* which glyph for what */
var PXKIND={hw:"tower",pe:"mouse",sw:"floppy",gt:"joystick",gn:"gamepad",gc:"smile",e:"bulb",m:"film",w:"globe",u:"flag",p:"tower",i:"star"};
var PXSUB=[[/mouse|trackball|tablet|input/i,"mouse"],[/keyboard/i,"keyboard"],[/controller|joystick|gamepad|wheel/i,"gamepad"],[/sound card/i,"card"],[/music|midi/i,"note"],[/speaker|headset|headphone/i,"headset"],[/graphics|video card/i,"chip"],[/monitor|display/i,"crt"],[/storage|drive|disk/i,"hdd"],[/memory|accelerator/i,"ram"],[/modem|network/i,"modem"],[/printer/i,"printer"],[/scanner|camera|webcam/i,"camera"],[/console accessory/i,"console"],[/interface|bus|usb/i,"usb"],[/expansion/i,"card"]];
var PXGENRE=[[/shoot|fps|combat|action/i,"bomb"],[/role|rpg|dungeon/i,"sword"],[/adventure|point/i,"key"],[/puzzle|logic/i,"dice"],[/rac|driving/i,"car"],[/flight|aviation|air/i,"plane"],[/sport|golf|football|baseball|soccer|basket|hockey/i,"ball"],[/strateg|wargame|4x|tactic/i,"castle"],[/simulat|tycoon|building|management/i,"gear"],[/horror|survival/i,"ghost"],[/platform|arcade/i,"coin"],[/fight/i,"shield"],[/space|sci/i,"rocket"],[/card|casino|board/i,"cards"],[/educat|learn|typing/i,"book"],[/music|rhythm/i,"note"],[/naval|submarine|pirate/i,"ship"],[/fantasy|magic/i,"potion"],[/stealth/i,"lock"],[/mmo|online/i,"globe"],[/pinball/i,"ball"],[/trivia|quiz/i,"bulb"],[/dino|monster/i,"dino"]];
var PXPLAT={pc:"tower",micro:"floppy",con:"console",hand:"handheld",arc:"coin",mob:"handheld",oth:"chip"};
var PXCAT=[[/laptop|notebook/i,"laptop"],[/desktop|computer|tower|pc/i,"tower"],[/sound/i,"card"],[/keyboard/i,"keyboard"],[/midi|music|synth/i,"note"],[/mouse/i,"mouse"],[/monitor|display/i,"crt"],[/storage|drive|disk/i,"hdd"],[/console/i,"console"],[/handheld|portable/i,"handheld"],[/modem|network/i,"modem"],[/printer/i,"printer"],[/scanner|camera/i,"camera"],[/joystick|controller|gamepad/i,"gamepad"],[/software|game/i,"cd"],[/cable|adapter|connector/i,"usb"],[/memory|ram/i,"ram"],[/cartridge/i,"cart"],[/book|manual|magazine/i,"book"],[/phone|pda/i,"phone"],[/video|tv/i,"tv"],[/arcade/i,"arcade"],[/other/i,"box"]];
function pxPick(tbl,s,def){s=String(s||"");for(var i=0;i<tbl.length;i++)if(tbl[i][0].test(s))return tbl[i][1];return def}
function pxOfRow(r,x){var k=r[1];if(k==="pe"){var e=typeof TLX!=="undefined"?TLX[r[2]]:null;return pxPick(PXSUB,e&&e.sub,"mouse")}
 if(k==="gt"||k==="gn"||k==="gc"){var g=typeof GX!=="undefined"?GX[r[2]]:null;return pxPick(PXGENRE,g&&g.g,PXKIND[k])}
 if(k==="hw"){var t=r[2],ex=typeof TLX!=="undefined"?TLX[t]:null;if(ex&&ex.type==="Console or handheld")return/handheld/i.test(ex.sub||"")?"handheld":"console";if(ex&&ex.type==="Processor")return"chip";if(ex&&ex.type==="Handheld computer")return"phone";if(ex&&ex.type==="Digital camera")return/mavica/i.test(ex.sub||"")?"mavica":"camera";if(ex&&ex.type==="Media player")return"ipod";if(ex&&(ex.type==="Phone"||ex.type==="Tablet"||ex.type==="Media player"||ex.type==="E-reader"))return"phone";return /laptop|notebook|libretto|thinkpad|powerbook/i.test(t)?"laptop":/game boy|gba|ds\b|psp|game gear|lynx|handheld/i.test(t)?"handheld":/playstation|nintendo|sega|xbox|dreamcast|saturn|genesis|famicom|nes\b|atari 2600|console|wii|gamecube/i.test(t)?"console":/phone|iphone|pda|palm/i.test(t)?"phone":/mac|apple|imac/i.test(t)?"crt":"tower"}
 if(k==="sw")return/windows|dos|os\/2|linux|operating|\bos\b/i.test(r[2])?"folder":/word|excel|office|works|lotus|spreadsheet/i.test(r[2])?"book":/photoshop|paint|draw|art|corel/i.test(r[2])?"star":/browser|netscape|internet|explorer|aol|mosaic|email|chat|icq|napster/i.test(r[2])?"globe":"floppy";
 if(k==="e")return/ipo|stock|acquir|buy|bought|merger/i.test(r[2])?"coin":/lawsuit|trial|court|convict|copyright|antitrust/i.test(r[2])?"lock":/launch|release|ships|introduc/i.test(r[2])?"rocket":/found|incorporat|formed/i.test(r[2])?"flag":/show|expo|comdex|faire|e3|conference/i.test(r[2])?"crown":"bulb";
 if(k==="w"||k==="u")return/war|attack|invasion|bomb|crisis|assassin|terror/i.test(r[2])?"bomb":/shuttle|space|moon|mars|apollo|challenger|rocket/i.test(r[2])?"rocket":/olympic|world cup|super bowl/i.test(r[2])?"trophy":/election|president|senate|congress|treaty|wall/i.test(r[2])?"flag":/earthquake|hurricane|storm|flood|volcano/i.test(r[2])?"bolt":/died|death|funeral/i.test(r[2])?"heart":k==="u"?"flag":"globe";
 if(k==="m")return/space|star|alien|trek|wars|matrix|tron|terminator|robot/i.test(r[2])?"ufo":/horror|scream|halloween|nightmare|ghost/i.test(r[2])?"ghost":/jurassic|dino/i.test(r[2])?"dino":/toy story|shrek|nemo|bug|pixar/i.test(r[2])?"bug":/pirate|titanic|ship/i.test(r[2])?"ship":"film";
 return PXKIND[k]||"star"}
/* the small icon for a timeline row ([date,kind,title,...]) */
function pxRow(r,size){return px(pxOfRow(r),size||16)}
function pxCat(cat,size){return px(pxPick(PXCAT,cat,"box"),size||16)}
function pxPlat(plat,size){var f=typeof gxFam==="function"?gxFam(plat):"oth";return px(PXPLAT[f]||"chip",size||12)}
function pxGenre(g,size){return px(pxPick(PXGENRE,g,"gamepad"),size||12)}

/* "Connie Ventional" (Connie for short), the museum's original mascot: a memory chip with a bob haircut, a bow and little pin legs.
   mascot(size, mood, skin) mood: happy, wow, oops. Skin (a color she wears) comes from the prize counter.
   She is animated with CSS (style.css, ".mascot" rules): she bobs, blinks, waves and wiggles her bow. Click or tap her and she says something.
   Animation stops for prefers-reduced-motion and for the site's Motion: off switch. */
var MEMSKINS={green:["#1f9d55","#0b4a28","#ffd54a","#7a3b1e","#ff5fa2"],blue:["#2f6fe0","#10306b","#ffd54a","#e8c34a","#ff5fa2"],gold:["#e0b030","#6b4d08","#ffffff","#3a2410","#d03030"],pink:["#e0509a","#6b1a45","#ffe8a0","#2a1a4a","#ffd54a"]};
var MASCOT_NAME="Connie Ventional";
var MASCOT_QUIPS=["Hi! I am Connie Ventional. I live in the first 640K.","Have you tried turning it off and on again?","I have 640K of personality. Okay, 639K. The rest is the BIOS.","Please do not touch my pins.","Insert disk 2 to continue.","Memory: 640K. Mood: excellent.","Did you save? You should save.","Ctrl+Alt+Del is not a hug.","Himem.sys says hi.","I am not a bug. I am a feature with legs."];
function mascot(size,mood,skin,cap){size=size||64;if(!skin){try{skin=(JSON.parse(localStorage.getItem("cm-prizes")||"{}")).skin}catch(e){}}var c=MEMSKINS[skin]||MEMSKINS.green,b=c[0],d=c[1],p=c[2],hr=c[3],bw=c[4],o='<svg class="mascot mc-'+(mood||"happy")+'" viewBox="0 0 24 24" width="'+size+'" height="'+size+'" shape-rendering="crispEdges" role="button" aria-label="'+MASCOT_NAME+', the museum mascot. Press for a tip."'+(size>=56?' tabindex="0"':"")+' xmlns="http://www.w3.org/2000/svg"><g class="mc-all">';
 function r(x,y,w,h,f){o+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+f+'"/>'}
 /* legs: little chip pins with shoes */
 o+='<g class="mc-legl">';r(8,19,1,3,p);r(7,22,3,1,d);o+='</g><g class="mc-legr">';r(15,19,1,3,p);r(14,22,3,1,d);o+='</g>';
 /* arms: pins on the sides with a hand each */
 o+='<g class="mc-arml">';r(2,11,3,1,p);r(1,10,2,3,"#ffe0c0");o+='</g><g class="mc-armr">';r(19,11,3,1,p);r(21,10,2,3,"#ffe0c0");o+='</g>';
 /* hair behind the chip */
 r(3,5,18,13,hr);
 /* the chip: dark outline, bright body, shine */
 r(4,6,16,13,d);r(5,7,14,11,b);r(5,7,14,1,"#ffffff44");
 /* gold edge contacts along the bottom, like a memory module */
 for(var k=6;k<=17;k+=2)if(k!==12)r(k,18,1,1,p);
 /* two little black chips on the board, like the ones on a RAM stick */
 r(5,16,3,2,"#1a1a1a");r(5,16,1,1,"#8a8a8a");r(16,16,3,2,"#1a1a1a");r(18,16,1,1,"#8a8a8a");
  /* fringe */
 r(3,3,18,4,hr);r(4,2,16,1,hr);r(5,7,5,1,hr);r(14,7,5,1,hr);r(9,7,6,1,hr);r(3,7,2,6,hr);r(19,7,2,6,hr);
 r(5,3,3,1,"#ffffff44");
 /* bow */
 o+='<g class="mc-bow">';r(15,0,3,3,bw);r(18,1,2,1,bw);r(17,1,1,1,"#fff");r(19,0,2,3,bw);o+='</g>';
 /* eyes with lashes */
 o+='<g class="mc-eyes">';
 if(mood==="oops"){r(6,10,3,1,"#fff");r(7,9,1,3,"#fff");r(14,10,3,1,"#fff");r(15,9,1,3,"#fff");r(6,10,3,1,"#000");r(14,10,3,1,"#000")}
 else if(mood==="wow"){r(6,9,3,4,"#fff");r(14,9,3,4,"#fff");r(7,10,1,2,"#000");r(15,10,1,2,"#000");r(5,8,1,1,d);r(17,8,1,1,d)}
 else{r(6,10,3,4,"#1a1030");r(14,10,3,4,"#1a1030");r(6,10,2,2,"#fff");r(14,10,2,2,"#fff");r(8,12,1,1,"#9fe8ff");r(16,12,1,1,"#9fe8ff");r(8,13,1,1,"#4a3a7a");r(16,13,1,1,"#4a3a7a");r(5,10,1,1,d);r(17,10,1,1,d)}
 o+='</g>';
 /* blush and lipstick */
 r(5,14,2,1,"#ff8aa8");r(16,14,2,1,"#ff8aa8");r(5,15,1,1,"#ff8aa855");r(17,15,1,1,"#ff8aa855");
 o+='<g class="mc-mouth">';
 if(mood==="oops"){r(9,16,5,1,"#c0143c");r(8,15,1,1,"#c0143c");r(14,15,1,1,"#c0143c")}
 else if(mood==="wow"){r(10,15,3,3,"#c0143c");r(11,16,1,1,"#40000e")}
 else{r(10,15,1,1,"#c0143c");r(11,16,2,1,"#c0143c");r(13,15,1,1,"#c0143c")}
 o+='</g></g>';o+='</svg>';if(cap)o='<span class="mc-wrap">'+o+'<span class="mc-cap"><b>'+MASCOT_NAME+'</b><small>RAM module &middot; 640K</small></span></span>';return o}
/* Click or tap Connie and she says a line, then hops. */
var MC_TIPS={journal:["It looks like you are admiring a repair. Would you like help? Drag the slider on a before and after photo.","Every job here has a date, a type and the parts that went in. The pile of capacitors is the real star."],catalog:["It looks like you are browsing the catalog. Would you like help? Try the More filters button, or just type in the search box.","Every exhibit gets a permanent label number. Matt sticks it on the shelf himself.","Tap the view button to switch between cards, a list and a grid."],item:["It looks like you are reading an exhibit page. Would you like help? The Quick facts box has the specs, and I have never once been wrong about specs.","If an exhibit has a manual, it is linked at the bottom. Matt collects those too."],timeline:["It looks like you are time traveling. Would you like help? Pick a year, then open any entry for the full story.","The timeline now has MegaZeux, MUDs and game makers. I am very proud."],about:["Click things on the workstation. Everything is clickable. Even the pager.","Matt has three young boys. Someday all of this is theirs. Please be kind to the cables."],start:["It looks like you are new here. Would you like help? Pick whichever mood sounds closest and I will take you there."],play:["Play a game, earn tickets, spend them on a new color for me. I look great in gold.","The Memory Maze has a memory chip with a bow in it. I wonder who that is."],maze:["Psst. There are two of me in the house. Find us and I will top up your memory."],prizes:["Spend your tickets on a new color for me. I will not be offended. Much."]};
function conWrap(h,mood){return'<div class="mc-empty">'+mascot(56,mood||"oops")+'<div class="mc-ebody">'+h+'</div></div>'}
function conW(h,mood){return conWrap(h,mood)}
var mcCur=null,mcTimer=0,mcType=0;
function mcRoute(){var h=(location.hash||"#/").replace(/^#\/?/,"").split("/")[0]||"home";return h==="hub"?"play":h}
function mcClose(){if(mcCur){var o=mcCur.bub;if(o&&o.parentNode)o.parentNode.removeChild(o);if(mcCur.svg)mcCur.svg.classList.remove("mc-talking");}clearInterval(mcType);clearTimeout(mcTimer);mcCur=null;window.removeEventListener("resize",mcPlace)}
function mcPlace(){if(!mcCur||!mcCur.svg||!document.body.contains(mcCur.svg)){mcClose();return}var b=mcCur.bub,sv=mcCur.svg,r=sv.getBoundingClientRect(),w=Math.min(300,window.innerWidth-16);b.style.maxWidth=w+"px";var bw=b.offsetWidth,bh=b.offsetHeight,x=Math.max(8,Math.min(r.left+r.width/2-bw/2,window.innerWidth-bw-8)),up=r.top-bh-14>=4;b.className="mc-bubble "+(up?"mc-up":"mc-dn");b.style.left=(x+window.scrollX)+"px";b.style.top=((up?r.top-bh-14:r.bottom+14)+window.scrollY)+"px";var tx=Math.max(14,Math.min(r.left+r.width/2-x,bw-26));b.style.setProperty("--tx",tx+"px")}
function mcFirst(t){t=String(t||"").replace(/\s+/g," ").trim();var m=t.match(/^.{20,170}?[.!?](\s|$)/);return m?m[0].trim():t.slice(0,160)}
function mcExplain(){try{var h=(location.hash||"#/").replace(/^#\/?/,"").split("/"),r=h[0]||"home",fd=typeof fmtDate==="function"?fmtDate:function(x){return x};
 if(r==="item"&&h[1]){var id=decodeURIComponent(h[1]),it=(typeof ITEMS!=="undefined"?ITEMS:[]).filter(function(x){return x.id===id})[0];
  if(it){var b=it.name+" is "+(it.type?"a "+String(it.type).toLowerCase()+" ":"an exhibit ")+(it.maker?"from "+it.maker:"")+(it.year?" ("+it.year+")":"")+".";if(it.msrp)b+=" Launch price: "+it.msrp+".";if(it.works)b+=" In the museum it is marked "+String(it.works).toLowerCase()+".";var tx=mcFirst(it.text||it.story||"");if(tx)b+=" "+tx;return b}}
 if(r==="timeline"&&h[2]&&typeof TL!=="undefined"){var tt=decodeURIComponent(h[2]),row=TL.filter(function(x){return x[2]===tt})[0];
  if(row){var b2=row[2]+" is on the timeline for "+fd(row[0])+".";if(row[3]&&row[3]!=="n/a")b2+=" Price: "+row[3]+".";var nt=mcFirst(row[4]);if(nt)b2+=" "+nt;if(!row[5])b2+=" (Matt has not confirmed this one against a source yet.)";return b2}}
 if(r==="timeline")return"This is the timeline: "+(typeof TL!=="undefined"?TL.length.toLocaleString("en-US"):"thousands of")+" entries from 1971 on. Pick a year, then open an entry. An asterisk means Matt could not confirm it yet.";
 if(r==="catalog")return"This is the catalog: "+(typeof ITEMS!=="undefined"?ITEMS.filter(function(x){return!x.draft}).length:"all the")+" museum pieces Matt actually owns. Open one for its specs, photos, repair journal and links to manuals.";
 if(r==="journal")return"This is the repair journal: every repair, clean and mod from the collection, with before and after photos where Matt took them.";
 var tips=MC_TIPS[r];if(tips&&tips.length)return tips[0]}catch(e){}
 return"I am not sure what this page is, but I would start with the catalog or the timeline. Both have a search box."}
function mcTour(){try{var items=(typeof ITEMS!=="undefined"?ITEMS:[]).filter(function(x){return!x.draft&&x.name}),tl=(typeof TL!=="undefined"?TL:[]).filter(function(x){return/^(hw|pe|gt|gn)$/.test(x[1])&&x[4]&&x[5]});
 if(items.length&&(!tl.length||Math.random()<0.4)){var it=items[Math.floor(Math.random()*items.length)];return{say:"Tour stop: the "+it.name+(it.year?" ("+it.year+")":"")+". Follow me!",go:"#/item/"+it.id}}
 if(tl.length){var r=tl[Math.floor(Math.random()*tl.length)];return{say:"Tour stop: "+r[2]+", "+String(r[0]).slice(0,4)+". "+mcFirst(r[4]),go:"#/timeline/"+String(r[0]).slice(0,4)+"/"+encodeURIComponent(r[2])}}}catch(e){}
 return{say:"I have nowhere to take you yet. Try the catalog!"}}
function mascotSay(svg,first){mcClose();var tips=(MC_TIPS[mcRoute()]||[]).concat(MASCOT_QUIPS),k=first?-1:(window.__mcI=(window.__mcI==null?0:window.__mcI+1)%tips.length),t=first?first:tips[k];
 var b=document.createElement("div");b.id="mcsay";b.className="mc-bubble";b.setAttribute("role","status");
 var p=document.createElement("p");b.appendChild(p);var bar=document.createElement("div");bar.className="mc-bb";var ex=document.createElement("button");ex.type="button";ex.textContent="What is this?";var tr=document.createElement("button");tr.type="button";tr.textContent="Surprise tour";bar.appendChild(ex);bar.appendChild(tr);var n=document.createElement("button");n.type="button";n.textContent="Another tip";var c=document.createElement("button");c.type="button";c.textContent="Thanks, Connie";bar.appendChild(n);bar.appendChild(c);b.appendChild(bar);
 var nm=document.createElement("small");nm.className="mc-nm";nm.textContent=MASCOT_NAME;b.insertBefore(nm,p);
 document.body.appendChild(b);mcCur={bub:b,svg:svg};
 var calm=document.documentElement.getAttribute("data-motion")==="off"||(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);
 function done(){svg.classList.remove("mc-talking");clearTimeout(mcTimer);mcTimer=setTimeout(mcClose,16000)}
 if(calm){p.textContent=t;done()}else{var i=0;svg.classList.add("mc-talking");p.textContent="";b.style.minWidth=Math.min(t.length*7.2+30,280)+"px";mcType=setInterval(function(){i+=1;p.textContent=t.slice(0,i);mcPlace();if(i>=t.length){clearInterval(mcType);done()}},24)}
 mcPlace();window.addEventListener("resize",mcPlace);
 ex.onclick=function(e){e.stopPropagation();mascotSay(svg,mcExplain())};tr.onclick=function(e){e.stopPropagation();var t=mcTour();mascotSay(svg,t.say);if(t.go)setTimeout(function(){if(mcCur)mcClose();location.hash=t.go},2600)};
 n.onclick=function(e){e.stopPropagation();mascotSay(svg)};c.onclick=function(e){e.stopPropagation();mcClose()};
 svg.classList.remove("mc-hop");void svg.getBoundingClientRect();svg.classList.add("mc-hop");setTimeout(function(){svg.classList.remove("mc-hop")},700)}
function mascotGreet(root){try{if(sessionStorage.getItem("cm-con-hi"))return;var sv=(root||document).querySelector("svg.mascot");if(!sv||+sv.getAttribute("width")<80)return;sessionStorage.setItem("cm-con-hi","1");setTimeout(function(){if(document.body.contains(sv)&&!mcCur)mascotSay(sv,"Hi! I am Connie Ventional, the memory chip with the bow. Click me any time for a tip.")},1100)}catch(e){}}
document.addEventListener("click",function(e){var m=e.target.closest&&e.target.closest("svg.mascot");if(m){mascotSay(m);return}if(mcCur&&!(e.target.closest&&e.target.closest("#mcsay")))mcClose()});
document.addEventListener("keydown",function(e){if(e.key==="Escape")mcClose();var m=e.target&&e.target.closest&&e.target.closest("svg.mascot");if(m&&(e.key==="Enter"||e.key===" ")){e.preventDefault();mascotSay(m)}});
window.addEventListener("hashchange",mcClose);
