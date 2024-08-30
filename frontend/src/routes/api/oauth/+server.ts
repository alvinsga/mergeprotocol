import { redirect } from '@sveltejs/kit';

export const GET = async ({ url, locals }) => {
	const provider = 'google';
	const redirectUrl = `${url.origin}/api/oauth`;

	// Check if this is the initial request or the callback from Google
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');

	const codeVerifierResponse = await locals.pb
		.collection('code_verifier')
		.getFirstListItem(`state="${state}"`);
	const codeVerifier = codeVerifierResponse.codeVerifier;

	if (code && codeVerifier) {
		// This is the callback from Google
		try {
			await locals.pb
				.collection('users')
				.authWithOAuth2Code(provider, code, codeVerifier, redirectUrl);
			// Set the auth cookie
			locals.pb.authStore.exportToCookie();

			// Redirect to a protected page or home page
			throw redirect(303, '/app');
		} catch (err) {
			console.error('Error during OAuth callback:', err);
			throw redirect(303, '/app');
		}
	}
	throw redirect(303, '/app');
};
