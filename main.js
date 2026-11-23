'use strict';

/*
 * Ridwan Rattan Export - page logic.
 * Needs js/data.js (CONFIG, PRODUCTS, SHIPPING_METHODS, SHIPPING_ZONES, FAQS).
 * Totals, freight and arrival estimates are all calculated here.
 */

(function () {
  const MAX_QTY = 999;
  const money = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: CONFIG.currency
  });
  const dateFormat = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Items in the order: { variantId, qty }
  const cart = [];

  /* ---------- Small helpers ---------- */

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function clampQty(value) {
    const number = parseInt(value, 10);
    if (isNaN(number) || number < 1) {
      return 1;
    }
    return Math.min(number, MAX_QTY);
  }

  function roundMoney(value) {
    return Math.round(value * 100) / 100;
  }

  function addDays(date, days) {
    const result = new Date(date.getTime());
    result.setDate(result.getDate() + days);
    return result;
  }

  function plural(count, singular, pluralWord) {
    return count === 1 ? singular : pluralWord;
  }

  function findProduct(productId) {
    return PRODUCTS.find(function (product) {
      return product.id === productId;
    });
  }

  function findVariant(variantId) {
    for (let i = 0; i < PRODUCTS.length; i += 1) {
      const product = PRODUCTS[i];
      for (let j = 0; j < product.variants.length; j += 1) {
        if (product.variants[j].id === variantId) {
          return { product: product, variant: product.variants[j] };
        }
      }
    }
    return null;
  }

  function findZone(zoneId) {
    return SHIPPING_ZONES.find(function (zone) {
      return zone.id === zoneId;
    });
  }

  /* ---------- Stock and availability ---------- */

  function getAvailability(variant, qty) {
    if (variant.stock >= qty) {
      return {
        status: 'ready',
        leadDays: CONFIG.readyProcessingDays,
        title: 'Ready stock',
        text:
          variant.stock + ' ' + plural(variant.stock, 'unit', 'units') +
          ' available. Packed within ' + CONFIG.readyProcessingDays + ' days.',
        short: 'Ready stock'
      };
    }

    if (variant.stock > 0) {
      const extra = qty - variant.stock;
      return {
        status: 'wait',
        leadDays: variant.productionDays,
        title: 'Partly ready',
        text:
          variant.stock + ' in stock. The other ' + extra + ' ' +
          plural(extra, 'unit takes', 'units take') +
          ' about ' + variant.productionDays + ' days to make.',
        short: 'Partly ready (' + variant.stock + ' in stock)'
      };
    }

    return {
      status: 'wait',
      leadDays: variant.productionDays,
      title: 'Made to order',
      text: 'Not in stock. Production takes about ' + variant.productionDays + ' days after confirmation.',
      short: 'Made to order (' + variant.productionDays + ' days)'
    };
  }

  /* ---------- Order calculation ---------- */

  function getShippingChoice() {
    const zone = findZone($('#shipRegion').value) || SHIPPING_ZONES[0];
    const method = $('#shipMethod').value === 'air' ? 'air' : 'sea';
    return { zone: zone, method: method };
  }

  function calculateOrder() {
    const choice = getShippingChoice();
    const result = {
      lines: [],
      subtotal: 0,
      totalCbm: 0,
      totalWeight: 0,
      leadDays: 0,
      freight: 0,
      docs: 0,
      total: 0,
      zone: choice.zone,
      method: choice.method,
      transit: choice.method === 'air' ? choice.zone.airDays : choice.zone.seaDays,
      arrivalFrom: null,
      arrivalTo: null,
      daysFrom: 0,
      daysTo: 0
    };

    cart.forEach(function (item) {
      const found = findVariant(item.variantId);
      if (!found) {
        return;
      }
      const availability = getAvailability(found.variant, item.qty);
      const lineTotal = roundMoney(found.variant.price * item.qty);

      result.lines.push({
        product: found.product,
        variant: found.variant,
        qty: item.qty,
        lineTotal: lineTotal,
        availability: availability
      });
      result.subtotal += lineTotal;
      result.totalCbm += found.variant.cbm * item.qty;
      result.totalWeight += found.variant.weightKg * item.qty;
      result.leadDays = Math.max(result.leadDays, availability.leadDays);
    });

    if (result.lines.length === 0) {
      return result;
    }

    if (choice.method === 'air') {
      const chargeableKg = Math.max(
        result.totalWeight,
        result.totalCbm * CONFIG.airVolumetricFactor
      );
      result.freight = Math.max(CONFIG.airMinCharge, chargeableKg * choice.zone.airRatePerKg);
    } else {
      result.freight = Math.max(CONFIG.seaMinCharge, result.totalCbm * choice.zone.seaRatePerCbm);
    }

    result.subtotal = roundMoney(result.subtotal);
    result.freight = roundMoney(result.freight);
    result.docs = CONFIG.docFee;
    result.total = roundMoney(result.subtotal + result.freight + result.docs);

    result.daysFrom = result.leadDays + result.transit[0];
    result.daysTo = result.leadDays + result.transit[1];
    const today = new Date();
    result.arrivalFrom = addDays(today, result.daysFrom);
    result.arrivalTo = addDays(today, result.daysTo);

    return result;
  }

  /* ---------- Product cards ---------- */

  function renderProducts() {
    const grid = $('#productGrid');

    grid.innerHTML = PRODUCTS.map(function (product) {
      const options = product.variants.map(function (variant) {
        return '<option value="' + variant.id + '">' + variant.name + '</option>';
      }).join('');

      return (
        '<div class="col-md-6 col-xl-4">' +
          '<article class="product-card" data-product-id="' + product.id + '">' +
            '<div class="product-media">' +
              '<img class="js-image" src="' + product.image + '" alt="' + product.name + '" loading="lazy">' +
            '</div>' +
            '<div class="product-body">' +
              '<h3 class="product-name">' + product.name + '</h3>' +
              '<p class="product-desc">' + product.description + '</p>' +
              '<label class="form-label" for="variant-' + product.id + '">Variant</label>' +
              '<select class="form-select mb-3 js-variant" id="variant-' + product.id + '">' + options + '</select>' +
              '<ul class="product-specs">' +
                '<li><i class="bi bi-rulers" aria-hidden="true"></i> <span class="js-size"></span></li>' +
                '<li><i class="bi bi-box-seam" aria-hidden="true"></i> <span class="js-pack"></span></li>' +
              '</ul>' +
              '<div class="availability js-availability" aria-live="polite"></div>' +
              '<div class="buy-row">' +
                '<div class="price-block">' +
                  '<div>' +
                    '<span class="price-label">Price per unit</span>' +
                    '<span class="price-value js-price"></span>' +
                  '</div>' +
                  '<div>' +
                    '<label class="price-label" for="qty-' + product.id + '">Quantity</label>' +
                    '<div class="qty-group">' +
                      '<button type="button" class="qty-btn js-minus" aria-label="Decrease quantity">&minus;</button>' +
                      '<input type="number" class="qty-input js-qty" id="qty-' + product.id + '" value="1" min="1" max="' + MAX_QTY + '" inputmode="numeric">' +
                      '<button type="button" class="qty-btn js-plus" aria-label="Increase quantity">+</button>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
                '<p class="line-total mb-3">Line total: <strong class="js-line"></strong></p>' +
                '<button type="button" class="btn btn-rattan w-100 js-add">' +
                  '<i class="bi bi-bag-plus" aria-hidden="true"></i> Add to order' +
                '</button>' +
              '</div>' +
            '</div>' +
          '</article>' +
        '</div>'
      );
    }).join('');

    $all('.product-card', grid).forEach(function (card) {
      updateCard(card, false);
    });
  }

  function getCardState(card) {
    const product = findProduct(card.getAttribute('data-product-id'));
    const variantId = $('.js-variant', card).value;
    const variant = product.variants.find(function (item) {
      return item.id === variantId;
    }) || product.variants[0];
    const qty = clampQty($('.js-qty', card).value);
    return { product: product, variant: variant, qty: qty };
  }

  function updateCard(card, normalizeQty) {
    const state = getCardState(card);
    const availability = getAvailability(state.variant, state.qty);
    const image = $('.js-image', card);

    if (normalizeQty) {
      $('.js-qty', card).value = state.qty;
    }

    image.src = state.variant.image || state.product.image;
    image.alt = state.product.name + ', ' + state.variant.name;
    image.style.objectFit = state.variant.imageFit || 'cover';

    $('.js-size', card).textContent = state.variant.size;
    $('.js-pack', card).textContent =
      'Packed: ' + state.variant.cbm.toFixed(2) + ' CBM, ' + state.variant.weightKg + ' kg per unit';
    $('.js-price', card).textContent = money.format(state.variant.price);
    $('.js-line', card).textContent = money.format(state.variant.price * state.qty);

    const box = $('.js-availability', card);
    box.className = 'availability js-availability availability-' + availability.status;
    box.innerHTML =
      '<i class="bi ' + (availability.status === 'ready' ? 'bi-check-circle-fill' : 'bi-hourglass-split') + '" aria-hidden="true"></i>' +
      '<div><strong>' + availability.title + '</strong>' + availability.text + '</div>';
  }

  function handleGridClick(event) {
    const card = event.target.closest('.product-card');
    if (!card) {
      return;
    }

    const qtyInput = $('.js-qty', card);

    if (event.target.closest('.js-minus')) {
      qtyInput.value = clampQty(parseInt(qtyInput.value, 10) - 1);
      updateCard(card, true);
    } else if (event.target.closest('.js-plus')) {
      const current = clampQty(qtyInput.value);
      qtyInput.value = Math.min(MAX_QTY, current + 1);
      updateCard(card, true);
    } else if (event.target.closest('.js-add')) {
      const button = event.target.closest('.js-add');
      const state = getCardState(card);
      addToCart(state.variant.id, state.qty);
      flashButton(button);
    }
  }

  function flashButton(button) {
    const original = button.innerHTML;
    button.innerHTML = '<i class="bi bi-check2" aria-hidden="true"></i> Added to order';
    button.disabled = true;
    window.setTimeout(function () {
      button.innerHTML = original;
      button.disabled = false;
    }, 1400);
  }

  /* ---------- Cart ---------- */

  function addToCart(variantId, qty) {
    const existing = cart.find(function (item) {
      return item.variantId === variantId;
    });
    if (existing) {
      existing.qty = Math.min(MAX_QTY, existing.qty + qty);
    } else {
      cart.push({ variantId: variantId, qty: qty });
    }
    renderOrder();
  }

  function setCartQty(variantId, qty) {
    const item = cart.find(function (entry) {
      return entry.variantId === variantId;
    });
    if (item) {
      item.qty = clampQty(qty);
    }
    renderOrder();
  }

  function removeFromCart(variantId) {
    const index = cart.findIndex(function (entry) {
      return entry.variantId === variantId;
    });
    if (index !== -1) {
      cart.splice(index, 1);
    }
    renderOrder();
  }

  function renderCartItems(order) {
    const container = $('#cartItems');

    if (order.lines.length === 0) {
      container.innerHTML =
        '<div class="cart-empty">' +
          '<i class="bi bi-bag" aria-hidden="true"></i>' +
          '<p class="mb-2">Your order is empty.</p>' +
          '<a class="btn btn-rattan-outline btn-sm" href="#products">Browse products</a>' +
        '</div>';
      return;
    }

    container.innerHTML = order.lines.map(function (line) {
      const id = line.variant.id;
      const image = line.variant.image || line.product.image;
      return (
        '<div class="cart-item" data-variant-id="' + id + '">' +
          '<img class="cart-thumb" src="' + image + '" alt="' + line.product.name + '" loading="lazy">' +
          '<div>' +
            '<p class="cart-name">' + line.product.name + '</p>' +
            '<p class="cart-variant">' + line.variant.name + ', ' + money.format(line.variant.price) + ' each</p>' +
            '<p class="cart-status cart-status-' + line.availability.status + '">' + line.availability.short + '</p>' +
          '</div>' +
          '<div class="cart-controls">' +
            '<div class="qty-group">' +
              '<button type="button" class="qty-btn js-cart-minus" aria-label="Decrease quantity of ' + line.product.name + '">&minus;</button>' +
              '<input type="number" class="qty-input js-cart-qty" value="' + line.qty + '" min="1" max="' + MAX_QTY + '" inputmode="numeric" aria-label="Quantity of ' + line.product.name + '">' +
              '<button type="button" class="qty-btn js-cart-plus" aria-label="Increase quantity of ' + line.product.name + '">+</button>' +
            '</div>' +
            '<span class="cart-line">' + money.format(line.lineTotal) + '</span>' +
            '<button type="button" class="cart-remove js-cart-remove" aria-label="Remove ' + line.product.name + ' from order">Remove</button>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  function renderSummary(order) {
    const hasItems = order.lines.length > 0;

    $('#sumSubtotal').textContent = money.format(order.subtotal);
    $('#sumFreight').textContent = money.format(order.freight);
    $('#sumDocs').textContent = money.format(order.docs);
    $('#sumTotal').textContent = money.format(order.total);

    if (!hasItems) {
      $('#sumShipment').textContent = 'Shipment size will show here.';
      $('#sumArrival').textContent = 'Add a product to see the estimated arrival.';
      $('#sumDays').textContent = '';
      return;
    }

    const methodName = order.method === 'air' ? 'air freight' : 'sea freight';
    $('#sumShipment').textContent =
      'Shipment: ' + order.totalCbm.toFixed(2) + ' CBM, ' +
      Math.round(order.totalWeight * 10) / 10 + ' kg by ' + methodName +
      ' to ' + order.zone.ports + '.';
    $('#sumArrival').textContent =
      'Estimated arrival: ' + dateFormat.format(order.arrivalFrom) +
      ' to ' + dateFormat.format(order.arrivalTo) + '.';
    $('#sumDays').textContent =
      order.daysFrom + ' to ' + order.daysTo + ' days from order confirmation (' +
      order.leadDays + ' days ' + (order.leadDays === CONFIG.readyProcessingDays ? 'packing' : 'production') +
      ' plus ' + order.transit[0] + ' to ' + order.transit[1] + ' days transit).';
  }

  function renderOrder() {
    const order = calculateOrder();
    const count = cart.reduce(function (sum, item) {
      return sum + item.qty;
    }, 0);

    renderCartItems(order);
    renderSummary(order);
    $('#cartCount').textContent = count;
  }

  function handleCartClick(event) {
    const row = event.target.closest('.cart-item');
    if (!row) {
      return;
    }
    const variantId = row.getAttribute('data-variant-id');
    const input = $('.js-cart-qty', row);

    if (event.target.closest('.js-cart-minus')) {
      setCartQty(variantId, parseInt(input.value, 10) - 1);
    } else if (event.target.closest('.js-cart-plus')) {
      setCartQty(variantId, clampQty(input.value) + 1);
    } else if (event.target.closest('.js-cart-remove')) {
      removeFromCart(variantId);
    }
  }

  function handleCartChange(event) {
    if (!event.target.classList.contains('js-cart-qty')) {
      return;
    }
    const row = event.target.closest('.cart-item');
    if (row) {
      setCartQty(row.getAttribute('data-variant-id'), event.target.value);
    }
  }

  /* ---------- Shipping controls and rates table ---------- */

  function renderShippingControls() {
    $('#shipRegion').innerHTML = SHIPPING_ZONES.map(function (zone) {
      return '<option value="' + zone.id + '">' + zone.name + ': ' + zone.ports + '</option>';
    }).join('');

    $('#shipMethod').innerHTML = SHIPPING_METHODS.map(function (method) {
      return '<option value="' + method.id + '">' + method.label + '</option>';
    }).join('');
  }

  function renderRatesTable() {
    $('#ratesBody').innerHTML = SHIPPING_ZONES.map(function (zone) {
      return (
        '<tr>' +
          '<th scope="row">' + zone.name + '</th>' +
          '<td>' + zone.ports + '</td>' +
          '<td>' + money.format(zone.seaRatePerCbm) + '</td>' +
          '<td>' + zone.seaDays[0] + ' to ' + zone.seaDays[1] + ' days</td>' +
          '<td>' + money.format(zone.airRatePerKg) + '</td>' +
          '<td>' + zone.airDays[0] + ' to ' + zone.airDays[1] + ' days</td>' +
        '</tr>'
      );
    }).join('');

    $('#ratesNote').textContent =
      'Minimum charge: ' + money.format(CONFIG.seaMinCharge) + ' for sea freight and ' +
      money.format(CONFIG.airMinCharge) + ' for air freight. Air freight uses the higher of actual weight or ' +
      CONFIG.airVolumetricFactor + ' kg per CBM. An export documents and fumigation fee of ' +
      money.format(CONFIG.docFee) + ' applies once per order.';
  }

  /* ---------- FAQ ---------- */

  function renderFaq() {
    $('#faqList').innerHTML = FAQS.map(function (faq, index) {
      const headingId = 'faq-heading-' + index;
      const panelId = 'faq-panel-' + index;
      return (
        '<div class="accordion-item">' +
          '<h3 class="accordion-header" id="' + headingId + '">' +
            '<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" ' +
              'data-bs-target="#' + panelId + '" aria-expanded="false" aria-controls="' + panelId + '">' +
              faq.question +
            '</button>' +
          '</h3>' +
          '<div id="' + panelId + '" class="accordion-collapse collapse" aria-labelledby="' + headingId + '" data-bs-parent="#faqList">' +
            '<div class="accordion-body">' + faq.answer + '</div>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  /* ---------- Sending the order ---------- */

  function createOrderRef() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = String(Math.floor(1000 + Math.random() * 9000));
    return 'RRE-' + now.getFullYear() + month + day + '-' + random;
  }

  function getBuyer() {
    return {
      name: $('#buyerName').value.trim(),
      company: $('#buyerCompany').value.trim(),
      email: $('#buyerEmail').value.trim(),
      phone: $('#buyerPhone').value.trim(),
      address: $('#buyerAddress').value.trim(),
      notes: $('#buyerNotes').value.trim()
    };
  }

  function buildOrderMessage(ref, buyer, order) {
    const methodName = order.method === 'air' ? 'Air freight' : 'Sea freight (LCL)';
    const lines = [
      'Hello ' + CONFIG.businessName + ',',
      'I would like to request the following order.',
      '',
      'Order ref: ' + ref,
      '',
      'Items:'
    ];

    order.lines.forEach(function (line, index) {
      lines.push(
        (index + 1) + '. ' + line.product.name + ' - ' + line.variant.name +
        ' x ' + line.qty + ' @ ' + money.format(line.variant.price) +
        ' = ' + money.format(line.lineTotal) + ' (' + line.availability.short + ')'
      );
    });

    lines.push(
      '',
      'Products subtotal: ' + money.format(order.subtotal),
      'Freight (' + methodName + ', ' + order.zone.name + ' - ' + order.zone.ports + '): ' + money.format(order.freight),
      'Export documents and fumigation: ' + money.format(order.docs),
      'Total: ' + money.format(order.total),
      '',
      'Estimated arrival: ' + dateFormat.format(order.arrivalFrom) + ' to ' + dateFormat.format(order.arrivalTo) +
        ' (' + order.daysFrom + ' to ' + order.daysTo + ' days)',
      '',
      'Buyer details:',
      'Name: ' + buyer.name
    );

    if (buyer.company) {
      lines.push('Company: ' + buyer.company);
    }
    lines.push(
      'Email: ' + buyer.email,
      'Phone: ' + buyer.phone,
      'Delivery: ' + buyer.address
    );
    if (buyer.notes) {
      lines.push('Notes: ' + buyer.notes);
    }

    return lines.join('\n');
  }

  function showAlert(message, type) {
    const box = $('#orderAlert');
    box.textContent = message;
    box.className = 'alert mt-3 mb-0 alert-' + type + '-rattan';
  }

  function openLink(url) {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try {
        const copied = document.execCommand('copy');
        document.body.removeChild(area);
        if (copied) {
          resolve();
        } else {
          reject(new Error('Copy command failed'));
        }
      } catch (error) {
        document.body.removeChild(area);
        reject(error);
      }
    });
  }

  function handleSend(channel) {
    const form = $('#orderForm');

    if (cart.length === 0) {
      showAlert('Your order is empty. Please add at least one product first.', 'warning');
      return;
    }

    form.classList.add('was-validated');
    if (!form.checkValidity()) {
      const firstInvalid = $(':invalid', form);
      if (firstInvalid) {
        firstInvalid.focus();
      }
      showAlert('Please complete the highlighted fields.', 'warning');
      return;
    }

    const order = calculateOrder();
    const buyer = getBuyer();
    const ref = createOrderRef();
    const message = buildOrderMessage(ref, buyer, order);

    if (channel === 'whatsapp') {
      openLink('https://wa.me/' + CONFIG.whatsappNumber + '?text=' + encodeURIComponent(message));
      showAlert(
        'Order request ' + ref + ' is ready in WhatsApp. Press send there to deliver it to us.',
        'success'
      );
    } else if (channel === 'email') {
      window.location.href =
        'mailto:' + CONFIG.email +
        '?subject=' + encodeURIComponent('Order request ' + ref) +
        '&body=' + encodeURIComponent(message);
      showAlert(
        'Order request ' + ref + ' is ready in your email app. Press send there to deliver it to us.',
        'success'
      );
    } else {
      copyText(message).then(function () {
        showAlert('Order summary ' + ref + ' copied. You can paste it into any message to us.', 'success');
      }).catch(function () {
        showAlert('Could not copy automatically. Please use the WhatsApp or email button instead.', 'error');
      });
    }
  }

  /* ---------- Page setup ---------- */

  function closeMobileMenu() {
    const menu = $('#mainNav');
    const toggler = $('.navbar-toggler');
    if (menu && toggler && menu.classList.contains('show')) {
      toggler.click();
    }
  }

  function renderContactDetails() {
    $('#footerWhatsapp').textContent = CONFIG.whatsappDisplay;
    const email = $('#footerEmail');
    email.textContent = CONFIG.email;
    email.href = 'mailto:' + CONFIG.email;
    $('#year').textContent = new Date().getFullYear();
  }

  function init() {
    renderShippingControls();
    renderProducts();
    renderRatesTable();
    renderFaq();
    renderContactDetails();
    renderOrder();

    const grid = $('#productGrid');
    grid.addEventListener('click', handleGridClick);
    grid.addEventListener('change', function (event) {
      const card = event.target.closest('.product-card');
      if (card) {
        updateCard(card, true);
      }
    });
    grid.addEventListener('input', function (event) {
      const card = event.target.closest('.product-card');
      if (card && event.target.classList.contains('js-qty')) {
        updateCard(card, false);
      }
    });

    const cartBox = $('#cartItems');
    cartBox.addEventListener('click', handleCartClick);
    cartBox.addEventListener('change', handleCartChange);

    $('#shipRegion').addEventListener('change', renderOrder);
    $('#shipMethod').addEventListener('change', renderOrder);

    $('#sendWhatsapp').addEventListener('click', function () {
      handleSend('whatsapp');
    });
    $('#sendEmail').addEventListener('click', function () {
      handleSend('email');
    });
    $('#copySummary').addEventListener('click', function () {
      handleSend('copy');
    });

    $all('.site-nav .nav-link, .site-nav .btn').forEach(function (link) {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  init();
})();
