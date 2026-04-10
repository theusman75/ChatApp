import Joi from 'joi';

export const getAllConversationsSchema = Joi.object({
    page: Joi
        .number()
        .integer()
        .min(1)
        .default(1)
        .messages({
            'number.base': 'page must be a number.',
            'number.integer': 'page must be an integer.',
            'number.min': 'page must be at least 1.',
        }),

    pageSize: Joi
        .number()
        .integer()
        .min(1)
        .max(100)
        .default(10)
        .messages({
            'number.base': 'pageSize must be a number.',
            'number.integer': 'pageSize must be an integer.',
            'number.min': 'pageSize must be at least 1.',
            'number.max': 'pageSize cannot be greater than 100.',
        })
});