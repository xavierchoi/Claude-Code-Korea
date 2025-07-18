<script lang="ts">
	import { page } from '$app/stores'
	import { invalidateAll } from '$app/navigation'
	
	// Heroicons imports
	import UserIcon from 'heroicons/24/outline/user.svg?raw'
	import MapPinIcon from 'heroicons/24/outline/map-pin.svg?raw'
	import LinkIcon from 'heroicons/24/outline/link.svg?raw'
	import CalendarDaysIcon from 'heroicons/24/outline/calendar-days.svg?raw'
	import DocumentTextIcon from 'heroicons/24/outline/document-text.svg?raw'
	import EyeIcon from 'heroicons/24/outline/eye.svg?raw'
	import ArrowTopRightOnSquareIcon from 'heroicons/24/outline/arrow-top-right-on-square.svg?raw'
	import UserPlusIcon from 'heroicons/24/outline/user-plus.svg?raw'
	import UserMinusIcon from 'heroicons/24/outline/user-minus.svg?raw'
	import ChatBubbleLeftIcon from 'heroicons/24/outline/chat-bubble-left.svg?raw'
	import HeartIcon from 'heroicons/24/outline/heart.svg?raw'
	import FolderIcon from 'heroicons/24/outline/folder.svg?raw'
	import CodeBracketIcon from 'heroicons/24/outline/code-bracket.svg?raw'
	import PlayIcon from 'heroicons/24/outline/play.svg?raw'
	import ArrowPathIcon from 'heroicons/24/outline/arrow-path.svg?raw'
	import TagIcon from 'heroicons/24/outline/tag.svg?raw'
	
	let { data } = $props()
	
	// Follow state
	let isFollowing = $state(data.isFollowing)
	let followLoading = $state(false)
	let stats = $state(data.stats)
	
	// Tab state
	let activeTab = $state('posts')
	
	// Social links helper
	function getSocialLinks() {
		const links = []
		
		if (data.profile.website) {
			links.push({
				label: 'Website',
				url: data.profile.website,
				icon: LinkIcon
			})
		}
		
		if (data.profile.github_username) {
			links.push({
				label: 'GitHub',
				url: `https://github.com/${data.profile.github_username}`,
				icon: LinkIcon
			})
		}
		
		if (data.profile.twitter_username) {
			links.push({
				label: 'Twitter',
				url: `https://twitter.com/${data.profile.twitter_username}`,
				icon: LinkIcon
			})
		}
		
		return links
	}
	
	const socialLinks = getSocialLinks()
	
	// Follow/Unfollow functionality
	async function toggleFollow() {
		if (followLoading) return
		
		followLoading = true
		
		try {
			const method = isFollowing ? 'DELETE' : 'POST'
			const response = await fetch('/api/follows', {
				method,
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					following_id: data.profile.id
				})
			})
			
			if (response.ok) {
				isFollowing = !isFollowing
				
				// Update follower count
				if (isFollowing) {
					stats.followers += 1
				} else {
					stats.followers -= 1
				}
				
				// Invalidate data to ensure consistency
				await invalidateAll()
			} else {
				const error = await response.json()
				console.error('Follow error:', error)
				alert(error.error || '팔로우 처리 중 오류가 발생했습니다.')
			}
		} catch (error) {
			console.error('Follow error:', error)
			alert('팔로우 처리 중 오류가 발생했습니다.')
		} finally {
			followLoading = false
		}
	}
</script>

