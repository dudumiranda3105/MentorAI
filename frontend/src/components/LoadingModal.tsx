import React from 'react'
import { Loader } from 'lucide-react'

interface LoadingModalProps {
  isOpen: boolean
}

export const LoadingModal: React.FC<LoadingModalProps> = ({ isOpen }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex max-w-sm flex-col items-center justify-center gap-6 rounded-xl border-none bg-white p-8 shadow-lg">
        <Loader className="h-16 w-16 animate-spin text-blue-600" />
        <p className="text-center text-lg text-gray-800">
          Analisando o conteúdo e criando flashcards…
        </p>
      </div>
    </div>
  )
}
