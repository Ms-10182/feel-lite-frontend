import React, { useState } from 'react'
import { Copy, X, Check, Link } from 'lucide-react'
import Modal from './Modal'
import { Button } from './Button'
import toast from 'react-hot-toast'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  postId: string
}

export default function ShareModal({ isOpen, onClose, postId }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  
  // Generate the shareable link
  const postUrl = `${window.location.origin}/post/${postId}`
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl)
      .then(() => {
        setCopied(true)
        toast.success('Link copied to clipboard!')
        
        // Reset copied state after 3 seconds
        setTimeout(() => {
          setCopied(false)
        }, 3000)
      })
      .catch(err => {
        console.error('Failed to copy link:', err)
        toast.error('Failed to copy link')
      })
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Link className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              Share Post
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Link Input */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={postUrl}
                readOnly
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <Button 
              onClick={handleCopyLink}
              variant={copied ? "default" : "outline"}
              className={`min-w-[100px] ${copied ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Copy this link to share the post with anyone
          </p>
        </div>
        
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-sm text-center text-muted-foreground">
            Thanks for sharing content from Feel-Lite!
          </p>
        </div>
      </div>
    </Modal>
  )
}
