const MODE = Deno.env.get('MODE') || 'prod';

export const ENV = {
	BIMBA_NEWS_ID:
		(MODE === 'dev' ? Deno.env.get('DEV__BIMBA_NEWS_ID') : Deno.env.get('BIMBA_NEWS_ID')) ||
		Deno.env.get('BIMBA_NEWS_ID'),

	GOOGLE_DATA_TABLE_ID:
		(MODE === 'dev'
			? Deno.env.get('DEV__GOOGLE_DATA_TABLE_ID')
			: Deno.env.get('GOOGLE_DATA_TABLE_ID')) || Deno.env.get('GOOGLE_DATA_TABLE_ID'),

	BOT_TOKEN: (MODE === 'dev' ? Deno.env.get('DEV__BOT_TOKEN') : Deno.env.get('BOT_TOKEN')) ||
		Deno.env.get('BOT_TOKEN'),

	G_NEWS_API_KEY:
		(MODE === 'dev' ? Deno.env.get('DEV__G_NEWS_API_KEY') : Deno.env.get('G_NEWS_API_KEY')) ||
		Deno.env.get('G_NEWS_API_KEY'),

	CHANNEL_IDS_WITH_ACCESS:
		(MODE === 'dev'
			? Deno.env.get('DEV__CHANNEL_IDS_WITH_ACCESS')
			: Deno.env.get('CHANNEL_IDS_WITH_ACCESS')) || Deno.env.get('CHANNEL_IDS_WITH_ACCESS'),

	CHAT_IDS_WITH_ACCESS:
		(MODE === 'dev'
			? Deno.env.get('DEV__CHAT_IDS_WITH_ACCESS')
			: Deno.env.get('CHAT_IDS_WITH_ACCESS')) || Deno.env.get('CHAT_IDS_WITH_ACCESS'),

	USER_IDS_WITH_ACCESS:
		(MODE === 'dev'
			? Deno.env.get('DEV__USER_IDS_WITH_ACCESS')
			: Deno.env.get('USER_IDS_WITH_ACCESS')) || Deno.env.get('USER_IDS_WITH_ACCESS'),

	USERNAMES_WITH_ACCESS:
		(MODE === 'dev'
			? Deno.env.get('DEV__USERNAMES_WITH_ACCESS')
			: Deno.env.get('USERNAMES_WITH_ACCESS')) || Deno.env.get('USERNAMES_WITH_ACCESS'),

	GOOGLE_GEMINI_API:
		(MODE === 'dev' ? Deno.env.get('DEV__GOOGLE_GEMINI_API') : Deno.env.get('GOOGLE_GEMINI_API')) ||
		Deno.env.get('GOOGLE_GEMINI_API'),
};
