<script lang="ts">
	import { onMount } from 'svelte'
	import { dev } from '$app/environment'

	let users = $state([])
	let loading = $state(false)
	let createLoading = $state(false)
	let message = $state('')
	let messageType = $state<'success' | 'error'>('success')
	
	// 새 사용자 생성 폼
	let newUser = $state({
		username: '',
		full_name: '',
		bio: ''
	})

	onMount(async () => {
		if (dev) {
			await loadDummyUsers()
		}
	})

	async function loadDummyUsers() {
		loading = true
		try {
			const response = await fetch('/api/dev/create-dummy-user')
			const data = await response.json()
			
			if (response.ok) {
				users = data.users
			} else {
				message = `${data.error || 'Failed to load dummy users'}${data.details ? ': ' + data.details : ''}`
				messageType = 'error'
			}
		} catch (error) {
			console.error('Load dummy users error:', error)
			message = 'Failed to load dummy users'
			messageType = 'error'
		} finally {
			loading = false
		}
	}

	async function createDummyUser() {
		if (!newUser.username || !newUser.full_name) {
			message = 'Username and full name are required'
			messageType = 'error'
			return
		}

		createLoading = true
		try {
			const response = await fetch('/api/dev/create-dummy-user', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(newUser)
			})

			const data = await response.json()
			
			if (response.ok) {
				message = 'Dummy user created successfully'
				messageType = 'success'
				newUser = { username: '', full_name: '', bio: '' }
				await loadDummyUsers()
			} else {
				message = data.error || 'Failed to create dummy user'
				messageType = 'error'
			}
		} catch (error) {
			console.error('Create dummy user error:', error)
			message = 'Failed to create dummy user'
			messageType = 'error'
		} finally {
			createLoading = false
		}
	}

	async function deleteDummyUser(userId: string) {
		if (!confirm('Are you sure you want to delete this dummy user?')) return

		try {
			const response = await fetch('/api/dev/create-dummy-user', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ user_id: userId })
			})

			const data = await response.json()
			
			if (response.ok) {
				message = 'Dummy user deleted successfully'
				messageType = 'success'
				await loadDummyUsers()
			} else {
				message = data.error || 'Failed to delete dummy user'
				messageType = 'error'
			}
		} catch (error) {
			console.error('Delete dummy user error:', error)
			message = 'Failed to delete dummy user'
			messageType = 'error'
		}
	}

	// 더미 사용자로 로그인하는 함수 (실제로는 그 사용자의 프로필을 보는 것)
	function viewDummyProfile(username: string) {
		window.open(`/users/${username}`, '_blank')
	}
</script>

<svelte:head>
	<title>개발자 도구 - 더미 사용자 관리</title>
</svelte:head>

