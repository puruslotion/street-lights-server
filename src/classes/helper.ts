import argon2 from 'argon2';

export class Helper {
	static bytesToString(bytes: Buffer) {
		const decoder = new TextDecoder('utf-8');
		return decoder.decode(new Uint8Array(bytes));
	}

	static base64ToUint8Array(base64: string): Uint8Array {
		// Decode base64 string to a Buffer
		const buffer = Buffer.from(base64, 'base64');

		// Convert the Buffer to a Uint8Array
		return new Uint8Array(buffer);
	}

	static stringToBase64(str: string): string {
		// Step 1: Convert string to byte array
		const encoder = new TextEncoder();
		const byteArray = encoder.encode(str);

		// Step 2: Convert byte array to base64
		return btoa(String.fromCharCode(...new Uint8Array(byteArray)));
	}

	static sanitize(str: string): string {
		return str.replace(/[${}]/g, '');
	}

	// eslint-disable-next-line
	static parseError(error: any) {
		const serializedError = JSON.stringify(
			error,
			Object.getOwnPropertyNames(error),
		);

		const deserializedError = Object.assign(
			new Error(),
			JSON.parse(serializedError),
		);

		return deserializedError;
	}

	static async hashPassword(plainPassword: string) {
		return await argon2.hash(plainPassword);
	}

	static async verifyPassword(plainPassword: string, hash: string) {
		return await argon2.verify(hash, plainPassword);
	}
}
