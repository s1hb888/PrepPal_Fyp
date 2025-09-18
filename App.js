// App.js
import React, { useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SessionProvider } from './SessionContext';
import VerifyEmail from './frontend/VerifyEmail';
import * as Linking from 'expo-linking';


/* ------------- Screens ------------- */
import Splash from './frontend/Splash';
import Onboarding from './frontend/Onboarding';
import QuizScreen from './frontend/QuizScreen';
import Registration from './frontend/Registration';
import Login from './frontend/Login';
import ResetPassword from './frontend/ResetPassword';
import Profile from './frontend/Profile';
import Home from './frontend/Home';
import FeedbackScreen from './frontend/FeedbackScreen';


/* KID SCREENS */
import KidHome from './frontend/KidHome';
import Courses from './frontend/Courses';
import LearningMenu from './frontend/LearningMenu';
import AcademicLearning from './frontend/AcademicLearning';
import Assessments from './frontend/Assessments';
import Assesment from './frontend/Assesment';
import GeneralKnowledge from './frontend/GeneralKnowledge';
import EnglishAlphaBetsScreen from './frontend/EnglishAlphaBetsScreen';
import Numbers from './frontend/Numbers';
import Alphabets from './frontend/Alphabets';
import Urdu from './frontend/Urdu';
import VowelScreen from './frontend/VowelsScreen';
import BodypartsScreen from './frontend/BodypartsScreen';
import ShapeLearning from './frontend/ShapeLearning';
import FruitScreen from './frontend/FruitScreen';
import VegetableScreen from './frontend/VegetableScreen';
import Color from './frontend/Color';
import WatchVideoScreen from './frontend/WatchVideosScreen';
import LearnIslamicStudies from './frontend/LearnIslamicStudies'; 
import BasicQuestionsScreen from './frontend/BasicQuestionsScreen';
import DuaScreen from './frontend/DuaScreen';
import WorshipPracticeScreen from './frontend/WorshipPracticeScreen';
/* PARENT / SHARED */
import Settings from './frontend/Settings';
import AboutUs from './frontend/AboutUs';
import NumberAccessScreen from './frontend/NumberAccessScreen';
import UrduAccessScreen from './frontend/UrduAccessScreen';
import AlphabetsAccessScreen from './frontend/AlphabetsAccessScreen';
import AccessManagement from './frontend/AccessManagement';
import ScreenTimeControl from './frontend/ScreenTimeControl';

const Stack = createStackNavigator();

/** ✅ ONLY kid routes here – lock modal shows on these */
const includedScreens = [
  'KidHome',
  'Courses',
  'LearningMenu',
  'AcademicLearning',
  'Assessments',
  'Assesment',
  'GeneralKnowledge',
  'EnglishAlphaBetsScreen',
  'Numbers',
  'Alphabets',
  'Urdu',
  'VowelScreen',
  'BodypartsScreen',
  'ShapeLearning',
  'FruitScreen',
  'VegetableScreen',
  'Color',
  'WatchVideoScreen',
  'LearnIslamicStudies',
  'DuaScreen',
  'WorshipPracticeScreen',
  'BasicQuestionsScreen',
  'QuizScreen',
];

export default function App() {
  const navigationRef = useRef();
  const sessionRef = useRef({ checkSession: () => {} });

const linking = {
  prefixes: ["preppal://"], 
  config: {
    screens: {
      VerifyEmail: "verify",
      Login: "login",
    },
  },
};



  return (
    <SessionProvider
      navigationRef={navigationRef}
      includedScreens={includedScreens}
      sessionRef={sessionRef}  // Pass sessionRef for all session checks
    >
      <NavigationContainer
        ref={navigationRef}
         linking={linking} 
        onStateChange={() => {
          // ✅ Existing behavior: check session on navigation state change
          sessionRef.current?.checkSession?.();
        }}
      >
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
          {/* Splash / Auth */}
          <Stack.Screen name="Splash" component={Splash} />
          <Stack.Screen name="Onboarding" component={Onboarding} />
          <Stack.Screen name="Registration" component={Registration} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="ResetPassword" component={ResetPassword} />


          {/* Parent / Shared */}
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Feedback" component={FeedbackScreen} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="AboutUs" component={AboutUs} />
          <Stack.Screen name="NumberAccessScreen" component={NumberAccessScreen} />
          <Stack.Screen name="UrduAccessScreen" component={UrduAccessScreen} />
          <Stack.Screen name="AlphabetsAccessScreen" component={AlphabetsAccessScreen} />
          <Stack.Screen name="AccessManagement" component={AccessManagement} />
          <Stack.Screen name="ScreenTimeControl" component={ScreenTimeControl} />
          <Stack.Screen name="VerifyEmail" component={VerifyEmail} />


          {/* Kid Screens */}
          <Stack.Screen name="KidHome" component={KidHome} />
          <Stack.Screen name="Courses" component={Courses} />
          <Stack.Screen name="LearningMenu" component={LearningMenu} />
          <Stack.Screen name="AcademicLearning" component={AcademicLearning} />
          <Stack.Screen name="Assessments" component={Assessments} />
          <Stack.Screen name="Assesment" component={Assesment} />
          <Stack.Screen name="GeneralKnowledge" component={GeneralKnowledge} />
          <Stack.Screen name="EnglishAlphaBetsScreen" component={EnglishAlphaBetsScreen} />
          <Stack.Screen name="Numbers" component={Numbers} />
          <Stack.Screen name="Alphabets" component={Alphabets} />
          <Stack.Screen name="Urdu" component={Urdu} />
          <Stack.Screen name="VowelScreen" component={VowelScreen} />
          <Stack.Screen name="BodypartsScreen" component={BodypartsScreen} />
          <Stack.Screen name="ShapeLearning" component={ShapeLearning} />
          <Stack.Screen name="FruitScreen" component={FruitScreen} />
          <Stack.Screen name="VegetableScreen" component={VegetableScreen} />
          <Stack.Screen name="Color" component={Color} />
          <Stack.Screen name="WatchVideoScreen" component={WatchVideoScreen} />
          <Stack.Screen name="LearnIslamicStudies" component={LearnIslamicStudies}/>
          <Stack.Screen name="DuaScreen" component={DuaScreen} />
          <Stack.Screen name="WorshipPracticeScreen" component={WorshipPracticeScreen} />
          <Stack.Screen name="BasicQuestionsScreen" component={BasicQuestionsScreen} />
          <Stack.Screen name="QuizScreen" component={QuizScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SessionProvider>
  );
}
