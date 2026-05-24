// ServeFlow — Dashboard App Logic
// ============================================

'use strict';

// ---- MOCK DATA ----
const WORKERS = [
  { id:1,  name:'Adaeze Okonkwo',   dept:'Ushers',           role:'Team Lead',  phone:'08012345001', status:'active',   att:94 },
  { id:2,  name:'Tunde Balogun',    dept:'Media Team',       role:'Director',   phone:'08012345002', status:'active',   att:88 },
  { id:3,  name:'Grace Emeka',      dept:'Choir',            role:'Member',     phone:'08012345003', status:'active',   att:72 },
  { id:4,  name:'Samuel Dike',      dept:'Protocol',         role:'Team Lead',  phone:'08012345004', status:'active',   att:97 },
  { id:5,  name:'Ngozi Eze',        dept:'Prayer Unit',      role:'Member',     phone:'08012345005', status:'active',   att:85 },
  { id:6,  name:'Emeka Obi',        dept:'Security',         role:'Coordinator',phone:'08012345006', status:'active',   att:91 },
  { id:7,  name:'Chisom Nwosu',     dept:'Children\'s Church',role:'Teacher',   phone:'08012345007', status:'active',   att:78 },
  { id:8,  name:'David Afolabi',    dept:'Technical Team',   role:'Sound Engineer',phone:'08012345008',status:'active', att:95 },
  { id:9,  name:'Ruth Adeleke',     dept:'Ushers',           role:'Member',     phone:'08012345009', status:'inactive', att:42 },
  { id:10, name:'Joseph Taiwo',     dept:'Choir',            role:'Tenor',      phone:'08012345010', status:'active',   att:80 },
  { id:11, name:'Peace Okoro',      dept:'Media Team',       role:'Graphics',   phone:'08012345011', status:'active',   att:87 },
  { id:12, name:'Blessing Uche',    dept:'Protocol',         role:'Member',     phone:'08012345012', status:'active',   att:66 },
];

const DEPT_ATTENDANCE = [
  { name:'Ushers',           pct:92 },
  { name:'Media Team',       pct:70 },
  { name:'Choir',            pct:79 },
  { name:'Protocol',         pct:95 },
  { name:'Prayer Unit',      pct:83 },
  { name:'Security',         pct:91 },
  { name:'Children\'s Church',pct:76 },
  { name:'Technical Team',   pct:97 },
];

const UPCOMING_ROSTER = [
  { name:'Adaeze Okonkwo', dept:'Ushers',       role:'Team Lead',     status:'confirmed' },
  { name:'Tunde Balogun',  dept:'Media Team',   role:'Director',      status:'confirmed' },
  { name:'Grace Emeka',    dept:'Choir',        role:'Member',        status:'replacement' },
  { name:'Samuel Dike',    dept:'Protocol',     role:'Team Lead',     status:'confirmed' },
  { name:'Emeka Obi',      dept:'Security',     role:'Coordinator',   status:'confirmed' },
  { name:'David Afolabi',  dept:'Technical',    role:'Sound Engineer',status:'confirmed' },
  { name:'Chisom Nwosu',   dept:'Children\'s',  role:'Teacher',       status:'confirmed' },
];

const FLAGGED_WORKERS = [
  { name:'Ruth Adeleke',   dept:'Ushers',    absences:4, lastSeen:'6 Apr 2025' },
  { name:'Blessing Uche',  dept:'Protocol',  absences:3, lastSeen:'13 Apr 2025' },
  { name:'Grace Emeka',    dept:'Choir',     absences:2, lastSeen:'20 Apr 2025' },
];

const REPLACEMENTS = [
  { id:1, name:'Grace Emeka',    dept:'Choir',    service:'Sunday 27 Apr — 1st Service', reason:'Family emergency', submitted:'24 Apr 2025', status:'pending' },
  { id:2, name:'Ruth Adeleke',   dept:'Ushers',   service:'Sunday 27 Apr — 2nd Service', reason:'Traveling out of state', submitted:'23 Apr 2025', status:'pending' },
  { id:3, name:'Blessing Uche',  dept:'Protocol', service:'Friday 25 Apr — Prayer',      reason:'Work commitment', submitted:'22 Apr 2025', status:'pending' },
  { id:4, name:'Joseph Taiwo',   dept:'Choir',    service:'Friday 18 Apr — Prayer',      reason:'Sick leave', submitted:'15 Apr 2025', status:'approved' },
];

