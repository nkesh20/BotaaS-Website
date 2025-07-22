import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';

import { BotService } from '../../services/bot.service';
import { NodeEditorComponent } from '../node-editor/node-editor.component';
import { EdgeEditorComponent } from '../edge-editor/edge-editor.component';

interface SimpleNode {
  id: string;
  label: string;
  data: any;
  x: number;
  y: number;
}

interface SimpleEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

@Component({
  selector: 'app-flow-builder',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatMenuModule,
    MatDialogModule
  ],
  template: `
    <div class="flow-builder">
      <mat-toolbar class="toolbar">
        <button mat-button (click)="backToFlows()" class="back-button">
          <mat-icon>arrow_back</mat-icon>
          Back to Flows
        </button>
        <span>Flow Builder</span>
        <div class="toolbar-spacer"></div>
        <button mat-button (click)="addNode()">
          <mat-icon>add</mat-icon>
          Add Node
        </button>
        <button mat-button (click)="connectMode = !connectMode" [class.active]="connectMode">
          <mat-icon>call_made</mat-icon>
          {{ connectMode ? 'Connecting...' : 'Connect Nodes' }}
        </button>
        <button mat-button (click)="deleteSelectedNode()" [disabled]="!selectedNode">
          <mat-icon>delete</mat-icon>
          Delete Node
        </button>
        <button mat-button (click)="showEdgeEditingHelp()" color="accent">
          <mat-icon>help</mat-icon>
          Edge Labels Help
        </button>
        <button mat-raised-button color="primary" (click)="saveFlow()">
          <mat-icon>save</mat-icon>
          Save Flow
        </button>
        <button mat-button color="accent" (click)="setAsDefault()" *ngIf="route.snapshot.params['flowId'] && route.snapshot.params['flowId'] !== 'new'">
          <mat-icon>star</mat-icon>
          Set as Default
        </button>
        <button mat-button (click)="refreshFlow()" *ngIf="route.snapshot.params['flowId'] && route.snapshot.params['flowId'] !== 'new'">
          <mat-icon>refresh</mat-icon>
          Refresh
        </button>
        <button mat-button (click)="debugInfo()" color="warn">
          <mat-icon>bug_report</mat-icon>
          Debug
        </button>
      </mat-toolbar>

      <!-- Debug panel -->
      <div class="debug-panel" *ngIf="showDebugPanel">
        <h4>Debug Information</h4>
        <p><strong>Nodes count:</strong> {{ nodes.length }}</p>
        <p><strong>Edges count:</strong> {{ edges.length }}</p>
        <p><strong>Selected node:</strong> {{ selectedNode?.label || 'None' }}</p>
        <p><strong>Connect Mode:</strong> {{ connectMode }}</p>
        <div *ngIf="nodes.length > 0">
          <h5>Nodes:</h5>
          <pre>{{ nodes | json }}</pre>
        </div>
        <div *ngIf="edges.length > 0">
          <h5>Edges:</h5>
          <pre>{{ edges | json }}</pre>
        </div>
        <button mat-button (click)="addTestNodes()">Add Test Nodes</button>
        <button mat-button (click)="clearNodes()">Clear Nodes</button>
        <button mat-button (click)="testEdgeEditor()">Test Edge Editor</button>
        <button mat-button (click)="showDebugPanel = false">Close Debug</button>
      </div>

      <div class="canvas-container" #canvas>
        <svg class="flow-canvas" [attr.width]="canvasWidth" [attr.height]="canvasHeight">
          <!-- Edges -->
          <g class="edges">
            <g *ngFor="let edge of validEdges" class="edge">
              <path 
                [attr.d]="getEdgePath(edge)" 
                stroke="rgba(153,153,153,0.5)" 
                stroke-width="1.2"
                fill="none"
                marker-end="url(#arrowhead)">
              </path>
              <text 
                [attr.x]="getEdgeLabelPosition(edge).x"
                [attr.y]="getEdgeLabelPosition(edge).y"
                text-anchor="middle"
                class="edge-label"
                (click)="onEdgeLabelClick(edge, $event)"
                [title]="'Click to edit edge label: ' + (edge.label || 'No label')"
                style="cursor: pointer;">
                {{ edge.label }}
              </text>
            </g>
          </g>

          <!-- Arrow marker definition -->
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                    refX="10" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#999" />
            </marker>
          </defs>
        </svg>

        <!-- Nodes -->
        <div class="nodes">
          <div 
            *ngFor="let node of nodes"
            class="node"
            [class.selected]="selectedNode?.id === node.id"
            [class.connecting]="connectMode && connectingFrom?.id === node.id"
            [style.left.px]="node.x"
            [style.top.px]="node.y"
            (click)="onNodeClick(node)"
            (mousedown)="startDrag(node, $event)">
            
            <mat-icon class="node-icon">{{ getNodeIcon(node) }}</mat-icon>
            <span class="node-label">{{ node.label }}</span>
            
            <!-- Connection points -->
            <div class="connection-point input" title="Input"></div>
            <div class="connection-point output" title="Output"></div>
          </div>
        </div>

        <!-- Status message -->
        <div class="status" *ngIf="connectMode">
          {{ connectingFrom ? 'Click target node to connect' : 'Click source node to start connection' }}
        </div>
      </div>

      <!-- Debug info -->
      <div class="debug-info" *ngIf="showDebug">
        <p><strong>Nodes:</strong> {{ nodes.length }}</p>
        <p><strong>Edges:</strong> {{ edges.length }}</p>
        <p><strong>Selected:</strong> {{ selectedNode?.label || 'None' }}</p>
        <p><strong>Connect Mode:</strong> {{ connectMode }}</p>
      </div>
    </div>
  `,
  styles: [`
    .flow-builder {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #f5f5f5;
    }

    .toolbar {
      background: white;
      border-bottom: 1px solid #ddd;
      flex-shrink: 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .back-button {
      margin-right: 16px;
    }

    .toolbar-spacer {
      flex: 1 1 auto;
    }

    .toolbar button.active {
      background: #e3f2fd;
    }

    .canvas-container {
      flex: 1;
      position: relative;
      overflow: hidden;
      background: linear-gradient(90deg, #f0f0f0 1px, transparent 1px),
                  linear-gradient(#f0f0f0 1px, transparent 1px);
      background-size: 20px 20px;
    }

    .flow-canvas {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
    }

    .edges {
      pointer-events: none;
    }

    .edge {
      pointer-events: none;
    }

    .edge line {
      pointer-events: none;
    }

    .edge text {
      pointer-events: auto;
    }

    .nodes {
      position: relative;
      z-index: 2;
    }

    .node {
      position: absolute;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      cursor: pointer;
      user-select: none;
      min-width: 120px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.2s ease;
    }

    .node:hover {
      border-color: #1976d2;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateY(-1px);
    }

    .node.selected {
      border-color: #1976d2;
      box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.3);
      background: #f3f8ff;
    }

    .node.connecting {
      border-color: #4caf50;
      background: #f1f8e9;
    }

    .node-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #1976d2;
    }

    .node-label {
      font-weight: 500;
      color: #333;
    }

    .connection-point {
      position: absolute;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #1976d2;
      border: 2px solid white;
    }

    .connection-point.input {
      top: -4px;
      left: 50%;
      transform: translateX(-50%);
    }

    .connection-point.output {
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
    }

    .edge-label {
      font-size: 12px;
      fill: #666;
      cursor: pointer;
      transition: fill 0.2s ease;
      pointer-events: auto;
    }

    .edge-label:hover {
      fill: #1976d2;
      font-weight: bold;
      text-decoration: underline;
    }

    .status {
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
      z-index: 10;
    }

    .debug-panel {
      position: absolute;
      top: 60px;
      right: 10px;
      width: 400px;
      max-height: 500px;
      overflow-y: auto;
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 16px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      z-index: 1000;
      font-size: 12px;
    }

    .debug-panel h4, .debug-panel h5 {
      margin: 0 0 8px 0;
    }

    .debug-panel pre {
      max-height: 200px;
      overflow-y: auto;
      background: #f5f5f5;
      padding: 8px;
      border-radius: 4px;
    }

    .debug-info {
      position: absolute;
      top: 80px;
      right: 10px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 10px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 10;
    }
  `]
})
export class FlowBuilderComponent implements OnInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef;

  nodes: SimpleNode[] = [];
  edges: SimpleEdge[] = [];
  selectedNode: SimpleNode | null = null;
  
  connectMode = false;
  connectingFrom: SimpleNode | null = null;
  
  isDragging = false;
  dragOffset = { x: 0, y: 0 };
  
  canvasWidth = 1200;
  canvasHeight = 800;
  showDebug = false;
  showDebugPanel = false;

  constructor(
    private botService: BotService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const botId = this.route.snapshot.params['botId'];
    const flowId = this.route.snapshot.params['flowId'];

    if (flowId && flowId !== 'new') {
      this.loadFlow(botId, flowId);
    } else {
      this.initializeDefaultFlow();
    }

    // Add mouse event listeners
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('mousemove', this.onMouseMove.bind(this));
    document.removeEventListener('mouseup', this.onMouseUp.bind(this));
  }

  initializeDefaultFlow() {
    this.nodes = [
      {
        id: 'start',
        label: 'Start',
        data: { type: 'start' },
        x: 100,
        y: 100
      },
      {
        id: 'welcome',
        label: 'Welcome Message',
        data: { 
          type: 'message',
          content: 'Hello! Welcome to our bot. What would you like to do?',
          quick_replies: ['Option 1', 'Option 2', 'Option 3']
        },
        x: 300,
        y: 100
      }
    ];
    this.edges = [
      {
        id: 'start_to_welcome',
        source: 'start',
        target: 'welcome',
        label: 'Next'
      }
    ];
  }

  loadFlow(botId: number, flowId: number) {
    this.botService.getFlow(botId, flowId).subscribe({
      next: (flow) => {
        // Convert to simple format
        this.nodes = (flow.nodes || []).map((node: any, index: number) => ({
          id: node.id,
          label: node.label,
          data: node.data || {},
          x: node.position?.x || (100 + (index % 4) * 200),
          y: node.position?.y || (100 + Math.floor(index / 4) * 150)
        }));

        this.edges = (flow.edges || []).map((edge: any) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label || ''
        }));
      },
      error: (error) => {
        this.snackBar.open('Error loading flow', 'Close', { duration: 3000 });
      }
    });
  }

  getNodeById(id: string): SimpleNode | undefined {
    return this.nodes.find(n => n.id === id);
  }

  /**
   * Returns the intersection point between a line from (x0, y0) to (x1, y1) and the rectangle centered at (cx, cy) with width w and height h.
   * Returns the intersection point on the rectangle border closest to (x0, y0).
   */
  private getRectIntersection(x0: number, y0: number, x1: number, y1: number, cx: number, cy: number, w: number, h: number) {
    // Rectangle sides
    const left = cx;
    const right = cx + w;
    const top = cy;
    const bottom = cy + h;
    // Direction vector
    const dx = x1 - x0;
    const dy = y1 - y0;
    let tMin = Infinity;
    let ix = x1, iy = y1;
    // Check intersection with each side
    // Left (x = left)
    if (dx !== 0) {
      const t = (left - x0) / dx;
      const y = y0 + t * dy;
      if (t > 0 && y >= top && y <= bottom && t < tMin) {
        tMin = t;
        ix = left;
        iy = y;
      }
    }
    // Right (x = right)
    if (dx !== 0) {
      const t = (right - x0) / dx;
      const y = y0 + t * dy;
      if (t > 0 && y >= top && y <= bottom && t < tMin) {
        tMin = t;
        ix = right;
        iy = y;
      }
    }
    // Top (y = top)
    if (dy !== 0) {
      const t = (top - y0) / dy;
      const x = x0 + t * dx;
      if (t > 0 && x >= left && x <= right && t < tMin) {
        tMin = t;
        ix = x;
        iy = top;
      }
    }
    // Bottom (y = bottom)
    if (dy !== 0) {
      const t = (bottom - y0) / dy;
      const x = x0 + t * dx;
      if (t > 0 && x >= left && x <= right && t < tMin) {
        tMin = t;
        ix = x;
        iy = bottom;
      }
    }
    return { x: ix, y: iy };
  }

  /**
   * Returns the index and total count of edges between the same source and target (in either direction).
   */
  private getEdgeMultiIndex(edge: SimpleEdge) {
    // Only consider edges with the same source and target (directional)
    const siblings = this.edges.filter(e => e.source === edge.source && e.target === edge.target);
    const index = siblings.findIndex(e => e.id === edge.id);
    return { index, total: siblings.length };
  }

  /**
   * Returns SVG path for a curved edge if needed, or straight if only one edge.
   */
  getEdgePath(edge: SimpleEdge) {
    const sourceNode = this.getNodeById(edge.source);
    const targetNode = this.getNodeById(edge.target);
    const nodeWidth = 120;
    const nodeHeight = 44;
    if (!sourceNode || !targetNode) return '';
    // Centers
    const sourceCenterX = sourceNode.x + nodeWidth / 2;
    const sourceCenterY = sourceNode.y + nodeHeight / 2;
    const targetCenterX = targetNode.x + nodeWidth / 2;
    const targetCenterY = targetNode.y + nodeHeight / 2;
    // Intersection points
    const sourceIntersect = this.getRectIntersection(targetCenterX, targetCenterY, sourceCenterX, sourceCenterY, sourceNode.x, sourceNode.y, nodeWidth, nodeHeight);
    const targetIntersect = this.getRectIntersection(sourceCenterX, sourceCenterY, targetCenterX, targetCenterY, targetNode.x, targetNode.y, nodeWidth, nodeHeight);
    // Multi-edge offset
    const { index, total } = this.getEdgeMultiIndex(edge);
    let offset = 0;
    if (total > 1) {
      const spacing = 40; // px
      offset = (index - (total - 1) / 2) * spacing;
    }
    // Calculate perpendicular vector
    const dx = targetIntersect.x - sourceIntersect.x;
    const dy = targetIntersect.y - sourceIntersect.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    // Start and end points are the same for all multi-edges
    const sx = sourceIntersect.x;
    const sy = sourceIntersect.y;
    const tx = targetIntersect.x;
    const ty = targetIntersect.y;
    // Control points are offset perpendicularly
    const c1x = sx + dx / 3 + nx * offset;
    const c1y = sy + dy / 3 + ny * offset;
    const c2x = sx + 2 * dx / 3 + nx * offset;
    const c2y = sy + 2 * dy / 3 + ny * offset;
    // SVG path
    return `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${tx} ${ty}`;
  }

  getEdgeLabelPosition(edge: SimpleEdge) {
    // For label, use the midpoint of the curve (approximate at t=0.5)
    const sourceNode = this.getNodeById(edge.source);
    const targetNode = this.getNodeById(edge.target);
    const nodeWidth = 120;
    const nodeHeight = 44;
    if (!sourceNode || !targetNode) return { x: 0, y: 0 };
    const sourceCenterX = sourceNode.x + nodeWidth / 2;
    const sourceCenterY = sourceNode.y + nodeHeight / 2;
    const targetCenterX = targetNode.x + nodeWidth / 2;
    const targetCenterY = targetNode.y + nodeHeight / 2;
    const sourceIntersect = this.getRectIntersection(targetCenterX, targetCenterY, sourceCenterX, sourceCenterY, sourceNode.x, sourceNode.y, nodeWidth, nodeHeight);
    const targetIntersect = this.getRectIntersection(sourceCenterX, sourceCenterY, targetCenterX, targetCenterY, targetNode.x, targetNode.y, nodeWidth, nodeHeight);
    const { index, total } = this.getEdgeMultiIndex(edge);
    let offset = 0;
    if (total > 1) {
      const spacing = 40;
      offset = (index - (total - 1) / 2) * spacing;
    }
    const dx = targetIntersect.x - sourceIntersect.x;
    const dy = targetIntersect.y - sourceIntersect.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    // Start and end points are the same for all multi-edges
    const sx = sourceIntersect.x;
    const sy = sourceIntersect.y;
    const tx = targetIntersect.x;
    const ty = targetIntersect.y;
    // Control points are offset perpendicularly
    const c1x = sx + dx / 3 + nx * offset;
    const c1y = sy + dy / 3 + ny * offset;
    const c2x = sx + 2 * dx / 3 + nx * offset;
    const c2y = sy + 2 * dy / 3 + ny * offset;
    // Bezier midpoint at t=0.5
    const t = 0.5;
    const x = Math.pow(1 - t, 3) * sx + 3 * Math.pow(1 - t, 2) * t * c1x + 3 * (1 - t) * t * t * c2x + Math.pow(t, 3) * tx;
    const y = Math.pow(1 - t, 3) * sy + 3 * Math.pow(1 - t, 2) * t * c1y + 3 * (1 - t) * t * t * c2y + Math.pow(t, 3) * ty - 8;
    return { x, y };
  }

  // Only show edges where both nodes exist
  get validEdges(): SimpleEdge[] {
    return this.edges.filter(edge => 
      this.getNodeById(edge.source) && this.getNodeById(edge.target)
    );
  }

  getNodeIcon(node: SimpleNode): string {
    const iconMap: { [key: string]: string } = {
      start: 'play_arrow',
      message: 'chat',
      condition: 'call_split',
      action: 'settings',
      webhook: 'webhook',
      input: 'input',
      end: 'stop',
      default: 'radio_button_unchecked'
    };

    return iconMap[node.data?.type || 'default'] || iconMap['default'];
  }

  onNodeClick(node: SimpleNode) {
    if (this.connectMode) {
      if (!this.connectingFrom) {
        this.connectingFrom = node;
      } else if (this.connectingFrom.id !== node.id) {
        // Create connection
        const newEdge: SimpleEdge = {
          id: `edge-${Date.now()}`,
          source: this.connectingFrom.id,
          target: node.id,
          label: 'Next'
        };
        this.edges = [...this.edges, newEdge];
        this.snackBar.open(`Connected ${this.connectingFrom.label} → ${node.label}`, 'Close', { duration: 2000 });
        this.connectingFrom = null;
        this.connectMode = false;
      }
    } else {
      this.selectedNode = node;
      this.openNodeEditor(node);
    }
  }

  onEdgeLabelClick(edge: SimpleEdge, event: MouseEvent) {
    event.stopPropagation();
    this.snackBar.open(`Editing edge: ${edge.source} → ${edge.target}`, 'Close', { duration: 2000 });
    this.openEdgeEditor(edge);
  }

  startDrag(node: SimpleNode, event: MouseEvent) {
    if (this.connectMode) return;
    
    this.isDragging = true;
    this.selectedNode = node;
    this.dragOffset = {
      x: event.clientX - node.x,
      y: event.clientY - node.y
    };
    event.preventDefault();
  }

  onMouseMove(event: MouseEvent) {
    if (this.isDragging && this.selectedNode && this.canvasRef) {
      const rect = this.canvasRef.nativeElement.getBoundingClientRect();
      const newX = event.clientX - rect.left - this.dragOffset.x;
      const newY = event.clientY - rect.top - this.dragOffset.y;
      
      // Keep nodes within canvas bounds
      this.selectedNode.x = Math.max(0, Math.min(newX, this.canvasWidth - 150));
      this.selectedNode.y = Math.max(0, Math.min(newY, this.canvasHeight - 60));
    }
  }

  onMouseUp() {
    if (this.isDragging) {
      console.log('Stopped dragging');
      this.isDragging = false;
    }
  }

  addNode() {
    console.log('Add node clicked');
    
    try {
      // Create a message node by default (most common for quick reply flows)
      const newNode: SimpleNode = {
        id: `node-${Date.now()}`,
        label: 'New Message',
        data: { 
          type: 'message',
          content: 'Enter your message here',
          quick_replies: []
        },
        x: 200 + (this.nodes.length % 4) * 200,
        y: 100 + Math.floor(this.nodes.length / 4) * 150
      };

      console.log('Created new message node:', newNode);
      this.nodes = [...this.nodes, newNode];
      this.openNodeEditor(newNode);
    } catch (error) {
      console.error('Error in addNode:', error);
      this.snackBar.open('Error creating node', 'Close', { duration: 3000 });
    }
  }

  openNodeEditor(node: SimpleNode) {
    try {
      const dialogRef = this.dialog.open(NodeEditorComponent, {
        width: '600px',
        data: { node: { 
          id: node.id,
          label: node.label,
          data: node.data 
        }},
        disableClose: false
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          const index = this.nodes.findIndex(n => n.id === node.id);
          if (index !== -1) {
            this.nodes[index] = {
              ...this.nodes[index],
              label: result.label,
              data: result.data
            };
          }
        }
      });
    } catch (error) {
      this.snackBar.open('Error opening node editor', 'Close', { duration: 3000 });
    }
  }

  openEdgeEditor(edge: SimpleEdge) {
    try {
      const dialogRef = this.dialog.open(EdgeEditorComponent, {
        width: '500px',
        data: { edge: edge },
        disableClose: false
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          const index = this.edges.findIndex(e => e.id === edge.id);
          if (index !== -1) {
            this.edges[index] = {
              ...this.edges[index],
              label: result.label,
              condition: result.condition
            };
            this.snackBar.open('Edge updated successfully', 'Close', { duration: 2000 });
          }
        }
      });
    } catch (error) {
      this.snackBar.open('Error opening edge editor', 'Close', { duration: 3000 });
    }
  }

  showEdgeEditingHelp() {
    this.snackBar.open(
      '💡 Tip: Click on any edge label (text on connection lines) to edit it!', 
      'Got it', 
      { duration: 5000 }
    );
  }

  testEdgeEditor() {
    if (this.edges.length > 0) {
      this.openEdgeEditor(this.edges[0]);
    } else {
      this.snackBar.open('No edges available to test. Create some connections first.', 'OK', { duration: 3000 });
    }
  }

  deleteSelectedNode() {
    if (this.selectedNode) {
      this.nodes = this.nodes.filter(n => n.id !== this.selectedNode!.id);
      this.edges = this.edges.filter(e => 
        e.source !== this.selectedNode!.id && e.target !== this.selectedNode!.id
      );
      this.selectedNode = null;
      this.snackBar.open('Node deleted', 'Close', { duration: 2000 });
    }
  }

  refreshFlow() {
    const botId = parseInt(this.route.snapshot.params['botId']);
    const flowId = this.route.snapshot.params['flowId'];
    
    if (botId && flowId && flowId !== 'new') {
      this.loadFlow(botId, parseInt(flowId));
    }
  }

  debugInfo() {
    this.showDebugPanel = !this.showDebugPanel;
  }

  addTestNodes() {
    this.nodes = [
      {
        id: 'test1',
        label: 'Test Node 1',
        data: { type: 'start' },
        x: 100,
        y: 100
      },
      {
        id: 'test2',
        label: 'Test Node 2',
        data: { type: 'message', content: 'Test message' },
        x: 300,
        y: 100
      },
      {
        id: 'test3',
        label: 'Test Node 3',
        data: { type: 'condition' },
        x: 500,
        y: 100
      }
    ];
    this.edges = [
      {
        id: 'edge1',
        source: 'test1',
        target: 'test2',
        label: 'Next'
      },
      {
        id: 'edge2',
        source: 'test2',
        target: 'test3',
        label: 'Then'
      }
    ];
  }

  clearNodes() {
    this.nodes = [];
    this.edges = [];
    this.selectedNode = null;
    this.connectingFrom = null;
    this.connectMode = false;
  }

  saveFlow() {
    const botId = parseInt(this.route.snapshot.params['botId']);
    const flowId = this.route.snapshot.params['flowId'];

    if (!botId || isNaN(botId)) {
      this.snackBar.open('Invalid bot ID', 'Close', { duration: 3000 });
      return;
    }
    
    // First get the current flow to preserve its default status
    if (flowId && flowId !== 'new') {
      this.botService.getFlow(botId, parseInt(flowId)).subscribe({
        next: (currentFlow) => {
          // Convert back to API format, preserving the current is_default status
          const flowData = {
            name: flowId ? `Flow ${flowId} Updated` : 'New Flow ' + new Date().toLocaleString(),
            description: 'Created via flow builder',
            is_active: true,
            is_default: currentFlow.is_default, // Preserve current default status
            nodes: this.nodes.map(node => ({
              id: node.id,
              label: node.label,
              data: node.data,
              position: { x: node.x, y: node.y }
            })),
            edges: this.edges.map(edge => ({
              id: edge.id,
              source: edge.source,
              target: edge.target,
              label: edge.label
            })),
            triggers: [],
            variables: {}
          };

          this.botService.updateFlow(botId, parseInt(flowId), flowData).subscribe({
            next: (response) => {
              this.snackBar.open('Flow saved successfully', 'Close', { duration: 3000 });
              // Reload the flow to get the updated version
              this.loadFlow(botId, parseInt(flowId));
            },
            error: (error) => {
              this.snackBar.open(`Error saving flow: ${error.error?.detail || error.message}`, 'Close', { duration: 5000 });
            }
          });
        },
        error: (error) => {
          this.snackBar.open('Error getting current flow status', 'Close', { duration: 3000 });
        }
      });
    } else {
      // For new flows, set is_default to false
      const flowData = {
        name: 'New Flow ' + new Date().toLocaleString(),
        description: 'Created via flow builder',
        is_active: true,
        is_default: false,
        nodes: this.nodes.map(node => ({
          id: node.id,
          label: node.label,
          data: node.data,
          position: { x: node.x, y: node.y }
        })),
        edges: this.edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label
        })),
        triggers: [],
        variables: {}
      };

      this.botService.createFlow(botId, flowData).subscribe({
        next: (flow) => {
          this.snackBar.open('Flow created successfully', 'Close', { duration: 3000 });
          // Navigate to the edit page for the new flow
          this.router.navigate(['/bots', botId, 'flows', flow.id]).then(() => {
            // After navigation, reload the flow
            setTimeout(() => {
              this.loadFlow(botId, flow.id);
            }, 100);
          });
        },
        error: (error) => {
          this.snackBar.open(`Error creating flow: ${error.error?.detail || error.message}`, 'Close', { duration: 5000 });
        }
      });
    }
  }

  setAsDefault() {
    const botId = parseInt(this.route.snapshot.params['botId']);
    const flowId = this.route.snapshot.params['flowId'];
    
    if (!flowId || flowId === 'new') {
      this.snackBar.open('Please save the flow first', 'Close', { duration: 3000 });
      return;
    }

    this.botService.setFlowAsDefault(botId, parseInt(flowId)).subscribe({
      next: (result) => {
        this.snackBar.open('Flow set as default successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open('Failed to set flow as default', 'Close', { duration: 3000 });
      }
    });
  }

  backToFlows() {
    const botId = this.route.snapshot.params['botId'];
    this.router.navigate(['/bots', botId, 'flows']);
  }
}