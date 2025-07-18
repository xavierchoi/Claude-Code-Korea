import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	try {
		const supabase = locals.supabase;
		
		const { data, error } = await supabase
			.from('categories')
			.select('*')
			.eq('id', params.id)
			.single();
		
		if (error) {
			if (error.code === 'PGRST116') {
				return json({ error: '카테고리를 찾을 수 없습니다.' }, { status: 404 });
			}
			return json({ error: error.message }, { status: 500 });
		}
		
		return json({ category: data });
	} catch (err) {
		return json({ error: '카테고리를 가져오는 중 오류가 발생했습니다.' }, { status: 500 });
	}
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	try {
		const { session } = await locals.safeGetSession();
		if (!session) {
			return json({ error: '인증이 필요합니다.' }, { status: 401 });
		}
		
		// 관리자 권한 확인
		const isAdmin = session.user.user_metadata?.role === 'admin';
		console.log('Is admin (PATCH):', isAdmin);
		
		if (!isAdmin) {
			return json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
		}
		
		const supabase = locals.supabase;
		const body = await request.json();
		
		// 업데이트할 필드만 포함
		const updates: any = {};
		
		if (body.name !== undefined) updates.name = body.name;
		if (body.slug !== undefined) {
			// 슬러그 형식 검증
			const slugRegex = /^[a-z0-9-]+$/;
			if (!slugRegex.test(body.slug)) {
				return json({ error: '슬러그는 소문자, 숫자, 하이픈만 사용할 수 있습니다.' }, { status: 400 });
			}
			updates.slug = body.slug;
		}
		if (body.description !== undefined) updates.description = body.description;
		if (body.icon !== undefined) updates.icon = body.icon;
		if (body.color !== undefined) updates.color = body.color;
		if (body.position !== undefined) updates.position = body.position;
		if (body.is_active !== undefined) updates.is_active = body.is_active;
		
		if (Object.keys(updates).length === 0) {
			return json({ error: '업데이트할 필드가 없습니다.' }, { status: 400 });
		}
		
		console.log('Updating category with ID:', params.id);
		console.log('Updates:', updates);
		
		const { data, error } = await supabase
			.from('categories')
			.update(updates)
			.eq('id', params.id)
			.select()
			.single();
		
		if (error) {
			if (error.code === '23505') {
				return json({ error: '이미 존재하는 카테고리 이름 또는 슬러그입니다.' }, { status: 409 });
			}
			return json({ error: error.message }, { status: 500 });
		}
		
		if (!data) {
			return json({ error: '카테고리를 찾을 수 없습니다.' }, { status: 404 });
		}
		
		return json({ category: data });
	} catch (err) {
		return json({ error: '카테고리 수정 중 오류가 발생했습니다.' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	try {
		const { session } = await locals.safeGetSession();
		if (!session) {
			return json({ error: '인증이 필요합니다.' }, { status: 401 });
		}
		
		// 관리자 권한 확인
		const isAdmin = session.user.user_metadata?.role === 'admin';
		console.log('Is admin (DELETE):', isAdmin);
		
		if (!isAdmin) {
			return json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
		}
		
		const supabase = locals.supabase;
		
		// 카테고리에 연결된 게시글이 있는지 확인
		const { data: posts, error: postsError } = await supabase
			.from('posts')
			.select('id')
			.eq('category_id', params.id)
			.limit(1);
		
		if (postsError) {
			return json({ error: postsError.message }, { status: 500 });
		}
		
		if (posts && posts.length > 0) {
			return json({ error: '이 카테고리에 게시글이 있어 삭제할 수 없습니다.' }, { status: 400 });
		}
		
		console.log('Deleting category with ID:', params.id);
		
		const { data, error } = await supabase
			.from('categories')
			.delete()
			.eq('id', params.id)
			.select();
		
		console.log('Delete result:', { data, error });
		
		if (error) {
			console.error('Delete error:', error);
			return json({ error: error.message }, { status: 500 });
		}
		
		if (!data || data.length === 0) {
			console.log('No rows were deleted');
			return json({ error: '카테고리를 찾을 수 없습니다.' }, { status: 404 });
		}
		
		return json({ success: true });
	} catch (err) {
		return json({ error: '카테고리 삭제 중 오류가 발생했습니다.' }, { status: 500 });
	}
};