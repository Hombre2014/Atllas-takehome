import React, { useCallback } from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

import tw from 'twrnc';

interface NavigationButtonProps extends TouchableOpacityProps {
  navigation: NavigationProp<ParamListBase>;
  destination: string;
  label: string;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  navigation,
  destination,
  label,
  ...touchableOpacityProps
}) => {
  const handlePress = useCallback(() => {
    navigation.navigate(destination);
  }, [navigation, destination]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      {...touchableOpacityProps}
      style={tw`mb-4 bg-blue-500 p-2, rounded-lg w-1/2`}
    >
      <Text style={tw`text-white text-center font-bold text-lg`}>{label}</Text>
    </TouchableOpacity>
  );
};

export default NavigationButton;
