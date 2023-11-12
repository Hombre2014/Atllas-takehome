import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { Form, FormItem, Label } from 'react-native-form-component';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StackScreens } from '../../App';

import tw from 'twrnc';

export default function Register({}: NativeStackScreenProps<
  StackScreens,
  'Register'
>) {
  type SignUpValues = {
    username: string;
    password: string;
  };

  type SignUpResponse = {
    token: string;
  };

  type ErrorResponse = {
    message: string;
  };

  const signUp = async (values: SignUpValues): Promise<void> => {
    try {
      const serverUrl = process.env.EXPO_PUBLIC_WEBAPP_ROOT;
      if (serverUrl) {
        const response = await fetch(serverUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const errorData: ErrorResponse = await response.json();
          throw new Error(errorData.message || 'Network response was not ok.');
        }

        const data: SignUpResponse = await response.json();
        console.log(data.token);
      } else {
        throw new Error('Server URL not found');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log('An unknown error occurred');
      }
    }
  };

  return (
    <View style={tw`flex-1 justify-center items-center`}>
      <Form
        style={tw`w-3/4`}
        buttonText="Create Account"
        buttonStyle={{
          backgroundColor: '#008CEA',
        }}
        buttonTextStyle={{ color: 'white' }}
      >
        <View style={tw`flex flex-row justify-between`}>
          <Label
            text="Username"
            // isRequired
            asterik
            textStyle={{
              color: '#858597',
              fontSize: 14,
              fontWeight: 400,
            }}
          />
        </View>
        <FormItem
          style={tw`mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
          // name="name"
          // type="name"
          // onBlur={handleBlur('name')}
          // ref={nameInput}
          value=""
          // onChangeText={handleChange('name')}
          placeholder="Joe Dow"
          // rules={[
          //   {
          //     required: true,
          //     message: 'Please enter your name',
          //   },
          // ]}
        />
        <View style={tw`flex flex-row justify-between`}>
          <Label
            text="Password "
            // isRequired
            asterik
            textStyle={{
              color: '#858597',
              fontSize: 14,
              fontWeight: 400,
            }}
          />
          {/* {touched.password && errors.password ? (
            <Text className="text-red-500 text-xs">{errors.password}</Text>
          ) : null} */}
        </View>
        <FormItem
          style={tw`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
          // name="password"
          // type="password"
          autoCapitalize="none"
          // onBlur={handleBlur('password')}
          // ref={passwordInput}
          value="********"
          // onChangeText={handleChange('password')}
          // style={{ borderColor: '#B8B8D2', borderWidth: 1 }}
          labelStyle={{ textColor: 858597, textSize: 48 }}
          placeholder="********"
          secureTextEntry={true}
          // rules={[
          //   {
          //     required: true,
          //     message: 'Please enter your password',
          //   },
          // ]}
        />
      </Form>
      <StatusBar style="auto" />
    </View>
  );
}
