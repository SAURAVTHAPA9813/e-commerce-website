// search.js - site-wide search across plants and tools
(function(){
  const backendApiUrl = (window.API_BASE || '').replace(/\/$/, '') + '/filters.php';

  const FALLBACK_IMG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='%23e9ecef'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%236c757d' font-size='20' font-family='Arial'>No Image</text></svg>";
  function resolveImageUrl(url, w=400, h=300){
    try{
      if(!url) return FALLBACK_IMG;
      if(!/^https?:\/\//i.test(url)) return url.replace(/\s/g,'%20');
      if(/images\.unsplash\.com/i.test(url)){
        const u = new URL(url);
        u.searchParams.set('w', String(w));
        u.searchParams.set('h', String(h));
        u.searchParams.set('fit','crop');
        u.searchParams.set('auto','format');
        u.searchParams.set('q','70');
        return u.toString();
      }
      return url;
    }catch{ return FALLBACK_IMG; }
  }

  function getParam(name){
    const url = new URL(window.location.href);
    return url.searchParams.get(name) || '';
  }
  function setParam(name,val){
    const url = new URL(window.location.href);
    if(val) url.searchParams.set(name,val); else url.searchParams.delete(name);
    window.history.replaceState({},'',url.toString());
  }

  async function fetchResults(q, sortBy, page=1){
    const params = new URLSearchParams();
    params.append('action','searchAll');
    if(q) params.append('search', q);
    if(sortBy) params.append('sortBy', sortBy);
    params.append('page', String(page));
    params.append('limit','12');
    const res = await fetch(`${backendApiUrl}?${params.toString()}`);
    const data = await res.json();
    if(data.status !== 'success') throw new Error(data.message || 'Search failed');
    return data.data;
  }

  function renderGrid(data){
    const grid = document.getElementById('searchGrid');
    const badge = document.getElementById('searchQuery');
    const resultCount = document.getElementById('resultCount');
    if(!grid) return;
    const list = data.results || [];
    const pagination = data.pagination || null;

    // Update result count
    if (pagination && pagination.total) {
      resultCount.textContent = `${pagination.total} result${pagination.total===1?'':'s'}`;
    } else {
      resultCount.textContent = `${list.length} result${list.length===1?'':'s'}`;
    }

    if(list.length === 0){
      grid.innerHTML = `<div style="grid-column:1/-1; padding:40px; text-align:center;">
        <h3>No results</h3><p>Try another search term.</p>
      </div>`;
      renderPagination(null);
      return;
    }
    grid.innerHTML = list.map(p=>{
      const img = resolveImageUrl(p.image_url);
      const typeTag = p.product_type ? `<span class='product-tag'>${p.product_type==='tool'?'Tool':'Plant'}</span>` : '';
      const extraTag = p.material ? `<span class='product-tag'>${p.material}</span>` : (p.care_level ? `<span class='product-tag'>${p.care_level} Care</span>` : '');
      const tags = [typeTag, extraTag].filter(Boolean).join('');
      return `
        <div class="product">
          <div class="plant-image-container">
            <img src="${img}" alt="${p.name}" class="plant-image" loading="lazy" decoding="async" width="400" height="300">
            <button class="add-to-cart-btn" data-product-id="${p.id}" data-product-name="${p.name}" data-product-price="${p.price}" data-product-image="${img}">Add to Cart</button>
          </div>
          <h4 class="plant-title">${p.name}</h4>
          <p class="plant-desc">${p.description||''}</p>
          ${tags?`<div class="product-tags" style="display:flex; gap:5px; flex-wrap:wrap; margin:10px 15px;">${tags}</div>`:''}
          <p class="plant-price">$${parseFloat(p.price||0).toFixed(2)}</p>
        </div>`;
    }).join('');
    renderPagination(pagination);
  }

  function renderPagination(pagination) {
    const pager = document.getElementById('searchPager');
    if (!pager) return;
    if (!pagination || pagination.total_pages <= 1) {
      pager.innerHTML = '';
      return;
    }
    const page = pagination.current_page || 1;
    const total = pagination.total_pages || 1;
    const mk = (label, p, disabled=false, active=false) => `
      <button class="pager-btn ${disabled?'disabled':''} ${active?'active':''}" data-page="${p}" ${disabled?'disabled':''}>${label}</button>`;
    const parts = [];
    parts.push(mk('Prev', page-1, page<=1));
    const start = Math.max(1, page-2);
    const end = Math.min(total, page+2);
    for (let i=start;i<=end;i++) parts.push(mk(String(i), i, false, i===page));
    parts.push(mk('Next', page+1, page>=total));
    pager.innerHTML = parts.join('');
    pager.querySelectorAll('button.pager-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = parseInt(btn.dataset.page, 10);
        if (!isNaN(p)) {
          setParam('page', String(p));
          search();
          window.scrollTo({top: 0, behavior: 'smooth'});
        }
      });
    });
  }

  async function run(){
    const q = getParam('q') || getParam('search') || '';
    const sortSel = document.getElementById('searchSort');
    const badge = document.getElementById('searchQuery');
    if(badge) badge.textContent = q ? `“${q}”` : 'All products';
    if(sortSel){
      sortSel.addEventListener('change', ()=>{
        setParam('sortBy', sortSel.value || '');
        search();
      });
      const curSort = getParam('sortBy') || '';
      sortSel.value = curSort;
    }

    // Wire overlay search: navigate on Enter/Click
    const input = document.querySelector('.search-input');
    const btn = document.getElementById('search-submit-button');
    const go = () => {
      const term = (document.querySelector('.search-input')?.value || '').trim();
      if(!term) return;
      setParam('q', term);
      search();
    };
    if(input){ input.addEventListener('keypress', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); go(); }}); }
    if(btn){ btn.addEventListener('click', (e)=>{ e.preventDefault(); go(); }); }

    await search();
  }

  async function search(){
    const q = getParam('q') || getParam('search') || '';
    const sortBy = getParam('sortBy') || '';
    const page = parseInt(getParam('page') || '1', 10);
    try{
      const data = await fetchResults(q, sortBy, page);
      renderGrid(data);
    }catch(err){
      const grid = document.getElementById('searchGrid');
      if(grid) grid.innerHTML = `<div style="grid-column:1/-1; padding:40px; color:#c00;">${err.message}</div>`;
    }
  }

  document.addEventListener('DOMContentLoaded', run);
})();
