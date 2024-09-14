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
	address: string;
	collection: string;
	license: string;
	creator: string;
}

export interface License {
	commercialUse: boolean;
	attributionRequired: boolean;
}

export interface LicenseConfig {
	royalty: number;
	price: number;
	validity: number;
}
