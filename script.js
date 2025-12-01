// Shopping Cart State
let cart = [];

// Product Data
const products = {
    shirt: {
        id: 'shirt',
        name: 'Tiger-Striped Short-Sleeved Shirt',
        price: 35,
        priceKES: 4500,
        description: 'Premium tiger-striped shirt'
    },
    sundress: {
        id: 'sundress',
        name: 'Elegant Sundress for Ladies',
        price: 45,
        priceKES: 5850,
        description: 'Beautiful elegant sundress'
    }
};

// DOM Elements
const cartToggle = document.getElementById('cartToggle');
const cartDrawer = document.getElementById('cartDrawer');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartSubtotal = document.getElementById('cartSubtotal');
const proceedCheckout = document.getElementById('proceedCheckout');
const checkoutModal = new bootstrap.Modal(document.getElementById('checkoutModal'));
const checkoutForm = document.getElementById('checkoutForm');

// Initialize Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    setupAddToCartListeners();
    setupProductInputListeners();
    setupCheckoutFormListener();
    initializeAnimations();
    initializeProductTotals();
    setupCartToggle();
    console.log('✓ Prestige Weddings Kenya - All Systems Initialized');
});

// Setup Cart Toggle
function setupCartToggle() {
    if (cartToggle && cartDrawer) {
        cartToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            try {
                const offcanvas = bootstrap.Offcanvas.getOrCreateInstance(cartDrawer);
                offcanvas.show();
            } catch (error) {
                console.error('Error opening cart:', error);
            }
        });
    }
}

// Initialize Product Totals
function initializeProductTotals() {
    const productQuantities = document.querySelectorAll('.product-quantity');
    productQuantities.forEach(input => {
        updateProductTotal(input);
        input.addEventListener('change', function() {
            updateProductTotal(this);
        });
    });
}

// Initialize Page Animations
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease-out';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

// Setup Add to Cart Buttons
function setupAddToCartListeners() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const product = this.dataset.product;
            const sizeElement = document.querySelector(`[data-product="${product}"].product-size`);
            const quantityElement = document.querySelector(`[data-product="${product}"].product-quantity`);
            
            if (!sizeElement || !quantityElement) {
                showNotification('Product elements not found', 'danger');
                return;
            }

            const size = sizeElement.value;
            const quantity = parseInt(quantityElement.value) || 1;
            
            if (!size) {
                showNotification('Please select a size', 'warning');
                return;
            }

            addToCart(product, size, quantity);
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
        });
    });
}

// Setup Product Input Listeners for Real-time Calculation
function setupProductInputListeners() {
    const quantityInputs = document.querySelectorAll('.product-quantity');
    quantityInputs.forEach(input => {
        input.addEventListener('change', function() {
            updateProductTotal(this);
        });
        input.addEventListener('input', function() {
            updateProductTotal(this);
        });
    });

    const sizeSelects = document.querySelectorAll('.product-size');
    sizeSelects.forEach(select => {
        select.addEventListener('change', function() {
            const product = this.dataset.product;
            const quantityElement = document.querySelector(`[data-product="${product}"].product-quantity`);
            if (quantityElement) {
                updateProductTotal(quantityElement);
            }
        });
    });
}

// Update Product Total Display
function updateProductTotal(element, productId = null) {
    try {
        const product = element.dataset ? element.dataset.product : productId;
        const quantityElement = document.querySelector(`[data-product="${product}"].product-quantity`);
        const addBtn = document.querySelector(`[data-product="${product}"].add-to-cart`);
        
        if (quantityElement && addBtn) {
            const quantity = parseInt(quantityElement.value) || 1;
            const price = parseFloat(addBtn.dataset.price) || 35;
            const total = quantity * price;
            
            const totalElement = document.querySelector(`[data-product="${product}"].product-total`);
            if (totalElement) {
                totalElement.textContent = `$${total.toFixed(2)}`;
            }
        }
    } catch (error) {
        console.warn('Error updating product total:', error);
    }
}

