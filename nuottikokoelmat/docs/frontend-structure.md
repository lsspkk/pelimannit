# Frontend Structure and Features

## Application Architecture

### Next.js App Router Structure

- Uses Next.js with App Router
- Implements modern React patterns and best practices
- Leverages TypeScript for type safety

## Core Components

### UI Components

- **NpButton**: Custom button component with variants
- **NpDialog**: Modal dialog component
- **NpInput**: Form input component
- **NpBackButton**: Navigation back button
- **NpToast**: Notification system
- **NpMain**: Main layout wrapper
- **NpTitle**: Title component
- **NpTextarea**: Text area input
- **NpIconButton**: Icon-based button
- **NpCloseButton**: Close button component

### PDF Components

- **PdfIframeView**: PDF viewer using iframe
- **PdfFileView**: Advanced PDF viewing component
- **PdfSongNavigation**: Navigation within PDF documents

### Song Components

- **ChoiceSongCard**: Card for song selection
- **BasicSongCard**: Basic song information display
- **archiveSongList**: Collection of archive song components

### Utility Components

- **Spinner**: Loading spinner
- **LoadingIndicator**: Progress indicator
- **SpinnerInfinity**: Infinite loading animation

## Custom Hooks

### Device Management

- **useDevice**: Handles device-specific functionality
- **useSwipe**: Implements touch swipe gestures

## State Management

### Zustand Store

- Global state management
- Implements reactive updates
- Handles complex state interactions

### SWR Integration

- Data fetching and caching
- Real-time updates
- Error handling

## Main Features

### Authentication

- User login system
- Session management
- Protected routes

### PDF Management

- PDF file viewing
- Navigation within PDFs
- File upload and download

### Song Management

- Song collection organization
- Song metadata display
- Rating system

### Archive System

- Archive browsing
- User-specific archives
- Archive management tools

## Styling

### Tailwind CSS

- Utility-first styling
- Responsive design
- Custom component styling

### CSS Modules

- Component-specific styles
- Scoped styling
- Global styles management

## Performance Optimizations

- Image optimization
- Code splitting
- Lazy loading
- Caching strategies
