
// ===================== STATE =====================
let agreements = JSON.parse(localStorage.getItem('zamsign_agreements') || '[]');
let currentAgreement = {};
let currentStep = 1;
let sellerSigData = null;
let buyerSigData = null;
let witnessSigData = null;
let activeCanvas = null;
let isDrawing = false;
let lastX = 0, lastY = 0;
let viewingIndex = -1;

// ===================== TELEGRAM INIT =====================
if (window.Telegram && window.Telegram.WebApp) {
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();
}

// ===================== SCREEN NAV =====================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === 'screen-dashboard') refreshDashboard();
}

function showTab(tab) {
  showScreen('screen-dashboard');
  refreshDashboard(tab);
}

// ===================== TOAST =====================
function showToast(msg, duration = 2500) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.display = 'block';
  setTimeout(() => t.style.display = 'none', duration);
}

// ===================== DASHBOARD =====================
function refreshDashboard(filter = 'all') {
  const inbox = agreements.filter(a => a.role === 'buyer');
  const outbox = agreements.filter(a => a.role === 'seller');
  const progress = agreements.filter(a => a.status === 'in_progress');
  const completed = agreements.filter(a => a.status === 'completed');

  document.getElementById('inbox-count').textContent = inbox.length + ' agreements';
  document.getElementById('outbox-count').textContent = outbox.length + ' agreements';
  document.getElementById('progress-count').textContent = progress.length + ' agreements';
  document.getElementById('completed-count').textContent = completed.length + ' agreements';

  let list = agreements;
  if (filter === 'inbox') list = inbox;
  else if (filter === 'outbox') list = outbox;
  else if (filter === 'progress') list = progress;
  else if (filter === 'completed') list = completed;

  const container = document.getElementById('dashboard-list');
  if (list.length === 0) {
    container.innerHTML = `<div class="card" style="text-align:center; color:#9ca3af; padding:30px;">
      <div style="font-size:40px;">📋</div>
      <div>No agreements yet.<br>Tap "+ New" to create one.</div>
    </div>`;
    return;
  }

  container.innerHTML = list.map((a, i) => {
    const idx = agreements.indexOf(a);
    const statusBadge = a.status === 'completed'
      ? '<span class="badge badge-signed">✅ Completed</span>'
      : a.status === 'in_progress'
        ? '<span class="badge badge-progress">🔄 In Progress</span>'
        : '<span class="badge badge-pending">⏳ Pending</span>';
    return `<div class="card" onclick="viewAgreement(${idx})" style="cursor:pointer;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div style="font-weight:700; color:#111; font-size:15px; flex:1;">${a.title}</div>
        ${statusBadge}
      </div>
      <div style="font-size:12px; color:#6b7280; margin-top:4px;">
        ZMW ${Number(a.amount).toLocaleString()} · ${a.date}
      </div>
      <div style="font-size:12px; color:#9ca3af; margin-top:2px;">Ref: ${a.refId}</div>
    </div>`;
  }).join('');
}

// ===================== STEP NAVIGATION =====================
function nextStep(step) {
  if (step === 1) {
    const title = document.getElementById('ag-title').value.trim();
    const amount = document.getElementById('ag-amount').value.trim();
    const desc = document.getElementById('ag-desc').value.trim();
    if (!title || !amount || !desc) { showToast('⚠️ Please fill all required fields.'); return; }
  }
  if (step === 2) {
    const name = document.getElementById('seller-name').value.trim();
    const nrc = document.getElementById('seller-nrc').value.trim();
    const addr = document.getElementById('seller-address').value.trim();
    if (!name || !nrc || !addr) { showToast('⚠️ Please fill all seller details.'); return; }
  }
  if (step === 3) {
    const name = document.getElementById('buyer-name').value.trim();
    const nrc = document.getElementById('buyer-nrc').value.trim();
    const addr = document.getElementById('buyer-address').value.trim();
    if (!name || !nrc || !addr) { showToast('⚠️ Please fill all buyer details.'); return; }
    // Show witness sig card if witness provided
    if (document.getElementById('witness-name').value.trim()) {
      document.getElementById('witness-sig-card').classList.remove('hidden');
    }
  }

  document.getElementById(`create-step-${step}`).classList.add('hidden');
  document.getElementById(`create-step-${step + 1}`).classList.remove('hidden');
  currentStep = step + 1;
  document.getElementById('create-step-num').textContent = currentStep;
  document.getElementById('create-progress').style.width = (currentStep * 20) + '%';

  if (currentStep === 4) initCanvas('signatureCanvas', 'seller');
  if (currentStep === 5) {
    initCanvas('buyerSignatureCanvas', 'buyer');
    if (document.getElementById('witness-name').value.trim()) {
      initCanvas('witnessSignatureCanvas', 'witness');
    }
  }
  window.scrollTo(0, 0);
}

