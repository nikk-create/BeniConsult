import { useRef, useState } from 'react'
import { Camera } from 'lucide-react'
import { useUploadAvatar } from '@/hooks/useUploadAvatar'

export default function Avatar({
  userId,
  avatarUrl,
  name,
  size = 'lg',
  editable = false,
  onUploaded,
  className = '',
}) {
  const fileRef = useRef()
  const { uploadAvatar, uploading } = useUploadAvatar(userId)
  const [localUrl, setLocalUrl] = useState(null)
  const [imgError, setImgError] = useState(false)

  const sizes = {
    sm: { wrapper: 'w-9 h-9',   text: 'text-xs',  camera: 'w-3 h-3',   btn: 'w-5 h-5' },
    md: { wrapper: 'w-12 h-12', text: 'text-sm',  camera: 'w-3.5 h-3.5', btn: 'w-6 h-6' },
    lg: { wrapper: 'w-16 h-16', text: 'text-xl',  camera: 'w-4 h-4',   btn: 'w-7 h-7' },
    xl: { wrapper: 'w-24 h-24', text: 'text-3xl', camera: 'w-5 h-5',   btn: 'w-8 h-8' },
  }
  const s = sizes[size] || sizes.lg

  const initials = name
    ? name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  // URL à afficher — priorité : local (vient d'être uploadé) > prop > rien
  const displayUrl = localUrl || (imgError ? null : avatarUrl)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert('Image trop grande. Maximum 2MB.')
      return
    }

    // Preview immédiat avant l'upload
    const preview = URL.createObjectURL(file)
    setLocalUrl(preview)
    setImgError(false)

    const url = await uploadAvatar(file)
    if (url) {
      setLocalUrl(url)
      onUploaded?.(url)
    } else {
      // Échec — remet l'ancienne
      setLocalUrl(null)
    }

    // Nettoie le preview blob
    URL.revokeObjectURL(preview)

    // Reset input pour permettre re-upload du même fichier
    e.target.value = ''
  }

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div className={`${s.wrapper} rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center`}>
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={name || 'Avatar'}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className={`font-heading font-bold ${s.text} text-primary select-none`}>
            {initials}
          </span>
        )}

        {/* Overlay chargement */}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Bouton caméra */}
      {editable && !uploading && (
        <>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={`absolute -bottom-1 -right-1 ${s.btn} bg-primary rounded-lg flex items-center justify-center shadow-md hover:bg-primary-dark transition-colors border-2 border-white`}
          >
            <Camera className={`${s.camera} text-white`} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </>
      )}
    </div>
  )
}