const net = require('net');
const Buffer = require('buffer').Buffer;
const message = require('./message');
const tracker = require('./tracker.js')

module.exports = torrent => {
    tracker.getPeers(torrent, peers => {
        peers.forEach((peer) => {
            download(peer, torrent)
            console.log(`peer: ${peer.ip}, ${peer.port}`)
        });
    });
};

function download(peer, torrent) {
    const socket = new net.Socket();
    socket.on('error', console.log);
    socket.connect(peer.port, peer.ip, () => {
        socket.write(message.buildHandshake(torrent));
    });
    onWholeMsg(socket, msg => msgHandler(msg, socket));
}

function onWholeMsg(socket, callback) {
    let savedBuf = Buffer.alloc(0);
    let handshake = true;

    socket.on('data', recvBuf => {
        // msgLen calculates the length of a whole message
        const msgLen = () => handshake ? savedBuf.readUInt8(0) + 49 : savedBuf.readInt32BE(0) + 4;
        savedBuf = Buffer.concat([savedBuf, recvBuf]);

        while (savedBuf.length >= 4 && savedBuf.length >= msgLen()) {
            callback(savedBuf.slice(0, msgLen()));
            savedBuf = savedBuf.slice(msgLen());
            handshake = false;
        }
    });
}

function msgHandler(msg, socket) {
    if (isHandshake(msg)) {
        socket.write(message.buildInterested());
    }
    else{
        // console.log(`Message length is : ${msg.length} message id is ${msg.readInt8(4)}`)
        const m = message.parse(msg)
        if(m.id === 0 ){
            console.log('Choke message Sent')
            // chokeHandler();
        }
        if(m.id === 1 ){
            console.log('Unchoke message sent')
            // unchokeHandler()
        }
        if(m.id === 2 ){
            console.log('Interested message sent')
        }
        if(m.id === 3){
            console.log('Not intersted message sent')
        }
        if(m.id === 4 ){
            console.log('Have message sent')
            // haveHandler(m.payload);
        }
        if(m.id === 5 ){
            console.log('Bitfield message sent')
            console.log(m.payload.toString('hex'))
            // bitfieldHandler(m.payload);
        }
        if(m.id === 6 ){
            console.log('Request message sent')
        }
        if(m.id === 7 ){
            console.log('Piece message sent')
            // pieceHandler(m.payload);
        }
        if(m.id === 8 ){
            console.log('Cancel message sent')
        }
    }
}

function isHandshake(msg) {
    return msg.length === msg.readUInt8(0) + 49 &&
        msg.toString('utf8', 1, 20) === 'BitTorrent protocol';
}