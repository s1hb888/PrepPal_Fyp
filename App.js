import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens (Check filenames and ensure they exist)
import Splash from './frontend/Splash';
import Onboarding from './frontend/Onboarding';
import Registration from './frontend/Registration';
import AboutUs from './frontend/AboutUs';
import Profile from './frontend/Profile';
import Home from './frontend/Home';
import KidHome from './frontend/KidHome';
import Courses from './frontend/Courses';
import LearningMenu from './frontend/LearningMenu';
import parentHome from './frontend/parentHome';
import AcademicLearning from './frontend/AcademicLearning';
import Assessments from './frontend/Assessments';
import Assesment from './frontend/Assesment';
import Settings from './frontend/Settings';
import Login from './frontend/Login';
import GeneralKnowledge from './frontend/GeneralKnowledge';
import EnglishAlphaBetsScreen from './frontend/EnglishAlphaBetsScreen';
import Numbers from './frontend/Numbers';
import Alphabets from './frontend/Alphabets';
import Urdu from './frontend/Urdu';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="Registration" component={Registration} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="KidHome" component={KidHome} />
        <Stack.Screen name="LearningMenu" component={LearningMenu} />
        <Stack.Screen name="parentHome" component={parentHome} />
        <Stack.Screen name="AcademicLearning" component={AcademicLearning} />
        <Stack.Screen name="Assessments" component={Assessments} />
        <Stack.Screen name="Assesment" component={Assesment} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="Courses" component={Courses} />
        <Stack.Screen name="GeneralKnowledge" component={GeneralKnowledge} />
        <Stack.Screen name="EnglishAlphaBetsScreen" component={EnglishAlphaBetsScreen} />
        <Stack.Screen name="Numbers" component={Numbers} />
        <Stack.Screen name="Alphabets" component={Alphabets} />
        <Stack.Screen name="AboutUs" component={AboutUs} />
        <Stack.Screen name="Urdu" component={Urdu} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
