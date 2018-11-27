const bencode = require('bencode');
const urlParse = require('url').parse;
const dgram = require('dgram');
const buffer = require('buffer').Buffer;


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
        const annouceRequest = buildAnnounceRequest(connResponse.connectionId);
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

}

function parseConnResp(){

}

function buildAnnounceRequest(){

}

function  parseAnnounceResp(){
  
}
