import { supabase, getUserProducts, getAllMarketProducts, getProductById, createProduct, updateProduct, deleteProduct, addToCart, getCartItems, removeFromCart, createPurchase, sendMessage } from './supabase.js'
import { getCurrentUser, logout, loginManual, loginWithGoogle, loginWithGitHub, registerManual, forgotPassword, verifyOTPAndReset } from './auth.js'

let currentUser = null
window.allMarketProducts = []
window.myProducts = []
window.productPriceType = 'free'
window.uploadedImages = []
window.uploadedThumbnail = null
window.uploadedVideo = null
window.additionalProducts = []
window.cartItems = []

document.addEventListener('DOMContentLoaded', () => {
  currentUser = getCurrentUser()
  setupHeader()
  handleRouting()
})

window.addEventListener('hashchange', () => handleRouting())

function handleRouting() {
  const hash = window.location.hash.replace('#', '') || 'home'
  const content = document.getElementById('dynamic-content')
  if (!content) return
  
  if (currentUser && (currentUser.is_deleted || currentUser.is_banned)) {
    renderBannedPage(content); return
  }
  
  if (hash.startsWith('view/')) {
    const username = hash.replace('view/', '')
    renderViewPage(content, username); return
  }
  if (hash.startsWith('product-detail/')) {
    const productId = hash.replace('product-detail/', '')
    renderProductDetail(content, productId); return
  }
  
  switch(hash) {
    case 'home': renderHomePage(content); break
    case 'upgrade': renderUpgradePage(content); break
    case 'service': case 'about': renderAboutPage(content); break
    case 'contact': renderContactPage(content); break
    case 'sign': case 'register': renderRegisterPage(content); break
    case 'login': renderLoginPage(content); break
    case 'forgot-password': renderForgotPasswordPage(content); break
    case 'complete-profile': renderCompleteProfilePage(content); break
    case 'dashboard': renderDashboard(content); break
    case 'market': renderMarketPage(content); break
    case 'upload': renderUploadPage(content); break
    case 'file': renderFilePage(content); break
    case 'cart': renderCartPage(content); break
    case 'statistics': renderStatisticsPage(content); break
    case 'profile': renderProfilePage(content); break
    case 'terms': renderTermsPage(content); break
    case 'privacy': renderPrivacyPage(content); break
    case 'privacy-policy': renderPrivacyPolicyPage(content); break
    case 'sitemap': renderSitemapPage(content); break
    case 'terms-of-use': renderTermsOfUsePage(content); break
    case 'banned': renderBannedPage(content); break
    default: renderHomePage(content); break
  }
}

function setupHeader() {
  const hb = document.getElementById('header-buttons')
  if (currentUser && !currentUser.is_deleted && !currentUser.is_banned) {
    hb.innerHTML = '<a href="#dashboard" onclick="navigateTo(\'dashboard\')" class="btn-diz px-4 py-2 rounded-lg text-sm">Dashboard</a><button onclick="logout()" class="glass-card px-4 py-2 rounded-lg text-sm hover:bg-red-600/30">Logout</button>'
  } else {
    hb.innerHTML = '<button onclick="navigateTo(\'sign\')" class="btn-diz px-6 py-2 rounded-xl pulse font-bold text-sm">SIGN UP FREE</button>'
  }
}

window.toggleSidebar = function() {
  const sidebar = document.getElementById('sidebar')
  if (sidebar.style.transform === 'translateX(0px)') {
    sidebar.style.transform = 'translateX(100%)'
  } else {
    sidebar.style.transform = 'translateX(0px)'
  }
}

window.navigateTo = function(page, params) {
  if (params?.productId) window.location.hash = 'product-detail/' + params.productId
  else if (params?.username) window.location.hash = 'view/' + params.username
  else window.location.hash = page
}

window.showModal = function(content, title) {
  document.getElementById('modal-content').innerHTML = '<div class="flex justify-between items-center mb-6"><h3 class="text-2xl font-bold gradient-text">' + title + '</h3><button onclick="closeModal()" class="text-3xl text-blue-300 hover:text-white">X</button></div>' + content
  document.getElementById('modal-overlay').classList.remove('hidden')
}

window.closeModal = function() {
  document.getElementById('modal-overlay').classList.add('hidden')
}

function showNotification(message, type) {
  const colors = { success: 'bg-green-500/20 border-green-500 text-green-400', error: 'bg-red-500/20 border-red-500 text-red-400', info: 'bg-blue-500/20 border-blue-500 text-blue-400' }
  const n = document.createElement('div')
  n.className = 'fixed top-20 right-4 z-50 px-6 py-4 rounded-xl border ' + (colors[type] || colors.info) + ' glass backdrop-blur-lg animate-slide-in max-w-md'
  n.innerHTML = '<p>' + message + '</p>'
  document.body.appendChild(n)
  setTimeout(() => { n.style.opacity = '0'; n.style.transition = 'opacity 0.5s'; setTimeout(() => n.remove(), 500) }, 4000)
}

// HOME PAGE
function renderHomePage(container) {
  container.innerHTML = '<div class="text-center py-16 animate-slide-in"><h1 class="text-6xl md:text-8xl font-bold gradient-text mb-6">BUY ITEM</h1><p class="text-xl text-blue-300/80 mb-12 max-w-2xl mx-auto">Buat project untuk dijual. Produk digital. Bagikan di media sosial dan dark web.</p><div class="flex justify-center gap-6 mb-16"><button onclick="navigateTo(\'' + (currentUser ? 'upload' : 'sign') + '\')" class="btn-diz px-10 py-4 rounded-xl text-xl font-bold pulse">MULAI</button></div><div class="max-w-xl mx-auto mb-16"><div class="input-diz rounded-xl p-3 flex items-center"><span class="text-blue-300 font-bold mr-2">dizmarx/</span><input type="text" id="search-url" placeholder="linkuseryoudizmarx" class="bg-transparent flex-1 text-blue-200 outline-none"><button onclick="searchUserByUrl()" class="text-blue-400 hover:text-white ml-2">CARI</button></div><div id="search-result" class="mt-4"></div></div></div>'
}

window.searchUserByUrl = function() {
  const username = document.getElementById('search-url')?.value?.trim()
  if (username) navigateTo('view', { username })
}

