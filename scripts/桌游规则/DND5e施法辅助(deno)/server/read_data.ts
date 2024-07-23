import { SPELL_DATA, Spell, UseSpellArgs, findMostSimilarSpell, useSpell } from './spells.ts'
const port = 8080

function handleSearchSpell(request: Request): Response {
  const url = new URL(request.url)
  const query = url.searchParams.get('q')

  if (!query) {
    return new Response(JSON.stringify({ error: "Query parameter 'q' is required" }), { status: 400 })
  }

  const results = SPELL_DATA.spell.filter(
    (spell: Spell) =>
      spell.name.toLowerCase().includes(query.toLowerCase()) ||
      spell.ENG_name.toLowerCase().includes(query.toLowerCase())
  )

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' }
  })
}

function handleGetSpell(request: Request): Response {
  const url = new URL(request.url)
  const name = url.searchParams.get('name')

  if (!name) {
    return new Response(JSON.stringify({ error: "Query parameter 'name' is required" }), { status: 400 })
  }

  const spell = SPELL_DATA.spell.find((s: Spell) => s.name === name || s.ENG_name === name)

  if (!spell) {
    const perhapsSpell = findMostSimilarSpell(name, SPELL_DATA.spell)
    if (perhapsSpell)
      return new Response(JSON.stringify({ error: 'Found fallback spell', perhapsSpell }), { status: 200 })
    return new Response(JSON.stringify({ error: 'Spell not found' }), { status: 404 })
  }

  return new Response(JSON.stringify({ spell }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleUseSpell(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }
  const body = await request.json()
  if (!body) {
    return new Response(JSON.stringify({ error: 'Body is required' }), { status: 400 })
  }
  return new Response(JSON.stringify(useSpell(body as UseSpellArgs)), { status: 200 })
}

async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url)
  switch (url.pathname) {
    case '/api/search_spell':
      return handleSearchSpell(request)
    case '/api/get_spell':
      return handleGetSpell(request)
    case '/api/use_spell':
      return await handleUseSpell(request)
    default:
      return new Response('Not Found', { status: 404 })
  }
}

console.log(`HTTP server running. Access it at: http://localhost:8080/`)
Deno.serve({ port }, handler)
