import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { OffChainIPData } from '$lib/types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const data: Partial<OffChainIPData> = await request.json();

	// Create the record in PocketBase
	try {
		const existingRecord = await locals.pb
			.collection('ipassets')
			.getFirstListItem(`address="${data.address}"`);
		if (existingRecord && data.license) {
			let mergedLicenseArray = [];
			if (existingRecord.license) {
				mergedLicenseArray = [...existingRecord.license, ...data.license];
			} else {
				mergedLicenseArray = data.license;
			}
			const record = await locals.pb
				.collection('ipassets')
				.update(existingRecord.id, { license: mergedLicenseArray });
			return json({ success: true, record }, { status: 201 });
		}
		return json({ error: 'Failed to create IP asset' }, { status: 500 });
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (error) {
		// Failed to find existing asset
		const record = await locals.pb.collection('ipassets').create(data);
		return json({ success: true, record }, { status: 201 });
	}
};
