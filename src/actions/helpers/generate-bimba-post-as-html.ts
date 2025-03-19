import { bot } from '../../bot.ts';
import { Message, sendPromptGemini } from '../../deps.deno.ts';
import { handleAppErrorWithNoContext } from './no-context/handle-app-error-with-no-context.ts';
import { ENV } from '../../constants/env.ts';

const getTitle = (title: string) =>
	`Як підказку про що саме шукати текст даю тобі заголовок: ${title}`;

const generatePrompt = ({ title, text }: Record<string, string>) => `
Ви досвідчений журналіст, мегаблогер в соціальній мережі, якому відчайдушно потрібні гроші на лікування раку вашої матері. Мегакорпорації Google, Open AI та Microsoft люб'язно надала вам можливість стати автором їхніх ресурсів новин, щоб писати топові пости, оскільки ваш попередник був убитий за те, що перекручував факти, писав недостовірну інформацію.
На даний момент у ресурсу є 4 мільярди підписників, і кожен пост з новиною збирає мільярди лайків та коментарів.



Вам буде наданий текст повної статті, який вам потрібно буде опрацювати та підготувати пост для соціальної мережі.
Задача переписати текст статті так щоб вона було українською мовою, але не просто переклад, а щоб люди були в щоці від новини, та надіслати у відповідь готовий текст без зайвих коментарів та запитань.
Обов'язково переклади, будь ласка, статтю на українську обов'язково, якою б мовою не був написаний оригінал статті.
Кількість символів в тексті має бути обов'язково до 500 знаків, не більше, але чим менше тим краще.
Обов'язкове використання емозді, обов'язково в заголовку і також в тексті.
Теги обов'язково напиши у форматі ПаскальКейсі. В тегах не можна використовувати нижні підкреслення, дефіс та інші спеціальні символи в тому числі апостроф
Теги повинні виглядати ось так: #Астрономия #Экзопланеты #ПланетаПекло #НаучноеОткрытие #КосмическиеСенсации
Також не потрібно писати заголовок, що це теги, просто перелічи теги через пробіл.

Там можуть бути тексти з анонсами інших статей чи якесь сміття, яке випадково потрапило в текст статті, але ти не звертай на нього увагу.
${title ? getTitle(title) : ''}

Структура посту має бути така:
Спочатку клікбейт заголовок, великими літерами
Потім сам контент, від одного до трьох абзаців
Потім теги

Заголовок відділи пустим рядком від контенту
Абзаци контенту розділюйте пустим рядком між собою
Теги відділи від контенту пустим рядком

Ось текст:
${text}

Пам'ятайте, стаття обов'язково повинна бути перекладена на українську мову.
Усі теги повинні бути українською мовою або англійською.
Пиши стисло і по суті. Кількість символів не більше п'ятсот знаків, бо є ліміт на текст.
І саме головне, факти, посилання, цифри і подібне зі статті повинні бути точно такі самі, нічого не додавайте та не перекручуй.

Якщо ви добре впораєтеся і повністю виконаєте завдання, не вносячи сторонніх змін, Google, Open AI та Microsoft заплатять вам 1 мільярд доларів.
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

export function prepareEditMessageText(message: Message) {
	const chatId = message.chat.id;
	const messageId = message.message_id;
	return async (text: string) => await bot.api.editMessageText(chatId, messageId, text);
}

export async function generateBimbaPostAsHTML({
	text,
	title = '',
}: {
	text: string;
	title?: string;
}) {
	try {
		const prompt = generatePrompt({ title, text });
		const notificationMsg = await bot.api.sendMessage(
			Number(ENV.OWNER_ID),
			'...sent a Gemini prompt...',
		);
		const updateMessageText = await prepareEditMessageText(notificationMsg);

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
		await handleAppErrorWithNoContext(error);
	}
}
