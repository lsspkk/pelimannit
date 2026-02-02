# API and Data Model Documentation

## Database Models

### User Model

| Field    | Type     | Required | Description                            |
| -------- | -------- | -------- | -------------------------------------- |
| username | string   | Yes      | Unique identifier for the user account |
| email    | string   | Yes      | User's email address for communication |
| \_id     | ObjectId | Yes      | MongoDB unique identifier for the user |

### Song Model

| Field     | Type                         | Required | Description                                   |
| --------- | ---------------------------- | -------- | --------------------------------------------- |
| songname  | string                       | Yes      | Name of the song                              |
| path      | string                       | No       | Local file path of the song                   |
| url       | string                       | Yes      | URL to access the song file                   |
| dance     | string                       | No       | Type of dance associated with the song        |
| tempo     | 'slow' \| 'medium' \| 'fast' | No       | Speed of the song                             |
| year      | number                       | No       | Year the song was created/published           |
| archiveId | ObjectId                     | Yes      | Reference to the archive containing this song |
| hide      | boolean                      | No       | Whether the song is hidden from view          |
| hideDate  | Date                         | No       | Date when the song was hidden                 |
| \_id      | ObjectId                     | Yes      | MongoDB unique identifier for the song        |

### Collection Model

| Field          | Type     | Required | Description                                         |
| -------------- | -------- | -------- | --------------------------------------------------- |
| collectionname | string   | Yes      | Name of the collection                              |
| description    | string   | No       | Optional description of the collection              |
| archiveId      | ObjectId | Yes      | Reference to the archive containing this collection |
| created        | Date     | Yes      | Date when the collection was created                |
| modified       | Date     | Yes      | Date when the collection was last modified          |
| \_id           | ObjectId | Yes      | MongoDB unique identifier for the collection        |

### Archive Model

| Field           | Type     | Required | Description                                |
| --------------- | -------- | -------- | ------------------------------------------ |
| archivename     | string   | Yes      | Name of the archive                        |
| created         | Date     | Yes      | Date when the archive was created          |
| modified        | Date     | Yes      | Date when the archive was last modified    |
| url             | string   | No       | URL to access the archive                  |
| driveId         | string   | No       | Google Drive ID for the archive            |
| visitorPassword | string   | No       | Password for visitor access to the archive |
| \_id            | ObjectId | Yes      | MongoDB unique identifier for the archive  |

### ArchiveUser Model

- Manages user-specific archive data
- Links users to their archived content

### Rating Model

| Field  | Type     | Required | Description                               |
| ------ | -------- | -------- | ----------------------------------------- |
| rating | number   | Yes      | Numeric rating value given by the user    |
| userId | ObjectId | Yes      | Reference to the user who gave the rating |
| songId | ObjectId | Yes      | Reference to the song being rated         |
| \_id   | ObjectId | Yes      | MongoDB unique identifier for the rating  |

### Choice Model

| Field        | Type     | Required | Description                                       |
| ------------ | -------- | -------- | ------------------------------------------------- |
| songId       | ObjectId | Yes      | Reference to the chosen song                      |
| collectionId | ObjectId | Yes      | Reference to the collection containing the choice |
| created      | Date     | Yes      | Date when the choice was made                     |
| index        | number   | No       | Position of the song in the collection            |
| \_id         | ObjectId | Yes      | MongoDB unique identifier for the choice          |

## API Structure

### File API

- Handles file operations including uploads and downloads
- Manages PDF files and other document types
- Includes file metadata management

### SWR API

- Implements data fetching with SWR
- Handles caching and revalidation
- Manages API endpoints for various data types

### Session Management

- Handles user authentication
- Manages session state
- Implements security measures

### Database Connection

- Manages MongoDB connections
- Handles connection pooling and error handling
- Implements connection lifecycle management

## Data Flow

1. User Authentication

   - User credentials are verified
   - Session is established
   - Access tokens are managed

2. Data Operations

   - CRUD operations for songs and collections
   - File uploads and downloads
   - Archive management

3. Caching Strategy
   - SWR implementation for efficient data fetching
   - Cache invalidation policies
   - Real-time updates

## Security Considerations

- Password hashing using bcrypt
- Session management with iron-session
- Secure file handling
- API endpoint protection
