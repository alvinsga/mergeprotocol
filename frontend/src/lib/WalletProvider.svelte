<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import {
		type Wallet,
		type AptosStandardSupportedWallet,
		WalletReadyState
	} from '@aptos-labs/wallet-adapter-core';
	import { wallet, isLoading } from './walletStore';
	import { Button } from './components/ui/button';

	export let onError: (error: any) => void = console.error;

	let wallets: ReadonlyArray<Wallet | AptosStandardSupportedWallet> = $wallet.walletCore.wallets;

	$: installedWallets = wallets.filter((wallet) => wallet.readyState == WalletReadyState.Installed);
	$: otherWallets = wallets.filter((wallet) => wallet.readyState != WalletReadyState.Installed);

	function connect(walletName: string) {
		$isLoading = true;
		$wallet.walletCore
			.connect(walletName)
			.catch(onError)
			.finally(() => {
				$isLoading = false;
				console.log('connected');
			});
	}

	function handleConnect() {
		wallet.update((state) => ({
			...state,
			connected: true,
			account: $wallet.walletCore.account,
			network: $wallet.walletCore.network,
			wallet: $wallet.walletCore.wallet
		}));
	}

	function handleDisconnect() {
		console.log('disconneting wallet');
		wallet.update((state) => ({
			...state,
			connected: false,
			account: null,
			network: null,
			wallet: null
		}));
	}

	function handleAccountChange() {
		wallet.update((state) => ({
			...state,
			account: $wallet.walletCore.account
		}));
	}

	function handleNetworkChange() {
		wallet.update((state) => ({
			...state,
			network: $wallet.walletCore.network
		}));
	}

	// setContext('wallet', {
	// 	connect,
	// 	disconnect,
	// 	signAndSubmitTransaction: walletCore.signAndSubmitTransaction.bind(walletCore),
	// 	signTransaction: walletCore.signTransaction.bind(walletCore),
	// 	signMessage: walletCore.signMessage.bind(walletCore),
	// 	signMessageAndVerify: walletCore.signMessageAndVerify.bind(walletCore),
	// 	submitTransaction: walletCore.submitTransaction.bind(walletCore),
	// 	changeNetwork: walletCore.changeNetwork.bind(walletCore)
	// });
</script>

<div class="max-w-xs">
	{#each installedWallets as wallet}
		<Button class="w-full mt-2" on:click={() => connect(wallet.name)}>
			<div class="flex items-center">
				<img src={wallet.icon} alt="{wallet.name} icon" class="max-w-6 mr-2" />
				<div>{wallet.name}</div>
			</div>
		</Button>
	{/each}
	{#each otherWallets as wallet}
		<Button href={wallet.url} target="_blank" rel="noopener noreferrer" class="w-full mt-2">
			<div class="flex items-center">
				<img src={wallet.icon} alt="{wallet.name} icon" class="max-w-6 mr-2" />
				<div>{wallet.name}</div>
			</div>
		</Button>
	{/each}
</div>
