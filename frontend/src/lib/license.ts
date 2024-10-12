type internalLicenseNaming = {
	name: string;
	description: string;
	json: { [key: string]: unknown };
};

export const defaultLicenses: Record<string, internalLicenseNaming> = {
	1: {
		name: 'Personal Use',
		description: 'Use for non-commercial, personal projects only',
		json: {
			transferrable: true,
			attributionRequired: false,
			commercialUse: false,
			derivativesAllowed: false,
			aiUse: false
		}
	},
	2: {
		name: 'Personal Use + Attribution',
		description: 'Use for personal projects with credit to the original creator',
		json: {
			transferrable: true,
			attributionRequired: true,
			commercialUse: false,
			derivativesAllowed: false,
			aiUse: false
		}
	},
	3: {
		name: 'Commercial Use',
		description: 'Use for both personal and commercial projects without restrictions',
		json: {
			transferrable: true,
			attributionRequired: false,
			commercialUse: true,
			derivativesAllowed: false,
			aiUse: false
		}
	},
	4: {
		name: 'AI Use',
		description: 'Allow for use within generative AI models',
		json: {
			transferrable: true,
			attributionRequired: false,
			commercialUse: false,
			derivativesAllowed: false,
			aiUse: true
		}
	}
};
