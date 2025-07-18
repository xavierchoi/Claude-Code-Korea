<script lang="ts">
	import ProfileLayout from '$lib/components/profile/ProfileLayout.svelte'
	
	let { data } = $props()
	
	let loading = $state(false)
	let message = $state('')
	let messageType = $state<'success' | 'error'>('success')
	
	// Form data
	let formData = $state({
		email_notifications: data.profile?.email_notifications ?? true,
		push_notifications: data.profile?.push_notifications ?? true,
		marketing_emails: data.profile?.marketing_emails ?? false,
		comment_notifications: data.profile?.comment_notifications ?? true,
		like_notifications: data.profile?.like_notifications ?? true,
		follow_notifications: data.profile?.follow_notifications ?? true,
		mention_notifications: data.profile?.mention_notifications ?? true,
		forum_notifications: data.profile?.forum_notifications ?? true,
		project_notifications: data.profile?.project_notifications ?? true,
		weekly_digest: data.profile?.weekly_digest ?? true,
		security_alerts: data.profile?.security_alerts ?? true,
		notification_frequency: data.profile?.notification_frequency || 'instant',
		quiet_hours_enabled: data.profile?.quiet_hours_enabled ?? false,
		quiet_hours_start: data.profile?.quiet_hours_start || '22:00',
		quiet_hours_end: data.profile?.quiet_hours_end || '08:00'
	})
	
	async function updateNotifications() {
		loading = true
		message = ''
		
		try {
			const response = await fetch('/api/profile/notifications', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			})
			
			const result = await response.json()
			
			if (response.ok) {
				message = '알림 설정이 성공적으로 업데이트되었습니다!'
				messageType = 'success'
			} else {
				message = result.error || '알림 설정 업데이트에 실패했습니다.'
				messageType = 'error'
			}
		} catch (error) {
			console.error('Notification settings update failed:', error)
			message = '알림 설정 업데이트 중 오류가 발생했습니다.'
			messageType = 'error'
		} finally {
			loading = false
		}
	}
</script>

<ProfileLayout 
	title="알림 설정"
	description="알림 수신 방식과 종류를 설정하세요."
	{data}
