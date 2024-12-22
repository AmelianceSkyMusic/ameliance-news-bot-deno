export {
	Bot,
	Context,
	GrammyError,
	HttpError,
	InputFile,
	// Keyboard,
	webhookCallback,
} from 'https://deno.land/x/grammy@v1.32.0/mod.ts';

export type { Message, MessageEntity } from 'https://deno.land/x/grammy_types@v3.16.0/message.ts';
export type { SessionFlavor } from 'https://deno.land/x/grammy@v1.33.0/convenience/session.ts';

export { Menu } from 'https://deno.land/x/grammy_menu@v1.3.0/menu.ts';

export { default as mongoose, model, Schema } from 'npm:mongoose@^8.8.3';

export type {
	CallbackError,
	Connection,
	Document,
	Model,
	ProjectionType,
	Types,
} from 'https://deno.land/x/mongoose@8.8.2/types/models.d.ts';

export {
	getHTMLData,
	getLinksFromMessage,
	getTextFromHTML,
	handleAppError,
	hasAccess,
	logUserInfo,
	prepareEditMessageText,
	removeMessageById,
	replyWithAudio,
	runWithRandomInterval,
	sendPromptGemini,
} from '~ameliance-telegram-scripts-deno/src/index.ts';
// } from './submodules/ameliance-telegram-scripts-deno/src/index.ts';
