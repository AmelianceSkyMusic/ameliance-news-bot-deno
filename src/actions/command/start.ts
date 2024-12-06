import { bot } from '../../bot.ts';
import { Context, handleAppError, logUserInfo } from '../../deps.deno.ts';

export function start() {
	bot.command('start', async (ctx: Context) => {
		try {
			logUserInfo(ctx, { message: 'command start' });

			await ctx.reply('Ласкаво просимо! Що треба?');
		} catch (error) {
			handleAppError(ctx, error);
		}
	});
}
