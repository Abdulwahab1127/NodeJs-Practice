const backdrop = document.querySelector('.backdrop');
const sideDrawer = document.querySelector('.mobile-nav');
const menuToggle = document.querySelector('#side-menu-toggle');

function backdropClickHandler() {
  backdrop.style.display = 'none';
  sideDrawer.classList.remove('open');
}

function menuToggleClickHandler() {
  backdrop.style.display = 'block';
  sideDrawer.classList.add('open');
}

backdrop.addEventListener('click', backdropClickHandler);
menuToggle.addEventListener('click', menuToggleClickHandler);

// Async Delete Product Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Handle delete product
    const deleteForms = document.querySelectorAll('.delete-form');
    
    deleteForms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault(); // Prevent normal form submission
            
            // No confirmation dialog - delete immediately
            
            const productId = this.querySelector('[name="productId"]').value;
            const csrfToken = this.querySelector('[name="_csrf"]').value;
            const productCard = this.closest('.product-item'); // Get the product card
            
            // Show loading state
            const deleteBtn = this.querySelector('button');
            const originalText = deleteBtn.textContent;
            deleteBtn.textContent = 'Deleting...';
            deleteBtn.disabled = true;
            
            try {
                const response = await fetch('/admin/delete-product', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: `productId=${productId}&_csrf=${csrfToken}`
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    // Success - remove the product card with animation
                    productCard.style.transform = 'scale(0.8)';
                    productCard.style.opacity = '0';
                    
                    setTimeout(() => {
                        productCard.remove();
                        showMessage('Product deleted successfully!', 'success');
                    }, 300);
                } else {
                    throw new Error(result.error || 'Failed to delete product');
                }
                
            } catch (error) {
                console.error('Delete error:', error);
                showMessage('Failed to delete product. Please try again.', 'error');
                
                // Reset button state
                deleteBtn.textContent = originalText;
                deleteBtn.disabled = false;
            }
        });
    });
});

// Auto-remove flash messages after 2 seconds
document.addEventListener('DOMContentLoaded', function() {
    const flashMessages = document.querySelectorAll('.success-message.show, .error-message.show');
    
    flashMessages.forEach(message => {
        setTimeout(() => {
            if (message.parentNode) {
                message.style.opacity = '0';
                message.style.transform = 'translateY(-20px)';
                
                setTimeout(() => {
                    message.remove();
                }, 300); // Wait for fade animation
            }
        }, 2000); // Auto-remove after 2 seconds
    });
});

// Helper function to show messages
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message show`;
    messageDiv.innerHTML = `
        <span>${message}</span>
        <button class="close-btn" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Insert at top of main content
    const main = document.querySelector('main');
    main.insertBefore(messageDiv, main.firstChild);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}
