import userModel from "@/models/User";
import dbConnect from "@/lib/dbConnect";


export async function POST(request:Request) {
    await dbConnect();

    try {
        const {username,code}  = await request.json()

        const decodedUsername = decodeURIComponent(username)
        const user = await userModel.findOne({username:decodedUsername})
        if(!user){
            return Response.json({
                success:false,
                message:"Username not found"
            },{status:500})
        }
        const isCodeValid = user.verifyCode === code
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

        if(isCodeValid && isCodeNotExpired){
            user.isVerified = true
            await user.save()
            return Response.json({
                success:true,
                message:"Account verified Successfully"
            },{status:200})

        }else if(!isCodeNotExpired){
            return Response.json({
                success:false,
                message:"Verification Code has expired please sign up again"
            },{status:400})
        }else{
            return Response.json({
                success:false,
                message:"Invalid Verification Code"
            },{status:400})
        }

    } catch (error) {
        return Response.json({
            success:false,
            message:"Error verifying user"
        },{status:400})
    }
}