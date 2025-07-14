'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, ArrowRight, ExternalLink, Key } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ProjectSetupProps {
  onNext: (data: {
    projectUrl: string
    anonKey: string
    serviceKey: string
  }) => void
  initialData?: {
    projectUrl: string
    anonKey: string
    serviceKey: string
  }
}

export function ProjectSetup({ onNext, initialData }: ProjectSetupProps) {
  const [projectRef, setProjectRef] = useState('')
  const [anonKey, setAnonKey] = useState(initialData?.anonKey || '')
  const [serviceKey, setServiceKey] = useState(initialData?.serviceKey || '')
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState('')
  const [showKeyFields, setShowKeyFields] = useState(false)

  // Extract project ref from initial URL if provided
  useState(() => {
    if (initialData?.projectUrl) {
      const match = initialData.projectUrl.match(
        /https:\/\/([^.]+)\.supabase\.co/
      )
      if (match) {
        setProjectRef(match[1])
        setShowKeyFields(true)
      }
    }
  })

  // Show key fields when project ref is entered
  useEffect(() => {
    if (projectRef && projectRef.match(/^[a-zA-Z0-9-]+$/)) {
      setShowKeyFields(true)
    } else if (!projectRef) {
      setShowKeyFields(false)
    }
  }, [projectRef])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsValidating(true)

    try {
      // Validate project ref format
      if (!projectRef.match(/^[a-zA-Z0-9-]+$/)) {
        throw new Error('Invalid project reference format')
      }

      const validProjectUrl = `https://${projectRef}.supabase.co`

      // Test the connection
      const response = await fetch(`${validProjectUrl}/rest/v1/`, {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
      })

      if (!response.ok) {
        throw new Error('Invalid project reference or API keys')
      }

      onNext({ projectUrl: validProjectUrl, anonKey, serviceKey })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to validate credentials'
      )
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Connect Your Supabase Project
        </h2>
        <p className="mt-2 text-gray-600">
          Enter your Supabase project details to get started
        </p>
      </div>

      <div className="space-y-4">
        {/* Project ID Field */}
        <div>
          <Label htmlFor="projectRef">Project ID</Label>
          <Input
            id="projectRef"
            type="text"
            placeholder="your-project-ref"
            value={projectRef}
            onChange={(e) => setProjectRef(e.target.value.toLowerCase())}
            required
            className="mt-1"
          />
          <p className="mt-1 text-sm text-gray-500">
            Found in your Supabase Dashboard → Project Settings → General
          </p>
        </div>

        {/* Animated Key Fields */}
        <AnimatePresence>
          {showKeyFields && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="space-y-4"
            >
              {/* API Keys Callout Card */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="flex items-start gap-3 p-4">
                  <Key className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">
                      Need your API keys?
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      {projectRef ? (
                        <>
                          Find them in your{' '}
                          <a
                            href={`https://supabase.com/dashboard/project/${projectRef}/settings/api-keys/new`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline font-medium hover:text-blue-900"
                          >
                            Supabase Dashboard
                          </a>
                        </>
                      ) : (
                        'Enter your project ID to get a direct link to your API keys'
                      )}
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-blue-600" />
                </CardContent>
              </Card>
              {/* Anon Key Field */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Label htmlFor="anonKey">Anon (Public) Key</Label>
                <Input
                  id="anonKey"
                  type="text"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  required
                  className="mt-1"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Safe to store - this is your public API key
                </p>
              </motion.div>

              {/* Service Key Field */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Label htmlFor="serviceKey">Service Role Key</Label>
                <Input
                  id="serviceKey"
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={serviceKey}
                  onChange={(e) => setServiceKey(e.target.value)}
                  required
                  className="mt-1"
                />
                <div className="mt-1 space-y-1">
                  <p className="text-sm text-amber-600 font-medium">
                    ⚠️ This key will NOT be stored anywhere
                  </p>
                  <p className="text-sm text-gray-500">
                    Used only for this session to discover your tables
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={
          !projectRef ||
          !showKeyFields ||
          !anonKey ||
          !serviceKey ||
          isValidating
        }
        className="w-full"
      >
        {isValidating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Validating...
          </>
        ) : (
          <>
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  )
}
