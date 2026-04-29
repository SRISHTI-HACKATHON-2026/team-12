// ═══ EcoVoice Main JavaScript — Full Functionality ═══
// API base: works locally (Express on :3456) and on Vercel (serverless /api/*)
const IS_VERCEL = !window.location.port || window.location.hostname !== 'localhost';
const API = IS_VERCEL ? '/api' : (window.location.origin + '/api');
let currentLang = 'en';
let selectedCategory = null;
let audioBlob = null;
let isRecording = false;
let mediaRecorder = null;
let recordingTimer = null;
let villagesData = [];
let audioStream = null;

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollReveal();
  initCounters();
  initGauges();
  initProgressBars();
  initReportForm();
  initLanguage();
  initParticles();
  initSmoothScroll();
  initRipple();
  initShareButtons();
  loadVillages();
});

// ═══ NAVBAR ═══
function initNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });
  const toggle = document.getElementById('mobileToggle');
  const menu = document.getElementById('mobileMenu');
  const overlay = document.getElementById('mobileOverlay');
  if (toggle) {
    toggle.addEventListener('click', () => { menu.classList.toggle('open'); overlay.classList.toggle('open'); });
    overlay.addEventListener('click', () => { menu.classList.remove('open'); overlay.classList.remove('open'); });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { menu.classList.remove('open'); overlay.classList.remove('open'); }));
  }
}

// ═══ LANGUAGE SYSTEM ═══
function initLanguage() {
  document.querySelectorAll('.lang-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.lang-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentLang = pill.dataset.lang || 'en';
      applyTranslations(currentLang);
    });
  });
}

function applyTranslations(lang) {
  const t = window.TRANSLATIONS[lang] || window.TRANSLATIONS.en;
  const fallback = window.TRANSLATIONS.en;
  const get = (key) => t[key] || fallback[key] || '';

  // Nav links
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');
  const navKeys = ['navHome','navReport','navScore','navSuggest','navStories','navContact'];
  navLinks.forEach((a, i) => { if (navKeys[i % 6]) a.textContent = get(navKeys[i % 6]); });

  // Nav buttons
  const reportNav = document.querySelector('.btn-report-nav');
  if (reportNav) reportNav.textContent = get('reportNow');

  // Hero
  setText('.hero-badge', get('heroBadge'));
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) heroTitle.innerHTML = `${get('heroTitle1')}<br>${get('heroTitle2')}<span class="gold">${get('heroTitleVoice')}</span>${get('heroTitle3')}<br>${get('heroTitle4')}`;
  setText('.hero-sub', get('heroSub'));
  const trusts = document.querySelectorAll('.trust-pill');
  if (trusts[0]) trusts[0].textContent = get('trust1');
  if (trusts[1]) trusts[1].textContent = get('trust2');
  if (trusts[2]) trusts[2].textContent = get('trust3');
  setText('.btn-primary', get('ctaPrimary'));
  setText('.btn-secondary', get('ctaSecondary'));
  setText('.scroll-indicator', get('scrollText') + '<span class="chevron">⌄</span>');

  // How it works
  const stepCards = document.querySelectorAll('.step-card');
  if (stepCards[0]) { stepCards[0].querySelector('h3').textContent = get('step1Title'); stepCards[0].querySelector('p').textContent = get('step1Desc'); }
  if (stepCards[1]) { stepCards[1].querySelector('h3').textContent = get('step2Title'); stepCards[1].querySelector('p').textContent = get('step2Desc'); }
  if (stepCards[2]) { stepCards[2].querySelector('h3').textContent = get('step3Title'); stepCards[2].querySelector('p').textContent = get('step3Desc'); }

  // Report section
  const cats = document.querySelectorAll('.cat-card .label');
  const catKeys = ['catWater','catGarbage','catElectric','catForests','catToilets','catRoads','catCrops','catOther'];
  cats.forEach((c, i) => { if (catKeys[i]) c.textContent = get(catKeys[i]); });

  // data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (get(key)) el.textContent = get(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (get(key)) el.placeholder = get(key);
  });

  // Section labels/titles
  const reportLabel = document.querySelector('.report-right .section-label');
  if (reportLabel) reportLabel.textContent = get('reportLabel');
  const reportTitle = document.querySelector('.report-right .section-title');
  if (reportTitle) reportTitle.textContent = get('reportTitle');

  // Score search
  const searchInput = document.querySelector('.score-search input');
  if (searchInput) searchInput.placeholder = get('searchPlaceholder') || 'Search your village...';

  // Footer tagline
  const tagline = document.querySelector('.footer-brand .tagline');
  if (tagline) tagline.textContent = get('footerTagline');

  // Submit button
  const submitBtn = document.getElementById('submitReport');
  if (submitBtn) submitBtn.textContent = get('submitBtn');
}