function prevStep(step) {
  document.getElementById(`create-step-${step}`).classList.add('hidden');
  document.getElementById(`create-step-${step - 1}`).classList.remove('hidden');
  currentStep = step - 1;
  document.getElementById('create-step-num').textContent = currentStep;
  document.getElementById('create-progress').style.width = (currentStep * 20) + '%';
  window.scrollTo(0, 0);
}

// ===================== CANVAS / SIGNATURE =====================
function initCanvas(canvasId, role) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  canvas.width = canvas.offsetWidth;
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = '#1A4F9C';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  }

  canvas.onmousedown = canvas.ontouchstart = (e) => {
    e.preventDefault();
    isDrawing = true;
    const pos = getPos(e);
    lastX = pos.x; lastY = pos.y;
    activeCanvas = canvasId;
  };
  canvas.onmousemove = canvas.ontouchmove = (e) => {
    e.preventDefault();
    if (!isDrawing || activeCanvas !== canvasId) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastX = pos.x; lastY = pos.y;
  };
  canvas.onmouseup = canvas.ontouchend = () => { isDrawing = false; };
}

function clearSignature(role) {
  const ids = { seller: 'signatureCanvas', buyer: 'buyerSignatureCanvas', witness: 'witnessSignatureCanvas' };
  const canvas = document.getElementById(ids[role]);
  if (!canvas) return;
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  if (role === 'seller') {
    sellerSigData = null;
    document.getElementById('seller-sig-preview').classList.add('hidden');
    document.getElementById('seller-sig-next-btn').disabled = true;
    document.getElementById('seller-sig-next-btn').style.opacity = '0.5';
  } else if (role === 'buyer') {
    buyerSigData = null;
    document.getElementById('buyer-sig-preview').classList.add('hidden');
    checkFinalizeBtn();
  } else {
    witnessSigData = null;
    document.getElementById('witness-sig-preview').classList.add('hidden');
  }
}

function saveSignature(role) {
  const ids = { seller: 'signatureCanvas', buyer: 'buyerSignatureCanvas', witness: 'witnessSignatureCanvas' };
  const canvas = document.getElementById(ids[role]);
  if (!canvas) return;
  const data = canvas.toDataURL('image/png');
  if (role === 'seller') {
    sellerSigData = data;
    document.getElementById('seller-sig-img').src = data;
    document.getElementById('seller-sig-preview').classList.remove('hidden');
    document.getElementById('seller-sig-next-btn').disabled = false;
    document.getElementById('seller-sig-next-btn').style.opacity = '1';
    showToast('✅ Seller signature saved!');
  } else if (role === 'buyer') {
    buyerSigData = data;
    document.getElementById('buyer-sig-img').src = data;
    document.getElementById('buyer-sig-preview').classList.remove('hidden');
    checkFinalizeBtn();
    showToast('✅ Buyer signature saved!');
  } else {
    witnessSigData = data;
    document.getElementById('witness-sig-img').src = data;
    document.getElementById('witness-sig-preview').classList.remove('hidden');
    showToast('✅ Witness signature saved!');
  }
}

function checkFinalizeBtn() {
  const btn = document.getElementById('finalize-btn');
  const witnessNeeded = !document.getElementById('witness-sig-card').classList.contains('hidden');
  const ok = buyerSigData && (!witnessNeeded || witnessSigData);
  btn.disabled = !ok;
  btn.style.opacity = ok ? '1' : '0.5';
}

