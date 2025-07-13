import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

interface NodeData {
  id: string;
  label: string;
  data: any;
}

@Component({
  selector: 'app-node-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    MatDividerModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ getNodeIcon() }}</mat-icon>
      {{ data.node.label || 'Edit Node' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="nodeForm" (ngSubmit)="onSubmit()">
        <!-- Basic Settings -->
        <mat-card class="settings-card">
          <mat-card-header>
            <mat-card-title>Basic Settings</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Node Label</mat-label>
              <input matInput formControlName="label" placeholder="Enter node label">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Node Type</mat-label>
              <mat-select formControlName="type">
                <mat-option value="start">Start Node</mat-option>
                <mat-option value="message">Message Node</mat-option>
                <mat-option value="condition">Condition Node</mat-option>
                <mat-option value="action">Action Node</mat-option>
                <mat-option value="webhook">Webhook Node</mat-option>
                <mat-option value="input">Input Node</mat-option>
                <mat-option value="end">End Node</mat-option>
              </mat-select>
            </mat-form-field>
          </mat-card-content>
        </mat-card>

        <!-- Node Type Specific Settings -->
        <mat-card class="settings-card" *ngIf="nodeForm.get('type')?.value">
          <mat-card-header>
            <mat-card-title>{{ getNodeTypeTitle() }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            
            <!-- Message Node Settings -->
            <div *ngIf="nodeForm.get('type')?.value === 'message'">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Message Content</mat-label>
                <textarea matInput formControlName="content" rows="4" 
                          placeholder="Enter the message to send to users"></textarea>
              </mat-form-field>

              <div class="quick-replies-section">
                <h4>Quick Reply Buttons</h4>
                <p class="help-text">Add buttons that users can click to navigate the flow</p>
                
                <div class="quick-replies-list">
                  <div *ngFor="let control of getQuickReplyControls(); let i = index" class="quick-reply-item">
                    <mat-form-field appearance="outline" class="quick-reply-input">
                      <mat-label>Button Text</mat-label>
                      <input matInput [formControl]="control" placeholder="Enter button text">
                    </mat-form-field>
                    <button mat-icon-button type="button" (click)="removeQuickReply(i)" color="warn">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </div>
                
                <button mat-button type="button" (click)="addQuickReply()" color="primary">
                  <mat-icon>add</mat-icon>
                  Add Quick Reply Button
                </button>
              </div>
            </div>

            <!-- Condition Node Settings -->
            <div *ngIf="nodeForm.get('type')?.value === 'condition'">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Condition Type</mat-label>
                <mat-select formControlName="conditionType">
                  <mat-option value="contains">Contains</mat-option>
                  <mat-option value="equals">Equals</mat-option>
                  <mat-option value="regex">Regular Expression</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Condition Value</mat-label>
                <input matInput formControlName="conditionValue" 
                       placeholder="Enter the value to check against">
              </mat-form-field>
            </div>

            <!-- Action Node Settings -->
            <div *ngIf="nodeForm.get('type')?.value === 'action'">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Action Type</mat-label>
                <mat-select formControlName="actionType">
                  <mat-option value="set_variable">Set Variable</mat-option>
                  <mat-option value="send_email">Send Email</mat-option>
                  <mat-option value="log_event">Log Event</mat-option>
                </mat-select>
              </mat-form-field>

              <div *ngIf="nodeForm.get('actionType')?.value === 'set_variable'">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Variable Name</mat-label>
                  <input matInput formControlName="variableName" placeholder="Enter variable name">
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Variable Value</mat-label>
                  <input matInput formControlName="variableValue" placeholder="Enter variable value">
                </mat-form-field>
              </div>
            </div>

            <!-- Webhook Node Settings -->
            <div *ngIf="nodeForm.get('type')?.value === 'webhook'">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Webhook URL</mat-label>
                <input matInput formControlName="webhookUrl" placeholder="https://api.example.com/webhook">
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>HTTP Method</mat-label>
                <mat-select formControlName="webhookMethod">
                  <mat-option value="GET">GET</mat-option>
                  <mat-option value="POST">POST</mat-option>
                  <mat-option value="PUT">PUT</mat-option>
                  <mat-option value="DELETE">DELETE</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Headers (JSON)</mat-label>
                <textarea matInput formControlName="webhookHeaders" rows="3" 
                          placeholder='{"Content-Type": "application/json"}'></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Request Body (JSON)</mat-label>
                <textarea matInput formControlName="webhookBody" rows="4" 
                          placeholder='{"message": "{{user_message}}"}'></textarea>
              </mat-form-field>
            </div>

            <!-- Input Node Settings -->
            <div *ngIf="nodeForm.get('type')?.value === 'input'">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Input Type</mat-label>
                <mat-select formControlName="inputType">
                  <mat-option value="text">Text</mat-option>
                  <mat-option value="email">Email</mat-option>
                  <mat-option value="phone">Phone Number</mat-option>
                  <mat-option value="number">Number</mat-option>
                  <mat-option value="date">Date</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Variable Name</mat-label>
                <input matInput formControlName="inputVariableName" placeholder="Enter variable name to store input">
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Validation Pattern (Optional)</mat-label>
                <input matInput formControlName="inputValidationPattern" 
                       placeholder="Enter regex pattern for validation">
              </mat-form-field>
            </div>

            <!-- End Node Settings -->
            <div *ngIf="nodeForm.get('type')?.value === 'end'">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>End Message</mat-label>
                <textarea matInput formControlName="endMessage" rows="3" 
                          placeholder="Enter the final message to send"></textarea>
              </mat-form-field>
            </div>

          </mat-card-content>
        </mat-card>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" 
              [disabled]="!nodeForm.valid">Save Node</button>
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

    .quick-replies-section {
      margin-top: 16px;
    }

    .help-text {
      color: #666;
      font-size: 14px;
      margin-bottom: 16px;
    }

    .quick-replies-list {
      margin-bottom: 16px;
    }

    .quick-reply-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .quick-reply-input {
      flex: 1;
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
export class NodeEditorComponent implements OnInit {
  nodeForm: FormGroup;
  quickReplies: FormGroup;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<NodeEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { node: NodeData }
  ) {
    this.nodeForm = this.fb.group({
      label: ['', Validators.required],
      type: ['message', Validators.required],
      content: [''],
      conditionType: ['contains'],
      conditionValue: [''],
      actionType: ['set_variable'],
      variableName: [''],
      variableValue: [''],
      webhookUrl: [''],
      webhookMethod: ['POST'],
      webhookHeaders: ['{}'],
      webhookBody: ['{}'],
      inputType: ['text'],
      inputVariableName: [''],
      inputValidationPattern: [''],
      endMessage: ['']
    });

    this.quickReplies = this.fb.group({});
  }

  ngOnInit() {
    this.loadNodeData();
    this.setupTypeChangeListener();
  }

  loadNodeData() {
    const node = this.data.node;
    const data = node.data;

    this.nodeForm.patchValue({
      label: node.label,
      type: data.type || 'message',
      content: data.content || '',
      conditionType: data.condition_type || 'contains',
      conditionValue: data.condition_value || '',
      actionType: data.action_type || 'set_variable',
      variableName: data.variable_name || '',
      variableValue: data.variable_value || '',
      webhookUrl: data.webhook_url || '',
      webhookMethod: data.method || 'POST',
      webhookHeaders: data.headers || '{}',
      webhookBody: data.request_body || '{}',
      inputType: data.input_type || 'text',
      inputVariableName: data.variable_name || '',
      inputValidationPattern: data.validation_pattern || '',
      endMessage: data.content || ''
    });

    // Load quick replies
    if (data.quick_replies && Array.isArray(data.quick_replies)) {
      data.quick_replies.forEach((reply: string, index: number) => {
        this.quickReplies.addControl(index.toString(), this.fb.control(reply));
      });
    }
  }

  setupTypeChangeListener() {
    this.nodeForm.get('type')?.valueChanges.subscribe(type => {
      // Reset form when type changes
      this.resetTypeSpecificFields();
    });
  }

  resetTypeSpecificFields() {
    const type = this.nodeForm.get('type')?.value;
    
    if (type !== 'message') {
      this.quickReplies = this.fb.group({});
    }
    
    if (type !== 'condition') {
      this.nodeForm.patchValue({
        conditionType: 'contains',
        conditionValue: ''
      });
    }
    
    if (type !== 'action') {
      this.nodeForm.patchValue({
        actionType: 'set_variable',
        variableName: '',
        variableValue: ''
      });
    }
    
    if (type !== 'webhook') {
      this.nodeForm.patchValue({
        webhookUrl: '',
        webhookMethod: 'POST',
        webhookHeaders: '{}',
        webhookBody: '{}'
      });
    }
    
    if (type !== 'input') {
      this.nodeForm.patchValue({
        inputType: 'text',
        inputVariableName: '',
        inputValidationPattern: ''
      });
    }
    
    if (type !== 'end') {
      this.nodeForm.patchValue({
        endMessage: ''
      });
    }
  }

  addQuickReply() {
    const index = Object.keys(this.quickReplies.controls).length;
    this.quickReplies.addControl(index.toString(), this.fb.control(''));
    
    // Force change detection
    this.cdr.detectChanges();
  }

  removeQuickReply(index: number) {
    const controlKey = index.toString();
    if (this.quickReplies.contains(controlKey)) {
      this.quickReplies.removeControl(controlKey);
      // Force change detection
      this.cdr.detectChanges();
    }
  }

  getQuickReplyControls() {
    return Object.values(this.quickReplies.controls);
  }

  getNodeIcon(): string {
    const type = this.nodeForm.get('type')?.value;
    switch (type) {
      case 'start': return 'play_arrow';
      case 'message': return 'message';
      case 'condition': return 'call_split';
      case 'action': return 'settings';
      case 'webhook': return 'webhook';
      case 'input': return 'input';
      case 'end': return 'stop';
      default: return 'help';
    }
  }

  getNodeTypeTitle(): string {
    const type = this.nodeForm.get('type')?.value;
    switch (type) {
      case 'start': return 'Start Node Settings';
      case 'message': return 'Message Node Settings';
      case 'condition': return 'Condition Node Settings';
      case 'action': return 'Action Node Settings';
      case 'webhook': return 'Webhook Node Settings';
      case 'input': return 'Input Node Settings';
      case 'end': return 'End Node Settings';
      default: return 'Node Settings';
    }
  }

  onSubmit() {
    if (this.nodeForm.valid) {
      const formValue = this.nodeForm.value;
      const nodeData: any = {
        type: formValue.type
      };

      // Add type-specific data
      switch (formValue.type) {
        case 'message':
          nodeData.content = formValue.content;
          // Add quick replies
          const quickRepliesArray = Object.values(this.quickReplies.value).filter((reply: any) => reply.trim());
          if (quickRepliesArray.length > 0) {
            nodeData.quick_replies = quickRepliesArray;
          }
          break;
        case 'condition':
          nodeData.condition_type = formValue.conditionType;
          nodeData.condition_value = formValue.conditionValue;
          break;
        case 'action':
          nodeData.action_type = formValue.actionType;
          if (formValue.actionType === 'set_variable') {
            nodeData.action_params = JSON.stringify({
              variable: formValue.variableName,
              value: formValue.variableValue
            });
          }
          break;
        case 'webhook':
          nodeData.webhook_url = formValue.webhookUrl;
          nodeData.method = formValue.webhookMethod;
          nodeData.headers = formValue.webhookHeaders;
          nodeData.request_body = formValue.webhookBody;
          break;
        case 'input':
          nodeData.input_type = formValue.inputType;
          nodeData.variable_name = formValue.inputVariableName;
          nodeData.validation_pattern = formValue.inputValidationPattern;
          break;
        case 'end':
          nodeData.content = formValue.endMessage;
          break;
      }

      const result = {
        label: formValue.label,
        data: nodeData
      };

      this.dialogRef.close(result);
    }
  }
} 