<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { pb, authStore } from '$lib/pocketbase';
	import { onMount } from 'svelte';
	import type { IP, OffChainIPData } from '$lib/types';
	import { Label } from '$lib/components/ui/label';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger,
		SelectValue
	} from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { goto } from '$app/navigation';

	let license = { value: '', label: '' };
	const address = $page.params.id;
	const image = $page.url.searchParams.get('image') ?? '';
	const name = $page.url.searchParams.get('name') ?? '';

	onMount(() => {
		if (!$authStore.isLoggedIn) {
			// Redirect to login page or show error
			console.error('User not logged in');
			return;
		}
	});

	async function uploadIP() {
		// set image

		try {
			const data: Partial<OffChainIPData> = {
				name,
				image,
				address,
				license: license.value,
				creator: $authStore.userId
			};

			const response = await fetch(`/api/createAssetDB`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});

			if (!response.ok) {
				throw new Error('Failed to upload IP asset');
			}

			const result = await response.json();
			if (result) {
				goto('/app/manage');
			}
			console.log('IP uploaded successfully:', result.record);
			// Optionally, redirect or show success message
		} catch (error) {
			console.error('Error uploading IP:', error);
			// Handle error, show error message to user
		}
	}
</script>

<div class="space-y-4 mx-auto max-w-xl">
	<div>
		<img src={$page.url.searchParams.get('image') || 'https://via.placeholder.com/150'} alt="" />
	</div>
	<div>Address:{$page.params.id}</div>

	<div>
		<Label for="name">Name: {name}</Label>
	</div>

	<div>
		<Label for="license">License</Label>
		<Select bind:selected={license}>
			<SelectTrigger>
				<SelectValue placeholder="Select a license type" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="free">Free license</SelectItem>
				<SelectItem value="paid">Paid license</SelectItem>
				<SelectItem value="royalty">Royalty</SelectItem>
			</SelectContent>
		</Select>
	</div>
	<Button on:click={uploadIP}>Publish</Button>
</div>