// ===================== FINALIZE =====================
function finalizeAgreement() {
  const now = new Date();
  const dateStr = now.toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'medium' });
  const refId = 'ZS-' + now.getTime().toString().slice(-10);

  const agreement = {
    refId,
    title: document.getElementById('ag-title').value.trim(),
    amount: document.getElementById('ag-amount').value.trim(),
    description: document.getElementById('ag-desc').value.trim(),
    date: dateStr,
    seller: {
      name: document.getElementById('seller-name').value.trim(),
      nrc: document.getElementById('seller-nrc').value.trim(),
      address: document.getElementById('seller-address').value.trim(),
      username: document.getElementById('seller-username').value.trim(),
    },
    buyer: {
      name: document.getElementById('buyer-name').value.trim(),
      nrc: document.getElementById('buyer-nrc').value.trim(),
      address: document.getElementById('buyer-address').value.trim(),
      username: document.getElementById('buyer-username').value.trim(),
    },
    witness: {
      name: document.getElementById('witness-name').value.trim(),
      nrc: document.getElementById('witness-nrc').value.trim(),
      address: document.getElementById('witness-address').value.trim(),
    },
    sellerSig: sellerSigData,
    buyerSig: buyerSigData,
    witnessSig: witnessSigData,
    status: 'completed',
    role: 'seller',
  };

  agreements.push(agreement);
  localStorage.setItem('zamsign_agreements', JSON.stringify(agreements));

  // Reset
  sellerSigData = null; buyerSigData = null; witnessSigData = null;
  currentStep = 1;
  document.querySelectorAll('#screen-create input, #screen-create textarea').forEach(el => el.value = '');

  showToast('🎉 Agreement finalized!', 3000);
  viewAgreement(agreements.length - 1);
}

// ===================== VIEW AGREEMENT =====================
function viewAgreement(index) {
  viewingIndex = index;
  const a = agreements[index];

  document.getElementById('view-title').textContent = a.title;
  document.getElementById('view-ref').textContent = 'Reference: ' + a.refId;
  document.getElementById('view-status').innerHTML =
    a.status === 'completed'
      ? '<span class="badge badge-signed">✅ Completed</span>'
      : '<span class="badge badge-progress">🔄 In Progress</span>';

  const hasWitness = a.witness && a.witness.name;
  const docText = buildDocumentText(a);
  document.getElementById('view-doc').textContent = docText;

  document.getElementById('view-seller-sig').src = a.sellerSig || '';
  document.getElementById('view-buyer-sig').src = a.buyerSig || '';
  if (hasWitness && a.witnessSig) {
    document.getElementById('view-witness-sig-wrap').classList.remove('hidden');
    document.getElementById('view-witness-sig').src = a.witnessSig;
  } else {
    document.getElementById('view-witness-sig-wrap').classList.add('hidden');
  }

  // QR Code
  const qrContainer = document.getElementById('view-qr');
  qrContainer.innerHTML = '';
  const verifyText = `This certifies that a transaction titled "${a.title}" between ${a.seller.name} and ${a.buyer.name} was completed on ${a.date} using the ZamSign Digital Agreement Platform. Reference: ${a.refId}`;
  document.getElementById('view-qr-text').textContent = verifyText;
  new QRCode(qrContainer, {
    text: verifyText,
    width: 160, height: 160,
    colorDark: '#1A4F9C',
    colorLight: '#ffffff',
  });

  showScreen('screen-view');
}

