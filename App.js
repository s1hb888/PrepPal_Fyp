import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens (Check filenames and ensure they exist)
import Splash from './frontend/Splash';
import Onboarding from './frontend/Onboarding';
import Registration from './frontend/Registration';
import Profile from './frontend/Profile';
import Home from './frontend/Home';
import AcademicLearning from './frontend/AcademicLearning';
import Assessments from './frontend/Assessments';
import Settings from './frontend/Settings';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="Registration" component={Registration} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="AcademicLearning" component={AcademicLearning} />
        <Stack.Screen name="Assessments" component={Assessments} />
        <Stack.Screen name="Settings" component={Settings} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