// REGISTER PAGE
function renderRegisterPage(container) {
  container.innerHTML = '<div class="max-w-md mx-auto py-12 animate-slide-in"><div class="text-center mb-8"><img src="https://i.ibb.co.com/208z05FD/1777297574810.png" alt="DIZMARX" class="h-24 w-24 mx-auto rounded-full mb-4"><h2 class="text-2xl font-bold gradient-text">Metode Pendaftaran</h2></div><div class="space-y-4"><button onclick="loginWithGoogle()" class="w-full glass-card p-4 rounded-xl flex items-center justify-center gap-3 hover:bg-blue-600/30 transition"><i class="fab fa-google text-2xl"></i><span class="text-lg"><i class="fab fa-google"></i> Lanjutkan dengan Google</span></button><button onclick="loginWithGitHub()" class="w-full glass-card p-4 rounded-xl flex items-center justify-center gap-3 hover:bg-blue-600/30 transition"><i class="fab fa-github text-2xl"></i><span class="text-lg"><i class="fab fa-github"></i> Lanjutkan dengan GitHub</span></button><div class="text-center text-blue-300 mt-4">Sudah memiliki akun? <span onclick="navigateTo(\'login\')" class="text-blue-400 cursor-pointer hover:underline">Login</span></div></div></div>'
}

// LOGIN PAGE
function renderLoginPage(container) {
  container.innerHTML = '<div class="max-w-md mx-auto py-12 animate-slide-in"><div class="text-center mb-8"><img src="https://i.ibb.co.com/208z05FD/1777297574810.png" alt="DIZMARX" class="h-24 w-24 mx-auto rounded-full mb-4"><h2 class="text-2xl font-bold gradient-text">Masuk ke Akun Anda</h2></div><div class="space-y-4"><input type="text" id="login-email" placeholder="Nama pengguna atau email Anda" class="input-diz w-full p-4 rounded-xl text-lg"><div class="relative"><input type="password" id="login-password" placeholder="Kata Sandi Anda" class="input-diz w-full p-4 rounded-xl text-lg pr-12"><button onclick="togglePw(\'login-password\')" class="absolute right-4 top-4 text-blue-300 hover:text-white"><i class="fas fa-eye"></i></button></div><div class="text-right"><span onclick="navigateTo(\'forgot-password\')" class="text-blue-400 text-sm cursor-pointer hover:underline">Lupa kata sandi?</span></div><button onclick="handleLogin()" class="btn-diz w-full p-4 rounded-xl text-xl font-bold mt-4">MASUK</button><div class="text-center mt-4"><button onclick="loginWithGoogle()" class="w-full glass-card p-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600/30 transition text-sm"><span>G</span> <i class="fab fa-google"></i> Lanjutkan dengan Google</button></div><div class="text-center text-blue-300 mt-4">Belum punya akun? <span onclick="navigateTo(\'sign\')" class="text-blue-400 cursor-pointer hover:underline">Daftar</span></div></div></div>'
}

window.handleLogin = async function() {
  const email = document.getElementById('login-email')?.value
  const password = document.getElementById('login-password')?.value
  const result = await loginManual(email, password)
  if (result.error) { showNotification(result.error, 'error') }
  else { showNotification('Login berhasil', 'success'); currentUser = result.user; setupHeader(); setTimeout(() => navigateTo('dashboard'), 1000) }
}

window.togglePw = function(id) {
  const el = document.getElementById(id)
  el.type = el.type === 'password' ? 'text' : 'password'
}

// FORGOT PASSWORD
function renderForgotPasswordPage(container) {
  container.innerHTML = '<div class="max-w-md mx-auto py-12 animate-slide-in"><div class="text-center mb-8"><img src="https://i.ibb.co.com/208z05FD/1777297574810.png" alt="DIZMARX" class="h-24 w-24 mx-auto rounded-full mb-4"><h2 class="text-2xl font-bold gradient-text">Forgot Password</h2></div><input type="text" id="forgot-email" placeholder="Enter Your Email/username" class="input-diz w-full p-4 rounded-xl text-lg mb-4"><button onclick="handleForgotPassword()" class="btn-diz w-full p-4 rounded-xl text-xl font-bold mb-4">Reset Password</button><div id="forgot-otp-section" class="hidden"><input type="text" id="forgot-otp" placeholder="Kode OTP" class="input-diz w-full p-4 rounded-xl text-lg mb-4"><input type="password" id="new-password" placeholder="Password baru" class="input-diz w-full p-4 rounded-xl text-lg mb-4"><button onclick="handleResetPassword()" class="btn-diz w-full p-4 rounded-xl text-xl font-bold">Simpan Password Baru</button></div></div>'
}

window.handleForgotPassword = async function() {
  const email = document.getElementById('forgot-email')?.value
  const result = await forgotPassword(email)
  if (result.error) { showNotification(result.error, 'error') }
  else { window.resetUserId = result.userId; document.getElementById('forgot-otp-section').classList.remove('hidden'); showNotification(result.message, 'success') }
}

window.handleResetPassword = async function() {
  const otp = document.getElementById('forgot-otp')?.value
  const newPw = document.getElementById('new-password')?.value
  const result = await verifyOTPAndReset(window.resetUserId, otp, newPw)
  if (result.error) { showNotification(result.error, 'error') }
  else { showNotification(result.message, 'success'); setTimeout(() => navigateTo('login'), 1500) }
}

// COMPLETE PROFILE
function renderCompleteProfilePage(container) {
  const temp = JSON.parse(localStorage.getItem('dizmarx_temp_user') || '{}')
  container.innerHTML = '<div class="max-w-lg mx-auto py-12 animate-slide-in"><div class="text-center mb-8"><img src="https://i.ibb.co.com/208z05FD/1777297574810.png" alt="DIZMARX" class="h-24 w-24 mx-auto rounded-full mb-4"><h2 class="text-2xl font-bold gradient-text">Mohon isi semua kolom yang wajib diisi</h2></div><div class="space-y-4"><div class="input-diz rounded-xl p-3 flex items-center"><span class="text-blue-300 font-bold">dizmarx/</span><input type="text" id="profile-username" placeholder="nama pengguna anda" class="bg-transparent flex-1 text-blue-200 outline-none"></div><p class="text-red-400 text-sm -mt-2">Ini akan menjadi URL halaman Anda: dizmarx/username</p><div class="relative"><input type="password" id="profile-password" placeholder="Kata Sandi Anda" class="input-diz w-full p-4 rounded-xl text-lg pr-12"></div><p class="text-red-400 text-sm -mt-2">Kata sandi harus minimal 6 karakter, harus mengandung angka, huruf kecil, dan huruf besar.</p><div class="relative"><input type="password" id="profile-confirm-password" placeholder="Konfirmasi sandi anda" class="input-diz w-full p-4 rounded-xl text-lg pr-12"></div><div class="flex gap-2"><select id="country-code" class="input-diz p-4 rounded-xl text-lg w-1/3"><option value="+62">RI +62</option><option value="+1">US +1</option><option value="+44">UK +44</option><option value="+81">JP +81</option><option value="+86">CN +86</option><option value="+91">IN +91</option></select><input type="tel" id="profile-phone" placeholder="81234567890" class="input-diz flex-1 p-4 rounded-xl text-lg"></div><div class="flex items-center gap-3"><input type="checkbox" id="agree-terms" class="w-5 h-5 accent-blue-500"><label for="agree-terms" class="text-blue-300">Saya setuju dengan Terms of use</label></div><button onclick="handleCompleteProfile(\'' + (temp.id || '') + '\')" class="btn-diz w-full p-4 rounded-xl text-xl font-bold mt-4">Mengonfirmasi</button></div></div>'
}

