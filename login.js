// Login functionality
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user) {
        // User is already logged in, redirect to appropriate dashboard
        if (user.role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else {
            window.location.href = 'user-dashboard.html';
        }
    }

    // Login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('error-message');
            
            // Hide previous error messages
            errorMessage.style.display = 'none';
            
            // Client-side validation
            if (!email || !password) {
                errorMessage.style.display = 'block';
                errorMessage.textContent = 'Email and password are required';
                return;
            }
            
            if (!email.includes('@')) {
                errorMessage.style.display = 'block';
                errorMessage.textContent = 'Please enter a valid email address';
                return;
            }
            
            console.log('Attempting login for:', email);
            
            try {
                const response = await fetch('http://localhost/ecommerce_backend/login.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                console.log('Response status:', response.status);
                
                const text = await response.text();
                console.log('Raw response:', text);
                
                let data;
                try {
                    data = JSON.parse(text);
                } catch (jsonError) {
                    console.error('JSON parse error:', jsonError);
                    throw new Error('Server returned invalid response');
                }
                
                if (data.status === 'success') {
                    // Store user data in localStorage
                    localStorage.setItem('user', JSON.stringify(data.data));
                    
                    console.log('Login successful, user data:', data.data);
                    
                    // Redirect based on user role
                    if (data.data.role === 'admin') {
                        console.log('Redirecting to admin dashboard');
                        window.location.href = 'admin-dashboard.html';
                    } else {
                        console.log('Redirecting to user dashboard');
                        window.location.href = 'user-dashboard.html';
                    }
                } else {
                    errorMessage.style.display = 'block';
                    errorMessage.textContent = data.message || 'Login failed';
                }
                
            } catch (error) {
                console.error('Login error:', error);
                errorMessage.style.display = 'block';
                errorMessage.textContent = 'Error connecting to server: ' + error.message;
            }
        });
    }
});