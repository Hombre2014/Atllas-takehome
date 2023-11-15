import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StackScreens } from '../../App';
import { WebView as NativeWebView } from 'react-native-webview';

import tw from 'twrnc';

export default function WebView({}: NativeStackScreenProps<
  StackScreens,
  'App'
>) {
  console.log(
    'EXPO_PUBLIC_WEBAPP_ROOT=%s',
    process.env.EXPO_PUBLIC_WEBAPP_ROOT
  );

  return (
    <View style={tw`flex-1`}>
      <NativeWebView
        source={{
          uri: `${process.env.EXPO_PUBLIC_WEBAPP_ROOT}` as string,
        }}
      />
      <StatusBar style="auto" />
    </View>
  );
}
