// Konfigurasi & Klien Supabase Terintegrasi
const SUPABASE_CONFIG = {
    url: 'https://nwjpukscnwbrnjohleco.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53anB1a3Njbndicm5qb2hsZWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3NDc5MzAsImV4cCI6MjExMDMyMzkzMH0.cXgPx8pqjxk1AQD2KqArp88rwH6V2GlGogkmrG7Q7A4'
};

class SupabaseService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.init();
    }

    init() {
        try {
            if (window.supabase && typeof window.supabase.createClient === 'function') {
                this.client = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
                this.isConnected = true;
                console.log('Klien Supabase berhasil diinisialisasi:', SUPABASE_CONFIG.url);
            } else {
                console.warn('Supabase SDK belum dimuat di peramban, berjalan dalam mode LocalStorage.');
            }
        } catch (err) {
            console.error('Gagal menginisialisasi Supabase:', err);
        }
    }

    async testConnection() {
        if (!this.client) return false;
        try {
            const { error } = await this.client.from('jurnal_kerja').select('id').limit(1);
            if (error) {
                console.warn('Supabase test query warning:', error);
                return false;
            }
            this.isConnected = true;
            return true;
        } catch (e) {
            console.error('Koneksi Supabase gagal:', e);
            this.isConnected = false;
            return false;
        }
    }

    // Ambil semua data tugas dari Supabase
    async fetchTasks() {
        if (!this.client) return null;
        try {
            const { data, error } = await this.client
                .from('jurnal_kerja')
                .select('*')
                .order('tanggal', { ascending: false });

            if (error) throw error;
            return data.map(item => ({
                id: item.id,
                tanggal: item.tanggal,
                hari: item.hari,
                mulai: item.mulai,
                selesai: item.selesai,
                durasi: item.durasi ? item.durasi.toString() : '0.00',
                kategori: item.kategori,
                metode_latihan: item.metode_latihan || '',
                aktivitas: item.aktivitas,
                output: item.output,
                prioritas: item.prioritas,
                status: item.status,
                fokus: item.fokus,
                catatan: item.catatan
            }));
        } catch (err) {
            console.error('Error fetching tasks from Supabase:', err);
            return null;
        }
    }

    // Simpan atau perbarui tugas di Supabase
    async upsertTask(task) {
        if (!this.client) return false;
        try {
            const payload = {
                id: task.id,
                tanggal: task.tanggal,
                hari: task.hari,
                mulai: task.mulai,
                selesai: task.selesai,
                durasi: parseFloat(task.durasi || 0),
                kategori: task.kategori,
                metode_latihan: task.metode_latihan || null,
                aktivitas: task.aktivitas,
                output: task.output,
                prioritas: task.prioritas,
                status: task.status,
                fokus: parseInt(task.fokus || 5),
                catatan: task.catatan
            };

            const { error } = await this.client
                .from('jurnal_kerja')
                .upsert(payload, { onConflict: 'id' });

            if (error) throw error;
            return true;
        } catch (err) {
            console.error('Error upserting task to Supabase:', err);
            return false;
        }
    }

    // Hapus tugas di Supabase
    async deleteTask(id) {
        if (!this.client) return false;
        try {
            const { error } = await this.client
                .from('jurnal_kerja')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (err) {
            console.error('Error deleting task in Supabase:', err);
            return false;
        }
    }

    // Ambil semua log biologis dari Supabase
    async fetchBioLogs() {
        if (!this.client) return null;
        try {
            const { data, error } = await this.client
                .from('log_biologis')
                .select('*')
                .order('tanggal', { ascending: false });

            if (error) throw error;
            return data.map(item => ({
                id: item.id,
                tanggal: item.tanggal,
                hari: item.hari,
                sesi: item.sesi,
                metode_latihan: item.metode_latihan || '',
                patuh: item.patuh,
                vacuum: item.vacuum,
                hang: item.hang,
                air: item.air,
                elektrolit: item.elektrolit,
                makanMalam: item.makan_malam,
                jedaTidur: item.jeda_tidur ? item.jeda_tidur.toString() : '0.0',
                noCarb: item.no_carb,
                jamTidur: item.jam_tidur,
                jamBangun: item.jam_bangun,
                durasiTidur: item.durasi_tidur ? item.durasi_tidur.toString() : '0.0',
                puncakHgh: item.puncak_hgh,
                sensasi: item.sensasi,
                lingkarPerut: item.lingkar_perut,
                beratBadan: item.berat_badan,
                redFlag: item.red_flag,
                catatan: item.catatan
            }));
        } catch (err) {
            console.error('Error fetching bio logs from Supabase:', err);
            return null;
        }
    }

    // Simpan atau perbarui log biologis di Supabase
    async upsertBioLog(b) {
        if (!this.client) return false;
        try {
            const payload = {
                id: b.id,
                tanggal: b.tanggal,
                hari: b.hari,
                sesi: b.sesi,
                metode_latihan: b.metode_latihan || null,
                patuh: b.patuh,
                vacuum: b.vacuum,
                hang: b.hang,
                air: parseInt(b.air || 0),
                elektrolit: b.elektrolit,
                makan_malam: b.makanMalam,
                jeda_tidur: parseFloat(b.jedaTidur || 0),
                no_carb: b.noCarb,
                jam_tidur: b.jamTidur,
                jam_bangun: b.jamBangun,
                durasi_tidur: parseFloat(b.durasiTidur || 0),
                puncak_hgh: b.puncakHgh,
                sensasi: b.sensasi,
                lingkar_perut: b.lingkarPerut ? parseFloat(b.lingkarPerut) : null,
                berat_badan: b.beratBadan ? parseFloat(b.beratBadan) : null,
                red_flag: b.redFlag,
                catatan: b.catatan
            };

            const { error } = await this.client
                .from('log_biologis')
                .upsert(payload, { onConflict: 'tanggal' });

            if (error) throw error;
            return true;
        } catch (err) {
            console.error('Error upserting bio log to Supabase:', err);
            return false;
        }
    }

    // Hapus log biologis di Supabase
    async deleteBioLog(id) {
        if (!this.client) return false;
        try {
            const { error } = await this.client
                .from('log_biologis')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (err) {
            console.error('Error deleting bio log in Supabase:', err);
            return false;
        }
    }

    // Sinkronisasi penuh dua arah (Local <-> Cloud)
    async fullSync(localTasks, localBioLogs) {
        if (!this.client) return null;
        const result = { syncedTasks: 0, syncedBio: 0 };
        try {
            // Push local tasks
            for (const t of localTasks) {
                await this.upsertTask(t);
                result.syncedTasks++;
            }
            // Push local bio logs
            for (const b of localBioLogs) {
                await this.upsertBioLog(b);
                result.syncedBio++;
            }
            return result;
        } catch (err) {
            console.error('Full sync error:', err);
            return null;
        }
    }
}

window.supabaseService = new SupabaseService();
