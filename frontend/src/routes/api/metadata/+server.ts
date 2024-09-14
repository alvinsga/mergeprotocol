import { error, json } from '@sveltejs/kit';

export async function GET({ url, locals }) {
	const id = url.searchParams.get('id');

	if (!id) {
		throw error(400, 'Missing ID parameter');
	}

	try {
		const record = await locals.pb.collection('metadata').getOne(id);
		if (record.type === 'collection') {
			return json({
				name: record.name,
				description: record.description,
				image: record.image,
				external_url: record.external_url
			});
		} else if (record.type === 'token') {
			return json({
				description: record.description,
				image: record.image,
				name: record.name,
				external_url: record.external_url,
				attributes: []
			});
		} else {
			return json(record);
		}
	} catch (err) {
		console.error('Error fetching metadata:', err);
		throw error(500, 'Error fetching metadata');
	}
}
