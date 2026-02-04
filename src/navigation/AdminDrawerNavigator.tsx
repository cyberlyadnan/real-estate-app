/**
 * Admin Drawer - Sidebar with Dashboard, Properties, Leads, Queries, Settings
 * + "Back to App" to return to customer flow
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminSettingsScreen from '../screens/AdminSettingsScreen';
import AdminPlaceholderScreen from '../screens/AdminPlaceholderScreen';

const Drawer = createDrawerNavigator();

function AdminDrawerContent(props: DrawerContentComponentProps) {
  const { colors } = useTheme();
  const { state, navigation } = props;

  const goBackToApp = () => {
    navigation.closeDrawer();
    const parent = navigation.getParent();
    if (parent?.canGoBack()) {
      parent.goBack();
    }
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerScroll}>
      <View style={styles.drawerItems}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const icons: Record<string, string> = {
            Dashboard: focused ? 'view-dashboard' : 'view-dashboard-outline',
            Properties: focused ? 'home-city' : 'home-city-outline',
            Leads: 'target',
            Queries: focused ? 'email' : 'email-outline',
            Settings: 'cog',
          };
          return (
            <TouchableOpacity
              key={route.key}
              style={[
                styles.drawerRow,
                focused && { backgroundColor: colors.primary + '18' },
              ]}
              onPress={() => navigation.navigate(route.name)}
            >
              <Icon name={icons[route.name] || 'circle'} size={24} color={focused ? colors.primary : colors.textMuted} />
              <Text style={[styles.drawerLabel, { color: focused ? colors.primary : colors.text }]}>
                {route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={[styles.backToAppWrap, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.backToAppBtn, { backgroundColor: colors.primary + '20', borderColor: colors.primary + '50' }]}
          onPress={goBackToApp}
        >
          <Icon name="exit-to-app" size={24} color={colors.primary} />
          <Text style={[styles.backToAppText, { color: colors.primary }]}>Back to App</Text>
        </TouchableOpacity>
        <Text style={[styles.backToAppHint, { color: colors.textMuted }]}>
          Return to customer experience
        </Text>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  drawerScroll: { flexGrow: 1 },
  drawerItems: { flex: 1, paddingVertical: 8 },
  drawerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 16,
  },
  drawerLabel: { fontSize: 16, fontWeight: '600' },
  backToAppWrap: {
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  backToAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  backToAppText: { fontSize: 16, fontWeight: '700' },
  backToAppHint: { fontSize: 12, marginTop: 8, textAlign: 'center' },
});

export default function AdminDrawerNavigator() {
  const { colors } = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <AdminDrawerContent {...props} />}
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
      <Drawer.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{
          title: 'Dashboard',
          headerStatusBarHeight: 0,
        }}
      />
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
