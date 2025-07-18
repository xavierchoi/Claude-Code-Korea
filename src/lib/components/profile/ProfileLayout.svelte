<script lang="ts">
	import { page } from '$app/stores'
	
	// Heroicons imports
	import UserIcon from 'heroicons/24/outline/user.svg?raw'
	import BriefcaseIcon from 'heroicons/24/outline/briefcase.svg?raw'
	import LinkIcon from 'heroicons/24/outline/link.svg?raw'
	import AcademicCapIcon from 'heroicons/24/outline/academic-cap.svg?raw'
	import CogIcon from 'heroicons/24/outline/cog-6-tooth.svg?raw'
	import BellIcon from 'heroicons/24/outline/bell.svg?raw'
	import CheckCircleIcon from 'heroicons/24/solid/check-circle.svg?raw'
	import XCircleIcon from 'heroicons/24/outline/x-circle.svg?raw'
	import DocumentArrowDownIcon from 'heroicons/24/outline/document-arrow-down.svg?raw'
	import ShareIcon from 'heroicons/24/outline/share.svg?raw'
	
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
							<div class="{isActive('/profile') ? 'text-blue-500' : 'text-gray-400'} mr-3 h-5 w-5">
								{@html UserIcon}
							</div>
							기본 정보
						</a>
						<a href="/profile/career" class="{isActive('/profile/career') ? 'bg-blue-50 text-blue-700' : 'text-gray-900 hover:bg-gray-50'} group flex items-center px-3 py-2 text-sm font-medium rounded-md">
							<div class="{isActive('/profile/career') ? 'text-blue-500' : 'text-gray-400'} mr-3 h-5 w-5">
								{@html BriefcaseIcon}
							</div>
							커리어
						</a>
						<a href="/profile/social" class="{isActive('/profile/social') ? 'bg-blue-50 text-blue-700' : 'text-gray-900 hover:bg-gray-50'} group flex items-center px-3 py-2 text-sm font-medium rounded-md">
							<div class="{isActive('/profile/social') ? 'text-blue-500' : 'text-gray-400'} mr-3 h-5 w-5">
								{@html LinkIcon}
							</div>
							소셜 링크
						</a>
						<a href="/profile/credentials" class="{isActive('/profile/credentials') ? 'bg-blue-50 text-blue-700' : 'text-gray-900 hover:bg-gray-50'} group flex items-center px-3 py-2 text-sm font-medium rounded-md">
							<div class="{isActive('/profile/credentials') ? 'text-blue-500' : 'text-gray-400'} mr-3 h-5 w-5">
								{@html AcademicCapIcon}
							</div>
							이력 및 학력
						</a>
						<a href="/profile/account" class="{isActive('/profile/account') ? 'bg-blue-50 text-blue-700' : 'text-gray-900 hover:bg-gray-50'} group flex items-center px-3 py-2 text-sm font-medium rounded-md">
							<div class="{isActive('/profile/account') ? 'text-blue-500' : 'text-gray-400'} mr-3 h-5 w-5">
								{@html CogIcon}
							</div>
							계정 설정
						</a>
						<a href="/profile/notifications" class="{isActive('/profile/notifications') ? 'bg-blue-50 text-blue-700' : 'text-gray-900 hover:bg-gray-50'} group flex items-center px-3 py-2 text-sm font-medium rounded-md">
							<div class="{isActive('/profile/notifications') ? 'text-blue-500' : 'text-gray-400'} mr-3 h-5 w-5">
								{@html BellIcon}
							</div>
							알림 설정
						</a>
					</nav>
				</div>
			</div>
			
			<!-- Main Content -->
			<div class="lg:col-span-6">
				<div class="bg-white shadow rounded-lg">
					<div class="px-6 py-4 border-b border-primary-200">
						<h2 class="text-xl font-semibold text-primary-900">{title}</h2>
						<p class="mt-1 text-sm text-primary-600">
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
							<h3 class="text-lg font-semibold text-primary-900">프로필 완성도</h3>
							<span class="text-2xl font-bold text-primary-900">{Math.round(profileCompletionPercentage())}%</span>
						</div>
						
						<div class="w-full bg-primary-200 rounded-full h-2 mb-4">
							<div 
								class="bg-accent-600 h-2 rounded-full transition-all duration-300" 
								style="width: {profileCompletionPercentage()}%"
							></div>
						</div>
						
						<p class="text-sm text-primary-600 mb-6">
							프로필 완성도가 높을수록 다른 사용자들에게 더 많은 정보를 제공할 수 있습니다.
						</p>
						
						<div class="space-y-3">
							<div class="flex items-center">
								<div class="flex-shrink-0 w-5 h-5 mr-3">
									{#if data?.profile?.username}
										<div class="w-5 h-5 text-green-500">
											{@html CheckCircleIcon}
										</div>
									{:else}
										<div class="w-5 h-5 text-gray-400">
											{@html XCircleIcon}
										</div>
									{/if}
								</div>
								<span class="text-sm font-medium {data?.profile?.username ? 'text-gray-900' : 'text-gray-500'}">
									기본 정보
								</span>
							</div>
							
							<div class="flex items-center">
								<div class="flex-shrink-0 w-5 h-5 mr-3">
									{#if data?.profile?.full_name && data?.profile?.full_name.length >= 2}
										<div class="w-5 h-5 text-green-500">
											{@html CheckCircleIcon}
										</div>
									{:else}
										<div class="w-5 h-5 text-gray-400">
											{@html XCircleIcon}
										</div>
									{/if}
								</div>
								<span class="text-sm font-medium {data?.profile?.full_name && data?.profile?.full_name.length >= 2 ? 'text-gray-900' : 'text-gray-500'}">
									이름 (필수)
								</span>
							</div>
							
							<div class="flex items-center">
								<div class="flex-shrink-0 w-5 h-5 mr-3">
									{#if data?.profile?.bio}
										<div class="w-5 h-5 text-green-500">
											{@html CheckCircleIcon}
										</div>
									{:else}
										<div class="w-5 h-5 text-gray-400">
											{@html XCircleIcon}
										</div>
									{/if}
								</div>
								<span class="text-sm font-medium {data?.profile?.bio ? 'text-gray-900' : 'text-gray-500'}">
									자기소개
								</span>
							</div>
							
							<div class="flex items-center">
								<div class="flex-shrink-0 w-5 h-5 mr-3">
									{#if data?.profile?.website || data?.profile?.github_username || data?.profile?.twitter_username}
										<div class="w-5 h-5 text-green-500">
											{@html CheckCircleIcon}
										</div>
									{:else}
										<div class="w-5 h-5 text-gray-400">
											{@html XCircleIcon}
										</div>
									{/if}
								</div>
								<span class="text-sm font-medium {data?.profile?.website || data?.profile?.github_username || data?.profile?.twitter_username ? 'text-gray-900' : 'text-gray-500'}">
									링크
								</span>
							</div>
							
							<div class="flex items-center">
								<div class="flex-shrink-0 w-5 h-5 mr-3">
									{#if data?.profile?.avatar_url}
										<div class="w-5 h-5 text-green-500">
											{@html CheckCircleIcon}
										</div>
									{:else}
										<div class="w-5 h-5 text-gray-400">
											{@html XCircleIcon}
										</div>
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
						<h3 class="text-lg font-semibold text-primary-900 mb-4">추가 도구</h3>
						<div class="space-y-3">
							<button class="w-full bg-primary-900 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-primary-800 transition-colors">
								<div class="w-4 h-4 mr-2 inline-block">
									{@html DocumentArrowDownIcon}
								</div>
								이력서 PDF 다운로드
							</button>
							<button class="w-full bg-white text-primary-700 py-2 px-4 rounded-md text-sm font-medium border border-primary-300 hover:bg-primary-50 transition-colors">
								<div class="w-4 h-4 mr-2 inline-block">
									{@html ShareIcon}
								</div>
								프로필 공유
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>