<script lang="ts">
	import { profile } from '$lib/stores/profile'
	import { supabase } from '$lib/supabase'
	import { debugHasUsername, debugProfileCreation } from '$lib/debug/profile-debug'
	
	let userId = $state('')
	let results = $state<any>({})
	let loading = $state(false)
	
	async function testHasUsername() {
		if (!userId) {
			alert('Please enter a user ID')
			return
		}
		
		loading = true
		results = {}
		
		try {
			// Test 1: Direct hasUsername function
			console.log('=== Test 1: Direct hasUsername function ===')
			const hasUsernameResult = await profile.hasUsername(userId)
			results.hasUsername = hasUsernameResult
			
			// Test 2: Debug version
			console.log('=== Test 2: Debug hasUsername function ===')
			const debugResult = await debugHasUsername(userId)
			results.debugHasUsername = debugResult
			
			// Test 3: Direct Supabase query
			console.log('=== Test 3: Direct Supabase query ===')
			const { data: directData, error: directError } = await supabase
				.from('profiles')
				.select('*')
				.eq('id', userId)
				.maybeSingle()
			
			results.directQuery = { data: directData, error: directError }
			
			// Test 4: Auth state
			console.log('=== Test 4: Auth state ===')
			const { data: { user }, error: authError } = await supabase.auth.getUser()
			results.authState = { user: user?.id, error: authError }
			
		} catch (error) {
			console.error('Error in testing:', error)
			results.error = error
		} finally {
			loading = false
		}
	}
	
	async function createProfile() {
		if (!userId) {
			alert('Please enter a user ID')
			return
		}
		
		loading = true
		
		try {
			const result = await debugProfileCreation(userId)
			results.profileCreation = result
		} catch (error) {
			console.error('Error creating profile:', error)
			results.profileCreationError = error
		} finally {
			loading = false
		}
	}
	
	async function getCurrentUser() {
		try {
			const { data: { user }, error } = await supabase.auth.getUser()
			if (user) {
				userId = user.id
				console.log('Current user ID:', user.id)
			} else {
				console.log('No authenticated user')
			}
		} catch (error) {
			console.error('Error getting current user:', error)
		}
	}
</script>

<div class="max-w-4xl mx-auto p-6">
	<h1 class="text-3xl font-bold mb-6">Profile Debug Page</h1>
	
	<div class="bg-gray-100 p-4 rounded-lg mb-6">
		<h2 class="text-xl font-semibold mb-4">Test hasUsername Function</h2>
		
		<div class="space-y-4">
			<div>
				<label for="userId" class="block text-sm font-medium mb-2">User ID:</label>
				<input
					type="text"
					id="userId"
					bind:value={userId}
					placeholder="Enter user ID (UUID)"
					class="w-full p-2 border rounded-md"
				/>
				<button
					onclick={getCurrentUser}
					class="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
				>
					Get Current User ID
				</button>
			</div>
			
			<div class="space-x-4">
				<button
					onclick={testHasUsername}
					disabled={loading}
					class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
				>
					{loading ? 'Testing...' : 'Test hasUsername'}
				</button>
				
				<button
					onclick={createProfile}
					disabled={loading}
					class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
				>
					{loading ? 'Creating...' : 'Create Profile'}
				</button>
			</div>
		</div>
	</div>
	
	{#if Object.keys(results).length > 0}
		<div class="bg-white p-4 rounded-lg border">
			<h2 class="text-xl font-semibold mb-4">Results</h2>
			<pre class="bg-gray-100 p-4 rounded overflow-auto text-sm">
{JSON.stringify(results, null, 2)}
			</pre>
		</div>
	{/if}
	
	<div class="mt-6 bg-yellow-50 p-4 rounded-lg">
		<h3 class="font-semibold mb-2">Debug Instructions:</h3>
		<ol class="list-decimal list-inside space-y-1 text-sm">
			<li>Click "Get Current User ID" to populate the user ID field</li>
			<li>Click "Test hasUsername" to run all the debug tests</li>
			<li>Open the browser console to see detailed debug logs</li>
			<li>Check the Results section below for the function outputs</li>
			<li>If no profile exists, click "Create Profile" to create one</li>
		</ol>
	</div>
</div>

<style>
	pre {
		white-space: pre-wrap;
		word-wrap: break-word;
	}
</style>