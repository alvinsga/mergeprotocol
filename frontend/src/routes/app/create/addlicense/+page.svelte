<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { aptos } from '$lib/aptos.js';
	import Loading from '$lib/components/Loading.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { runAptosViewFunction, shortenAddress } from '$lib/helpers.js';
	import { defaultLicenses } from '$lib/license.js';
	import type { LicenseConfig, OffChainIPData } from '$lib/types';
	import { onMount } from 'svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import * as Alert from '$lib/components/ui/alert';
	import { ExternalLink } from 'lucide-svelte';

	type TransactionLoadingState = 'loading' | 'success' | 'failed';
	type LoadingState = 'blockchain' | 'indexing' | 'none';
	let tokenData: any;

	export let data;

	const tokenId = $page.url.searchParams.get('id') ?? '';

	let licenseArrayPayload: { id: string; config: LicenseConfig }[] = [];

	let loading: LoadingState = 'none';
	let selectedId: string | undefined;
	let price: number = 0;
	let royalty: number = 0;
	let validity: number = 0;

	let transactionSuccessArray: Record<string, TransactionLoadingState> = {};

	let licenseRemoveTransactionHash = '';
	let getLicenseCheck = getLicenses();

	let finishAddingLicense = false;

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
						price: licenseItem.config.price * 100000000,
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
		finishAddingLicense = true;
	}

	async function removeLicenseAptos(licenseId: string) {
		try {
			const response = await fetch('/api/removeLicense', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					tokenId,
					licenseId
				})
			});
			const data = await response.json();
			if (data.success) {
				const response = await aptos.waitForTransaction({ transactionHash: data.hash });
				if (response.success) {
					licenseRemoveTransactionHash = data.hash;
					// refresh license array
					getLicenseCheck = getLicenses();
				} else {
					throw Error('failed to submit transaction');
				}
			}
		} catch (error) {
			throw Error('error occurred');
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
		if (!tokenData) return;
		const image = (await (await fetch(tokenData.token_uri)).json()).image;

		const licenseArray: Array<string> = [];
		licenseArrayPayload.forEach((license) => {
			licenseArray.push(license.id);
		});
		const payload: Partial<OffChainIPData> = {
			name: tokenData.token_name,
			image,
			address: tokenId,
			creator: data.user?.id,
			license: licenseArray
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
		if (!selectedId) return;
		licenseArrayPayload = [
			...licenseArrayPayload,
			{ id: selectedId, config: { royalty, price, validity } }
		];
		selectedId = undefined;
		price = 0;
		royalty = 0;
		validity = 0;
	}

	async function getLicenses() {
		const functionName = 'get_license_for_asset';
		return (await runAptosViewFunction(functionName, [tokenId])) as Array<any>;
	}

	async function getTokenData() {
		return await aptos.getDigitalAssetData({ digitalAssetAddress: tokenId });
	}

	onMount(async () => {
		tokenData = await getTokenData();
	});
</script>

{#if tokenData}
	<div class="max-w-4xl mx-auto p-6 rounded-lg mb-32">
		{#if licenseRemoveTransactionHash}
			<Alert.Root variant="destructive">
				<Alert.Title
					>License was removed successfully:
					<a
						href="https://explorer.aptoslabs.com/txn/{licenseRemoveTransactionHash}"
						target="_blank"
						rel="noopener noreferrer"
						class="ml-2 text-blue-600 hover:underline"
					>
						{shortenAddress(licenseRemoveTransactionHash, 12)}
					</a>
				</Alert.Title>
			</Alert.Root>
		{/if}
		<div class="flex items-center space-x-6 my-8">
			{#await fetch(tokenData.token_uri).then((res) => res.json()) then imageData}
				<!-- svelte-ignore a11y-missing-attribute -->
				<img src={imageData.image} alt="wh" class="w-24 h-24 object-cover rounded-lg shadow-md" />
			{/await}
			<div>
				<h2 class="text-3xl font-bold text-gray-800">{tokenData.token_name}</h2>
				<p class="text-gray-600 my-2">Token ID: {shortenAddress(tokenId, 12)}</p>
			</div>
		</div>

		<div class="mb-8">
			<h2 class="text-2xl font-semibold mb-4">Existing Licenses</h2>
			{#await getLicenseCheck}
				<p class="text-gray-600">Loading licenses...</p>
			{:then licenses}
				{#if licenses?.length > 0}
					<div class="bg-white shadow overflow-hidden sm:rounded-md">
						<ul class="divide-y divide-gray-200">
							{#each licenses[0] as id}
								<li>
									<div class="px-4 py-4 sm:px-6 flex justify-between items-center">
										<div>
											<h3 class="text-lg font-medium text-gray-900">{defaultLicenses[id].name}</h3>
											<p class="mt-1 text-sm text-gray-600">{defaultLicenses[id].description}</p>
										</div>
										<Button
											class="text-sm"
											on:click={() => {
												removeLicenseAptos(id);
											}}>Remove</Button
										>
									</div>
								</li>
							{/each}
						</ul>
					</div>
				{:else}
					<p class="text-gray-600">No licenses available for this asset.</p>
				{/if}
			{:catch error}
				<p class="text-red-600">Error loading licenses. Please try again.</p>
			{/await}
		</div>

		<div class="bg-gray-50 p-6 rounded-lg">
			<h2 class="text-2xl font-semibold mb-6">Create New License</h2>
			<div class="flex flex-col md:flex-row md:space-x-8">
				<div class="md:w-1/2">
					<h3 class="text-xl font-semibold mb-4">Select License Type</h3>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
						{#each Object.entries(defaultLicenses) as [key, value]}
							<Tooltip.Root>
								<Tooltip.Trigger class="h-full">
									<button
										on:click={() => selectLicenseOption(key)}
										class="p-4 border rounded-lg hover:bg-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 relative w-full h-full flex flex-col justify-between"
									>
										<div>
											<div class="text-lg font-medium">{value.name}</div>
											<div class="text-sm text-gray-600 mt-2">{value.description}</div>
										</div>
									</button>
								</Tooltip.Trigger>
								<Tooltip.Content
									class="bg-gray-800 text-white p-4 rounded shadow-lg text-sm max-w-md"
									side="right"
									align="center"
								>
									<pre class="whitespace-pre-wrap overflow-auto max-h-80">{JSON.stringify(
											value.json,
											null,
											2
										)}</pre>
								</Tooltip.Content>
							</Tooltip.Root>
						{/each}
					</div>
					{#if selectedId}
						<div class="space-y-4 mt-6">
							<div>
								<label for="price" class="block text-sm font-medium text-gray-700 mb-1"
									>Price (APT):</label
								>
								<Input id="price" bind:value={price} placeholder="Enter price" />
							</div>
							<!-- <div>
								<label for="royalty" class="block text-sm font-medium text-gray-700 mb-1"
									>Royalty:</label
								>
								<Input id="royalty" bind:value={royalty} placeholder="Enter royalty percentage" />
							</div>
							<div>
								<label for="validity" class="block text-sm font-medium text-gray-700 mb-1"
									>Expiry date:</label
								>
								<Input id="validity" bind:value={validity} placeholder="Enter validity period" />
							</div> -->
							<Button on:click={addToLicensePayloadArray} class="w-full mt-4">Add License</Button>
						</div>
					{/if}
				</div>

				<div class="md:w-1/2 mt-8 md:mt-0">
					<h3 class="text-xl font-semibold mb-4">Licenses to add</h3>
					{#if licenseArrayPayload.length > 0}
						<ul class="space-y-4 mb-6">
							{#each licenseArrayPayload as license}
								<li class="border p-4 rounded-lg bg-white">
									<div class="font-medium">{defaultLicenses[license.id].name}</div>
									<div class="text-sm text-gray-600 mt-1">
										{defaultLicenses[license.id].description}
									</div>
									<div class="text-sm text-gray-600 mt-2">
										Price: {license.config.price} APT | Royalty: {license.config.royalty}% |
										Validity: {license.config.validity}
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
						<div class="mt-6 p-4 rounded-lg text-sm space-y-2 bg-white">
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
							{#if finishAddingLicense}
								<a href="/app/{tokenId}" class="flex items-center text-blue-600 hover:underline">
									View asset on marketplace
									<ExternalLink class="inline-block ml-1 w-4 h-4" />
								</a>
							{/if}
						</div>
					{:else}
						<p class="text-gray-600">
							No licenses added yet. Select a license type and add a price (optional)
						</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}
