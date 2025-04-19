import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  page: {
    width,
    flex: 1,
    backgroundColor: '#FDFDFD',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  letter: {
    fontSize: 120,
    fontWeight: 'bold',
    color: '#EF3349',
    marginTop: 20,
  },
  modernButton: {
    backgroundColor: '#2BCB9A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    elevation: 3,
    margin:10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 25,
    fontWeight: '600',
  },  
  imageContainer: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    borderRadius: 30,
    borderColor: '#FFCF25',
    borderWidth: 2,
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  image: {
    width: 180,
    height: 180,
  },
  word: {
    fontSize: 36,
    fontWeight: '600',
    color: '#EF3349',
    marginTop: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    gap: 20, // Adjust if not supported on Android
  },
  navButton: {
    padding: 10,
  },
  speakerButton: {
    padding: 10,
  },
  navIcon: {
    width: 40,
    height: 40,
  },
});

export default styles;
