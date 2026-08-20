import { describe, it, expect } from 'vitest'
import { createIsolatedIframe } from './createIsolatedIframe'

describe('createIsolatedIframe', () => {
  it('creates an HTMLIFrameElement with offscreen hidden styling', () => {
    const iframe = createIsolatedIframe()

    expect(iframe).toBeInstanceOf(HTMLIFrameElement)
    expect(iframe.style.position).toBe('absolute')
    expect(iframe.style.top).toBe('-99999px')
    expect(iframe.style.left).toBe('-99999px')
    expect(iframe.style.width).toBe('9999px')
    expect(iframe.style.height).toBe('9999px')
    expect(iframe.style.borderStyle).toBe('none')
    expect(iframe.style.visibility).toBe('hidden')
  })
})
