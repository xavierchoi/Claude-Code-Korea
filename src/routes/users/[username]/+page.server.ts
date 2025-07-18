import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals: { supabase, safeGetSession } }) => {
  const { username } = params
  
  if (!username) {
    throw error(404, 'Username not provided')
  }
  
  // Get current user session
  const { session, user } = await safeGetSession()
  
  // Fetch user profile by username
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(`
      id,
      username,
      full_name,
      bio,
      website,
      location,
      github_username,
      twitter_username,
      avatar_url,
      created_at,
      updated_at
    `)
    .eq('username', username)
    .single()
  
  if (profileError || !profile) {
    console.error('Profile fetch error:', profileError)
    throw error(404, 'User not found')
  }
  
  // Fetch user stats (followers, following, posts, comments, likes, projects, code snippets)
  const [
    { count: followersCount },
    { count: followingCount },
    { count: postsCount },
    { count: commentsCount },
    { count: likesReceivedCount },
    { count: projectsCount },
    { count: codeSnippetsCount }
  ] = await Promise.all([
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', profile.id),
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', profile.id),
    supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', profile.id)
      .eq('is_published', true),
    supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', profile.id),
    // For now, calculate likes received by summing post and comment likes
    // This is a simplified approach - in production, you'd want to optimize this
    supabase
      .from('posts')
      .select('like_count')
      .eq('author_id', profile.id)
      .eq('is_published', true)
      .then(({ data }) => ({ 
        count: data?.reduce((sum, post) => sum + (post.like_count || 0), 0) || 0 
      }))
      .catch(() => ({ count: 0 })),
    supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', profile.id),
    supabase
      .from('code_snippets')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', profile.id)
      .eq('is_public', true)
  ])
  
  // Check if current user is following this profile
  let isFollowing = false
  if (session && user && user.id !== profile.id) {
    const { data: followData } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', profile.id)
      .single()
    
    isFollowing = !!followData
  }
  
  // Fetch user's content for tabs
  const [
    { data: recentPosts },
    { data: userProjects },
    { data: userCodeSnippets }
  ] = await Promise.all([
    // Recent posts (limited to 5 for preview)
    supabase
      .from('posts')
      .select(`
        id,
        title,
        slug,
        created_at,
        view_count,
        like_count,
        comment_count,
        category:categories!posts_category_id_fkey (
          name,
          slug
        )
      `)
      .eq('author_id', profile.id)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(5),
    // User projects
    supabase
      .from('projects')
      .select(`
        id,
        title,
        description,
        thumbnail_url,
        project_url,
        github_url,
        demo_url,
        tech_stack,
        view_count,
        like_count,
        created_at,
        updated_at
      `)
      .eq('author_id', profile.id)
      .order('created_at', { ascending: false }),
    // User code snippets
    supabase
      .from('code_snippets')
      .select(`
        id,
        title,
        description,
        code,
        language,
        view_count,
        like_count,
        fork_count,
        created_at,
        updated_at
      `)
      .eq('author_id', profile.id)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
  ])
  
  // Calculate join date
  const joinDate = new Date(profile.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  return {
    profile,
    stats: {
      followers: followersCount || 0,
      following: followingCount || 0,
      posts: postsCount || 0,
      comments: commentsCount || 0,
      likesReceived: likesReceivedCount || 0,
      projects: projectsCount || 0,
      codeSnippets: codeSnippetsCount || 0
    },
    isFollowing,
    isOwnProfile: session ? user?.id === profile.id : false,
    recentPosts: recentPosts || [],
    userProjects: userProjects || [],
    userCodeSnippets: userCodeSnippets || [],
    joinDate
  }
}