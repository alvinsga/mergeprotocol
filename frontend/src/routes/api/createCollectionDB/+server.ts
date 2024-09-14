import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { IP } from '$lib/types';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const data: Partial<IP> = await request.json();
		// Create the record in PocketBase
		const record = await locals.pb.collection('nftcollections').create(data);

		return json({ success: true, record }, { status: 201 });
	} catch (error) {
		console.error('Error creating IP asset:', error);
		return json({ error: 'Failed to create IP asset' }, { status: 500 });
	}
};
