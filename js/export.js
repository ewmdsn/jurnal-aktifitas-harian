// Modul Ekspor Data ke Excel (CSV UTF-8 BOM) dan Cadangan JSON
const DataExporter = {
    // Unduh string sebagai file
    downloadFile(content, fileName, contentType = 'text/plain') {
        const a = document.createElement('a');
        const file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(a.href);
        }, 100);
    },

    // Ekspor Jurnal Kerja ke CSV Excel
    exportJurnalKerjaCSV(tasks) {
        if (!tasks || tasks.length === 0) {
            alert('Belum ada data jurnal kerja untuk diekspor.');
            return;
        }

        const headers = ['No', 'Tanggal', 'Hari', 'Mulai', 'Selesai', 'Durasi (Jam)', 'Kategori', 'Nama Aktivitas', 'Output Nyata', 'Prioritas', 'Status', 'Fokus (1-5)', 'Catatan'];
        let csvContent = '\uFEFF' + headers.join(';') + '\n';

        tasks.forEach((t, i) => {
            const row = [
                i + 1,
                t.tanggal || '',
                t.hari || '',
                t.mulai || '',
                t.selesai || '',
                t.durasi || '0.00',
                `"${(t.kategori || '').replace(/"/g, '""')}"`,
                `"${(t.aktivitas || '').replace(/"/g, '""')}"`,
                `"${(t.output || '').replace(/"/g, '""')}"`,
                t.prioritas || '',
                t.status || '',
                t.fokus || '',
                `"${(t.catatan || '').replace(/"/g, '""')}"`
            ];
            csvContent += row.join(';') + '\n';
        });

        const dateStr = new Date().toISOString().split('T')[0];
        this.downloadFile(csvContent, `Jurnal_Kerja_${dateStr}.csv`, 'text/csv;charset=utf-8;');
    },

    // Ekspor Log Biologis ke CSV Excel
    exportLogBiologisCSV(bioLogs) {
        if (!bioLogs || bioLogs.length === 0) {
            alert('Belum ada data log biologis untuk diekspor.');
            return;
        }

        const headers = ['No', 'Tanggal', 'Hari', 'Sesi Latihan', 'Kepatuhan Latihan', 'Stomach Vacuum', 'Dead Hang', 'Air Mineral (ml)', 'Elektrolit Pagi', 'Makan Malam Cut-Off', 'Jeda ke Tidur (Jam)', 'Malam No-Carb', 'Jam Tidur', 'Jam Bangun', 'Durasi Tidur (Jam)', 'Puncak HGH', 'Sensasi Punggung', 'Lingkar Perut (cm)', 'Berat Badan (kg)', 'Status Red Flag', 'Catatan'];
        let csvContent = '\uFEFF' + headers.join(';') + '\n';

        bioLogs.forEach((b, i) => {
            const row = [
                i + 1,
                b.tanggal || '',
                b.hari || '',
                `"${(b.sesi || '').replace(/"/g, '""')}"`,
                b.patuh || '',
                `"${(b.vacuum || '').replace(/"/g, '""')}"`,
                `"${(b.hang || '').replace(/"/g, '""')}"`,
                b.air || 0,
                b.elektrolit || '',
                b.makanMalam || '',
                b.jedaTidur || '0.0',
                b.noCarb || '',
                b.jamTidur || '',
                b.jamBangun || '',
                b.durasiTidur || '0.0',
                b.puncakHgh || '',
                `"${(b.sensasi || '').replace(/"/g, '""')}"`,
                b.lingkarPerut || '',
                b.beratBadan || '',
                b.redFlag || '',
                `"${(b.catatan || '').replace(/"/g, '""')}"`
            ];
            csvContent += row.join(';') + '\n';
        });

        const dateStr = new Date().toISOString().split('T')[0];
        this.downloadFile(csvContent, `Log_Biologis_Kesehatan_${dateStr}.csv`, 'text/csv;charset=utf-8;');
    },

    // Cadangan JSON Lengkap
    exportBackupJSON(allData) {
        const jsonStr = JSON.stringify(allData, null, 2);
        const dateStr = new Date().toISOString().split('T')[0];
        this.downloadFile(jsonStr, `Backup_Jurnal_Biologis_${dateStr}.json`, 'application/json');
    }
};

window.DataExporter = DataExporter;
