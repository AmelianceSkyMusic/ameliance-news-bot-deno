import { bot } from './bot.ts';
import { connectToDatabase } from './libs/db/mongoose.ts';

await bot.api.deleteWebhook();

async function startBot() {
	await connectToDatabase();
	bot.start();
	console.log(`BOT STARTED IN PROD MODE`);
}

startBot();
