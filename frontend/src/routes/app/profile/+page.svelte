<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import WalletProvider from '$lib/WalletProvider.svelte';
	import { wallet } from '$lib/walletStore';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { shortenAddress } from '$lib/helpers.js';

	function disconnect() {
		$wallet.walletCore.disconnect().catch(console.error);
	}

	export let data;
</script>

<div class="max-w-2xl mx-auto p-6 rounded-lg">
	<h1 class="text-2xl font-bold mb-6">Profile Settings</h1>

	<div class="mb-6">
		<Label for="email" class="block mb-2">Email: {data.user?.email}</Label>
	</div>

	<div class="mb-6">
		<h2 class="text-lg font-semibold mb-2">Linked Wallet</h2>
		{#if $wallet.connected}
			<div class=" mb-2">
				{shortenAddress($wallet.account?.address ?? '', 12)}
			</div>
			<Button on:click={disconnect} variant="outline" class="w-full">Disconnect wallet</Button>
		{:else}
			<WalletProvider />
		{/if}
	</div>

	<div class="mt-8 pt-6 border-t">
		<form action="/api/logout" method="POST">
			<Button type="submit" variant="outline" class="w-full">Logout</Button>
		</form>
	</div>
</div>
