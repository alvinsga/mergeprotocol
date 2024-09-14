<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { shortenAddress } from '$lib/helpers';
	import { defaultLicenses } from '$lib/license';
	import type { IP } from '$lib/types.ts';
	import { onMount } from 'svelte';

	let ipArray: IP[] = [];
	let filterLicenseId = '';

	function handleFilter() {
		if (filterLicenseId === '') {
			noFilter();
		} else {
			filterMarketplace();
		}
	}

	async function filterMarketplace() {
		try {
			const response = await fetch('/api/readRecordDB', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					collection: 'ipassets',
					filter: `license~${filterLicenseId}`
				})
			});

			if (!response.ok) {
				throw new Error('Failed to fetch data');
			}

			const result = await response.json();
			ipArray = result.items;
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	}

	async function noFilter() {
		try {
			const response = await fetch('/api/readRecordDB', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					collection: 'ipassets'
				})
			});

			if (!response.ok) {
				throw new Error('Failed to fetch data');
			}

			const result = await response.json();
			ipArray = result.items;
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	}

	onMount(() => {
		noFilter();
	});
</script>

<div class="my-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
	<h1 class="text-3xl font-bold mb-6">Marketplace</h1>
	<div class="mb-6 flex flex-wrap gap-2">
		<button
			class="px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ease-in-out"
			class:bg-blue-500={filterLicenseId === ''}
			class:text-white={filterLicenseId === ''}
			class:bg-gray-200={filterLicenseId !== ''}
			class:text-gray-700={filterLicenseId !== ''}
			on:click={() => {
				filterLicenseId = '';
				handleFilter();
			}}
		>
			All
		</button>
		{#each Object.entries(defaultLicenses) as [id, license]}
			<button
				class="px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ease-in-out"
				class:bg-blue-500={filterLicenseId === id}
				class:text-white={filterLicenseId === id}
				class:bg-gray-200={filterLicenseId !== id}
				class:text-gray-700={filterLicenseId !== id}
				on:click={() => {
					filterLicenseId = id;
					handleFilter();
				}}
			>
				{license.name}
			</button>
		{/each}
	</div>

	{#if ipArray.length > 0}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{#each ipArray as ip}
				<a
					href="/app/{ip.address}"
					class="bg-white rounded-lg shadow-md overflow-hidden block transition-transform duration-300 hover:scale-105"
				>
					<img src={ip.image} alt={ip.name} class="w-full h-48 object-cover" />
					<div class="p-4">
						<h3 class="text-lg font-semibold mb-2">{ip.name}</h3>
						<p class="text-sm text-gray-600 mb-2">Address: {shortenAddress(ip.address, 8)}</p>
						<p class="text-sm text-gray-600">
							{#each ip.license as licenseId}
								<Badge variant="secondary" class="mr-1">
									{defaultLicenses[licenseId]?.name || 'Unknown'}
								</Badge>
							{/each}
						</p>
					</div>
				</a>
			{/each}
		</div>
	{:else}
		<p class="mt-4 text-gray-600">Loading...</p>
	{/if}
</div>
