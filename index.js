const fs = require('fs');
const bencode = require('bencode');
const urlParse = require('url').parse;
const Buffer = require('buffer').Buffer;
const dgram = require('dgram');


//const torrent = bencode.decode(fs.readFileSync('Building_blockchani.torrent')); // get tracker
var torrent = bencode.decode(fs.readFileSync('/media/muhia/STUFF/build-blockchain-FreeTutorials.Us_.zip.torrent'))
//const url = urlParse(torrent.announce.toString('utf8')); // get url information such as port number,hostname etc
console.log(torrent);
