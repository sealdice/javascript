const port = 8080

const data = JSON.parse(Deno.readTextFileSync('./data/spells-phb.json'))

const handleSearchSpell = (request: Request): Response => {
  const url = new URL(request.url)
  const query = url.searchParams.get('q')

  if (!query) {
    return new Response(JSON.stringify({ error: "Query parameter 'q' is required" }), { status: 400 })
  }

  const results = data.spell.filter(
    (spell: any) =>
      spell.name.toLowerCase().includes(query.toLowerCase()) ||
      spell.ENG_name.toLowerCase().includes(query.toLowerCase())
  )

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' }
  })
}

const handleGetSpell = async (request: Request): Promise<Response> => {
  const url = new URL(request.url)
  const name = url.searchParams.get('name')

  if (!name) {
    return new Response(JSON.stringify({ error: "Query parameter 'name' is required" }), { status: 400 })
  }

  const spell = data.spell.find((s: any) => s.name === name || s.ENG_name === name)

  if (!spell) {
    return new Response(JSON.stringify({ error: 'Spell not found' }), { status: 404 })
  }

  // https://www.dnd5eapi.co/api/
  const englishName = spell.ENG_name.toLowerCase().replace(/ /g, '-')
  const result = await fetch(`https://www.dnd5eapi.co/api/spells/${englishName}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((res) => res.json())
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' }
  })
}

const handler = (request: Request): Promise<Response> => {
  const url = new URL(request.url)
  switch (url.pathname) {
    case '/api/search_spell':
      return Promise.resolve(handleSearchSpell(request))
    case '/api/get_spell':
      return handleGetSpell(request)
    default:
      return Promise.resolve(new Response('Not Found', { status: 404 }))
  }
}

console.log(`HTTP server running. Access it at: http://localhost:8080/`)
Deno.serve({ port }, handler)
