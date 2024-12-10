import { ENV } from '../../constants/env.ts';
import { data } from '../../libs/db/data/index.ts';

import type { GNews } from '../../types/g-news.ts';
import { handleAppError } from './handle-app-error.ts';

export async function getArticleToPost() {
	try {
		const articleToPostFromUnposted = await data.article.getUnpostedArticle();
		if (articleToPostFromUnposted) return articleToPostFromUnposted;

		const respNews = await fetch(
			`https://gnews.io/api/v4/top-headlines?country=ua&category=general&apikey=${ENV.G_NEWS_API_KEY}`,
		);
		const newsData: GNews = await respNews.json();

		if (newsData && 'errors' in newsData) {
			await handleAppError(newsData.errors[0]);
			return;
		}
		const newArticlesCount = await data.article.addNewArticles(newsData.articles);
		if (newArticlesCount === 0) return null;

		let newArticleToPost = await data.article.getUnpostedArticle();
		if (newArticleToPost) return newArticleToPost;
	} catch (error) {
		await handleAppError(error);
	}
}
