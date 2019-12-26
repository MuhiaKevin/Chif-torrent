const fs = require('fs');
const bencode = require('bencode');
const crypto = require('crypto');
const bignum = require('bignum')

// class to extract torrent information

class Torrent {
  constructor(torrent_file) {
    this.torrent = bencode.decode(fs.readFileSync(torrent_file));

  }


  getinfoHash() {
    const info = bencode.encode(this.torrent.info);
    return crypto.createHash('sha1').update(info).digest();

  }

  // return list of trackers from torrent file
  getannouncelist() {
    let announce_list = [];

    for (let announce of this.torrent["announce-list"]) {
      announce_list.push(announce.toString('utf8'));
    }

    return announce_list;
  }

  // get total size of torrent files
  size(){
    const size = this.torrent.info.files ? 
    
    this.torrent.info.files.map(file => file.length).reduce((a, b) => a + b) :
    this.torrent.info.length;

    return bignum.toBuffer(size, {size: 8});
  }


}

module.exports = Torrent;

