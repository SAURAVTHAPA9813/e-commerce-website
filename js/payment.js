// payment.js - render order, prefill contact, submit to backend

function formatMoney(n){ return `$${Number(n||0).toFixed(2)}`; }

function getCart(){ try { return JSON.parse(localStorage.getItem('cart')||'[]') } catch { return [] } }
function getCheckoutInfo(){ try { return JSON.parse(localStorage.getItem('checkoutInfo')||'null') } catch { return null } }

function renderOrder(){
  const list = document.getElementById('paymentOrderList');
  const subEl = document.getElementById('paymentSubtotal');
  if (!list || !subEl) return;
  const items = getCart();
  if (!items.length){
    list.innerHTML = '<div style="padding:18px;color:#888;text-align:center">Cart is empty.</div>';
    subEl.textContent = '$0.00';
    return;
  }
  let subtotal = 0;
  list.innerHTML = items.map(it => {
    const price = (it.price||0) * (it.quantity||1); subtotal += price;
    const img = it.image || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><rect width='100%' height='100%' fill='%23e9ecef'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%236c757d' font-size='10' font-family='Arial'>No Image</text></svg>";
    return `<div class="order-item">
      <img class="thumb" src="${img}" alt="${it.name||''}" />
      <div style="flex:1">
        <div class="name">${it.name||''}</div>
        <div class="meta">x ${it.quantity||1}</div>
      </div>
      <div class="price">${formatMoney(price)}</div>
    </div>`
  }).join('');
  subEl.textContent = formatMoney(subtotal);
}

function prefillPaymentForm(){
  const info = getCheckoutInfo();
  const form = document.getElementById('paymentForm');
  if (!form) return;
  if (info){
    const set = (name,val)=>{ const el=form.querySelector(`[name="${name}"]`); if (el && val) el.value = val; };
    set('email', info.email);
    set('firstName', info.firstName);
    set('lastName', info.lastName);
  } else {
    // fallback to logged-in user
    try{
      const user = JSON.parse(localStorage.getItem('user')||'null');
      if (user){
        const set = (n,v)=>{ const el=form.querySelector(`[name="${n}"]`); if (el && v) el.value=v };
        set('email', user.email);
        set('firstName', user.firstName||user.first_name);
        set('lastName', user.lastName||user.last_name);
      }
    }catch{}
  }
}

async function fetchCsrfToken(){
  try {
    const res = await fetch(((window.API_BASE||'').replace(/\/$/,'') + '/csrf.php'));
    const data = await res.json();
    return data.csrf_token || '';
  } catch {
    return '';
  }
}

