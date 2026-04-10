import { setUserData } from '@/redux/slices/persist/persistSlice';
import { endpoints, networkCallHandler } from '@/services/networkService';
import { router } from 'expo-router';
import { Formik } from 'formik';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Button,
    StyleSheet,
    Text
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import FormInput from '../../components/FormInput';
import { loginSchema, Values } from '../../validation/loginValidation';

const LoginScreen = () => {

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const dispatch = useDispatch()

    const login = async ({ email, password }: Values) => {
        setLoading(true)
        const { success, data, error } = await networkCallHandler({
            url: endpoints.login,
            method: 'POST',
            data: { email, password },
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
            <Text style={styles.title}>Login</Text>

            <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={loginSchema}
                onSubmit={login}
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

                        {error && <Text style={styles.errorText}>{error}</Text>}

                        {loading ? (
                            <ActivityIndicator size="large" />
                        ) : (
                            <Button title="Log In" onPress={() => handleSubmit()} />
                        )}

                        <Text style={styles.noAccount}>Don't have an account? <Text style={styles.signUp} onPress={() => router.navigate('/auth/signup')}>Sign Up</Text></Text>
                    </>
                )}
            </Formik>
        </SafeAreaView>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 32
    },
    errorText: {
        color: 'red',
        marginBottom: 12,
        textAlign: 'center',
    },
    noAccount: {
        alignSelf: 'center',
        marginVertical: 16
    },
    signUp: {
        color: 'blue',
    }
});