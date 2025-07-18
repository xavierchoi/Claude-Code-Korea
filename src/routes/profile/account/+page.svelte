<script lang="ts">
	import ProfileLayout from '$lib/components/profile/ProfileLayout.svelte'
	import { goto } from '$app/navigation'
	
	// Heroicons imports
	import ExclamationTriangleIcon from 'heroicons/24/outline/exclamation-triangle.svg?raw'
	
	let { data } = $props()
	
	let loading = $state(false)
	let message = $state('')
	let messageType = $state<'success' | 'error'>('success')
	let showDeleteDialog = $state(false)
	let deleteConfirmation = $state('')
	
	// Form data
	let formData = $state({
		email: data.session?.user?.email || '',
		privacy_level: data.profile?.privacy_level || 'public',
		profile_searchable: data.profile?.profile_searchable ?? true,
		email_notifications: data.profile?.email_notifications ?? true,
		marketing_emails: data.profile?.marketing_emails ?? false
	})
	
	async function updateAccount() {
		loading = true
		message = ''
		
		try {
			const response = await fetch('/api/profile/account', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			})
			
			const result = await response.json()
			
			if (response.ok) {
				message = '계정 설정이 성공적으로 업데이트되었습니다!'
				messageType = 'success'
			} else {
				message = result.error || '계정 설정 업데이트에 실패했습니다.'
				messageType = 'error'
			}
		} catch (error) {
			console.error('Account update failed:', error)
			message = '계정 설정 업데이트 중 오류가 발생했습니다.'
			messageType = 'error'
		} finally {
			loading = false
		}
	}
	
	async function deleteAccount() {
		if (deleteConfirmation !== 'DELETE') {
			message = '계정 삭제를 확인하려면 "DELETE"를 정확히 입력해주세요.'
			messageType = 'error'
			return
		}
		
		loading = true
		message = ''
		
		try {
			const response = await fetch('/api/profile/delete', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				}
			})
			
			const result = await response.json()
			
			if (response.ok) {
				message = '계정이 성공적으로 삭제되었습니다. 잠시 후 로그인 페이지로 이동합니다.'
				messageType = 'success'
				setTimeout(() => {
					goto('/auth/login')
				}, 3000)
			} else {
				message = result.error || '계정 삭제에 실패했습니다.'
				messageType = 'error'
			}
		} catch (error) {
			console.error('Account deletion failed:', error)
			message = '계정 삭제 중 오류가 발생했습니다.'
			messageType = 'error'
		} finally {
			loading = false
			showDeleteDialog = false
		}
	}
	
	async function signOut() {
		loading = true
		
		try {
			const response = await fetch('/api/auth/signout', {
				method: 'POST'
			})
			
			if (response.ok) {
				goto('/auth/login')
			}
		} catch (error) {
			console.error('Sign out failed:', error)
		} finally {
			loading = false
		}
	}
</script>

<ProfileLayout 
	title="계정 설정"
	description="계정 정보와 개인정보 설정을 관리하세요."
	{data}
