// middleware.js
import { updateSession } from './supabase/middleware'
import { NextResponse } from "next/server";
import {createClient} from "@/supabase/server";

export async function middleware(request) {
    // Always update session first
    const response = await updateSession(request)

    // Check if trying to access protected routes
    const pathname = request.nextUrl.pathname
    const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/drivers')

    if (isProtectedRoute) {
        try {
            // Get user from the response cookies
            const supabase = createClient();
            const {data,error}=(await supabase).auth.getUser();

            if (data) {

                const userRole = data.user.user_metadata.role;

                console.log('Middleware - User role:', userRole) // Debug


                if (userRole !== 'admin') {
                    return NextResponse.rewrite(new URL('/', request.url))
                }
            }
        } catch (error) {
            console.error('Middleware auth check failed:', error)
            return NextResponse.rewrite(new URL('/login', request.url))
        }
    }

    return response
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',],
}