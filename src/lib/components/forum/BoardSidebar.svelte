<script lang="ts">
	import FireIcon from 'heroicons/24/outline/fire.svg?raw'
	import ChatBubbleLeftEllipsisIcon from 'heroicons/24/outline/chat-bubble-left-ellipsis.svg?raw'
	import TrophyIcon from 'heroicons/24/outline/trophy.svg?raw'
	import BellIcon from 'heroicons/24/outline/bell.svg?raw'
	
	interface PopularPost {
		id: string
		title: string
		commentCount: number
		likeCount: number
	}
	
	interface RecentComment {
		id: string
		postId: string
		postTitle: string
		content: string
		authorName: string
		createdAt: string
	}
	
	interface TopUser {
		id: string
		username: string
		displayName?: string
		level: number
		points: number
		rank: number
	}
	
	interface Props {
		popularPosts?: PopularPost[]
		recentComments?: RecentComment[]
		topUsers?: TopUser[]
		announcement?: {
			title: string
			content: string
		}
		rules?: string[]
	}
	
	let {
		popularPosts = [],
		recentComments = [],
		topUsers = [],
		announcement,
		rules = []
	}: Props = $props()
	
	function truncateText(text: string, maxLength: number = 20) {
		if (text.length <= maxLength) return text
		return text.substring(0, maxLength) + '...'
	}
	
	function getLevelColor(level: number) {
		if (level >= 10) return 'text-red-600'
		if (level >= 5) return 'text-purple-600'
		if (level >= 3) return 'text-blue-600'
		return 'text-gray-600'
	}
</script>

<div class="space-y-6">
	<!-- 공지사항 -->
	{#if announcement}
		<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
			<div class="flex items-center space-x-2 mb-2">
				<div class="w-5 h-5 text-yellow-600">
					{@html BellIcon}
				</div>
				<h3 class="font-semibold text-yellow-800">공지사항</h3>
			</div>
			<h4 class="font-medium text-gray-900 mb-1">{announcement.title}</h4>
			<p class="text-sm text-gray-700">{announcement.content}</p>
		</div>
	{/if}
	
	<!-- 인기 게시물 -->
	{#if popularPosts.length > 0}
		<div class="bg-white border border-gray-200 rounded-lg p-4">
			<div class="flex items-center space-x-2 mb-3">
				<div class="w-5 h-5 text-red-600">
					{@html FireIcon}
				</div>
				<h3 class="font-semibold text-gray-900">인기 게시물</h3>
			</div>
			<ul class="space-y-2">
				{#each popularPosts.slice(0, 5) as post, index}
					<li>
						<a href="/forum/post/{post.id}" class="flex items-start space-x-2 text-sm hover:text-blue-600">
							<span class="font-medium text-gray-500 min-w-[1rem]">{index + 1}.</span>
							<div class="flex-1 min-w-0">
								<span class="block truncate">{post.title}</span>
								<div class="flex items-center space-x-2 text-xs text-gray-500 mt-0.5">
									<span>댓글 {post.commentCount}</span>
									<span>·</span>
									<span>추천 {post.likeCount}</span>
								</div>
							</div>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
	
	<!-- 최근 댓글 -->
	{#if recentComments.length > 0}
		<div class="bg-white border border-gray-200 rounded-lg p-4">
			<div class="flex items-center space-x-2 mb-3">
				<div class="w-5 h-5 text-blue-600">
					{@html ChatBubbleLeftEllipsisIcon}
				</div>
				<h3 class="font-semibold text-gray-900">최근 댓글</h3>
			</div>
			<ul class="space-y-3">
				{#each recentComments.slice(0, 5) as comment}
					<li class="text-sm">
						<a href="/forum/post/{comment.postId}" class="block hover:bg-gray-50 -mx-2 px-2 py-1 rounded">
							<div class="font-medium text-gray-700 truncate">
								{comment.postTitle}
							</div>
							<div class="text-gray-600 mt-0.5 truncate">
								{truncateText(comment.content, 30)}
							</div>
							<div class="text-xs text-gray-500 mt-0.5">
								{comment.authorName} · {comment.createdAt}
							</div>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
	
	<!-- 활동 랭킹 -->
	{#if topUsers.length > 0}
		<div class="bg-white border border-gray-200 rounded-lg p-4">
			<div class="flex items-center space-x-2 mb-3">
				<div class="w-5 h-5 text-purple-600">
					{@html TrophyIcon}
				</div>
				<h3 class="font-semibold text-gray-900">주간 활동 랭킹</h3>
			</div>
			<ul class="space-y-2">
				{#each topUsers.slice(0, 5) as user}
					<li class="flex items-center justify-between text-sm">
						<div class="flex items-center space-x-2">
							<span class="font-medium text-gray-500 min-w-[1.5rem]">{user.rank}위</span>
							<a href="/profile/{user.username}" class="hover:text-blue-600">
								<span class="{getLevelColor(user.level)} font-medium">
									{user.displayName || user.username}
								</span>
								<span class="text-xs text-gray-500 ml-1">
									Lv.{user.level}
								</span>
							</a>
						</div>
						<span class="text-xs text-gray-500">{user.points.toLocaleString()}p</span>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
	
	<!-- 게시판 규칙 -->
	{#if rules.length > 0}
		<div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
			<h3 class="font-semibold text-gray-900 mb-3">게시판 규칙</h3>
			<ul class="space-y-1.5 text-sm text-gray-700">
				{#each rules as rule, index}
					<li class="flex items-start">
						<span class="text-gray-500 mr-2">{index + 1}.</span>
						<span>{rule}</span>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>