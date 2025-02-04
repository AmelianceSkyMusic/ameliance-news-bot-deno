export type Article = {
	title: string;
	description: string;
	content: string;
	url: string;
	image: string;
	publishedAt: string;
	source: {
		name: string;
		url: string;
	};
};

export type GNews =
	| {
		totalArticles: number;
		articles: Array<Article>;
	}
	| { errors: Array<string> };
