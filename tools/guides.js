/* Buyer guides for the static search pages (read by tools/build-seo.js).
   Each guide: slug, title, desc, lead, quip (Connie), sections [{h, intro, picks, tips}], skip [..], links [timeline entry names].
   Each pick: n (name), t (what it is), w (why it makes the cut), s (skip or watch-out, optional), a (Amazon search), e (eBay search).
   Rules for picks: brand-name, well reviewed, and recommended again and again by repair benches and retro forums. No prices are shown.
   Searches only; the links never point at one seller's listing. */
const UPDATED="2026-10-02";


/* Expensive things come in three levels: top shelf, the sweet spot and a value pick. */
const TIERS={
 meter:{n:"Multimeter",t:"Pick your level",w:"Checks battery voltage, tests continuity and tells you when a power supply is fibbing. Buy Fluke at any level, because a meter with no safety rating is a bad bargain.",tiers:[
  {l:"Top shelf",n:"Fluke 87V",w:"The bench legend. Rugged, accurate and True-RMS, it will outlast every machine you test with it.",a:"Fluke 87V digital multimeter"},
  {l:"The sweet spot",n:"Fluke 117",w:"Auto-ranging, True-RMS and a built-in non-contact voltage detector. Everything a retro bench needs.",a:"Fluke 117 electrician multimeter"},
  {l:"Value pick",n:"Fluke 101",w:"A pocket-size Fluke for the basics: voltage, continuity and capacitance. Still a real Fluke.",a:"Fluke 101 digital multimeter"}]},
 iron:{n:"Soldering station",t:"Pick your level",w:"Replacing a battery or a capacitor means soldering. Hakko is the bench standard, and these are the models to look at.",tiers:[
  {l:"Top shelf",n:"Hakko FX-951",w:"Fast heating, rock-steady temperature and the popular T12 tips. If you want the best, this is the one.",a:"Hakko FX-951 soldering station"},
  {l:"The sweet spot",n:"Hakko FX-888DX",w:"The classic, loved bench station: adjustable, accurate and tips are easy to find.",a:"Hakko FX-888DX soldering station"},
  {l:"Value pick",n:"Pinecil",w:"A pocket USB-C iron with open firmware and a loyal following. Not a Hakko, but the budget pick the community trusts.",a:"Pinecil soldering iron",e:"Pinecil soldering iron"}]},
 desolder:{n:"Desoldering tool",t:"Pick your level",w:"Removing an old component without lifting a pad is half the battle, and it matters on boards you cannot replace.",tiers:[
  {l:"Top shelf",n:"Hakko FR-300",w:"The proper desoldering gun with its own pump. It lifts through-hole parts out cleanly without cooking the pad.",a:"Hakko FR-300 desoldering tool"},
  {l:"The sweet spot",n:"Hakko 808",w:"A classic manual desoldering tool from Hakko. Strong suction, simple and long-lived.",a:"Hakko 808 desoldering tool"},
  {l:"Value pick",n:"Engineer SS-02",w:"A well-made desoldering pump that does the job for very little money. A beginner favorite.",a:"Engineer SS-02 desoldering pump"}]},
 sound:{n:"Real sound module",t:"Pick your level",w:"Some of the best game music ever written was composed for one specific box. Used units sell for real money, so check listings carefully.",tiers:[
  {l:"Top shelf",n:"Roland MT-32",w:"The original. Sierra and LucasArts wrote their music for it, and nothing else sounds quite the same.",e:"Roland MT-32"},
  {l:"The sweet spot",n:"Roland SC-55 or SC-55mkII",w:"The General MIDI sound that many later DOS games target. A little easier to find than an MT-32.",e:"Roland SC-55"},
  {l:"Value pick",n:"Free software emulators",w:"A modern PC can emulate these modules for nothing, and it sounds close. A good way to try before you spend."}]},
 scaler:{n:"Video scaler",t:"Pick your level",w:"If you play on real hardware or old consoles, a good scaler turns the picture into something sharp on a modern TV. Buy from the maker or a known retailer, and check the seller.",tiers:[
  {l:"Top shelf",n:"RetroTINK-4K",w:"The high-end scaler loved across the retro community. The picture it makes is the reason people wait in line.",a:"RetroTINK-4K"},
  {l:"The sweet spot",n:"RetroTINK-5X Pro",w:"Clean, low-lag video and a big following. A step down in price from the 4K, without a step down in quality.",a:"RetroTINK-5X Pro"},
  {l:"Value pick",n:"Open Source Scan Converter (OSSC)",w:"An open-source favorite for clean, low-lag video from older machines. It rewards a little tinkering.",a:"Open Source Scan Converter OSSC"}]}
};

