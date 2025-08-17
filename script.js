/* ملف JavaScript الرئيسي - script.js */

// ========== المتغيرات العامة ==========
let cart = [];
let currentLanguage = 'ar';
let currentUser = null;
let products = {};

// ========== تحميل البيانات ==========
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        products = await response.json();
        console.log('تم تحميل بيانات المنتجات بنجاح');
    } catch (error) {
        console.error('خطأ في تحميل بيانات المنتجات:', error);
        // بيانات احتياطية في حالة فشل التحميل
        products = {
            yemenServices: [],
            categories: {},
            paymentMethods: []
        };
    }
}

// ========== إدارة المستخدمين ==========

// عرض نافذة تسجيل الدخول
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// إخفاء نافذة تسجيل الدخول
function hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// التبديل بين نموذج تسجيل الدخول وإنشاء الحساب
function toggleAuthForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const modalTitle = document.getElementById('modalTitle');
    
    if (loginForm.classList.contains('hidden')) {
        // إظهار نموذج تسجيل الدخول
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        modalTitle.textContent = 'تسجيل الدخول';
    } else {
        // إظهار نموذج إنشاء الحساب
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        modalTitle.textContent = 'إنشاء حساب جديد';
    }
}

// تسجيل الدخول
function login() {
    const phone = document.getElementById('loginPhone').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    // التحقق من صحة البيانات
    if (!validatePhone(phone)) {
        showFormError('loginPhone', 'رقم الهاتف غير صحيح');
        return;
    }
    
    if (!password) {
        showFormError('loginPassword', 'كلمة المرور مطلوبة');
        return;
    }
    
    // محاكاة عملية تسجيل الدخول
    const userData = {
        name: 'المستخدم',
        phone: phone
    };
    
    setCurrentUser(userData);
    hideLoginModal();
    showNotification('تم تسجيل الدخول بنجاح', 'success');
    
    // مسح النموذج
    document.getElementById('loginPhone').value = '';
    document.getElementById('loginPassword').value = '';
}

// إنشاء حساب جديد
function register() {
    const name = document.getElementById('registerName').value.trim();
    const phone = document.getElementById('registerPhone').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    const confirmPassword = document.getElementById('registerConfirmPassword').value.trim();
    
    // التحقق من صحة البيانات
    if (!name) {
        showFormError('registerName', 'الاسم مطلوب');
        return;
    }
    
    if (!validatePhone(phone)) {
        showFormError('registerPhone', 'رقم الهاتف غير صحيح');
        return;
    }
    
    if (password.length < 6) {
        showFormError('registerPassword', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        return;
    }
    
    if (password !== confirmPassword) {
        showFormError('registerConfirmPassword', 'كلمة المرور غير متطابقة');
        return;
    }
    
    // محاكاة عملية إنشاء الحساب
    const userData = {
        name: name,
        phone: phone
    };
    
    setCurrentUser(userData);
    hideLoginModal();
    showNotification('تم إنشاء الحساب بنجاح', 'success');
    
    // مسح النموذج
    document.getElementById('registerName').value = '';
    document.getElementById('registerPhone').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('registerConfirmPassword').value = '';
}

// تعيين المستخدم الحالي
function setCurrentUser(userData) {
    currentUser = userData;
    localStorage.setItem('currentUser', JSON.stringify(userData));
    updateUserInterface();
}

// تحديث واجهة المستخدم
function updateUserInterface() {
    const loginBtn = document.getElementById('loginBtn');
    const userProfile = document.getElementById('userProfile');
    const userDisplayName = document.getElementById('userDisplayName');
    const menuUserName = document.getElementById('menuUserName');
    const menuUserPhone = document.getElementById('menuUserPhone');
    
    if (currentUser) {
        loginBtn.classList.add('hidden');
        userProfile.classList.remove('hidden');
        userDisplayName.textContent = currentUser.name;
        menuUserName.textContent = currentUser.name;
        menuUserPhone.textContent = currentUser.phone;
    } else {
        loginBtn.classList.remove('hidden');
        userProfile.classList.add('hidden');
    }
}

// تسجيل الخروج
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUserInterface();
    hideUserMenu();
    showNotification('تم تسجيل الخروج بنجاح', 'success');
}

// إظهار/إخفاء قائمة المستخدم
function toggleUserMenu() {
    const userMenu = document.getElementById('userMenu');
    userMenu.classList.toggle('hidden');
}

