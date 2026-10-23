// Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });
    }

    // Search Modal Interaction
    const searchModal = document.getElementById('searchModal');
    const searchOpenBtn = document.getElementById('searchOpenBtn');
    const searchOpenBtnMobile = document.getElementById('searchOpenBtnMobile');
    const searchCloseBtn = document.getElementById('searchCloseBtn');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    function openSearch() {
      if (searchModal) {
        searchModal.classList.remove('hidden');
        searchModal.classList.add('flex');
        document.body.classList.add('overflow-hidden');
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        const items = searchResults?.querySelectorAll('a');
        items?.forEach(item => { item.style.display = 'flex'; });
      }
    }

    function closeSearch() {
      if (searchModal) {
        searchModal.classList.add('hidden');
        searchModal.classList.remove('flex');
        document.body.classList.remove('overflow-hidden');
      }
    }

    searchOpenBtn?.addEventListener('click', openSearch);
    searchOpenBtnMobile?.addEventListener('click', openSearch);
    searchCloseBtn?.addEventListener('click', closeSearch);

    searchModal?.addEventListener('click', (e) => {
      if (e.target === searchModal) closeSearch();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSearch();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearch();
      }
    });

    // Real-time quick filter
    searchInput?.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      const items = searchResults.querySelectorAll('.search-item');
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(term) ? 'flex' : 'none';
      });
    });
