import type { CommentWithAuthor, CommentWithReplies } from '$lib/types/comment'

export function buildCommentTree(flatComments: CommentWithAuthor[]): CommentWithReplies[] {
	const commentMap = new Map<string, CommentWithReplies>()
	const rootComments: CommentWithReplies[] = []

	// Initialize all comments with empty replies array
	flatComments.forEach(comment => {
		commentMap.set(comment.id, { ...comment, replies: [] })
	})

	// Build the tree structure
	flatComments.forEach(comment => {
		const commentWithReplies = commentMap.get(comment.id)!
		
		if (comment.parent_id === null) {
			rootComments.push(commentWithReplies)
		} else {
			const parent = commentMap.get(comment.parent_id)
			if (parent) {
				parent.replies.push(commentWithReplies)
			}
		}
	})

	return rootComments
}

// 전체 댓글 개수 계산 (모든 계층 포함)
export function countAllComments(comments: CommentWithReplies[]): number {
	let count = 0
	
	function countRecursive(commentList: CommentWithReplies[]) {
		for (const comment of commentList) {
			count++
			if (comment.replies && comment.replies.length > 0) {
				countRecursive(comment.replies)
			}
		}
	}
	
	countRecursive(comments)
	return count
}