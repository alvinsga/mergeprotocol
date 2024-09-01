import type { PageServerLoad } from './$types';
import type { IP } from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
	try {
		const records = await locals.pb.collection('ipassets').getList<IP>(1, 50, {
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
