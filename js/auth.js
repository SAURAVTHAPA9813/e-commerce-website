// ===== UTILITY FUNCTIONS =====
function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        setTimeout(() => errorElement.style.display = 'none', 5000);
    }
    // Hide success message if shown
    const successElement = document.getElementById('success-message');
    if (successElement) successElement.style.display = 'none';
    console.error('❌ Error:', message);
}

function showSuccess(message) {
    const successElement = document.getElementById('success-message');
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';
    }
    // Hide error message if shown
    const errorElement = document.getElementById('error-message');
    if (errorElement) errorElement.style.display = 'none';
    console.log('✅ Success:', message);
}

// API base (fallback to common localhost backend path). If you host differently,
// set window.API_BASE before this script runs (for example in a small inline
// <script> in your HTML header).
const API_BASE = (window.API_BASE || `${location.origin}/e%20garden/ecommerce_backend`).replace(/\/$/, '');

// Helper: synchronize client localStorage 'user' with server session state.
async function syncSessionWithServer() {
    try {
        const res = await fetch(API_BASE + '/auth.php?action=getUser', {
            method: 'GET',
            credentials: 'include',
            headers: { 'Accept': 'application/json' }
        });

        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch (e) {
            console.warn('syncSessionWithServer: non-JSON response from server:', text.slice(0,200));
            return;
        }

        if (data && data.status === 'success' && data.data && data.data.user) {
            // Ensure localStorage user mirrors server session
            localStorage.setItem('user', JSON.stringify(data.data.user));
            console.log('syncSessionWithServer: localStorage user set from server session');
        } else {
            // Server reports not logged in -> clear client state to avoid mismatch
            localStorage.removeItem('user');
            console.log('syncSessionWithServer: server has no session, cleared localStorage user');
        }
    } catch (err) {
        console.warn('syncSessionWithServer: failed to contact server:', err.message || err);
    }
}

// ===== CART MIGRATION FUNCTION =====
async function migrateGuestCart() {
    try {
        // Get cart from localStorage
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');

        if (localCart.length === 0) {
            console.log('📦 No guest cart items to migrate');
            return;
        }

        console.log(`📦 Migrating ${localCart.length} items from guest cart to database...`);

        // Add each item to database cart
        for (const item of localCart) {
            try {
                await fetch(API_BASE + '/cart.php?action=addToCart', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        product_id: item.id || item.product_id,
                        quantity: item.quantity || 1
                    })
                });
            } catch (err) {
                console.warn(`Failed to migrate item ${item.id}:`, err);
            }
        }

        console.log('✅ Cart migration completed');
    } catch (error) {
        console.error('Cart migration error:', error);
        throw error;
    }
}

// ===== LOGOUT FUNCTION - WORKING VERSION =====
function logout() {
    console.log('🚪 Logout function called!');

    try {
        // Clear all possible auth data keys first to avoid "auto-login" from stale storage
        const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
        const legacyUser = JSON.parse(localStorage.getItem('userData') || 'null');
        const token = localStorage.getItem('authToken');
        console.log(`👤 user key: ${currentUser ? 'present' : 'absent'} | userData key: ${legacyUser ? 'present' : 'absent'} | authToken: ${token ? 'present' : 'absent'}`);

        localStorage.removeItem('user');
        localStorage.removeItem('userData'); // legacy key used by older pages
        localStorage.removeItem('authToken'); // any token-based auth
        localStorage.removeItem('cart'); // Clear cart to ensure user isolation
        console.log('✅ localStorage auth keys and cart cleared');
        
        // Try to call backend logout (optional)
        fetch(API_BASE + '/logout.php', {
            method: 'POST',
            credentials: 'include'
        }).then(response => {
            console.log('📡 Backend logout response:', response.status);
        }).catch(err => {
            console.warn('⚠️ Backend logout failed:', err.message);
        }).finally(() => {
            // Always redirect regardless of backend response
            console.log('🔄 Redirecting to login page...');
            // Add a cache-busting param and a hint to not auto-redirect if any caching happens
            const sep = 'login.html'.includes('?') ? '&' : '?';
            window.location.href = `login.html${sep}logged_out=1`;
        });
        
    } catch (error) {
        console.error('💥 Logout error:', error);
        // Still try to redirect even if there's an error
        const sep = 'login.html'.includes('?') ? '&' : '?';
        window.location.href = `login.html${sep}logged_out=1`;
    }
}

// ===== AUTH GUARD =====
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (!user) {
        console.log('🔒 No user found, checking current page...');
        if (!window.location.pathname.includes('login.html') && 
            !window.location.pathname.includes('signup.html') &&
            !window.location.pathname.includes('egarden.html')) {
         
        }
        return false;
    }
    
    if (window.location.pathname.includes('admin') && user.role !== 'admin') {
        console.log('🚫 Non-admin trying to access admin page, redirecting...');
        window.location.href = 'login.html';
        return false;
    }
    
    console.log('✅ Auth check passed for user:', user.email, 'Role:', user.role);
    return true;
}

