<script lang="ts">
	import { page } from '$app/stores'
	
	let { children, title, description, data } = $props()
	
	// Profile completion calculation
	let profileCompletionPercentage = $derived(() => {
		let completed = 0
		let total = 6
		
		// Required fields (higher weight)
		if (data?.profile?.username) completed++
		if (data?.profile?.full_name && data?.profile?.full_name.length >= 2) completed += 2 // 이름은 더 높은 가중치
		
		// Optional fields
		if (data?.profile?.bio) completed++
		if (data?.profile?.website || data?.profile?.github_username || data?.profile?.twitter_username) completed++
		if (data?.profile?.avatar_url) completed++
		if (data?.profile?.location) completed++
		
		return Math.min((completed / total) * 100, 100)
	})
	
	// Navigation active state
	let currentPath = $derived($page.url.pathname)
	
	function isActive(path: string) {
		return currentPath === path
	}
</script>

<div class="min-h-screen bg-gray-50">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900">프로필 관리</h1>
			<p class="mt-2 text-gray-600">
				다른 사용자들에게 보여질 프로필 정보를 설정하세요.
			</p>
		</div>
		
		<div class="lg:grid lg:grid-cols-12 lg:gap-x-8">
			<!-- Left Sidebar Navigation -->
			<div class="lg:col-span-3 mb-8 lg:mb-0">
				<!-- Mobile Tab Navigation -->
				<div class="lg:hidden">
					<div class="border-b border-gray-200 mb-8">
						<nav class="-mb-px flex space-x-6 overflow-x-auto">
							<a href="/profile" class="{isActive('/profile') ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
								기본 정보
							</a>
							<a href="/profile/career" class="{isActive('/profile/career') ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
								커리어
							</a>
							<a href="/profile/social" class="{isActive('/profile/social') ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
								소셜 링크
							</a>
							<a href="/profile/credentials" class="{isActive('/profile/credentials') ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
								이력 및 학력
							</a>
							<a href="/profile/account" class="{isActive('/profile/account') ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
								계정 설정
							</a>
							<a href="/profile/notifications" class="{isActive('/profile/notifications') ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
								알림 설정
							</a>
						</nav>
					</div>
				</div>
				
				<!-- Desktop Sidebar Navigation -->
				<div class="hidden lg:block">
					<nav class="space-y-1">
						<a href="/profile" class="{isActive('/profile') ? 'bg-blue-50 text-blue-700' : 'text-gray-900 hover:bg-gray-50'} group flex items-center px-3 py-2 text-sm font-medium rounded-md">
							<svg class="{isActive('/profile') ? 'text-blue-500' : 'text-gray-400'} mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
							기본 정보
						</a>
						<a href="/profile/career" class="{isActive('/profile/career') ? 'bg-blue-50 text-blue-700' : 'text-gray-900 hover:bg-gray-50'} group flex items-center px-3 py-2 text-sm font-medium rounded-md">
							<svg class="{isActive('/profile/career') ? 'text-blue-500' : 'text-gray-400'} mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6" />
							</svg>
							커리어
						</a>
						<a href="/profile/social" class="{isActive('/profile/social') ? 'bg-blue-50 text-blue-700' : 'text-gray-900 hover:bg-gray-50'} group flex items-center px-3 py-2 text-sm font-medium rounded-md">
							<svg class="{isActive('/profile/social') ? 'text-blue-500' : 'text-gray-400'} mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
							</svg>
							소셜 링크
						</a>
						<a href="/profile/credentials" class="{isActive('/profile/credentials') ? 'bg-blue-50 text-blue-700' : 'text-gray-900 hover:bg-gray-50'} group flex items-center px-3 py-2 text-sm font-medium rounded-md">
							<svg class="{isActive('/profile/credentials') ? 'text-blue-500' : 'text-gray-400'} mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
							</svg>
							이력 및 학력
						</a>
						<a href="/profile/account" class="{isActive('/profile/account') ? 'bg-blue-50 text-blue-700' : 'text-gray-900 hover:bg-gray-50'} group flex items-center px-3 py-2 text-sm font-medium rounded-md">
							<svg class="{isActive('/profile/account') ? 'text-blue-500' : 'text-gray-400'} mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
							계정 설정
						</a>
						<a href="/profile/notifications" class="{isActive('/profile/notifications') ? 'bg-blue-50 text-blue-700' : 'text-gray-900 hover:bg-gray-50'} group flex items-center px-3 py-2 text-sm font-medium rounded-md">
							<svg class="{isActive('/profile/notifications') ? 'text-blue-500' : 'text-gray-400'} mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.868 19.462A17.937 17.937 0 0112 21a17.937 17.937 0 017.132-1.538M6.16 6.16a9 9 0 1011.68 11.68M6.16 6.16L4.16 4.16m2 2L8.16 8.16" />
							</svg>
							알림 설정
						</a>
					</nav>
				</div>
			</div>
			
			<!-- Main Content -->
			<div class="lg:col-span-6">
				<div class="bg-white shadow rounded-lg">
					<div class="px-6 py-4 border-b border-gray-200">
						<h2 class="text-xl font-semibold text-gray-900">{title}</h2>
						<p class="mt-1 text-sm text-gray-600">
							{description}
						</p>
					</div>
					
					<div class="px-6 py-6">
						{@render children()}
					</div>
				</div>
			</div>
			
			<!-- Right Sidebar -->
			<div class="lg:col-span-3 mt-8 lg:mt-0">
				<div class="space-y-6">
					<!-- Profile Completion -->
					<div class="bg-white shadow rounded-lg p-6">
						<div class="flex items-center justify-between mb-4">
							<h3 class="text-lg font-semibold text-gray-900">프로필 완성도</h3>
							<span class="text-2xl font-bold text-gray-900">{Math.round(profileCompletionPercentage())}%</span>
						</div>
						
						<div class="w-full bg-gray-200 rounded-full h-2 mb-4">
							<div 
								class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
								style="width: {profileCompletionPercentage()}%"
							></div>
						</div>
						
						<p class="text-sm text-gray-600 mb-6">
							프로필 완성도가 높을수록 다른 사용자들에게 더 많은 정보를 제공할 수 있습니다.
						</p>
						
						<div class="space-y-3">
							<div class="flex items-center">
								<div class="flex-shrink-0 w-5 h-5 mr-3">
									{#if data?.profile?.username}
										<svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
										</svg>
									{:else}
										<svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
										</svg>
									{/if}
								</div>
								<span class="text-sm font-medium {data?.profile?.username ? 'text-gray-900' : 'text-gray-500'}">
									기본 정보
								</span>
							</div>
							
							<div class="flex items-center">
								<div class="flex-shrink-0 w-5 h-5 mr-3">
									{#if data?.profile?.full_name && data?.profile?.full_name.length >= 2}
										<svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
										</svg>
									{:else}
										<svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
										</svg>
									{/if}
								</div>
								<span class="text-sm font-medium {data?.profile?.full_name && data?.profile?.full_name.length >= 2 ? 'text-gray-900' : 'text-gray-500'}">
									이름 (필수)
								</span>
							</div>
							
							<div class="flex items-center">
								<div class="flex-shrink-0 w-5 h-5 mr-3">
									{#if data?.profile?.bio}
										<svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
										</svg>
									{:else}
										<svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
										</svg>
									{/if}
								</div>
								<span class="text-sm font-medium {data?.profile?.bio ? 'text-gray-900' : 'text-gray-500'}">
									자기소개
								</span>
							</div>
							
							<div class="flex items-center">
								<div class="flex-shrink-0 w-5 h-5 mr-3">
									{#if data?.profile?.website || data?.profile?.github_username || data?.profile?.twitter_username}
										<svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
										</svg>
									{:else}
										<svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
										</svg>
									{/if}
								</div>
								<span class="text-sm font-medium {data?.profile?.website || data?.profile?.github_username || data?.profile?.twitter_username ? 'text-gray-900' : 'text-gray-500'}">
									링크
								</span>
							</div>
							
							<div class="flex items-center">
								<div class="flex-shrink-0 w-5 h-5 mr-3">
									{#if data?.profile?.avatar_url}
										<svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
										</svg>
									{:else}
										<svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
										</svg>
									{/if}
								</div>
								<span class="text-sm font-medium {data?.profile?.avatar_url ? 'text-gray-900' : 'text-gray-500'}">
									프로필 사진
								</span>
							</div>
						</div>
					</div>
					
					<!-- Additional Tools -->
					<div class="bg-white shadow rounded-lg p-6">
						<h3 class="text-lg font-semibold text-gray-900 mb-4">추가 도구</h3>
						<div class="space-y-3">
							<button class="w-full bg-gray-900 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">
								<svg class="w-4 h-4 mr-2 inline-block" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clip-rule="evenodd" />
								</svg>
								이력서 PDF 다운로드
							</button>
							<button class="w-full bg-white text-gray-700 py-2 px-4 rounded-md text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors">
								<svg class="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
								</svg>
								프로필 공유
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>