window.handleCompleteProfile = async function(userId) {
  const username = document.getElementById('profile-username')?.value?.trim()
  const password = document.getElementById('profile-password')?.value
  const confirm = document.getElementById('profile-confirm-password')?.value
  const phone = document.getElementById('profile-phone')?.value?.trim()
  const countryCode = document.getElementById('country-code')?.value
  const agree = document.getElementById('agree-terms')?.checked
  
  if (!username || !phone) { showNotification('Username dan nomor telepon wajib diisi', 'error'); return }
  if (password && password !== confirm) { showNotification('Password tidak sama', 'error'); return }
  if (!agree) { showNotification('Anda harus menyetujui Terms of Use', 'error'); return }
  
  const updates = { username, phone, country_code: countryCode }
  
  if (password) {
    const encoder = new TextEncoder()
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password))
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    updates.password_hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
  
  const { error } = await supabase.from('users').update(updates).eq('id', userId)
  if (error) { showNotification('Gagal: ' + error.message, 'error'); return }
  
  localStorage.removeItem('dizmarx_temp_user')
  const { data: user } = await supabase.from('users').select('*').eq('id', userId).single()
  localStorage.setItem('dizmarx_user', JSON.stringify(user))
  currentUser = user
  setupHeader()
  showNotification('Profil berhasil dibuat. Link Anda: dizmarx/' + username, 'success')
  setTimeout(() => navigateTo('dashboard'), 1500)
}

// DASHBOARD
function renderDashboard(container) {
  if (!currentUser) { navigateTo('login'); return }
  container.innerHTML = '<div class="animate-slide-in"><div class="text-center mb-12"><img src="' + (currentUser.avatar_url || 'https://i.ibb.co.com/208z05FD/1777297574810.png') + '" alt="DIZMARX" class="h-24 w-24 mx-auto rounded-full mb-4"><h2 class="text-3xl font-bold gradient-text">Selamat Datang, ' + (currentUser.full_name || currentUser.username || 'User') + '</h2><p class="text-blue-300 mt-2">Kelola produk digital Anda di sini</p><p class="text-blue-400 text-sm mt-1">Link profil Anda: <span class="text-white cursor-pointer" onclick="copyProfileLink()">dizmarx.netlify.app/#view/' + currentUser.username + '</span></p></div><div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"><button onclick="navigateTo(\'upload\')" class="glass-card p-6 rounded-2xl text-center hover:scale-105 transition"><div class="text-4xl mb-3">[+]</div><p class="text-lg font-bold">Upload</p></button><button onclick="navigateTo(\'market\')" class="glass-card p-6 rounded-2xl text-center hover:scale-105 transition"><div class="text-4xl mb-3">[M]</div><p class="text-lg font-bold">Market</p></button><button onclick="navigateTo(\'file\')" class="glass-card p-6 rounded-2xl text-center hover:scale-105 transition"><div class="text-4xl mb-3">[F]</div><p class="text-lg font-bold">File</p></button><button onclick="navigateTo(\'statistics\')" class="glass-card p-6 rounded-2xl text-center hover:scale-105 transition"><div class="text-4xl mb-3">[S]</div><p class="text-lg font-bold">Statistik</p></button></div><button onclick="loadNotifications()" class="btn-diz w-full py-3 rounded-xl mb-8 font-bold">NOTIFIKASI PESAN</button><div id="dashboard-products" class="grid grid-cols-1 md:grid-cols-3 gap-4"><p class="text-blue-300 text-center col-span-full">Loading produk...</p></div></div>'
  loadDashboardProducts()
}

window.copyProfileLink = function() {
  navigator.clipboard.writeText(window.location.origin + '/#view/' + currentUser.username)
  showNotification('Link profil disalin', 'success')
}

async function loadDashboardProducts() {
  const { data: products } = await getUserProducts(currentUser.id)
  const grid = document.getElementById('dashboard-products')
  if (!products || products.length === 0) { grid.innerHTML = '<p class="text-blue-300 text-center col-span-full">Belum ada produk. <span onclick="navigateTo(\'upload\')" class="text-blue-400 cursor-pointer hover:underline">Upload sekarang</span></p>'; return }
  window.myProducts = products
  grid.innerHTML = products.slice(0, 6).map(p => '<div class="glass-card p-4 rounded-xl cursor-pointer" onclick="navigateTo(\'product-detail\', { productId: \'' + p.id + '\' })"><img src="' + (p.thumbnail_url || 'https://i.ibb.co.com/208z05FD/1777297574810.png') + '" alt="' + p.title + '" class="w-full h-40 object-cover rounded-lg mb-3" onerror="this.src=\'https://i.ibb.co.com/208z05FD/1777297574810.png\'"><h4 class="font-bold truncate">' + p.title + '</h4><p class="text-sm text-blue-300">' + (p.is_free ? 'FREE' : 'Rp' + (p.discount_price || p.price)?.toLocaleString()) + '</p></div>').join('')
}

window.loadNotifications = async function() {
  const { data: messages } = await supabase.from('messages').select('*').eq('sender_email', currentUser.email).order('created_at', { ascending: false })
  let html = ''
  if (messages && messages.length > 0) {
    html = messages.map(m => '<div class="glass-card p-4 rounded-xl mb-3"><p class="text-xs text-blue-400">' + new Date(m.created_at).toLocaleString() + '</p><p class="text-sm text-blue-200">Pesan: ' + m.message + '</p>' + (m.reply ? '<p class="text-sm text-green-400 mt-1">Balasan: ' + m.reply + '</p>' : '<p class="text-xs text-yellow-400">Menunggu balasan...</p>') + '</div>').join('')
  } else {
    html = '<p class="text-blue-300">Belum ada notifikasi</p>'
  }
  showModal(html, 'NOTIFIKASI')
}

// MARKET PAGE
function renderMarketPage(container) {
  container.innerHTML = '<div class="animate-slide-in"><div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"><h2 class="text-3xl font-bold gradient-text">MARKET</h2><div class="flex gap-4"><input type="text" id="market-search" placeholder="Cari produk..." class="input-diz rounded-xl px-4 py-3 flex-1" onkeyup="filterMarket()"><select id="market-filter" onchange="filterMarket()" class="input-diz rounded-xl px-4 py-3"><option value="all">Semua</option><option value="free">FREE</option><option value="paid">Berbayar</option></select></div></div><div id="market-grid" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"><p class="text-blue-300 text-center col-span-full">Loading...</p></div></div>'
  loadMarket()
}

