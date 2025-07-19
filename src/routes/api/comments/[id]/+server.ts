import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const PUT: RequestHandler = async ({ request, params, locals }) => {
	const { supabase, user } = locals
	
	console.log('PUT /api/comments/[id] - user:', user)
	
	if (!user) {
		console.log('No user found in locals')
		return json({ error: 'Authentication required' }, { status: 401 })
	}
	
	const commentId = params.id
	const { content } = await request.json()
	
	if (!content || !content.trim()) {
		return json({ error: 'Content is required' }, { status: 400 })
	}
	
	try {
		// 먼저 댓글 정보를 가져와서 권한 확인
		const { data: comment, error: fetchError } = await supabase
			.from('comments')
			.select('author_id')
			.eq('id', commentId)
			.single()
		
		if (fetchError || !comment) {
			return json({ error: 'Comment not found' }, { status: 404 })
		}
		
		// 관리자 권한 확인
		const { data: profile } = await supabase
			.from('profiles')
			.select('is_admin')
			.eq('id', user.id)
			.single()
		
		const isAdmin = profile?.is_admin || false
		
		// 작성자 본인이거나 관리자인 경우에만 수정 가능
		if (comment.author_id !== user.id && !isAdmin) {
			return json({ error: 'Unauthorized' }, { status: 403 })
		}
		
		// 댓글 수정
		const { data: updatedComment, error: updateError } = await supabase
			.from('comments')
			.update({
				content: content.trim(),
				is_edited: true,
				updated_at: new Date().toISOString()
			})
			.eq('id', commentId)
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
			console.error('Error updating comment:', updateError)
			return json({ error: 'Failed to update comment' }, { status: 500 })
		}
		
		return json({ comment: updatedComment })
	} catch (error) {
		console.error('Error in PUT /api/comments/[id]:', error)
		return json({ error: 'Internal server error' }, { status: 500 })
	}
}

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const { supabase, user } = locals
	
	console.log('DELETE /api/comments/[id] - user:', user)
	
	if (!user) {
		console.log('No user found in locals')
		return json({ error: 'Authentication required' }, { status: 401 })
	}
	
	const commentId = params.id
	console.log('Attempting to delete comment:', commentId, 'by user:', user.id)
	
	try {
		// 먼저 댓글 정보를 가져와서 권한 확인
		const { data: comment, error: fetchError } = await supabase
			.from('comments')
			.select('author_id')
			.eq('id', commentId)
			.single()
		
		if (fetchError || !comment) {
			return json({ error: 'Comment not found' }, { status: 404 })
		}
		
		// 관리자 권한 확인
		const { data: profile, error: profileError } = await supabase
			.from('profiles')
			.select('is_admin')
			.eq('id', user.id)
			.single()
		
		console.log('Profile query result:', { profile, profileError })
		const isAdmin = profile?.is_admin || false
		console.log('Is admin?', isAdmin, 'Comment author:', comment.author_id, 'Current user:', user.id)
		
		// 작성자 본인이거나 관리자인 경우에만 삭제 가능
		if (comment.author_id !== user.id && !isAdmin) {
			console.log('Unauthorized: User is not the author and not an admin')
			return json({ error: 'Unauthorized' }, { status: 403 })
		}
		
		// 관리자인 경우 항상 RPC 사용 (자신의 댓글이든 다른 사용자의 댓글이든)
		if (isAdmin) {
			console.log('Admin deleting comment (own or others), using RPC')
			const { data, error } = await supabase
				.rpc('admin_delete_comment', {
					comment_id: commentId,
					admin_id: user.id
				})
			
			if (error) {
				console.error('Error in admin_delete_comment RPC:', error)
				return json({ error: 'Failed to delete comment' }, { status: 500 })
			}
			
			console.log('Comment soft deleted successfully via RPC:', commentId)
			return json({ success: true })
		} else {
			// 일반 사용자가 자신의 댓글을 삭제하는 경우
			console.log('Regular user deleting their own comment')
			const { data: deleteData, error: deleteError } = await supabase
				.from('comments')
				.update({
					is_deleted: true,
					deleted_at: new Date().toISOString()
				})
				.eq('id', commentId)
				.select()
			
			console.log('Delete result:', { deleteData, deleteError })
			
			if (deleteError) {
				console.error('Error deleting comment:', deleteError)
				return json({ error: 'Failed to delete comment' }, { status: 500 })
			}
			
			if (!deleteData || deleteData.length === 0) {
				console.error('No rows were updated during delete')
				return json({ error: 'Comment not found or already deleted' }, { status: 404 })
			}
			
			console.log('Comment soft deleted successfully:', commentId)
			return json({ success: true })
		}
	} catch (error) {
		console.error('Error in DELETE /api/comments/[id]:', error)
		return json({ error: 'Internal server error' }, { status: 500 })
	}
}