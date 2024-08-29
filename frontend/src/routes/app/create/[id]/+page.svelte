<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import type { IP, OffChainIPData } from '$lib/types';
	import { Label } from '$lib/components/ui/label';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger,
		SelectValue
	} from '$lib/components/ui/select';
	import { goto } from '$app/navigation';
	import type { PageData } from '../$types';

	export let data: PageData;
	let license = { value: '', label: '' };
	const address = $page.params.id;
	const image = $page.url.searchParams.get('image') ?? '';
	const name = $page.url.searchParams.get('name') ?? '';

	const standardLicense = {
		cost: 30,
		currency: 'asdasd',
		expiration: 34234,
		exclusive: false,
		rightsManaged: false,
		attributionRequired: true,
		derivativesAllowed: true,
		shareAlike: false,
		commercialUseAllowed: true,
		nonCommercialUseOnly: false,
		modifiable: true,
		geographicRestrictions: false,
		numberOfUsesRestricted: false
	};

	async function uploadIP() {
		if (!data.user) return;
		try {
			const payload: Partial<OffChainIPData> = {
				name,
				image,
				address,
				creator: data.user?.id
			};

			const response = await fetch(`/api/createAssetDB`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
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

	function addLicenseAptos() {
		// TODO: execute add license function on smart contract
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
