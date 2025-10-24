import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    Animated,
    Dimensions,
    Platform,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

// CONTENT: Features array with descriptions
const features = [
    { icon: 'user-circle', title: 'User Registration', description: 'Allows parents to register and create a secure profile for their child.' },
    { icon: 'sign-in', title: 'Login', description: 'Easy access to the app through secure login for parents and children.' },
    { icon: 'font', title: 'Learn English Alphabets', description: 'Interactive lessons to recognize and pronounce A to Z.' },
    { icon: 'language', title: 'Learn Urdu Alphabets', description: 'Engaging learning of Urdu letters with audio support.' },
    { icon: 'circle-o', title: 'Learn Vowels', description: 'Introduction to English vowels with clear sounds and visuals.' },
    { icon: 'paint-brush', title: 'Learn Shapes & Colors', description: 'Visually appealing lessons for basic shapes and colors recognition.' },
    { icon: 'leaf', title: 'Fruits, Vegetables & Body Parts', description: 'Real images and voiceovers to help identify common fruits, veggies, and body parts.' },
    { icon: 'book', title: 'Learn Islamic Studies', description: 'Basic Islamic knowledge including duas, ethics, and important concepts.' },
    { icon: 'calculator', title: 'Learn Numbers & Counting', description: 'Early math skills with number recognition and counting exercises.' },
    { icon: 'video-camera', title: 'Animated Videos', description: 'Educational cartoons to keep learning enjoyable and fun.' },
    { icon: 'clock-o', title: 'Screen Time Control', description: 'Parents can manage how long their child uses the app each day.' },
    { icon: 'user', title: 'Profile Management', description: 'Parents can update or monitor individual kid profiles.' },
    { icon: 'dashboard', title: 'Admin Dashboard', description: 'Control panel to manage users, content, and overall app statistics.' },
    { icon: 'line-chart', title: 'Progress Tracking', description: 'View detailed performance reports and learning milestones.' },
    { icon: 'magic', title: 'AI-Generated Quizzes', description: 'Smart quizzes created based on child’s learning pattern and progress.' },
    { icon: 'microphone', title: 'Voice Recognition-Based Quizzes', description: 'Children can answer verbally to test pronunciation and listening skills.' },
    { icon: 'star', title: 'Reward System', description: 'Motivational badges and stars to keep kids encouraged and focused.' },
];

