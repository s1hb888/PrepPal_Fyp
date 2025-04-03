import { StyleSheet } from 'react-native';

const CommonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topArea: {
    height: 200,
    backgroundColor: '#FFCF25',
    justifyContent: 'center',
    alignItems: 'center',
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
    margin: 10,
    elevation: 7,
    borderRadius: 10,
    borderWidth:2,
    borderColor: '#EF3349'
  },
  cardContent: {
    backgroundColor: '#2BCB9A',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
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
    marginTop: 5,
  },
});

export default CommonStyles;