async function loadMarket() {
  const { data } = await getAllMarketProducts()
  window.allMarketProducts = data || []
  displayMarket(window.allMarketProducts)
}

function displayMarket(products) {
  const grid = document.getElementById('market-grid')
  if (!products || products.length === 0) { grid.innerHTML = '<p class="text-blue-300 text-center col-span-full">Belum ada produk</p>'; return }
  grid.innerHTML = products.map(p => '<div class="glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition cursor-pointer" onclick="navigateTo(\'product-detail\', { productId: \'' + p.id + '\' })"><div class="h-48 bg-diz-700"><img src="' + (p.thumbnail_url || 'https://i.ibb.co.com/208z05FD/1777297574810.png') + '" alt="' + p.title + '" class="w-full h-full object-cover" onerror="this.src=\'https://i.ibb.co.com/208z05FD/1777297574810.png\'"></div><div class="p-4"><h4 class="font-bold truncate">' + p.title + '</h4><p class="text-sm text-blue-300 truncate">' + (p.description || '').substring(0, 60) + '</p><div class="flex justify-between items-center mt-3"><span class="font-bold text-blue-400">' + (p.is_free ? 'FREE' : 'Rp' + (p.discount_price || p.price)?.toLocaleString()) + '</span><span class="text-xs text-blue-400">' + (p.views_count || 0) + ' views</span></div></div></div>').join('')
}

window.filterMarket = function() {
  const search = (document.getElementById('market-search')?.value || '').toLowerCase()
  const filter = document.getElementById('market-filter')?.value || 'all'
  let products = [...window.allMarketProducts]
  if (search) products = products.filter(p => p.title.toLowerCase().includes(search))
  if (filter === 'free') products = products.filter(p => p.is_free)
  if (filter === 'paid') products = products.filter(p => !p.is_free)
  displayMarket(products)
}

// PRODUCT DETAIL
function renderProductDetail(container, productId) {
  getProductById(productId).then(({ data: p }) => {
    if (!p) { container.innerHTML = '<p class="text-center py-20 text-red-400">Produk tidak ditemukan</p>'; return }
    supabase.rpc('increment_views', { product_id: productId })
    const images = [p.thumbnail_url, ...(p.images || [])].filter(Boolean)
    container.innerHTML = '<div class="animate-slide-in max-w-5xl mx-auto"><button onclick="navigateTo(\'market\')" class="text-blue-400 hover:text-white mb-6">Kembali ke Market</button><div class="grid grid-cols-1 md:grid-cols-2 gap-8"><div><div class="glass-card rounded-2xl overflow-hidden h-96"><img src="' + (images[0] || 'https://i.ibb.co.com/208z05FD/1777297574810.png') + '" id="main-img" class="w-full h-full object-cover" onerror="this.src=\'https://i.ibb.co.com/208z05FD/1777297574810.png\'"></div>' + (images.length > 1 ? '<div class="flex gap-2 mt-2 overflow-x-auto">' + images.map((img, i) => '<img src="' + img + '" onclick="document.getElementById(\'main-img\').src=\'' + img + '\'" class="w-16 h-16 object-cover rounded-lg cursor-pointer border-2 ' + (i === 0 ? 'border-blue-500' : 'border-transparent') + '" onerror="this.src=\'https://i.ibb.co.com/208z05FD/1777297574810.png\'">').join('') + '</div>' : '') + '</div><div class="space-y-4"><h1 class="text-3xl font-bold gradient-text">' + p.title + '</h1><div class="glass-card p-4 rounded-xl"><span class="text-3xl font-bold ' + (p.is_free ? 'text-green-400' : 'text-blue-400') + '">' + (p.is_free ? 'FREE' : 'Rp' + (p.discount_price || p.price)?.toLocaleString()) + '</span>' + (p.discount_price ? '<span class="price-cut text-lg ml-3">Rp' + p.price.toLocaleString() + '</span>' : '') + '</div><div class="glass-card p-4 rounded-xl"><h4 class="font-bold mb-3">Deskripsi</h4><p class="text-blue-200 whitespace-pre-wrap">' + (p.description || 'Tidak ada deskripsi') + '</p></div><button onclick="orderProduct(\'' + p.id + '\')" class="btn-diz w-full py-4 rounded-xl text-lg font-bold pulse">' + (p.is_free ? 'DAPATKAN GRATIS' : 'ORDER SEKARANG') + '</button></div></div></div>'
  })
}

window.orderProduct = async function(productId) {
  if (!currentUser) { navigateTo('login'); return }
  const { data: p } = await getProductById(productId)
  if (p.is_free) {
    await createPurchase({ product_id: productId, buyer_id: currentUser.id })
    supabase.rpc('increment_purchase', { product_id: productId })
    showNotification('Produk gratis berhasil diklaim', 'success')
  } else {
    if (p.users?.phone) window.open('https://wa.me/' + p.users.phone.replace(/\+/g, '') + '?text=Halo%20saya%20ingin%20membeli%20' + encodeURIComponent(p.title), '_blank')
    else showNotification('Nomor penjual tidak tersedia', 'error')
  }
}

