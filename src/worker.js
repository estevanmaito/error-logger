/**
 * Expects an array. The first element is the error log; the second informs
 * if the localStorage is available in the main thread
 */
onmessage = function (e) {
  const log = e.data[0]
  const hasLocalStorage = e.data[1]

  const xhr = new XMLHttpRequest()

  function informMainThreadToCacheLog(log) {
    console.log(log)
    if (hasLocalStorage) {
      postMessage(log)
    }
  }

  xhr.onreadystatechange = function xhrReady() {
    try {
      // request complete
      if (xhr.readyState === XMLHttpRequest.DONE) {
        // request successfull
        if (xhr.status === 200) {
          console.log(JSON.parse(xhr.response))
          // request wasn't successfull, cache logs
        } else {
          console.warn('Logger: Could not complete the request. Caching error logs.')
          informMainThreadToCacheLog(log)
        }
      }
    } catch (error) {
      // probably a server error, cache logs
      console.error('Logger: Error: Something went wrong connecting to the logger server', error)
      informMainThreadToCacheLog(log)
    }
  }

  xhr.open('POST', 'http://localhost:3000/log')
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.send(log)
}