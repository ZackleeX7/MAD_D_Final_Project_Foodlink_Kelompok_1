import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { ComponentProps } from 'react';

type IconName = ComponentProps<typeof Ionicons>['name'];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,

        // 🎨 THEME HIJAU
        tabBarActiveTintColor: '#2ECC71',
        tabBarInactiveTintColor: '#95A5A6',

        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          height: 60,
          borderTopWidth: 0,
          elevation: 5,
        },

        tabBarIcon: ({ color, size }) => {
          let iconName: IconName = 'grid';

          if (route.name === 'index') {
            iconName = 'grid';
          } else if (route.name === 'donate') {
            iconName = 'add-circle';
          } else if (route.name === 'track') {
            iconName = 'bar-chart';
          } else if (route.name === 'profile') {
            iconName = 'person';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      {/* Dashboard */}
      <Tabs.Screen
        name="index"
        options={{ title: 'Dashboard' }}
      />

      {/* Donate (highlight hijau gelap) */}
      <Tabs.Screen
        name="donate"
        options={{
          title: 'Donate'}}
      />

      {/* Track */}
      <Tabs.Screen
        name="track"
        options={{ title: 'Track' }}
      />

      {/* Profile */}
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile' }}
      />
    </Tabs>
  );
}