{#if !dev}
	<div class="min-h-screen bg-gray-50 flex items-center justify-center">
		<div class="max-w-md w-full bg-white shadow rounded-lg p-6">
			<h1 class="text-2xl font-bold text-center text-gray-900 mb-4">접근 불가</h1>
			<p class="text-center text-gray-600">이 페이지는 개발 환경에서만 사용할 수 있습니다.</p>
			<div class="mt-6 text-center">
				<a href="/" class="text-blue-600 hover:text-blue-800">홈으로 돌아가기</a>
			</div>
		</div>
	</div>
{:else}
	<div class="min-h-screen bg-gray-50">
		<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div class="mb-8">
				<h1 class="text-3xl font-bold text-gray-900">개발자 도구</h1>
				<p class="mt-2 text-gray-600">팔로우 기능 테스트를 위한 더미 사용자 관리</p>
			</div>

			{#if message}
				<div class="mb-6 rounded-md p-4 {messageType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}">
					{message}
				</div>
			{/if}

			<!-- Authentication Constraint Notice -->
			<div class="mb-6 rounded-md p-4 bg-yellow-50 text-yellow-800 border border-yellow-200">
				<div class="flex items-center mb-2">
					<svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
					</svg>
					<h3 class="font-semibold">더미 사용자 생성 제한</h3>
				</div>
				<p class="text-sm">
					데이터베이스 제약 조건으로 인해 더미 사용자 생성이 불가능합니다. 
					팔로우 시스템을 테스트하려면 다른 브라우저나 시크릿 모드에서 새로운 계정을 생성해주세요.
				</p>
			</div>

			<!-- 새 더미 사용자 생성 -->
			<div class="bg-white shadow rounded-lg p-6 mb-8">
				<h2 class="text-xl font-semibold text-gray-900 mb-4">새 더미 사용자 생성</h2>
				
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="username" class="block text-sm font-medium text-gray-700 mb-1">사용자명</label>
						<input
							type="text"
							id="username"
							bind:value={newUser.username}
							class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
							placeholder="testuser1"
						/>
					</div>
					
					<div>
						<label for="full_name" class="block text-sm font-medium text-gray-700 mb-1">이름</label>
						<input
							type="text"
							id="full_name"
							bind:value={newUser.full_name}
							class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
							placeholder="테스트 사용자"
						/>
					</div>
					
					<div class="md:col-span-2">
						<label for="bio" class="block text-sm font-medium text-gray-700 mb-1">자기소개</label>
						<textarea
							id="bio"
							bind:value={newUser.bio}
							rows="3"
							class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
							placeholder="테스트용 더미 사용자입니다."
						></textarea>
					</div>
				</div>

				<div class="mt-4">
					<button
						onclick={createDummyUser}
						disabled={createLoading}
						class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{createLoading ? '생성 중...' : '더미 사용자 생성'}
					</button>
				</div>
			</div>

			<!-- 더미 사용자 목록 -->
			<div class="bg-white shadow rounded-lg">
				<div class="px-6 py-4 border-b border-gray-200">
					<h2 class="text-xl font-semibold text-gray-900">더미 사용자 목록</h2>
				</div>
				
				{#if loading}
					<div class="p-6 text-center">
						<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
						<p class="mt-2 text-gray-600">로딩 중...</p>
					</div>
				{:else if users.length === 0}
					<div class="p-6 text-center text-gray-500">
						생성된 더미 사용자가 없습니다.
					</div>
				{:else}
					<div class="divide-y divide-gray-200">
						{#each users as user}
							<div class="p-6 flex items-center justify-between">
								<div class="flex-1">
									<div class="flex items-center">
										<div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
											<span class="text-sm font-medium text-gray-600">
												{user.full_name.charAt(0)}
											</span>
										</div>
										<div class="ml-4">
											<h3 class="text-lg font-medium text-gray-900">{user.full_name}</h3>
											<p class="text-sm text-gray-600">@{user.username}</p>
											{#if user.bio}
												<p class="text-sm text-gray-500 mt-1">{user.bio}</p>
											{/if}
										</div>
									</div>
								</div>
								<div class="flex space-x-2">
									<button
										onclick={() => viewDummyProfile(user.username)}
										class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
									>
										프로필 보기
									</button>
									<button
										onclick={() => deleteDummyUser(user.id)}
										class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
									>
										삭제
									</button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- 사용법 안내 -->
			<div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
				<h3 class="text-lg font-semibold text-blue-900 mb-2">팔로우 시스템 테스트 방법</h3>
				<ul class="list-disc list-inside text-sm text-blue-800 space-y-1">
					<li><strong>다른 브라우저 사용:</strong> Chrome, Firefox, Safari 등 다른 브라우저에서 새 계정을 생성</li>
					<li><strong>시크릿 모드 사용:</strong> 현재 브라우저의 시크릿/익명 모드에서 새 계정을 생성</li>
					<li><strong>두 번째 계정 생성:</strong> 다른 이메일 주소로 Google 또는 GitHub OAuth를 통해 가입</li>
					<li><strong>팔로우 테스트:</strong> 한 계정에서 다른 계정의 프로필 페이지로 이동하여 팔로우 버튼 테스트</li>
					<li><strong>실시간 업데이트 확인:</strong> 팔로우/언팔로우 시 통계가 즉시 업데이트되는지 확인</li>
				</ul>
			</div>
		</div>
	</div>
{/if}