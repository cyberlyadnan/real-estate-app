/**
 * Real Estate App - Admin & User Management
 * Light/Dark theme, Welcome screen
 * @format
 */

import React from 'react';
import { StatusBar, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

function AppContent() {
  const { theme, colors } = useTheme();
  const isDark = theme === 'dark';
  // Status bar: dark theme = dark bar + light text; light theme = light bar + dark text
  const statusBarStyle = isDark ? 'light-content' : 'dark-content';
  const statusBarBg = Platform.OS === 'android' ? colors.bg : undefined;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={statusBarBg}
      />
      <AppNavigator />
    </SafeAreaView>
  );
}

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <SafeAreaProvider>
          <AuthProvider>
            <NavigationContainer>
              <AppContent />
            </NavigationContainer>
          </AuthProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default App;
