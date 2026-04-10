import * as Yup from 'yup';

export type Values = Yup.InferType<typeof loginSchema>;

export const loginSchema = Yup.object().shape({
    email: Yup.string()
        .email('Please enter a valid email')
        .required('Email is required'),
    password: Yup.string()
        .min(6, 'Minimum 6 characters required')
        .required('Password is required'),
});