function hideUserMenu() {
    const userMenu = document.getElementById('userMenu');
    userMenu.classList.add('hidden');
}

// عرض طلبات المستخدم
function showUserOrders() {
    hideUserMenu();
    showNotification('قريباً: صفحة الطلبات', 'info');
}

// عرض الملف الشخصي
function showUserProfile() {
    hideUserMenu();
    showNotification('قريباً: الملف الشخصي', 'info');
}

// ========== إدارة السلة ==========

// إضافة منتج للسلة
function addToCart(product) {
    const existingItem = cart.find(item => item.name === product.name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1,
            id: Date.now() // معرف فريد
        });
    }
    
    updateCartBadge();
    showNotification('تم إضافة المنتج للسلة', 'success');
}

// إزالة منتج من السلة
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartBadge();
    updateCartDisplay();
    showNotification('تم إزالة المنتج من السلة', 'success');
}

// تحديث كمية المنتج في السلة
function updateCartQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            updateCartBadge();
            updateCartDisplay();
        }
    }
}

// تحديث شارة السلة
function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (totalItems > 0) {
        badge.textContent = totalItems;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// إظهار/إخفاء السلة
function toggleCart() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.classList.toggle('hidden');
        updateCartDisplay();
    }
}

// تحديث عرض السلة
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L5 3H3m4 10v6a1 1 0 001 1h10a1 1 0 001-1v-6m-6 6V13"/>
                </svg>
                <p>السلة فارغة</p>
            </div>
        `;
        cartTotal.textContent = '0 ريال';
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item flex items-center justify-between p-3 border-b border-gray-200">
            <div class="flex-1">
                <h4 class="font-semibold text-sm">${item.name}</h4>
                <p class="text-xs text-gray-600">${item.type || 'منتج'}</p>
                <p class="text-sm font-bold text-blue-600">${item.price} ريال</p>
            </div>
            <div class="flex items-center space-x-2 space-x-reverse">
                <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})" 
                        class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300">
                    <span class="text-lg">-</span>
                </button>
                <span class="w-8 text-center font-semibold">${item.quantity}</span>
                <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})" 
                        class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300">
                    <span class="text-lg">+</span>
                </button>
                <button onclick="removeFromCart(${item.id})" 
                        class="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 mr-2">
                    <span class="text-sm">×</span>
                </button>
            </div>
        </div>
    `).join('');
    
    cartTotal.textContent = `${total} ريال`;
}

