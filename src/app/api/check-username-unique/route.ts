import dbConnect from "@/lib/dbConnect";
import {z} from "zod"
import userModel from "@/models/User";
import { userNameValidation } from "@/schemas/signUpSchema";


const usernameQuerySchema = z.object({
    username: userNameValidation
})

export async function GET(request:Request) {
    await dbConnect();

    try {
        const {searchParams} = new URL(request.url)
        const queryParam = {
            username:searchParams.get("username")
        }
        const result = usernameQuerySchema.safeParse(queryParam)
        if(!result.success){
            const usernameErrors = result.error.format().username?._errors || []
            return Response.json({
                success:false,
                message:usernameErrors?.length>0?usernameErrors.join(','):"Invalid query parameters"
            },{status:400})
        }
        const {username} = result.data
        const existingVerifiedUser = await userModel.findOne({username, isVerified:true})

        if(existingVerifiedUser){
            return Response.json({
                success:false,
                message:"Username is already taken"
            },{status:400})
        }

        return Response.json({
            success:true,
            message:"Username is available"
        },{status:400})


    } catch (error) {
        console.error("Error checking Username",error)
        return Response.json({
            success:false,
            message:"Error checking Username"
        },{status:500})
    }
}