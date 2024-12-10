import { ErrorHandler, errorHandler, joinWith, ReturnErrorHandler } from 'npm:ameliance-scripts';
import { bot } from '../../bot.ts';
import { ENV } from '../../constants/env.ts';

export type HandleAppError = ErrorHandler;

const APP_NAME = Deno.env.get('APP_NAME');

async function handleAppErrorHelper(error: unknown, status?: number): Promise<ReturnErrorHandler> {
	const returnedError = errorHandler({
		error,
		status,
		title: APP_NAME,
		wrapperCount: 1,
	});

	ENV.OWNER_ID
		? await bot.api.sendMessage(
			ENV.OWNER_ID,
			`<blockquote><b>❗️ERROR: ${APP_NAME} > ${
				joinWith(
					' | ',
					returnedError.code || '',
					returnedError.message,
				)
			}</b></blockquote>\n<code>${new Error().stack}</code>\n@amelianceskymusic`,
			{ parse_mode: 'HTML' },
			// eslint-disable-next-line no-mixed-spaces-and-tabs
		)
		: null;

	return returnedError;
}

export async function handleAppErrorWithNoContext(error: unknown, status?: number) {
	return await handleAppErrorHelper(error, status);
}