function setText(sel, val) {
  const el = document.querySelector(sel);
  if (el && val) el.innerHTML = val;
}

// ═══ VOICE RECORDING ═══
function initReportForm() {
  // Method tabs
  const tabs = document.querySelectorAll('.method-tab');
  const voicePanel = document.getElementById('voicePanel');
  const textPanel = document.getElementById('textPanel');
  const photoPanel = document.getElementById('photoPanel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const t = tab.dataset.tab;
      voicePanel.style.display = t === 'voice' ? 'block' : 'none';
      textPanel.classList.toggle('active', t === 'text');
      if (photoPanel) photoPanel.style.display = t === 'photo' ? 'block' : 'none';
    });
  });

  // Category cards
  document.querySelectorAll('.cat-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedCategory = card.dataset.cat;
    });
  });

  // Anonymous toggle
  const anonToggle = document.getElementById('anonToggle');
  if (anonToggle) anonToggle.addEventListener('click', () => anonToggle.classList.toggle('on'));

  // Mic button — TOGGLE: click once to start, click again to stop
  const micBtn = document.getElementById('micBtn');
  if (micBtn) {
    micBtn.addEventListener('click', toggleRecording);
  }

  // Village autocomplete
  const villageField = document.getElementById('villageField');
  const suggestions = document.getElementById('villageSuggestions');
  if (villageField) {
    villageField.addEventListener('input', () => {
      const q = villageField.value.trim();
      if (q.length < 2) { suggestions.classList.remove('show'); return; }
      const matches = villagesData.filter(v =>
        v.name.toLowerCase().includes(q.toLowerCase()) || v.state.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 5);
      if (matches.length) {
        suggestions.innerHTML = matches.map(v => `<div class="village-suggest-item" data-name="${v.name}">${v.name}, ${v.district}, ${v.state}</div>`).join('');
        suggestions.classList.add('show');
        suggestions.querySelectorAll('.village-suggest-item').forEach(item => {
          item.addEventListener('click', () => {
            villageField.value = item.dataset.name;
            suggestions.classList.remove('show');
          });
        });
      } else suggestions.classList.remove('show');
    });
    document.addEventListener('click', (e) => { if (!e.target.closest('.village-input-wrap')) suggestions.classList.remove('show'); });
  }

  // Submit report
  const submitBtn = document.getElementById('submitReport');
  if (submitBtn) submitBtn.addEventListener('click', submitReport);
}

