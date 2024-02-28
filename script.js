console.clear()

//audioタグから、オーディオエレメントを作ります。
const audioElement = document.querySelector('audio');

//AudioContextを作ります。
const audioContext = new AudioContext();
//異なるドメインから音声ファイルを取得する時に必要な設定です。本当は、今回は設定する必要がありません。
audioContext.crossOrigin='anonymous';

//AudioContextにaudioElementを紐づけます。
const track = audioContext.createMediaElementSource(audioElement);

//Gain Nodeを作ります。再生時に音量を設定するためのノードです。
const gainNode = audioContext.createGain();
gainNode.gain.setValueAtTime(0.08,0)

//Stereo Panner Nodeを作ります。パンを設定するためのノードです。
const pannerOptions = { pan : 0 };
const pannerNode = new StereoPannerNode(audioContext,pannerOptions);

//Analyzer Nodeを作ります。音波のビジュアライズをするために必要なノードです。
const analyserNode = audioContext.createAnalyser();
analyserNode.fftSize = 2048;//use for fast fourier transformation
const bufferLength = analyserNode.frequencyBinCount;//half the size of analyserNode.fftSize
const dataArray = new Uint8Array(bufferLength);

//今まで作成してきたノードを全て繋ぎます。
track.connect(gainNode).connect(pannerNode).connect(analyserNode).connect(audioContext.destination);

//音波の壁画のために、canvasを作成します。 
//またfunction draw()以下でcanvas常に音波を表示できるようにします。
const canvas = document.getElementById('mycanvas');
const canvasContext = canvas.getContext('2d');
const WIDTH=canvas.width
const HEIGHT=canvas.height
canvasContext.strokeRect(0,0,WIDTH,HEIGHT);
function draw(){
  drawVisual = requestAnimationFrame(draw);
  analyserNode.getByteTimeDomainData(dataArray);//音波データをUint8Array配列(dataArray)にコピー
  canvasContext.fillStyle = 'rgb(200,200,200)';
  canvasContext.fillRect(0,0,WIDTH,HEIGHT);
  canvasContext.lineWidth = 3;
  canvasContext.strokeStyle = 'rgb(0,0,0)';

  canvasContext.beginPath();

  const sliceWidth = WIDTH * (1.0/bufferLength);
  var x = 0;

  for(var i=0; i<bufferLength; i++){
    var v = dataArray[i] / 128.0;
    var y = v * HEIGHT/2 ;
    if(i ===0){
      canvasContext.moveTo(x,y);
    }else{
      canvasContext.lineTo(x,y);
    }
    x+=sliceWidth;
  }

  canvasContext.lineTo(WIDTH,HEIGHT/2);
  canvasContext.stroke();
};

draw();

//おまけ。再生位置、音量、パンをユーザーが画面上から設定できるようにします。
//再生ボタン作成
const playButton = document.querySelector('button');

//再生位置を自由に動かせるように、スライダーを作成。
const timeControl = document.querySelector('#time')
timeControl.setAttribute('max',audioElement.duration)

timeControl.addEventListener('input',function(){
  audioElement.currentTime=this.value;
},false)

audioElement.addEventListener('timeupdate',function(){
  timeControl.value = audioElement.currentTime
})

//音量を調整できるように、スライダーを作成。
const volumeControl = document.querySelector('#volume');
volumeControl.addEventListener('input',function(){
  gainNode.gain.value=this.value;
},false)

playButton.addEventListener('click',function(){
  //ユーザーのアクションがあるまで、オーディをファイルは'suspended'状態となり自動再生されません。
　//なのでボタンクリックと同時に、resume()で再生されるようにしています。
  if (audioContext.state==='suspended'){
    audioContext.resume();
  }

  // 再生した時と一時停止した時のロジック
  if (this.dataset.playing === 'false'){
    audioElement.play();
    this.dataset.playing='true'
  } else if (this.dataset.playing==='true'){
    audioElement.pause();
    this.dataset.playing = 'false'
  }
},false)

audioElement.addEventListener('ended',()=>{
  playButton.dataset.playing='false';
})

//パンを作成
const pannerControl = document.querySelector('#panner')
pannerControl.addEventListener('input',function(){
  pannerNode.pan.value=this.value;
},false)
