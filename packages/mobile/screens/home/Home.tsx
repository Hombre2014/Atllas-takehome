import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StackScreens } from '../../App';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import tw from 'twrnc';
import NavigationButton from '../../components/NavigationButton';

export default function Home({
  navigation,
}: NativeStackScreenProps<StackScreens, 'Home'>) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Error fetching token', error);
      }
    };

    fetchToken();
  }, [token, setToken]);

  console.log('Token in Home:', token);

  const logout = async () => {
    try {
      // Retrieve the stored token
      const token = await AsyncStorage.getItem('token');

      // Make a request to the backend to invalidate the token
      const serverUrl = 'http://10.0.2.2:50000/auth/logout'; // Replace with your actual logout endpoint

      const response = await fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: `SESSION_TOKEN=${token}`,
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Network response was not ok.');
      }

      // Clear the token from AsyncStorage
      await AsyncStorage.removeItem('token');

      console.log('Token in Home after removing it from AsyncStorage:', token);

      // Navigate to the login screen or update the state
      navigation.push('Home');
    } catch (error) {
      console.error('Error during logout', error);
    }

    setToken(null);
  };

  return (
    <View style={tw`flex-1 justify-center items-center`}>
      {token !== null ? (
        <></>
      ) : (
        <>
          <NavigationButton
            navigation={navigation}
            destination="Login"
            label="Login"
          />
          <NavigationButton
            navigation={navigation}
            destination="Register"
            label="Register"
          />
        </>
      )}
      <NavigationButton
        navigation={navigation}
        destination="App"
        label="Skip to Webview"
      />
      {token === null ? (
        <></>
      ) : (
        <NavigationButton
          navigation={navigation}
          destination="Home"
          label="Logout"
          onPress={logout}
        />
      )}
      <StatusBar style="auto" />
    </View>
  );
}
