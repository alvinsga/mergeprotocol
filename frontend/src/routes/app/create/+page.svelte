<script>
	import { aptos } from '$lib/aptos';
	import Button from '$lib/components/ui/button/button.svelte';

	const tokenArray = [];

	async function fetchTokens() {
		const tokens = await aptos.getCollectionDataByCreatorAddress({
			creatorAddress: '0x305637d4e73d84e671a74c901c327d654501e99393639044442f77a3195c8695'
		});
		console.log(tokens);
	}
</script>

<div class="max-w-md">
	<Button href="/app/create/new">Create new NFT</Button>
	<Button href="/app/create/existing">Bring your own NFT</Button>
</div>
