/**
 * Admin Drawer - Sidebar from RIGHT, Back (left) + Menu (right) in header
 * + "Back to App" + "Log out" to return to customer flow
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { DrawerActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminSettingsScreen from '../screens/AdminSettingsScreen';
import AdminPlaceholderScreen from '../screens/AdminPlaceholderScreen';
import AdminPropertiesStack from './AdminPropertiesStack';
import AdminLeadsStack from './AdminLeadsStack';
import AdminQueriesStack from './AdminQueriesStack';

const Drawer = createDrawerNavigator();

function AdminDrawerContent(props: DrawerContentComponentProps) {
  const { colors } = useTheme();
  const { logout } = useAuth();
  const { state, navigation } = props;

  const goBackToApp = () => {
    navigation.closeDrawer();
    const parent = navigation.getParent();
    if (parent?.canGoBack()) {
      parent.goBack();
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log out', style: 'destructive', onPress: async () => {
          navigation.closeDrawer();
          await logout();
        }},
      ]
    );
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
              {/* <Text style={[styles.drawerLabel, { color: focused ? colors.primary : colors.text }]}>
                {route.name}
              </Text> */}
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={[styles.drawerFooter, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.backToAppBtn, { backgroundColor: colors.primary + '20', borderColor: colors.primary + '50' }]}
          onPress={goBackToApp}
        >
          <Icon name="exit-to-app" size={24} color={colors.primary} />
          <Text style={[styles.backToAppText, { color: colors.primary }]}>Back to App</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.error + '15', borderColor: colors.error + '40' }]}
          onPress={handleLogout}
        >
          <Icon name="logout" size={24} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Log out</Text>
        </TouchableOpacity>
        <Text style={[styles.backToAppHint, { color: colors.textMuted }]}>
          Return to customer experience
        </Text>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  headerBackText: { fontSize: 16, fontWeight: '600' },
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
  drawerFooter: {
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 10,
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
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  logoutText: { fontSize: 15, fontWeight: '700' },
  backToAppHint: { fontSize: 12, marginTop: 4, textAlign: 'center' },
});

export default function AdminDrawerNavigator() {
  const { colors } = useTheme();

  const goBackToApp = (navigation: any) => {
    navigation.closeDrawer();
    const parent = navigation.getParent();
    if (parent?.canGoBack()) {
      parent.goBack();
    }
  };

  return (
    <Drawer.Navigator
      drawerContent={(props) => <AdminDrawerContent {...props} />}
      drawerPosition="right"
      screenOptions={({ route, navigation }) => ({
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
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => goBackToApp(navigation)}
            style={styles.headerBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Icon name="arrow-left" size={24} color={colors.primary} />
            <Text style={[styles.headerBackText, { color: colors.primary }]}>Back</Text>
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={styles.headerBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Icon name="menu" size={26} color={colors.text} />
          </TouchableOpacity>
        ),
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
        component={AdminPropertiesStack}
        options={{ title: 'Properties', headerStatusBarHeight: 0 }}
      />
      <Drawer.Screen
        name="Leads"
        component={AdminLeadsStack}
        options={{ title: 'Leads', headerStatusBarHeight: 0 }}
      />
      <Drawer.Screen
        name="Queries"
        component={AdminQueriesStack}
        options={{ title: 'Queries', headerStatusBarHeight: 0 }}
      />
      <Drawer.Screen
        name="Settings"
        component={AdminSettingsScreen}
        options={{ title: 'Settings', headerStatusBarHeight: 0 }}
      />
    </Drawer.Navigator>
  );
}
