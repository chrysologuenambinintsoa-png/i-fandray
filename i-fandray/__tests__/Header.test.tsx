import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from '@/components/Header'
import { TranslationProvider } from '@/components/TranslationProvider'

// Mock the hooks
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      avatar: '/avatar.jpg',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User'
    },
    logout: jest.fn(),
    loading: false,
  }),
}))

jest.mock('@/hooks/useSettings', () => ({
  useSettings: () => ({
    language: 'en',
    theme: 'light',
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    privacy: {
      profileVisibility: 'public',
      messageRequests: true,
      showOnlineStatus: true,
    },
    setLanguage: jest.fn(),
    setTheme: jest.fn(),
    setNotification: jest.fn(),
    setPrivacy: jest.fn(),
    resetSettings: jest.fn(),
  }),
}))

jest.mock('@/hooks/useNotificationsWithFetch', () => ({
  useNotificationsWithFetch: () => ({
    unreadCount: 3,
  }),
}))

jest.mock('@/hooks/useUnreadMessagesCount', () => ({
  useUnreadMessagesCount: () => ({
    unreadCount: 2,
    loading: false,
  }),
}))

jest.mock('@/hooks/useFriendRequestsCount', () => ({
  useFriendRequestsCount: () => ({
    count: 1,
    loading: false,
  }),
}))

jest.mock('@/hooks/useNotifications', () => ({
  useNotifications: () => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    addNotification: jest.fn(),
    fetchNotifications: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    removeNotification: jest.fn(),
    clearAll: jest.fn(),
  }),
}))

jest.mock('@/components/OnlineFriendsList', () => ({
  OnlineFriendsList: () => <div data-testid="online-friends-list">Online Friends</div>,
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
}

require('next/navigation').useRouter.mockReturnValue(mockRouter)

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <TranslationProvider>
      {component}
    </TranslationProvider>
  )
}

describe('Header', () => {
  it('renders the logo and brand name', () => {
    renderWithProviders(<Header />)

    expect(screen.getByText('i-fandray')).toBeInTheDocument()
  })

  it('renders the logo image', () => {
    renderWithProviders(<Header />)

    const logoImg = screen.getByAltText('i-fandray Logo')
    expect(logoImg).toBeInTheDocument()
    expect(logoImg).toHaveAttribute('src', '/logo.svg')
  })

  it('renders search input', () => {
    renderWithProviders(<Header />)

    const searchInput = screen.getByPlaceholderText(/search/i)
    expect(searchInput).toBeInTheDocument()
  })

  it('renders navigation icons', () => {
    renderWithProviders(<Header />)

    // Check for notification bell (look for the badge with count)
    const notificationBadge = screen.getByText('3')
    expect(notificationBadge).toBeInTheDocument()

    // Check for messages icon
    const messagesButton = screen.getByRole('button', { name: /messages/i })
    expect(messagesButton).toBeInTheDocument()

    // Check for friends icon
    const friendsButton = screen.getByRole('button', { name: /friends/i })
    expect(friendsButton).toBeInTheDocument()
  })

  it('shows unread notification count', () => {
    renderWithProviders(<Header />)

    const notificationBadge = screen.getByText('3')
    expect(notificationBadge).toBeInTheDocument()
  })

  it('renders user dropdown menu', () => {
    renderWithProviders(<Header />)

    // Click on user avatar/initial button to open dropdown
    const userButton = screen.getByRole('button', { name: 'testuser' })
    fireEvent.click(userButton)

    // Check if dropdown items are present (profile, settings, logout)
    expect(screen.getByText(/profile/i)).toBeInTheDocument()
    expect(screen.getByText(/settings/i)).toBeInTheDocument()
    expect(screen.getByText(/logout/i)).toBeInTheDocument()
  })

  it('handles search form submission', () => {
    renderWithProviders(<Header />)

    const searchInput = screen.getByPlaceholderText(/search/i)
    const searchForm = searchInput.closest('form')

    fireEvent.change(searchInput, { target: { value: 'test query' } })
    fireEvent.submit(searchForm!)

    expect(mockRouter.push).toHaveBeenCalledWith('/search?q=test%20query')
  })
})