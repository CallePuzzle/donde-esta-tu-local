import type { ZodObject } from 'zod/v4';
import { z } from 'zod/v4';

type Field = {
	name: string;
	placeholder: string;
	format?: string;
	description?: string;
	required: boolean;
};

export type Fields = Array<Field>;

export const zodToFieldsJsonSchema = (schema: ZodObject): Fields => {
	const jsonSchema = z.toJSONSchema(schema) as {
		properties: Record<string, unknown>;
		required: string[];
	};
	console.log(jsonSchema);
	const fields: Fields = [];
	for (const key in jsonSchema.properties) {
		const name = key;
		const properties = jsonSchema.properties[key] as Record<string, unknown>;
		const required = jsonSchema.required.includes(key);

		fields.push({
			name: name,
			required: required,
			placeholder: properties.placeholder as string,
			format: properties.format as string,
			description: properties.description as string
		});
	}

	return fields;
};
