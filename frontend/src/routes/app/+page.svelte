<script lang="ts">
	import { shortenAddress } from '$lib/helpers';
	import type { IP } from '$lib/types.ts';
	import type { PageData } from './$types';

	export let data: PageData;

	const ipArray: IP[] = data.ipAssets;
</script>

<div class="mt-12 max-w-5xl mx-auto p-3">
	{#if ipArray.length > 0}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
			{#each ipArray as ip}
				<a
					href="/app/{ip.address}"
					class="rounded-lg p-4 transition-all duration-300 hover:shadow-md hover:bg-gray-50"
				>
					<img src={ip.image} alt={ip.name} class="w-full h-48 object-cover rounded-md mb-2" />
					<h3 class="text-lg font-semibold">{ip.name}</h3>
					<p class="text-sm text-gray-600">Address: {shortenAddress(ip.address, 12)}</p>
					<p class="text-sm text-gray-600">License: {ip.license}</p>
				</a>
			{/each}
		</div>
	{:else}
		<p class="mt-4 text-gray-600">No IP items available.</p>
	{/if}
</div>
