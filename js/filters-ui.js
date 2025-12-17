// filters-ui.js - shared filter dropdown + overlay wiring
;(function(){
  if (window.__filtersUiBound) return; window.__filtersUiBound = true;
  document.addEventListener('DOMContentLoaded', function(){
    // Desktop dropdowns
    document.querySelectorAll('.shop-filters-sort .filter-button').forEach(button => {
      button.addEventListener('click', function(e){
        e.preventDefault(); e.stopPropagation();
        const id = this.dataset.filterId; const panel = document.getElementById(id);
        if (!panel) return;
        document.querySelectorAll('.shop-filters-sort .filter-options.active').forEach(p => {
          if (p.id !== id) {
            p.classList.remove('active');
            const b = document.querySelector(`.shop-filters-sort [data-filter-id="${p.id}"]`);
            if (b) b.classList.remove('active');
          }
        });
        const isActive = panel.classList.contains('active');
        panel.classList.toggle('active', !isActive);
        this.classList.toggle('active', !isActive);
      });
    });

    // Close on outside
    document.addEventListener('click', function(e){
      if (!e.target.closest('.filter-group')){
        document.querySelectorAll('.shop-filters-sort .filter-options.active').forEach(p => {
          p.classList.remove('active');
          const b = document.querySelector(`.shop-filters-sort [data-filter-id="${p.id}"]`);
          if (b) b.classList.remove('active');
        });
      }
    });

    // Mobile overlay
    const mobileToggle = document.querySelector('.mobile-filter-toggle');
    const overlay = document.querySelector('.mobile-filter-overlay');
    const closeBtn = document.querySelector('.overlay-close-button');
    if (mobileToggle && overlay){
      mobileToggle.addEventListener('click', ()=>{ overlay.classList.add('active'); document.body.style.overflow='hidden'; });
    }
    if (closeBtn && overlay){
      closeBtn.addEventListener('click', ()=>{ overlay.classList.remove('active'); document.body.style.overflow=''; });
    }

    // Mobile dropdowns
    document.querySelectorAll('.overlay-content .filter-button').forEach(button => {
      button.addEventListener('click', function(e){
        e.preventDefault(); e.stopPropagation();
        const id = this.dataset.filterId; const panel = document.getElementById(id);
        if (!panel) return;
        document.querySelectorAll('.overlay-content .filter-options.active').forEach(p => {
          if (p.id !== id){
            p.classList.remove('active');
            const b = document.querySelector(`.overlay-content [data-filter-id="${p.id}"]`);
            if (b) b.classList.remove('active');
          }
        });
        const isActive = panel.classList.contains('active');
        panel.classList.toggle('active', !isActive);
        this.classList.toggle('active', !isActive);
      });
    });

    // Apply / Clear (delegates to productManager if present)
    const applyBtn = document.querySelector('.apply-filters-button');
    if (applyBtn){
      console.log('filters-ui.js: Apply button found, adding listener');
      applyBtn.addEventListener('click', (e)=>{
        console.log('filters-ui.js: Apply button clicked');
        console.log('filters-ui.js: productManager available:', !!window.productManager);
        e.preventDefault();
        e.stopPropagation();
        if (window.productManager){
          console.log('filters-ui.js: Calling productManager.updateFilters()');
          window.productManager.updateFilters();
          console.log('filters-ui.js: Calling productManager.applyFilters()');
          window.productManager.applyFilters();
        } else {
          console.error('filters-ui.js: productManager not available');
        }
        if (overlay){
          console.log('filters-ui.js: Closing overlay');
          overlay.classList.remove('active');
          document.body.style.overflow='';
        }
      });
    } else {
      console.log('filters-ui.js: Apply button not found');
    }
    const clearBtn = document.querySelector('.clear-filters-button');
    if (clearBtn){
      clearBtn.addEventListener('click', ()=>{
        document.querySelectorAll('.filter-options input[type="checkbox"]').forEach(cb => cb.checked=false);
        if (window.productManager){ window.productManager.clearAllFilters(); }
      });
    }

    // Sort sync - keep both dropdowns in sync
    const s1 = document.getElementById('sort-select');
    const s2 = document.getElementById('sort-select-mobile');

    if (s1 && s2) {
      // Desktop sort changes mobile
      s1.addEventListener('change', () => {
        s2.value = s1.value; // Sync mobile dropdown value
        if(window.productManager){
          window.productManager.sortBy = s1.value;
          window.productManager.applyFilters();
        }
      });

      // Mobile sort changes desktop
      s2.addEventListener('change', () => {
        s1.value = s2.value; // Sync desktop dropdown value
        if(window.productManager){
          window.productManager.sortBy = s2.value;
          window.productManager.applyFilters();
        }
      });
    } else if (s1) {
      // Only desktop exists
      s1.addEventListener('change', ()=>{
        if(window.productManager){
          window.productManager.sortBy = s1.value;
          window.productManager.applyFilters();
        }
      });
    } else if (s2) {
      // Only mobile exists
      s2.addEventListener('change', ()=>{
        if(window.productManager){
          window.productManager.sortBy = s2.value;
          window.productManager.applyFilters();
        }
      });
    }

    // Desktop checkbox auto-apply
    document.querySelectorAll('.filter-options input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', function(){
        if (!this.closest('.mobile-filter-overlay') && window.productManager){ window.productManager.updateFilters(); window.productManager.applyFilters(); }
      });
    });
  });
})();