<svelte:head>
	<title>{data.profile.full_name || data.profile.username} - Claude Code Korea</title>
	<meta name="description" content={data.profile.bio || `${data.profile.full_name || data.profile.username}의 프로필 페이지`} />
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<div class="lg:grid lg:grid-cols-3 lg:gap-8">
			<!-- Profile Info Sidebar -->
			<div class="lg:col-span-1">
				<div class="bg-white shadow rounded-lg p-6">
					<!-- Avatar and Basic Info -->
					<div class="text-center mb-6">
						{#if data.profile.avatar_url}
							<img 
								src={data.profile.avatar_url} 
								alt={data.profile.full_name || data.profile.username}
								class="mx-auto h-32 w-32 rounded-full object-cover border-4 border-gray-200"
							/>
						{:else}
							<div class="mx-auto h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
								<div class="h-16 w-16 text-gray-400">
									{@html UserIcon}
								</div>
							</div>
						{/if}
						
						<h1 class="mt-4 text-2xl font-bold text-gray-900">
							{data.profile.full_name || data.profile.username}
						</h1>
						
						{#if data.profile.full_name}
							<p class="text-gray-600">@{data.profile.username}</p>
						{/if}
						
						{#if data.profile.bio}
							<p class="mt-3 text-gray-700 text-sm leading-relaxed">
								{data.profile.bio}
							</p>
						{/if}
						
						<!-- Follow Button -->
						{#if !data.isOwnProfile}
							<div class="mt-4">
								<button
									onclick={toggleFollow}
									disabled={followLoading}
									class="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors
										{isFollowing 
											? 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500' 
											: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
										}
										disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2"
								>
									{#if followLoading}
										<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
										처리 중...
									{:else}
										<div class="h-4 w-4 mr-2">
											{@html isFollowing ? UserMinusIcon : UserPlusIcon}
										</div>
										{isFollowing ? '언팔로우' : '팔로우'}
									{/if}
								</button>
							</div>
						{/if}
					</div>
					
					<!-- Location -->
					{#if data.profile.location}
						<div class="flex items-center text-gray-600 mb-3">
							<div class="h-5 w-5 mr-2">
								{@html MapPinIcon}
							</div>
							<span class="text-sm">{data.profile.location}</span>
						</div>
					{/if}
					
					<!-- Join Date -->
					<div class="flex items-center text-gray-600 mb-3">
						<div class="h-5 w-5 mr-2">
							{@html CalendarDaysIcon}
						</div>
						<span class="text-sm">{data.joinDate}에 가입</span>
					</div>
					
					<!-- Social Links -->
					{#if socialLinks.length > 0}
						<div class="border-t pt-6">
							<h3 class="text-sm font-medium text-gray-900 mb-3">링크</h3>
							<div class="space-y-2">
								{#each socialLinks as link}
									<a 
										href={link.url} 
										target="_blank" 
										rel="noopener noreferrer"
										class="flex items-center text-blue-600 hover:text-blue-800 text-sm"
									>
										<div class="h-4 w-4 mr-2">
											{@html link.icon}
										</div>
										{link.label}
										<div class="h-3 w-3 ml-1">
											{@html ArrowTopRightOnSquareIcon}
										</div>
									</a>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>
			
			<!-- Main Content -->
			<div class="lg:col-span-2 mt-8 lg:mt-0">
				<!-- Stats -->
				<div class="bg-white shadow rounded-lg p-6 mb-6">
					<h3 class="text-lg font-semibold text-gray-900 mb-4">활동 통계</h3>
					<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
						<!-- 게시글 -->
						<div class="text-center">
							<div class="flex items-center justify-center mb-2">
								<div class="h-5 w-5 text-blue-600 mr-1">
									{@html DocumentTextIcon}
								</div>
								<div class="text-xl font-bold text-gray-900">{stats.posts}</div>
							</div>
							<div class="text-sm text-gray-600">게시글</div>
						</div>
						
						<!-- 팔로워 -->
						<div class="text-center">
							<div class="flex items-center justify-center mb-2">
								<div class="h-5 w-5 text-green-600 mr-1">
									{@html UserIcon}
								</div>
								<div class="text-xl font-bold text-gray-900">{stats.followers}</div>
							</div>
							<div class="text-sm text-gray-600">팔로워</div>
						</div>
						
						<!-- 팔로잉 -->
						<div class="text-center">
							<div class="flex items-center justify-center mb-2">
								<div class="h-5 w-5 text-purple-600 mr-1">
									{@html UserIcon}
								</div>
								<div class="text-xl font-bold text-gray-900">{stats.following}</div>
							</div>
							<div class="text-sm text-gray-600">팔로잉</div>
						</div>
						
						<!-- 댓글 -->
						<div class="text-center">
							<div class="flex items-center justify-center mb-2">
								<div class="h-5 w-5 text-yellow-600 mr-1">
									{@html ChatBubbleLeftIcon}
								</div>
								<div class="text-xl font-bold text-gray-900">{stats.comments}</div>
							</div>
							<div class="text-sm text-gray-600">댓글</div>
						</div>
					</div>
					
					<!-- 추가 통계 -->
					<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
						<!-- 받은 좋아요 -->
						<div class="text-center">
							<div class="flex items-center justify-center mb-2">
								<div class="h-5 w-5 text-red-600 mr-1">
									{@html HeartIcon}
								</div>
								<div class="text-xl font-bold text-gray-900">{stats.likesReceived}</div>
							</div>
							<div class="text-sm text-gray-600">받은 좋아요</div>
						</div>
						
						<!-- 프로젝트 -->
						<div class="text-center">
							<div class="flex items-center justify-center mb-2">
								<div class="h-5 w-5 text-indigo-600 mr-1">
									{@html FolderIcon}
								</div>
								<div class="text-xl font-bold text-gray-900">{stats.projects}</div>
							</div>
							<div class="text-sm text-gray-600">프로젝트</div>
						</div>
						
						<!-- 코드 스니펫 -->
						<div class="text-center">
							<div class="flex items-center justify-center mb-2">
								<div class="h-5 w-5 text-orange-600 mr-1">
									{@html CodeBracketIcon}
								</div>
								<div class="text-xl font-bold text-gray-900">{stats.codeSnippets}</div>
							</div>
							<div class="text-sm text-gray-600">코드 스니펫</div>
						</div>
					</div>
				</div>
				
				<!-- Content Tabs -->
				<div class="bg-white shadow rounded-lg">
					<!-- Tab Navigation -->
					<div class="border-b border-gray-200">
						<nav class="-mb-px flex space-x-8 px-6" aria-label="Tabs">
							<button
								onclick={() => activeTab = 'posts'}
								class="flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
									{activeTab === 'posts' 
										? 'border-blue-500 text-blue-600' 
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
									}"
							>
								<div class="h-5 w-5 mr-2">
									{@html DocumentTextIcon}
								</div>
								게시글
								<span class="ml-2 py-0.5 px-2 text-xs rounded-full bg-gray-100 text-gray-600">
									{data.stats.posts}
								</span>
							</button>
							
							<button
								onclick={() => activeTab = 'projects'}
								class="flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
									{activeTab === 'projects' 
										? 'border-blue-500 text-blue-600' 
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
									}"
							>
								<div class="h-5 w-5 mr-2">
									{@html FolderIcon}
								</div>
								프로젝트
								<span class="ml-2 py-0.5 px-2 text-xs rounded-full bg-gray-100 text-gray-600">
									{data.stats.projects}
								</span>
							</button>
							
							<button
								onclick={() => activeTab = 'snippets'}
								class="flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
									{activeTab === 'snippets' 
										? 'border-blue-500 text-blue-600' 
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
									}"
							>
								<div class="h-5 w-5 mr-2">
									{@html CodeBracketIcon}
								</div>
								코드 스니펫
								<span class="ml-2 py-0.5 px-2 text-xs rounded-full bg-gray-100 text-gray-600">
									{data.stats.codeSnippets}
								</span>
							</button>
						</nav>
					</div>
					
					<!-- Tab Content -->
					<div class="min-h-[400px]">
						{#if activeTab === 'posts'}
							<!-- Posts Tab -->
							{#if data.recentPosts.length > 0}
								<div class="divide-y divide-gray-200">
									{#each data.recentPosts as post}
										<div class="px-6 py-4 hover:bg-gray-50 transition-colors">
											<div class="flex items-start justify-between">
												<div class="flex-1">
													<a 
														href="/forum/{post.category?.slug || 'general'}/{post.slug || post.id}"
														class="block"
													>
														<h3 class="text-base font-medium text-gray-900 hover:text-blue-600 transition-colors">
															{post.title}
														</h3>
														<div class="mt-2 flex items-center space-x-4 text-sm text-gray-500">
															{#if post.category}
																<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
																	{post.category.name}
																</span>
															{/if}
															<div class="flex items-center">
																<div class="h-4 w-4 mr-1">
																	{@html EyeIcon}
																</div>
																{post.view_count}
															</div>
															<div class="flex items-center">
																<div class="h-4 w-4 mr-1">
																	{@html HeartIcon}
																</div>
																{post.like_count || 0}
															</div>
															<div class="flex items-center">
																<div class="h-4 w-4 mr-1">
																	{@html ChatBubbleLeftIcon}
																</div>
																{post.comment_count || 0}
															</div>
															<span>
																{new Date(post.created_at).toLocaleDateString('ko-KR')}
															</span>
														</div>
													</a>
												</div>
											</div>
										</div>
									{/each}
								</div>
								
								<!-- View All Posts Link -->
								<div class="px-6 py-4 border-t border-gray-200">
									<a 
										href="/forum?author={data.profile.username}"
										class="text-blue-600 hover:text-blue-800 font-medium text-sm"
									>
										모든 게시글 보기 →
									</a>
								</div>
							{:else}
								<div class="px-6 py-12 text-center">
									<div class="h-12 w-12 mx-auto text-gray-400 mb-4">
										{@html DocumentTextIcon}
									</div>
									<h3 class="text-lg font-medium text-gray-900 mb-2">아직 게시글이 없습니다</h3>
									<p class="text-gray-600">
										{data.profile.full_name || data.profile.username}님이 작성한 게시글이 없습니다.
									</p>
								</div>
							{/if}
						{:else if activeTab === 'projects'}
							<!-- Projects Tab -->
							{#if data.userProjects.length > 0}
								<div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
									{#each data.userProjects as project}
										<div class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
											{#if project.thumbnail_url}
												<img 
													src={project.thumbnail_url} 
													alt={project.title}
													class="w-full h-48 object-cover rounded-lg mb-4"
												/>
											{/if}
											<h3 class="text-lg font-semibold text-gray-900 mb-2">
												{project.title}
											</h3>
											<p class="text-gray-600 text-sm mb-4 line-clamp-3">
												{project.description}
											</p>
											
											{#if project.tech_stack && project.tech_stack.length > 0}
												<div class="flex flex-wrap gap-2 mb-4">
													{#each project.tech_stack.slice(0, 3) as tech}
														<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
															{tech}
														</span>
													{/each}
													{#if project.tech_stack.length > 3}
														<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
															+{project.tech_stack.length - 3}
														</span>
													{/if}
												</div>
											{/if}
											
											<div class="flex items-center justify-between">
												<div class="flex items-center space-x-4 text-sm text-gray-500">
													<div class="flex items-center">
														<div class="h-4 w-4 mr-1">
															{@html EyeIcon}
														</div>
														{project.view_count}
													</div>
													<div class="flex items-center">
														<div class="h-4 w-4 mr-1">
															{@html HeartIcon}
														</div>
														{project.like_count || 0}
													</div>
												</div>
												<div class="flex space-x-2">
													{#if project.demo_url}
														<a 
															href={project.demo_url}
															target="_blank"
															rel="noopener noreferrer"
															class="inline-flex items-center px-3 py-1 text-sm font-medium text-green-600 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
														>
															<div class="h-4 w-4 mr-1">
																{@html PlayIcon}
															</div>
															데모
														</a>
													{/if}
													{#if project.github_url}
														<a 
															href={project.github_url}
															target="_blank"
															rel="noopener noreferrer"
															class="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
														>
															GitHub
														</a>
													{/if}
												</div>
											</div>
										</div>
									{/each}
								</div>
							{:else}
								<div class="px-6 py-12 text-center">
									<div class="h-12 w-12 mx-auto text-gray-400 mb-4">
										{@html FolderIcon}
									</div>
									<h3 class="text-lg font-medium text-gray-900 mb-2">아직 프로젝트가 없습니다</h3>
									<p class="text-gray-600">
										{data.profile.full_name || data.profile.username}님이 등록한 프로젝트가 없습니다.
									</p>
								</div>
							{/if}
						{:else if activeTab === 'snippets'}
							<!-- Code Snippets Tab -->
							{#if data.userCodeSnippets.length > 0}
								<div class="divide-y divide-gray-200">
									{#each data.userCodeSnippets as snippet}
										<div class="px-6 py-4 hover:bg-gray-50 transition-colors">
											<div class="flex items-start justify-between">
												<div class="flex-1">
													<h3 class="text-base font-medium text-gray-900 mb-2">
														{snippet.title}
													</h3>
													{#if snippet.description}
														<p class="text-gray-600 text-sm mb-3 line-clamp-2">
															{snippet.description}
														</p>
													{/if}
													
													<div class="bg-gray-50 rounded-lg p-3 mb-3">
														<pre class="text-sm text-gray-800 overflow-x-auto"><code>{snippet.code.slice(0, 200)}{snippet.code.length > 200 ? '...' : ''}</code></pre>
													</div>
													
													<div class="flex items-center justify-between">
														<div class="flex items-center space-x-4 text-sm text-gray-500">
															<div class="flex items-center">
																<div class="h-4 w-4 mr-1">
																	{@html TagIcon}
																</div>
																{snippet.language}
															</div>
															<div class="flex items-center">
																<div class="h-4 w-4 mr-1">
																	{@html EyeIcon}
																</div>
																{snippet.view_count}
															</div>
															<div class="flex items-center">
																<div class="h-4 w-4 mr-1">
																	{@html HeartIcon}
																</div>
																{snippet.like_count || 0}
															</div>
															<div class="flex items-center">
																<div class="h-4 w-4 mr-1">
																	{@html ArrowPathIcon}
																</div>
																{snippet.fork_count || 0}
															</div>
														</div>
														<span class="text-sm text-gray-500">
															{new Date(snippet.created_at).toLocaleDateString('ko-KR')}
														</span>
													</div>
												</div>
											</div>
										</div>
									{/each}
								</div>
								
								<!-- View All Snippets Link -->
								<div class="px-6 py-4 border-t border-gray-200">
									<a 
										href="/snippets?author={data.profile.username}"
										class="text-blue-600 hover:text-blue-800 font-medium text-sm"
									>
										모든 코드 스니펫 보기 →
									</a>
								</div>
							{:else}
								<div class="px-6 py-12 text-center">
									<div class="h-12 w-12 mx-auto text-gray-400 mb-4">
										{@html CodeBracketIcon}
									</div>
									<h3 class="text-lg font-medium text-gray-900 mb-2">아직 코드 스니펫이 없습니다</h3>
									<p class="text-gray-600">
										{data.profile.full_name || data.profile.username}님이 등록한 코드 스니펫이 없습니다.
									</p>
								</div>
							{/if}
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>