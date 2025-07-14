import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useGenerateUnauthOtp, useForgotPassword } from '../hooks/useSettings'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const ForgotPasswordPage: React.FC = () => {
  // Form states
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState<'email' | 'verify'>('email')

  // Mutations
  const generateOtpMutation = useGenerateUnauthOtp()
  const forgotPasswordMutation = useForgotPassword()

  const handleGenerateOtp = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email')
      return
    }

    try {
      await generateOtpMutation.mutateAsync(email)
      setStep('verify')
    } catch (error) {
      // Error handled in hook
    }
  }

  const handleResetPassword = async () => {
    if (!otp.trim()) {
      toast.error('Please enter the OTP')
      return
    }

    if (!newPassword.trim()) {
      toast.error('Please enter a new password')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    try {
      await forgotPasswordMutation.mutateAsync({
        email,
        otp,
        newPassword
      })
    } catch (error) {
      // Error handled in hook
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-card p-6 rounded-lg shadow-lg">
        <div>
          <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
          <p className="text-muted-foreground text-center mt-2">
            {step === 'email' 
              ? "Enter your email to receive an OTP"
              : "Enter the OTP sent to your email"}
          </p>
        </div>

        {step === 'email' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handleGenerateOtp}
              disabled={generateOtpMutation.isPending}
            >
              {generateOtpMutation.isPending ? <LoadingSpinner size="sm" /> : 'Send OTP'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                OTP Code
              </label>
              <Input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP from email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                New Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            <div className="space-y-4">
              <Button
                className="w-full"
                onClick={handleResetPassword}
                disabled={forgotPasswordMutation.isPending}
              >
                {forgotPasswordMutation.isPending ? <LoadingSpinner size="sm" /> : 'Reset Password'}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setStep('email')}
              >
                Back to Email
              </Button>
            </div>
          </div>
        )}

        <div className="text-center">
          <Link
            to="/login"
            className="text-sm text-primary hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
