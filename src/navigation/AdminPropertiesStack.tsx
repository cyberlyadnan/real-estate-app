/**
 * Properties Stack - List, Add, Edit
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import AdminPropertiesListScreen from '../screens/AdminPropertiesListScreen';
import AdminPropertyFormScreen from '../screens/AdminPropertyFormScreen';

const Stack = createNativeStackNavigator();

export default function AdminPropertiesStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerStatusBarHeight: 0,
        contentStyle: { paddingTop: 0 },
      }}
    >
      <Stack.Screen
        name="PropertyList"
        component={AdminPropertiesListScreen}
        options={{ title: 'Properties' }}
      />
      <Stack.Screen
        name="PropertyAdd"
        component={AdminPropertyFormScreen}
        options={{ title: 'Add Property' }}
      />
      <Stack.Screen
        name="PropertyEdit"
        component={AdminPropertyFormScreen}
        options={{ title: 'Edit Property' }}
      />
    </Stack.Navigator>
  );
}
