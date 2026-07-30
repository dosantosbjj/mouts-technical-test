const Joi = require('joi')

export const userListSchema = Joi.object({
    nome: Joi.string().required(),
    administrador: Joi.bool().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
    _id: Joi.string().required(),
})