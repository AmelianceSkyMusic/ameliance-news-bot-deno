import { ErrorHandler, errorHandler, ReturnErrorHandler } from 'npm:ameliance-scripts';
import { bot } from '../../bot.ts';
import { ENV } from '../../constants/env.ts';

export type HandleAppError = ErrorHandler;

const APP_NAME = Deno.env.get('APP_NAME');

export function handleAppErrorHelper(error: unknown, status?: number): ReturnErrorHandler {
	const returnedError = errorHandler({
		error,
		status,
		title: APP_NAME,
		errorDepth: 1,
		wrapperCount: 1,
	});

	ENV.OWNER_ID
		? bot.api.sendMessage(
			ENV.OWNER_ID,
			`<blockquote><b>❗️ERROR: ${APP_NAME} > ${returnedError.code} | ${returnedError.message}</b></blockquote>\n<code>${
				new Error().stack
					?.split('\n')
					.map((line) => `   ${line.trim()}`)
					.splice(1, 1)
					.join('\n')
			}</code>\n@amelianceskymusic`,
			{ parse_mode: 'HTML' },
			// eslint-disable-next-line no-mixed-spaces-and-tabs
		)
		: null;

	return returnedError;
}

export function handleAppError(error: unknown, status?: number) {
	return handleAppErrorHelper(error, status);
}
