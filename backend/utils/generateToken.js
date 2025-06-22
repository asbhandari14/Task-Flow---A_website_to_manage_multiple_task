import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();



const generateToken=async(userId)=>{
    try {
        const token = await jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return token;
    } catch (error) {
        console.error("Error generating token:", error);
    }
};


export default generateToken;