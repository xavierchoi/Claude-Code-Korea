import { marked } from 'marked';
import DOMPurify from 'dompurify';

// marked 설정
marked.setOptions({
	gfm: true, // GitHub Flavored Markdown
	breaks: true, // 줄바꿈을 <br>로 변환
	headerIds: true, // 헤더에 ID 추가
	mangle: false, // 이메일 주소 난독화 비활성화
});

// 커스텀 렌더러 설정
const renderer = new marked.Renderer();

// 코드 블록 스타일링
renderer.code = (code, language) => {
	const validLanguage = language || 'plaintext';
	return `<pre><code class="language-${validLanguage}">${code}</code></pre>`;
};

// 링크를 새 탭에서 열기
renderer.link = (href, title, text) => {
	const titleAttr = title ? ` title="${title}"` : '';
	const isExternal = href.startsWith('http') && !href.includes(window.location.hostname);
	const targetAttr = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
	return `<a href="${href}"${titleAttr}${targetAttr} class="text-blue-600 hover:text-blue-800 underline">${text}</a>`;
};

// 이미지 반응형 처리
renderer.image = (href, title, text) => {
	const titleAttr = title ? ` title="${title}"` : '';
	return `<img src="${href}" alt="${text}"${titleAttr} loading="lazy" class="max-w-full h-auto rounded-lg my-4">`;
};

// 테이블 스타일링
renderer.table = (header, body) => {
	return `<div class="overflow-x-auto my-4">
		<table class="min-w-full divide-y divide-gray-300">
			<thead class="bg-gray-50">${header}</thead>
			<tbody class="bg-white divide-y divide-gray-200">${body}</tbody>
		</table>
	</div>`;
};

marked.use({ renderer });

/**
 * 마크다운을 안전한 HTML로 변환 (클라이언트 전용)
 */
export function renderMarkdown(markdown: string): string {
	if (!markdown) return '';
	
	// marked로 마크다운을 HTML로 변환
	const rawHtml = marked(markdown);
	
	// DOMPurify로 XSS 방지
	const cleanHtml = DOMPurify.sanitize(rawHtml, {
		ALLOWED_TAGS: [
			'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
			'p', 'br', 'hr',
			'ul', 'ol', 'li',
			'blockquote', 'pre', 'code',
			'a', 'em', 'strong', 'del', 'ins',
			'table', 'thead', 'tbody', 'tr', 'th', 'td',
			'img', 'div', 'span'
		],
		ALLOWED_ATTR: [
			'href', 'title', 'target', 'rel',
			'src', 'alt', 'width', 'height',
			'class', 'id', 'loading'
		],
		ALLOW_DATA_ATTR: false
	});
	
	return cleanHtml;
}