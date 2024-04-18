'use strict'
const frame = [];
let max = 0;
let x;
let y;
let loops = 1;
const t = 1000/60;
this.onmessage = messageEvent => {
	function update(){
		let l = loops;
		const start = Date.now();
		while(l--){
			const corner = corners[Math.floor(Math.random() * corners.length)];
			x = Math.floor((x - corner.x)/2 + corner.x);
			y = Math.floor((y - corner.y)/2 + corner.y);
			const n = ++frame[y][x];
			max = Math.max(max, n);
		}
		const duration = Date.now()-start;
		loops -= Math.sign(duration - t);
		loops = Math.max(1, loops)
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
