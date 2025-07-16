<script lang="ts">
	import type { PageData } from './$types'
	
	let { data }: { data: PageData } = $props()
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="text-3xl font-bold mb-6">새 글 작성</h1>
	
	<div class="bg-gray-50 p-6 rounded-lg">
		<p class="text-gray-700">
			로그인된 사용자: {data.user?.email}
		</p>
		<p class="text-sm text-gray-500 mt-2">
			이 페이지는 인증된 사용자만 접근할 수 있습니다.
		</p>
	</div>
	
	<form class="mt-8 space-y-6">
		<div>
			<label for="title" class="block text-sm font-medium text-gray-700">
				제목
			</label>
			<input
				type="text"
				id="title"
				name="title"
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				placeholder="글 제목을 입력하세요"
			/>
		</div>
		
		<div>
			<label for="content" class="block text-sm font-medium text-gray-700">
				내용
			</label>
			<textarea
				id="content"
				name="content"
				rows={10}
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
				placeholder="글 내용을 입력하세요"
			></textarea>
		</div>
		
		<div class="flex gap-4">
			<button
				type="submit"
				class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
			>
				작성하기
			</button>
			<a
				href="/"
				class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
			>
				취소
			</a>
		</div>
	</form>
</div>