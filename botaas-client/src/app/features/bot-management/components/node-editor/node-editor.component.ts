import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { Node } from '@swimlane/ngx-graph';

@Component({
  selector: 'app-node-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>Edit Node</h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Node Type</mat-label>
          <mat-select formControlName="type">
            <mat-option value="message">Message</mat-option>
            <mat-option value="condition">Condition</mat-option>
            <mat-option value="action">Action</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Label</mat-label>
          <input matInput formControlName="label" required>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Content</mat-label>
          <textarea matInput formControlName="content" rows="4"></textarea>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="!form.valid">
          Save
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }
  `]
})
export class NodeEditorComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<NodeEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { node: Node }
  ) {
    this.form = this.fb.group({
      type: [data.node.data?.type || 'message', Validators.required],
      label: [data.node.label, Validators.required],
      content: [data.node.data?.content || '']
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      const updatedNode: Node = {
        ...this.data.node,
        label: formValue.label,
        data: {
          ...this.data.node.data,
          type: formValue.type,
          content: formValue.content
        }
      };
      this.dialogRef.close(updatedNode);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
} 