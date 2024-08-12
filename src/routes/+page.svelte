<script lang="ts">
	import { wallet } from '$lib/walletStore';
	import WalletProvider from '$lib/WalletProvider.svelte';
	import { Aptos, AptosConfig, Network, NetworkToNetworkName } from '@aptos-labs/ts-sdk';
	import { WalletCore, type InputTransactionData } from '@aptos-labs/wallet-adapter-core';

	const APTOS_NETWORK: Network = NetworkToNetworkName[Network.TESTNET];
	const config = new AptosConfig({ network: APTOS_NETWORK });
	const aptos = new Aptos(config);

	async function createCollection() {
		console.log('\n=== Transfer transaction ===\n');
		const payload: InputTransactionData = {
			sender: $wallet.account?.address,
			data: {
				function: '0x4::aptos_token::create_collection',
				functionArguments: [
					'testcollection3',
					500,
					'tester3',
					'https://google.com',
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
					100
				]
			}
		};
		const committedTxn = await $wallet.walletCore.signAndSubmitTransaction(payload);
		const response = await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
		console.log(response);
	}

	async function createToken() {
		// Build txn
		const transaction = await aptos.transaction.build.simple({
			sender: $wallet.account?.address ?? '',
			data: {
				function: '0x4::aptos_token::mint',
				functionArguments: [
					'tester',
					'this is a token?',
					'tokennnnerrrr4',
					'https://google.com',
					[],
					[],
					[]
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
</script>

<h1>Token mint api and ui</h1>
<button on:click={createCollection}>Create collection</button>
<button on:click={createToken}>Create token</button>

<WalletProvider />
