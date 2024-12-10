import { bot } from '../../bot.ts';
import { Context, handleAppError, hasAccess, logUserInfo } from '../../deps.deno.ts';
import { sendArticle } from '../helpers/send-article.ts';

export function post() {
	bot.command('post', async (ctx: Context) => {
		try {
			const hasAccessToRunCommand = hasAccess({ ctx, exclusiveAccess: 'owner' });
			logUserInfo(ctx, { message: 'hears post', accessMessage: hasAccessToRunCommand });
			if (!hasAccessToRunCommand) return;

			await sendArticle();
		} catch (error) {
			await handleAppError(ctx, error);
		}
	});
}
