'use strict'
var corners;
var canvasContext;

var onmessage = function(data)
{
	console.log('Message received from main script');
	corners = data[0];
	canvasContext = data[1];
	console.log('Posting message back to main script');
	postMessage(data);
}

while(true)
{
	for(var index = 0; index < corners.length*itterationsPerCorner; index++)
	{
		var corner = corners[Math.floor(Math.random() * corners.length)];
		x = Math.floor((x - corner[0])/2 + corner[0]);
		y = Math.floor((y - corner[1])/2 + corner[1]);

		raisePixel(x, y);
	}
}

function raisePixel(x, y)
{
	var imageData = canvasContext.getImageData(x, y, 1, 1);
	var data = imageData.data;

	for(var i = 0; i < data.length; i += 4)
	{
		if(data[i+1] === 0)
		{
			data[i] += colorStep;
		}

		if(255 <= data[i])
		{
			if(data[i+2] === 0)
			{
				data[i+1] += colorStep;
			}

			if(255 <= data[i+1])
			{
				if(data[i] === 0)
				{
					data[i] -= colorStep;
					data[i+2] += colorStep;
				}
			}

			if(255 <= data[i+2])
			{
				data[i+1] -= colorStep;
			}
		}
	}

	canvasContext.putImageData(imageData, x, y);
}
