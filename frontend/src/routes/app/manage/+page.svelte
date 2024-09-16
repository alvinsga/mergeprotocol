<script lang="ts">
	import { aptos } from '$lib/aptos.js';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { runAptosViewFunction, shortenAddress } from '$lib/helpers';
	import type { IP } from '$lib/types.ts';
	import { wallet } from '$lib/walletStore.js';
	import { onMount } from 'svelte';
	export let data;

	const ipAssets = data.ipAssets;
	let currentIPAssetLoadedForLicense: any;
	const nftLicenseCollectionContractAddress = import.meta.env
		.VITE_NFTLICENSE_COLLECTION_CONTRACT_ADDRESS;

	async function getLicenses() {
		const licenseNFTArray = await aptos.getAccountOwnedTokensFromCollectionAddress({
			collectionAddress: nftLicenseCollectionContractAddress,
			accountAddress: `${$wallet.account?.address}`
		});
		return licenseNFTArray;
	}

	async function getIPAsset(licenseAssetId: string) {
		if (currentIPAssetLoadedForLicense) {
			currentIPAssetLoadedForLicense = undefined;
		}
		const response = await runAptosViewFunction('get_NFTLicense_data', [licenseAssetId]);
		if (!response) return;
		if (!response[0]) return;
		const assetId = (response[0] as any).asset;
		console.log(assetId);
		currentIPAssetLoadedForLicense = await aptos.getDigitalAssetData({
			digitalAssetAddress: assetId
		});
		console.log(currentIPAssetLoadedForLicense);
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
							<Accordion.Root class="w-full">
								<Accordion.Item value="license-info">
									<Accordion.Trigger
										on:click={() => {
											getIPAsset(license.token_data_id);
										}}
									>
										<div class="flex items-center">
											<!-- svelte-ignore a11y-missing-attribute -->
											<img
												src="https://fuchsia-subtle-bison-841.mypinata.cloud/ipfs/QmRCjYKNfha2zVYi84HEpziMLBAQ8FuRNTdXfqkgMymVwC"
												alt="wh"
												class="w-8 h-8 object-cover rounded-lg shadow-md mr-4"
											/>

											<div class="flex flex-col items-start">
												<h3 class="text-lg font-semibold">
													{license.current_token_data?.token_name}
												</h3>
												<p class="text-sm text-gray-600">
													{shortenAddress(license.token_data_id, 12)}
												</p>
											</div>
										</div>
									</Accordion.Trigger>
									<Accordion.Content>
										{#if currentIPAssetLoadedForLicense}
											<div class="flex items-center ml-12">
												<!-- svelte-ignore a11y-missing-attribute -->

												{#await fetch(currentIPAssetLoadedForLicense.token_uri).then( (res) => res.json() ) then imageData}
													<!-- svelte-ignore a11y-missing-attribute -->
													<img
														src={imageData.image}
														alt="wh"
														class="w-8 h-8 object-cover rounded-lg shadow-md mr-4"
													/>
												{/await}

												<div class="flex flex-col items-start">
													<h3 class="text-lg font-semibold">
														{currentIPAssetLoadedForLicense.token_name}
													</h3>
													<p class="text-sm text-gray-600">
														{shortenAddress(currentIPAssetLoadedForLicense.token_data_id, 12)}
													</p>
												</div>
											</div>
										{/if}
										<Button class="mt-4" href="/app/create/derivative"
											>Create Derivative Work</Button
										>
									</Accordion.Content>
								</Accordion.Item>
							</Accordion.Root>
						{/if}
					{/each}
				</div>
			{:else}
				<p class="mt-4 text-gray-600">No licenses available.</p>
			{/if}
		{/await}
	{/if}
</div>
