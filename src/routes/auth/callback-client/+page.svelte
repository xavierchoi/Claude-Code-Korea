<script lang="ts">
	import { onMount } from 'svelte'
	import { goto, invalidate, invalidateAll } from '$app/navigation'
	import { supabase } from '$lib/supabase'

	let loading = true
	let error = ''

	onMount(async () => {
		try {
			// Check if we have tokens in the URL fragment
			const hashParams = new URLSearchParams(window.location.hash.substring(1))
			const accessToken = hashParams.get('access_token')
			const refreshToken = hashParams.get('refresh_token')
			
			console.log('Client callback - tokens found:', { 
				hasAccessToken: !!accessToken, 
				hasRefreshToken: !!refreshToken 
			})

			if (accessToken && refreshToken) {
				console.log('Setting session via server API...')
				
				// Use server API to set session with proper cookie handling
				const response = await fetch('/api/auth/session', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						access_token: accessToken,
						refresh_token: refreshToken
					})
				})

				const result = await response.json()

				if (response.ok && result.success) {
					console.log('Server session set successfully')
					
					// Also set client-side session for immediate use
					await supabase.auth.setSession({
						access_token: accessToken,
						refresh_token: refreshToken
					})
					
					// Force invalidations to ensure proper sync
					await invalidate('supabase:auth')
					await invalidateAll()
					
					// Verify both client and server sessions
					const { data: clientSession } = await supabase.auth.getSession()
					console.log('Client session verification:', !!clientSession.session)
					
					// Redirect to home
					goto('/', { replaceState: true })
				} else {
					console.error('Server session error:', result.error)
					error = result.error || 'Failed to create session'
				}
			} else {
				// Try to get session normally (for PKCE flow)
				const { data, error: getSessionError } = await supabase.auth.getSession()
				
				if (getSessionError) {
					console.error('Get session error:', getSessionError)
					error = getSessionError.message
				} else if (data.session) {
					console.log('Session found')
					goto('/')
				} else {
					error = 'No session found'
				}
			}
		} catch (e) {
			console.error('Callback error:', e)
			error = e instanceof Error ? e.message : 'Unknown error occurred'
		} finally {
			loading = false
		}
	})
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
	<div class="max-w-md w-full space-y-8">
		<div class="text-center">
			{#if loading}
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
				<h2 class="mt-6 text-2xl font-bold text-gray-900">
					로그인 처리 중...
				</h2>
				<p class="mt-2 text-sm text-gray-600">
					잠시만 기다려주세요.
				</p>
			{:else if error}
				<h2 class="mt-6 text-2xl font-bold text-red-600">
					로그인 오류
				</h2>
				<p class="mt-2 text-sm text-gray-600">
					{error}
				</p>
				<a 
					href="/auth" 
					class="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
				>
					다시 시도하기
				</a>
			{:else}
				<h2 class="mt-6 text-2xl font-bold text-green-600">
					로그인 완료
				</h2>
				<p class="mt-2 text-sm text-gray-600">
					홈페이지로 이동합니다...
				</p>
			{/if}
		</div>
	</div>
</div>