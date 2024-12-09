import { webhookCallback } from './deps.deno.ts';
import { getRandomNumber } from 'npm:ameliance-scripts';

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
				return new Response('Error', { status: 500 });
			}
		}
	}

	if (req.method === 'GET') {
		if (url.pathname === '/send-article') {
			console.log('send-article: ', true);
			try {
				const randomMinutes = getRandomNumber(1, 5);
				const lastExecution = Number(Deno.env.get('LAST_EXECUTION') || 0);
				const now = Date.now();

				const nextExecutionTime = new Date(now + randomMinutes * 60 * 1000);

				if (now - lastExecution >= randomMinutes * 60 * 1000) {
					console.log('Executing sendArticle');
					await sendArticle();
					Deno.env.set('LAST_EXECUTION', now.toString());
					return new Response(
						`OK. Next article will be sent at ${nextExecutionTime.toLocaleTimeString(
							'en-US',
							{
								hour: '2-digit',
								minute: '2-digit',
							},
						)}`,
						{ status: 200 },
					);
				} else {
					console.log('Skipping execution');
					return new Response('Skipped', { status: 200 });
				}
				// await sendArticle();
				// return new Response('OK', { status: 200 });
			} catch (error) {
				console.error('Error during post sending:', error);
				return new Response('Error', { status: 500 });
			}
		}
	}

	console.log(`BOT STARTED IN SERVER MODE`);
	return new Response();
});
