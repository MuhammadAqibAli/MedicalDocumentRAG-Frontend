"use client"

import { useCallback, useEffect, useState } from "react"
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
    const { nodes: parsedNodes, edges: parsedEdges } = parseHtmlToMindMap(standard.content, standard.standard_title)
    
    // Add callbacks to nodes
    setNodes(parsedNodes.map(node => ({
      ...node,
      type: 'editableNode',
      data: {
        ...node.data,
        onDelete: deleteNode,
        onAddChild: addChildNode
      }
    })))
    
    // Style edges based on source node color
    setEdges(parsedEdges.map(edge => {
      const sourceNode = parsedNodes.find(n => n.id === edge.source)
      const edgeColor = sourceNode?.data?.color?.border || '#f8bb4c'
      
      return {
        ...edge,
        style: { stroke: edgeColor, strokeWidth: 2 },
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edgeColor
        }
      }
    }))
  }, [standard.content, standard.standard_title, setNodes, setEdges])
  
  // Handle connections between nodes
  const onConnect = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find(n => n.id === connection.source)
      const edgeColor = sourceNode?.data?.color?.border || '#f8bb4c'
      
      setEdges((eds) => addEdge({
        ...connection,
        type: 'smoothstep',
        animated: true,
        style: { stroke: edgeColor, strokeWidth: 2 },
        markerEnd: { 
          type: MarkerType.ArrowClosed,
          color: edgeColor
        }
      }, eds))
    },
    [nodes, setEdges]
  )
  
  // Handle saving the mind map
  const handleSave = () => {
    const updatedContent = convertMindMapToHtml(nodes, edges)
    onSave(updatedContent, title)
  }

  // Delete a node and its connected edges
  const deleteNode = useCallback((nodeId: string) => {
    // Find all connected edges
    const edgesToRemove = edges.filter(
      edge => edge.source === nodeId || edge.target === nodeId
    )
    
    // Find all child nodes (recursively)
    const getChildNodeIds = (parentId: string): string[] => {
      const childEdges = edges.filter(edge => edge.source === parentId)
      const childIds = childEdges.map(edge => edge.target)
      
      return [
        ...childIds,
        ...childIds.flatMap(id => getChildNodeIds(id))
      ]
    }
    
    const childNodeIds = getChildNodeIds(nodeId)
    
    // Remove the node, its children, and all connected edges
    setNodes(nodes => nodes.filter(node => 
      node.id !== nodeId && !childNodeIds.includes(node.id)
    ))
    
    setEdges(edges => edges.filter(edge => 
      edge.source !== nodeId && 
      edge.target !== nodeId && 
      !childNodeIds.includes(edge.source) && 
      !childNodeIds.includes(edge.target)
    ))
  }, [nodes, edges, setNodes, setEdges])

  // Add a child node to a specific parent
  const addChildNode = useCallback((parentId: string) => {
    const newNodeId = `node-${Date.now()}`
    const parentNode = nodes.find(n => n.id === parentId)
    
    if (!parentNode) return
    
    // Calculate position based on parent
    const position = {
      x: parentNode.position.x,
      y: parentNode.position.y + 120
    }
    
    // Adjust position if there are other children
    const existingChildren = edges.filter(e => e.source === parentId)
    if (existingChildren.length > 0) {
      position.x += (existingChildren.length * 60)
    }
    
    // Use the same color as the parent
    const nodeColor = parentNode.data.color
    
    setNodes(nds => [
      ...nds,
      {
        id: newNodeId,
        type: 'editableNode',
        data: { 
          label: 'New Node', 
          content: '',
          isEditing: true,
          onDelete: deleteNode,
          onAddChild: addChildNode,
          color: nodeColor
        },
        position
      }
    ])
    
    const edgeColor = nodeColor?.border || '#f8bb4c'
    
    setEdges(eds => [
      ...eds,
      {
        id: `edge-${parentId}-${newNodeId}`,
        source: parentId,
        target: newNodeId,
        type: 'smoothstep',
        animated: true,
        style: { stroke: edgeColor, strokeWidth: 2 },
        markerEnd: { 
          type: MarkerType.ArrowClosed,
          color: edgeColor
        }
      }
    ])
  }, [nodes, edges, setNodes, setEdges])

  // Add a new node (to root by default)
  const addNode = useCallback(() => {
    const newNodeId = `node-${Date.now()}`
    const parentId = nodes.find(n => n.id === 'root')?.id || 'root'
    
    setNodes(nds => [
      ...nds,
      {
        id: newNodeId,
        type: 'editableNode',
        data: { 
          label: 'New Node', 
          content: '',
          isEditing: true,
          onDelete: deleteNode,
          onAddChild: addChildNode
        },
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
        markerEnd: { type: 'arrowclosed' }
      }
    ])
  }, [nodes, setNodes, setEdges, deleteNode, addChildNode])
  
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
          style={{ 
            height: '100%',
            background: '#1e1e2f' // Dark background like in the image
          }}
        >
          <Controls className="bg-white bg-opacity-80" />
          <Background 
            gap={16} 
            size={1} 
            color="#ffffff" 
            style={{ opacity: 0.05 }}
          />
          <Panel position="top-right" className="flex gap-2">
            <Button size="sm" variant="outline" className="bg-white bg-opacity-90" onClick={addNode}>
              <Plus className="h-4 w-4 mr-1" />
              Add Node
            </Button>
            <Button size="sm" variant="outline" className="bg-white bg-opacity-90" onClick={() => {
              // Reset to original layout
              const { nodes: parsedNodes, edges: parsedEdges } = parseHtmlToMindMap(standard.content, standard.standard_title)
              setNodes(parsedNodes.map(node => ({
                ...node,
                type: 'editableNode',
                data: {
                  ...node.data,
                  onDelete: deleteNode,
                  onAddChild: addChildNode
                }
              })))
              setEdges(parsedEdges.map(edge => ({
                ...edge,
                style: { stroke: '#f8bb4c', strokeWidth: 2 },
                animated: true
              })))
            }}>
              Reset Layout
            </Button>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  )
}







