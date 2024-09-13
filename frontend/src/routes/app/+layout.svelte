<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { wallet } from '$lib/walletStore.js';
	import { onMount } from 'svelte';

	export let data;
	export let autoConnect = true;

	function connect(walletName: string) {
		$wallet.walletCore
			.connect(walletName)
			.catch(console.error)
			.finally(() => {
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

	onMount(() => {
		if (autoConnect && localStorage.getItem('AptosWalletName')) {
			connect(localStorage.getItem('AptosWalletName') ?? '');
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
</script>

<!-- <div class="flex justify-between items-center">
	<a href="/app" class="text-2xl font-bold">Merge</a>
	<div class="flex gap-2">
		<Button href="/app/profile/create">Create IP</Button>
		{#if data.isLoggedIn}
			<Button href="/app/profile/settings" variant="default">Profile</Button>
		{:else}
			<form action="/api/login" method="GET">
				<Button type="submit" variant="default">Login</Button>
			</form>
		{/if}
	</div>
</div> -->

<div class="mt-8">
	<slot />
</div>
