import { ENV } from '../../constants/env.ts';
import { Context, getHTMLData, getTextFromHTML, Menu } from '../../deps.deno.ts';
import { generateBimbaPostAsHTML } from '../helpers/generate-bimba-post-as-html.ts';
import { MyContext } from '../../types/my-context.ts';
import { bot } from '../../bot.ts';

function textToObject(text: string) {
	const lines = text.trim().split('\n');
	const result = {} as Record<string, string>;

	lines.forEach((line) => {
		const index = line.indexOf(':');
		const key = line.substring(0, index).trim();
		const value = line.substring(index + 1).trim();

		if (key && value) result[key] = value;
	});

	return result;
}

export function onMessagePostMenu() {
	const onMessagePostMenu = new Menu<MyContext>('on-message-post-menu').text(
		'Post ✉️',
		async (ctx: Context) => {
			const postData = textToObject(ctx.msg?.text || '');

			const htmlData = await getHTMLData(ctx, postData.url);
			if (!htmlData) return;
			const textContent = getTextFromHTML(htmlData);
			if (!textContent) return;

			const postAsHTML = await generateBimbaPostAsHTML(ctx, {
				title: postData.title,
				text: textContent,
			});

			if (!postAsHTML) return;

			await ctx.api.sendPhoto(Number(ENV.BIMBA_NEWS_ID), postData.image, {
				caption: postAsHTML,
				parse_mode: 'HTML',
			});
		},
	);

	bot.use(onMessagePostMenu);

	return onMessagePostMenu;
}
