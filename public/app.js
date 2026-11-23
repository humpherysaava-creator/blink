const ADMIN_EMAIL = 'humpherysaava7@gmail.com';
const demoStories = [
  { name: 'Your story', initials: '+', color: '#6758e8', mine: true },
  { name: 'Ava', initials: 'AV', color: '#ff8066' },
  { name: 'Maya', initials: 'MA', color: '#f7c84b' },
  { name: 'Leo', initials: 'LE', color: '#58cfa5' },
];
const demoPosts = [
  { id: 1, name: 'Ava Williams', handle: '@ava', time: '12m', initials: 'AV', color: '#ff8066', text: 'Found the coziest little place for coffee today ☕', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1100&q=85', likes: 24 },
  { id: 2, name: 'Leo Martin', handle: '@leo', time: '38m', initials: 'LE', color: '#58cfa5', text: 'Golden hour never misses.', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1100&q=85', likes: 41 },
];
const $ = (selector) => document.querySelector(selector);
const views = ['loading-view', 'login-view', 'feed-view', 'admin-view', 'config-view'];
let supabase;
let session;
let deferredInstallPrompt;
let toastTimer;
const liked = new Set(JSON.parse(localStorage.getItem('blink-liked-posts') || '[]'));

function showView(name) {
  for (const id of views) $(`#${id}`).hidden = id !== name;
}
function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
function toast(message) {
  const element = $('#toast');
  element.textContent = message;
  element.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove('show'), 2600);
}
function isAdmin(user) {
  return user?.email?.toLowerCase() === ADMIN_EMAIL || user?.app_metadata?.role === 'admin';
}
function setInstallVisible(visible) {
  document.querySelectorAll('.install-button').forEach((button) => { button.hidden = !visible; });
}
function updateAuthControls() {
  const account = $('#header-account');
  account.hidden = !session;
  account.textContent = session ? (isAdmin(session.user) ? 'Admin · Sign out' : 'Sign out') : '';
  $('#signed-in-email').textContent = session?.user?.email || '';
  account.onclick = () => signOut();
}
function renderStories() {
  $('#stories').innerHTML = demoStories.map((story) => `<div class="story"><div class="story-ring ${story.mine ? 'mine' : ''}"><div class="story-face" style="background:${story.mine ? '#eeeaff' : story.color};color:${story.mine ? '#6758e8' : '#fff'}">${escapeHtml(story.initials)}</div>${story.mine ? '<span class="story-add">+</span>' : ''}</div>${escapeHtml(story.name)}</div>`).join('');
}
function renderPosts() {
  $('#posts').innerHTML = demoPosts.map((post) => {
    const active = liked.has(post.id);
    return `<article class="post-card"><div class="post-head"><div class="avatar" style="background:${post.color}">${escapeHtml(post.initials)}</div><div><div class="post-name">${escapeHtml(post.name)}</div><div class="post-meta">${escapeHtml(post.handle)} · ${escapeHtml(post.time)}</div></div></div><p class="post-copy">${escapeHtml(post.text)}</p><img class="post-image" src="${escapeHtml(post.image)}" alt="A moment shared by ${escapeHtml(post.name)}" loading="lazy" /><button class="like-button ${active ? 'active' : ''}" data-like="${post.id}" aria-pressed="${active}">${active ? '♥ Liked' : '♡ Like'} · ${post.likes + Number(active)}</button></article>`;
  }).join('');
  $('#posts').querySelectorAll('[data-like]').forEach((button) => button.addEventListener('click', () => {
    const id = Number(button.dataset.like);
    liked.has(id) ? liked.delete(id) : liked.add(id);
    localStorage.setItem('blink-liked-posts', JSON.stringify([...liked]));
    renderPosts();
  }));
}
function renderApp() {
  updateAuthControls();
  if (!session) { showView('login-view'); return; }
  renderStories();
  renderPosts();
  showView('feed-view');
}
async function openAdmin() {
  if (!session || !isAdmin(session.user)) { toast('Admin access required.'); return; }
  showView('admin-view');
  await loadUsers();
}
async function loadUsers() {
  const status = $('#users-status');
  const table = $('#users-table');
  const body = $('#users-body');
  status.hidden = false;
  status.textContent = 'Loading users…';
  table.hidden = true;
  $('#users-label').textContent = 'Loading…';
  try {
    const { data, error } = await supabase.from('profiles').select('id,email,role,created_at').order('created_at', { ascending: false }).limit(200);
    if (error) throw error;
    const users = data || [];
    $('#user-count').textContent = String(users.length);
    $('#users-label').textContent = `${users.length} account${users.length === 1 ? '' : 's'}`;
    if (!users.length) { status.textContent = 'No profiles found. Check that the Supabase admin SQL setup has been run.'; return; }
    body.innerHTML = users.map((user) => `<tr><td>${escapeHtml(user.email || 'Unknown email')}</td><td><span class="role-pill ${user.role === 'admin' ? '' : 'user'}">${escapeHtml(user.role || 'user')}</span></td><td>${user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</td></tr>`).join('');
    status.hidden = true;
    table.hidden = false;
  } catch (error) {
    $('#user-count').textContent = '—';
    $('#users-label').textContent = 'Unavailable';
    status.textContent = error.message || 'Could not load users. Check Supabase profiles table policies and admin SQL setup.';
  }
}
async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) toast(error.message);
  $('#admin-view').hidden = true;
}
$('#side-signout').addEventListener('click', signOut);
$('#admin-back').addEventListener('click', renderApp);
$('#admin-refresh').addEventListener('click', loadUsers);
$('#header-account').addEventListener('click', () => {
  if (session && isAdmin(session.user) && !$('#admin-view').hidden) renderApp();
  else signOut();
});
$('#login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const message = $('#auth-message');
  const button = $('#login-submit');
  if (!supabase) { message.textContent = 'Supabase is not configured yet. Add the public project URL and key in Vercel.'; return; }
  button.disabled = true;
  button.textContent = 'Signing in…';
  message.textContent = '';
  message.classList.remove('success');
  const form = new FormData(event.currentTarget);
  const { error } = await supabase.auth.signInWithPassword({ email: String(form.get('email')).trim(), password: String(form.get('password')) });
  button.disabled = false;
  button.innerHTML = 'Sign in <span aria-hidden="true">→</span>';
  $('#password').value = '';
  if (error) message.textContent = error.message;
});
$('#install-button').addEventListener('click', installApp);
$('#install-inline').addEventListener('click', installApp);
$('#admin-refresh').addEventListener('click', loadUsers);

