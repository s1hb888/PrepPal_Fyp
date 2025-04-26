
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
        <Icon name={icon} size={24} color="#2BCB9A" />
        <Text style={styles.itemText}>{label}</Text>
      </View>
      {isSwitch ? (
        <Switch value={switchValue} onValueChange={onSwitch} />
      ) : (
        <Icon name="chevron-right" size={22} color="#2BCB9A" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <SectionHeader title="Account" />
      <SettingItem icon="account-circle-outline" label="Manage Profile" onPress={() => alert('Edit Profile')} />
      

      <SectionHeader title="App Preferences" />
      <SettingItem icon="bell-outline" label="Manage Notifications" onPress={() => alert('Manage Notifications')} />



      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <View style={styles.row}>
          <Icon name="logout" size={24} color="#000" />
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
    backgroundColor: '#F1F1F1',
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
    color: '#2BCB9A',
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
    backgroundColor: '#2BCB9A',
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
    color: '#000',
    marginLeft: 10,
  },
});

export default Settings;
