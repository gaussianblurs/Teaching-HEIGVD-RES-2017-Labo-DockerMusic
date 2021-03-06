var protocol = {
    PROTOCOL_PORT: 41234,
    PROTOCOL_MULTICAST_ADDRESS: '239.10.0.1',
    TCP_PORT: 2205,
    instruments: {
        "piano": "ti-ta-ti",
        "trumpet": "pouet",
        "flute": "trulu",
        "violin": "gzi-gzi",
        "drum": "boum-boum"
    }
};

var net = require('net');
// We use a standard Node.js module to work with UDP
var dgram = require('dgram');
// Let's create a datagram socket. We will use it to listen for datagrams published in the
// multicast group by thermometers and containing measures
var s = dgram.createSocket('udp4');

s.bind(protocol.PROTOCOL_PORT, function(err, msg) {
    console.log("Joining multicast group");
    s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

var musicianMap = new Map();
var lastActivityMap = new Map();

// This call back is invoked when a new datagram has arrived.
s.on('message', function(msg, source) {
    var data = JSON.parse(msg);

    var instrument = "undefined";
    for (var property in protocol.instruments) {
        if (protocol.instruments.hasOwnProperty(property)) {
            if(protocol.instruments[property] == data.sound) {
                instrument = property;
            }
        }
    }

    var musician = {
        "uuid": data.uuid,
        "instrument": instrument,
        "activeSince": data.activeSince
    };

    lastActivityMap.set(musician.uuid, new Date());
    if(!musicianMap.has(musician.uuid)) musicianMap.set(data.uuid, musician);
    console.log("Data has arrived: " + musician.uuid + ". Source IP: " + source.address + ". Source port: " + source.port);
});

s.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    s.close();
});

s.on('listening', () => {
    var address = s.address();
    console.log(`server listening ${address.address}:${address.port}`);
});

var server = net.createServer(function(socket) {
    console.log("New connection")
    var data = [];
    var now = new Date();
    var value;
    for (value of lastActivityMap) {
        var date = value[1];
        if(new Date().getTime() - date.getTime() <= 5000) {
            data.push(musicianMap.get(value[0]));
        }
    }
    socket.write(JSON.stringify(data));
    socket.end();
});


server.listen(protocol.TCP_PORT);
