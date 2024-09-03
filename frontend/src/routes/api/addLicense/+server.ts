import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { VITE_CONTRACT_ADDRESS, VITE_MODULE_NAME, PRIVATE_KEY } from '$env/static/private';
import { aptos } from '$lib/aptos';
import { Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';

export const POST: RequestHandler = async ({ request }) => {
	const { tokenId, licenseId, price, royalty, validity } = await request.json();
	const adminAccount = Account.fromPrivateKey({
		privateKey: new Ed25519PrivateKey(PRIVATE_KEY)
	});

	const transaction = await aptos.transaction.build.simple({
		sender: adminAccount.accountAddress,
		data: {
			function: `${VITE_CONTRACT_ADDRESS}::${VITE_MODULE_NAME}::register_license`,
			functionArguments: [tokenId, licenseId, price, royalty, validity]
		}
	});

	try {
		const commitedTransaction = await aptos.signAndSubmitTransaction({
			signer: adminAccount,
			transaction
		});
		return json({ success: true, hash: commitedTransaction.hash });
	} catch (error) {
		console.error('Error submitting transaction:', error);
		return json({ success: false, error: error }, { status: 500 });
	}
};
