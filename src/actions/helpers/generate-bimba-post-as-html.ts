import {
	Context,
	handleAppError,
	prepareEditMessageText,
	sendPromptGemini,
} from '../../deps.deno.ts';
const getTitle = (title: string) =>
	`Як підказку про що саме шукати текст даю тобі заголовок: ${title}`;

const generatePrompt = ({ title, text }: Record<string, string>) => `
Уяви, що ти мегаблогер в соціальній мережі. У тебе 2 мільярди послідовувачів.
Кожен пост з новиною збирає мільярди лайків.

Я буду присилати тобі інформацію для посту у вигляді тексту.
Там можуть бути тексти з анонсами інших статей чи якесь сміття, яке випадково потрапило в текст статті, але ти не звертай на нього увагу.
${title ? getTitle(title) : ''}

Твоя задача переписати текст статті так щоб вона було українською мовою, але не просто переклад, а щоб люди були в щоці від новини.
У відповідь ти маєш написати вже переписаний текст обов'язково українською мовою, без коментарів та запитань.
Обов'язково переклади, будь ласка, статтю на українську обов'язково, якою б мовою не був написаний оригінал статті.
Кількість символів в тексті має бути обов'язково до 500 знаків, не більше, але чим менше тим краще.
Обов'язково користуйся емозді, обов'язково в заголовку і також в тексті.
Теги обов'язково напиши у форматі ПаскальКейсі. В тегах не можна використовувати нижні підкреслення, дефіс та інші спеціальні символи в тому числі апостроф

Структура посту має бути така:
Спочатку клікбейт заголовок, великими літерами
Потім сам контент, від одного до трьох абзаців
Потім теги

Заголовок відділи пустим рядком від контенту
Абзаци контенту розділюй пустим рядком між собою
Теги відділи від контенту пустим рядком

Ось текст:
${text}

Пам'ятай, стаття обов'язково повинна бути перекладена на українську мову.
Усі теги повинні бути українською мовою або англійською.
Пиши стисло і по суті. Кількість символів не більше п'ятсот знаків, бо є ліміт на текст.
А факти статті не перекручені.
`;

const getGeminiAnswer = async (
	prompt: string,
	updateMessageText: (text: string) => Promise<unknown>,
	enterCount = 0,
	deep = 10,
): Promise<string | void> => {
	if (enterCount > deep) return;
	enterCount++;
	const geminiAnswer = await sendPromptGemini(prompt);

	await updateMessageText(
		`...received a response with the number of characters: ${geminiAnswer.length}...`,
	);
	if (geminiAnswer.length > 1000) {
		await updateMessageText(
			`...character limit exceeded: ${geminiAnswer.length}\nSent an another Gemini prompt...`,
		);
		return await getGeminiAnswer(prompt, updateMessageText, enterCount);
	}
	return geminiAnswer;
};

function toPascalCase(string: string) {
	const words =
		string.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g) || [];

	const transformedWords = words.map(
		(word) => word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase(),
	);

	return transformedWords.join('');
}

function transformParagraphTags(paragraph: string): string {
	return paragraph.replace(/#(\w+)\b/g, (_, tag: string) => {
		return `#${toPascalCase(tag)}`;
	});
}

export async function generateBimbaPostAsHTML(
	ctx: Context,
	{ text, title = '' }: { text: string; title?: string },
) {
	try {
		const prompt = generatePrompt({ title, text });
		const notificationMsg = await ctx.reply('...sent a Gemini prompt...');
		const updateMessageText = await prepareEditMessageText(ctx, notificationMsg);

		const geminiAnswer = await getGeminiAnswer(prompt, updateMessageText);
		if (!geminiAnswer) {
			await updateMessageText('...cancel');
			return;
		}

		await updateMessageText('...received a response, generate a new post...');

		const titleMatch = geminiAnswer.match(/^(.*)$/m);
		const articleTitle = titleMatch ? titleMatch[1].trim().replaceAll('*', '').toUpperCase() : '';

		const contentMatch = geminiAnswer.match(/^[^\n]*\n\n([\s\S]*)/m);

		const articleText = contentMatch ? transformParagraphTags(contentMatch[1].trim()) : '';

		await updateMessageText('...return post!');

		return `<b>${articleTitle}</b>\n\n${articleText}\n\n<b><a href="https://t.me/bimba_news">БІМБА-НОВИНИ →</a></b>`;
	} catch (error) {
		await handleAppError(ctx, error);
	}
}
