<script lang="ts">
	import ProfileLayout from '$lib/components/profile/ProfileLayout.svelte'
	
	let { data } = $props()
	
	let loading = $state(false)
	let message = $state('')
	let messageType = $state<'success' | 'error'>('success')
	
	// Form data
	let formData = $state({
		job_title: data.profile?.job_title || '',
		company: data.profile?.company || '',
		experience_years: data.profile?.experience_years || '',
		current_salary: data.profile?.current_salary || '',
		skills: data.profile?.skills || '',
		career_goals: data.profile?.career_goals || '',
		work_type: data.profile?.work_type || 'full-time',
		remote_work: data.profile?.remote_work || false
	})
	
	async function updateCareer() {
		loading = true
		message = ''
		
		try {
			const response = await fetch('/api/profile/career', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			})
			
			const result = await response.json()
			
			if (response.ok) {
				message = '커리어 정보가 성공적으로 업데이트되었습니다!'
				messageType = 'success'
			} else {
				message = result.error || '커리어 정보 업데이트에 실패했습니다.'
				messageType = 'error'
			}
		} catch (error) {
			console.error('Career update failed:', error)
			message = '커리어 정보 업데이트 중 오류가 발생했습니다.'
			messageType = 'error'
		} finally {
			loading = false
		}
	}
</script>

<ProfileLayout 
	title="커리어"
	description="현재 직업과 경력 정보를 입력해주세요."
	{data}
>
	<form onsubmit={(e) => { e.preventDefault(); updateCareer(); }} class="space-y-6">
		{#if message}
			<div class="rounded-md p-4 {messageType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}">
				{message}
			</div>
		{/if}
		
		<!-- Job Title -->
		<div>
			<label for="job_title" class="block text-sm font-medium text-gray-700">
				직책 / 직무
			</label>
			<input
				type="text"
				id="job_title"
				bind:value={formData.job_title}
				class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
				placeholder="예: 소프트웨어 엔지니어, 프로덕트 매니저"
			/>
		</div>
		
		<!-- Company -->
		<div>
			<label for="company" class="block text-sm font-medium text-gray-700">
				회사명
			</label>
			<input
				type="text"
				id="company"
				bind:value={formData.company}
				class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
				placeholder="현재 재직 중인 회사명"
			/>
		</div>
		
		<!-- Experience Years -->
		<div>
			<label for="experience_years" class="block text-sm font-medium text-gray-700">
				경력 (년)
			</label>
			<select
				id="experience_years"
				bind:value={formData.experience_years}
				class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
			>
				<option value="">경력을 선택하세요</option>
				<option value="0">신입</option>
				<option value="1">1년</option>
				<option value="2">2년</option>
				<option value="3">3년</option>
				<option value="4">4년</option>
				<option value="5">5년</option>
				<option value="6-10">6-10년</option>
				<option value="11-15">11-15년</option>
				<option value="16+">16년 이상</option>
			</select>
		</div>
		
		<!-- Work Type -->
		<div>
			<label for="work_type" class="block text-sm font-medium text-gray-700">
				근무 형태
			</label>
			<select
				id="work_type"
				bind:value={formData.work_type}
				class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
			>
				<option value="full-time">정규직</option>
				<option value="part-time">파트타임</option>
				<option value="contract">계약직</option>
				<option value="freelance">프리랜서</option>
				<option value="internship">인턴십</option>
			</select>
		</div>
		
		<!-- Remote Work -->
		<div>
			<div class="flex items-center">
				<input
					type="checkbox"
					id="remote_work"
					bind:checked={formData.remote_work}
					class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
				/>
				<label for="remote_work" class="ml-2 block text-sm text-gray-700">
					원격 근무 가능
				</label>
			</div>
		</div>
		
		<!-- Skills -->
		<div>
			<div class="flex justify-between items-center mb-1">
				<label for="skills" class="block text-sm font-medium text-gray-700">
					기술 스택 / 전문 분야
				</label>
				<span class="text-sm text-gray-500">
					{formData.skills.length}/500
				</span>
			</div>
			<textarea
				id="skills"
				bind:value={formData.skills}
				rows="3"
				maxlength="500"
				class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
				placeholder="예: JavaScript, React, Node.js, Python, AWS, 데이터 분석 등"
			></textarea>
			<p class="mt-1 text-sm text-gray-500">
				보유하고 있는 기술이나 전문 분야를 입력해주세요. 쉼표로 구분해서 작성해주세요.
			</p>
		</div>
		
		<!-- Career Goals -->
		<div>
			<div class="flex justify-between items-center mb-1">
				<label for="career_goals" class="block text-sm font-medium text-gray-700">
					커리어 목표
				</label>
				<span class="text-sm text-gray-500">
					{formData.career_goals.length}/500
				</span>
			</div>
			<textarea
				id="career_goals"
				bind:value={formData.career_goals}
				rows="4"
				maxlength="500"
				class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
				placeholder="앞으로의 커리어 목표나 관심 분야를 설명해주세요."
			></textarea>
			<p class="mt-1 text-sm text-gray-500">
				향후 커리어 계획이나 관심 있는 분야에 대해 설명해주세요.
			</p>
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