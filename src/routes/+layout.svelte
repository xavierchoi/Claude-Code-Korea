<script lang="ts">
	import '../app.css';
	import { invalidate } from '$app/navigation'
	import { onMount } from 'svelte'
	import { supabase } from '$lib/supabase'
	import Header from '$lib/components/Header.svelte'
	import Footer from '$lib/components/Footer.svelte'

	let { children, data } = $props();

	onMount(() => {
		const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
			console.log('Auth state changed:', event, !!session)
			
			if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
				// Force invalidate to refresh all server-side data
				await invalidate('supabase:auth')
			}
		})

		return () => authListener.subscription.unsubscribe()
	})
</script>

<div class="min-h-screen flex flex-col bg-white">
	<Header {data} />
	
	<main class="flex-1">
		{@render children()}
	</main>
	
	<Footer />
</div>
