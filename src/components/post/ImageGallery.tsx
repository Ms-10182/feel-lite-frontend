import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Modal from '../ui/Modal'
import { Button } from '../ui/Button'

interface ImageGalleryProps {
  images: string[]
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const openLightbox = () => {
    setSelectedImage(currentIndex)
  }

  const closeLightbox = () => {
    setSelectedImage(null)
  }

  const nextImageLightbox = () => {
    if (selectedImage !== null && selectedImage < images.length - 1) {
      setSelectedImage(selectedImage + 1)
    }
  }

  const prevImageLightbox = () => {
    if (selectedImage !== null && selectedImage > 0) {
      setSelectedImage(selectedImage - 1)
    }
  }

  if (images.length === 0) return null

  return (
    <>
      <div className="relative bg-muted">
        <div 
          className="relative overflow-hidden cursor-pointer"
          onClick={openLightbox}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div 
            className="flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {images.map((image, index) => (
              <div key={index} className="w-full flex-shrink-0">
                <img
                  src={image}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-auto max-h-96 object-cover"
                />
              </div>
            ))}
          </div>
          
          {/* Navigation arrows - only show if multiple images */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToPrev()
                }}
                disabled={currentIndex === 0}
                className={`absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-opacity ${
                  currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
                disabled={currentIndex === images.length - 1}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-opacity ${
                  currentIndex === images.length - 1 ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
        
        {/* Dots indicator - only show if multiple images */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentIndex(index)
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex 
                    ? 'bg-white shadow-sm' 
                    : 'bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      
      {selectedImage !== null && (
        <ImageLightbox
          images={images}
          currentIndex={selectedImage}
          onClose={closeLightbox}
          onNext={nextImageLightbox}
          onPrev={prevImageLightbox}
        />
      )}
    </>
  )
}

interface ImageLightboxProps {
  images: string[]
  currentIndex: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}) => {
  return (
    <Modal isOpen={true} onClose={onClose} size="xl">
      <div className="relative">
        <img
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          className="w-full h-auto max-h-[70vh] object-contain"
        />
        
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrev}
              disabled={currentIndex === 0}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onNext}
              disabled={currentIndex === images.length - 1}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

export default ImageGallery