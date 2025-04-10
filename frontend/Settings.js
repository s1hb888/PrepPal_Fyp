
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Settings = ({ navigation }) => {
  const [darkMode, setDarkMode] = React.useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => alert('Logged Out!') },
    ]);
  };

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
        <Icon name={icon} size={24} color="#4CAF50" />
        <Text style={styles.itemText}>{label}</Text>
      </View>
      {isSwitch ? (
        <Switch value={switchValue} onValueChange={onSwitch} />
      ) : (
        <Icon name="chevron-right" size={22} color="#999" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <SectionHeader title="Account" />
      <SettingItem icon="lock-reset" label="Change Password" onPress={() => alert('Change Password')} />
      <SettingItem icon="account-circle-outline" label="Edit Profile" onPress={() => alert('Edit Profile')} />
      <SettingItem icon="email-outline" label="Update Email" onPress={() => alert('Update Email')} />

      <SectionHeader title="App Preferences" />
      <SettingItem icon="bell-outline" label="Manage Notifications" onPress={() => alert('Manage Notifications')} />
      <SettingItem icon="translate" label="Language Preferences" onPress={() => alert('Language Settings')} />
      <SettingItem icon="theme-light-dark" label="Dark Mode" isSwitch switchValue={darkMode} onSwitch={setDarkMode} />

      <SectionHeader title="Support" />
      <SettingItem icon="shield-lock-outline" label="Privacy Policy" onPress={() => alert('Privacy Policy')} />
      <SettingItem icon="file-document-outline" label="Terms & Conditions" onPress={() => alert('Terms & Conditions')} />
      <SettingItem icon="information-outline" label="About App" onPress={() => alert('About App')} />

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <View style={styles.row}>
          <Icon name="logout" size={24} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f0f4f8',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#4CAF50',
  },
  settingItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#e53935',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 30,
    alignItems: 'center',
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
});

export default Settings;
