import { ArticleSchema } from '../models/article.ts';
import type { Article } from '../types/article.ts';

export const article = {
	async getUnpostedArticle() {
		return await ArticleSchema.findOne({
			postedAtTelegramAt: null,
			skipped: { $ne: true },
		}).sort({ createdAt: 1 });
	},

	async incrementPostAttempts(articleId: string) {
		const article = await ArticleSchema.findById(articleId);
		if (!article) return null;
		article.postedAttempts = (article.postedAttempts || 0) + 1;
		if (article.postedAttempts >= 3) article.skipped = true;
		await article.save();
		return article;
	},

	async markAsSkipped(articleId: string) {
		const article = await ArticleSchema.findById(articleId);
		if (!article) return null;
		article.skipped = true;
		await article.save();
		return article;
	},

	async markAsPosted(articleId: string) {
		const article = await ArticleSchema.findById(articleId);
		if (!article) return null;
		article.postedAtTelegramAt = new Date();
		await article.save();
		return article;
	},

	async addNewArticles(apiArticles: Article[]) {
		//* Array of titles of received articles
		const apiTitles = apiArticles.map((article) => article.title);

		//* Find articles with such titles in the database
		const existingTitles = await ArticleSchema.find({ title: { $in: apiTitles } }).distinct(
			'title',
		);

		//* Filter out new articles that are not in the database yet
		const newArticles = apiArticles.filter((article) => !existingTitles.includes(article.title));

		//* Add new articles to the database
		if (newArticles.length > 0) {
			const articlesToInsert = newArticles.map((article) => ({
				...article,
				postedAt: null, //* All new articles are unposted
			}));

			await ArticleSchema.insertMany(articlesToInsert);
		}

		return newArticles.length; //* Number of added articles
	},

	async setSkipped(articleId: string) {
		const article = await ArticleSchema.findById(articleId);
		if (!article) return null;
		article.skipped = true;
		await article.save();
		return article;
	},
};
