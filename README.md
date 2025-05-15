# Node Google Sheets ORM

A simple and intuitive ORM (Object-Relational Mapping) library for Google Sheets, allowing you to interact with Google Sheets as if they were database tables.

## Features

- Easy-to-use ORM interface for Google Sheets
- Support for data types (String, Number)
- Async/await support
- Type validation
- Built-in validators for data integrity
- Automatic sheet creation for new models
- Row-based CRUD operations with automatic ID management

## Installation

```bash
npm install node-googlesheets-orm
```

## Prerequisites

1. A Google Cloud Project
2. Service Account credentials with Google Sheets API access
3. A Google Spreadsheet with edit permissions granted to the service account

### Setting Up Google Service Account (Required)

Before using this library, you need to:

1. **Create a Google Cloud Project**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google Sheets API for your project:
     - Navigate to "APIs & Services" > "Library"
     - Search for "Google Sheets API" and enable it

2. **Create a Service Account**:
   - In your Google Cloud Project, go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Enter a name and description for your service account
   - Grant the service account the "Editor" role for Google Sheets
   - Click "Create Key" and select JSON format
   - Save the downloaded JSON file securely - you'll need this for authentication

3. **Share Your Google Sheet with the Service Account**:
   - Open the Google Sheet you want to use with this library
   - Click the "Share" button in the top-right corner
   - Enter the service account email address (found in the JSON file, looks like: `name@project-id.iam.gserviceaccount.com`)
   - Make sure to give "Editor" access
   - Click "Send" (no notification will be sent)

For more detailed instructions, check out these resources:
- [Google's official guide to creating service accounts](https://cloud.google.com/iam/docs/creating-managing-service-accounts)
- [Google Sheets API documentation](https://developers.google.com/sheets/api/guides/concepts)
- [Tutorial: Using Service Accounts with Google Sheets](https://developers.google.com/identity/protocols/oauth2/service-account)

## Getting Started

### 1. Set up Service Account Authentication

First, you'll need to set up authentication using the service account credentials you downloaded:

```javascript
// Method 1: Using the service account JSON file directly
const { JWT } = require('google-auth-library');
const credentials = require('./path-to-your-service-account-credentials.json');
const serviceAccountAuth = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Method 2: Providing credentials manually
// const { JWT } = require('google-auth-library');
// const serviceAccountAuth = new JWT({
//     email: 'your-service-account-email@your-project.iam.gserviceaccount.com',
//     key: 'your-private-key',
//     scopes: ['https://www.googleapis.com/auth/spreadsheets'],
// });
```

### 2. Initialize SheetORM

```javascript
const SheetORM = require('node-googlesheets-orm');

const sheet = new SheetORM({
    sheetId: 'your-google-sheet-id', // See below for how to find your Sheet ID
    serviceAccount: serviceAccountAuth
});

await sheet.init();
```

#### Finding Your Google Sheet ID

The Google Sheet ID is a long string of letters, numbers, and symbols found in the URL of your Google Sheet. For example, in the URL:

```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0
```

The Sheet ID is: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

### 3. Define Models

Models represent sheets in your Google Spreadsheet. Each model maps to a specific sheet. If a sheet with the specified name doesn't exist, it will be automatically created.

```javascript
const DATATYPES = require('node-googlesheets-orm/lib/data-types');

const Employee = await sheet.defineModel({
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
    },
    salary: {
        type: DATATYPES.NUMBER,
        validate: {
            isNumeric: true
        }
    }
}, {
    name: 'employees' // If 'employees' sheet doesn't exist, it will be created automatically
});
```

### 4. CRUD Operations

#### Create Records

```javascript
// Create a new employee
const newEmployee = await Employee.create({
    name: 'John Doe',
    email: 'john.doe@example.com',
    salary: 75000
});

console.log(newEmployee); // Contains the created record with _id field
```

#### Read Records

```javascript
// Fetch all employees
const allEmployees = await Employee.findAll();
console.log(allEmployees);

// Find employee by ID (row number)
const employee = await Employee.findById(3);
console.log(employee);
```

#### Update Records

Note: The `_id` field (which is the row number) is required for updates.

```javascript
// Update an employee
const updatedEmployee = await Employee.update({
    _id: 3, // Required - this is the row number in the sheet
    name: 'John Smith',
    salary: 80000
});

console.log(updatedEmployee);
```

#### Row Number as ID

The library automatically uses the row number as the unique identifier (`_id`) for each record. This `_id` is required when updating records and can be used to find specific records.

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
- `findById(id)`: Retrieves a specific record by its row number
- `create(data)`: Creates a new record
- `update(data)`: Updates an existing record (requires `_id` field)

## Error Handling

The library includes validation and error handling for:
- Missing or invalid sheet IDs
- Missing or invalid service account credentials
- Non-existent sheet names
- Invalid data types
- Validation errors for fields

## Limitations

- Currently supports only STRING and NUMBER data types
- Uses row numbers as IDs, which may change if rows are deleted or reordered in the sheet directly

## Troubleshooting

### Common Service Account Issues

1. **"The caller does not have permission" error**:
   - Make sure you've shared your Google Sheet with the service account email
   - Verify the service account has "Editor" access to the sheet
   - Check that the Google Sheets API is enabled in your Google Cloud Project

2. **Authentication errors**:
   - Ensure your service account key file is correctly formatted and complete
   - Check that the `private_key` includes all line breaks and is properly escaped
   - Verify that your service account has the correct scopes enabled

3. **"Sheet not found" error**:
   - Double-check your Sheet ID for typos
   - Make sure the sheet exists and is accessible to the service account
   - Try opening the sheet in an incognito window while logged in as the service account (if possible)

4. **API Quota Issues**:
   - Google Sheets API has usage limits. Check your [Google Cloud Console](https://console.cloud.google.com/) for quota information
   - Consider implementing rate limiting in your application for heavy usage scenarios

For more help, check the [Google Sheets API Troubleshooting Guide](https://developers.google.com/sheets/api/troubleshooting) or open an issue in this repository.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
