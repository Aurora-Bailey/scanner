<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import { scanner } from '$lib/stores/scanner';

	let cameras: {
		device: MediaDeviceInfo,
		stream: MediaStream | null,
		videoEl: HTMLVideoElement | null,
		active: boolean,
		rotation: 0,
		landscape: true
	}[] = [];
	let hist: { scan: string, image: string[] }[] = [];
	let devices: MediaDeviceInfo[] = [];

	$: if ($scanner) {
		const images = cameras
			.filter(c => c.active && c.videoEl)
			.map(c => captureImage(c.videoEl, c.rotation))
			.filter((img): img is string => !!img);

		hist = [...hist, { scan: $scanner, image: images }];
	}


	const rotateCamera = (cameraObj: { rotation: number; }) => {
		cameraObj.rotation = (cameraObj.rotation + 90) % 360;
		cameras = [...cameras]; // Trigger reactivity
	};

	const startCamera = async (cameraObj: { device: MediaDeviceInfo; stream: any; videoEl: any; active: any; landscape: any; }, w = 3840, h = 2160) => {
		if (cameraObj.active) return;

		// Swap width and height if in portrait mode
		if (!cameraObj.landscape) {
			[w, h] = [h, w]; // cleaner swap
		}

		console.log(w, h)
		cameraObj.stream = await navigator.mediaDevices.getUserMedia({
			video: {
				deviceId: { exact: cameraObj.device.deviceId },
				width: { ideal: w },
				height: { ideal: h }
			},
			audio: false
		});
		cameraObj.active = true;
		cameras = [...cameras]; // trigger Svelte reactivity
		await tick()
		if (cameraObj.videoEl) cameraObj.videoEl.srcObject = cameraObj.stream;
	};

	const toggleCamera = (cameraObj: any) => {
		if (cameraObj.landscape && cameraObj.active) {
			stopCamera(cameraObj);
			cameraObj.landscape = false;
			tick();
			startCamera(cameraObj);
		} else if (cameraObj.active) {
			stopCamera(cameraObj)
			cameraObj.landscape = true;
		 } else {
			startCamera(cameraObj);
		 }
		
		cameras = [...cameras]; // triggers reactive update
	};

	const stopCamera = (cameraObj: { device?: MediaDeviceInfo; stream: any; videoEl: any; active: any; }) => {
		cameraObj.stream?.getTracks().forEach((t: { stop: () => any; }) => t.stop());
		cameraObj.stream = null;
		cameraObj.active = false;
		if (cameraObj.videoEl) cameraObj.videoEl.srcObject = null;
	};

	// const captureImage = (video: HTMLVideoElement | null) => {
	// 	if (!video) return null;
	// 	const c = document.createElement('canvas');
	// 	c.width = video.videoWidth;
	// 	c.height = video.videoHeight;
	// 	const ctx = c.getContext('2d');
	// 	return ctx ? (ctx.drawImage(video, 0, 0), c.toDataURL('image/png')) : null;
	// };
	const captureImage = (video: HTMLVideoElement | null, rotation: number = 0) => {
		if (!video) return null;

		const width = video.videoWidth;
		const height = video.videoHeight;

		const c = document.createElement('canvas');
		const ctx = c.getContext('2d');

		// Adjust canvas size based on rotation
		if (rotation % 180 === 0) {
			c.width = width;
			c.height = height;
		} else {
			c.width = height;
			c.height = width;
		}

		if (!ctx) return null;

		// Apply rotation and draw the image
		ctx.save();
		ctx.translate(c.width / 2, c.height / 2);
		ctx.rotate((rotation * Math.PI) / 180);
		ctx.drawImage(video, -width / 2, -height / 2);
		ctx.restore();

		return c.toDataURL('image/png');
	};

	// onMount(startCamera);
	onMount(async () => {
		await navigator.mediaDevices.getUserMedia({ video: true }); // Trigger permissions
		const allDevices = await navigator.mediaDevices.enumerateDevices();
		devices = allDevices.filter(d => d.kind === 'videoinput');
		cameras = devices.map(d => ({ device: d, stream: null, videoEl: null, active: false, rotation: 0, landscape: true }));
	});
	onDestroy(() => {
		cameras.forEach(c => stopCamera(c));
	});
</script>

<section class="flex flex-col items-center gap-4 p-4">

	<!-- Toggle Buttons -->
	<div class="flex flex-wrap justify-center gap-2">
		{#each cameras as cam}
			<button
				class="px-4 py-2 rounded shadow transition"
				class:bg-green-700={cam.active}
				class:bg-gray-800={!cam.active}
				class:text-white={true}
				on:click={() => toggleCamera(cam)}
			>
				{cam.device.label || 'Unnamed Camera'} {cam.active ? '🟢' : '⚪'}
			</button>
		{/each}
	</div>

	<!-- Video Feeds -->
	<div class="flex items-center justify-between gap-4 p-4 text-lg rounded shadow">
		{#each cameras as cam}
			{#if cam.active}
				<div>
					<!-- svelte-ignore a11y_media_has_caption -->
					<!-- svelte-ignore element_invalid_self_closing_tag -->
					<video
						bind:this={cam.videoEl}
						autoplay
						playsinline
						on:click={() => rotateCamera(cam)}
						class="rounded shadow transition-transform duration-300 cursor-pointer"
						style="transform: rotate({cam.rotation}deg);"
					/>

				</div>
				
			{/if}
		{/each}
	</div>

	<!-- Scan History -->
	{#if hist.length}
		<div class="w-full flex flex-col gap-2 mt-6">
			{#each [...hist].reverse() as { scan, image }, i}
				<div class="flex items-center justify-between gap-4 p-4 bg-cyan-600 text-lg rounded shadow">
					<button class="text-white hover:text-red-400 transition" aria-label="Delete scan {i + 1}">
						<svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>

					<span class="flex-1 text-white truncate">{scan}</span>

					<div class="flex gap-1">
						{#each image as im}
							<img src={im} alt="Capture {i + 1}" class="h-24 rounded" />
						{/each}
					</div>

					<button aria-label="Confirm scan {i + 1}" class="hover:text-lime-400 transition">
						<svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
						</svg>
					</button>
				</div>
			{/each}
		</div>
	{/if}
</section>

