'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIOSInstall, setShowIOSInstall] = useState(false)

  useEffect(() => {
    // Check if it's iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isInStandaloneMode = (window.navigator as any).standalone
    
    if (isIOS && !isInStandaloneMode) {
      setShowIOSInstall(true)
    }

    // Listen for the beforeinstallprompt event (Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (installPrompt) {
      await installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      if (outcome === 'accepted') {
        setInstallPrompt(null)
      }
    }
  }

  const handleIOSClose = () => {
    setShowIOSInstall(false)
  }

  if (installPrompt) {
    return (
      <div className="fixed bottom-20 left-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Installera appen</h3>
            <p className="text-sm opacity-90">Få snabbare åtkomst från hemskärmen</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setInstallPrompt(null)}
              className="px-3 py-1 text-sm bg-green-700 rounded"
            >
              Senare
            </button>
            <button
              onClick={handleInstallClick}
              className="px-3 py-1 text-sm bg-white text-green-600 rounded font-semibold"
            >
              Installera
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (showIOSInstall) {
    return (
      <div className="fixed bottom-20 left-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Installera appen på iPhone</h3>
            <ol className="text-sm space-y-1 opacity-90">
              <li>1. Tryck på dela-knappen (⬆️) i Safari</li>
              <li>2. Scrolla ner och välj &quot;Lägg till på hemskärm&quot;</li>
              <li>3. Tryck &quot;Lägg till&quot;</li>
            </ol>
          </div>
          <button
            onClick={handleIOSClose}
            className="ml-2 px-2 py-1 text-sm bg-green-700 rounded"
          >
            ✕
          </button>
        </div>
      </div>
    )
  }

  return null
} 