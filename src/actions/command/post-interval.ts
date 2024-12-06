import { bot } from '../../bot.ts';
import { Context, handleAppError, hasAccess, logUserInfo } from '../../deps.deno.ts';
import { runWithRandomInterval } from '../../submodules/ameliance-telegram-scripts-deno/src/run-with-random-interval.ts';
import { sendArticle } from '../helpers/send-article.ts';

export function postInterval() {
	bot.command('postInterval', async (ctx: Context) => {
		try {
			const hasAccessToRunCommand = hasAccess({ ctx, exclusiveAccess: 'owner' });
			logUserInfo(ctx, { message: 'hears postInterval', accessMessage: hasAccessToRunCommand });
			if (!hasAccessToRunCommand) return;

			runWithRandomInterval(
				ctx,
				async () => {
					await sendArticle(ctx);
				},
				10,
				15,
			);
		} catch (error) {
			handleAppError(ctx, error);
		}
	});
}
