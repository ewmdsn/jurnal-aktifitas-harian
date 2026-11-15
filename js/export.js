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

    // Ekspor Summary Jadwal Terpadu Harian ke Format Excel (.xls / SpreadsheetML)
    exportSummaryScheduleExcel(events, metadata = {}) {
        if (!events || events.length === 0) {
            alert('Belum ada jadwal pada tanggal ini untuk diekspor ke Excel.');
            return;
        }

        const dateStr = metadata.formattedDate || new Date().toISOString().split('T')[0];
        const cityName = metadata.cityName || (window.prayerManager?.getCityConfig()?.name || 'DKI Jakarta & Sekitarnya (WIB)');
        const conflictStatus = (metadata.totalConflictsCount === 0 || !metadata.totalConflictsCount)
            ? '0 Bentrokan Jam (Jadwal Harmonis 100%)'
            : `${Math.ceil((metadata.totalConflictsCount || 0) / 2)} Bentrokan Jam Terdeteksi`;

        let tableRows = '';
        events.forEach((e, idx) => {
            const bgColor = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
            let catColor = '#1e3a8a';
            let catBg = '#dbeafe';
            if (e.kategori === 'Salat') { catColor = '#065f46'; catBg = '#d1fae5'; }
            else if (e.kategori === 'Latihan') { catColor = '#5b21b6'; catBg = '#ede9fe'; }
            else if (e.kategori === 'Nutrisi') { catColor = '#9a3412'; catBg = '#ffedd5'; }
            else if (e.kategori === 'Biologis') { catColor = '#166534'; catBg = '#dcfce7'; }

            tableRows += `
                <tr style="background-color: ${bgColor};">
                    <td style="text-align: center; border: 1px solid #cbd5e1; padding: 8px;">${idx + 1}</td>
                    <td style="text-align: center; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px;">${e.mulai || ''}</td>
                    <td style="text-align: center; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px;">${e.selesai || ''}</td>
                    <td style="text-align: center; border: 1px solid #cbd5e1; padding: 8px;">${e.durasi || '0.00'}</td>
                    <td style="background-color: ${catBg}; color: ${catColor}; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px;">${e.kategoriLabel || e.kategori || ''}</td>
                    <td style="font-weight: bold; border: 1px solid #cbd5e1; padding: 8px;">${e.aktivitas || ''}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 8px;">${e.metode_latihan || '-'}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 8px;">${e.output || '-'}</td>
                    <td style="text-align: center; border: 1px solid #cbd5e1; padding: 8px;">${e.prioritas || 'Sedang'}</td>
                    <td style="text-align: center; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px;">${e.status || 'Terjadwal'}</td>
                    <td style="text-align: center; border: 1px solid #cbd5e1; padding: 8px;">${e.fokus ? e.fokus + '/5' : '-'}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 8px;">${e.catatan || '-'}</td>
                </tr>
            `;
        });

        // Waktu Salat Info
        let prayerSummaryHtml = '';
        if (metadata.prayerTimes) {
            const pt = metadata.prayerTimes;
            prayerSummaryHtml = `
                <tr style="background-color: #ecfdf5;">
                    <td colspan="12" style="border: 1px solid #a7f3d0; padding: 10px; font-size: 10pt; color: #065f46;">
                        <strong>🕌 Waktu Salat 5 Waktu Realtime Astronomis (${pt.cityName}):</strong> 
                        Subuh: <strong>${pt.subuh}</strong> &nbsp;|&nbsp; 
                        Terbit: <strong>${pt.terbit || '-'}</strong> &nbsp;|&nbsp; 
                        Dzuhur: <strong>${pt.dzuhur}</strong> &nbsp;|&nbsp; 
                        Ashar: <strong>${pt.ashar}</strong> &nbsp;|&nbsp; 
                        Maghrib: <strong>${pt.maghrib}</strong> &nbsp;|&nbsp; 
                        Isya: <strong>${pt.isya}</strong>
                    </td>
                </tr>
            `;
        }

        const excelHtml = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                <!--[if gte mso 9]>
                <xml>
                <x:ExcelWorkbook>
                <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                <x:Name>Summary Jadwal Harian</x:Name>
                <x:WorksheetOptions>
                <x:DisplayGridlines/>
                </x:WorksheetOptions>
                </x:ExcelWorksheet>
                </x:ExcelWorksheets>
                </x:ExcelWorkbook>
                </xml>
                <![endif]-->
                <style>
                    body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; font-size: 10pt; }
                    table { border-collapse: collapse; width: 100%; }
                    th { background-color: #0f2b48; color: #ffffff; border: 1px solid #1e3a8a; padding: 10px; font-weight: bold; text-align: center; }
                    td { font-size: 9.5pt; mso-number-format: "\\@"; }
                    .header-title { font-size: 16pt; font-weight: bold; color: #0f2b48; }
                    .meta-label { font-weight: bold; color: #334155; }
                </style>
            </head>
            <body>
                <table>
                    <tr>
                        <td colspan="12" class="header-title" style="padding: 12px 0;">📊 JURNAL AKTIVITAS HARIAN & REKONSTRUKSI BIOLOGIS</td>
                    </tr>
                    <tr>
                        <td colspan="12" style="font-size: 12pt; font-weight: bold; color: #10b981; padding-bottom: 10px;">
                            Master Schedule & Summary Terpadu (00.00 – 23.59)
                        </td>
                    </tr>
                    <tr>
                        <td colspan="6" class="meta-label">📅 Tanggal: <span style="font-weight: normal;">${dateStr}</span></td>
                        <td colspan="6" class="meta-label">🏙️ Lokasi / Zona: <span style="font-weight: normal;">${cityName}</span></td>
                    </tr>
                    <tr>
                        <td colspan="6" class="meta-label">📋 Total Agenda: <span style="font-weight: normal;">${metadata.totalAgenda || events.length} Kegiatan</span></td>
                        <td colspan="6" class="meta-label">⏱️ Total Jam Terjadwal: <span style="font-weight: normal;">${(metadata.totalHours || 0).toFixed(1)} Jam</span></td>
                    </tr>
                    <tr>
                        <td colspan="6" class="meta-label">✅ Progress Eksekusi: <span style="font-weight: normal;">${metadata.selesaiCount || 0} / ${metadata.totalAgenda || events.length} (${metadata.pctSelesai || 0}%)</span></td>
                        <td colspan="6" class="meta-label">🛡️ Status Anti-Bentrokan: <span style="font-weight: bold; color: ${metadata.totalConflictsCount === 0 || !metadata.totalConflictsCount ? '#059669' : '#dc2626'};">${conflictStatus}</span></td>
                    </tr>
                    <tr><td colspan="12" style="height: 12px;"></td></tr>
                    ${prayerSummaryHtml}
                    <tr><td colspan="12" style="height: 10px;"></td></tr>
                    <thead>
                        <tr>
                            <th style="width: 40px;">No</th>
                            <th style="width: 70px;">Mulai</th>
                            <th style="width: 70px;">Selesai</th>
                            <th style="width: 80px;">Durasi (Jam)</th>
                            <th style="width: 140px;">Kategori</th>
                            <th style="width: 240px;">Nama Agenda / Aktivitas</th>
                            <th style="width: 180px;">Metode Latihan / Spesifikasi</th>
                            <th style="width: 260px;">Target Capaian / Output Nyata</th>
                            <th style="width: 90px;">Prioritas</th>
                            <th style="width: 100px;">Status</th>
                            <th style="width: 80px;">Fokus</th>
                            <th style="width: 200px;">Catatan Protokol</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                    <tr><td colspan="12" style="height: 14px;"></td></tr>
                    <tr>
                        <td colspan="12" style="font-size: 8.5pt; color: #64748b; font-style: italic;">
                            Diekspor otomatis dari Jurnal Aktivitas Harian & Rekonstruksi Biologis pada ${new Date().toLocaleString('id-ID')}
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;

        const cleanDate = (metadata.rawDate || new Date().toISOString().split('T')[0]).replace(/-/g, '');
        const filename = `Summary_Jadwal_Harian_${cleanDate}.xls`;
        this.downloadFile(excelHtml, filename, 'application/vnd.ms-excel;charset=utf-8;');
    },

    // Ekspor Summary Jadwal ke CSV Excel
    exportSummaryScheduleCSV(events, metadata = {}) {
        if (!events || events.length === 0) {
            alert('Belum ada jadwal pada tanggal ini untuk diekspor ke CSV.');
            return;
        }

        const headers = ['No', 'Tanggal', 'Jam Mulai', 'Jam Selesai', 'Durasi (Jam)', 'Kategori', 'Nama Aktivitas', 'Metode Latihan', 'Output Nyata', 'Prioritas', 'Status', 'Fokus', 'Catatan'];
        let csvContent = '\uFEFF' + headers.join(';') + '\n';

        events.forEach((e, idx) => {
            const row = [
                idx + 1,
                metadata.rawDate || '',
                e.mulai || '',
                e.selesai || '',
                e.durasi || '0.00',
                `"${(e.kategoriLabel || e.kategori || '').replace(/"/g, '""')}"`,
                `"${(e.aktivitas || '').replace(/"/g, '""')}"`,
                `"${(e.metode_latihan || '').replace(/"/g, '""')}"`,
                `"${(e.output || '').replace(/"/g, '""')}"`,
                e.prioritas || '',
                e.status || '',
                e.fokus || '',
                `"${(e.catatan || '').replace(/"/g, '""')}"`
            ];
            csvContent += row.join(';') + '\n';
        });

        const cleanDate = (metadata.rawDate || new Date().toISOString().split('T')[0]).replace(/-/g, '');
        this.downloadFile(csvContent, `Summary_Jadwal_Harian_${cleanDate}.csv`, 'text/csv;charset=utf-8;');
    },

    // Cadangan JSON Lengkap
    exportBackupJSON(allData) {
        const jsonStr = JSON.stringify(allData, null, 2);
        const dateStr = new Date().toISOString().split('T')[0];
        this.downloadFile(jsonStr, `Backup_Jurnal_Biologis_${dateStr}.json`, 'application/json');
    }
};

window.DataExporter = DataExporter;
