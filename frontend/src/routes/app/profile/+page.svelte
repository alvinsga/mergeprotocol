<script lang="ts">
	import { authStore, pb } from '$lib/pocketbase';
	import { Button } from '$lib/components/ui/button';
	import WalletProvider from '$lib/WalletProvider.svelte';
	import { wallet } from '$lib/walletStore';
	import { goto } from '$app/navigation';

	async function logout() {
		pb.authStore.clear();
		goto('/app');
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
