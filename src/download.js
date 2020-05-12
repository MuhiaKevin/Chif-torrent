const net = require('net');
const Buffer = require('buffer').Buffer;
const message = require('./message');
const tracker = require('./tracker.js')

module.exports = torrent => {
    tracker.getPeers(torrent, peers => {
        peers.forEach(peer => {
            download(peer, torrent)
            console.log(`peer: ${peer.ip}, ${peer.port}`)
        });

    })
};

function download(peer, torrent) {
    const socket = net.Socket();
    socket.on('error', console.log);
    socket.connect(peer.port, peer.ip, () => {
        socket.write(message.buildHandshake(torrent));

    });

    onWholeMsg(socket, msg => {
        // handle response here
        msgHandler(msg, socket)
    });
}

// this function handles the posibblity of there not being whole messages

function onWholeMsg(socket, callback) {
    let savedBuf = Buffer.alloc(0); // allocate some buffer 
    let handshake = true;

    socket.on('data', recvBuf => {
        const msgLen = () => handshake ? savedBuf.readUInt8(0) + 49 : savedBuf.readInt32BE(0) + 4;
        savedBuf = Buffer.concat([savedBuf, recvBuf]);

        while (savedBuf.length >= 4 && savedBuf.length >= msgLen()) {
            callback(savedBuf.slice(0, msgLen()));
            savedBuf = savedBuf.slice(msgLen());
            handshake = false;
        }
    })
}

// check if message is a handshake then return send and interested message
function msgHandler(msg, socket) {
    if (isHandshake(msg)) {
        console.log(msg)
        socket.write(message.buildInterested());
    }
}

// check if message is a handshake then return true and false for otherwise
function isHandshake(msg) {
    return msg.length === msg.readUInt8(0) + 49 &&
        msg.toString('utf8', 1, 20) === 'BitTorrent protocol';
}