const REMINDER_LOG = [
  { worker:'Adaeze Okonkwo', type:'2-Day Reminder',   channel:'WhatsApp', sent:'24 Apr, 8:00 AM', status:'sent' },
  { worker:'Tunde Balogun',  type:'2-Day Reminder',   channel:'WhatsApp', sent:'24 Apr, 8:00 AM', status:'sent' },
  { worker:'Samuel Dike',    type:'2-Day Reminder',   channel:'WhatsApp', sent:'24 Apr, 8:01 AM', status:'sent' },
  { worker:'Emeka Obi',      type:'2-Day Reminder',   channel:'SMS',      sent:'24 Apr, 8:01 AM', status:'sent' },
  { worker:'Grace Emeka',    type:'Replacement Notice',channel:'WhatsApp', sent:'24 Apr, 9:15 AM', status:'sent' },
  { worker:'Ruth Adeleke',   type:'2-Day Reminder',   channel:'WhatsApp', sent:'24 Apr, 8:02 AM', status:'failed' },
  { worker:'David Afolabi',  type:'2-Day Reminder',   channel:'WhatsApp', sent:'24 Apr, 8:02 AM', status:'sent' },
];

const SCHEDULE = [
  { dept:'Ushers',             slots:[['Adaeze O.','Chidinma A.'],['—'],['—'],['Ruth A.','Peace C.'],['Samuel I.']] },
  { dept:'Choir',              slots:[['Grace E.','John M.'],['—'],['Choir Night'],['—'],['Grace E.']] },
  { dept:'Media Team',         slots:[['Tunde B.'],['—'],['—'],['Peace O.'],['Tunde B.']] },
  { dept:'Protocol',           slots:[['Samuel D.'],['—'],['—'],['Blessing U.'],['Samuel D.']] },
  { dept:'Prayer Unit',        slots:[['Ngozi E.'],['—'],['Prayer mtg'],['Ngozi E.'],['—']] },
  { dept:'Technical Team',     slots:[['David A.'],['—'],['—'],['David A.'],['David A.']] },
  { dept:'Children\'s Church', slots:[['Chisom N.'],['—'],['—'],['—'],['Chisom N.']] },
];

const TREND_DATA = [
  { month:'Nov', pct:74 },
  { month:'Dec', pct:81 },
  { month:'Jan', pct:78 },
  { month:'Feb', pct:83 },
  { month:'Mar', pct:85 },
  { month:'Apr', pct:87 },
];

// ---- STATE ----
let attendanceState = {};
let workersList = [...WORKERS];
let replacementsList = [...REPLACEMENTS];

// ---- UTILS ----
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => t.classList.add('hidden'), 3000);
}

function initials(name) {
  return name.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase();
}

function getStatusBadge(status) {
  const map = {
    active:   '<span class="badge badge-success">Active</span>',
    inactive: '<span class="badge badge-danger">Inactive</span>',
    pending:  '<span class="badge badge-warning">Pending</span>',
    approved: '<span class="badge badge-success">Approved</span>',
    declined: '<span class="badge badge-danger">Declined</span>',
    sent:     '<span class="badge badge-success">Sent</span>',
    failed:   '<span class="badge badge-danger">Failed</span>',
    confirmed:    '<span class="badge badge-success">Confirmed</span>',
    replacement:  '<span class="badge badge-warning">Replacement Needed</span>',
  };
  return map[status] || `<span class="badge badge-info">${status}</span>`;
}

