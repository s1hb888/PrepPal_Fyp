import { StyleSheet } from 'react-native';

const Home = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e9ecef',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    menuItem: {
        backgroundColor: '#ffc107',
        padding: 15,
        borderRadius: 10,
        marginVertical: 10,
    },
    menuItemText: {
        color: '#000',
        fontSize: 18,
    },
});

export default Home;
