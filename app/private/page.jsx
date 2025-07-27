// server component
import { redirect } from 'next/navigation'
import {createClient} from "../../supabase/server";

export default async function PrivatePage() {


    const supabase = await createClient();
    const {data, error} = await supabase.auth.getUser()
    if (error || !data.user) {
        redirect('/login')
    }

    return (
        <div>
            <p>Hello {data.user.email || data.user.user_metadata?.full_name}</p>
            <p>Your role: {data.user.user_metadata?.role}</p>
        </div>
    )

}