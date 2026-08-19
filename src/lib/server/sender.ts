import nodemailer from 'nodemailer';

import type { Transporter } from 'nodemailer';

interface TransporterOptions {
	host: string;
	port: number;
	secure: boolean;
	auth: {
		user: string;
		pass: string;
	};
}

// Cacheado a nivel de módulo: las opciones vienen siempre de las mismas env vars,
// así que reutilizamos la misma conexión/pool en vez de crear una por email enviado.
let transporter: Transporter | undefined;

const sender = async (
	transporterOptions: TransporterOptions,
	from: string,
	to: string,
	subject: string,
	text: string
) => {
	transporter ??= nodemailer.createTransport(transporterOptions);
	await transporter.sendMail({
		from: from,
		to,
		subject,
		text
	});
};

export default sender;
