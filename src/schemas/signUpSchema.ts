import { z } from "zod";

export const userNameValidation = z
    .string()
    .min(2, "Username must be atleast 2 characters")
    .max(20, "Username mustn't be more than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Userame must not contain any special characters")


export const signUpSchema = z.object({
    username: userNameValidation,
    email:z.string().email({message:"Invalid email address"}),
    password:z.string().min(6,{message:"Password Must be atleast 6 characters"})
})