import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// GET: 게시글 목록 조회
export const GET: RequestHandler = async ({ url, locals }) => {
	try {
		const supabase = locals.supabase;
		
		// 쿼리 파라미터
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const offset = (page - 1) * limit;
		
		// 필터링 옵션
		const categoryId = url.searchParams.get('categoryId');
		const categorySlug = url.searchParams.get('categorySlug');
		const authorId = url.searchParams.get('authorId');
		const isPublished = url.searchParams.get('isPublished') !== 'false'; // 기본값 true
		const search = url.searchParams.get('search');
		
		// 정렬 옵션 (latest, popular, views, comments)
		const sortBy = url.searchParams.get('sortBy') || 'latest';
		
		// 기본 쿼리 생성
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
			`, { count: 'exact' });
		
		// 필터 적용
		if (isPublished) {
			query = query.eq('is_published', true);
		}
		
		if (categoryId) {
			query = query.eq('category_id', categoryId);
		}
		
		// 카테고리 슬러그로 필터링
		if (categorySlug && !categoryId) {
			// 먼저 카테고리 ID 조회
			const { data: category } = await supabase
				.from('categories')
				.select('id')
				.eq('slug', categorySlug)
				.single();
			
			if (category) {
				query = query.eq('category_id', category.id);
			}
		}
		
		if (authorId) {
			query = query.eq('author_id', authorId);
		}
		
		// 검색
		if (search) {
			query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
		}
		
		// 정렬 적용
		switch (sortBy) {
			case 'popular':
				query = query
					.order('is_pinned', { ascending: false })
					.order('like_count', { ascending: false })
					.order('created_at', { ascending: false });
				break;
			case 'views':
				query = query
					.order('is_pinned', { ascending: false })
					.order('view_count', { ascending: false })
					.order('created_at', { ascending: false });
				break;
			case 'comments':
				query = query
					.order('is_pinned', { ascending: false })
					.order('comment_count', { ascending: false })
					.order('created_at', { ascending: false });
				break;
			case 'latest':
			default:
				query = query
					.order('is_pinned', { ascending: false })
					.order('created_at', { ascending: false });
				break;
		}
		
		// 페이지네이션 적용
		query = query.range(offset, offset + limit - 1);
		
		const { data: posts, error, count } = await query;
		
		if (error) {
			console.error('Error fetching posts:', error);
			return json({ error: error.message }, { status: 500 });
		}
		
		// 페이지네이션 메타데이터
		const totalPages = Math.ceil((count || 0) / limit);
		
		return json({
			posts: posts || [],
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

// POST: 새 게시글 작성
export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { session } = await locals.safeGetSession();
		if (!session) {
			return json({ error: '로그인이 필요합니다.' }, { status: 401 });
		}
		
		const supabase = locals.supabase;
		const body = await request.json();
		
		// 필수 필드 검증
		if (!body.title || !body.content || !body.category_id) {
			return json({ 
				error: '제목, 내용, 카테고리는 필수입니다.' 
			}, { status: 400 });
		}
		
		// 제목 길이 검증
		if (body.title.length > 200) {
			return json({ 
				error: '제목은 200자를 초과할 수 없습니다.' 
			}, { status: 400 });
		}
		
		// 카테고리 존재 여부 확인
		const { data: category, error: categoryError } = await supabase
			.from('categories')
			.select('id, slug')
			.eq('id', body.category_id)
			.eq('is_active', true)
			.single();
		
		if (categoryError || !category) {
			return json({ 
				error: '유효하지 않은 카테고리입니다.' 
			}, { status: 400 });
		}
		
		// 슬러그 생성
		const timestamp = Date.now().toString(36);
		const randomStr = Math.random().toString(36).substring(2, 5);
		const baseSlug = body.title
			.toLowerCase()
			.replace(/[^\w\s가-힣]/g, '')
			.replace(/\s+/g, '-')
			.substring(0, 50);
		const slug = `${baseSlug}-${timestamp}${randomStr}`;
		
		// 게시글 생성
		const { data, error } = await supabase
			.from('posts')
			.insert({
				title: body.title.trim(),
				content: body.content,
				category_id: body.category_id,
				author_id: session.user.id,
				slug: slug,
				is_published: body.is_published !== false, // 기본값 true
				is_pinned: false,
				is_locked: false
			})
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
			`)
			.single();
		
		if (error) {
			console.error('Error creating post:', error);
			return json({ error: error.message }, { status: 500 });
		}
		
		return json({ post: data }, { status: 201 });
	} catch (err) {
		console.error('Unexpected error:', err);
		return json({ error: '게시글 생성 중 오류가 발생했습니다.' }, { status: 500 });
	}
};