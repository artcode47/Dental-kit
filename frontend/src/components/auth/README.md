# Auth Components - Modular Architecture

This directory contains modular, reusable components for authentication pages. The components are designed to be maintainable, testable, and follow the same design patterns while improving UI/UX.

## Components Overview

### Core Components

#### `RegisterForm`
- **Purpose**: Main form component handling registration logic, validation, and submission
- **Props**: 
  - `onSubmit`: Function to handle form submission
  - `isSubmitting`: Boolean indicating submission state
  - `securityLocked`: Boolean indicating if security is locked
  - `canProceed`: Boolean indicating if user can proceed
- **Features**: 
  - Form validation with Yup schema
  - Security checks and rate limiting
  - Password strength indicator
  - Input sanitization
  - Error handling

#### `PasswordStrengthIndicator`
- **Purpose**: Visual indicator showing password strength with requirements checklist
- **Props**: 
  - `strength`: Object with score and feedback
  - `className`: Optional CSS classes
- **Features**: 
  - Color-coded strength levels
  - Progress bar visualization
  - Requirements checklist with icons
  - Responsive design

#### `SecurityCheckIndicator`
- **Purpose**: Shows when security checks pass
- **Props**: None (stateless component)
- **Features**: 
  - Success state visualization
  - Consistent with design system

### Layout Components

#### `RegisterHero`
- **Purpose**: Left side branding and marketing section
- **Props**: None (uses theme context)
- **Features**: 
  - Animated background patterns
  - Brand logo and messaging
  - Security badges
  - Responsive design (hidden on mobile)

#### `RegisterHeader`
- **Purpose**: Form header with title and description
- **Props**: None (uses translation context)
- **Features**: 
  - Icon and title display
  - Gradient text effects
  - Consistent styling

#### `RegisterFooter`
- **Purpose**: Bottom section with links and security notice
- **Props**: None (uses translation context)
- **Features**: 
  - Login link
  - Terms and privacy links
  - Security notice

#### `MobileLogo`
- **Purpose**: Mobile-only logo display
- **Props**: None (uses theme context)
- **Features**: 
  - Responsive logo sizing
  - Theme-aware logo selection

## Usage Example

```jsx
import {
  RegisterHero,
  MobileLogo,
  RegisterHeader,
  RegisterForm,
  RegisterFooter
} from '../../components/auth';

const RegisterPage = () => {
  const handleSubmit = async (data) => {
    // Handle form submission
  };

  return (
    <div className="min-h-screen flex">
      <RegisterHero />
      <div className="flex-1">
        <MobileLogo />
        <div className="form-container">
          <RegisterHeader />
          <RegisterForm 
            onSubmit={handleSubmit}
            isSubmitting={false}
            securityLocked={false}
            canProceed={true}
          />
          <RegisterFooter />
        </div>
      </div>
    </div>
  );
};
```

## Benefits of Modular Architecture

1. **Maintainability**: Each component has a single responsibility
2. **Reusability**: Components can be used in other auth pages
3. **Testability**: Individual components can be tested in isolation
4. **Readability**: Clear separation of concerns
5. **Performance**: Components can be optimized individually
6. **Consistency**: Shared design patterns across components

## Design System Integration

All components use the established design system:
- **Colors**: Teal primary palette with semantic colors
- **Typography**: Consistent font weights and sizes
- **Spacing**: Standard spacing scale
- **Shadows**: Consistent shadow system
- **Animations**: Smooth transitions and hover effects
- **Dark Mode**: Full dark mode support

## Translation Support

All components use the same translation keys as the original implementation:
- `auth.register.*` for registration-specific text
- `auth.validation.*` for validation messages
- `auth.common.*` for shared text
- `brand.*` for brand information

## Accessibility Features

- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Error message associations

## Future Enhancements

- Add loading states for async operations
- Implement form persistence
- Add animation variants
- Create component variants (compact, expanded)
- Add unit tests for each component