// UPLOAD PAGE
function renderUploadPage(container) {
  if (!currentUser) { navigateTo('login'); return }
  if (currentUser.is_suspended) { container.innerHTML = '<p class="text-center py-20 text-red-400">Akun disuspen. Tidak bisa upload.</p>'; return }
  const isPro = currentUser.is_pro && (!currentUser.pro_expiry || new Date(currentUser.pro_expiry) > new Date())
  container.innerHTML = '<div class="animate-slide-in max-w-2xl mx-auto"><h2 class="text-3xl font-bold gradient-text mb-8 text-center">UPLOAD PRODUK BARU</h2><div class="space-y-6"><div class="glass-card p-6 rounded-2xl"><label class="block font-bold mb-3">Sampul Produk</label><div onclick="document.getElementById(\'thumb-input\').click()" class="border-2 border-dashed border-blue-500/50 rounded-xl p-8 text-center cursor-pointer"><div id="thumb-preview" class="text-4xl mb-2">+</div><p class="text-blue-300">Klik untuk upload sampul</p></div><input type="file" id="thumb-input" accept="image/*" class="hidden" onchange="previewThumb(this)"></div><div class="glass-card p-6 rounded-2xl"><label class="block font-bold mb-3">Foto Produk (Max ' + (isPro ? '10' : '5') + ')</label><div id="images-grid" class="grid grid-cols-5 gap-3"><div class="border-2 border-dashed border-blue-500/50 rounded-xl h-24 flex items-center justify-center cursor-pointer" onclick="document.getElementById(\'images-input\').click()"><span class="text-2xl text-blue-400">+</span></div></div><input type="file" id="images-input" accept="image/*" multiple class="hidden" onchange="previewImages(this)"></div><div class="glass-card p-6 rounded-2xl space-y-4"><input type="text" id="prod-title" placeholder="Nama produk" class="input-diz w-full p-4 rounded-xl"><textarea id="prod-desc" rows="4" placeholder="Deskripsi" class="input-diz w-full p-4 rounded-xl"></textarea><input type="file" id="prod-file" class="input-diz w-full p-4 rounded-xl"></div><div class="glass-card p-6 rounded-2xl"><label class="block font-bold mb-3">Harga</label><div class="flex gap-4 mb-4"><button onclick="setPrice(\'free\')" id="btn-free" class="flex-1 py-3 rounded-xl border border-blue-500/50 font-bold btn-diz">FREE</button><button onclick="setPrice(\'paid\')" id="btn-paid" class="flex-1 py-3 rounded-xl border border-blue-500/50 font-bold">BERBAYAR</button></div><div id="price-fields" class="hidden space-y-3"><input type="number" id="prod-price" placeholder="Harga" class="input-diz w-full p-3 rounded-lg"><input type="number" id="prod-discount" placeholder="Harga diskon" class="input-diz w-full p-3 rounded-lg"><input type="text" id="prod-code" placeholder="Kode akses" class="input-diz w-full p-3 rounded-lg"><input type="tel" id="prod-phone" placeholder="No WhatsApp" class="input-diz w-full p-3 rounded-lg"></div></div><button onclick="submitProduct()" class="btn-diz w-full py-4 rounded-xl text-xl font-bold pulse">UPLOAD PRODUK</button></div></div>'
  window.productPriceType = 'free'
  window.uploadedImages = []
  window.uploadedThumbnail = null
}

window.setPrice = function(type) {
  window.productPriceType = type
  if (type === 'free') {
    document.getElementById('btn-free').classList.add('btn-diz')
    document.getElementById('btn-paid').classList.remove('btn-diz')
    document.getElementById('price-fields').classList.add('hidden')
  } else {
    document.getElementById('btn-paid').classList.add('btn-diz')
    document.getElementById('btn-free').classList.remove('btn-diz')
    document.getElementById('price-fields').classList.remove('hidden')
  }
}

window.previewThumb = function(input) {
  const file = input.files[0]
  if (!file) return
  window.uploadedThumbnail = file
  const reader = new FileReader()
  reader.onload = e => { document.getElementById('thumb-preview').innerHTML = '<img src="' + e.target.result + '" class="w-full h-48 object-cover rounded-lg">' }
  reader.readAsDataURL(file)
}

window.previewImages = function(input) {
  const files = Array.from(input.files)
  const isPro = currentUser?.is_pro
  const max = isPro ? 10 : 5
  if (window.uploadedImages.length + files.length > max) { showNotification('Max ' + max + ' foto', 'error'); return }
  files.forEach(f => {
    window.uploadedImages.push(f)
    const reader = new FileReader()
    reader.onload = e => {
      const div = document.createElement('div')
      div.className = 'relative'
      div.innerHTML = '<img src="' + e.target.result + '" class="w-full h-24 object-cover rounded-lg"><button onclick="this.parentElement.remove()" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs">X</button>'
      document.getElementById('images-grid').insertBefore(div, document.getElementById('images-grid').lastElementChild)
    }
    reader.readAsDataURL(f)
  })
}

window.submitProduct = async function() {
  const title = document.getElementById('prod-title')?.value?.trim()
  const desc = document.getElementById('prod-desc')?.value?.trim()
  if (!title || !desc) { showNotification('Nama dan deskripsi wajib diisi', 'error'); return }
  if (!window.uploadedThumbnail) { showNotification('Sampul wajib diupload', 'error'); return }
  
  let thumbUrl = ''
  const imageUrls = []
  let fileUrl = ''
  
  try {
    const thumbFile = window.uploadedThumbnail
    const thumbName = 'thumbnails/' + currentUser.id + '/' + Date.now() + '_' + thumbFile.name
    await supabase.storage.from('products').upload(thumbName, thumbFile)
    thumbUrl = supabase.storage.from('products').getPublicUrl(thumbName).data.publicUrl
    
    for (const img of window.uploadedImages) {
      const imgName = 'images/' + currentUser.id + '/' + Date.now() + '_' + img.name
      await supabase.storage.from('products').upload(imgName, img)
      imageUrls.push(supabase.storage.from('products').getPublicUrl(imgName).data.publicUrl)
    }
    
    const prodFile = document.getElementById('prod-file')?.files[0]
    if (prodFile) {
      const fileName = 'files/' + currentUser.id + '/' + Date.now() + '_' + prodFile.name
      await supabase.storage.from('products').upload(fileName, prodFile)
      fileUrl = supabase.storage.from('products').getPublicUrl(fileName).data.publicUrl
    }
  } catch(err) {
    showNotification('Upload gagal: ' + err.message, 'error'); return
  }
  
  const isFree = window.productPriceType === 'free'
  const productData = {
    user_id: currentUser.id, title, description: desc,
    thumbnail_url: thumbUrl, images: imageUrls,
    product_file_url: fileUrl, is_free: isFree,
    price: isFree ? 0 : parseInt(document.getElementById('prod-price')?.value || 0),
    discount_price: isFree ? null : parseInt(document.getElementById('prod-discount')?.value || null),
    access_code: document.getElementById('prod-code')?.value?.trim() || null,
    seller_phone: document.getElementById('prod-phone')?.value?.trim() || currentUser.phone,
    views_count: 0, checkout_count: 0, purchase_count: 0, is_active: true
  }
  
  const { error } = await createProduct(productData)
  if (error) { showNotification('Gagal: ' + error.message, 'error') }
  else { showNotification('Produk berhasil diupload', 'success'); setTimeout(() => navigateTo('file'), 1500) }
}

// FILE PAGE
function renderFilePage(container) {
  if (!currentUser) { navigateTo('login'); return }
  container.innerHTML = '<div class="animate-slide-in"><div class="flex justify-between mb-8"><h2 class="text-3xl font-bold gradient-text">FILE SAYA</h2><button onclick="navigateTo(\'upload\')" class="btn-diz px-6 py-3 rounded-xl">UPLOAD BARU</button></div><div id="file-list" class="grid grid-cols-1 md:grid-cols-3 gap-6"><p class="text-blue-300 col-span-full">Loading...</p></div></div>'
  loadFiles()
}

