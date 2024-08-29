<script lang="ts">
	import { page } from '$app/stores';
	import { aptos } from '$lib/aptos';
	import { Button } from '$lib/components/ui/button';
	import type { MoveValue } from '@aptos-labs/ts-sdk';

	let childRels: MoveValue = [];
	const moduleAddress = '0x2c0dbb09da78e1b27d100c815305b071aaece4855e0e6f164530808e37ec0069'; // Replace with your actual module address
	const moduleName = 'launchpad3'; // Replace with your actual module name

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
		const functionName = 'get_ip_owners';
		const tokenId = $page.params.id;
		childRels = runAptosViewFunction(functionName, tokenId);
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

	async function getTokenData(tokenId: string) {
		return await aptos.getDigitalAssetData({ digitalAssetAddress: tokenId });
	}
</script>

{#await getTokenData($page.params.id)}
	<p>Loading token data...</p>
{:then tokenData}
	<div>
		{#await fetch(tokenData.token_uri).then((res) => res.json()) then imageData}
			<!-- svelte-ignore a11y-missing-attribute -->
			<img src={imageData.image} class="w-full max-w-xs mt-4" />
		{/await}
		<p>Name: {tokenData.token_name || 'N/A'}</p>
		<p>Description: {tokenData.description || 'N/A'}</p>
	</div>
{:catch error}
	<p>Error loading token data: {error.message}</p>
{/await}
<hr />
<div>Derivatives: {childRels}</div>
<div>Parent IP: {childRels}</div>

<button on:click={getChildToken}>Get child</button>

<div>
	<div>License:</div>
	<!-- Free license, paid license, royalty -->
</div>

<Button>Buy</Button>
