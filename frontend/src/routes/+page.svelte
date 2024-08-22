<script lang="ts">
	import { wallet } from '$lib/walletStore';
	import WalletProvider from '$lib/WalletProvider.svelte';
	import {
		Aptos,
		AptosConfig,
		Network,
		NetworkToNetworkName,
		type GraphqlQuery
	} from '@aptos-labs/ts-sdk';
	import { type InputTransactionData } from '@aptos-labs/wallet-adapter-core';
	import { onMount } from 'svelte';

	const APTOS_NETWORK: Network = NetworkToNetworkName[Network.TESTNET];
	const config = new AptosConfig({ network: APTOS_NETWORK });
	const aptos = new Aptos(config);

	const minterContractAddress =
		'0x2c0dbb09da78e1b27d100c815305b071aaece4855e0e6f164530808e37ec0069';

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
		// Sign txn
		const senderAuthenticator = await $wallet.walletCore.signTransaction(transaction);
		// Submit txn
		const committedTxn = await aptos.transaction.submit.simple({
			transaction,
			senderAuthenticator
		});
		const response = await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
		console.log(response);
	}

	async function createToken() {
		// Build txn
		const transaction = await aptos.transaction.build.simple({
			sender: $wallet.account?.address ?? '',
			data: {
				function: `${minterContractAddress}::launchpad3::mint_token`,
				functionArguments: [
					'0x2c0dbb09da78e1b27d100c815305b071aaece4855e0e6f164530808e37ec0069', //put random address for now
					'my new collection 1',
					'token desc',
					'my new token 1',
					'https://fuchsia-subtle-bison-841.mypinata.cloud/ipfs/QmZx5Jo3E5fwa8DQVFWcPdVkDwvzeTHffR6VCrWZRj8UuX'
				]
			}
		});
		// Sign txn
		const senderAuthenticator = await $wallet.walletCore.signTransaction(transaction);
		// Submit txn
		const committedTxn = await aptos.transaction.submit.simple({
			transaction,
			senderAuthenticator
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

	onMount(async () => {
		// await fetchCollection();
		await test();
	});
</script>

<h1 class="text-3xl font-bold underline">Hello world!</h1>
<div class="">
	<button on:click={createCollection}>Create collection</button>
</div>
<div>
	<button on:click={createToken}>Create token</button>
</div>

<WalletProvider />
<hr />
