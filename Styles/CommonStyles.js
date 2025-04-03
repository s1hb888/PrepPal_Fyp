import { StyleSheet } from 'react-native';

const CommonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topArea: {
    height: 100,
    backgroundColor: '#FFCF25',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    padding: 10,
  },
  backText: {
    color: 'white',
    fontSize: 16,
  },
  logo: {
    width: 40,   // Set the width of your logo
    height: 40,  // Set the height of your logo
    resizeMode: 'contain', // Ensure the logo scales properly
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#000',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  card: {
    backgroundColor: '#2BCB9A',
    width: 170,
    height: 150,
    margin: 5,
    elevation: 7,
    borderRadius: 10,
    borderWidth:2,
    borderColor: '#EF3349'
  },
  cardContent: {
    backgroundColor: '#2BCB9A',
    
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  
    borderRadius: 10
  },
  image: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  cardText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 15,
  },
});

export default CommonStyles;