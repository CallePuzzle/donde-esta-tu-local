import { ZodSchema } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

type Field = {
	name: string;
	placeholder: string;
	format?: string;
	description?: string;
	required: boolean;
};

export type Fields = Array<Field>;

export const zodToFieldsJsonSchema = (schema: ZodSchema<any>): Fields => {
	const jsonSchema = zodToJsonSchema(schema) as {
		properties: Record<string, unknown>;
		required: string[];
	};

	const fields: Fields = [];
	for (const key in jsonSchema.properties) {
		const name = key;
		const properties = jsonSchema.properties[key] as Record<string, unknown>;
		const required = jsonSchema.required.includes(key);

		fields.push({
			name: name,
			required: required,
			placeholder: name,
			format: properties.format as string,
			description: (properties.description as string) ?? undefined
		});
	}

	return fields;
};
