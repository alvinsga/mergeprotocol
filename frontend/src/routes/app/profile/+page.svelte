<script lang="ts">
	import { pb } from '$lib/pocketbase';
	import { Button } from '$lib/components/ui/button';
	import WalletProvider from '$lib/WalletProvider.svelte';
	import { wallet } from '$lib/walletStore';
	import { goto } from '$app/navigation';

	function disconnect() {
		$wallet.walletCore.disconnect().catch(console.error);
	}
</script>

<form action="/api/logout" method="POST">
	<Button type="submit">Logout</Button>
</form>
{#if $wallet.connected}
	<div>Linked Wallet:{$wallet.account?.address}</div>
	<Button on:click={disconnect}>Disconnect wallet</Button>
{:else}
	<WalletProvider />
{/if}
