<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import WalletProvider from '$lib/WalletProvider.svelte';
	import { wallet } from '$lib/walletStore';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	function disconnect() {
		$wallet.walletCore.disconnect().catch(console.error);
	}

	const subPages = [
		{ title: 'Create', path: '/app/profile/create' },
		{ title: 'Manage', path: '/app/profile/manage' },
		{ title: 'Profile', path: '/app/profile/settings' }
	];
</script>

<div class="flex">
	<nav class="flex-shrink-0 pr-5">
		<ul>
			{#each subPages as { title, path }}
				<li class:active={$page.url.pathname === path}>
					<a
						href={path}
						class="block py-2 px-4 rounded hover:bg-gray-100 transition-colors duration-200 font-semibold"
						>{title}</a
					>
				</li>
			{/each}
		</ul>
	</nav>
	<main class="flex-grow">
		<slot />
		<!-- This slot will be filled with the content of the selected sub-page -->
	</main>
</div>
