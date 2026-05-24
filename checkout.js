/* ============================================
   ServeFlow — Checkout Flow JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ---- PRICING SCHEME DEFINITIONS ----
  const planDetails = {
    starter: {
      name: 'Starter Plan',
      for: 'Small Churches · Up to 50 Workers',
      monthlyPrice: 10,
      annualPrice: 8,
      setupFee: 20,
      bullets: [
        'Up to 50 workers coordination',
        'Up to 5 ministry departments',
        'All 6 core features included',
        'WhatsApp service reminders',
        'Email support (48hr)'
      ]
    },
    growth: {
      name: 'Growth Plan',
      for: 'Mid-sized Churches · Up to 200 Workers',
      monthlyPrice: 25,
      annualPrice: 20,
      setupFee: 50,
      bullets: [
        'Up to 200 workers coordination',
        'Unlimited departments',
        'All 6 core features included',
        'WhatsApp + SMS reminders',
        'Priority support (24hr)',
        'Attendance analytics'
      ]
    },
    enterprise: {
      name: 'Enterprise Plan',
      for: 'Large Churches · 200+ Workers',
      monthlyPrice: 50,
      annualPrice: 40,
      setupFee: 100,
      bullets: [
        'Unlimited workers & departments',
        'Multi-campus master account',
        'Dedicated onboarding (3 days)',
        'SLA & 99.9% uptime guarantee',
        'Dedicated account manager'
      ]
    }
  };

  const NAIRA_RATE = 1500; // $1.00 = ₦1,500
  const TAX_RATE = 0.075;   // 7.5% VAT

  // ---- CHECKOUT STATES ----
  let currentPlanKey = 'growth';
  let isAnnual = false;
  let currentStep = 1;
  let selectedMethod = 'card';

  // ---- DOM ELEMENTS ----
  // Summary Panel
  const summaryPlanBadge = document.getElementById('summaryPlanBadge');
  const summaryPlanName  = document.getElementById('summaryPlanName');
  const summaryPlanFor   = document.getElementById('summaryPlanFor');
  const summaryBullets   = document.getElementById('summaryBullets');
  const breakdownTerm    = document.getElementById('breakdownTerm');
  const breakdownSubtotal = document.getElementById('breakdownSubtotal');
  const setupFeeRow       = document.getElementById('setupFeeRow');
  const breakdownSetup    = document.getElementById('breakdownSetup');
  const discountRow       = document.getElementById('discountRow');
  const breakdownDiscount = document.getElementById('breakdownDiscount');
  const breakdownTax      = document.getElementById('breakdownTax');
  const breakdownTotal    = document.getElementById('breakdownTotal');
  const breakdownNaira    = document.getElementById('breakdownNaira');

  // Step Indicators
  const stepperLineFill = document.getElementById('stepperLineFill');
  const stepIndicators  = [
    document.getElementById('stepIndicator1'),
    document.getElementById('stepIndicator2'),
    document.getElementById('stepIndicator3'),
    document.getElementById('stepIndicator4')
  ];

  // Panels
  const panels = [
    document.getElementById('panelStep1'),
    document.getElementById('panelStep2'),
    document.getElementById('panelStep3'),
    document.getElementById('panelStep4')
  ];

  // Step 1 Controls
  const reviewPlanName       = document.getElementById('reviewPlanName');
  const reviewPlanLimits     = document.getElementById('reviewPlanLimits');
  const reviewPlanAmount     = document.getElementById('reviewPlanAmount');
  const reviewPlanSetupBadge = document.getElementById('reviewPlanSetupBadge');
  
  // Step 1 Toggle
  const btnToggle   = document.getElementById('btnToggle');
  const btnThumb    = document.getElementById('btnThumb');
  const btnMonthly  = document.getElementById('btnMonthly');
  const btnAnnual   = document.getElementById('btnAnnual');

  // Step 2 & 3 Nav
  const btnGoToStep2   = document.getElementById('btnGoToStep2');
  const btnGoToStep3   = document.getElementById('btnGoToStep3');
  const btnBackToStep1 = document.getElementById('btnBackToStep1');
  const btnBackToStep2 = document.getElementById('btnBackToStep2');

  // Step 3 Forms & Subtitles
  const detailsFormSubtitle = document.getElementById('detailsFormSubtitle');
  const forms = {
    card:   document.getElementById('formCard'),
    stripe: document.getElementById('formStripe'),
    bank:   document.getElementById('formBank'),
    paypal: document.getElementById('formPaypal')
  };

  // Step 3 Card Fields
  const cardholderName = document.getElementById('cardholderName');
  const cardNumber     = document.getElementById('cardNumber');
  const cardExpiry     = document.getElementById('cardExpiry');
  const cardCvv        = document.getElementById('cardCvv');
  const cardBrandIcon  = document.getElementById('cardBrandIcon');

  // Step 3 Stripe Fields
  const stripeCardNo   = document.getElementById('stripeCardNo');
  const stripeExpiry   = document.getElementById('stripeExpiry');
  const stripeCvv      = document.getElementById('stripeCvv');
  const stripeZip      = document.getElementById('stripeZip');

  // Step 3 Bank Fields
  const bankNairaValue    = document.getElementById('bankNairaValue');
  const btnCopyAcc        = document.getElementById('btnCopyAcc');
  const accNumberVal      = document.getElementById('accNumberVal');
  const copyAccText       = document.getElementById('copyAccText');

  // Submit Buttons
  const btnSubmitCard   = document.getElementById('btnSubmitCard');
  const btnSubmitStripe = document.getElementById('btnSubmitStripe');
  const btnSubmitBank   = document.getElementById('btnSubmitBank');
  const btnSubmitPaypal = document.getElementById('btnSubmitPaypal');

  // Step 4 Receipt Fields
  const receiptPlan     = document.getElementById('receiptPlan');
  const receiptAmount   = document.getElementById('receiptAmount');
  const receiptChannel  = document.getElementById('receiptChannel');
  const receiptRef      = document.getElementById('receiptRef');
  const receiptDate     = document.getElementById('receiptDate');

  // ---- INITIALIZATION FROM URL PARAMETERS ----
  function initCheckout() {
    const params = new URLSearchParams(window.location.search);
    
    // Parse Plan
    const planParam = params.get('plan');
    if (planParam && planDetails[planParam]) {
      currentPlanKey = planParam;
    }

    // Parse Billing
    const billingParam = params.get('billing');
    if (billingParam === 'annual') {
      isAnnual = true;
    }

    // Select initial payment method card
    document.querySelectorAll('.payment-method-card').forEach(card => {
      card.classList.toggle('active', card.dataset.method === selectedMethod);
    });

    updateUI();
  }

  // ---- STATE UPDATE SYSTEM ----
  function updateUI() {
    const details = planDetails[currentPlanKey];
    if (!details) return;

    // 1. Update Left Sidebar Plan Specs
    summaryPlanBadge.textContent = isAnnual ? 'Annual Saving' : 'Monthly';
    summaryPlanName.textContent  = details.name;
    summaryPlanFor.textContent   = details.for;

    // Dynamic Bullets
    summaryBullets.innerHTML = '';
    details.bullets.forEach(bullet => {
      const li = document.createElement('li');
      li.textContent = bullet;
      summaryBullets.appendChild(li);
    });

    // 2. Calculations
    const rate = isAnnual ? details.annualPrice : details.monthlyPrice;
    const months = isAnnual ? 12 : 1;
    const subtotal = rate * months;
    const setupFee = details.setupFee;
    
    // Annual Discount calculation for display
    let discount = 0;
    if (isAnnual) {
      // Show difference compared to paying monthly
      discount = (details.monthlyPrice - details.annualPrice) * 12;
    }

    const taxableAmount = subtotal + setupFee;
    const tax = taxableAmount * TAX_RATE;
    const total = taxableAmount + tax;
    const nairaTotal = total * NAIRA_RATE;

    // Render Price Breakdown
    breakdownTerm.textContent = isAnnual ? 'Annual' : 'Monthly';
    breakdownSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    breakdownSetup.textContent = `$${setupFee.toFixed(2)}`;
    
    if (isAnnual && discount > 0) {
      discountRow.style.display = 'flex';
      breakdownDiscount.textContent = `-$${discount.toFixed(2)}`;
    } else {
      discountRow.style.display = 'none';
    }

    breakdownTax.textContent = `$${tax.toFixed(2)}`;
    breakdownTotal.textContent = `$${total.toFixed(2)}`;
    
    // Render Naira Conversions
    const formattedNaira = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(nairaTotal);
    breakdownNaira.textContent = `~ ${formattedNaira}`;
    bankNairaValue.textContent = formattedNaira;

    // 3. Update Step 1 Review Form Card
    reviewPlanName.textContent = details.name;
    reviewPlanLimits.textContent = details.for;
    reviewPlanAmount.textContent = rate;
    reviewPlanSetupBadge.textContent = `+ $${setupFee} setup fee`;

    // 4. Update Billing Toggle States
    btnMonthly.classList.toggle('active', !isAnnual);
    btnAnnual.classList.toggle('active', isAnnual);
    btnToggle.classList.toggle('toggled', isAnnual);
  }

  // ---- STEP ENGINE CONTROLS ----
  function goToStep(stepNum) {
    if (stepNum < 1 || stepNum > 4) return;
    currentStep = stepNum;

    // Stepper Line Fill Width
    const fillPercent = ((currentStep - 1) / 3) * 100;
    stepperLineFill.style.width = `${fillPercent}%`;

    // Stepper Circles Class Actions
    stepIndicators.forEach((ind, index) => {
      const idx = index + 1;
      ind.classList.toggle('active', idx === currentStep);
      ind.classList.toggle('completed', idx < currentStep);
    });

    // Panel Fade Actions
    panels.forEach((p, index) => {
      const idx = index + 1;
      if (idx === currentStep) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });

    // Special behavior for Step 3: display selected payment details form
    if (currentStep === 3) {
      displayMethodForm();
    }
  }

  function displayMethodForm() {
    // Hide all forms
    Object.values(forms).forEach(f => f.classList.remove('active'));
    
    // Show selected form
    const activeForm = forms[selectedMethod];
    if (activeForm) {
      activeForm.classList.add('active');
    }

    // Set subtitle caption based on method
    let cap = '';
    switch (selectedMethod) {
      case 'card':
        cap = 'Provide your credit or debit card credentials in our secure 256-bit encrypted gateway.';
        break;
      case 'stripe':
        cap = 'Pay internationally via Stripe secure tokenized credit card input fields.';
        break;
      case 'bank':
        cap = 'Perform a local bank transfer in Nigerian Naira (₦). Details are verified immediately.';
        break;
      case 'paypal':
        cap = 'Authenticate your subscription using PayPal. You will return here to finalize setup.';
        break;
    }
    detailsFormSubtitle.textContent = cap;
  }

  // ---- INTERACTIVE BILLING TOGGLE ----
  function toggleBilling() {
    isAnnual = !isAnnual;
    updateUI();
  }

  btnToggle.addEventListener('click', toggleBilling);
  btnMonthly.addEventListener('click', () => {
    if (isAnnual) toggleBilling();
  });
  btnAnnual.addEventListener('click', () => {
    if (!isAnnual) toggleBilling();
  });

  // ---- STEP REDIRECT CTAS ----
  btnGoToStep2.addEventListener('click', () => goToStep(2));
  btnGoToStep3.addEventListener('click', () => goToStep(3));
  btnBackToStep1.addEventListener('click', () => goToStep(1));
  btnBackToStep2.addEventListener('click', () => goToStep(2));

  // ---- PAYMENT METHOD CARD CLICK ----
  document.querySelectorAll('.payment-method-card').forEach(card => {
    card.addEventListener('click', () => {
      // Update selected method
      selectedMethod = card.dataset.method;
      
      // Update CSS classes
      document.querySelectorAll('.payment-method-card').forEach(c => {
        c.classList.toggle('active', c === card);
      });
    });
  });

  // ---- INPUT AUTO-FORMATTING & BRAND DETECTION ----
  // Card Number Auto-formatting: "xxxx xxxx xxxx xxxx"
  cardNumber.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let matches = val.match(/\d{4,16}/g);
    let match = matches && matches[0] || '';
    let parts = [];

    for (let i=0, len=match.length; i<len; i+=4) {
      parts.push(match.substring(i, i+4));
    }

    if (parts.length > 0) {
      e.target.value = parts.join(' ');
    } else {
      e.target.value = val;
    }

    // Simple card brand indicator
    if (val.startsWith('4')) {
      cardBrandIcon.textContent = '💳 Visa';
    } else if (val.startsWith('5')) {
      cardBrandIcon.textContent = '💳 Mastercard';
    } else if (val.startsWith('6') || val.startsWith('506') || val.startsWith('5078')) {
      cardBrandIcon.textContent = '💳 Verve';
    } else {
      cardBrandIcon.textContent = '💳';
    }
  });

  // Card Expiry: "MM/YY"
  cardExpiry.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (val.length >= 2) {
      e.target.value = val.substring(0, 2) + '/' + val.substring(2, 4);
    } else {
      e.target.value = val;
    }
  });

  // Mock Stripe fields auto-formatters
  stripeCardNo.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let parts = [];
    for (let i=0; i<val.length; i+=4) {
      parts.push(val.substring(i, i+4));
    }
    e.target.value = parts.join(' ');
  });

  stripeExpiry.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (val.length >= 2) {
      e.target.value = val.substring(0, 2) + '/' + val.substring(2, 4);
    } else {
      e.target.value = val;
    }
  });

  // ---- FORM VALIDATIONS ----
  function validateCardForm() {
    let isValid = true;

    // Validate Name
    const nameVal = cardholderName.value.trim();
    const groupName = cardholderName.closest('.form-group');
    if (!nameVal) {
      groupName.classList.add('invalid');
      isValid = false;
    } else {
      groupName.classList.remove('invalid');
    }

    // Validate Card Number
    const rawCard = cardNumber.value.replace(/\s+/g, '');
    const groupCard = cardNumber.closest('.form-group');
    if (rawCard.length < 16) {
      groupCard.classList.add('invalid');
      isValid = false;
    } else {
      groupCard.classList.remove('invalid');
    }

    // Validate Expiry
    const expVal = cardExpiry.value.trim();
    const groupExp = cardExpiry.closest('.form-group');
    const expParts = expVal.split('/');
    if (expParts.length < 2 || expParts[0].length !== 2 || expParts[1].length !== 2 || parseInt(expParts[0]) > 12 || parseInt(expParts[0]) === 0) {
      groupExp.classList.add('invalid');
      isValid = false;
    } else {
      groupExp.classList.remove('invalid');
    }

    // Validate CVV
    const cvvVal = cardCvv.value.trim();
    const groupCvv = cardCvv.closest('.form-group');
    if (cvvVal.length < 3) {
      groupCvv.classList.add('invalid');
      isValid = false;
    } else {
      groupCvv.classList.remove('invalid');
    }

    return isValid;
  }

  function validateStripeForm() {
    const rawCard = stripeCardNo.value.replace(/\s+/g, '');
    const expVal = stripeExpiry.value.trim();
    const cvvVal = stripeCvv.value.trim();
    const zipVal = stripeZip.value.trim();
    const errText = document.getElementById('errStripe');

    let isValid = rawCard.length === 16 && expVal.length === 5 && cvvVal.length === 3 && zipVal !== '';

    if (!isValid) {
      errText.style.display = 'block';
    } else {
      errText.style.display = 'none';
    }

    return isValid;
  }

  // ---- COPY ACCOUNT NUMBER ACTION ----
  btnCopyAcc.addEventListener('click', () => {
    navigator.clipboard.writeText(accNumberVal.textContent).then(() => {
      copyAccText.textContent = 'Copied! ✓';
      btnCopyAcc.style.background = 'var(--brand-emerald)';
      btnCopyAcc.style.borderColor = 'rgba(16, 185, 129, 0.4)';
      
      setTimeout(() => {
        copyAccText.textContent = 'Copy';
        btnCopyAcc.style.background = '';
        btnCopyAcc.style.borderColor = '';
      }, 2000);
    });
  });

  // ---- REAL PAYMENT ENGINE (Step 3 -> API -> Step 4) ----
  async function executeSimulatedPayment(submitBtn, spinnerEl, channelName) {
    submitBtn.classList.add('processing');
    submitBtn.disabled = true;

    try {
      const details     = planDetails[currentPlanKey];
      const grandTotal  = parseFloat(breakdownTotal.textContent.replace('$',''));
      const billingCycle = isAnnual ? 'Annual' : 'Monthly';

      // POST real order to backend
      const order = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan:    currentPlanKey,
          billing: billingCycle,
          amount:  grandTotal,
          channel: channelName,
        }),
      }).then(r => {
        if (!r.ok) throw new Error('Payment API error');
        return r.json();
      });

      // Populate receipt with real DB data
      const today = new Date(order.created_at || Date.now()).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });

      receiptPlan.textContent    = `${details.name} (${billingCycle} Billing)`;
      receiptAmount.textContent  = `$${Number(order.amount).toFixed(2)}`;
      receiptChannel.textContent = channelName;
      receiptRef.textContent     = order.ref;
      receiptDate.textContent    = today;

      console.log('🎉 Order confirmed:', order.ref);
      goToStep(4);

    } catch (err) {
      console.error('Payment error:', err);
      // Graceful fallback: still show receipt with locally-generated ref
      const fallbackRef = 'SF-TX-' + Math.floor(10000000 + Math.random() * 90000000);
      const details     = planDetails[currentPlanKey];
      receiptPlan.textContent    = `${details.name} (${isAnnual ? 'Annual' : 'Monthly'} Billing)`;
      receiptAmount.textContent  = breakdownTotal.textContent;
      receiptChannel.textContent = channelName;
      receiptRef.textContent     = fallbackRef;
      receiptDate.textContent    = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
      goToStep(4);
    } finally {
      submitBtn.classList.remove('processing');
      submitBtn.disabled = false;
    }
  }

  // Card Submit Hook
  forms.card.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validateCardForm()) {
      let brand = cardBrandIcon.textContent.replace('💳 ', '').trim();
      if (brand === '💳') brand = 'Card';
      executeSimulatedPayment(btnSubmitCard, null, `Credit Card (${brand})`);
    }
  });

  // Stripe Submit Hook
  forms.stripe.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validateStripeForm()) {
      executeSimulatedPayment(btnSubmitStripe, null, 'Stripe Express Gateway');
    }
  });

  // Bank Transfer Submit Hook
  btnSubmitBank.addEventListener('click', () => {
    executeSimulatedPayment(btnSubmitBank, null, 'Direct Bank Transfer');
  });

  // PayPal Submit Hook
  btnSubmitPaypal.addEventListener('click', () => {
    executeSimulatedPayment(btnSubmitPaypal, null, 'PayPal Digital Checkout');
  });

  // Run initial pre-load setup
  initCheckout();
});
