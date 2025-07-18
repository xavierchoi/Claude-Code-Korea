<script lang="ts">
	import ProfileLayout from '$lib/components/profile/ProfileLayout.svelte'
	
	let { data } = $props()
	
	let loading = $state(false)
	let message = $state('')
	let messageType = $state<'success' | 'error'>('success')
	
	// Form data
	let formData = $state({
		education: data.profile?.education || '',
		university: data.profile?.university || '',
		major: data.profile?.major || '',
		graduation_year: data.profile?.graduation_year || '',
		degree: data.profile?.degree || '',
		certifications: data.profile?.certifications || '',
		languages: data.profile?.languages || '',
		achievements: data.profile?.achievements || '',
		courses: data.profile?.courses || ''
	})
	
	async function updateCredentials() {
		loading = true
		message = ''
		
		try {
			const response = await fetch('/api/profile/credentials', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			})
			
			const result = await response.json()
			
			if (response.ok) {
				message = '이력 및 학력 정보가 성공적으로 업데이트되었습니다!'
				messageType = 'success'
			} else {
				message = result.error || '이력 및 학력 정보 업데이트에 실패했습니다.'
				messageType = 'error'
			}
		} catch (error) {
			console.error('Credentials update failed:', error)
			message = '이력 및 학력 정보 업데이트 중 오류가 발생했습니다.'
			messageType = 'error'
		} finally {
			loading = false
		}
	}
</script>

<ProfileLayout 
	title="이력 및 학력"
	description="교육 배경, 자격증, 언어 능력 등을 입력해주세요."
	{data}
>
	<form onsubmit={(e) => { e.preventDefault(); updateCredentials(); }} class="space-y-6">
		{#if message}
			<div class="rounded-md p-4 {messageType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}">
				{message}
			</div>
		{/if}
		
		<!-- Education Level -->
		<div>
			<label for="education" class="block text-sm font-medium text-gray-700">
				최종 학력
			</label>
			<select
				id="education"
				bind:value={formData.education}
				class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
			>
				<option value="">학력을 선택하세요</option>
				<option value="high_school">고등학교 졸업</option>
				<option value="associate">전문학사</option>
				<option value="bachelor">학사</option>
				<option value="master">석사</option>
				<option value="doctorate">박사</option>
				<option value="other">기타</option>
			</select>
		</div>
		
		<!-- University -->
		<div>
			<label for="university" class="block text-sm font-medium text-gray-700">
				대학교/학교명
			</label>
			<input
				type="text"
				id="university"
				bind:value={formData.university}
				class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
				placeholder="예: 서울대학교"
			/>
		</div>
		
		<!-- Major -->
		<div>
			<label for="major" class="block text-sm font-medium text-gray-700">
				전공
			</label>
			<input
				type="text"
				id="major"
				bind:value={formData.major}
				class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
				placeholder="예: 컴퓨터공학과"
			/>
		</div>
		
		<!-- Degree -->
		<div>
			<label for="degree" class="block text-sm font-medium text-gray-700">
				학위 구분
			</label>
			<select
				id="degree"
				bind:value={formData.degree}
				class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
			>
				<option value="">학위를 선택하세요</option>
				<option value="bachelor">학사</option>
				<option value="master">석사</option>
				<option value="doctorate">박사</option>
				<option value="associate">전문학사</option>
				<option value="diploma">졸업증명</option>
			</select>
		</div>
		
		<!-- Graduation Year -->
		<div>
			<label for="graduation_year" class="block text-sm font-medium text-gray-700">
				졸업 연도
			</label>
			<input
				type="number"
				id="graduation_year"
				bind:value={formData.graduation_year}
				min="1950"
				max="2030"
				class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
				placeholder="2023"
			/>
		</div>
		
		<!-- Certifications -->
		<div>
			<div class="flex justify-between items-center mb-1">
				<label for="certifications" class="block text-sm font-medium text-gray-700">
					자격증 / 인증서
				</label>
				<span class="text-sm text-gray-500">
					{formData.certifications.length}/500
				</span>
			</div>
			<textarea
				id="certifications"
				bind:value={formData.certifications}
				rows="3"
				maxlength="500"
				class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
				placeholder="예: AWS Solutions Architect, 정보처리기사, TOEIC 900점 등"
			></textarea>
			<p class="mt-1 text-sm text-gray-500">
				보유하고 있는 자격증이나 인증서를 입력해주세요. 각 항목을 줄바꿈으로 구분해주세요.
			</p>
		</div>
		
		<!-- Languages -->
		<div>
			<div class="flex justify-between items-center mb-1">
				<label for="languages" class="block text-sm font-medium text-gray-700">
					언어 능력
				</label>
				<span class="text-sm text-gray-500">
					{formData.languages.length}/300
				</span>
			</div>
			<textarea
				id="languages"
				bind:value={formData.languages}
				rows="3"
				maxlength="300"
				class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
				placeholder="예: 영어 (상급), 일본어 (중급), 중국어 (초급)"
			></textarea>
			<p class="mt-1 text-sm text-gray-500">
				구사 가능한 언어와 수준을 입력해주세요.
			</p>
		</div>
		
		<!-- Courses -->
		<div>
			<div class="flex justify-between items-center mb-1">
				<label for="courses" class="block text-sm font-medium text-gray-700">
					수강 과정 / 교육 이력
				</label>
				<span class="text-sm text-gray-500">
					{formData.courses.length}/500
				</span>
			</div>
			<textarea
				id="courses"
				bind:value={formData.courses}
				rows="3"
				maxlength="500"
				class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
				placeholder="예: 패스트캠퍼스 웹 개발 부트캠프, 구글 디지털 마케팅 과정 등"
			></textarea>
			<p class="mt-1 text-sm text-gray-500">
				수강한 온라인/오프라인 교육 과정을 입력해주세요.
			</p>
		</div>
		
		<!-- Achievements -->
		<div>
			<div class="flex justify-between items-center mb-1">
				<label for="achievements" class="block text-sm font-medium text-gray-700">
					수상 경력 / 성과
				</label>
				<span class="text-sm text-gray-500">
					{formData.achievements.length}/500
				</span>
			</div>
			<textarea
				id="achievements"
				bind:value={formData.achievements}
				rows="4"
				maxlength="500"
				class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
				placeholder="예: 2023 해커톤 대상, 우수 논문상, 특허 출원 등"
			></textarea>
			<p class="mt-1 text-sm text-gray-500">
				수상 경력, 논문 발표, 특허, 프로젝트 성과 등을 입력해주세요.
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