/* =====================================================
   SweetBox - script.js
   Features:
   1. Form validation (SignUp / LogIn)      -> events: submit, input
   2. Shopping cart (Products)              -> events: click, change
   3. Interactive navigation (All pages)    -> events: click, mouseover
   ===================================================== */
 
// Run everything once the page has finished loading.
// Each setup function checks if its elements exist, so one file works on every page.
document.addEventListener("DOMContentLoaded", function () {
    highlightCurrentPage();
    setupMobileMenu();
    setupNavHover();
    setupSignupForm();
    setupLoginForm();
    setupProducts();
    updateCartCount();
});
 
 
/* =====================================================
   FEATURE 3: INTERACTIVE NAVIGATION + NOTIFICATIONS
   ===================================================== */
 
// Highlight the navbar link that matches the current page
function highlightCurrentPage() {
    // Get the last part of the URL, e.g. "Products" or "Products.html"
    let currentPage = window.location.pathname.split("/").pop().toLowerCase();
    currentPage = currentPage.replace(".html", "");
    if (currentPage === "") {
        currentPage = "homepage"; // default page
    }
 
    const navLinks = document.querySelectorAll("nav a");
    navLinks.forEach(function (link) {
        const target = link.getAttribute("href").toLowerCase().replace(".html", "");
        if (target === currentPage) {
            link.classList.add("active"); // styled in style.css
        }
    });
}
 
// Show or hide the mobile menu when the hamburger button is CLICKED
function setupMobileMenu() {
    const menuButton = document.getElementById("menu-toggle");
    const nav = document.getElementById("main-nav");
    if (!menuButton || !nav) return;
 
    menuButton.addEventListener("click", function () {
        nav.classList.toggle("open");
        menuButton.setAttribute("aria-expanded", nav.classList.contains("open"));
        // Change the icon depending on the menu state
        menuButton.textContent = nav.classList.contains("open") ? "✕" : "☰";
    });
}
 
// Change the look of nav links on MOUSEOVER / MOUSEOUT
function setupNavHover() {
    const navLinks = document.querySelectorAll("nav a");
    navLinks.forEach(function (link) {
        link.addEventListener("mouseover", function () {
            link.classList.add("hovered");
        });
        link.addEventListener("mouseout", function () {
            link.classList.remove("hovered");
        });
    });
}
 
// Display a small popup message (toast) that disappears after 2 seconds
function showMessage(text) {
    let toast = document.getElementById("toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.classList.add("show");
 
    setTimeout(function () {
        toast.classList.remove("show");
    }, 2000);
}
 
 
/* =====================================================
   FEATURE 1: FORM VALIDATION (SignUp / LogIn)
   ===================================================== */
 
// Check email format using a regular expression
function isValidEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
}
 
// Show (or clear) an error message under an input field
function setError(input, message) {
    const errorBox = document.getElementById(input.id + "-error");
    if (errorBox) {
        errorBox.textContent = message;
    }
    input.classList.toggle("invalid", message !== "");
}
 
// Validate ONE field. Returns true if valid, false if not.
function validateField(input) {
    const value = input.value.trim();
 
    // 1. Check for empty fields
    if (value === "") {
        setError(input, "This field is required.");
        return false;
    }
 
    // 2. Validate the email format
    if (input.type === "email" && !isValidEmail(value)) {
        setError(input, "Please enter a valid email (example@mail.com).");
        return false;
    }
 
    // 3. Password length rule
    if (input.id === "password" && input.dataset.checkLength && value.length < 6) {
        setError(input, "Password must be at least 6 characters.");
        return false;
    }
 
    // 4. Confirm that passwords match (signup only)
    if (input.id === "confirm-password") {
        const password = document.getElementById("password").value;
        if (value !== password) {
            setError(input, "Passwords do not match.");
            return false;
        }
    }
 
    setError(input, ""); // no problems found
    return true;
}
 
// Show a success or error message at the bottom of the form
function showFormMessage(text, isSuccess) {
    const box = document.getElementById("form-message");
    if (!box) return;
    box.textContent = text;
    box.className = isSuccess ? "form-message success" : "form-message error-msg";
}
 
// ---- SIGN UP ----
function setupSignupForm() {
    const form = document.getElementById("signup-form");
    if (!form) return;
 
    const fields = form.querySelectorAll("input");
 
    // INPUT event: validate while the user is typing
    fields.forEach(function (field) {
        field.addEventListener("input", function () {
            validateField(field);
            // If the password changes, re-check the confirm field too
            if (field.id === "password") {
                const confirm = document.getElementById("confirm-password");
                if (confirm.value !== "") validateField(confirm);
            }
        });
    });
 
    // SUBMIT event: validate everything before saving
    form.addEventListener("submit", function (event) {
        event.preventDefault(); // stop the page from reloading
 
        let allValid = true;
        fields.forEach(function (field) {
            if (!validateField(field)) allValid = false;
        });
 
        if (!allValid) {
            showFormMessage("Please fix the errors above.", false);
            return;
        }
 
        // Save the new user in localStorage (demo only - never store real passwords like this)
        const user = {
            name: document.getElementById("name").value.trim(),
            email: document.getElementById("email").value.trim().toLowerCase(),
            password: document.getElementById("password").value
        };
        localStorage.setItem("sweetboxUser", JSON.stringify(user));
 
        showFormMessage("Account created! Welcome to SweetBox, " + user.name + "!", true);
        form.reset();
    });
}
 
