<script lang="ts">
	import '../app.css';
	import { invalidate } from '$app/navigation'
	import { onMount } from 'svelte'
	import { supabase } from '$lib/supabase'
	import { auth, profile } from '$lib/stores'
	import Header from '$lib/components/Header.svelte'
	import Footer from '$lib/components/Footer.svelte'

	let { children, data } = $props();

	onMount(() => {
		// Initialize auth store
		const unsubscribeAuth = auth.initialize()
		
		// Listen for auth state changes
		const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
			console.log('Auth state changed:', event, !!session)
			
			if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
				// Force invalidate to refresh all server-side data
				await invalidate('supabase:auth')
				
				// Fetch or reset profile based on auth state
				if (session?.user) {
					profile.fetchProfile(session.user.id)
				} else {
					profile.reset()
				}
			}
		})

		return () => {
			authListener.subscription.unsubscribe()
			unsubscribeAuth?.then(unsub => unsub?.())
		}
	})
</script>

<div class="min-h-screen flex flex-col bg-white">
	<Header {data} />
	
	<main class="flex-1">
		{@render children()}
	</main>
	
	<Footer />
</div>
