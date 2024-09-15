<script lang="ts">
	import { aptos } from '$lib/aptos.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { shortenAddress } from '$lib/helpers';
	import type { IP } from '$lib/types.ts';
	import { wallet } from '$lib/walletStore.js';
	import { onMount } from 'svelte';
	export let data;

	const ipAssets = data.ipAssets;
	const nftLicenseCollectionContractAddress = import.meta.env
		.VITE_NFTLICENSE_COLLECTION_CONTRACT_ADDRESS;

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
				<div class="rounded-lg p-4 transition-all duration-300">
					<img src={ip.image} alt={ip.name} class="w-full h-48 object-cover rounded-md mb-2" />
					<h3 class="text-lg font-semibold">{ip.name}</h3>
					<p class="text-sm text-gray-600">{shortenAddress(ip.address, 12)}</p>
				</div>
			{/each}
		</div>
	{:else}
		<p class="mt-4 text-gray-600">No IP items available.</p>
	{/if}
	<div class="flex justify-between my-12">
		<div class="text-2xl font-bold">Your Licenses</div>
	</div>
	{#if $wallet.connected}
		{#await getLicenses()}
			<div>Loading...</div>
		{:then licenses}
			{#if licenses.length > 0}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
					{#each licenses as license}
						{#if license.current_token_data}
							<div class="flex items-center">
								{#await fetch(license.current_token_data.token_uri).then( (res) => res.json() ) then imageData}
									<!-- svelte-ignore a11y-missing-attribute -->
									<img
										src={imageData.image}
										alt="wh"
										class="w-24 h-24 object-cover rounded-lg shadow-md mr-4"
									/>
								{/await}
								<div class="flex-1">
									<h3 class="text-lg font-semibold">{license.current_token_data?.token_name}</h3>
									<p class="text-sm text-gray-600">
										{shortenAddress(license.token_data_id, 12)}
									</p>
								</div>
							</div>
						{/if}
					{/each}
				</div>
			{:else}
				<p class="mt-4 text-gray-600">No licenses available.</p>
			{/if}
		{/await}
	{/if}
</div>
