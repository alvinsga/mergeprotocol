import { pb } from '$lib/pocketbase';
import type { PageServerLoad } from './$types';
import type { IP } from '$lib/types';

export const load: PageServerLoad = async () => {
	try {
		const records = await pb.collection('ipassets').getList<IP>(1, 50, {
			sort: '-created'
		});

		return {
			ipAssets: records.items
		};
	} catch (error) {
		console.error('Error fetching IP assets:', error);
		return {
			ipAssets: []
		};
	}
};
