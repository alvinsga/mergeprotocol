import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { VITE_CONTRACT_ADDRESS, VITE_MODULE_NAME, PRIVATE_KEY } from '$env/static/private';
import { aptos } from '$lib/aptos';
import {
	Account,
	Ed25519PrivateKey,
	TransactionWorkerEventsEnum,
	type InputGenerateTransactionPayloadData
} from '@aptos-labs/ts-sdk';
import type { License } from '$lib/types';

export const POST: RequestHandler = async ({ request }) => {
	const { licenseArray, address } = (await request.json()) as {
		licenseArray: License[];
		address: string;
	};
	const adminAccount = Account.fromPrivateKey({
		privateKey: new Ed25519PrivateKey(PRIVATE_KEY)
	});

	const transactions: InputGenerateTransactionPayloadData[] = [];

	for (let i = 0; i < licenseArray.length; i += 1) {
		const transaction: InputGenerateTransactionPayloadData = {
			function: `${VITE_CONTRACT_ADDRESS}::${VITE_MODULE_NAME}::register_license`,
			functionArguments: [
				address,
				licenseArray[i].royalty,
				licenseArray[i].price,
				licenseArray[i].attributionRequired
			]
		};
		transactions.push(transaction);
	}

	try {
		aptos.transaction.batch.forSingleAccount({
			sender: adminAccount,
			data: transactions
		});

		aptos.transaction.batch.on(TransactionWorkerEventsEnum.ExecutionFinish, async (data) => {
			console.log(data.message);
			aptos.transaction.batch.removeAllListeners();
		});
		return json({ success: true });
	} catch (error) {
		console.error('Error submitting transaction:', error);
		return json({ success: false, error: error }, { status: 500 });
	}
};
