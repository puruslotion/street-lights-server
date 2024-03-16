import { Validate } from '../classes/validate';
import { PropertyType } from '../enums/propertyType';

export class Role {
	static USER = 'user';
	static ADMIN = 'admin';
}

export class User extends Validate {
	username: string = '';
	password: string = '';
	roles: string[] = [];

	// eslint-disable-next-line
	constructor(json: any) {
		super();

		if (
			this.validateProperty(
				json?.username,
				PropertyType.STRING,
				'username',
				true,
			)
		) {
			this.username = json.username;
		}

		if (
			this.validateProperty(
				json?.password,
				PropertyType.STRING,
				'password',
				true,
			)
		) {
			this.password = json.password;
		}

		if (
			this.validateProperty(
				json?.roles,
				PropertyType.STRING,
				'roles',
				true,
				true,
			)
		) {
			this.roles = [...new Set(json.roles as string[])];
			this.roles.forEach((value) => {
				if (!Object.values(Role).includes(value)) {
					throw new Error(`${value} is not a valid role`);
				}
			});
		}
	}
}
