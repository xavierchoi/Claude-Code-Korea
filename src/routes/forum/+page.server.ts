import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	// URL 파라미터 가져오기
	const page = parseInt(url.searchParams.get('page') || '1');
	const categorySlug = url.searchParams.get('category') || '';
	const sortBy = url.searchParams.get('sort') || 'latest';
	const search = url.searchParams.get('search') || '';
	
	// API 파라미터 구성
	const params = new URLSearchParams({
		page: page.toString(),
		limit: '20',
		sortBy,
		isPublished: 'true'
	});
	
	if (categorySlug) {
		params.set('categorySlug', categorySlug);
	}
	
	if (search) {
		params.set('search', search);
	}
	
	// 게시글 목록 가져오기
	const postsResponse = await fetch(`/api/posts?${params.toString()}`);
	const postsData = await postsResponse.json();
	
	// 카테고리 목록 가져오기
	const categoriesResponse = await fetch('/api/categories');
	const categoriesData = await categoriesResponse.json();
	
	// 세션 정보
	const { session } = await locals.safeGetSession();
	
	return {
		posts: postsData.posts || [],
		pagination: postsData.pagination || {
			page: 1,
			limit: 20,
			totalCount: 0,
			totalPages: 0,
			hasNextPage: false,
			hasPreviousPage: false
		},
		categories: categoriesData.categories || [],
		session
	};
};