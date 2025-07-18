<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
	
	let selectedCategory = $page.url.searchParams.get('category') || '';
	let selectedSort = $page.url.searchParams.get('sort') || 'latest';
	let searchQuery = $page.url.searchParams.get('search') || '';
	let currentPage = parseInt($page.url.searchParams.get('page') || '1');
	
	// URL 파라미터 업데이트
	function updateUrl() {
		const params = new URLSearchParams();
		if (selectedCategory) params.set('category', selectedCategory);
		if (selectedSort !== 'latest') params.set('sort', selectedSort);
		if (searchQuery) params.set('search', searchQuery);
		if (currentPage > 1) params.set('page', currentPage.toString());
		
		const queryString = params.toString();
		goto(`/forum${queryString ? `?${queryString}` : ''}`, { replaceState: true });
	}
	
	// 카테고리 변경
	function handleCategoryChange() {
		currentPage = 1;
		updateUrl();
	}
	
	// 정렬 변경
	function handleSortChange() {
		currentPage = 1;
		updateUrl();
	}
	
	// 검색
	function handleSearch(e: Event) {
		e.preventDefault();
		currentPage = 1;
		updateUrl();
	}
	
	// 날짜 포맷
	function formatDate(date: string) {
		const d = new Date(date);
		const now = new Date();
		const diff = now.getTime() - d.getTime();
		const diffHours = diff / (1000 * 60 * 60);
		
		if (diffHours < 1) {
			const diffMinutes = Math.floor(diff / (1000 * 60));
			return `${diffMinutes}분 전`;
		} else if (diffHours < 24) {
			return `${Math.floor(diffHours)}시간 전`;
		} else if (diffHours < 168) { // 7일
			return `${Math.floor(diffHours / 24)}일 전`;
		} else {
			return d.toLocaleDateString('ko-KR');
		}
	}
</script>

<div class="container mx-auto px-4 py-8">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-3xl font-bold">포럼</h1>
		{#if data.session}
			<a
				href="/posts/new"
				class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
			>
				글쓰기
			</a>
		{/if}
	</div>
	
	<!-- 필터 및 검색 -->
	<div class="bg-white rounded-lg shadow-sm p-4 mb-6">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<!-- 카테고리 필터 -->
			<div>
				<label for="category" class="block text-sm font-medium text-gray-700 mb-1">
					카테고리
				</label>
				<select
					id="category"
					bind:value={selectedCategory}
					on:change={handleCategoryChange}
					class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
				>
					<option value="">전체</option>
					{#each data.categories as category}
						<option value={category.slug}>
							{category.icon} {category.name}
						</option>
					{/each}
				</select>
			</div>
			
			<!-- 정렬 옵션 -->
			<div>
				<label for="sort" class="block text-sm font-medium text-gray-700 mb-1">
					정렬
				</label>
				<select
					id="sort"
					bind:value={selectedSort}
					on:change={handleSortChange}
					class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
				>
					<option value="latest">최신순</option>
					<option value="popular">인기순</option>
					<option value="views">조회순</option>
					<option value="comments">댓글순</option>
				</select>
			</div>
			
			<!-- 검색 -->
			<div>
				<label for="search" class="block text-sm font-medium text-gray-700 mb-1">
					검색
				</label>
				<form on:submit={handleSearch} class="flex gap-2">
					<input
						type="text"
						id="search"
						bind:value={searchQuery}
						placeholder="검색어 입력"
						class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					/>
					<button
						type="submit"
						class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
					>
						검색
					</button>
				</form>
			</div>
		</div>
	</div>
	
	<!-- 게시글 목록 -->
	<div class="bg-white rounded-lg shadow-sm overflow-hidden">
		{#if data.posts.length === 0}
			<div class="p-8 text-center text-gray-500">
				게시글이 없습니다.
			</div>
		{:else}
			<div class="divide-y divide-gray-200">
				{#each data.posts as post}
					<article class="p-4 hover:bg-gray-50 transition-colors">
						<div class="flex items-start gap-4">
							<div class="flex-1">
								<div class="flex items-center gap-2 mb-1">
									{#if post.is_pinned}
										<span class="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
											고정
										</span>
									{/if}
									<a 
										href="/forum?category={post.category.slug}"
										class="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
									>
										{post.category.icon} {post.category.name}
									</a>
								</div>
								
								<h2 class="text-lg font-semibold mb-1">
									<a 
										href="/forum/{post.category.slug}/{post.slug}"
										class="hover:text-blue-600"
									>
										{post.title}
									</a>
									{#if post.is_locked}
										<span class="ml-2 text-gray-400">🔒</span>
									{/if}
								</h2>
								
								<div class="flex items-center gap-4 text-sm text-gray-500">
									<a 
										href="/user/{post.author.username}"
										class="hover:text-gray-700"
									>
										{post.author.full_name || post.author.username}
									</a>
									<span>·</span>
									<time>{formatDate(post.created_at)}</time>
									<span>·</span>
									<span>조회 {post.view_count}</span>
									{#if post.like_count > 0}
										<span>·</span>
										<span>좋아요 {post.like_count}</span>
									{/if}
									{#if post.comment_count > 0}
										<span>·</span>
										<span>댓글 {post.comment_count}</span>
									{/if}
								</div>
							</div>
							
							{#if post.author.avatar_url}
								<img
									src={post.author.avatar_url}
									alt={post.author.username}
									class="w-10 h-10 rounded-full"
								/>
							{:else}
								<div class="w-10 h-10 rounded-full bg-gray-300"></div>
							{/if}
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</div>
	
	<!-- 페이지네이션 -->
	{#if data.pagination.totalPages > 1}
		<div class="flex justify-center mt-6 gap-2">
			{#if data.pagination.hasPreviousPage}
				<a
					href="/forum?{new URLSearchParams({
						...Object.fromEntries($page.url.searchParams),
						page: (currentPage - 1).toString()
					}).toString()}"
					class="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
				>
					이전
				</a>
			{/if}
			
			<span class="px-3 py-2 text-sm text-gray-700">
				{currentPage} / {data.pagination.totalPages}
			</span>
			
			{#if data.pagination.hasNextPage}
				<a
					href="/forum?{new URLSearchParams({
						...Object.fromEntries($page.url.searchParams),
						page: (currentPage + 1).toString()
					}).toString()}"
					class="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
				>
					다음
				</a>
			{/if}
		</div>
	{/if}
</div>