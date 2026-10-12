import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TeamContext = createContext();

const TEAM_STORAGE_KEY = '@pokedex_team';

export function TeamProvider({ children }) {
  const [team, setTeam] = useState([]);
  const isLoadedRef = useRef(false);

  const loadTeam = useCallback(async () => {
    try {
      const storedTeam = await AsyncStorage.getItem(TEAM_STORAGE_KEY);
      if (storedTeam) {
        setTeam(JSON.parse(storedTeam));
      }
    } catch (_err) {
      console.error('Error loading team from storage');
    } finally {
      isLoadedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!isLoadedRef.current) {
      loadTeam();
    }
  }, [loadTeam]);

  async function saveTeam(newTeam) {
    try {
      await AsyncStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(newTeam));
      setTeam(newTeam);
    } catch (_err) {
      console.error('Error saving team to storage');
    }
  }

  function addToTeam(pokemon) {
    if (team.length >= 6) {
      return false;
    }

    if (team.some((member) => member.id === pokemon.id)) {
      return false;
    }

    const newTeam = [...team, pokemon];
    saveTeam(newTeam);
    return true;
  }

  function removeFromTeam(pokemonId) {
    const newTeam = team.filter((member) => member.id !== pokemonId);
    saveTeam(newTeam);
  }

  function isInTeam(pokemonId) {
    return team.some((member) => member.id === pokemonId);
  }

  function getCombinedStats() {
    if (team.length === 0) {
      return {
        hp: 0,
        attack: 0,
        defense: 0,
        'special-attack': 0,
        'special-defense': 0,
        speed: 0,
      };
    }

    const stats = {
      hp: 0,
      attack: 0,
      defense: 0,
      'special-attack': 0,
      'special-defense': 0,
      speed: 0,
    };

    team.forEach((member) => {
      member.stats.forEach((stat) => {
        stats[stat.stat.name] += stat.base_stat;
      });
    });

    return stats;
  }

  return (
    <TeamContext.Provider
      value={{
        team,
        addToTeam,
        removeFromTeam,
        isInTeam,
        getCombinedStats,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}
