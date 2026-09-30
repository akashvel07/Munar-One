import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Munnar Trip:', error, errorInfo)
  }

  private handleReset = () => {
    localStorage.clear()
    sessionStorage.clear()
    window.location.href = '/'
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-forest-950 via-forest-900 to-forest-950 text-forest-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-forest-900/80 border border-forest-600/40 rounded-3xl p-6 text-center shadow-2xl backdrop-blur-xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-4 text-amber-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <h1 className="font-display text-2xl font-bold text-forest-100 mb-2">
              Trip App Encountered an Issue
            </h1>
            
            <p className="text-forest-400 text-sm mb-6 leading-relaxed">
              {this.state.error?.message || 'A runtime error occurred while loading the application.'}
            </p>

            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full py-3.5 px-4 rounded-xl bg-forest-600 hover:bg-forest-500 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-glow-green"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>

              <button
                onClick={this.handleReset}
                className="w-full py-3 px-4 rounded-xl bg-forest-800/80 hover:bg-forest-700/80 text-forest-300 font-medium flex items-center justify-center gap-2 border border-forest-700/50 transition-all text-sm"
              >
                <Home className="w-4 h-4" />
                Reset Cache & Return Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
