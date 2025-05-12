<script lang="ts">
	import { onMount } from 'svelte';
	import { toDataURL } from 'qrcode';
	import JsBarcode from 'jsbarcode';
	import { jsPDF } from 'jspdf';
    import { browser } from '$app/environment';

    $: if (browser && start >= 0 && count > 0 && typeof unique !== 'undefined') {
        generateLabels();
    }


	// 🔗 Base URL for QR codes
	const qrPrepend = "https://hwab.com/i/";

	// 🔣 Inputs
	let start = 1000;
	let count = 50;
	let unique = true;

	// 🧾 Final image data
	let items: string[] = [];
	let labels: { text: string; dataUrl: string }[] = [];

	const qrOptions = {
		errorCorrectionLevel: 'L' as const,
		margin: 0,
		scale: 4,
		color: {
			dark: '#000000',
			light: '#ffffff'
		}
	};

	// 🖨️ Generate PDF
	function exportToPDF() {
		const pdf = new jsPDF({
			orientation: 'portrait',
			unit: 'pt',
			format: [300, labels.length * 90]
		});

		labels.forEach(({ dataUrl }, i) => {
			const y = i * 90;
			pdf.addImage(dataUrl, 'PNG', 30, y + 10, 240, 80);
		});

		pdf.save('labels.pdf');
	}

	// 🛠️ Generate item IDs and render them
	async function generateLabels() {
		items = [];
		for (let i = 0; i < count; i++) {
            let n = start + (unique ? i : 0);
			const letter = String.fromCharCode((n % 26) + 65);
			const prefix = unique ? "H-" : "H+";
			items.push(`${prefix}${n}-${letter}`);
		}

		labels = await Promise.all(
			items.map(async (text) => {
				const barcodeCanvas = document.createElement('canvas');
				JsBarcode(barcodeCanvas, text, {
					format: 'CODE39',
					width: 1.5,
					height: 40,
					displayValue: false,
					margin: 0,
					background: '#ffffff',
					lineColor: '#000000'
				});

				const qrDataUrl = await toDataURL(qrPrepend + text, qrOptions);
				const qrImg = new Image();
				qrImg.src = qrDataUrl;
				await qrImg.decode();

				const scale = 4;
				const canvasWidth = 240 * scale;
				const canvasHeight = 80 * scale;

				const finalCanvas = document.createElement('canvas');
				finalCanvas.width = canvasWidth;
				finalCanvas.height = canvasHeight;

				const ctx = finalCanvas.getContext('2d')!;
				ctx.scale(scale, scale);
				ctx.fillStyle = '#ffffff';
				ctx.fillRect(0, 0, canvasWidth, canvasHeight);

				// Barcode
				ctx.drawImage(barcodeCanvas, 5, 5, 110, 40);
				ctx.font = '12px "Noto Serif JP", serif';
				ctx.fillStyle = '#000';
				ctx.textAlign = 'center';
				ctx.fillText(text, 60, 60);

				// QR Code
				ctx.drawImage(qrImg, 145, 2, 70, 70);

				// Vertical text (kanji-style)
				ctx.save();
				ctx.translate(225, 10);
				ctx.rotate(Math.PI / 2);
				ctx.textAlign = 'left';
				ctx.fillText(text, 0, 0);
				ctx.restore();

				return { text, dataUrl: finalCanvas.toDataURL() };
			})
		);
	}

	// ⚡ Auto-generate on mount (or call manually)
	onMount(() => {
		generateLabels();
	});
</script>

<svelte:head>
	<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP&display=swap" rel="stylesheet" />
</svelte:head>

<section class="text-white print:p-0 p-4 print:absolute top-0 bottom-0 right-0 left-0 print:scroll-auto">
	<!-- Controls -->
	<div class="print:hidden text-white flex flex-row gap-2 sm:flex-row sm:items-end mb-4">
		<div class="flex flex-col">
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label class="text-sm font-medium">Start</label>
			<input type="number" bind:value={start} class="border p-1 rounded" />
		</div>

		<div class="flex flex-col">
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label class="text-sm font-medium">Count</label>
			<input type="number" bind:value={count} class="border p-1 rounded" />
		</div>

		<div class="flex flex-col">
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label class="text-sm font-medium">Unique</label>
			<input type="checkbox" bind:checked={unique} class="h-5 w-5" />
		</div>

        <button on:click={() => window.print()} class="bg-black text-white px-4 py-2 rounded shadow">
            📄 Print
        </button>
		<button on:click={exportToPDF} class="bg-black text-white px-4 py-2 rounded shadow">
			💾 PDF
		</button>
	</div>

	<!-- Rendered Labels -->
	<div class="grid text-black grid-cols-5 w-[2550px] h-[3300px] grid-rows-10 gap-0">
		{#each labels as { dataUrl }, i}
			<img src={dataUrl} alt="Label {i}" class="w-[100%] h-[100%]" style="" />
		{/each}
	</div>
</section>

