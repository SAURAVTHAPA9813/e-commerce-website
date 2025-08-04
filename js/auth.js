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

// ===== LOGOUT FUNCTION - WORKING VERSION =====
function logout() {
    console.log('🚪 Logout function called!');
    
    try {
        // Clear user data first
        const userData = JSON.parse(localStorage.getItem('user') || 'null');
        console.log(`👤 User data found: ${userData ? 'Yes' : 'No'}`);
        
        localStorage.removeItem('user');
        console.log('✅ localStorage cleared');
        
        // Try to call backend logout (optional)
        fetch('http://localhost/ecommerce_backend/logout.php', {
            method: 'POST',
            credentials: 'include'
        }).then(response => {
            console.log('📡 Backend logout response:', response.status);
        }).catch(err => {
            console.warn('⚠️ Backend logout failed:', err.message);
        }).finally(() => {
            // Always redirect regardless of backend response
            console.log('🔄 Redirecting to login page...');
            window.location.href = 'login.html';
        });
        
    } catch (error) {
        console.error('💥 Logout error:', error);
        // Still try to redirect even if there's an error
        window.location.href = 'login.html';
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
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (user) {
            window.location.href = user.role === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html';
            return;
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
                const response = await fetch('http://localhost/ecommerce_backend/register.php', {
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

    // ===== LOGIN HANDLER =====
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
                const response = await fetch('http://localhost/ecommerce_backend/login.php', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                console.log('📡 Response status:', response.status, response.statusText);

                if (!response.ok) {
                    throw new Error(`Server error: ${response.status} ${response.statusText}`);
                }

                const text = await response.text();
                console.log('📄 Response text:', text);

                let data;
                try {
                    data = JSON.parse(text);
                } catch (parseErr) {
                    console.error('JSON parse error:', parseErr);
                    throw new Error('Invalid response format from server');
                }

                console.log('📊 Parsed response:', data);

                if (data.status === 'success') {
                    localStorage.setItem('user', JSON.stringify(data.data));
                    
                    showSuccess('Login successful! Redirecting...');
                    
                    setTimeout(() => {
                        const userRole = data.data.role;
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
                console.error('💥 Login error:', err);
                showError(`Connection error: ${err.message}`);
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

    // Run auth check
    checkAuth();
    
    console.log('🎯 Auth.js fully loaded!');
});

// Additional safety check - attach logout on window load as well
window.addEventListener('load', function() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn && !logoutBtn.onclick) {
        console.log('🔄 Window load: Re-attaching logout event as backup');
        logoutBtn.addEventListener('click', logout);
    }
});