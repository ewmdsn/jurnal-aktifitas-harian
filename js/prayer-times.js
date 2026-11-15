// Modul Realtime Waktu Salat & Penanggalan Astronomis Otomatis (Kemenag RI Standard)

const PRAYER_CITIES = {
    'jakarta': { name: 'DKI Jakarta & Sekitarnya (WIB)', lat: -6.2088, lng: 106.8456, tz: 7 },
    'surabaya': { name: 'Surabaya & Jawa Timur (WIB)', lat: -7.2575, lng: 112.7521, tz: 7 },
    'bandung': { name: 'Bandung & Jawa Barat (WIB)', lat: -6.9175, lng: 107.6191, tz: 7 },
    'semarang': { name: 'Semarang & Jawa Tengah (WIB)', lat: -6.9667, lng: 110.4167, tz: 7 },
    'yogyakarta': { name: 'DI Yogyakarta (WIB)', lat: -7.7956, lng: 110.3695, tz: 7 },
    'medan': { name: 'Medan & Sumatra Utara (WIB)', lat: 3.5952, lng: 98.6722, tz: 7 },
    'palembang': { name: 'Palembang & Sumatra Selatan (WIB)', lat: -2.9761, lng: 104.7754, tz: 7 },
    'makassar': { name: 'Makassar & Sulsel (WITA)', lat: -5.1477, lng: 119.4327, tz: 8 },
    'denpasar': { name: 'Denpasar Bali (WITA)', lat: -8.6705, lng: 115.2126, tz: 8 },
    'banjarmasin': { name: 'Banjarmasin (WITA)', lat: -3.3194, lng: 114.5908, tz: 8 },
    'jayapura': { name: 'Jayapura Papua (WIT)', lat: -2.5916, lng: 140.6690, tz: 9 }
};

class PrayerTimesManager {
    constructor() {
        this.selectedCityKey = localStorage.getItem('jurnal_prayer_city') || 'jakarta';
        this.currentTimes = null;
        this.nextPrayer = null;
        this.clockInterval = null;
        this.init();
    }

    init() {
        this.updateClockAndPrayer();
        this.clockInterval = setInterval(() => {
            this.updateClockAndPrayer();
        }, 1000);
    }

    getCityConfig() {
        return PRAYER_CITIES[this.selectedCityKey] || PRAYER_CITIES['jakarta'];
    }

    setCity(cityKey) {
        if (PRAYER_CITIES[cityKey]) {
            this.selectedCityKey = cityKey;
            localStorage.setItem('jurnal_prayer_city', cityKey);
            this.updateClockAndPrayer();
            if (window.app) {
                window.app.renderSummaryDashboard();
            }
        }
    }

    // Perhitungan Astronomis Waktu Salat (Standar Kemenag RI / Sudut Matahari)
    calculate(dateInput) {
        const d = dateInput instanceof Date ? dateInput : new Date(dateInput + 'T00:00:00');
        const city = this.getCityConfig();
        const lat = city.lat;
        const lng = city.lng;
        const tz = city.tz;

        const rad = deg => deg * Math.PI / 180;
        const deg = r => r * 180 / Math.PI;

        // Hari ke-n dalam tahun
        const start = new Date(d.getFullYear(), 0, 0);
        const diff = d - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);

