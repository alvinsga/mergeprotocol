<script lang="ts">
	import { aptos } from '$lib/aptos.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';

	import { wallet } from '$lib/walletStore';
	import type { InputTransactionData } from '@aptos-labs/wallet-adapter-core';

	export let data;

	let description = '';
	let quantity = 100;
	let name = '';
	let url =
		'https://fuchsia-subtle-bison-841.mypinata.cloud/ipfs/QmZ6n9ogw9iek3Cb2G2kU7F2Hs2cqorJ1DwvWTi4i375sn';
	async function createCollection() {
		if (!$wallet.account) return;
		const transaction: InputTransactionData = {
			sender: $wallet.account.address,
			data: {
				function: `0x4::aptos_token::create_collection`,
				functionArguments: [
					description,
					quantity,
					name,
					url,
					true,
					true,
					true,
					true,
					true,
					true,
					true,
					true,
					true,
					1,
					10
				]
			}
		};
		// Publish to blockchain
		const committedTxn = await $wallet.walletCore.signAndSubmitTransaction(transaction);
		// const committedTxn = await aptos.signAndSubmitTransaction({
		// 	signer: adminAccount,
		// 	transaction
		// });
		const response = await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
		console.log(response);
		await uploadToDatabase();
		// Redirect back to the createNFT page
		window.location.href = '/app/create/createNFT';
	}

	async function uploadToDatabase() {
		const payload = { name, creator: data.user?.id };
		try {
			const response = await fetch(`/api/createCollectionDB`, {
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
</script>

<div class="space-y-4 p-8">
	<div class="text-xl font-bold">Create collection</div>
	<div class="grid w-full max-w-sm items-center gap-1.5">
		<Label for="name">Name</Label>
		<Input type="text" id="name" bind:value={name} placeholder="Enter collection name" />
	</div>

	<div class="grid w-full max-w-sm items-center gap-1.5">
		<Label for="description">Description</Label>
		<Input
			type="text"
			id="description"
			bind:value={description}
			placeholder="Enter collection description"
		/>
	</div>

	<div class="grid w-full max-w-sm items-center gap-1.5">
		<Label for="quantity">Quantity</Label>
		<Input type="number" id="quantity" bind:value={quantity} placeholder="Enter quantity" />
	</div>

	<div class="grid w-full max-w-sm items-center gap-1.5">
		<Label for="url">URL</Label>
		<Input type="url" id="url" bind:value={url} placeholder="Enter collection URL" />
	</div>
	<div class="mt-4">
		<Button on:click={createCollection}>Create Collection</Button>
	</div>
</div>
