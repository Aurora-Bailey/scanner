<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	let capturing = false;
	let buffer = '';
	let stream: MediaStream | null = null; // <-- Track the stream globally
	let camera: HTMLVideoElement | null = null;
	let hist: any[] = [];

	function scannerListen(event: KeyboardEvent) {
		const char = event.key;

		if (char === '#') {
			capturing = true;
			buffer = '';
			return;
		}

		if (!capturing) return;

		if (char === 'Enter') {
			hist = [...hist, {scan: buffer, image: captureImage()}]
			setTimeout(()=> {
				buffer = '';
			}, 2000)
			capturing = false;
			return;
		}

		if (char.length === 1) {
			buffer += char;
		}
	}



	async function startCamera() {
		const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: { ideal: 'environment' },
    width: { ideal: 720 },   // 💬 These belong INSIDE video
    height: { ideal: 1280 }
  },
  audio: false
});
		camera = document.getElementById('camera') as HTMLVideoElement;
		camera.srcObject = stream;
	}

	function stopCamera() {
		if (!stream) return false;
		stream.getTracks().forEach(track => track.stop()); // 💥 Stop all video tracks
		stream = null;
		camera = null;
	}
	function captureImage(): string | null {
		if (!camera) return null;

		const canvas = document.createElement('canvas');
		canvas.width = camera.videoWidth;
		canvas.height = camera.videoHeight;

		const ctx = canvas.getContext('2d');
		if (!ctx) return null; // If we can't get 2D context, fail safely

		ctx.drawImage(camera, 0, 0, canvas.width, canvas.height);
		return canvas.toDataURL('image/png'); // 📸 Capture the image as base64
	}

	onMount(() => {
		if (typeof window == 'undefined') return false;
		window.addEventListener('keydown', scannerListen);
		startCamera();
	});

	onDestroy(() => {
		if (typeof window == 'undefined') return false;
		window.removeEventListener('keydown', scannerListen);
		stopCamera();
	});
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
  	<div id="log"></div>
 	<!-- svelte-ignore a11y_media_has_caption -->
	<div id="scan-bar">
		<span id="scan">Waiting for scan: {buffer}</span>
		<video id="camera" autoplay playsinline></video>
	</div>
	 {#if hist.length}
	 <div class="gallery">
	   {#each [...hist].reverse() as item, i}
		 <div class="image-card">
			<span id="code">{item.scan}</span>
		   <img src={item.image} alt="Captured image {i + 1}" />
		 </div>
	   {/each}
	 </div>
   {/if}
   
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: top;
		align-items: center;
		flex: 0.6;
	}
	#camera {
		height: 50px;
		margin: 10px;
		border-radius: 10px;
	}
	#scan-bar {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		outline: 1px solid grey;
		border-radius: 20px;
		background-color: white;
		opacity: 0.7;
	}
	#scan {
		font-size: 25pt;
		margin: 10px 20px;
	}
	.gallery {
		padding : 10px;
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: top;
		align-items: center;
	}
	.image-card {
		width: 100%;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		font-size: x-large;
		margin: 10px;
		padding: 10px;
		background-color: rgb(220, 255, 221);
	}
	.image-card img {
		height: 100px;
	}
</style>
