export interface IP {
	id: string;
	name: string;
	image: string;
	address: string;
	license: string;
}

export interface AptosIPData {
	id: string;
	name: string;
	image: string;
	address: string;
	collection: string;
}

export interface OffChainIPData {
	id: string;
	name: string;
	image: string;
	tokenId: string;
	collection: string;
	license: string;
	creator: string;
}

export interface License {
	royalty: boolean;
	price: number;
	attributionRequired: boolean;
}
