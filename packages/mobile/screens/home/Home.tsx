import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StackScreens } from '../../App';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import tw from 'twrnc';
import NavigationButton from '../../components/NavigationButton';

export default function Home({
  navigation,
}: NativeStackScreenProps<StackScreens, 'Home'>) {
  return (
    <View style={tw`flex-1 justify-center items-center`}>
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
      <NavigationButton
        navigation={navigation}
        destination="App"
        label="Skip to Webview"
      />
      <StatusBar style="auto" />
    </View>
  );
}
