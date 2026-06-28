// ===== MOBILE MENU =====
const bar = document.getElementById('bar');
const nav = document.getElementById('navbar');

if (bar) {
    bar.addEventListener('click', () => nav.classList.toggle('active'));
}
document.addEventListener('click', (e) => {
    if (nav && !nav.contains(e.target) && e.target !== bar) {
        nav.classList.remove('active');
    }
});

// ===== SEARCH =====
const searchBtn = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');

if (searchBtn) {
    searchBtn.addEventListener('click', doSearch);
}
if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') doSearch();
    });
}

function doSearch() {
    const q = searchInput?.value?.trim();
    if (q) window.location.href = 'shop.html?q=' + encodeURIComponent(q);
}

// Handle search query on shop page
const urlParams = new URLSearchParams(window.location.search);
const searchQuery = urlParams.get('q');
if (searchQuery && searchInput) {
    searchInput.value = searchQuery;
    filterBySearch(searchQuery);
}

function filterBySearch(q) {
    const products = document.querySelectorAll('#pro-container .pro');
    products.forEach(pro => {
        const name = pro.dataset.name?.toLowerCase() || '';
        const cat = pro.dataset.cat?.toLowerCase() || '';
        pro.style.display = (name.includes(q.toLowerCase()) || cat.includes(q.toLowerCase())) ? '' : 'none';
    });
}

// ===== CART (localStorage) =====
function getCart() {
    try { return JSON.parse(localStorage.getItem('onestop_cart') || '[]'); }
    catch { return []; }
}

function saveCart(cart) {
    localStorage.setItem('onestop_cart', JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('#cart-count, .cart-badge').forEach(el => {
        el.textContent = total;
        el.style.display = total > 0 ? 'flex' : 'none';
    });
}

function addToCart(e, name, price, img) {
    e.preventDefault();
    e.stopPropagation();
    const cart = getCart();
    const existing = cart.find(i => i.name === name);
    if (existing) existing.qty++;
    else cart.push({ name, price, img, qty: 1 });
    saveCart(cart);
    showToast('✓ ' + name + ' added to cart!');
}

// ===== CART PAGE =====
function renderCartPage() {
    const tbody = document.getElementById('cart-body');
    const emptyMsg = document.getElementById('cart-empty');
    if (!tbody) return;

    const cart = getCart();

    if (cart.length === 0) {
        tbody.innerHTML = '';
        if (emptyMsg) emptyMsg.style.display = 'block';
        updateTotals(0);
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';

    tbody.innerHTML = cart.map((item, i) => `
        <tr>
            <td><button class="remove-btn" onclick="removeItem(${i})"><i class="fas fa-times-circle"></i></button></td>
            <td><img src="${item.img}" alt="${item.name}"></td>
            <td>${item.name}</td>
            <td>Rs.${item.price}</td>
            <td><input type="number" value="${item.qty}" min="1"
                onchange="updateQty(${i}, this.value)"
                style="width:70px;padding:6px 8px;border:1px solid #cce7d0;border-radius:4px;text-align:center"></td>
            <td>Rs.${item.price * item.qty}</td>
        </tr>
    `).join('');

    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    updateTotals(subtotal);
}

function updateQty(index, qty) {
    qty = Math.max(1, parseInt(qty) || 1);
    const cart = getCart();
    cart[index].qty = qty;
    saveCart(cart);
    renderCartPage();
}

function removeItem(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCartPage();
    showToast('Item removed from cart');
}

function updateTotals(subtotal) {
    const sub = document.getElementById('subtotal-amount');
    const tot = document.getElementById('total-amount');
    if (sub) sub.textContent = 'Rs.' + subtotal;
    if (tot) tot.innerHTML = '<strong>Rs.' + subtotal + '</strong>';
}

function applyCoupon() {
    const code = document.getElementById('coupon-input')?.value?.trim().toUpperCase();
    if (code === 'SAVE10') showToast('✓ 10% discount applied!');
    else if (code === 'ONESTOP') showToast('✓ Free shipping applied!');
    else showToast('✗ Invalid coupon code');
}

// ===== TOAST =====
function showToast(msg) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s';
        setTimeout(() => toast.remove(), 400);
    }, 2800);
}

// ===== SHOP FILTER =====
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const filter = this.dataset.filter;
        document.querySelectorAll('#pro-container .pro').forEach(pro => {
            pro.style.display = (filter === 'all' || pro.dataset.cat === filter) ? '' : 'none';
        });
    });
});

// Sort select
const sortSelect = document.getElementById('sort-select');
if (sortSelect) {
    sortSelect.addEventListener('change', function () {
        const container = document.getElementById('pro-container');
        if (!container) return;
        const products = [...container.querySelectorAll('.pro')];
        products.sort((a, b) => {
            const pa = parseInt(a.dataset.price) || 0;
            const pb = parseInt(b.dataset.price) || 0;
            const na = a.dataset.name || '';
            const nb = b.dataset.name || '';
            if (this.value === 'price-asc') return pa - pb;
            if (this.value === 'price-desc') return pb - pa;
            if (this.value === 'name') return na.localeCompare(nb);
            return 0;
        });
        products.forEach(p => container.appendChild(p));
    });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    renderCartPage();
});