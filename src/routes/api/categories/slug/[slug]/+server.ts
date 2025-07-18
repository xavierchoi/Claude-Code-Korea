import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	try {
		const supabase = locals.supabase;
		
		const { data, error } = await supabase
			.from('categories')
			.select('*')
			.eq('slug', params.slug)
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