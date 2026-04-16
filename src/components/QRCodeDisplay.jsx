import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

export default function QRCodeDisplay({ value, size = 256 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !value) return
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 2,
      color: { dark: '#1e293b', light: '#ffffff' },
    })
  }, [value, size])

  return (
    <canvas
      ref={canvasRef}
      className="rounded-xl shadow-lg"
      style={{ width: size, height: size, maxWidth: '100%' }}
    />
  )
}
