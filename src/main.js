#!/usr/bin/env node

const Torrent = require('./torrent.js')
const tracker = require('./tracker');



if(!process.argv[2]){
    console.log("Usage : node main.js <torrent file>");
    process.exit(1);
}

let torrent = new Torrent(process.argv[2]);


tracker.getPeers(torrent,peers => {
    peers.forEach(peer => {
        console.log(`peer: ${peer.ip}, ${peer.port}`)
    });
    console.log(`\n${peers.length} : peers found`)
})
  