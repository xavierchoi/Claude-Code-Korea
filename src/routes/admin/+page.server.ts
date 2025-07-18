import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { session } = await locals.safeGetSession();
	
	// 인증 확인
	if (!session) {
		throw redirect(303, '/auth');
	}
	
	// TODO: 관리자 권한 확인 로직 추가
	
	const supabase = locals.supabase;
	
	// 활성 카테고리 수 가져오기
	const { count: activeCategories } = await supabase
		.from('categories')
		.select('*', { count: 'exact', head: true })
		.eq('is_active', true);
	
	return {
		activeCategories: activeCategories || 0
	};
};