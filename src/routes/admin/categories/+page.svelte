<script lang="ts">
	import { onMount } from 'svelte';
	
	export let data;
	
	let categories = data.categories || [];
	let editingCategory: any = null;
	let isCreating = false;
	let showDeleteModal = false;
	let categoryToDelete: any = null;
	let toastMessage = '';
	let toastType: 'success' | 'error' | '' = '';
	
	let newCategory = {
		name: '',
		slug: '',
		description: '',
		icon: '',
		color: '#000000',
		position: 0,
		is_active: true
	};
	
	function showToast(message: string, type: 'success' | 'error') {
		toastMessage = message;
		toastType = type;
		setTimeout(() => {
			toastMessage = '';
			toastType = '';
		}, 3000);
	}
	
	async function loadCategories() {
		const response = await fetch('/api/categories?includeInactive=true');
		if (response.ok) {
			const data = await response.json();
			categories = data.categories;
		}
	}
	
	async function createCategory() {
		if (!newCategory.name || !newCategory.slug) {
			showToast('카테고리 이름과 슬러그는 필수입니다.', 'error');
			return;
		}
		
		const response = await fetch('/api/categories', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(newCategory)
		});
		
		if (response.ok) {
			showToast('카테고리가 생성되었습니다.', 'success');
			await loadCategories();
			resetNewCategory();
			isCreating = false;
		} else {
			const error = await response.json();
			showToast(error.error || '카테고리 생성에 실패했습니다.', 'error');
		}
	}
	
	async function updateCategory(category: any) {
		const response = await fetch(`/api/categories/${category.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: category.name,
				slug: category.slug,
				description: category.description,
				icon: category.icon,
				color: category.color,
				position: category.position,
				is_active: category.is_active
			})
		});
		
		if (response.ok) {
			showToast('카테고리가 수정되었습니다.', 'success');
			await loadCategories();
			editingCategory = null;
		} else {
			const error = await response.json();
			showToast(error.error || '카테고리 수정에 실패했습니다.', 'error');
		}
	}
	
	async function deleteCategory() {
		if (!categoryToDelete) return;
		
		const response = await fetch(`/api/categories/${categoryToDelete.id}`, {
			method: 'DELETE'
		});
		
		if (response.ok) {
			showToast('카테고리가 삭제되었습니다.', 'success');
			await loadCategories();
		} else {
			const error = await response.json();
			showToast(error.error || '카테고리 삭제에 실패했습니다.', 'error');
		}
		
		showDeleteModal = false;
		categoryToDelete = null;
	}
	
	function confirmDelete(category: any) {
		categoryToDelete = category;
		showDeleteModal = true;
	}
	
	function resetNewCategory() {
		newCategory = {
			name: '',
			slug: '',
			description: '',
			icon: '',
			color: '#000000',
			position: 0,
			is_active: true
		};
	}
	
	function generateSlug(name: string) {
		return name
			.toLowerCase()
			.replace(/[^\w\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.trim();
	}
	
	function startEdit(category: any) {
		editingCategory = { ...category };
	}
	
	function cancelEdit() {
		editingCategory = null;
	}
	
	onMount(() => {
		loadCategories();
	});
</script>

{#if toastMessage}
	<div class="fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg {toastType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}">
		{toastMessage}
	</div>
{/if}

{#if showDeleteModal}
	<div class="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
		<div class="bg-white p-6 rounded-lg shadow-xl max-w-md">
			<h3 class="text-lg font-bold mb-4">카테고리 삭제</h3>
			<p class="mb-6">정말로 "{categoryToDelete?.name}" 카테고리를 삭제하시겠습니까?</p>
			<div class="flex justify-end gap-2">
				<button
					class="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
					on:click={() => {
						showDeleteModal = false;
						categoryToDelete = null;
					}}
				>
					취소
				</button>
				<button
					class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
					on:click={deleteCategory}
				>
					삭제
				</button>
			</div>
		</div>
	</div>
{/if}

<div class="container mx-auto p-4">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-3xl font-bold">카테고리 관리</h1>
		<button
			class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
			on:click={() => isCreating = !isCreating}
		>
			{isCreating ? '취소' : '새 카테고리'}
		</button>
	</div>
	
	{#if isCreating}
		<div class="bg-white border rounded-lg p-4 mb-6">
			<h2 class="text-xl font-semibold mb-4">새 카테고리 만들기</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<label class="block">
					<span class="text-gray-700">이름 *</span>
					<input
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						type="text"
						bind:value={newCategory.name}
						on:input={() => newCategory.slug = generateSlug(newCategory.name)}
						placeholder="카테고리 이름"
					/>
				</label>
				
				<label class="block">
					<span class="text-gray-700">슬러그 *</span>
					<input
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						type="text"
						bind:value={newCategory.slug}
						placeholder="category-slug"
					/>
				</label>
				
				<label class="block col-span-full">
					<span class="text-gray-700">설명</span>
					<textarea
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						bind:value={newCategory.description}
						placeholder="카테고리 설명"
						rows="3"
					/>
				</label>
				
				<label class="block">
					<span class="text-gray-700">아이콘 (이모지)</span>
					<input
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						type="text"
						bind:value={newCategory.icon}
						placeholder="📁"
					/>
				</label>
				
				<label class="block">
					<span class="text-gray-700">색상</span>
					<input
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						type="color"
						bind:value={newCategory.color}
					/>
				</label>
				
				<label class="block">
					<span class="text-gray-700">순서</span>
					<input
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						type="number"
						bind:value={newCategory.position}
						min="0"
					/>
				</label>
				
				<label class="flex items-center space-x-2">
					<input
						class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						type="checkbox"
						bind:checked={newCategory.is_active}
					/>
					<span class="text-gray-700">활성화</span>
				</label>
			</div>
			
			<div class="flex justify-end gap-2 mt-4">
				<button
					class="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
					on:click={() => {
						resetNewCategory();
						isCreating = false;
					}}
				>
					취소
				</button>
				<button
					class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
					on:click={createCategory}
				>
					생성
				</button>
			</div>
		</div>
	{/if}
	
	<div class="overflow-x-auto bg-white rounded-lg shadow">
		<table class="min-w-full divide-y divide-gray-200">
			<thead class="bg-gray-50">
				<tr>
					<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">순서</th>
					<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">아이콘</th>
					<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
					<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">슬러그</th>
					<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">설명</th>
					<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">색상</th>
					<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
					<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
				</tr>
			</thead>
			<tbody class="bg-white divide-y divide-gray-200">
				{#each categories as category (category.id)}
					<tr>
						{#if editingCategory?.id === category.id}
							<td class="px-6 py-4 whitespace-nowrap">
								<input
									class="w-16 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
									type="number"
									bind:value={editingCategory.position}
									min="0"
								/>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<input
									class="w-16 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
									type="text"
									bind:value={editingCategory.icon}
								/>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<input
									class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
									type="text"
									bind:value={editingCategory.name}
								/>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<input
									class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
									type="text"
									bind:value={editingCategory.slug}
								/>
							</td>
							<td class="px-6 py-4">
								<input
									class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
									type="text"
									bind:value={editingCategory.description}
								/>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<input
									class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
									type="color"
									bind:value={editingCategory.color}
								/>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<input
									class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
									type="checkbox"
									bind:checked={editingCategory.is_active}
								/>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm">
								<button
									class="text-green-600 hover:text-green-900 mr-2"
									on:click={() => updateCategory(editingCategory)}
								>
									저장
								</button>
								<button
									class="text-gray-600 hover:text-gray-900"
									on:click={cancelEdit}
								>
									취소
								</button>
							</td>
						{:else}
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.position}</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.icon || '-'}</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.name}</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm"><code class="text-xs bg-gray-100 px-2 py-1 rounded">{category.slug}</code></td>
							<td class="px-6 py-4 text-sm text-gray-900">{category.description || '-'}</td>
							<td class="px-6 py-4 whitespace-nowrap">
								{#if category.color}
									<div
										class="w-6 h-6 rounded border border-gray-300"
										style="background-color: {category.color}"
									/>
								{:else}
									-
								{/if}
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								{#if category.is_active}
									<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
										활성
									</span>
								{:else}
									<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
										비활성
									</span>
								{/if}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm">
								<button
									class="text-indigo-600 hover:text-indigo-900 mr-2"
									on:click={() => startEdit(category)}
								>
									수정
								</button>
								<button
									class="text-red-600 hover:text-red-900"
									on:click={() => confirmDelete(category)}
								>
									삭제
								</button>
							</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>