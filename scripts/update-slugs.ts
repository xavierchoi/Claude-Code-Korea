// 기존 게시물들의 slug를 순차적 숫자로 업데이트하는 스크립트
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 생성 (환경변수 필요)
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!; // Service key 필요

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateSlugs() {
	console.log('Starting slug update...');
	
	// 모든 게시물을 생성일 순으로 가져오기
	const { data: posts, error } = await supabase
		.from('posts')
		.select('id, slug, created_at')
		.order('created_at', { ascending: true });
	
	if (error) {
		console.error('Error fetching posts:', error);
		return;
	}
	
	if (!posts || posts.length === 0) {
		console.log('No posts found');
		return;
	}
	
	console.log(`Found ${posts.length} posts to update`);
	
	// 0부터 시작
	let currentNumber = 0;
	
	// 각 게시물 업데이트
	for (const post of posts) {
		// 이미 숫자 slug를 가진 경우 스킵
		const numericSlug = parseInt(post.slug);
		if (!isNaN(numericSlug) && numericSlug >= 0 && numericSlug <= 999999) {
			console.log(`Skipping post ${post.id} - already has numeric slug: ${post.slug}`);
			continue;
		}
		
		const newSlug = currentNumber.toString();
		
		const { error: updateError } = await supabase
			.from('posts')
			.update({ slug: newSlug })
			.eq('id', post.id);
		
		if (updateError) {
			console.error(`Error updating post ${post.id}:`, updateError);
		} else {
			console.log(`Updated post ${post.id}: ${post.slug} -> ${newSlug}`);
		}
		
		currentNumber++;
		
		// 한계 체크
		if (currentNumber > 999999) {
			console.warn('Reached maximum slug number');
			break;
		}
	}
	
	console.log('Slug update complete!');
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
	updateSlugs().catch(console.error);
}