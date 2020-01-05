const net = require('net');
const Buffer = require('buffer').Buffer;
const tracker = require('./tracker');
const message = require('./message')


module.exports = torrent => {
    tracker.getPeers(torrent, peers => {
        peers.forEach(download);
    });
};

function download(peer) {
    // create client socket
    const socket = new net.Socket();

    socket.on('error', console.log); // catch errors when connection to peers fail

    socket.connect(peer.port, peer.ip, function () {
        // socket.write() // write message to peer 
        socket.write(message.buildHandshake(torrent));
    });

    onWholeMsg(socket, msg => msgHandler(msg, socket));

}

function onWholeMsg(socket, callback) {
    let savedbuf = Buffer.alloc(0);
    let handshake = true;

    const msgLen = () => handshake ? savedbuf.readUInt8(0) + 49 : savedbuf.readInt32BE(0) + 4;

    while (savedbuf.length >= 4 && savedbuf.length >= msgLen()) {
        callback(savedbuf.slice(0, msgLen()));
        savedBuf = savedBuf.slice(msgLen());
        handshake = false;
    }
}

function msgHandler(msg, socket) {
    if (isHandshake(msg)) socket.write(message.buildInterested());
  }
  
  // 3
  function isHandshake(msg) {
    return msg.length === msg.readUInt8(0) + 49 &&
           msg.toString('utf8', 1) === 'BitTorrent protocol';
  }
