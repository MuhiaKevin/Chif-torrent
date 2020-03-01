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
    //pstrlen
    buf.writeUInt8(19, 0);
    //pstr = 'BitTorrent protocol'
    buf.write('BitTorrent protocol');
    //reserved
    buf.writeUInt32BE(0, 20);
    buf.writeUInt32BE(0, 24);
    //infohash
    torrent.getinfoHash().copy(buf, 28);
    // peerid
    buf.write(torrent.generate_peer_id().toString('utf8'));

    return buf;

}

module.exports.buildKeepAlive = () => Buffer.alloc(4);

// choke: <len=0001><id=0>

module.exports.buildChoke = () => {
    const buf = Buffer.alloc(5);
    //length <len=0001>
    buf.writeUInt32BE(1, 0);
    // id
    buf.writeUInt8(0, 4);
    return buf;
}

// unchoke: <len=0001><id=1>

module.exports.buildUnchoke = () => {
    const buf = Buffer.alloc(5);
    //length <len=0001>
    buf.writeUInt32BE(1, 0);
    // id <id=1>
    buf.writeUInt8(1, 4);
    return buf;
}

// interested: <len=0001><id=2>

module.exports.buildInterested = () => {
    const buf = Buffer.alloc(5);
    //length <len=0001>
    buf.writeUInt32BE(1, 0);
    // id <id=1>
    buf.writeUInt8(2, 4);
    return buf;
}

// not interested: <len=0001><id=3>

module.exports.buildUninterested = () => {
    const buf = Buffer.alloc(5);
    //length <len=0001>
    buf.writeUInt32BE(1, 0);
    // id <id=1>
    buf.writeUInt8(3, 4);
    return buf;
}


// have: <len=0005><id=4><piece index>

module.exports.buildHave = payload => {
    const buf = Buffer.alloc(9);
    //length <len=0005>
    buf.writeUInt32BE(5, 0);
    // id <id=4>
    buf.writeUInt8(3, 4);
    // piece index
    buf.writeUInt32BE(payload, 5);
    return buf;
}

// bitfield: <len=0001+X><id=5><bitfield>

module.exports.buildBitfield = bitfield => {
    const buf = Buffer.alloc(14);
    // length <len=0001+X>
    buf.writeUInt32BE(payload.length + 1, 0);
    // id <id=5>
    buf.writeUInt8(5, 4);
    // bitfield <bitfield>
    bitfield.copy(buf, 5);
    return buf;
};

// request: <len=0013><id=6><index><begin><length>
module.exports.buildRequest = payload => {
    const buf = Buffer.alloc(17);
    // length <len=0013>
    buf.writeUInt32BE(13, 0);
    //id <id=6>
    buf.writeUInt32BE(6, 4);
    // piece index <index>
    buf.writeUInt32BE(payload.index, 5);
    // begin <begin>
    buf.writeUInt32BE(payload.begin, 9);
    // length <length>
    buf.writeUInt32BE(payload.length, 13);
    return buf;
}

// piece: <len=0009+X><id=7><index><begin><block>
module.exports.buildPiece = payload => {
    const buf = Buffer.alloc(payload.block.length + 13);
    // length <len=0009+X>
    buf.writeUInt32BE(payload.block.length + 9, 0);
    // length <id=7>
    buf.writeUInt8(7, 4);
    // peiece index <index>
    buf.writeUInt32BE(payload.index, 5);
    // begin <begin>
    buf.writeUInt32BE(payload.begin, 9);
    // block <block>
    payload.block.copy(buf, 13);

    return buf;
};

// cancel: <len=0013><id=8><index><begin><length>

module.exports.buildCancel = payload => {
    const buf = Buffer.alloc(17);
    // length <len=0013>
    buf.writeUInt32BE(13, 0);
    // id <id=8>
    buf.writeUInt8(8, 4);
    // piece index <index>
    buf.writeUInt32BE(payload.index, 5);
    // begin <begin>
    buf.writeUInt32BE(payload.begin, 9);
    // length <length>
    buf.writeUInt32BE(payload.length, 13);
    return buf;
};

// port: <len=0003><id=9><listen-port>

module.exports.buildPort = payload => {
    const buf = Buffer.alloc(7);
    // length <len=0003>
    buf.writeUInt32BE(3, 0);
    // id <id=9>
    buf.writeUInt8(9, 4);
    // listen-port <listen-port>
    buf.writeUInt16BE(payload, 5);
    return buf;
};

