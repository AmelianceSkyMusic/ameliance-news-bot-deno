type Post = {
	html: string;
	photo: string;
};

export interface SessionData {
	postsToPublic: Record<string, Post>;
}