        // Deklinasi Matahari & Perataan Waktu (Equation of Time)
        const b = rad(360 * (dayOfYear - 81) / 365);
        const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b); // menit
        const decl = 23.45 * Math.sin(rad(360 * (284 + dayOfYear) / 365)); // derajat

        // Transit Matahari (Waktu Tengah Hari Solar Noon)
        const noon = 12 + (tz * 15 - lng) / 15 - (eot / 60);

        function hourAngle(alt) {
            const cosH = (Math.sin(rad(alt)) - Math.sin(rad(lat)) * Math.sin(rad(decl))) /
                         (Math.cos(rad(lat)) * Math.cos(rad(decl)));
            if (cosH > 1 || cosH < -1) return null;
            return deg(Math.acos(cosH)) / 15;
        }

        // Subuh: sudut -20 derajat (Standar Kemenag RI) + 2 menit ihtiyat
        const haSubuh = hourAngle(-20) || 7.2;
        const subuhH = noon - haSubuh + (2 / 60);

        // Terbit: sudut -0.833 derajat
        const haSunrise = hourAngle(-0.833) || 6.0;
        const sunriseH = noon - haSunrise;

        // Dzuhur: tengah hari + 2 menit ihtiyat
        const dzuhurH = noon + (2 / 60);

        // Ashar: bayangan = panjang benda + bayangan tengah hari (Mazhab Syafi'i)
        const asharAlt = deg(Math.atan(1 / (1 + Math.tan(rad(Math.abs(lat - decl))))));
        const haAshar = hourAngle(asharAlt) || 3.1;
        const asharH = noon + haAshar + (2 / 60);

        // Maghrib: terbenam matahari (-0.833 derajat) + 2 menit ihtiyat
        const maghribH = noon + haSunrise + (2 / 60);

        // Isya: sudut -18 derajat + 2 menit ihtiyat
        const haIsya = hourAngle(-18) || 6.8;
        const isyaH = noon + haIsya + (2 / 60);

        const formatHHMM = val => {
            let totalMins = Math.round(val * 60);
            let h = Math.floor(totalMins / 60) % 24;
            let m = totalMins % 60;
            return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
        };

        const addMinutes = (hhmm, mins) => {
            const [h, m] = hhmm.split(':').map(Number);
            let tot = h * 60 + m + mins;
            let nh = Math.floor(tot / 60) % 24;
            let nm = tot % 60;
            return String(nh).padStart(2, '0') + ':' + String(nm).padStart(2, '0');
        };

        const subuhStr = formatHHMM(subuhH);
        const dzuhurStr = formatHHMM(dzuhurH);
        const asharStr = formatHHMM(asharH);
        const maghribStr = formatHHMM(maghribH);
        const isyaStr = formatHHMM(isyaH);

        return {
            subuh: subuhStr,
            subuhSelesai: addMinutes(subuhStr, 30),
            terbit: formatHHMM(sunriseH),
            dzuhur: dzuhurStr,
            dzuhurSelesai: addMinutes(dzuhurStr, 30),
            ashar: asharStr,
            asharSelesai: addMinutes(asharStr, 30),
            maghrib: maghribStr,
            maghribSelesai: addMinutes(maghribStr, 30),
            isya: isyaStr,
            isyaSelesai: addMinutes(isyaStr, 30),
            cityName: city.name,
            tz: city.tz
        };
    }

    updateClockAndPrayer() {
        const now = new Date();
        const city = this.getCityConfig();

        // Realtime Clock Display
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const tzAbbr = city.tz === 7 ? 'WIB' : (city.tz === 8 ? 'WITA' : 'WIT');
        const clockStr = `${hours}:${minutes}:${seconds} ${tzAbbr}`;

        const elClock = document.getElementById('realtime-clock-display');
        if (elClock) elClock.innerText = clockStr;

        // Current date in Indonesian
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const dateStr = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
        const elDate = document.getElementById('realtime-date-display');
        if (elDate) elDate.innerText = dateStr;

        // Prayer times for today
        const pt = this.calculate(now);
        this.currentTimes = pt;

        // Determine Next Prayer & Countdown
        const nowMins = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
        const toMins = timeStr => {
            const [h, m] = timeStr.split(':').map(Number);
            return h * 60 + m;
        };

        const schedule = [
            { name: 'Subuh', time: pt.subuh, mins: toMins(pt.subuh), icon: '🌅' },
            { name: 'Dzuhur', time: pt.dzuhur, mins: toMins(pt.dzuhur), icon: '☀️' },
            { name: 'Ashar', time: pt.ashar, mins: toMins(pt.ashar), icon: '🌤️' },
            { name: 'Maghrib', time: pt.maghrib, mins: toMins(pt.maghrib), icon: '🌇' },
            { name: 'Isya', time: pt.isya, mins: toMins(pt.isya), icon: '🌙' }
        ];

        let next = null;
        for (const item of schedule) {
            if (item.mins > nowMins) {
                next = item;
                break;
            }
        }

        // If all prayers passed today, next is Subuh tomorrow
        let diffMinutes = 0;
        if (next) {
            diffMinutes = Math.round(next.mins - nowMins);
        } else {
            next = schedule[0]; // Subuh tomorrow
            diffMinutes = Math.round((24 * 60 - nowMins) + schedule[0].mins);
        }

        const remH = Math.floor(diffMinutes / 60);
        const remM = diffMinutes % 60;
        const countdownStr = remH > 0 ? `${remH} jam ${remM} menit` : `${remM} menit`;

        // Update UI Badges
        const elNext = document.getElementById('prayer-next-badge');
        if (elNext) {
            elNext.innerHTML = `<span>${next.icon} Menuju <strong>${next.name} (${next.time})</strong>: <strong>${countdownStr} lagi</strong></span>`;
        }

        const elBar = document.getElementById('prayer-times-bar');
        if (elBar) {
            elBar.innerHTML = `
                <div class="prayer-time-pill ${next && next.name === 'Subuh' ? 'active-next' : ''}">
                    <span class="p-name">Subuh</span><span class="p-time">${pt.subuh}</span>
                </div>
                <div class="prayer-time-pill ${next && next.name === 'Dzuhur' ? 'active-next' : ''}">
                    <span class="p-name">Dzuhur</span><span class="p-time">${pt.dzuhur}</span>
                </div>
                <div class="prayer-time-pill ${next && next.name === 'Ashar' ? 'active-next' : ''}">
                    <span class="p-name">Ashar</span><span class="p-time">${pt.ashar}</span>
                </div>
                <div class="prayer-time-pill ${next && next.name === 'Maghrib' ? 'active-next' : ''}">
                    <span class="p-name">Maghrib</span><span class="p-time">${pt.maghrib}</span>
                </div>
                <div class="prayer-time-pill ${next && next.name === 'Isya' ? 'active-next' : ''}">
                    <span class="p-name">Isya</span><span class="p-time">${pt.isya}</span>
                </div>
            `;
        }
    }
}

window.prayerManager = new PrayerTimesManager();