// ── Mic toggle: one click = start, another click = stop ──
async function toggleRecording() {
  if (!isRecording) {
    // START recording
    try {
      audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks = [];
      mediaRecorder = new MediaRecorder(audioStream);
      mediaRecorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      mediaRecorder.onstop = () => {
        audioBlob = new Blob(chunks, { type: 'audio/webm' });
        showToast('✅ Voice recorded! Click Submit to send.');
      };
      mediaRecorder.start();
      isRecording = true;
      // Update UI
      const micBtn = document.getElementById('micBtn');
      const voicePanel = document.getElementById('voicePanel');
      const micLabel = document.getElementById('micLabel');
      const timer = document.getElementById('voiceTimer');
      micBtn.textContent = '⏹️';
      micBtn.style.background = 'linear-gradient(135deg,#b71c1c,#E53935)';
      voicePanel.classList.add('recording-active');
      if (micLabel) micLabel.textContent = 'Recording... Tap again to Stop';
      timer.style.display = 'block';
      let seconds = 0;
      recordingTimer = setInterval(() => {
        seconds++;
        timer.textContent = `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
      }, 1000);
    } catch (err) {
      showToast('⚠️ Microphone access denied. Please allow microphone in browser settings.');
    }
  } else {
    // STOP recording
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
    if (audioStream) { audioStream.getTracks().forEach(t => t.stop()); audioStream = null; }
    isRecording = false;
    clearInterval(recordingTimer);
    const micBtn = document.getElementById('micBtn');
    const voicePanel = document.getElementById('voicePanel');
    const micLabel = document.getElementById('micLabel');
    const timer = document.getElementById('voiceTimer');
    micBtn.textContent = '🎤';
    micBtn.style.background = '';
    voicePanel.classList.remove('recording-active');
    if (micLabel) micLabel.textContent = 'Tap to Start Recording';
    timer.style.display = 'none';
    timer.textContent = '0:00';
  }
}

async function submitReport() {
  const village = document.getElementById('villageField')?.value || '';
  const username = document.getElementById('usernameField')?.value || '';
  const message = document.getElementById('reportMessage')?.value || '';
  const isAnon = document.getElementById('anonToggle')?.classList.contains('on') ? '1' : '0';
  const photoInput = document.getElementById('photoInput');
  const activeTab = document.querySelector('.method-tab.active')?.dataset.tab || 'voice';

  if (!selectedCategory) { showToast('⚠️ Please select a category'); return; }
  if (!village) { showToast('⚠️ Please enter your village name'); return; }

  const formData = new FormData();
  formData.append('username', username);
  formData.append('village', village);
  formData.append('category', selectedCategory);
  formData.append('method', activeTab);
  formData.append('message', message);
  formData.append('is_anonymous', isAnon);
  formData.append('language', currentLang);
  if (audioBlob) formData.append('audio', audioBlob, 'recording.webm');
  if (photoInput?.files[0]) formData.append('photo', photoInput.files[0]);

  try {
    const payload = {
      username,
      village,
      category: selectedCategory,
      method: activeTab,
      message,
      is_anonymous: document.getElementById('anonToggle')?.classList.contains('on'),
      language: currentLang
    };
    const res = await fetch(API + '/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showToast('🎉 Report submitted! Report #' + data.id);
      document.getElementById('villageField').value = '';
      document.getElementById('usernameField').value = '';
      if (document.getElementById('reportMessage')) document.getElementById('reportMessage').value = '';
      document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('selected'));
      selectedCategory = null; audioBlob = null;
      document.getElementById('voiceTimer').style.display = 'none';
    } else showToast('❌ ' + (data.error || 'Failed to submit'));
  } catch (err) {
    showToast('❌ Server not available. Check your connection.');
    console.error(err);
  }
}

// ═══ VILLAGES & MAP ═══
async function loadVillages() {
  try {
    const res = await fetch(API + '/villages');
    villagesData = await res.json();
    updateLeaderboard(villagesData);
    initMap(villagesData);
  } catch (e) {
    console.log('Using default village data');
    villagesData = [
      {id:1,name:'Rampur',state:'Maharashtra',district:'Pune',lat:18.52,lng:73.86,score:742,badge:'SILVER'},
      {id:2,name:'Sundarpur',state:'Maharashtra',district:'Nashik',lat:20.00,lng:73.78,score:891,badge:'GOLD'},
      {id:3,name:'Nandgaon',state:'Maharashtra',district:'Nashik',lat:20.31,lng:74.65,score:698,badge:'BRONZE'},
      {id:4,name:'Khedgaon',state:'Maharashtra',district:'Ahmednagar',lat:19.09,lng:74.73,score:543,badge:'NONE'}
    ];
    updateLeaderboard(villagesData);
    initMap(villagesData);
  }

  // Score search
  const searchInput = document.querySelector('.score-search input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase();
      const filtered = villagesData.filter(v => v.name.toLowerCase().includes(q) || v.state.toLowerCase().includes(q));
      updateLeaderboard(filtered.length ? filtered : villagesData);
      if (filtered.length === 1) updateScoreCard(filtered[0]);
    });
  }
}

function updateLeaderboard(villages) {
  const tbody = document.querySelector('.leader-table tbody');
  if (!tbody) return;
  const sorted = [...villages].sort((a,b) => b.score - a.score).slice(0, 8);
  const badges = { GOLD:'🥇', SILVER:'🥈', BRONZE:'🥉', NONE:'—' };
  const ranks = ['🥇','🥈','🥉','','','','',''];
  tbody.innerHTML = sorted.map((v, i) => `
    <tr ${v.name === 'Rampur' ? 'class="you"' : ''}>
      <td>${ranks[i] || ''} ${i+1}</td>
      <td>${v.name}${v.name === 'Rampur' ? ' <span style="color:var(--golden);font-weight:700">← YOU</span>' : ''}</td>
      <td>${v.score}</td>
      <td>${v.badge} ${badges[v.badge] || ''}</td>
      <td class="${v.score > 700 ? 'trend-up' : v.score > 500 ? 'trend-same' : 'trend-down'}">
        ${v.score > 700 ? '↑' : v.score > 500 ? '→' : '↓'} ${v.score > 700 ? '+' + Math.floor(Math.random()*15) : v.score > 500 ? '+0' : '-' + Math.floor(Math.random()*8)}
      </td>
      <td><button class="btn-view" onclick="selectVillage(${v.id})">View</button></td>
    </tr>
  `).join('');
}

function updateScoreCard(v) {
  const name = document.querySelector('.score-village-name');
  if (name) name.textContent = `${v.name.toUpperCase()}, ${v.state.toUpperCase()}`;
  // Update gauge
  const mainGauge = document.getElementById('mainGauge');
  const mainScore = document.getElementById('mainScore');
  if (mainGauge) {
    const c = 2 * Math.PI * 100;
    mainGauge.style.strokeDashoffset = c - (v.score / 1000) * c;
  }
  if (mainScore) animateCounter(mainScore, v.score);
  // Update badge
  const badge = document.querySelector('.score-left .badge-pill');
  const badgeMap = { GOLD:'🥇 GOLD VILLAGE', SILVER:'🥈 SILVER VILLAGE', BRONZE:'🥉 BRONZE VILLAGE', NONE:'— UNRANKED' };
  if (badge) badge.textContent = badgeMap[v.badge] || badgeMap.NONE;
}

window.selectVillage = function(id) {
  const v = villagesData.find(x => x.id === id);
  if (v) { updateScoreCard(v); document.getElementById('score')?.scrollIntoView({ behavior: 'smooth' }); }
};

function initMap(villages) {
  const mapEl = document.getElementById('villageMap');
  if (!mapEl || !window.L) return;
  const map = L.map('villageMap').setView([20.5, 78.9], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors', maxZoom: 18
  }).addTo(map);
  const badgeColors = { GOLD:'#E8A838', SILVER:'#C0C0C0', BRONZE:'#CD7F32', NONE:'#888' };
  villages.forEach(v => {
    if (!v.lat || !v.lng) return;
    const icon = L.divIcon({
      className: '',
      html: `<div style="background:${badgeColors[v.badge]||'#888'};width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
      iconSize: [20, 20], iconAnchor: [10, 10]
    });
    L.marker([v.lat, v.lng], { icon }).addTo(map)
      .bindPopup(`<b>${v.name}</b><br>${v.district}, ${v.state}<br>Score: <b>${v.score}/1000</b> (${v.badge})`);
  });
}

