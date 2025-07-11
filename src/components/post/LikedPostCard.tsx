import React from 'react'
import { Heart, Calendar } from 'lucide-react'
import { formatDate } from '../../lib/utils'
import type { LikedPost } from '../../types'

interface LikedPostCardProps {
  likedPost: LikedPost
}

const LikedPostCard: React.FC<LikedPostCardProps> = ({ likedPost }) => {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="p-6">
        {/* Content */}
        <div className="mb-4">
          <p className="text-foreground whitespace-pre-wrap leading-relaxed">
            {likedPost.content}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(likedPost.createdAt)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-red-500 fill-current" />
            <span className="text-sm text-muted-foreground">Liked</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LikedPostCard
