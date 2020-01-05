const net = require('net');
const Buffer = require('buffer').Buffer;
const tracker = require('./tracker');


module.exports = torrent => {
    tracker.getPeers(torrent, peers => {
        peers.forEach(download);
    });
};

let download = (peer) => {
    // create client socket
    const socket = new net.Socket();

    socket.on('error', console.log); // catch errors when connection to peers fail

    socket.connect(peer.port, peer.ip, function () {
        // socket.write() // write message to peer 
    });

    socket.on('data', data => {
        // handle response from peer here
    });
}