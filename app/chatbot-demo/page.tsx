"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ChatbotProvider } from '@/components/chatbot'
import ClientChatbot from '@/components/chatbot/ClientChatbot'
import { ChatbotConfig } from '@/types/chatbot'
import { MessageCircle, Settings, Palette, MapPin, Bot, Zap, FileText, Search, Upload, Brain, CheckSquare, Wifi, WifiOff, Users, Lock } from 'lucide-react'

export default function ChatbotDemo() {
  const [config, setConfig] = useState<ChatbotConfig>({
    position: 'bottom-right',
    theme: 'light',
    width: 400,
    height: 600,
    minimized: false,
    showQuickActions: true,
    enableVoiceInput: false,
    enableFileUpload: true,
    confidenceThreshold: 0.5,
    autoGreeting: true,
    greetingMessage: "Hello! I'm your medical assistant. How can I help you today?",
    persistSession: true,
    maxMessages: 100
  })

  const [userId, setUserId] = useState('demo_user_123')
  const [userAuthenticated, setUserAuthenticated] = useState(false)
  const [sessionInfo, setSessionInfo] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('disconnected')

  const handleConfigChange = (key: keyof ChatbotConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const exampleIntents = [
    {
      title: "Register Complaint",
      icon: FileText,
      description: "Submit a new medical complaint",
      examples: [
        "I want to file a complaint about my treatment",
        "Register a complaint about medication side effects",
        "Submit complaint about doctor behavior"
      ],
      intent_type: "complaint_register"
    },
    {
      title: "Check Status",
      icon: Search,
      description: "Check the status of existing complaints",
      examples: [
        "What's the status of complaint COMP2024001?",
        "Check my complaint status",
        "Is my complaint resolved?"
      ],
      intent_type: "complaint_status"
    },
    {
      title: "Upload Document",
      icon: Upload,
      description: "Upload medical documents or files",
      examples: [
        "I need to upload a medical report",
        "Upload prescription document",
        "Attach lab results"
      ],
      intent_type: "document_upload"
    },
    {
      title: "Generate Content",
      icon: Brain,
      description: "Generate policies, procedures, or content",
      examples: [
        "Generate a patient privacy policy",
        "Create infection control procedure",
        "Draft medication safety guidelines"
      ],
      intent_type: "content_generate"
    },
    {
      title: "Audit Questions",
      icon: CheckSquare,
      description: "Generate audit questions for compliance",
      examples: [
        "Generate audit questions for patient safety",
        "Create compliance checklist",
        "Audit questions for medication management"
      ],
      intent_type: "audit_questions"
    }
  ]

  const mockApiStatus = [
    { endpoint: "POST /api/chatbot/message/", status: "disconnected", description: "Main chatbot interaction" },
    { endpoint: "POST /api/chatbot/intent-detect/", status: "disconnected", description: "Intent detection" },
    { endpoint: "POST /api/chatbot/handle-intent/", status: "disconnected", description: "Intent handling" },
    { endpoint: "GET /api/chatbot/quick-actions/", status: "disconnected", description: "Quick actions" },
    { endpoint: "GET /api/chatbot/health/", status: "disconnected", description: "Health check" },
    { endpoint: "GET /api/chatbot/conversations/", status: "disconnected", description: "Conversation management" }
  ]

  return (
    <ChatbotProvider config={config}>
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Bot className="h-8 w-8 text-blue-600" />
            Production-Ready Medical Chatbot
          </h1>
          <p className="text-gray-600">
            Complete React frontend for modular, intent-based chatbot system with Django backend integration.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5" />
                  Configuration
                </CardTitle>
                <CardDescription>
                  Customize chatbot behavior and appearance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Position Setting */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Position
                  </Label>
                  <Select
                    value={config.position}
                    onValueChange={(value: any) => handleConfigChange('position', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="top-left">Top Left</SelectItem>
                      <SelectItem value="fullscreen">Fullscreen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Theme Setting */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Theme
                  </Label>
                  <Select
                    value={config.theme}
                    onValueChange={(value: any) => handleConfigChange('theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Dimensions */}
                {config.position !== 'fullscreen' && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Width (px)</Label>
                      <Input
                        type="number"
                        value={config.width}
                        onChange={(e) => handleConfigChange('width', parseInt(e.target.value))}
                        min="300"
                        max="800"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Height (px)</Label>
                      <Input
                        type="number"
                        value={config.height}
                        onChange={(e) => handleConfigChange('height', parseInt(e.target.value))}
                        min="400"
                        max="900"
                      />
                    </div>
                  </>
                )}

                {/* Feature Toggles */}
                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Show Quick Actions</Label>
                    <Switch
                      checked={config.showQuickActions}
                      onCheckedChange={(checked) => handleConfigChange('showQuickActions', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Auto Greeting</Label>
                    <Switch
                      checked={config.autoGreeting}
                      onCheckedChange={(checked) => handleConfigChange('autoGreeting', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Voice Input</Label>
                    <Switch
                      checked={config.enableVoiceInput}
                      onCheckedChange={(checked) => handleConfigChange('enableVoiceInput', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">File Upload</Label>
                    <Switch
                      checked={config.enableFileUpload}
                      onCheckedChange={(checked) => handleConfigChange('enableFileUpload', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Persist Session</Label>
                    <Switch
                      checked={config.persistSession}
                      onCheckedChange={(checked) => handleConfigChange('persistSession', checked)}
                    />
                  </div>
                </div>

                {/* User Settings */}
                <div className="space-y-3 pt-2 border-t">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">User ID</Label>
                    <Input
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="Enter user ID"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      User Authenticated
                    </Label>
                    <Switch
                      checked={userAuthenticated}
                      onCheckedChange={setUserAuthenticated}
                    />
                  </div>
                </div>

                {/* Current Settings Display */}
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Current Settings:</h4>
                  <div className="space-y-1">
                    <Badge variant="outline" className="text-xs">
                      {config.position} • {config.theme}
                    </Badge>
                    {config.position !== 'fullscreen' && (
                      <Badge variant="outline" className="text-xs">
                        {config.width}×{config.height}px
                      </Badge>
                    )}
                    {sessionInfo && (
                      <Badge variant="secondary" className="text-xs">
                        Session: {sessionInfo.slice(-8)}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Status */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Backend API Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockApiStatus.map((api, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-mono truncate">{api.endpoint}</div>
                        <div className="text-xs text-gray-500">{api.description}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        {api.status === 'connected' ? (
                          <Wifi className="h-3 w-3 text-green-500" />
                        ) : (
                          <WifiOff className="h-3 w-3 text-red-500" />
                        )}
                        <Badge
                          variant={api.status === 'connected' ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {api.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-gray-500 mt-2">
                    Connect your Django backend to enable full functionality.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Demo Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Production-Ready Chatbot Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">🎯 Core Features</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Full-screen and floating modes</li>
                      <li>• Session persistence with localStorage</li>
                      <li>• Real-time typing indicators</li>
                      <li>• Message status tracking</li>
                      <li>• Error handling with retry</li>
                      <li>• Dark/light theme support</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">🚀 Advanced Features</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Dynamic form generation</li>
                      <li>• File upload support</li>
                      <li>• Voice input capability</li>
                      <li>• Conversation export</li>
                      <li>• Authentication-aware actions</li>
                      <li>• Mobile-responsive design</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Example Intents */}
            <Card>
              <CardHeader>
                <CardTitle>Supported Intents & Examples</CardTitle>
                <CardDescription>
                  Try these example messages to see how the chatbot handles different intents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {exampleIntents.map((intent, index) => {
                    const Icon = intent.icon;
                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="h-5 w-5 text-blue-600" />
                          <h4 className="font-medium">{intent.title}</h4>
                          {intent.intent_type.includes('generate') && (
                            <Lock className="h-4 w-4 text-gray-400" title="Requires authentication" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{intent.description}</p>
                        <div className="space-y-2">
                          {intent.examples.map((example, exIndex) => (
                            <div key={exIndex} className="text-sm bg-gray-50 p-2 rounded border-l-2 border-blue-200">
                              "{example}"
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Integration Code */}
            <Card>
              <CardHeader>
                <CardTitle>Integration Code</CardTitle>
                <CardDescription>
                  Copy this code to add the chatbot to your application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                  <pre>{`import { Chatbot, ChatbotProvider } from '@/components/chatbot'

function App() {
  return (
    <ChatbotProvider config={{ persistSession: true }}>
      <div>
        {/* Your app content */}
        <Chatbot
          config={{
            position: "${config.position}",
            theme: "${config.theme}",
            width: ${config.width},
            height: ${config.height},
            showQuickActions: ${config.showQuickActions},
            autoGreeting: ${config.autoGreeting},
            enableVoiceInput: ${config.enableVoiceInput},
            enableFileUpload: ${config.enableFileUpload},
            confidenceThreshold: ${config.confidenceThreshold}
          }}
          userId="${userId}"
          userAuthenticated={${userAuthenticated}}
          onSessionStart={(sessionId) => console.log('Session:', sessionId)}
          onError={(error) => console.error('Chatbot error:', error)}
        />
      </div>
    </ChatbotProvider>
  )
}`}</pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Chatbot Component */}
        <ClientChatbot
          config={config}
          userId={userId}
          userAuthenticated={userAuthenticated}
          onSessionStart={(sessionId) => setSessionInfo(sessionId)}
          onSessionEnd={() => setSessionInfo(null)}
          onError={(error) => console.error('Chatbot error:', error)}
        />
      </div>
    </ChatbotProvider>
  )
}
