'use strict'
let post;
let max = 0;
let x;
let y;
let loops = 0;
let settings = {};
const timeThreshold = 1000/60;
let multiplier = 10000;
this.onmessage = messageEvent => {
	const corners = messageEvent.data.corners;
	const imageData = messageEvent.data.imageData;
	const frameSize = messageEvent.data.imageData.width;
	const displacementMap = messageEvent.data.displacementMap;
	function hslToRgb(h, s, l){ // Source: https://github.com/optimisme/javascript-temperatureMap/blob/ba64de1931b5c33bbc0171629364ae9ec06dc97c/temperatureMap.js#L57
		let r, g, b, hue2rgb, q, p;
		if(s === 0){
			r = g = b = l;
		}else{
			hue2rgb = function hue2rgb(p, q, t){
				if(t < 0){
					t += 1;
				}else if (t > 1){
					t -= 1;
				}
				if(t >= 0.66){
					return p;
				}else if(t >= 0.5){
					return p + (q - p) * (0.66 - t) * 6;
				}else if (t >= 0.33){
					return q;
				}else{
					return p + (q - p) * 6 * t;
				}
			};
			q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			p = 2 * l - q;
			r = hue2rgb(p, q, h + 0.33);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 0.33);
		}
		return [(r * 255) | 0, (g * 255) | 0, (b * 255) | 0]; // (x << 0) = Math.floor(x)
	}
	function update(){
		let l = loops;
		const start = Date.now();
		while(l--){
			const corner = corners[Math.floor(Math.random() * corners.length)];
			x = Math.floor((corner.x - x)/2 + x);
			y = Math.floor((corner.y - y)/2 + y);
			max = Math.max(max, ++frame[x+y*frameSize]);
		}
		const duration = Date.now()-start;
		const change = Math.sign(duration - timeThreshold)*multiplier;
		loops -= change;
		if(multiplier != 1 && 0 < change){
			multiplier = Math.max(1, multiplier/10);
		}
		loops = Math.max(1, loops);
		if(post){
			let min = max;
			frame.forEach(i => {
				if(0 < i){
					min = Math.min(min, i);
				}
			});
			const diff = max - min;
			const inverted = settings.cbxInverted;
			let rgb;
			frame.forEach((i, index) => {
				index *= 4;
				let ratio = i ? (i-min)/diff : 0;
				if(settings.cbx3d){
					displacementMap.data[index] =
					displacementMap.data[index+1] =
					displacementMap.data[index+2] = Math.round(ratio*255);
					displacementMap.data[index+3] = i ? 255 : 0;
				}
				settings.heatMode.forEach(o => {
					switch(o){
						default:
						case '7colors':
							if(ratio < 1/7){
								ratio /= 1/7;
								rgb = [255*ratio, 0, 0];
							}else if(6/7 <= ratio){
								ratio = Math.abs(ratio-1);
								ratio /= 1/7;
								rgb = [255*ratio, 255*ratio, 255];
							}else{
								ratio = (ratio - 1/7)/(5/7);
								rgb = hslToRgb(ratio, 1, .5);
							}
							imageData.data[index] = rgb[0];
							imageData.data[index+1] = rgb[1];
							imageData.data[index+2] = rgb[2];
							break;
						case '5colors':
							rgb = hslToRgb(ratio, 1, .5);
							imageData.data[index] = rgb[0];
							imageData.data[index+1] = rgb[1];
							imageData.data[index+2] = rgb[2];
							break;
						case 'grayscale':
							imageData.data[index] =
							imageData.data[index+1] =
							imageData.data[index+2] = Math.round(ratio*255);
							break;
						case 'mono':
							imageData.data[index] =
							imageData.data[index+1] =
							imageData.data[index+2] = ratio ? 255 : 0;
							break;
					}
					if(inverted){
						imageData.data[index] = 255-imageData.data[index];
						imageData.data[index+1] = 255-imageData.data[index+1];
						imageData.data[index+2] = 255-imageData.data[index+2];
					}
				});
				imageData.data[index+3] = i ? 255 : 0;
			});
			const returnData = {
				texture: imageData
			};
			if(settings.cbx3d){
				returnData.displacementMap = displacementMap
			}
			this.postMessage(returnData);
		}
		setTimeout(update, 0);
	}
	this.onmessage = messageEvent => {
		post = true;
		settings = messageEvent.data;
	}
	x = corners[0].x;
	y = corners[0].y;
	const frame = new Array(Math.pow(frameSize,2)).fill(0);
	update();
	this.postMessage(null);
}
