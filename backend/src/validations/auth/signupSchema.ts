import Joi from 'joi';

export const signupSchema = Joi.object({
    name: Joi
        .string()
        .trim()
        .min(3)
        .max(50)
        .required()
        .messages({
            'string.base': 'name must be a string.',
            'string.empty': 'name cannot be empty.',
            'string.min': 'name must be at least 3 characters.',
            'string.max': 'name cannot exceed 50 characters.',
            'any.required': 'name is required.',
        }),

    email: Joi
        .string()
        .email({ tlds: { allow: true } })
        .required()
        .messages({
            'string.email': 'email must be valid.',
            'string.empty': 'email cannot be empty.',
            'any.required': 'email is required.',
        }),

    password: Joi
        .string()
        .min(6)
        .required()
        .messages({
            'string.min': 'password must be at least 6 characters.',
            'string.empty': 'password cannot be empty.',
            'any.required': 'password is required.',
        }),
});
