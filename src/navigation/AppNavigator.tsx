/**
 * App Navigator - Welcome flow, Main tabs, Property detail
 */

import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import WelcomeScreen from '../screens/WelcomeScreen';
import HomeScreen from '../screens/HomeScreen';
import PropertiesScreen from '../screens/PropertiesScreen';
import PropertyDetailScreen from '../screens/PropertyDetailScreen';
import AdminScreen from '../screens/AdminScreen';
import { useTheme } from '../contexts/ThemeContext';

const WELCOME_KEY = '@real_estate_has_seen_welcome';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, string> = {
            Home: focused ? 'home' : 'home-outline',
            Properties: focused ? 'view-grid' : 'view-grid-outline',
            Admin: focused ? 'shield-account' : 'shield-account-outline',
          };
          return <Icon name={icons[route.name] || 'circle'} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontWeight: '500', fontSize: 12 },
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Home', headerShown: false }}
      />
      <Tab.Screen
        name="Properties"
        component={PropertiesScreen}
        options={{ title: 'Properties', headerShown: false }}
      />
      <Tab.Screen
        name="Admin"
        component={AdminScreen}
        options={{ title: 'Admin' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { colors } = useTheme();
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(WELCOME_KEY).then((value) => {
      setHasSeenWelcome(value === 'true');
    });
  }, []);

  const handleGetStarted = () => {
    AsyncStorage.setItem(WELCOME_KEY, 'true');
    setHasSeenWelcome(true);
  };

  if (hasSeenWelcome === null) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
      initialRouteName={hasSeenWelcome ? 'Main' : 'Welcome'}
    >
      {!hasSeenWelcome && (
        <Stack.Screen name="Welcome">
          {() => <WelcomeScreen onGetStarted={handleGetStarted} />}
        </Stack.Screen>
      )}
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen
        name="PropertyDetail"
        component={PropertyDetailScreen}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerTitle: '',
          headerBackTitle: 'Back',
          headerShadowVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}
