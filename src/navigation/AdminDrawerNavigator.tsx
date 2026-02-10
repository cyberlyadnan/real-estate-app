/**
 * Admin Drawer - Sidebar from RIGHT, Back (left) + Menu (right) in header
 * + "Back to App" + "Log out" to return to customer flow
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { DrawerActions, CommonActions, getFocusedRouteNameFromRoute } from '@react-navigation/native';
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

const DRAWER_WIDTH_PERCENT = 0.9;
const getDrawerWidth = () => Math.round(Dimensions.get('window').width * DRAWER_WIDTH_PERCENT);

function AdminDrawerContent(props: DrawerContentComponentProps) {
  const { colors, theme } = useTheme();
  const { logout } = useAuth();
  const isDark = theme === 'dark';
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

  const labelColor = isDark ? '#E5E7EB' : '#1F2937';
  const labelColorFocused = colors.primary;

  return (
    <View style={[styles.drawerContainer, { backgroundColor: colors.card }]}>
      {/* Top: App name + logo */}
      <View style={[styles.drawerHeader, { backgroundColor: colors.primary + '18', borderBottomColor: colors.border }]}>
        <View style={[styles.logoWrap, { backgroundColor: colors.primary }]}>
          <Icon name="domain" size={32} color="#fff" />
        </View>
        <Text style={[styles.appName, { color: colors.text }]} numberOfLines={1}>
          Real Estate
        </Text>
        <Text style={[styles.appSub, { color: colors.textSecondary }]}>Admin Panel</Text>
      </View>

      {/* Middle: Scrollable menu */}
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.drawerScrollContent}
        style={[styles.drawerScrollView, { backgroundColor: colors.card }]}
        showsVerticalScrollIndicator={false}
      >
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
                  { backgroundColor: colors.card },
                  focused && { backgroundColor: colors.primary + '22' },
                ]}
                onPress={() => { navigation.closeDrawer(); navigation.navigate(route.name); }}
              >
                <Icon name={icons[route.name] || 'circle'} size={24} color={focused ? colors.primary : colors.textMuted} />
                <Text
                  style={[styles.drawerLabel, { color: focused ? labelColorFocused : labelColor }]}
                  numberOfLines={1}
                >
                  {route.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </DrawerContentScrollView>

      {/* Bottom: Back to App + Log out (sticky) */}
      <View style={[styles.drawerFooter, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.backToAppBtn, { backgroundColor: colors.primary + '22', borderColor: colors.primary + '50' }]}
          onPress={goBackToApp}
        >
          <Icon name="exit-to-app" size={22} color={colors.primary} />
          <Text style={[styles.backToAppText, { color: colors.primary }]} numberOfLines={1}>Back to App</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.error + '18', borderColor: colors.error + '50' }]}
          onPress={handleLogout}
        >
          <Icon name="logout" size={22} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]} numberOfLines={1}>Log out</Text>
        </TouchableOpacity>
        <Text style={[styles.backToAppHint, { color: colors.textMuted }]} numberOfLines={2}>
          Return to customer experience
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  drawerContainer: {
    flex: 1,
    width: '100%',
  },
  drawerHeader: {
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderBottomWidth: 1,
    // alignItems: 'center',
  },
  logoWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  appSub: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '600',
  },
  drawerScrollView: {
    flex: 1,
    width: '100%',
  },
  drawerScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
  },
  drawerItems: {
    paddingVertical: 4,
  },
  drawerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 14,
    borderRadius: 12,
    marginBottom: 6,
    minWidth: 0,
  },
  drawerLabel: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    minWidth: 0,
  },
  drawerFooter: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    gap: 12,
  },
  backToAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    width: '90%',
  },
  backToAppText: { fontSize: 16, fontWeight: '700' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    width: '90%',
  },
  logoutText: { fontSize: 16, fontWeight: '700' },
  backToAppHint: { fontSize: 12, marginTop: 4, textAlign: 'center' },
});

export default function AdminDrawerNavigator() {
  const { colors } = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <AdminDrawerContent {...props} />}
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
        drawerPosition: 'right',
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textMuted,
        drawerStyle: { backgroundColor: colors.card, width: getDrawerWidth(), right: 0 },
        drawerLabelStyle: { fontWeight: '600', fontSize: 15 },
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.dispatch(CommonActions.goBack())}
            style={styles.headerBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Icon name="chevron-left" size={28} color={colors.primary} />
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
          drawerPosition: 'right',
        }}
      />
      <Drawer.Screen
        name="Properties"
        component={AdminPropertiesStack}
        options={({ route }) => {
          const focused = getFocusedRouteNameFromRoute(route) ?? 'PropertyList';
          const title = focused === 'PropertyAdd' ? 'Add Property' : focused === 'PropertyEdit' ? 'Edit Property' : 'Properties';
          return { title, headerStatusBarHeight: 0, drawerPosition: 'right' };
        }}
      />
      <Drawer.Screen
        name="Leads"
        component={AdminLeadsStack}
        options={({ route }) => {
          const focused = getFocusedRouteNameFromRoute(route) ?? 'LeadOverview';
          const title = focused === 'DueLeads' ? 'Due Leads' : focused === 'LeadDetail' ? 'Lead' : focused === 'LeadForm' ? 'Add Lead' : focused === 'LeadList' ? 'All Leads' : 'Leads';
          return { title, headerStatusBarHeight: 0, drawerPosition: 'right' };
        }}
      />
      <Drawer.Screen
        name="Queries"
        component={AdminQueriesStack}
        options={({ route }) => {
          const focused = getFocusedRouteNameFromRoute(route) ?? 'QueryList';
          const title = focused === 'QueryDetail' ? 'Query' : 'Queries';
          return { title, headerStatusBarHeight: 0, drawerPosition: 'right' };
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={AdminSettingsScreen}
        options={{ title: 'Settings', headerStatusBarHeight: 0, drawerPosition: 'right' }}
      />
    </Drawer.Navigator>
  );
}