function buildDocumentText(a) {
  const hasWitness = a.witness && a.witness.name;
  return `SALE AND PURCHASE AGREEMENT
═══════════════════════════════════════

THIS AGREEMENT

This is an Agreement of Sale made on this ${a.date}, between the following parties:

─────────────────────────────────────
1. PARTIES
─────────────────────────────────────

SELLER
Full Name:          ${a.seller.name}
NRC Number:         ${a.seller.nrc}
Residential Address:${a.seller.address}

BUYER
Full Name:          ${a.buyer.name}
NRC Number:         ${a.buyer.nrc}
Residential Address:${a.buyer.address}
${hasWitness ? `
WITNESS
Full Name:          ${a.witness.name}
NRC Number:         ${a.witness.nrc}
Residential Address:${a.witness.address}` : ''}

─────────────────────────────────────
2. AGREEMENT TITLE
─────────────────────────────────────
${a.title}

─────────────────────────────────────
3. DESCRIPTION OF ITEM / CONDITIONS
─────────────────────────────────────
The Seller agrees to sell, and the Buyer agrees to purchase the item(s) under the terms below:

${a.description}

─────────────────────────────────────
4. PURCHASE PRICE
─────────────────────────────────────
Amount: ZMW ${Number(a.amount).toLocaleString()}

─────────────────────────────────────
5. TERMS AND CONDITIONS
─────────────────────────────────────
1. Seller confirms rightful ownership.
2. Buyer accepts item condition.
3. Transaction final upon payment.
4. Additional conditions as stated above.

─────────────────────────────────────
6. BILL OF SALE CONFIRMATION
─────────────────────────────────────
The parties signed a Bill of Sale for the item(s) being bought and sold.

─────────────────────────────────────
7. DECLARATION
─────────────────────────────────────
Both parties confirm agreement and accuracy of information provided in this document.

─────────────────────────────────────
8. SIGNATURES
─────────────────────────────────────
Seller Signature:  [See attached digital signature]
Buyer Signature:   [See attached digital signature]
${hasWitness ? 'Witness Signature: [See attached digital signature]' : ''}

─────────────────────────────────────
9. VERIFICATION
─────────────────────────────────────
This document was generated via ZamSign.
Scan the QR code to verify authenticity.

Agreement Reference: ${a.refId}
Generated: ${a.date}
Platform: ZamSign Digital Agreement Platform
═══════════════════════════════════════`;
}

