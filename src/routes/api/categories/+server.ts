import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	try {
		const supabase = locals.supabase;
		
		// 활성화된 카테고리만 가져올지 전체를 가져올지 결정
		const includeInactive = url.searchParams.get('includeInactive') === 'true';
		
		let query = supabase
			.from('categories')
			.select('*')
			.order('position', { ascending: true });
		
		if (!includeInactive) {
			query = query.eq('is_active', true);
		}
		
		const { data, error } = await query;
		
		if (error) {
			return json({ error: error.message }, { status: 500 });
		}
		
		return json({ categories: data });
	} catch (err) {
		return json({ error: '카테고리를 가져오는 중 오류가 발생했습니다.' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { session } = await locals.safeGetSession();
		if (!session) {
			return json({ error: '인증이 필요합니다.' }, { status: 401 });
		}
		
		// 관리자 권한 확인
		console.log('User metadata:', session.user.user_metadata);
		const isAdmin = session.user.user_metadata?.role === 'admin';
		console.log('Is admin:', isAdmin);
		
		if (!isAdmin) {
			return json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
		}
		
		const supabase = locals.supabase;
		const body = await request.json();
		
		// 필수 필드 검증
		if (!body.name || !body.slug) {
			return json({ error: '카테고리 이름과 슬러그는 필수입니다.' }, { status: 400 });
		}
		
		// 슬러그 형식 검증 (소문자, 숫자, 하이픈만 허용)
		const slugRegex = /^[a-z0-9-]+$/;
		if (!slugRegex.test(body.slug)) {
			return json({ error: '슬러그는 소문자, 숫자, 하이픈만 사용할 수 있습니다.' }, { status: 400 });
		}
		
		const { data, error } = await supabase
			.from('categories')
			.insert({
				name: body.name,
				slug: body.slug,
				description: body.description || null,
				icon: body.icon || null,
				color: body.color || null,
				position: body.position || 0,
				is_active: body.is_active !== undefined ? body.is_active : true
			})
			.select()
			.single();
		
		if (error) {
			// 중복 키 에러 처리
			if (error.code === '23505') {
				return json({ error: '이미 존재하는 카테고리 이름 또는 슬러그입니다.' }, { status: 409 });
			}
			return json({ error: error.message }, { status: 500 });
		}
		
		return json({ category: data }, { status: 201 });
	} catch (err) {
		return json({ error: '카테고리 생성 중 오류가 발생했습니다.' }, { status: 500 });
	}
};