<script lang="ts">
	import { aptos } from '$lib/aptos';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { AptosIPData } from '$lib/types';
	import Add from 'lucide-svelte/icons/plus';

	let tokenArray: AptosIPData[] = [];

	async function fetchTokens() {
		const tokens = await aptos.getAccountOwnedTokens({
			accountAddress: '0x305637d4e73d84e671a74c901c327d654501e99393639044442f77a3195c8695'
		});
		tokenArray = tokens.map((token) => ({
			id: token.token_data_id,
			name: token.current_token_data?.token_name || '',
			image: token.current_token_data?.token_uri || '',
			address: token.owner_address,
			collection: token.current_token_data?.current_collection?.collection_name || '',
			license: ''
		}));
		console.log(tokenArray);
	}
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
	<h2 class="text-3xl font-bold mb-6">Create</h2>

	{#if !tokenArray.length}
		<div class="flex justify-center space-x-4 mt-12 mb-8">
			<Button
				variant="outline"
				href="/app/create/createNFT"
				class="w-72 h-48 flex flex-col items-center justify-center text-lg p-6"
			>
				<Add class="h-16 w-16 mb-4" />
				Create a new NFT
			</Button>
			<Button
				variant="outline"
				on:click={() => {
					fetchTokens();
					tokenArray = [];
				}}
				class="w-72 h-48 flex flex-col items-center justify-center text-lg p-6"
			>
				<Add class="h-16 w-16 mb-4" />
				Use an existing NFT
			</Button>
		</div>
	{/if}

	{#if tokenArray.length > 0}
		<h2 class=" mb-6">Select an NFT to add a license to</h2>

		<div class="mt-12">
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{#each tokenArray as token}
					{#await fetch(token.image).then((res) => res.json()) then imageData}
						<a
							href="/app/create/addlicense?id={token.id}&image={imageData.image}&name={token.name}"
							class="bg-white rounded-lg shadow-md overflow-hidden block transition-transform duration-300 hover:scale-105"
						>
							<img src={imageData.image} alt={token.name} class="w-full h-48 object-cover" />
							<div class="p-4">
								<h3 class="text-lg font-semibold mb-2">{token.name}</h3>
								<p class="text-sm text-gray-600 mb-1">Collection: {token.collection}</p>
								<p class="text-sm text-gray-600">
									ID: {token.id.slice(0, 4)}...{token.id.slice(-4)}
								</p>
							</div>
						</a>
					{:catch}
						<a
							href="/app/{token.id}"
							class="bg-white rounded-lg shadow-md overflow-hidden block transition-transform duration-300 hover:scale-105"
						>
							<div class="h-48 bg-gray-200 flex items-center justify-center">
								<span class="text-gray-400">Image not available</span>
							</div>
							<div class="p-4">
								<h3 class="text-lg font-semibold mb-2">{token.name}</h3>
								<p class="text-sm text-gray-600 mb-1">Collection: {token.collection}</p>
								<p class="text-sm text-gray-600">
									ID: {token.id.slice(0, 4)}...{token.id.slice(-4)}
								</p>
							</div>
						</a>
					{/await}
				{/each}
			</div>
		</div>
	{/if}
</div>
