import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import PokedexScreen from '../screens/PokedexScreen';
import TeamScreen from '../screens/TeamScreen';
import GameScreen from '../screens/GameScreen';
import DetailScreen from '../screens/DetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function PokedexStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Pokedex"
        component={PokedexScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{ title: 'Pokémon Details' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Pokédex') {
              iconName = focused ? 'book' : 'book-outline';
            } else if (route.name === 'My Team') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Game') {
              iconName = focused ? 'game-controller' : 'game-controller-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#d62828',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Pokédex" component={PokedexStack} />
        <Tab.Screen name="My Team" component={TeamScreen} />
        <Tab.Screen name="Game" component={GameScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
