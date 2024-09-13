<script lang="ts">
	import { page } from '$app/stores';
	import { aptos } from '$lib/aptos';
	import { Button } from '$lib/components/ui/button';
	import { shortenAddress } from '$lib/helpers';
	import { defaultLicenses } from '$lib/license';
	import type { MoveValue } from '@aptos-labs/ts-sdk';
	import { onMount } from 'svelte';

	const moduleAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
	const moduleName = import.meta.env.VITE_MODULE_NAME;

	const tokenId = $page.params.id;
	let tokenData: any;

	let childRels: MoveValue = [];

	async function runAptosViewFunction(functionName: string, functionArguments: any[]) {
		try {
			return await aptos.view({
				payload: {
					function: `${moduleAddress}::${moduleName}::${functionName}`,
					typeArguments: [],
					functionArguments: functionArguments
				}
			});
		} catch (error) {
			console.log('Not found');
		}
	}

	async function getChildToken() {
		const functionName = 'get_ip_owners';
		const tokenId = $page.params.id;
		childRels = runAptosViewFunction(functionName, [tokenId]);
	}

	async function getLicenses() {
		const functionName = 'get_license';
		const tokenId = $page.params.id;
		return (await runAptosViewFunction(functionName, [tokenId])) as Array<any>;
	}

	async function getParentRelationships() {
		const functionName = 'get_ip_owners';
		const tokenId = $page.params.id;
		childRels = runAptosViewFunction(functionName, [tokenId]);
	}

	async function mintLicense() {
		// Pay for license
		// Mint NFT
	}

	async function getTokenData() {
		return await aptos.getDigitalAssetData({ digitalAssetAddress: tokenId });
	}

	onMount(async () => {
		tokenData = await getTokenData();
	});
</script>

{#if tokenData}
	<div class="flex p-8 mb-24">
		<div class="w-1/2 pr-4">
			{#await fetch(tokenData.token_uri).then((res) => res.json()) then imageData}
				<!-- svelte-ignore a11y-missing-attribute -->
				<img src={imageData.image} class="w-full rounded-lg shadow-lg" />
			{/await}
		</div>
		<div class="w-1/2 pl-4">
			<h1 class="text-3xl font-bold mb-2">{tokenData.token_name || 'N/A'}</h1>
			<p class="text-gray-600 mb-4">{tokenData.description || 'N/A'}</p>
			<p class="text-sm text-gray-500 mb-6">
				Token ID: {shortenAddress(tokenData.token_data_id, 12) || 'N/A'}
			</p>

			<h2 class="text-xl font-semibold mb-3">Licenses</h2>
			{#await getLicenses()}
				<p>Loading licenses...</p>
			{:then licenses}
				{#if licenses?.length > 0}
					<ul class="space-y-4">
						{#each licenses[0] as id}
							<li class="flex justify-between items-center border-b pb-2">
								<div>
									<h3 class="font-medium">{defaultLicenses[id].name}</h3>
									<p class="text-sm text-gray-600">{defaultLicenses[id].description}</p>
								</div>
								<Button class="text-sm">Buy</Button>
							</li>
						{/each}
					</ul>
				{:else}
					<p>No licenses available.</p>
				{/if}
			{:catch error}
				<p>No licenses available.</p>
			{/await}

			<div class="mt-6">
				<h2 class="text-xl font-semibold mb-3">Related IPs</h2>
				<div class="mb-2">
					<span class="font-medium">Derivatives:</span>
					{childRels}
				</div>
				<div>
					<span class="font-medium">Parent IP:</span>
					{childRels}
				</div>
			</div>

			<!-- <Button href="/app/{tokenId}/addlicense" class="mt-6">Add License</Button> -->
		</div>
	</div>
{:else}
	<p>Loading token data...</p>
{/if}
