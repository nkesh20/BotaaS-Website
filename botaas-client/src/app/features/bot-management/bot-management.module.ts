import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';

import { BotEditorComponent } from './components/bot-editor/bot-editor.component';
import { FlowBuilderComponent } from './components/flow-builder/flow-builder.component';

@NgModule({
  declarations: [
    BotEditorComponent,
    FlowBuilderComponent,
    // MessageTemplatesComponent,
    // BotAnalyticsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    NgxGraphModule,
    DragDropModule,
    MatIconModule
  ],
  exports: [
    BotEditorComponent,
    FlowBuilderComponent,
    // MessageTemplatesComponent,
    // BotAnalyticsComponent
  ]
})
export class BotManagementModule { } 