'use client'
import { useState, useTransition } from 'react'
import { handleSendSMSOTP, handleVerifySMSOTP } from '../../supabase/actions'

export default function PhoneAuthWithServerActions() {
    const [phone, setPhone] = useState('')
    const [otp, setOtp] = useState('')
    const [step, setStep] = useState('phone') // 'phone' or 'otp'
    const [message, setMessage] = useState('')
    const [isPending, startTransition] = useTransition()

    const handleSendOTP = async (e) => {
        e.preventDefault()
        setMessage('')

        startTransition(async () => {
            try {
                const result = await handleSendSMSOTP(phone)
                if (result.success) {
                    setMessage('OTP sent successfully! Check your SMS.')
                    setStep('otp')
                }
            } catch (error) {
                setMessage(`Error: ${error.message}`)
            }
        })
    }

    const handleVerifyOTP = async (e) => {
        e.preventDefault()
        setMessage('')

        startTransition(async () => {
            try {
                const result = await handleVerifySMSOTP(phone, otp)
                if (result.success) {
                    setMessage('Successfully signed in! Redirecting...')
                    // The server action will handle the redirect
                    setTimeout(() => {
                        window.location.href = '/'
                    }, 1000)
                }
            } catch (error) {
                setMessage(`Error: ${error.message}`)
            }
        })
    }

    return (
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Phone Authentication</h2>

            {message && (
                <div className={`p-3 mb-4 rounded ${
                    message.includes('Error')
                        ? 'bg-red-100 text-red-700 border border-red-300'
                        : 'bg-green-100 text-green-700 border border-green-300'
                }`}>
                    {message}
                </div>
            )}

            {step === 'phone' ? (
                <form onSubmit={handleSendOTP}>
                    <div className="mb-4">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1234567890"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={isPending}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Include country code
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? 'Sending...' : 'Send OTP'}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyOTP}>
                    <div className="mb-4">
                        <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                            Enter OTP
                        </label>
                        <input
                            type="text"
                            id="otp"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="123456"
                            maxLength="6"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={isPending}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Sent to: {phone}
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                    >
                        {isPending ? 'Verifying...' : 'Verify OTP'}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setStep('phone')
                            setOtp('')
                            setMessage('')
                        }}
                        disabled={isPending}
                        className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 disabled:opacity-50"
                    >
                        Back to Phone Entry
                    </button>
                </form>
            )}
        </div>
    )
}