async function loadFiles() {
  const { data } = await getUserProducts(currentUser.id)
  window.myProducts = data || []
  const list = document.getElementById('file-list')
  if (!window.myProducts.length) { list.innerHTML = '<p class="text-blue-300 col-span-full">Belum ada produk</p>'; return }
  list.innerHTML = window.myProducts.map(p => '<div class="glass-card rounded-2xl overflow-hidden"><img src="' + (p.thumbnail_url || 'https://i.ibb.co.com/208z05FD/1777297574810.png') + '" class="w-full h-48 object-cover" onerror="this.src=\'https://i.ibb.co.com/208z05FD/1777297574810.png\'"><div class="p-4"><h4 class="font-bold truncate">' + p.title + '</h4><p class="text-sm text-blue-300">' + (p.is_free ? 'FREE' : 'Rp' + (p.discount_price || p.price)?.toLocaleString()) + '</p><div class="flex gap-2 mt-3"><button onclick="editProductForm(\'' + p.id + '\')" class="btn-diz flex-1 py-2 rounded-lg text-sm">EDIT</button><button onclick="deleteProductConfirm(\'' + p.id + '\')" class="glass-card flex-1 py-2 rounded-lg text-sm text-red-400">HAPUS</button></div></div></div>').join('')
}

window.editProductForm = function(productId) {
  const p = window.myProducts.find(p => p.id === productId)
  if (!p) return
  showModal('<div class="space-y-3"><input type="text" id="edit-title" value="' + p.title + '" class="input-diz w-full p-3 rounded-lg"><textarea id="edit-desc" class="input-diz w-full p-3 rounded-lg">' + (p.description || '') + '</textarea><input type="number" id="edit-price" value="' + (p.price || 0) + '" class="input-diz w-full p-3 rounded-lg"><input type="text" id="edit-code" value="' + (p.access_code || '') + '" class="input-diz w-full p-3 rounded-lg"><button onclick="saveEdit(\'' + p.id + '\')" class="btn-diz w-full py-3 rounded-xl font-bold">SIMPAN</button></div>', 'EDIT PRODUK')
}

window.saveEdit = async function(productId) {
  const updates = {
    title: document.getElementById('edit-title')?.value,
    description: document.getElementById('edit-desc')?.value,
    price: parseInt(document.getElementById('edit-price')?.value || 0),
    access_code: document.getElementById('edit-code')?.value || null
  }
  const { error } = await updateProduct(productId, updates)
  if (error) { showNotification('Gagal', 'error') }
  else { showNotification('Berhasil diupdate', 'success'); closeModal(); loadFiles() }
}

window.deleteProductConfirm = function(productId) {
  if (confirm('Yakin hapus produk ini?')) {
    deleteProduct(productId).then(() => { showNotification('Dihapus', 'success'); loadFiles() })
  }
}

// VIEW PAGE
function renderViewPage(container, username) {
  supabase.from('users').select('*').eq('username', username).single().then(({ data: user }) => {
    if (!user) { container.innerHTML = '<p class="text-center py-20 text-blue-300">User tidak ditemukan</p>'; return }
    supabase.from('products').select('*').eq('user_id', user.id).eq('is_active', true).order('created_at', { ascending: false }).then(({ data: products }) => {
      container.innerHTML = '<div class="animate-slide-in max-w-4xl mx-auto"><div class="h-64 rounded-2xl overflow-hidden mb-4 bg-diz-700">' + (user.cover_url ? '<img src="' + user.cover_url + '" class="w-full h-full object-cover">' : '<div class="w-full h-full bg-gradient-to-r from-diz-600 to-diz-800"></div>') + '</div><div class="glass-card p-6 rounded-2xl -mt-20 relative z-10 mx-4 mb-8"><div class="flex flex-col md:flex-row items-center gap-6"><img src="' + (user.avatar_url || 'https://i.ibb.co.com/208z05FD/1777297574810.png') + '" class="w-32 h-32 rounded-full object-cover border-4 border-diz-800 -mt-20"><div class="text-center md:text-left"><h1 class="text-3xl font-bold gradient-text">' + (user.full_name || user.username) + '</h1><p class="text-blue-300 text-lg">dizmarx/' + user.username + '</p><p class="text-blue-200 mt-2">' + (user.bio || 'Tidak ada bio') + '</p></div></div>' + (user.phone ? '<div class="mt-4 text-center"><a href="https://wa.me/' + user.phone.replace(/\+/g, '') + '" target="_blank" class="btn-diz px-8 py-3 rounded-xl inline-block"><i class="fab fa-whatsapp"></i></a></div>' : '') + '</div><h3 class="text-2xl font-bold gradient-text mb-6">Produk</h3><div class="grid grid-cols-1 md:grid-cols-3 gap-6">' + (products && products.length > 0 ? products.map(p => '<div class="glass-card rounded-2xl overflow-hidden cursor-pointer" onclick="navigateTo(\'product-detail\', { productId: \'' + p.id + '\' })"><img src="' + (p.thumbnail_url || 'https://i.ibb.co.com/208z05FD/1777297574810.png') + '" class="w-full h-48 object-cover" onerror="this.src=\'https://i.ibb.co.com/208z05FD/1777297574810.png\'"><div class="p-4"><h4 class="font-bold truncate">' + p.title + '</h4><p class="text-blue-400 font-bold mt-2">' + (p.is_free ? 'FREE' : 'Rp' + (p.discount_price || p.price)?.toLocaleString()) + '</p></div></div>').join('') : '<p class="text-blue-300 col-span-full text-center py-8">Belum ada produk</p>') + '</div></div>'
    })
  })
}

// ABOUT, CONTACT, TERMS, PRIVACY, SITEMAP, TERMS OF USE (ringkas)
function renderAboutPage(container) {
  container.innerHTML = '<div class="max-w-2xl mx-auto py-12 text-center"><img src="https://i.ibb.co.com/208z05FD/1777297574810.png" class="h-24 w-24 mx-auto rounded-full mb-6"><h2 class="text-3xl font-bold gradient-text mb-8">ABOUT US</h2><div class="glass-card p-6 rounded-2xl mb-6"><p class="text-blue-200">DIZMARX adalah platform jual beli produk digital.</p></div><div class="glass-card p-6 rounded-2xl"><h3 class="font-bold mb-4">Kirim Pesan</h3><textarea id="about-msg" rows="4" maxlength="500" placeholder="Tulis pesan (max 500 karakter)" class="input-diz w-full p-4 rounded-xl mb-3"></textarea><p class="text-xs text-blue-400 mb-3"><span id="about-count">0</span>/500</p><button onclick="sendAboutMsg()" class="btn-diz w-full py-3 rounded-xl font-bold">KIRIM</button></div></div>'
  document.getElementById('about-msg').addEventListener('input', function() { document.getElementById('about-count').textContent = this.value.length })
}

window.sendAboutMsg = async function() {
  const msg = document.getElementById('about-msg')?.value?.trim()
  if (!msg) { showNotification('Pesan kosong', 'error'); return }
  await sendMessage({ sender_email: currentUser?.email || 'anon@diz.com', sender_name: currentUser?.full_name || 'Anon', message: msg })
  showNotification('Pesan terkirim. Diproses 1-5 menit.', 'success')
  document.getElementById('about-msg').value = ''
}

