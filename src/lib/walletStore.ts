import { writable } from 'svelte/store';
import {
	WalletCore,
	type AccountInfo,
	type NetworkInfo,
	type WalletInfo
} from '@aptos-labs/wallet-adapter-core';
import { Network } from 'aptos';
import { PetraWallet } from 'petra-plugin-wallet-adapter';

export const wallet = writable({
	connected: false,
	account: null as AccountInfo | null,
	network: null as NetworkInfo | null,
	wallet: null as WalletInfo | null,
	walletCore: new WalletCore([new PetraWallet()], ['Petra', 'Pontem Wallet', 'Mizu Wallet'], {
		network: Network.TESTNET
	})
});

export const isLoading = writable(false);
