import { supabase } from './supabase.js'

const GOOGLE_CLIENT_ID = '949870161759-balso3b2p1b6k2205tg9nml3kqe69f67.apps.googleusercontent.com'

function loadGoogleScript() {
  return new Promise((resolve) => {
    if (window.google?.accounts?.id) { resolve(); return }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => {
      setTimeout(() => {
        const s2 = document.createElement('script')
        s2.src = 'https://accounts.google.com/gsi/client'
        s2.async = true
        s2.defer = true
        document.head.appendChild(s2)
        resolve()
      }, 1000)
    }
    document.head.appendChild(script)
  })
}

export async function loginWithGoogle() {
  await loadGoogleScript()
  
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleResponse,
    auto_select: false,
    context: 'signin',
    ux_mode: 'popup',
    itp_support: true
  })
  
  google.accounts.id.prompt((notification) => {
    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
      const oauth2 = google.accounts.oauth2.initCodeClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        ux_mode: 'popup',
        callback: async (response) => {
          if (response.code) {
            const tokenClient = google.accounts.oauth2.initTokenClient({
              client_id: GOOGLE_CLIENT_ID,
              scope: 'openid email profile',
              callback: async (tokenResponse) => {
                if (tokenResponse.access_token) {
                  const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: 'Bearer ' + tokenResponse.access_token }
                  }).then(r => r.json())
                  
                  await processGoogleUser({
                    email: userInfo.email,
                    name: userInfo.name,
                    picture: userInfo.picture,
                    sub: userInfo.sub
                  })
                }
              }
            })
            tokenClient.requestAccessToken()
          }
        }
      })
      oauth2.requestCode()
    }
  })
}

async function handleGoogleResponse(response) {
  const credential = response.credential
  const base64Url = credential.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''))
  const userData = JSON.parse(jsonPayload)
  
  await processGoogleUser({
    email: userData.email,
    name: userData.name,
    picture: userData.picture,
    sub: userData.sub
  })
}

async function processGoogleUser(userData) {
  const email = userData.email
  const name = userData.name
  const picture = userData.picture
  
  const { data: existingUser } = await supabase.from('users').select('*').eq('email', email).single()
  
  if (existingUser) {
    if (existingUser.is_deleted || existingUser.is_banned) {
      localStorage.setItem('dizmark_user', JSON.stringify(existingUser))
      window.location.href = '#banned'
      return
    }
    
    if (!existingUser.username || !existingUser.phone) {
      localStorage.setItem('dizmark_temp_user', JSON.stringify({ id: existingUser.id, email, name, avatar: picture }))
      window.location.hash = 'complete-profile'
      return
    }
    
    localStorage.setItem('dizmark_user', JSON.stringify(existingUser))
    window.location.hash = 'dashboard'
  } else {
    const { data: newUser } = await supabase.from('users').insert([{
      email, full_name: name, avatar_url: picture,
      oauth_provider: 'google', oauth_id: userData.sub,
      is_pro: false, created_at: new Date().toISOString()
    }]).select()
    
    localStorage.setItem('dizmark_temp_user', JSON.stringify({ id: newUser[0].id, email, name, avatar: picture }))
    window.location.hash = 'complete-profile'
  }
}

export async function loginWithGitHub() {
  const GITHUB_CLIENT_ID = "Ov23liv2pk518ZnxHGpI"
  const redirectUri = window.location.origin + '/auth/callback'
  const githubUrl = 'https://github.com/login/oauth/authorize?client_id=' + GITHUB_CLIENT_ID + '&redirect_uri=' + redirectUri + '&scope=user:email'
  window.location.href = githubUrl
}

export async function handleGitHubCallback(code) {
  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        client_id: 'Ov23li...',
        client_secret: "fa7d006bede2a158d3112aced49c3855846269db"
        code: code
      })
    })
    const tokenData = await tokenRes.json()
    
    if (tokenData.access_token) {
      const userRes = await fetch('https://api.github.com/user', {
        headers: { Authorization: 'Bearer ' + tokenData.access_token }
      })
      const githubUser = await userRes.json()
      
      const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: 'Bearer ' + tokenData.access_token }
      })
      const emails = await emailRes.json()
      const primaryEmail = emails.find(e => e.primary)?.email || emails[0]?.email
      
      await processGoogleUser({
        email: primaryEmail,
        name: githubUser.name || githubUser.login,
        picture: githubUser.avatar_url,
        sub: githubUser.id.toString()
      })
    }
  } catch (err) {
    console.error('GitHub login error:', err)
    window.location.hash = 'login'
  }
}

