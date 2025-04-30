# Node Google Sheets ORM

A simple and intuitive ORM (Object-Relational Mapping) library for Google Sheets, allowing you to interact with Google Sheets as if they were database tables.

## Features

- Easy-to-use ORM interface for Google Sheets
- Support for data types (String, Number)
- Relationship mapping (One-to-One)
- Async/await support
- Type validation

## Installation

```bash
npm install node-googlesheets-orm
```

## Prerequisites

1. A Google Cloud Project
2. Service Account credentials with Google Sheets API access
3. A Google Spreadsheet with edit permissions granted to the service account

## Getting Started

### 1. Set up Service Account Authentication

First, you'll need to set up authentication using a service account:

```javascript
const { JWT } = require('google-auth-library');
const serviceAccountAuth = new JWT({
    email: 'your-service-account-email@your-project.iam.gserviceaccount.com',
    key: 'your-private-key',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
```

### 2. Initialize SheetORM

```javascript
const SheetORM = require('node-googlesheets-orm');

const sheet = new SheetORM({
    sheetId: 'your-google-sheet-id',
    serviceAccount: serviceAccountAuth
});

await sheet.init();
```

### 3. Define Models

Models represent sheets in your Google Spreadsheet. Each model maps to a specific sheet.

```javascript
const DATATYPES = require('node-googlesheets-orm/lib/data-types');

const Employee = sheet.defineModel({
    id: {
        type: DATATYPES.NUMBER
    },
    name: {
        type: DATATYPES.STRING
    }
}, {
    name: 'employees' // This should match your sheet name
});

const Role = sheet.defineModel({
    id: {
        type: DATATYPES.NUMBER
    },
    role: {
        type: DATATYPES.STRING
    }
}, {
    name: 'roles' // This should match your sheet name
});
```

### 4. Define Relationships

You can define relationships between your models:

```javascript
// Define a one-to-one relationship between Employee and Role
Employee.oneToOne(Role);
```

### 5. Query Data

```javascript
// Fetch all employees
const allEmployees = await Employee.findAll();
console.log(allEmployees);

// Access related data
console.log(allEmployees[0].roles); // Access the related role for the first employee
```

## Data Types

The library supports the following data types:
- `DATATYPES.STRING`: For text values
- `DATATYPES.NUMBER`: For numeric values

## API Reference

### SheetORM Class

#### Constructor
```javascript
new SheetORM({
    sheetId: string,
    serviceAccount: JWT
})
```

#### Methods
- `init()`: Initializes the connection to the Google Sheet
- `defineModel(modelDefinition, modelOptions)`: Defines a new model

### Model Methods

- `findAll()`: Retrieves all records for the model
- `oneToOne(relatedModel)`: Defines a one-to-one relationship with another model

## Error Handling

The library includes validation and error handling for:
- Missing or invalid sheet IDs
- Missing or invalid service account credentials
- Non-existent sheet names
- Invalid data types

## Limitations

- Currently supports only STRING and NUMBER data types
- One-to-One relationships only
- Sheets must exist in the Google Spreadsheet before defining models

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[Add your license information here]