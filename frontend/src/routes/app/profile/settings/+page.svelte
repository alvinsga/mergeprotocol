<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import WalletProvider from '$lib/WalletProvider.svelte';
	import { wallet } from '$lib/walletStore';

	function disconnect() {
		$wallet.walletCore.disconnect().catch(console.error);
	}
</script>

<div class="outline">
	<form action="/api/logout" method="POST">
		<Button type="submit">Logout</Button>
	</form>
	{#if $wallet.connected}
		<div>Linked Wallet:{$wallet.account?.address}</div>
		<Button on:click={disconnect}>Disconnect wallet</Button>
	{:else}
		<WalletProvider />
	{/if}
</div>
