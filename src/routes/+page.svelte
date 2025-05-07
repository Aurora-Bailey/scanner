<script lang="ts">
	import { scanner } from '$lib/stores/scanner';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section class="flex flex-col items-center justify-center p-10">
	<h1>✨ The future is neon ✨</h1>
	<h2>press escape...</h2>
	<p>{$scanner}</p>
</section>

<style>
</style>