// ---- PAGE ROUTING ----
function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const pageEl = document.getElementById(`page-${page}`);
  const navEl  = document.getElementById(`nav-${page}`);
  if (pageEl) pageEl.classList.remove('hidden');
  if (navEl)  navEl.classList.add('active');

  const titles = {
    overview: 'Overview', workers: 'Workers', schedule: 'Schedule',
    attendance: 'Attendance', replacements: 'Replacements',
    reminders: 'Reminders', reports: 'Reports', settings: 'Settings',
    notifications: 'Notifications', profile: 'My Profile',
  };
  document.getElementById('pageTitle').textContent = titles[page] || page;

  // Lazy render
  if (page === 'overview')     renderOverview();
  if (page === 'workers')      renderWorkers();
  if (page === 'schedule')     renderSchedule();
  if (page === 'attendance')   renderAttendance();
  if (page === 'replacements') renderReplacements();
  if (page === 'reminders')    renderReminders();
  if (page === 'reports')      renderReports();
  if (page === 'settings')     renderSettings();
  if (page === 'notifications') renderNotifications();
  if (page === 'profile')      renderProfile();

  // Close sidebar on mobile after navigating
  if (window.innerWidth < 768) closeSidebar();
}

// ---- RENDER: OVERVIEW ----
function renderOverview() {
  renderDeptChart();
  renderUpcomingRoster();
  renderFlaggedWorkers();
}

function renderDeptChart() {
  const el = document.getElementById('deptChart');
  if (!el) return;
  el.innerHTML = '';
  DEPT_ATTENDANCE.forEach(d => {
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `
      <div class="bar-label">${d.name}</div>
      <div class="bar-track"><div class="bar-fill" style="width:0%" data-pct="${d.pct}"></div></div>
      <div class="bar-pct">${d.pct}%</div>
    `;
    el.appendChild(row);
  });
  // Animate after paint
  requestAnimationFrame(() => {
    el.querySelectorAll('.bar-fill').forEach(b => {
      b.style.width = b.dataset.pct + '%';
    });
  });
}

function renderUpcomingRoster() {
  const el = document.getElementById('upcomingList');
  if (!el) return;
  el.innerHTML = UPCOMING_ROSTER.map(w => `
    <div class="upcoming-item">
      <div class="worker-avatar" style="width:28px;height:28px;font-size:0.65rem">${initials(w.name)}</div>
      <div class="upcoming-item-left">
        <div class="upcoming-item-name">${w.name}</div>
        <div class="upcoming-item-dept">${w.dept} · ${w.role}</div>
      </div>
      ${getStatusBadge(w.status)}
    </div>
  `).join('');
}

function renderFlaggedWorkers() {
  const body = document.getElementById('flaggedBody');
  if (!body) return;
  body.innerHTML = FLAGGED_WORKERS.map(w => `
    <tr>
      <td><div class="worker-name-cell">
        <div class="worker-avatar">${initials(w.name)}</div>
        <div><div class="worker-name">${w.name}</div></div>
      </div></td>
      <td>${w.dept}</td>
      <td><span class="badge badge-danger">${w.absences} absences</span></td>
      <td>${w.lastSeen}</td>
      <td><button class="btn btn-ghost btn-sm" onclick="toast('Message sent to ${w.name} via WhatsApp')">📤 Contact</button></td>
    </tr>
  `).join('');
}

