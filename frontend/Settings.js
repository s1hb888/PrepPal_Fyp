import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Settings = () => {
  const [darkMode, setDarkMode] = React.useState(false);
  const [voiceEnabled, setVoiceEnabled] = React.useState(false);

  const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const SettingItem = ({ icon, label, onPress, isSwitch, switchValue, onSwitch }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.row}>
        <Icon name={icon} size={24} color="#EF3349" />
        <Text style={styles.itemText}>{label}</Text>
      </View>
      {isSwitch ? (
        <Switch value={switchValue} onValueChange={onSwitch} />
      ) : (
        <Icon name="chevron-right" size={22} color="#EF3349" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Mint Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.body}>
        <SectionHeader title="Account" />
        <SettingItem
          icon="account-circle-outline"
          label="Manage Profile"
          onPress={() => alert('Edit Profile')}
        />

        <SectionHeader title="App Preferences" />
        <SettingItem
          icon="bell-outline"
          label="Manage Notifications"
          onPress={() => alert('Manage Notifications')}
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
          onSwitch={() => setVoiceEnabled(!voiceEnabled)}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    backgroundColor: 'rgb(160,240,220)',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
    marginTop: -6,
  },
  body: {
    padding: 20,
  },
  sectionHeader: {
    fontSize: 16,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 14,
    color: '#000',
  },
});

export default Settings;
