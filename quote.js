// Shared engine for VietMed Tour package/quote pages.
// Each page defines `window.PKG_DATA = { tiers: [...] }` before loading this file.
(function () {
  var data = window.PKG_DATA;
  if (!data || !data.tiers || !data.tiers.length) return;

  var state = {
    tierIndex: 0,
    selectedAddons: new Set(),
  };

  var els = {
    tabs: document.getElementById('pkg-tabs'),
    name: document.getElementById('pkg-name'),
    tagline: document.getElementById('pkg-tagline'),
    desc: document.getElementById('pkg-desc'),
    price: document.getElementById('pkg-price'),
    duration: document.getElementById('pkg-duration'),
    includedList: document.getElementById('pkg-included-list'),
    moreBtn: document.getElementById('pkg-more-btn'),
    moreList: document.getElementById('pkg-more-list'),
    addonsList: document.getElementById('pkg-addons-list'),
    bdBaseLabel: document.getElementById('bd-base-label'),
    bdBaseAmt: document.getElementById('bd-base-amt'),
    bdAddons: document.getElementById('bd-addons'),
    bdTotal: document.getElementById('bd-total'),
    form: document.getElementById('pkg-form'),
    formSuccess: document.getElementById('form-success'),
  };

  function money(n) {
    return '$' + n.toLocaleString('en-US');
  }

  function currentTier() {
    return data.tiers[state.tierIndex];
  }

  function renderTabs() {
    els.tabs.innerHTML = '';
    data.tiers.forEach(function (tier, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pkg-tab' + (i === state.tierIndex ? ' active' : '');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', i === state.tierIndex ? 'true' : 'false');
      btn.innerHTML = '<span>' + tier.name + '</span>' +
        (tier.badge ? '<span class="pkg-tab-badge">' + tier.badge + '</span>' : '');
      btn.addEventListener('click', function () {
        if (state.tierIndex === i) return;
        state.tierIndex = i;
        state.selectedAddons = new Set();
        renderAll();
      });
      els.tabs.appendChild(btn);
    });
  }

  function renderPackage() {
    var tier = currentTier();
    els.name.textContent = tier.name;
    els.tagline.textContent = tier.tagline;
    els.desc.textContent = tier.desc;
    els.price.textContent = money(tier.price);
    els.duration.textContent = tier.duration;

    els.includedList.innerHTML = '';
    tier.included.forEach(function (item) {
      var li = document.createElement('li');
      li.innerHTML = '<i class="ti ti-check"></i><span>' + item + '</span>';
      els.includedList.appendChild(li);
    });

    els.moreList.innerHTML = '';
    els.moreList.classList.remove('show');
    els.moreBtn.classList.remove('open');
    els.moreBtn.innerHTML = 'More details <i class="ti ti-chevron-down"></i>';
    if (tier.more && tier.more.length) {
      els.moreBtn.style.display = 'inline-flex';
      tier.more.forEach(function (item) {
        var li = document.createElement('li');
        li.innerHTML = '<i class="ti ti-check"></i><span>' + item + '</span>';
        els.moreList.appendChild(li);
      });
    } else {
      els.moreBtn.style.display = 'none';
    }
  }

  function renderAddons() {
    var tier = currentTier();
    els.addonsList.innerHTML = '';
    tier.addons.forEach(function (addon, i) {
      var selected = state.selectedAddons.has(i);
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'addon-btn' + (selected ? ' selected' : '');
      btn.setAttribute('aria-pressed', selected ? 'true' : 'false');
      btn.innerHTML =
        '<span class="addon-left"><span class="addon-dot">' + (selected ? '✓' : '+') + '</span>' +
        '<span class="addon-name">' + addon.name + '</span></span>' +
        '<span class="addon-price">+' + money(addon.price) + '</span>';
      btn.addEventListener('click', function () {
        if (state.selectedAddons.has(i)) state.selectedAddons.delete(i);
        else state.selectedAddons.add(i);
        renderAddons();
        renderBreakdown();
      });
      li.appendChild(btn);
      els.addonsList.appendChild(li);
    });
  }

  function renderBreakdown() {
    var tier = currentTier();
    els.bdBaseLabel.textContent = tier.name + ' package';
    els.bdBaseAmt.textContent = money(tier.price);

    els.bdAddons.innerHTML = '';
    var total = tier.price;
    if (state.selectedAddons.size === 0) {
      var empty = document.createElement('p');
      empty.className = 'bd-empty';
      empty.textContent = 'No add-ons selected yet.';
      els.bdAddons.appendChild(empty);
    } else {
      state.selectedAddons.forEach(function (i) {
        var addon = tier.addons[i];
        total += addon.price;
        var row = document.createElement('div');
        row.className = 'bd-row';
        row.innerHTML = '<span class="bd-name">' + addon.name + '</span><span class="bd-amt">+' + money(addon.price) + '</span>';
        els.bdAddons.appendChild(row);
      });
    }
    els.bdTotal.textContent = money(total);
  }

  function renderAll() {
    renderTabs();
    renderPackage();
    renderAddons();
    renderBreakdown();
  }

  els.moreBtn.addEventListener('click', function () {
    var open = els.moreList.classList.toggle('show');
    els.moreBtn.classList.toggle('open', open);
    els.moreBtn.innerHTML = (open ? 'Show less' : 'More details') + ' <i class="ti ti-chevron-down"></i>';
  });

  if (els.form) {
    els.form.addEventListener('submit', function (e) {
      e.preventDefault();
      els.formSuccess.classList.add('show');
      els.form.reset();
    });
  }

  renderAll();
})();
