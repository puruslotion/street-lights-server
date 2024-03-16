export abstract class Validate {
	validateProperty(
		// eslint-disable-next-line
		input: any,
		type: string,
		name: string,
		isRequired = false,
		isArray = false,
	) {
		if (isRequired && !input) {
			throw new Error(`${name} is required`);
		}

		if (isArray) {
			if (!input) return false;

			const result =
				Array.isArray(input) &&
				input.every((element) => typeof element === type);

			if (result) {
				if (isRequired && input.length < 1) {
					throw new Error(
						`${name} is required therefore length has to be greater than 0`,
					);
				}

				return true;
			} else {
				throw new Error(`All elements in array must be of type ${type}`);
			}
		}

		if (input && typeof input !== type) {
			throw new Error(`${name} must be of type ${type}`);
		} else if (!input) {
			return false;
		}

		return true;
	}
}
