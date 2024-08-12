<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import { isRedirectable, WalletCore, WalletReadyState } from '@aptos-labs/wallet-adapter-core';
	import type {
		Wallet,
		AptosStandardSupportedWallet,
		AvailableWallets
	} from '@aptos-labs/wallet-adapter-core';
	import { wallet, isLoading } from './walletStore';

	export let autoConnect = true;
	export let onError: (error: any) => void = console.error;

	let wallets: ReadonlyArray<Wallet | AptosStandardSupportedWallet> = [];

	onMount(() => {
		wallets = $wallet.walletCore.wallets;

		if (autoConnect && localStorage.getItem('AptosWalletName')) {
			connect(localStorage.getItem('AptosWalletName') ?? '');
		} else {
			$isLoading = false;
		}

		// Set up event listeners
		$wallet.walletCore.on('connect', handleConnect);
		$wallet.walletCore.on('disconnect', handleDisconnect);
		$wallet.walletCore.on('accountChange', handleAccountChange);
		$wallet.walletCore.on('networkChange', handleNetworkChange);

		return () => {
			$wallet.walletCore.off('connect', handleConnect);
			$wallet.walletCore.off('disconnect', handleDisconnect);
			$wallet.walletCore.off('accountChange', handleAccountChange);
			$wallet.walletCore.off('networkChange', handleNetworkChange);
		};
	});

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

	function disconnect() {
		$wallet.walletCore.disconnect().catch(onError);
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

{$wallet.connected}
{$wallet.wallet}
<button on:click={disconnect}>Disconnect</button>

{#each wallets as walletInfo}
	<div>
		<slot name="icon">
			<img src={walletInfo.icon} alt="{walletInfo.name} icon" />
		</slot>
		<slot name="name">
			<div>{walletInfo.name}</div>
		</slot>
		<slot name="connect-button">
			<button on:click={() => connect(walletInfo.name)}>Connect</button>
		</slot>
		<slot name="install-link">
			<a href={walletInfo.url} target="_blank" rel="noopener noreferrer"> Install </a>
		</slot>
	</div>
{/each}
