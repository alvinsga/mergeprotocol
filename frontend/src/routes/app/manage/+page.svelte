<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import type { IP } from '$lib/types.ts';
	const ipArray: IP[] = [
		{
			id: '1',
			name: 'IP 1',
			image: 'https://via.placeholder.com/150',
			address: '0x1',
			license: 'free'
		},
		{
			id: '2',
			name: 'IP 2',
			image: 'https://via.placeholder.com/150',
			address: '0x2',
			license: 'free'
		},
		{
			id: '3',
			name: 'IP 3',
			image: 'https://via.placeholder.com/150',
			address: '0x3',
			license: 'free'
		}
	];
</script>

<div class="flex justify-between">
	<div class="text-2xl font-bold">Your IP</div>
</div>

<div class="mt-12 max-w-5xl mx-auto">
	{#if ipArray.length > 0}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
			{#each ipArray as ip}
				<a href="/app/edit/{ip.id}" class="border rounded-lg p-4 shadow-sm">
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
