import { SavedOutfitsClient } from './saved-outfits-client'
import { OutfitsClient } from './outfits-client'

export default function OutfitsPage() {
  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Outfits</h1>
        <p className="text-sm text-gray-500 mt-1">
          Save outfit combinations and get AI-powered suggestions
        </p>
      </div>
      <SavedOutfitsClient />
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px flex-1 bg-pink-100" />
          <span className="text-xs font-semibold text-pink-300 uppercase tracking-widest">AI Recommendations</span>
          <div className="h-px flex-1 bg-pink-100" />
        </div>
        <OutfitsClient />
      </div>
    </div>
  )
}
