import  { Node, Edge, MarkerType } from 'reactflow'


// Parse HTML content to mind map nodes and edges
export function parseHtmlToMindMap(htmlContent: string, documentTitle?: string): { nodes: Node[], edges: Edge[] } {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, "text/html")
  
  const nodes: Node[] = []
  const edges: Edge[] = []
  
  // Define node colors
  const rootColor = { bg: '#3949ab', border: '#283593', text: '#ffffff' }
  const categoryColors = [
    { bg: '#795548', border: '#5d4037', text: '#ffffff' }, // Brown
    { bg: '#2196f3', border: '#1976d2', text: '#ffffff' }, // Blue
    { bg: '#ff9800', border: '#f57c00', text: '#000000' }, // Orange
    { bg: '#4caf50', border: '#388e3c', text: '#ffffff' }, // Green
    { bg: '#9c27b0', border: '#7b1fa2', text: '#ffffff' }, // Purple
    { bg: '#00bcd4', border: '#0097a7', text: '#ffffff' }, // Cyan
    { bg: '#f44336', border: '#d32f2f', text: '#ffffff' }, // Red
    { bg: '#ffc107', border: '#ffa000', text: '#000000' }  // Yellow
  ]
  
  // Create root node
  const rootId = "root"
  const title = documentTitle || doc.querySelector('h1')?.textContent || "Document Title"
  
  nodes.push({
    id: rootId,
    type: 'editableNode',
    data: { 
      label: title,
      color: rootColor
    },
    position: { x: 400, y: 0 }
  })
  
  // Process headings as main categories
  const mainHeadings = doc.querySelectorAll('h2')
  const mainCategories = Array.from(mainHeadings).map((heading, index) => {
    const nodeId = `category-${index}`
    const categoryColor = categoryColors[index % categoryColors.length]
    
    // Calculate positions in a horizontal layout
    const totalCategories = mainHeadings.length
    const spacing = 1000 / (totalCategories + 1)
    const xPos = 100 + (index * spacing)
    
    nodes.push({
      id: nodeId,
      type: 'editableNode',
      data: { 
        label: heading.textContent || `Category ${index + 1}`,
        color: categoryColor
      },
      position: { x: xPos, y: 150 }
    })
    
    edges.push({
      id: `edge-${rootId}-${nodeId}`,
      source: rootId,
      target: nodeId,
      type: 'smoothstep',
      markerEnd: {
        type: MarkerType.ArrowClosed
      }
    })
    
    return { id: nodeId, element: heading, color: categoryColor }
  })
  
  // Process subcategories and content
  mainCategories.forEach((category, catIndex) => {
    let currentElement = category.element.nextElementSibling
    let subIndex = 0
    
    // Find the next category heading (if any)
    const nextCategoryElement = mainCategories[catIndex + 1]?.element
    
    // Track subcategory nodes for this category
    const subcategoryNodes = []
    
    while (currentElement && currentElement !== nextCategoryElement) {
      if (currentElement.tagName === 'H3' || currentElement.tagName === 'P') {
        const nodeId = `node-${catIndex}-${subIndex}`
        const text = currentElement.textContent?.trim() || ""
        
        // Skip empty nodes
        if (text) {
          // Calculate positions in a vertical layout
          const yPos = 250 + (subIndex * 100)
          
          // Get parent position
          const parentNode = nodes.find(n => n.id === category.id)
          if (!parentNode) continue
          
          const xPos = parentNode.position.x
          
          const node = {
            id: nodeId,
            type: 'editableNode',
            data: { 
              label: text,
              elementType: currentElement.tagName.toLowerCase(),
              color: category.color // Use the same color as the parent category
            },
            position: { x: xPos, y: yPos }
          }
          
          nodes.push(node)
          subcategoryNodes.push(node)
          
          edges.push({
            id: `edge-${category.id}-${nodeId}`,
            source: category.id,
            target: nodeId,
            type: 'smoothstep',
            markerEnd: {
              type: MarkerType.ArrowClosed
            }
          })
          
          subIndex++
        }
      }
      
      currentElement = currentElement.nextElementSibling
    }
    
    // Adjust positions to avoid overlaps
    if (subcategoryNodes.length > 0) {
      const parentNode = nodes.find(n => n.id === category.id)
      if (parentNode) {
        // Center parent node above its children
        const minX = Math.min(...subcategoryNodes.map(n => n.position.x))
        const maxX = Math.max(...subcategoryNodes.map(n => n.position.x))
        parentNode.position.x = (minX + maxX) / 2
        
        // Spread children horizontally
        const width = Math.max(800 / mainCategories.length, 200)
        subcategoryNodes.forEach((node, i) => {
          const offset = (i - (subcategoryNodes.length - 1) / 2) * (width / subcategoryNodes.length)
          node.position.x = parentNode.position.x + offset
        })
      }
    }
  })
  
  // If no content was found, create a default structure
  if (nodes.length <= 1) {
    const defaultCategories = [
      "1. Introduction", 
      "2. Scope", 
      "3. Responsibilities", 
      "4. Storage & Handling", 
      "5. Emergency"
    ]
    
    defaultCategories.forEach((category, index) => {
      const nodeId = `category-${index}`
      const xPos = 200 * (index - (defaultCategories.length / 2) + 0.5) + 400
      
      nodes.push({
        id: nodeId,
        type: 'editableNode',
        data: { label: category },
        position: { x: xPos, y: 120 }
      })
      
      edges.push({
        id: `edge-${rootId}-${nodeId}`,
        source: rootId,
        target: nodeId,
        type: 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed
        }
      })
      
      // Add some example subcategories
      if (index === 2) { // Responsibilities
        const subCategories = [
          { id: "node-2-0", label: "3.1 Cold Chain Coordinator:", y: 220 },
          { id: "node-2-1", label: "Oversee system & train staff", y: 300 },
          { id: "node-2-2", label: "Audit compliance", y: 380 },
          { id: "node-2-3", label: "3.2 Staff:", y: 460 },
          { id: "node-2-4", label: "Trained & follow policy", y: 540 }
        ]
        
        subCategories.forEach(sub => {
          nodes.push({
            id: sub.id,
            type: 'editableNode',
            data: { label: sub.label },
            position: { x: xPos, y: sub.y }
          })
          
          const sourceId = sub.id.endsWith("0") || sub.id.endsWith("3") 
            ? nodeId 
            : subCategories.find(s => parseInt(sub.id.split("-")[2]) === parseInt(s.id.split("-")[2]) - 1)?.id
          
          if (sourceId) {
            edges.push({
              id: `edge-${sourceId}-${sub.id}`,
              source: sourceId,
              target: sub.id,
              type: 'smoothstep',
              markerEnd: {
                type: MarkerType.ArrowClosed
              }
            })
          }
        })
      }
      
      if (index === 3) { // Storage & Handling
        const subCategories = [
          { id: "node-3-0", label: "4.1 Storage:", y: 220 },
          { id: "node-3-1", label: "+2°C to +8°C", y: 300 },
          { id: "node-3-2", label: "Monitor + Log with Data Logger", y: 380 }
        ]
        
        subCategories.forEach(sub => {
          nodes.push({
            id: sub.id,
            type: 'editableNode',
            data: { label: sub.label },
            position: { x: xPos, y: sub.y }
          })
          
          const sourceId = sub.id.endsWith("0")
            ? nodeId
            : subCategories.find(s => parseInt(sub.id.split("-")[2]) === parseInt(s.id.split("-")[2]) - 1)?.id
          
          if (sourceId) {
            edges.push({
              id: `edge-${sourceId}-${sub.id}`,
              source: sourceId,
              target: sub.id,
              type: 'smoothstep',
              markerEnd: {
                type: MarkerType.ArrowClosed
              }
            })
          }
        })
      }
      
      if (index === 4) { // Emergency
        const subCategories = [
          { id: "node-4-0", label: "Cold Chain Breach: Notify Coordinator", y: 220 },
          { id: "node-4-1", label: "Isolate vax if needed", y: 300 }
        ]
        
        subCategories.forEach(sub => {
          nodes.push({
            id: sub.id,
            type: 'editableNode',
            data: { label: sub.label },
            position: { x: xPos, y: sub.y }
          })
          
          const sourceId = sub.id.endsWith("0")
            ? nodeId
            : subCategories.find(s => parseInt(sub.id.split("-")[2]) === parseInt(s.id.split("-")[2]) - 1)?.id
          
          if (sourceId) {
            edges.push({
              id: `edge-${sourceId}-${sub.id}`,
              source: sourceId,
              target: sub.id,
              type: 'smoothstep',
              markerEnd: {
                type: MarkerType.ArrowClosed
              }
            })
          }
        })
      }
      
      if (index === 0) { // Introduction
        nodes.push({
          id: "node-0-0",
          type: 'editableNode',
          data: { label: "Applies to all immunisation staff" },
          position: { x: xPos, y: 220 }
        })
        
        edges.push({
          id: `edge-${nodeId}-node-0-0`,
          source: nodeId,
          target: "node-0-0",
          type: 'smoothstep',
          markerEnd: {
            type: MarkerType.ArrowClosed
          }
        })
      }
    })
    
    // Add appendix
    nodes.push({
      id: "appendix",
      type: 'editableNode',
      data: { label: "[Appendix]" },
      position: { x: 400, y: 620 }
    })
    
    edges.push({
      id: `edge-root-appendix`,
      source: rootId,
      target: "appendix",
      type: 'smoothstep',
      markerEnd: {
        type: MarkerType.ArrowClosed
      }
    })
    
    nodes.push({
      id: "appendix-1",
      type: 'editableNode',
      data: { label: "Data Logger Instructions" },
      position: { x: 400, y: 700 }
    })
    
    edges.push({
      id: `edge-appendix-appendix-1`,
      source: "appendix",
      target: "appendix-1",
      type: 'smoothstep',
      markerEnd: {
        type: MarkerType.ArrowClosed
      }
    })
    
    // Add review section
    nodes.push({
      id: "review",
      type: 'editableNode',
      data: { label: "[Review]" },
      position: { x: 400, y: 780 }
    })
    
    edges.push({
      id: `edge-root-review`,
      source: rootId,
      target: "review",
      type: 'smoothstep',
      markerEnd: {
        type: MarkerType.ArrowClosed
      }
    })
    
    nodes.push({
      id: "review-1",
      type: 'editableNode',
      data: { label: "Annual policy update for MOH compliance" },
      position: { x: 400, y: 860 }
    })
    
    edges.push({
      id: `edge-review-review-1`,
      source: "review",
      target: "review-1",
      type: 'smoothstep',
      markerEnd: {
        type: MarkerType.ArrowClosed
      }
    })
  }
  
  return { nodes, edges }
}

