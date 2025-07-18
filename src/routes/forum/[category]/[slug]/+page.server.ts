import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals, fetch, cookies }) => {
	// 게시글 조회
	const response = await fetch(`/api/posts/by-slug/${params.category}/${params.slug}`);
	
	if (!response.ok) {
		if (response.status === 404) {
			throw error(404, '게시글을 찾을 수 없습니다.');
		}
		throw error(500, '게시글을 불러오는 중 오류가 발생했습니다.');
	}
	
	const data = await response.json();
	const post = data.post;
	
	// 현재 사용자 정보
	const { session } = await locals.safeGetSession();
	const isAuthor = session?.user?.id === post.author_id;
	const isAdmin = session?.user?.user_metadata?.role === 'admin';
	
	return {
		post,
		session,
		isAuthor,
		isAdmin
	};
};