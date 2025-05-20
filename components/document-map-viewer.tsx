"use client"

import { useCallback, useEffect, useState } from "react"
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel
} from "reactflow"
import "reactflow/dist/style.css"
import { Button } from "@/components/ui/button"
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react"
import { SavedStandard, StandardType } from "@/context/medical-assistant-context"
import EditableNode from "@/components/editable-node"

// Define node types
const nodeTypes = {
  editableNode: EditableNode
}

interface DocumentMapViewerProps {
  standards: SavedStandard[]
  standardTypes: StandardType[]
  onStandardClick?: (standard: SavedStandard) => void
  showNodeControls?: boolean // New prop
}

export default function DocumentMapViewer({ 
  standards, 
  standardTypes,
  onStandardClick,
  showNodeControls = true // Default to true for backward compatibility
}: DocumentMapViewerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)

  // Create mind map from standards
  useEffect(() => {
    if (!standards.length) return

    const newNodes: Node[] = []
    const newEdges: Edge[] = []
    
    // Define node colors with lighter variants for child nodes
    const rootColor = { bg: '#3949ab', border: '#283593', text: '#ffffff' }
    const categoryColors = [
      { bg: '#795548', border: '#5d4037', text: '#ffffff', childBg: '#8d6e63' }, // Brown
      { bg: '#2196f3', border: '#1976d2', text: '#ffffff', childBg: '#64b5f6' }, // Blue
      { bg: '#ff9800', border: '#f57c00', text: '#000000', childBg: '#ffb74d' }, // Orange
      { bg: '#4caf50', border: '#388e3c', text: '#ffffff', childBg: '#81c784' }, // Green
      { bg: '#9c27b0', border: '#7b1fa2', text: '#ffffff', childBg: '#ba68c8' }, // Purple
      { bg: '#00bcd4', border: '#0097a7', text: '#ffffff', childBg: '#4dd0e1' }, // Cyan
      { bg: '#f44336', border: '#d32f2f', text: '#ffffff', childBg: '#e57373' }, // Red
      { bg: '#ffc107', border: '#ffa000', text: '#000000', childBg: '#ffd54f' }  // Yellow
    ]
    
    // Create root node
    const rootId = "root"
    newNodes.push({
      id: rootId,
      type: 'editableNode',
      data: { 
        label: "Document Map",
        color: rootColor,
        isRoot: true,
        showControls: showNodeControls
      },
      position: { x: 400, y: 0 }
    })
    
    // Group standards by type
    const standardsByType = standards.reduce((acc, standard) => {
      const typeName = standard.standard_type_name
      if (!acc[typeName]) {
        acc[typeName] = []
      }
      acc[typeName].push(standard)
      return acc
    }, {} as Record<string, SavedStandard[]>)
    
    // Create category nodes for each standard type
    const typeNames = Object.keys(standardsByType)
    typeNames.forEach((typeName, index) => {
      const nodeId = `type-${index}`
      const categoryColor = categoryColors[index % categoryColors.length]
      
      // Find the standardType object for this type name
      const standardType = standardTypes.find(type => type.name === typeName)
      
      // Calculate positions in a radial layout
      const angle = (2 * Math.PI * index) / typeNames.length
      const radius = 250
      const xPos = 400 + radius * Math.cos(angle)
      const yPos = 150 + radius * Math.sin(angle)
      
      newNodes.push({
        id: nodeId,
        type: 'editableNode',
        data: { 
          label: typeName,
          color: categoryColor,
          isCategory: true,
          standardType: standardType, // Store the standardType object
          onClick: () => {
            // When clicking a category node, activate the corresponding tab
            if (onStandardClick && standardType) {
              // Create a dummy standard with just the type info for the handler
              const dummyStandard: SavedStandard = {
                id: '',
                standard_title: '',
                content: '',
                standard_type: standardType.id,
                standard_type_name: standardType.name,
                created_at: '',
                updated_at: '',
                version: '0',
                generated_content: null,
                llm_model_used: null,
                is_ai_generated: false
              }
              onStandardClick(dummyStandard)
            }
          },
          showControls: showNodeControls
        },
        position: { x: xPos, y: yPos }
      })
      
      // Connect root to category
      newEdges.push({
        id: `edge-${rootId}-${nodeId}`,
        source: rootId,
        target: nodeId,
        type: 'smoothstep',
        style: { stroke: rootColor.border, strokeWidth: 2 },
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: rootColor.border
        }
      })
      
      // Create nodes for each standard in this type
      const standards = standardsByType[typeName]
      standards.forEach((standard, stdIndex) => {
        const standardNodeId = `standard-${standard.id}`
        
        // Calculate positions in a radial layout around the category
        const stdAngle = (2 * Math.PI * stdIndex) / standards.length
        const stdRadius = 150
        const stdXPos = xPos + stdRadius * Math.cos(stdAngle)
        const stdYPos = yPos + stdRadius * Math.sin(stdAngle)
        
        // Use lighter color variant for child nodes
        const childColor = {
          bg: categoryColor.childBg || categoryColor.bg,
          border: categoryColor.border,
          text: categoryColor.text
        }
        
        newNodes.push({
          id: standardNodeId,
          type: 'editableNode',
          data: { 
            label: standard.standard_title,
            color: childColor,
            standard: standard,
            onClick: () => onStandardClick && onStandardClick(standard),
            showControls: showNodeControls
          },
          position: { x: stdXPos, y: stdYPos }
        })
        
        // Connect category to standard
        newEdges.push({
          id: `edge-${nodeId}-${standardNodeId}`,
          source: nodeId,
          target: standardNodeId,
          type: 'smoothstep',
          style: { stroke: categoryColor.border, strokeWidth: 2 },
          animated: true,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: categoryColor.border
          }
        })
      })
    })
    
    setNodes(newNodes)
    setEdges(newEdges)
  }, [standards, standardTypes, setNodes, setEdges, onStandardClick, showNodeControls])

  // Reset to original layout
  const resetLayout = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2 })
    }
  }, [reactFlowInstance])

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        onInit={setReactFlowInstance}
      >
        <Controls className="bg-white bg-opacity-80" />
        <Background 
          gap={16} 
          size={1} 
          color="#ffffff" 
          style={{ opacity: 0.05 }}
        />
        <Panel position="top-right" className="flex gap-2">
          <Button size="sm" variant="outline" className="bg-white bg-opacity-90" onClick={resetLayout}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset View
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-white bg-opacity-90" 
            onClick={() => reactFlowInstance?.zoomIn()}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-white bg-opacity-90" 
            onClick={() => reactFlowInstance?.zoomOut()}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  )
}

