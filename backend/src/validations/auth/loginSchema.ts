import Joi from 'joi';

export const loginSchema = Joi.object({
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
        .required()
        .messages({
            'string.empty': 'password cannot be empty.',
            'any.required': 'password is required.',
        })
});
