export const validateParam = (pram, name) => {
	if (pram === undefined) {
		throw new Error(`${name} is undefined`)
	}

	if (pram === null) {
		throw new Error(`${name} is null`)
	}
}

export const validateManyParams = (prams) => {
	for (const pram of prams) {
		validateParam(pram.value, pram.name)
	}
}

export const isNumber = (n) => /^-?[\d.]+(?:e-?\d+)?$/.test(n)