const GUIDES=[
{
 slug:"retro-pc-starter-kit",
 title:"Retro PC starter kit: the gear worth buying",
 desc:"Got a beige box from the 80s or 90s? The short list of tools, storage and accessories the retro community actually recommends, and what to skip.",
 h1:"Retro PC starter kit: the gear worth buying",
 lead:"You found a beige box at a garage sale. Congratulations, you now own a project. Here is the short list of gear that is worth the money, and the stuff that is not.",
 quip:"Rule one of vintage computers: it will not work the first time. Rule two: that is the fun part.",
 links:["IBM PC (5150)","IBM PC/AT","Intel 80486DX","Intel Pentium","MS-DOS 6.22","Windows 95","IBM Model M keyboard","CompactFlash"],
 sections:[
  {h:"The bench basics",
   intro:"Before you power anything on, get a few tools that make the job safe and pleasant.",
   picks:[
    {n:"iFixit Pro Tech Toolkit",t:"Screwdriver set",w:"A good driver and the bits old cases love (Phillips, Torx, hex, security bits), plus the plastic openers that save your fingernails and your cases.",a:"iFixit Pro Tech Toolkit"},
    {tier:"meter"},
    {n:"A soldering kit",t:"Hakko, Kester and MG Chemicals",w:"The moment you own a vintage machine you will want to replace a battery or a capacitor. Our repair guide has the full kit: a Hakko station and cutters, Kester solder and MG Chemicals flux.",g:"fix-a-dead-vintage-computer"},
    {n:"DeoxIT D5 contact cleaner",t:"Contact cleaner",w:"The stuff the retro world reaches for when a slot, socket or edge connector is scratchy. Pair it with 99% isopropyl alcohol and a soft brush.",a:"DeoxIT D5 contact cleaner"},
    {n:"99% isopropyl alcohol",t:"Cleaner",w:"Cleans flux, grime and thirty years of dust without leaving water behind. The 70% kind is mostly water, so look for 99%.",a:"99% isopropyl alcohol"}
   ]},
  {h:"Storage that outlasts the original",
   intro:"Old hard drives die. Floppies rot. These picks let a 30-year-old machine keep going without stress.",
   picks:[
    {n:"CompactFlash card and IDE adapter",t:"Hard drive replacement",w:"A CompactFlash card in a 40 pin IDE adapter acts as a hard disk on most 486 and Pentium machines. Keep the card small (a few gigabytes is plenty) because old BIOSes get confused by big drives.",s:"Adapters are all alike, so pick one with good recent reviews. Use an industrial-grade card from Delkin or Transcend, not a mystery card.",a:"CompactFlash to 40 pin IDE adapter",e:"CompactFlash to IDE adapter"},
    {n:"Gotek floppy emulator with FlashFloppy firmware",t:"Floppy drive that reads a USB stick",w:"A Gotek swaps a flaky floppy drive for a USB stick full of disk images. The free, open-source FlashFloppy firmware is the community standard, so plan to flash it if yours ships with something else.",s:"Some units ship with odd firmware. Check the listing, then flash FlashFloppy. For a premium option, look at the HxC Floppy Emulator.",a:"Gotek floppy drive emulator USB",e:"Gotek floppy emulator"},
    {n:"Greaseweazle",t:"Floppy disk imager",w:"An open hardware board that reads and writes real floppies on a modern PC, down to the magnetic flux, so you can rescue and keep your old disks before they go.",s:"Skip the cheap USB floppy readers for this job. Many old formats are beyond them.",a:"Greaseweazle floppy",e:"Greaseweazle"},
    {n:"ZuluSCSI or SCSI2SD",t:"SCSI hard drive replacement",w:"If your machine is a Mac, Amiga or other SCSI system, these SD card based adapters take over from a dying SCSI disk and are loved across the community.",a:"ZuluSCSI",e:"ZuluSCSI SCSI2SD"}
   ]},
  {h:"Typing and clicking",
   intro:"Nothing says 1990s like the sound of a real keyboard.",
   picks:[
    {n:"Unicomp New Model M",t:"Buckling spring keyboard",w:"Unicomp took over the original IBM tooling, so the new Model M keeps the buckling springs and the heavy, loud, glorious feel. Get the PS/2 version for a vintage PC and the USB version for your modern desk.",a:"Unicomp New Model M keyboard",e:"IBM Model M keyboard"}
   ]},
  {h:"Power and reading",
   intro:"Two small things that save big headaches.",
   picks:[
    {n:"A good surge protector",t:"APC or Tripp Lite",w:"A 30-year-old machine with an aging power supply should not be plugged straight into the wall. Pick an APC or Tripp Lite protector with a switch, so you can turn it all off at once.",a:"APC surge protector"},
    {n:"Upgrading and Repairing PCs (Scott Mueller)",t:"Reference book",w:"The long-running reference for how PCs fit together, from the 8088 onward. Older editions cover the machines you actually own.",a:"Upgrading and Repairing PCs Scott Mueller",e:"Upgrading and Repairing PCs Scott Mueller"}
   ]}
 ],
 skip:[
  "Bags of mixed capacitors from no-name sellers. Buy a known brand, in the exact value your board needs.",
  "Cheap USB floppy readers for rescuing old disks. Use a Greaseweazle, or a Gotek for just playing disks.",
  "Machines sold without a photo of the motherboard battery area. That is where the nasty surprises live.",
  "Anything with a thousand five-star reviews and no brand. Retro gear is a small market, so the good stuff has a name behind it."
 ]
},
{
 slug:"fix-a-dead-vintage-computer",
 title:"How to fix a dead vintage computer, step by step",
 desc:"A dead vintage computer is usually a dead battery, a bad capacitor or a dirty slot. Our step-by-step guide, plus the tools repair benches trust.",
 h1:"How to fix a dead vintage computer",
 lead:"It sat in a basement for twenty years and now it will not turn on. Do not panic, do not plug it in yet, and do not open the monitor. Most dead machines have one of five problems, and four of them are cheap to fix.",
 quip:"If the computer smells like a swimming pool, the battery leaked. If it smells like toast, unplug it. Right now.",
 links:["Commodore Amiga 500","Macintosh SE/30","Apple Macintosh SE","Atari 520ST","IBM PC/AT","Intel 80486DX","Commodore 64","Apple II"],
 safety:"Safety first: CRT monitors and old power supplies can hold a dangerous charge long after they are unplugged, so leave them closed unless you know how to discharge them. Work with leaded solder in a ventilated room and wash your hands afterward. Touch bare metal before you touch a board, or wear a wrist strap.",
 steps:[
  ["Look before you plug in","Open the case and look. White or green crust, a sour smell or a dark stain means a battery or capacitor has leaked. Fix that first, because power on a corroded board only makes things worse."],
  ["Deal with the battery","Many late 1980s and 1990s motherboards, Amigas and Macs carry a soldered battery that leaks as it ages. Remove it, neutralize the crust with white vinegar on a swab, then clean with 99% isopropyl alcohol and a soft brush. Replace it with a battery holder, and check your board's manual for the right voltage."],
  ["Check the capacitors","Aluminum electrolytic capacitors dry out or leak with age. Look for bulging tops, brown crust, or capacitors that sit lopsided. Some machines, such as the Amiga 500, Mac SE/30 and Atari ST, are well known for needing a recap."],
  ["Clean the contacts","Pull and reseat every card and RAM stick. Wipe edge connectors with isopropyl alcohol, then use DeoxIT on sockets and slots. A surprising number of dead computers are just dirty."],
  ["Test the power","With a multimeter, check the supply's voltages on the connector. If it is out of range, swap it, because a bad power supply can take parts with it."],
  ["Listen for clues","A PC beeps in patterns when it cannot start, and a POST card shows a code. Your BIOS maker's code list tells you which part is failing."],
  ["Start small","Boot with the bare minimum: board, power, video, one RAM stick. Add parts back one at a time until the problem returns. That is how you find the culprit."]
 ],
 sections:[
  {h:"Soldering",
   intro:"Replacing a battery or a capacitor means soldering. It is a skill you can learn in an afternoon, and these are the tools the repair community trusts.",
   picks:[
    {tier:"iron"},
    {n:"Hakko CHP-170 micro cutters",t:"Flush cutters",w:"Clean, flush cuts on component leads, and they stay sharp. Repair benches reach for Hakko cutters for a reason.",a:"Hakko CHP-170 flush cutters"},
    {n:"Kester 44 63/37 solder",t:"Rosin core solder",w:"Leaded 63/37 solder melts cleanly and flows nicely, which is why it is the standard for beginners and veterans alike. Stick with Kester and skip the unmarked spools.",s:"Leaded solder: ventilate and wash your hands afterward.",a:"Kester 44 63/37 solder"},
    {n:"MG Chemicals flux",t:"Flux",w:"Flux makes solder flow where you want it, and MG Chemicals is a trusted name for it. Get a flux pen or a no-clean liquid, and clean up with 99% isopropyl alcohol.",a:"MG Chemicals flux"}
   ]},
  {h:"Taking parts off",
   intro:"Removing an old component without lifting a pad is half the battle.",
   picks:[
    {n:"Chemtronics Chem-Wik braid",t:"Desoldering braid",w:"Pulls leftover solder off a pad. Cheap, and it will save a board.",a:"Chemtronics Chem-Wik desoldering braid"},
    {tier:"desolder"},
    {n:"PanaVise Jr. 201",t:"Board holder",w:"Holds the board steady so both hands are free. Few tools are as useful for the money.",a:"PanaVise Jr 201 circuit board holder"}
   ]},
  {h:"Finding the fault",
   intro:"Diagnostics tell you where to look.",
   picks:[
    {tier:"meter"}
   ]},
  {h:"Replacement parts",
   intro:"Buy known brands in the exact value your board needs.",
   picks:[
    {n:"Capacitor recap kits for popular machines",t:"Amiga, Mac SE/30, Atari and more",w:"Sellers pre-assemble the right values for popular machines. Look for kits that name the brand (Panasonic, Nichicon, Rubycon or Kemet) and the machine.",s:"Match capacitance, voltage and polarity if you buy loose parts.",a:"Amiga 500 recap kit",e:"Amiga 500 recap kit"},
    {n:"Make: Electronics (Charles Platt)",t:"Book",w:"A friendly, hands-on way to learn what the parts do. A favorite among people who start with a dead machine and get hooked.",a:"Make: Electronics Charles Platt"}
   ]}
 ],
 skip:[
  "Opening a CRT monitor or a power supply without learning how to discharge it.",
  "Powering on a machine with a leaked battery to \"see if it works\".",
  "Mixed capacitor bags with no brand and no values.",
  "Cheap irons with no temperature control. They lift pads and ruin boards.",
  "Unmarked solder and flux. Stick with Kester solder and MG Chemicals flux."
 ]
},
{
 slug:"play-old-pc-games-on-modern-gear",
 title:"How to play old PC games today: gear and setups",
 desc:"Want to play DOS and Windows 95 games today? Your options: emulators, real retro hardware and FPGA, and the controllers, sound and displays that help.",
 h1:"How to play old PC games today",
 lead:"The games are older than some of your coworkers, and they are still good. There are three ways to play them, and each has a few pieces of gear worth owning.",
 quip:"Yes, you can play Doom on a fridge. Please do not make me prove it.",
 links:["Doom","Descent","Myst","Sound Blaster 16","Roland MT-32","Gravis UltraSound","Windows 95"],
 paths:[
  ["The easy way: emulators","Use a modern PC and free software. DOSBox-Staging and ScummVM handle DOS and adventure games, and 86Box or PCem can run Windows 95 and 98 era games. Buy legal copies of the games from stores such as GOG, which sell DOS classics ready to run."],
  ["The real thing: retro hardware","Build or restore a real 486 or Pentium PC, sound card and all. It is more work and more fun. See our starter kit and repair guides."],
  ["The clever way: FPGA","MiSTer FPGA recreates old hardware in a chip, with great accuracy. The community wiki lists trusted sellers."]
 ],
 sections:[
  {h:"Controllers",
   intro:"Keyboard and mouse are fine, but a good controller or stick makes older games feel right.",
   picks:[
    {n:"8BitDo Pro 2",t:"Gamepad",w:"A well-reviewed pad that connects by USB cable or Bluetooth, with a nice D-pad and software remapping. A community favorite for retro games on a modern PC.",a:"8BitDo Pro 2 controller"},
    {n:"Thrustmaster T.16000M FCS",t:"Flight stick",w:"A precise, well-reviewed stick for flight sims and space combat, from Wing Commander to modern remakes.",a:"Thrustmaster T.16000M FCS joystick"},
    {n:"Gravis PC GamePad",t:"Real hardware gamepad",w:"The classic 1990s PC gamepad, for people building a period-correct machine. Condition varies, so look for good photos.",e:"Gravis PC GamePad"}
   ]},
  {h:"Sound",
   intro:"Some of the best game music ever written was composed for a specific box.",
   picks:[
    {tier:"sound"},
    {n:"Roland UM-ONE",t:"USB MIDI interface",w:"A small, trusted USB to MIDI cable. It connects a real module to a modern PC.",a:"Roland UM-ONE MIDI interface"},
    {n:"Sound Blaster 16",t:"Period sound card",w:"For a real retro PC, a Sound Blaster is the safe bet, and the 16 is a sweet spot for DOS and early Windows games.",e:"Sound Blaster 16 ISA"}
   ]},
  {h:"Displays",
   intro:"If you play on real hardware or consoles, a good scaler helps.",
   picks:[
    {tier:"scaler"},
   ]},
  {h:"Saving your disks",
   intro:"The best way to keep a game is to image the disk before the disk goes.",
   picks:[
    {n:"Greaseweazle",t:"Floppy disk imager",w:"Reads real floppies on a modern PC. See the starter kit.",a:"Greaseweazle floppy",e:"Greaseweazle"},
    {n:"Masters of Doom (David Kushner)",t:"Book",w:"The story of id Software, Doom and two very different friends. Still the best read in the genre.",a:"Masters of Doom David Kushner"}
   ]}
 ],
 skip:[
  "Unbranded \"retro\" USB gamepads with a thousand reviews and no brand name.",
  "Cheap VGA to HDMI boxes that add lag and wobble. A good scaler is worth the wait.",
  "ROM and disk image sites. Buy legal copies, so the people who made them can make more."
 ]
}
];

module.exports={GUIDES,TIERS,UPDATED};
