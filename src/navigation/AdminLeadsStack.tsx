/**
 * Admin Leads Stack - Overview → List → Detail | Form
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import AdminLeadOverviewScreen from '../screens/AdminLeadOverviewScreen';
import AdminLeadsListScreen from '../screens/AdminLeadsListScreen';
import AdminDueLeadsScreen from '../screens/AdminDueLeadsScreen';
import AdminLeadDetailScreen from '../screens/AdminLeadDetailScreen';
import AdminLeadFormScreen from '../screens/AdminLeadFormScreen';

const Stack = createNativeStackNavigator();

export default function AdminLeadsStack() {
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
        name="LeadOverview"
        component={AdminLeadOverviewScreen}
        options={{ title: 'Leads', headerShown: false }}
      />
      <Stack.Screen
        name="LeadList"
        component={AdminLeadsListScreen}
        options={{ title: 'All Leads', headerShown: false }}
      />
      <Stack.Screen
        name="DueLeads"
        component={AdminDueLeadsScreen}
        options={{ title: 'Due Leads', headerShown: false }}
      />
      <Stack.Screen
        name="LeadDetail"
        component={AdminLeadDetailScreen}
        options={{ title: 'Lead Details', headerBackTitle: 'Back', headerShown: false }}
      />
      <Stack.Screen
        name="LeadForm"
        component={AdminLeadFormScreen}
        options={{ title: 'Add Lead', headerBackTitle: 'Back', headerShown: false }}
      />
    </Stack.Navigator>
  );
}