async function installApp() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    setInstallVisible(false);
    return;
  }
  const help = $('#install-help');
  const isAppleMobile = /iphone|ipad|ipod/i.test(navigator.userAgent);
  help.hidden = false;
  help.textContent = isAppleMobile ? 'To install on iPhone or iPad: tap Share in Safari, then choose “Add to Home Screen”.' : 'Use your browser’s menu and choose “Install app” or “Add to Home screen” to install Blink.';
}
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  setInstallVisible(true);
});
window.addEventListener('appinstalled', () => { setInstallVisible(false); toast('Blink is installed on your device.'); });

async function start() {
  try {
    const response = await fetch('/api/config', { cache: 'no-store' });
    if (!response.ok) throw new Error('Config endpoint unavailable');
    const config = await response.json();
    if (!config.supabaseUrl || !config.supabaseAnonKey) { showView('config-view'); return; }
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
    const { data } = await supabase.auth.getSession();
    session = data.session;
    supabase.auth.onAuthStateChange((_event, nextSession) => { session = nextSession; renderApp(); });
    renderApp();
  } catch (error) {
    console.error('Blink startup failed:', error);
    $('#auth-message').textContent = 'Could not connect to Blink. Check the Vercel deployment and Supabase settings.';
    showView('login-view');
  }
}

if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch((error) => console.warn('Offline support was not enabled:', error)));
start();
