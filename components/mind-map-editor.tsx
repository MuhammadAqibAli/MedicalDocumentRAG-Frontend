"use client"

import { useState, useEffect, useCallback } from "react"
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  Panel,
  NodeChange,
  EdgeChange,
  NodeTypes
} from "reactflow"
import "reactflow/dist/style.css"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, X, Plus, Edit } from "lucide-react"
import { parseHtmlToMindMap, convertMindMapToHtml } from "@/lib/mind-map-utils"
import EditableNode from "@/components/editable-node"

// Define node types
const nodeTypes: NodeTypes = {
  editableNode: EditableNode
}

interface MindMapEditorProps {
  standard: {
    id: string
    standard_title: string
    content: string
  }
  onSave: (content: string, title: string) => void
  onCancel: () => void
}

export default function MindMapEditor({ standard, onSave, onCancel }: MindMapEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [title, setTitle] = useState(standard.standard_title)
  
  // Parse HTML content to mind map nodes and edges
  useEffect(() => {
    const { nodes: parsedNodes, edges: parsedEdges } = parseHtmlToMindMap(standard.content)
    setNodes(parsedNodes.map(node => ({
      ...node,
      type: 'editableNode'
    })))
    setEdges(parsedEdges)
  }, [standard.content, setNodes, setEdges])
  
  // Handle connections between nodes
  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge({
      ...connection,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed }
    }, eds)),
    [setEdges]
  )
  
  // Handle saving the mind map
  const handleSave = () => {
    const updatedContent = convertMindMapToHtml(nodes, edges)
    onSave(updatedContent, title)
  }

  // Add a new node
  const addNode = useCallback(() => {
    const newNodeId = `node-${nodes.length + 1}`
    const parentId = nodes.find(n => n.id === 'root')?.id || 'root'
    
    setNodes(nds => [
      ...nds,
      {
        id: newNodeId,
        type: 'editableNode',
        data: { label: 'New Node', isEditing: true },
        position: { x: 250, y: 100 + nodes.length * 80 }
      }
    ])
    
    setEdges(eds => [
      ...eds,
      {
        id: `edge-${parentId}-${newNodeId}`,
        source: parentId,
        target: newNodeId,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed }
      }
    ])
  }, [nodes, setNodes, setEdges])
  
  return (
    <div className="w-full h-full flex flex-col">
      {/* Top section - 10% height */}
      <div className="p-2 border-b flex justify-between items-center h-[10%] min-h-[60px]">
        <div className="flex items-center gap-2 flex-1">
          <label className="text-sm font-medium">Title:</label>
          <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="max-w-md"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
      
      {/* Editor section - 90% height */}
      <div className="flex-1 w-full h-[90%]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.5}
          maxZoom={1.5}
          fitViewOptions={{ padding: 0.2 }}
          style={{ height: '100%' }}
        >
          <Controls />
          <Background gap={16} size={1} />
          <Panel position="top-right" className="flex gap-2">
            <Button size="sm" variant="outline" onClick={addNode}>
              <Plus className="h-4 w-4 mr-1" />
              Add Node
            </Button>
            <Button size="sm" variant="outline" onClick={() => {
              // Reset to original layout
              const { nodes: parsedNodes, edges: parsedEdges } = parseHtmlToMindMap(standard.content)
              setNodes(parsedNodes.map(node => ({
                ...node,
                type: 'editableNode'
              })))
              setEdges(parsedEdges)
            }}>
              Reset Layout
            </Button>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  )
}




