// Logika Utama Aplikasi Jurnal Aktivitas & Rekonstruksi Biologis Mandiri (Teroptimasi: Nutrisi, Latihan & Supabase Cloud)

const STORAGE_KEY = 'jurnal_biologis_mandiri_v1';

class AppManager {
    constructor() {
        this.data = this.loadState();
        this.currentTab = 'jurnal-kerja';
        this.editingTaskId = null;
        this.editingBioLogId = null;
        this.selectedWorkoutDay = 'Senin';
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

        if (tabId === 'dashboard-kpi') {
            this.renderDashboard();
        } else if (tabId === 'menu-makan') {
            this.renderMealTimeline();
            this.renderWeeklyMenu();
        } else if (tabId === 'jadwal-latihan') {
            this.renderWorkoutDay(this.selectedWorkoutDay);
            this.renderGerakanKunci();
            this.renderBatasMedis();
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

        const durasi = this.calculateDuration(mulai, selesai);
        const hari = this.getDayName(tgl);

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

                if (window.supabaseService) {
                    await window.supabaseService.upsertTask(updatedTask);
                }

                this.cancelEditTask();
                alert('Tugas berhasil diperbarui dan disinkronkan ke Supabase Cloud!');
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

            if (window.supabaseService) {
                await window.supabaseService.upsertTask(newTask);
            }

            document.getElementById('form-add-task').reset();
            const todayStr = new Date().toISOString().split('T')[0];
            document.getElementById('task-tgl').value = todayStr;

            alert('Tugas baru berhasil ditambahkan dan disinkronkan ke Supabase Cloud!');
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

            if (window.supabaseService) {
                await window.supabaseService.deleteTask(id);
            }
        }
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

    renderAll() {
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
        if (taskTgl && !this.editingTaskId) taskTgl.value = todayStr;
        if (bioTgl && !this.editingBioLogId) bioTgl.value = todayStr;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new AppManager();
});
