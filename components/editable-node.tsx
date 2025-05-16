import { useState, useCallback } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Input } from "@/components/ui/input"
import { Edit, Check, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EditableNode({ data, id, isConnectable }: NodeProps) {
  const [isEditing, setIsEditing] = useState(data.isEditing || false)
  const [label, setLabel] = useState(data.label || '')
  const [content, setContent] = useState(data.content || '')
  
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
      className={`px-4 py-3 rounded-md shadow-md border ${isRoot ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}
      style={{ minWidth: 150, maxWidth: 250 }}
      onDoubleClick={handleDoubleClick}
    >
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      
      {isEditing ? (
        <div className="flex flex-col gap-2">
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="text-sm font-medium"
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
              className="text-xs border rounded-md p-2 min-h-[60px] resize-none"
              placeholder="Node content (optional)"
            />
          )}
          <div className="flex justify-end">
            <Check 
              className="h-4 w-4 cursor-pointer text-green-600" 
              onClick={handleBlur}
            />
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className={`font-medium ${isRoot ? 'text-blue-800' : ''}`}>{label}</div>
            <div className="flex items-center gap-1">
              <Edit 
                className="h-4 w-4 cursor-pointer text-gray-400 hover:text-gray-600" 
                onClick={() => setIsEditing(true)}
              />
              {!isRoot && (
                <Trash2 
                  className="h-4 w-4 cursor-pointer text-gray-400 hover:text-red-500" 
                  onClick={() => data.onDelete && data.onDelete(id)}
                />
              )}
              <Plus 
                className="h-4 w-4 cursor-pointer text-gray-400 hover:text-blue-500" 
                onClick={() => data.onAddChild && data.onAddChild(id)}
              />
            </div>
          </div>
          {content && <div className="text-xs text-gray-600 mt-1 border-t pt-1">{content}</div>}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  )
}
