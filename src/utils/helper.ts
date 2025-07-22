import { MongoClient, ServerApiVersion } from 'mongodb'
import mongoose from 'mongoose';
import { config } from 'dotenv'
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
config()

const db_url = process.env.MONGODB_URI as string

export async function run() {
    
        const client = mongoose.connect(db_url, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });
       client.then(re => {
           re.connection,
            console.log('connected success to moongose database')        
        }).catch(ca => {
           console.log(ca)
        })
   
}
run().catch(console.dir);

export const generateSlug = (title: string): string => {
    return title.replace(' ', '-')
}

export const hashPassword = async(password: string): Promise<string> => {
    return await bcrypt.hash(password,10)
}
export const isPasswordMatch = async(plainPassword: string, hashedPassword:string):Promise<boolean> => {
    const ismatch = await bcrypt.compare(plainPassword, hashedPassword)
    return ismatch
}
export const secretkey = process.env.JWT_SECRET || 'secret'

export const generateToken = ({ _id, email }: {_id:string,email:string
}):string => {
    return jwt.sign({ _id, email }, secretkey, {
        expiresIn:'15min'
    })
}
