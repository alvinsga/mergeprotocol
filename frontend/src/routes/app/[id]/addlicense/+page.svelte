<script lang="ts">
	import { page } from '$app/stores';
	import { aptos } from '$lib/aptos.js';
	import Loading from '$lib/components/Loading.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { shortenAddress } from '$lib/helpers.js';
	import type { License, OffChainIPData } from '$lib/types';

	type LoadingState = 'loading' | 'success' | 'failed';
	type internalLicenseNaming = { name: string; description: string };
	export let data;

	const tokenId = $page.params.id;
	let licenseArrayPayload: License[] = [];

	const image = '';
	const tokenName = '';

	let loading = false;
	let selectedId: string | undefined;
	let price: number | undefined;
	let transactionSuccessArray: Record<string, LoadingState> = {};

	const defaultLicenses: Record<number, internalLicenseNaming> = {
		1: { name: 'Royalty Free', description: 'Reproduce as you wish' },
		2: { name: 'Personal Use', description: 'Reproduce as you wish' },
		3: { name: 'Commercial Use', description: 'Reproduce as you wish' }
	};

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
		loading = true;

		for (const license of licenseArrayPayload) {
			try {
				const response = await fetch('/api/addLicense', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						tokenId,
						license
					})
				});

				const data = await response.json();
				if (data.success) {
					await waitForTransaction(data.hash);
				}
			} catch (error) {
				console.error(error);
			}
		}
		loading = false;
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

	async function handlePublish() {
		await addLicenseAptos();
		// await uploadIP(tokenName, image, tokenId);
	}

	function selectLicenseOption(id: string) {
		selectedId = id;
	}

	function addToLicensePayloadArray() {
		licenseArrayPayload = [
			...licenseArrayPayload,
			{ royalty: false, price: 12, attributionRequired: true }
		];
		selectedId = undefined;
		price = undefined;
	}
</script>

<div class="mx-auto">
	<div class="flex space-x-8">
		<div class="  border-r p-8">
			<div class=" flex space-x-2">
				{#each Object.entries(defaultLicenses) as [key, value]}
					<button
						on:click={() => selectLicenseOption(key)}
						class="outline rounded p-5 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
					>
						<div class="text-xl font-medium">{value.name}</div>
						<div class="text-sm mt-3">{value.description}</div>
					</button>
				{/each}
			</div>
			{#if selectedId}
				<div class="mt-10">
					<div class="mb-3">Price:</div>
					<Input bind:value={price} />
					<Button on:click={addToLicensePayloadArray} class="px-8 mt-6">Add</Button>
				</div>
			{/if}
		</div>
		<div>
			{#if licenseArrayPayload.length > 0}
				<ul class="my-4 space-y-2">
					{#each licenseArrayPayload as license, index}
						<li class="border p-3 rounded">
							<div>License {index + 1}:</div>
							<div>Royalty: {license.royalty ? 'Yes' : 'No'}</div>
							<div>Price: {license.price}</div>
							<div>Attribution Required: {license.attributionRequired ? 'Yes' : 'No'}</div>
						</li>
					{/each}
				</ul>
				<Button class=" w-full" on:click={() => handlePublish()}>Publish</Button>
				<div class=" mt-8 p-5 text-sm space-y-2">
					{#each Object.entries(transactionSuccessArray) as [key, value]}
						<div>
							{#if value == 'loading'}
								<div class="flex items-center">
									Submitted <a
										target="_blank"
										href="https://explorer.aptoslabs.com/txn/{key}"
										class=" ml-1 text-orange-800"
									>
										{shortenAddress(key, 12)}
									</a>
									<Loading />
								</div>
							{:else if value == 'success'}
								Txn <a
									target="_blank"
									href="https://explorer.aptoslabs.com/txn/{key}"
									class="text-green-800"
								>
									{shortenAddress(key, 12)}
								</a> completed successfully
							{:else}
								Txn <a
									target="_blank"
									href="https://explorer.aptoslabs.com/txn/{key}"
									class="text-red-800"
								>
									{shortenAddress(key, 12)}
								</a> has failed
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<p class="mt-4 text-gray-600">No licenses added yet.</p>
			{/if}
		</div>
	</div>
</div>
