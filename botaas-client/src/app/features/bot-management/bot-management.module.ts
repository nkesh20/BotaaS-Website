import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { BotEditorComponent } from './components/bot-editor/bot-editor.component';
import { FlowBuilderComponent } from './components/flow-builder/flow-builder.component';
import { BroadcastComponent } from './components/broadcast.component';

@NgModule({
  declarations: [
    BotEditorComponent,
    FlowBuilderComponent,
    // MessageTemplatesComponent,
    // BotAnalyticsComponent,
    BroadcastComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    NgxGraphModule,
    DragDropModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  exports: [
    BotEditorComponent,
    FlowBuilderComponent,
    // MessageTemplatesComponent,
    // BotAnalyticsComponent,
    BroadcastComponent
  ]
})
export class BotManagementModule { } 