>
	<div class="space-y-8">
		{#if message}
			<div class="rounded-md p-4 {messageType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}">
				{message}
			</div>
		{/if}
		
		<!-- Account Information -->
		<div class="space-y-6">
			<div>
				<h3 class="text-lg font-medium leading-6 text-gray-900">계정 정보</h3>
				<p class="mt-1 text-sm text-gray-600">
					계정의 기본 정보를 확인할 수 있습니다.
				</p>
			</div>
			
			<div class="grid grid-cols-1 gap-6">
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700">
						이메일 주소
					</label>
					<input
						type="email"
						id="email"
						bind:value={formData.email}
						disabled
						class="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
					/>
					<p class="mt-1 text-sm text-gray-500">
						이메일 주소는 변경할 수 없습니다.
					</p>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-700">
						가입일
					</label>
					<p class="mt-1 text-sm text-gray-900">
						{new Date(data.session?.user?.created_at || '').toLocaleDateString('ko-KR')}
					</p>
				</div>
			</div>
		</div>
		
		<!-- Privacy Settings -->
		<div class="space-y-6">
			<div>
				<h3 class="text-lg font-medium leading-6 text-gray-900">개인정보 설정</h3>
				<p class="mt-1 text-sm text-gray-600">
					프로필 공개 범위와 검색 설정을 관리하세요.
				</p>
			</div>
			
			<form onsubmit={(e) => { e.preventDefault(); updateAccount(); }} class="space-y-6">
				<div>
					<label for="privacy_level" class="block text-sm font-medium text-gray-700">
						프로필 공개 범위
					</label>
					<select
						id="privacy_level"
						bind:value={formData.privacy_level}
						class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
					>
						<option value="public">전체 공개</option>
						<option value="members">회원만 공개</option>
						<option value="private">비공개</option>
					</select>
					<p class="mt-1 text-sm text-gray-500">
						다른 사용자가 귀하의 프로필을 볼 수 있는 범위를 설정합니다.
					</p>
				</div>
				
				<div>
					<div class="flex items-center">
						<input
							type="checkbox"
							id="profile_searchable"
							bind:checked={formData.profile_searchable}
							class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
						<label for="profile_searchable" class="ml-2 block text-sm text-gray-700">
							검색 결과에 프로필 표시
						</label>
					</div>
					<p class="mt-1 text-sm text-gray-500">
						다른 사용자가 검색할 때 귀하의 프로필이 표시됩니다.
					</p>
				</div>
				
				<div>
					<div class="flex items-center">
						<input
							type="checkbox"
							id="email_notifications"
							bind:checked={formData.email_notifications}
							class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
						<label for="email_notifications" class="ml-2 block text-sm text-gray-700">
							이메일 알림 받기
						</label>
					</div>
					<p class="mt-1 text-sm text-gray-500">
						새로운 댓글, 좋아요 등의 알림을 이메일로 받습니다.
					</p>
				</div>
				
				<div>
					<div class="flex items-center">
						<input
							type="checkbox"
							id="marketing_emails"
							bind:checked={formData.marketing_emails}
							class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
						<label for="marketing_emails" class="ml-2 block text-sm text-gray-700">
							마케팅 이메일 수신
						</label>
					</div>
					<p class="mt-1 text-sm text-gray-500">
						새로운 기능, 이벤트 등의 마케팅 이메일을 받습니다.
					</p>
				</div>
				
				<div class="flex justify-end">
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
							설정 저장
						{/if}
					</button>
				</div>
			</form>
		</div>
		
		<!-- Account Actions -->
		<div class="space-y-6">
			<div>
				<h3 class="text-lg font-medium leading-6 text-gray-900">계정 관리</h3>
				<p class="mt-1 text-sm text-gray-600">
					계정과 관련된 추가 작업을 수행할 수 있습니다.
				</p>
			</div>
			
			<div class="space-y-4">
				<div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
					<div>
						<h4 class="text-sm font-medium text-gray-900">로그아웃</h4>
						<p class="text-sm text-gray-500">현재 계정에서 로그아웃합니다.</p>
					</div>
					<button
						onclick={signOut}
						disabled={loading}
						class="bg-gray-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						로그아웃
					</button>
				</div>
				
				<div class="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
					<div>
						<h4 class="text-sm font-medium text-red-900">계정 삭제</h4>
						<p class="text-sm text-red-700">계정을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.</p>
					</div>
					<button
						onclick={() => showDeleteDialog = true}
						class="bg-red-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
					>
						계정 삭제
					</button>
				</div>
			</div>
		</div>
	</div>
	
	<!-- Delete Confirmation Dialog -->
	{#if showDeleteDialog}
		<div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
			<div class="bg-white rounded-lg p-6 max-w-md w-full">
				<div class="flex items-center mb-4">
					<div class="w-6 h-6 text-red-600 mr-2">
						{@html ExclamationTriangleIcon}
					</div>
					<h3 class="text-lg font-medium text-gray-900">계정 삭제 확인</h3>
				</div>
				
				<p class="text-sm text-gray-500 mb-4">
					계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
				</p>
				
				<p class="text-sm text-gray-900 mb-2">
					계속하려면 아래에 <strong>DELETE</strong>를 입력하세요:
				</p>
				
				<input
					type="text"
					bind:value={deleteConfirmation}
					placeholder="DELETE"
					class="w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 mb-4"
				/>
				
				<div class="flex space-x-3">
					<button
						onclick={() => { showDeleteDialog = false; deleteConfirmation = ''; }}
						class="flex-1 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
					>
						취소
					</button>
					<button
						onclick={deleteAccount}
						disabled={loading || deleteConfirmation !== 'DELETE'}
						class="flex-1 bg-red-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{#if loading}
							삭제 중...
						{:else}
							계정 삭제
						{/if}
					</button>
				</div>
			</div>
		</div>
	{/if}
</ProfileLayout>