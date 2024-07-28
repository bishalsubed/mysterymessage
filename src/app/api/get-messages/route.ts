import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import userModel from "@/models/User";
import { User } from "next-auth";
import mongoose from "mongoose";
import { MessageSquareDiffIcon } from "lucide-react";


export async function GET(request: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions)
    const user: User = session?.user as User

    if (!session?.user || !session) {
        return Response.json({
            success: false,
            message: "Not Authenticated"
        }, { status: 401 })
    }

    const userId = new mongoose.Types.ObjectId(user._id)
    try {
        const userMessages = await userModel.aggregate([
            { $match: { _id: userId } },
            { $unwind: '$messages' },
            { $sort: { 'messages.createdAt': -1 } },
            { $group: { _id: '$_id', messages: { $push: '$messages' } } },
          ]).exec();
        
         if (!userMessages || userMessages.length === 0) {
            return Response.json({
                success: false,
                message: "Usermessages not found or empty"
            }, { status: 404 })
        }
        return Response.json({
            success: true,
            messages: userMessages[0].messages
        }, { status: 200 })

    } catch (error) {
        console.log("An unexpected error occured: ", error)
        return Response.json({
            success:false,
            message:"Internal server Error wile getting messages"
        },{status:500})
    }

}