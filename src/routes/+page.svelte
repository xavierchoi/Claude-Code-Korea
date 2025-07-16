<script lang="ts">
	let { data } = $props()
</script>

<!-- Hero Section -->
<section class="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center">
			<h1 class="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
				<span class="block">Claude와 함께하는</span>
				<span class="block text-blue-600">개발 여정</span>
			</h1>
			<p class="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
				한국 Claude 개발자들을 위한 커뮤니티 플랫폼입니다. 
				AI와 함께 더 나은 코드를 작성하고, 지식을 공유하세요.
			</p>
			
			{#if data.session}
				<div class="mt-10">
					<p class="text-lg text-gray-700 mb-6">
						환영합니다, <span class="font-semibold text-blue-600">{data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0]}</span>님!
					</p>
					<div class="flex flex-col sm:flex-row gap-4 justify-center">
						<a 
							href="/forum" 
							class="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
						>
							포럼 둘러보기
						</a>
						<a 
							href="/projects" 
							class="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-50 transition-colors"
						>
							프로젝트 갤러리
						</a>
					</div>
				</div>
			{:else}
				<div class="mt-10">
					<a 
						href="/auth" 
						class="bg-blue-600 text-white px-8 py-4 rounded-lg text-xl font-medium hover:bg-blue-700 transition-colors inline-block"
					>
						지금 시작하기
					</a>
				</div>
			{/if}
		</div>
	</div>
</section>

<!-- Features Section -->
<section class="py-20 bg-white">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-16">
			<h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
				커뮤니티 기능
			</h2>
			<p class="mt-4 text-xl text-gray-600">
				Claude Code Korea에서 제공하는 다양한 기능들을 살펴보세요
			</p>
		</div>
		
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
			<!-- Forum Feature -->
			<div class="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
				<div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
					<svg class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
					</svg>
				</div>
				<h3 class="text-xl font-semibold text-gray-900 mb-2">포럼</h3>
				<p class="text-gray-600">
					Claude 관련 질문과 답변을 공유하고, 다른 개발자들과 소통하세요.
				</p>
			</div>
			
			<!-- Projects Feature -->
			<div class="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
				<div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
					<svg class="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
					</svg>
				</div>
				<h3 class="text-xl font-semibold text-gray-900 mb-2">프로젝트 갤러리</h3>
				<p class="text-gray-600">
					Claude를 활용한 프로젝트들을 공유하고 영감을 얻어보세요.
				</p>
			</div>
			
			<!-- Code Snippets Feature -->
			<div class="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
				<div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
					<svg class="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
					</svg>
				</div>
				<h3 class="text-xl font-semibold text-gray-900 mb-2">코드 스니펫</h3>
				<p class="text-gray-600">
					유용한 코드 조각들을 공유하고 재사용 가능한 솔루션을 찾아보세요.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="bg-blue-600 py-16">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
		<h2 class="text-3xl font-extrabold text-white sm:text-4xl">
			지금 바로 시작하세요
		</h2>
		<p class="mt-4 text-xl text-blue-100">
			Claude Code Korea 커뮤니티에 참여하여 더 나은 개발자가 되어보세요.
		</p>
		{#if !data.session}
			<div class="mt-8">
				<a 
					href="/auth" 
					class="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors inline-block"
				>
					무료로 가입하기
				</a>
			</div>
		{/if}
	</div>
</section>
