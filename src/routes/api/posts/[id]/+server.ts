import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// GET: 특정 게시글 조회
export const GET: RequestHandler = async ({ params, locals, cookies }) => {
	try {
		const supabase = locals.supabase;
		
		// 게시글 조회
		const { data: post, error } = await supabase
			.from('posts')
			.select(`
				*,
				author:profiles!posts_author_id_fkey (
					id,
					username,
					full_name,
					avatar_url,
					bio
				),
				category:categories!posts_category_id_fkey (
					id,
					name,
					slug,
					icon,
					color,
					description
				)
			`)
			.eq('id', params.id)
			.single();
		
		if (error) {
			if (error.code === 'PGRST116') {
				return json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
			}
			console.error('Error fetching post:', error);
			return json({ error: error.message }, { status: 500 });
		}
		
		// 비공개 게시글 확인
		if (!post.is_published) {
			const { session } = await locals.safeGetSession();
			// 작성자 본인이 아니면 접근 불가
			if (!session || session.user.id !== post.author_id) {
				return json({ error: '비공개 게시글입니다.' }, { status: 403 });
			}
		}
		
		// 조회수 증가 (중복 방지를 위해 쿠키 사용)
		const viewedPosts = cookies.get('viewed_posts');
		const viewedArray = viewedPosts ? viewedPosts.split(',') : [];
		
		if (!viewedArray.includes(params.id)) {
			// 조회수 증가 함수 호출
			const { error: viewError } = await supabase.rpc('increment_view_count', {
				table_name: 'posts',
				record_id: params.id
			});
			
			if (!viewError) {
				// 쿠키에 추가 (24시간 유지)
				viewedArray.push(params.id);
				cookies.set('viewed_posts', viewedArray.join(','), {
					path: '/',
					maxAge: 60 * 60 * 24, // 24시간
					httpOnly: true,
					sameSite: 'strict'
				});
				
				// 응답에 증가된 조회수 반영
				post.view_count += 1;
			}
		}
		
		return json({ post });
	} catch (err) {
		console.error('Unexpected error:', err);
		return json({ error: '게시글을 가져오는 중 오류가 발생했습니다.' }, { status: 500 });
	}
};

// PATCH: 게시글 수정
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	try {
		const { session } = await locals.safeGetSession();
		if (!session) {
			return json({ error: '로그인이 필요합니다.' }, { status: 401 });
		}
		
		const supabase = locals.supabase;
		const body = await request.json();
		
		// 작성자 확인
		const { data: existingPost, error: fetchError } = await supabase
			.from('posts')
			.select('author_id, category_id, slug')
			.eq('id', params.id)
			.single();
		
		if (fetchError || !existingPost) {
			return json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
		}
		
		// 작성자 또는 관리자만 수정 가능
		const isAdmin = session.user.user_metadata?.role === 'admin';
		const isAuthor = existingPost.author_id === session.user.id;
		
		if (!isAuthor && !isAdmin) {
			return json({ error: '게시글을 수정할 권한이 없습니다.' }, { status: 403 });
		}
		
		// 업데이트할 필드 준비
		const updates: any = {};
		
		// 제목 변경
		if (body.title !== undefined) {
			if (body.title.length === 0) {
				return json({ error: '제목은 필수입니다.' }, { status: 400 });
			}
			if (body.title.length > 200) {
				return json({ error: '제목은 200자를 초과할 수 없습니다.' }, { status: 400 });
			}
			updates.title = body.title.trim();
		}
		
		// 내용 변경
		if (body.content !== undefined) {
			if (body.content.length === 0) {
				return json({ error: '내용은 필수입니다.' }, { status: 400 });
			}
			updates.content = body.content;
		}
		
		// 카테고리 변경
		if (body.category_id !== undefined && body.category_id !== existingPost.category_id) {
			// 카테고리 유효성 확인
			const { data: category, error: categoryError } = await supabase
				.from('categories')
				.select('id')
				.eq('id', body.category_id)
				.eq('is_active', true)
				.single();
			
			if (categoryError || !category) {
				return json({ error: '유효하지 않은 카테고리입니다.' }, { status: 400 });
			}
			
			updates.category_id = body.category_id;
			
			// 카테고리가 변경되면 슬러그도 재생성 (카테고리별로 유니크해야 함)
			if (body.title || updates.title) {
				const title = body.title || updates.title;
				const timestamp = Date.now().toString(36);
				const randomStr = Math.random().toString(36).substring(2, 5);
				const baseSlug = title
					.toLowerCase()
					.replace(/[^\w\s가-힣]/g, '')
					.replace(/\s+/g, '-')
					.substring(0, 50);
				updates.slug = `${baseSlug}-${timestamp}${randomStr}`;
			}
		}
		
		// 게시 상태 변경
		if (body.is_published !== undefined) {
			updates.is_published = body.is_published;
		}
		
		// 고정/잠금 상태는 관리자만 변경 가능
		if (body.is_pinned !== undefined) {
			if (!isAdmin) {
				return json({ error: '게시글 고정은 관리자만 가능합니다.' }, { status: 403 });
			}
			updates.is_pinned = body.is_pinned;
		}
		
		if (body.is_locked !== undefined) {
			if (!isAdmin) {
				return json({ error: '댓글 잠금은 관리자만 가능합니다.' }, { status: 403 });
			}
			updates.is_locked = body.is_locked;
		}
		
		if (Object.keys(updates).length === 0) {
			return json({ error: '수정할 내용이 없습니다.' }, { status: 400 });
		}
		
		// 업데이트 실행
		const { data, error } = await supabase
			.from('posts')
			.update(updates)
			.eq('id', params.id)
			.select(`
				*,
				author:profiles!posts_author_id_fkey (
					id,
					username,
					full_name,
					avatar_url
				),
				category:categories!posts_category_id_fkey (
					id,
					name,
					slug,
					icon,
					color
				)
			`)
			.single();
		
		if (error) {
			console.error('Error updating post:', error);
			return json({ error: error.message }, { status: 500 });
		}
		
		return json({ post: data });
	} catch (err) {
		console.error('Unexpected error:', err);
		return json({ error: '게시글 수정 중 오류가 발생했습니다.' }, { status: 500 });
	}
};

// DELETE: 게시글 삭제
export const DELETE: RequestHandler = async ({ params, locals }) => {
	try {
		const { session } = await locals.safeGetSession();
		if (!session) {
			return json({ error: '로그인이 필요합니다.' }, { status: 401 });
		}
		
		const supabase = locals.supabase;
		
		// 작성자 확인
		const { data: post, error: fetchError } = await supabase
			.from('posts')
			.select('author_id')
			.eq('id', params.id)
			.single();
		
		if (fetchError || !post) {
			return json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
		}
		
		// 작성자 또는 관리자만 삭제 가능
		const isAdmin = session.user.user_metadata?.role === 'admin';
		const isAuthor = post.author_id === session.user.id;
		
		if (!isAuthor && !isAdmin) {
			return json({ error: '게시글을 삭제할 권한이 없습니다.' }, { status: 403 });
		}
		
		// 삭제 실행 (CASCADE로 인해 관련 댓글, 좋아요 등도 함께 삭제됨)
		const { error } = await supabase
			.from('posts')
			.delete()
			.eq('id', params.id);
		
		if (error) {
			console.error('Error deleting post:', error);
			return json({ error: error.message }, { status: 500 });
		}
		
		return json({ success: true });
	} catch (err) {
		console.error('Unexpected error:', err);
		return json({ error: '게시글 삭제 중 오류가 발생했습니다.' }, { status: 500 });
	}
};