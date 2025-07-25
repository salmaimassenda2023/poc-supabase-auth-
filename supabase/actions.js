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

// New function to update user role (admin only)
export async function updateUserRole(userId, newRole) {
    const supabase = await createClient()

    // First, check if current user is admin
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (currentUser?.user_metadata?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required')
    }

    // Update the user's metadata
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { role: newRole }
    })

    if (error) {
        throw new Error(`Failed to update user role: ${error.message}`)
    }

    return data
}