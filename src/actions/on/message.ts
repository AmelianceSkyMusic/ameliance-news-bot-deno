import { bot } from '../../bot.ts';
import { ENV } from '../../constants/env.ts';
import { Context, handleAppError, hasAccess, logUserInfo } from '../../deps.deno.ts';
import { generateBimbaPostAsHTML } from '../helpers/generate-bimba-post-as-html.ts';

export function message() {
	bot.on('message', async (ctx: Context) => {
		try {
			const hasAccessToRunCommand = hasAccess({ ctx, exclusiveAccess: 'all' });
			console.log('message: ');
			logUserInfo(ctx, { message: 'on message', accessMessage: hasAccessToRunCommand });
			if (!hasAccessToRunCommand) return;

			const text = ctx.msg.caption;

			const postPhoto = ctx.msg.photo?.[0].file_id || '';
			if (!postPhoto) return;

			const articleText = text?.split('\n').splice(1).join('\n').trim();
			if (!articleText) return;

			const postAsHTML = await generateBimbaPostAsHTML(ctx, { text: articleText });
			if (!postAsHTML) return;

			await ctx.api.sendPhoto(Number(ENV.BIMBA_NEWS_ID), postPhoto, {
				caption: postAsHTML,
				parse_mode: 'HTML',
			});
		} catch (error) {
			handleAppError(ctx, error);
		}
	});
}
