const net = require('net');
const Buffer = require('buffer').Buffer;
const message = require('./message');
const tracker = require('./tracker.js')
const Pieces = require('./Pieces');
const Queue = require('./Queue')
const fs = require('fs');

module.exports = (torrent, path) => {
    tracker.getPeers(torrent, peers => {
        peers.forEach((peer) => {
            const pieces = new Pieces(torrent);
            // create a file descriptor
            const file = fs.openSync(path, 'w');
            download(peer, torrent, pieces, file);
            console.log(`peer: ${peer.ip}, ${peer.port}`)
        });
    });
};

function download(peer, torrent, pieces, file) {
    const socket = new net.Socket();
    socket.on('error', console.log);
    socket.connect(peer.port, peer.ip, () => {
        socket.write(message.buildHandshake(torrent));
    });

    const queue = new Queue(torrent);
    onWholeMsg(socket, msg => msgHandler(msg, socket, pieces, queue, torrent, file));
}

// TODO : READ THIS AGAIN
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

function msgHandler(msg, socket, pieces, queue, torrent, file) {
    if (isHandshake(msg)) {
        socket.write(message.buildInterested());
    }
    else {
        // console.log(`Message length is : ${msg.length} message id is ${msg.readInt8(4)}`)
        const m = message.parse(msg)
        if (m.id === 0) {
            console.log('Choke message received')
            // chokeHandler();
        }
        if (m.id === 1) {
            console.log('Unchoke message received')
            unchokeHandler(socket, pieces, queue)
        }
        // if (m.id === 2) {
        //     console.log('Interested message sent')
        // }
        // if (m.id === 3) {
        //     console.log('Not intersted message sent')
        // }
        if (m.id === 4) {
            console.log('Have message sent')
            haveHandler(socket, pieces, queue, m.payload);
        }
        if (m.id === 5) {
            console.log('Bitfield message received')
            bitfieldHandler(socket, pieces, queue, m.payload);
        }
        // if (m.id === 6) {
        //     console.log('Request message recived')
        // }
        if (m.id === 7) {
            console.log('Piece message recived')
            pieceHandler(socket, pieces, queue, torrent, file, m.payload);
        }
        // if (m.id === 8) {
        //     console.log('Cancel message sent')
        // }
    }
}

function isHandshake(msg) {
    return msg.length === msg.readUInt8(0) + 49 &&
        msg.toString('utf8', 1, 20) === 'BitTorrent protocol';
}

// Message Handlers
function unchokeHandler(socket, pieces, queue) {
    queue.choked = false;
    requestPiece(socket, pieces, queue);
}

function haveHandler(socket, pieces, queue, payload) {
    const pieceIndex = payload.readUInt32BE(0);
    // TODO:  try to change to queue.length()
    const queueEmpty = queue.length === 0;
    queue.queue(pieceIndex);

    if (queueEmpty) {
        requestPiece(socket, pieces, queue);
    }
}

function bitfieldHandler(socket, pieces, queue, payload) {
    const queueEmpty = queue.length === 0;
    payload.forEach((byte, i) => {
        for (let j = 0; j < 8; j++) {
            if (byte % 2) queue.queue(i * 8 + 7 - j);
            byte = Math.floor(byte / 2);
        }
    });
    if (queueEmpty) requestPiece(socket, pieces, queue);
}

function pieceHandler(socket, pieces, queue, torrent, file, pieceResp) {
    console.log(pieceResp);
    pieces.addReceived(pieceResp);

    const offset = pieceResp.index * torrent.torrent.info['piece length'] + pieceResp.begin;
    fs.write(file, pieceResp.block, 0, pieceResp.block.length, offset, () => { });

    if (pieces.isDone()) {
        console.log('DONE!');
        socket.end();
        try { fs.closeSync(file); } catch (e) { }
    } else {
        requestPiece(socket, pieces, queue);
    }
}


function requestPiece(socket, pieces, queue) {
    // restarting a failed connection to peer can be done here
    if (queue.choked) return null;

    while (queue.length()) {
        const pieceBlock = queue.deque();
        if (pieces.needed(pieceBlock)) {
            socket.write(message.buildRequest(pieceBlock));
            pieces.addRequested(pieceBlock);
            break;
        }
    }

}