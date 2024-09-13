<script lang="ts">
	import { aptos } from '$lib/aptos';
	import { Account, type GraphqlQuery, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';
	import { wallet } from '$lib/walletStore';
	import Button from '$lib/components/ui/button/button.svelte';
	import { ArrowRight, Shield, Zap, DollarSign, Star } from 'lucide-svelte';

	// add variables to bind to textboxes
	let collectionName = '';
	let collectionUri = '';
	let tokenUri = '';

	const features = [
		{
			icon: Shield,
			title: 'Secure Licensing',
			description:
				'Protect your intellectual property with blockchain-backed licenses, ensuring tamper-proof and verifiable ownership.'
		},
		{
			icon: Zap,
			title: 'Easy Integration',
			description:
				'Seamlessly add licenses to your existing NFTs with our user-friendly interface and step-by-step guidance.'
		},
		{
			icon: DollarSign,
			title: 'New Revenue Streams',
			description:
				'Unlock multiple monetization avenues for your NFTs, from commercial licensing to limited-use permissions.'
		}
	];

	const minterContractAddress =
		'0x2c0dbb09da78e1b27d100c815305b071aaece4855e0e6f164530808e37ec0069';

	const adminAccount = Account.fromPrivateKey({
		privateKey: new Ed25519PrivateKey(import.meta.env.VITE_PRIVATE)
	});

	async function createCollection() {
		const transaction = await aptos.transaction.build.simple({
			sender: $wallet.account?.address ?? '',
			data: {
				function: `${minterContractAddress}::launchpad3::create_collection`,
				functionArguments: [
					'this is a collection 2344',
					100,
					'my new collection 1',
					'https://fuchsia-subtle-bison-841.mypinata.cloud/ipfs/QmZ6n9ogw9iek3Cb2G2kU7F2Hs2cqorJ1DwvWTi4i375sn'
				]
			}
		});
		const committedTxn = await aptos.signAndSubmitTransaction({
			signer: adminAccount,
			transaction
		});
		const response = await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
		console.log(response);
	}

	async function createToken() {
		// Build txn
		const transaction = await aptos.transaction.build.simple({
			sender: adminAccount.accountAddress,
			data: {
				function: `${minterContractAddress}::launchpad3::mint_token`,
				functionArguments: [
					`${$wallet.account?.address}`, //put random address for now
					'my new collection 1',
					'token desc',
					'my new token 2',
					'https://fuchsia-subtle-bison-841.mypinata.cloud/ipfs/QmZx5Jo3E5fwa8DQVFWcPdVkDwvzeTHffR6VCrWZRj8UuX'
				]
			}
		});

		const committedTxn = await aptos.signAndSubmitTransaction({
			signer: adminAccount,
			transaction
		});

		const response = await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
		console.log(response);
	}

	async function fetchCollection() {
		const address = '0x305637d4e73d84e671a74c901c327d654501e99393639044442f77a3195c8695';
		const ledgerVersion = (await aptos.getLedgerInfo()).ledger_version;

		const i: GraphqlQuery = {
			query: `query GetAccountNftCollections {
  current_collection_ownership_v2_view(
    where: {owner_address: {_eq: "0x305637d4e73d84e671a74c901c327d654501e99393639044442f77a3195c8695"}}
    limit: 1000000
    offset: 0
    order_by: [{last_transaction_version: desc}, {collection_id: asc}]
  ) {
    collection_id
    distinct_tokens
    last_transaction_version
    owner_address
    collection_name
    collection_uri
    creator_address
    single_token_uri
  }
}`
		};
		const collections = await aptos.queryIndexer({
			query: i
		});
		console.log(collections);
	}
	let isMenuOpen = false;
	let innerWidth: number;
	$: isMobile = innerWidth < 768;
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { shortenAddress } from '$lib/helpers';

	let showAttributes = false;

	onMount(() => {
		setTimeout(() => {
			showAttributes = true;
		}, 500);
	});
</script>

<div class="p-12 mx-auto max-w-4xl text-center">
	<div class="text-8xl font-bold mt-24">Merge Network</div>
	<div class="flex items-center justify-center mt-4">
		<img src="aptos-logo.svg" alt="Aptos Logo" class="h-5 w-5 mr-2" />
		<a href="https://aptosfoundation.org/" target="_blank" class="text-sm">Powered by Aptos</a>
	</div>
	<div class="text-3xl mt-12">Unlock the full potential of your digital assets</div>
	<Button href="/app" class="mt-8">Go To App</Button>
</div>

<section class="p-8">
	<div class="container mx-auto">
		<div class="max-w-2xl mx-auto">
			<video class="w-full rounded-lg shadow-xl" autoplay loop muted playsinline>
				<source src="video.mp4" type="video/mp4" />
				Your browser does not support the video tag.
			</video>
			{#if showAttributes}
				<div class="mt-4 space-y-2 text-sm" transition:fly={{ y: -20, duration: 300 }}>
					<div class=" p-4 rounded-lg">
						<div class="text-xs text-gray-600">On-chain licences</div>
						<div class="font-medium relative group inline-block">
							Personal
							<div
								class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute z-10 bg-white border border-gray-200 rounded-md shadow-md p-4 left-full top-1/2 transform -translate-y-1/2 ml-2 w-64 text-sm"
							>
								<p>Price: $0</p>
								<p>Validity: Unlimited</p>
							</div>
						</div>
						<div class="font-medium">Commercial</div>
						<div class="text-xs text-gray-600 mt-5">Contract</div>
						<a href="google.com" class="underline underline-offset-2 font-medium"
							>{shortenAddress('0x34324234jh23j32434234234526457523n62344', 12)}</a
						>
						<div class="text-xs text-gray-600 mt-5">Owner</div>
						<a href="google.com" class="underline underline-offset-2 font-medium"
							>{shortenAddress('0x3244njkjk234234n23k234km342', 12)}</a
						>
					</div>
				</div>
			{/if}
		</div>
	</div>
</section>

<div class="flex flex-col min-h-screen mb-72">
	<main class="flex-grow">
		<section class="bg-white py-16 md:py-24">
			<div class="max-w-3xl mx-auto px-4">
				<div class="grid gap-y-72">
					{#each features as feature}
						<div class="flex flex-col justify-center items-center">
							<div class="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
								<svelte:component this={feature.icon} class="h-10 w-10 text-black" />
							</div>
							<h3 class="text-2xl mt-8">{feature.title}</h3>
							<div class="text-5xl text-center tracking-wide mt-12">
								<p>{feature.description}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>
	</main>
</div>
