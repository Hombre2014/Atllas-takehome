import React, { useRef, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Form, FormItem, Label } from 'react-native-form-component';
import { Formik } from 'formik';
import { StackScreens } from '../../App';
import * as yup from 'yup';

import tw from 'twrnc';

interface FormValues {
  username: string;
  password: string;
}

const validationSchema = yup.object({
  username: yup
    .string()
    .trim()
    .min(3, 'Name must be at least 3 characters')
    .required('Name is required'),
  password: yup
    .string()
    .min(4, 'Password must be at least 4 characters long')
    .required('Password is required'),
});

const Login = ({
  navigation,
}: NativeStackScreenProps<StackScreens, 'Login'>) => {
  const [error, setError] = useState('');
  const usernameInput = useRef();
  const passwordInput = useRef();
  const userInfo: FormValues = { username: '', password: '' };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const signIn = async (values: FormValues, actions: any): Promise<void> => {
    setError('');

    const serverUrl = 'http://10.0.2.2:50000/auth/login';
    try {
      const response = await fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Network response was not ok.');
      }

      await AsyncStorage.setItem('token', responseData.data.token);
      navigation.push('Home');
    } catch (error: any) {
      setError(error.message);
    }
    actions.resetForm();
  };

  return (
    <View style={tw`flex-1 justify-center items-center`}>
      <Formik
        initialValues={userInfo}
        validationSchema={validationSchema}
        onSubmit={signIn}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
        }) => {
          const { username, password } = values;

          return (
            <React.Fragment>
              <Form
                style={tw`w-3/4`}
                buttonText="Login"
                buttonStyle={{
                  backgroundColor: '#008CEA',
                }}
                buttonTextStyle={{ color: 'white' }}
                onButtonPress={!isSubmitting ? handleSubmit : undefined}
              >
                {error && <Text style={{ color: 'red' }}>{error}</Text>}
                <View style={tw`flex flex-row justify-between`}>
                  <Label
                    text="Username"
                    asterik
                    textStyle={{
                      color: '#858597',
                      fontSize: 14,
                      fontWeight: 400,
                    }}
                  />
                  {touched.username && errors.username ? (
                    <Text style={tw`text-red-500 text-xs`}>
                      {errors.username}
                    </Text>
                  ) : null}
                </View>
                <FormItem
                  style={tw`mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
                  onBlur={handleBlur('username')}
                  ref={usernameInput}
                  value={username}
                  onChangeText={handleChange('username')}
                  placeholder="Joe Dow"
                />
                <View style={tw`flex flex-row justify-between`}>
                  <Label
                    text="Password "
                    asterik
                    textStyle={{
                      color: '#858597',
                      fontSize: 14,
                      fontWeight: 400,
                    }}
                  />
                  {touched.password && errors.password ? (
                    <Text style={tw`text-red-500 text-xs`}>
                      {errors.password}
                    </Text>
                  ) : null}
                </View>
                <FormItem
                  style={tw`mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
                  autoCapitalize="none"
                  onBlur={handleBlur('password')}
                  ref={passwordInput}
                  value={password}
                  onChangeText={handleChange('password')}
                  labelStyle={{ textColor: 858597, textSize: 48 }}
                  placeholder="********"
                  secureTextEntry={true}
                />
              </Form>
            </React.Fragment>
          );
        }}
      </Formik>
      <StatusBar style="auto" />
    </View>
  );
};

export default Login;
