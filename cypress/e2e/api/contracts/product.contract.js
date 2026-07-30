const Joi = require('joi') 

export const productListSchema = Joi.object({
    descricao: Joi.string().required(),
    nome: Joi.string().required(),
    preco: Joi.number().required(),
    quantidade: Joi.number().required(),
    _id: Joi.string().alphanum()
})