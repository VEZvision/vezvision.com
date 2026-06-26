(function loadFontshare() {
  var href = 'https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap'
  if (document.querySelector('link[data-font-loader="fontshare"]')) {
    return
  }
  var link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = href
  link.media = 'print'
  link.dataset.fontLoader = 'fontshare'
  link.onload = function activateFontStylesheet() {
    link.media = 'all'
  }
  document.head.appendChild(link)
})()
