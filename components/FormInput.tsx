import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface Props {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    onBlur: (e: any) => void;
    error?: string;
    touched?: boolean;
    secureTextEntry?: boolean;
}

const FormInput: React.FC<Props> = ({
    label,
    value,
    onChangeText,
    onBlur,
    error,
    touched,
    secureTextEntry,
}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>

            <TextInput
                style={[styles.input, error && touched ? styles.errorInput : null]}
                value={value}
                onChangeText={onChangeText}
                onBlur={onBlur}
                secureTextEntry={secureTextEntry}
            />

            {error && touched && (
                <Text style={styles.errorText}>{error}</Text>
            )}
        </View>
    );
};

export default FormInput;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 16,
    },
    label: {
        marginBottom: 6,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
    },
    errorInput: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        marginTop: 4,
    },
});