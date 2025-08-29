// App.js
import React, { useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SessionProvider } from './SessionContext';

/* ------------- Screens ------------- */
import Splash from './frontend/Splash';
import Onboarding from './frontend/Onboarding';
import Registration from './frontend/Registration';
import Login from './frontend/Login';
import Profile from './frontend/Profile';
import Home from './frontend/Home';
import RatingScreen from './frontend/RatingScreen';

/* KID SCREENS */
import KidHome from './frontend/kidHome';
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
import BasicBeliefsScreen from './frontend/BasicBeliefsScreen';

/* PARENT / SHARED */
import Settings from './frontend/Settings';
import AboutUs from './frontend/AboutUs';
import NumberAccessScreen from './frontend/NumberAccessScreen';
import UrduAccessScreen from './frontend/UrduAccessScreen';
import AlphabetsAccessScreen from './frontend/AlphabetsAccessScreen';
import AccessManagement from './frontend/AccessManagement';
import ScreenTimeControl from './frontend/ScreenTimeControl';
import DuaScreen from './frontend/DuaScreen';
import WorshipPracticeScreen from './frontend/WorshipPracticeScreen';

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
  'BasicBeliefsScreen',
];


export default function App() {
  const navigationRef = useRef();
  const sessionRef = useRef({ checkSession: () => {} });

  return (
    <SessionProvider
      navigationRef={navigationRef}
      includedScreens={includedScreens}
      sessionRef={sessionRef}  // Pass sessionRef here
    >
      <NavigationContainer
        ref={navigationRef}
        onStateChange={() => {
          sessionRef.current.checkSession();
        }}
      >
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
          {/* splash / auth */}
          <Stack.Screen name="Splash" component={Splash} />
          <Stack.Screen name="Onboarding" component={Onboarding} />
          <Stack.Screen name="Registration" component={Registration} />
          <Stack.Screen name="Login" component={Login} />

          {/* parent */}
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="Home" component={Home} />
           <Stack.Screen name="Rating" component={RatingScreen} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="AboutUs" component={AboutUs} />
          <Stack.Screen name="NumberAccessScreen" component={NumberAccessScreen} />
          <Stack.Screen name="UrduAccessScreen" component={UrduAccessScreen} />
          <Stack.Screen name="AlphabetsAccessScreen" component={AlphabetsAccessScreen} />
          <Stack.Screen name="AccessManagement" component={AccessManagement} />
          <Stack.Screen name="ScreenTimeControl" component={ScreenTimeControl} />

          {/* kid */}
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
          <Stack.Screen name="IslamicScreen" component={LearnIslamicStudies}/>
          <Stack.Screen name="WatchVideoScreen" component={WatchVideoScreen} />
          <Stack.Screen name="DuaScreen" component={DuaScreen} />
          <Stack.Screen name="WorshipPracticeScreen" component={WorshipPracticeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="BasicBeliefsScreen" component={BasicBeliefsScreen} />

        </Stack.Navigator>
      </NavigationContainer>
    </SessionProvider>
  );
}

