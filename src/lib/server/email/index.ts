import { Resend } from 'resend';

export interface ResendEmailConfig {
	apiKey?: string;
	from?: string;
}

let cachedResend: Resend | null = null;

export function getResendClient(config: ResendEmailConfig = {}): Resend {
	if (cachedResend && !config.apiKey) {
		return cachedResend;
	}

	const apiKey =
		config.apiKey ||
		(typeof process !== 'undefined' ? process.env.RESEND_API_KEY : undefined) ||
		'';

	const client = new Resend(apiKey);
	if (!config.apiKey) cachedResend = client;
	return client;
}

export interface SendMagicLinkOptions {
	to: string;
	url: string;
	appName?: string;
	from?: string;
}

/**
 * Sends a branded magic link sign-in email.
 * In development without a RESEND_API_KEY, logs the link clearly to the terminal console.
 */
export async function sendMagicLinkEmail(options: SendMagicLinkOptions) {
	const apiKey = (typeof process !== 'undefined' ? process.env.RESEND_API_KEY : undefined) || '';

	if (!apiKey || apiKey === 're_placeholder' || apiKey.startsWith('mock_')) {
		console.log('\n==================================================');
		console.log('📨 [Yaxa Dev Email Logger] Magic Link Sign-In Email');
		console.log(`To: ${options.to}`);
		console.log(`Subject: Your sign-in link for ${options.appName || 'Your SaaS App'}`);
		console.log(`URL: ${options.url}`);
		console.log('==================================================\n');
		return { data: { id: `mock-${Date.now()}` }, error: null };
	}

	const resend = getResendClient();
	const appName = options.appName || 'Your SaaS App';
	const from =
		options.from ||
		(typeof process !== 'undefined' ? process.env.EMAIL_FROM : undefined) ||
		'onboarding@resend.dev';

	return resend.emails.send({
		from,
		to: options.to,
		subject: `Your sign-in link for ${appName}`,
		html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #18181b;">
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">Sign in to ${appName}</h2>
          <p style="font-size: 15px; color: #71717a; margin: 0;">Click the button below to sign in instantly. This link will expire in 15 minutes.</p>
        </div>
        <div style="margin: 32px 0;">
          <a href="${options.url}" style="background-color: #ff3e00; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block; font-size: 15px;">
            Sign In to ${appName}
          </a>
        </div>
        <p style="font-size: 13px; color: #a1a1aa; line-height: 1.5; margin-top: 32px;">
          If you did not request this email, you can safely ignore it.<br/>
          Button not working? Copy and paste this URL into your browser:<br/>
          <a href="${options.url}" style="color: #ff3e00; word-break: break-all;">${options.url}</a>
        </p>
      </div>
    `
	});
}

export interface SendWelcomeEmailOptions {
	to: string;
	name?: string;
	appName?: string;
	dashboardUrl?: string;
	from?: string;
}

/**
 * Sends a welcome onboarding email to new SaaS signups.
 * In development without a RESEND_API_KEY, logs the email clearly to the terminal console.
 */
export async function sendWelcomeEmail(options: SendWelcomeEmailOptions) {
	const apiKey = (typeof process !== 'undefined' ? process.env.RESEND_API_KEY : undefined) || '';

	if (!apiKey || apiKey === 're_placeholder' || apiKey.startsWith('mock_')) {
		console.log('\n==================================================');
		console.log('📨 [Yaxa Dev Email Logger] Welcome Onboarding Email');
		console.log(`To: ${options.to} (${options.name || 'User'})`);
		console.log(`Subject: Welcome to ${options.appName || 'Your SaaS App'}! 🎉`);
		console.log('==================================================\n');
		return { data: { id: `mock-${Date.now()}` }, error: null };
	}

	const resend = getResendClient();
	const appName = options.appName || 'Your SaaS App';
	const from =
		options.from ||
		(typeof process !== 'undefined' ? process.env.EMAIL_FROM : undefined) ||
		'onboarding@resend.dev';
	const dashboardUrl = options.dashboardUrl || 'http://localhost:5173/dashboard';

	return resend.emails.send({
		from,
		to: options.to,
		subject: `Welcome to ${appName}! 🎉`,
		html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #18181b;">
        <h2 style="font-size: 24px; font-weight: 700; margin: 0 0 12px 0;">Welcome aboard, ${options.name || 'there'}!</h2>
        <p style="font-size: 15px; color: #52525b; line-height: 1.6;">
          Thank you for joining <strong>${appName}</strong>. Your workspace is ready and you can start building immediately.
        </p>
        <div style="margin: 28px 0;">
          <a href="${dashboardUrl}" style="background-color: #ff3e00; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block; font-size: 15px;">
            Go to Dashboard →
          </a>
        </div>
        <p style="font-size: 13px; color: #a1a1aa; margin-top: 32px;">
          Have questions or need help? Just reply directly to this email.
        </p>
      </div>
    `
	});
}
