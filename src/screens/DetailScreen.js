import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTeam } from '../context/TeamContext';
import { fetchPokemonDetails } from '../api';

export default function DetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { pokemonId } = route.params;
  const { addToTeam, removeFromTeam, isInTeam, team } = useTeam();

  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadPokemonDetails() {
      try {
        setLoading(true);
        setError(false);

        const data = await fetchPokemonDetails(pokemonId);
        setPokemon(data);
      } catch (_err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadPokemonDetails();
  }, [pokemonId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e63946" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Unable to load Pokémon details.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.goBack}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const heightInMeters = (pokemon.height / 10).toFixed(1);
  const weightInKg = (pokemon.weight / 10).toFixed(1);
  const inTeam = isInTeam(pokemon.id);
  const teamFull = team.length >= 6 && !inTeam;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{
            uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`,
          }}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.name}>
          {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
        </Text>
        <Text style={styles.number}>#{String(pokemon.id).padStart(3, '0')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Types</Text>
        <View style={styles.typesContainer}>
          {pokemon.types.map((typeInfo) => (
            <View key={typeInfo.type.name} style={styles.typeBadge}>
              <Text style={styles.typeText}>
                {typeInfo.type.name.charAt(0).toUpperCase() +
                  typeInfo.type.name.slice(1)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Physical</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Height</Text>
            <Text style={styles.statValue}>{heightInMeters} m</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Weight</Text>
            <Text style={styles.statValue}>{weightInKg} kg</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Base Stats</Text>
        {pokemon.stats.map((statInfo) => (
          <View key={statInfo.stat.name} style={styles.statBarContainer}>
            <Text style={styles.statName}>
              {getStatName(statInfo.stat.name)}
            </Text>
            <Text style={styles.statNumber}>{statInfo.base_stat}</Text>
            <View style={styles.statBarBackground}>
              <View
                style={[
                  styles.statBarFill,
                  { width: `${Math.min((statInfo.base_stat / 255) * 100, 100)}%` },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.teamButton,
            teamFull && styles.teamButtonDisabled,
          ]}
          onPress={() => {
            if (inTeam) {
              removeFromTeam(pokemon.id);
            } else {
              addToTeam(pokemon);
            }
          }}
          disabled={teamFull && !inTeam}
        >
          <Text style={styles.teamButtonText}>
            {inTeam ? 'Remove from My Team' : teamFull ? 'Team Full (6/6)' : 'Add to My Team'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function getStatName(statName) {
  const names = {
    'hp': 'HP',
    'attack': 'ATK',
    'defense': 'DEF',
    'special-attack': 'SP.ATK',
    'special-defense': 'SP.DEF',
    'speed': 'SPD',
  };
  return names[statName] || statName.toUpperCase();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  goBack: {
    color: '#d62828',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  image: {
    width: 200,
    height: 200,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 10,
  },
  number: {
    fontSize: 18,
    color: '#888',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typeBadge: {
    backgroundColor: '#e63946',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  typeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 5,
  },
  statBarContainer: {
    marginBottom: 12,
  },
  statName: {
    fontSize: 12,
    color: '#666',
    width: 70,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
    width: 40,
  },
  statBarBackground: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 5,
  },
  statBarFill: {
    height: '100%',
    backgroundColor: '#e63946',
    borderRadius: 4,
  },
  buttonContainer: {
    padding: 20,
  },
  teamButton: {
    backgroundColor: '#e63946',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  teamButtonDisabled: {
    backgroundColor: '#ccc',
  },
  teamButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
