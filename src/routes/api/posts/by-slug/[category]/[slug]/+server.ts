import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// GET: 카테고리와 슬러그로 게시글 조회
export const GET: RequestHandler = async ({ params, locals, cookies }) => {
	try {
		const supabase = locals.supabase;
		
		// 먼저 카테고리 ID 조회
		const { data: category, error: categoryError } = await supabase
			.from('categories')
			.select('id')
			.eq('slug', params.category)
			.single();
		
		if (categoryError || !category) {
			return json({ error: '카테고리를 찾을 수 없습니다.' }, { status: 404 });
		}
		
		// 게시글 조회
		const { data: post, error } = await supabase
			.from('posts')
			.select(`
				*,
				author:profiles!posts_author_id_fkey (
					id,
					username,
					full_name,
					avatar_url,
					bio
				),
				category:categories!posts_category_id_fkey (
					id,
					name,
					slug,
					icon,
					color,
					description
				)
			`)
			.eq('category_id', category.id)
			.eq('slug', params.slug)
			.single();
		
		if (error) {
			if (error.code === 'PGRST116') {
				return json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
			}
			console.error('Error fetching post:', error);
			return json({ error: error.message }, { status: 500 });
		}
		
		// 비공개 게시글 확인
		if (!post.is_published) {
			const { session } = await locals.safeGetSession();
			// 작성자 본인이 아니면 접근 불가
			if (!session || session.user.id !== post.author_id) {
				return json({ error: '비공개 게시글입니다.' }, { status: 403 });
			}
		}
		
		// 조회수 증가 (중복 방지를 위해 쿠키 사용)
		const viewedPosts = cookies.get('viewed_posts');
		const viewedArray = viewedPosts ? viewedPosts.split(',') : [];
		
		if (!viewedArray.includes(post.id)) {
			// 조회수 증가 함수 호출
			const { error: viewError } = await supabase.rpc('increment_view_count', {
				table_name: 'posts',
				record_id: post.id
			});
			
			if (!viewError) {
				// 쿠키에 추가 (24시간 유지)
				viewedArray.push(post.id);
				cookies.set('viewed_posts', viewedArray.join(','), {
					path: '/',
					maxAge: 60 * 60 * 24, // 24시간
					httpOnly: true,
					sameSite: 'strict'
				});
				
				// 응답에 증가된 조회수 반영
				post.view_count += 1;
			}
		}
		
		return json({ post });
	} catch (err) {
		console.error('Unexpected error:', err);
		return json({ error: '게시글을 가져오는 중 오류가 발생했습니다.' }, { status: 500 });
	}
};