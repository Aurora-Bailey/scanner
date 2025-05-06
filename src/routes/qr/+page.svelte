<script lang="ts">
	import { onMount } from 'svelte';
	import { toDataURL } from 'qrcode';

	let strings: string[] = [
		'https://aurora-bailey.github.io/scanner',
		'hello-world',
		'hwab://item/123',
		'https://github.com/Aurora-Bailey'
	];

	let qrcodes: { text: string; dataUrl: string }[] = [];

	const options = {
		errorCorrectionLevel: 'H',
		margin: 2,
		scale: 8,
		color: {
			dark: '#00ffff',         // Cyan
			light: '#0f172a'         // Tailwind slate-900 (dark blue-black)
		}
	};

	onMount(() => {
		generateQRCodes();
	});

	async function generateQRCodes() {
		qrcodes = await Promise.all(
			strings.map(async (text) => {
                // @ts-ignore
				const dataUrl = await toDataURL(text, options);
				return { text, dataUrl };
			})
		);
	}
</script>

<style>
</style>

<section class="min-h-screen w-full px-6 py-12 text-white">
	<h1 class="text-3xl font-bold text-cyan-400 text-center mb-10 drop-shadow-lg">
		✨ QR Generator
	</h1>

	<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
		{#each qrcodes as { text, dataUrl }, i}
			<div class="bg-slate-800 rounded-2xl shadow-lg p-4 flex flex-col items-center hover:scale-[1.02] transition-transform">
				<img src={dataUrl} alt="QR for {text}" class="w-48 h-48 object-contain mb-4 border-2 border-cyan-400 rounded" />
				<code class="text-xs text-cyan-200 break-all text-center mb-2">{text}</code>
				<a
					href={dataUrl}
					download={`qr-${i + 1}.png`}
					class="text-sm px-3 py-1 bg-cyan-600 hover:bg-cyan-500 rounded text-black font-semibold shadow"
				>
					⬇ Download
				</a>
			</div>
		{/each}
	</div>
</section>
