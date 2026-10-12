import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useTeam } from '../context/TeamContext';

export default function TeamScreen() {
  const { team, removeFromTeam, getCombinedStats } = useTeam();
  const combinedStats = getCombinedStats();

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Team</Text>
      <Text style={styles.subtitle}>
        {team.length}/6 Pokémon
      </Text>

      {team.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your team is empty.</Text>
          <Text style={styles.emptySubtext}>
            Add Pokémon from the Detail screen!
          </Text>
        </View>
      ) : (
        <FlatList
          data={team}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image
                source={{
                  uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.id}.png`,
                }}
                style={styles.image}
                resizeMode="contain"
              />
              <Text style={styles.name}>
                {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
              </Text>
              <Text style={styles.number}>#{String(item.id).padStart(3, '0')}</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeFromTeam(item.id)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {team.length > 0 && (
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>Combined Base Stats</Text>
          {Object.entries(combinedStats).map(([statName, value]) => (
            <View key={statName} style={styles.statRow}>
              <Text style={styles.statName}>{getStatName(statName)}</Text>
              <Text style={styles.statValue}>{value}</Text>
            </View>
          ))}
        </View>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#d62828',
    marginHorizontal: 20,
    marginTop: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  list: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    margin: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 3,
  },
  image: {
    width: 120,
    height: 120,
  },
  name: {
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 5,
    color: '#222',
  },
  number: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  removeButton: {
    marginTop: 10,
    backgroundColor: '#d62828',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statsSection: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 20,
    borderRadius: 12,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statName: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
  },
});
