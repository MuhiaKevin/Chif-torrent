const fs = require('fs');
const bencode = require('bencode');
const crypto = require('crypto');


module.exports.open = (filepath)=>{
    return bencode.decode(fs.readFileSync(filepath));
}


module.exports.infohash = (torrent)=>{
    const info = torrent.info;
    return crypto.createHash('sha1').update(info).digest();
}
