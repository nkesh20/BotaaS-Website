# Flow Management Features

## Overview
This document describes the new flow management features that have been implemented to address the issues with Telegram bot conversation flow management.

## New Features

### 1. Visual Flow Overview
- **Component**: `FlowListComponent`
- **Location**: `/bots/:botId/flows`
- **Features**:
  - Displays all flows for a bot in a card-based layout
  - Shows flow status (active/inactive, default)
  - Displays flow statistics (number of nodes, connections)
  - Provides flow preview showing the first few nodes
  - Empty state with call-to-action when no flows exist

### 2. Set Default Flow Functionality
- **Backend Endpoint**: `POST /flows/{bot_id}/{flow_id}/set-default`
- **Frontend Method**: `BotService.setFlowAsDefault()`
- **Features**:
  - Button in flow list to set any flow as default
  - Button in flow builder to set current flow as default
  - Visual indicator for default flows (star icon, special styling)
  - Only one flow can be default at a time

### 3. Enhanced Flow Builder
- **New Features**:
  - "Back to Flows" button to return to flow list
  - "Set as Default" button for existing flows
  - Better error handling for flow loading
  - Automatic default flow creation when none exists

### 4. Database Improvements
- **Auto-creation**: Default welcome flow is created automatically when no flows exist
- **Data validation**: Ensures flows have required structure (nodes, edges arrays)
- **Default flow management**: Proper handling of `is_default` flag

## Usage

### Viewing Flows
1. Navigate to a bot's detail page
2. Click "Manage Flows" or "Flows" button
3. View all flows in the visual overview

### Setting Default Flow
1. In the flow list, click "Set Default" on any flow
2. Or in the flow builder, click "Set as Default" button
3. The selected flow becomes the default and will be triggered for new conversations

### Creating New Flows
1. Click "Create New Flow" in the flow list
2. Use the flow builder to design your conversation flow
3. Save the flow and optionally set it as default

## Technical Implementation

### Backend Changes
- Added `set_flow_as_default` endpoint in `flows.py`
- Enhanced flow retrieval with auto-creation of default flows
- Improved error handling and data validation

### Frontend Changes
- Created new `FlowListComponent` for visual flow overview
- Updated routing to show flow list instead of builder directly
- Added `setFlowAsDefault` method to `BotService`
- Enhanced flow builder with navigation and default flow functionality

### Database Schema
- Uses existing `flows` table with `is_default` boolean field
- Proper relationships between flows and bots
- JSON storage for nodes, edges, triggers, and variables

## Error Handling
- Graceful handling of missing flows
- Automatic creation of default flows when none exist
- User-friendly error messages
- Loading states and empty states

## Future Enhancements
- Flow templates for common conversation patterns
- Flow import/export functionality
- Flow versioning and history
- Advanced flow analytics and metrics 