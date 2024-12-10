import { webhookCallback } from './deps.deno.ts';
import { getRandomNumber } from 'npm:ameliance-scripts';

import { bot } from './bot.ts';
import { connectToDatabase } from './libs/db/mongoose.ts';
import { sendArticle } from './actions/helpers/send-article.ts';
import { ENV } from './constants/env.ts';

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
				const randomMinutes = getRandomNumber(1, 5);
				const lastExecution = Number(Deno.env.get('LAST_EXECUTION') || 0);
				const now = Date.now();

				if (now - lastExecution >= 15 * 60 * 1000) {
				const nextExecutionTime = new Date(now + randomMinutes * 60 * 1000);

				const minutes = nextExecutionTime.getMinutes();
				const offset = getRandomNumber(0, 4);
				nextExecutionTime.setMinutes(minutes + offset);

				if (now - lastExecution >= randomMinutes * 60 * 1000) {
					const nextExecutionTime = new Date(now + randomMinutes * 60 * 1000);
					Deno.env.set('LAST_EXECUTION', now.toString());

					const nextExecutionTimeIn24Format = nextExecutionTime.toLocaleTimeString('en-US', {
						hour: '2-digit',
						minute: '2-digit',
						hour12: false,
						timeZone: 'Europe/Kiev',
					});
					const nextExecutionMessage =
						`OK. Next article will be sent at ${nextExecutionTimeIn24Format}`;
					await sendArticle(nextExecutionMessage);

					return new Response(nextExecutionMessage, { status: 200 });
				} else {
					console.log('Skipping execution');
					return new Response('Skipped', { status: 200 });
				}
			} catch (error) {
				console.error('Error during post sending:', error);
				return new Response('Error', { status: 500 });
			}
		}
	}

	console.log(`BOT STARTED IN SERVER MODE`);
	return new Response();
});