function bindPaymentForm(){
   const form = document.getElementById('paymentForm');
   const cardFields = document.getElementById('cardFields');
   if (!form) return;
   const methodSelect = form.querySelectorAll('[name="paymentMethod"]');
   methodSelect.forEach(radio => {
     radio.addEventListener('change', ()=>{
       const method = document.querySelector('input[name="paymentMethod"]:checked').value;
       cardFields.style.display = method === 'card' ? 'block' : 'none';
     });
   });
   form.addEventListener('submit', async (e)=>{
     e.preventDefault();
     const fd = new FormData(form);
     const payload = Object.fromEntries(fd.entries());
     const cart = getCart();
     const subtotal = cart.reduce((s,i)=> s + (i.price||0)*(i.quantity||1), 0);

     // Loading state
     const button = form.querySelector('button[type="submit"]');
     const originalText = button.textContent;
     button.disabled = true;
     button.textContent = 'Processing...';

     // Validation
     const errors = [];

    // Common validations
    if (!payload.email || !payload.email.includes('@')) {
      errors.push('Valid email address is required.');
    }
    if (!payload.firstName || !payload.lastName) {
      errors.push('First and last name are required.');
    }

    if (payload.paymentMethod === 'cod') {
      // COD-specific validation
      if (!payload.address) errors.push('Street address is required for Cash on Delivery.');
      if (!payload.city) errors.push('City is required for Cash on Delivery.');
      if (!payload.postalCode) errors.push('Postal code is required for Cash on Delivery.');
      if (payload.postalCode && !/^\d{5}(-\d{4})?$/.test(payload.postalCode)) {
        errors.push('Postal code must be in format 12345 or 12345-6789.');
      }
    } else if (payload.paymentMethod === 'card') {
      // Card payment validation
      if (!payload.cardNumber || !payload.expiry || !payload.cvv) {
        errors.push('Card number, expiry date, and CVV are required.');
      }
      const expiryMatch = (payload.expiry||'').match(/^(\d{2})\/(\d{2})$/);
      if (!expiryMatch) {
        errors.push('Expiry must be in MM/YY format.');
      } else {
        const month = parseInt(expiryMatch[1], 10);
        const year = parseInt(expiryMatch[2], 10) + 2000;
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        if (month < 1 || month > 12) {
          errors.push('Expiry month must be between 01 and 12.');
        } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
          errors.push('Card has expired.');
        }
      }
      if (payload.cvv && !/^\d{3,4}$/.test(payload.cvv)) {
        errors.push('CVV must be 3 or 4 digits.');
      }
      if (payload.cardNumber && !/^\d{13,19}$/.test(payload.cardNumber.replace(/\s/g, ''))) {
        errors.push('Card number must be 13-19 digits.');
      }
    } else if (payload.paymentMethod === 'esewa' || payload.paymentMethod === 'khalti') {
      // eSewa/Khalti validation
      if (!payload.email || !payload.email.includes('@')) {
        errors.push('Valid email is required for ' + (payload.paymentMethod === 'esewa' ? 'eSewa' : 'Khalti') + ' payment.');
      }
      if (!payload.firstName || !payload.lastName) {
        errors.push('First and last name are required.');
      }
      if (!payload.address) errors.push('Street address is required.');
      if (!payload.city) errors.push('City is required.');
    }

    // Display errors if any
     const errBoxId = 'paymentErrors';
     let errBox = document.getElementById(errBoxId);
     if (!errBox) {
       errBox = document.createElement('div');
       errBox.id = errBoxId;
       errBox.style.cssText = 'background:#fee;border:1px solid #c00;color:#c00;padding:15px;margin:15px 0;border-radius:5px;';
       form.prepend(errBox);
     }
     if (errors.length){
       errBox.innerHTML = '<strong>Please fix the following errors:</strong>' + errors.map(e=>`<div>• ${e}</div>`).join('');
       errBox.scrollIntoView({behavior: 'smooth', block: 'nearest'});
       button.disabled = false;
       button.textContent = originalText;
       return;
     } else {
       errBox.innerHTML = '';
       errBox.style.display = 'none';
     }

     // Real payment processing with backend integration
     processPayment(payload, subtotal, button, originalText, errBox);
  });
}

window.renderPaymentPage = function(){
  renderOrder();
  prefillPaymentForm();
  bindPaymentForm();
}

async function processPayment(payload, subtotal, button, originalText, errBox) {
  try {
    if (payload.paymentMethod === 'esewa') {
      // eSewa Test Gateway Integration
      await processEsewaPayment(payload, subtotal, button, originalText, errBox);
    } else if (payload.paymentMethod === 'khalti') {
      // Khalti Test Gateway Integration (placeholder)
      await processKhaltiPayment(payload, subtotal, button, originalText, errBox);
    } else {
      // COD or Card - direct order creation
      await processDirectPayment(payload, subtotal, button, originalText, errBox);
    }
  } catch (error) {
    errBox.innerHTML = '<strong>Payment error:</strong><div>• Network or server error. Please try again.</div>';
    errBox.style.display = 'block';
    button.disabled = false;
    button.textContent = originalText;
  }
}

