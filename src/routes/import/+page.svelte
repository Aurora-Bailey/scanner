<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { scanner } from '$lib/stores/scanner';

	let stream: MediaStream | null = null;
	let camera: HTMLVideoElement;
	let hist: { scan: string, image: string | null }[] = [];

	// $: $scanner && hist.push({ scan: $scanner, image: captureImage() });
	$: if ($scanner) {
		hist = [...hist, {scan: $scanner, image: captureImage()}]
	}

	const startCamera = async () => {
		stream = await navigator.mediaDevices.getUserMedia({
			video: { facingMode: 'environment', width: { ideal: 405 }, height: { ideal: 720 } },
			audio: false
		}), camera.srcObject = stream;
	}

	const stopCamera = () => {
		stream?.getTracks().forEach(t => t.stop()), stream = null;
	}

	const captureImage = () => {
		if (!camera) return null;
		const c = document.createElement('canvas');
		c.width = camera.videoWidth;
		c.height = camera.videoHeight;
		const ctx = c.getContext('2d');
		return ctx ? (ctx.drawImage(camera, 0, 0), c.toDataURL('image/png')) : null;
	};

	onMount(startCamera);
	onDestroy(stopCamera);
</script>

<section class="flex flex-col items-center gap-4 p-4">
	<!-- svelte-ignore a11y_media_has_caption -->
	<!-- svelte-ignore element_invalid_self_closing_tag -->
	<video bind:this={camera} autoplay playsinline class="rounded shadow" />

	{#if hist.length}
		<div class="w-full flex flex-col gap-2">
			{#each [...hist].reverse() as { scan, image }, i}
				<div class="flex items-center justify-between gap-4 p-4 bg-cyan-600 text-lg rounded shadow">
					<!-- 🗑 Trash icon on the left -->
					<button class="text-white hover:text-red-400 transition" aria-label="Delete scan {i + 1}">
						<svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>

					<!-- Scan text -->
					<span class="flex-1 text-white truncate">{scan}</span>

					<!-- Images on the right -->
					<div class="flex gap-1">
						<img src={image} alt="Capture {i + 1}" class="h-24 rounded" />
						<img src={image} alt="Capture {i + 1}" class="h-24 rounded" />
					</div>

					<!-- Checkmark icon -->
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

