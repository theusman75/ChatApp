import { setUserData } from '@/redux/slices/persist/persistSlice';
import { endpoints, networkCallHandler } from '@/services/networkService';
import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { Formik } from 'formik';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Button,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import FormInput from '../../components/FormInput';
import { signupSchema, Values } from '../../validation/signupSchema';

const SignUpScreen = () => {

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const dispatch = useDispatch()

    const signup = async ({ name, email, password }: Values) => {
        setLoading(true)
        const { success, data, error } = await networkCallHandler({
            url: endpoints.signup,
            method: 'POST',
            data: { name, email, password },
        });
        setLoading(false)

        if (success) {
            dispatch(setUserData(data?.data))
            router.replace('/chatList')
        } else {
            setError(error)
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <Feather name="arrow-left" size={24} color="black" onPress={() => router.back()} />
                <Text style={styles.title}>Sign Up</Text>
            </View>

            <Formik
                initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
                validationSchema={signupSchema}
                onSubmit={signup}
            >
                {({
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    values,
                    errors,
                    touched,
                }) => (
                    <>
                        <FormInput
                            label="Name"
                            value={values.name}
                            onChangeText={handleChange('name')}
                            onBlur={handleBlur('name')}
                            error={errors.name}
                            touched={touched.name}
                        />

                        <FormInput
                            label="Email"
                            value={values.email}
                            onChangeText={handleChange('email')}
                            onBlur={handleBlur('email')}
                            error={errors.email}
                            touched={touched.email}
                        />

                        <FormInput
                            label="Password"
                            value={values.password}
                            onChangeText={handleChange('password')}
                            onBlur={handleBlur('password')}
                            error={errors.password}
                            touched={touched.password}
                        />

                        <FormInput
                            label="Confirm Password"
                            value={values.confirmPassword}
                            onChangeText={handleChange('confirmPassword')}
                            onBlur={handleBlur('confirmPassword')}
                            error={errors.confirmPassword}
                            touched={touched.confirmPassword}
                        />

                        {error && <Text style={styles.errorText}>{error}</Text>}

                        {loading ? (
                            <ActivityIndicator size="large" />
                        ) : (
                            <Button title="Sing Up" onPress={() => handleSubmit()} />
                        )}
                    </>
                )}
            </Formik>
        </SafeAreaView>
    );
};

export default SignUpScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 32,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    errorText: {
        color: 'red',
        marginBottom: 12,
        textAlign: 'center',
    }
});