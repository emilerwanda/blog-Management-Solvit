import { describe, it, expect, jest } from "@jest/globals"
import { userResponse } from "./setup"
import supertest from "supertest"
import { app } from "../server"

const request = supertest(app)

describe('create A user', () => {
    describe('Starting from 400', () => {
        it('having an unexcepted columbn', async () => {
            const res = await request.post(`/users`)
                .send({
                    email: 'ryan.fab@outlook.com',
                    name: 'fab',
                    password: 'password123',
                    gender: 'male',
                    role: 'users'
                })
            expect(res.status).toBe(400)
        })

        it('create user successfuly', async () => {
            const res = await request.post(`/users`)
                .send({
                    email: 'nenibe3789@ikanteri.com',
                    name: 'fab',
                    password: 'password123',
                    gender: 'male',
                })
            expect(res.status).toBe(201)
        })
        it('user already exist', async () => {
            const res = await request.post(`/users`)
                .send({
                    email: 'nenibe3789@ikanteri.com',
                    name: 'fab',
                    password: 'password123',
                    gender: 'male',
                })
            expect(res.status).toBe(400)
            expect(res.body.message).toBe('User Already Exists')
        })
    })
})
describe('Get All Users', () => {
    it("list of users", async () => {

        const users = await request.get(`/users`)
            .set('Authorization', `Bearer ${userResponse.token}`)

        expect(users.status).toBe(200)
    })

    it('Getting All users Failed', async () => {
        // Import models from setup to mock them
        const { models } = require('./setup')
        jest.spyOn(models.User, 'findOne').mockRejectedValue(new Error())
        const users = await request.get(`/users`)
            .set('Authorization', `Bearer ${userResponse.token}`)
        expect(users.status).toBe(500)
    })
    it('getting 500 error', async () => {
        // Import models from setup to mock them
        const { models } = require('./setup')
        jest.spyOn(models.User, 'findOne').mockRejectedValue(new Error())
        const res = await request.post(`/login`).send({
            email: 'admin@admin.com',
            password: 'password123'
        })
        expect(res.status).toBe(500)
    })

    it('getting 500 error', async () => {
        // Import models from setup to mock them
        const { models } = require('./setup')
        jest.spyOn(models.User, 'create').mockRejectedValue(new Error())
        const res = await request.post(`/users`)
            .send({
                email: 'nenibe3789@ikanteri.com',
                name: 'fab',
                password: 'password123',
                gender: 'male',
            })
        expect(res.status).toBe(500)
    })

})
