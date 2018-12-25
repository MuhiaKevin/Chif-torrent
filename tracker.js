const bencode = require('bencode');
const urlParse = require('url').parse;
const dgram = require('dgram');
const buffer = require('buffer').Buffer;
const crypto = require('crypto');

module.exports.getPeers = (torrent,callback)=>{
    // create a udp socket that uses ipv4 ip adressing scheme

    const socket = dgram.createSocket('udp4');
    const url = urlParse(torrent.announce.toString('utf8')); // get url information such as port number,hostname etc

    // 1. first step in receiving a list of peers is to  send a connection request to the tracker
    udpSend(socket,buildConnRequest(),url);

    /*
      1. When the socket receives a 'connect' message from the tracker, the connection response is first analysed or parsed by the
      parseConnResp method

      2. The Announce Request is then built  and send using the udpSend method to the tracker server.
      3. if the response sent is an announce then the announceResponse is parsed and the peer list is got.

    */



    socket.on('message',(response)=>{
      if(respType(response) === 'connect') {
        const connResponse = parseConnResp(response);
        const announceReq = buildAnnounceReq(connResp.connectionId, torrent);
        udpSend(sockets,announceRequest);

      }

      else if (respType(response) === 'announce') {
        const announceResponse = parseAnnounceResp(response);
        callback(announceResponse.peers)
      }


    });

}

// This method will be used to send both connection request and announce request.

function udpSend(socket,message,rawUrl,callback=()=>{}){
  const url = urlParse(rawUrl);
  socket.send(message,0,message.length,url.port,url.host,callback)
}



function buildConnRequest(){
  const buf = Buffer.alloc(16); // set the bytes of the buffer
  // create connection id which is a 64 bit unsigned integer
  buf.writeUInt32BE(0x417,0);
  buf.writeUInt32BE(0x27101980,4);
  // the action i.e 0=connect requiest, 1=connect response,2=announce request
  buf.writeUInt32BE(0,8)
   // transaction id
   crypto.randomBytes(4).copy(buf, 12); // 5
   
   return buf
}



function parseConnResp(resp){
  // parse the connection response from the tracker
  return {
    action : resp.readUInt32BE(0),
    transactionId : resp.readUInt32BE(4),
    connectionId : resp.slice(8)
  }

}

function buildAnnounceRequest(connId, torrent, port=6881){
  const buf = Buffer.allocUnsafe(98);
  // connection id
  connId.copy(buf,0); // this will copy the buffer of connId to buf at offset 0
  // action
  buf.writeUInt32BE(1,8);
  // transaction id
  crypto.randomBytes(4).copy(buf, 12);


  return buf
}



// is used to get peers
function  parseAnnounceResp(){
  
}


// checks the action from tracker response
function respType(resp){
  const action = resp.readUInt32BE(0);
  if (action === 0) {
    return 'connect';
  } 
  
  if(action === 1){
    return 'announce'
  } 
}