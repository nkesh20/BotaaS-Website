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
              <mat-hint>This label must EXACTLY match the quick reply button text or user input for proper routing</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Condition (Optional)</mat-label>
              <input matInput formControlName="condition" placeholder="Enter condition (e.g., 'true', 'false')">
              <mat-hint>Used for conditional routing. Leave empty for default routing.</mat-hint>
            </mat-form-field>

            <div class="help-section">
              <h4>Edge Label Usage:</h4>
              <ul>
                <li><strong>Quick Reply Buttons:</strong> Set label to EXACTLY match button text (e.g., "Services" for a "Services" button)</li>
                <li><strong>Text Matching:</strong> Set label to match user input (e.g., "help" to match when user types "help")</li>
                <li><strong>Default Route:</strong> Use "Next", "Continue", or "Default" for automatic progression</li>
                <li><strong>Conditional:</strong> Use "true"/"false" for condition-based routing</li>
                <li><strong>Important:</strong> Edge labels are case-sensitive and must match exactly for proper routing!</li>
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
  `]
})
export class EdgeEditorComponent implements OnInit {
  edgeForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EdgeEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { edge: EdgeData }
  ) {
    this.edgeForm = this.fb.group({
      label: ['', Validators.required],
      condition: ['']
    });
  }

  ngOnInit() {
    this.loadEdgeData();
  }

  loadEdgeData() {
    const edge = this.data.edge;
    this.edgeForm.patchValue({
      label: edge.label || '',
      condition: edge.condition || ''
    });
  }

  onSubmit() {
    if (this.edgeForm.valid) {
      const formValue = this.edgeForm.value;
      const result = {
        ...this.data.edge,
        label: formValue.label,
        condition: formValue.condition || undefined
      };

      this.dialogRef.close(result);
    }
  }
} 