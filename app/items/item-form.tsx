'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { CATEGORIES, GENDERS, SIZES, Location, Bag, Item } from '@/lib/types'
import { toast } from 'sonner'

const itemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  brand: z.string().optional(),
  category: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  gender: z.string().optional(),
  purchase_price: z.string().optional(),
  purchase_date: z.string().optional(),
  product_url: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
  location_id: z.string().optional(),
  bag_id: z.string().optional(),
  cleanliness: z.enum(['clean', 'dirty']).optional(),
})

type ItemFormData = z.infer<typeof itemSchema>

interface ItemFormProps {
  locations: Location[]
  bags: Bag[]
  defaultValues?: Partial<Item>
  itemId?: string
}

export function ItemForm({ locations, bags, defaultValues, itemId }: ItemFormProps) {
  const router = useRouter()
  const [imageUrl, setImageUrl] = useState<string>(defaultValues?.image_url || '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      brand: defaultValues?.brand || '',
      category: defaultValues?.category || '',
      color: defaultValues?.color || '',
      size: defaultValues?.size || '',
      gender: defaultValues?.gender || '',
      purchase_price: defaultValues?.purchase_price?.toString() || '',
      purchase_date: defaultValues?.purchase_date || '',
      product_url: defaultValues?.product_url || '',
      notes: defaultValues?.notes || '',
      location_id: defaultValues?.location_id || '',
      bag_id: defaultValues?.bag_id || '',
      cleanliness: defaultValues?.cleanliness || 'clean',
    },
  })

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload failed')
      const { url } = await res.json()
      setImageUrl(url)
    } catch {
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  })

  const onSubmit = async (data: ItemFormData) => {
    setSaving(true)
    try {
      const payload = {
        ...data,
        purchase_price: data.purchase_price ? parseFloat(data.purchase_price) : null,
        location_id: data.location_id || null,
        bag_id: data.bag_id || null,
        image_url: imageUrl || null,
        cleanliness: data.cleanliness || 'clean',
        source: defaultValues?.source || 'manual',
      }

      const url = itemId ? `/api/items/${itemId}` : '/api/items'
      const method = itemId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save')
      }

      toast.success(itemId ? 'Item updated!' : 'Item added!')
      router.push('/items')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save item')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
        {imageUrl ? (
          <div className="relative w-40 h-40 rounded-lg overflow-hidden border border-gray-200">
            <img src={imageUrl} alt="Item" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => setImageUrl('')}
              className="absolute top-1 right-1 rounded-full bg-white/80 p-1 hover:bg-white"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center w-full h-40 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
              isDragActive
                ? 'border-pink-400 bg-pink-50'
                : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
            ) : (
              <>
                {isDragActive ? (
                  <Upload className="h-6 w-6 text-pink-400 mb-2" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-gray-400 mb-2" />
                )}
                <p className="text-sm text-gray-500">
                  {isDragActive ? 'Drop photo here' : 'Drag & drop or click to upload'}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          {...register('name')}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="e.g. Black Blazer"
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Brand */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
          <input
            {...register('brand')}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="e.g. Zara"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            {...register('category')}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="">Select category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
        <select
          {...register('gender')}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="">Select gender</option>
          {GENDERS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
          <input
            {...register('color')}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="e.g. Black"
          />
        </div>

        {/* Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
          <select
            {...register('size')}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="">Select size</option>
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
            <input
              {...register('purchase_price')}
              type="number"
              step="0.01"
              className="w-full rounded-lg border border-gray-200 pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
          <input
            {...register('purchase_date')}
            type="date"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
      </div>

      {/* Product URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Product URL</label>
        <input
          {...register('product_url')}
          type="url"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="https://..."
        />
        {errors.product_url && (
          <p className="mt-1 text-xs text-red-500">{errors.product_url.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <select
            {...register('location_id')}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="">None</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Bag */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bag</label>
          <select
            {...register('bag_id')}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="">None</option>
            {bags.map((bag) => (
              <option key={bag.id} value={bag.id}>
                {bag.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cleanliness */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Cleanliness</label>
        <select
          {...register('cleanliness')}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="clean">Clean</option>
          <option value="dirty">Dirty</option>
        </select>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          {...register('notes')}
          rows={3}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="Any additional notes..."
        />
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600 transition-colors disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {itemId ? 'Save Changes' : 'Add Item'}
        </button>
      </div>
    </form>
  )
}
