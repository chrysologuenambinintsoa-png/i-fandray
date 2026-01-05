import { formatDate, formatNumber, truncateText, generateAvatarUrl, cn } from '@/lib/utils'

describe('Utils', () => {
  describe('formatDate', () => {
    it('returns "Just now" for recent dates', () => {
      const now = new Date()
      expect(formatDate(now)).toBe('Just now')
    })

    it('returns minutes ago for recent dates', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      expect(formatDate(fiveMinutesAgo)).toBe('5m ago')
    })

    it('returns hours ago for dates within 24 hours', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
      expect(formatDate(twoHoursAgo)).toBe('2h ago')
    })

    it('returns days ago for dates within a week', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      expect(formatDate(threeDaysAgo)).toBe('3d ago')
    })

    it('returns formatted date for older dates', () => {
      const oldDate = new Date('2020-01-01')
      const result = formatDate(oldDate)
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/) // Basic date format check
    })
  })

  describe('formatNumber', () => {
    it('returns number as string for small numbers', () => {
      expect(formatNumber(42)).toBe('42')
      expect(formatNumber(999)).toBe('999')
    })

    it('formats thousands with K suffix', () => {
      expect(formatNumber(1500)).toBe('1.5K')
      expect(formatNumber(2500)).toBe('2.5K')
    })

    it('formats millions with M suffix', () => {
      expect(formatNumber(1500000)).toBe('1.5M')
      expect(formatNumber(2500000)).toBe('2.5M')
    })
  })

  describe('truncateText', () => {
    it('returns original text if shorter than max length', () => {
      const text = 'Hello world'
      expect(truncateText(text, 20)).toBe(text)
    })

    it('truncates text and adds ellipsis when longer than max length', () => {
      const text = 'This is a very long text that should be truncated'
      const result = truncateText(text, 20)
      expect(result).toBe('This is a very long ...')
      expect(result.length).toBe(23) // 20 chars + ' ...'
    })

    it('handles edge cases', () => {
      expect(truncateText('', 10)).toBe('')
      expect(truncateText('abc', 3)).toBe('abc')
      expect(truncateText('abcd', 3)).toBe('abc...')
    })
  })

  describe('generateAvatarUrl', () => {
    it('generates URL with correct initials', () => {
      const url = generateAvatarUrl('John Doe')
      expect(url).toContain('JD')
      expect(url).toContain('ui-avatars.com')
    })

    it('handles single name', () => {
      const url = generateAvatarUrl('John')
      expect(url).toContain('J')
    })

    it('handles multiple names', () => {
      const url = generateAvatarUrl('John Michael Doe')
      expect(url).toContain('JM')
    })

    it('converts to uppercase', () => {
      const url = generateAvatarUrl('john doe')
      expect(url).toContain('JD')
    })
  })

  describe('cn (className utility)', () => {
    it('merges Tailwind classes correctly', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
    })

    it('handles conditional classes', () => {
      const isActive = true
      expect(cn('base-class', isActive && 'active-class')).toBe('base-class active-class')
      expect(cn('base-class', !isActive && 'inactive-class')).toBe('base-class')
    })

    it('handles arrays and objects', () => {
      expect(cn(['class1', 'class2'])).toBe('class1 class2')
      expect(cn({ 'class1': true, 'class2': false })).toBe('class1')
    })
  })
})