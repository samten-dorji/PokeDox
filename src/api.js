const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

export async function fetchPokemonList(offset = 0, limit = 20) {
  const response = await fetch(
    `${POKEAPI_BASE}/pokemon?offset=${offset}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Pokémon list');
  }

  const data = await response.json();

  return data.results.map((item) => {
    const id = Number(item.url.split('/').filter(Boolean).pop());
    return {
      id,
      name: item.name,
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    };
  });
}

export async function fetchAllPokemonNames() {
  const response = await fetch(`${POKEAPI_BASE}/pokemon?limit=1025`);

  if (!response.ok) {
    throw new Error('Failed to fetch Pokémon names');
  }

  const data = await response.json();
  return data.results;
}

export async function fetchPokemonDetails(idOrName) {
  const response = await fetch(`${POKEAPI_BASE}/pokemon/${idOrName}`);

  if (!response.ok) {
    throw new Error('Failed to fetch Pokémon details');
  }

  return response.json();
}
