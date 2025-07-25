import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '../../../supabase/server'

export async function GET(request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    let next = searchParams.get('next') ?? '/'
    if (!next.startsWith('/')) {
        // if "next" is not a relative URL, use the default
        next = '/'
    }

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.user) {
            // Check if this is a new OAuth user or user without role
            if (!data.user.user_metadata?.role) {
                console.log('Assigning default role to OAuth user:', data.user.email)

                try {
                    // Set default role for new OAuth users
                    await supabase.auth.updateUser({
                        data: {
                            role: 'user',
                            created_at: new Date().toISOString()
                        }
                    })
                    console.log('Role assigned successfully')
                } catch (updateError) {
                    console.error('Error assigning role to OAuth user:', updateError)
                    // Continue with redirect even if role assignment fails
                }
            } else {
                console.log('OAuth user already has role:', data.user.user_metadata.role)
            }

            const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development'
            if (isLocalEnv) {
                // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}