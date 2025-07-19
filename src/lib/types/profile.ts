export interface Profile {
	id: string
	username: string
	full_name: string | null
	bio: string | null
	avatar_url: string | null
	location: string | null
	website: string | null
	github_url: string | null
	twitter_url: string | null
	is_public: boolean
	created_at: string
	updated_at: string
}