function renderContactPage(container) {
  container.innerHTML = '<div class="max-w-2xl mx-auto py-12 text-center"><img src="https://i.ibb.co.com/208z05FD/1777297574810.png" class="h-24 w-24 mx-auto rounded-full mb-6"><h2 class="text-3xl font-bold gradient-text mb-8">CONTACT US</h2><div class="flex gap-8 mb-8"><a href="https://vm.tiktok.com/ZS98d811wU23L-6JMzD" target="_blank" class="glass-card flex-1 p-6 rounded-2xl hover:bg-blue-600/30"><p class="text-2xl font-bold"><i class="fab fa-tiktok"></i></p></a><a href="https://wa.me/6282122598130" target="_blank" class="glass-card flex-1 p-6 rounded-2xl hover:bg-blue-600/30"><p class="text-2xl font-bold"><i class="fab fa-whatsapp"></i></p></a></div><div class="glass-card p-6 rounded-2xl"><textarea id="contact-msg" rows="4" maxlength="500" placeholder="Tulis pesan" class="input-diz w-full p-4 rounded-xl mb-3"></textarea><button onclick="sendContactMsg()" class="btn-diz w-full py-3 rounded-xl font-bold">KIRIM</button></div></div>'
}

window.sendContactMsg = async function() {
  const msg = document.getElementById('contact-msg')?.value?.trim()
  if (!msg) { showNotification('Pesan kosong', 'error'); return }
  await sendMessage({ sender_email: currentUser?.email || 'anon@diz.com', sender_name: currentUser?.full_name || 'Anon', message: msg })
  showNotification('Pesan terkirim', 'success')
}

function renderTermsPage(container) {
  container.innerHTML = '<div class="max-w-3xl mx-auto py-12"><h2 class="text-3xl font-bold gradient-text mb-8">TERMS & CONDITIONS</h2><div class="glass-card p-6 rounded-2xl space-y-4 text-blue-200"><p>Dengan menggunakan DIZMARX, Anda setuju dengan syarat dan ketentuan ini.</p><p>Penjual bertanggung jawab atas produk yang dijual.</p><p>DIZMARX tidak memproses pembayaran. Transaksi langsung antara pembeli dan penjual.</p></div></div>'
}

function renderPrivacyPage(container) {
  container.innerHTML = '<div class="max-w-3xl mx-auto py-12"><h2 class="text-3xl font-bold gradient-text mb-8">PRIVACY</h2><div class="glass-card p-6 rounded-2xl text-blue-200"><p>DIZMARX menjaga privasi Anda. Data Anda tidak dibagikan ke pihak ketiga.</p></div></div>'
}

function renderPrivacyPolicyPage(container) {
  container.innerHTML = '<div class="max-w-3xl mx-auto py-12"><h2 class="text-3xl font-bold gradient-text mb-8">PRIVACY POLICY</h2><div class="glass-card p-6 rounded-2xl space-y-4 text-blue-200"><h3 class="text-xl font-bold text-white">1. Informasi Dikumpulkan</h3><p>Kami mengumpulkan informasi yang Anda berikan saat mendaftar: nama, email, telepon.</p><h3 class="text-xl font-bold text-white">2. Penggunaan</h3><p>Untuk menyediakan dan meningkatkan layanan DIZMARX.</p><h3 class="text-xl font-bold text-white">3. Keamanan</h3><p>Data disimpan dengan enkripsi.</p><h3 class="text-xl font-bold text-white">4. Hak Anda</h3><p>Anda dapat mengakses, mengoreksi, atau menghapus data Anda.</p></div></div>'
}

function renderSitemapPage(container) {
  container.innerHTML = '<div class="max-w-3xl mx-auto py-12"><h2 class="text-3xl font-bold gradient-text mb-8">SITEMAP</h2><div class="glass-card p-6 rounded-2xl space-y-3 text-blue-200"><p onclick="navigateTo(\'home\')" class="cursor-pointer hover:text-white">Home</p><p onclick="navigateTo(\'market\')" class="cursor-pointer hover:text-white">Market</p><p onclick="navigateTo(\'upgrade\')" class="cursor-pointer hover:text-white">Upgrade</p><p onclick="navigateTo(\'sign\')" class="cursor-pointer hover:text-white">Register</p><p onclick="navigateTo(\'login\')" class="cursor-pointer hover:text-white">Login</p><p onclick="navigateTo(\'dashboard\')" class="cursor-pointer hover:text-white">Dashboard</p><p onclick="navigateTo(\'upload\')" class="cursor-pointer hover:text-white">Upload</p><p onclick="navigateTo(\'file\')" class="cursor-pointer hover:text-white">File</p><p onclick="navigateTo(\'cart\')" class="cursor-pointer hover:text-white">Cart</p><p onclick="navigateTo(\'statistics\')" class="cursor-pointer hover:text-white">Statistics</p><p onclick="navigateTo(\'profile\')" class="cursor-pointer hover:text-white">Profile</p></div></div>'
}

function renderTermsOfUsePage(container) {
  container.innerHTML = '<div class="max-w-3xl mx-auto py-12"><h2 class="text-3xl font-bold gradient-text mb-8">TERMS OF USE</h2><div class="glass-card p-6 rounded-2xl text-blue-200"><p>Jangan memberitahukan platform ini kepada siapapun kecuali pengguna lain yang menemukannya sendiri.</p><p>Pelanggaran dapat mengakibatkan penangguhan atau penghapusan akun permanen.</p></div></div>'
}

function renderBannedPage(container) {
  container.innerHTML = '<div class="text-center py-20"><h2 class="text-3xl font-bold text-red-500">AKUN TERKENA SANKSI</h2><p class="text-blue-300 mt-4">Akun Anda telah dihapus permanen atau terkena ban.</p><button onclick="logout()" class="btn-diz px-8 py-3 rounded-xl mt-8">KELUAR</button></div>'
}

