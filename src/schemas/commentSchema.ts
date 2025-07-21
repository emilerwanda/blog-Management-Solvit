import joi from 'joi'

export const commentSValidatechema = joi.object({
  content: joi.string().required()
})