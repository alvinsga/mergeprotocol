import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { DatabaseRecordPayload } from '$lib/types';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const payload: DatabaseRecordPayload = await request.json();
		const data = payload.data;
		if (!data) throw Error('No data provided');
		// Create the record in PocketBase
		const record = await locals.pb.collection(payload.collection).create(data);

		return json({ success: true, record }, { status: 201 });
	} catch (error) {
		console.error('Error creating IP asset:', error);
		return json({ error: 'Failed to create IP asset' }, { status: 500 });
	}
};
