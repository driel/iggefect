iggeffect jQuery plugin for image effect. currently support 10 effects

<h3>usage</h3>
&lt;img src="anything.jpg|png|gif|bmp" id="the_id" alt=""&gt;
<pre>
	$(function(){
		$('#the_id').iggefect('original'); // could be original | grayscale | invert | noise | brightness | treshold | sepia | darken | sharpen | emboss | blur
	});
</pre>

<h3>want to add watermark? here is the code</h3>
<pre>
	$(window).on('load', function(){
		$('#the_id').iggefect('PUT_DESIRED_EFFECT_HERE').addWaterMark('your watermark text', {
			position: 'top-left', // could be top-left | top-right | bottom-left | bottom-right
			color: 'black'
		});
	});
</pre>

<h3>Demo</h3>
<a href="http://dev.mangdariel.web.id/iggefect/example/example.html">here</a> you go

<h3>credit</h3>
<a href="http://www.html5rocks.com/en/tutorials/canvas/imagefilters/">htmlrocks</a> - for convolute implementation