export const REGEXP = {
	//* Get tag <a> with data-audio-id === dataAudioId
	holychordsDownloadLink: (dataAudioId: string) =>
		new RegExp(`<a\\s[^>]*?data-audio-id\\s*=\\s*["'](${dataAudioId})["'][^>]*?>`, 'gi'),
	holychordsMusicText: /<pre[^>]*id="music_text"[^>]*>(.*?)<\/pre>/s,
	holychordsSongArtist: /<h5[^>]*>(.*?)<\/h5>/s,
	holychordsSongTitle: /<h2[^>]*>(.*?)<\/h2>/,
};
