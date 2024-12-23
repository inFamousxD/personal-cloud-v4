# Personal Productivity Suite - Technical Specification

## Project Overview
A full-stack web application focused on personal productivity with sharable components. The system emphasizes flexibility, extensibility, and user customization.

## Technical Stack

### Frontend
- Vite + React with TypeScript
- React Router for navigation
- TailwindCSS for styling
- Shadcn/ui for component library
- TipTap for rich text editing
- Zustand for state management
- React Query for API communication
- Axios for HTTP requests

### Backend
- Express.js with TypeScript
- JWT for authentication
- Prisma as ORM
- MongoDB as primary database
- Redis for caching (optional)

### Infrastructure
- Docker for containerization
- GitHub Actions for CI/CD
- Separate deployments for frontend and backend
- CORS configuration between services

## Core Features

### Authentication System
- JWT-based authentication
- Refresh token rotation
- OAuth integration (Google, GitHub)
- Public URL sharing system with granular permissions
- Rate limiting for security

### Core System Models

#### Sharing System
- Unique shareable URL generation
- Permission levels (read, write, comment)
- Expiration settings
- Access tracking
- Revocation capability
- Password protection (optional)
- Sharing analytics

#### User
- Basic profile information
- Theme preferences
- Settings
- Relationships with shared items

#### Todo Lists
- Title and description
- Items with status
- Due dates
- Priority levels
- Sharing permissions
- URL for public access
- Collaborative editing support

#### Diary Entries
- Rich text content
- Tags/categories
- Timestamps
- Privacy settings
- Media attachments

#### Notes
- Rich text support
- Categories/folders
- Search functionality
- Version history
- Export capabilities

### UI/UX Features
- Customizable themes (light/dark)
- Layout persistence
- Drag-and-drop interface
- Keyboard shortcuts
- Responsive design
- Custom color schemes
- Widget-based dashboard

## API Structure

### Authentication
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/refresh
- POST /api/auth/logout

### Todo Lists
- GET /api/todos
- POST /api/todos
- PUT /api/todos/:id
- DELETE /api/todos/:id
- POST /api/todos/:id/share
- PUT /api/todos/:id/collaborate

### Diary
- GET /api/diary
- POST /api/diary
- PUT /api/diary/:id
- DELETE /api/diary/:id
- GET /api/diary/tags
- GET /api/diary/search

### Notes
- GET /api/notes
- POST /api/notes
- PUT /api/notes/:id
- DELETE /api/notes/:id
- GET /api/notes/folders
- GET /api/notes/search
- GET /api/notes/:id/versions

## Project Structure

### Frontend
```
src/
├── assets/
├── components/
│   ├── common/
│   ├── todo/
│   ├── diary/
│   └── notes/
├── hooks/
├── layouts/
├── pages/
├── services/
├── store/
├── types/
└── utils/
```

### Backend
```
src/
├── config/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── services/
├── types/
└── utils/
```

## Security Considerations
- CORS configuration
- CSRF protection
- XSS prevention
- Rate limiting
- Input sanitization
- Secure cookie handling
- Environment variable management
- Regular security audits

## Performance Optimization
- Code splitting
- Image optimization
- Caching strategy
- Database indexing
- API response optimization
- Bundle size monitoring

## Future Extensibility
- Plugin system
- API key generation for external integrations
- Webhook support
- Custom widget development
- Theme marketplace
- Data export/import utilities

## Development Practices
- Git flow with feature branches
- Conventional commits
- Automated testing (Jest, Cypress)
- Code quality tools (ESLint, Prettier)
- Documentation generation
- Performance monitoring
- Error tracking

## Deployment Strategy
- Separate frontend and backend deployments
- Staging and production environments
- Database backup strategy
- Monitoring and logging
- Alert system
- Performance metrics

This document serves as a living specification and should be updated as the project evolves.