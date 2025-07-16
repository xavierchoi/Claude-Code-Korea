<script lang="ts">
	import { onMount } from 'svelte'
	import { supabase } from '$lib/supabase'
	
	let { data } = $props()
	let clientSession: any = $state(null)
	let debugInfo = $state({
		serverSession: !!data.session,
		clientSession: false,
		sessionId: '',
		userId: '',
		email: ''
	})
	
	onMount(async () => {
		// Get client-side session for debugging
		const { data: sessionData } = await supabase.auth.getSession()
		clientSession = sessionData.session
		
		debugInfo = {
			serverSession: !!data.session,
			clientSession: !!clientSession,
			sessionId: clientSession?.access_token?.slice(-10) || 'none',
			userId: clientSession?.user?.id?.slice(-8) || 'none',
			email: clientSession?.user?.email || 'none'
		}
		
		console.log('Page debug info:', debugInfo)
		console.log('Server session:', data.session)
		console.log('Client session:', clientSession)
	})
</script>

<div class="min-h-screen bg-gray-50">
	<div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
		<div class="text-center">
			<h1 class="text-4xl font-extrabold text-gray-900 sm:text-5xl">
				Claude Code Korea
			</h1>
			<p class="mt-4 text-xl text-gray-600">
				한국 Claude 개발자들을 위한 커뮤니티 플랫폼
			</p>
			
			<!-- Debug Info -->
			<div class="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left max-w-md mx-auto">
				<h3 class="font-semibold text-yellow-800 mb-2">디버그 정보</h3>
				<div class="text-sm text-yellow-700 space-y-1">
					<div>서버 세션: {debugInfo.serverSession ? '✅' : '❌'}</div>
					<div>클라이언트 세션: {debugInfo.clientSession ? '✅' : '❌'}</div>
					<div>세션 ID: {debugInfo.sessionId}</div>
					<div>사용자 ID: {debugInfo.userId}</div>
					<div>이메일: {debugInfo.email}</div>
				</div>
			</div>
			
			{#if data.session}
				<div class="mt-8">
					<p class="text-lg text-gray-700">
						환영합니다, {data.session.user.email}님!
					</p>
					<div class="mt-4 space-x-4">
						<a 
							href="/forum" 
							class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
						>
							포럼 둘러보기
						</a>
						<a 
							href="/profile" 
							class="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
						>
							프로필 설정
						</a>
					</div>
				</div>
			{:else}
				<div class="mt-8">
					<p class="text-lg text-gray-700 mb-4">
						Claude와 함께하는 개발 여정을 시작하세요
					</p>
					<a 
						href="/auth" 
						class="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg hover:bg-blue-700"
					>
						지금 시작하기
					</a>
				</div>
			{/if}
		</div>
	</div>
</div>
