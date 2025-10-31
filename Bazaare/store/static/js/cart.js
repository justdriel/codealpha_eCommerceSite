// store/static/js/cart.js

document.addEventListener('DOMContentLoaded', () => {
    
    // Helper function to retrieve the CSRF token from cookies
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                let cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.startsWith(name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    const csrftoken = getCookie('csrftoken');

    // --- 1. Add to Cart Logic ---
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const productSlug = e.target.getAttribute('data-slug');
            const quantityInput = document.querySelector('.product-detail-container #quantity');
            
            // Get quantity from the input field if it exists (on detail page), otherwise default to 1
            let quantity = 1;
            if (quantityInput) {
                // Ensure quantity is a valid number greater than 0
                const inputVal = parseInt(quantityInput.value);
                quantity = (inputVal > 0) ? inputVal : 1; 
            }

            try {
                const response = await fetch('/api/cart/add/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrftoken 
                    },
                    body: JSON.stringify({ product_slug: productSlug, quantity: quantity })
                });

                const data = await response.json();

                if (response.ok) {
                    alert(`Item(s) added to cart! Cart total: ${data.total_items} items.`);
                    // After adding, refresh the cart if we're on the cart page
                    if (document.getElementById('cart-display')) {
                        fetchCart();
                    }
                } else {
                    alert(`Error adding to cart: ${data.error || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Fetch error during Add to Cart:', error);
                alert('A network error occurred while adding to cart.');
            }
        });
    });

    // --- 2. Fetch and Render Cart (for cart.html) ---
    const cartDisplay = document.getElementById('cart-display');
    
    if (cartDisplay) {
        
        // Function to fetch cart data from the API
        async function fetchCart() {
            try {
                const response = await fetch('/api/cart/');
                if (response.ok) {
                    const cart = await response.json();
                    renderCart(cart);
                } else {
                    cartDisplay.innerHTML = '<p class="error-message">Error loading cart data.</p>';
                }
            } catch (error) {
                console.error('Failed to fetch cart:', error);
                cartDisplay.innerHTML = '<p class="error-message">Could not load cart data. Please check connection.</p>';
            }
        }

        // Function to render the cart data into the HTML grid
        function renderCart(cart) {
            // Check if cart is empty
            if (!cart || !cart.items || cart.total_items === 0) {
                cartDisplay.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
                return;
            }

            let html = '<div class="cart-grid-container">';
            
            cart.items.forEach(item => {
                // Use safe defaults for all dynamic data points to prevent crashes
                const imageUrl = item.product_image_url || '/static/assets/images/placeholder.png';
                const price = parseFloat(item.product_price || 0).toFixed(2);
                const subtotal = parseFloat(item.subtotal || 0).toFixed(2);
                const name = item.product_name || 'Missing Product';
                const slug = item.product_slug || '#';

                html += `
                    <div class="cart-item-card">
                        <a href="/products/${slug}/" class="item-link">
                            <img src="${imageUrl}" alt="${name}" class="item-image">
                            
                            <div class="item-details">
                                <h4 class="item-name">${name}</h4>
                                <p class="item-price">Price: NGN ${price}</p>
                                <p class="item-quantity">Quantity: ${item.quantity}</p>
                            </div>
                        </a>
                        <div class="item-subtotal">
                            Subtotal: <span class="subtotal-amount">NGN ${subtotal}</span>
                        </div>
                        
                        </div>
                `;
            });
            
            html += `</div>`; // Close the cart-grid-container

            // Add the cart summary section
            html += `
                     <div class="cart-summary-footer">
                        <h3>Cart Total:</h3>
                        <p class="total-price">NGN ${parseFloat(cart.total_price || 0).toFixed(2)}</p>
                        <a href="/checkout/"><button class="btn-primary checkout-btn">Proceed to Checkout</button></a>
                     </div>`;
            
            // Inject the generated HTML into the display element
            cartDisplay.innerHTML = html;
        }

        // Initiate the cart loading when the page loads
        fetchCart();
    }
});