import type { Profile } from './profile'

export interface Comment {
	id: string
	post_id: string
	author_id: string
	parent_id: string | null
	content: string
	is_edited: boolean
	like_count: number
	created_at: string
	updated_at: string
}

export interface CommentWithAuthor extends Comment {
	author: Profile
}

export interface CommentWithReplies extends CommentWithAuthor {
	replies: CommentWithReplies[]
}

export interface CreateCommentInput {
	post_id: string
	content: string
	parent_id?: string | null
}

export interface UpdateCommentInput {
	content: string
}

export interface CommentListResponse {
	comments: CommentWithReplies[]
	total_count: number
}