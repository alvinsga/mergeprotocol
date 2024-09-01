<script lang="ts">
	import { page } from '$app/stores';
	import { aptos } from '$lib/aptos';
	import { Button } from '$lib/components/ui/button';
	import type { MoveValue } from '@aptos-labs/ts-sdk';
	import { onMount } from 'svelte';

	const moduleAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
	const moduleName = import.meta.env.VITE_MODULE_NAME;

	const tokenId = $page.params.id;
	let tokenData: any;

	let childRels: MoveValue = [];

	async function runAptosViewFunction(functionName: string, functionArguments: string) {
		try {
			return await aptos.view({
				payload: {
					function: `${moduleAddress}::${moduleName}::${functionName}`,
					typeArguments: [],
					functionArguments: [functionArguments]
				}
			});
		} catch (error) {
			console.error('Error calling view function:', error);
			throw error;
		}
	}

	async function getChildToken() {
		const functionName = 'get_ip_owners';
		const tokenId = $page.params.id;
		childRels = runAptosViewFunction(functionName, tokenId);
	}

	async function getLicenses() {
		const functionName = 'get_license';
		const tokenId = $page.params.id;
		return (await runAptosViewFunction(functionName, tokenId))[0] as Array<any>;
	}

	async function getParentRelationships() {
		const functionName = 'get_ip_owners';
		const tokenId = $page.params.id;
		childRels = runAptosViewFunction(functionName, tokenId);
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
	<div class="flex space-x-3">
		<div>
			{#await fetch(tokenData.token_uri).then((res) => res.json()) then imageData}
				<!-- svelte-ignore a11y-missing-attribute -->
				<img src={imageData.image} class="w-full max-w-xs mt-4" />
				<p>Name: {tokenData.token_name || 'N/A'}</p>
				<p>Description: {tokenData.description || 'N/A'}</p>
				<p>Description: {tokenData.token_data_id || 'N/A'}</p>
			{/await}
		</div>
		<div>
			<Button href="/app/{tokenId}/addlicense">Add License</Button>
			<div>Derivatives: {childRels}</div>
			<div>Parent IP: {childRels}</div>
			<hr />
			<button on:click={getChildToken}>Get child</button>
		</div>
	</div>
{:else}
	<p>Loading token data...</p>
{/if}

<!-- <div>
	<div>Licenses:</div>
	{#await getLicenses()}
		<p>Loading licenses...</p>
	{:then licenses}
		{#if licenses?.length > 0}
			<ul class="list-disc pl-5">
				{#each licenses as license}
					<li>{license.name} - {license.price} APT</li>
				{/each}
			</ul>
		{:else}
			<p>No licenses available.</p>
		{/if}
	{:catch error}
		<p>Error loading licenses: {error.message}</p>
	{/await}
</div> -->

<Button>Buy</Button>
