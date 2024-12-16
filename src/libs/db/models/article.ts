import { Document, Model, model, Schema, Types } from '../../../deps.deno.ts';
import type { Article as ArticleType } from '../types/article.ts';

export type ArticleLean = ArticleType & {
	_id: Types.ObjectId;
};
export type ArticleDocument = Document & ArticleLean;

const articleSchema = new Schema<ArticleType>(
	{
		title: { type: String, index: true, required: true, unique: true },
		description: { type: String, required: true },
		content: { type: String, required: true },
		url: { type: String, required: true },
		image: { type: String, required: true },
		publishedAt: { type: Date },
		source: {
			name: { type: String, required: true },
			url: { type: String, required: true },
		},
		postedAtTelegramAt: { type: Date, index: true },
		postedAttempts: { type: Number },
		skipped: { type: Boolean },
	} as const,
	{ timestamps: true },
);

articleSchema.index({ title: 1 }, { unique: true });

export const ArticleSchema: Model<ArticleDocument> = model<ArticleDocument>(
	'Article',
	articleSchema,
);
