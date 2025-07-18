import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// GET: 특정 작성자의 게시글 목록 조회
export const GET: RequestHandler = async ({ params, url, locals }) => {
	try {
		const supabase = locals.supabase;
		
		// 페이지네이션 파라미터
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const offset = (page - 1) * limit;
		
		// 정렬 옵션
		const sortBy = url.searchParams.get('sortBy') || 'latest';
		
		// 비공개 게시글 포함 여부 (작성자 본인만 가능)
		const includeUnpublished = url.searchParams.get('includeUnpublished') === 'true';
		
		// 사용자 ID 조회
		const { data: profile, error: profileError } = await supabase
			.from('profiles')
			.select('id')
			.eq('username', params.username)
			.single();
		
		if (profileError || !profile) {
			return json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
		}
		
		// 현재 로그인한 사용자 확인
		const { session } = await locals.safeGetSession();
		const isOwner = session?.user.id === profile.id;
		
		// 쿼리 생성
		let query = supabase
			.from('posts')
			.select(`
				*,
				author:profiles!posts_author_id_fkey (
					id,
					username,
					full_name,
					avatar_url
				),
				category:categories!posts_category_id_fkey (
					id,
					name,
					slug,
					icon,
					color
				)
			`, { count: 'exact' })
			.eq('author_id', profile.id);
		
		// 비공개 게시글 필터링
		if (!includeUnpublished || !isOwner) {
			query = query.eq('is_published', true);
		}
		
		// 정렬 적용
		switch (sortBy) {
			case 'popular':
				query = query
					.order('like_count', { ascending: false })
					.order('created_at', { ascending: false });
				break;
			case 'views':
				query = query
					.order('view_count', { ascending: false })
					.order('created_at', { ascending: false });
				break;
			case 'comments':
				query = query
					.order('comment_count', { ascending: false })
					.order('created_at', { ascending: false });
				break;
			case 'latest':
			default:
				query = query.order('created_at', { ascending: false });
				break;
		}
		
		// 페이지네이션 적용
		query = query.range(offset, offset + limit - 1);
		
		const { data: posts, error, count } = await query;
		
		if (error) {
			console.error('Error fetching user posts:', error);
			return json({ error: error.message }, { status: 500 });
		}
		
		// 통계 정보 계산
		let stats = null;
		if (posts && posts.length > 0) {
			// 전체 통계 조회 (페이지네이션 없이)
			const { data: allPosts } = await supabase
				.from('posts')
				.select('view_count, like_count, comment_count')
				.eq('author_id', profile.id)
				.eq('is_published', true);
			
			if (allPosts) {
				stats = {
					totalPosts: allPosts.length,
					totalViews: allPosts.reduce((sum, post) => sum + post.view_count, 0),
					totalLikes: allPosts.reduce((sum, post) => sum + post.like_count, 0),
					totalComments: allPosts.reduce((sum, post) => sum + post.comment_count, 0)
				};
			}
		}
		
		// 페이지네이션 메타데이터
		const totalPages = Math.ceil((count || 0) / limit);
		
		return json({
			posts: posts || [],
			author: {
				username: params.username,
				isOwner
			},
			stats,
			pagination: {
				page,
				limit,
				totalCount: count || 0,
				totalPages,
				hasNextPage: page < totalPages,
				hasPreviousPage: page > 1
			}
		});
	} catch (err) {
		console.error('Unexpected error:', err);
		return json({ error: '게시글을 가져오는 중 오류가 발생했습니다.' }, { status: 500 });
	}
};