const AboutUs = () => {
    const [expandedIndex, setExpandedIndex] = useState(null);
    const animatedValues = useRef(features.map(() => new Animated.Value(0))).current;

    const toggleExpand = (index) => {
        const isExpanding = expandedIndex !== index;

        if (expandedIndex !== null && expandedIndex !== index) {
            Animated.timing(animatedValues[expandedIndex], {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }).start();
        }

        setExpandedIndex(isExpanding ? index : null);

        Animated.spring(animatedValues[index], {
            toValue: isExpanding ? 1 : 0,
            friction: 8,
            tension: 40,
            useNativeDriver: false,
        }).start();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <FontAwesome name="graduation-cap" size={36} color="#EF3349" />
                        </View>
                    </View>
                    <Text style={styles.mainHeading}>PrepPal</Text>
                    <Text style={styles.tagline}>Empowering Young Minds for Tomorrow</Text>
                    <View style={styles.divider} />
                </View>

                {/* Our Story */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.iconCircle}>
                            <FontAwesome name="heart" size={18} color="#EF3349" />
                        </View>
                        <Text style={styles.sectionTitle}>Our Story</Text>
                    </View>
                    <Text style={styles.sectionText}>
                        As software engineering students, we identified a gap in admission test preparation for kids — especially in digital learning solutions for preschoolers in our region.
                    </Text>
                    <Text style={styles.sectionText}>
                        **PrepPal** is developed from our desire to make early education more **accessible, structured, and enjoyable** using technology.
                    </Text>
                </View>

                {/* Mission & Who It's For (Dual Cards) */}
                <View style={styles.dualCardContainer}>
                    <View style={[styles.halfCard, { marginRight: 10 }]}>
                        <View style={styles.iconCircle}>
                            <FontAwesome name="bullseye" size={16} color="#EF3349" />
                        </View>
                        <Text style={styles.cardTitle}>Our Mission</Text>
                        <Text style={styles.cardText}>
                            Our mission is to prepare preschoolers for school admission tests by helping them learn basic concepts in a fun, structured, and interactive way. We aim to make the transition into school smooth and joyful for every child.
                        </Text>
                    </View>

                    <View style={[styles.halfCard, { marginLeft: 10 }]}>
                        <View style={styles.iconCircle}>
                            <FontAwesome name="users" size={16} color="#EF3349" />
                        </View>
                        <Text style={styles.cardTitle}>Who It's For</Text>
                        <Text style={styles.cardText}>
                            PrepPal is designed for **busy parents** and **curious preschoolers** between ages **2 to 5**. Whether you're just getting started or preparing for interviews, PrepPal guides you every step of the way.
                        </Text>
                    </View>
                </View>

                {/* How It Helps Parents (List) */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.iconCircle}>
                            <FontAwesome name="check-square-o" size={18} color="#EF3349" />
                        </View>
                        <Text style={styles.sectionTitle}>Parent Benefits</Text>
                    </View>
                    <View style={styles.benefitItem}>
                        <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                        <Text style={styles.benefitText}>Get structured daily learning content.</Text>
                    </View>
                    <View style={styles.benefitItem}>
                        <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                        <Text style={styles.benefitText}>Track progress and identify weak areas.</Text>
                    </View>
                    <View style={styles.benefitItem}>
                        <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                        <Text style={styles.benefitText}>Manage screen time with in-app limits.</Text>
                    </View>
                    <View style={styles.benefitItem}>
                        <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                        <Text style={styles.benefitText}>Leverage **AI-generated personalized quizzes** for your child’s growth.</Text>
                    </View>
                </View>

                {/* Features Section Header */}
                <View style={styles.featuresSection}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.iconCircle}>
                            <FontAwesome name="rocket" size={18} color="#EF3349" />
                        </View>
                        <Text style={styles.sectionTitle}>App Features</Text>
                    </View>
                    <Text style={styles.featuresSubtitle}>
                        Explore our comprehensive, cutting-edge features designed to deliver exceptional early learning outcomes.
                    </Text>
                </View>

                {/* Features List (Expandable Cards) */}
                {features.map((feature, index) => {
                    const rotateIcon = animatedValues[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '180deg'],
                    });

                    return (
                        <View key={index} style={styles.featureCard}>
                            <TouchableOpacity
                                onPress={() => toggleExpand(index)}
                                style={styles.featureHeader}
                                activeOpacity={0.7}
                            >
                                <View style={styles.featureIconContainer}>
                                    <View style={styles.featureIconCircle}>
                                        <FontAwesome name={feature.icon} size={18} color="#EF3349" />
                                    </View>
                                    <Text style={styles.featureTitle}>{feature.title}</Text>
                                </View>
                                <Animated.View style={{ transform: [{ rotate: rotateIcon }] }}>
                                    <Ionicons name="chevron-down" size={18} color="#EF3349" />
                                </Animated.View>
                            </TouchableOpacity>

                            {expandedIndex === index && (
                                <Animated.View style={styles.featureContent}>
                                    <Text style={styles.featureDescription}>{feature.description}</Text>
                                </Animated.View>
                            )}
                        </View>
                    );
                })}

                {/* Contact Section */}
                <View style={styles.contactSection}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.iconCircle}>
                            <FontAwesome name="envelope" size={18} color="#EF3349" />
                        </View>
                        <Text style={styles.sectionTitle}>Get In Touch</Text>
                    </View>
                    <Text style={styles.contactSubtitle}>
                        For support or business inquiries, reach out to our team directly.
                    </Text>

                    <View style={styles.contactCard}>
                        <View style={styles.contactItem}>
                            <View style={styles.contactIconCircle}>
                                <FontAwesome name="envelope-o" size={16} color="#EF3349" />
                            </View>
                            <View>
                                <Text style={styles.contactLabel}>Email</Text>
                                <Text style={styles.contactValue}>support@preppal.com</Text>
                            </View>
                        </View>

                        <View style={styles.contactItem}>
                            <View style={styles.contactIconCircle}>
                                <FontAwesome name="phone" size={16} color="#EF3349" />
                            </View>
                            <View>
                                <Text style={styles.contactLabel}>Phone</Text>
                                <Text style={styles.contactValue}>+92 300 1234567</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Social Media */}
                <View style={styles.socialSection}>
                    <Text style={styles.socialTitle}>Connect With Us</Text>
                    <View style={styles.socialIcons}>
                        <TouchableOpacity style={styles.socialButton}>
                            <FontAwesome name="facebook" size={20} color="#EF3349" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialButton}>
                            <FontAwesome name="twitter" size={20} color="#EF3349" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialButton}>
                            <FontAwesome name="instagram" size={20} color="#EF3349" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialButton}>
                            <FontAwesome name="linkedin" size={20} color="#EF3349" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>© 2025 PrepPal. All rights reserved.</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    container: {
        paddingBottom: 20, // Reduced from 30
    },
    // --- Hero Section Styles (Reduced Vertical Padding) ---
    heroSection: {
        alignItems: 'center',
        paddingVertical: 30, // Reduced from 40
        paddingHorizontal: 20,
        backgroundColor: '#fff',
    },
    logoContainer: {
        marginBottom: 16, // Reduced from 20
    },
    logoCircle: {
        width: 70, // Reduced size
        height: 70,
        borderRadius: 35,
        backgroundColor: '#FFF0F2',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#EF3349',
    },
    mainHeading: {
        fontSize: 32, // Slightly reduced
        fontWeight: 'bold',
        color: '#1A1A1A',
        letterSpacing: 0.5,
    },
    tagline: {
        fontSize: 15, // Slightly reduced
        color: '#666',
        marginTop: 6, // Reduced from 8
        textAlign: 'center',
        fontStyle: 'italic',
    },
    divider: {
        width: 50, // Slightly reduced
        height: 3,
        backgroundColor: '#EF3349',
        marginTop: 15, // Reduced from 20
        borderRadius: 2,
    },
    // --- Card Section Styles (Story, Mission, Help) ---
    sectionCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16, // Reduced from 20
        marginTop: 16, // Reduced from 20
        borderRadius: 12, // Slightly reduced border radius
        padding: 18, // Reduced from 20
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12, // Reduced from 16
    },
    iconCircle: {
        width: 36, // Reduced size
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFF0F2',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10, // Reduced from 12
    },
    sectionTitle: {
        fontSize: 18, // Reduced from 20
        fontWeight: 'bold',
        color: '#1A1A1A',
        flex: 1,
    },
    sectionText: {
        fontSize: 14, // Reduced from 15
        color: '#444',
        lineHeight: 22, // Reduced from 24
        marginBottom: 8, // Reduced from 12
        textAlign: 'justify',
    },
    // --- Dual Card Styles (Mission/For) ---
    dualCardContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginTop: 16, // Reduced from 20
        justifyContent: 'space-between',
    },
    halfCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16, // Reduced from 18
        // Removed marginHorizontal: 6 and replaced with specific margins in the component
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    cardTitle: {
        fontSize: 15, // Reduced from 16
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginTop: 10, // Reduced from 12
        marginBottom: 6, // Reduced from 8
    },
    cardText: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18, // Reduced from 20
    },
    // --- Help/Benefit List Styles ---
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8, // Reduced from 12
    },
    benefitText: {
        fontSize: 14,
        color: '#444',
        marginLeft: 8, // Reduced from 10
        flex: 1,
        lineHeight: 20,
    },
    // --- Features Section Header ---
    featuresSection: {
        paddingHorizontal: 16, // Reduced from 20
        marginTop: 25, // Reduced from 30
        marginBottom: 8, // Reduced from 10
    },
    featuresSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 6, // Reduced from 8
        lineHeight: 20,
    },
    // --- Expandable Feature Card Styles ---
    featureCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16, // Reduced from 20
        marginBottom: 8, // Reduced from 12
        borderRadius: 12,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05, // Slightly less shadow
                shadowRadius: 3,
            },
            android: {
                elevation: 1.5, // Slightly less elevation
            },
        }),
    },
    featureHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 14, // Reduced from 16
    },
    featureIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    featureIconCircle: {
        width: 32, // Reduced size
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFF0F2',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10, // Reduced from 12
    },
    featureTitle: {
        fontSize: 15, // Reduced from 16
        fontWeight: '600',
        color: '#1A1A1A',
        flex: 1,
    },
    featureContent: {
        paddingHorizontal: 14,
        paddingBottom: 14,
    },
    featureDescription: {
        fontSize: 13, // Reduced from 14
        color: '#666',
        lineHeight: 20, // Reduced from 22
        paddingLeft: 42, // Adjusted for new icon size
    },
    // --- Contact Section Styles ---
    contactSection: {
        marginHorizontal: 16,
        marginTop: 25, // Reduced from 30
    },
    contactSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 6, // Reduced from 8
        marginBottom: 14, // Reduced from 16
        lineHeight: 20,
    },
    contactCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 18, // Reduced from 20
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16, // Reduced from 20
    },
    contactIconCircle: {
        width: 40, // Reduced size
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF0F2',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14, // Reduced from 16
    },
    contactLabel: {
        fontSize: 11, // Reduced size
        color: '#999',
        marginBottom: 2,
    },
    contactValue: {
        fontSize: 14, // Reduced from 15
        fontWeight: '600',
        color: '#1A1A1A',
    },
    // --- Social Section Styles ---
    socialSection: {
        alignItems: 'center',
        marginTop: 25, // Reduced from 30
        paddingHorizontal: 20,
    },
    socialTitle: {
        fontSize: 16, // Reduced from 18
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 16, // Reduced from 20
    },
    socialIcons: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
    },
    socialButton: {
        marginHorizontal: 12, // Reduced from 15
        width: 44, // Reduced size
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    // --- Footer Styles ---
    footer: {
        alignItems: 'center',
        marginTop: 25, // Reduced from 30
        paddingBottom: 10,
    },
    footerText: {
        fontSize: 11, // Reduced size
        color: '#999',
    },
});

export default AboutUs;