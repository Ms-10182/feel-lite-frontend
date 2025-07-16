import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Mail } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { registerSchema, registerDetailsSchema, type RegisterFormData } from '../lib/validations'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import ThemeToggle from '../components/ui/ThemeToggle'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useGenerateUnauthOtp } from '../hooks/useSettings'

const RegisterPage: React.FC = () => {
  const { register: registerUser, generateOtp } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState<'details' | 'verify'>('details')

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(step === 'details' ? registerDetailsSchema : registerSchema),
  })

  const email = watch('email')

  const [isGeneratingOtp, setIsGeneratingOtp] = useState(false)

  const handleGenerateOtp = async () => {
    if (!email) {
      return
    }
    
    setIsGeneratingOtp(true)
    try {
      await generateOtp(email, true)
      setStep('verify')
    } catch (error) {
      // Error handled in Auth Context
    } finally {
      setIsGeneratingOtp(false)
    }
  }

  const onSubmit = async (data: RegisterFormData) => {
    if (step === 'details') {
      // Validate required fields
      const isValid = await trigger(['email', 'password', 'age'])
      if (!isValid) {
        return
      }
      await handleGenerateOtp()
      return
    }

    setIsSubmitting(true)
    try {
      await registerUser(data)
      navigate('/login')
    } catch (error) {
      // Error handling is done in the AuthContext
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl shadow-xl border border-border p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-bold text-2xl">FL</span>
            </div>
            <h1 className="text-2xl font-bold text-card-foreground">Join Feel-Lite</h1>
            <p className="text-muted-foreground mt-2">Create your account to get started</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {step === 'details' ? (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-2">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...register('email')}
                    className={errors.email ? 'border-destructive focus:ring-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-card-foreground mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      {...register('password')}
                      className={errors.password ? 'border-destructive focus:ring-destructive' : ''}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-card-foreground mb-2">
                    Age
                  </label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter your age"
                    {...register('age', { valueAsNumber: true })}
                    className={errors.age ? 'border-destructive focus:ring-destructive' : ''}
                  />
                  {errors.age && (
                    <p className="mt-1 text-sm text-destructive">{errors.age.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isGeneratingOtp || !email}
                >
                  {isGeneratingOtp ? (
                    <div className="flex items-center space-x-2">
                      <LoadingSpinner size="sm" />
                      <span>Sending OTP...</span>
                    </div>
                  ) : (
                    'Next'
                  )}
                </Button>
              </>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-info/10 border border-info/30 rounded-lg">
                  <Mail className="h-6 w-6 text-info flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-info">Verify your email</h3>
                    <p className="text-sm text-muted-foreground">
                      We've sent a verification code to {email}
                    </p>
                  </div>
                </div>

                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-card-foreground mb-2">
                    Enter Verification Code
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="otp"
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit code"
                      {...register('otp')}
                      className={errors.otp ? 'border-destructive focus:ring-destructive' : ''}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGenerateOtp}
                      disabled={isGeneratingOtp}
                    >
                      {isGeneratingOtp ? <LoadingSpinner size="sm" /> : 'Resend'}
                    </Button>
                  </div>
                  {errors.otp && (
                    <p className="mt-1 text-sm text-destructive">{errors.otp.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Check your email for the verification code
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep('details')}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <LoadingSpinner size="sm" />
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary/80 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage