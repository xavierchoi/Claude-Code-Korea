import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url, locals }) => {
	try {
		const supabase = locals.supabase;
		
		// 페이지네이션 파라미터
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const offset = (page - 1) * limit;
		
		// 정렬 옵션 (latest, popular, views)
		const sortBy = url.searchParams.get('sortBy') || 'latest';
		
		// 고정된 게시글 포함 여부
		const includePinned = url.searchParams.get('includePinned') !== 'false';
		
		// 슬러그로 카테고리 확인
		const { data: category, error: categoryError } = await supabase
			.from('categories')
			.select('id, name, slug, description, icon, color')
			.eq('slug', params.slug)
			.single();
		
		if (categoryError || !category) {
			return json({ error: '카테고리를 찾을 수 없습니다.' }, { status: 404 });
		}
		
		// 게시글 쿼리 생성
		let query = supabase
			.from('posts')
			.select(`
				*,
				profiles!posts_author_id_fkey (
					id,
					username,
					full_name,
					avatar_url
				),
				_count:comments(count)
			`, { count: 'exact' })
			.eq('category_id', category.id);
		
		// 고정된 게시글 제외 옵션
		if (!includePinned) {
			query = query.eq('is_pinned', false);
		}
		
		// 정렬 적용
		switch (sortBy) {
			case 'popular':
				// 댓글 수가 많은 순
				query = query.order('is_pinned', { ascending: false })
					.order('comments_count', { ascending: false })
					.order('created_at', { ascending: false });
				break;
			case 'views':
				// 조회수가 많은 순
				query = query.order('is_pinned', { ascending: false })
					.order('views', { ascending: false })
					.order('created_at', { ascending: false });
				break;
			case 'latest':
			default:
				// 최신순 (기본값)
				query = query.order('is_pinned', { ascending: false })
					.order('created_at', { ascending: false });
				break;
		}
		
		// 페이지네이션 적용
		query = query.range(offset, offset + limit - 1);
		
		const { data: posts, error, count } = await query;
		
		if (error) {
			return json({ error: error.message }, { status: 500 });
		}
		
		// 고정된 게시글이 첫 페이지에 있을 때만 별도로 가져오기
		let pinnedPosts = [];
		if (page === 1 && includePinned) {
			const { data: pinned } = await supabase
				.from('posts')
				.select(`
					*,
					profiles!posts_author_id_fkey (
						id,
						username,
						full_name,
						avatar_url
					),
					_count:comments(count)
				`)
				.eq('category_id', category.id)
				.eq('is_pinned', true)
				.order('created_at', { ascending: false });
			
			if (pinned) {
				pinnedPosts = pinned;
			}
		}
		
		// 페이지네이션 메타데이터
		const totalPages = Math.ceil((count || 0) / limit);
		
		return json({
			category,
			posts: posts || [],
			pinnedPosts,
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
		return json({ error: '게시글을 가져오는 중 오류가 발생했습니다.' }, { status: 500 });
	}
};