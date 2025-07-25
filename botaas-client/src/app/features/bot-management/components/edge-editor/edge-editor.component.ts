import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface EdgeData {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

@Component({
  selector: 'app-edge-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>call_made</mat-icon>
      Edit Edge
    </h2>

    <mat-dialog-content>
      <form [formGroup]="edgeForm" (ngSubmit)="onSubmit()">
        <mat-card class="settings-card">
          <mat-card-header>
            <mat-card-title>Edge Properties</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="edge-info">
              <p><strong>From:</strong> {{ data.edge.source }}</p>
              <p><strong>To:</strong> {{ data.edge.target }}</p>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Edge Label</mat-label>
              <input matInput formControlName="label" placeholder="Enter edge label (e.g., 'Services', 'Support')">
              <mat-hint>Label for this edge (e.g., button text or route name)</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Condition (Optional)</mat-label>
              <input matInput formControlName="condition" placeholder="Enter condition (e.g., 'true', 'false')">
              <mat-hint>Used for conditional routing. Leave empty for default routing.</mat-hint>
            </mat-form-field>

            <div class="help-section">
              <h4>Edge Condition Usage Note:</h4>
              <ul>
                <li>Leave the condition blank to match <strong>any input</strong>.</li>
                <li>To match a quick reply button, enter the button’s text as the condition.</li>
                <li>Use specific words or values (like <code>"true"</code> or <code>"false"</code>) for custom routing.</li>
                <li>If there are multiple edges with conditions, the first matching condition will be used.</li>
              </ul>
            </div>
          </mat-card-content>
        </mat-card>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" 
              [disabled]="!edgeForm.valid">Save Edge</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .settings-card {
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .edge-info {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;
    }

    .edge-info p {
      margin: 4px 0;
    }

    .help-section {
      margin-top: 16px;
      padding: 12px;
      background: #e3f2fd;
      border-radius: 4px;
    }

    .help-section h4 {
      margin: 0 0 8px 0;
      color: #1976d2;
    }

    .help-section ul {
      margin: 8px 0;
      padding-left: 20px;
    }

    .help-section li {
      margin: 4px 0;
      font-size: 14px;
    }

    mat-dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    mat-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }
    .auto-routing-info {
      display: flex;
      align-items: flex-start;
      background: #e3f2fd;
      color: #1976d2;
      border-radius: 4px;
      padding: 12px 16px;
      margin-bottom: 16px;
      font-size: 15px;
      gap: 12px;
      min-width: 0;
      box-sizing: border-box;
      word-break: break-word;
    }
    .auto-routing-info mat-icon {
      flex-shrink: 0;
      min-width: 24px;
      min-height: 24px;
      font-size: 24px;
      margin-right: 4px;
      margin-top: 2px;
    }
  `]
})
export class EdgeEditorComponent implements OnInit {
  edgeForm: FormGroup;
  // REMOVED: isSingleOutgoingEdge: boolean = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EdgeEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { edge: EdgeData, outgoingEdgeCount?: number }
  ) {
    this.edgeForm = this.fb.group({
      label: ['', Validators.required],
      condition: ['']
    });
  }

  ngOnInit() {
    // REMOVED: this.isSingleOutgoingEdge = this.data.outgoingEdgeCount === 1;
    this.loadEdgeData();
  }

  loadEdgeData() {
    const edge = this.data.edge;
    this.edgeForm.patchValue({
      label: edge.label || '',
      condition: edge.condition || ''
    });
    this.edgeForm.get('label')?.enable();
    this.edgeForm.get('condition')?.enable();
  }

  onSubmit() {
    if (this.edgeForm.valid) {
      const formValue = this.edgeForm.getRawValue();
      const result = {
        ...this.data.edge,
        label: formValue.label,
        condition: formValue.condition || undefined
      };
      this.dialogRef.close(result);
    }
  }
} 