// ═══ SHARE BUTTONS ═══
function initShareButtons() {
  const shareWA = document.getElementById('shareWA');
  const sharePrint = document.getElementById('sharePrint');
  const shareEmail = document.getElementById('shareEmail');
  const dlWA = document.querySelector('.btn-whatsapp');

  if (shareWA) shareWA.addEventListener('click', () => {
    const text = encodeURIComponent('🌱 Check out our village score on EcoVoice!\n\n🏘️ Rampur Village Score: 742/1000 (SILVER)\n💧 Water: 78 | 🗑️ Waste: 61 | ⚡ Energy: 89\n\nReport problems & track progress: ' + window.location.href);
    window.open('https://wa.me/?text=' + text, '_blank');
  });

  if (sharePrint) sharePrint.addEventListener('click', () => window.print());

  if (shareEmail) shareEmail.addEventListener('click', () => {
    const subject = encodeURIComponent('EcoVoice Village Score Report - Rampur');
    const body = encodeURIComponent('Dear Panchayat,\n\nPlease find our village score report:\n\n🏘️ Rampur Village Score: 742/1000 (SILVER)\n💧 Water Management: 78/100\n🗑️ Waste Management: 61/100\n⚡ Energy Saving: 89/100\n🌳 Green Cover: 70/100\n🤝 Community Reports: 82/100\n🏥 Health & Hygiene: 62/100\n\nView full report: ' + window.location.href + '\n\nRegards,\nEcoVoice Community');
    window.location.href = 'mailto:panchayat@example.com?subject=' + subject + '&body=' + body;
  });

  if (dlWA) dlWA.addEventListener('click', () => {
    const text = encodeURIComponent('🌱 Download EcoVoice — Empower your village!\n\nTrack resources, report problems, get government scheme help.\n\n' + window.location.href);
    window.open('https://wa.me/?text=' + text, '_blank');
  });
}

// ═══ TOAST ═══
function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ═══ SCROLL REVEAL ═══
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.15 });
  reveals.forEach(el => obs.observe(el));
}

// ═══ COUNTERS ═══
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { animateCounter(e.target, parseInt(e.target.closest('.stat-number').dataset.target)); obs.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
}

