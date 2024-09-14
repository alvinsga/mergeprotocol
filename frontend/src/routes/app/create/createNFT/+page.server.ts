import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	try {
		const collections = await locals.pb.collection('nftcollections').getList(1, 50, {
			sort: '-created'
		});

		return {
			collections: collections.items
		};
	} catch (error) {
		console.error('Error fetching NFT collections:', error);
		return {
			collections: []
		};
	}
};
