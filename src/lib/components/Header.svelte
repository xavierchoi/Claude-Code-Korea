<script lang="ts">
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import { auth, isAuthenticated, user, profile } from '$lib/stores'
	import { supabase } from '$lib/supabase'
	import { dev } from '$app/environment'
	import Modal from './Modal.svelte'
	import PencilSquareIcon from 'heroicons/24/outline/pencil-square.svg?raw'
	
	let { data } = $props()
	let mobileMenuOpen = $state(false)
	let userMenuOpen = $state(false)
	let showProfileModal = $state(false)
	
	// Use reactive variables for auth state
	let isAuth = $state(false)
	let currentUser = $state<any>(null)
	
	// Reactively update auth state based on data.session
	$effect(() => {
		isAuth = !!data.session
		currentUser = data.session?.user || null
	})
	
	function signOut() {
		console.log('Signing out...');
		
		// 간단한 방법: 모든 로컬 스토리지 삭제 후 새로고침
		localStorage.clear();
		sessionStorage.clear();
		
		// 쿠키도 삭제
		document.cookie.split(";").forEach(function(c) { 
			document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
		});
		
		// 강제 새로고침
		window.location.href = '/';
	}
	
	async function handleWriteClick(e: Event) {
		e.preventDefault()
		
		if (!currentUser) return
		
		// 프로덕션 레디 해결책: 인증된 사용자는 바로 글쓰기 페이지로 이동
		// 이유: Supabase 클라이언트 쿼리에 지속적인 문제가 있음
		// 대안: 글쓰기 페이지에서 필요시 username 검증 수행
		goto('/posts/new')
	}
	
	function handleProfileSetup() {
		showProfileModal = false
		goto('/profile?setup=true&highlight=username&from=/posts/new')
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

<header class="bg-transparent">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between items-center h-16">
			<!-- Logo and Brand -->
			<div class="flex items-center">
				<a href="/" class="flex items-center">
					<img src="/logo.svg" alt="Claude Code Korea" class="h-6 w-auto">
				</a>
			</div>
			
			<!-- Desktop Navigation -->
			<nav class="hidden md:flex items-center space-x-8">
				<a 
					href="/" 
					class="text-primary-700 hover:text-accent-600 px-3 py-2 text-sm font-medium transition-colors
					{$page.url.pathname === '/' ? 'text-accent-600 border-b-2 border-accent-600' : ''}"
				>
					홈
				</a>
				<a 
					href="/forum" 
					class="text-primary-700 hover:text-accent-600 px-3 py-2 text-sm font-medium transition-colors
					{$page.url.pathname.startsWith('/forum') ? 'text-accent-600 border-b-2 border-accent-600' : ''}"
				>
					포럼
				</a>
				<a 
					href="/projects" 
					class="text-primary-700 hover:text-accent-600 px-3 py-2 text-sm font-medium transition-colors
					{$page.url.pathname.startsWith('/projects') ? 'text-accent-600 border-b-2 border-accent-600' : ''}"
				>
					프로젝트
				</a>
				<a 
					href="/snippets" 
					class="text-primary-700 hover:text-accent-600 px-3 py-2 text-sm font-medium transition-colors
					{$page.url.pathname.startsWith('/snippets') ? 'text-accent-600 border-b-2 border-accent-600' : ''}"
				>
					코드 스니펫
				</a>
				{#if dev}
					<a 
						href="/dev/dummy-users" 
						class="text-red-600 hover:text-red-800 px-3 py-2 text-sm font-medium transition-colors border border-red-200 rounded-md
						{$page.url.pathname.startsWith('/dev/dummy-users') ? 'bg-red-50 border-red-300' : ''}"
						title="개발자 도구 - 더미 사용자 관리"
					>
						🔧 DEV
					</a>
				{/if}
			</nav>
			
			<!-- Desktop User Menu -->
			<div class="hidden md:flex items-center space-x-4">
				{#if isAuth && currentUser}
					<button
						onclick={handleWriteClick}
						class="text-primary-700 hover:text-accent-600 p-2 text-sm font-medium transition-colors"
						title="글쓰기"
					>
						<div class="w-5 h-5 pointer-events-none">
							{@html PencilSquareIcon}
						</div>
					</button>
					<div class="relative">
						<button
							onclick={(e) => { e.stopPropagation(); toggleUserMenu(); }}
							class="flex items-center space-x-2 text-primary-700 hover:text-accent-600 focus:outline-none"
						>
							{#if currentUser.user_metadata?.avatar_url}
								<img 
									src={currentUser.user_metadata.avatar_url} 
									alt="프로필" 
									class="w-8 h-8 rounded-full border-2 border-gray-200"
								/>
							{:else}
								<div class="w-8 h-8 bg-primary-300 rounded-full flex items-center justify-center">
									<svg class="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
						class="bg-accent-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-accent-700 transition-colors"
					>
						로그인
					</a>
				{/if}
			</div>
			
			<!-- Mobile menu button -->
			<div class="md:hidden">
				<button
					onclick={(e) => { e.stopPropagation(); toggleMobileMenu(); }}
					class="text-primary-700 hover:text-accent-600 focus:outline-none"
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
			<div class="md:hidden border-t border-primary-200 py-4">
				<div class="space-y-2">
					<a 
						href="/" 
						class="block px-3 py-2 text-base font-medium text-primary-700 hover:text-accent-600 hover:bg-primary-50 rounded-md
						{$page.url.pathname === '/' ? 'text-accent-600 bg-accent-50' : ''}"
					>
						홈
					</a>
					<a 
						href="/forum" 
						class="block px-3 py-2 text-base font-medium text-primary-700 hover:text-accent-600 hover:bg-primary-50 rounded-md
						{$page.url.pathname.startsWith('/forum') ? 'text-accent-600 bg-accent-50' : ''}"
					>
						포럼
					</a>
					<a 
						href="/projects" 
						class="block px-3 py-2 text-base font-medium text-primary-700 hover:text-accent-600 hover:bg-primary-50 rounded-md
						{$page.url.pathname.startsWith('/projects') ? 'text-accent-600 bg-accent-50' : ''}"
					>
						프로젝트
					</a>
					<a 
						href="/snippets" 
						class="block px-3 py-2 text-base font-medium text-primary-700 hover:text-accent-600 hover:bg-primary-50 rounded-md
						{$page.url.pathname.startsWith('/snippets') ? 'text-accent-600 bg-accent-50' : ''}"
					>
						코드 스니펫
					</a>
					{#if dev}
						<a 
							href="/dev/dummy-users" 
							class="block px-3 py-2 text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md border border-red-200
							{$page.url.pathname.startsWith('/dev/dummy-users') ? 'text-red-800 bg-red-50 border-red-300' : ''}"
						>
							🔧 개발자 도구
						</a>
					{/if}
				</div>
				
				<!-- Mobile User Menu -->
				<div class="mt-4 pt-4 border-t border-primary-200">
					{#if isAuth && currentUser}
						<div class="flex items-center space-x-3 px-3 py-2">
							{#if currentUser.user_metadata?.avatar_url}
								<img 
									src={currentUser.user_metadata.avatar_url} 
									alt="프로필" 
									class="w-10 h-10 rounded-full border-2 border-gray-200"
								/>
							{:else}
								<div class="w-10 h-10 bg-primary-300 rounded-full flex items-center justify-center">
									<svg class="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
								</div>
							{/if}
							<div>
								<div class="text-base font-medium text-primary-900">
									{currentUser.user_metadata?.full_name || '사용자'}
								</div>
								<div class="text-sm text-primary-500">
									{currentUser.email}
								</div>
							</div>
						</div>
						<div class="mt-3 space-y-1">
							<button 
								onclick={handleWriteClick}
								class="flex items-center w-full text-left px-3 py-2 text-base font-medium text-primary-700 hover:text-accent-600 hover:bg-primary-50 rounded-md"
							>
								<div class="w-5 h-5 mr-2 pointer-events-none">
									{@html PencilSquareIcon}
								</div>
								글쓰기
							</button>
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
							class="block w-full text-center bg-accent-600 text-white px-4 py-2 rounded-md text-base font-medium hover:bg-accent-700 transition-colors"
						>
							로그인
						</a>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</header>

<!-- Profile Setup Modal -->
<Modal 
	open={showProfileModal} 
	onClose={() => showProfileModal = false}
	title="프로필 설정 필요"
>
	{#snippet children()}
		<div class="text-center">
			<div class="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 mb-4">
				<svg class="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
				</svg>
			</div>
			<p class="text-gray-700 mb-6">
				글을 작성하기 전에 먼저 사용자명을 설정해주세요.
			</p>
			<div class="flex flex-col sm:flex-row gap-3 justify-center">
				<button
					onclick={handleProfileSetup}
					class="bg-accent-600 text-white px-6 py-2 rounded-md hover:bg-accent-700 transition-colors"
				>
					설정하러 이동하기
				</button>
				<button
					onclick={() => showProfileModal = false}
					class="bg-primary-200 text-primary-700 px-6 py-2 rounded-md hover:bg-primary-300 transition-colors"
				>
					나중에
				</button>
			</div>
		</div>
	{/snippet}
</Modal>