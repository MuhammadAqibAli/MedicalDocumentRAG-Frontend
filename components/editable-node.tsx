import { useState, useCallback } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Input } from "@/components/ui/input"
import { Edit, Check, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

// Define color themes for different node categories
const nodeColors = {
  root: { bg: '#3949ab', border: '#283593', text: '#ffffff' },
  category: [
    { bg: '#795548', border: '#5d4037', text: '#ffffff' }, // Brown
    { bg: '#2196f3', border: '#1976d2', text: '#ffffff' }, // Blue
    { bg: '#ff9800', border: '#f57c00', text: '#000000' }, // Orange
    { bg: '#4caf50', border: '#388e3c', text: '#ffffff' }, // Green
    { bg: '#9c27b0', border: '#7b1fa2', text: '#ffffff' }, // Purple
    { bg: '#00bcd4', border: '#0097a7', text: '#ffffff' }, // Cyan
    { bg: '#f44336', border: '#d32f2f', text: '#ffffff' }, // Red
    { bg: '#ffc107', border: '#ffa000', text: '#000000' }  // Yellow
  ]
}

export default function EditableNode({ data, id, isConnectable }: NodeProps) {
  const [isEditing, setIsEditing] = useState(data.isEditing || false)
  const [label, setLabel] = useState(data.label || '')
  const [content, setContent] = useState(data.content || '')
  
  // Get node color from data or default
  const nodeColor = data.color || nodeColors.root
  
  const handleDoubleClick = useCallback(() => {
    setIsEditing(true)
  }, [])
  
  const handleBlur = useCallback(() => {
    setIsEditing(false)
    data.label = label
    data.content = content
  }, [data, label, content])
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      setIsEditing(false)
      data.label = label
      data.content = content
    }
  }, [data, label, content])

  // Check if this is the root node
  const isRoot = id === 'root'
  
  return (
    <div 
      className="rounded-md shadow-md border"
      style={{ 
        minWidth: 180, 
        maxWidth: 280,
        backgroundColor: nodeColor.bg,
        borderColor: nodeColor.border,
        color: nodeColor.text,
        padding: '10px',
        transition: 'all 0.2s ease'
      }}
      onDoubleClick={handleDoubleClick}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        isConnectable={isConnectable}
        style={{ background: nodeColor.border }}
      />
      
      {isEditing ? (
        <div className="flex flex-col gap-2">
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="text-sm font-medium bg-white text-black"
            placeholder="Node title"
          />
          {!isRoot && (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleBlur()
                }
              }}
              className="text-xs border rounded-md p-2 min-h-[60px] resize-none bg-white text-black"
              placeholder="Node content (optional)"
            />
          )}
          <div className="flex justify-end">
            <Check 
              className="h-5 w-5 cursor-pointer bg-white text-green-600 rounded-full p-1" 
              onClick={handleBlur}
            />
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="font-medium text-sm">{label}</div>
            <div className="flex items-center gap-1">
              <Edit 
                className="h-4 w-4 cursor-pointer hover:opacity-80" 
                onClick={() => setIsEditing(true)}
              />
              {!isRoot && (
                <Trash2 
                  className="h-4 w-4 cursor-pointer hover:opacity-80" 
                  onClick={() => data.onDelete && data.onDelete(id)}
                />
              )}
              <Plus 
                className="h-4 w-4 cursor-pointer hover:opacity-80" 
                onClick={() => data.onAddChild && data.onAddChild(id)}
              />
            </div>
          </div>
          {content && (
            <div 
              className="text-xs mt-1 pt-1 opacity-90"
              style={{ 
                borderTop: `1px solid ${nodeColor.text === '#ffffff' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)'}` 
              }}
            >
              {content}
            </div>
          )}
        </div>
      )}
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        isConnectable={isConnectable}
        style={{ background: nodeColor.border }}
      />
    </div>
  )
}