// ---- LOG IN ----
function setupLoginForm() {
    const form = document.getElementById("login-form");
    if (!form) return;
 
    const fields = form.querySelectorAll("input");
 
    fields.forEach(function (field) {
        field.addEventListener("input", function () {
            validateField(field);
        });
    });
 
    form.addEventListener("submit", function (event) {
        event.preventDefault();
 
        let allValid = true;
        fields.forEach(function (field) {
            if (!validateField(field)) allValid = false;
        });
        if (!allValid) {
            showFormMessage("Please fix the errors above.", false);
            return;
        }
 
        // Compare with the account saved during sign up
        const savedUser = JSON.parse(localStorage.getItem("sweetboxUser"));
        const email = document.getElementById("email").value.trim().toLowerCase();
        const password = document.getElementById("password").value;
 
        if (savedUser && savedUser.email === email && savedUser.password === password) {
            localStorage.setItem("sweetboxLoggedIn", "true");
            showFormMessage("Login successful! Welcome back, " + savedUser.name + "!", true);
        } else {
            showFormMessage("Incorrect email or password.", false);
        }
    });
}
 
 
/* =====================================================
   FEATURE 2: SHOPPING CART (Products page)
   ===================================================== */
 
// Get the cart array from localStorage (or an empty array if nothing saved)
function getCart() {
    try {
        return JSON.parse(localStorage.getItem("sweetboxCart")) || [];
    } catch (error) {
        return [];
    }
}
 
// Save the cart array to localStorage
function saveCart(cart) {
    localStorage.setItem("sweetboxCart", JSON.stringify(cart));
}
 
// Add a product to the cart (or increase quantity if it is already there)
function addToCart(id, name, price) {
    const cart = getCart();
    const existing = cart.find(function (item) {
        return item.id === id;
    });
 
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id: id, name: name, price: price, qty: 1 });
    }
 
    saveCart(cart);
    renderCart();
    updateCartCount();
    showMessage(name + " added to cart!");
}
 
// Calculate the total price using a loop
function calculateTotal(cart) {
    let total = 0;
    for (let i = 0; i < cart.length; i++) {
        total += cart[i].price * cart[i].qty;
    }
    return total;
}
 
// Update the little cart number in the navbar
function updateCartCount() {
    const badge = document.getElementById("cart-count");
    if (!badge) return;
 
    const cart = getCart();
    let count = 0;
    cart.forEach(function (item) {
        count += item.qty;
    });
    badge.textContent = count;
}
 
// Draw the cart contents on the page
function renderCart() {
    const cartBox = document.getElementById("cart-items");
    const totalBox = document.getElementById("cart-total");
    if (!cartBox || !totalBox) return;
 
    const cart = getCart();
 
    if (cart.length === 0) {
        cartBox.innerHTML = "<p>Your cart is empty.</p>";
        totalBox.textContent = "Total: ₱0.00";
        return;
    }
 
    let html = "";
    cart.forEach(function (item) {
        html += '<div class="cart-row">' +
                    '<span class="cart-name">' + item.name + '</span>' +
                    '<span>₱' + item.price.toFixed(2) + '</span>' +
                    '<input type="number" class="qty-input" min="1" value="' + item.qty + '" data-id="' + item.id + '">' +
                    '<button class="remove-btn" data-id="' + item.id + '">Remove</button>' +
                '</div>';
    });
    cartBox.innerHTML = html;
    totalBox.textContent = "Total: ₱" + calculateTotal(cart).toFixed(2);
}
 
function setupProducts() {
    const productList = document.getElementById("product-list");
    const cartBox = document.getElementById("cart-items");
    if (!productList || !cartBox) return;
 
    renderCart(); // show anything saved from a previous visit
 
    // CLICK event on "Add to Cart" buttons
    productList.addEventListener("click", function (event) {
        if (event.target.classList.contains("add-btn")) {
            const card = event.target.closest(".product-card");
            addToCart(
                card.dataset.id,
                card.dataset.name,
                parseFloat(card.dataset.price)
            );
        }
    });
 
    // MOUSEOVER event: highlight the product card under the mouse
    productList.addEventListener("mouseover", function (event) {
        const card = event.target.closest(".product-card");
        if (card) card.classList.add("hovered");
    });
    productList.addEventListener("mouseout", function (event) {
        const card = event.target.closest(".product-card");
        if (card) card.classList.remove("hovered");
    });
 
    // CHANGE event: update the quantity when the number input changes
    cartBox.addEventListener("change", function (event) {
        if (event.target.classList.contains("qty-input")) {
            const id = event.target.dataset.id;
            let newQty = parseInt(event.target.value);
            if (isNaN(newQty) || newQty < 1) newQty = 1;
 
            const cart = getCart();
            cart.forEach(function (item) {
                if (item.id === id) item.qty = newQty;
            });
            saveCart(cart);
            renderCart();
            updateCartCount();
        }
    });
 
    // CLICK event on "Remove" buttons
    cartBox.addEventListener("click", function (event) {
        if (event.target.classList.contains("remove-btn")) {
            const id = event.target.dataset.id;
            const cart = getCart().filter(function (item) {
                return item.id !== id;
            });
            saveCart(cart);
            renderCart();
            updateCartCount();
            showMessage("Item removed from cart.");
        }
    });
 
    // CLICK event on "Clear Cart"
    const clearBtn = document.getElementById("clear-cart");
    if (clearBtn) {
        clearBtn.addEventListener("click", function () {
            saveCart([]);
            renderCart();
            updateCartCount();
            showMessage("Cart cleared.");
        });
    }
}
