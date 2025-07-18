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
	return `<pre><code class="language-${validLanguage} hljs">${code}</code></pre>`;
};

// 링크를 새 탭에서 열기
renderer.link = (href, title, text) => {
	const titleAttr = title ? ` title="${title}"` : '';
	const isExternal = href.startsWith('http') && !href.includes(window.location.hostname);
	const targetAttr = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
	return `<a href="${href}"${titleAttr}${targetAttr}>${text}</a>`;
};

// 이미지 반응형 처리
renderer.image = (href, title, text) => {
	const titleAttr = title ? ` title="${title}"` : '';
	return `<img src="${href}" alt="${text}"${titleAttr} loading="lazy" class="max-w-full h-auto rounded-lg">`;
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
 * 마크다운을 안전한 HTML로 변환
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

/**
 * 마크다운 텍스트에서 첫 번째 단락 추출 (요약용)
 */
export function extractSummary(markdown: string, maxLength: number = 150): string {
	if (!markdown) return '';
	
	// 마크다운 문법 제거
	const plainText = markdown
		.replace(/^#+\s+/gm, '') // 헤더 제거
		.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // 링크 텍스트만 남기기
		.replace(/[*_~`]/g, '') // 강조 문법 제거
		.replace(/!\[([^\]]*)\]\([^\)]+\)/g, '') // 이미지 제거
		.replace(/^\s*[-*+]\s+/gm, '') // 리스트 마커 제거
		.replace(/^\s*\d+\.\s+/gm, '') // 순서 리스트 마커 제거
		.replace(/\n{2,}/g, ' ') // 여러 줄바꿈을 공백으로
		.trim();
	
	// 첫 번째 단락 추출
	const firstParagraph = plainText.split(/\n/)[0];
	
	// 길이 제한
	if (firstParagraph.length <= maxLength) {
		return firstParagraph;
	}
	
	return firstParagraph.substring(0, maxLength).trim() + '...';
}

/**
 * 마크다운 텍스트의 예상 읽기 시간 계산
 */
export function calculateReadingTime(markdown: string): number {
	if (!markdown) return 0;
	
	// 마크다운에서 텍스트만 추출
	const plainText = markdown.replace(/[#*_~`\[\]()!]/g, '');
	const wordCount = plainText.trim().split(/\s+/).length;
	
	// 평균 읽기 속도: 분당 200단어 (한글은 분당 500자)
	const koreanCharCount = (plainText.match(/[가-힣]/g) || []).length;
	const englishWordCount = wordCount - Math.ceil(koreanCharCount / 2);
	
	const koreanMinutes = koreanCharCount / 500;
	const englishMinutes = englishWordCount / 200;
	
	return Math.ceil(koreanMinutes + englishMinutes);
}