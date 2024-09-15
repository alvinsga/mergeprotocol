<script lang="ts">
	import { aptos } from '$lib/aptos.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { shortenAddress } from '$lib/helpers';
	import type { IP } from '$lib/types.ts';
	import { wallet } from '$lib/walletStore.js';
	import { onMount } from 'svelte';
	export let data;

	const nftLicenseCollectionContractAddress = import.meta.env.VITE_NFTLICENSE_ADDRESS;

	const ipAssets = data.ipAssets;
	onMount(() => {
		getLicenses();
	});

	async function getLicenses() {
		const licenseNFTArray = await aptos.getAccountOwnedTokensFromCollectionAddress({
			collectionAddress: nftLicenseCollectionContractAddress,
			accountAddress: `${$wallet.account?.address}`
		});
		return licenseNFTArray;
	}
</script>

<div class="mt-6 max-w-5xl mx-auto p-5">
	<div class="text-2xl font-bold">Your IP</div>

	{#if ipAssets.length > 0}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
			{#each ipAssets as ip}
				<div class="rounded-lg p-4 transition-all duration-300 hover:shadow-md hover:bg-gray-50">
					<img src={ip.image} alt={ip.name} class="w-full h-48 object-cover rounded-md mb-2" />
					<h3 class="text-lg font-semibold">{ip.name}</h3>
					<p class="text-sm text-gray-600">{shortenAddress(ip.address, 12)}</p>
					<p class="text-sm text-gray-600">{ip.license}</p>
				</div>
			{/each}
		</div>
	{:else}
		<p class="mt-4 text-gray-600">No IP items available.</p>
	{/if}
	<div class="flex justify-between my-12">
		<div class="text-2xl font-bold">Your Licenses</div>
	</div>
	{#await getLicenses()}
		<div>Loading...</div>
	{:then licenses}
		{#if licenses.length > 0}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
				{#each licenses as license}
					<div class="rounded-lg p-4 transition-all duration-300 hover:shadow-md hover:bg-gray-50">
						<h3 class="text-lg font-semibold">{license.current_token_data?.token_name}</h3>
						<p class="text-sm text-gray-600">
							{license.current_token_data?.description}
						</p>
						<p class="text-sm text-gray-600">
							{shortenAddress(license.token_data_id, 12)}
						</p>
					</div>
				{/each}
			</div>
		{:else}
			<p class="mt-4 text-gray-600">No licenses available.</p>
		{/if}
	{/await}
</div>
