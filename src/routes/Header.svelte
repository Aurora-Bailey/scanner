<script lang="ts">
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';


	let menuOpen = false;
	let prevScroll = 0;
	let visible = true;
	let search = '';
	let selected = 0;
	let inputRef: HTMLInputElement;

	let pages = [
		'Apple', 'Apricot', 'Avocado', 'Banana', 'Blackberry', 'Blueberry', 'Cherry', 'Coconut', 'Cranberry', 'Date',
		'Dragonfruit', 'Durian', 'Fig', 'Grape', 'Guava', 'Kiwi', 'Lemon', 'Lime', 'Lychee', 'Mango',
		'Melon', 'Nectarine', 'Orange', 'Papaya', 'Peach', 'Pear', 'Pineapple', 'Plum', 'Pomegranate', 'Raspberry',
		'Strawberry', 'Tangerine', 'Tomato', 'Watermelon', 'Starfruit', 'Jackfruit', 'Cantaloupe', 'Passionfruit', 'Elderberry', 'Boysenberry',
		'Persimmon', 'Quince', 'Mulberry', 'Currant', 'Salak', 'Longan', 'Soursop', 'Yuzu', 'Kumquat', 'Sapodilla', 'About', 'Import'
	];

	onMount(() => {
		window.addEventListener('scroll', () => {
			const current = window.scrollY;
			visible = current < prevScroll || current < 10;
			prevScroll = current;
		});

		window.addEventListener('keydown', e => {
			if (e.key === 'Escape') {
				visible = true;
				inputRef?.focus();
			}
		});
	});

	$: filtered = pages.filter(f => f.toLowerCase().includes(search.toLowerCase()));
	$: if (selected >= filtered.length) selected = 0;
	$: if (browser) document.body.style.overflow = (menuOpen || search.length > 0) ? 'hidden' : 'auto';

	function handleKey(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') selected = (selected + 1) % filtered.length;
		if (e.key === 'ArrowUp') selected = (selected - 1 + filtered.length) % filtered.length;
		if (e.key === 'Enter' && filtered.length > 0 && search != '') {
			goto(`${base}/${filtered[selected].toLowerCase()}`);
			search = '';
			selected = 0;
		}
	}

	function closeAll() {
		menuOpen = false;
		search = '';
	}
</script>

<!-- FOG OVERLAY -->
{#if menuOpen || search.length > 0}
	<!-- A11y: avoid tabindex values above zero -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div on:click={closeAll} class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"></div>
{/if}

<header class={`fixed bottom-0 left-0 right-0 opacity-90 bg-zinc-950 text-cyan-400 pb-5 transition-transform duration-300 z-50 ${visible ? 'translate-y-0' : 'translate-y-full'}`}>
	<!-- Search or Menu -->
	{#if search.length > 0}
	<nav class="bg-zinc-900 overflow-hidden">
		<ul class="flex flex-col divide-y divide-cyan-800 max-h-[50vh] overflow-y-auto">
			{#each filtered as page, i}
			<li>
				<a 
					href="{base}/{page.toLowerCase()}" 
					on:click={() => (search = '', selected = 0)}
					class="block p-4 transition-colors duration-200 cursor-pointer {selected === i ? 'bg-cyan-800/20' : 'hover:bg-cyan-800/20'}"
				>
					{page}
				</a>
			</li>
			{/each}
		</ul>
	</nav>
	{:else}
	<nav class={`overflow-hidden bg-zinc-900 transition-all duration-300 ${menuOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
		<ul class="flex flex-col divide-y divide-cyan-800">
			<li><a href="{base}/" on:click={closeAll} class="block p-4 hover:bg-cyan-800/20" aria-current={$page.url.pathname === `${base}/` ? 'page' : undefined}>Home</a></li>
			<li><a href="{base}/about" on:click={closeAll} class="block p-4 hover:bg-cyan-800/20" aria-current={$page.url.pathname === `${base}/about` ? 'page' : undefined}>About</a></li>
			<li><a href="{base}/sverdle" on:click={closeAll} class="block p-4 hover:bg-cyan-800/20" aria-current={$page.url.pathname.startsWith(`${base}/sverdle`) ? 'page' : undefined}>Sverdle</a></li>
		</ul>
	</nav>
	{/if}

	<!-- Bottom Bar -->
	<div class="flex items-center justify-between p-3 bg-zinc-950">
		<input
			bind:this={inputRef}
			type="text"
			bind:value={search}
			on:keydown={handleKey}
			placeholder="Search pages..."
			class="flex-1 mx-4 px-3 py-1 rounded bg-zinc-800 text-cyan-200 placeholder-cyan-500 border border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
		/>

		<button on:click={() => (menuOpen = !menuOpen)} aria-label="Toggle menu" class="relative w-8 h-8 flex flex-col justify-center items-center space-y-1.5">
			<span class="w-6 h-0.5 bg-cyan-400 transition-all duration-300" class:rotate-45={menuOpen} class:translate-y-1.5={menuOpen}></span>
			<span class="w-6 h-0.5 bg-cyan-400 transition-all duration-300" class:opacity-0={menuOpen}></span>
			<span class="w-6 h-0.5 bg-cyan-400 transition-all duration-300" class:-rotate-45={menuOpen} class:-translate-y-1.5={menuOpen}></span>
		</button>
	</div>
</header>
