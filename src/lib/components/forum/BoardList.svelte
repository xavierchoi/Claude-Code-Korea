<script lang="ts">
	import { browser } from '$app/environment'
	
	// Icons
	import ChatBubbleLeftEllipsisIcon from 'heroicons/24/outline/chat-bubble-left-ellipsis.svg?raw'
	import EyeIcon from 'heroicons/24/outline/eye.svg?raw'
	import HandThumbUpIcon from 'heroicons/24/outline/hand-thumb-up.svg?raw'
	import PaperClipIcon from 'heroicons/24/outline/paper-clip.svg?raw'
	import FireIcon from 'heroicons/24/outline/fire.svg?raw'
	import PinIcon from 'heroicons/24/outline/cursor-arrow-rays.svg?raw'
	
	interface Post {
		id: string
		title: string
		content: string
		author: {
			username: string
			display_name?: string
			level?: number
		}
		category: {
			name: string
			color: string
		}
		created_at: string
		view_count: number
		like_count: number
		comment_count: number
		is_pinned: boolean
		is_hot: boolean
		has_attachment: boolean
		is_new: boolean
		replies?: Post[]
	}
	
	interface Props {
		posts: Post[]
		category?: string
		showPagination?: boolean
		currentPage?: number
		totalPages?: number
		onPageChange?: (page: number) => void
		onPostClick?: (post: Post) => void
	}
	
	let { 
		posts = [], 
		category = "전체", 
		showPagination = true,
		currentPage = 1,
		totalPages = 1,
		onPageChange,
		onPostClick
	}: Props = $props()
	
	// 게시물 클릭 핸들러
	function handlePostClick(post: Post) {
		if (onPostClick) {
			onPostClick(post)
		}
	}
	
	// 작성자 레벨 색상 반환
	function getLevelColor(level: number = 1) {
		if (level >= 10) return 'text-red-600'
		if (level >= 5) return 'text-purple-600'
		if (level >= 3) return 'text-blue-600'
		return 'text-gray-600'
	}
	
	// 날짜 포맷팅
	function formatDate(dateString: string) {
		const date = new Date(dateString)
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		return `${month}-${day}`
	}
	
	// 페이지 변경 핸들러
	function handlePageChange(page: number) {
		if (onPageChange) {
			onPageChange(page)
		}
	}
	
	// 페이지 번호 배열 생성
	function getPageNumbers() {
		const pages = []
		const start = Math.max(1, currentPage - 2)
		const end = Math.min(totalPages, currentPage + 2)
		
		for (let i = start; i <= end; i++) {
			pages.push(i)
		}
		
		return pages
	}
	
	// 댓글 들여쓰기 레벨 계산
	function getIndentClass(level: number) {
		return `pl-${Math.min(level * 4, 12)}`
	}
	
	// 재귀적으로 게시물과 댓글 렌더링
	function renderPostWithReplies(post: Post, level: number = 0): Array<Post & { level: number }> {
		const result: Array<Post & { level: number }> = [{ ...post, level }]
		if (post.replies) {
			post.replies.forEach(reply => {
				result.push(...renderPostWithReplies(reply, level + 1))
			})
		}
		return result
	}
	
	// 모든 게시물을 플랫 리스트로 변환
	const flatPosts = $derived(posts.flatMap(post => renderPostWithReplies(post)))
</script>