// ===== MAIN INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, initializing auth...');
    // Immediately sync client state with server session to avoid mismatches
    try { syncSessionWithServer(); } catch (e) { console.warn('syncSessionWithServer failed to start:', e); }
    
    // Check if user is logged in and display name
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const userNameElement = document.getElementById('user-name');
    
    if (user && user.firstName) {
        if (userNameElement) {
            userNameElement.textContent = `Welcome, ${user.firstName}!`;
        }
        console.log(`👤 User logged in: ${user.firstName}`);
    } else if (!window.location.pathname.includes('login.html') && 
               !window.location.pathname.includes('signup.html') &&
               !window.location.pathname.includes('egarden.html')) {
       
        return;
    }
    
    // ===== LOGOUT BUTTON SETUP =====
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        console.log('🔘 Logout button found, attaching event listener');
        
        // Remove any existing event listeners first
        logoutBtn.removeEventListener('click', logout);
        
        // Add the event listener
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🖱️ Logout button clicked!');
            logout();
        });
        
        // Test if button is clickable
        logoutBtn.style.pointerEvents = 'auto';
        logoutBtn.style.cursor = 'pointer';
        
        console.log('✅ Logout button event listener attached successfully');
    }
    
    // ===== REDIRECT IF ALREADY LOGGED IN (Login Page Only) =====
    if (window.location.pathname.includes('login.html')) {
        const params = new URLSearchParams(window.location.search);
        if (params.has('logged_out')) {
            // Ensure any stale auth data is cleared and show a message
            try {
                localStorage.removeItem('user');
                localStorage.removeItem('userData');
                localStorage.removeItem('authToken');
            } catch (e) {
                console.warn('Storage clear failed:', e);
            }
            showSuccess('You have been logged out.');
            // Remove the query param so refresh doesn't re-trigger this block
            try {
                const url = new URL(window.location.href);
                url.searchParams.delete('logged_out');
                window.history.replaceState({}, '', url.toString());
            } catch (_) {}
            // Do not auto-redirect on this visit
        } else {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            if (user) {
                window.location.href = user.role === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html';
                return;
            }
        }
    }

    // ===== SIGN UP HANDLER =====
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        console.log('📝 Signup form found, attaching handler');
        
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            // Clear previous messages
            const errorMessage = document.getElementById('error-message');
            const successMessage = document.getElementById('success-message');
            if (errorMessage) errorMessage.style.display = 'none';
            if (successMessage) successMessage.style.display = 'none';

            if (!firstName || !lastName || !email || !password) 
                return showError('All fields are required');
            if (password.length < 6) 
                return showError('Password must be at least 6 characters long');

            try {
                const response = await fetch(API_BASE + '/register.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ firstName, lastName, email, password })
                });

                const text = await response.text();
                if (!text) throw new Error('Empty response from server');

                const data = JSON.parse(text);
                if (data.status === 'success') {
                    showSuccess(data.message);
                    signupForm.reset();
                    setTimeout(() => window.location.href = 'login.html', 2000);
                } else {
                    showError(data.message || 'Registration failed');
                }
            } catch (err) {
                showError('Error: ' + err.message);
                console.error(err);
            }
        });
    }

  // ===== LOGIN HANDLER (Corrected Error Handling) =====
const loginForm = document.getElementById('login-form');
if (loginForm) {
    console.log('🔐 Login form found, attaching handler');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('📤 Login form submitted');

        const emailField = document.getElementById('email');
        const passwordField = document.getElementById('password');
        const loginBtn = document.getElementById('login-btn');

        const email = emailField?.value?.trim() || '';
        const password = passwordField?.value || '';

        console.log('📋 Login attempt:', { 
            email: email || '[EMPTY]', 
            passwordLength: password.length,
            loginBtnFound: !!loginBtn
        });

        if (!email || !password) {
            showError('Email and password are required');
            return;
        }
        if (!email.includes('@')) {
            showError('Please enter a valid email address');
            return;
        }

        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.innerHTML = 'Signing In...';
        }

        try {
            console.log('🌐 Sending login request...');
            const response = await fetch(API_BASE + '/login.php', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            console.log('📡 Response status:', response.status, response.statusText);
            
            // Note: We no longer need the 'if (!response.ok)' check here,
            // because a PHP error often returns a 200 OK status with an HTML body.
            // We will determine success by whether the response is valid JSON.

            const text = await response.text();
            console.log('📄 Response text:', text);

            let data;
            try {
                data = JSON.parse(text);
            } catch (parseErr) {
                // ===================================================================
                // ===== THIS IS THE FIX =====
                // Instead of throwing a new generic error, we handle it directly.
                // This gives a much more accurate error message in the UI.
                console.error('JSON parse error:', parseErr);
                
                // Show a helpful error message that includes the start of the invalid server response.
                showError(`Server Error: Expected JSON but received: "${text.substring(0, 150)}..."`);
                
                // We return here to exit the function. The 'finally' block will still run.
                return; 
                // ===================================================================
            }

            console.log('📊 Parsed response:', data);

            if (data.status === 'success') {
                // Store the user object (data.data.user, not data.data)
                localStorage.setItem('user', JSON.stringify(data.data.user));

                // Migrate guest cart from localStorage to database
                migrateGuestCart().then(() => {
                    console.log('✅ Guest cart migrated to user account');
                    // Clear localStorage cart after migration
                    localStorage.removeItem('cart');
                }).catch(err => {
                    console.warn('⚠️ Cart migration failed:', err);
                });

                showSuccess('Login successful! Redirecting...');

                setTimeout(() => {
                    const userRole = data.data.user.role;
                    console.log('👤 User role detected:', userRole);

                    if (userRole === 'admin') {
                        console.log('🔑 Redirecting to admin dashboard...');
                        window.location.href = 'admin-dashboard.html';
                    } else {
                        console.log('👤 Redirecting to user dashboard...');
                        window.location.href = 'user-dashboard.html';
                    }
                }, 1500);
            } else {
                showError(data.message || 'Login failed');
            }
        } catch (err) {
            // This outer catch block will now correctly handle actual network errors
            // (e.g., server is down, CORS issue).
            console.error('💥 Login/Network error:', err);
            showError(`Network Connection Error: ${err.message}`);
        } finally {
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.innerHTML = 'Sign In';
            }
        }
    });
} else {
    console.log('ℹ️ No login form found on this page');
}
});
