<script lang="ts">
	import ProfileLayout from '$lib/components/profile/ProfileLayout.svelte'
	
	// Heroicons imports
	import GlobeAltIcon from 'heroicons/24/outline/globe-alt.svg?raw'
	import PencilIcon from 'heroicons/24/outline/pencil.svg?raw'
	import BriefcaseIcon from 'heroicons/24/outline/briefcase.svg?raw'
	
	let { data } = $props()
	
	let loading = $state(false)
	let message = $state('')
	let messageType = $state<'success' | 'error'>('success')
	
	// Form data
	let formData = $state({
		website: data.profile?.website || '',
		github_username: data.profile?.github_username || '',
		twitter_username: data.profile?.twitter_username || '',
		linkedin_url: data.profile?.linkedin_url || '',
		instagram_username: data.profile?.instagram_username || '',
		youtube_url: data.profile?.youtube_url || '',
		blog_url: data.profile?.blog_url || '',
		portfolio_url: data.profile?.portfolio_url || ''
	})
	
	async function updateSocial() {
		loading = true
		message = ''
		
		try {
			const response = await fetch('/api/profile/social', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			})
			
			const result = await response.json()
			
			if (response.ok) {
				message = '소셜 링크가 성공적으로 업데이트되었습니다!'
				messageType = 'success'
			} else {
				message = result.error || '소셜 링크 업데이트에 실패했습니다.'
				messageType = 'error'
			}
		} catch (error) {
			console.error('Social links update failed:', error)
			message = '소셜 링크 업데이트 중 오류가 발생했습니다.'
			messageType = 'error'
		} finally {
			loading = false
		}
	}
</script>

<ProfileLayout 
	title="소셜 링크"
	description="소셜 미디어 계정과 웹사이트 링크를 추가해주세요."
	{data}
>
	<form onsubmit={(e) => { e.preventDefault(); updateSocial(); }} class="space-y-6">
		{#if message}
			<div class="rounded-md p-4 {messageType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}">
				{message}
			</div>
		{/if}
		
		<!-- Website -->
		<div>
			<label for="website" class="block text-sm font-medium text-gray-700">
				<div class="flex items-center">
					<div class="w-5 h-5 mr-2 text-gray-400">
						{@html GlobeAltIcon}
					</div>
					웹사이트
				</div>
			</label>
			<input
				type="url"
				id="website"
				bind:value={formData.website}
				class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
				placeholder="https://example.com"
			/>
		</div>
		
		<!-- GitHub -->
		<div>
			<label for="github_username" class="block text-sm font-medium text-gray-700">
				<div class="flex items-center">
					<svg class="w-5 h-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
						<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
					</svg>
					GitHub 사용자명
				</div>
			</label>
			<div class="mt-1 flex rounded-md shadow-sm">
				<span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
					github.com/
				</span>
				<input
					type="text"
					id="github_username"
					bind:value={formData.github_username}
					class="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
					placeholder="username"
				/>
			</div>
		</div>
		
		<!-- Twitter -->
		<div>
			<label for="twitter_username" class="block text-sm font-medium text-gray-700">
				<div class="flex items-center">
					<svg class="w-5 h-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
						<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
					</svg>
					Twitter 사용자명
				</div>
			</label>
			<div class="mt-1 flex rounded-md shadow-sm">
				<span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
					@
				</span>
				<input
					type="text"
					id="twitter_username"
					bind:value={formData.twitter_username}
					class="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
					placeholder="username"
				/>
			</div>
		</div>
		
		<!-- LinkedIn -->
		<div>
			<label for="linkedin_url" class="block text-sm font-medium text-gray-700">
				<div class="flex items-center">
					<svg class="w-5 h-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
						<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
					</svg>
					LinkedIn 프로필
				</div>
			</label>
			<input
				type="url"
				id="linkedin_url"
				bind:value={formData.linkedin_url}
				class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
				placeholder="https://linkedin.com/in/username"
			/>
		</div>
		
		<!-- Instagram -->
		<div>
			<label for="instagram_username" class="block text-sm font-medium text-gray-700">
				<div class="flex items-center">
					<svg class="w-5 h-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
						<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
					</svg>
					Instagram 사용자명
				</div>
			</label>
			<div class="mt-1 flex rounded-md shadow-sm">
				<span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
					@
				</span>
				<input
					type="text"
					id="instagram_username"
					bind:value={formData.instagram_username}
					class="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
					placeholder="username"
				/>
			</div>
		</div>
		
		<!-- YouTube -->
		<div>
			<label for="youtube_url" class="block text-sm font-medium text-gray-700">
				<div class="flex items-center">
					<svg class="w-5 h-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
						<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
					</svg>
					YouTube 채널
				</div>
			</label>
			<input
				type="url"
				id="youtube_url"
				bind:value={formData.youtube_url}
				class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
				placeholder="https://youtube.com/channel/..."
			/>
		</div>
		
		<!-- Blog -->
		<div>
			<label for="blog_url" class="block text-sm font-medium text-gray-700">
				<div class="flex items-center">
					<div class="w-5 h-5 mr-2 text-gray-400">
						{@html PencilIcon}
					</div>
					블로그
				</div>
			</label>
			<input
				type="url"
				id="blog_url"
				bind:value={formData.blog_url}
				class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
				placeholder="https://blog.example.com"
			/>
		</div>
		
		<!-- Portfolio -->
		<div>
			<label for="portfolio_url" class="block text-sm font-medium text-gray-700">
				<div class="flex items-center">
					<div class="w-5 h-5 mr-2 text-gray-400">
						{@html BriefcaseIcon}
					</div>
					포트폴리오
				</div>
			</label>
			<input
				type="url"
				id="portfolio_url"
				bind:value={formData.portfolio_url}
				class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
				placeholder="https://portfolio.example.com"
			/>
		</div>
		
		<!-- Submit Button -->
		<div class="flex justify-end space-x-3">
			<a
				href="/profile"
				class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
			>
				취소
			</a>
			<button
				type="submit"
				disabled={loading}
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
</ProfileLayout>