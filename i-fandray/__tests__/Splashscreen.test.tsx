import { render, screen } from '@testing-library/react'
import { Splashscreen } from '@/components/Splashscreen'
import { TranslationProvider } from '@/components/TranslationProvider'

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <TranslationProvider>
      {component}
    </TranslationProvider>
  )
}

describe('Splashscreen', () => {
  it('renders the logo image', () => {
    renderWithProviders(<Splashscreen />)

    const logoImg = screen.getByAltText('i-fandray Logo')
    expect(logoImg).toBeInTheDocument()
    expect(logoImg).toHaveAttribute('src', '/logo.svg')
  })

  it('renders the app name', () => {
    renderWithProviders(<Splashscreen />)

    expect(screen.getByText('i-fandray')).toBeInTheDocument()
  })

  it('renders the tagline', () => {
    renderWithProviders(<Splashscreen />)

    // The tagline comes from translations, so we check if it renders
    const taglineElement = screen.getByTestId('splash-tagline') || screen.getByText(/connect|social|network/i)
    expect(taglineElement).toBeInTheDocument()
  })
})