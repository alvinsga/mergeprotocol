<script lang="ts">
	import { page } from '$app/stores';
	import { aptos } from '$lib/aptos';
	import { Button } from '$lib/components/ui/button';
	import type { License, OffChainIPData } from '$lib/types';
	import type { MoveValue } from '@aptos-labs/ts-sdk';
	import type { PageData } from '../$types';

	const moduleAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
	const moduleName = import.meta.env.VITE_MODULE_NAME;

	export let data: PageData;

	let childRels: MoveValue = [];
	let licenses: License[] = [
		{ royalty: false, price: 12, attributionRequired: true },
		{ royalty: false, price: 1452, attributionRequired: true },
		{ royalty: false, price: 1452, attributionRequired: true }
	];

	const standardLicense = {
		cost: 30,
		currency: 'asdasd',
		expiration: 34234,
		exclusive: false,
		rightsManaged: false,
		attributionRequired: true,
		derivativesAllowed: true,
		shareAlike: false,
		commercialUseAllowed: true,
		nonCommercialUseOnly: false,
		modifiable: true,
		geographicRestrictions: false,
		numberOfUsesRestricted: false
	};

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

	async function getTokenData(tokenId: string) {
		return await aptos.getDigitalAssetData({ digitalAssetAddress: tokenId });
	}

	async function addLicenseAptos(tokenId: string, licenseArray: License[]) {
		try {
			const response = await fetch('/api/addLicense', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					tokenId,
					licenseArray
				})
			});

			const data = await response.json();
			if (data.success) {
				console.log(data);
			}
		} catch (error) {
			console.error(error);
		}
	}

	async function uploadIP(name: string, image: string, tokenId: string) {
		if (!data.user) return;
		const payload: Partial<OffChainIPData> = {
			name,
			image,
			tokenId,
			creator: data.user?.id
		};
		try {
			const response = await fetch(`/api/createAssetDB`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});

			if (!response.ok) throw new Error('Failed to upload IP asset');
			const result = await response.json();
			console.log('IP uploaded successfully:', result.record);
		} catch (error) {
			console.error('Error uploading IP:', error);
		}
	}

	async function handlePublish(image: string, tokenId: string, name: string) {
		await addLicenseAptos(tokenId, licenses);
		await uploadIP(name, image, tokenId);
	}
</script>

{#await getTokenData($page.params.id)}
	<p>Loading token data...</p>
{:then tokenData}
	<div>
		{#await fetch(tokenData.token_uri).then((res) => res.json()) then imageData}
			<!-- svelte-ignore a11y-missing-attribute -->
			<img src={imageData.image} class="w-full max-w-xs mt-4" />
			<p>Name: {tokenData.token_name || 'N/A'}</p>
			<p>Description: {tokenData.description || 'N/A'}</p>
			<p>Description: {tokenData.token_data_id || 'N/A'}</p>

			<Button
				on:click={() =>
					handlePublish(imageData.image, tokenData.token_data_id, tokenData.token_name)}
				>Publish</Button
			>
		{/await}
	</div>
{:catch error}
	<p>Error loading token data: {error.message}</p>
{/await}
<hr />
<div>Derivatives: {childRels}</div>
<div>Parent IP: {childRels}</div>
<hr />
<button on:click={getChildToken}>Get child</button>

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
