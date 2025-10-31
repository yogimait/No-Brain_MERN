# Postman Testing Guide

## Prerequisites
- Server is running on `http://localhost:3000`
- MongoDB is connected
- Postman installed

---

## Step 1: Create a Workflow (POST /api/workflows)

### Request Setup:
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/workflows`
- **Headers:**
  - `Content-Type: application/json`
- **Body:** (Select `raw` and `JSON`)

### Example Request Body:

```json
{
  "name": "My First Workflow",
  "graph": {
    "nodes": [
      {
        "id": "node1",
        "type": "input",
        "data": {
          "label": "Start Node"
        },
        "position": {
          "x": 100,
          "y": 100
        }
      },
      {
        "id": "node2",
        "type": "process",
        "data": {
          "label": "Process Node"
        },
        "position": {
          "x": 300,
          "y": 100
        }
      }
    ],
    "edges": [
      {
        "id": "edge1",
        "source": "node1",
        "target": "node2"
      }
    ]
  },
  "ownerId": "507f1f77bcf86cd799439011",
  "isPublic": false,
  "description": "A simple test workflow"
}
```

**Note:** Replace `ownerId` with a valid MongoDB ObjectId. For testing, you can use any 24-character hex string like `507f1f77bcf86cd799439011`.

### Expected Response:
```json
{
  "statusCode": 201,
  "data": {
    "_id": "...",
    "name": "My First Workflow",
    "graph": { ... },
    "ownerId": "507f1f77bcf86cd799439011",
    "isPublic": false,
    "description": "A simple test workflow",
    "createdAt": "...",
    "updatedAt": "..."
  },
  "message": "Workflow created successfully",
  "success": true
}
```

**Save the `_id` from this response - you'll need it for other requests!**

---

## Step 2: Get All Workflows (GET /api/workflows)

### Request Setup:
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/workflows`

### Query Parameters (Optional):
- `ownerId` - Filter by owner
- `isPublic` - Filter public templates (`true` or `false`)
- `search` - Search by name or description

### Example with Query Parameters:
```
http://localhost:3000/api/workflows?ownerId=507f1f77bcf86cd799439011&search=First
```

---

## Step 3: Get Workflow by ID (GET /api/workflows/:id)

### Request Setup:
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/workflows/{workflowId}`

Replace `{workflowId}` with the `_id` from Step 1.

### Example:
```
http://localhost:3000/api/workflows/507f1f77bcf86cd799439011
```

---

## Step 4: Update a Workflow (PUT /api/workflows/:id)

### Request Setup:
- **Method:** `PUT`
- **URL:** `http://localhost:3000/api/workflows/{workflowId}`
- **Headers:**
  - `Content-Type: application/json`
- **Body:** (Select `raw` and `JSON`)

### Example Request Body:
```json
{
  "name": "Updated Workflow Name",
  "description": "Updated description"
}
```

You can update any combination of: `name`, `graph`, `isPublic`, `description`

---

## Step 5: Create an Execution Log (POST /api/executions)

### Request Setup:
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/executions`
- **Headers:**
  - `Content-Type: application/json`
- **Body:** (Select `raw` and `JSON`)

### Example Request Body:
```json
{
  "workflowId": "507f1f77bcf86cd799439011",
  "status": "completed",
  "nodeLogs": [
    {
      "nodeId": "node1",
      "nodeName": "Start Node",
      "status": "completed",
      "input": {
        "data": "test input"
      },
      "output": {
        "result": "success"
      },
      "startTime": "2024-01-01T10:00:00.000Z",
      "endTime": "2024-01-01T10:00:05.000Z"
    },
    {
      "nodeId": "node2",
      "nodeName": "Process Node",
      "status": "completed",
      "input": {
        "data": "test input"
      },
      "output": {
        "result": "processed"
      },
      "startTime": "2024-01-01T10:00:05.000Z",
      "endTime": "2024-01-01T10:00:10.000Z"
    }
  ],
  "duration": 10000
}
```

**Important:** Replace `workflowId` with the actual workflow ID from Step 1.

### Expected Response:
```json
{
  "statusCode": 201,
  "data": {
    "_id": "...",
    "runId": "run_1234567890_abc123",
    "workflowId": "507f1f77bcf86cd799439011",
    "status": "completed",
    "nodeLogs": [ ... ],
    "duration": 10000,
    ...
  },
  "message": "Execution log created successfully",
  "success": true
}
```

**Save the `runId` from this response!**

---

## Step 6: Get Executions by Workflow (GET /api/executions/workflow/:workflowId)

### Request Setup:
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/executions/workflow/{workflowId}`

### Query Parameters (Optional):
- `limit` - Number of results (default: 50)
- `skip` - Number to skip for pagination (default: 0)

### Example:
```
http://localhost:3000/api/executions/workflow/507f1f77bcf86cd799439011?limit=10&skip=0
```

---

## Step 7: Get Execution by Run ID (GET /api/executions/:runId)

### Request Setup:
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/executions/{runId}`

Replace `{runId}` with the runId from Step 5.

### Example:
```
http://localhost:3000/api/executions/run_1234567890_abc123
```

---

## Step 8: Update Execution Status (PUT /api/executions/:runId)

### Request Setup:
- **Method:** `PUT`
- **URL:** `http://localhost:3000/api/executions/{runId}`
- **Headers:**
  - `Content-Type: application/json`
- **Body:** (Select `raw` and `JSON`)

### Example Request Body:
```json
{
  "status": "running",
  "duration": 5000
}
```

Or update node logs:
```json
{
  "status": "completed",
  "nodeLogs": [
    {
      "nodeId": "node1",
      "nodeName": "Start Node",
      "status": "completed",
      "input": {},
      "output": {},
      "startTime": "2024-01-01T10:00:00.000Z",
      "endTime": "2024-01-01T10:00:05.000Z"
    }
  ],
  "duration": 5000
}
```

---

## Step 9: Search Workflows (GET /api/workflows/search)

### Request Setup:
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/workflows/search?q=searchterm`

### Example:
```
http://localhost:3000/api/workflows/search?q=First
```

---

## Step 10: Get Public Templates (GET /api/workflows/templates)

### Request Setup:
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/workflows/templates`

---

## Step 11: Delete a Workflow (DELETE /api/workflows/:id)

### Request Setup:
- **Method:** `DELETE`
- **URL:** `http://localhost:3000/api/workflows/{workflowId}`

---

## Common Issues & Solutions

### Issue 1: "Workflow not found" (404)
- **Solution:** Make sure you're using a valid MongoDB ObjectId (24 hex characters)

### Issue 2: "Validation Error"
- **Solution:** Check that all required fields are present and match the schema

### Issue 3: "Invalid ID format"
- **Solution:** Ensure ObjectIds are exactly 24 hexadecimal characters

### Issue 4: CORS Error
- **Solution:** Check your `.env` file has `CORS_ORIGIN` set correctly

---

## Quick Test Workflow ID Generator

For testing, you can generate a valid MongoDB ObjectId format:
- Use: `507f1f77bcf86cd799439011` (valid format)
- Or generate one online: https://observablehq.com/@hugodf/mongodb-objectid-generator

