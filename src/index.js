(function(window){
  if (window.Worker) {
    const worker = new Worker('src/worker.js')
    
    window.addEventListener('load', function load() {
      // covers the case an error occurred while offline and the user
      // didn't wait until reconnection, so we try to resend the logs
      // the next time they visit the page
      sendLogsWhenOnline()
    })
    window.addEventListener('error', function handleWindowErrors(e) {
      const log = createLog(e)
      sendLog(log)
    })
    worker.addEventListener('message', function handleWorkerMessage(e) {
      cacheLog(e.data)
    })
    window.addEventListener('online', function handleOnline() {
      sendLogsWhenOnline()
    })

    function createLog(e) {
      const log = {
        type: e.error.__proto__.name,
        msg: e.error.message,
        src: e.filename,
        stack: e.error.stack,
        timestamp: e.timeStamp,
        url: e.target.origin,
        innerHeight: e.target.innerHeight,
        innerWidth: e.target.innerWidth,
        colno: e.colno,
        lineno: e.lineno,
        ua: e.currentTarget.navigator.userAgent,
        lang: e.currentTarget.navigator.language,
        platform: e.currentTarget.navigator.platform,
        date: Date.now(),
        referrer: document.referrer,
        online: navigator.onLine
      }

      return JSON.stringify(log)
    }

    function sendLog(errorLog) {
      worker.postMessage([errorLog, !!localStorage])
    }

    function cacheLog(log) {
      let storedLogs = JSON.parse(localStorage.getItem('logger')) || []
      storedLogs.push(log)
      localStorage.setItem('logger', JSON.stringify(storedLogs))
    }
    
    function sendLogsWhenOnline() {
      if (!!localStorage && localStorage.getItem('logger') !== null) {
        let storedLogs = JSON.parse(localStorage.getItem('logger'))
        storedLogs.forEach(log => {
          sendLog(log)
        })
        localStorage.removeItem('logger')
      }
    }

    // user input
    // network requests
    // page views
  }
})(window)