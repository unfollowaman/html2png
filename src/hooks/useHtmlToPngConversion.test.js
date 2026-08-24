import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useHtmlToPngConversion } from './useHtmlToPngConversion'

vi.mock('html-to-image', () => ({
  toPng: vi.fn().mockResolvedValue('data:image/png;base64,fake')
}))

describe('useHtmlToPngConversion XSS Sanitization', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('sanitizes script tags, event handlers, and javascript URIs before writing to iframe', async () => {
    const outputRef = { current: { scrollIntoView: vi.fn() } }
    const { result } = renderHook(() => useHtmlToPngConversion({ outputRef }))

    let writtenContent = ''
    const origCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tagName, options) => {
      const el = origCreateElement(tagName, options)
      if (tagName.toLowerCase() === 'iframe') {
        const fakeDoc = {
          open: vi.fn(),
          close: vi.fn(),
          write: vi.fn((content) => {
            writtenContent = content
          }),
          readyState: 'complete',
          body: document.createElement('body'),
          documentElement: document.createElement('html'),
          images: [],
          fonts: { ready: Promise.resolve() }
        }
        Object.defineProperty(el, 'contentDocument', {
          get: () => fakeDoc,
          configurable: true
        })
        Object.defineProperty(el, 'contentWindow', {
          get: () => ({ document: fakeDoc }),
          configurable: true
        })
      }
      return el
    })

    const maliciousHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>body { color: red; }</style>
          <script>window.xssInHead = true;</script>
        </head>
        <body>
          <h1 onclick="window.xssOnClick=true">Title</h1>
          <img src="x" onerror="window.xssOnError=true" />
          <a href="javascript:alert(1)">Malicious Link</a>
        </body>
      </html>
    `

    await act(async () => {
      await result.current.handleConvert(maliciousHtml)
    })

    expect(writtenContent).toBeTruthy()

    // Verify malicious scripts, event handlers, and javascript: links are stripped
    expect(writtenContent).not.toContain('<script>')
    expect(writtenContent).not.toContain('window.xssInHead')
    expect(writtenContent).not.toContain('onclick')
    expect(writtenContent).not.toContain('onerror')
    expect(writtenContent).not.toContain('javascript:')

    // Verify legitimate elements and inline styles remain intact
    expect(writtenContent).toContain('color: red')
    expect(writtenContent).toContain('<h1>Title</h1>')
    expect(writtenContent).toContain('<img src="x">')
    expect(writtenContent).toContain('<a>Malicious Link</a>')
  })
})
