import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Hash } from 'lucide-react'
import { Button } from '../ui/Button'

const HashtagSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Remove # if user includes it
      const cleanTag = searchQuery.replace(/^#/, '').trim()
      if (cleanTag) {
        navigate(`/hashtag/${cleanTag}`)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
      <div className="flex items-center mb-4">
        <Hash className="h-5 w-5 mr-2 text-primary" />
        <h2 className="text-lg font-semibold text-card-foreground">Search Hashtags</h2>
      </div>
      
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Hash className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Enter hashtag (e.g., ai, blockchain, react)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="block w-full pl-9 pr-3 py-2 border border-input rounded-md 
                     bg-background text-foreground placeholder-muted-foreground
                     focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                     text-sm"
          />
        </div>
        <Button 
          onClick={handleSearch}
          disabled={!searchQuery.trim()}
          className="px-6"
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground mt-2">
        Search for posts by hashtag. You can include or omit the # symbol.
      </p>
    </div>
  )
}

export default HashtagSearch
