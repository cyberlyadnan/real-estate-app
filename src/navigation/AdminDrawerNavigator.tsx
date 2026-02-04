/**
 * Admin Drawer - Sidebar with Dashboard, Properties, Leads, Queries, Settings
 */

import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminSettingsScreen from '../screens/AdminSettingsScreen';
import AdminPlaceholderScreen from '../screens/AdminPlaceholderScreen';

const Drawer = createDrawerNavigator();

export default function AdminDrawerNavigator() {
  const { colors } = useTheme();

  return (
    <Drawer.Navigator
      screenOptions={({ route }) => ({
        drawerIcon: ({ focused, color, size }) => {
          const icons: Record<string, string> = {
            Dashboard: focused ? 'view-dashboard' : 'view-dashboard-outline',
            Properties: focused ? 'home-city' : 'home-city-outline',
            Leads: focused ? 'target' : 'target',
            Queries: focused ? 'email' : 'email-outline',
            Settings: 'cog',
          };
          return <Icon name={icons[route.name] || 'circle'} size={size} color={color} />;
        },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textMuted,
        drawerStyle: { backgroundColor: colors.card },
        drawerLabelStyle: { fontWeight: '600', fontSize: 15 },
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      })}
    >
      <Drawer.Screen name="Dashboard" component={AdminDashboardScreen} options={{ title: 'Dashboard' }} />
      <Drawer.Screen
        name="Properties"
        component={AdminPlaceholderScreen}
        initialParams={{ title: 'Properties', icon: 'home-city' }}
        options={{ title: 'Properties' }}
      />
      <Drawer.Screen
        name="Leads"
        component={AdminPlaceholderScreen}
        initialParams={{ title: 'Leads', icon: 'target' }}
        options={{ title: 'Leads' }}
      />
      <Drawer.Screen
        name="Queries"
        component={AdminPlaceholderScreen}
        initialParams={{ title: 'Queries', icon: 'email' }}
        options={{ title: 'Queries' }}
      />
      <Drawer.Screen name="Settings" component={AdminSettingsScreen} options={{ title: 'Settings' }} />
    </Drawer.Navigator>
  );
}
