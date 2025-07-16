<script lang="ts">
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import { auth, isAuthenticated, user } from '$lib/stores'
	
	let { data } = $props()
	let mobileMenuOpen = $state(false)
	let userMenuOpen = $state(false)
	
	// Use reactive variables for auth state
	let authState = $state<ReturnType<typeof auth.subscribe>>()
	let isAuth = $state(false)
	let currentUser = $state<any>(null)
	
	// Subscribe to auth stores
	$effect(() => {
		const unsubAuth = isAuthenticated.subscribe(value => isAuth = value)
		const unsubUser = user.subscribe(value => currentUser = value)
		
		return () => {
			unsubAuth()
			unsubUser()
		}
	})
	
	async function signOut() {
		try {
			await auth.signOut()
			goto('/')
		} catch (error) {
			console.error('Error signing out:', error)
		}
	}
	
	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen
	}
	
	function toggleUserMenu() {
		userMenuOpen = !userMenuOpen
	}
	
	// Close menus when clicking outside
	function closeMenus() {
		mobileMenuOpen = false
		userMenuOpen = false
	}
</script>

<svelte:window onclick={closeMenus} />

<header class="bg-white shadow-sm border-b border-gray-200">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between items-center h-16">
			<!-- Logo and Brand -->
			<div class="flex items-center">
				<a href="/" class="flex items-center space-x-2">
					<div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
						<span class="text-white font-bold text-sm">CC</span>
					</div>
					<span class="text-xl font-bold text-gray-900 hidden sm:block">
						Claude Code Korea
					</span>
					<span class="text-xl font-bold text-gray-900 sm:hidden">
						CCK
					</span>
				</a>
			</div>
			
			<!-- Desktop Navigation -->
			<nav class="hidden md:flex items-center space-x-8">
				<a 
					href="/" 
					class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors
					{$page.url.pathname === '/' ? 'text-blue-600 border-b-2 border-blue-600' : ''}"
				>
					홈
				</a>
				<a 
					href="/forum" 
					class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors
					{$page.url.pathname.startsWith('/forum') ? 'text-blue-600 border-b-2 border-blue-600' : ''}"
				>
					포럼
				</a>
				<a 
					href="/projects" 
					class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors
					{$page.url.pathname.startsWith('/projects') ? 'text-blue-600 border-b-2 border-blue-600' : ''}"
				>
					프로젝트
				</a>
				<a 
					href="/snippets" 
					class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors
					{$page.url.pathname.startsWith('/snippets') ? 'text-blue-600 border-b-2 border-blue-600' : ''}"
				>
					코드 스니펫
				</a>
			</nav>
			
			<!-- Desktop User Menu -->
			<div class="hidden md:flex items-center space-x-4">
				{#if isAuth && currentUser}
					<a
						href="/posts/new"
						class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
					>
						글쓰기
					</a>
					<div class="relative">
						<button
							onclick={(e) => { e.stopPropagation(); toggleUserMenu(); }}
							class="flex items-center space-x-2 text-gray-700 hover:text-blue-600 focus:outline-none"
						>
							{#if currentUser.user_metadata?.avatar_url}
								<img 
									src={currentUser.user_metadata.avatar_url} 
									alt="프로필" 
									class="w-8 h-8 rounded-full border-2 border-gray-200"
								/>
							{:else}
								<div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
									<svg class="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
								</div>
							{/if}
							<span class="text-sm font-medium">
								{currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0]}
							</span>
							<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
							</svg>
						</button>
						
						{#if userMenuOpen}
							<div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
								<a 
									href="/profile" 
									class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
								>
									프로필 설정
								</a>
								<a 
									href="/my-posts" 
									class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
								>
									내 게시글
								</a>
								<a 
									href="/bookmarks" 
									class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
								>
									북마크
								</a>
								<hr class="my-1">
								<button 
									onclick={signOut}
									class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
								>
									로그아웃
								</button>
							</div>
						{/if}
					</div>
				{:else}
					<a 
						href="/auth" 
						class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
					>
						로그인
					</a>
				{/if}
			</div>
			
			<!-- Mobile menu button -->
			<div class="md:hidden">
				<button
					onclick={(e) => { e.stopPropagation(); toggleMobileMenu(); }}
					class="text-gray-700 hover:text-blue-600 focus:outline-none"
				>
					<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						{#if mobileMenuOpen}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						{:else}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
						{/if}
					</svg>
				</button>
			</div>
		</div>
		
		<!-- Mobile Navigation -->
		{#if mobileMenuOpen}
			<div class="md:hidden border-t border-gray-200 py-4">
				<div class="space-y-2">
					<a 
						href="/" 
						class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md
						{$page.url.pathname === '/' ? 'text-blue-600 bg-blue-50' : ''}"
					>
						홈
					</a>
					<a 
						href="/forum" 
						class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md
						{$page.url.pathname.startsWith('/forum') ? 'text-blue-600 bg-blue-50' : ''}"
					>
						포럼
					</a>
					<a 
						href="/projects" 
						class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md
						{$page.url.pathname.startsWith('/projects') ? 'text-blue-600 bg-blue-50' : ''}"
					>
						프로젝트
					</a>
					<a 
						href="/snippets" 
						class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md
						{$page.url.pathname.startsWith('/snippets') ? 'text-blue-600 bg-blue-50' : ''}"
					>
						코드 스니펫
					</a>
				</div>
				
				<!-- Mobile User Menu -->
				<div class="mt-4 pt-4 border-t border-gray-200">
					{#if isAuth && currentUser}
						<div class="flex items-center space-x-3 px-3 py-2">
							{#if currentUser.user_metadata?.avatar_url}
								<img 
									src={currentUser.user_metadata.avatar_url} 
									alt="프로필" 
									class="w-10 h-10 rounded-full border-2 border-gray-200"
								/>
							{:else}
								<div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
									<svg class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
								</div>
							{/if}
							<div>
								<div class="text-base font-medium text-gray-900">
									{currentUser.user_metadata?.full_name || '사용자'}
								</div>
								<div class="text-sm text-gray-500">
									{currentUser.email}
								</div>
							</div>
						</div>
						<div class="mt-3 space-y-1">
							<a 
								href="/posts/new" 
								class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
							>
								글쓰기
							</a>
							<a 
								href="/profile" 
								class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
							>
								프로필 설정
							</a>
							<a 
								href="/my-posts" 
								class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
							>
								내 게시글
							</a>
							<a 
								href="/bookmarks" 
								class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
							>
								북마크
							</a>
							<button 
								onclick={signOut}
								class="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
							>
								로그아웃
							</button>
						</div>
					{:else}
						<a 
							href="/auth" 
							class="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-md text-base font-medium hover:bg-blue-700 transition-colors"
						>
							로그인
						</a>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</header>