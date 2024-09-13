<script lang="ts">
	import { page } from '$app/stores';
	import { aptos } from '$lib/aptos.js';
	import Loading from '$lib/components/Loading.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { shortenAddress } from '$lib/helpers.js';
	import { defaultLicenses } from '$lib/license.js';
	import type { LicenseConfig, OffChainIPData } from '$lib/types';

	type TransactionLoadingState = 'loading' | 'success' | 'failed';
	type LoadingState = 'blockchain' | 'indexing' | 'none';
	export let data;

	const tokenId = $page.url.searchParams.get('id') ?? '';
	const name = $page.url.searchParams.get('name') ?? ' ';
	const image = $page.url.searchParams.get('image') ?? '';

	let licenseArrayPayload: { id: string; config: LicenseConfig }[] = [];

	let loading: LoadingState = 'none';
	let selectedId: string | undefined;
	let price: number | undefined;
	let royalty: number | undefined;
	let validity: number | undefined;

	let transactionSuccessArray: Record<string, TransactionLoadingState> = {};

	const standardLicense = {
		exclusive: false,
		rightsManaged: false,
		attributionRequired: true,
		derivativesAllowed: true,
		shareAlike: false,
		commercialUseAllowed: true,
		nonCommercialUseOnly: false,
		modifiable: true,
		aiUseAllowed: false,
		geographicRestrictions: false,
		numberOfUsesRestricted: false
	};

	const licenseConfig = {
		expiration: 34234,
		cost: 30
	};

	async function addLicenseAptos() {
		for (const licenseItem of licenseArrayPayload) {
			try {
				const response = await fetch('/api/addLicense', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						tokenId,
						licenseId: licenseItem.id,
						price: licenseItem.config.price,
						royalty: licenseItem.config.royalty,
						validity: licenseItem.config.validity
					})
				});

				const data = await response.json();
				if (data.success) {
					await waitForTransaction(data.hash);
				}
			} catch (error) {
				throw Error('error occurred');
			}
		}
	}

	async function waitForTransaction(hash: string) {
		transactionSuccessArray[hash] = 'loading';
		const response = await aptos.waitForTransaction({ transactionHash: hash });
		if (response.success) {
			transactionSuccessArray[hash] = 'success';
		} else {
			transactionSuccessArray[hash] = 'failed';
			throw Error('failed to submit transaction');
		}
	}

	async function getLicenseConfig() {
		const address = '0x2c0dbb09da78e1b27d100c815305b071aaece4855e0e6f164530808e37ec0069';
		const number = 5;
		const response = await aptos.view({
			payload: {
				function: `${import.meta.env.VITE_CONTRACT_ADDRESS}::${import.meta.env.VITE_MODULE_NAME}::get_license_config_data2`,
				typeArguments: [],
				functionArguments: [address, number]
			}
		});
		console.log(response);
	}

	async function uploadIP() {
		if (!data.user) return;
		if (!name || !image || !tokenId) return;

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

	async function handlePublish() {
		loading = 'blockchain';
		await addLicenseAptos();
		loading = 'indexing';
		await uploadIP();
		loading = 'none';
	}

	function selectLicenseOption(id: string) {
		selectedId = id;
	}

	function addToLicensePayloadArray() {
		if (!selectedId || !price || !royalty || !validity) return;
		licenseArrayPayload = [
			...licenseArrayPayload,
			{ id: selectedId, config: { royalty, price, validity } }
		];
		selectedId = undefined;
		price = undefined;
		royalty = undefined;
		validity = undefined;
	}
</script>

<div class="max-w-4xl mx-auto p-6 rounded-lg mb-32">
	<div class="flex items-center space-x-6 mb-8">
		<img src={image} alt={name} class="w-24 h-24 object-cover rounded-lg shadow-md" />
		<div>
			<h2 class="text-3xl font-bold text-gray-800">{name}</h2>
			<p class="text-gray-600">Token ID: {shortenAddress(tokenId, 12)}</p>
		</div>
	</div>

	<div class="flex flex-col md:flex-row md:space-x-8">
		<div class="md:w-1/2 border-r pr-8">
			<h3 class="text-xl font-semibold mb-4">Select License Type</h3>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
				{#each Object.entries(defaultLicenses) as [key, value]}
					<button
						on:click={() => selectLicenseOption(key)}
						class="p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<div class="text-lg font-medium">{value.name}</div>
						<div class="text-sm text-gray-600 mt-2">{value.description}</div>
					</button>
				{/each}
			</div>
			{#if selectedId}
				<div class="space-y-4 mt-6">
					<div>
						<label for="price" class="block text-sm font-medium text-gray-700 mb-1">Price:</label>
						<Input id="price" bind:value={price} placeholder="Enter price" />
					</div>
					<div>
						<label for="royalty" class="block text-sm font-medium text-gray-700 mb-1"
							>Royalty:</label
						>
						<Input id="royalty" bind:value={royalty} placeholder="Enter royalty percentage" />
					</div>
					<div>
						<label for="validity" class="block text-sm font-medium text-gray-700 mb-1"
							>Validity:</label
						>
						<Input id="validity" bind:value={validity} placeholder="Enter validity period" />
					</div>
					<Button on:click={addToLicensePayloadArray} class="w-full mt-4">Add License</Button>
				</div>
			{/if}
		</div>

		<div class="md:w-1/2 mt-8 md:mt-0">
			<h3 class="text-xl font-semibold mb-4">Added Licenses</h3>
			{#if licenseArrayPayload.length > 0}
				<ul class="space-y-4 mb-6">
					{#each licenseArrayPayload as license}
						<li class="border p-4 rounded-lg bg-gray-50">
							<div class="font-medium">{defaultLicenses[license.id].name}</div>
							<div class="text-sm text-gray-600 mt-1">
								{defaultLicenses[license.id].description}
							</div>
							<div class="text-sm text-gray-600 mt-2">
								Price: {license.config.price} | Royalty: {license.config.royalty}% | Validity: {license
									.config.validity}
							</div>
						</li>
					{/each}
				</ul>
				<Button class="w-full" on:click={() => handlePublish()}>
					{#if loading == 'none'}
						Publish
					{:else if loading == 'blockchain'}
						Submitting transactions...
					{:else if loading == 'indexing'}
						Indexing assets...
					{/if}
				</Button>
				<div class="mt-6 p-4 bg-gray-50 rounded-lg text-sm space-y-2">
					{#each Object.entries(transactionSuccessArray) as [key, value]}
						<div class="flex items-center">
							{#if value == 'loading'}
								<span class="text-orange-600">Processing:</span>
							{:else if value == 'success'}
								<span class="text-green-600">Completed:</span>
							{:else}
								<span class="text-red-600">Failed:</span>
							{/if}
							<a
								href="https://explorer.aptoslabs.com/txn/{key}"
								target="_blank"
								rel="noopener noreferrer"
								class="ml-2 text-blue-600 hover:underline"
							>
								{shortenAddress(key, 12)}
							</a>
							{#if value == 'loading'}
								<Loading />
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-gray-600">
					No licenses added yet. Select a license type and add details to get started.
				</p>
			{/if}
		</div>
	</div>
</div>
