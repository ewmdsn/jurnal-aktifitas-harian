// Logika Utama Aplikasi Jurnal Aktivitas & Rekonstruksi Biologis Mandiri (Teroptimasi: Nutrisi, Latihan & Supabase Cloud)

const STORAGE_KEY = 'jurnal_biologis_mandiri_v1';

class AppManager {
    constructor() {
        this.data = this.loadState();
        this.currentTab = 'summary-jadwal';
        this.editingTaskId = null;
        this.editingBioLogId = null;
        this.selectedWorkoutDay = 'Senin';
        const todayStr = new Date().toISOString().split('T')[0];
        this.selectedSummaryDate = (this.data.tasks && this.data.tasks.some(t => t.tanggal === todayStr))
            ? todayStr
            : (this.data.tasks && this.data.tasks.length > 0 ? this.data.tasks[0].tanggal : todayStr);
        this.timelineFilter = 'all';
        this.init();
    }

    // Default Seed Data
    getDefaultState() {
        return {
            tasks: [
                { id: '1', tanggal: '2026-11-16', hari: 'Senin', mulai: '05:30', selesai: '06:00', durasi: '0.50', kategori: 'Nutrisi & Hidrasi Terjadwal', aktivitas: 'Bangun, hidrasi seluler (500ml + garam mineral) & Cat-Cow / Stomach Vacuum', output: 'Korset perut aktif, hidrasi awal tercapai', prioritas: 'Tinggi', status: 'Selesai', fokus: 5, catatan: 'Sesuai protokol bangun 05.30' },
                { id: '2', tanggal: '2026-11-16', hari: 'Senin', mulai: '08:00', selesai: '09:00', durasi: '1.00', kategori: 'Perencanaan & Evaluasi', aktivitas: 'Review rencana mingguan & jadwal sprint', output: 'Prioritas harian ditetapkan', prioritas: 'Tinggi', status: 'Selesai', fokus: 5, catatan: 'Fokus prima' },
                { id: '3', tanggal: '2026-11-16', hari: 'Senin', mulai: '09:00', selesai: '12:00', durasi: '3.00', kategori: 'Pekerjaan Utama', aktivitas: 'Implementasi modul sistem web application', output: 'Fitur baru terpasang & teruji', prioritas: 'Tinggi', status: 'Selesai', fokus: 5, catatan: 'Produktivitas tinggi tanpa distraksi' },
                { id: '4', tanggal: '2026-11-16', hari: 'Senin', mulai: '12:30', selesai: '13:00', durasi: '0.50', kategori: 'Nutrisi & Hidrasi Terjadwal', aktivitas: 'Makan siang utama (Dada ayam, nasi 1 kepal, sayur bening) + postur tegak', output: 'Asupan protein & mikronutrisi terpenuhi', prioritas: 'Sedang', status: 'Selesai', fokus: 4, catatan: 'Perut korset aktif saat duduk' },
                { id: '5', tanggal: '2026-11-16', hari: 'Senin', mulai: '16:30', selesai: '17:15', durasi: '0.75', kategori: 'Latihan & Olah Tubuh', aktivitas: 'Sesi A: Dada Bidang, Bahu Lebar & Six-Pack (Push-up, Pike, Lateral Raise)', output: 'Latihan selesai, vaskularisasi bahu/dada tercapai', prioritas: 'Tinggi', status: 'Selesai', fokus: 5, catatan: 'Intensitas 70% adaptasi minggu pertama' },
                { id: '6', tanggal: '2026-11-16', hari: 'Senin', mulai: '19:00', selesai: '19:30', durasi: '0.50', kategori: 'Nutrisi & Hidrasi Terjadwal', aktivitas: 'Makan malam cut-off: Ikan bakar & capcay hijau (Tanpa Nasi/Tepung)', output: 'Cut-off makan malam dimulai untuk picu Autofagi', prioritas: 'Tinggi', status: 'Selesai', fokus: 4, catatan: 'Berhenti makan 2.5 jam sebelum tidur' }
            ],
            bioLogs: [
                {
                    id: 'b1',
                    tanggal: '2026-11-16',
                    hari: 'Senin',
                    sesi: 'Sesi A: Dada, Bahu & Six-Pack',
                    patuh: 'Selesai Penuh (100%)',
                    vacuum: '5 set x 15 detik',
                    hang: 'Ya (Dead Hang & Child)',
                    air: 2800,
                    elektrolit: 'Ya',
                    makanMalam: '19:15',
                    jedaTidur: '2.5',
                    noCarb: 'Ya',
                    jamTidur: '21:45',
                    jamBangun: '05:30',
                    durasiTidur: '7.8',
                    puncakHgh: 'Ya (HGH Optimal)',
                    sensasi: 'Hangat / Pegal Termogenesis (Normal)',
                    lingkarPerut: 86.5,
                    beratBadan: 72.0,
                    redFlag: 'Aman & Terkendali',
                    catatan: 'Punggung terasa panas hangat membakar, dekompresi dead hang melegakan'
                }
            ],
            todayWater: 2800,
            targetWater: 3000,
            mealChecklists: {},
            workoutChecklists: {}
        };
    }

    loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : this.getDefaultState();
        } catch (e) {
            console.error('Error loading state:', e);
            return this.getDefaultState();
        }
    }

    saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        } catch (e) {
            console.error('Error saving state:', e);
        }
    }

    async init() {
        this.bindEvents();
        this.renderAll();
        await this.initSupabaseSync();
    }

    async initSupabaseSync() {
        const badgeEl = document.getElementById('cloud-sync-badge');
        if (!window.supabaseService) return;

        const isLive = await window.supabaseService.testConnection();
        if (isLive) {
            if (badgeEl) {
                badgeEl.innerHTML = `<span class="status-dot"></span><span>☁️ Supabase Cloud: Terhubung</span>`;
                badgeEl.style.borderColor = 'rgba(74, 222, 128, 0.4)';
                badgeEl.style.color = '#86efac';
            }

            const cloudTasks = await window.supabaseService.fetchTasks();
            const cloudBio = await window.supabaseService.fetchBioLogs();

            if (cloudTasks && cloudTasks.length > 0) {
                this.data.tasks = cloudTasks;
            } else if (this.data.tasks.length > 0) {
                for (const t of this.data.tasks) {
                    await window.supabaseService.upsertTask(t);
                }
            }

            if (cloudBio && cloudBio.length > 0) {
                this.data.bioLogs = cloudBio;
                const todayStr = new Date().toISOString().split('T')[0];
                const todayBio = cloudBio.find(b => b.tanggal === todayStr);
                if (todayBio) {
                    this.data.todayWater = todayBio.air || 0;
                }
            } else if (this.data.bioLogs.length > 0) {
                for (const b of this.data.bioLogs) {
                    await window.supabaseService.upsertBioLog(b);
                }
            }

            this.saveState();
            this.renderAll();
        } else {
            if (badgeEl) {
                badgeEl.innerHTML = `<span>⚠️ Mode Lokal (LocalStorage)</span>`;
                badgeEl.style.borderColor = 'rgba(250, 204, 21, 0.4)';
                badgeEl.style.color = '#fde047';
            }
        }
    }

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.nav-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');
                this.switchTab(targetTab);
            });
        });

        // Quick Water Buttons
        document.querySelectorAll('.btn-add-water').forEach(btn => {
            btn.addEventListener('click', () => {
                const amount = parseInt(btn.getAttribute('data-amount') || '250');
                this.addWater(amount);
            });
        });

        const resetWaterBtn = document.getElementById('btn-reset-water');
        if (resetWaterBtn) {
            resetWaterBtn.addEventListener('click', () => {
                if (confirm('Reset hitungan air hari ini ke 0 ml?')) {
                    this.data.todayWater = 0;
                    this.saveState();
                    this.renderHydration();
                }
            });
        }

        // Form Submit: Tambah / Edit Tugas Kerja
        const formTask = document.getElementById('form-add-task');
        if (formTask) {
            formTask.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSaveTask();
            });
        }

        // Form Submit: Penjadwalan Latihan Fisik
        const formWorkout = document.getElementById('form-schedule-workout');
        if (formWorkout) {
            formWorkout.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleScheduleWorkout();
            });
        }

        // Auto update durasi pada form jadwal latihan
        const schedMulai = document.getElementById('sched-workout-mulai');
        const schedSelesai = document.getElementById('sched-workout-selesai');
        if (schedMulai) schedMulai.addEventListener('input', () => this.updateWorkoutDurationBadge());
        if (schedSelesai) schedSelesai.addEventListener('input', () => this.updateWorkoutDurationBadge());

        // Date Picker pada Summary Dashboard
        const summaryDateInput = document.getElementById('summary-selected-date');
        if (summaryDateInput) {
            summaryDateInput.addEventListener('change', (e) => {
                if (e.target.value) {
                    this.selectedSummaryDate = e.target.value;
                    this.renderSummaryDashboard();
                }
            });
        }

        // Inisialisasi Kota Waktu Salat & Overlay Modal
        const citySelect = document.getElementById('prayer-city-select');
        const autoCitySelect = document.getElementById('auto-sched-city');
        if (window.prayerManager) {
            if (citySelect) citySelect.value = window.prayerManager.selectedCityKey;
            if (autoCitySelect) autoCitySelect.value = window.prayerManager.selectedCityKey;
        }

        const modalAutoSched = document.getElementById('modal-auto-schedule');
        if (modalAutoSched) {
            modalAutoSched.addEventListener('click', (e) => {
                if (e.target === modalAutoSched) this.closeAutoScheduleModal();
            });
        }

        const modalResetSched = document.getElementById('modal-reset-schedule');
        if (modalResetSched) {
            modalResetSched.addEventListener('click', (e) => {
                if (e.target === modalResetSched) this.closeResetScheduleModal();
            });
        }

        // Form Submit: Tambah / Edit Log Biologis
        const formBio = document.getElementById('form-add-bio');
        if (formBio) {
            formBio.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSaveBioLog();
            });
        }

        // Tombol Sinkronisasi Manual Supabase
        const btnSyncCloud = document.getElementById('btn-sync-cloud');
        if (btnSyncCloud) {
            btnSyncCloud.addEventListener('click', async () => {
                btnSyncCloud.disabled = true;
                btnSyncCloud.innerHTML = '⏳ Menyinkronkan...';
                if (window.supabaseService) {
                    await window.supabaseService.fullSync(this.data.tasks, this.data.bioLogs);
                    alert('Sinkronisasi penuh dengan Supabase Cloud berhasil!');
                }
                btnSyncCloud.disabled = false;
                btnSyncCloud.innerHTML = '☁️ Sinkronkan ke Supabase Sekarang';
            });
        }

        // Export Buttons
        const btnExportKerja = document.getElementById('btn-export-kerja-csv');
        if (btnExportKerja) {
            btnExportKerja.addEventListener('click', () => DataExporter.exportJurnalKerjaCSV(this.data.tasks));
        }

        const btnExportBio = document.getElementById('btn-export-bio-csv');
        if (btnExportBio) {
            btnExportBio.addEventListener('click', () => DataExporter.exportLogBiologisCSV(this.data.bioLogs));
        }

        const btnExportAll = document.getElementById('btn-export-backup-json');
        if (btnExportAll) {
            btnExportAll.addEventListener('click', () => DataExporter.exportBackupJSON(this.data));
        }

        // Timer Mode Buttons
        document.querySelectorAll('.btn-timer-mode').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.btn-timer-mode').forEach(b => b.className = 'btn btn-outline btn-timer-mode');
                btn.className = 'btn btn-green btn-timer-mode';
                const mode = btn.getAttribute('data-mode');
                window.exerciseTimer.setMode(mode);
            });
        });

        const btnStartTimer = document.getElementById('btn-timer-start');
        if (btnStartTimer) {
            btnStartTimer.addEventListener('click', () => {
                if (window.exerciseTimer.isRunning) {
                    window.exerciseTimer.pause();
                } else {
                    window.exerciseTimer.start();
                }
            });
        }

        const btnResetTimer = document.getElementById('btn-timer-reset');
        if (btnResetTimer) {
            btnResetTimer.addEventListener('click', () => window.exerciseTimer.stop());
        }
    }

    switchTab(tabId) {
        this.currentTab = tabId;
        document.querySelectorAll('.nav-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
        });

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabId}`);
        });

        if (tabId === 'summary-jadwal') {
            this.renderSummaryDashboard();
        } else if (tabId === 'dashboard-kpi') {
            this.renderDashboard();
        } else if (tabId === 'menu-makan') {
            this.renderMealTimeline();
            this.renderWeeklyMenu();
        } else if (tabId === 'jadwal-latihan') {
            this.renderWorkoutDay(this.selectedWorkoutDay);
            this.renderGerakanKunci();
            this.renderMetodeCatalog();
            this.renderBatasMedis();
            this.updateWorkoutDurationBadge();
        } else if (tabId === 'master-protokol') {
            this.renderJendelaRegenerasi();
        } else if (tabId === 'timer-latihan') {
            window.exerciseTimer.updateUI();
        }
    }

    addWater(amount) {
        this.data.todayWater = (this.data.todayWater || 0) + amount;
        this.saveState();
        this.renderHydration();

        const todayStr = new Date().toISOString().split('T')[0];
        const todayBio = this.data.bioLogs.find(b => b.tanggal === todayStr);
        if (todayBio) {
            todayBio.air = this.data.todayWater;
            this.saveState();
            this.renderBioLogs();
            if (window.supabaseService) {
                window.supabaseService.upsertBioLog(todayBio);
            }
        }
    }

    calculateDuration(start, end) {
        if (!start || !end) return '0.00';
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        let sMins = sh * 60 + sm;
        let eMins = eh * 60 + em;
        if (eMins < sMins) eMins += 24 * 60;
        return ((eMins - sMins) / 60).toFixed(2);
    }

    calculateSleep(start, end) {
        if (!start || !end) return '0.0';
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        let sMins = sh * 60 + sm;
        let eMins = eh * 60 + em;
        if (eMins < sMins) eMins += 24 * 60;
        return ((eMins - sMins) / 60).toFixed(1);
    }

    getDayName(dateStr) {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const d = new Date(dateStr);
        return isNaN(d.getDay()) ? '' : days[d.getDay()];
    }

    // =============================================================
    // CRUD JURNAL KERJA (TAMBAH, EDIT, HAPUS)
    // =============================================================
    startEditTask(id) {
        const task = this.data.tasks.find(t => t.id === id);
        if (!task) return;

        this.editingTaskId = id;
        document.getElementById('task-edit-id').value = id;
        document.getElementById('task-tgl').value = task.tanggal || '';
        document.getElementById('task-mulai').value = task.mulai || '';
        document.getElementById('task-selesai').value = task.selesai || '';
        document.getElementById('task-kategori').value = task.kategori || 'Pekerjaan Utama';
        document.getElementById('task-metode').value = task.metode_latihan || '';
        document.getElementById('task-nama').value = task.aktivitas || '';
        document.getElementById('task-output').value = task.output || '';
        document.getElementById('task-prioritas').value = task.prioritas || 'Tinggi';
        document.getElementById('task-status').value = task.status || 'Selesai';
        document.getElementById('task-fokus').value = task.fokus || 5;
        document.getElementById('task-catatan').value = task.catatan || '';

        document.getElementById('title-form-task').innerHTML = '✏️ Edit Aktivitas / Tugas';
        document.getElementById('btn-submit-task').innerHTML = '💾 Simpan Perubahan Tugas';
        document.getElementById('btn-submit-task').className = 'btn btn-green';
        document.getElementById('btn-cancel-task-edit').style.display = 'inline-flex';
        document.getElementById('badge-edit-mode-task').style.display = 'inline-block';

        const formCard = document.getElementById('card-form-task');
        if (formCard) formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        document.getElementById('task-nama').focus();
    }

    cancelEditTask() {
        this.editingTaskId = null;
        document.getElementById('form-add-task').reset();
        document.getElementById('task-edit-id').value = '';
        const taskMetode = document.getElementById('task-metode');
        if (taskMetode) taskMetode.value = '';
        document.getElementById('title-form-task').innerHTML = '➕ Tambah Aktivitas / Tugas Harian';
        document.getElementById('btn-submit-task').innerHTML = '➕ Simpan ke Jurnal Kerja & Sinkron Cloud';
        document.getElementById('btn-submit-task').className = 'btn btn-primary';
        document.getElementById('btn-cancel-task-edit').style.display = 'none';
        document.getElementById('badge-edit-mode-task').style.display = 'none';

        const todayStr = new Date().toISOString().split('T')[0];
        document.getElementById('task-tgl').value = todayStr;
    }

    timeToMinutes(timeStr) {
        if (!timeStr) return 0;
        const [h, m] = timeStr.split(':').map(Number);
        return (h || 0) * 60 + (m || 0);
    }

    checkConflicts(targetDate, startStr, endStr, excludeId = null) {
        const startMin = this.timeToMinutes(startStr);
        let endMin = this.timeToMinutes(endStr);
        if (endMin <= startMin) endMin += 1440;

        const conflicts = [];

        (this.data.tasks || []).forEach(t => {
            if (t.tanggal === targetDate && t.id !== excludeId) {
                const tStart = this.timeToMinutes(t.mulai);
                let tEnd = this.timeToMinutes(t.selesai);
                if (tEnd <= tStart) tEnd += 1440;

                // Overlap: startA < endB && endA > startB
                if (startMin < tEnd && endMin > tStart) {
                    conflicts.push({
                        id: t.id,
                        title: t.aktivitas || 'Aktivitas Kerja',
                        kategori: t.kategori || 'Kerja',
                        metode: t.metode_latihan || '',
                        mulai: t.mulai,
                        selesai: t.selesai,
                        durasi: `${t.durasi} Jam`,
                        source: 'Jurnal Kerja'
                    });
                }
            }
        });

        return {
            hasConflict: conflicts.length > 0,
            conflicts
        };
    }

    showConflictModal(newAgenda, conflicts, onForceSave, onAdjust) {
        const modal = document.getElementById('modal-conflict-detector');
        if (!modal) {
            const listText = conflicts.map(c => `• ${c.title} (${c.mulai} - ${c.selesai})`).join('\n');
            if (confirm(`⚠️ Bentrokan Jadwal Terdeteksi!\nJam ${newAgenda.mulai} - ${newAgenda.selesai} bertabrakan dengan:\n${listText}\n\nTetap simpan jadwal ini?`)) {
                if (typeof onForceSave === 'function') onForceSave();
            } else {
                if (typeof onAdjust === 'function') onAdjust();
            }
            return;
        }

        const titleEl = document.getElementById('conflict-modal-new-title');
        const timeEl = document.getElementById('conflict-modal-new-time');
        const durEl = document.getElementById('conflict-modal-new-duration');
        if (titleEl) titleEl.innerText = newAgenda.title;
        if (timeEl) timeEl.innerText = `${newAgenda.mulai} - ${newAgenda.selesai}`;
        if (durEl) durEl.innerText = newAgenda.durasi;

        const listEl = document.getElementById('conflict-modal-existing-list');
        if (listEl) {
            listEl.innerHTML = conflicts.map(c => `
                <div style="background:#ffffff; border:1px solid #fecdd3; border-radius:6px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
                    <div>
                        <div style="font-weight:700; color:#881337; font-size:0.9rem;">${c.title}</div>
                        <div style="font-size:0.75rem; color:#9f1239;">[${c.source}] ${c.kategori} ${c.metode ? '• ' + c.metode : ''}</div>
                    </div>
                    <span class="badge badge-danger" style="font-size:0.8rem; font-weight:800; white-space:nowrap;">⏰ ${c.mulai} - ${c.selesai}</span>
                </div>
            `).join('');
        }

        modal.style.display = 'flex';

        const btnAdjust = document.getElementById('btn-conflict-adjust');
        const btnForce = document.getElementById('btn-conflict-force-save');

        if (btnAdjust) {
            btnAdjust.onclick = () => {
                modal.style.display = 'none';
                if (typeof onAdjust === 'function') onAdjust();
            };
        }

        if (btnForce) {
            btnForce.onclick = () => {
                modal.style.display = 'none';
                if (typeof onForceSave === 'function') onForceSave();
            };
        }
    }

    async handleSaveTask() {
        const tgl = document.getElementById('task-tgl').value;
        const mulai = document.getElementById('task-mulai').value;
        const selesai = document.getElementById('task-selesai').value;
        const kat = document.getElementById('task-kategori').value;
        const metode = document.getElementById('task-metode') ? document.getElementById('task-metode').value : '';
        const aktivitas = document.getElementById('task-nama').value;
        const output = document.getElementById('task-output').value;
        const prioritas = document.getElementById('task-prioritas').value;
        const status = document.getElementById('task-status').value;
        const fokus = parseInt(document.getElementById('task-fokus').value || '5');
        const catatan = document.getElementById('task-catatan').value;

        if (!tgl || !mulai || !selesai || !aktivitas) {
            alert('Silakan lengkapi tanggal, jam mulai, jam selesai, dan nama aktivitas.');
            return;
        }

        const durasi = this.calculateDuration(mulai, selesai);
        const hari = this.getDayName(tgl);

        // Conflict check
        const conflictCheck = this.checkConflicts(tgl, mulai, selesai, this.editingTaskId);
        if (conflictCheck.hasConflict) {
            this.showConflictModal(
                {
                    title: aktivitas,
                    mulai,
                    selesai,
                    durasi: `${durasi} Jam`,
                    kategori: kat
                },
                conflictCheck.conflicts,
                () => {
                    this.executeSaveTask(tgl, hari, mulai, selesai, durasi, kat, metode, aktivitas, output, prioritas, status, fokus, catatan);
                },
                () => {
                    document.getElementById('task-mulai').focus();
                }
            );
            return;
        }

        this.executeSaveTask(tgl, hari, mulai, selesai, durasi, kat, metode, aktivitas, output, prioritas, status, fokus, catatan);
    }

    async executeSaveTask(tgl, hari, mulai, selesai, durasi, kat, metode, aktivitas, output, prioritas, status, fokus, catatan) {
        if (this.editingTaskId) {
            const idx = this.data.tasks.findIndex(t => t.id === this.editingTaskId);
            if (idx >= 0) {
                const updatedTask = {
                    id: this.editingTaskId,
                    tanggal: tgl,
                    hari,
                    mulai,
                    selesai,
                    durasi,
                    kategori: kat,
                    metode_latihan: metode,
                    aktivitas,
                    output,
                    prioritas,
                    status,
                    fokus,
                    catatan
                };
                this.data.tasks[idx] = updatedTask;
                this.saveState();
                this.renderTasks();
                this.renderDashboard();
                this.renderSummaryDashboard();

                if (window.supabaseService) {
                    await window.supabaseService.upsertTask(updatedTask);
                }

                this.cancelEditTask();
                this.showToast('✅ Tugas berhasil diperbarui dan disinkronkan ke Supabase Cloud!');
            }
        } else {
            const newTask = {
                id: Date.now().toString(),
                tanggal: tgl,
                hari,
                mulai,
                selesai,
                durasi,
                kategori: kat,
                metode_latihan: metode,
                aktivitas,
                output,
                prioritas,
                status,
                fokus,
                catatan
            };

            this.data.tasks.unshift(newTask);
            this.saveState();
            this.renderTasks();
            this.renderDashboard();
            this.renderSummaryDashboard();

            if (window.supabaseService) {
                await window.supabaseService.upsertTask(newTask);
            }

            document.getElementById('form-add-task').reset();
            const todayStr = new Date().toISOString().split('T')[0];
            document.getElementById('task-tgl').value = todayStr;

            this.showToast('✅ Tugas baru berhasil ditambahkan dan disinkronkan ke Supabase Cloud!');
        }
    }

    async deleteTask(id) {
        const task = this.data.tasks.find(t => t.id === id);
        const name = task ? `"${task.aktivitas}"` : 'entri ini';
        if (confirm(`Apakah Anda yakin ingin menghapus tugas ${name}?`)) {
            if (this.editingTaskId === id) this.cancelEditTask();
            this.data.tasks = this.data.tasks.filter(t => t.id !== id);
            this.saveState();
            this.renderTasks();
            this.renderDashboard();
            this.renderSummaryDashboard();

            if (window.supabaseService) {
                await window.supabaseService.deleteTask(id);
            }
            this.showToast('🗑️ Tugas berhasil dihapus.');
        }
    }

    // =============================================================
    // FITUR JAM & PENGATURAN JADWAL METODE LATIHAN (TAB 4)
    // =============================================================
    updateWorkoutDurationBadge() {
        const mulai = document.getElementById('sched-workout-mulai')?.value;
        const selesai = document.getElementById('sched-workout-selesai')?.value;
        const badge = document.getElementById('sched-workout-duration-badge');
        if (!badge || !mulai || !selesai) return;
        const durasi = this.calculateDuration(mulai, selesai);
        const mins = Math.round(parseFloat(durasi) * 60);
        badge.innerText = `Durasi: ${durasi} Jam (${mins} Menit)`;
    }

    handleScheduleWorkout() {
        const tgl = document.getElementById('sched-workout-tgl').value;
        const mulai = document.getElementById('sched-workout-mulai').value;
        const selesai = document.getElementById('sched-workout-selesai').value;
        const sesi = document.getElementById('sched-workout-sesi').value;
        const metode = document.getElementById('sched-workout-metode').value;
        const catatan = document.getElementById('sched-workout-catatan').value;

        if (!tgl || !mulai || !selesai) {
            alert('Silakan pilih tanggal, jam mulai, dan jam selesai latihan.');
            return;
        }

        const durasi = this.calculateDuration(mulai, selesai);
        const hari = this.getDayName(tgl);

        // Cek anti-bentrokan jam!
        const conflictCheck = this.checkConflicts(tgl, mulai, selesai, null);
        if (conflictCheck.hasConflict) {
            this.showConflictModal(
                {
                    title: `${sesi}`,
                    mulai,
                    selesai,
                    durasi: `${durasi} Jam`,
                    kategori: 'Latihan & Olah Tubuh'
                },
                conflictCheck.conflicts,
                () => {
                    this.executeSaveWorkout(tgl, hari, mulai, selesai, durasi, sesi, metode, catatan);
                },
                () => {
                    document.getElementById('sched-workout-mulai').focus();
                }
            );
            return;
        }

        this.executeSaveWorkout(tgl, hari, mulai, selesai, durasi, sesi, metode, catatan);
    }

    async executeSaveWorkout(tgl, hari, mulai, selesai, durasi, sesi, metode, catatan) {
        const newWorkoutTask = {
            id: Date.now().toString(),
            tanggal: tgl,
            hari,
            mulai,
            selesai,
            durasi,
            kategori: 'Latihan & Olah Tubuh',
            metode_latihan: metode,
            aktivitas: sesi,
            output: `Target sesi latihan tuntas (${metode})`,
            prioritas: 'Tinggi',
            status: 'Selesai',
            fokus: 5,
            catatan: catatan || 'Target rekonstruksi postur V-taper'
        };

        this.data.tasks.unshift(newWorkoutTask);
        this.saveState();
        this.renderTasks();
        this.renderDashboard();
        this.renderSummaryDashboard();

        if (window.supabaseService) {
            await window.supabaseService.upsertTask(newWorkoutTask);
        }

        this.showToast(`✅ Sesi latihan (${metode}) berhasil dijadwalkan pada ${mulai} - ${selesai}!`);
        this.switchTab('summary-jadwal');
    }

    scheduleMetodeWithTime(metodeNama) {
        this.switchTab('jadwal-latihan');

        const metodeSel = document.getElementById('sched-workout-metode');
        if (metodeSel) metodeSel.value = metodeNama;

        const mulaiInput = document.getElementById('sched-workout-mulai');
        const selesaiInput = document.getElementById('sched-workout-selesai');
        const sesiSel = document.getElementById('sched-workout-sesi');

        if (mulaiInput && selesaiInput) {
            if (metodeNama.includes('Dekompresi')) {
                mulaiInput.value = '21:00';
                selesaiInput.value = '21:30';
                if (sesiSel) sesiSel.value = 'Sesi D: Restorasi Mobilitas, Dekompresi Fasia & Dead Hang';
            } else if (metodeNama.includes('Zone 2')) {
                mulaiInput.value = '06:00';
                selesaiInput.value = '06:45';
            } else if (metodeNama.includes('Isometrik')) {
                mulaiInput.value = '05:45';
                selesaiInput.value = '06:15';
            } else {
                mulaiInput.value = '16:30';
                selesaiInput.value = '17:15';
            }
            this.updateWorkoutDurationBadge();
        }

        const formCard = document.getElementById('card-form-workout-schedule');
        if (formCard) {
            formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            formCard.style.boxShadow = '0 0 0 4px rgba(124, 58, 237, 0.4)';
            setTimeout(() => {
                formCard.style.boxShadow = '';
            }, 2500);
        }

        this.showToast(`Metode "${metodeNama}" dipilih. Periksa jam & klik Simpan.`);
    }

    showToast(message) {
        const toast = document.getElementById('app-toast');
        if (!toast) return;
        toast.innerText = message;
        toast.style.display = 'block';
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
            toast.style.display = 'none';
        }, 3500);
    }

    // =============================================================
    // CRUD LOG BIOLOGIS (TAMBAH, EDIT, HAPUS)
    // =============================================================
    startEditBioLog(id) {
        const bio = this.data.bioLogs.find(b => b.id === id);
        if (!bio) return;

        this.editingBioLogId = id;
        document.getElementById('bio-edit-id').value = id;
        document.getElementById('bio-tgl').value = bio.tanggal || '';
        document.getElementById('bio-sesi').value = bio.sesi || 'Sesi A: Dada, Bahu & Six-Pack';
        const bioMetode = document.getElementById('bio-metode');
        if (bioMetode) bioMetode.value = bio.metode_latihan || 'Adaptasi 70% Kemampuan (Minggu I - Hindari Failure)';
        document.getElementById('bio-patuh').value = bio.patuh || 'Selesai Penuh (100%)';
        document.getElementById('bio-vacuum').value = bio.vacuum || '5 set x 15 detik';
        document.getElementById('bio-hang').value = bio.hang || 'Ya (Dead Hang 3x30s & Child)';
        document.getElementById('bio-air').value = bio.air || 2800;
        document.getElementById('bio-elektrolit').value = bio.elektrolit || 'Ya';
        document.getElementById('bio-mm').value = bio.makanMalam || '19:15';
        document.getElementById('bio-nocarb').value = bio.noCarb || 'Ya';
        document.getElementById('bio-tidur').value = bio.jamTidur || '21:45';
        document.getElementById('bio-bangun').value = bio.jamBangun || '05:30';
        document.getElementById('bio-sensasi').value = bio.sensasi || 'Hangat / Pegal Termogenesis (Normal)';
        document.getElementById('bio-perut').value = bio.lingkarPerut || '';
        document.getElementById('bio-bb').value = bio.beratBadan || '';
        document.getElementById('bio-flag').value = bio.redFlag || 'Aman & Terkendali';
        document.getElementById('bio-note').value = bio.catatan || '';

        document.getElementById('title-form-bio').innerHTML = '✏️ Edit Log Rekonstruksi Biologis';
        document.getElementById('btn-submit-bio').innerHTML = '💾 Simpan Perubahan Log Biologis';
        document.getElementById('btn-submit-bio').className = 'btn btn-green';
        document.getElementById('btn-cancel-bio-edit').style.display = 'inline-flex';
        document.getElementById('badge-edit-mode-bio').style.display = 'inline-block';

        const formCard = document.getElementById('card-form-bio');
        if (formCard) formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    cancelEditBioLog() {
        this.editingBioLogId = null;
        document.getElementById('form-add-bio').reset();
        document.getElementById('bio-edit-id').value = '';
        document.getElementById('title-form-bio').innerHTML = '🧬 Rekam Parameter Rekonstruksi Tubuh Harian';
        document.getElementById('btn-submit-bio').innerHTML = '🧬 Simpan Log Biologis & Sinkron Cloud';
        document.getElementById('btn-submit-bio').className = 'btn btn-green';
        document.getElementById('btn-cancel-bio-edit').style.display = 'none';
        document.getElementById('badge-edit-mode-bio').style.display = 'none';

        const todayStr = new Date().toISOString().split('T')[0];
        document.getElementById('bio-tgl').value = todayStr;
        document.getElementById('bio-air').value = '2800';
        const bioMetode = document.getElementById('bio-metode');
        if (bioMetode) bioMetode.value = 'Adaptasi 70% Kemampuan (Minggu I - Hindari Failure)';
    }

    async handleSaveBioLog() {
        const tgl = document.getElementById('bio-tgl').value;
        const sesi = document.getElementById('bio-sesi').value;
        const metode = document.getElementById('bio-metode') ? document.getElementById('bio-metode').value : 'Adaptasi 70% Kemampuan (Minggu I - Hindari Failure)';
        const patuh = document.getElementById('bio-patuh').value;
        const vacuum = document.getElementById('bio-vacuum').value;
        const hang = document.getElementById('bio-hang').value;
        const air = parseInt(document.getElementById('bio-air').value || '2500');
        const el = document.getElementById('bio-elektrolit').value;
        const mm = document.getElementById('bio-mm').value;
        const nocarb = document.getElementById('bio-nocarb').value;
        const tidur = document.getElementById('bio-tidur').value;
        const bangun = document.getElementById('bio-bangun').value;
        const sensasi = document.getElementById('bio-sensasi').value;
        const perut = parseFloat(document.getElementById('bio-perut').value || '0');
        const bb = parseFloat(document.getElementById('bio-bb').value || '0');
        const flag = document.getElementById('bio-flag').value;
        const note = document.getElementById('bio-note').value;

        const hari = this.getDayName(tgl);
        const durasiTidur = this.calculateSleep(tidur, bangun);
        const jedaTidur = this.calculateSleep(mm, tidur);

        let puncakHgh = 'Terlambat';
        if (tidur) {
            const [th] = tidur.split(':').map(Number);
            if (th >= 19 && th <= 22) {
                puncakHgh = 'Ya (HGH Optimal)';
            }
        }

        if (flag === 'Red Flag Medis (Periksa)' || sensasi.includes('Nyeri Tajam')) {
            alert('PERINGATAN RED FLAG MEDIS: Anda memilih gejala nyeri tajam atau indikasi medis. Segera lakukan evaluasi medis atau hubungi dokter sesuai batas aman protokol!');
        }

        const logId = this.editingBioLogId ? this.editingBioLogId : Date.now().toString();

        const newBio = {
            id: logId,
            tanggal: tgl,
            hari,
            sesi,
            metode_latihan: metode,
            patuh,
            vacuum,
            hang,
            air,
            elektrolit: el,
            makanMalam: mm,
            jedaTidur,
            noCarb: nocarb,
            jamTidur: tidur,
            jamBangun: bangun,
            durasiTidur,
            puncakHgh,
            sensasi,
            lingkarPerut: perut,
            beratBadan: bb,
            redFlag: flag,
            catatan: note
        };

        if (this.editingBioLogId) {
            const idx = this.data.bioLogs.findIndex(b => b.id === this.editingBioLogId);
            if (idx >= 0) {
                this.data.bioLogs[idx] = newBio;
            }
            this.cancelEditBioLog();
        } else {
            const existingIdx = this.data.bioLogs.findIndex(b => b.tanggal === tgl);
            if (existingIdx >= 0) {
                this.data.bioLogs[existingIdx] = newBio;
            } else {
                this.data.bioLogs.unshift(newBio);
            }
        }

        this.data.todayWater = air;
        this.saveState();
        this.renderBioLogs();
        this.renderHydration();
        this.renderDashboard();

        if (window.supabaseService) {
            await window.supabaseService.upsertBioLog(newBio);
        }

        alert('Log Biologis berhasil disimpan dan disinkronkan ke Supabase Cloud!');
    }

    async deleteBioLog(id) {
        const bio = this.data.bioLogs.find(b => b.id === id);
        const tgl = bio ? `pada tanggal ${bio.tanggal}` : '';
        if (confirm(`Apakah Anda yakin ingin menghapus catatan biologis ${tgl}?`)) {
            if (this.editingBioLogId === id) this.cancelEditBioLog();
            this.data.bioLogs = this.data.bioLogs.filter(b => b.id !== id);
            this.saveState();
            this.renderBioLogs();
            this.renderDashboard();

            if (window.supabaseService) {
                await window.supabaseService.deleteBioLog(id);
            }
        }
    }

    // =============================================================
    // CHECKLIST HARIAN (MAKAN & LATIHAN)
    // =============================================================
    toggleMealChecklist(index) {
        const todayStr = new Date().toISOString().split('T')[0];
        if (!this.data.mealChecklists) this.data.mealChecklists = {};
        if (!this.data.mealChecklists[todayStr]) this.data.mealChecklists[todayStr] = {};

        this.data.mealChecklists[todayStr][index] = !this.data.mealChecklists[todayStr][index];
        this.saveState();
        this.renderDailyChecklists();
    }

    toggleWorkoutChecklist(index) {
        const todayStr = new Date().toISOString().split('T')[0];
        if (!this.data.workoutChecklists) this.data.workoutChecklists = {};
        if (!this.data.workoutChecklists[todayStr]) this.data.workoutChecklists[todayStr] = {};

        this.data.workoutChecklists[todayStr][index] = !this.data.workoutChecklists[todayStr][index];
        this.saveState();
        this.renderDailyChecklists();
    }

    renderDailyChecklists() {
        const todayStr = new Date().toISOString().split('T')[0];
        const dayName = this.getDayName(todayStr) || 'Senin';
        if (!this.data.mealChecklists) this.data.mealChecklists = {};
        if (!this.data.workoutChecklists) this.data.workoutChecklists = {};

        const mCheck = this.data.mealChecklists[todayStr] || {};
        const wCheck = this.data.workoutChecklists[todayStr] || {};

        // 1. Checklist Makan
        const mContainer = document.getElementById('daily-meal-checklist-container');
        const mCounter = document.getElementById('meal-checklist-counter');
        if (mContainer && window.MASTER_PROTOKOL) {
            const meals = window.MASTER_PROTOKOL.ritmeMakan;
            let doneCount = 0;

            mContainer.innerHTML = meals.map((m, idx) => {
                const isChecked = !!mCheck[idx];
                if (isChecked) doneCount++;
                return `
                    <div style="display: flex; align-items: flex-start; gap: 8px; padding: 6px 8px; border-radius: 6px; background: ${isChecked ? '#ecfdf5' : '#f8fafc'}; border: 1px solid ${isChecked ? '#a7f3d0' : '#e2e8f0'};">
                        <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="window.app.toggleMealChecklist(${idx})" style="margin-top: 3px; cursor: pointer; accent-color: var(--primary-green);">
                        <div style="flex: 1;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <strong style="color: ${isChecked ? '#15803d' : 'var(--text-primary)'};">${m.icon} ${m.jam} — ${m.fase}</strong>
                                <span style="font-size: 10px; color: var(--text-secondary);">${m.komposisi}</span>
                            </div>
                            <div style="color: var(--text-secondary); margin-top: 2px;">${m.menuUtama}</div>
                        </div>
                    </div>
                `;
            }).join('');

            if (mCounter) mCounter.innerText = `${doneCount} / ${meals.length} Tuntas`;
        }

        // 2. Checklist Latihan Hari Ini
        const wContainer = document.getElementById('daily-workout-checklist-container');
        const wBadge = document.getElementById('workout-day-badge');
        if (wContainer && window.MASTER_PROTOKOL) {
            const todayWorkout = window.MASTER_PROTOKOL.jadwalLatihan.find(w => w.hari === dayName) || window.MASTER_PROTOKOL.jadwalLatihan[0];
            if (wBadge) wBadge.innerText = `${todayWorkout.hari} (${todayWorkout.sesi.split(':')[0]})`;

            wContainer.innerHTML = todayWorkout.gerakan.map((g, idx) => {
                const isChecked = !!wCheck[idx];
                return `
                    <div style="display: flex; align-items: flex-start; gap: 8px; padding: 6px 8px; border-radius: 6px; background: ${isChecked ? '#eff6ff' : '#f8fafc'}; border: 1px solid ${isChecked ? '#bfdbfe' : '#e2e8f0'};">
                        <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="window.app.toggleWorkoutChecklist(${idx})" style="margin-top: 3px; cursor: pointer; accent-color: var(--primary-navy);">
                        <div style="flex: 1;">
                            <div style="display: flex; justify-content: space-between;">
                                <strong style="color: ${isChecked ? '#1d4ed8' : 'var(--text-primary)'};">${g.nama}</strong>
                                <span class="badge ${isChecked ? 'badge-success' : 'badge-neutral'}">${g.porsi}</span>
                            </div>
                            <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">${g.tujuan}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    // =============================================================
    // RENDER TAB: JADWAL & MENU MAKAN
    // =============================================================
    renderMealTimeline() {
        const container = document.getElementById('container-timeline-makan');
        if (!container || !window.MASTER_PROTOKOL) return;

        container.innerHTML = window.MASTER_PROTOKOL.ritmeMakan.map(m => `
            <div style="display: flex; gap: 14px; padding: 14px; border-radius: 10px; background: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <div style="font-size: 28px; line-height: 1; padding: 6px 0;">${m.icon}</div>
                <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 4px;">
                        <div style="font-weight: 800; color: var(--primary-green); font-size: 1rem;">${m.jam} — ${m.fase}</div>
                        <span class="badge badge-info">${m.komposisi}</span>
                    </div>
                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px; font-size: 0.9rem;">
                        🍽️ Menu: ${m.menuUtama}
                    </div>
                    <div style="font-size: 0.83rem; color: var(--text-secondary); margin-bottom: 4px;">
                        🔬 <strong>Manfaat Biologis:</strong> ${m.manfaatBiologis}
                    </div>
                    <div style="font-size: 0.8rem; color: var(--primary-navy); background: #f1f5f9; padding: 4px 8px; border-radius: 4px; display: inline-block;">
                        ⚡ Pendamping: ${m.aktivitasPendamping}
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderWeeklyMenu() {
        const container = document.getElementById('container-menu-mingguan');
        if (!container || !window.MASTER_PROTOKOL) return;

        container.innerHTML = window.MASTER_PROTOKOL.menuMingguan.map(wm => `
            <div class="card" style="margin-bottom: 0; border-left: 4px solid var(--primary-green); padding: 14px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <h4 style="color: var(--primary-green); font-weight: 800; margin: 0;">📅 ${wm.hari}: ${wm.tema}</h4>
                    <span class="badge badge-neutral">${wm.karbo}</span>
                </div>
                <p style="font-size: 0.88rem; font-weight: 600; margin: 4px 0;">🍗 ${wm.fokusLauk}</p>
                <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 6px;">💡 ${wm.manfaat}</p>
                <div style="font-size: 0.78rem; font-weight: bold; color: var(--primary-navy);">💧 Target Air: ${wm.targetAir}</div>
            </div>
        `).join('');
    }

    // =============================================================
    // RENDER TAB: JADWAL & METODE LATIHAN LENGKAP
    // =============================================================
    renderWorkoutDay(dayName) {
        this.selectedWorkoutDay = dayName;
        document.querySelectorAll('.btn-day-filter').forEach(btn => {
            if (btn.getAttribute('data-day') === dayName) {
                btn.className = 'btn btn-sm btn-primary btn-day-filter';
            } else {
                btn.className = 'btn btn-sm btn-outline btn-day-filter';
            }
        });

        const container = document.getElementById('workout-day-detail-container');
        if (!container || !window.MASTER_PROTOKOL) return;

        const w = window.MASTER_PROTOKOL.jadwalLatihan.find(item => item.hari === dayName);
        if (!w) return;

        container.innerHTML = `
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
                    <h3 style="color: var(--primary-navy); margin: 0; font-size: 1.15rem; font-weight: 800;">${w.hari} — ${w.sesi}</h3>
                    <span class="badge badge-info">⏰ ${w.waktu}</span>
                </div>
                <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 4px;">
                    🎯 <strong>Fokus Otot:</strong> ${w.fokusOtot}
                </div>
                <div style="font-size: 0.85rem; color: var(--accent-orange); font-weight: 600;">
                    ⚡ <strong>Intensitas:</strong> ${w.intensitas}
                </div>
            </div>

            <h4 style="font-size: 0.95rem; font-weight: 800; color: var(--primary-navy); margin-bottom: 12px;">Daftar Gerakan & Metode Pelaksanaan:</h4>
            <div class="space-y-3">
                ${w.gerakan.map((g, idx) => `
                    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-primary);">${idx + 1}. ${g.nama}</div>
                            <span class="badge badge-success" style="font-size: 0.8rem;">${g.porsi}</span>
                        </div>
                        <div style="font-size: 0.85rem; color: var(--text-primary); margin-bottom: 6px; line-height: 1.5; background: #f8fafc; padding: 8px 10px; border-radius: 6px;">
                            <strong>Metode & Cara Eksekusi:</strong> ${g.metode}
                        </div>
                        <div style="font-size: 0.8rem; color: var(--primary-green); font-weight: 600;">
                            ✨ Target Biologis: ${g.tujuan}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderGerakanKunci() {
        const container = document.getElementById('container-gerakan-kunci');
        if (!container || !window.MASTER_PROTOKOL) return;

        container.innerHTML = window.MASTER_PROTOKOL.gerakanKunci.map(gk => `
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <h4 style="color: var(--primary-green); font-weight: 800; margin-bottom: 4px; font-size: 0.95rem;">${gk.nama}</h4>
                <div style="font-size: 0.78rem; font-weight: 700; color: var(--accent-orange); margin-bottom: 8px;">Target: ${gk.target}</div>
                <div style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 8px; line-height: 1.4;">${gk.tujuan}</div>
                <div style="background: #f8fafc; padding: 10px; border-radius: 6px; font-size: 0.8rem; color: var(--text-primary); line-height: 1.5; white-space: pre-line;">${gk.instruksi}</div>
            </div>
        `).join('');
    }

    renderMetodeCatalog() {
        const container = document.getElementById('container-katalog-metode');
        if (!container || !window.MASTER_PROTOKOL || !window.MASTER_PROTOKOL.metodeLatihanPilihan) return;

        container.innerHTML = window.MASTER_PROTOKOL.metodeLatihanPilihan.map(m => `
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 6px;">
                        <h4 style="color: var(--primary-navy); font-weight: 800; margin: 0; font-size: 0.92rem;">${m.nama}</h4>
                        <span class="badge ${m.badgeClass}">${m.kategori}</span>
                    </div>
                    <div style="display: flex; gap: 12px; margin-bottom: 8px; font-size: 0.78rem; flex-wrap: wrap;">
                        <span style="color: var(--primary-green); font-weight: 700;">⏱️ Tempo: ${m.tempo}</span>
                        <span style="color: var(--accent-orange); font-weight: 700;">☕ Istirahat: ${m.istirahat}</span>
                    </div>
                    <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px;">${m.deskripsi}</p>
                </div>
                <div style="display: flex; gap: 8px; border-top: 1px solid #f1f5f9; padding-top: 10px; flex-wrap: wrap;">
                    <button class="btn btn-sm btn-outline" style="font-size: 0.75rem; flex: 1; min-width: 130px;" onclick="window.app.applyMetodeToTask('${m.nama}')">📝 Pilih untuk Jurnal Kerja</button>
                    <button class="btn btn-sm btn-green" style="font-size: 0.75rem; flex: 1; min-width: 130px;" onclick="window.app.applyMetodeToBio('${m.nama}')">🧬 Pilih untuk Log Biologis</button>
                    <button class="btn btn-sm" style="font-size: 0.75rem; flex: 1; min-width: 130px; background: #7c3aed; color: #ffffff;" onclick="window.app.scheduleMetodeWithTime('${m.nama}')">⏰ Atur Jam & Jadwalkan</button>
                </div>
            </div>
        `).join('');
    }

    applyMetodeToTask(metodeNama) {
        const taskMetodeSelect = document.getElementById('task-metode');
        if (taskMetodeSelect) {
            taskMetodeSelect.value = metodeNama;
            const taskKat = document.getElementById('task-kategori');
            if (taskKat && !metodeNama.includes('Non-Latihan')) {
                taskKat.value = 'Latihan & Olah Tubuh';
            }
        }
        if (typeof window.switchTab === 'function') {
            window.switchTab('jurnal-kerja');
        }
        const formCard = document.getElementById('card-form-task');
        if (formCard) formCard.scrollIntoView({ behavior: 'smooth' });
    }

    applyMetodeToBio(metodeNama) {
        const bioMetodeSelect = document.getElementById('bio-metode');
        if (bioMetodeSelect) {
            bioMetodeSelect.value = metodeNama;
        }
        if (typeof window.switchTab === 'function') {
            window.switchTab('log-biologis');
        }
        const formCard = document.getElementById('card-form-bio');
        if (formCard) formCard.scrollIntoView({ behavior: 'smooth' });
    }

    renderBatasMedis() {
        if (!window.MASTER_PROTOKOL || !window.MASTER_PROTOKOL.batasMedis) return;
        const bm = window.MASTER_PROTOKOL.batasMedis;

        const elTuntas = document.getElementById('medis-tanda-tuntas');
        const elRed = document.getElementById('medis-red-flags');
        const elPunggung = document.getElementById('medis-penanganan');

        if (elTuntas) elTuntas.innerText = bm.tandaTuntas;
        if (elRed) elRed.innerText = bm.redFlags;
        if (elPunggung) elPunggung.innerText = bm.penangananPunggung;
    }

    renderJendelaRegenerasi() {
        const container = document.getElementById('protokol-jendela-container');
        if (!container || !window.MASTER_PROTOKOL) return;

        container.innerHTML = window.MASTER_PROTOKOL.jendelaRegenerasi.map(j => `
            <div class="card" style="margin-bottom: 12px; border-left: 4px solid var(--primary-green); padding: 14px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <h4 style="color: var(--primary-green); margin: 0; font-weight: 800;">${j.dimensi}</h4>
                    <span class="badge badge-info">${j.waktu}</span>
                </div>
                <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0;">${j.proses}</p>
            </div>
        `).join('');
    }

    // =============================================================
    // RENDER TABEL & DASHBOARD
    // =============================================================
    renderHydration() {
        const val = this.data.todayWater || 0;
        const target = this.data.targetWater || 3000;
        const pct = Math.min(100, Math.round((val / target) * 100));

        const fillEl = document.getElementById('hydration-progress-fill');
        const textEl = document.getElementById('hydration-text-value');
        if (fillEl) fillEl.style.width = `${pct}%`;
        if (textEl) textEl.innerText = `${val.toLocaleString()} ml / ${target.toLocaleString()} ml (${pct}%)`;
    }

    renderTasks() {
        const tbody = document.getElementById('task-table-body');
        if (!tbody) return;

        if (this.data.tasks.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--text-muted); padding: 24px;">Belum ada tugas dicatat. Tambahkan tugas pertama Anda di atas.</td></tr>`;
            return;
        }

        tbody.innerHTML = this.data.tasks.map(t => {
            let badgeClass = 'badge-neutral';
            if (t.status === 'Selesai') badgeClass = 'badge-success';
            else if (t.status === 'Sedang Berjalan') badgeClass = 'badge-warning';
            else if (t.status === 'Tertunda') badgeClass = 'badge-danger';

            let prioBadge = t.prioritas === 'Tinggi' ? '<span class="badge badge-danger">Tinggi</span>' : `<span class="badge badge-neutral">${t.prioritas}</span>`;

            let metodeBadge = '<span style="color:var(--text-muted); font-size:0.8rem;">-</span>';
            if (t.metode_latihan && t.metode_latihan !== 'Non-Latihan Fisik (Aktivitas Kerja / Harian)') {
                metodeBadge = `<span class="badge" style="background:#f3e8ff; color:#7e22ce; border:1px solid #d8b4fe; font-size:0.75rem; white-space:normal; text-align:left; display:inline-block; max-width:180px; line-height:1.3;">🏋️ ${t.metode_latihan}</span>`;
            } else if (t.metode_latihan) {
                metodeBadge = `<span class="badge badge-neutral" style="font-size:0.75rem;">${t.metode_latihan}</span>`;
            } else if (t.kategori === 'Latihan & Olah Tubuh') {
                metodeBadge = `<span class="badge badge-warning" style="font-size:0.72rem;">Belum Dipilih</span>`;
            }

            return `
                <tr>
                    <td><strong>${t.tanggal}</strong><br><small style="color:var(--text-secondary)">${t.hari || ''}</small></td>
                    <td>${t.mulai} - ${t.selesai}<br><small style="color:var(--primary-navy)"><strong>${t.durasi} Jam</strong></small></td>
                    <td><span class="badge badge-info">${t.kategori}</span></td>
                    <td><strong>${t.aktivitas}</strong><br><small style="color:var(--text-secondary)">${t.output || '-'}</small></td>
                    <td>${metodeBadge}</td>
                    <td>${prioBadge}</td>
                    <td><span class="badge ${badgeClass}">${t.status}</span></td>
                    <td style="text-align:center;">⭐ ${t.fokus}/5</td>
                    <td><small>${t.catatan || '-'}</small></td>
                    <td style="text-align:center;">
                        <div style="display:flex; gap:6px; justify-content:center;">
                            <button class="btn btn-sm btn-outline" style="color:var(--primary-navy); border-color:#cbd5e1;" onclick="window.app.startEditTask('${t.id}')">✏️ Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="window.app.deleteTask('${t.id}')">🗑️ Hapus</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        const totalJam = this.data.tasks.reduce((acc, cur) => acc + parseFloat(cur.durasi || 0), 0);
        const totalTugas = this.data.tasks.length;
        const selesai = this.data.tasks.filter(t => t.status === 'Selesai').length;
        const rasio = totalTugas > 0 ? Math.round((selesai / totalTugas) * 100) : 0;

        const elJam = document.getElementById('kpi-total-jam');
        const elTotal = document.getElementById('kpi-total-tugas');
        const elSelesai = document.getElementById('kpi-tugas-selesai');
        const elRasio = document.getElementById('kpi-rasio-selesai');

        if (elJam) elJam.innerText = `${totalJam.toFixed(1)} Jam`;
        if (elTotal) elTotal.innerText = totalTugas;
        if (elSelesai) elSelesai.innerText = selesai;
        if (elRasio) elRasio.innerText = `${rasio}%`;
    }

    renderBioLogs() {
        const tbody = document.getElementById('bio-table-body');
        if (!tbody) return;

        if (this.data.bioLogs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="11" style="text-align: center; color: var(--text-muted); padding: 24px;">Belum ada log biologis dicatat.</td></tr>`;
            return;
        }

        tbody.innerHTML = this.data.bioLogs.map(b => {
            let hghBadge = (b.puncakHgh && b.puncakHgh.includes('Ya'))
                ? '<span class="badge badge-success">Puncak HGH</span>' 
                : '<span class="badge badge-warning">Terlambat</span>';

            let flagBadge = b.redFlag === 'Aman & Terkendali'
                ? '<span class="badge badge-success">Aman</span>'
                : '<span class="badge badge-danger">Red Flag</span>';

            let bioMetodeBadge = b.metode_latihan 
                ? `<div style="margin-top:4px;"><span class="badge" style="background:#f3e8ff; color:#6b21a8; border:1px solid #d8b4fe; font-size:0.7rem; white-space:normal; text-align:left; display:inline-block; line-height:1.2;">⚡ ${b.metode_latihan}</span></div>` 
                : '';

            return `
                <tr>
                    <td><strong>${b.tanggal}</strong><br><small>${b.hari || ''}</small></td>
                    <td><strong>${b.sesi}</strong><br><small style="color:var(--primary-green); font-weight:700;">${b.patuh}</small>${bioMetodeBadge}</td>
                    <td>💧 ${(b.air || 0).toLocaleString()} ml<br><small>Garam: ${b.elektrolit}</small></td>
                    <td>${b.vacuum}<br><small>${b.hang}</small></td>
                    <td>${b.makanMalam}<br><small>Jeda: ${b.jedaTidur} Jam (No-Carb: ${b.noCarb})</small></td>
                    <td>${b.jamTidur} - ${b.jamBangun}<br><strong>${b.durasiTidur} Jam</strong></td>
                    <td>${hghBadge}</td>
                    <td>Perut: <strong>${b.lingkarPerut || '-'} cm</strong><br>BB: ${b.beratBadan || '-'} kg</td>
                    <td><small>${b.sensasi}</small></td>
                    <td>${flagBadge}</td>
                    <td style="text-align:center;">
                        <div style="display:flex; gap:6px; justify-content:center;">
                            <button class="btn btn-sm btn-outline" style="color:var(--primary-green); border-color:#a7f3d0;" onclick="window.app.startEditBioLog('${b.id}')">✏️ Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="window.app.deleteBioLog('${b.id}')">🗑️ Hapus</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderDashboard() {
        const totalJam = this.data.tasks.reduce((acc, cur) => acc + parseFloat(cur.durasi || 0), 0);
        const avgAir = this.data.bioLogs.length > 0
            ? Math.round(this.data.bioLogs.reduce((acc, cur) => acc + (cur.air || 0), 0) / this.data.bioLogs.length)
            : 0;

        const avgTidur = this.data.bioLogs.length > 0
            ? (this.data.bioLogs.reduce((acc, cur) => acc + parseFloat(cur.durasiTidur || 0), 0) / this.data.bioLogs.length).toFixed(1)
            : '0.0';

        const patuhCutOff = this.data.bioLogs.length > 0
            ? Math.round((this.data.bioLogs.filter(b => b.noCarb === 'Ya').length / this.data.bioLogs.length) * 100)
            : 0;

        const hghRate = this.data.bioLogs.length > 0
            ? Math.round((this.data.bioLogs.filter(b => b.puncakHgh && b.puncakHgh.includes('Ya')).length / this.data.bioLogs.length) * 100)
            : 0;

        const avgFokus = this.data.tasks.length > 0
            ? (this.data.tasks.reduce((acc, cur) => acc + parseInt(cur.fokus || 5), 0) / this.data.tasks.length).toFixed(1)
            : '0.0';

        const elTotalJam = document.getElementById('dash-total-jam');
        const elAvgAir = document.getElementById('dash-avg-air');
        const elAvgTidur = document.getElementById('dash-avg-tidur');
        const elCutoff = document.getElementById('dash-cutoff-rate');
        const elHgh = document.getElementById('dash-hgh-rate');
        const elFokus = document.getElementById('dash-avg-fokus');

        if (elTotalJam) elTotalJam.innerText = `${totalJam.toFixed(1)} Jam`;
        if (elAvgAir) elAvgAir.innerText = `${avgAir.toLocaleString()} ml`;
        if (elAvgTidur) elAvgTidur.innerText = `${avgTidur} Jam`;
        if (elCutoff) elCutoff.innerText = `${patuhCutOff}%`;
        if (elHgh) elHgh.innerText = `${hghRate}%`;
        if (elFokus) elFokus.innerText = `${avgFokus} / 5.0`;

        const catMap = {};
        this.data.tasks.forEach(t => {
            const k = t.kategori || 'Lainnya';
            catMap[k] = (catMap[k] || 0) + parseFloat(t.durasi || 0);
        });

        const tbodyCat = document.getElementById('dash-cat-tbody');
        if (tbodyCat) {
            tbodyCat.innerHTML = Object.entries(catMap).map(([cat, hours]) => {
                const pct = totalJam > 0 ? Math.round((hours / totalJam) * 100) : 0;
                return `
                    <tr>
                        <td><strong>${cat}</strong></td>
                        <td style="text-align:right;">${hours.toFixed(2)} Jam</td>
                        <td style="text-align:right;">
                            <div style="display:flex; align-items:center; gap:8px; justify-content:flex-end;">
                                <div style="width:70px; height:8px; background:#e2e8f0; border-radius:4px; overflow:hidden;">
                                    <div style="width:${pct}%; height:100%; background:var(--primary-navy);"></div>
                                </div>
                                <span>${pct}%</span>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }

    // =============================================================
    // TAB UTAMA (DEPAN): DASHBOARD JADWAL TERPADU & SUMMARY REPORT
    // =============================================================
    renderSummaryDashboard() {
        const dateInput = document.getElementById('summary-selected-date');
        if (dateInput) {
            dateInput.value = this.selectedSummaryDate;
        }

        const dateObj = new Date(this.selectedSummaryDate + 'T00:00:00');
        const dayName = isNaN(dateObj.getDay()) ? 'Hari' : ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][dateObj.getDay()];
        const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const formattedDate = !isNaN(dateObj.getTime())
            ? `${dayName}, ${dateObj.getDate()} ${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`
            : this.selectedSummaryDate;

        // 1. GATHER ALL EVENTS FOR SELECTED DATE
        const rawTasks = (this.data.tasks || []).filter(t => t.tanggal === this.selectedSummaryDate);
        const unifiedEvents = [];

        // Masukkan task user
        rawTasks.forEach(t => {
            let catType = 'Kerja';
            if (t.kategori === 'Latihan & Olah Tubuh') catType = 'Latihan';
            else if (t.kategori.includes('Nutrisi') || t.kategori.includes('Makan')) catType = 'Nutrisi';
            else if (t.kategori.includes('Biologis') || t.kategori.includes('Kesehatan')) catType = 'Biologis';
            else if (t.kategori.includes('Salat') || t.kategori.includes('Ibadah')) catType = 'Salat';

            unifiedEvents.push({
                id: t.id,
                mulai: t.mulai,
                selesai: t.selesai,
                durasi: t.durasi || this.calculateDuration(t.mulai, t.selesai),
                kategori: catType,
                kategoriLabel: t.kategori,
                aktivitas: t.aktivitas,
                output: t.output || '',
                metode_latihan: t.metode_latihan || '',
                prioritas: t.prioritas || 'Sedang',
                status: t.status || 'Selesai',
                fokus: t.fokus || 5,
                catatan: t.catatan || '',
                isUserTask: true,
                icon: catType === 'Kerja' ? '💼' : (catType === 'Latihan' ? '🏋️' : (catType === 'Nutrisi' ? '🍽️' : (catType === 'Salat' ? '🕌' : '🧬')))
            });
        });

        // Waktu Salat Astronomis Realtime
        let prayerTimes = null;
        if (window.prayerManager) {
            prayerTimes = window.prayerManager.calculate(this.selectedSummaryDate);
        }

        // HANYA jika jadwal hari ini sama sekali belum memiliki agenda salat:
        // Tampilkan 5 waktu salat astronomis sebagai rujukan fardhu di timeline
        const hasSalatInTasks = unifiedEvents.some(u => u.kategori === 'Salat');
        if (!hasSalatInTasks && prayerTimes) {
            const prayerEvents = [
                { id: 'salat-subuh', mulai: prayerTimes.subuh, selesai: prayerTimes.subuhSelesai, durasi: '0.50', kategori: 'Salat', aktivitas: 'Salat Subuh & Dzikir Fajar', output: 'Membangun ketenangan spiritual, kejernihan batin, dan niat fajar', icon: '🌅' },
                { id: 'salat-dzuhur', mulai: prayerTimes.dzuhur, selesai: prayerTimes.dzuhurSelesai, durasi: '0.50', kategori: 'Salat', aktivitas: 'Salat Dzuhur & Jeda Istirahat Mental', output: 'Reset beban kognitif tengah hari & pembaruan fokus', icon: '☀️' },
                { id: 'salat-ashar', mulai: prayerTimes.ashar, selesai: prayerTimes.asharSelesai, durasi: '0.50', kategori: 'Salat', aktivitas: 'Salat Ashar & Transisi Energi Sore', output: 'Persiapan transisi mental sebelum agenda sore / latihan', icon: '🌤️' },
                { id: 'salat-maghrib', mulai: prayerTimes.maghrib, selesai: prayerTimes.maghribSelesai, durasi: '0.50', kategori: 'Salat', aktivitas: 'Salat Maghrib & Refleksi Senja', output: 'Peralihan ritme sirkadian siang ke malam & rasa syukur', icon: '🌇' },
                { id: 'salat-isya', mulai: prayerTimes.isya, selesai: prayerTimes.isyaSelesai, durasi: '0.50', kategori: 'Salat', aktivitas: 'Salat Isya Berjamaah & Doa Malam', output: 'Menenangkan gelombang otak menjelang relaksasi & tidur', icon: '🌙' }
            ];

            prayerEvents.forEach(p => {
                unifiedEvents.push({
                    id: p.id,
                    mulai: p.mulai,
                    selesai: p.selesai,
                    durasi: p.durasi,
                    kategori: 'Salat',
                    kategoriLabel: 'Salat 5 Waktu & Spiritualitas',
                    aktivitas: p.aktivitas,
                    output: p.output,
                    metode_latihan: '',
                    prioritas: 'Tinggi',
                    status: 'Terjadwal',
                    fokus: 5,
                    catatan: `Jadwal Astronomis Realtime (${prayerTimes.cityName})`,
                    isUserTask: false,
                    icon: p.icon
                });
            });
        }

        // Urutkan secara kronologis (00:00 -> 23:59)
        unifiedEvents.sort((a, b) => this.timeToMinutes(a.mulai) - this.timeToMinutes(b.mulai));

        // 2. DETEKSI BENTROKAN JAM ANTAR SELURUH AGENDA HARIAN
        let totalConflictsCount = 0;
        for (let i = 0; i < unifiedEvents.length; i++) {
            unifiedEvents[i].conflictsWith = [];
            const startA = this.timeToMinutes(unifiedEvents[i].mulai);
            let endA = this.timeToMinutes(unifiedEvents[i].selesai);
            if (endA <= startA) endA += 1440;

            for (let j = 0; j < unifiedEvents.length; j++) {
                if (i === j) continue;
                const startB = this.timeToMinutes(unifiedEvents[j].mulai);
                let endB = this.timeToMinutes(unifiedEvents[j].selesai);
                if (endB <= startB) endB += 1440;

                // Overlap: startA < endB && endA > startB
                if (startA < endB && endA > startB) {
                    unifiedEvents[i].conflictsWith.push({
                        title: unifiedEvents[j].aktivitas,
                        mulai: unifiedEvents[j].mulai,
                        selesai: unifiedEvents[j].selesai,
                        kategori: unifiedEvents[j].kategori
                    });
                }
            }

            if (unifiedEvents[i].conflictsWith.length > 0) {
                totalConflictsCount++;
            }
        }

        // 3. UPDATE SCORECARD METRIK HARIAN
        const totalAgenda = unifiedEvents.length;
        const selesaiCount = unifiedEvents.filter(e => e.status === 'Selesai').length;
        const pctSelesai = totalAgenda > 0 ? Math.round((selesaiCount / totalAgenda) * 100) : 0;
        const totalHours = unifiedEvents.reduce((acc, cur) => acc + parseFloat(cur.durasi || 0), 0);

        const elTotalAgenda = document.getElementById('summary-kpi-total-agenda');
        const elTotalSub = document.getElementById('summary-kpi-total-subtext');
        const elSelesai = document.getElementById('summary-kpi-selesai');
        const elTotalJam = document.getElementById('summary-kpi-total-jam');
        const cardConflict = document.getElementById('summary-kpi-card-conflict');
        const statusConflict = document.getElementById('summary-kpi-conflict-status');
        const subtextConflict = document.getElementById('summary-kpi-conflict-subtext');
        const bannerConflict = document.getElementById('summary-conflict-banner');
        const bannerText = document.getElementById('summary-conflict-banner-text');

        if (elTotalAgenda) elTotalAgenda.innerText = totalAgenda;
        if (elTotalSub) elTotalSub.innerText = `${rawTasks.length} Tugas Mandiri • ${totalAgenda - rawTasks.length} Ritme Biologis`;
        if (elSelesai) elSelesai.innerText = `${selesaiCount} / ${totalAgenda} (${pctSelesai}%)`;
        if (elTotalJam) elTotalJam.innerText = `${totalHours.toFixed(1)} Jam`;

        if (totalConflictsCount === 0) {
            if (cardConflict) {
                cardConflict.className = 'kpi-card green';
                cardConflict.onclick = null;
            }
            if (statusConflict) statusConflict.innerText = '✅ 0 Bentrokan';
            if (subtextConflict) subtextConflict.innerText = 'Semua jam teratur rapi';
            if (bannerConflict) bannerConflict.style.display = 'none';
        } else {
            const numCollisions = Math.ceil(totalConflictsCount / 2);
            if (cardConflict) {
                cardConflict.className = 'kpi-card red';
                cardConflict.style.cursor = 'pointer';
                cardConflict.onclick = () => this.scrollToFirstConflict();
            }
            if (statusConflict) statusConflict.innerText = `⚠️ ${numCollisions} Bentrok Jam`;
            if (subtextConflict) subtextConflict.innerText = 'Klik untuk melihat jam tumpang tindih';
            if (bannerConflict) {
                bannerConflict.style.display = 'flex';
                if (bannerText) {
                    bannerText.innerText = `Terdeteksi ${numCollisions} pasangan jadwal yang bertabrakan pada jam yang sama di tanggal ${formattedDate}. Gunakan tombol 'Sesuaikan Jam' pada kartu bertanda merah untuk memisahkan jamnya.`;
                }
            }
        }

        // 4. RENDER TIMELINE TERPADU
        this.renderSummaryTimeline(unifiedEvents);

        // 5. RENDER DAILY EXECUTIVE SUMMARY REPORT
        this.renderDailySummaryReport(unifiedEvents, totalAgenda, selesaiCount, pctSelesai, totalHours, totalConflictsCount, formattedDate, prayerTimes);

        // 6. RENDER QUICK CHECKLIST
        this.renderSummaryChecklist();
    }

    renderSummaryTimeline(unifiedEvents) {
        const container = document.getElementById('unified-timeline-container');
        if (!container) return;

        // Apply category filter if active
        let displayEvents = unifiedEvents;
        if (this.timelineFilter && this.timelineFilter !== 'all') {
            displayEvents = unifiedEvents.filter(e => e.kategori === this.timelineFilter);
        }

        if (displayEvents.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 36px 20px; color: var(--text-muted); background: #f8fafc; border-radius: 10px; border: 1px dashed var(--border-color);">
                    <div style="font-size: 32px; margin-bottom: 8px;">📭</div>
                    <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Tidak Ada Agenda untuk Filter "${this.timelineFilter}"</div>
                    <p style="font-size: 0.85rem; margin: 0;">Silakan pilih filter lain atau gunakan tombol "Tambah Kerja" / "Jadwal Latihan" di atas.</p>
                </div>
            `;
            return;
        }

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const todayStr = now.toISOString().split('T')[0];
        const isToday = this.selectedSummaryDate === todayStr;

        container.innerHTML = displayEvents.map(e => {
            const hasConflict = e.conflictsWith && e.conflictsWith.length > 0;
            const startMins = this.timeToMinutes(e.mulai);
            let endMins = this.timeToMinutes(e.selesai);
            if (endMins <= startMins) endMins += 1440;
            const isLive = isToday && (currentMinutes >= startMins && currentMinutes <= endMins);

            let catClass = 'cat-kerja';
            let catBadge = '<span class="badge badge-primary">💼 Kerja</span>';
            if (e.kategori === 'Latihan') {
                catClass = 'cat-latihan';
                catBadge = '<span class="badge" style="background:#ede9fe; color:#6d28d9; border:1px solid #c4b5fd;">🏋️ Latihan</span>';
            } else if (e.kategori === 'Nutrisi') {
                catClass = 'cat-nutrisi';
                catBadge = '<span class="badge badge-warning">🍽️ Nutrisi</span>';
            } else if (e.kategori === 'Biologis') {
                catClass = 'cat-biologis';
                catBadge = '<span class="badge badge-success">🧬 Biologis</span>';
            } else if (e.kategori === 'Salat') {
                catClass = 'cat-salat';
                catBadge = '<span class="badge" style="background:#d1fae5; color:#065f46; border:1px solid #6ee7b7;">🕌 Salat 5 Waktu</span>';
            }

            let statusBadge = e.status === 'Selesai'
                ? '<span class="badge badge-success">✓ Selesai</span>'
                : (e.status === 'Sedang Berjalan' ? '<span class="badge badge-warning">⏳ Sedang Berjalan</span>' : '<span class="badge badge-neutral">Terjadwal</span>');

            let metodeBadge = '';
            if (e.metode_latihan && !e.metode_latihan.includes('Non-Latihan')) {
                metodeBadge = `<div style="margin-top: 4px;"><span class="badge" style="background:#f3e8ff; color:#7e22ce; border:1px solid #d8b4fe; font-size:0.75rem; white-space:normal; line-height:1.3;">⚡ Metode: ${e.metode_latihan}</span></div>`;
            }

            let conflictRibbon = '';
            if (hasConflict) {
                const confNames = e.conflictsWith.map(c => `"${c.title}" (${c.mulai}-${c.selesai})`).join(', ');
                conflictRibbon = `
                    <div class="conflict-alert-ribbon">
                        <div>⚠️ <strong>BENTROKAN JAM!</strong> Beririsan dengan ${confNames}</div>
                        <button class="btn btn-xs" style="background:#ffffff; border:1px solid #f87171; color:#b91c1c; font-weight:700; white-space:nowrap;" onclick="window.app.quickAdjustConflictTime('${e.id}')">✏️ Sesuaikan Jam</button>
                    </div>
                `;
            }

            let liveTag = isLive ? `<span class="live-pill"><span class="live-dot"></span> SEDANG BERLANGSUNG</span>` : '';

            let actionBtns = '';
            if (e.isUserTask) {
                actionBtns = `
                    <div style="display:flex; gap:6px; align-items:center; margin-top:10px; border-top:1px dashed #e2e8f0; padding-top:8px;">
                        <button class="btn btn-xs ${e.status === 'Selesai' ? 'btn-outline' : 'btn-green'}" onclick="window.app.toggleTaskStatusFromTimeline('${e.id}')">
                            ${e.status === 'Selesai' ? '↩️ Jadwalkan Lagi' : '✓ Selesaikan'}
                        </button>
                        <button class="btn btn-xs btn-outline" onclick="window.app.startEditTask('${e.id}')">✏️ Edit</button>
                        <button class="btn btn-xs btn-danger" onclick="window.app.deleteTask('${e.id}')">🗑️</button>
                    </div>
                `;
            } else {
                actionBtns = `
                    <div style="display:flex; gap:6px; align-items:center; margin-top:10px; border-top:1px dashed #e2e8f0; padding-top:8px; font-size:0.75rem; color:var(--text-secondary);">
                        <span>📖 Rujukan Protokol PDF • Jadwal Standar</span>
                    </div>
                `;
            }

            return `
                <div class="timeline-item">
                    <div class="timeline-time-col">
                        <div class="timeline-time-range">${e.mulai} - ${e.selesai}</div>
                        <div class="timeline-time-duration">${e.durasi} Jam</div>
                        ${liveTag ? `<div style="margin-top:4px;">${liveTag}</div>` : ''}
                    </div>
                    <div class="timeline-card-col">
                        <div class="timeline-card ${catClass} ${hasConflict ? 'has-conflict' : ''}" id="timeline-card-${e.id}">
                            ${conflictRibbon}
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; flex-wrap: wrap; margin-bottom: 6px;">
                                <div style="display: flex; align-items: center; gap: 6px;">
                                    <span style="font-size: 1.1rem;">${e.icon}</span>
                                    <h4 style="font-size: 0.98rem; font-weight: 800; color: var(--text-primary); margin: 0;">${e.aktivitas}</h4>
                                </div>
                                <div style="display: flex; gap: 6px; align-items: center;">
                                    ${catBadge}
                                    ${statusBadge}
                                </div>
                            </div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 4px;">
                                ${e.output || '-'}
                            </div>
                            ${metodeBadge}
                            ${e.catatan ? `<div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">📝 <em>${e.catatan}</em></div>` : ''}
                            ${actionBtns}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderDailySummaryReport(unifiedEvents, totalAgenda, selesaiCount, pctSelesai, totalHours, conflictsCount, formattedDate, prayerTimes) {
        const reportContainer = document.getElementById('daily-summary-report-content');
        if (!reportContainer) return;

        const workouts = unifiedEvents.filter(e => e.kategori === 'Latihan');
        const workTasks = unifiedEvents.filter(e => e.kategori === 'Kerja');
        const totalWorkHours = workTasks.reduce((acc, cur) => acc + parseFloat(cur.durasi || 0), 0);
        const workoutMetodes = workouts.map(w => w.metode_latihan || w.aktivitas).filter(Boolean).join(', ');

        const conflictText = conflictsCount === 0
            ? '✅ 0 Bentrokan Jam (Jadwal berjalan harmonis & teratur)'
            : `⚠️ ${Math.ceil(conflictsCount / 2)} Bentrokan Jam Terdeteksi (Perlu penyesuaian jam)`;

        const salatSection = prayerTimes
            ? `3. RITME SPIRITUAL (SALAT 5 WAKTU REALTIME):
• Lokasi Astronomis    : ${prayerTimes.cityName}
• Subuh   : ${prayerTimes.subuh} (Doa & Dzikir Pagi)
• Dzuhur  : ${prayerTimes.dzuhur} (Jeda Mental Tengah Hari)
• Ashar   : ${prayerTimes.ashar} (Transisi Energi Sore)
• Maghrib : ${prayerTimes.maghrib} (Refleksi Senja)
• Isya    : ${prayerTimes.isya} (Penutupan Ibadah Harian)`
            : `3. RITME SPIRITUAL (SALAT 5 WAKTU):
• Salat 5 waktu tersinkronisasi otomatis dengan waktu lokal.`;

        const reportText = `================================================
📊 EXECUTIVE DAILY BRIEF: JADWAL TERPADU
📅 Tanggal: ${formattedDate}
================================================

1. ALOKASI WAKTU & PRODUKTIVITAS:
• Total Agenda Terjadwal : ${totalAgenda} Kegiatan
• Tingkat Penyelesaian   : ${selesaiCount} / ${totalAgenda} Selesai (${pctSelesai}%)
• Akumulasi Durasi Kerja : ${totalWorkHours.toFixed(1)} Jam
• Status Anti-Bentrokan  : ${conflictText}

2. JADWAL LATIHAN & METODE FISIK:
• Sesi Terjadwal         : ${workouts.length > 0 ? workouts.map(w => w.aktivitas).join(' | ') : 'Sesi Pemulihan / Restorasi'}
• Metode yang Digunakan  : ${workoutMetodes || 'Tempo Terkontrol 2-1-1 & Isometrik Korset Perut'}

${salatSection}

4. RITME NUTRISI & AUTOFAGI:
• Hidrasi Pagi           : 04:45 - 05:15 (500 ml Air + Garam Himalaya)
• Sarapan Pembangun      : 05:30 - 06:15 (3 Telur Rebus & Karbo Kompleks)
• Makan Siang Utama      : 12:20 - 13:00 (Tinggi Protein & Sayur Bening)
• Nutrisi Pemulihan      : 17:20 - 17:45 (BCAA / Protein Cepat Serap)
• Cut-Off Makan Malam    : 18:30 - 19:00 (Strictly Tanpa Karbohidrat / Nasi)
• Dekompresi Fasia       : 21:00 - 21:30 (Dead Hang & Child's Pose)
• Jendela Tidur HGH      : 21:45 - Subuh (Deep Sleep 70-80% HGH)

5. AUDIT & REKOMENDASI SISTEM:
${conflictsCount === 0 
    ? '• Agenda harian sudah tersusun rapi secara kronologis tanpa tumpang tindih waktu.' 
    : '• Terdapat agenda yang bertabrakan pada jam pelaksanaan. Disarankan melakukan penyesuaian waktu pada kartu bertanda merah.'}
================================================`;

        reportContainer.innerText = reportText;
    }

    renderSummaryChecklist() {
        const container = document.getElementById('summary-quick-checklist');
        if (!container) return;

        const water = this.data.todayWater || 0;
        const targetWater = this.data.targetWater || 3000;
        const waterPct = Math.min(100, Math.round((water / targetWater) * 100));

        const todayBio = (this.data.bioLogs || []).find(b => b.tanggal === this.selectedSummaryDate);

        container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span>💧 <strong>Asupan Air:</strong> ${water.toLocaleString()} / ${targetWater.toLocaleString()} ml</span>
                <span class="badge ${waterPct >= 80 ? 'badge-success' : 'badge-warning'}">${waterPct}%</span>
            </div>
            <div style="width:100%; height:6px; background:#e2e8f0; border-radius:3px; overflow:hidden; margin-bottom:12px;">
                <div style="width:${waterPct}%; height:100%; background:var(--primary-green);"></div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span>🥗 <strong>Cut-Off Makan Malam:</strong></span>
                <span class="badge ${todayBio && todayBio.noCarb === 'Ya' ? 'badge-success' : 'badge-neutral'}">
                    ${todayBio ? todayBio.makanMalam + ' (No Carb)' : '19.00 - 19.30'}
                </span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span>🧘 <strong>Dekompresi Fasia:</strong></span>
                <span class="badge ${todayBio && todayBio.hang && todayBio.hang.includes('Ya') ? 'badge-success' : 'badge-info'}">
                    ${todayBio ? todayBio.hang : 'Dead Hang 3x30s'}
                </span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span>🌙 <strong>Jam Masuk Tidur:</strong></span>
                <span class="badge badge-success">${todayBio ? todayBio.jamTidur : '21.45 (Target HGH)'}</span>
            </div>
        `;
    }

    setTimelineFilter(filterName) {
        this.timelineFilter = filterName;
        document.querySelectorAll('.timeline-filter-btn').forEach(btn => {
            const f = btn.getAttribute('data-filter');
            if (f === filterName) {
                btn.className = 'btn btn-xs btn-primary timeline-filter-btn active';
            } else {
                btn.className = 'btn btn-xs btn-outline timeline-filter-btn';
            }
        });
        this.renderSummaryDashboard();
    }

    navigateSummaryDay(delta) {
        const current = new Date(this.selectedSummaryDate + 'T00:00:00');
        if (isNaN(current.getTime())) {
            this.selectedSummaryDate = new Date().toISOString().split('T')[0];
        } else {
            current.setDate(current.getDate() + delta);
            const y = current.getFullYear();
            const m = String(current.getMonth() + 1).padStart(2, '0');
            const d = String(current.getDate()).padStart(2, '0');
            this.selectedSummaryDate = `${y}-${m}-${d}`;
        }
        this.renderSummaryDashboard();
    }

    navigateSummaryToday() {
        this.selectedSummaryDate = new Date().toISOString().split('T')[0];
        this.renderSummaryDashboard();
    }

    openQuickAddTask() {
        this.switchTab('jurnal-kerja');
        const taskTgl = document.getElementById('task-tgl');
        if (taskTgl) taskTgl.value = this.selectedSummaryDate;
        const formCard = document.getElementById('card-form-task');
        if (formCard) formCard.scrollIntoView({ behavior: 'smooth' });
        document.getElementById('task-nama')?.focus();
    }

    openQuickAddWorkout() {
        this.switchTab('jadwal-latihan');
        const schedTgl = document.getElementById('sched-workout-tgl');
        if (schedTgl) schedTgl.value = this.selectedSummaryDate;
        const formCard = document.getElementById('card-form-workout-schedule');
        if (formCard) formCard.scrollIntoView({ behavior: 'smooth' });
    }

    scrollToFirstConflict() {
        const firstConflict = document.querySelector('.timeline-card.has-conflict');
        if (firstConflict) {
            firstConflict.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstConflict.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
            firstConflict.style.transform = 'scale(1.02)';
            setTimeout(() => {
                firstConflict.style.transform = 'none';
            }, 1000);
        } else {
            this.showToast('✅ Tidak ada bentrokan jam pada tanggal ini.');
        }
    }

    quickAdjustConflictTime(taskId) {
        const task = this.data.tasks.find(t => t.id === taskId);
        if (task) {
            this.switchTab('jurnal-kerja');
            this.startEditTask(taskId);
        } else {
            this.switchTab('jadwal-latihan');
            const formCard = document.getElementById('card-form-workout-schedule');
            if (formCard) formCard.scrollIntoView({ behavior: 'smooth' });
        }
    }

    async toggleTaskStatusFromTimeline(taskId) {
        const task = this.data.tasks.find(t => t.id === taskId);
        if (!task) return;
        task.status = task.status === 'Selesai' ? 'Sedang Berjalan' : 'Selesai';
        this.saveState();
        this.renderTasks();
        this.renderDashboard();
        this.renderSummaryDashboard();
        if (window.supabaseService) {
            await window.supabaseService.upsertTask(task);
        }
        this.showToast(`Status "${task.aktivitas}" diubah ke ${task.status}`);
    }

    copyDailySummaryReport() {
        const text = document.getElementById('daily-summary-report-content')?.innerText;
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('📋 Rapor harian berhasil disalin ke clipboard!');
        }).catch(() => {
            this.showToast('Silakan salin teks rapor secara manual.');
        });
    }

    printDailyReport() {
        window.print();
    }

    openAutoScheduleModal() {
        const modal = document.getElementById('modal-auto-schedule');
        if (!modal) return;
        const targetDateInput = document.getElementById('auto-sched-target-date');
        if (targetDateInput) targetDateInput.value = this.selectedSummaryDate || new Date().toISOString().split('T')[0];
        const citySelect = document.getElementById('auto-sched-city');
        if (citySelect && window.prayerManager) citySelect.value = window.prayerManager.selectedCityKey;
        modal.style.display = 'block';
    }

    closeAutoScheduleModal() {
        const modal = document.getElementById('modal-auto-schedule');
        if (modal) modal.style.display = 'none';
    }

    applyAutoOptimalSchedule(e) {
        if (e && e.preventDefault) e.preventDefault();
        const tgl = document.getElementById('auto-sched-target-date')?.value || this.selectedSummaryDate;
        const sesi = document.getElementById('auto-sched-workout-session')?.value || 'sesi-a';
        const metode = document.getElementById('auto-sched-workout-metode')?.value || '30-10-30 Hypertrophy & Sarcoplasmic Pump (Dingle/Jones Protocol)';
        const replaceExisting = document.getElementById('auto-sched-replace-existing')?.checked ?? true;

        let pt = {
            subuh: '04:05', subuhSelesai: '04:35',
            dzuhur: '11:40', dzuhurSelesai: '12:10',
            ashar: '15:03', asharSelesai: '15:33',
            maghrib: '17:52', maghribSelesai: '18:22',
            isya: '19:06', isyaSelesai: '19:36',
            cityName: 'DKI Jakarta & Sekitarnya (WIB)'
        };
        if (window.prayerManager) {
            pt = window.prayerManager.calculate(tgl);
        }

        const toM = str => {
            if (!str) return 0;
            const [h, m] = str.split(':').map(Number);
            return (h || 0) * 60 + (m || 0);
        };
        const fromM = m => {
            const h = Math.floor(m / 60) % 24;
            const min = m % 60;
            return String(h).padStart(2, '0') + ':' + String(min).padStart(2, '0');
        };
        const addM = (str, mins) => fromM(toM(str) + mins);

        let workoutTitle = 'Latihan Fisik V-Taper: Sesi A (Bahu Lateral & Upper Back)';
        let workoutOutput = 'Lateral raise tempo 30-10-30, Face pull & Lat pulldown untuk memperlebar biacromial torso';
        if (sesi === 'sesi-b') {
            workoutTitle = 'Latihan Fisik V-Taper: Sesi B (Dada Atas & Triceps)';
            workoutOutput = 'Incline dumbbell press & Triceps overhead extension mempertebal lingkar dada dan lengan';
        } else if (sesi === 'sesi-c') {
            workoutTitle = 'Latihan Fisik V-Taper: Sesi C (Kaki & Posterior Chain)';
            workoutOutput = 'Romanian deadlift & Bulgarian split squat memicu lonjakan testosteron & hormon HGH alami';
        } else if (sesi === 'sesi-d') {
            workoutTitle = 'Latihan Fisik V-Taper: Sesi D (Core Kompresi & Torakal)';
            workoutOutput = 'Ab wheel rollout, Pallof press & Thoracic rotation memperbaiki postur tegap';
        } else if (sesi === 'rest') {
            workoutTitle = 'Restorasi Aktif & Jalan Kaki Santai (Zone 1 Cardio)';
            workoutOutput = 'Jalan santai 45 menit di udara terbuka untuk regenerasi glikogen dan pelepasan laktat';
        }

        const tSubuhStart = pt.subuh;
        const tSubuhEnd = pt.subuhSelesai;
        const tHidrasiStart = addM(tSubuhEnd, 10);
        const tHidrasiEnd = addM(tSubuhEnd, 40);
        const tSarapanStart = addM(tSubuhEnd, 50);
        const tSarapanEnd = addM(tSubuhEnd, 95);
        const tDeepWorkStart = addM(tSubuhEnd, 120);
        const tDeepWorkEnd = addM(pt.dzuhur, -15);
        const tDzuhurStart = pt.dzuhur;
        const tDzuhurEnd = pt.dzuhurSelesai;
        const tLunchStart = addM(tDzuhurEnd, 10);
        const tLunchEnd = addM(tDzuhurEnd, 50);
        const tWorkAfternoonStart = addM(tDzuhurEnd, 65);
        const tWorkAfternoonEnd = addM(pt.ashar, -15);
        const tAsharStart = pt.ashar;
        const tAsharEnd = pt.asharSelesai;
        const tWorkoutStart = addM(pt.maghrib, -85);
        const tWorkoutEnd = addM(pt.maghrib, -40);
        const tRecoveryStart = addM(pt.maghrib, -35);
        const tRecoveryEnd = addM(pt.maghrib, -10);
        const tMaghribStart = pt.maghrib;
        const tMaghribEnd = pt.maghribSelesai;
        const tDinnerStart = addM(tMaghribEnd, 10);
        const tDinnerEnd = addM(pt.isya, -10);
        const tIsyaStart = pt.isya;
        const tIsyaEnd = pt.isyaSelesai;
        const tEvalStart = addM(tIsyaEnd, 10);
        const tEvalEnd = '20:45';
        const tDecompStart = '21:00';
        const tDecompEnd = '21:30';
        const tSleepStart = '21:45';
        const tSleepEnd = '23:59';

        const optimalTasks = [
            {
                id: 'opt-' + Date.now() + '-1',
                tanggal: tgl,
                mulai: tSubuhStart,
                selesai: tSubuhEnd,
                durasi: '0.50',
                kategori: 'Ibadah / Salat',
                aktivitas: 'Salat Subuh Berjamaah & Dzikir Fajar',
                output: 'Membangun ketenangan spiritual, kejernihan batin, dan niat produktif hari ini',
                metode_latihan: 'Non-Latihan',
                prioritas: 'Tinggi',
                status: 'Terjadwal',
                fokus: 5,
                catatan: `Jadwal Astronomis Realtime (${pt.cityName})`
            },
            {
                id: 'opt-' + Date.now() + '-2',
                tanggal: tgl,
                mulai: tHidrasiStart,
                selesai: tHidrasiEnd,
                durasi: '0.50',
                kategori: 'Kesehatan Biologis & Nutrisi',
                aktivitas: 'Hidrasi Seluler Garam Himalaya & Stomach Vacuum Pagi',
                output: '500ml air hangat + sejumput garam ionik, aktivasi transversus abdominis 4x20s',
                metode_latihan: 'Non-Latihan',
                prioritas: 'Tinggi',
                status: 'Terjadwal',
                fokus: 5,
                catatan: 'Fondasi hidrasi sel & korset perut alami sebelum sarapan'
            },
            {
                id: 'opt-' + Date.now() + '-3',
                tanggal: tgl,
                mulai: tSarapanStart,
                selesai: tSarapanEnd,
                durasi: '0.75',
                kategori: 'Kesehatan Biologis & Nutrisi',
                aktivitas: 'Sarapan Pembangun: 3 Telur Rebus + Karbo Kompleks & Tumis Sayur',
                output: 'Asupan asam amino esensial & energi stabil tanpa memicu kantuk (rendah indeks glikemik)',
                metode_latihan: 'Non-Latihan',
                prioritas: 'Tinggi',
                status: 'Terjadwal',
                fokus: 5,
                catatan: 'Nutrisi anabolik dasar pemulihan'
            },
            {
                id: 'opt-' + Date.now() + '-4',
                tanggal: tgl,
                mulai: tDeepWorkStart,
                selesai: tDeepWorkEnd,
                durasi: this.calculateDuration(tDeepWorkStart, tDeepWorkEnd),
                kategori: 'Tugas Utama',
                aktivitas: 'Deep Work Pagi: Analisis Strategis & Eksekusi Prioritas Utama',
                output: 'Tuntas menyelesaikan pekerjaan bernilai tinggi dengan fokus 100% tanpa distraksi',
                metode_latihan: 'Non-Latihan',
                prioritas: 'Tinggi',
                status: 'Terjadwal',
                fokus: 5,
                catatan: 'Golden Hour produktivitas otak'
            },
            {
                id: 'opt-' + Date.now() + '-5',
                tanggal: tgl,
                mulai: tDzuhurStart,
                selesai: tDzuhurEnd,
                durasi: '0.50',
                kategori: 'Ibadah / Salat',
                aktivitas: 'Salat Dzuhur & Jeda Istirahat Mental',
                output: 'Mereset kelelahan kognitif tengah hari & pembaruan fokus',
                metode_latihan: 'Non-Latihan',
                prioritas: 'Tinggi',
                status: 'Terjadwal',
                fokus: 5,
                catatan: `Jadwal Astronomis Realtime (${pt.cityName})`
            },
            {
                id: 'opt-' + Date.now() + '-6',
                tanggal: tgl,
                mulai: tLunchStart,
                selesai: tLunchEnd,
                durasi: '0.67',
                kategori: 'Kesehatan Biologis & Nutrisi',
                aktivitas: 'Makan Siang Utama: Dada Ayam/Ikan (150-200g) + Nasi 1 Kepal + Sayur Bening',
                output: 'Pemicu fase anabolik (mTOR) & regenerasi serabut otot tanpa rasa begah',
                metode_latihan: 'Non-Latihan',
                prioritas: 'Tinggi',
                status: 'Terjadwal',
                fokus: 5,
                catatan: 'Karbohidrat kompleks + protein lengkap'
            },
            {
                id: 'opt-' + Date.now() + '-7',
                tanggal: tgl,
                mulai: tWorkAfternoonStart,
                selesai: tWorkAfternoonEnd,
                durasi: this.calculateDuration(tWorkAfternoonStart, tWorkAfternoonEnd),
                kategori: 'Operasional',
                aktivitas: 'Sesi Kerja Siang: Koordinasi Tim, Tindak Lanjut Teknis & Rapat',
                output: 'Komunikasi dan penyelesaian tugas administratif lapangan tuntas rapi',
                metode_latihan: 'Non-Latihan',
                prioritas: 'Sedang',
                status: 'Terjadwal',
                fokus: 4,
                catatan: 'Eksekusi operasional siang'
            },
            {
                id: 'opt-' + Date.now() + '-8',
                tanggal: tgl,
                mulai: tAsharStart,
                selesai: tAsharEnd,
                durasi: '0.50',
                kategori: 'Ibadah / Salat',
                aktivitas: 'Salat Ashar & Persiapan Transisi Sore',
                output: 'Transisi ketenangan sebelum memasuki sesi latihan fisik',
                metode_latihan: 'Non-Latihan',
                prioritas: 'Tinggi',
                status: 'Terjadwal',
                fokus: 5,
                catatan: `Jadwal Astronomis Realtime (${pt.cityName})`
            },
            {
                id: 'opt-' + Date.now() + '-9',
                tanggal: tgl,
                mulai: tWorkoutStart,
                selesai: tWorkoutEnd,
                durasi: '0.75',
                kategori: 'Latihan & Olah Tubuh',
                aktivitas: workoutTitle,
                output: workoutOutput,
                metode_latihan: metode,
                prioritas: 'Tinggi',
                status: 'Terjadwal',
                fokus: 5,
                catatan: 'Durasi ketat 45 menit untuk optimasi rasio Testosteron:Kortisol'
            },
            {
                id: 'opt-' + Date.now() + '-10',
                tanggal: tgl,
                mulai: tRecoveryStart,
                selesai: tRecoveryEnd,
                durasi: '0.42',
                kategori: 'Kesehatan Biologis & Nutrisi',
                aktivitas: 'Nutrisi Pemulihan Cepat: 2 Putih Telur + Pisang Ambon / Whey Isolate',
                output: 'Pengisian kembali glikogen otot & asam amino BCAA saat sensitivitas insulin tinggi',
                metode_latihan: 'Non-Latihan',
                prioritas: 'Tinggi',
                status: 'Terjadwal',
                fokus: 5,
                catatan: 'Jendela anabolik pasca-latihan segera'
            },
            {
                id: 'opt-' + Date.now() + '-11',
                tanggal: tgl,
                mulai: tMaghribStart,
                selesai: tMaghribEnd,
                durasi: '0.50',
                kategori: 'Ibadah / Salat',
                aktivitas: 'Salat Maghrib & Refleksi Senja',
                output: 'Penenangan sistem saraf otonom saat pergantian cahaya senja',
                metode_latihan: 'Non-Latihan',
                prioritas: 'Tinggi',
                status: 'Terjadwal',
                fokus: 5,
                catatan: `Jadwal Astronomis Realtime (${pt.cityName})`
            },
            {
                id: 'opt-' + Date.now() + '-12',
                tanggal: tgl,
                mulai: tDinnerStart,
                selesai: tDinnerEnd,
                durasi: this.calculateDuration(tDinnerStart, tDinnerEnd),
                kategori: 'Kesehatan Biologis & Nutrisi',
                aktivitas: 'Cut-Off Makan Malam No-Carb: Ikan Bakar / Tahu Tempe & Sayur Hijau Zaitun',
                output: 'Cut-off makan malam dimulai. Tanpa karbohidrat agar insulin turun nol dan memicu autofagi',
                metode_latihan: 'Non-Latihan',
                prioritas: 'Tinggi',
                status: 'Terjadwal',
                fokus: 5,
                catatan: 'Cut-off nutrisi malam strictly no-carb'
            },
            {
                id: 'opt-' + Date.now() + '-13',
                tanggal: tgl,
                mulai: tIsyaStart,
                selesai: tIsyaEnd,
                durasi: '0.50',
                kategori: 'Ibadah / Salat',
                aktivitas: 'Salat Isya Berjamaah & Doa Malam',
                output: 'Penutup ibadah fardhu harian, ketenteraman hati menyongsong malam',
                metode_latihan: 'Non-Latihan',
                prioritas: 'Tinggi',
                status: 'Terjadwal',
                fokus: 5,
                catatan: `Jadwal Astronomis Realtime (${pt.cityName})`
            },
            {
                id: 'opt-' + Date.now() + '-14',
                tanggal: tgl,
                mulai: tEvalStart,
                selesai: tEvalEnd,
                durasi: this.calculateDuration(tEvalStart, tEvalEnd),
                kategori: 'Operasional',
                aktivitas: 'Evaluasi Jurnal Harian & Perencanaan Strategis Hari Esok',
                output: 'Review capaian KPI kerja, checklist nutrisi, dan penetapan 3 prioritas esok',
                metode_latihan: 'Non-Latihan',
                prioritas: 'Sedang',
                status: 'Terjadwal',
                fokus: 4,
                catatan: 'Penutupan administrasi hari'
            },
            {
                id: 'opt-' + Date.now() + '-15',
                tanggal: tgl,
                mulai: tDecompStart,
                selesai: tDecompEnd,
                durasi: '0.50',
                kategori: 'Kesehatan Biologis & Nutrisi',
                aktivitas: 'Dekompresi Pasif Fasia: Dead Hang 3x30 Detik, Child Pose & Suplementasi',
                output: 'Bantalan vertebra L4-L5 meregang bebas gravitasi, relaksasi saraf vagus + magnesium',
                metode_latihan: 'Non-Latihan',
                prioritas: 'Tinggi',
                status: 'Terjadwal',
                fokus: 5,
                catatan: 'Protokol tulang belakang & persiapan tidur lelap'
            },
            {
                id: 'opt-' + Date.now() + '-16',
                tanggal: tgl,
                mulai: tSleepStart,
                selesai: tSleepEnd,
                durasi: '2.25',
                kategori: 'Kesehatan Biologis & Nutrisi',
                aktivitas: 'Deep Sleep Pemulihan HGH Puncak (Kegelapan Total & Suhu Sejuk)',
                output: 'Pelepasan 70-80% hormon pertumbuhan (HGH) untuk memadatkan tulang & regenerasi',
                metode_latihan: 'Non-Latihan',
                prioritas: 'Tinggi',
                status: 'Terjadwal',
                fokus: 5,
                catatan: 'Deep Sleep Pemulihan HGH - Istirahat lelap hingga Fajar 04:00'
            }
        ];

        if (replaceExisting) {
            this.data.tasks = (this.data.tasks || []).filter(t => t.tanggal !== tgl).concat(optimalTasks);
        } else {
            this.data.tasks = (this.data.tasks || []).concat(optimalTasks);
        }

        // Sinkronisasi ke log biologis hari tersebut agar checklist 100% patuh
        let bioLog = (this.data.bioLogs || []).find(b => b.tanggal === tgl);
        if (!bioLog) {
            bioLog = {
                id: 'bio-auto-' + Date.now(),
                tanggal: tgl,
                fase: 'Fase 2 & 3: Remodeling Otot-Tulang',
                air: 3000,
                sarapan: '05:45 - 3 Telur Rebus & Karbo Kompleks',
                makanSiang: '12:30 - Dada Ayam 200g & Nasi 1 Kepal',
                makanMalam: '18:45 - Ikan Bakar & Sayur Hijau',
                noCarb: 'Ya',
                hang: 'Ya (3x30s)',
                tidurDurasi: 7.0,
                jamTidur: '21:45',
                kualitasTidur: 5,
                nyeriPinggang: 1,
                tensi: '118/78',
                posturSkor: 90,
                catatan: 'Disusun otomatis lewat Protokol Emas Rekonstruksi Biologis.'
            };
            this.data.bioLogs.unshift(bioLog);
        } else {
            bioLog.air = 3000;
            bioLog.noCarb = 'Ya';
            bioLog.hang = 'Ya (3x30s)';
            bioLog.jamTidur = '21:45';
        }

        this.data.todayWater = 3000;
        this.saveState();
        this.selectedSummaryDate = tgl;

        if (window.supabaseService) {
            window.supabaseService.fullSync(this.data.tasks, this.data.bioLogs);
        }

        this.closeAutoScheduleModal();
        this.renderAll();
        this.showToast('🚀 Jadwal Optimal 24 Jam (Protokol Emas) Berhasil Diterapkan!');
    }

    openResetScheduleModal() {
        const modal = document.getElementById('modal-reset-schedule');
        if (!modal) return;
        const dateLabel = document.getElementById('reset-modal-current-date-label');
        if (dateLabel) {
            const dateObj = new Date(this.selectedSummaryDate + 'T00:00:00');
            const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            dateLabel.innerText = !isNaN(dateObj.getTime())
                ? `${dayNames[dateObj.getDay()]}, ${dateObj.getDate()} ${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`
                : this.selectedSummaryDate;
        }
        modal.style.display = 'block';
    }

    closeResetScheduleModal() {
        const modal = document.getElementById('modal-reset-schedule');
        if (modal) modal.style.display = 'none';
    }

    async executeScheduleReset() {
        const isDateOnly = document.getElementById('reset-scope-date')?.checked ?? true;
        if (isDateOnly) {
            this.data.tasks = (this.data.tasks || []).filter(t => t.tanggal !== this.selectedSummaryDate);
            this.showToast(`🗑️ Jadwal untuk tanggal ${this.selectedSummaryDate} berhasil dikosongkan.`);
        } else {
            this.data.tasks = [];
            this.showToast('🗑️ Seluruh jadwal harian global berhasil dikosongkan!');
        }

        this.saveState();
        if (window.supabaseService) {
            await window.supabaseService.fullSync(this.data.tasks, this.data.bioLogs);
        }
        this.closeResetScheduleModal();
        this.renderAll();
    }

    savePrayerCityZone() {
        const el = document.getElementById('prayer-city-select');
        const cityKey = el ? el.value : (window.prayerManager?.selectedCityKey || 'jakarta');
        if (window.prayerManager) {
            window.prayerManager.setCity(cityKey);
        }
        this.data.prayerCity = cityKey;
        this.saveState();
        if (window.supabaseService) {
            window.supabaseService.fullSync(this.data.tasks, this.data.bioLogs);
        }
        const cfg = window.prayerManager ? window.prayerManager.getCityConfig() : null;
        const tz = cfg ? (cfg.tz === 7 ? 'WIB' : (cfg.tz === 8 ? 'WITA' : 'WIT')) : 'WIB';
        this.showToast(`💾 Zona waktu ${cfg ? cfg.name : cityKey} (${tz}) berhasil disimpan & terupdate realtime!`);
    }

    renderAll() {
        this.renderSummaryDashboard();
        this.renderHydration();
        this.renderDailyChecklists();
        this.renderTasks();
        this.renderBioLogs();
        this.renderDashboard();
        this.renderMealTimeline();
        this.renderWeeklyMenu();
        this.renderWorkoutDay(this.selectedWorkoutDay);
        this.renderGerakanKunci();
        this.renderMetodeCatalog();
        this.renderBatasMedis();
        this.renderJendelaRegenerasi();

        const todayStr = new Date().toISOString().split('T')[0];
        const taskTgl = document.getElementById('task-tgl');
        const bioTgl = document.getElementById('bio-tgl');
        const schedTgl = document.getElementById('sched-workout-tgl');
        const summaryTgl = document.getElementById('summary-selected-date');
        if (taskTgl && !this.editingTaskId) taskTgl.value = todayStr;
        if (bioTgl && !this.editingBioLogId) bioTgl.value = todayStr;
        if (schedTgl) schedTgl.value = todayStr;
        if (summaryTgl) summaryTgl.value = this.selectedSummaryDate;
        this.updateWorkoutDurationBadge();
    }
}

window.switchTab = (tabId) => {
    if (window.app) window.app.switchTab(tabId);
};

document.addEventListener('DOMContentLoaded', () => {
    window.app = new AppManager();
});
