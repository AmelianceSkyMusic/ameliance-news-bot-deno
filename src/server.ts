import { webhookCallback } from './deps.deno.ts';

import { bot } from './bot.ts';
import { connectToDatabase } from './libs/db/mongoose.ts';
import { sendArticle } from './actions/helpers/send-article.ts';

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
			}
		}
	}

	if (req.method === 'GET' && url.pathname === '/send-article') {
		try {
			await sendArticle(bot.context);
			console.log('Article sent successfully');
			return new Response('OK', { status: 200 });
		} catch (error) {
			console.error('Error during article sending:', error);
			return new Response('Error', { status: 500 });
		}
	}

	console.log(`BOT STARTED IN SERVER MODE`);
	return new Response();
});
