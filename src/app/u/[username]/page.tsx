"use client";

import React, { useState, useEffect } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useCompletion } from 'ai/react'
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { messageSchema } from '@/schemas/messageSchema'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react'
import Link from 'next/link';


const page = () => {

  const specialChar = "||"
  const { toast } = useToast()
  const [isSumbitting, setIsSumbitting] = useState(false)
  const [messageResponse, setMessageResponse] = useState("")
  const [isAcceptingMessages, setIsAcceptingMessages] = useState(false)
  const [suggestionMessage, setSuggestionMessage] = useState([])
  const [textAreaValue, setTextAreaValue] = useState()




  const params = useParams()
  const { username } = params

  const recommendedMessages = [
    {
      id: 1,
      content: "What's one thing you've always wanted to learn?",
    },
    {
      id: 2,
      content: "If you could travel anywhere in the world right now, where would you go?",
    },
    {
      id: 3,
      content: "What's the last movie or book that made you think deeply?",
    },
  ];
  

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: ''
    }
  })
  const { register, watch, setValue } = form
  
  const content = form.watch('content');

  const handleMessageClick = async(e:any) => {
    const value = e.target.innerText
    form.setValue("content",value)
  }


  // useEffect(() => {
  //   const getMessagesSuggestion = async() => {
  //     try {
  //     const response = await axios.post<ApiResponse>("/api/suggest-messages")
  //     console.log(response)
  //     } catch (error) {
  //       const axiosError = error as AxiosError<ApiResponse>;
  //       const errorMessage = axiosError.response?.data.message
  //       toast({
  //         title: "Error Sending Message",
  //         description: axiosError.response?.data.message || "Unknown Error",
  //         variant: "destructive",
  //       })
  //     }
  //   } 
  //   getMessagesSuggestion();
  // }, [])
  


  useEffect(() => {
    const fetchAcceptMessages = async () => {
      try {
        const response = await axios.get<ApiResponse>(`/api/accept-messages`);
        setIsAcceptingMessages(response.data.isAcceptingMessages || false);
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        const errorMessage = axiosError.response?.data.message;
        toast({
          title: "Error fetching message status",
          description: errorMessage,
          variant: "destructive",
        });
      }
    };

    fetchAcceptMessages();
  }, [toast, username]);




  async function onSubmit(data: z.infer<typeof messageSchema>) {
    setIsSumbitting(true)
    try {
      const extendedData = {
        ...data,
        username: username

      };
      const response = await axios.post<ApiResponse>("/api/send-message", extendedData)
      setMessageResponse(response.data.message)
      toast({
        title: "Your message is sent successfully:",
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">{JSON.stringify(data, null, 2)}</code>
          </pre>
        ),
      })
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data.message
      toast({
        title: "Error Sending Message",
        description: errorMessage,
        variant: "destructive",
      })

    } finally {
      setIsSumbitting(false)
    }
  }

  return (
    <>
      <div className="flex flex-col justify-center items-center mt-10">
        <h1 className="text-4xl font-bold mb-4">Public Profile Link</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Send anonymous message to @{username}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your anonymous message here"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex justify-center'>
              <Button disabled={!isAcceptingMessages} type="submit">{
                isSumbitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please Wait
                  </>
                ) : "Send It"
              }</Button>
              {!isAcceptingMessages === true ? <div className='text-sm flex justify-center items-center text-gray-600 mx-2'>(Maybe the user isn't accepting message right now)</div> : ""}
            </div>
          </form>
        </Form>
      </div>
      <div className="mt-14 w-[66%] mx-auto">
        <Button type="submit">Suggest Message</Button>

        <p className='mt-4 mb-4 text-sm'>Click on any message below to select it.</p>

        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {recommendedMessages.map((message, index) => {
              return <div key={index} onClick={handleMessageClick} className=" flex items-center space-x-4 rounded-md border p-4 cursor-pointer">
                <div className="flex-1 space-y-1">
                  <p className="font-medium leading-none">
                    {message.content}
                  </p>
                </div>
              </div>
            })
            }
          </CardContent>
        </Card>

      </div>
      <div className='p-10 flex flex-col justify-center items-center gap-3'>
        <p className="font-medium leading-none text-gray-600">Make your life Intresting With Anonymous Messages</p>
        <Link href={"/sign-up"}><Button type="submit">Create Account</Button></Link>
      </div>
    </>
  )
}

export default page