export async function registerManual(username, email, password, confirmPassword, phone, countryCode, agreeTerms) {
  if (!username || !email || !password || !confirmPassword || !phone) {
    return { error: 'Semua kolom wajib diisi' }
  }
  if (password !== confirmPassword) {
    return { error: 'Password dan konfirmasi password tidak sama' }
  }
  if (password.length < 6 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { error: 'Password harus minimal 6 karakter, mengandung huruf kecil, huruf besar, dan angka' }
  }
  if (!agreeTerms) {
    return { error: 'Anda harus menyetujui Terms of Use' }
  }
  
  const { data: emailCheck } = await supabase.from('users').select('id').eq('email', email)
  if (emailCheck?.length > 0) return { error: 'Email sudah terdaftar' }
  
  const { data: userCheck } = await supabase.from('users').select('id').eq('username', username)
  if (userCheck?.length > 0) return { error: 'Username sudah digunakan' }
  
  const { data: phoneCheck } = await supabase.from('users').select('id').eq('phone', phone)
  if (phoneCheck?.length > 0) return { error: 'Nomor telepon sudah digunakan' }
  
  const encoder = new TextEncoder()
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password))
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  const { data, error } = await supabase.from('users').insert([{
    email, username, password_hash: passwordHash,
    phone, country_code: countryCode || '+62',
    is_pro: false, created_at: new Date().toISOString()
  }]).select()
  
  if (error) return { error: 'Gagal mendaftar: ' + error.message }
  
  localStorage.setItem('dizmark_user', JSON.stringify(data[0]))
  return { success: true, user: data[0] }
}

export async function loginManual(emailOrUsername, password) {
  if (!emailOrUsername || !password) {
    return { error: 'Email/Username dan password wajib diisi' }
  }
  
  const { data: users } = await supabase.from('users').select('*').or('email.eq.' + emailOrUsername + ',username.eq.' + emailOrUsername)
  
  if (!users || users.length === 0) return { error: 'Akun tidak ditemukan' }
  
  const user = users[0]
  
  const encoder = new TextEncoder()
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password))
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const inputHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  if (inputHash !== user.password_hash) return { error: 'Password salah' }
  
  if (user.is_deleted) return { error: 'Akun telah dihapus permanen' }
  if (user.is_banned && user.ban_until && new Date(user.ban_until) > new Date()) {
    const days = Math.ceil((new Date(user.ban_until) - new Date()) / (1000 * 60 * 60 * 24))
    return { error: 'Akun terkena ban. Sisa ' + days + ' hari lagi.', banned: true, user }
  }
  
  localStorage.setItem('dizmark_user', JSON.stringify(user))
  return { success: true, user }
}

export function logout() {
  localStorage.removeItem('dizmark_user')
  localStorage.removeItem('dizmark_temp_user')
  window.location.hash = ''
  window.location.reload()
}

export function getCurrentUser() {
  const u = localStorage.getItem('dizmark_user')
  return u ? JSON.parse(u) : null
}

export async function forgotPassword(emailOrUsername) {
  const { data: users } = await supabase.from('users').select('*').or('email.eq.' + emailOrUsername + ',username.eq.' + emailOrUsername)
  if (!users || users.length === 0) return { error: 'Akun tidak ditemukan' }
  
  const user = users[0]
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString()
  
  await supabase.from('users').update({ reset_otp: otp, reset_otp_expiry: otpExpiry }).eq('id', user.id)
  
  alert('Kode OTP: ' + otp + ' (Production: dikirim via email)')
  return { success: true, userId: user.id }
}

export async function verifyOTPAndReset(userId, otp, newPassword) {
  const { data: user } = await supabase.from('users').select('*').eq('id', userId).single()
  if (user.reset_otp !== otp) return { error: 'OTP salah' }
  if (new Date(user.reset_otp_expiry) < new Date()) return { error: 'OTP expired' }
  
  const encoder = new TextEncoder()
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(newPassword))
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  await supabase.from('users').update({ password_hash: passwordHash, reset_otp: null, reset_otp_expiry: null }).eq('id', userId)
  return { success: true }
}
