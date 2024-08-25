<script>
	import { Button } from '$lib/components/ui/button';
	import { wallet } from '$lib/walletStore';
</script>

<div class="flex justify-between items-center">
	<a href="/app" class="text-2xl font-bold">Merge</a>
	<div class="flex gap-2">
		<Button href="/app/manage">Manage IP</Button>
		<Button href="/app/create">Create IP</Button>
		<Button variant="default">{$wallet.account?.address}</Button>
	</div>
</div>

<div class="mt-8">
	<slot />
</div>