async function processEsewaPayment(payload, subtotal, button, originalText, errBox) {
  try {
    console.log('=== ESEWA v2 PAYMENT START ===');

    // Get CSRF token
    const csrfResponse = await fetch(`${window.API_BASE}/csrf.php`);
    const csrfData = await csrfResponse.json();
    const csrfToken = csrfData.csrf_token;
    console.log('CSRF token obtained:', csrfToken ? 'Yes' : 'No');

    // Step 1: Create order with pending payment status
    const cart = getCart();
    console.log('Cart items:', cart);

    const orderData = {
      action: 'createOrder',
      customer: {
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        address: payload.address,
        city: payload.city,
        postalCode: payload.postalCode,
        country: payload.country || 'Nepal',
        phone: payload.phone || null,
        billingAddress: payload.useShippingAddress ? payload.address : payload.billingAddress,
        billingCity: payload.useShippingAddress ? payload.city : payload.billingCity,
        billingPostalCode: payload.useShippingAddress ? payload.postalCode : payload.billingPostalCode
      },
      items: cart,
      paymentMethod: 'esewa',
      paymentStatus: 'pending',
      notes: payload.notes || null,
      _csrf: csrfToken
    };

    console.log('Creating order for eSewa:', orderData);

    const response = await fetch(`${window.API_BASE}/orders.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      credentials: 'include',
      body: JSON.stringify(orderData)
    });

    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Backend response:', result);

    if (result.status === 'success') {
      const orderId = result.data.order_id;
      const orderNumber = result.data.order_number;
      const amount = result.data.total_amount;

      console.log('✅ Order created:', orderNumber);

      // Step 2: Get eSewa v2 payment form data with signature from backend
      console.log('Fetching eSewa payment form data...');
      const paymentInitResponse = await fetch(`${window.API_BASE}/esewa-initiate.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          order_number: orderNumber,
          amount: amount
        })
      });

      const paymentInitResult = await paymentInitResponse.json();
      console.log('Payment init response:', paymentInitResult);

      if (paymentInitResult.status !== 'success') {
        throw new Error(paymentInitResult.message || 'Failed to initiate payment');
      }

      const gatewayUrl = paymentInitResult.data.gateway_url;
      const paymentData = paymentInitResult.data.payment_data;

      console.log('✅ Payment signature generated');
      console.log('Gateway URL:', gatewayUrl);

      // Check if we're in development/testing mode (skip actual eSewa redirect)
      const isDevelopmentMode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const skipEsewaGateway = isDevelopmentMode && confirm('Development Mode: Skip eSewa gateway and simulate successful payment?');

      if (skipEsewaGateway) {
        // Simulate successful payment for testing
        console.log('🧪 DEV MODE: Simulating eSewa v2 success');
        const testParams = new URLSearchParams({
          transaction_code: 'TEST' + Date.now(),
          status: 'COMPLETE',
          total_amount: paymentData.total_amount,
          transaction_uuid: paymentData.transaction_uuid,
          product_code: paymentData.product_code,
          signed_field_names: 'transaction_code,status,total_amount,transaction_uuid,product_code',
          signature: 'test_signature_' + Date.now()
        });
        window.location.href = `payment-success.html?${testParams.toString()}`;
      } else {
        // Step 3: Create and submit form to eSewa v2 gateway
        console.log('Redirecting to eSewa v2 gateway...');

        // Create hidden form
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = gatewayUrl;

        // Add all payment parameters as hidden inputs
        for (const [key, value] of Object.entries(paymentData)) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        }

        // Add form to document and submit
        document.body.appendChild(form);
        console.log('Submitting form to eSewa:', paymentData);
        form.submit();
      }

    } else {
      console.error('❌ Order creation failed:', result.message);
      errBox.innerHTML = '<strong>Order creation failed:</strong><div>• ' + result.message + '</div>';
      errBox.style.display = 'block';
      button.disabled = false;
      button.textContent = originalText;
    }

  } catch (error) {
    console.error('❌ eSewa payment error:', error);
    errBox.innerHTML = '<strong>eSewa payment error:</strong><div>• ' + (error.message || 'Unable to connect to payment gateway. Please try again.') + '</div>';
    errBox.style.display = 'block';
    button.disabled = false;
    button.textContent = originalText;
  }
}

