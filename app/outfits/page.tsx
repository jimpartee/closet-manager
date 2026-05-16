import { OutfitsClient } from './outfits-client'

export default function OutfitsPage() {
  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Outfit Recommendations</h1>
        <p className="text-sm text-gray-500 mt-1">
          Get AI-powered outfit suggestions from your wardrobe
        </p>
      </div>
      <OutfitsClient />
    </div>
  )
}
