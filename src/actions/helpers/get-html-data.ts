import { handleAppErrorWithNoContext } from './no-context/handle-app-error-with-no-context.ts';

export async function getHTMLData(url: string) {
	try {
		const data = await fetch(url, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
			},
		});

		if (!data.ok) {
			if (data.status === 404) {
				console.log('404: ', 404);
				return null;
			}

			await handleAppErrorWithNoContext(
				`Error fetching data: ${data.status} ${data.statusText}`,
			);
			return null;
		}
		const contentType = data.headers.get('Content-Type');
		let encoding = 'utf-8';

		if (contentType) {
			const match = contentType.match(/charset=([^;]+)/);
			if (match) encoding = match[1];
		}

		const arrayBuffer = await data.arrayBuffer();
		const decoder = new TextDecoder(encoding);

		const html = decoder.decode(arrayBuffer);

		return html;
	} catch (error) {
		await handleAppErrorWithNoContext(error);
	}
}
