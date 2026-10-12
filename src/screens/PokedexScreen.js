import { useEffect, useState, useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PokemonCard from '../components/PokemonCard';
import { fetchPokemonList, fetchAllPokemonNames } from '../api';

const INITIAL_OFFSET = 145;

export default function PokedexScreen() {
  const navigation = useNavigation();
  const [pokemon, setPokemon] = useState([]);
  const [allPokemonNames, setAllPokemonNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [offset, setOffset] = useState(INITIAL_OFFSET);
  const [hasMore, setHasMore] = useState(true);
  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [showNoResults, setShowNoResults] = useState(false);

  const debounceTimerRef = useRef(null);

  async function loadAllPokemonNames() {
    try {
      const names = await fetchAllPokemonNames();
      setAllPokemonNames(names);
    } catch (_err) {
      console.error('Error loading Pokémon names');
    }
  }

  async function loadPokemon(currentOffset = INITIAL_OFFSET, append = false) {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(false);

      const results = await fetchPokemonList(currentOffset, 20);

      if (append) {
        setPokemon((prev) => [...prev, ...results]);
      } else {
        setPokemon(results);
      }

      setHasMore(results.length === 20);
    } catch (_err) {
      setError(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  const searchPokemon = useCallback((query) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (!query.trim()) {
        setFilteredPokemon([]);
        setShowNoResults(false);
        return;
      }

      const lowerQuery = query.toLowerCase().trim();
      const matches = allPokemonNames
        .filter((item) => item.name.toLowerCase().includes(lowerQuery))
        .slice(0, 20)
        .map((item) => {
          const id = Number(item.url.split('/').filter(Boolean).pop());
          return {
            id,
            name: item.name,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
          };
        });

      setFilteredPokemon(matches);
      setShowNoResults(matches.length === 0);
    }, 500);
  }, [allPokemonNames]);

  useEffect(() => {
    async function initializeApp() {
      await loadAllPokemonNames();
      await loadPokemon(INITIAL_OFFSET);
    }
    initializeApp();
  }, []);

  useEffect(() => {
    searchPokemon(searchQuery);
  }, [searchQuery, searchPokemon]);

  const loadMorePokemon = () => {
    if (loadingMore || !hasMore || searchQuery) return;
    const newOffset = offset + 20;
    setOffset(newOffset);
    loadPokemon(newOffset, true);
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#e63946" />
      </View>
    );
  };

  const displayData = searchQuery ? filteredPokemon : pokemon;

  const handlePokemonPress = (pokemonId) => {
    navigation.navigate('Detail', { pokemonId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Pokédex</Text>
      <Text style={styles.subtitle}>Discover your next Pokémon!</Text>
      <Text style={styles.authorName}>Samten Dorji</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Pokémon..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {!searchQuery && (
        <TouchableOpacity
          style={styles.pikachuShortcut}
          onPress={() => setSearchQuery('pikachu')}
        >
          <Text style={styles.pikachuShortcutText}>⚡ Find Pikachu</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#e63946" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text>Unable to load Pokémon. Check your internet.</Text>
          <TouchableOpacity onPress={() => loadPokemon(INITIAL_OFFSET)}>
            <Text style={styles.retry}>Tap here to retry</Text>
          </TouchableOpacity>
        </View>
      ) : showNoResults ? (
        <View style={styles.center}>
          <Text style={styles.noResults}>No Pokémon found matching &quot;{searchQuery}&quot;</Text>
        </View>
      ) : (
        <FlatList
          data={displayData}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.list}
          onEndReached={loadMorePokemon}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          renderItem={({ item }) => (
            <PokemonCard
              id={item.id}
              name={item.name}
              image={item.image}
              onPress={() => handlePokemonPress(item.id)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    paddingTop: 15,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#d62828',
    marginHorizontal: 20,
    marginTop: 15,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 20,
    marginBottom: 5,
    marginTop: 5,
  },
  authorName: {
    fontSize: 12,
    color: '#888',
    marginHorizontal: 20,
    marginBottom: 15,
    fontStyle: 'italic',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pikachuShortcut: {
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: '#ffcb05',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  pikachuShortcutText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 14,
  },
  list: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  retry: {
    color: '#d62828',
    fontWeight: 'bold',
    marginTop: 12,
  },
  noResults: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
