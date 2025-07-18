import joi from 'joi'

export const commentSValidatechema = joi.object({
  text: joi.string().required()
})