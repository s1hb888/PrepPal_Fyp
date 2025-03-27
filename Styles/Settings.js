import { StyleSheet } from 'react-native';

const Settings = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginVertical: 10,
    },
    toggleText: {
        fontSize: 18,
        color: '#333',
    },
});

export default Settings;
