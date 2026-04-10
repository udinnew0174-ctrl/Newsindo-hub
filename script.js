(function() {
  "use strict";

  // --- State ---
  let allNews = [];
  let isLoading = false;

  // --- DOM Elements ---
  const grid = document.getElementById('newsGrid');
  const hero = document.getElementById('heroContainer');
  const refreshBtn = document.getElementById('refreshBtn');
  const darkToggle = document.getElementById('darkToggle');
  const scrollBtn = document.getElementById('scrollTopBtn');
  const modal = document.getElementById('newsModal');
  const modalBody = document.getElementById('modalBody');
  const closeModal = document.getElementById('closeModal');
  const skeleton = document.getElementById('skeletonContainer');
  const errorDiv = document.getElementById('errorContainer');
  const newsCountSpan = document.getElementById('newsCount')?.querySelector('span');

  // --- Helper Functions ---
  function getImageUrl(item) {
    if (item.src === 'gempa' || item.src === 'harilibur') return null;
    if (item.image) return item.image;
    
    const fallbacks = {
      liputan6: 'https://via.placeholder.com/300x170/0f5fa8/ffffff?text=Liputan6',
      suara: 'https://via.placeholder.com/300x170/0f5fa8/ffffff?text=Suara.com',
      merdeka: 'https://via.placeholder.com/300x170/0f5fa8/ffffff?text=Merdeka',
      antara: 'https://via.placeholder.com/300x170/0f5fa8/ffffff?text=Antara',
      sindonews: 'https://via.placeholder.com/300x170/0f5fa8/ffffff?text=Sindonews',
      cnbc: 'https://via.placeholder.com/300x170/0f5fa8/ffffff?text=CNBC',
      tribun: 'https://via.placeholder.com/300x170/0f5fa8/ffffff?text=Tribun',
      kompas: 'https://via.placeholder.com/300x170/0f5fa8/ffffff?text=Kompas',
      cnn: 'https://via.placeholder.com/300x170/0f5fa8/ffffff?text=CNN',
      medcom: 'https://via.placeholder.com/300x170/0f5fa8/ffffff?text=Medcom',
      viva: 'https://via.placeholder.com/300x170/0f5fa8/ffffff?text=Viva',
      jawapos: 'https://via.placeholder.com/300x170/0f5fa8/ffffff?text=Jawa+Pos',
      republika: 'https://via.placeholder.com/300x170/0f5fa8/ffffff?text=Republika',
    };
    
    return fallbacks[item.src] || 'https://via.placeholder.com/300x170/0f5fa8/ffffff?text=NewsHub';
  }

  function formatTime(t) {
    return t || 'terkini';
  }

  function showSkeleton(show) {
    if (show) {
      skeleton.style.display = 'grid';
      grid.innerHTML = '';
      let sk = '';
      for (let i = 0; i < 15; i++) {
        sk += `<div class="skeleton-card"><div class="skeleton-img"></div><div class="skeleton-line"></div><div class="skeleton-line short"></div></div>`;
      }
      skeleton.innerHTML = sk;
    } else {
      skeleton.style.display = 'none';
    }
  }

  // --- Fetch All Sources ---
  async function fetchAll() {
    if (isLoading) return;
    isLoading = true;
    showSkeleton(true);
    if (errorDiv) errorDiv.style.display = 'none';

    try {
      const results = await Promise.all(sources.map(async s => {
        try {
          const res = await fetch(s.url);
          if (!res.ok) return [];
          const json = await res.json();
          
          if (s.isMultiItem) {
            return s.map(null, null, json.data || json);
          } else {
            const items = json.data || json.articles || json.posts || [];
            return items.map(s.map);
          }
        } catch (e) {
          console.error(`Error fetching ${s.name}:`, e);
          return [];
        }
      }));
      
      allNews = results.flat().filter(n => n.title && n.title.length > 3);
      allNews = allNews.slice(0, 1500).sort(() => Math.random() - 0.5);
      
      renderHero();
      renderGrid();
      
      if (newsCountSpan) {
        newsCountSpan.textContent = allNews.length;
      }
    } catch (e) {
      errorDiv.style.display = 'block';
      errorDiv.innerHTML = '⚠️ Gagal memuat berita. Silakan coba lagi.';
    } finally {
      isLoading = false;
      showSkeleton(false);
    }
  }

  // --- Render Functions ---
  function renderHero() {
    if (!allNews.length) { 
      hero.innerHTML = ''; 
      return; 
    }
    
    const h = allNews[Math.floor(Math.random() * allNews.length)];
    const heroImage = getImageUrl(h);
    
    let badgeHtml = '';
    if (h.src === 'gempa') {
      badgeHtml = '<span class="badge badge-gempa"><i class="fas fa-earth-asia"></i> GEMPA</span>';
    } else if (h.src === 'harilibur') {
      badgeHtml = '<span class="badge badge-libur"><i class="fas fa-calendar-alt"></i> HARI LIBUR</span>';
    }
    
    const escapedItem = JSON.stringify(h).replace(/"/g, '&quot;');
    hero.innerHTML = `
      <div class="hero-card">
        <div class="hero-img" style="background-image: url('${heroImage || 'https://via.placeholder.com/700x400/0f5fa8/ffffff?text=NewsHub'}')"></div>
        <div class="hero-content">
          ${badgeHtml}
          <h2>${h.title}</h2>
          <div class="hero-meta">
            <span><i class="fas fa-tag"></i> ${h.cat || h.src}</span>
            <span><i class="far fa-clock"></i> ${formatTime(h.time)}</span>
            ${h.magnitude ? `<span><i class="fas fa-wave-square"></i> ${h.magnitude} SR</span>` : ''}
            ${h.daysUntil !== undefined ? `<span><i class="fas fa-hourglass-half"></i> ${h.daysUntil} hari lagi</span>` : ''}
          </div>
          <button class="hero-btn" onclick="showDetail('${h.src}', JSON.parse('${escapedItem}'))">
            Lihat Detail <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    `;
  }

  function renderGrid() {
    if (!allNews.length) {
      grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:3rem;">Tidak ada berita.</div>';
      return;
    }
    
    let html = '';
    allNews.forEach(n => {
      const isCnn = n.src === 'cnn' && n.content;
      const imageUrl = getImageUrl(n);
      
      let badgeHtml = '';
      if (n.src === 'gempa') {
        badgeHtml = '<span class="badge badge-gempa"><i class="fas fa-earth-asia"></i> GEMPA</span>';
      } else if (n.src === 'harilibur') {
        badgeHtml = '<span class="badge badge-libur"><i class="fas fa-calendar-alt"></i> HARI LIBUR</span>';
      }
      
      let extraMeta = '';
      if (n.magnitude) {
        extraMeta = `<span><i class="fas fa-wave-square"></i> ${n.magnitude} SR</span>`;
      } else if (n.daysUntil !== undefined) {
        extraMeta = `<span><i class="fas fa-hourglass-half"></i> ${n.daysUntil} hari lagi</span>`;
      }
      
      const escapedItem = JSON.stringify(n).replace(/"/g, '&quot;');
      
      if (isCnn) {
        html += `
          <div class="card">
            ${imageUrl ? 
              `<img class="card-img" src="${imageUrl}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x170/0f5fa8/ffffff?text=CNN'">` : 
              `<div class="card-img" style="background: linear-gradient(145deg, #1e3d5e, #2a4a6e); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${n.src === 'gempa' ? '🔴 INFO GEMPA' : '📅 INFO LIBUR'}</div>`
            }
            <div class="card-body">
              ${badgeHtml}
              <h3 class="card-title">${n.title}</h3>
              <div class="card-meta">
                <span><i class="fas fa-newspaper"></i> ${n.cat || n.src}</span>
                <span><i class="far fa-clock"></i> ${formatTime(n.time)}</span>
                ${extraMeta}
              </div>
              <div class="cnn-actions">
                <a href="${n.link}" target="_blank" class="card-btn"><i class="fas fa-external-link-alt"></i> Baca Asli</a>
                <button class="card-btn cnn-detail-btn" data-content="${encodeURIComponent(n.content || '')}"><i class="fas fa-file-alt"></i> Detail</button>
              </div>
            </div>
          </div>
        `;
      } else {
        html += `
          <div class="card">
            ${imageUrl ? 
              `<img class="card-img" src="${imageUrl}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x170/0f5fa8/ffffff?text=${n.src}'">` : 
              `<div class="card-img" style="background: ${n.src === 'gempa' ? 'linear-gradient(145deg, #dc3545, #b02a37)' : 'linear-gradient(145deg, #28a745, #1e7e34)'}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${n.src === 'gempa' ? '🔴 GEMPA' : '📅 HARI LIBUR'}</div>`
            }
            <div class="card-body">
              ${badgeHtml}
              <h3 class="card-title">${n.title}</h3>
              <div class="card-meta">
                <span><i class="fas fa-newspaper"></i> ${n.cat || n.src}</span>
                <span><i class="far fa-clock"></i> ${formatTime(n.time)}</span>
                ${extraMeta}
              </div>
              <button class="card-btn" onclick="showDetail('${n.src}', JSON.parse('${escapedItem}'))">
                Lihat Detail <i class="fas fa-info-circle"></i>
              </button>
            </div>
          </div>
        `;
      }
    });

    grid.innerHTML = html;

    // Attach event listeners for CNN detail buttons
    document.querySelectorAll('.cnn-detail-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const content = btn.dataset.content ? decodeURIComponent(btn.dataset.content) : 'Konten tidak tersedia.';
        modalBody.innerHTML = `<h3 style="margin-bottom:1rem;">📰 Isi Berita CNN</h3><div>${content}</div>`;
        modal.style.display = 'flex';
      });
    });
  }

  // --- Global showDetail function (called from inline onclick) ---
  window.showDetail = function(src, item) {
    let content = '';
    
    if (src === 'gempa') {
      content = `
        <h3 style="margin-bottom:1.5rem;">${item.title}</h3>
        <table style="width:100%; border-collapse:collapse;">
          <tr><td style="padding:0.5rem 0;"><strong>Magnitudo:</strong></td><td>${item.magnitude || '-'}</td></tr>
          <tr><td style="padding:0.5rem 0;"><strong>Kedalaman:</strong></td><td>${item.kedalaman || '-'}</td></tr>
          <tr><td style="padding:0.5rem 0;"><strong>Wilayah:</strong></td><td>${item.wilayah || '-'}</td></tr>
          ${item.dirasakan ? `<tr><td style="padding:0.5rem 0;"><strong>Dirasakan:</strong></td><td>${item.dirasakan}</td></tr>` : ''}
          ${item.potensi ? `<tr><td style="padding:0.5rem 0;"><strong>Potensi:</strong></td><td>${item.potensi}</td></tr>` : ''}
          <tr><td style="padding:0.5rem 0;"><strong>Waktu:</strong></td><td>${item.time || '-'}</td></tr>
        </table>
        <p style="margin-top:1.5rem; font-size:0.9rem; opacity:0.7;">Sumber: BMKG</p>
      `;
    } 
    else if (src === 'harilibur') {
      content = `
        <h3 style="margin-bottom:1.5rem;">${item.title}</h3>
        <p style="font-size:1.2rem; margin:1rem 0;"><i class="fas fa-calendar-day"></i> ${item.time}</p>
        ${item.daysUntil !== undefined ? `<p style="background:var(--surface); padding:0.8rem; border-radius:20px;"><strong>${item.daysUntil} hari lagi</strong></p>` : ''}
        <p style="margin-top:1.5rem;">Kategori: ${item.cat}</p>
      `;
    }
    else {
      content = `
        <h3 style="margin-bottom:1.5rem;">${item.title}</h3>
        <p><i class="fas fa-newspaper"></i> Sumber: ${item.cat || item.src}</p>
        <p><i class="far fa-clock"></i> ${formatTime(item.time)}</p>
        <a href="${item.link}" target="_blank" class="card-btn" style="margin-top:2rem;">Baca Artikel Lengkap <i class="fas fa-external-link-alt"></i></a>
      `;
    }
    
    modalBody.innerHTML = content;
    modal.style.display = 'flex';
  };

  // --- Event Listeners ---
  refreshBtn.addEventListener('click', fetchAll);
  
  darkToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const icon = darkToggle.querySelector('i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
  });
  
  window.addEventListener('scroll', () => {
    scrollBtn.classList.toggle('show', window.scrollY > 400);
  });
  
  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  
  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // --- Initialize ---
  fetchAll();
})();
