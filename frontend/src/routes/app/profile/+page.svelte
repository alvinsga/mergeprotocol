<script lang="ts">
	import { authStore, pb } from '$lib/pocketbase';
	import { Button } from '$lib/components/ui/button';
	import WalletProvider from '$lib/WalletProvider.svelte';
	import { wallet } from '$lib/walletStore';

	async function logout() {
		pb.authStore.clear();
		authStore.set({ isLoggedIn: false, userId: '' });
		console.log('Logged out successfully');
	}

	function disconnect() {
		$wallet.walletCore.disconnect().catch(console.error);
	}
</script>

<Button on:click={logout}>Logout</Button>
{#if $wallet.connected}
	<div>Linked Wallet:{$wallet.account?.address}</div>
	<Button on:click={disconnect}>Disconnect wallet</Button>
{:else}
	<WalletProvider />
{/if}
