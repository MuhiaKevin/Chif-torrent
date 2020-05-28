
class Queue{
    constructor(torrent){
        this._torrent = torrent;
        this._queue = [];
        this.choked = true;
    }

    queue(pieceIndex){
        const nBlocks = this._torrent.blocksPerPiece(pieceIndex);
        for(let i = 0; i < nBlocks; i++){
            const pieceBlock = {
                index : pieceIndex,
                begin : i *  this._torrent.BLOCK_LEN,
                length :  this._torrent.blockLen(pieceIndex, i)
            }
            this._queue.push(pieceBlock);
        }
    }

    deque() { return this._queue.shift(); }
    peek() { return this._queue[0]; }
    length() { return this._queue.length; }

}

module.exports = Queue;