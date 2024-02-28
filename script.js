const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const oscillator = audioContext.createOscillator();
oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
oscillator.connect(audioContext.destination);
document.addEventListener("touchstart", function(){
	alert(2);
	oscillator.start();
	oscillator.resume();
	oscillator.stop(audioContext.currentTime + 20);
})