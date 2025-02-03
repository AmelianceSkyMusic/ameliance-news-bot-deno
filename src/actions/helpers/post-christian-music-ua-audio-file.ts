import { Buffer } from 'node:buffer';
import { getRandomNumber } from 'npm:ameliance-scripts';
import { InputFile } from '../../deps.deno.ts';

import { parseBuffer } from 'npm:music-metadata';
import NodeID3 from 'npm:node-id3';
import { bot } from '../../bot.ts';
import { ENV } from '../../constants/env.ts';
import { REGEXP } from '../../constants/regexp.ts';
import { getHTMLData } from './get-html-data.ts';
import { handleAppErrorWithNoContext } from './no-context/handle-app-error-with-no-context.ts';
import { franc } from 'npm:franc';

const holychordsURL = 'https://holychords.pro';
const holychordsTitlePostfix = ' - holychords.pro';

async function isImageValid(imageData: Uint8Array): Promise<boolean> {
	try {
		const sizeInMB = imageData.length / (1024 * 1024);
		if (sizeInMB > 20) return false;

		const header = imageData.slice(0, 4);

		const jpegSignature = Buffer.from([0xff, 0xd8, 0xff]);
		const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
		const webpSignature = Buffer.from('RIFF');

		return (
			Buffer.from(header).includes(jpegSignature) ||
			Buffer.from(header).equals(pngSignature) ||
			Buffer.from(header.slice(0, 4)).equals(webpSignature)
		);
	} catch (error) {
		console.error('Error validating image:', error);
		return false;
	}
}

async function prepareLink(url: string) {
	const res = await fetch(url);

	const originalArrayBuffer = await res.arrayBuffer();
	const originalAudioBuffer = Buffer.from(originalArrayBuffer);

	const metadata = await parseBuffer(originalAudioBuffer, {
		mimeType: 'audio/mpeg',
	});

	const newTitle = metadata.common?.title
		? metadata.common.title.replaceAll(holychordsTitlePostfix, '')
		: '';
	const tagsForUpdate = {
		title: newTitle,
		comment: { language: 'ukr', text: 'Красава, Ваван!' },
	};
	const audioBuffer = NodeID3.update(tagsForUpdate, originalAudioBuffer);

	return {
		buffer: audioBuffer,
		artist: metadata.common?.artist ||
			(metadata.common?.artists ? metadata.common.artists.join(', ') : ''),
		title: newTitle,
		picture: metadata.common?.picture?.[0],
	};
}

const MAX_ATTEMPTS = 30;

export async function postChristianMusicUaAudioFile(attempts = 0) {
	if (attempts > MAX_ATTEMPTS) return;

	try {
		const randomSongId = getRandomNumber(1, 99_999);
		const url = `${holychordsURL}/${randomSongId}`;
		// const url = 'https://holychords.pro/63958'; //Штанішкі коротішкі

		const htmlData = await getHTMLData(url);
		if (!htmlData) return await postChristianMusicUaAudioFile(attempts + 1);

		const matchMusicText = htmlData.match(REGEXP.holychordsMusicText);
		if (!matchMusicText) return await postChristianMusicUaAudioFile(attempts + 1);
		const musicText = matchMusicText[1].trim();
		const musicTextLang = franc(musicText);
		if (musicTextLang !== 'ukr') {
			return await postChristianMusicUaAudioFile(attempts + 1);
		}

		const matchArtist = htmlData.match(REGEXP.holychordsSongArtist);
		const matchTitle = htmlData.match(REGEXP.holychordsSongTitle);
		const matchDownloadATag = [...htmlData.matchAll(REGEXP.holychordsDownloadLink)];
		const downloadUrls = matchDownloadATag.map((match) => match.groups?.href);
		const filteredDownloadUrls = downloadUrls.filter(
			(link) => link !== '/uploads/music/20190502/2019050211472221.mp3',
		);
		const matchDownloadUrl = filteredDownloadUrls.length > 0
			? filteredDownloadUrls[0]
			: downloadUrls[0];

		let artist = '';
		if (matchArtist && matchArtist[1]) artist = matchArtist[1].trim() || '';

		let title = '';
		if (matchTitle && matchTitle[1]) title = matchTitle[1].trim() || '';

		const sendOptions: Record<string, unknown> = {};

		if (matchDownloadUrl) {
			const downloadMp3Url = `${holychordsURL}${matchDownloadUrl}`;

			const { buffer, artist, title } = await prepareLink(downloadMp3Url);

			const fileSizeInMB = buffer.length / (1024 * 1024);
			if (fileSizeInMB > 50) return await postChristianMusicUaAudioFile(attempts + 1);

			const mp3FileTitle = `${[artist, title].join(' - ')}.mp3`;

			sendOptions.thumb = null;

			await bot.api.sendAudio(
				Number(ENV.CHRISTIAN_MUSIC_UA_ID),
				new InputFile(buffer, mp3FileTitle),
				sendOptions,
			);
		} else {
			return await postChristianMusicUaAudioFile(attempts + 1);
		}
	} catch (error) {
		await handleAppErrorWithNoContext(error);
		return await postChristianMusicUaAudioFile(attempts + 1);
	}
}
