"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SimpleChatbot } from '@/components/SimpleChatbot'
import { SIMPLE_CHATBOT_CONFIG } from '@/lib/chatbot-config'
import { MessageCircle, Bot, Zap, FileText, Search, Upload, Brain, CheckSquare, Wifi, WifiOff } from 'lucide-react'

export default function ChatbotDemo() {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('disconnected')

  // Test connection to backend
  const testConnection = async () => {
    try {
      const response = await fetch(`${SIMPLE_CHATBOT_CONFIG.apiBaseUrl}${SIMPLE_CHATBOT_CONFIG.endpoints.health}`)
      setConnectionStatus(response.ok ? 'connected' : 'disconnected')
    } catch (error) {
      setConnectionStatus('disconnected')
    }
  }

  const supportedIntents = [
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
        "What's the status of complaint COMP-2024-001?",
        "Check my complaint status",
        "Is my complaint resolved?"
      ],
      intent_type: "complaint_status"
    },
    {
      title: "Submit Feedback",
      icon: MessageCircle,
      description: "Submit feedback about healthcare services",
      examples: [
        "I want to give feedback about my visit",
        "Submit feedback about excellent nursing care",
        "Provide feedback on hospital services"
      ],
      intent_type: "feedback_submit"
    }
  ]

  const apiEndpoints = [
    { endpoint: "POST /api/chatbot/message/", status: connectionStatus, description: "Main chatbot interaction" },
    { endpoint: "GET /api/chatbot/health/", status: connectionStatus, description: "Health check" },
    { endpoint: "GET /api/chatbot/conversations/", status: connectionStatus, description: "Conversation management" }
  ]

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Bot className="h-8 w-8 text-blue-600" />
          Simple Medical Assistant Chatbot
        </h1>
        <p className="text-gray-600">
          Simplified chatbot for medical complaints, status checking, and feedback submission.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* API Status */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Backend API Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button onClick={testConnection} className="w-full mb-3" size="sm">
                  Test Connection
                </Button>
                {apiEndpoints.map((api, index) => (
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
        <div className="lg:col-span-2 space-y-6">
          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Simple Chatbot Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">🎯 Core Features</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Floating chat widget</li>
                    <li>• Real-time messaging</li>
                    <li>• Typing indicators</li>
                    <li>• Button interactions</li>
                    <li>• Quick replies</li>
                    <li>• Error handling</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">🚀 Supported Actions</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Register complaints</li>
                    <li>• Check complaint status</li>
                    <li>• Submit feedback</li>
                    <li>• Redirect to forms</li>
                    <li>• Clear conversation</li>
                    <li>• Session management</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supported Intents */}
          <Card>
            <CardHeader>
              <CardTitle>Supported Intents & Examples</CardTitle>
              <CardDescription>
                Try these example messages to see how the chatbot handles different intents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {supportedIntents.map((intent, index) => {
                  const Icon = intent.icon;
                  return (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-5 w-5 text-blue-600" />
                        <h4 className="font-medium">{intent.title}</h4>
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
                Copy this code to add the simple chatbot to your application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                <pre>{`import { SimpleChatbot } from '@/components/SimpleChatbot'

function App() {
  return (
    <div>
      {/* Your app content */}

      {/* Simple Medical Assistant Chatbot */}
      <SimpleChatbot />
    </div>
  )
}`}</pre>
              </div>
            </CardContent>
          </Card>

          {/* Backend Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-600" />
                Backend Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">🔧 Django Backend Setup</h4>
                <p className="text-sm text-yellow-700 mb-2">
                  Make sure your Django backend is running on <code className="bg-yellow-100 px-1 rounded">http://localhost:8000</code>
                  with the following endpoints:
                </p>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• <code className="bg-yellow-100 px-1 rounded">POST /api/chatbot/message/</code></li>
                  <li>• <code className="bg-yellow-100 px-1 rounded">GET /api/chatbot/health/</code></li>
                  <li>• <code className="bg-yellow-100 px-1 rounded">GET /api/chatbot/conversations/</code></li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Simple Chatbot Component */}
      <SimpleChatbot />
    </div>
  )
}
