import  { Node, Edge, MarkerType } from 'reactflow'


// Parse HTML content to mind map nodes and edges
export function parseHtmlToMindMap(htmlContent: string): { nodes: Node[], edges: Edge[] } {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, "text/html")
  
  const nodes: Node[] = []
  const edges: Edge[] = []
  
  // Create root node
  const rootId = "root"
  const title = doc.querySelector('h1')?.textContent || "Cold Chain Management Policy"
  
  nodes.push({
    id: rootId,
    type: 'editableNode',
    data: { label: title },
    position: { x: 400, y: 0 }
  })
  
  // Process headings as main categories
  const mainHeadings = doc.querySelectorAll('h2')
  const mainCategories = Array.from(mainHeadings).map((heading, index) => {
    const nodeId = `category-${index}`
    const xPos = 150 * (index - (mainHeadings.length / 2)) + 400
    
    nodes.push({
      id: nodeId,
      type: 'editableNode',
      data: { label: heading.textContent || `Category ${index + 1}` },
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
    
    return { id: nodeId, element: heading }
  })
  
  // Process subheadings and paragraphs
  mainCategories.forEach((category, catIndex) => {
    const nextCategoryElement = mainCategories[catIndex + 1]?.element
    let currentElement = category.element.nextElementSibling
    let subIndex = 0
    
    while (currentElement && currentElement !== nextCategoryElement) {
      if (currentElement.tagName === 'H3' || currentElement.tagName === 'P') {
        const nodeId = `node-${catIndex}-${subIndex}`
        const text = currentElement.textContent?.trim() || ""
        
        // Skip empty nodes
        if (text) {
          const xPos = 150 * (catIndex - (mainCategories.length / 2)) + 400
          const yPos = 200 + (subIndex * 80)
          
          nodes.push({
            id: nodeId,
            type: 'editableNode',
            data: { 
              label: text,
              elementType: currentElement.tagName.toLowerCase()
            },
            position: { x: xPos, y: yPos }
          })
          
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


