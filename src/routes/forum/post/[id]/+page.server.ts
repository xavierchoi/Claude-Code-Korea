import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	// ID로 게시글 조회
	const response = await fetch(`/api/posts/${params.id}`);
	
	if (!response.ok) {
		if (response.status === 404) {
			throw error(404, '게시글을 찾을 수 없습니다.');
		}
		throw error(500, '게시글을 불러오는 중 오류가 발생했습니다.');
	}
	
	const data = await response.json();
	const post = data.post;
	
	// 실제 게시물이면 올바른 URL로 리다이렉트
	if (post.category?.slug && post.slug) {
		throw redirect(301, `/forum/${post.category.slug}/${post.slug}`);
	}
	
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