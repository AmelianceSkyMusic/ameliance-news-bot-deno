import { bot } from '../../bot.ts';
import { Context, handleAppError, hasAccess, logUserInfo } from '../../deps.deno.ts';
import { getHolychordsAudioFile } from '../helpers/get-holychords-audio-file.ts';

export function postHolychords() {
	bot.command('postHolychords', async (ctx: Context) => {
		try {
			const hasAccessToRunCommand = hasAccess({ ctx, exclusiveAccess: 'owner' });
			logUserInfo(ctx, {
				message: 'hears post holychords',
				accessMessage: hasAccessToRunCommand,
			});
			if (!hasAccessToRunCommand) return;

			await getHolychordsAudioFile();
		} catch (error) {
			await handleAppError(ctx, error);
		}
	});
}