<div class="bg-white rounded-lg shadow-sm border border-gray-200">
	<!-- 게시판 헤더 -->
	<div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
		<div class="flex items-center justify-between">
			<h2 class="text-lg font-semibold text-gray-900">{category}</h2>
			<div class="flex items-center space-x-4 text-sm text-gray-500">
				<span>총 {posts.length}개</span>
				<span>오늘 {posts.filter(p => p.is_new).length}개</span>
			</div>
		</div>
	</div>
	
	<!-- 게시물 목록 테이블 -->
	<div class="overflow-x-auto">
		<table class="w-full">
			<thead class="bg-gray-50 border-b border-gray-200">
				<tr class="text-left text-sm font-medium text-gray-500">
					<th class="px-6 py-3 w-16">번호</th>
					<th class="px-6 py-3 w-24">분류</th>
					<th class="px-6 py-3 flex-1">제목</th>
					<th class="px-6 py-3 w-32">작성자</th>
					<th class="px-6 py-3 w-24">날짜</th>
					<th class="px-6 py-3 w-16">조회</th>
					<th class="px-6 py-3 w-16">추천</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-200">
				{#each flatPosts as post, index}
					<tr 
						class="hover:bg-gray-50 transition-colors cursor-pointer"
						class:bg-yellow-50={post.is_pinned}
						class:bg-red-50={post.is_hot}
						onclick={() => handlePostClick(post)}
					>
						<!-- 번호 -->
						<td class="px-6 py-4 text-sm text-gray-500">
							{#if post.is_pinned}
								<div class="w-4 h-4 text-yellow-600">
									{@html PinIcon}
								</div>
							{:else if post.is_hot}
								<div class="w-4 h-4 text-red-600">
									{@html FireIcon}
								</div>
							{:else}
								{posts.length - index}
							{/if}
						</td>
						
						<!-- 분류 -->
						<td class="px-6 py-4">
							<span 
								class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
								style="background-color: {post.category.color}20; color: {post.category.color}"
							>
								{post.category.name}
							</span>
						</td>
						
						<!-- 제목 -->
						<td class="px-6 py-4 {getIndentClass(post.level || 0)}">
							<div class="flex items-center space-x-2">
								<!-- 댓글 들여쓰기 표시 -->
								{#if post.level && post.level > 0}
									<span class="text-gray-400 text-sm">
										{'└'.repeat(post.level)}
									</span>
								{/if}
								
								<div class="flex-1 min-w-0">
									<div class="flex items-center space-x-2">
										<span class="text-gray-900 font-medium hover:text-blue-600 truncate">
											{post.title}
										</span>
										
										<!-- 댓글 수 -->
										{#if post.comment_count > 0}
											<span class="text-blue-600 text-sm font-medium">
												[{post.comment_count}]
											</span>
										{/if}
										
										<!-- 첨부파일 아이콘 -->
										{#if post.has_attachment}
											<div class="w-4 h-4 text-gray-400">
												{@html PaperClipIcon}
											</div>
										{/if}
										
										<!-- 새 게시물 배지 -->
										{#if post.is_new}
											<span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
												new
											</span>
										{/if}
									</div>
								</div>
							</div>
						</td>
						
						<!-- 작성자 -->
						<td class="px-6 py-4">
							<div class="flex items-center space-x-1">
								<span 
									class="text-sm font-medium {getLevelColor(post.author.level)}"
								>
									{post.author.display_name || post.author.username}
								</span>
								{#if post.author.level}
									<span class="text-xs text-gray-400">
										(Lv.{post.author.level})
									</span>
								{/if}
							</div>
						</td>
						
						<!-- 날짜 -->
						<td class="px-6 py-4 text-sm text-gray-500">
							{formatDate(post.created_at)}
						</td>
						
						<!-- 조회수 -->
						<td class="px-6 py-4 text-sm text-gray-500">
							<div class="flex items-center space-x-1">
								<div class="w-4 h-4">
									{@html EyeIcon}
								</div>
								<span>{post.view_count}</span>
							</div>
						</td>
						
						<!-- 추천수 -->
						<td class="px-6 py-4 text-sm text-gray-500">
							<div class="flex items-center space-x-1">
								<div class="w-4 h-4">
									{@html HandThumbUpIcon}
								</div>
								<span>{post.like_count}</span>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	
	<!-- 페이지네이션 -->
	{#if showPagination && totalPages > 1}
		<div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-2">
					<select class="text-sm border border-gray-300 rounded px-2 py-1">
						<option value="10">10개씩</option>
						<option value="20">20개씩</option>
						<option value="50">50개씩</option>
						<option value="100">100개씩</option>
					</select>
				</div>
				
				<div class="flex items-center space-x-2">
					<!-- 이전 페이지 -->
					<button
						disabled={currentPage === 1}
						onclick={() => handlePageChange(currentPage - 1)}
						class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						이전
					</button>
					
					<!-- 페이지 번호 -->
					{#each getPageNumbers() as page}
						<button
							onclick={() => handlePageChange(page)}
							class="px-3 py-1 text-sm border rounded"
							class:bg-blue-600={page === currentPage}
							class:text-white={page === currentPage}
							class:border-blue-600={page === currentPage}
							class:border-gray-300={page !== currentPage}
							class:hover:bg-gray-100={page !== currentPage}
						>
							{page}
						</button>
					{/each}
					
					<!-- 다음 페이지 -->
					<button
						disabled={currentPage === totalPages}
						onclick={() => handlePageChange(currentPage + 1)}
						class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						다음
					</button>
				</div>
				
				<div class="flex items-center space-x-2">
					<span class="text-sm text-gray-500">페이지 이동:</span>
					<input
						type="number"
						min="1"
						max={totalPages}
						value={currentPage}
						onchange={(e) => handlePageChange(parseInt(e.currentTarget.value))}
						class="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
					/>
					<span class="text-sm text-gray-500">/ {totalPages}</span>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	/* 커스텀 스타일 */
	.pl-4 { padding-left: 1rem; }
	.pl-8 { padding-left: 2rem; }
	.pl-12 { padding-left: 3rem; }
</style>