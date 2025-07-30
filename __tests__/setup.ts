import supertest, { Request, Response } from 'supertest'
import { it, describe, expect, jest, beforeAll, afterAll, afterEach } from '@jest/globals'
import { app } from '../server'
import { Sequelize, Op } from 'sequelize'
import { sequelize } from '../src/database/config/sequelize'
import { AllModal } from '../src/database/models/index'
import bcrypt from 'bcrypt'

const request = supertest(app)
export const userResponse = {
    token: ''
}

export let models: any

beforeAll(async () => {
    try {
       
        await sequelize.authenticate()
        console.log("Test Database Connected")
        
        
        models = AllModal(sequelize)
        
       
        await sequelize.sync({ force: true })
        console.log("Test Database Synced")
        
       
        await createTestAdminUser()
        
    } catch (error) {
        console.error('Database connection failed:', error)
        throw error
    }

}, 10000)

afterEach(async () => {
    jest.clearAllMocks()
 
    await cleanupTestData()
})

afterAll(async () => {
    try {
 
        await cleanupAllTestData()
        
       
        await sequelize.close()
        console.log("Test Database Connection Closed")
    } catch (error) {
        console.error('Error during test cleanup:', error)
    }
})


async function createTestAdminUser() {
    try {
       
        const existingAdmin = await models.User.findOne({ 
            where: { email: 'admin@admin.com' } 
        })
        
        if (!existingAdmin) {
            
            const hashedPassword = await bcrypt.hash('password123', 10)
            
            const adminUser = await models.User.create({
                email: 'admin@admin.com',
                name: 'Admin User',
                password: 'password123',
                gender: 'male',
                role: 'admin'
            })
            console.log("Test Admin User Created")
            return adminUser
        } else {
            console.log("Test Admin User Already Exists")
            return existingAdmin
        }
    } catch (error) {
        console.error('Error creating test admin user:', error)
        throw error
    }
}


async function cleanupTestData() {
    try {
       
        await models.like.destroy({ where: {}, force: true })
        await models.comment.destroy({ where: {}, force: true })
        await models.Blog.destroy({ where: {}, force: true })
        
       
        await models.User.destroy({ 
            where: { 
                email: { 
                    [Op.ne]: 'admin@admin.com' 
                } 
            }, 
            force: true 
        })
    } catch (error) {
        console.error('Error during test data cleanup:', error)
    }
}


async function cleanupAllTestData() {
    try {
        
        await models.like.destroy({ where: {}, force: true })
        await models.comment.destroy({ where: {}, force: true })
        await models.Blog.destroy({ where: {}, force: true })
        await models.User.destroy({ where: {}, force: true })
        
        console.log("All Test Data Cleaned Up")
    } catch (error) {
        console.error('Error during complete test data cleanup:', error)
    }
}

describe('Login with admin token', () => {
    it('Login Succefully', async () => {
        
        const adminUser = await models.User.findOne({ 
            where: { email: 'admin@admin.com' } 
        })
        console.log('Admin user found:', adminUser ? 'Yes' : 'No')
        if (adminUser) {
            console.log('Admin user password:', adminUser.password ? 'Has password' : 'No password')
        }
        
        const res = await request.post(`/login`).send({
            email: 'admin@admin.com',
            password: 'password123'
        })
        
        console.log('Login response:', res.body)
        
        userResponse.token = res.body.data
        expect(res.body.message).toEqual('User Logins succesfuly')
        expect(res.body.success).toBe(true)
    })
    it('users Doesnt exist', async () => {
        const res = await request.post(`/login`).send({
            email: 'admin2@admin.com',
            password: 'password123'
        })
        expect(res.body.message).toEqual("User doesn't exists please sign-in")
        expect(res.status).toBe(404)
    })
    it('invalid Password', async () => {
        const res = await request.post(`/login`).send({
            email: 'admin@admin.com',
            password: 'passworrd123'
        })
        expect(res.body.message).toEqual("Invalid email or password")
        expect(res.status).toBe(401)
    })
})


