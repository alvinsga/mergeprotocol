import type { PageServerLoad } from './$types';
import type { IP } from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
	try {
		// Check if the user is logged in
		if (!locals.user) {
			return {
				ipAssets: []
			};
		}

		// Fetch IP assets belonging to the logged-in creator
		const records = await locals.pb.collection('ipassets').getList<IP>(1, 50, {
			filter: `creator = "${locals.user.id}"`,
			sort: '-created'
		});

		return {
			ipAssets: records.items
		};
	} catch (error) {
		console.error("Error fetching creator's IP assets:", error);
		return {
			ipAssets: []
		};
	}
};
