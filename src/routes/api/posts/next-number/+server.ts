import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// 다음 게시물 번호 가져오기
export const GET: RequestHandler = async ({ locals }) => {
	try {
		const supabase = locals.supabase;
		
		// 가장 최근 게시물의 slug 조회 (숫자만 있는 경우)
		const { data: lastPost } = await supabase
			.from('posts')
			.select('slug')
			.order('created_at', { ascending: false })
			.limit(1)
			.single();
		
		let nextNumber = 1;
		
		if (lastPost && lastPost.slug) {
			// slug가 순수 숫자인 경우만 처리
			const numericSlug = parseInt(lastPost.slug);
			if (!isNaN(numericSlug)) {
				nextNumber = numericSlug + 1;
			} else {
				// 기존 게시물 중 숫자 slug를 가진 것들 찾기
				const { data: numericPosts } = await supabase
					.from('posts')
					.select('slug')
					.order('created_at', { ascending: false })
					.limit(100);
				
				if (numericPosts) {
					const numbers = numericPosts
						.map(p => parseInt(p.slug))
						.filter(n => !isNaN(n))
						.sort((a, b) => b - a);
					
					if (numbers.length > 0) {
						nextNumber = numbers[0] + 1;
					}
				}
			}
		}
		
		// 100000부터 시작하도록 설정 (선택사항)
		if (nextNumber < 100000) {
			nextNumber = 100000;
		}
		
		// 999999를 넘지 않도록 제한
		if (nextNumber > 999999) {
			return json({ error: '게시물 번호가 한계에 도달했습니다.' }, { status: 400 });
		}
		
		return json({ nextNumber: nextNumber.toString() });
	} catch (err) {
		console.error('Error getting next post number:', err);
		return json({ error: '다음 번호를 가져오는 중 오류가 발생했습니다.' }, { status: 500 });
	}
};