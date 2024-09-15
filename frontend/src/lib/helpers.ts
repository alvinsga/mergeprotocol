import type { GraphqlQuery } from 'aptos';
import { aptos } from './aptos';

export function shortenAddress(address: string, length: number) {
	return (
		address.slice(0, length / 2 + 2) +
		'...' +
		address.slice(address.length - length / 2, address.length)
	);
}

export async function runAptosViewFunction(functionName: string, functionArguments: string[]) {
	const moduleAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
	const moduleName = import.meta.env.VITE_MODULE_NAME;
	try {
		return await aptos.view({
			payload: {
				function: `${moduleAddress}::${moduleName}::${functionName}`,
				typeArguments: [],
				functionArguments: functionArguments
			}
		});
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (error) {
		console.log('An error occurred');
	}
}

export async function fetchCollection(address: string) {
	const i: GraphqlQuery = {
		query: `query GetAccountNftCollections {
  current_collection_ownership_v2_view(
    where: {owner_address: {_eq: "${address}"}}
    limit: 1000000
    offset: 0
    order_by: [{last_transaction_version: desc}, {collection_id: asc}]
  ) {
    collection_id
    distinct_tokens
    last_transaction_version
    owner_address
    collection_name
    collection_uri
    creator_address
    single_token_uri
  }
}`
	};
	const collections = await aptos.queryIndexer({
		query: i
	});
	console.log(collections);
	return collections;
}

// async function createToken() {
// 	// Build txn
// 	const transaction = await aptos.transaction.build.simple({
// 		sender: adminAccount.accountAddress,
// 		data: {
// 			function: `${minterContractAddress}::launchpad3::mint_token`,
// 			functionArguments: [
// 				`${$wallet.account?.address}`, //put random address for now
// 				'my new collection 1',
// 				'token desc',
// 				'my new token 2',
// 				tokenurl
// 			]
// 		}
// 	});

// 	const committedTxn = await aptos.signAndSubmitTransaction({
// 		signer: adminAccount,
// 		transaction
// 	});

// 	const response = await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
// 	console.log(response);
// }
