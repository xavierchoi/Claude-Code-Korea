import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { dev } from '$app/environment'

// 개발 환경에서만 사용 가능한 SQL 실행 API
export const POST: RequestHandler = async ({ request }) => {
  // 개발 환경에서만 허용
  if (!dev) {
    return json({ error: 'This endpoint is only available in development mode' }, { status: 403 })
  }

  try {
    const { query } = await request.json()

    if (!query) {
      return json({ error: 'SQL query is required' }, { status: 400 })
    }

    // Claude Code Korea 프로젝트 ID
    const projectId = 'saxdnqshcpvztybmuiqi'

    // MCP Supabase를 사용하여 SQL 실행
    const result = await fetch(`/api/mcp/supabase/execute-sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        project_id: projectId,
        query: query
      })
    })

    if (!result.ok) {
      const error = await result.json()
      console.error('MCP SQL execution error:', error)
      return json({ 
        error: 'Failed to execute SQL',
        details: error.message || 'MCP SQL execution failed'
      }, { status: 500 })
    }

    const data = await result.json()

    return json({ 
      message: 'SQL executed successfully',
      data: data
    }, { status: 200 })

  } catch (err) {
    console.error('SQL execution error:', err)
    return json({ 
      error: 'Failed to execute SQL',
      details: err.message
    }, { status: 500 })
  }
}