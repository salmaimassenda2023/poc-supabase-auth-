'use client'

import {useEffect, useState} from "react";
import {createClient} from "../../supabase/client";
import {redirect} from "next/navigation";

export default function  DemoClientComponents(){

    const [user,setUser]=useState(null);
    useEffect(
        ()=>{
            async function getUser() {
                const supabase = await createClient()
                const {data, error} = await supabase.auth.getUser()
                if (error || !data?.user) {
                    console.log("no user found !!!")
                    redirect('/login')
                }
                else{
                    setUser(data.user.email);
                    console.log(user)
                }

            }getUser()

        }
    ,[])

    return <p>Hello {user}</p>

}
