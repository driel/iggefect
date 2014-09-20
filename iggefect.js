(function($){
	$.fn.iggefect = function(effect, value){
		var self = this;
		var _opt = {defaultValue:100};
		var context;
		var _effect = 'original';
		if(typeof effect != 'undefined'){
			_effect = effect;
		}
		this.tmpCanvas = document.createElement('canvas');
		this.tmpCtx = this.tmpCanvas.getContext('2d');

		this.convolute = function(pixels, weights, opaque){
			var side = Math.round(Math.sqrt(weights.length));
			var halfSide = Math.floor(side/2);

			var src = pixels.data;
			var sw = pixels.width;
			var sh = pixels.height;

			var w = sw;
			var h = sh;
			var output = self.tmpCtx.createImageData(w, h);
			var dst = output.data;

			var alphaFac = opaque ? 1 : 0;

			for (var y=0; y<h; y++) {
				for (var x=0; x<w; x++) {
					var sy = y;
					var sx = x;
					var dstOff = (y*w+x)*4;
					var r=0, g=0, b=0, a=0;
					for (var cy=0; cy<side; cy++) {
						for (var cx=0; cx<side; cx++) {
							var scy = Math.min(sh-1, Math.max(0, sy + cy - halfSide));
							var scx = Math.min(sw-1, Math.max(0, sx + cx - halfSide));
							var srcOff = (scy*sw+scx)*4;
							var wt = weights[cy*side+cx];
							r += src[srcOff] * wt;
							g += src[srcOff+1] * wt;
							b += src[srcOff+2] * wt;
							a += src[srcOff+3] * wt;
						}
					}
					dst[dstOff] = r;
					dst[dstOff+1] = g;
					dst[dstOff+2] = b;
					dst[dstOff+3] = a + alphaFac*(255-a);
				}
			}
			return output;
		}

		this._original = function(context, img){
			context.drawImage(img, 0, 0, _opt.width, _opt.height);
		}

		this._effect = function(context, img, effect, value){
			context.drawImage(img, 0, 0, _opt.width, _opt.height);
			var imgData = context.getImageData(0, 0, _opt.width, _opt.height);
			for(var i = 0; i < imgData.data.length; i+=4){
				if(effect == 'grayscale'){
					var gray = (imgData.data[i] * 0.3) + (imgData.data[i+1] * 0.71) + (imgData.data[i+2] * 0.07);
					imgData.data[i] = imgData.data[i+1] = imgData.data[i+2] = gray;
				}

				if(effect == 'invert'){
					imgData.data[i] = 255 - imgData.data[i];
					imgData.data[i+1] = 255 - imgData.data[i+1];
					imgData.data[i+2] = 255 - imgData.data[i+2];
				}

				if(effect == 'noise'){
					var r = 0.6 + Math.random() * 0.4;
					var g = 0.6 + Math.random() * 0.4;
					var b = 0.6 + Math.random() * 0.4;

					imgData.data[i] *= (0.99 * r);
					imgData.data[i+1] *= (0.99 * g);
					imgData.data[i+2] *= (0.99 * b);
				}

				if(effect == 'brightness'){
					var brightness = typeof value == 'undefined' ? _opt.defaultValue:value;
					imgData.data[i] += brightness;
					imgData.data[i+1] += brightness;
					imgData.data[i+2] += brightness;
				}

				if(effect == 'treshold'){
					var treshold = typeof value == 'undefined' ? _opt.defaultValue:value;
					var gray = (imgData.data[i] * 0.3) + (imgData.data[i+1] * 0.71) + (imgData.data[i+2] * 0.07);
					var v = gray >= treshold ? 255:0;
					imgData.data[i] = imgData.data[i+1] = imgData.data[i+2] = v;
				}

				if(effect == 'sepia'){
					imgData.data[i] = (imgData.data[i] * 0.39) + (imgData.data[i+1] * 0.76) + (imgData.data[i+2] * 0.18);
					imgData.data[i+1] = (imgData.data[i] * 0.34) + (imgData.data[i+1] * 0.68) + (imgData.data[i+2] * 0.16);
					imgData.data[i+2] = (imgData.data[i] * 0.27) + (imgData.data[i+1] * 0.53) + (imgData.data[i+2] * 0.13);
				}

				if(effect == 'darken'){
					var darkness = typeof value == 'undefined' ? _opt.defaultValue:value;
					imgData.data[i] -= darkness;
					imgData.data[i+1] -= darkness;
					imgData.data[i+2] -= darkness;
				}
			}
			context.putImageData(imgData, 0, 0);
		};

		this._convoluteEffect = function(context, img, effect){
			context.drawImage(img, 0, 0, _opt.width, _opt.height);
			var imgData = context.getImageData(0, 0, _opt.width, _opt.height);
			var metrix = [];

			switch(effect){
				case 'sharpen':
					matrix = [  
						0, -1, 0,
						-1, 5, -1,
						0, -1, 0 
					];
				break;

				case 'emboss':
					matrix = [
						1, 1, 1,
	                	1, 0.7, -1,
	               		-1, -1, -1
               		];
				break;

				case 'blur':
					matrix = [
						1/9, 1/9, 1/9,
	                	1/9, 1/9, 1/9,
	               		1/9, 1/9, 1/9
               		];
				break;
			}

			var imgData = self.convolute(imgData, matrix);

			context.putImageData(imgData, 0, 0);
		};

		this.addWaterMark = function(text, opt){ 
			try{
				// text, color, location
				var maxWidth = 150;
				var x = 20, y = 20;
				context.font = '14px Arial';
				context.fillStyle = opt.hasOwnProperty('color') ? opt.color:'#000000';
				context.textAlign = 'left';

				position = opt.hasOwnProperty('position') ? opt.position:'top-left';
				switch(position){
					case 'top-left':
					x = 20; y = 20;
					break;

					case 'bottom-left':
					x = 20; y = _opt.height - 20;
					break;

					case 'top-right':
					x = _opt.width - 20; y = 20;
					context.textAlign = 'right';
					break;

					case 'bottom-right':
					x = _opt.width - 20; y = _opt.height - 20;
					context.textAlign = 'right';
					break;
				}
				context.fillText(text, x, y);
			}catch(e){
				console.error('context is undefined');
			}
		};
		
		return this.each(function(i){
			var el = $(this); 
			var img = el.get(0);
			var width = el.width();
			var height = el.height();
			var parent = el.parent();

			el.remove();

			// copy to global variable
			_opt.height = height;
			_opt.width = width;

			var canvas = $('<canvas id="iggefect-'+i+'"></canvas>').appendTo(parent).get(0);
			canvas.width = width;
			canvas.height = height;
			context = canvas.getContext('2d');

			switch(_effect){
				case 'original':
				self._original(context, img);
				break;

				case 'grayscale':
				case 'invert':
				case 'noise':
				case 'brightness':
				case 'treshold':
				case 'sepia':
				case 'darken':
				self._effect(context, img, _effect, value);
				break;

				case 'sharpen':
				case 'emboss':
				case 'blur':
				self._convoluteEffect(context, img, effect);
				break;
			}
		});
	};
})(jQuery);