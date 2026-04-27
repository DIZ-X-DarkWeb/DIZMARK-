import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://abcdefghijklm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYyODQwMDAsImV4cCI6MjAzMTg2MDAwMH0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function getUserByEmail(email) {
  const { data, error } = await supabase.from('users').select('*').eq('email', email)
  return { data: data?.[0], error }
}

export async function createUser(userData) {
  const { data, error } = await supabase.from('users').insert([userData]).select()
  return { data: data?.[0], error }
}

export async function updateUser(userId, updates) {
  const { error } = await supabase.from('users').update(updates).eq('id', userId)
  return { error }
}

export async function getUserProducts(userId) {
  const { data, error } = await supabase.from('products').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  return { data, error }
}

export async function getAllMarketProducts() {
  const { data, error } = await supabase.from('products').select('*, users(username, full_name, avatar_url, phone)').eq('is_active', true).order('created_at', { ascending: false })
  return { data, error }
}

export async function getProductById(productId) {
  const { data, error } = await supabase.from('products').select('*, users(username, full_name, avatar_url, phone, address)').eq('id', productId).single()
  return { data, error }
}

export async function createProduct(productData) {
  const { data, error } = await supabase.from('products').insert([productData]).select()
  return { data: data?.[0], error }
}

export async function updateProduct(productId, updates) {
  const { error } = await supabase.from('products').update(updates).eq('id', productId)
  return { error }
}

export async function deleteProduct(productId) {
  const { error } = await supabase.from('products').delete().eq('id', productId)
  return { error }
}

export async function addToCart(userId, productId) {
  const { data, error } = await supabase.from('cart').insert([{ user_id: userId, product_id: productId }])
  return { data, error }
}

export async function getCartItems(userId) {
  const { data, error } = await supabase.from('cart').select('*, products(*)').eq('user_id', userId)
  return { data, error }
}

export async function removeFromCart(cartId) {
  const { error } = await supabase.from('cart').delete().eq('id', cartId)
  return { error }
}

export async function createPurchase(purchaseData) {
  const { data, error } = await supabase.from('purchases').insert([purchaseData])
  return { data, error }
}

export async function sendMessage(messageData) {
  const { data, error } = await supabase.from('messages').insert([messageData])
  return { data, error }
}
