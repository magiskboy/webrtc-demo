/**
 * @class       : index
 * @author      : nkthanh (nguyenkhacthanh244@gmail.com)
 * @created     : Friday Jan 24, 2020 03:18:15 +07
 * @description : index
 */

const socket = io.connect();
const remotePeerConns = {};
const iceServers=[{'urls': 'stun:stun.l.google.com:19302'}];


socket.on('connect', async () => {
  await setupLocalStream(socket.id);
});


socket.on('candidate', message => {
  remotePeerConns[message.from].addIceCandidate(new RTCIceCandidate(message.candidate));
});


socket.on('new peer', async message => {
  const remotePeer = new RTCPeerConnection({
    iceServers: iceServers
  });
  const stream = await getLocalStream();
  remotePeer.addTrack(stream.getTracks()[0], stream);
  remotePeer.ontrack = event => {
    addStream(event.streams[0], message.from);
  }
  remotePeer.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('candidate', {
        to: message.from,
        candidate: event.candidate
      });
    }
  }
  const offer = await remotePeer.createOffer()
  await remotePeer.setLocalDescription(offer)
  socket.emit('offer', {
    to: message.from,
    offer: remotePeer.localDescription
  });
  remotePeerConns[message.from] = remotePeer;
});


socket.on('offer', async message => {
  const remotePeer = new RTCPeerConnection({
    iceServers: iceServers
  });
  const stream = await getLocalStream();
  remotePeer.addTrack(stream.getTracks()[0], stream);
  remotePeer.ontrack = event => {
    addStream(event.streams[0], message.from);
  }
  remotePeer.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('candidate', {
        to: message.from,
        candidate: event.candidate
      });
    }
  }
  await remotePeer.setRemoteDescription(new RTCSessionDescription(message.offer));
  const answer = await remotePeer.createAnswer()
  await remotePeer.setLocalDescription(answer)
  socket.emit('answer', {
    to: message.from,
    answer: remotePeer.localDescription
  });
  remotePeerConns[message.from] = remotePeer;
});


socket.on('answer', async message => {
  await remotePeerConns[message.from].setRemoteDescription(new RTCSessionDescription(message.answer));
});


socket.on('peer left', message => {
  let remoteLeft = document.getElementById(message.peerId);
  remoteLeft.parentNode.removeChild(remoteLeft);
});


function addStream(stream, id) {
  const newRemoteStream = document.createElement('video');
  newRemoteStream.srcObject = stream;
  newRemoteStream.autoplay = true;
  newRemoteStream.id = id;
  newRemoteStream.width = navigator.width / 3;
  newRemoteStream.height = navigator.height / 3;
  document.getElementById('screen').append(newRemoteStream);
}


async function setupLocalStream(id) {
  const stream = await getLocalStream();
  addStream(stream, id);
}


async function getLocalStream() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: 480,
      height: 320
    },
    audio: true,
  });
  return stream;
}
