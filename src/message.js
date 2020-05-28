const Buffer = require('buffer').Buffer;
const Torrent = require('./torrent');




/*
    https://www.researchgate.net/figure/Message-sequence-in-a-typical-download_fig2_223808116
    
    Peer Handshake  Format
    ========================
    handshake: <pstrlen><pstr><reserved><info_hash><peer_id>
    pstrlen: string length of <pstr>, as a single raw byte
    pstr: string identifier of the protocol
    reserved: eight (8) reserved bytes. All current implementations use all zeroes.
    peer_id: 20-byte string used as a unique ID for the client.
    In version 1.0 of the BitTorrent protocol, pstrlen = 19, and pstr = "BitTorrent protocol".
        

*/

module.exports.buildHandshake = torrent => {
    const buf = Buffer.alloc(68);
    // pstrlen
    buf.writeUInt8(19, 0);
    // pstr
    buf.write('BitTorrent protocol', 1);
    // reserved
    buf.writeUInt32BE(0, 20);
    buf.writeUInt32BE(0, 24);
    // info hash
    torrent.getinfoHash().copy(buf, 28);;
    // peerid
    torrent.generate_peer_id().copy(buf, 48);

    return buf;

}
/*
    The length prefix is a four byte big-endian value. The message ID is a single decimal byte. The payload is message dependent.
    Bellow are all other messages except the handshake

*/


// keep-alive: <len=0000>

module.exports.buildKeepAlive = () => Buffer.alloc(4);


// choke: <len=0001><id=0>

module.exports.buildChoke = () => {
    const buf = Buffer.alloc(5);
    // length
    buf.writeUInt32BE(1, 0);
    // id
    buf.writeUInt8(0, 4);
    return buf;
};
// unchoke: <len=0001><id=1>

module.exports.buildUnchoke = () => {
    const buf = Buffer.alloc(5);
    // length
    buf.writeUInt32BE(1, 0);
    // id
    buf.writeUInt8(1, 4);
    return buf;
};
// interested: <len=0001><id=2>

module.exports.buildInterested = () => {
    const buf = Buffer.alloc(5);
    // length
    buf.writeUInt32BE(1, 0);
    // id
    buf.writeUInt8(2, 4);
    return buf;
};

// not interested: <len=0001><id=3>

module.exports.buildUninterested = () => {
    const buf = Buffer.alloc(5);
    // length
    buf.writeUInt32BE(1, 0);
    // id
    buf.writeUInt8(3, 4);
    return buf;
};

// have: <len=0005><id=4><piece index>

module.exports.buildHave = payload => {
    const buf = Buffer.alloc(9);
    // length
    buf.writeUInt32BE(5, 0);
    // id
    buf.writeUInt8(4, 4);
    // piece index
    buf.writeUInt32BE(payload, 5);
    return buf;
};
// bitfield: <len=0001+X><id=5><bitfield>

module.exports.buildBitfield = bitfield => {
    const buf = Buffer.alloc(14);
    // length
    buf.writeUInt32BE(payload.length + 1, 0);
    // id
    buf.writeUInt8(5, 4);
    // bitfield
    bitfield.copy(buf, 5);
    return buf;
};

// request: <len=0013><id=6><index><begin><length>


module.exports.buildRequest = payload => {
    const buf = Buffer.alloc(17);
    // length
    buf.writeUInt32BE(13, 0);
    // id
    buf.writeUInt8(6, 4);
    // piece index
    buf.writeUInt32BE(payload.index, 5);
    // begin
    buf.writeUInt32BE(payload.begin, 9);
    // length
    buf.writeUInt32BE(payload.length, 13);
    return buf;
};

// piece: <len=0009+X><id=7><index><begin><block>

module.exports.buildPiece = payload => {
    const buf = Buffer.alloc(payload.block.length + 13);
    // length
    buf.writeUInt32BE(payload.block.length + 9, 0);
    // id
    buf.writeUInt8(7, 4);
    // piece index
    buf.writeUInt32BE(payload.index, 5);
    // begin
    buf.writeUInt32BE(payload.begin, 9);
    // block
    payload.block.copy(buf, 13);
    return buf;
};

// cancel: <len=0013><id=8><index><begin><length>


module.exports.buildCancel = payload => {
    const buf = Buffer.alloc(17);
    // length
    buf.writeUInt32BE(13, 0);
    // id
    buf.writeUInt8(8, 4);
    // piece index
    buf.writeUInt32BE(payload.index, 5);
    // begin
    buf.writeUInt32BE(payload.begin, 9);
    // length
    buf.writeUInt32BE(payload.length, 13);
    return buf;
};


// port: <len=0003><id=9><listen-port>

module.exports.buildPort = payload => {
    const buf = Buffer.alloc(7);
    // length
    buf.writeUInt32BE(3, 0);
    // id
    buf.writeUInt8(9, 4);
    // listen-port
    buf.writeUInt16BE(payload, 5);
    return buf;
};


module.exports.parse = msg => {
    const id = msg.length > 4 ? msg.readInt8(4) : null;
    let payload = msg.length > 5 ? msg.slice(5) : null;
    if (id === 6 || id === 7 || id === 8) {
        const rest = payload.slice(8);
        payload = {
            index: payload.readInt32BE(0),
            begin: payload.readInt32BE(4)
        };
        payload[id === 7 ? 'block' : 'length'] = rest;
    }

    return {
        size: msg.readInt32BE(0),
        id: id,
        payload: payload
    }
}