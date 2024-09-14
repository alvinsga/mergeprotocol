<script lang="ts">
	import { aptos } from '$lib/aptos.js';
	import { wallet } from '$lib/walletStore';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { InputTransactionData } from '@aptos-labs/wallet-adapter-core';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';

	export let data;
	let showCollectionDialog = false;

	let tokendescription = '';
	let tokenCollectionName = '';
	let tokenname = '';
	let tokenurl =
		'https://fuchsia-subtle-bison-841.mypinata.cloud/ipfs/QmZx5Jo3E5fwa8DQVFWcPdVkDwvzeTHffR6VCrWZRj8UuX';

	const minterContractAddress =
		'0x2c0dbb09da78e1b27d100c815305b071aaece4855e0e6f164530808e37ec0069';

	// async function getCollectionsForWallet() {
	// 	if (!$wallet.account) return;
	// 	const ledgerVersion = (await aptos.getLedgerInfo()).ledger_version;

	// 	// To change this later to fetch tokens collections created by user.
	// 	// const response = await fetchCollection($wallet.account.address);
	// 	const response = await aptos.getCollectionDataByCreatorAddressAndCollectionName({
	// 		creatorAddress: '0x305637d4e73d84e671a74c901c327d654501e99393639044442f77a3195c8695',
	// 		collectionName: 'rogue',
	// 		minimumLedgerVersion: BigInt(ledgerVersion)
	// 	});
	// 	console.log(response);
	// }

	// async function addMetadataToDB() {
	// 	const payload = { collection: 'metadata', data: data.user?.id };
	// 	try {
	// 		const response = await fetch(`/api/addRecordDB`, {
	// 			method: 'POST',
	// 			headers: {
	// 				'Content-Type': 'application/json'
	// 			},
	// 			body: JSON.stringify(payload)
	// 		});

	// 		if (!response.ok) throw new Error('Failed to upload IP asset');
	// 		const result = await response.json();
	// 		console.log('IP uploaded successfully:', result.record);
	// 		return result.record.id;
	// 	} catch (error) {
	// 		console.error('Error uploading IP:', error);
	// 	}
	// }

	async function createToken() {
		if (!$wallet.account) return;
		const transaction: InputTransactionData = {
			sender: $wallet.account.address,
			data: {
				function: `0x4::aptos_token::mint`,
				functionArguments: [tokenCollectionName, tokendescription, tokenname, tokenurl, [], [], []]
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
		// await uploadToDatabase();
	}
</script>

<div class="space-y-4 p-8">
	<div class="text-xl font-bold">Create token</div>
	<div class="grid w-full max-w-sm items-center gap-1.5">
		<Label for="name">Name</Label>
		<Input type="text" id="name" bind:value={tokenname} placeholder="Enter token name" />
	</div>

	<div class="grid w-full max-w-sm items-center gap-1.5">
		<Label for="description">Description</Label>
		<Input
			type="text"
			id="description"
			bind:value={tokendescription}
			placeholder="Enter token description"
		/>
	</div>

	<div class="grid w-full max-w-sm items-center gap-1.5">
		<Label for="collection">Collection</Label>
		<Button on:click={() => (showCollectionDialog = true)}>
			{tokenCollectionName ? tokenCollectionName : 'Select Collection'}
		</Button>
	</div>

	<Dialog.Root bind:open={showCollectionDialog}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Select Collection</Dialog.Title>
				<Dialog.Description>Choose a collection for this token</Dialog.Description>
			</Dialog.Header>
			<div class="grid gap-4 py-4">
				{#each data.collections as collection}
					<Button
						variant="outline"
						on:click={() => {
							tokenCollectionName = collection.name;
							showCollectionDialog = false;
						}}
					>
						{collection.name}
					</Button>
				{/each}
			</div>
			<Dialog.Footer>
				<Button on:click={() => (showCollectionDialog = false)}>Cancel</Button>
				<a href="/app/create/createCollection">
					<Button>Create New Collection</Button>
				</a>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>

	<div class="grid w-full max-w-sm items-center gap-1.5">
		<Label for="url">URL</Label>
		<Input type="url" id="url" bind:value={tokenurl} placeholder="Enter token URL" />
	</div>
	<div class="mt-4">
		<Button on:click={createToken}>Create IP Token</Button>
	</div>
</div>
