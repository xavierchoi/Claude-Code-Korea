<script lang="ts">
	import { browser } from '$app/environment'
	import { page } from '$app/stores'
	import { isAuthenticated, user } from '$lib/stores'
	import { goto } from '$app/navigation'
	import BoardList from '$lib/components/forum/BoardList.svelte'
	import BoardHeader from '$lib/components/forum/BoardHeader.svelte'
	import BoardSidebar from '$lib/components/forum/BoardSidebar.svelte'
	import type { PageData } from './$types'
	
	let { data }: { data: PageData } = $props()
	
	// Reactive auth state
	let isAuth = $state(false)
	let currentUser = $state<any>(null)
	
	// Board state
	let selectedCategory = $state('all')
	let searchQuery = $state('')
	
	// Get current page from URL
	let currentPage = $derived(Number($page.url.searchParams.get('page')) || 1)
	
	$effect(() => {
		const unsubAuth = isAuthenticated.subscribe(value => isAuth = value)
		const unsubUser = user.subscribe(value => currentUser = value)
		
		return () => {
			unsubAuth()
			unsubUser()
		}
	})
	
	// 서버에서 전달받은 데이터
	const categories = data.categories || []
	
	// 게시물 데이터
	let posts = $state(data.posts || [])
	
	// 사이드바 데이터
	const popularPosts = data.popularPosts || []
	const recentComments = data.recentComments || []
	const topUsers = data.topUsers || []
	const announcement = data.announcement || null
	const rules = data.rules || []
	
	// 필터링된 게시물
	const filteredPosts = $derived(posts.filter(post => {
		if (selectedCategory !== 'all') {
			const category = categories.find(c => c.id === selectedCategory)
			if (category && post.category.name !== category.name) {
				return false
			}
		}
		
		if (searchQuery) {
			const query = searchQuery.toLowerCase()
			return post.title.toLowerCase().includes(query) ||
				   post.content.toLowerCase().includes(query) ||
				   post.author.username.toLowerCase().includes(query)
		}
		
		return true
	}))
	
	// 페이지네이션 - 서버에서 처리된 데이터 사용
	const totalPages = data.pagination?.totalPages || 1
	const paginatedPosts = $derived(filteredPosts) // 이미 페이지네이션된 데이터
	
	// 통계 데이터
	const stats = $derived({
		totalPosts: data.pagination?.totalCount || posts.length,
		todayPosts: posts.filter(p => p.is_new).length,
		onlineUsers: 35 // 고정값 사용
	})
	
	// 이벤트 핸들러
	function handleCategoryChange(categoryId: string) {
		selectedCategory = categoryId
		currentPage = 1
	}
	
	function handleSearch(query: string) {
		searchQuery = query
		currentPage = 1
	}
	
	function handleWriteClick() {
		goto('/posts/new')
	}
	
	function handlePostClick(post: any) {
		// 실제 게시물은 category/slug 형식 사용
		if (post.category?.slug && post.slug) {
			goto(`/forum/${post.category.slug}/${post.slug}`)
		} else {
			// 더미 데이터는 ID 사용
			goto(`/forum/post/${post.id}`)
		}
	}
	
	function handlePageChange(page: number) {
		goto(`?page=${page}`, { replaceState: true })
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}
</script>

<!-- 게시판 헤더 -->
<BoardHeader
	{categories}
	{selectedCategory}
	onCategoryChange={handleCategoryChange}
	onSearch={handleSearch}
	onWriteClick={handleWriteClick}
	isAuthenticated={isAuth}
	{stats}
/>

<!-- 메인 컨텐츠 영역 -->
<div class="bg-gray-50 min-h-screen py-6">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
			<!-- 게시판 목록 (왼쪽 3/4) -->
			<div class="lg:col-span-3">
				<BoardList
					posts={paginatedPosts}
					category={selectedCategory === 'all' ? '전체 게시판' : categories.find(c => c.id === selectedCategory)?.name || '전체'}
					showPagination={true}
					{currentPage}
					{totalPages}
					onPageChange={handlePageChange}
					onPostClick={handlePostClick}
				/>
			</div>
			
			<!-- 사이드바 (오른쪽 1/4) -->
			<div class="lg:col-span-1">
				<BoardSidebar
					{popularPosts}
					{recentComments}
					{topUsers}
					{announcement}
					{rules}
				/>
			</div>
		</div>
	</div>
</div>
