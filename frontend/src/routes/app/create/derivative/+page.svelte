<script lang="ts">
	import { aptos } from '$lib/aptos.js';
	import { wallet } from '$lib/walletStore';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { InputTransactionData } from '@aptos-labs/wallet-adapter-core';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	export let data;
	let showCollectionDialog = false;

	let tokendescription = '';
	let tokenCollectionName = '';
	let tokenname = '';
	let image = '';

	async function addMetadataToDB() {
		const payload = {
			collection: 'metadata',
			data: {
				description: tokendescription,
				name: tokenname,
				image,
				creator: data.user?.id,
				type: 'token'
			}
		};
		try {
			const response = await fetch(`/api/addRecordDB`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});

			if (!response.ok) throw new Error('Failed to upload IP asset');
			const result = await response.json();
			console.log('IP uploaded successfully:', result.record);
			return result.record.id;
		} catch (error) {
			console.error('Error uploading IP:', error);
		}
	}

	async function createToken() {
		if (!tokenname || !tokendescription || !image) {
			toast('Fill in all the fields');
		}
		if (!$wallet.account) {
			toast.message('Wallet not detected', {
				description: 'Go to the Profile page and connect a supported wallet'
			});
			return;
		}
		try {
			const recordId = await addMetadataToDB();
			const tokenUri = `https://mergenetwork.vercel.app/api/metadata?id=${recordId}`;
			const transaction: InputTransactionData = {
				sender: $wallet.account.address,
				data: {
					function: `0x4::aptos_token::mint`,
					functionArguments: [
						tokenCollectionName,
						tokendescription,
						tokenname,
						tokenUri,
						[],
						[],
						[]
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
			if (response.success) {
				const txnInfo: any = await aptos.getTransactionByHash({
					transactionHash: committedTxn.hash
				});
				const createTokenEvent = txnInfo.events.find(
					(event: any) => event.type === '0x4::collection::Mint'
				);
				goto(`/app/create/addlicense?id=${createTokenEvent.data.token}`);
			}

			// await uploadToDatabase();
		} catch (error) {}
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

	<div class="grid w-full max-w-sm items-center gap-1.5">
		<Label for="url">Image URL</Label>
		<Input type="url" id="url" bind:value={image} placeholder="Enter image URL" />
	</div>
	<div class="mt-4">
		<Button on:click={createToken}>Create IP Token</Button>
	</div>
</div>
