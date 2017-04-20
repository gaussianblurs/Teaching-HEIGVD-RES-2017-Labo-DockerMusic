var protocol = {
    PROTOCOL_PORT: 41234,
    PROTOCOL_MULTICAST_ADDRESS: '236.10.0.1',
    instruments: {
        "piano": "ti-ta-ti",
        "trumpet": "pouet",
        "flute": "trulu",
        "Violin": "gzi-gzi",
        "drum": "boum-boum"
    }
};

/*
for (var property in protocol.instruments) {
    if (protocol.instruments.hasOwnProperty(property)) {
        console.log(property + " : " + protocol.instruments[property]);
    }
}
*/

var Chance = require('chance');

// We use a standard Node.js module to work with UDP
var dgram = require('dgram');
// Let's create a datagram socket. We will use it to send our UDP datagrams
var s = dgram.createSocket('udp4');

var arg = process.argv[2];

var sound = protocol.instruments[arg];
if(!sound) {
    console.log("Couldn't find instrument !");
    return -1;
}

var chance = new Chance();
var uuid = chance.guid();

var data = {
    "uuid": uuid,
    "instrument": arg,
    "activeSince": new Date().toJSON()
};

data = JSON.stringify(data);

function sendSound() {
    // Send the payload via UDP (multicast)
    s.send(data, 0, data.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function(err, bytes) {
        if(err) throw err;
        console.log("Sending payload: " + sound + " via port " + s.address().port);
    });
}

setInterval(sendSound, 1000);
