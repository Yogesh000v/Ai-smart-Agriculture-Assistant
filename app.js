async checkConnections() {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');

    // GitHub Pages (HTTPS) par local 127.0.0.1 check skip karein
    if (window.location.hostname.includes('github.io')) {
      this.isBackendLive = false;
      this.isGatewayLive = false;
      if (statusDot) statusDot.className = 'status-dot simulated';
      if (statusText) statusText.innerHTML = '🟡 Standalone Simulation Mode (Ready)';
      return;
    }

    try {
      const res = await fetch(`${this.apiBase}/api/status`, { signal: AbortSignal.timeout(1800) });
      if (res.ok) {
        this.isBackendLive = true;
        if (statusDot) statusDot.className = 'status-dot';
        if (statusText) statusText.innerHTML = '🟢 Python Backend Live &nbsp;|&nbsp; SQL Connected';
        return;
      }
    } catch (e) {}

    try {
      const resNode = await fetch(`${this.nodeGatewayBase}/status`, { signal: AbortSignal.timeout(1200) });
      if (resNode.ok) {
        this.isGatewayLive = true;
        if (statusDot) statusDot.className = 'status-dot';
        if (statusText) statusText.innerHTML = '🟢 Node.js Gateway Live &nbsp;|&nbsp; Python Standby';
        return;
      }
    } catch (e) {}

    this.isBackendLive = false;
    this.isGatewayLive = false;
    if (statusDot) statusDot.className = 'status-dot simulated';
    if (statusText) statusText.innerHTML = '🟡 Standalone Simulation Mode (Ready)';
  },