function animateCounter(el, target) {
  const duration = 2000, start = performance.now();
  const tick = now => {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3))).toLocaleString();
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ═══ GAUGES ═══
function initGauges() {
  const heroGauge = document.getElementById('heroGauge');
  const heroScore = document.getElementById('heroScore');
  if (heroGauge) {
    const c = 2 * Math.PI * 85;
    setTimeout(() => { heroGauge.style.strokeDashoffset = c - (742/1000)*c; animateCounter(heroScore, 742); }, 800);
  }
  const mainGauge = document.getElementById('mainGauge');
  const mainScore = document.getElementById('mainScore');
  if (mainGauge) {
    const c = 2 * Math.PI * 100;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { mainGauge.style.strokeDashoffset = c - (742/1000)*c; animateCounter(mainScore, 742); obs.unobserve(e.target); } });
    }, { threshold: 0.3 });
    obs.observe(mainGauge);
  }
}

// ═══ PROGRESS BARS ═══
function initProgressBars() {
  const fills = document.querySelectorAll('.progress-fill');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.style.width = e.target.dataset.width + '%'; obs.unobserve(e.target); } });
  }, { threshold: 0.3 });
  fills.forEach(p => obs.observe(p));
}

// ═══ PARTICLES ═══
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  function resize() { canvas.width = canvas.parentElement.offsetWidth; canvas.height = canvas.parentElement.offsetHeight; }
  resize(); window.addEventListener('resize', resize);
  class P {
    constructor() { this.reset(); }
    reset() { this.x=Math.random()*canvas.width; this.y=Math.random()*canvas.height; this.size=Math.random()*3+1; this.sx=(Math.random()-0.5)*0.5; this.sy=Math.random()*0.5+0.2; this.o=Math.random()*0.6+0.2; this.c=Math.random()>0.5?'#E8A838':'#7FB069'; this.p=Math.random()*Math.PI*2; }
    update() { this.x+=this.sx; this.y+=this.sy; this.p+=0.02; this.o=0.2+Math.sin(this.p)*0.3; if(this.y>canvas.height){this.y=-5;this.x=Math.random()*canvas.width;} }
    draw() { ctx.beginPath();ctx.arc(this.x,this.y,this.size,0,Math.PI*2);ctx.fillStyle=this.c;ctx.globalAlpha=this.o;ctx.fill();ctx.beginPath();ctx.arc(this.x,this.y,this.size*3,0,Math.PI*2);ctx.globalAlpha=this.o*0.15;ctx.fill();ctx.globalAlpha=1; }
  }
  for(let i=0;i<25;i++) particles.push(new P());
  (function animate(){ctx.clearRect(0,0,canvas.width,canvas.height);particles.forEach(p=>{p.update();p.draw()});requestAnimationFrame(animate)})();
}

// ═══ SMOOTH SCROLL ═══
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior:'smooth', block:'start' }); }
    });
  });
}

// ═══ RIPPLE ═══
function initRipple() {
  document.querySelectorAll('.btn-primary,.btn-submit,.btn-report-nav').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const r = document.createElement('span'), rect = this.getBoundingClientRect(), s = Math.max(rect.width,rect.height);
      r.style.cssText=`position:absolute;border-radius:50%;background:rgba(255,255,255,0.3);width:${s}px;height:${s}px;left:${e.clientX-rect.left-s/2}px;top:${e.clientY-rect.top-s/2}px;transform:scale(0);animation:ripple 0.6s ease-out;pointer-events:none;`;
      this.style.position='relative';this.style.overflow='hidden';this.appendChild(r);setTimeout(()=>r.remove(),600);
    });
  });
  const style=document.createElement('style');style.textContent='@keyframes ripple{to{transform:scale(2);opacity:0;}}';document.head.appendChild(style);
}

