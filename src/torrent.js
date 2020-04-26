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
    let http_announce_list =[]
    let udp_announce_list = [];

    for (let announce of this.torrent["announce-list"]) {
      if(announce.toString('utf8').substring(0, 3) === "udp"){
        udp_announce_list.push(announce.toString('utf8'));
      }
      else{
        http_announce_list.push(announce.toString('utf8'));
      }
    }

    return [http_announce_list, udp_announce_list];
  }



  // get total size of torrent files
  size() {
    const size = this.torrent.info.files ? 
    this.torrent.info.files.map(file => file.length).reduce((a, b) => a + b) :
    this.torrent.info.length;

    return bignum.toBuffer(size, { size: 8 });
  }

  generate_peer_id() {
    let id = null;

    if (!id) {
      id = crypto.randomBytes(20);
      Buffer.from('-CT0001-').copy(id, 0);
    }
    return id;
  }

}

module.exports = Torrent;

