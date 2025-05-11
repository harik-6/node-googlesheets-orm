# Node Google Sheets ORM

A simple and intuitive ORM (Object-Relational Mapping) library for Google Sheets, allowing you to interact with Google Sheets as if they were database tables.

## Features

- Easy-to-use ORM interface for Google Sheets
- Support for data types (String, Number)
- Async/await support
- Type validation
- Built-in validators for data integrity
- Automatic sheet creation for new models

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

const sheet = async new SheetORM({
    sheetId: 'your-google-sheet-id',
    serviceAccount: serviceAccountAuth
});

await sheet.init();
```

### 3. Define Models

Models represent sheets in your Google Spreadsheet. Each model maps to a specific sheet. If a sheet with the specified name doesn't exist, it will be automatically created.

```javascript
const DATATYPES = require('node-googlesheets-orm/lib/data-types');

const Employee = sheet.defineModel({
    id: {
        type: DATATYPES.NUMBER,
        validate: {
            notNull: true,
            isNumeric: true
        }
    },
    name: {
        type: DATATYPES.STRING,
        validate: {
            notNull: true,
            len: [2, 50] // Length between 2 and 50 characters
        }
    },
    email: {
        type: DATATYPES.STRING,
        validate: {
            isEmail: true
        }
    }
}, {
    name: 'employees' // If 'employees' sheet doesn't exist, it will be created automatically
});
```

### 4. Query Data

```javascript
// Fetch all employees
const allEmployees = await Employee.findAll();
console.log(allEmployees);
```

## Data Types

The library supports the following data types:
- `DATATYPES.STRING`: For text values
- `DATATYPES.NUMBER`: For numeric values

## Validators

The library provides several built-in validators to ensure data integrity:

- `notNull`: Ensures the field cannot be null or empty
- `isNumeric`: Validates that the value is numeric
- `isEmail`: Validates that the value is a valid email address
- `isAlphanumeric`: Validates that the value contains only letters and numbers
- `len`: Validates the length of a string (takes an array with min and max values)

Example usage of validators:
```javascript
{
    fieldName: {
        type: DATATYPES.STRING,
        validate: {
            notNull: true,
            isEmail: true,
            len: [5, 100]
        }
    }
}
```

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

## Error Handling

The library includes validation and error handling for:
- Missing or invalid sheet IDs
- Missing or invalid service account credentials
- Non-existent sheet names
- Invalid data types
- Validation errors for fields

## Limitations

- Currently supports only STRING and NUMBER data types

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
