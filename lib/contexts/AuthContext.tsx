'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { logger } from '../utils/logger'
import type { Session, User } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  email: string
  username?: string
  avatar_url?: string
  points: number
  accuracy_score: number
  prediction_streak: number
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: UserProfile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting session:', error)
      } else {
        setSession(session)
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        }
      }
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Only log meaningful auth events (not initial session check)
        if (event !== 'INITIAL_SESSION') {
          logger.debug('Auth state changed:', event, session?.user?.email || 'no user')
        }
        setSession(session)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error && error.code === 'PGRST116') {
        // User profile doesn't exist, create it
        console.log('User profile not found, creating one...')
        
        // Get email from auth user
        const { data: authUser } = await supabase.auth.getUser()
        if (authUser.user) {
          const { error: createError } = await supabase
            .from('users')
            .insert({
              id: userId,
              email: authUser.user.email || '',
              username: authUser.user.user_metadata?.username || authUser.user.email?.split('@')[0] || 'User',
              points: 0,
              accuracy_score: 0,
              prediction_streak: 0
            })
          
          if (!createError) {
            // Fetch the newly created profile
            const { data: newProfile } = await supabase
              .from('users')
              .select('*')
              .eq('id', userId)
              .single()
            
            setUser(newProfile)
            return
          }
        }
      }
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error)
        return
      }
      
      setUser(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const signUp = async (email: string, password: string, username: string) => {
    try {
      console.log('Signing up user:', email, username)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      })
      
      if (error) {
        console.error('Auth signup error:', error)
        return { error }
      }
      
      console.log('Auth signup successful, user:', data.user?.id)
      
      // Create user profile if signup successful
      if (data.user && !error) {
        console.log('Creating user profile...')
        
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email,
            username,
            points: 0,
            accuracy_score: 0,
            prediction_streak: 0
          })
        
        if (profileError) {
          console.error('Error creating profile:', profileError)
          // Don't fail the signup, but log the error
        } else {
          console.log('User profile created successfully')
        }
      }
      
      return { error: null }
    } catch (error) {
      console.error('Signup catch error:', error)
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
      setSession(null)
    }
    return { error }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'No user logged in' }
    
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
    
    if (!error) {
      setUser({ ...user, ...updates })
    }
    
    return { error }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}