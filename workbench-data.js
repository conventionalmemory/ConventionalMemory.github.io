// Tools and supplies Matt uses at the bench, shown on #/workbench with affiliate links.
// WB_PHOTO: a picture of the bench. Save it in this folder (for example portraits/workbench.jpg) and put the path here.
// Each tool: {n:"name", g:"group", why:"one line on how it gets used", q:"what to search for", asin:"optional Amazon product code", draft:true}
//   q   : the search words the Amazon and eBay links use (a brand and model works best)
//   asin: 10 character Amazon product code; the Amazon link then goes straight to that product
//   draft:true hides the tool from visitors (staff still see it). 
var WB_PHOTO="";
var WB_INTRO="Where the repairs happen. These are the tools and supplies I actually reach for. Some links are affiliate links, which cost you nothing and help keep the museum going.";
var WB_TOOLS=[
{n:"Temperature-controlled soldering station",g:"Soldering",why:"Reflowing joints, replacing leaking capacitors, fixing broken connectors.",q:"Hakko FX-888D soldering station",draft:true},
{n:"Desoldering pump and wick",g:"Soldering",why:"Clearing old solder before a part comes out.",q:"desoldering pump and solder wick",draft:true},
{n:"Flux and leaded solder",g:"Soldering",why:"Makes old boards easier to work on.",q:"rosin flux pen and 63/37 solder",draft:true},
{n:"Digital multimeter",g:"Testing",why:"Continuity, voltages, and finding the dead rail.",q:"digital multimeter auto ranging",draft:true},
{n:"Bench power supply",g:"Testing",why:"Powering a board safely when the original adapter is lost or suspect.",q:"adjustable bench power supply 30V 10A",draft:true},
{n:"Dim bulb tester",g:"Testing",why:"Limits current when a dead machine is plugged in for the first time.",q:"dim bulb tester",draft:true},
{n:"Precision screwdriver set",g:"Opening cases",why:"Tiny Phillips, Torx and security bits for laptops and handhelds.",q:"precision screwdriver set with tri-wing",draft:true},
{n:"Plastic spudgers and opening picks",g:"Opening cases",why:"Cracks open old plastic cases without cracking the plastic.",q:"plastic spudger opening tool kit",draft:true},
{n:"99% isopropyl alcohol",g:"Cleaning",why:"Board cleaning, flux removal, contacts.",q:"99% isopropyl alcohol",draft:true},
{n:"Contact cleaner",g:"Cleaning",why:"Cartridges, sockets, switches and edge connectors.",q:"DeoxIT D5 contact cleaner",draft:true},
{n:"Soft brushes and swabs",g:"Cleaning",why:"Getting decades of dust off boards and keyboards.",q:"anti static brush and foam swabs",draft:true},
{n:"CompactFlash and IDE adapters",g:"Storage",why:"Replacing dying hard drives in old laptops.",q:"IDE to CompactFlash adapter",draft:true},
{n:"Gotek floppy emulator",g:"Storage",why:"Moves files to machines that only know floppies.",q:"Gotek floppy drive emulator",draft:true},
{n:"USB floppy drive",g:"Storage",why:"Reads and writes real floppies from a modern computer.",q:"USB 3.5 inch floppy disk drive",draft:true},
{n:"CMOS and clock batteries",g:"Parts I keep on hand",why:"The most common repair on anything from the 90s.",q:"CR2032 battery 3V assorted CMOS",draft:true},
{n:"Capacitor assortment",g:"Parts I keep on hand",why:"For recapping old boards.",q:"electrolytic capacitor assortment kit",draft:true}
];
