import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  LogOut, 
  Trash2, 
  Shield, 
  AlertTriangle,
  Eye,
  EyeOff,
  Settings as SettingsIcon
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { 
  useGetUser, 
  useChangeEmail, 
  useChangePassword, 
  useLogout, 
  useLogoutFromAllDevices, 
  useDeleteAccount,
  useGenerateOtp
} from '../hooks/useSettings'
import { useUpdateAvatar, useUpdateCoverImage, useChangeUsername } from '../hooks/useProfile'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Avatar from '../components/ui/Avatar'
import { formatDate } from '../lib/utils'

const Settings: React.FC = () => {
  const { user, refetchUser } = useAuth()
  const { data: userData } = useGetUser()
  
  // State for modals and forms
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)
  const [showCoverSelector, setShowCoverSelector] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteStep, setDeleteStep] = useState(1) // 1: first confirm, 2: second confirm, 3: generate OTP, 4: enter OTP + password
  
  // Form states
  const [newEmail, setNewEmail] = useState('')
  const [emailOtp, setEmailOtp] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordOtp, setPasswordOtp] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteOtp, setDeleteOtp] = useState('')
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showDeletePassword, setShowDeletePassword] = useState(false)

  // Mutations
  const changeEmailMutation = useChangeEmail()
  const changePasswordMutation = useChangePassword()
  const changeUsernameMutation = useChangeUsername()
  const updateAvatarMutation = useUpdateAvatar()
  const updateCoverImageMutation = useUpdateCoverImage()
  const logoutMutation = useLogout()
  const logoutAllMutation = useLogoutFromAllDevices()
  const deleteAccountMutation = useDeleteAccount()
  const generateOtpMutation = useGenerateOtp()

  // Avatar and cover image options
  const avatarOptions = Array.from({ length: 10 }, (_, i) => 
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`
  )
  
  const coverImageOptions = Array.from({ length: 6 }, (_, i) => 
    `https://picsum.photos/800/300?random=${i}`
  )

  const handleEmailChange = async () => {
    if (!newEmail.trim()) {
      toast.error('Please enter a valid email')
      return
    }
    
    if (!emailOtp.trim()) {
      toast.error('Please enter the OTP')
      return
    }
    
    try {
      await changeEmailMutation.mutateAsync({ newEmail, otp: emailOtp })
      resetEmailModal()
      refetchUser()
    } catch (error) {
      // Error handled in hook
    }
  }

  const handleGenerateEmailOtp = async () => {
    if (!newEmail.trim()) {
      toast.error('Please enter a valid email first')
      return
    }
    
    try {
      await generateOtpMutation.mutateAsync()
    } catch (error) {
      // Error handled in hook
    }
  }

  const handlePasswordChange = async () => {
    if (!oldPassword.trim() || !newPassword.trim()) {
      toast.error('Please fill in all password fields')
      return
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    
    if (!passwordOtp.trim()) {
      toast.error('Please enter the OTP')
      return
    }
    
    try {
      await changePasswordMutation.mutateAsync({ oldPassword, newPassword, otp: passwordOtp })
      resetPasswordModal()
    } catch (error) {
      // Error handled in hook
    }
  }

  const handleUsernameChange = async () => {
    if (window.confirm('This will generate a new random username. Continue?')) {
      try {
        await changeUsernameMutation.mutateAsync()
        refetchUser()
      } catch (error) {
        // Error handled in hook
      }
    }
  }

  const handleAvatarChange = async (avatarIdx: number) => {
    try {
      await updateAvatarMutation.mutateAsync(avatarIdx)
      setShowAvatarSelector(false)
      refetchUser()
    } catch (error) {
      // Error handled in hook
    }
  }

  const handleCoverImageChange = async (coverImageIdx: number) => {
    try {
      await updateCoverImageMutation.mutateAsync(coverImageIdx)
      setShowCoverSelector(false)
      refetchUser()
    } catch (error) {
      // Error handled in hook
    }
  }

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logoutMutation.mutateAsync()
    }
  }

  const handleLogoutAll = async () => {
    if (window.confirm('Are you sure you want to logout from all devices?')) {
      await logoutAllMutation.mutateAsync()
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteStep === 1) {
      setDeleteStep(2)
    } else if (deleteStep === 2) {
      setDeleteStep(3)
    } else if (deleteStep === 3) {
      // Generate OTP step
      try {
        await generateOtpMutation.mutateAsync()
        setDeleteStep(4) // Move to password + OTP entry step
      } catch (error) {
        // Error handled in hook
      }
    } else if (deleteStep === 4) {
      // Password + OTP validation step
      const password = deletePassword.trim()
      const otp = deleteOtp.trim()
      
      if (!password) {
        toast.error('Please enter your password to confirm deletion')
        return
      }
      
      if (!otp) {
        toast.error('Please enter the OTP sent to your email')
        return
      }
      
      if (password.length < 1) {
        toast.error('Password cannot be empty')
        return
      }
      
      console.log('Attempting to delete account with password and OTP')
      
      try {
        await deleteAccountMutation.mutateAsync({ password, otp })
        resetDeleteModal()
        toast.success('Account deleted successfully')
      } catch (error) {
        console.error('Delete account error:', error)
        // Error handled in hook, but let's also show a specific error
        if (error instanceof Error && error.message.includes('password')) {
          toast.error('Invalid password. Please try again.')
        } else if (error instanceof Error && error.message.includes('otp')) {
          toast.error('Invalid OTP. Please try again.')
        }
      }
    }
  }

  const resetDeleteModal = () => {
    setShowDeleteModal(false)
    setDeleteStep(1)
    setDeletePassword('')
    setDeleteOtp('')
  }

  const resetEmailModal = () => {
    setShowEmailModal(false)
    setNewEmail('')
    setEmailOtp('')
  }

  const resetPasswordModal = () => {
    setShowPasswordModal(false)
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordOtp('')
  }

  // Check if delete password is valid
  const isDeletePasswordValid = deletePassword && deletePassword.trim().length > 0

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-primary/10 rounded-lg">
          <SettingsIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
          <User className="h-5 w-5" />
          General Settings
        </h2>

        <div className="space-y-6">
          {/* Profile Information */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-4">
              <Avatar
                src={user.avatar}
                alt={user.username}
                fallback={user.username.charAt(0).toUpperCase()}
                size="lg"
              />
              <div>
                <h3 className="font-medium text-foreground">{user.username}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground">Member since {formatDate(user.createdAt)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAvatarSelector(true)}
              >
                <Camera className="h-4 w-4 mr-2" />
                Avatar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCoverSelector(true)}
              >
                <Camera className="h-4 w-4 mr-2" />
                Cover
              </Button>
            </div>
          </div>

          {/* Username */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <h3 className="font-medium text-foreground">Username</h3>
              <p className="text-sm text-muted-foreground">Change your display name</p>
            </div>
            <Button
              variant="outline"
              onClick={handleUsernameChange}
              disabled={changeUsernameMutation.isPending}
            >
              {changeUsernameMutation.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Generate New'
              )}
            </Button>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <h3 className="font-medium text-foreground">Email Address</h3>
              <p className="text-sm text-muted-foreground">Update your email address</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowEmailModal(true)}
            >
              <Mail className="h-4 w-4 mr-2" />
              Change Email
            </Button>
          </div>

          {/* Password */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <h3 className="font-medium text-foreground">Password</h3>
              <p className="text-sm text-muted-foreground">Update your account password</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowPasswordModal(true)}
            >
              <Lock className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          </div>
        </div>
      </div>

      {/* Security & Sessions */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security & Sessions
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <h3 className="font-medium text-foreground">Logout Current Device</h3>
              <p className="text-sm text-muted-foreground">Sign out from this device only</p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <h3 className="font-medium text-foreground">Logout All Devices</h3>
              <p className="text-sm text-muted-foreground">Sign out from all devices and sessions</p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogoutAll}
              disabled={logoutAllMutation.isPending}
            >
              {logoutAllMutation.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout All
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-destructive/5 border-2 border-destructive/20 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-destructive mb-6 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </h2>

        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-destructive">Delete Account</h3>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      {/* Avatar Selector Modal */}
      <Modal
        isOpen={showAvatarSelector}
        onClose={() => setShowAvatarSelector(false)}
        title="Choose Your Avatar"
      >
        <div className="p-4">
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
            {avatarOptions.map((avatar, index) => (
              <button
                key={index}
                onClick={() => handleAvatarChange(index)}
                disabled={updateAvatarMutation.isPending}
                className="relative p-3 rounded-xl border-2 border-border hover:border-primary transition-all duration-200 bg-muted/50 hover:bg-muted"
              >
                <Avatar src={avatar} size="md" className="mx-auto" />
                {updateAvatarMutation.isPending && (
                  <div className="absolute inset-0 flex items-center justify-center bg-card/80 rounded-xl">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Cover Image Selector Modal */}
      <Modal
        isOpen={showCoverSelector}
        onClose={() => setShowCoverSelector(false)}
        title="Choose Your Cover Image"
      >
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {coverImageOptions.map((cover, index) => (
              <button
                key={index}
                onClick={() => handleCoverImageChange(index)}
                disabled={updateCoverImageMutation.isPending}
                className="relative rounded-xl overflow-hidden border-2 border-border hover:border-primary transition-all duration-200 bg-muted/50"
              >
                <img
                  src={cover}
                  alt={`Cover option ${index + 1}`}
                  className="w-full h-24 object-cover"
                />
                {updateCoverImageMutation.isPending && (
                  <div className="absolute inset-0 flex items-center justify-center bg-card/80">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Email Change Modal */}
      <Modal
        isOpen={showEmailModal}
        onClose={resetEmailModal}
        title="Change Email Address"
      >
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Current Email
            </label>
            <Input
              type="email"
              value={user.email}
              disabled
              className="bg-muted"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              New Email
            </label>
            <Input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter new email address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              OTP Code
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value)}
                placeholder="Enter OTP code"
              />
              <Button
                variant="outline"
                onClick={handleGenerateEmailOtp}
                disabled={generateOtpMutation.isPending || !newEmail.trim()}
              >
                {generateOtpMutation.isPending ? <LoadingSpinner size="sm" /> : 'Generate OTP'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Generate OTP first, then check your email for the code
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={resetEmailModal}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEmailChange}
              disabled={changeEmailMutation.isPending || !newEmail.trim() || !emailOtp.trim()}
            >
              {changeEmailMutation.isPending ? <LoadingSpinner size="sm" /> : 'Update Email'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={resetPasswordModal}
        title="Change Password"
      >
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Current Password
            </label>
            <div className="relative">
              <Input
                type={showOldPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              New Password
            </label>
            <div className="relative">
              <Input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Confirm New Password
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              OTP Code
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={passwordOtp}
                onChange={(e) => setPasswordOtp(e.target.value)}
                placeholder="Enter OTP code"
              />
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await generateOtpMutation.mutateAsync()
                  } catch (error) {
                    // Error handled in hook
                  }
                }}
                disabled={generateOtpMutation.isPending}
              >
                {generateOtpMutation.isPending ? <LoadingSpinner size="sm" /> : 'Generate OTP'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Generate OTP first, then check your email for the code
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={resetPasswordModal}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePasswordChange}
              disabled={changePasswordMutation.isPending || !oldPassword || !newPassword || !confirmPassword || !passwordOtp.trim()}
            >
              {changePasswordMutation.isPending ? <LoadingSpinner size="sm" /> : 'Change Password'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={resetDeleteModal}
        title="Delete Account"
      >
        <div className="p-4">
          {deleteStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-destructive">Are you sure?</h3>
                  <p className="text-sm text-muted-foreground">
                    This action will permanently delete your account and all associated data. This cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={resetDeleteModal}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  I understand, continue
                </Button>
              </div>
            </div>
          )}

          {deleteStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-destructive">Last Chance!</h3>
                  <p className="text-sm text-muted-foreground">
                    This is your final warning. Do you really want to permanently delete your account and all data?
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={resetDeleteModal}>
                  No, keep my account
                </Button>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  Yes, delete permanently
                </Button>
              </div>
            </div>
          )}

          {deleteStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-info/10 border border-info/30 rounded-lg">
                <Mail className="h-6 w-6 text-info flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-info">Generate OTP</h3>
                  <p className="text-sm text-muted-foreground">
                    We'll send a verification code to your email address.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={resetDeleteModal}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={generateOtpMutation.isPending}
                >
                  {generateOtpMutation.isPending ? <LoadingSpinner size="sm" /> : 'Send OTP'}
                </Button>
              </div>
            </div>
          )}

          {deleteStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <Lock className="h-6 w-6 text-destructive flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-destructive">Enter Password & OTP</h3>
                  <p className="text-sm text-muted-foreground">
                    Please enter your password and the OTP code sent to your email.
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showDeletePassword ? 'text' : 'password'}
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showDeletePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  OTP Code
                </label>
                <Input
                  type="text"
                  value={deleteOtp}
                  onChange={(e) => setDeleteOtp(e.target.value)}
                  placeholder="Enter OTP code from email"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={resetDeleteModal}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={deleteAccountMutation.isPending || !deletePassword.trim() || !deleteOtp.trim()}
                >
                  {deleteAccountMutation.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    'Delete My Account'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default Settings