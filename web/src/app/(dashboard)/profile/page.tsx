'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Save, User, MessageSquare, Upload, X, Camera } from 'lucide-react'
import Image from 'next/image'

type UserProfile = {
    display_name: string | null
    welcome_message: string | null
    avatar_url: string | null
}

export default function ProfilePage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

    const [formData, setFormData] = useState<UserProfile>({
        display_name: null,
        welcome_message: 'Bem-vindo de volta!',
        avatar_url: null
    })

    useEffect(() => {
        async function loadProfile() {
            setLoading(true)
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) throw new Error('Não autenticado')

                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .single()

                if (profile) {
                    setFormData({
                        display_name: profile.display_name,
                        welcome_message: profile.welcome_message || 'Bem-vindo de volta!',
                        avatar_url: profile.avatar_url
                    })
                    if (profile.avatar_url) {
                        setAvatarPreview(profile.avatar_url)
                    }
                }
            } catch (err: any) {
                console.error('Erro ao carregar perfil:', err)
            } finally {
                setLoading(false)
            }
        }
        loadProfile()
    }, [])

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Por favor, selecione uma imagem válida')
            return
        }

        // Validate file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
            setError('A imagem deve ter no máximo 2MB')
            return
        }

        setUploading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Não autenticado')

            // Create unique filename
            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}-${Date.now()}.${fileExt}`
            const filePath = `avatars/${fileName}`

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true })

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            setFormData({ ...formData, avatar_url: publicUrl })
            setAvatarPreview(URL.createObjectURL(file))
        } catch (err: any) {
            setError(err.message || 'Erro ao fazer upload da imagem')
        } finally {
            setUploading(false)
        }
    }

    const handleRemoveAvatar = () => {
        setFormData({ ...formData, avatar_url: null })
        setAvatarPreview(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        setSuccess(false)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Não autenticado')

            // Check if profile exists
            const { data: existingProfile } = await supabase
                .from('user_profiles')
                .select('id')
                .eq('user_id', user.id)
                .single()

            if (existingProfile) {
                // Update existing profile
                const { error: updateError } = await supabase
                    .from('user_profiles')
                    .update({
                        display_name: formData.display_name,
                        welcome_message: formData.welcome_message,
                        avatar_url: formData.avatar_url,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', user.id)

                if (updateError) throw updateError
            } else {
                // Create new profile
                const { error: insertError } = await supabase
                    .from('user_profiles')
                    .insert({
                        user_id: user.id,
                        display_name: formData.display_name,
                        welcome_message: formData.welcome_message,
                        avatar_url: formData.avatar_url
                    })

                if (insertError) throw insertError
            }

            setSuccess(true)
            setTimeout(() => {
                router.push('/dashboard')
                router.refresh()
            }, 1500)
        } catch (err: any) {
            setError(err.message || 'Erro ao salvar perfil')
        } finally {
            setSaving(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Meu Perfil</h1>
                <p className="text-slate-500 dark:text-slate-400">Personalize sua experiência</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800">

                {error && (
                    <div className="bg-rose-500/10 text-rose-500 p-4 rounded-xl text-sm font-medium border border-rose-500/20">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-emerald-500/10 text-emerald-500 p-4 rounded-xl text-sm font-medium border border-emerald-500/20">
                        ✓ Perfil atualizado com sucesso! Redirecionando...
                    </div>
                )}

                {/* Avatar Upload */}
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-xl">
                            {avatarPreview ? (
                                <Image
                                    src={avatarPreview}
                                    alt="Avatar"
                                    width={128}
                                    height={128}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <User className="w-16 h-16" />
                                </div>
                            )}
                        </div>
                        {avatarPreview && (
                            <button
                                type="button"
                                onClick={handleRemoveAvatar}
                                className="absolute -top-2 -right-2 p-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors shadow-lg cursor-pointer"
                                aria-label="Remover avatar"
                                title="Remover Foto de Perfil"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <label className="cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                            disabled={uploading}
                        />
                        <div className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                            {uploading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Camera className="w-5 h-5" />
                                    Alterar Foto
                                </>
                            )}
                        </div>
                    </label>
                    <p className="text-xs text-slate-500">JPG, PNG ou WEBP. Máximo 2MB.</p>
                </div>

                {/* Display Name */}
                <div>
                    <label htmlFor="display_name" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">
                        Nome de Exibição
                    </label>
                    <div className="relative">
                        <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                        <input
                            id="display_name"
                            name="display_name"
                            type="text"
                            placeholder="Como gostaria de ser chamado?"
                            className="w-full pl-12 pr-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-0 rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
                            value={formData.display_name || ''}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Welcome Message */}
                <div>
                    <label htmlFor="welcome_message" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">
                        Mensagem de Boas-Vindas
                    </label>
                    <div className="relative">
                        <MessageSquare className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                        <textarea
                            id="welcome_message"
                            name="welcome_message"
                            rows={3}
                            placeholder="Mensagem que aparecerá no Dashboard"
                            className="w-full pl-12 pr-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-0 rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400 resize-none"
                            value={formData.welcome_message || ''}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="pt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-6 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-3.5 bg-brand-500 text-slate-950 rounded-2xl font-bold hover:bg-brand-400 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-lg shadow-brand-500/20 cursor-pointer"
                    >
                        {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                        Salvar Perfil
                    </button>
                </div>
            </form>
        </div>
    )
}
