<script lang="ts">
	import { enhance } from '$app/forms'
	import { invalidateAll, goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { onMount } from 'svelte'
	
	// Heroicons imports
	import UserIcon from 'heroicons/24/outline/user.svg?raw'
	import BriefcaseIcon from 'heroicons/24/outline/briefcase.svg?raw'
	import LinkIcon from 'heroicons/24/outline/link.svg?raw'
	import AcademicCapIcon from 'heroicons/24/outline/academic-cap.svg?raw'
	import CogIcon from 'heroicons/24/outline/cog-6-tooth.svg?raw'
	import BellIcon from 'heroicons/24/outline/bell.svg?raw'
	import CheckCircleIcon from 'heroicons/24/solid/check-circle.svg?raw'
	import XCircleIcon from 'heroicons/24/outline/x-circle.svg?raw'
	import ExclamationTriangleIcon from 'heroicons/24/solid/exclamation-triangle.svg?raw'
	import ShieldCheckIcon from 'heroicons/24/solid/shield-check.svg?raw'
	import InformationCircleIcon from 'heroicons/24/solid/information-circle.svg?raw'
	import LockClosedIcon from 'heroicons/24/solid/lock-closed.svg?raw'
	import DocumentArrowDownIcon from 'heroicons/24/outline/document-arrow-down.svg?raw'
	import ShareIcon from 'heroicons/24/outline/share.svg?raw'
	
	let { data } = $props()
	
	let loading = $state(false)
	let message = $state('')
	let messageType = $state<'success' | 'error'>('success')
	let usernameCheckLoading = $state(false)
	let usernameAvailable = $state<boolean | null>(null)
	let usernameError = $state('')
	let avatarUploading = $state(false)
	let avatarPreview = $state(data.profile?.avatar_url || '')
	let highlightUsername = $state(false)
	let redirectTo = $state<string | null>(null)
	
	// Form data - use $state for reactivity in Svelte 5
	let formData = $state({
		username: data.profile?.username || '',
		full_name: data.profile?.full_name || '',
		bio: data.profile?.bio || '',
		website: data.profile?.website || '',
		location: data.profile?.location || '',
		github_username: data.profile?.github_username || '',
		twitter_username: data.profile?.twitter_username || ''
	})
	
	// Debounced username check
	let usernameTimeout: NodeJS.Timeout
	
	// Profile completion calculation
	let profileCompletionPercentage = $derived(() => {
		let completed = 0
		let total = 6
		
		// Required fields (higher weight)
		if (formData.username) completed++
		if (formData.full_name && formData.full_name.length >= 2) completed += 2 // 이름은 더 높은 가중치
		
		// Optional fields
		if (formData.bio) completed++
		if (formData.website || formData.github_username || formData.twitter_username) completed++
		if (avatarPreview) completed++
		if (formData.location) completed++
		
		return Math.min((completed / total) * 100, 100)
	})
	
	onMount(() => {
		// Check URL parameters
		const urlParams = new URLSearchParams($page.url.search)
		const setup = urlParams.get('setup')
		const highlight = urlParams.get('highlight')
		redirectTo = urlParams.get('from')
		
		if (setup === 'true' && highlight === 'username') {
			highlightUsername = true
			// Remove highlight after animation
			setTimeout(() => {
				highlightUsername = false
			}, 3000)
		}
	})
	
	async function checkUsername(username: string) {
		if (!username || username === data.profile?.username) {
			usernameAvailable = null
			usernameError = ''
			return
		}
		
		usernameCheckLoading = true
		
		try {
			const response = await fetch('/api/profile/check-username', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ username })
			})
			
			const result = await response.json()
			usernameAvailable = result.available
			usernameError = result.error || ''
		} catch (error) {
			console.error('Username check failed:', error)
			usernameError = 'Failed to check username availability'
		} finally {
			usernameCheckLoading = false
		}
	}
	
	function onUsernameChange(event: Event) {
		const target = event.target as HTMLInputElement
		formData.username = target.value
		
		clearTimeout(usernameTimeout)
		usernameTimeout = setTimeout(() => {
			checkUsername(target.value)
		}, 500)
	}
	
	async function uploadAvatar(event: Event) {
		const target = event.target as HTMLInputElement
		const file = target.files?.[0]
		
		if (!file) return
		
		avatarUploading = true
		
		try {
			const formData = new FormData()
			formData.append('avatar', file)
			
			const response = await fetch('/api/profile/upload-avatar', {
				method: 'POST',
				body: formData
			})
			
			const result = await response.json()
			
			if (response.ok) {
				avatarPreview = result.avatar_url
				message = '프로필 이미지가 성공적으로 업로드되었습니다!'
				messageType = 'success'
				await invalidateAll()
			} else {
				message = result.error || '이미지 업로드에 실패했습니다.'
				messageType = 'error'
			}
		} catch (error) {
			console.error('Avatar upload failed:', error)
			message = '이미지 업로드 중 오류가 발생했습니다.'
			messageType = 'error'
		} finally {
			avatarUploading = false
		}
	}

	async function updateProfile() {
		loading = true
		message = ''
		
		try {
			const response = await fetch('/api/profile', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			})
			
			const result = await response.json()
			
			if (response.ok) {
				message = '프로필이 성공적으로 업데이트되었습니다!'
				messageType = 'success'
				await invalidateAll()
				
				// Redirect if there's a return URL
				if (redirectTo) {
					setTimeout(() => {
						goto(redirectTo)
					}, 1000)
				}
			} else {
				message = result.error || '프로필 업데이트에 실패했습니다.'
				messageType = 'error'
			}
		} catch (error) {
			console.error('Profile update failed:', error)
			message = '프로필 업데이트 중 오류가 발생했습니다.'
			messageType = 'error'
		} finally {
			loading = false
		}
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
							<a href="/profile" class="border-blue-500 text-blue-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
								기본 정보
							</a>
							<a href="/profile/career" class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
								커리어
							</a>
							<a href="/profile/social" class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
								소셜 링크
							</a>
							<a href="/profile/credentials" class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
								이력 및 학력
							</a>
							<a href="/profile/account" class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
								계정 설정
							</a>
							<a href="/profile/notifications" class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
								알림 설정
							</a>
						</nav>
					</div>
				</div>
				
				<!-- Desktop Sidebar Navigation -->
				<div class="hidden lg:block">
					<nav class="space-y-1">
						<a href="/profile" class="bg-blue-50 text-blue-700 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
							<div class="text-blue-500 mr-3 h-5 w-5">
								{@html UserIcon}
							</div>
							기본 정보
						</a>
						<a href="/profile/career" class="text-gray-900 hover:bg-gray-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
							<div class="text-gray-400 mr-3 h-5 w-5">
								{@html BriefcaseIcon}
							</div>
							커리어
						</a>
						<a href="/profile/social" class="text-gray-900 hover:bg-gray-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
							<div class="text-gray-400 mr-3 h-5 w-5">
								{@html LinkIcon}
							</div>
							소셜 링크
						</a>
						<a href="/profile/credentials" class="text-gray-900 hover:bg-gray-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
							<div class="text-gray-400 mr-3 h-5 w-5">
								{@html AcademicCapIcon}
							</div>
							이력 및 학력
						</a>
						<a href="/profile/account" class="text-gray-900 hover:bg-gray-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
							<div class="text-gray-400 mr-3 h-5 w-5">
								{@html CogIcon}
							</div>
							계정 설정
						</a>
						<a href="/profile/notifications" class="text-gray-900 hover:bg-gray-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
							<div class="text-gray-400 mr-3 h-5 w-5">
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
					<div class="px-6 py-4 border-b border-gray-200">
						<h2 class="text-xl font-semibold text-gray-900">기본 정보</h2>
						<p class="mt-1 text-sm text-gray-600">
							프로필의 기본 정보를 제공해 주세요.
						</p>
					</div>
					
					<form onsubmit={(e) => { e.preventDefault(); updateProfile(); }} class="px-6 py-6 space-y-6">
				{#if message}
					<div class="rounded-md p-4 {messageType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}">
						{message}
					</div>
				{/if}
				
				<!-- Avatar Upload -->
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">
						프로필 이미지
					</label>
					<div class="flex items-center space-x-6">
						<div class="shrink-0">
							{#if avatarPreview}
								<img 
									src={avatarPreview} 
									alt="프로필 이미지" 
									class="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
								/>
							{:else}
								<div class="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
									<div class="h-8 w-8 text-gray-400">
										{@html UserIcon}
									</div>
								</div>
							{/if}
						</div>
						<div>
							<label for="avatar-upload" class="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
								{#if avatarUploading}
									<div class="flex items-center">
										<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
										업로드 중...
									</div>
								{:else}
									이미지 변경
								{/if}
							</label>
							<input 
								id="avatar-upload" 
								type="file" 
								accept="image/*" 
								class="sr-only" 
								onchange={uploadAvatar}
								disabled={avatarUploading}
							/>
							<p class="mt-1 text-xs text-gray-500">
								JPG, PNG, WebP, GIF 파일만 가능 (최대 5MB)
							</p>
						</div>
					</div>
				</div>
				
				<!-- Username -->
				<div class:highlight-field={highlightUsername}>
					<label for="username" class="block text-sm font-medium text-gray-700">
						사용자명 * {#if highlightUsername}<span class="text-blue-600 text-xs ml-2">← 여기에 사용자명을 입력하세요</span>{/if}
					</label>
					<div class="mt-1 relative">
						<input
							type="text"
							id="username"
							bind:value={formData.username}
							oninput={onUsernameChange}
							onfocus={() => highlightUsername = false}
							class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
							class:highlight-input={highlightUsername}
							placeholder="사용자명을 입력하세요"
							required
						/>
						{#if usernameCheckLoading}
							<div class="absolute inset-y-0 right-0 pr-3 flex items-center">
								<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
							</div>
						{/if}
					</div>
					{#if usernameError}
						<p class="mt-1 text-sm text-red-600">{usernameError}</p>
					{:else if usernameAvailable === true}
						<p class="mt-1 text-sm text-green-600">✓ 사용 가능한 사용자명입니다</p>
					{/if}
				</div>
				
				<!-- Full Name -->
				<div>
					<label for="full_name" class="block text-sm font-medium text-gray-700">
						이름 *
						{#if data.profile?.full_name}
							<span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
								<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
								</svg>
								설정 완료
							</span>
						{/if}
						{#if data.isAdmin && data.profile?.full_name}
							<span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
								<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
								</svg>
								관리자 권한
							</span>
						{/if}
					</label>
					<div class="mt-1 relative">
						<input
							type="text"
							id="full_name"
							bind:value={formData.full_name}
							class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 {data.profile?.full_name && !data.isAdmin ? 'bg-gray-50 text-gray-600' : ''}"
							placeholder={data.profile?.full_name && !data.isAdmin ? '이름이 설정되어 변경할 수 없습니다' : '커뮤니티에서 사용될 이름을 입력하세요'}
							required
							minlength="2"
							maxlength="20"
							pattern="^[가-힣a-zA-Z0-9\s]+$"
							disabled={!!data.profile?.full_name && !data.isAdmin}
							readonly={!!data.profile?.full_name && !data.isAdmin}
						/>
						{#if !data.profile?.full_name || data.isAdmin}
							<div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
								<span class="text-sm text-gray-500">
									{formData.full_name.length}/20
								</span>
							</div>
						{:else}
							<div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
								<svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
								</svg>
							</div>
						{/if}
					</div>
					
					{#if data.profile?.full_name && !data.isAdmin}
						<div class="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
							<div class="flex">
								<div class="flex-shrink-0">
									<svg class="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
									</svg>
								</div>
								<div class="ml-3">
									<p class="text-sm text-amber-800">
										<strong>이름 변경 불가 안내</strong><br>
										이름은 커뮤니티 내에서 사용자를 식별하는 중요한 정보로, 한 번 설정하면 변경할 수 없습니다. 
										신중하게 선택해 주세요.
									</p>
								</div>
							</div>
						</div>
					{:else if data.profile?.full_name && data.isAdmin}
						<div class="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-md">
							<div class="flex">
								<div class="flex-shrink-0">
									<svg class="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
									</svg>
								</div>
								<div class="ml-3">
									<p class="text-sm text-purple-800">
										<strong>관리자 권한 안내</strong><br>
										관리자 권한으로 이름을 변경할 수 있습니다. 사용자 지원이나 정책상 필요한 경우에만 사용해 주세요.
									</p>
								</div>
							</div>
						</div>
					{:else}
						<p class="mt-1 text-sm text-gray-500">
							다른 사용자들에게 표시될 이름입니다. 한글, 영문, 숫자만 사용 가능합니다. (2-20자)
						</p>
						<div class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
							<div class="flex">
								<div class="flex-shrink-0">
									<svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
									</svg>
								</div>
								<div class="ml-3">
									<p class="text-sm text-blue-800">
										<strong>중요:</strong> 이름은 한 번 설정하면 변경할 수 없습니다. 
										신중하게 입력해 주세요.
									</p>
								</div>
							</div>
						</div>
						
						{#if formData.full_name.length > 0 && formData.full_name.length < 2}
							<p class="mt-1 text-sm text-red-600">이름은 최소 2자 이상 입력해주세요.</p>
						{/if}
						{#if formData.full_name.length > 20}
							<p class="mt-1 text-sm text-red-600">이름은 최대 20자까지 입력 가능합니다.</p>
						{/if}
						{#if formData.full_name && !/^[가-힣a-zA-Z0-9\s]+$/.test(formData.full_name)}
							<p class="mt-1 text-sm text-red-600">한글, 영문, 숫자만 사용할 수 있습니다.</p>
						{/if}
					{/if}
				</div>
				
				<!-- Bio -->
				<div>
					<div class="flex justify-between items-center mb-1">
						<label for="bio" class="block text-sm font-medium text-gray-700">
							자기소개
						</label>
						<span class="text-sm text-gray-500">
							{formData.bio.length}/500
						</span>
					</div>
					<textarea
						id="bio"
						bind:value={formData.bio}
						rows="4"
						maxlength="500"
						class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
						placeholder="자신을 소개해주세요"
					></textarea>
					<p class="mt-1 text-sm text-gray-500">
						한 줄 소개를 입력해주세요. 최대 500자까지 입력할 수 있습니다.
					</p>
				</div>
				
				<!-- Website -->
				<div>
					<label for="website" class="block text-sm font-medium text-gray-700">
						웹사이트
					</label>
					<input
						type="url"
						id="website"
						bind:value={formData.website}
						class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
						placeholder="https://example.com"
					/>
				</div>
				
				<!-- Location -->
				<div>
					<label for="location" class="block text-sm font-medium text-gray-700">
						위치
					</label>
					<input
						type="text"
						id="location"
						bind:value={formData.location}
						class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
						placeholder="서울, 대한민국"
					/>
				</div>
				
				<!-- GitHub Username -->
				<div>
					<label for="github_username" class="block text-sm font-medium text-gray-700">
						GitHub 사용자명
					</label>
					<input
						type="text"
						id="github_username"
						bind:value={formData.github_username}
						class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
						placeholder="github_username"
					/>
				</div>
				
				<!-- Twitter Username -->
				<div>
					<label for="twitter_username" class="block text-sm font-medium text-gray-700">
						Twitter 사용자명
					</label>
					<input
						type="text"
						id="twitter_username"
						bind:value={formData.twitter_username}
						class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
						placeholder="twitter_username"
					/>
				</div>
				
				<!-- Submit Button -->
				<div class="flex justify-end space-x-3">
					<a
						href="/"
						class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					>
						취소
					</a>
					<button
						type="submit"
						disabled={loading || usernameCheckLoading || (usernameAvailable === false) || ((data.isAdmin || !data.profile?.full_name) && (!formData.full_name || formData.full_name.length < 2 || !/^[가-힣a-zA-Z0-9\s]+$/.test(formData.full_name)))}
						class="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{#if loading}
							<div class="flex items-center">
								<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
								저장 중...
							</div>
						{:else}
							저장하기
						{/if}
					</button>
					</form>
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
									{#if formData.username}
										<svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
										</svg>
									{:else}
										<svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
										</svg>
									{/if}
								</div>
								<span class="text-sm font-medium {formData.username ? 'text-gray-900' : 'text-gray-500'}">
									기본 정보
								</span>
							</div>
							
							<div class="flex items-center">
								<div class="flex-shrink-0 w-5 h-5 mr-3">
									{#if formData.full_name && formData.bio}
										<svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
										</svg>
									{:else}
										<svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
										</svg>
									{/if}
								</div>
								<span class="text-sm font-medium {formData.full_name && formData.bio ? 'text-gray-900' : 'text-gray-500'}">
									개인 정보
								</span>
							</div>
							
							<div class="flex items-center">
								<div class="flex-shrink-0 w-5 h-5 mr-3">
									{#if formData.website || formData.github_username || formData.twitter_username}
										<svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
										</svg>
									{:else}
										<svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
										</svg>
									{/if}
								</div>
								<span class="text-sm font-medium {formData.website || formData.github_username || formData.twitter_username ? 'text-gray-900' : 'text-gray-500'}">
									링크
								</span>
							</div>
							
							<div class="flex items-center">
								<div class="flex-shrink-0 w-5 h-5 mr-3">
									{#if avatarPreview}
										<svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
										</svg>
									{:else}
										<svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
										</svg>
									{/if}
								</div>
								<span class="text-sm font-medium {avatarPreview ? 'text-gray-900' : 'text-gray-500'}">
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

<style>
	@keyframes highlight {
		0% {
			background-color: rgba(250, 204, 21, 0);
		}
		50% {
			background-color: rgba(250, 204, 21, 0.3);
		}
		100% {
			background-color: rgba(250, 204, 21, 0);
		}
	}
	
	:global(.highlight-field) {
		animation: highlight 1.5s ease-in-out infinite;
		padding: 0.5rem;
		margin: -0.5rem;
		border-radius: 0.375rem;
	}
	
	:global(.highlight-input) {
		box-shadow: 0 0 0 3px rgba(250, 204, 21, 0.3);
		border-color: rgb(250, 204, 21);
	}
</style>