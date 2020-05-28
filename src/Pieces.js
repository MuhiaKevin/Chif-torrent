
class Pieces {
    constructor(torrent) {
        function buildPiecesArray() {
            // change it to torrent.torrent.info.length / torrent.torrent.info['piece length]
            const nPieces = torrent.torrent.info.pieces.length / 20;
            const arr = new Array(nPieces).fill(null);
            return arr.map((_, i) => new Array(torrent.blocksPerPiece(torrent, i)).fill(false));
        }
        this._torrent = torrent;

        this._requested = buildPiecesArray()
        this._received = buildPiecesArray()
    }

    // marks a piece as requested to the peers
    addRequested(pieceBlock) {
        const blockIndex = pieceBlock.length / this._torrent.BLOCK_LEN;
        this._requested[pieceBlock.index][blockIndex] = true;

    }

    // marks a piece as received from the peers
    addReceived(pieceBlock) {
        const blockIndex = pieceBlock.begin / this._torrent.BLOCK_LEN;
        this._received[pieceBlock.index][blockIndex] = true;
    }

    // checks if a piece block has been requested and not received
    needed(pieceBlock) {
        // if all pieces blocks have been requested
        if (this._requested.every(block => block.every(i => i))) {
            // then copy the received list to the requsted
            this._requested = this.received.every(blocks => blocks.slice())
        }

        const blockIndex = pieceBlock.index / this._torrent.BLOCK_LEN;
        // if that piece has been requsted and not received then tell download,js to redownload the piece
        return !this._requested[pieceBlock.index][blockIndex];
    }

    // checks if all the pieces have been received
    isDone() {
        return this._received.every(blocks => blocks.every(i => i));
    }

}


module.exports = Pieces