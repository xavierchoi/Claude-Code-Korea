import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	// 인증 확인
	const { session } = await locals.safeGetSession();
	if (!session) {
		throw redirect(303, '/auth/login?redirect=/posts/edit/' + params.id);
	}

	// 게시글 정보 가져오기
	const postResponse = await fetch(`/api/posts/${params.id}`);
	
	if (!postResponse.ok) {
		if (postResponse.status === 404) {
			throw error(404, '게시글을 찾을 수 없습니다.');
		}
		throw error(500, '게시글을 불러오는 중 오류가 발생했습니다.');
	}

	const { post } = await postResponse.json();

	// 작성자 또는 관리자만 수정 가능
	const isAdmin = session.user.user_metadata?.role === 'admin';
	const isAuthor = session.user.id === post.author_id;

	if (!isAuthor && !isAdmin) {
		throw error(403, '이 게시글을 수정할 권한이 없습니다.');
	}

	// 카테고리 목록 가져오기
	const categoriesResponse = await fetch('/api/categories');
	if (!categoriesResponse.ok) {
		throw error(500, '카테고리 목록을 불러오는 중 오류가 발생했습니다.');
	}

	const { categories } = await categoriesResponse.json();

	return {
		post,
		categories,
		isAdmin
	};
};