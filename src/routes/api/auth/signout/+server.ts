import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, cookies }) => {
	try {
		// 서버 사이드 로그아웃
		const { error } = await locals.supabase.auth.signOut();
		
		if (error) {
			console.error('Server signOut error:', error);
		}
		
		// 모든 쿠키 삭제
		cookies.delete('sb-access-token', { path: '/' });
		cookies.delete('sb-refresh-token', { path: '/' });
		
		// Supabase 관련 쿠키들 삭제
		const cookieNames = [
			'sb-saxdnqshcpvztybmuiqi-auth-token',
			'sb-saxdnqshcpvztybmuiqi-auth-token.0',
			'sb-saxdnqshcpvztybmuiqi-auth-token.1',
			'sb-saxdnqshcpvztybmuiqi-auth-token.2',
			'sb-saxdnqshcpvztybmuiqi-auth-token.3'
		];
		
		cookieNames.forEach(name => {
			cookies.delete(name, { path: '/' });
		});
		
		return json({ success: true });
	} catch (err) {
		console.error('Signout error:', err);
		return json({ success: false, error: 'Signout failed' }, { status: 500 });
	}
};