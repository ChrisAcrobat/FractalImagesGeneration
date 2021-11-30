'use strict'
var corners;
var imageData;
let colorStep;
let frameSize;
let x;
let y;
this.onmessage = messageEvent => {
	this.onmessage = ()=>{
		this.postMessage(imageData);
	}
	corners = messageEvent.data.corners;
	x = corners[0].x;
	y = corners[0].y;
	imageData = messageEvent.data.imageData;
	colorStep = messageEvent.data.colorStep;
	frameSize = messageEvent.data.frameSize;
	updateNewPixel();
}
function updateNewPixel(){
	for(var index = 0; index < corners.length; index++){
		var corner = corners[Math.floor(Math.random() * corners.length)];
		x = Math.floor((x - corner.x)/2 + corner.x);
		y = Math.floor((y - corner.y)/2 + corner.y);
		raisePixel(x, y);
	}
	setTimeout(updateNewPixel, 0);
}
function raisePixel(x, y){
	let i = (x + (y*frameSize))*4;
	if(imageData.data[i+1] === 0){
		imageData.data[i] += colorStep;
	}
	if(255 <= imageData.data[i]){
		if(imageData.data[i+2] === 0){
			imageData.data[i+1] += colorStep;
		}
		if(255 <= imageData.data[i+1]){
			if(imageData.data[i] === 0){
				imageData.data[i] -= colorStep;
				imageData.data[i+2] += colorStep;
			}
		}
		if(255 <= imageData.data[i+2]){
			imageData.data[i+1] -= colorStep;
		}
	}
}
