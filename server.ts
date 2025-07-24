import express from "express";
import { config } from 'dotenv';

config();

const app = express()
app.use(express.json())

const port = parseInt(process.env.PORT as string) || 5500
app.use((req, res) => {
    res.status(404).json({
        error: "Not found",
        sucess: false,
        message: "not found"
    });
});

app.listen(port, () => {
    console.log(`Our server is running, on port: localhost//${port}`)
})