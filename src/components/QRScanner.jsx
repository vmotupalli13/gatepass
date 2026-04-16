import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { Camera, CameraOff } from 'lucide-react'

export default function QRScanner({ onScan, onClose }) {
  const scannerRef = useRef(null)
  const [error, setError] = useState(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        rememberLastUsedCamera: true,
      },
      false
    )

    scanner.render(
      (decodedText) => {
        scanner.clear().catch(() => {})
        onScan(decodedText)
      },
      (errorMsg) => {
        // Ignore routine scan failures
        if (!errorMsg.includes('No QR code found')) {
          setError('Camera permission denied or no camera found.')
        }
      }
    )

    scannerRef.current = scanner
    setStarted(true)

    return () => {
      scanner.clear().catch(() => {})
    }
  }, [onScan])

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-800">Scan Visitor QR</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="p-4">
          {error ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <CameraOff className="w-12 h-12 text-red-400" />
              <p className="text-red-600 text-sm text-center">{error}</p>
              <button onClick={onClose} className="mt-2 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition-colors">
                Close
              </button>
            </div>
          ) : (
            <div id="qr-reader" className="w-full" />
          )}
        </div>

        <p className="text-xs text-gray-400 text-center pb-4 px-4">
          Point camera at the visitor's QR code
        </p>
      </div>
    </div>
  )
}
