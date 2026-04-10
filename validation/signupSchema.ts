import * as Yup from 'yup';

export type Values = Yup.InferType<typeof signupSchema>;

export const signupSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, 'Minimum 2 characters required')
        .required('Name is required'),
    email: Yup.string()
        .email('Please enter a valid email')
        .required('Email is required'),
    password: Yup.string()
        .min(6, 'Minimum 6 characters required')
        .required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords do not match')
        .required('Required'),

});