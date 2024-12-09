import { webhookCallback } from './deps.deno.ts';
import { getRandomNumber } from 'npm:ameliance-scripts';

import { bot } from './bot.ts';
import { connectToDatabase } from './libs/db/mongoose.ts';
import { sendArticle } from './actions/helpers/send-article.ts';

const handleUpdate = webhookCallback(bot, 'std/http');

Deno.serve(async (req: Request) => {
	await connectToDatabase();
	const url = new URL(req.url);

	if (req.method === 'POST' && url.pathname.slice(1) === bot.token) {
		try {
			return await handleUpdate(req);
		} catch (err) {
			console.error(err);
			return new Response('Error', { status: 500 });
		}
	}

	if (req.method === 'GET' && url.pathname === '/send-article') {
		console.log('url: ', url);
		try {
			await sendArticle(bot.context);
			const nextInterval = getRandomNumber(1, 5);
			console.log(`Article sent successfully. Next interval: ${nextInterval} minutes`);
			return new Response(String(nextInterval), { status: 200 });
		} catch (error) {
			console.error('Error during article sending:', error);
			return new Response('Error', { status: 500 });
		}
	}

	console.log(`BOT STARTED IN SERVER MODE`);
	return new Response();
});
