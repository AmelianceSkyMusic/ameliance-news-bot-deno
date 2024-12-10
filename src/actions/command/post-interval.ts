import { bot } from '../../bot.ts';
import {
	Context,
	handleAppError,
	hasAccess,
	logUserInfo,
	runWithRandomInterval,
} from '../../deps.deno.ts';
import { sendArticle } from '../helpers/send-article.ts';

export function postInterval() {
	bot.command('postInterval', async (ctx: Context) => {
		try {
			const hasAccessToRunCommand = hasAccess({ ctx, exclusiveAccess: 'owner' });
			logUserInfo(ctx, { message: 'hears postInterval', accessMessage: hasAccessToRunCommand });
			if (!hasAccessToRunCommand) return;

			runWithRandomInterval(ctx, async () => await sendArticle(), 1, 3);
		} catch (error) {
			await handleAppError(ctx, error);
		}
	});
}
