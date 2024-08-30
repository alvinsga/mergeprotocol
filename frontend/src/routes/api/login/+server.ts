import { redirect } from '@sveltejs/kit';

export const GET = async ({ url, locals }) => {
	const provider = 'google';
	const redirectUrl = `${url.origin}/api/oauth`;

	try {
		const authMethods = await locals.pb.collection('users').listAuthMethods();
		if (!authMethods || authMethods.authProviders.length === 0) {
			throw new Error('No auth methods available');
		}
		const googleAuth = authMethods.authProviders.find((p) => p.name === provider);

		if (!googleAuth) {
			throw new Error(`${provider} auth method not found`);
		}
		// Redirect to the provider's authorization URL
		const codeVerifier = googleAuth.codeVerifier;
		locals.pb.collection('code_verifier').create({ state: googleAuth.state, codeVerifier });

		return new Response(null, {
			status: 302,
			headers: { Location: googleAuth.authUrl + redirectUrl }
		});
	} catch (err) {
		console.error('Error during OAuth authentication:', err);
		throw redirect(303, '/app');
	}
};
