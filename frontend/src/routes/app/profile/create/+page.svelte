<script lang="ts">
	import { aptos } from '$lib/aptos';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { AptosIPData } from '$lib/types';

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

<div class="max-w-md">
	<Button href="/app/create/new">Create new NFT</Button>
	<Button on:click={fetchTokens}>Bring your own NFT</Button>

	{#if tokenArray.length > 0}
		<div class="mt-4">
			<h2 class="text-xl font-semibold mb-2">Your Tokens</h2>
			<ul class="space-y-2">
				{#each tokenArray as token}
					{#await fetch(token.image).then((res) => res.json()) then imageData}
						<a
							href="/app/profile/create/addlicense?id={token.id}&image={imageData.image}&name={token.name}"
						>
							<li class="border p-2 rounded flex items-center">
								<img src={imageData.image} alt={token.name} class="w-16 h-16 object-cover mr-4" />

								<div>
									<div class="font-medium">{token.name}</div>
									<div class="text-sm text-gray-600">Collection: {token.collection}</div>
									<div class="text-sm text-gray-600">
										ID: {token.id.slice(0, 4)}...{token.id.slice(-4)}
									</div>
								</div>
							</li>
						</a>
					{:catch}
						<a href="/app/{token.id}">
							<li class="border p-2 rounded flex items-center">
								<div>
									<div class="font-medium">{token.name}</div>
									<div class="text-sm text-gray-600">Collection: {token.collection}</div>
									<div class="text-sm text-gray-600">
										ID: {token.id.slice(0, 4)}...{token.id.slice(-4)}
									</div>
								</div>
							</li>
						</a>
					{/await}
				{/each}
			</ul>
		</div>
	{:else}
		<p class="mt-4 text-gray-600">No tokens found. Create a new NFT or fetch your existing ones.</p>
	{/if}
</div>
