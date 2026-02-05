/**
 * Queries Stack - List + Detail
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import AdminQueriesListScreen from '../screens/AdminQueriesListScreen';
import AdminQueryDetailScreen from '../screens/AdminQueryDetailScreen';

const Stack = createNativeStackNavigator();

export default function AdminQueriesStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerStatusBarHeight: 0,
        contentStyle: { paddingTop: 0 },
      }}
    >
      <Stack.Screen
        name="QueryList"
        component={AdminQueriesListScreen}
        options={{ title: 'Queries', headerShown: false, headerBackTitle: 'Back' }}
      />
      <Stack.Screen
        name="QueryDetail"
        component={AdminQueryDetailScreen}
        options={{ title: 'Query Details', headerBackTitle: 'Back', headerShown: false }}
      />
    </Stack.Navigator>
  );
}