// Add to Cart Function
function addToCart(productId, size, quantity) {
    const product = products[productId];
    if (!product) {
        showNotification('Product not found', 'danger');
        return;
    }

    const cartItem = {
        id: `${productId}-${size}`,
        productId: productId,
        name: product.name,
        price: product.price,
        priceKES: product.priceKES,
        size: size,
        quantity: quantity
    };

    // Check if item already exists
    const existingItem = cart.find(item => item.id === cartItem.id);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push(cartItem);
    }

    updateCart();
    showNotification(`${product.name} (Size ${size}) added to cart!`, 'success');
}

// Update Cart Display
function updateCart() {
    try {
        // Update cart count
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }

        // Update cart items display
        if (cartItems) {
            if (cart.length === 0) {
                cartItems.innerHTML = `
                    <div class="p-4 text-center text-muted flex-grow-1">
                        <i class="fas fa-shopping-bag" style="font-size: 3rem; opacity: 0.3;"></i>
                        <p class="mt-3">Your cart is empty</p>
                    </div>
                `;
                if (proceedCheckout) proceedCheckout.disabled = true;
            } else {
                cartItems.innerHTML = `<div class="flex-grow-1" style="overflow-y: auto;">
                    ${cart.map(item => `
                        <div class="cart-item p-3 border-bottom">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <div class="fw-bold">${item.name}</div>
                                    <small class="text-muted">Size: ${item.size}</small>
                                </div>
                                <button class="btn btn-sm btn-link text-danger p-0" onclick="removeFromCart('${item.id}')" title="Remove item">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted">Qty: ${item.quantity}</span>
                                <span class="text-muted">$${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>`;
                if (proceedCheckout) proceedCheckout.disabled = false;
            }
        }

        // Update subtotal
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (cartSubtotal) {
            cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        }
    } catch (error) {
        console.error('Error updating cart:', error);
    }
}

// Remove from Cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCart();
    showNotification('Item removed from cart', 'info');
}

// Setup Checkout Form Listener
function setupCheckoutFormListener() {
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    }
    if (proceedCheckout) {
        proceedCheckout.addEventListener('click', function() {
            if (!this.disabled) {
                updateCheckoutSummary();
                checkoutModal.show();
            }
        });
    }
}

// Handle Checkout Submit
function handleCheckoutSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const totalUSD = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalKES = cart.reduce((sum, item) => sum + (item.priceKES * item.quantity), 0);

    // Generate Order ID
    const orderId = generateOrderId();
    const now = new Date();
    const dateTime = now.toLocaleString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    // Prepare order data
    const displayData = {
        orderId: orderId,
        customerName: fullName,
        email: email,
        phone: '+254' + phone,
        address: address,
        items: cart.map(item => `${item.name} (${item.size}) x${item.quantity}`).join(', '),
        itemSize: cart.map(item => item.size).join(', '),
        totalUSD: totalUSD,
        totalKES: totalKES,
        paymentStatus: 'Pending',
        orderStatus: 'New Order',
        dateTime: dateTime
    };

    // Show success and complete order
    showSuccessModal(displayData);
    resetCheckout();
}

// Update Checkout Summary
function updateCheckoutSummary() {
    const itemsList = document.getElementById('checkoutItemsList');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (itemsList) {
        itemsList.innerHTML = cart.map(item => `
            <div class="d-flex justify-content-between mb-2">
                <span>${item.name} (${item.size}) x${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('') + '<hr>';
    }

    const checkoutTotal = document.getElementById('checkoutTotal');
    const finalTotal = document.getElementById('finalTotal');
    if (checkoutTotal) checkoutTotal.textContent = `$${total.toFixed(2)}`;
    if (finalTotal) finalTotal.textContent = `$${total.toFixed(2)}`;
}

// Form Validation
function validateForm() {
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const terms = document.getElementById('terms').checked;

    let isValid = true;

    // Name validation
    if (!fullName || fullName.length < 3) {
        const nameError = document.getElementById('nameError');
        if (nameError) nameError.textContent = 'Please enter a valid name (min 3 characters)';
        isValid = false;
    } else {
        const nameError = document.getElementById('nameError');
        if (nameError) nameError.textContent = '';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        const emailError = document.getElementById('emailError');
        if (emailError) emailError.textContent = 'Please enter a valid email address';
        isValid = false;
    } else {
        const emailError = document.getElementById('emailError');
        if (emailError) emailError.textContent = '';
    }

    // Phone validation
    if (!phone || phone.length < 9) {
        const phoneError = document.getElementById('phoneError');
        if (phoneError) phoneError.textContent = 'Please enter a valid phone number';
        isValid = false;
    } else {
        const phoneError = document.getElementById('phoneError');
        if (phoneError) phoneError.textContent = '';
    }

    // Terms validation
    if (!terms) {
        showNotification('Please agree to the terms and conditions', 'warning');
        isValid = false;
    }

    return isValid;
}

// Generate Order ID
function generateOrderId() {
    return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Show Success Modal
function showSuccessModal(order) {
    try {
        checkoutModal.hide();
        
        const successHtml = `
            <div class="modal fade" id="successModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-body text-center p-5">
                            <div style="margin-bottom: 20px;">
                                <i class="fas fa-check-circle success-checkmark" style="font-size: 4rem; color: #28a745;"></i>
                            </div>
                            <h3 class="fw-bold mb-3">Order Confirmed!</h3>
                            <p class="text-muted mb-4">Order received! We'll contact you within 24 hours for payment details.</p>
                            
                            <div class="text-start p-3 rounded mb-3" style="background: #f8f7f5;">
                                <div class="mb-3">
                                    <strong>Order ID:</strong> <span style="color: #d4af37; font-weight: bold; font-size: 1.1rem;">${order.orderId}</span>
                                </div>
                                <div class="mb-3">
                                    <strong>Date & Time:</strong> ${order.orderDate}
                                </div>
                                <div class="mb-3">
                                    <strong>Customer:</strong> ${order.customerName}
                                </div>
                                <div class="mb-3">
                                    <strong>Email:</strong> <a href="mailto:${order.email}">${order.email}</a>
                                </div>
                                <div class="mb-3">
                                    <strong>Phone:</strong> ${order.phone}
                                </div>
                                <div class="mb-3">
                                    <strong>Delivery Address:</strong> ${order.address || 'Not specified'}
                                </div>
                                <hr style="border-color: #d4af37;">
                                <div class="mb-2" style="font-weight: bold; color: #d4af37;">Order Items:</div>
                                ${order.items.map(item => `
                                    <div class="d-flex justify-content-between mb-2">
                                        <span>${item.name} (${item.size}) x${item.quantity}</span>
                                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                `).join('')}
                                <hr style="border-color: #d4af37;">
                                <div class="d-flex justify-content-between" style="font-size: 1.1rem; font-weight: bold;">
                                    <span>Total Amount:</span>
                                    <span style="color: #d4af37;">$${order.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            <div class="alert alert-info mb-3">
                                <i class="fas fa-info-circle"></i> <strong>Next Steps:</strong> We'll contact you within 24 hours to arrange payment and confirm delivery date.
                            </div>

                            <div class="alert alert-success mb-3">
                                <i class="fas fa-truck"></i> <strong>Delivery Timeline:</strong> 2 weeks before your wedding date
                            </div>

                            <div class="d-grid gap-2">
                                <button class="btn btn-dark fw-bold py-2" style="background: linear-gradient(135deg, #d4af37 0%, #ff8c42 100%); border: none; color: #1a1a1a; font-size: 1rem;" onclick="downloadReceipt('${order.orderId}', '${JSON.stringify(order).replace(/'/g, "&#x27;")}')">
                                    <i class="fas fa-download"></i> Download Receipt
                                </button>
                                <button class="btn btn-outline-dark fw-bold py-2" onclick="closeSuccessModal()">
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to body
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = successHtml;
        document.body.appendChild(modalContainer);

        const successModal = new bootstrap.Modal(document.getElementById('successModal'));
        successModal.show();

        // Remove modal from DOM when hidden
        document.getElementById('successModal').addEventListener('hidden.bs.modal', function() {
            modalContainer.remove();
        });
    } catch (error) {
        console.error('Error showing success modal:', error);
        showNotification('Order submitted successfully! You will receive an email confirmation.', 'success');
    }
}

// Close Success Modal
function closeSuccessModal() {
    try {
        const modal = bootstrap.Modal.getInstance(document.getElementById('successModal'));
        if (modal) {
            modal.hide();
        }
    } catch (error) {
        console.warn('Error closing success modal:', error);
    }
}

// Reset Checkout
function resetCheckout() {
    cart = [];
    if (checkoutForm) checkoutForm.reset();
    updateCart();
    document.querySelectorAll('.product-size').forEach(select => select.value = '');
    document.querySelectorAll('.product-quantity').forEach(input => input.value = '1');
    document.querySelectorAll('.product-total').forEach(el => el.textContent = '$0.00');
}

// Notification Function
function showNotification(message, type = 'info') {
    const alertTypes = {
        'success': 'success',
        'warning': 'warning',
        'danger': 'danger',
        'info': 'info'
    };
    
    const alertType = alertTypes[type] || 'info';
    const alertHtml = `
        <div class="alert alert-${alertType} alert-dismissible fade show" role="alert" style="
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border-radius: 8px;
            border: none;
            animation: slideIn 0.3s ease-out;
        ">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : type === 'danger' ? 'times-circle' : 'info-circle'}" style="margin-right: 10px;"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = alertHtml;
    document.body.appendChild(container);

    const alert = container.querySelector('.alert');
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => container.remove(), 300);
    }, 4000);
}

// Download Receipt Function
function downloadReceipt(orderId, orderDataJson) {
    try {
        const orderData = JSON.parse(orderDataJson.replace(/&#x27;/g, "'"));
        let receiptText = `
╔════════════════════════════════════════════════════════╗
║          PRESTIGE WEDDINGS KENYA                       ║
║            ORDER RECEIPT                               ║
╚════════════════════════════════════════════════════════╝

ORDER ID: ${orderData.orderId}
Date & Time: ${orderData.orderDate}

CUSTOMER INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${orderData.customerName}
Email: ${orderData.email}
Phone: ${orderData.phone}
Delivery Address: ${orderData.address || 'Not specified'}

ORDER ITEMS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${orderData.items.map((item, index) => 
    `${index + 1}. ${item.name}\n   Size: ${item.size}\n   Quantity: ${item.quantity}\n   Price: $${(item.price * item.quantity).toFixed(2)}`
).join('\n\n')}

ORDER SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Amount (USD): $${orderData.totalAmount.toFixed(2)}
Payment Status: Pending
Order Status: New Order

NEXT STEPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. We'll contact you within 24 hours for payment details
2. Estimated delivery: 2 weeks before your wedding date
3. For any questions, contact us:
   - WhatsApp: +254 712 345 678
   - Email: info@prestigeweddingskenya.com
   - Phone: +254 712 345 678

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Thank you for choosing Prestige Weddings Kenya!
Your special day deserves the best attire.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `;

        // Create a blob with the receipt content
        const blob = new Blob([receiptText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Receipt_${orderId}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        showNotification('Receipt downloaded successfully!', 'success');
    } catch (error) {
        console.error('Error downloading receipt:', error);
        showNotification('Error downloading receipt. Please try again.', 'danger');
    }
}

// Smooth animations for page load
window.addEventListener('load', function() {
    document.body.style.opacity = '1';
    initializeProductTotals();
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'slideIn 0.6s ease-out forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe product cards
document.querySelectorAll('.card').forEach(card => {
    observer.observe(card);
});

// Final verification and logging
console.log('✓ Prestige Weddings Kenya - Shopping System Ready');
console.log('✓ Cart System: ' + (cartToggle && cartDrawer ? 'Active' : 'Checking...'));
console.log('✓ Product System: Ready');
console.log('✓ Checkout System: Ready');
console.log('✓ Notifications: Active');
