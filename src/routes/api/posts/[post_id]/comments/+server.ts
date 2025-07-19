import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { buildCommentTree, countAllComments } from '$lib/utils/comments'

// GET: 게시글의 댓글 목록 조회
export const GET: RequestHandler = async ({ params, locals }) => {
	const { post_id } = params
	const supabase = locals.supabase

	const { data: comments, error } = await supabase
		.from('comments')
		.select(`
			*,
			author:profiles!comments_author_id_fkey (
				id,
				username,
				full_name,
				avatar_url
			)
		`)
		.eq('post_id', post_id)
		.order('created_at', { ascending: true })

	if (error) {
		return json({ error: error.message }, { status: 500 })
	}

	// Build hierarchical comment tree
	const commentTree = buildCommentTree(comments || [])
	
	// 전체 댓글 개수 (모든 계층 포함)
	const totalCount = comments ? comments.length : 0

	return json({ 
		comments: commentTree,
		totalCount 
	})
}

// POST: 댓글 작성
export const POST: RequestHandler = async ({ params, request, locals }) => {
	const { session } = await locals.safeGetSession()
	if (!session) {
		return json({ error: '로그인이 필요합니다.' }, { status: 401 })
	}

	const { post_id } = params
	const supabase = locals.supabase
	const body = await request.json()

	// 필수 필드 검증
	if (!body.content || body.content.trim() === '') {
		return json({ error: '댓글 내용을 입력해주세요.' }, { status: 400 })
	}

	// 댓글 생성
	const { data: comment, error } = await supabase
		.from('comments')
		.insert({
			post_id,
			author_id: session.user.id,
			content: body.content.trim(),
			parent_id: body.parent_id || null
		})
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

	if (error) {
		return json({ error: error.message }, { status: 500 })
	}

	// 게시물의 comment_count 업데이트
	const { error: updateError } = await supabase
		.from('posts')
		.update({ 
			comment_count: await getCommentCount(post_id, supabase) 
		})
		.eq('id', post_id)

	if (updateError) {
		console.error('Failed to update comment count:', updateError)
	}

	return json({ comment }, { status: 201 })
}

// 게시물의 전체 댓글 개수 조회
async function getCommentCount(postId: string, supabase: any): Promise<number> {
	const { count, error } = await supabase
		.from('comments')
		.select('*', { count: 'exact', head: true })
		.eq('post_id', postId)
	
	return error ? 0 : (count || 0)
}