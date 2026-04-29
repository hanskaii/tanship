import {
	purchaseConfirmationTemplate,
	type PurchaseConfirmationData
} from "./templates/purchase-confirmation";
import {
	showcaseNotificationTemplate,
	type ShowcaseNotificationData
} from "./templates/showcase-notification";
import { otpEmailTemplate } from "./templates/otp";

interface MailerEnv {
	/** Cloudflare Email Workers send_email binding */
	SEND_EMAIL: SendEmail;
	RESEND_FROM_EMAIL: string;
	APP_NAME: string;
}

export const createMailer = (env: MailerEnv) => {
	const from = `${env.APP_NAME} <${env.RESEND_FROM_EMAIL}>`;

	const send = (to: string, subject: string, html: string) =>
		env.SEND_EMAIL.send({ from, to, subject, html });

	return {
		async sendOTP(to: string, otp: string): Promise<void> {
			await send(to, "Your Verification Code", otpEmailTemplate(otp));
		},

		async sendPurchaseConfirmation(
			to: string,
			data: PurchaseConfirmationData
		): Promise<void> {
			await send(
				to,
				`Your ${data.planName} license key`,
				purchaseConfirmationTemplate(data)
			);
		},

		async sendShowcaseNotification(
			to: string,
			data: ShowcaseNotificationData
		): Promise<void> {
			await send(
				to,
				`New showcase submission: ${data.projectName}`,
				showcaseNotificationTemplate(data)
			);
		}
	};
};

export type Mailer = ReturnType<typeof createMailer>;
