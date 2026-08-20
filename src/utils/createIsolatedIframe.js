/**
 * Creates and configures an offscreen isolated HTMLIFrameElement for rendering DOM content.
 * Note: Caller is responsible for appending to document.body and cleaning up after use.
 *
 * @returns {HTMLIFrameElement} Configured iframe element
 */
export function createIsolatedIframe() {
  const iframe = document.createElement('iframe')
  iframe.style.position = 'absolute'
  iframe.style.top = '-99999px'
  iframe.style.left = '-99999px'
  iframe.style.width = '9999px'
  iframe.style.height = '9999px'
  iframe.style.border = 'none'
  iframe.style.visibility = 'hidden'

  return iframe
}
