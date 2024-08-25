<script lang="ts">
	import type { IP } from '$lib/types.ts';
	import type { PageData } from './$types';

	export let data: PageData;

	const ipArray: IP[] = data.ipAssets;
</script>

<div class="flex justify-between">
	<div class="text-2xl font-bold">Marketplace</div>
</div>

<div class="mt-12 max-w-5xl mx-auto">
	{#if ipArray.length > 0}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
			{#each ipArray as ip}
				<a href="/app/{ip.id}" class="border rounded-lg p-4 shadow-sm">
					<img src={ip.image} alt={ip.name} class="w-full h-40 object-cover rounded-md mb-2" />
					<h3 class="text-lg font-semibold">{ip.name}</h3>
					<p class="text-sm text-gray-600">Address: {ip.address}</p>
					<p class="text-sm text-gray-600">License: {ip.license}</p>
				</a>
			{/each}
		</div>
	{:else}
		<p class="mt-4 text-gray-600">No IP items available.</p>
	{/if}
</div>
