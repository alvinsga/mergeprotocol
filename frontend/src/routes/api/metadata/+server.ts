import { error } from '@sveltejs/kit';

export async function GET({ url, locals }) {
	const id = url.searchParams.get('id');

	if (!id) {
		throw error(400, 'Missing ID parameter');
	}

	try {
		const record = await locals.pb.collection('metadata').getOne(id);
		if (record.type === 'collection') {
			const body = {
				name: record.name,
				description: record.description,
				image: record.image,
				external_url: record.external_url
			};
			return new Response(JSON.stringify(body), {
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*' // You can replace '*' with your domain like 'http://localhost:5173'
				}
			});
		} else if (record.type === 'token') {
			const body = {
				description: record.description,
				image: record.image,
				name: record.name,
				external_url: record.external_url,
				type: record.token_type,
				attributes: []
			};
			return new Response(JSON.stringify(body), {
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*' // You can replace '*' with your domain like 'http://localhost:5173'
				}
			});
		}
	} catch (err) {
		console.error('Error fetching metadata:', err);
		throw error(500, 'Error fetching metadata');
	}
}
