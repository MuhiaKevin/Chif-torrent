const fs = require('fs');
const bencode = require('bencode');
const urlParse = require('url').parse;
const dgram = require('dgram');
const buffer = require('buffer').Buffer;


const url = urlParse(torrent.announce.toString('utf8')); // get url information such as port number,hostname etc
const torrent = bencode.decode(fs.readFileSync('Building_blockchani.torrent')); // get tracker
console.log(url);



function getPeers = (torrentFile,callback)=>{
    const socket = dgram.createSocket('udp4'); // create a udp socket that uses ipv4 ip adressing scheme
    const url = urlParse(torrent.announce.toString('utf8')); // get url information such as port number,hostname etc

    // 1. first send a connection request to the tracker
    udpSend(socket,buildConnRequest(),url);

    socket.on('message')


}

















module.exports.getPeers = getPeers;
