import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { VITE_CONTRACT_ADDRESS, VITE_MODULE_NAME, PRIVATE_KEY } from '$env/static/private';
import { aptos } from '$lib/aptos';
import { Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';
import type { License } from '$lib/types';

export const POST: RequestHandler = async ({ request }) => {
	const { license, tokenId } = (await request.json()) as {
		license: License;
		tokenId: string;
	};
	const adminAccount = Account.fromPrivateKey({
		privateKey: new Ed25519PrivateKey(PRIVATE_KEY)
	});

	const transaction = await aptos.transaction.build.simple({
		sender: adminAccount.accountAddress,
		data: {
			function: `${VITE_CONTRACT_ADDRESS}::${VITE_MODULE_NAME}::register_license`,
			functionArguments: [tokenId, license.royalty, license.price, license.attributionRequired]
		}
	});

	// for (let i = 0; i < licenseArrayPayload.length; i += 1) {
	// 	const transaction: InputGenerateTransactionPayloadData = {
	// 		function: `${VITE_CONTRACT_ADDRESS}::${VITE_MODULE_NAME}::register_license`,
	// 		functionArguments: [
	// 			tokenId,
	// 			licenseArrayPayload[i].royalty,
	// 			licenseArrayPayload[i].price,
	// 			licenseArrayPayload[i].attributionRequired
	// 		]
	// 	};
	// 	transactions.push(transaction);
	// }

	try {
		const commitedTransaction = await aptos.signAndSubmitTransaction({
			signer: adminAccount,
			transaction
		});

		// aptos.transaction.batch.on(TransactionWorkerEventsEnum.TransactionExecuted, async (data) => {
		// 	console.log(data);
		// 	transactionHashArray.push(data.transactionHash);
		// });

		// aptos.transaction.batch.on(TransactionWorkerEventsEnum.TransactionSent, async (data) => {
		// 	console.log(data);
		// 	transactionHashArray.push(data.transactionHash);
		// });

		// aptos.transaction.batch.on(TransactionWorkerEventsEnum.ExecutionFinish, async (data) => {
		// 	console.log(data);
		// 	aptos.transaction.batch.removeAllListeners();
		// });
		return json({ success: true, hash: commitedTransaction.hash });
	} catch (error) {
		console.error('Error submitting transaction:', error);
		return json({ success: false, error: error }, { status: 500 });
	}
};
