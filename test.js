const bencode = require('bencode');
const fs = require('fs');


const torrent = fs.readFileSync('Building_blockchani.torrent');
console.log(bencode.decode(torrent).announce.toString('uf8'));
