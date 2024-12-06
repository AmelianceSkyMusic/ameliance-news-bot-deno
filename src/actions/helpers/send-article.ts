import { ENV } from '../../constants/env.ts';
import {
	Context,
	getHTMLData,
	getTextFromHTML,
	handleAppError,
	InputFile,
} from '../../deps.deno.ts';
import { data } from '../../libs/db/data/index.ts';
import { onMessagePostMenu } from '../menu/on-message-post-menu.ts';
import { generateBimbaPostAsHTML } from './generate-bimba-post-as-html.ts';
import { getArticleToPost } from './get-article-to-post.ts';

export async function sendArticle(ctx: Context) {
	try {
		const respArticle = await getArticleToPost(ctx);

		if (!respArticle) {
			await ctx.reply('NO FRESH ARTICLE!😢');
			return;
		}
		await data.article.incrementAttempts(respArticle?._id);

		const {
			title,
			publishedAt,
			url,
			image,
			source: { name },
		} = respArticle;

		ctx.reply(
			`<b>title:</b> ${title}
<b>publishedAt:</b> ${publishedAt}
<b>url:</b> ${url}
<b>name:</b> ${name}
<b>image:</b> ${image}`,
			{
				parse_mode: 'HTML',
				reply_markup: onMessagePostMenu,
			},
		);

		const htmlData = await getHTMLData(ctx, url);
		if (!htmlData) return;

		const textContent = getTextFromHTML(htmlData);
		if (!textContent) return;

		const postAsHTML = await generateBimbaPostAsHTML(ctx, { title, text: textContent });
		if (!postAsHTML) return;

		await ctx.api.sendPhoto(Number(ENV.BIMBA_NEWS_ID), new InputFile(new URL(image)), {
			caption: postAsHTML,
			parse_mode: 'HTML',
		});

		await data.article.markAsPosted(respArticle?._id);
	} catch (error) {
		handleAppError(ctx, error);
	}
}
