/* Circuit drawings redrawn by us (see schematic.js for the shape list). One entry per circuit: id, m (recap machine ids), t, w, h, els, parts [key, qty, name, note], how, opt, alt, by. */
var SCH=[
{id:"c64-saver",m:["c64"],t:"Commodore 64 Power Saver",w:506,h:292,
 els:[
 ["t",8,20,"From the power supply, +5 V","s"],["port",24,34],["w",24,40,48,40],["f",68,40,"1.5 A",{k:"fuse"}],["w",88,40,404,40],
 ["j",120,40],["j",194,40],["j",264,40],
 ["w",120,40,120,60],["r",120,80,"v","470 Ω",{k:"r470",s:"l"}],["w",120,100,120,115],["z",120,130,"u","4.7 V zener",{k:"zener",s:"l"}],["w",120,145,120,180],["j",120,160],["w",120,160,160,160],
 ["r",120,200,"v","470 Ω",{k:"r470",s:"l"}],["w",120,220,120,250],
 ["q",180,160,"npn","2N2222",{k:"q"}],["w",194,136,194,102],["r",194,82,"v","2.2 kΩ",{k:"r22",s:"l"}],["w",194,62,194,40],["w",194,127,230,127],["j",194,127],
 ["q",250,127,"npn","2N2222",{k:"q"}],["w",264,103,264,85],["d",264,70,"u","1N914",{k:"d",s:"l"}],["w",264,55,264,40],["w",264,92,302,92],["j",264,92],
 ["coil",318,66,"",{k:"relay"}],["t",312,112,"relay coil","s"],["j",302,40],["w",404,40,404,66],["sw",404,66,{k:"relay"}],
 ["box",364,132,98,106],
 ["w",388,106,388,140],["r",388,160,"v","470 Ω",{k:"rled",s:"l"}],["w",388,180,388,195],["led",388,210,"d","LED",{k:"led",s:"l"}],["w",388,225,388,250],
 ["w",436,106,436,140],["r",436,160,"v","470 Ω",{k:"rled",s:"r"}],["w",436,180,436,195],["led",436,210,"d","LED",{k:"led",s:"r"}],["w",436,225,436,250],
 ["j",436,122],["w",436,122,468,122,468,76],["port",468,70],["t",468,44,"+5 V out","m"],["t",468,56,"to the C64","m"],
 ["w",194,184,194,250],["w",264,151,264,250],["w",120,250,436,250],["j",194,250],["j",264,250],["j",388,250],["g",290,250],["j",290,250],
 ["t",364,284,"Shaded: optional status lights","m"]
 ],
 parts:[["relay","1","5 V relay, low power","Contacts rated 2 A or more."],["zener","1","4.7 V zener diode",""],["fuse","1","1.5 A fast-blow fuse",""],["r470","2","470 Ω resistor","The two in the sensing circuit."],["r22","1","2.2 kΩ resistor",""],["q","2","2N2222 or 2N3904 transistor","NPN."],["d","1","1N914 diode","Across the relay coil."],["led","2","LED (optional)","Status lights."],["rled","2","Resistor for each LED (optional)","The drawing shows 470 Ω. Values vary with the LED."]],
 how:"Fuse first, then the sensing circuit. While the supply is at 5 V the zener stays off, so the first transistor is off and the 2.2 kΩ resistor holds the second one on. That keeps the relay pulled in and the computer powered. If the supply climbs past roughly 5.3 V (the zener's 4.7 V plus the transistor's own drop), the zener conducts, the first transistor switches on, the second one switches off and the relay lets go, which cuts the computer off. The diode across the coil takes the kick when it switches off. That is our reading of the drawing, so check it against Console5's page before you build it.",
 opt:"The shaded lights are optional. By our reading, the left one lights when the relay has let go and the right one when the computer is powered.",
 alt:"A fuse feeds the 5 volt rail. A zener diode and two resistors sense a high voltage and drive two transistors that hold a relay on. The relay connects the rail to the computer and drops out if the rail goes too high.",
 by:"Circuit by Ray Carlsen. Redrawn by us from the drawing on Console5."}
];
