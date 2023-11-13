import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StackScreens } from '../../App';
import { StatusBar } from 'expo-status-bar';
import { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import tw from 'twrnc';

export default function Home({
  navigation,
}: NativeStackScreenProps<StackScreens, 'Home'>) {
  const handleLoginPress = useCallback(
    () => navigation.navigate('Login'),
    [navigation?.navigate]
  );
  const handleRegisterPress = useCallback(
    () => navigation.navigate('Register'),
    [navigation?.navigate]
  );
  const handleWebviewPress = useCallback(
    () => navigation.navigate('App'),
    [navigation?.navigate]
  );

  return (
    <View style={tw`flex-1 justify-center items-center`}>
      <TouchableOpacity
        onPress={handleLoginPress}
        style={tw`mb-4 bg-blue-500 p-2, rounded-lg w-1/2`}
      >
        <Text style={tw`text-white text-center font-bold text-lg`}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleRegisterPress}
        style={tw`mb-4 bg-blue-500 p-2, rounded-lg w-1/2`}
      >
        <Text style={tw`text-white text-center font-bold text-lg`}>
          Register
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleWebviewPress}
        style={tw`mb-4 bg-blue-500 p-2, rounded-lg w-1/2`}
      >
        <Text style={tw`text-white text-center font-bold text-lg`}>
          Skip to Webview
        </Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}