// Convert mind map nodes and edges back to HTML
export function convertMindMapToHtml(nodes: Node[], edges: Edge[]): string {
  // Create a map of node connections
  const nodeConnections: Record<string, string[]> = {}
  
  edges.forEach(edge => {
    if (!nodeConnections[edge.source]) {
      nodeConnections[edge.source] = []
    }
    nodeConnections[edge.source].push(edge.target)
  })
  
  // Find the root node
  const rootNode = nodes.find(node => node.id === "root")
  if (!rootNode) return ""
  
  // Build HTML recursively
  function buildHtml(nodeId: string, level: number): string {
    const children = nodeConnections[nodeId] || []
    let html = ""
    
    children.forEach(childId => {
      const childNode = nodes.find(node => node.id === childId)
      if (!childNode) return
      
      const text = childNode.data.label
      const elementType = childNode.data.elementType || "p"
      
      if (elementType.startsWith("h")) {
        html += `<${elementType}>${text}</${elementType}>\n`
      } else if (elementType === "li") {
        // Handle list items
        html += `<ul>\n<li>${text}</li>\n</ul>\n`
      } else {
        html += `<p>${text}</p>\n`
      }
      
      // Process children of this node
      html += buildHtml(childId, level + 1)
    })
    
    return html
  }
  
  return buildHtml("root", 0)
}





