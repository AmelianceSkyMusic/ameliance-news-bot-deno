import { actions } from './actions/index.ts';
import { ENV } from './constants/env.ts';

import { Bot, GrammyError, HttpError } from './deps.deno.ts';

if (!ENV.BOT_TOKEN) throw new Error('BOT_TOKEN is missing!');

export const bot = new Bot(ENV.BOT_TOKEN || '');

bot.catch((err) => {
	const ctx = err.ctx;
	console.error(`Помилка під час обробки оновлення ${ctx.update.update_id}:`);
	const e = err.error;
	if (e instanceof GrammyError) {
		console.error('Помилка в запиті:', e.description);
	} else if (e instanceof HttpError) {
		console.error("Не вдалося зв'язатися з Telegram:", e);
	} else {
		console.error('Невідома помилка:', e);
	}
});

export const onMessagePostMenu = actions.menu.onMessagePostMenu();
actions.command.start();
actions.command.post();
actions.command.postInterval();
actions.on.message();
