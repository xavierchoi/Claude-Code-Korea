<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="flex h-screen bg-gray-100">
	<aside class="w-64 bg-gray-800 text-white">
		<div class="p-4">
			<h2 class="text-xl font-bold">관리자 패널</h2>
		</div>
		
		<nav class="mt-4">
			<a
				href="/admin"
				class="block px-4 py-2 hover:bg-gray-700 transition-colors {$page.url.pathname === '/admin' ? 'bg-gray-700 border-l-4 border-blue-500' : ''}"
			>
				대시보드
			</a>
			
			<a
				href="/admin/categories"
				class="block px-4 py-2 hover:bg-gray-700 transition-colors {$page.url.pathname === '/admin/categories' ? 'bg-gray-700 border-l-4 border-blue-500' : ''}"
			>
				카테고리 관리
			</a>
			
			<a
				href="/admin/posts"
				class="block px-4 py-2 hover:bg-gray-700 transition-colors {$page.url.pathname === '/admin/posts' ? 'bg-gray-700 border-l-4 border-blue-500' : ''}"
			>
				게시글 관리
			</a>
			
			<a
				href="/admin/users"
				class="block px-4 py-2 hover:bg-gray-700 transition-colors {$page.url.pathname === '/admin/users' ? 'bg-gray-700 border-l-4 border-blue-500' : ''}"
			>
				사용자 관리
			</a>
		</nav>
		
		<div class="absolute bottom-0 w-64 p-4">
			<a
				href="/"
				class="block px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-center transition-colors"
			>
				사이트로 돌아가기
			</a>
		</div>
	</aside>
	
	<main class="flex-1 overflow-y-auto">
		<slot />
	</main>
</div>