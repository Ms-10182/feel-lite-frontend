import React, { useState } from 'react'
import { Shield, Users, Ban } from 'lucide-react'
import { useBannedUsers, useBanUser, useUnbanUser } from '../hooks/useAdmin'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { banUserSchema, type BanUserFormData } from '../lib/validations'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import Modal from '../components/ui/Modal'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Avatar from '../components/ui/Avatar'
import { formatDate } from '../lib/utils'

const AdminPage: React.FC = () => {
  const [page, setPage] = useState(1)
  const [showBanModal, setShowBanModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>('')

  const { data: bannedUsersData, isLoading } = useBannedUsers(page)
  const banUserMutation = useBanUser()
  const unbanUserMutation = useUnbanUser()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BanUserFormData>({
    resolver: zodResolver(banUserSchema),
  })

  const onBanUser = async (data: BanUserFormData) => {
    try {
      await banUserMutation.mutateAsync({
        userId: selectedUserId,
        data,
      })
      setShowBanModal(false)
      reset()
      setSelectedUserId('')
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const handleUnban = async (userId: string) => {
    if (window.confirm('Are you sure you want to unban this user?')) {
      try {
        await unbanUserMutation.mutateAsync(userId)
      } catch (error) {
        // Error handling is done in the hook
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const bannedUsers = bannedUsersData?.docs || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Shield className="h-6 w-6 mr-3 text-primary-500" />
          Admin Panel
        </h1>
        <p className="text-gray-600 mt-2">
          Manage users and moderate content
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-primary-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">--</p>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Ban className="h-8 w-8 text-error-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{bannedUsersData?.totalDocs || 0}</p>
              <p className="text-sm text-gray-600">Banned Users</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-success-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">--</p>
              <p className="text-sm text-gray-600">Active Posts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Banned Users */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Banned Users</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {bannedUsers.length > 0 ? (
            bannedUsers.map((user) => (
              <div key={user._id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar
                      src={user.avatar}
                      alt={user.username}
                      fallback={user.username.charAt(0)}
                      size="md"
                    />
                    
                    <div>
                      <h3 className="font-medium text-gray-900">{user.username}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Reason:</span> {user.banReason}
                        </p>
                        {user.banExpiresAt && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Expires:</span> {formatDate(user.banExpiresAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleUnban(user._id)}
                    disabled={unbanUserMutation.isPending}
                    variant="outline"
                    size="sm"
                  >
                    {unbanUserMutation.isPending ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      'Unban'
                    )}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center">
              <Ban className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500">No banned users found.</p>
            </div>
          )}
        </div>
        
        {bannedUsersData && bannedUsersData.totalPages > 1 && (
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              
              <span className="text-sm text-gray-600">
                Page {page} of {bannedUsersData.totalPages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => setPage(prev => prev + 1)}
                disabled={page >= bannedUsersData.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Ban User Modal */}
      <Modal
        isOpen={showBanModal}
        onClose={() => setShowBanModal(false)}
        title="Ban User"
      >
        <form onSubmit={handleSubmit(onBanUser)} className="space-y-4">
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Ban
            </label>
            <Textarea
              id="reason"
              placeholder="Enter the reason for banning this user..."
              rows={3}
              {...register('reason')}
              className={errors.reason ? 'border-error-500 focus:ring-error-400' : ''}
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-error-600">{errors.reason.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
              Duration (hours, leave empty for permanent)
            </label>
            <Input
              id="duration"
              type="number"
              placeholder="24"
              {...register('duration', { valueAsNumber: true })}
              className={errors.duration ? 'border-error-500 focus:ring-error-400' : ''}
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-error-600">{errors.duration.message}</p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowBanModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={banUserMutation.isPending}
            >
              {banUserMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span>Banning...</span>
                </div>
              ) : (
                'Ban User'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AdminPage