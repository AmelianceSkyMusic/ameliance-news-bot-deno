export const REGEXP = {
	holychordsDownloadLink:
		/<a\b(?=[^>]*?href\s*=\s*(["'])(?<href>.*?)\1)(?=[^>]*?download\b).*?>/gis,
	holychordsMusicText: /<pre[^>]*id="music_text"[^>]*>(.*?)<\/pre>/s,
	holychordsSongArtist: /<h5[^>]*>(.*?)<\/h5>/s,
	holychordsSongTitle: /<h2[^>]*>(.*?)<\/h2>/,
};
