<script>
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { authStore, pb } from '$lib/pocketbase';
	import { onMount } from 'svelte';

	export let data;
	async function loginUsingGoogleOAuth() {
		try {
			const authData = await pb.collection('users').authWithOAuth2({ provider: 'google' });
			console.log('Logged in successfully:', authData);
			// authStore.set({ isLoggedIn: true, userId: authData.record.id });
			// You might want to update your app state or redirect the user here
		} catch (error) {
			console.error('Error logging in with Google:', error);
			// authStore.set({ isLoggedIn: false, userId: '' });
			// Handle the error appropriately, maybe show a message to the user
		}
	}

	async function logout() {
		pb.authStore.clear();
		authStore.set({ isLoggedIn: false, userId: '' });
		console.log('Logged out successfully');
	}

	onMount(() => {
		if (pb.authStore.isValid) {
			authStore.set({ isLoggedIn: true, userId: pb.authStore.model?.id || '' });
		}
		console.log($page.data);
	});
</script>

<div class="flex justify-between items-center">
	<a href="/app" class="text-2xl font-bold">Merge</a>
	<div class="flex gap-2">
		<Button href="/app/manage">Manage IP</Button>
		<Button href="/app/create">Create IP</Button>
		{#if data.isLoggedIn}
			<Button on:click={logout} variant="default">Logout</Button>
		{:else}
			<Button on:click={loginUsingGoogleOAuth} variant="default">Login</Button>
		{/if}
	</div>
</div>

<div class="mt-8">
	<slot />
</div>
