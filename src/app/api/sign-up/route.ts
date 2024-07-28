import dbConnect from "@/lib/dbConnect";
import userModel from "@/models/User";
import bcrypt from "bcryptjs"
import { sendVerificationEmail } from "@/helpers/sendVerficationEmail";


export async function POST(request: Request) {
    await dbConnect();
    try {
        const { username, email, password } = await request.json()

        const existingUserVerifiedByUsername = await userModel.findOne({ username, isVerified: true })
       
        if (existingUserVerifiedByUsername) {
            return Response.json({
                success: false, message: "Username already taken"
            }, { status: 400 })
        }

        const existingUserByEmail = await userModel.findOne({ email })

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return Response.json({
                    success: false, message: "Email Already Exists With This Email"
                }, { status: 400 })
            } else {
                const hashedPassword = await bcrypt.hash(password, 10)
                existingUserByEmail.password = hashedPassword
                existingUserByEmail.verifyCode = verifyCode
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
                await existingUserByEmail.save()
            }
        } else {
            const hashedPassword = await bcrypt.hash(password, 10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1)

            const newUser = new userModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessages: true,
                messages: [],
            })
            await newUser.save()
        }
        const emailResponse = await sendVerificationEmail(email, username, verifyCode)
        console.log(emailResponse)
        
        if (!emailResponse.success) {
            return Response.json({
                success: false, message: emailResponse.message
            }, { status: 500 })
        }
        return Response.json({
            success: true, message: "User registered successfully please verify your email"
        }, { status: 200 })

    } catch (error) {
        console.error("Error while registering the user", error)
        return Response.json({
            success: false, message: "Error while registering the user"
        }, { status: 500 })
    }

}