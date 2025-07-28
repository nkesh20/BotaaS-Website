import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
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
import { MatCheckboxModule } from '@angular/material/checkbox';


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
     MatDividerModule,
     MatCheckboxModule
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
              <div class="help-section">
                <h4>Usage Note:</h4>
                <div>
                  Condition node outputs either <b>'true'</b> or <b>'false'</b>. To handle both outcomes, create outgoing edges with the conditions <b>'true'</b> and <b>'false'</b>.
                </div>
              </div>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Condition Type</mat-label>
                <mat-select formControlName="conditionType">
                  <mat-option value="equals">Equals</mat-option>
                  <mat-option value="contains">Contains</mat-option>
                  <mat-option value="number">Is Number</mat-option>
                  <mat-option value="email">Is Email</mat-option>
                  <mat-option value="phone_number">Is Phone Number</mat-option>
                  <mat-option value="date">Is Date</mat-option>
                  <mat-option value="toxicity">Is Toxic</mat-option>
                  <mat-option value="regex">Regular Expression</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width" *ngIf="nodeForm.get('conditionType')?.value !== 'toxicity'">
                <mat-label>Condition Value</mat-label>
                <input matInput formControlName="conditionValue" 
                       placeholder="Enter the value to check against">
              </mat-form-field>
              
              <!-- Toxicity Slider -->
              <div *ngIf="nodeForm.get('conditionType')?.value === 'toxicity'" class="toxicity-slider-section">
                <div class="slider-header">
                  <label class="slider-label">Sensitivity</label>
                  <span class="sensitivity-level" [class]="getSensitivityLevel()">{{ getSensitivityLevel() }}</span>
                </div>
                <div class="slider-container">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="1"
                    [value]="(nodeForm.get('toxicity_sensitivity')?.value ?? 0.5) * 100"
                    class="toxicity-slider"
                    (input)="onToxicitySliderChange($event)">
                  <span class="slider-value">{{ (nodeForm.get('toxicity_sensitivity')?.value ?? 0.5) | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>

            <!-- Action Node Settings -->
            <div *ngIf="nodeForm.get('type')?.value === 'action'">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Action Type</mat-label>
                <mat-select formControlName="actionType">
                  <mat-option value="set_variable">Set Variable</mat-option>
                  <mat-option value="send_email">Send Email</mat-option>
                  <mat-option value="log_event">Log Event</mat-option>
                  <mat-option value="notify_owner">Notify Bot Owner</mat-option>
                  <mat-option value="ban_chat_member">Ban Chat Member</mat-option>
                  <mat-option value="delete_message">Delete Message</mat-option>
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

              <!-- Notify Owner Message Input -->
              <div *ngIf="nodeForm.get('actionType')?.value === 'notify_owner'">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Notification Message</mat-label>
                  <textarea matInput formControlName="notifyOwnerMessage" rows="3" placeholder="Enter the message to send to the bot owner"></textarea>
                  <mat-hint>You can use variables like <span>{{'{{user_id}}'}}</span> in your message.</mat-hint>
                </mat-form-field>
              </div>

              <!-- Ban Chat Member Settings -->
              <div *ngIf="nodeForm.get('actionType')?.value === 'ban_chat_member'">
                <div class="ban-duration-section">
                  <h4>Ban Duration</h4>
                  <div class="duration-options">
                    <button type="button" 
                            mat-stroked-button 
                            [class.selected]="banDuration === 'permanent'"
                            (click)="setBanDuration('permanent')">
                      <mat-icon>block</mat-icon>
                      Permanent Ban
                    </button>
                    <button type="button" 
                            mat-stroked-button 
                            [class.selected]="banDuration === '1hour'"
                            (click)="setBanDuration('1hour')">
                      <mat-icon>schedule</mat-icon>
                      1 Hour
                    </button>
                    <button type="button" 
                            mat-stroked-button 
                            [class.selected]="banDuration === '24hours'"
                            (click)="setBanDuration('24hours')">
                      <mat-icon>today</mat-icon>
                      24 Hours
                    </button>
                    <button type="button" 
                            mat-stroked-button 
                            [class.selected]="banDuration === '7days'"
                            (click)="setBanDuration('7days')">
                      <mat-icon>date_range</mat-icon>
                      7 Days
                    </button>
                    <button type="button" 
                            mat-stroked-button 
                            [class.selected]="banDuration === 'custom'"
                            (click)="setBanDuration('custom')">
                      <mat-icon>schedule</mat-icon>
                      Custom Duration
                    </button>
                  </div>
                  
                  <div *ngIf="banDuration === 'custom'" class="custom-duration-section">
                    <div class="duration-input-row">
                      <mat-form-field appearance="outline" class="duration-number">
                        <mat-label>Duration</mat-label>
                        <input matInput type="number" formControlName="customDurationValue" 
                               placeholder="1" min="1" max="365">
                      </mat-form-field>
                      
                      <mat-form-field appearance="outline" class="duration-unit">
                        <mat-label>Unit</mat-label>
                        <mat-select formControlName="customDurationUnit">
                          <mat-option value="minutes">Minutes</mat-option>
                          <mat-option value="hours">Hours</mat-option>
                          <mat-option value="days">Days</mat-option>
                          <mat-option value="weeks">Weeks</mat-option>
                          <mat-option value="months">Months</mat-option>
                        </mat-select>
                      </mat-form-field>
                    </div>
                  </div>
                  
                  <div class="duration-preview" 
                       [class.warning]="isDurationInvalid()"
                       *ngIf="isDurationInvalid() || banDuration === 'permanent'">
                    <mat-icon>{{ isDurationInvalid() ? 'warning' : 'block' }}</mat-icon>
                    <span>{{ getCustomDurationPreview() }}</span>
                  </div>
                </div>
                
                <div class="checkbox-section">
                  <mat-checkbox formControlName="revokeMessages" color="primary">
                    Revoke Messages
                  </mat-checkbox>
                  <div class="help-text">Delete all messages from the user in the chat</div>
                </div>
              </div>

              <!-- Delete Message Settings -->
              <div *ngIf="nodeForm.get('actionType')?.value === 'delete_message'">
                <div class="help-section">
                  <h4>Delete Message Action</h4>
                  <p>This action will delete a message from the chat. You can specify a specific message ID or leave it empty to delete the message that triggered this flow.</p>
                </div>
                
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Message ID (Optional)</mat-label>
                  <input matInput formControlName="deleteMessageId" placeholder="Enter message ID to delete">
                  <mat-hint>Leave empty to delete the message that triggered this flow</mat-hint>
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
                          placeholder='{"message": "{user_message}"}'></textarea>
              </mat-form-field>

              <!-- New: Response Variables -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Response Variables (JSON Array)</mat-label>
                <textarea matInput formControlName="webhookResponseVariables" rows="2" 
                          placeholder='["external_id", "score"]'></textarea>
                <mat-hint>Specify the variable names to extract from the webhook response and save to the flow context.</mat-hint>
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
      <button mat-raised-button color="warn" (click)="onDelete()" [disabled]="data.isNew">Delete Node</button>
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

    .help-section {
      margin-top: 16px;
      margin-bottom: 16px;
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

    .checkbox-section {
      margin-top: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

         .checkbox-section .help-text {
       margin-top: 0;
       margin-bottom: 0;
     }

     .ban-duration-section {
       margin-bottom: 24px;
     }

     .ban-duration-section h4 {
       margin: 0 0 16px 0;
       color: #333;
       font-weight: 500;
     }

     .duration-options {
       display: flex;
       flex-wrap: wrap;
       gap: 8px;
       margin-bottom: 16px;
     }

     .duration-options button {
       min-width: 120px;
       height: 40px;
       border-radius: 20px;
       transition: all 0.2s ease;
     }

     .duration-options button.selected {
       background-color: #1976d2;
       color: white;
       border-color: #1976d2;
     }

     .duration-options button:hover:not(.selected) {
       background-color: #f5f5f5;
       border-color: #1976d2;
     }

     .duration-options button mat-icon {
       margin-right: 4px;
       font-size: 18px;
     }

           .custom-duration-section {
        margin-top: 16px;
        padding: 16px;
        background-color: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #e9ecef;
      }

      .duration-input-row {
        display: flex;
        gap: 16px;
        align-items: flex-start;
      }

      .duration-number {
        flex: 1;
        max-width: 150px;
      }

      .duration-unit {
        flex: 1;
        max-width: 200px;
      }

      .duration-preview {
        margin-top: 16px;
        padding: 12px;
        background-color: #e3f2fd;
        border-radius: 6px;
        border-left: 4px solid #1976d2;
        display: flex;
        align-items: center;
        gap: 8px;
        color: #1976d2;
        font-size: 14px;
      }

      .duration-preview.warning {
        background-color: #fff3e0;
        border-left-color: #f57c00;
        color: #e65100;
      }

             .duration-preview mat-icon {
         font-size: 18px;
       }

       .toxicity-slider-section {
         margin-bottom: 16px;
       }

       .slider-header {
         display: flex;
         align-items: center;
         justify-content: space-between;
         margin-bottom: 8px;
       }

       .slider-label {
         font-weight: 500;
         color: #333;
         margin: 0;
       }

       .sensitivity-level {
         font-size: 12px;
         font-weight: 500;
         padding: 4px 8px;
         border-radius: 12px;
         text-transform: uppercase;
       }

       .sensitivity-level.low {
         background-color: #ffebee;
         color: #c62828;
       }

       .sensitivity-level.mild {
         background-color: #fff3e0;
         color: #f57c00;
       }

       .sensitivity-level.high {
         background-color: #e8f5e8;
         color: #2e7d32;
       }

       .slider-container {
         display: flex;
         align-items: center;
         gap: 16px;
         margin-bottom: 8px;
       }

       .toxicity-slider {
         flex: 1;
         height: 6px;
         border-radius: 3px;
         background: #e0e0e0;
         outline: none;
         -webkit-appearance: none;
         appearance: none;
       }

       .toxicity-slider::-webkit-slider-thumb {
         -webkit-appearance: none;
         appearance: none;
         width: 20px;
         height: 20px;
         border-radius: 50%;
         background: #1976d2;
         cursor: pointer;
         border: 2px solid white;
         box-shadow: 0 2px 4px rgba(0,0,0,0.2);
       }

       .toxicity-slider::-moz-range-thumb {
         width: 20px;
         height: 20px;
         border-radius: 50%;
         background: #1976d2;
         cursor: pointer;
         border: 2px solid white;
         box-shadow: 0 2px 4px rgba(0,0,0,0.2);
         border: none;
       }

       .slider-value {
         min-width: 40px;
         text-align: center;
         font-weight: 500;
         color: #1976d2;
       }

       .slider-help-text {
         color: #666;
         font-size: 14px;
         margin-top: 4px;
       }
      
   `]
})
export class NodeEditorComponent implements OnInit {
  nodeForm: FormGroup;
  quickReplies: FormArray;
  banDuration: string = 'permanent';

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<NodeEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { node: NodeData, isNew: boolean }
  ) {
    this.nodeForm = this.fb.group({
      label: ['', Validators.required],
      type: ['message', Validators.required],
      content: [''],
      conditionType: ['contains'],
      conditionValue: [''],
      toxicity_sensitivity: [0.5], // New field for toxicity sensitivity
      actionType: ['set_variable'],
      variableName: [''],
      variableValue: [''],
      notifyOwnerMessage: [''], // New field
      webhookUrl: [''],
      webhookMethod: ['POST'],
      webhookHeaders: ['{}'],
      webhookBody: ['{}'],
      webhookResponseVariables: ['[]'], // New field
      inputType: ['text'],
      inputVariableName: [''],
      endMessage: [''],
             customDurationValue: [1], // New field for custom duration value
       customDurationUnit: ['hours'], // New field for custom duration unit
       revokeMessages: [false], // New field
       deleteMessageId: [''] // New field for delete message ID
    });

    this.quickReplies = this.fb.array([]);
  }

  ngOnInit() {
    this.loadNodeData();
    this.setupTypeChangeListener();
    this.setupConditionValidators();
  }

  loadNodeData() {
    const data = this.data.node?.data || {};
    this.nodeForm.patchValue({
      label: this.data.node?.label || '',
      type: data.type || 'message',
      content: data.content || '',
      conditionType: data.condition_type || 'contains',
      conditionValue: data.condition_value || '',
              toxicity_sensitivity: data.toxicity_sensitivity ?? 0.5, // Load toxicity sensitivity
      actionType: data.action_type || 'set_variable',
      variableName: '', // will be set below if action_params exists
      variableValue: '', // will be set below if action_params exists
      notifyOwnerMessage: '', // will be set below if action_params exists
      webhookUrl: data.webhook_url || '',
      webhookMethod: data.method || 'POST',
      webhookHeaders: data.headers || '{}',
      webhookBody: data.request_body || '{}',
      webhookResponseVariables: JSON.stringify(data.response_variables || []), // New field
      inputType: data.input_type || 'text',
      inputVariableName: data.variable_name || '',
             endMessage: data.content || '',
       customDurationValue: data.custom_duration_value || 1, // Load custom duration value
       customDurationUnit: data.custom_duration_unit || 'hours', // Load custom duration unit
       revokeMessages: data.revoke_messages || false // Load revokeMessages
    });

    // If condition type is toxicity, ensure toxicity_sensitivity is properly set
    if (data.condition_type === 'toxicity') {
      // Preserve existing toxicity_sensitivity if it exists, otherwise use default
      const existingToxicitySensitivity = data.toxicity_sensitivity;
      if (existingToxicitySensitivity !== null && existingToxicitySensitivity !== undefined) {
        this.nodeForm.patchValue({
          toxicity_sensitivity: existingToxicitySensitivity
        });
      } else {
        // Set default only if no existing value
        this.nodeForm.patchValue({
          toxicity_sensitivity: 0.5
        });
      }
      
      // Update this.data to reflect the toxicity condition type
      this.updateDataForToxicityCondition();
    }

    // If this is an action node with action_params, parse and set variableName/variableValue
    if (data.type === 'action' && data.action_type === 'set_variable' && data.action_params) {
      try {
        const params = JSON.parse(data.action_params);
        this.nodeForm.patchValue({
          variableName: params.variable || '',
          variableValue: params.value || ''
        });
      } catch (e) {
        // If parsing fails, leave as empty
      }
    }

    // If this is an action node with action_params, parse and set notifyOwnerMessage
    if (data.type === 'action' && data.action_type === 'notify_owner' && data.action_params) {
      try {
        const params = JSON.parse(data.action_params);
        this.nodeForm.patchValue({
          notifyOwnerMessage: params.message || ''
        });
      } catch (e) {
        // If parsing fails, leave as empty
      }
    }

         // If this is an action node with action_params, parse and set custom duration and revokeMessages
     if (data.type === 'action' && data.action_type === 'ban_chat_member' && data.action_params) {
       try {
         const params = JSON.parse(data.action_params);
         this.nodeForm.patchValue({
           customDurationValue: params.custom_duration_value || 1,
           customDurationUnit: params.custom_duration_unit || 'hours',
           revokeMessages: params.revoke_messages || false
         });
         
         // Set ban duration based on existing data
         if (params.custom_duration_value && params.custom_duration_unit) {
           // Check if it matches predefined durations
           if (params.custom_duration_value === 1 && params.custom_duration_unit === 'hours') {
             this.banDuration = '1hour';
           } else if (params.custom_duration_value === 24 && params.custom_duration_unit === 'hours') {
             this.banDuration = '24hours';
           } else if (params.custom_duration_value === 7 && params.custom_duration_unit === 'days') {
             this.banDuration = '7days';
           } else {
             this.banDuration = 'custom';
           }
         } else {
           this.banDuration = 'permanent';
         }
       } catch (e) {
         // If parsing fails, leave as empty
       }
     }

    // If this is an action node with action_params, parse and set deleteMessageId
    if (data.type === 'action' && data.action_type === 'delete_message' && data.action_params) {
      try {
        const params = JSON.parse(data.action_params);
        this.nodeForm.patchValue({
          deleteMessageId: params.message_id || ''
        });
      } catch (e) {
        // If parsing fails, leave as empty
      }
    }

    // Load quick replies
    if (data.quick_replies && Array.isArray(data.quick_replies)) {
      data.quick_replies.forEach((reply: string) => {
        this.quickReplies.push(new FormControl(reply));
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
      this.quickReplies = this.fb.array([]);
    }
    
    if (type !== 'condition') {
      this.nodeForm.patchValue({
        conditionType: 'contains',
        conditionValue: '',
        toxicity_sensitivity: 0.5
      });
    }
    
    if (type !== 'action') {
      this.nodeForm.patchValue({
        actionType: 'set_variable',
        variableName: '',
        variableValue: '',
                 notifyOwnerMessage: '', // Reset new field
         customDurationValue: 1, // Reset new field
         customDurationUnit: 'hours', // Reset new field
         revokeMessages: false, // Reset new field
         deleteMessageId: '' // Reset new field
      });
    }
    
    if (type !== 'webhook') {
      this.nodeForm.patchValue({
        webhookUrl: '',
        webhookMethod: 'POST',
        webhookHeaders: '{}',
        webhookBody: '{}',
        webhookResponseVariables: '[]' // Reset new field
      });
    }
    
    if (type !== 'input') {
      this.nodeForm.patchValue({
        inputType: 'text',
        inputVariableName: '',
      });
    }
    
    if (type !== 'end') {
      this.nodeForm.patchValue({
        endMessage: ''
      });
    }
  }

     setupConditionValidators() {
     // Listen for type changes to apply validators dynamically
     this.nodeForm.get('type')?.valueChanges.subscribe(type => {
       if (type === 'condition') {
         this.nodeForm.get('conditionType')?.setValidators([Validators.required]);
         // Remove required validator for conditionValue - it's now optional
         this.nodeForm.get('conditionValue')?.clearValidators();
       } else {
         this.nodeForm.get('conditionType')?.clearValidators();
         this.nodeForm.get('conditionValue')?.clearValidators();
       }
       this.nodeForm.get('conditionType')?.updateValueAndValidity();
       this.nodeForm.get('conditionValue')?.updateValueAndValidity();
     });

     // Listen for condition type changes to set default values and adjust validators
     this.nodeForm.get('conditionType')?.valueChanges.subscribe(conditionType => {
       if (conditionType === 'toxicity') {
         // Only set default toxicity_sensitivity if it's not already set
         const currentToxicitySensitivity = this.nodeForm.get('toxicity_sensitivity')?.value;
         if (currentToxicitySensitivity === null || currentToxicitySensitivity === undefined) {
           this.nodeForm.patchValue({ toxicity_sensitivity: 0.5 });
         }
         // For toxicity, we don't need conditionValue, so clear its validators
         this.nodeForm.get('conditionValue')?.clearValidators();
         this.nodeForm.get('conditionValue')?.updateValueAndValidity();
         
         // Update this.data to reflect the toxicity condition type
         this.updateDataForToxicityCondition();
       } else {
         // For other condition types, conditionValue is now optional
         this.nodeForm.get('conditionValue')?.clearValidators();
         this.nodeForm.get('conditionValue')?.updateValueAndValidity();
       }
     });
    
    // Listen for action type changes to apply validators for ban_chat_member
    this.nodeForm.get('actionType')?.valueChanges.subscribe(actionType => {
      if (actionType === 'ban_chat_member') {
        this.nodeForm.get('customDurationValue')?.setValidators([Validators.required, Validators.min(1), Validators.max(365)]);
        this.nodeForm.get('customDurationUnit')?.setValidators([Validators.required]);
      } else {
        this.nodeForm.get('customDurationValue')?.clearValidators();
        this.nodeForm.get('customDurationUnit')?.clearValidators();
      }
      this.nodeForm.get('customDurationValue')?.updateValueAndValidity();
      this.nodeForm.get('customDurationUnit')?.updateValueAndValidity();
    });
    
    // Also run once on init
    if (this.nodeForm.get('type')?.value === 'condition') {
      this.nodeForm.get('conditionType')?.setValidators([Validators.required]);
      // conditionValue is optional for all condition types
      this.nodeForm.get('conditionValue')?.clearValidators();
    } else {
      this.nodeForm.get('conditionType')?.clearValidators();
      this.nodeForm.get('conditionValue')?.clearValidators();
    }
    this.nodeForm.get('conditionType')?.updateValueAndValidity();
    this.nodeForm.get('conditionValue')?.updateValueAndValidity();
    
    // Also run once for action type
    if (this.nodeForm.get('actionType')?.value === 'ban_chat_member') {
      this.nodeForm.get('customDurationValue')?.setValidators([Validators.required, Validators.min(1), Validators.max(365)]);
      this.nodeForm.get('customDurationUnit')?.setValidators([Validators.required]);
    } else {
      this.nodeForm.get('customDurationValue')?.clearValidators();
      this.nodeForm.get('customDurationUnit')?.clearValidators();
    }
    this.nodeForm.get('customDurationValue')?.updateValueAndValidity();
    this.nodeForm.get('customDurationUnit')?.updateValueAndValidity();
  }

  addQuickReply() {
    this.quickReplies.push(new FormControl(''));
    // Force change detection
    this.cdr.detectChanges();
  }

  removeQuickReply(index: number) {
    if (index >= 0 && index < this.quickReplies.length) {
      this.quickReplies.removeAt(index);
      // Force change detection
      this.cdr.detectChanges();
    }
  }

  getQuickReplyControls() {
    return (this.quickReplies.controls as FormControl[]);
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
          const quickRepliesArray = this.quickReplies.value.filter((reply: any) => reply.trim());
          if (quickRepliesArray.length > 0) {
            nodeData.quick_replies = quickRepliesArray;
          }
          break;
        case 'condition':
          // Always include both fields, even if empty (should be validated)
          nodeData.condition_type = formValue.conditionType;
          nodeData.condition_value = formValue.conditionValue;
          // Add toxicity_sensitivity for toxicity condition type
          if (formValue.conditionType === 'toxicity') {
            nodeData.toxicity_sensitivity = formValue.toxicity_sensitivity;
          }
          break;
        case 'action':
          nodeData.action_type = formValue.actionType;
          if (formValue.actionType === 'set_variable') {
            nodeData.action_params = JSON.stringify({
              variable: formValue.variableName,
              value: formValue.variableValue
            });
          }
          // New: notify_owner
          if (formValue.actionType === 'notify_owner') {
            nodeData.action_params = JSON.stringify({
              message: formValue.notifyOwnerMessage
            });
          }
                     // New: ban_chat_member
           if (formValue.actionType === 'ban_chat_member') {
             nodeData.action_params = JSON.stringify({
               custom_duration_value: this.banDuration === 'permanent' ? null : formValue.customDurationValue,
               custom_duration_unit: this.banDuration === 'permanent' ? null : formValue.customDurationUnit,
               revoke_messages: formValue.revokeMessages
             });
           }
           // New: delete_message
           if (formValue.actionType === 'delete_message') {
             // If deleteMessageId is empty or null, don't include message_id in params
             // This will make the backend use trigger_message_id
             const messageId = formValue.deleteMessageId?.trim();
             if (messageId) {
               nodeData.action_params = JSON.stringify({
                 message_id: messageId
               });
             } else {
               nodeData.action_params = JSON.stringify({});
             }
           }
          break;
        case 'webhook':
          nodeData.webhook_url = formValue.webhookUrl;
          nodeData.method = formValue.webhookMethod;
          nodeData.headers = formValue.webhookHeaders;
          nodeData.request_body = formValue.webhookBody;
          // New: Parse and save response_variables
          try {
            nodeData.response_variables = JSON.parse(formValue.webhookResponseVariables);
          } catch {
            nodeData.response_variables = [];
          }
          break;
        case 'input':
          nodeData.input_type = formValue.inputType;
          nodeData.variable_name = formValue.inputVariableName;
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

  onDelete() {
    this.dialogRef.close({ delete: true });
  }

  isCreateMode(): boolean {
    // Disable delete if this is a new node (not yet persisted)
    return !!this.data.isNew;
  }

  setBanDuration(duration: string) {
    this.banDuration = duration;
    
    if (duration === 'permanent') {
      // No need to set any values for permanent ban
      // Clear validators for custom duration fields
      this.nodeForm.get('customDurationValue')?.clearValidators();
      this.nodeForm.get('customDurationUnit')?.clearValidators();
    } else if (duration === '1hour') {
      this.nodeForm.patchValue({ 
        customDurationValue: 1,
        customDurationUnit: 'hours'
      });
      // Clear validators since we're using predefined values
      this.nodeForm.get('customDurationValue')?.clearValidators();
      this.nodeForm.get('customDurationUnit')?.clearValidators();
    } else if (duration === '24hours') {
      this.nodeForm.patchValue({ 
        customDurationValue: 24,
        customDurationUnit: 'hours'
      });
      // Clear validators since we're using predefined values
      this.nodeForm.get('customDurationValue')?.clearValidators();
      this.nodeForm.get('customDurationUnit')?.clearValidators();
    } else if (duration === '7days') {
      this.nodeForm.patchValue({ 
        customDurationValue: 7,
        customDurationUnit: 'days'
      });
      // Clear validators since we're using predefined values
      this.nodeForm.get('customDurationValue')?.clearValidators();
      this.nodeForm.get('customDurationUnit')?.clearValidators();
    } else if (duration === 'custom') {
      // Keep existing values for custom duration
      // The user can modify them through the form controls
      // Set validators for custom duration fields
      this.nodeForm.get('customDurationValue')?.setValidators([Validators.required, Validators.min(1), Validators.max(365)]);
      this.nodeForm.get('customDurationUnit')?.setValidators([Validators.required]);
    }
    
    // Update validity
    this.nodeForm.get('customDurationValue')?.updateValueAndValidity();
    this.nodeForm.get('customDurationUnit')?.updateValueAndValidity();
  }

  getCustomDurationPreview(): string {
    if (this.banDuration === 'permanent') {
      return 'Never (Permanent Ban)';
    }
    
    const value = this.nodeForm.get('customDurationValue')?.value;
    const unit = this.nodeForm.get('customDurationUnit')?.value;
    
    if (!value || !unit) {
      return '';
    }
    
    const totalMinutes = this.calculateTotalMinutes(value, unit);
    if (totalMinutes < 0.5) {
      return 'Duration too short - will result in permanent ban';
    }
    if (totalMinutes >= 525600) {
      return 'Duration too long - will result in permanent ban';
    }
    
    return '';
  }

  private calculateTotalMinutes(value: number, unit: string): number {
    switch (unit) {
      case 'minutes': return value;
      case 'hours': return value * 60;
      case 'days': return value * 24 * 60;
      case 'weeks': return value * 7 * 24 * 60;
      case 'months': return value * 30 * 24 * 60;
      default: return 0;
    }
  }

     isDurationInvalid(): boolean {
     if (this.banDuration === 'permanent') {
       return false;
     }
     
     const value = this.nodeForm.get('customDurationValue')?.value;
     const unit = this.nodeForm.get('customDurationUnit')?.value;
     
     if (!value || !unit) {
       return false;
     }
     
     const totalMinutes = this.calculateTotalMinutes(value, unit);
     return totalMinutes < 0.5 || totalMinutes >= 525600;
   }

   onToxicitySliderChange(event: any) {
     const value = event.target.value;
     // Convert slider value (0-100) to decimal (0.0-1.0)
     const decimalValue = value / 100;
     this.nodeForm.patchValue({ toxicity_sensitivity: decimalValue });
     
     // Update this.data to reflect the new toxicity sensitivity
     this.updateDataForToxicityCondition();
   }

   getSensitivityLevel(): string {
     const value = this.nodeForm.get('toxicity_sensitivity')?.value ?? 0.5;
     
     if (value <= 1/3) {
       return 'low';
     } else if (value <= 2/3) {
       return 'mild';
     } else {
       return 'high';
     }
   }

   private updateDataForToxicityCondition() {
     // Update this.data to reflect that this is a toxicity condition
     if (this.data.node && this.data.node.data) {
       this.data.node.data.condition_type = 'toxicity';
       this.data.node.data.toxicity_sensitivity = this.nodeForm.get('toxicity_sensitivity')?.value ?? 0.5;
     }
   }
} 