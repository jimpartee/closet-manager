import { EmailScanClient } from './email-scan-client'

export default function EmailScanPage({
  searchParams,
}: {
  searchParams: Promise<{ items?: string; error?: string }>
}) {
  return <EmailScanPageInner searchParamsPromise={searchParams} />
}

async function EmailScanPageInner({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ items?: string; error?: string }>
}) {
  const searchParams = await searchParamsPromise
  const itemsParam = searchParams.items
  const errorParam = searchParams.error

  let scannedItems: Record<string, string | number | undefined>[] = []
  if (itemsParam) {
    try {
      const decoded = Buffer.from(itemsParam, 'base64url').toString('utf-8')
      scannedItems = JSON.parse(decoded)
    } catch {
      // ignore parse errors
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Email Scan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Import items from your Gmail order confirmations
        </p>
      </div>
      <EmailScanClient
        initialItems={scannedItems}
        error={errorParam}
      />
    </div>
  )
}
