<html>
	<head>
		<meta charset="UTF-8">

		<title>Fractal image generation</title>
		<!-- Inspiration from: Chaos Game - Numberphile <https://youtu.be/kbKtFN71Lfs> -->

		<script type="text/javascript" src="https://platform.linkedin.com/badges/js/profile.js" async defer></script>

		<script>
			'use strict'
			// Settings
			var corners = <?php echo isset($_GET["corners"]) ? intval($_GET["corners"]) : 5; ?>;
			var itterationsPerCorner = <?php echo isset($_GET["itterationsPerCorner"]) ? intval($_GET["itterationsPerCorner"]) : -1; ?>;
			var moveChange = <?php echo isset($_GET["moveChange"]) ? intval($_GET["moveChange"]) : -1; ?>;
			var frameSize = <?php echo isset($_GET["frameSize"]) ? intval($_GET["frameSize"]) : -1; ?>;
			var imageSize = <?php echo isset($_GET["imageSize"]) ? intval($_GET["imageSize"]) : -1; ?>;
			var imageSizeHalf;
			var colorStep = <?php echo isset($_GET["colorStep"]) ? intval($_GET["colorStep"]) : -1; ?>;
			var cornerPlacement = <?php echo isset($_GET["cornerPlacement"]) ? intval($_GET["cornerPlacement"]) : 0; ?>;

			// Elements
			var canvasContext;

			// Variables
			var x;
			var y;

			// Generation
			function onload()
			{
				// Secure settings
				corners = corners < 2 ? 2 : Math.floor(corners);
				itterationsPerCorner = itterationsPerCorner < 1 ? 1000 : Math.floor(itterationsPerCorner);
				frameSize = frameSize < 1 ? 1000 : Math.floor(frameSize);
				imageSize = ((1 < imageSize && imageSize < frameSize) ? imageSize : frameSize*0.99);
				imageSizeHalf = imageSize/2;
				colorStep = colorStep < 1 ? 1 : colorStep;
				cornerPlacement = cornerPlacement < 0 ? 0 : Math.floor(cornerPlacement);	// 0: Even, 1: Random pos, 2: Random angle

				// Set corners
				setCorners(corners);
				x = corners[0][0];
				y = corners[0][1];

				// Set elements
				var canvas = document.getElementById('canvas');
				canvas.width = frameSize;
				canvas.height = frameSize;
				canvasContext = canvas.getContext('2d');
				canvasContext.fillStyle = 'rgba(0, 0, 0, 255)';
				canvasContext.fillRect(0, 0, frameSize, frameSize);

				// Start worker
				if(window.Worker)
				{
					var worker = new Worker("worker.js.php");
					worker.postMessage([corners, canvasContext]);
					worker.onmessage = function(e)
					{
						console.log('Message received from worker');
						console.log(e.data);
					};
				}
				else
				{
					document.body.innerHTML = 'No support for Web Workers.<br>' + document.body.innerHTML;
				}

				// Begin animation
				window.requestAnimationFrame(animate);
			}

			function animate(timespan)
			{
				// Print fractal image
				for(var index = 0; index < corners.length*itterationsPerCorner; index++)
				{
					var corner = corners[Math.floor(Math.random() * corners.length)];
					x = Math.floor((x - corner[0])/2 + corner[0]);
					y = Math.floor((y - corner[1])/2 + corner[1]);

					raisePixel(x, y);
				}

				window.requestAnimationFrame(animate);
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

			function setCorners(numberOfCorners)
			{
				corners = [];

				switch(cornerPlacement)
				{
					default:	// 0: Even
						var cornerAngle = (Math.PI*2) / numberOfCorners;
						var center = frameSize/2;

						for(var index = 0; index < numberOfCorners; index++)
						{
							var dir = cornerAngle * index;
							var x = Math.sin(dir)*imageSizeHalf + center;
							var y = -Math.cos(dir)*imageSizeHalf + center;

							corners.push([x, y]);
						}
						break;

					case 1:	// Random pos
						var margin = (frameSize - imageSize)/2;
						for(var index = 0; index < numberOfCorners; index++)
						{
							var x = Math.floor(Math.random() * imageSize) + margin;
							var y = Math.floor(Math.random() * imageSize) + margin;

							corners.push([x, y]);
						}
						break;

					case 2:	// Random angle
						var center = frameSize/2;

						for(var index = 0; index < numberOfCorners; index++)
						{
							var dir = Math.random() * Math.PI*2;
							var x = Math.sin(dir)*imageSizeHalf + center;
							var y = -Math.cos(dir)*imageSizeHalf + center;

							corners.push([x, y]);
						}
						break;
				}
			}
		</script>
	</head>

	<body onload="onload()">
		<canvas id="canvas"></canvas>
	</body>
</html>