>
	<form onsubmit={(e) => { e.preventDefault(); updateNotifications(); }} class="space-y-8">
		{#if message}
			<div class="rounded-md p-4 {messageType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}">
				{message}
			</div>
		{/if}
		
		<!-- General Notification Settings -->
		<div class="space-y-6">
			<div>
				<h3 class="text-lg font-medium leading-6 text-gray-900">일반 알림 설정</h3>
				<p class="mt-1 text-sm text-gray-600">
					알림을 받을 방식을 선택하세요.
				</p>
			</div>
			
			<div class="space-y-4">
				<div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
					<div>
						<h4 class="text-sm font-medium text-gray-900">이메일 알림</h4>
						<p class="text-sm text-gray-500">이메일로 알림을 받습니다.</p>
					</div>
					<div class="flex items-center">
						<input
							type="checkbox"
							id="email_notifications"
							bind:checked={formData.email_notifications}
							class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
					</div>
				</div>
				
				<div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
					<div>
						<h4 class="text-sm font-medium text-gray-900">브라우저 알림</h4>
						<p class="text-sm text-gray-500">브라우저 푸시 알림을 받습니다.</p>
					</div>
					<div class="flex items-center">
						<input
							type="checkbox"
							id="push_notifications"
							bind:checked={formData.push_notifications}
							class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
					</div>
				</div>
				
				<div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
					<div>
						<h4 class="text-sm font-medium text-gray-900">마케팅 이메일</h4>
						<p class="text-sm text-gray-500">새로운 기능, 이벤트 등의 마케팅 이메일을 받습니다.</p>
					</div>
					<div class="flex items-center">
						<input
							type="checkbox"
							id="marketing_emails"
							bind:checked={formData.marketing_emails}
							class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
					</div>
				</div>
			</div>
		</div>
		
		<!-- Activity Notifications -->
		<div class="space-y-6">
			<div>
				<h3 class="text-lg font-medium leading-6 text-gray-900">활동 알림</h3>
				<p class="mt-1 text-sm text-gray-600">
					다른 사용자의 활동에 대한 알림을 설정하세요.
				</p>
			</div>
			
			<div class="space-y-4">
				<div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
					<div>
						<h4 class="text-sm font-medium text-gray-900">댓글 알림</h4>
						<p class="text-sm text-gray-500">내 게시글에 댓글이 달렸을 때 알림을 받습니다.</p>
					</div>
					<div class="flex items-center">
						<input
							type="checkbox"
							id="comment_notifications"
							bind:checked={formData.comment_notifications}
							class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
					</div>
				</div>
				
				<div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
					<div>
						<h4 class="text-sm font-medium text-gray-900">좋아요 알림</h4>
						<p class="text-sm text-gray-500">내 게시글이나 댓글에 좋아요를 받았을 때 알림을 받습니다.</p>
					</div>
					<div class="flex items-center">
						<input
							type="checkbox"
							id="like_notifications"
							bind:checked={formData.like_notifications}
							class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
					</div>
				</div>
				
				<div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
					<div>
						<h4 class="text-sm font-medium text-gray-900">팔로우 알림</h4>
						<p class="text-sm text-gray-500">다른 사용자가 나를 팔로우했을 때 알림을 받습니다.</p>
					</div>
					<div class="flex items-center">
						<input
							type="checkbox"
							id="follow_notifications"
							bind:checked={formData.follow_notifications}
							class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
					</div>
				</div>
				
				<div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
					<div>
						<h4 class="text-sm font-medium text-gray-900">멘션 알림</h4>
						<p class="text-sm text-gray-500">다른 사용자가 나를 멘션했을 때 알림을 받습니다.</p>
					</div>
					<div class="flex items-center">
						<input
							type="checkbox"
							id="mention_notifications"
							bind:checked={formData.mention_notifications}
							class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
					</div>
				</div>
			</div>
		</div>
		
		<!-- Content Notifications -->
		<div class="space-y-6">
			<div>
				<h3 class="text-lg font-medium leading-6 text-gray-900">콘텐츠 알림</h3>
				<p class="mt-1 text-sm text-gray-600">
					새로운 콘텐츠에 대한 알림을 설정하세요.
				</p>
			</div>
			
			<div class="space-y-4">
				<div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
					<div>
						<h4 class="text-sm font-medium text-gray-900">포럼 알림</h4>
						<p class="text-sm text-gray-500">새로운 포럼 게시글이 올라왔을 때 알림을 받습니다.</p>
					</div>
					<div class="flex items-center">
						<input
							type="checkbox"
							id="forum_notifications"
							bind:checked={formData.forum_notifications}
							class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
					</div>
				</div>
				
				<div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
					<div>
						<h4 class="text-sm font-medium text-gray-900">프로젝트 알림</h4>
						<p class="text-sm text-gray-500">새로운 프로젝트가 공유되었을 때 알림을 받습니다.</p>
					</div>
					<div class="flex items-center">
						<input
							type="checkbox"
							id="project_notifications"
							bind:checked={formData.project_notifications}
							class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
					</div>
				</div>
			</div>
		</div>
		
		<!-- Special Notifications -->
		<div class="space-y-6">
			<div>
				<h3 class="text-lg font-medium leading-6 text-gray-900">특별 알림</h3>
				<p class="mt-1 text-sm text-gray-600">
					정기 알림과 보안 알림을 설정하세요.
				</p>
			</div>
			
			<div class="space-y-4">
				<div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
					<div>
						<h4 class="text-sm font-medium text-gray-900">주간 요약</h4>
						<p class="text-sm text-gray-500">주간 활동 요약을 이메일로 받습니다.</p>
					</div>
					<div class="flex items-center">
						<input
							type="checkbox"
							id="weekly_digest"
							bind:checked={formData.weekly_digest}
							class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
					</div>
				</div>
				
				<div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
					<div>
						<h4 class="text-sm font-medium text-gray-900">보안 알림</h4>
						<p class="text-sm text-gray-500">계정 보안과 관련된 중요한 알림을 받습니다.</p>
					</div>
					<div class="flex items-center">
						<input
							type="checkbox"
							id="security_alerts"
							bind:checked={formData.security_alerts}
							class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
					</div>
				</div>
			</div>
		</div>
		
		<!-- Notification Frequency -->
		<div class="space-y-6">
			<div>
				<h3 class="text-lg font-medium leading-6 text-gray-900">알림 빈도</h3>
				<p class="mt-1 text-sm text-gray-600">
					알림을 받을 빈도를 설정하세요.
				</p>
			</div>
			
			<div>
				<label for="notification_frequency" class="block text-sm font-medium text-gray-700">
					알림 빈도
				</label>
				<select
					id="notification_frequency"
					bind:value={formData.notification_frequency}
					class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
				>
					<option value="instant">즉시</option>
					<option value="hourly">시간별</option>
					<option value="daily">일별</option>
					<option value="weekly">주별</option>
				</select>
			</div>
		</div>
		
		<!-- Quiet Hours -->
		<div class="space-y-6">
			<div>
				<h3 class="text-lg font-medium leading-6 text-gray-900">방해 금지 시간</h3>
				<p class="mt-1 text-sm text-gray-600">
					특정 시간대에는 알림을 받지 않도록 설정할 수 있습니다.
				</p>
			</div>
			
			<div class="space-y-4">
				<div class="flex items-center">
					<input
						type="checkbox"
						id="quiet_hours_enabled"
						bind:checked={formData.quiet_hours_enabled}
						class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
					/>
					<label for="quiet_hours_enabled" class="ml-2 block text-sm text-gray-700">
						방해 금지 시간 사용
					</label>
				</div>
				
				{#if formData.quiet_hours_enabled}
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="quiet_hours_start" class="block text-sm font-medium text-gray-700">
								시작 시간
							</label>
							<input
								type="time"
								id="quiet_hours_start"
								bind:value={formData.quiet_hours_start}
								class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
						
						<div>
							<label for="quiet_hours_end" class="block text-sm font-medium text-gray-700">
								종료 시간
							</label>
							<input
								type="time"
								id="quiet_hours_end"
								bind:value={formData.quiet_hours_end}
								class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
					</div>
				{/if}
			</div>
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
					설정 저장
				{/if}
			</button>
		</div>
	</form>
</ProfileLayout>