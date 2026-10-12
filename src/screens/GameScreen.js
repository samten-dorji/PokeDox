import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { fetchPokemonDetails } from '../api';

const FIRST_151_POKEMON = 151;

export default function GameScreen() {
  const [currentPokemon, setCurrentPokemon] = useState(null);
  const [choices, setChoices] = useState([]);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const isLoadedRef = useRef(false);

  async function generateIncorrectChoices(correctId) {
    const incorrect = [];
    const usedIds = new Set([correctId]);

    while (incorrect.length < 3) {
      const randomId = Math.floor(Math.random() * FIRST_151_POKEMON) + 1;

      if (!usedIds.has(randomId)) {
        usedIds.add(randomId);

        try {
          const pokemon = await fetchPokemonDetails(randomId);
          incorrect.push({
            id: randomId,
            name: pokemon.name,
            correct: false,
          });
        } catch (_err) {
          console.error('Error loading incorrect choice');
        }
      }
    }

    return incorrect;
  }

  function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  const loadNewRound = useCallback(async () => {
    try {
      setLoading(true);
      setAnswered(false);
      setSelectedAnswer(null);
      setHintUsed(false);

      const randomId = Math.floor(Math.random() * FIRST_151_POKEMON) + 1;

      const pokemon = await fetchPokemonDetails(randomId);
      setCurrentPokemon(pokemon);

      const incorrectChoices = await generateIncorrectChoices(randomId);
      const allChoices = shuffleArray([
        { id: randomId, name: pokemon.name, correct: true },
        ...incorrectChoices,
      ]);

      setChoices(allChoices);
    } catch (_err) {
      console.error('Error loading game round');
    } finally {
      setLoading(false);
      isLoadedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!isLoadedRef.current) {
      loadNewRound();
    }
  }, [loadNewRound]);

  function handleAnswer(choice) {
    if (answered) return;

    setAnswered(true);
    setSelectedAnswer(choice.id);

    if (choice.correct) {
      setScore((prev) => prev + 1);
      setStreak((prev) => {
        const newStreak = prev + 1;
        if (newStreak > bestStreak) {
          setBestStreak(newStreak);
        }
        return newStreak;
      });
    } else {
      setStreak(0);
    }
  }

  if (loading || !currentPokemon) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e63946" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>Score: {score}</Text>
        <Text style={styles.streakText}>Streak: {streak}</Text>
        <Text style={styles.bestStreakText}>Best: {bestStreak}</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${currentPokemon.id}.png`,
          }}
          style={styles.pokemonImage}
          resizeMode="contain"
        />
        {!answered && (
          <Image
            source={{
              uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${currentPokemon.id}.png`,
            }}
            style={[styles.pokemonImage, styles.silhouetteOverlay]}
            resizeMode="contain"
          />
        )}
      </View>

      {hintUsed && !answered && (
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>Type: </Text>
          {currentPokemon.types.map((typeInfo) => (
            <View key={typeInfo.type.name} style={styles.typeBadge}>
              <Text style={styles.typeText}>
                {typeInfo.type.name.charAt(0).toUpperCase() +
                  typeInfo.type.name.slice(1)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {!answered && !hintUsed && (
        <TouchableOpacity
          style={styles.hintButton}
          onPress={() => setHintUsed(true)}
        >
          <Text style={styles.hintButtonText}>💡 Show Type Hint</Text>
        </TouchableOpacity>
      )}

      <View style={styles.choicesContainer}>
        {choices.map((choice) => (
          <TouchableOpacity
            key={choice.id}
            style={[
              styles.choiceButton,
              answered &&
                choice.id === selectedAnswer &&
                (choice.correct ? styles.correct : styles.wrong),
              answered &&
                choice.correct &&
                styles.correctAnswer,
            ]}
            onPress={() => handleAnswer(choice)}
            disabled={answered}
          >
            <Text style={styles.choiceText}>
              {choice.name.charAt(0).toUpperCase() + choice.name.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {answered && (
        <TouchableOpacity
          style={styles.nextButton}
          onPress={loadNewRound}
        >
          <Text style={styles.nextButtonText}>Next Pokémon</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e63946',
  },
  bestStreakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 250,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
  },
  pokemonImage: {
    width: 200,
    height: 200,
  },
  silhouetteOverlay: {
    position: 'absolute',
    tintColor: '#000',
  },
  hintContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  hintText: {
    fontSize: 16,
    color: '#666',
    marginRight: 5,
  },
  typeBadge: {
    backgroundColor: '#e63946',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  typeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  hintButton: {
    backgroundColor: '#ffcb05',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  hintButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  choicesContainer: {
    marginBottom: 20,
  },
  choiceButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  choiceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  correct: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  wrong: {
    backgroundColor: '#f44336',
    borderColor: '#f44336',
  },
  correctAnswer: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  nextButton: {
    backgroundColor: '#e63946',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
