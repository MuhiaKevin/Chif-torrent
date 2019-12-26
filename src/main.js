const Torrent = require('./torrent.js')


if(!process.argv[2]){
    console.log("Usage : node main.js <torrent file>");
    process.exit(1);
}

let torrent = new Torrent(process.argv[2]);
console.log(torrent.size());
