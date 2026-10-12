import { Image, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function PokemonCard({ id, name, image, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: image }}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.number}>
        #{String(id).padStart(3, '0')}
      </Text>
      <Text style={styles.name}>
        {name.charAt(0).toUpperCase() + name.slice(1)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
  number: {
    color: '#888',
    fontSize: 12,
    marginTop: 5,
  },
  name: {
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 4,
    color: '#222',
  },
});
