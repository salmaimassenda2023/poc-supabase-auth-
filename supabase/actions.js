'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from './server'

// Handle signin (no changes needed for metadata approach)
export async function handelSignInWithCredentials(formData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email'),
        password: formData.get('password'),
    }
    const { data: result, error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        redirect('/error')
    }
    if (result?.user) {
        console.log('Login successful for:', result.user.email)
        console.log('User role:', result.user.user_metadata?.role || 'user')

        revalidatePath('/')
        redirect('/')
    } else {
        console.log('Login failed: No user returned')
        redirect('/login')
    }
}

// Updated OAuth signin to include default role
export async function signInWithOAuth(provider) {
    const supabase = await createClient();
    const auth_callback_url = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: auth_callback_url,
            // Set default role for OAuth users
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            }
        },
    })

    if (error) {
        console.error("Error Signin with google:", error);
    }
    if (data.url) {
        redirect(data.url)
    }
}

export async function handelGoogleSignIn() {
    await signInWithOAuth('google');
}

// Updated signup with metadata role
export async function handelEmailPasswordSignUp(formData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email'),
        password: formData.get('password'),
        options: {
            data: {
                role: 'user', // Set default role
            }
        }
    }

    const { data: result, error } = await supabase.auth.signUp(data)

    if (error) {
        console.log('Signup error:', error)
        redirect('/error')
    }

    console.log('User created with role:', result.user?.user_metadata?.role)

    revalidatePath('/', 'layout')
    redirect('/')
}

// Handle logout (no changes needed)
export async function logout() {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
        redirect('/error')
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

// NEW: Handle SMS OTP sending for phone authentication
export async function handleSendSMSOTP(phone,fullName) {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase.auth.signInWithOtp({
            phone: phone,
            options: {
                // Set default role for new phone auth users
                data: {
                    role: 'user',
                    full_name: fullName.trim(),
                    display_name: fullName.trim()
                }
            }
        })

        if (error) {
            console.error('SMS OTP send error:', error)
            throw new Error(error.message)
        }

        console.log('SMS OTP sent successfully to:', phone)
        return { success: true, message: 'OTP sent successfully' }

    } catch (error) {
        console.error('Error sending SMS OTP:', error)
        throw new Error(`Failed to send OTP: ${error.message}`)
    }
}

// NEW: Handle SMS OTP verification and login
export async function handleVerifySMSOTP(phone, token) {
    const supabase = await createClient()

    try {
        const { data: { session }, error } = await supabase.auth.verifyOtp({
            phone: phone,
            token: token,
            type: 'sms'
        })

        if (error) {
            console.error('SMS OTP verification error:', error)
            throw new Error(error.message)
        }

        if (session?.user) {
            console.log('Phone authentication successful for:', session.user.phone)
            console.log('User role:', session.user.user_metadata?.role || 'user')

            // If this is a new user (first time phone auth), ensure they have the default role
            if (!session.user.user_metadata?.role) {
                try {
                    const { error: updateError } = await supabase.auth.updateUser({
                        data: { role: 'user' }
                    })

                    if (updateError) {
                        console.error('Error setting default role:', updateError)
                    } else {
                        console.log('Default role set for new phone user')
                    }
                } catch (roleError) {
                    console.error('Failed to set default role:', roleError)
                }
            }

            revalidatePath('/')
            return {
                success: true,
                session: session,
                message: 'Phone authentication successful'
            }
        } else {
            console.log('Phone verification failed: No user session returned')
            throw new Error('Verification failed: No user session')
        }

    } catch (error) {
        console.error('Error verifying SMS OTP:', error)
        throw new Error(`Failed to verify OTP: ${error.message}`)
    }
}


