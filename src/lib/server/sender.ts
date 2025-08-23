import nodemailer from 'nodemailer';

interface TransporterOptions {
	host: string;
	port: number;
	secure: boolean;
	auth: {
		user: string;
		pass: string;
	};
}

const sender = async (
	transporterOptions: TransporterOptions,
	from: string,
	to: string,
	subject: string,
	text: string
) => {
	const transporter = nodemailer.createTransport(transporterOptions);
	await transporter.sendMail({
		from: from,
		to,
		subject,
		text
	});
};

export default sender;
