'use strict'
const frame = [];
let max = 0;
let x;
let y;
let loops = 0;
const timeThreshold = 1000/60;
let multiplier = 10000;
this.onmessage = messageEvent => {
	function update(){
		let l = loops;
		const start = Date.now();
		while(l--){
			const corner = corners[Math.floor(Math.random() * corners.length)];
			x = Math.floor((corner.x - x)/2 + x);
			y = Math.floor((corner.y - y)/2 + y);
			max = Math.max(max, ++frame[y][x]);
		}
		const duration = Date.now()-start;
		const change = Math.sign(duration - timeThreshold)*multiplier;
		loops -= change;
		if(multiplier != 1 && 0 < change){
			multiplier = Math.max(1, multiplier/10);
		}
		loops = Math.max(1, loops);
		setTimeout(update, 0);
	}
	this.onmessage = ()=>{
		this.postMessage({imageData: frame.flat(), max});
	}
	const corners = messageEvent.data.corners;
	x = corners[0].x;
	y = corners[0].y;
	const frameSize = messageEvent.data.frameSize;
	for(let index = 0; index < frameSize; index++){
		frame.push(new Array(frameSize).fill(0));
	}
	update();
	onmessage();
}
