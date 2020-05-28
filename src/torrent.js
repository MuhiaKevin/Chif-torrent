const fs = require('fs');
const bencode = require('bencode');
const crypto = require('crypto');
const bignum = require('bignum')

// class to extract torrent information

class Torrent {
  constructor(torrent_file) {
    this.torrent = bencode.decode(fs.readFileSync(torrent_file));
    this.BLOCK_LEN = Math.pow(2, 14);

  }


  getinfoHash() {
    const info = bencode.encode(this.torrent.info);
    return crypto.createHash('sha1').update(info).digest();

  }

  // return list of trackers from torrent file
  getannouncelist() {
    let http_announce_list =[]
    let udp_announce_list = [];

    if(this.torrent["announce-list"]){
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
    else{
      return this.torrent.announce.toString()
    }
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

  pieceLen(pieceIndex){
    const totalLength = bignum.fromBuffer(this.size()).toNumber()
    const pieceLength = this.torrent.info['piece length'];

    const lastPieceLength = totalLength %  pieceLength;
    const lastPieceIndex = Math.floor(totalLength / pieceLength)
    
    return lastPieceIndex === pieceIndex ? lastPieceLength : pieceLength
  }

  blocksPerPiece(pieceIndex){
    const pieceLength = this.pieceLen(pieceIndex);
    return Math.ceil(pieceLength / this.BLOCK_LEN);
  }

  blockLen(pieceIndex, blockIndex){
    const pieceLength = this.pieceLen(pieceIndex);

    const lastPieceLength = pieceLength % this.BLOCK_LEN;
    const lastPieceIndex = Math.floor(pieceLength / this.BLOCK_LEN);

    return blockIndex === lastPieceIndex ? lastPieceLength : this.BLOCK_LEN;

  }

}

module.exports = Torrent;

