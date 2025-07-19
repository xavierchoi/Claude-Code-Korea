import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		const supabase = locals.supabase;
		
		// 모든 게시물의 slug 조회
		const { data: posts, error } = await supabase
			.from('posts')
			.select('id, slug, created_at')
			.order('created_at', { ascending: false })
			.limit(50);
		
		if (error) {
			return json({ error: error.message }, { status: 500 });
		}
		
		// 숫자 slug만 필터링
		const numericSlugs = posts
			?.map(p => ({
				...p,
				numericSlug: parseInt(p.slug),
				isNumeric: !isNaN(parseInt(p.slug))
			}))
			.filter(p => p.isNumeric)
			.sort((a, b) => b.numericSlug - a.numericSlug);
		
		// 가장 큰 숫자 slug
		const maxNumericSlug = numericSlugs?.[0]?.numericSlug ?? -1;
		
		return json({
			totalPosts: posts?.length || 0,
			numericPosts: numericSlugs?.length || 0,
			maxNumericSlug,
			recentNumericSlugs: numericSlugs?.slice(0, 10).map(p => ({
				id: p.id,
				slug: p.slug,
				created_at: p.created_at
			})),
			allSlugs: posts?.map(p => p.slug)
		});
	} catch (err) {
		console.error('Debug error:', err);
		return json({ error: 'Debug failed' }, { status: 500 });
	}
};