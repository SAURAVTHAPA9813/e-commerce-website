// Global API base configuration for dev/prod (robust to subfolder like
// "e garden/ecommerce_frontend" with a sibling "ecommerce_backend")
;(function(){
  if (window.API_BASE) return;
  try {
    const origin = window.location.origin.replace(/\/$/, '');
    const port = window.location.port;

    // DEVELOPMENT MODE DETECTION:
    // If running on non-standard port (e.g., 3000 from VS Code Live Preview),
    // assume we're in dev mode and need to reach XAMPP on standard port 80
    if (port && port !== '80' && port !== '443') {
      // Dev mode: point to XAMPP backend on localhost:80
      window.API_BASE = 'http://localhost/e%20garden/ecommerce_backend';
      return;
    }

    // PRODUCTION/XAMPP MODE:
    // Dynamic path detection for direct XAMPP access or production deployment
    const pathname = window.location.pathname; // e.g. /e%20garden/ecommerce_frontend/shop.html
    // Try to derive the project root before "/ecommerce_frontend"
    const idx = pathname.indexOf('/ecommerce_frontend');
    const basePath = idx >= 0 ? pathname.substring(0, idx) : '';
    // Use encoded basePath as-is to preserve %20 for spaces
    const apiBase = origin + basePath + '/ecommerce_backend';

    window.API_BASE = apiBase;
  } catch (_) {
    // Fallback: same host, root-level backend
    window.API_BASE = window.location.origin.replace(/\/$/, '') + '/ecommerce_backend';
  }
})();
