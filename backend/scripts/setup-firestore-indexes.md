# Firestore Index Setup Guide

## Overview
This document provides instructions for setting up the required Firestore indexes for the Dental Website application.

## Required Indexes

### 1. Products Collection Index
**Purpose**: Enable efficient querying of products with filtering and sorting

**Fields to index**:
- `createdAt` (Ascending)
- `stock` (Ascending)
- `__name__` (Ascending)

**Direct Link**: 
```
https://console.firebase.google.com/v1/r/project/dental-kit-41955/firestore/indexes?create_composite=ClFwcm9qZWN0cy9kZW50YWwta2l0LTQxOTU1L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9wcm9kdWN0cy9pbmRleGVzL18QARoNCgljcmVhdGVkQXQQAhoJCgVzdG9jaxACGgwKCF9fbmFtZV9fEAI
```

### 2. Orders Collection Index
**Purpose**: Enable efficient querying of user orders with sorting

**Fields to index**:
- `userId` (Ascending)
- `createdAt` (Descending)
- `__name__` (Ascending)

**Direct Link**:
```
https://console.firebase.google.com/v1/r/project/dental-kit-41955/firestore/indexes?create_composite=Ck9wcm9qZWN0cy9kZW50YWwta2l0LTQxOTU1L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9vcmRlcnMvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg
```

## Manual Setup Steps

### Option 1: Using Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/project/dental-kit-41955/firestore/indexes)
2. Click "Create Index"
3. For each index:
   - Select the collection name
   - Add the required fields with their order
   - Set query scope to "Collection"
   - Click "Create"

### Option 2: Using Direct Links
1. Click the direct links provided above
2. Review the index configuration
3. Click "Create Index"

### Option 3: Programmatic Creation
Run the script: `node scripts/create-indexes.js`

## Current Status
✅ **RESOLVED**: The application has been modified to work without requiring complex composite indexes by:
- Moving complex filtering to memory-based operations
- Using simple equality filters in Firestore queries
- Applying sorting and range filters in JavaScript

## Performance Considerations
- The current solution works well for small to medium datasets
- For large datasets (>10,000 documents), consider creating the composite indexes
- Monitor query performance and adjust as needed

## Troubleshooting
If you encounter index-related errors:
1. Check the Firebase Console for index status
2. Wait for indexes to finish building (can take several minutes)
3. Verify the index configuration matches the query requirements
4. Consider using the simplified query approach implemented in the code
