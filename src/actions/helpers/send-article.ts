import { bot, onMessagePostMenu } from '../../bot.ts';
import { ENV } from '../../constants/env.ts';
import { InputFile } from '../../deps.deno.ts';
import { getTextFromHTML } from '../../deps.deno.ts';
import { data } from '../../libs/db/data/index.ts';
import { generateBimbaPostAsHTML } from './generate-bimba-post-as-html.ts';
import { getArticleToPost } from './get-article-to-post.ts';
import { handleAppErrorWithNoContext } from './no-context/handle-app-error-with-no-context.ts';

async function isImageUrlValid(imageUrl: string): Promise<boolean> {
	try {
		const response = await fetch(imageUrl, { method: 'HEAD' });
		const contentType = response.headers.get('content-type');
		if (!contentType) return false;

		const validFormats = ['image/jpeg', 'image/png', 'image/webp'];
		return validFormats.includes(contentType);
	} catch {
		return false;
	}
}

export async function getHTMLData(url: string) {
	try {
		const data = await fetch(url);
		if (!data.ok) {
			await handleAppErrorWithNoContext(
				`Error fetching data: ${data.status} ${data.statusText}`,
			);
			return null;
		}
		const contentType = data.headers.get('Content-Type');
		let encoding = 'utf-8';

		if (contentType) {
			const match = contentType.match(/charset=([^;]+)/);
			if (match) encoding = match[1];
		}

		const arrayBuffer = await data.arrayBuffer();
		const decoder = new TextDecoder(encoding);

		const html = decoder.decode(arrayBuffer);

		return html;
	} catch (error) {
		await handleAppErrorWithNoContext(error);
	}
}

export async function sendArticle(finalMessage?: string) {
	try {
		const respArticle = await getArticleToPost();

		if (!respArticle) {
			await bot.api.sendMessage(Number(ENV.OWNER_ID), 'NO FRESH ARTICLE!😢');
			return;
		}

		await data.article.incrementPostAttempts(respArticle?._id);

		const {
			title,
			publishedAt,
			url,
			image,
			source: { name },
		} = respArticle;

		if (!(await isImageUrlValid(image))) {
			await handleAppErrorWithNoContext('Invalid image format, skipping article');
			await data.article.markAsPosted(respArticle?._id);
			await sendArticle();
			return;
		}

		await bot.api.sendMessage(
			Number(ENV.OWNER_ID),
			`<b>title:</b> ${title}
<b>publishedAt:</b> ${publishedAt}
<b>url:</b> ${url}
<b>name:</b> ${name}
<b>image:</b> ${image}`,
			{
				parse_mode: 'HTML',
			},
		);

		const htmlData = await getHTMLData(url);

		if (!htmlData) return await data.article.setSkipped(respArticle?._id);

		const textContent = getTextFromHTML(htmlData);
		if (!textContent) return await data.article.setSkipped(respArticle?._id);

		const postAsHTML = await generateBimbaPostAsHTML({ title, text: textContent });
		if (!postAsHTML) {
			await data.article.incrementPostAttempts(respArticle?._id);
			await sendArticle();
			return;
		}

		await bot.api.sendPhoto(Number(ENV.BIMBA_NEWS_ID), new InputFile(new URL(image)), {
			caption: postAsHTML,
			parse_mode: 'HTML',
		});

		await data.article.markAsPosted(respArticle?._id);
	} catch (error) {
		await handleAppErrorWithNoContext(error);
		await sendArticle();
	} finally {
		if (finalMessage) await bot.api.sendMessage(Number(ENV.OWNER_ID), finalMessage);
	}
}
