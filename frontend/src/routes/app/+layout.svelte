<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { authStore, pb } from '$lib/pocketbase';
	import { wallet } from '$lib/walletStore.js';
	import { onMount } from 'svelte';

	export let data;
	export let autoConnect = true;

	async function loginUsingGoogleOAuth() {
		try {
			const authData = await pb.collection('users').authWithOAuth2({ provider: 'google' });
			console.log('Logged in successfully:', authData);
			// authStore.set({ isLoggedIn: true, userId: authData.record.id });
		} catch (error) {
			console.error('Error logging in with Google:', error);
			// authStore.set({ isLoggedIn: false, userId: '' });
		}
	}

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
		// if (pb.authStore.isValid) {
		// 	authStore.set({ isLoggedIn: true, userId: pb.authStore.model?.id || '' });
		// }
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

<div class="flex justify-between items-center">
	<a href="/app" class="text-2xl font-bold">Merge</a>
	<div class="flex gap-2">
		<Button href="/app/manage">Manage IP</Button>
		<Button href="/app/create">Create IP</Button>
		{#if data.isLoggedIn}
			<Button href="/app/profile" variant="default">Profile</Button>
		{:else}
			<Button on:click={loginUsingGoogleOAuth} variant="default">Login</Button>
		{/if}
	</div>
</div>

<div class="mt-8">
	<slot />
</div>
