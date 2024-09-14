import { error, json } from '@sveltejs/kit';

export async function POST({ locals, request }) {
	const payload = await request.json();
	const collection = payload.collection;
	const filter = payload.filter;

	if (!payload) {
		throw error(400, 'Missing collection or id parameter');
	}

	try {
		if (filter) {
			const record = await locals.pb.collection(collection).getList(1, 50, { filter });
			return json(record);
		} else {
			const record = await locals.pb.collection(collection).getList(1, 50);
			return json(record);
		}
	} catch (err) {
		console.error(`Error fetching record from ${collection}:`, err);
		throw error(500, `Error fetching record from ${collection}`);
	}
}
