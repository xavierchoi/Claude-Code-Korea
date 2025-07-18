<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import MarkdownEditor from '$lib/components/MarkdownEditor.svelte';
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
	
	let title = data.post.title;
	let content = data.post.content;
	let categoryId = data.post.category_id;
	let isPublished = data.post.is_published;
	let isPinned = data.post.is_pinned;
	let isLocked = data.post.is_locked;
	let isSubmitting = false;
	let error = '';
	
	async function handleSubmit(e: Event) {
		e.preventDefault();
		
		if (!title.trim()) {
			error = '제목을 입력해주세요.';
			return;
		}
		
		if (!content.trim()) {
			error = '내용을 입력해주세요.';
			return;
		}
		
		if (!categoryId) {
			error = '카테고리를 선택해주세요.';
			return;
		}
		
		isSubmitting = true;
		error = '';
		
		try {
			const response = await fetch(`/api/posts/${data.post.id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					title: title.trim(),
					content,
					category_id: categoryId,
					is_published: isPublished,
					is_pinned: isPinned,
					is_locked: isLocked
				})
			});
			
			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || '게시글 수정에 실패했습니다.');
			}
			
			const { post } = await response.json();
			
			// 수정된 게시글로 이동
			goto(`/forum/${post.category.slug}/${post.slug}`);
		} catch (err) {
			error = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="container mx-auto px-4 py-8 max-w-4xl">
	<h1 class="text-3xl font-bold mb-8">게시글 수정</h1>
	
	<form on:submit={handleSubmit} class="space-y-6">
		{#if error}
			<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
				{error}
			</div>
		{/if}
		
		<div>
			<label for="category" class="block text-sm font-medium text-gray-700 mb-2">
				카테고리 <span class="text-red-500">*</span>
			</label>
			<select
				id="category"
				bind:value={categoryId}
				class="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-3 py-2"
				required
			>
				<option value="">카테고리를 선택하세요</option>
				{#each data.categories as category}
					<option value={category.id}>
						{category.icon} {category.name}
					</option>
				{/each}
			</select>
		</div>
		
		<div>
			<label for="title" class="block text-sm font-medium text-gray-700 mb-2">
				제목 <span class="text-red-500">*</span>
			</label>
			<input
				type="text"
				id="title"
				bind:value={title}
				class="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-3 py-2"
				placeholder="게시글 제목을 입력하세요"
				maxlength="200"
				required
			/>
			<p class="mt-1 text-sm text-gray-500">{title.length}/200</p>
		</div>
		
		<div>
			<label for="content" class="block text-sm font-medium text-gray-700 mb-2">
				내용 <span class="text-red-500">*</span>
			</label>
			<MarkdownEditor
				bind:value={content}
				placeholder="마크다운으로 내용을 작성하세요..."
				minHeight="400px"
			/>
		</div>
		
		<div class="space-y-3">
			<div class="flex items-center">
				<input
					type="checkbox"
					id="isPublished"
					bind:checked={isPublished}
					class="rounded border border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
				/>
				<label for="isPublished" class="ml-2 text-sm text-gray-700">
					게시하기
				</label>
				<p class="ml-4 text-xs text-gray-500">
					체크 해제 시 임시 저장 상태가 됩니다.
				</p>
			</div>
			
			{#if data.isAdmin}
				<div class="flex items-center">
					<input
						type="checkbox"
						id="isPinned"
						bind:checked={isPinned}
						class="rounded border border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
					/>
					<label for="isPinned" class="ml-2 text-sm text-gray-700">
						게시글 고정
					</label>
					<p class="ml-4 text-xs text-gray-500">
						카테고리 상단에 고정됩니다.
					</p>
				</div>
				
				<div class="flex items-center">
					<input
						type="checkbox"
						id="isLocked"
						bind:checked={isLocked}
						class="rounded border border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
					/>
					<label for="isLocked" class="ml-2 text-sm text-gray-700">
						댓글 잠금
					</label>
					<p class="ml-4 text-xs text-gray-500">
						새로운 댓글을 작성할 수 없게 됩니다.
					</p>
				</div>
			{/if}
		</div>
		
		<div class="flex gap-4 pt-4">
			<button
				type="submit"
				disabled={isSubmitting}
				class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
			>
				{#if isSubmitting}
					수정 중...
				{:else}
					수정하기
				{/if}
			</button>
			<a
				href="/forum/{data.post.category.slug}/{data.post.slug}"
				class="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
			>
				취소
			</a>
		</div>
	</form>
</div>