// إرسال الطلب
function submitOrder() {
    if (cart.length === 0) {
        showNotification('السلة فارغة', 'error');
        return;
    }
    
    const customerName = document.getElementById('cartCustomerName').value.trim();
    const customerPhone = document.getElementById('cartCustomerPhone').value.trim();
    const paymentMethod = document.getElementById('cartPaymentMethod').value;
    
    if (!customerName) {
        showNotification('الاسم مطلوب', 'error');
        return;
    }
    
    if (!validatePhone(customerPhone)) {
        showNotification('رقم الهاتف غير صحيح', 'error');
        return;
    }
    
    // إنشاء رسالة الطلب
    const orderDetails = cart.map(item => 
        `${item.name} - الكمية: ${item.quantity} - السعر: ${item.price * item.quantity} ريال`
    ).join('\n');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const paymentMethodName = paymentMethod === 'omflous' ? 'تحويل عبر أم فلوس' : 'دفع نقدي';
    
    const message = `طلب جديد:\n\nالاسم: ${customerName}\nالهاتف: ${customerPhone}\n\nتفاصيل الطلب:\n${orderDetails}\n\nالإجمالي: ${total} ريال\nطريقة الدفع: ${paymentMethodName}`;
    
    // إرسال عبر الواتساب
    const whatsappUrl = `https://wa.me/967774235220?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // مسح السلة والنموذج
    cart = [];
    updateCartBadge();
    document.getElementById('cartCustomerName').value = '';
    document.getElementById('cartCustomerPhone').value = '';
    document.getElementById('cartPaymentMethod').value = 'omflous';
    toggleCart();
    
    showNotification('تم إرسال الطلب بنجاح', 'success');
}

// ========== إدارة الصفحات ==========

// إخفاء جميع الصفحات
function hideAllPages() {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    
    // إعادة تعيين أزرار التنقل
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.className = 'nav-btn flex items-center flex-1 justify-center px-4 py-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all text-sm';
    });
}

// عرض الصفحة الرئيسية
function showHome() {
    hideAllPages();
    document.getElementById('homePage').classList.remove('hidden');
    
    // تحديث زر التنقل
    const homeBtn = document.querySelector('button[onclick="showHome(); return false;"]');
    if (homeBtn) {
        homeBtn.className = 'nav-btn flex items-center flex-1 justify-center px-4 py-1.5 text-blue-600 font-semibold border-b-2 border-blue-600 bg-blue-50 text-sm';
    }
}

// عرض خدمات اليمن
function showYemenServices() {
    hideAllPages();
    document.getElementById('yemenPage').classList.remove('hidden');
    displayYemenServices();
    
    // تحديث زر التنقل
    const yemenBtn = document.querySelector('button[onclick="showYemenServices(); return false;"]');
    if (yemenBtn) {
        yemenBtn.className = 'nav-btn flex items-center flex-1 justify-center px-4 py-1.5 text-blue-600 font-semibold border-b-2 border-blue-600 bg-blue-50 text-sm';
    }
}

// عرض خدمات اليمن
function displayYemenServices() {
    const container = document.getElementById('yemenServicesContainer');
    if (!container || !products.yemenServices) return;
    
    // تجميع المنتجات حسب الفئة
    const groupedProducts = {};
    products.yemenServices.forEach(product => {
        if (!groupedProducts[product.category]) {
            groupedProducts[product.category] = [];
        }
        groupedProducts[product.category].push(product);
    });
    
    // عرض المنتجات
    let html = '';
    Object.keys(groupedProducts).forEach(categoryKey => {
        const category = products.categories[categoryKey];
        const categoryProducts = groupedProducts[categoryKey];
        
        html += `
            <div class="mb-8">
                <div class="flex items-center mb-4">
                    <span class="text-2xl ml-2">${category.icon}</span>
                    <h3 class="text-xl font-bold text-gray-800">${category.name}</h3>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${categoryProducts.map(product => `
                        <div class="product-card">
                            ${product.isPopular ? '<div class="product-badge">الأكثر طلباً</div>' : ''}
                            <div class="p-4">
                                <h4 class="font-bold text-lg mb-2">${product.name}</h4>
                                <p class="text-gray-600 text-sm mb-3">${product.description}</p>
                                <div class="space-y-2 mb-4">
                                    ${product.features.map(feature => `
                                        <div class="flex items-center text-sm text-gray-600">
                                            <span class="w-2 h-2 bg-green-500 rounded-full ml-2"></span>
                                            ${feature}
                                        </div>
                                    `).join('')}
                                </div>
                                <div class="flex items-center justify-between mb-4">
                                    <div>
                                        <span class="text-2xl font-bold text-blue-600">${product.price}</span>
                                        <span class="text-sm text-gray-600"> ريال</span>
                                        ${product.originalPrice ? `
                                            <div class="text-sm text-gray-400 line-through">${product.originalPrice} ريال</div>
                                        ` : ''}
                                    </div>
                                    ${product.discount ? `
                                        <div class="bg-red-500 text-white px-2 py-1 rounded text-sm">
                                            خصم ${product.discount}%
                                        </div>
                                    ` : ''}
                                </div>
                                <button onclick="addToCart({id: '${product.id}', name: '${product.name}', price: ${product.price}, type: '${category.name}'})" 
                                        class="btn-primary">
                                    أضف للسلة
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ========== الوظائف المساعدة ==========

// التحقق من صحة رقم الهاتف
function validatePhone(phone) {
    const phoneRegex = /^(\+967|967|0)?[0-9]{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// عرض خطأ في النموذج
function showFormError(inputId, message) {
    const input = document.getElementById(inputId);
    const errorElement = input.parentNode.querySelector('.form-error');
    
    input.classList.add('error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
    
    // إزالة الخطأ عند الكتابة
    input.addEventListener('input', function() {
        input.classList.remove('error');
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    }, { once: true });
}

// عرض الإشعارات
function showNotification(message, type = 'info') {
    // إزالة الإشعارات السابقة
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // إنشاء إشعار جديد
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="flex items-center">
            <div class="flex-1">
                <p class="font-semibold text-sm">${message}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="text-gray-400 hover:text-gray-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // إظهار الإشعار
    setTimeout(() => notification.classList.add('show'), 100);
    
    // إخفاء الإشعار تلقائياً
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// تبديل اللغة
function toggleLanguage() {
    currentLanguage = currentLanguage === 'ar' ? 'en' : 'ar';
    document.getElementById('currentLang').textContent = currentLanguage === 'ar' ? 'العربية' : 'English';
    // يمكن إضافة المزيد من منطق تغيير اللغة هنا
}

// ========== التهيئة ==========

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تحميل بيانات المنتجات
    loadProducts();
    
    // استرجاع بيانات المستخدم من التخزين المحلي
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUserInterface();
    }
    
    // إضافة مستمعي الأحداث
    setupEventListeners();
    
    // عرض الصفحة الرئيسية
    showHome();
});

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // إغلاق النوافذ المنبثقة عند النقر خارجها
    document.addEventListener('click', function(event) {
        const userMenu = document.getElementById('userMenu');
        const userProfile = document.getElementById('userProfile');
        
        if (userMenu && !userMenu.classList.contains('hidden') && 
            !userProfile.contains(event.target)) {
            hideUserMenu();
        }
        
        // إغلاق نافذة تسجيل الدخول عند النقر على الخلفية
        const loginModal = document.getElementById('loginModal');
        if (loginModal && event.target === loginModal) {
            hideLoginModal();
        }
    });
    
    // التعامل مع مفتاح Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            hideLoginModal();
            hideUserMenu();
        }
    });
}

// ========== وظائف إضافية ==========

// فتح رابط الواتساب
function openWhatsApp(message = 'مرحباً، أريد الاستفسار عن خدماتكم') {
    const whatsappUrl = `https://wa.me/967774235220?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// مشاركة المنتج
function shareProduct(productName, productPrice) {
    const message = `شاهد هذا المنتج الرائع: ${productName} بسعر ${productPrice} ريال فقط!`;
    const url = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: productName,
            text: message,
            url: url
        });
    } else {
        // نسخ الرابط للحافظة
        navigator.clipboard.writeText(`${message} ${url}`).then(() => {
            showNotification('تم نسخ معلومات المنتج', 'success');
        });
    }
}



