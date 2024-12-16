import { getRandomNumber } from 'npm:ameliance-scripts';
import { webhookCallback } from './deps.deno.ts';

import { sendArticle } from './actions/helpers/send-article.ts';
import { bot } from './bot.ts';
import { connectToDatabase } from './libs/db/mongoose.ts';

const WEBHOOK_ENDPOINT = Deno.env.get('WEBHOOK_ENDPOINT');

if (!WEBHOOK_ENDPOINT) {
	console.error('WEBHOOK_ENDPOINT is not set. Please check your environment configuration');
}

async function ensureWebhook() {
	await bot.api.setWebhook(WEBHOOK_ENDPOINT);
	try {
		const webhookInfo = await bot.api.getWebhookInfo();

		console.log('webhookInfo.url: ', webhookInfo.url);
		console.log('WEBHOOK_ENDPOINT: ', WEBHOOK_ENDPOINT);
		if (!webhookInfo.url || webhookInfo.url !== WEBHOOK_ENDPOINT) {
			console.log('Webhook successfully is set!');
		} else {
			console.log('Webhook already set correctly!');
		}
	} catch (error) {
		console.error('Webhook setup error:', error);
	}
}

await ensureWebhook();

const handleUpdate = webhookCallback(bot, 'std/http');

Deno.serve(async (req: Request) => {
	await connectToDatabase();
	const url = new URL(req.url);

	if (req.method === 'POST') {
		if (url.pathname.slice(1) === bot.token) {
			try {
				return await handleUpdate(req);
			} catch (err) {
				console.error(err);
				return new Response('Error', { status: 500 });
			}
		}
	}

	if (req.method === 'GET') {
		if (url.pathname === '/send-article') {
			try {
				const fiveMinInMs = 5 * 60 * 1000;
				const randomDelay = getRandomNumber(0, fiveMinInMs);

				setTimeout(async () => {
					await sendArticle();
				}, randomDelay);

				return new Response('Ok', { status: 200 });
			} catch (error) {
				console.error('Error during post sending:', error);
				return new Response('Error', { status: 500 });
			}
		}
	}

	console.log(`BOT STARTED IN SERVER MODE`);
	return new Response();
});
