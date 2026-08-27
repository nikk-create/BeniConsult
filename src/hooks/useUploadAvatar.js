import { useState } from 'react'
import { supabase } from '@/api/supabase'

export function useUploadAvatar(userId) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const uploadAvatar = async (file) => {
    if (!file || !userId) return null
    setUploading(true)
    setError(null)

    try {
      const ext = file.name.split('.').pop().toLowerCase()
      // Chemin simple : userId.ext (pas de sous-dossier)
      const path = `${userId}.${ext}`

      // Supprime l'ancien avatar si existe
      await supabase.storage.from('avatars').remove([
        `${userId}.jpg`,
        `${userId}.jpeg`,
        `${userId}.png`,
        `${userId}.webp`,
      ])

      // Upload
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: '0',
        })

      if (uploadError) throw uploadError

      // URL publique
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      // Ajoute timestamp pour éviter le cache navigateur
      const url = `${data.publicUrl}?t=${Date.now()}`

      // Met à jour le profil
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('id', userId)

      if (updateError) throw updateError

      return url
    } catch (err) {
      console.error('Upload avatar error:', err)
      setError(err.message)
      return null
    } finally {
      setUploading(false)
    }
  }

  return { uploadAvatar, uploading, error }
}