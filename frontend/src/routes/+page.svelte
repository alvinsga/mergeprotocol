<script lang="ts">
	import { aptos } from '$lib/aptos';
	import { Account, type GraphqlQuery, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';
	import { pb } from '$lib/pocketbase';
	import { wallet } from '$lib/walletStore';

	// add variables to bind to textboxes
	let collectionName = '';
	let collectionUri = '';
	let tokenUri = '';

	const minterContractAddress =
		'0x2c0dbb09da78e1b27d100c815305b071aaece4855e0e6f164530808e37ec0069';

	const adminAccount = Account.fromPrivateKey({
		privateKey: new Ed25519PrivateKey(import.meta.env.VITE_PRIVATE)
	});

	async function createCollection() {
		const transaction = await aptos.transaction.build.simple({
			sender: $wallet.account?.address ?? '',
			data: {
				function: `${minterContractAddress}::launchpad3::create_collection`,
				functionArguments: [
					'this is a collection 2344',
					100,
					'my new collection 1',
					'https://fuchsia-subtle-bison-841.mypinata.cloud/ipfs/QmZ6n9ogw9iek3Cb2G2kU7F2Hs2cqorJ1DwvWTi4i375sn'
				]
			}
		});
		const committedTxn = await aptos.signAndSubmitTransaction({
			signer: adminAccount,
			transaction
		});
		const response = await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
		console.log(response);
	}

	async function createToken() {
		// Build txn
		const transaction = await aptos.transaction.build.simple({
			sender: adminAccount.accountAddress,
			data: {
				function: `${minterContractAddress}::launchpad3::mint_token`,
				functionArguments: [
					`${$wallet.account?.address}`, //put random address for now
					'my new collection 1',
					'token desc',
					'my new token 2',
					'https://fuchsia-subtle-bison-841.mypinata.cloud/ipfs/QmZx5Jo3E5fwa8DQVFWcPdVkDwvzeTHffR6VCrWZRj8UuX'
				]
			}
		});

		const committedTxn = await aptos.signAndSubmitTransaction({
			signer: adminAccount,
			transaction
		});

		const response = await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
		console.log(response);
	}

	async function fetchCollection() {
		const address = '0x305637d4e73d84e671a74c901c327d654501e99393639044442f77a3195c8695';
		const ledgerVersion = (await aptos.getLedgerInfo()).ledger_version;

		const i: GraphqlQuery = {
			query: `query GetAccountNftCollections {
  current_collection_ownership_v2_view(
    where: {owner_address: {_eq: "0x305637d4e73d84e671a74c901c327d654501e99393639044442f77a3195c8695"}}
    limit: 1000000
    offset: 0
    order_by: [{last_transaction_version: desc}, {collection_id: asc}]
  ) {
    collection_id
    distinct_tokens
    last_transaction_version
    owner_address
    collection_name
    collection_uri
    creator_address
    single_token_uri
  }
}`
		};
		const collections = await aptos.queryIndexer({
			query: i
		});
		console.log(collections);
	}

	async function test() {
		const arr = await aptos.getCollectionDataByCreatorAddress({
			creatorAddress: '0x305637d4e73d84e671a74c901c327d654501e99393639044442f77a3195c8695'
		});
		console.log(arr);
	}

	// login pocketbase with google oauth
	async function login() {
		const authData = await pb.collection('users').authWithOAuth2({
			provider: 'google'
		});
		console.log(authData);
	}
</script>

<h1 class="text-3xl font-bold underline">{$wallet.account?.address}</h1>
<div class="">
	<button on:click={createCollection}>Create collection</button>
</div>
<div>
	<button on:click={createToken}>Create token</button>
</div>

<div class="space-y-4">
	<Input type="text" placeholder="Collection Name" bind:value={collectionName} />
	<Input type="text" placeholder="Collection URI" bind:value={collectionUri} />
	<Input type="text" placeholder="Token URI" bind:value={tokenUri} />
	<Button on:click={createCollection}>Create collection</Button>
</div>

<button on:click={login}>Login</button>

<hr />
