import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// POST: 모든 게시물의 slug를 0부터 재설정
export const POST: RequestHandler = async ({ locals }) => {
	try {
		const { session } = await locals.safeGetSession();
		if (!session) {
			return json({ error: '로그인이 필요합니다.' }, { status: 401 });
		}
		
		const supabase = locals.supabase;
		
		// 모든 게시물을 생성일 기준으로 조회
		const { data: posts, error: fetchError } = await supabase
			.from('posts')
			.select('id, slug, created_at')
			.order('created_at', { ascending: true }); // 오래된 것부터
		
		if (fetchError) {
			console.error('Error fetching posts:', fetchError);
			return json({ error: fetchError.message }, { status: 500 });
		}
		
		if (!posts || posts.length === 0) {
			return json({ message: '업데이트할 게시물이 없습니다.' });
		}
		
		console.log(`Found ${posts.length} posts to update`);
		
		// 0부터 시작하여 순차적으로 번호 할당
		let currentNumber = 0;
		const updates = [];
		const errors = [];
		
		for (const post of posts) {
			const newSlug = currentNumber.toString();
			
			// 개별 업데이트 실행
			const { error: updateError } = await supabase
				.from('posts')
				.update({ slug: newSlug })
				.eq('id', post.id);
			
			if (updateError) {
				console.error(`Error updating post ${post.id}:`, updateError);
				errors.push({ postId: post.id, error: updateError.message });
			} else {
				console.log(`Updated post ${post.id}: ${post.slug} -> ${newSlug}`);
				updates.push({ 
					postId: post.id, 
					oldSlug: post.slug, 
					newSlug: newSlug 
				});
			}
			
			currentNumber++;
		}
		
		return json({
			message: 'Slug 재설정 완료',
			totalPosts: posts.length,
			successCount: updates.length,
			errorCount: errors.length,
			updates: updates.slice(0, 10), // 처음 10개만 표시
			errors: errors
		});
		
	} catch (err) {
		console.error('Unexpected error:', err);
		return json({ error: 'Slug 재설정 중 오류가 발생했습니다.' }, { status: 500 });
	}
};