async function processKhaltiPayment(payload, subtotal, button, originalText, errBox) {
  // Khalti integration would go here
  // For now, show placeholder
  errBox.innerHTML = '<strong>Khalti payment:</strong><div>• Khalti integration coming soon. Please use eSewa or COD for now.</div>';
  errBox.style.display = 'block';
  button.disabled = false;
  button.textContent = originalText;
}

async function processDirectPayment(payload, subtotal, button, originalText, errBox) {
  try {
    console.log('=== PAYMENT PROCESSING START ===');
    console.log('Payment method:', payload.paymentMethod);

    // Get CSRF token
    const csrfResponse = await fetch(`${window.API_BASE}/csrf.php`);
    const csrfData = await csrfResponse.json();
    const csrfToken = csrfData.csrf_token;
    console.log('CSRF token obtained:', csrfToken ? 'Yes' : 'No');

    // Prepare order data
    const cart = getCart();
    console.log('Cart items:', cart);

    const orderData = {
      action: 'createOrder',
      customer: {
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        address: payload.address,
        city: payload.city,
        postalCode: payload.postalCode,
        country: payload.country || 'Nepal',
        phone: payload.phone || null,
        billingAddress: payload.useShippingAddress ? payload.address : payload.billingAddress,
        billingCity: payload.useShippingAddress ? payload.city : payload.billingCity,
        billingPostalCode: payload.useShippingAddress ? payload.postalCode : payload.billingPostalCode
      },
      items: cart,
      paymentMethod: payload.paymentMethod,
      notes: payload.notes || null,
      _csrf: csrfToken
    };

    // Send to backend
    console.log('Submitting order to backend:', orderData);

    const response = await fetch(`${window.API_BASE}/orders.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      credentials: 'include',
      body: JSON.stringify(orderData)
    });

    console.log('Response status:', response.status);

    // Get response text first for debugging
    const responseText = await response.text();
    console.log('Raw response:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      throw new Error('Invalid JSON response from server: ' + responseText.substring(0, 200));
    }

    console.log('Backend response:', result);
    console.log('Response data:', JSON.stringify(result.data));

    if (result.status === 'success' && result.data) {
      console.log('✅ Order created successfully:', result.data);

      // Extract order details with fallbacks
      const orderNumber = result.data.order_number || result.data.orderNumber || 'N/A';
      const totalAmount = result.data.total_amount || result.data.totalAmount || subtotal;

      console.log('Order Number:', orderNumber);
      console.log('Total Amount:', totalAmount);
      console.log('Payment Method:', payload.paymentMethod);

      // Clear cart after successful order
      localStorage.removeItem('cart');
      localStorage.removeItem('checkoutInfo');

      // Redirect with all parameters
      const redirectUrl = `thankyou.html?id=${encodeURIComponent(orderNumber)}&amt=${encodeURIComponent(totalAmount)}&method=${encodeURIComponent(payload.paymentMethod)}`;
      console.log('Redirecting to:', redirectUrl);
      window.location.href = redirectUrl;
    } else {
      console.error('❌ Order failed:', result.message);
      console.error('Full error response:', result);

      // Show detailed error message
      let errorMsg = result.message || 'Unknown error occurred';
      if (result.data) {
        errorMsg += '<br><small style="color:#999">Details: ' + JSON.stringify(result.data) + '</small>';
      }

      errBox.innerHTML = '<strong>Order failed:</strong><div>• ' + errorMsg + '</div>';
      errBox.style.display = 'block';
      button.disabled = false;
      button.textContent = originalText;
    }

  } catch (error) {
    console.error('❌ Payment error:', error);
    errBox.innerHTML = '<strong>Payment error:</strong><div>• Network or server error. Please try again.</div>';
    errBox.style.display = 'block';
    button.disabled = false;
    button.textContent = originalText;
  }
}

document.addEventListener('DOMContentLoaded', window.renderPaymentPage);
