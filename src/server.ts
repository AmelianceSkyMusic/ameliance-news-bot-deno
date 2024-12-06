import { webhookCallback } from './deps.deno.ts';

import { bot } from './bot.ts';
import { connectToDatabase } from './libs/db/mongoose.ts';

const handleUpdate = webhookCallback(bot, 'std/http');

Deno.serve(async (req: Request) => {
	await connectToDatabase();
	if (req.method == 'POST') {
		const url = new URL(req.url);
		if (url.pathname.slice(1) == bot.token) {
			try {
				return await handleUpdate(req);
			} catch (err) {
				console.error(err);
			}
		}
	}

	console.log(`BOT STARTED IN SERVER MODE`);
	return new Response();
});