// ═══ GOVERNMENT SCHEME FUNCTIONS ═══
const SCHEMES = {
  jaljeevan: {
    name: 'Jal Jeevan Mission',
    icon: '💧',
    url: 'https://jaljeevanmission.gov.in',
    desc: 'Provides piped water supply to every rural household. Apply through your Gram Panchayat or online portal.',
    helpline: '1800-11-2019',
    docs: ['Aadhaar Card', 'BPL Certificate', 'Land Document', 'Bank Passbook']
  },
  swachh: {
    name: 'Swachh Bharat Mission',
    icon: '🌿',
    url: 'https://swachhbharatmission.gov.in',
    desc: 'Funds for toilet construction, waste management, and cleanliness drives in rural areas.',
    helpline: '1800-11-5652',
    docs: ['Aadhaar Card', 'Village Panchayat Letter', 'Bank Account Details']
  },
  pmawas: {
    name: 'PM Awas Yojana',
    icon: '🏠',
    url: 'https://pmayg.nic.in',
    desc: 'Financial assistance of ₹1.20 lakh for pucca house construction for BPL families.',
    helpline: '1800-11-6446',
    docs: ['Aadhaar Card', 'BPL Certificate', 'Income Certificate', 'Land Ownership Proof']
  },
  mgnrega: {
    name: 'MGNREGA',
    icon: '🌱',
    url: 'https://nrega.nic.in',
    desc: '100 days of guaranteed employment per year for rural households. Apply at your Gram Panchayat.',
    helpline: '1800-111-555',
    docs: ['Job Card', 'Aadhaar Card', 'Bank Account']
  }
};

window.applyScheme = function(schemeKey) {
  const s = SCHEMES[schemeKey];
  if (!s) return;
  const modal = document.getElementById('schemeModal');
  const content = document.getElementById('schemeModalContent');
  if (!modal || !content) { window.open(s.url, '_blank'); return; }
  content.innerHTML = `
    <div style="text-align:center;margin-bottom:20px">
      <div style="font-size:48px">${s.icon}</div>
      <h2 style="font-family:'Playfair Display',serif;font-size:24px;margin:8px 0;color:#1a1a1a">${s.name}</h2>
      <span style="background:#e8f5e9;color:#2D7D46;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700">✅ OPEN FOR APPLICATIONS</span>
    </div>
    <p style="color:#555;line-height:1.6;margin-bottom:16px">${s.desc}</p>
    <div style="background:#f9f9f9;border-radius:12px;padding:16px;margin-bottom:16px">
      <p style="font-weight:700;margin-bottom:8px;color:#333">📋 Documents Required:</p>
      <ul style="margin:0;padding-left:20px;color:#555;line-height:1.8">
        ${s.docs.map(d => `<li>${d}</li>`).join('')}
      </ul>
    </div>
    <p style="font-size:13px;color:#888;margin-bottom:16px">📞 Helpline: <strong style="color:#2D7D46">${s.helpline}</strong> (Free, 24/7)</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button onclick="window.open('${s.url}','_blank')" style="flex:1;background:linear-gradient(135deg,#2D7D46,#3a9958);color:white;border:none;padding:14px;border-radius:12px;font-weight:700;cursor:pointer;font-size:15px">🌐 Apply Online</button>
      <button onclick="shareScheme('${schemeKey}')" style="flex:1;background:linear-gradient(135deg,#25D366,#128C7E);color:white;border:none;padding:14px;border-radius:12px;font-weight:700;cursor:pointer;font-size:15px">📱 Share on WhatsApp</button>
    </div>
  `;
  modal.style.display = 'flex';
};

window.shareScheme = function(schemeKey) {
  const s = SCHEMES[schemeKey];
  if (!s) return;
  const text = encodeURIComponent(`🏛️ ${s.name}\n\n${s.desc}\n\n📞 Helpline: ${s.helpline}\n🌐 Apply: ${s.url}\n\n— Shared via EcoVoice 🌱`);
  window.open('https://wa.me/?text=' + text, '_blank');
};

window.learnMore = function(schemeKey) {
  const s = SCHEMES[schemeKey];
  if (s) window.open(s.url, '_blank');
};

window.closeSchemeModal = function() {
  const modal = document.getElementById('schemeModal');
  if (modal) modal.style.display = 'none';
};

window.contactBlockOffice = function() {
  const text = encodeURIComponent('🏥 Health & Hygiene Support Needed\n\nOur village needs assistance with:\n• Handwashing stations\n• Health awareness camps\n• Water purification\n\nPlease contact us for Jal Jeevan Mission support.\n\n— EcoVoice Community 🌱');
  window.open('https://wa.me/?text=' + text, '_blank');
};

window.shareWithPanchayat = function(schemeName) {
  const text = encodeURIComponent(`📢 Action Required — ${schemeName}\n\nOur village qualifies for ${schemeName} funding.\n\nPlease initiate the application process.\n\n— Sent via EcoVoice 🌱\n${window.location.href}`);
  window.open('https://wa.me/?text=' + text, '_blank');
};

// Close modal on backdrop click
document.addEventListener('click', e => {
  const modal = document.getElementById('schemeModal');
  if (modal && e.target === modal) modal.style.display = 'none';
});
