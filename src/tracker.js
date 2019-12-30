const dgram = require('dgram');
const urlParse = require('url').parse;
const Buffer = require('buffer').Buffer;
const crypto = require('crypto'); // 1


/*

Steps in Tracker server communication

1. Send a connect request

2. Get the connect response and extract the connection id

3.Use the connection id to send an announce request - this is where we tell the tracker which files we’re interested in

4. Get the announce response and extract the peers list


*/


module.exports.getPeers = (torrent, callback) => {

    const socket = dgram.createSocket('udp4');

    let announcelist = torrent.getannouncelist();
    let url = "";

    // udp://tracker.leechers-paradise.org:6969/announce
    // udp://9.rarbg.me:2730/announce

    for (let i = 0; i < announcelist.length; i++) {
        if (announcelist[i] === "udp://9.rarbg.me:2730/announce") {
            url = announcelist[i];
            // console.log(url);        
        }
    }


    // for (let i = 0; i < announcelist.length; i++) {
    //     if (announcelist[i].substring(0, 3) === "udp") {
    //         url = urlParse(announcelist[i]);
    //         console.log(url);
    //         break;
    //     }
    // }

    udpSend(socket, buildConnReq(), url);

    // this event is fired when the socket receives a message from the tracker server
    socket.on('message', response => {

        if (respType(response) == 'connect') {
            console.log('Received CONNECT response \n')

            // parsing the connection id gives the connection id
            const connResp = parseConnResp(response);
            console.log(connResp)

            // build an announce request with the help of the connection id extracted
            const announceReq = buildAnnounceReq(connResp.connectionId,torrent);

            // now send the announce message
            udpSend(socket, announceReq, url);
        }

        else if (respType(response) === 'announce') {

            console.log('Received ANNOUNCE request\n')

            // parse announce response
            
            const announceResp = parseAnnounceResp(response);
            console.log('announceResp')
            // pass peers to callback
            callback(announceResp.peers);
        }
    });


};


// send udp message
function udpSend(socket, message, rawUrl, callback=()=>{}) {
    const url = urlParse(rawUrl);
    socket.send(message, 0, message.length, url.port, url.hostname, callback);
}

/*

Offset  Size            Name            Value
0       32-bit integer  action          0 // connect
4       32-bit integer  transaction_id
8       64-bit integer  connection_id
16

*/

// build the connection message to send to the tracker as the first step
function buildConnReq(){
    // create a new empty buffer with a size of 16 bytes since we already know that the entire message should be 16 bytes long.
    const buf = Buffer.alloc(16);

    //connection id => 0x indicates that the number is a hexadecimal number
    buf.writeUInt32BE(0x417, 0)
    buf.writeUInt32BE(0x27101980, 4)

    // action id
    buf.writeUInt32BE(0, 8);

    // transaction id
    crypto.randomBytes(4).copy(buf, 12); // 5

    return buf;
}


// parse the connection response from the tracker server
function parseConnResp(resp){
    return {
        action: resp.readUInt32BE(0),
        transactionId: resp.readUInt32BE(4),
        connectionId: resp.slice(8)
    }

}


/*

    Offset  Size    Name    Value
    0       64-bit integer  connection_id
    8       32-bit integer  action          1 // announce
    12      32-bit integer  transaction_id
    16      20-byte string  info_hash
    36      20-byte string  peer_id
    56      64-bit integer  downloaded
    64      64-bit integer  left
    72      64-bit integer  uploaded
    80      32-bit integer  event           0 // 0: none; 1: completed; 2: started; 3: stopped
    84      32-bit integer  IP address      0 // default
    88      32-bit integer  key             ? // random
    92      32-bit integer  num_want        -1 // default
    96      16-bit integer  port            ? // should be betwee
    98

*/

function buildAnnounceReq (connId,torrent, port=6881 ){
    const buf = Buffer.allocUnsafe(98); // create a buffer of size 98
    connId.copy(buf, 0) // copy the connection id buf to buf size at 0
    buf.writeUInt32BE(1, 8) // write value 1(which means it is an announce request) at offset 8
    crypto.randomBytes(4).copy(buf,12);
    torrent.getinfoHash().copy(buf,16);
    torrent.generate_peer_id().copy(buf,36);
    Buffer.alloc(8).copy(buf, 56);
    torrent.size().copy(buf, 64);
    Buffer.alloc(8).copy(buf, 72);
    buf.writeUInt32BE(0, 80);
    buf.writeUInt32BE(0, 80) //try and change offset to 84
    crypto.randomBytes(4).copy(buf,88);
    buf.writeInt32BE(-1,92);
    buf.writeUInt16BE(port, 96);

    return buf
}

/*

    Offset      Size            Name            Value
    0           32-bit integer  action          1 // announce
    4           32-bit integer  transaction_id
    8           32-bit integer  interval
    12          32-bit integer  leechers
    16          32-bit integer  seeders
    20 + 6 * n  32-bit integer  IP address
    24 + 6 * n  16-bit integer  TCP port
    20 + 6 * N

*/

function parseAnnounceResp(resp) {

    function group(iterable, groupSize){
        let groups = [];
        
        for (let i = 0; i < iterable.length; i += groupSize){
            groups.push(iterable.slice(i , i+groupSize));           
        }
        return groups;
    }

    return {
        action: resp.readUInt32BE(0),
        transactionId: resp.readUInt32BE(4),
        leechers: resp.readUInt32BE(8),
        seeders: resp.readUInt32BE(12),
        peers: group(resp.slice(20), 6).map(adress => {
            return {
                ip: adress.slice(0,4).join('.'),
                port: adress.readUInt16BE(4)
            }
        })
    }
}

// checks the what the 
// Describes the type of packet 1 for announce and 0 for and connect 3 for error

function respType(resp) {
    const action = resp.readUInt32BE(0);
    if (action === 0) return 'connect';
    if (action === 1) return 'announce';
  }