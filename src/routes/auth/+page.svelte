<script lang="ts">
	import { supabase } from '$lib/supabase'
	import { goto } from '$app/navigation'

	let { data } = $props()

	async function signInWithGoogle() {
		console.log('Initiating Google OAuth...')
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: `${location.origin}/auth/callback`,
				queryParams: {
					access_type: 'offline',
					prompt: 'consent'
				}
			}
		})
		if (error) {
			console.error('Error signing in with Google:', error)
			alert(`Google 로그인 오류: ${error.message}`)
		} else {
			console.log('Google OAuth initiated:', data)
		}
	}

	async function signInWithGitHub() {
		console.log('Initiating GitHub OAuth...')
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: 'github',
			options: {
				redirectTo: `${location.origin}/auth/callback`
			}
		})
		if (error) {
			console.error('Error signing in with GitHub:', error)
			alert(`GitHub 로그인 오류: ${error.message}`)
		} else {
			console.log('GitHub OAuth initiated:', data)
		}
	}

	async function signOut() {
		const { error } = await supabase.auth.signOut()
		if (error) {
			console.error('Error signing out:', error)
		} else {
			goto('/')
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
				Claude Code Korea
			</h2>
			<p class="mt-2 text-center text-sm text-gray-600">
				한국 Claude 개발자 커뮤니티에 참여하세요
			</p>
		</div>

		{#if data.session}
			<div class="text-center">
				<p class="mb-4 text-lg">안녕하세요, {data.session.user.email}님!</p>
				<button
					onclick={signOut}
					class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
				>
					로그아웃
				</button>
			</div>
		{:else}
			<div class="space-y-4">
				<button
					onclick={signInWithGoogle}
					class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
				>
					Google로 로그인
				</button>
				
				<button
					onclick={signInWithGitHub}
					class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
				>
					GitHub로 로그인
				</button>
			</div>
		{/if}
	</div>
</div>