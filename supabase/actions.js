'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from './server'

// handel signin

export async function handelSignInWithCredentials(formData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.get('email') ,
        password: formData.get('password'),
    }
    const { data: result, error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        redirect('/error')
    }
    if (result?.user) {
        console.log('Login successful for:', result.user.email)

        // Revalidate and redirect - but don't do both in rapid succession
        revalidatePath('/')
        redirect('/')
    } else {
        console.log('Login failed: No user returned')
        redirect('/login')
    }
}

export async function signInWithOAuth(provider){
    const supabase = await createClient();
    const auth_callback_url=`${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: auth_callback_url,
        },
    })
    if(error){
        console.error("Error Signin with google :",error);
    }
    if (data.url) {
        redirect(data.url) // use the redirect API for your server framework
    }

}
export async function handelGoogleSignIn(){
    await signInWithOAuth('google');
}

// handel signup
export async function handelEmailPasswordSignUp(formData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.get('email') ,
        password: formData.get('password') ,
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        redirect('/error')
    }

    revalidatePath('/', 'layout')
    redirect('/')
}



// handel logout

export async function logout() {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
        redirect('/error')
    }

    revalidatePath('/', 'layout')
    redirect('/')
}
