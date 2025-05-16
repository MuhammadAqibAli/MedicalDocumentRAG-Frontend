import { useState, useCallback } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Input } from "@/components/ui/input"
import { Edit, Check } from "lucide-react"

export default function EditableNode({ data, id }: NodeProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(data.label || '')
  
  const handleDoubleClick = useCallback(() => {
    setIsEditing(true)
  }, [])
  
  const handleBlur = useCallback(() => {
    setIsEditing(false)
    data.label = label
  }, [data, label])
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false)
      data.label = label
    }
  }, [data, label])

  return (
    <div 
      className={`px-4 py-2 shadow-md rounded-md border ${
        id === 'root' ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200'
      }`}
      style={{ minWidth: '150px' }}
      onDoubleClick={handleDoubleClick}
    >
      <Handle type="target" position={Position.Top} />
      
      {isEditing ? (
        <div className="flex items-center">
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="min-w-[120px]"
          />
          <Check 
            className="h-4 w-4 ml-2 cursor-pointer text-green-600" 
            onClick={handleBlur}
          />
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="font-medium">{label}</div>
          <Edit 
            className="h-4 w-4 ml-2 cursor-pointer text-gray-400 hover:text-gray-600" 
            onClick={() => setIsEditing(true)}
          />
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}