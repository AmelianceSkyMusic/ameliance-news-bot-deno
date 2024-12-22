export const REGEXP = {
	holychordsDownloadLink: /<a[^>]*href="([^"]+)"[^>]*download=/,
	holychordsMusicText: /<pre[^>]*id="music_text"[^>]*>(.*?)<\/pre>/s,
	holychordsSongArtist: /<h5[^>]*>(.*?)<\/h5>/s,
	holychordsSongTitle: /<h2[^>]*>(.*?)<\/h2>/,
};