// ========== وظائف التنقل ==========

// إخفاء جميع الصفحات
function hideAllPages() {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.add('hidden'));
}

// عرض الصفحة الرئيسية
function showHome() {
    hideAllPages();
    document.getElementById('homePage').classList.remove('hidden');
}

// عرض صفحة خدمات اليمن
function showYemenServices() {
    hideAllPages();
    document.getElementById('yemenPage').classList.remove('hidden');
    loadYemenProducts();
}

// تحميل وعرض منتجات اليمن
function loadYemenProducts() {
    const container = document.getElementById('yemenServicesContainer');
    if (!container || !products.yemenServices) return;
    
    container.innerHTML = `
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${products.yemenServices.map(product => `
                <div class="product-card">
                    ${product.isPopular ? '<div class="product-badge">الأكثر مبيعاً</div>' : ''}
                    <div class="p-6">
                        <div class="text-center mb-4">
                            <div class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span class="text-2xl">📶</span>
                            </div>
                            <h3 class="text-lg font-bold text-gray-800 mb-2">${product.name}</h3>
                            <p class="text-gray-600 text-sm mb-3">${product.description}</p>
                        </div>
                        
                        <div class="text-center mb-4">
                            <div class="flex items-center justify-center space-x-2 space-x-reverse">
                                <span class="text-2xl font-bold text-blue-600">${product.price}</span>
                                <span class="text-sm text-gray-500">ريال</span>
                                ${product.originalPrice ? `<span class="text-sm text-gray-400 line-through mr-2">${product.originalPrice}</span>` : ''}
                            </div>
                            ${product.discount ? `<div class="text-xs text-green-600 font-semibold">خصم ${product.discount}%</div>` : ''}
                            <div class="text-xs text-gray-500 mt-1">المدة: ${product.duration}</div>
                        </div>
                        
                        <div class="mb-4">
                            <h4 class="text-sm font-semibold text-gray-700 mb-2">المميزات:</h4>
                            <ul class="text-xs text-gray-600 space-y-1">
                                ${product.features.map(feature => `<li>• ${feature}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <button onclick="addToCart({id: '${product.id}', name: '${product.name}', price: ${product.price}, type: 'خدمات اليمن'})" class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                            إضافة للسلة
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// تبديل عرض السلة
function toggleCart() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        if (cartModal.classList.contains('hidden')) {
            cartModal.classList.remove('hidden');
            updateCartDisplay();
        } else {
            cartModal.classList.add('hidden');
        }
    }
}

// إرسال طلب السلة عبر الواتساب
function sendCartOrder() {
    submitOrder();
}