// ===================== PDF DOWNLOAD =====================
async function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const a = agreements[viewingIndex];
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 20;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  let y = margin;

  // Header
  doc.setFillColor(26, 79, 156);
  doc.rect(0, 0, pageW, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('ZAMSIGN', margin, 14);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Digital Agreement Platform · Sign. Agree. Trust.', margin, 21);
  doc.text('Ref: ' + a.refId, pageW - margin, 21, { align: 'right' });

  y = 40;
  doc.setTextColor(0, 0, 0);

  // Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SALE AND PURCHASE AGREEMENT', pageW / 2, y, { align: 'center' });
  y += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('This is an Agreement of Sale made on ' + a.date, pageW / 2, y, { align: 'center' });
  y += 10;

  doc.setTextColor(0, 0, 0);

  function section(title) {
    doc.setFillColor(26, 79, 156);
    doc.rect(margin, y, pageW - margin * 2, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 3, y + 4.2);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    y += 9;
  }

  function row(label, value) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(label + ':', margin + 2, y);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(value || 'N/A', pageW - margin * 2 - 45);
    doc.text(lines, margin + 45, y);
    y += lines.length * 5 + 1;
  }

  function checkPage() {
    if (y > pageH - 40) { doc.addPage(); y = 20; }
  }

  // Parties
  section('1. PARTIES');
  doc.setFontSize(10); doc.setFont('helvetica', 'bold');
  doc.text('SELLER', margin + 2, y); y += 5;
  doc.setFont('helvetica', 'normal');
  row('Full Name', a.seller.name);
  row('NRC Number', a.seller.nrc);
  row('Address', a.seller.address);
  y += 3;
  doc.setFontSize(10); doc.setFont('helvetica', 'bold');
  doc.text('BUYER', margin + 2, y); y += 5;
  doc.setFont('helvetica', 'normal');
  row('Full Name', a.buyer.name);
  row('NRC Number', a.buyer.nrc);
  row('Address', a.buyer.address);

  if (a.witness && a.witness.name) {
    y += 3;
    doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text('WITNESS', margin + 2, y); y += 5;
    doc.setFont('helvetica', 'normal');
    row('Full Name', a.witness.name);
    row('NRC Number', a.witness.nrc);
    row('Address', a.witness.address);
  }

  y += 4; checkPage();
  section('2. AGREEMENT TITLE');
  doc.setFontSize(10); doc.setFont('helvetica', 'bold');
  doc.text(a.title, margin + 2, y); y += 8;

  checkPage();
  section('3. DESCRIPTION OF ITEM / CONDITIONS');
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  const descLines = doc.splitTextToSize('The Seller agrees to sell, and the Buyer agrees to purchase the item(s) under the terms below:\n\n' + a.description, pageW - margin * 2 - 4);
  doc.text(descLines, margin + 2, y);
  y += descLines.length * 5 + 4;

  checkPage();
  section('4. PURCHASE PRICE');
  doc.setFontSize(11); doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 79, 156);
  doc.text('Amount: ZMW ' + Number(a.amount).toLocaleString(), margin + 2, y);
  doc.setTextColor(0, 0, 0); y += 8;

  checkPage();
  section('5. TERMS AND CONDITIONS');
  ['1. Seller confirms rightful ownership.', '2. Buyer accepts item condition.', '3. Transaction final upon payment.', '4. Additional conditions as stated above.'].forEach(t => {
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(t, margin + 2, y); y += 5;
  });
  y += 3;

  checkPage();
  section('6. BILL OF SALE CONFIRMATION');
  doc.setFontSize(9);
  doc.text('The parties signed a Bill of Sale for the item(s) being bought and sold.', margin + 2, y);
  y += 8;

  section('7. DECLARATION');
  doc.setFontSize(9);
  doc.text('Both parties confirm agreement and accuracy of information provided in this document.', margin + 2, y);
  y += 10;

  checkPage();
  section('8. SIGNATURES');
  const sigY = y;
  if (a.sellerSig) {
    doc.setFontSize(8); doc.text('Seller Signature:', margin + 2, y);
    doc.addImage(a.sellerSig, 'PNG', margin + 2, y + 2, 55, 20);
  }
  if (a.buyerSig) {
    doc.setFontSize(8); doc.text('Buyer Signature:', margin + 70, sigY);
    doc.addImage(a.buyerSig, 'PNG', margin + 70, sigY + 2, 55, 20);
  }
  y = sigY + 28;
  if (a.witness && a.witness.name && a.witnessSig) {
    doc.setFontSize(8); doc.text('Witness Signature:', margin + 2, y);
    doc.addImage(a.witnessSig, 'PNG', margin + 2, y + 2, 55, 20);
    y += 28;
  }

  checkPage();
  section('9. VERIFICATION – QR CODE');
  doc.setFontSize(8);
  doc.text('This document was generated via ZamSign. Scan QR code to verify authenticity.', margin + 2, y);
  y += 5;

  // QR code via canvas
  const qrCanvas = document.querySelector('#view-qr canvas');
  if (qrCanvas) {
    const qrData = qrCanvas.toDataURL('image/png');
    doc.addImage(qrData, 'PNG', margin + 2, y, 40, 40);
    doc.setFontSize(7); doc.setTextColor(100);
    const qrText = doc.splitTextToSize(`Reference: ${a.refId} | Date: ${a.date}`, pageW - margin * 2 - 50);
    doc.text(qrText, margin + 46, y + 5);
    y += 45;
  }

  // Footer
  doc.setFillColor(242, 244, 247);
  doc.rect(0, pageH - 15, pageW, 15, 'F');
  doc.setTextColor(100);
  doc.setFontSize(8);
  doc.text('ZamSign · Digital Agreements Made Simple · Africa\'s Digital Agreement Platform', pageW / 2, pageH - 7, { align: 'center' });

  doc.save(`ZamSign_Agreement_${a.refId}.pdf`);
  showToast('📄 PDF downloaded!');
}

// ===================== SHARE =====================
function shareAgreement() {
  const a = agreements[viewingIndex];
  const text = `📋 *ZamSign Agreement*\n\n*${a.title}*\nAmount: ZMW ${Number(a.amount).toLocaleString()}\nBetween: ${a.seller.name} & ${a.buyer.name}\nDate: ${a.date}\nRef: ${a.refId}\n\n_Verified via ZamSign Digital Agreement Platform_`;
  if (window.Telegram && window.Telegram.WebApp) {
    Telegram.WebApp.switchInlineQuery(text);
  } else {
    navigator.clipboard.writeText(text).then(() => showToast('📋 Copied to clipboard!'));
  }
}

function closeGuide() {
  document.getElementById('modal-guide').classList.add('hidden');
}

// Show guide on first load
if (!localStorage.getItem('zamsign_guided')) {
  setTimeout(() => {
    document.getElementById('modal-guide').classList.remove('hidden');
    localStorage.setItem('zamsign_guided', '1');
  }, 800);
}

// Init dashboard
refreshDashboard();