// ---- RENDER: WORKERS ----
function renderWorkers(filter='', dept='') {
  const body = document.getElementById('workersBody');
  if (!body) return;
  const filtered = workersList.filter(w => {
    const matchName = w.name.toLowerCase().includes(filter.toLowerCase());
    const matchDept = dept ? w.dept === dept : true;
    return matchName && matchDept;
  });
  body.innerHTML = filtered.map(w => `
    <tr>
      <td><div class="worker-name-cell">
        <div class="worker-avatar">${initials(w.name)}</div>
        <div>
          <div class="worker-name">${w.name}</div>
          <div class="worker-phone">${w.phone}</div>
        </div>
      </div></td>
      <td><span class="badge badge-purple">${w.dept}</span></td>
      <td>${w.role}</td>
      <td>${w.phone}</td>
      <td>${getStatusBadge(w.status)}</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:60px;height:6px;background:var(--border-subtle);border-radius:3px;overflow:hidden;">
            <div style="height:100%;width:${w.att}%;background:${w.att>=80?'#10B981':w.att>=60?'#F59E0B':'#F43F5E'};border-radius:3px;"></div>
          </div>
          <span style="font-size:0.75rem;color:var(--text-secondary)">${w.att}%</span>
        </div>
      </td>
      <td>
        <div style="display:flex;gap:6px;">
          <button class="btn btn-ghost btn-sm" onclick="toast('Editing ${w.name}...')">✏️</button>
          <button class="btn btn-ghost btn-sm" onclick="toast('Reminder sent to ${w.name}')">🔔</button>
        </div>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted)">No workers found.</td></tr>';
}

// ---- RENDER: SCHEDULE ----
function renderSchedule() {
  const body = document.getElementById('scheduleBody');
  if (!body) return;
  body.innerHTML = SCHEDULE.map(dept => `
    <div class="sch-row">
      <div class="sch-dept-name">${dept.dept}</div>
      ${dept.slots.map(slot => `
        <div class="sch-cell">
          ${slot.map(s => s === '—' ? `<span style="color:var(--text-muted)">—</span>` : `<span class="sch-worker-chip">${s}</span>`).join('')}
        </div>
      `).join('')}
    </div>
  `).join('');
}

// ---- RENDER: ATTENDANCE ----
function renderAttendance() {
  const body = document.getElementById('attendanceBody');
  if (!body) return;

  // Init state
  workersList.forEach(w => {
    if (!attendanceState[w.id]) attendanceState[w.id] = null;
  });

  body.innerHTML = workersList.map(w => `
    <tr>
      <td><div class="worker-name-cell">
        <div class="worker-avatar">${initials(w.name)}</div>
        <div class="worker-name">${w.name}</div>
      </div></td>
      <td>${w.dept}</td>
      <td>${w.role}</td>
      <td>
        <div class="att-btn-group">
          <button class="att-btn ${attendanceState[w.id]==='present'?'selected-present':''}" data-id="${w.id}" data-status="present">✅ Present</button>
          <button class="att-btn ${attendanceState[w.id]==='absent'?'selected-absent':''}"  data-id="${w.id}" data-status="absent">❌ Absent</button>
          <button class="att-btn ${attendanceState[w.id]==='late'?'selected-late':''}"     data-id="${w.id}" data-status="late">🕐 Late</button>
          <button class="att-btn ${attendanceState[w.id]==='excused'?'selected-excused':''}" data-id="${w.id}" data-status="excused">🔵 Excused</button>
        </div>
      </td>
    </tr>
  `).join('');

  body.querySelectorAll('.att-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id     = parseInt(btn.dataset.id);
      const status = btn.dataset.status;
      attendanceState[id] = status;
      updateAttendanceSummary();
      // Re-render row buttons
      body.querySelectorAll(`.att-btn[data-id="${id}"]`).forEach(b => {
        b.className = `att-btn${b.dataset.status === status ? ' selected-'+status : ''}`;
      });
    });
  });

  updateAttendanceSummary();
}

function updateAttendanceSummary() {
  const vals = Object.values(attendanceState).filter(Boolean);
  const present = vals.filter(v=>v==='present').length;
  const absent  = vals.filter(v=>v==='absent').length;
  const late    = vals.filter(v=>v==='late').length;
  const excused = vals.filter(v=>v==='excused').length;
  const total   = vals.length;
  const rate    = total > 0 ? Math.round(((present+late)/total)*100) : 0;

  document.getElementById('presentCount').textContent = present;
  document.getElementById('absentCount').textContent  = absent;
  document.getElementById('lateCount').textContent    = late;
  document.getElementById('excusedCount').textContent = excused;
  document.getElementById('attRate').textContent      = total > 0 ? rate + '%' : '—%';
}

// ---- RENDER: REPLACEMENTS ----
function renderReplacements() {
  const list = document.getElementById('replacementsList');
  if (!list) return;
  list.innerHTML = replacementsList.map(r => `
    <div class="replacement-card glass-card" id="repl-card-${r.id}">
      <div class="repl-icon">${r.status === 'approved' ? '✅' : '🔄'}</div>
      <div class="repl-info">
        <div class="repl-name">${r.name}</div>
        <div class="repl-detail">${r.dept} · ${r.service}</div>
        <div class="repl-reason">Reason: "${r.reason}" · Submitted ${r.submitted}</div>
      </div>
      ${getStatusBadge(r.status)}
      <div class="repl-actions">
        ${r.status === 'pending' ? `
          <button class="btn btn-primary btn-sm" onclick="approveReplacement(${r.id})">✅ Approve</button>
          <button class="btn btn-ghost btn-sm" onclick="declineReplacement(${r.id})">✕ Decline</button>
        ` : `<span style="font-size:0.78rem;color:var(--text-muted)">Resolved</span>`}
      </div>
    </div>
  `).join('');
}

function approveReplacement(id) {
  const r = replacementsList.find(r => r.id === id);
  if (r) {
    r.status = 'approved';
    renderReplacements();
    updateReplacementBadge();
    toast(`✅ Replacement for ${r.name} approved. WhatsApp notification sent.`);
  }
}

function declineReplacement(id) {
  const r = replacementsList.find(r => r.id === id);
  if (r) {
    r.status = 'declined';
    renderReplacements();
    updateReplacementBadge();
    toast(`Replacement for ${r.name} declined.`);
  }
}

function updateReplacementBadge() {
  const pending = replacementsList.filter(r => r.status === 'pending').length;
  const badge = document.getElementById('replacementBadge');
  if (badge) badge.textContent = pending || '';
  document.getElementById('stat-replacements').textContent = pending;
}

// ---- RENDER: REMINDERS ----
function renderReminders() {
  const body = document.getElementById('reminderLogBody');
  if (!body) return;
  body.innerHTML = REMINDER_LOG.map(r => `
    <tr>
      <td><div class="worker-name-cell">
        <div class="worker-avatar" style="width:28px;height:28px;font-size:0.65rem">${initials(r.worker)}</div>
        <div class="worker-name">${r.worker}</div>
      </div></td>
      <td>${r.type}</td>
      <td>${r.channel === 'WhatsApp' ? '💬 WhatsApp' : '📱 SMS'}</td>
      <td style="color:var(--text-muted);font-size:0.78rem">${r.sent}</td>
      <td>${getStatusBadge(r.status)}</td>
    </tr>
  `).join('');
}

// ---- RENDER: REPORTS ----
function renderReports() {
  const el = document.getElementById('trendChart');
  if (!el || el.dataset.rendered) return;
  el.dataset.rendered = '1';
  const max = Math.max(...TREND_DATA.map(d=>d.pct));
  el.innerHTML = TREND_DATA.map(d => `
    <div class="trend-bar-wrap">
      <div class="trend-bar" data-val="${d.pct}%" style="height:0;max-height:${Math.round((d.pct/max)*100)}%"></div>
      <div class="trend-label">${d.month}</div>
    </div>
  `).join('');
  requestAnimationFrame(() => {
    el.querySelectorAll('.trend-bar').forEach(b => {
      b.style.height = b.style.maxHeight;
    });
  });
}

// ---- RENDER: SETTINGS ----
function renderSettings() {
  const deptList = document.getElementById('settingsDeptList');
  if (deptList && !deptList.dataset.rendered) {
    deptList.dataset.rendered = '1';
    const depts = ['Ushers','Choir','Media Team','Protocol','Prayer Unit','Security',"Children's Church",'Technical Team'];
    deptList.innerHTML = depts.map(d => `
      <div class="dept-manage-row">
        <span class="badge badge-purple">${d}</span>
        <div style="display:flex;gap:8px">
          <button class="btn btn-ghost btn-sm" onclick="toast('Editing ${d} department...')">✏️ Edit</button>
          <button class="btn btn-ghost btn-sm" style="color:var(--brand-rose)" onclick="toast('${d} removal disabled in demo.')">🗑️</button>
        </div>
      </div>
    `).join('');
  }

  document.querySelectorAll('.settings-tab').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.getElementById('stab-' + tab.dataset.tab);
      if (panel) panel.classList.add('active');
    };
  });
}

// ---- NOTIFICATIONS DATA ----
const NOTIFICATIONS = [
  { id:1, type:'alert',    icon:'⚠️', title:'3 workers flagged for repeated absences',       body:'Ruth Adeleke, Blessing Uche, and Grace Emeka have missed 2+ consecutive services.',   time:'Today, 9:00 AM',     unread:true  },
  { id:2, type:'reminder', icon:'📤', title:'Reminders sent to 142 workers',                 body:'Sunday service reminders dispatched via WhatsApp successfully.',                      time:'Today, 8:02 AM',     unread:true  },
  { id:3, type:'alert',    icon:'🔄', title:'Replacement request from Grace Emeka',          body:'Grace Emeka (Choir) has requested a replacement for Sunday 27 Apr — 1st Service.',   time:'Today, 7:45 AM',     unread:true  },
  { id:4, type:'system',   icon:'✅', title:'April rotation schedule generated',             body:'Monthly rotation for all 8 departments has been auto-generated.',                    time:'Yesterday, 4:15 PM', unread:false },
  { id:5, type:'reminder', icon:'📤', title:'Friday Prayer reminders sent',                  body:'23 workers in Prayer Unit and Choir were notified for Friday service.',              time:'22 Apr, 7:00 AM',    unread:false },
  { id:6, type:'system',   icon:'🎉', title:'New worker added — Adaeze Okonkwo',             body:'Adaeze Okonkwo was successfully added to the Ushers department.',                    time:'22 Apr, 11:30 AM',   unread:false },
  { id:7, type:'alert',    icon:'❌', title:'WhatsApp delivery failed for Ruth Adeleke',     body:'Could not reach Ruth Adeleke via WhatsApp. SMS fallback initiated.',                 time:'21 Apr, 8:05 AM',    unread:false },
  { id:8, type:'system',   icon:'📊', title:'March Attendance Report ready',                 body:'Monthly attendance report for March 2025 generated. Click to download.',             time:'1 Apr, 10:00 AM',    unread:false },
];

let notifData = [...NOTIFICATIONS];

function renderNotifications(filter) {
  const list = document.getElementById('notifList');
  if (!list) return;
  if (!filter) filter = document.querySelector('.notif-filter-btn.active')?.dataset.filter || 'all';

  document.querySelectorAll('.notif-filter-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.notif-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderNotifications(btn.dataset.filter);
    };
  });

  const filtered = filter === 'all' ? notifData : notifData.filter(n => n.type === filter);
  list.innerHTML = filtered.length === 0
    ? '<div class="notif-empty">No notifications in this category.</div>'
    : filtered.map(n => `
      <div class="notif-item glass-card ${n.unread ? 'notif-unread' : ''}" id="notif-${n.id}">
        <div class="notif-icon-wrap ${n.type}">${n.icon}</div>
        <div class="notif-body">
          <div class="notif-title">${n.title}${n.unread ? '<span class="notif-new-dot"></span>' : ''}</div>
          <div class="notif-desc">${n.body}</div>
          <div class="notif-time">${n.time}</div>
        </div>
        <button class="notif-dismiss" onclick="dismissNotif(${n.id})" title="Dismiss">✕</button>
      </div>
    `).join('');
}

function dismissNotif(id) {
  notifData = notifData.filter(n => n.id !== id);
  renderNotifications();
  toast('Notification dismissed.');
}

function markAllRead() {
  notifData.forEach(n => n.unread = false);
  document.getElementById('notifList').querySelectorAll('.notif-unread').forEach(el => el.classList.remove('notif-unread'));
  document.getElementById('notifList').querySelectorAll('.notif-new-dot').forEach(el => el.remove());
  document.querySelector('.notif-dot')?.style.setProperty('display','none');
  toast('✅ All notifications marked as read.');
}

// ---- RENDER: PROFILE ----
function renderProfile() { /* profile is static HTML */ }

// ---- TOPBAR ICON BUTTONS ----
document.getElementById('notifBtn')?.addEventListener('click', () => navigateTo('notifications'));
document.getElementById('profileAvatar')?.addEventListener('click', () => navigateTo('profile'));

// ---- SIDEBAR TOGGLE ----
function openSidebar() {
  const sb = document.getElementById('sidebar');
  sb.classList.add('open');
  // Create backdrop
  if (!document.getElementById('sidebarBackdrop')) {
    const bd = document.createElement('div');
    bd.id = 'sidebarBackdrop';
    bd.className = 'sidebar-backdrop';
    bd.addEventListener('click', closeSidebar);
    document.body.appendChild(bd);
  }
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  const bd = document.getElementById('sidebarBackdrop');
  if (bd) bd.remove();
}

document.getElementById('sidebarToggle').addEventListener('click', () => {
  const sb = document.getElementById('sidebar');
  if (window.innerWidth < 768) {
    sb.classList.contains('open') ? closeSidebar() : openSidebar();
  } else {
    sb.classList.toggle('collapsed');
    document.getElementById('dashMain').style.marginLeft = '';
  }
});

// ---- NAV LINKS ----
document.querySelectorAll('.nav-item[data-page]').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    navigateTo(item.dataset.page);
  });
});

// ---- ALERT CLOSE ----
document.getElementById('alertClose')?.addEventListener('click', e => {
  e.target.closest('.alert-banner').style.display = 'none';
});

// ---- WORKERS PAGE ----
document.getElementById('workerSearch')?.addEventListener('input', e => {
  const dept = document.getElementById('deptFilter').value;
  renderWorkers(e.target.value, dept);
});

document.getElementById('deptFilter')?.addEventListener('change', e => {
  const search = document.getElementById('workerSearch').value;
  renderWorkers(search, e.target.value);
});

document.getElementById('addWorkerBtn')?.addEventListener('click', () => {
  document.getElementById('addWorkerModal').classList.remove('hidden');
});

['closeWorkerModal','cancelWorkerModal'].forEach(id => {
  document.getElementById(id)?.addEventListener('click', () => {
    document.getElementById('addWorkerModal').classList.add('hidden');
  });
});

document.getElementById('saveWorkerBtn')?.addEventListener('click', () => {
  const name  = document.getElementById('workerName').value.trim();
  const phone = document.getElementById('workerPhone').value.trim();
  const dept  = document.getElementById('workerDept').value;
  const role  = document.getElementById('workerRole').value.trim() || 'Member';
  if (!name || !phone) { toast('Please fill in name and phone number.'); return; }
  const newWorker = { id: Date.now(), name, phone, dept, role, status:'active', att:100 };
  workersList.unshift(newWorker);
  document.getElementById('addWorkerModal').classList.add('hidden');
  document.getElementById('workerName').value = '';
  document.getElementById('workerPhone').value = '';
  document.getElementById('workerRole').value = '';
  renderWorkers();
  document.getElementById('stat-workers').textContent = workersList.filter(w=>w.status==='active').length;
  toast(`✅ ${name} added to ${dept}. WhatsApp welcome message sent.`);
});

// ---- SCHEDULE PAGE ----
document.getElementById('generateRota')?.addEventListener('click', () => {
  const btn = document.getElementById('generateRota');
  btn.textContent = '⏳ Generating...';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = '⚡ Generate Rotation';
    btn.disabled = false;
    document.getElementById('rotaSuccess').classList.remove('hidden');
    toast('🎉 Monthly rotation generated and workers notified!');
  }, 1800);
});

// ---- ATTENDANCE PAGE ----
document.getElementById('saveAttendanceBtn')?.addEventListener('click', () => {
  const marked = Object.values(attendanceState).filter(Boolean).length;
  if (marked === 0) { toast('Please mark at least one worker before saving.'); return; }
  toast(`✅ Attendance saved for ${marked} worker(s).`);
});

// ---- REMINDERS PAGE ----
document.getElementById('sendReminderBtn')?.addEventListener('click', () => {
  const btn = document.getElementById('sendReminderBtn');
  btn.textContent = '⏳ Sending...';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = '📤 Send Now to All';
    btn.disabled = false;
    toast(`📤 Reminders sent to ${workersList.filter(w=>w.status==='active').length} workers via WhatsApp!`);
  }, 1500);
});

// ---- INIT ----
navigateTo('overview');
