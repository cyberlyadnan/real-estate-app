/**
 * App Navigator - Welcome flow, Main tabs, Property detail
 */

import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import WelcomeScreen from '../screens/WelcomeScreen';
import HomeScreen from '../screens/HomeScreen';
import PropertiesScreen from '../screens/PropertiesScreen';
import PropertyDetailScreen from '../screens/PropertyDetailScreen';
import AdminGateScreen from '../screens/AdminGateScreen';
import MoreScreen from '../screens/MoreScreen';
import AboutScreen from '../screens/AboutScreen';
import ContactScreen from '../screens/ContactScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { useTheme } from '../contexts/ThemeContext';

const WELCOME_KEY = '@real_estate_has_seen_welcome';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MoreStack() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="MoreMain" component={MoreScreen} options={{ headerShown: false }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About Us' }} />
      <Stack.Screen name="Contact" component={ContactScreen} options={{ title: 'Contact' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Stack.Screen name="Admin" component={AdminGateScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, string> = {
            Home: focused ? 'home' : 'home-outline',
            Properties: focused ? 'view-grid' : 'view-grid-outline',
            More: focused ? 'menu' : 'menu',
          };
          return <Icon name={icons[route.name] || 'circle'} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontWeight: '600', fontSize: 12 },
        tabBarShowLabel: true,
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
        name="More"
        component={MoreStack}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'MoreMain';
          return {
            title: 'More',
            headerShown: false,
            tabBarStyle: routeName === 'Admin' ? { display: 'none' } : undefined,
          };
        }}
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
          headerShown: false,
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
