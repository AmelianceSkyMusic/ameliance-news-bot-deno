import {
	InputMediaAudio,
	InputMediaDocument,
	InputMediaPhoto,
	InputMediaVideo,
} from 'https://deno.land/x/grammy@v1.32.0/types.ts';
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

			const text = ctx.msg?.caption;

			const postMediaGroup = ctx.msg?.media_group_id || '';
			const postPhoto = ctx.msg?.photo?.at(-1)?.file_id || ''; //* Get last photo from photo array with different sizes
			const postDocument = ctx.msg?.document?.file_id || '';
			const postVideo = ctx.msg?.video?.file_id || '';
			const postGif = ctx.msg?.animation?.file_id || '';
			const postAudio = ctx.msg?.audio?.file_id || '';

			if (
				!postMediaGroup &&
				!postPhoto &&
				!postDocument &&
				!postVideo &&
				!postGif &&
				!postAudio
			) {
				return;
			}

			const articleText = text?.split('\n').splice(1).join('\n').trim();
			if (!articleText) return;

			const postAsHTML = await generateBimbaPostAsHTML({ text: articleText });
			if (!postAsHTML) return;

			if (postMediaGroup) {
				const mediaGroup: Array<
					InputMediaAudio | InputMediaDocument | InputMediaPhoto | InputMediaVideo
				> = [];

				if (ctx.msg?.media_group_id) {
					const messages = await ctx.api.getUpdates();
					let firstItemAdded = false;
					for (const message of messages) {
						if (message.message?.media_group_id === ctx.msg.media_group_id) {
							if (message.message.video) {
								mediaGroup.push({
									type: 'video',
									media: message.message.video.file_id,
									caption: !firstItemAdded ? postAsHTML : undefined,
									parse_mode: !firstItemAdded ? 'HTML' : undefined,
								});
								firstItemAdded = true;
							} else if (message.message.photo) {
								mediaGroup.push({
									type: 'photo',
									media: message.message.photo?.at(-1)?.file_id || '',
									caption: !firstItemAdded ? postAsHTML : undefined,
									parse_mode: !firstItemAdded ? 'HTML' : undefined,
								});
								firstItemAdded = true;
							} else if (message.message.document) {
								mediaGroup.push({
									type: 'document',
									media: message.message.document.file_id,
									caption: !firstItemAdded ? postAsHTML : undefined,
									parse_mode: !firstItemAdded ? 'HTML' : undefined,
								});
								firstItemAdded = true;
							} else if (message.message.audio) {
								mediaGroup.push({
									type: 'audio',
									media: message.message.audio.file_id,
									caption: !firstItemAdded ? postAsHTML : undefined,
									parse_mode: !firstItemAdded ? 'HTML' : undefined,
								});
								firstItemAdded = true;
							}
						}
					}
				}

				if (mediaGroup.length > 0) {
					await ctx.api.sendMediaGroup(Number(ENV.BIMBA_NEWS_ID), mediaGroup);
				}
			} else if (postPhoto) {
				await ctx.api.sendPhoto(Number(ENV.BIMBA_NEWS_ID), postPhoto, {
					caption: postAsHTML,
					parse_mode: 'HTML',
				});
			} else if (postDocument) {
				await ctx.api.sendDocument(Number(ENV.BIMBA_NEWS_ID), postDocument, {
					caption: postAsHTML,
					parse_mode: 'HTML',
				});
			} else if (postVideo) {
				await ctx.api.sendVideo(Number(ENV.BIMBA_NEWS_ID), postVideo, {
					caption: postAsHTML,
					parse_mode: 'HTML',
				});
			} else if (postGif) {
				await ctx.api.sendAnimation(Number(ENV.BIMBA_NEWS_ID), postGif, {
					caption: postAsHTML,
					parse_mode: 'HTML',
				});
			} else if (postAudio) {
				await ctx.api.sendAudio(Number(ENV.BIMBA_NEWS_ID), postAudio, {
					caption: postAsHTML,
					parse_mode: 'HTML',
				});
			}
		} catch (error) {
			await handleAppError(ctx, error);
		}
	});
}
