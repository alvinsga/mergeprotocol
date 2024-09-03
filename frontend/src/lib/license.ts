type internalLicenseNaming = { name: string; description: string };

export const defaultLicenses: Record<string, internalLicenseNaming> = {
	1: { name: 'Royalty Free', description: 'Reproduce as you wish' },
	2: { name: 'Personal Use', description: 'Reproduce as you wish' },
	3: { name: 'Commercial Use', description: 'Reproduce as you wish' }
};
