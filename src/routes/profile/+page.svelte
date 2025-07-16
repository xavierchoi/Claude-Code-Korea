<script lang="ts">
	import { enhance } from '$app/forms'
	import { invalidateAll, goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { onMount } from 'svelte'
	
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

<div class="min-h-screen bg-gray-50 py-12">
	<div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="bg-white shadow rounded-lg">
			<div class="px-6 py-4 border-b border-gray-200">
				<h1 class="text-2xl font-bold text-gray-900">프로필 설정</h1>
				<p class="mt-1 text-sm text-gray-600">
					다른 사용자들에게 보여질 프로필 정보를 설정하세요.
				</p>
			</div>
			
			<form onsubmit={(e) => { e.preventDefault(); updateProfile(); }} class="px-6 py-4 space-y-6">
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
									<svg class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
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
						이름
					</label>
					<input
						type="text"
						id="full_name"
						bind:value={formData.full_name}
						class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
						placeholder="실명을 입력하세요"
					/>
				</div>
				
				<!-- Bio -->
				<div>
					<label for="bio" class="block text-sm font-medium text-gray-700">
						자기소개
					</label>
					<textarea
						id="bio"
						bind:value={formData.bio}
						rows="3"
						class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
						placeholder="자신을 소개해주세요"
					></textarea>
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
						disabled={loading || usernameCheckLoading || (usernameAvailable === false)}
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
				</div>
			</form>
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