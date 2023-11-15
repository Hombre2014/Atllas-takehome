import { useState, useEffect } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import NavigationButton from '../../components/NavigationButton';
import { StatusBar } from 'expo-status-bar';
import { StackScreens } from '../../App';
import tw from 'twrnc';

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

  const logout = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
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

      await AsyncStorage.removeItem('token');
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
