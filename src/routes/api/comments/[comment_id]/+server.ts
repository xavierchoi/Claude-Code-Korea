import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

// PUT: 댓글 수정
export const PUT: RequestHandler = async ({ params, request, locals }) => {
	const { session } = await locals.safeGetSession()
	if (!session) {
		return json({ error: '로그인이 필요합니다.' }, { status: 401 })
	}

	const { comment_id } = params
	const supabase = locals.supabase
	const body = await request.json()

	// 댓글 소유권 확인
	const { data: comment, error: fetchError } = await supabase
		.from('comments')
		.select('id, author_id')
		.eq('id', comment_id)
		.single()

	if (fetchError || !comment) {
		return json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 })
	}

	// 작성자이거나 관리자인지 확인
	const isAdmin = session.user.user_metadata?.role === 'admin'
	if (comment.author_id !== session.user.id && !isAdmin) {
		return json({ error: '댓글을 수정할 권한이 없습니다.' }, { status: 403 })
	}

	// 필수 필드 검증
	if (!body.content || body.content.trim() === '') {
		return json({ error: '댓글 내용을 입력해주세요.' }, { status: 400 })
	}

	// 댓글 수정
	const { data: updatedComment, error: updateError } = await supabase
		.from('comments')
		.update({
			content: body.content.trim(),
			is_edited: true,
			updated_at: new Date().toISOString()
		})
		.eq('id', comment_id)
		.select(`
			*,
			author:profiles!comments_author_id_fkey (
				id,
				username,
				full_name,
				avatar_url
			)
		`)
		.single()

	if (updateError) {
		return json({ error: updateError.message }, { status: 500 })
	}

	return json({ comment: updatedComment })
}

// DELETE: 댓글 삭제
export const DELETE: RequestHandler = async ({ params, locals }) => {
	const { session } = await locals.safeGetSession()
	if (!session) {
		return json({ error: '로그인이 필요합니다.' }, { status: 401 })
	}

	const { comment_id } = params
	const supabase = locals.supabase

	// 댓글 정보 조회
	const { data: comment, error: fetchError } = await supabase
		.from('comments')
		.select('id, author_id, post_id')
		.eq('id', comment_id)
		.single()

	if (fetchError || !comment) {
		return json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 })
	}

	// 작성자이거나 관리자인지 확인
	const isAdmin = session.user.user_metadata?.role === 'admin'
	if (comment.author_id !== session.user.id && !isAdmin) {
		return json({ error: '댓글을 삭제할 권한이 없습니다.' }, { status: 403 })
	}

	// 댓글 삭제
	const { error: deleteError } = await supabase
		.from('comments')
		.delete()
		.eq('id', comment_id)

	if (deleteError) {
		return json({ error: deleteError.message }, { status: 500 })
	}

	// 게시물의 comment_count 업데이트
	const { count, error: countError } = await supabase
		.from('comments')
		.select('*', { count: 'exact', head: true })
		.eq('post_id', comment.post_id)

	if (!countError) {
		await supabase
			.from('posts')
			.update({ comment_count: count || 0 })
			.eq('id', comment.post_id)
	}

	return json({ success: true })
}