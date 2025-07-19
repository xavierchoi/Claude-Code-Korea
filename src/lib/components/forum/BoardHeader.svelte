<script lang="ts">
	import MagnifyingGlassIcon from 'heroicons/24/outline/magnifying-glass.svg?raw'
	import ChevronDownIcon from 'heroicons/24/outline/chevron-down.svg?raw'
	import PencilIcon from 'heroicons/24/outline/pencil.svg?raw'
	
	interface Category {
		id: string
		name: string
		slug: string
		postCount: number
	}
	
	interface Props {
		categories: Category[]
		selectedCategory: string
		onCategoryChange: (categoryId: string) => void
		onSearch: (query: string) => void
		onWriteClick: () => void
		isAuthenticated: boolean
		stats?: {
			totalPosts: number
			todayPosts: number
			onlineUsers: number
		}
	}
	
	let {
		categories = [],
		selectedCategory = 'all',
		onCategoryChange,
		onSearch,
		onWriteClick,
		isAuthenticated = false,
		stats = {
			totalPosts: 0,
			todayPosts: 0,
			onlineUsers: 0
		}
	}: Props = $props()
	
	let searchQuery = $state('')
	let showCategoryDropdown = $state(false)
	
	function handleSearch(e: Event) {
		e.preventDefault()
		if (onSearch) {
			onSearch(searchQuery)
		}
	}
	
	function handleCategorySelect(categoryId: string) {
		if (onCategoryChange) {
			onCategoryChange(categoryId)
		}
		showCategoryDropdown = false
	}
	
	const currentCategory = $derived(categories.find(c => c.id === selectedCategory) || { name: '전체' })
</script>

<div class="bg-white border-b border-gray-200">
	<div class="px-4 sm:px-6 lg:px-8 py-4">
		<div class="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
			<!-- 왼쪽: 카테고리 선택 및 검색 -->
			<div class="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
				<!-- 카테고리 드롭다운 -->
				<div class="relative">
					<button
						onclick={() => showCategoryDropdown = !showCategoryDropdown}
						class="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
					>
						<span class="font-medium">{currentCategory.name}</span>
						<div class="w-4 h-4">
							{@html ChevronDownIcon}
						</div>
					</button>
					
					{#if showCategoryDropdown}
						<div class="absolute z-10 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
							<button
								onclick={() => handleCategorySelect('all')}
								class="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
								class:bg-blue-50={selectedCategory === 'all'}
								class:text-blue-600={selectedCategory === 'all'}
							>
								전체
							</button>
							{#each categories as category}
								<button
									onclick={() => handleCategorySelect(category.id)}
									class="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center justify-between"
									class:bg-blue-50={selectedCategory === category.id}
									class:text-blue-600={selectedCategory === category.id}
								>
									<span>{category.name}</span>
									<span class="text-xs text-gray-500">({category.postCount})</span>
								</button>
							{/each}
						</div>
					{/if}
				</div>
				
				<!-- 검색 -->
				<form onsubmit={handleSearch} class="flex-1 max-w-md">
					<div class="relative">
						<input
							type="text"
							bind:value={searchQuery}
							placeholder="제목, 내용, 작성자 검색"
							class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
						<div class="absolute left-3 top-2.5 w-5 h-5 text-gray-400">
							{@html MagnifyingGlassIcon}
						</div>
					</div>
				</form>
			</div>
			
			<!-- 오른쪽: 통계 및 글쓰기 버튼 -->
			<div class="flex items-center space-x-4">
				<!-- 통계 정보 -->
				<div class="hidden lg:flex items-center space-x-4 text-sm text-gray-600">
					<div class="flex items-center space-x-1">
						<span class="font-medium">전체:</span>
						<span class="text-gray-900">{stats.totalPosts.toLocaleString()}</span>
					</div>
					<div class="w-px h-4 bg-gray-300"></div>
					<div class="flex items-center space-x-1">
						<span class="font-medium">오늘:</span>
						<span class="text-blue-600">{stats.todayPosts}</span>
					</div>
					<div class="w-px h-4 bg-gray-300"></div>
					<div class="flex items-center space-x-1">
						<span class="font-medium">접속:</span>
						<span class="text-green-600">{stats.onlineUsers}</span>
					</div>
				</div>
				
				<!-- 글쓰기 버튼 -->
				{#if isAuthenticated}
					<button
						onclick={onWriteClick}
						class="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						<div class="w-5 h-5">
							{@html PencilIcon}
						</div>
						<span>글쓰기</span>
					</button>
				{/if}
			</div>
		</div>
		
		<!-- 모바일 통계 정보 -->
		<div class="mt-3 flex lg:hidden items-center space-x-4 text-sm text-gray-600">
			<div class="flex items-center space-x-1">
				<span>전체:</span>
				<span class="font-medium">{stats.totalPosts.toLocaleString()}</span>
			</div>
			<div class="flex items-center space-x-1">
				<span>오늘:</span>
				<span class="font-medium text-blue-600">{stats.todayPosts}</span>
			</div>
			<div class="flex items-center space-x-1">
				<span>접속:</span>
				<span class="font-medium text-green-600">{stats.onlineUsers}</span>
			</div>
		</div>
	</div>
</div>