const fs = require('fs');
const bencode = require('bencode');
const Buffer = require('buffer').Buffer;
const tracker = require('./tracker.js');

//const torrent = bencode.decode(fs.readFileSync('Building_blockchani.torrent')); // get tracker
var torrent = bencode.decode(fs.readFileSync('Building_blockchani.torrent'))
console.log(torrent)

tracker.getPeers(torrent, peers => {
  console.log('list of peers: ', peers);
});
