import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { session } = await locals.safeGetSession();
	
	// 인증 확인
	if (!session) {
		throw redirect(303, '/auth');
	}
	
	// TODO: 관리자 권한 확인 로직 추가
	// 현재는 로그인한 사용자 모두에게 접근 허용
	// 추후 관리자 테이블이나 역할 시스템 구현 시 수정 필요
	
	const supabase = locals.supabase;
	
	// 모든 카테고리 가져오기 (비활성 포함)
	const { data: categories, error } = await supabase
		.from('categories')
		.select('*')
		.order('position', { ascending: true });
	
	if (error) {
		console.error('Error loading categories:', error);
		return {
			categories: []
		};
	}
	
	return {
		categories: categories || []
	};
};