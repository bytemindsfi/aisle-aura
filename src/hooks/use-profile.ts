// src/hooks/useProfile.ts
import { useEffect, useState } from 'react'
import supabase from "@/lib/supabase.ts";

interface UserProfile {
    id: string
    first_name: string
    last_name: string
    email: string
    phone: string | null
    agree_to_terms: boolean
    created_at: string
    updated_at: string
}

export const useProfile = (userId: string | undefined) => {
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // If no userId, reset and return
        if (!userId) {
            setProfile(null)
            setLoading(false)
            return
        }

        // Define async function inside useEffect
        const fetchProfile = async () => {
            try {
                setLoading(true)
                setError(null)

                const { data, error: fetchError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', userId)
                    .single()

                if (fetchError) throw fetchError

                setProfile(data)
            } catch (e: any) {
                console.error('Error fetching profile:', e)
                setError(e.message)
                setProfile(null)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [userId]) // Refetch when userId changes

    // Function to manually refresh profile
    const refreshProfile = async () => {
        if (!userId) return

        try {
            setLoading(true)
            const { data, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single()

            if (fetchError) throw fetchError
            setProfile(data)
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    return { profile, loading, error, refreshProfile }
}