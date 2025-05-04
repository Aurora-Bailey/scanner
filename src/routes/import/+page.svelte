<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import { scanner } from '$lib/stores/scanner';

	let stream: MediaStream | null = null;
	let camera: HTMLVideoElement;
	let cameras: {
		device: MediaDeviceInfo,
		stream: MediaStream | null,
		videoEl: HTMLVideoElement | null,
		active: boolean
	}[] = [];
	let hist: { scan: string, image: string | null }[] = [];
	let devices: MediaDeviceInfo[] = [];
	let selectedDeviceId: string | null = null

	$: if ($scanner) {
		hist = [...hist, ...cameras.filter(c => c.active).map(c => ({
			scan: $scanner,
			image: captureImage(c.videoEl)
		}))];
	}

	const startCamera = async (cameraObj: { device: MediaDeviceInfo; stream: any; videoEl: any; active: any; }, w = 3840, h = 2160) => {
		if (cameraObj.active) return;

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
		cameraObj.active ? stopCamera(cameraObj) : startCamera(cameraObj);
		cameras = [...cameras]; // triggers reactive update
	};

	const stopCamera = (cameraObj: { device?: MediaDeviceInfo; stream: any; videoEl: any; active: any; }) => {
		cameraObj.stream?.getTracks().forEach((t: { stop: () => any; }) => t.stop());
		cameraObj.stream = null;
		cameraObj.active = false;
		if (cameraObj.videoEl) cameraObj.videoEl.srcObject = null;
	};

	const captureImage = (video: HTMLVideoElement | null) => {
		if (!video) return null;
		const c = document.createElement('canvas');
		c.width = video.videoWidth;
		c.height = video.videoHeight;
		const ctx = c.getContext('2d');
		return ctx ? (ctx.drawImage(video, 0, 0), c.toDataURL('image/png')) : null;
	};

	// onMount(startCamera);
	onMount(async () => {
		await navigator.mediaDevices.getUserMedia({ video: true }); // Trigger permissions
		const allDevices = await navigator.mediaDevices.enumerateDevices();
		devices = allDevices.filter(d => d.kind === 'videoinput');
		cameras = devices.map(d => ({ device: d, stream: null, videoEl: null, active: false }));
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
	<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
		{#each cameras as cam}
			{#if cam.active}
				<!-- svelte-ignore a11y_media_has_caption -->
				<!-- svelte-ignore element_invalid_self_closing_tag -->
				<video
					bind:this={cam.videoEl}
					autoplay
					playsinline
					class="rounded shadow max-w-full"
				/>
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
						<img src={image} alt="Capture {i + 1}" class="h-24 rounded" />
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