// UPGRADE PAGE
function renderUpgradePage(container) {
  container.innerHTML = '<div class="text-center py-12"><img src="https://i.ibb.co.com/208z05FD/1777297574810.png" class="h-32 w-32 mx-auto rounded-full mb-8"><h2 class="text-4xl font-bold gradient-text mb-4">Select package that suit your needs</h2><div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12"><div class="glass-card p-8 rounded-2xl"><h3 class="text-3xl font-bold mb-6">FREE</h3><ul class="space-y-3 text-left mb-8"><li>FREE AKSES</li><li>SIGN FREE</li><li class="text-red-400">INFINITY MARKET (X)</li><li class="text-red-400">VIDEO UPLOAD (X)</li></ul><button onclick="' + (currentUser ? 'navigateTo(\'dashboard\')' : 'navigateTo(\'login\')') + '" class="btn-diz w-full py-4 rounded-xl text-xl font-bold">Daftar gratis</button></div><div class="glass-card p-8 rounded-2xl border-2 border-blue-500"><h3 class="text-3xl font-bold mb-2">PREMIUM</h3><p class="text-2xl font-bold text-blue-400 mb-6">Rp30.000<span class="text-sm text-blue-300">/Per bulan</span></p><ul class="space-y-3 text-left mb-8"><li>UPLOAD FOTO 5+</li><li>AKSES UPLOAD VIDEO</li><li>DESKRIPSI 1000 KATA</li><li>INFINITY AKSES MARKET</li></ul><button onclick="window.open(\'https://wa.me/6282122598130\', \'_blank\')" class="btn-diz w-full py-4 rounded-xl text-xl font-bold pulse">Upgrade Premium</button></div></div></div>'
}

// CART PAGE (ringkas)
function renderCartPage(container) {
  if (!currentUser) { navigateTo('login'); return }
  container.innerHTML = '<div class="animate-slide-in"><h2 class="text-3xl font-bold gradient-text mb-8">KERANJANG</h2><div id="cart-list" class="space-y-4"><p class="text-blue-300">Loading...</p></div></div>'
  getCartItems(currentUser.id).then(({ data }) => {
    const list = document.getElementById('cart-list')
    if (!data || data.length === 0) { list.innerHTML = '<p class="text-blue-300 text-center py-8">Keranjang kosong</p>'; return }
    list.innerHTML = data.map(item => '<div class="glass-card p-4 rounded-xl flex items-center gap-4"><img src="' + (item.products?.thumbnail_url || 'https://i.ibb.co.com/208z05FD/1777297574810.png') + '" class="w-20 h-20 object-cover rounded-lg"><div class="flex-1"><h4 class="font-bold">' + item.products?.title + '</h4><p class="text-sm text-blue-300">' + (item.products?.is_free ? 'FREE' : 'Rp' + (item.products?.discount_price || item.products?.price)?.toLocaleString()) + '</p></div><button onclick="removeCartItem(\'' + item.id + '\')" class="text-red-400 border border-red-500/30 px-3 py-1 rounded-lg">HAPUS</button></div>').join('')
  })
}

window.removeCartItem = async function(cartId) {
  await removeFromCart(cartId)
  renderCartPage(document.getElementById('dynamic-content'))
}

// STATISTICS (ringkas)
function renderStatisticsPage(container) {
  if (!currentUser) { navigateTo('login'); return }
  container.innerHTML = '<div class="animate-slide-in"><h2 class="text-3xl font-bold gradient-text mb-8">STATISTIK</h2><div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"><div class="glass-card p-6 rounded-2xl text-center"><p class="text-blue-300">Views</p><p class="text-3xl font-bold" id="stat-views">0</p></div><div class="glass-card p-6 rounded-2xl text-center"><p class="text-blue-300">Checkout</p><p class="text-3xl font-bold" id="stat-checkouts">0</p></div><div class="glass-card p-6 rounded-2xl text-center"><p class="text-blue-300">Terjual</p><p class="text-3xl font-bold" id="stat-purchases">0</p></div><div class="glass-card p-6 rounded-2xl text-center"><p class="text-blue-300">Pendapatan</p><p class="text-3xl font-bold text-green-400" id="stat-revenue">Rp0</p></div></div></div>'
  loadStats()
}

async function loadStats() {
  const { data: products } = await getUserProducts(currentUser.id)
  if (!products) return
  const views = products.reduce((s, p) => s + (p.views_count || 0), 0)
  const checkouts = products.reduce((s, p) => s + (p.checkout_count || 0), 0)
  const purchases = products.reduce((s, p) => s + (p.purchase_count || 0), 0)
  let revenue = 0
  for (const p of products) {
    if (!p.is_free) {
      const { data: pur } = await supabase.from('purchases').select('id').eq('product_id', p.id)
      revenue += (pur?.length || 0) * (p.discount_price || p.price || 0)
    }
  }
  document.getElementById('stat-views').textContent = views
  document.getElementById('stat-checkouts').textContent = checkouts
  document.getElementById('stat-purchases').textContent = purchases
  document.getElementById('stat-revenue').textContent = 'Rp' + revenue.toLocaleString()
}

// PROFILE PAGE (ringkas)
function renderProfilePage(container) {
  if (!currentUser) { navigateTo('login'); return }
  container.innerHTML = '<div class="animate-slide-in max-w-2xl mx-auto"><h2 class="text-3xl font-bold gradient-text mb-8">EDIT PROFIL</h2><div class="space-y-4"><div class="glass-card p-6 rounded-2xl"><div class="h-48 rounded-xl bg-diz-700 cursor-pointer mb-4" onclick="document.getElementById(\'cover-in\').click()"><img src="' + (currentUser.cover_url || '') + '" id="cover-prev" class="w-full h-full object-cover" style="' + (currentUser.cover_url ? '' : 'display:none') + '"><p class="text-blue-300 text-center pt-20">Klik ganti cover</p></div><input type="file" id="cover-in" accept="image/*" class="hidden" onchange="uploadCover(this)"></div><div class="glass-card p-6 rounded-2xl space-y-3"><input type="text" id="pf-name" value="' + (currentUser.full_name || '') + '" placeholder="Nama lengkap" class="input-diz w-full p-4 rounded-xl"><textarea id="pf-bio" placeholder="Bio" class="input-diz w-full p-4 rounded-xl">' + (currentUser.bio || '') + '</textarea><button onclick="saveProfile()" class="btn-diz w-full py-4 rounded-xl font-bold">SIMPAN</button></div></div></div>'
}

window.uploadCover = function(input) {
  const file = input.files[0]
  if (!file) return
  window.newCover = file
  const reader = new FileReader()
  reader.onload = e => { document.getElementById('cover-prev').src = e.target.result; document.getElementById('cover-prev').style.display = 'block' }
  reader.readAsDataURL(file)
}

window.saveProfile = async function() {
  const updates = { full_name: document.getElementById('pf-name')?.value, bio: document.getElementById('pf-bio')?.value }
  if (window.newCover) {
    const fn = 'covers/' + currentUser.id + '_' + Date.now()
    await supabase.storage.from('users').upload(fn, window.newCover)
    updates.cover_url = supabase.storage.from('users').getPublicUrl(fn).data.publicUrl
  }
  await supabase.from('users').update(updates).eq('id', currentUser.id)
  currentUser = { ...currentUser, ...updates }
  localStorage.setItem('dizmarx_user', JSON.stringify(currentUser))
  showNotification('Profil disimpan', 'success')
}
