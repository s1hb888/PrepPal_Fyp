import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  Alert,
  useColorScheme,
  Platform,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const MINT = 'rgb(160,240,220)';
const RED  = '#EF3349';

const Settings = () => {
  const systemScheme = useColorScheme();
  const [darkMode, setDarkMode] = useState(systemScheme === 'dark');
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  /************ MICROPHONE PERMISSION (no external lib) *************/
  const askMicPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'PrepPal needs microphone access for voice recognition.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    // iOS – open settings prompt
    Alert.alert(
      'Microphone Permission',
      'Please enable microphone access for PrepPal in Settings > Privacy > Microphone.',
      [
        { text: 'Open Settings', onPress: () => Linking.openURL('app-settings:') },
        { text: 'OK' },
      ],
    );
    return false;
  };

  /************ COMPONENTS *************/
  const SectionHeader = ({ title }) => (
    <Text style={[styles.sectionHeader, darkMode && { color: '#fff' }]}>{title}</Text>
  );

  const SettingItem = ({ icon, label, onPress, isSwitch, switchValue, onSwitch }) => (
    <TouchableOpacity
      style={[styles.settingItem, darkMode && { backgroundColor: '#222' }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.row}>
        <Icon name={icon} size={24} color={RED} />
        <Text style={[styles.itemText, darkMode && { color: '#fff' }]}>{label}</Text>
      </View>
      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitch}
          thumbColor={switchValue ? MINT : '#f4f3f4'}
          trackColor={{ false: '#ccc', true: MINT }}
        />
      ) : (
        <Icon name="chevron-right" size={22} color={RED} />
      )}
    </TouchableOpacity>
  );

  /************ HANDLERS *************/
  const toggleVoice = async () => {
    if (!voiceEnabled) {
      const ok = await askMicPermission();
      if (!ok) return;
    }
    setVoiceEnabled(!voiceEnabled);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, darkMode && { backgroundColor: '#111' }] }>
      <View style={styles.header}>
        <Text style={[styles.title, darkMode && { color: '#fff' }]}>Settings</Text>
      </View>

      <View style={styles.body}>
        <SectionHeader title="Account" />
        <SettingItem
          icon="account-circle-outline"
          label="Manage Profile"
          onPress={() => Alert.alert('Profile', 'Edit Profile pressed')}
        />

        <SectionHeader title="App Preferences" />
        <SettingItem
          icon="bell-outline"
          label="Manage Notifications"
          onPress={() => Alert.alert('Notifications', 'Manage Notifications pressed')}
        />
        <SettingItem
          icon="theme-light-dark"
          label="Dark Mode"
          isSwitch
          switchValue={darkMode}
          onSwitch={() => setDarkMode(!darkMode)}
        />
        <SettingItem
          icon="microphone"
          label="Enable Voice Recognition"
          isSwitch
          switchValue={voiceEnabled}
          onSwitch={toggleVoice}
        />
      </View>
    </ScrollView>
  );
};

/************ STYLES *************/
const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', flexGrow: 1 },
  header: {
    backgroundColor: MINT,
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
  },
  title: { fontSize: 26, fontWeight: 'bold', color: '#000' },
  body: { padding: 20 },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 25,
    marginBottom: 10,
    color: '#000',
    textTransform: 'uppercase',
  },
  settingItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  itemText: { fontSize: 16, fontWeight: '500', marginLeft: 14, color: '#000' },
});

export default Settings;
