#!/usr/bin/env node

const Torrent = require('./torrent.js')
const tracker = require('./tracker');
const download = require('./download');

/*
https://github.com/nodejitsu/docs/blob/master/pages/articles/advanced/buffers/how-to-use-buffers/content.md
https://www.digitalocean.com/community/tutorials/using-buffers-in-node-js
https://flaviocopes.com/node-buffers/
https://medium.com/better-programming/an-introduction-to-buffer-in-node-js-2237a9bce9da
https://www.freecodecamp.org/news/do-you-want-a-better-understanding-of-buffer-in-node-js-check-this-out-2e29de2968e8/
https://www.tutorialspoint.com/nodejs/nodejs_buffers.htm
http://thecodebarbarian.com/an-overview-of-buffers-in-node-js.html
https://betterexplained.com/articles/understanding-big-and-little-endian-byte-order/
https://www.geeksforgeeks.org/little-and-big-endian-mystery/
https://betterexplained.com/articles/understanding-big-and-little-endian-byte-order/
https://betterexplained.com/articles/unicode/
https://github.com/naim94a/udpt/wiki/The-BitTorrent-UDP-tracker-protocol

*/

if(!process.argv[2]){
    console.log("Usage : node main.js <torrent file>");
    process.exit(1);
}

let torrent = new Torrent(process.argv[2]);

// tracker.getPeers(torrent,peers => {
//     peers.forEach(peer => {
//         console.log(`peer: ${peer.ip}, ${peer.port}`)
//         // console.log(peer);
//     });
//     console.log(`\n${peers.length} : peers found`)

// })

download(torrent);