// Master Data Rujukan Ilmiah, Jadwal Makan & Nutrisi, dan Metode Latihan Lengkap
const MASTER_PROTOKOL = {
    // 1. Jendela Waktu Regenerasi Biologis (Berdasarkan Riset)
    jendelaRegenerasi: [
        {
            dimensi: "Puncak Hormon HGH",
            waktu: "Pukul 22.00 – 02.00",
            proses: "Pelepasan 70–80% Human Growth Hormone saat deep sleep untuk memadatkan tulang, menambal serabut otot, dan membakar lemak perut (visceral fat).",
            kategori: "Hormonal & Regenerasi"
        },
        {
            dimensi: "Mitosis Kulit & Otak",
            waktu: "Pukul 01.00 – 04.00",
            proses: "Pembelahan sel kulit wajah hingga 30x lebih cepat dibanding siang hari dan pembersihan toksin saraf melalui sistem glimpatik otak.",
            kategori: "Seluler & Saraf"
        },
        {
            dimensi: "Lapisan Epitel Usus",
            waktu: "Siklus 3 – 5 Hari",
            proses: "Pembaruan lapisan mukosa pencernaan yang meningkatkan sensitivitas sinyal lapar, haus, dan efisiensi penyerapan nutrisi mikro.",
            kategori: "Pencernaan"
        },
        {
            dimensi: "Epidermis Kulit Wajah",
            waktu: "Siklus 27 – 40 Hari",
            proses: "Pergantian lapisan kulit permukaan secara menyeluruh sehingga wajah tampak ~30% lebih muda, kencang, segar, dan bebas sembab.",
            kategori: "Estetika & Fasia"
        },
        {
            dimensi: "Jaringan Otot & Fasia",
            waktu: "Siklus 30 – 90 Hari",
            proses: "Remodeling serabut otot punggung, perut, dada, dan bahu untuk mengunci memori postur baru (muscle memory V-taper).",
            kategori: "Muskuloskeletal"
        },
        {
            dimensi: "Matriks Tulang Rangka",
            waktu: "Siklus 3 – 6 Bulan",
            proses: "Siklus mikro remodeling tulang oleh osteoklas dan osteoblas pada titik tumpuan postur tulang belakang.",
            kategori: "Sistem Rangka"
        }
    ],

    // 2. Master Ritme Harian Nutrisi & Hidrasi (Jadwal Makan Sesuai PDF)
    ritmeMakan: [
        {
            id: "m1",
            jam: "05.30 - 06.00",
            fase: "Bangun & Hidrasi Seluler",
            menuUtama: "500 ml air mineral hangat + sejumput garam mineral (Himalayan / sea salt)",
            komposisi: "Elektrolit alami murni (tanpa kalori)",
            manfaatBiologis: "Menghidrasi sel muda & bantalan tulang belakang, mengaktifkan korset perut (Transversus Abdominis) saat perut kosong.",
            aktivitasPendamping: "Cat-Cow Stretch (10x) & Stomach Vacuum (5 set x 15 detik)",
            icon: "🌅"
        },
        {
            id: "m2",
            jam: "07.00 - 07.30",
            fase: "Sarapan Pembangun",
            menuUtama: "3 butir telur rebus / dadar tanpa minyak + 4 sdm nasi putih/merah + tumis sayur hijau",
            komposisi: "30% Karbohidrat Kompleks • 50% Protein • 20% Serat",
            manfaatBiologis: "Memasok asam amino untuk sintesis kolagen & regenerasi otot tanpa memicu lonjakan gula darah berlebih.",
            aktivitasPendamping: "Jalan pagi ringan 10 menit (opsional pemanasan sendi)",
            icon: "🍳"
        },
        {
            id: "m3",
            jam: "10.00 - 10.30",
            fase: "Selingan Pagi & Hidrasi Antara",
            menuUtama: "500 ml air mineral + 1 buah apel / pir / alpukat ATAU segenggam kacang almond / rebus",
            komposisi: "Serat Alami & Lemak Baik (Monounsaturated Fat)",
            manfaatBiologis: "Menjaga ritme metabolik basal (BMR) stabil dan mendukung pembaruan epitel usus.",
            aktivitasPendamping: "Peregangan bahu & leher di sela aktivitas kerja (2 menit)",
            icon: "🍏"
        },
        {
            id: "m4",
            jam: "12.30 - 13.00",
            fase: "Makan Siang Utama",
            menuUtama: "1 kepal nasi (100g) + 2 telapak tangan lauk protein (150g dada ayam bakar / ikan tongkol/kembung/salmon + tempe kukus/bacem) + 1 mangkuk sayur bening",
            komposisi: "40% Protein • 30% Karbohidrat • 30% Serat & Mineral",
            manfaatBiologis: "Bahan bakar pembentukan jaringan baru (fase anabolik/mTOR) dan pengisian glikogen terukur.",
            aktivitasPendamping: "Pertahankan postur duduk/berdiri tegak (aktifkan korset perut)",
            icon: "🍗"
        },
        {
            id: "m5",
            jam: "16.30 - 17.15",
            fase: "Hidrasi Selama Sesi Latihan",
            menuUtama: "500 ml air mineral murni diminum bertahap 3-4 teguk setiap jeda set",
            komposisi: "Hidrasi Elektrolit Murni",
            manfaatBiologis: "Mencegah dehidrasi bantalan tulang belakang (intervertebral discs) selama latihan beban/kompresi.",
            aktivitasPendamping: "Eksekusi latihan Sesi A / Sesi B V-Taper",
            icon: "💧"
        },
        {
            id: "m6",
            jam: "17.30 - 18.00",
            fase: "Nutrisi Pasca-Latihan (Recovery)",
            menuUtama: "2 putih telur rebus + 1 buah pisang ATAU whey / soy protein tanpa gula",
            komposisi: "Porsi Cepat Serap: Tinggi Protein & Rendah Lemak",
            manfaatBiologis: "Menghentikan katabolisme otot, mempercepat vaskularisasi pemulihan, dan meredakan asam laktat.",
            aktivitasPendamping: "Pendinginan & pernapasan diafragma dalam",
            icon: "🍌"
        },
        {
            id: "m7",
            jam: "19.00 - 19.30",
            fase: "Makan Malam Cut-Off (Pemicu Autofagi)",
            menuUtama: "150g ikan bakar / sup daging sapi tanpa lemak / ayam suwir + sayuran hijau (capcay / brokoli / bayam) — TANPA NASI / TEPUNG",
            komposisi: "70% Protein Bersih • 30% Sayuran Hijau (0% Karbohidrat Olahan)",
            manfaatBiologis: "Berhenti makan 2,5 jam sebelum tidur untuk menurunkan insulin, memicu autofagi (pembersihan sel rusak), dan memaksimalkan pelepasan HGH saat tidur.",
            aktivitasPendamping: "Mulai jendela puasa malam (fasting window)",
            icon: "🥗"
        },
        {
            id: "m8",
            jam: "21.30 - 05.30",
            fase: "Tidur Regenerasi HGH & Puasa",
            menuUtama: "200 ml air mineral (tidak berlebihan agar tidur tidak terputus) + Child's Pose 1 menit",
            komposisi: "Puasa Total 10–11 Jam (Hanya Air Putih)",
            manfaatBiologis: "Pelepasan 70–80% hormon pertumbuhan HGH (22.00–02.00) membakar lemak perut visceral dan memadatkan matriks tulang.",
            aktivitasPendamping: "Tidur lelap dalam ruangan gelap & sejuk",
            icon: "🛌"
        }
    ],

    // 3. Menu Fokus Nutrisi Mingguan (Senin s/d Minggu Sesuai PDF)
    menuMingguan: [
        {
            hari: "Senin",
            tema: "Tinggi Protein & Kolagen Pemula",
            fokusLauk: "Dada ayam panggang, telur, tempe bacem, tumis bayam",
            manfaat: "Mendukung hipertrofi pembentukan otot dada & bahu (Sesi A).",
            karbo: "Standar (Nasi 100g siang)",
            targetAir: "2.800 – 3.000 ml"
        },
        {
            hari: "Selasa",
            tema: "Tinggi Protein & Mineral Laut",
            fokusLauk: "Ikan laut (tongkol / kembung / salmon), tahu kukus, sup bayam jagung",
            manfaat: "Mineral zinc, kalsium, & magnesium untuk pemulihan bantalan tulang belakang (Sesi B).",
            karbo: "Standar (Nasi 100g siang)",
            targetAir: "3.000 ml"
        },
        {
            hari: "Rabu",
            tema: "Rendah Karbohidrat (Fat Burning)",
            fokusLauk: "Nasi siang dikurangi jadi 1/2 porsi (50g), perbanyak sup ikan/ayam & lalapan",
            manfaat: "Mengoptimalkan pembakaran lemak visceral & pelepasan fasia pada hari pemulihan aktif.",
            karbo: "Rendah (Low-Carb Day)",
            targetAir: "2.700 ml"
        },
        {
            hari: "Kamis",
            tema: "Tinggi Protein & Zat Besi",
            fokusLauk: "Daging sapi tanpa lemak / dada ayam, telur rebus, tumis buncis & brokoli",
            manfaat: "Mendukung pembentukan bahu bulat 3D & penguatan six-pack bawah (Sesi A).",
            karbo: "Standar (Nasi 100g siang)",
            targetAir: "2.800 – 3.000 ml"
        },
        {
            hari: "Jumat",
            tema: "Tinggi Protein & Omega-3 Anti-Inflamasi",
            fokusLauk: "Ikan bakar / pepes ikan mas/nila, telur dadar tanpa minyak, tempe, lalapan hijau",
            manfaat: "Menurunkan peradangan fasia punggung & memperkuat pelebaran sayap lats (Sesi B).",
            karbo: "Standar (Nasi 100g siang)",
            targetAir: "3.000 ml"
        },
        {
            hari: "Sabtu",
            tema: "Porsi Seimbang & Lemak Sehat",
            fokusLauk: "Dada ayam/ikan, kentang rebus / nasi merah, 1/2 buah alpukat, sayur bening",
            manfaat: "Menjaga elastisitas jaringan fasia tubuh & kilau peremajaan kulit wajah.",
            karbo: "Karbohidrat Kompleks",
            targetAir: "2.800 ml"
        },
        {
            hari: "Minggu",
            tema: "Clean Eating & Kaldu Tulang Kolagen",
            fokusLauk: "Sup kaldu tulang (bone broth) / ayam kampung, telur rebus, buah pepaya/jeruk segar",
            manfaat: "Menyediakan asam amino glisin & prolin untuk sintesis kolagen, mengunci hasil rekonstruksi.",
            karbo: "Ringan & Bersih",
            targetAir: "2.500 – 2.800 ml"
        }
    ],

    // 4. Jadwal Latihan Mingguan V-Taper & Six-Pack Lengkap dengan Metode
    jadwalLatihan: [
        {
            hari: "Senin",
            sesi: "Sesi A: Dada Bidang, Bahu Lebar & Six-Pack Atas",
            fokusOtot: "Pectoralis major, Deltoideus anterior & lateral, Rectus abdominis atas",
            waktu: "16.30 - 17.15 WIB",
            intensitas: "Minggu pertama: 70% kemampuan (istirahat antar-set 60 detik)",
            gerakan: [
                {
                    nama: "Standard / Incline Push-Up",
                    porsi: "3 set x 12 repetisi",
                    metode: "Posisi tangan selebar bahu, turunkan dada hingga 2 cm dari lantai secara terkontrol (2 detik turun, 1 detik dorong). Tahan korset perut agar pinggang tidak melorot.",
                    tujuan: "Penebalan otot dada tengah dan atas."
                },
                {
                    nama: "Pike Push-Up",
                    porsi: "3 set x 10 repetisi",
                    metode: "Bentuk tubuh seperti huruf V terbalik (pinggul di atas). Tekuk siku untuk menurunkan kepala ke arah lantai di depan tangan, lalu dorong kembali ke posisi awal.",
                    tujuan: "Pembentukan bahu depan & atas untuk mengangkat postur dada."
                },
                {
                    nama: "Lateral Raise (Botol 1,5L / Dumbbell)",
                    porsi: "3 set x 15 repetisi",
                    metode: "Berdiri tegak, angkat kedua tangan ke samping hingga sejajar bahu dengan siku sedikit ditekuk (posisi menuang air). Tahan 1 detik di puncak sebelum turun perlahan.",
                    tujuan: "Melebarkan bahu samping (deltoid lateral) untuk menciptakan siluet V-Taper."
                },
                {
                    nama: "Dead Bug",
                    porsi: "3 set x 10 repetisi per sisi",
                    metode: "Berbaring terlentang, angkat kedua tangan dan tekuk lutut 90 derajat. Turunkan tangan kanan dan kaki kiri bersamaan mendekati lantai tanpa membuat punggung bawah melengkung.",
                    tujuan: "Penguatan six-pack atas dan stabilisasi panggul (anterior pelvic tilt)."
                },
                {
                    nama: "Cobra Stretch",
                    porsi: "2 set x 30 detik",
                    metode: "Tengkurap, letakkan telapak tangan di samping dada, dorong dada ke atas sambil pinggul tetap menempel matras. Tarik napas perut dalam.",
                    tujuan: "Dekompresi ruas tulang punggung dan peregangan fasia perut."
                }
            ]
        },
        {
            hari: "Selasa",
            sesi: "Sesi B: Sayap (Lats), Punggung & Korset Perut",
            fokusOtot: "Latissimus dorsi, Rhomboids, Erector spinae, Transversus abdominis",
            waktu: "16.30 - 17.15 WIB",
            intensitas: "Minggu pertama: 70% kemampuan (istirahat antar-set 60 detik)",
            gerakan: [
                {
                    nama: "Dead Hang (Bergantung Pasif)",
                    porsi: "3 set x 30 detik",
                    metode: "Grip pull-up bar dengan kedua tangan terbuka selebar bahu. Biarkan seluruh berat badan bawah menarik tulang belakang secara alami. Rilekskan leher dan bernapas lewat perut.",
                    tujuan: "Dekompresi bantalan tulang belakang, meredakan sensasi pegal, dan membuka sayap."
                },
                {
                    nama: "Doorway Row / Australian Pull-Up",
                    porsi: "3 set x 12 repetisi",
                    metode: "Pegang kusen pintu kokoh atau palang rendah. Rebahkan badan ke belakang, tarik dada mendekati kusen dengan memfokuskan tarikan pada otot sayap dan punggung tengah.",
                    tujuan: "Penebalan otot lats dan trapezius untuk postur punggung kekar."
                },
                {
                    nama: "Prone Y-T-W Raises",
                    porsi: "3 set x 8 repetisi",
                    metode: "Tengkurap di matras, angkat sedikit dada. Bentuk Y (tahan 2 detik) -> bentuk T (tahan 2 detik) -> tarik siku ke W sambil merapatkan tulang belikat (tahan 2 detik).",
                    tujuan: "Mengunci memori postur tegak gagah dan mengaktifkan otot postural dalam."
                },
                {
                    nama: "Forearm Plank",
                    porsi: "3 set x 45 detik",
                    metode: "Tumpuan pada siku dan ujung jari kaki. Tarik pusar ke dalam (aktifkan korset perut), kunci glutes, tahan tubuh lurus seperti papan kayu.",
                    tujuan: "Pengencangan otot korset dalam untuk menopang beban perut depan."
                },
                {
                    nama: "Child's Pose",
                    porsi: "1 menit",
                    metode: "Duduk bertumpu pada tumit, rentangkan kedua tangan lurus ke depan di lantai, tempelkan kening ke matras sambil bernapas panjang.",
                    tujuan: "Pelepasan ketegangan otot punggung bawah dan fasia pinggul."
                }
            ]
        },
        {
            hari: "Rabu",
            sesi: "Pemulihan Aktif: Pelepasan Fasia & Pembakaran Lemak",
            fokusOtot: "Sistem limfatik, Fasia tubuh, Transversus abdominis, Mobilitas vertebra",
            waktu: "16.30 - 17.15 WIB",
            intensitas: "Ringan & Memulihkan (Zone 2 Cardio & Mobility)",
            gerakan: [
                {
                    nama: "Jalan Cepat Santai",
                    porsi: "30 menit tanpa henti",
                    metode: "Jalan kaki dengan langkah tegap, ayunkan tangan rileks. Pertahankan detak jantung di kisaran ringan (bisa sambil mengobrol).",
                    tujuan: "Memperlancar drainase limfatik wajah, membakar asam lemak bebas, dan vaskularisasi."
                },
                {
                    nama: "Cat-Cow Stretch",
                    porsi: "15 repetisi lembut",
                    metode: "Posisi merangkak. Tarik napas sambil melengkungkan punggung ke bawah dan melihat ke atas (Cow); buang napas sambil melengkungkan punggung ke atas seperti kucing (Cat).",
                    tujuan: "Melumasi cairan sinovial sendi tulang belakang dan melepaskan kaku."
                },
                {
                    nama: "Stomach Vacuum",
                    porsi: "5 set x 15 detik",
                    metode: "Buang napas total lewat mulut, hisap perut sedalam mungkin ke arah punggung. Tahan 15 detik dengan napas tipis di dada.",
                    tujuan: "Mengecilkan lingkar pinggang dan mengencangkan dinding perut dalam."
                },
                {
                    nama: "Child's Pose",
                    porsi: "2 menit rileks",
                    metode: "Istirahat dekompresi penuh dengan tarikan napas diafragma dalam.",
                    tujuan: "Memberikan sinyal relaksasi ke sistem saraf parasimpatis."
                }
            ]
        },
        {
            hari: "Kamis",
            sesi: "Sesi A: Dada Bidang, Bahu Bulat & Six-Pack Bawah",
            fokusOtot: "Pectoralis major, Deltoid lateral, Rectus abdominis bawah, Obliques",
            waktu: "16.30 - 17.15 WIB",
            intensitas: "Porsi Penuh: 4 set (istirahat 60 detik)",
            gerakan: [
                {
                    nama: "Standard Push-Up",
                    porsi: "4 set x 12 repetisi",
                    metode: "Tempo 2-1-1 (2 detik turun, 1 detik jeda bawah, 1 detik dorong eksplosif).",
                    tujuan: "Daya tahan dan hipertrofi otot dada bidang."
                },
                {
                    nama: "Pike Push-Up",
                    porsi: "3 set x 10 repetisi",
                    metode: "Jaga kaki tetap lurus sebisa mungkin agar beban fokus 100% pada bahu.",
                    tujuan: "Pembentukan bahu bulat 3D kokoh."
                },
                {
                    nama: "Lateral Raise",
                    porsi: "4 set x 15 repetisi",
                    metode: "Gunakan beban bertahap (1,5 kg atau dumbbell), fokus pada kontraksi samping bahu.",
                    tujuan: "Pelebaran ilusi pinggang kecil bahu lebar."
                },
                {
                    nama: "Dead Bug",
                    porsi: "3 set x 12 repetisi per sisi",
                    metode: "Gerakan lambat dan penuh kendali, tahan perut bawah selalu aktif menempel lantai.",
                    tujuan: "Memperkuat six-pack bagian bawah dan mengoreksi anterior pelvic tilt."
                },
                {
                    nama: "Cobra Stretch",
                    porsi: "2 set x 30 detik",
                    metode: "Peregangan pasca-latihan untuk mempercepat sintesis kolagen fasia dada.",
                    tujuan: "Mencegah kekakuan dada dan bahu depan."
                }
            ]
        },
        {
            hari: "Jumat",
            sesi: "Sesi B: Pelebaran Sayap & Penguncian Postur Gagah",
            fokusOtot: "Latissimus dorsi, Teres major, Scapular retractors, Core stability",
            waktu: "16.30 - 17.15 WIB",
            intensitas: "Porsi Penuh: 4 set (istirahat 60 detik)",
            gerakan: [
                {
                    nama: "Active Hang (Bergantung Aktif)",
                    porsi: "3 set x 30 detik",
                    metode: "Bergantung pada palang, tarik tulang belikat ke bawah dan ke belakang (scapular pull) sehingga telinga menjauh dari bahu.",
                    tujuan: "Mengunci kestabilan sendi bahu dan aktivasi lats maksimal."
                },
                {
                    nama: "Australian Pull-Up (Inverted Row)",
                    porsi: "4 set x 12 repetisi",
                    metode: "Tarik palang hingga menyentuh dada bawah, tahan 1 detik sambil merapatkan belikat.",
                    tujuan: "Pelebaran sayap punggung dan vaskularisasi otot punggung."
                },
                {
                    nama: "Prone Y-T-W Raises",
                    porsi: "3 set x 10 repetisi",
                    metode: "Pertahankan jempol menghadap langit-langit pada setiap huruf untuk rotasi eksternal bahu.",
                    tujuan: "Penguncian postur tegap otomatis saat berdiri maupun duduk."
                },
                {
                    nama: "Forearm Plank",
                    porsi: "3 set x 60 detik",
                    metode: "Tahan korset perut kencang tanpa menaikkan atau menurunkan pinggul.",
                    tujuan: "Kekuatan isometrik otot perut dalam."
                },
                {
                    nama: "Child's Pose",
                    porsi: "1 menit rileks",
                    metode: "Pelepasan kompresi bantalan tulang belakang pasca-latihan.",
                    tujuan: "Memulihkan aliran darah ke jaringan lunak punggung."
                }
            ]
        },
        {
            hari: "Sabtu",
            sesi: "Mobilitas: Kelenturan Sendi & Kardio Perut",
            fokusOtot: "Fleksibilitas seluruh rantai fasia, Transversus abdominis, Sistem kardio",
            waktu: "Pagi / Sore (Fleksibel)",
            intensitas: "Sedang & Menyenangkan",
            gerakan: [
                {
                    nama: "Vinyasa Yoga / Animal Flow / Berenang",
                    porsi: "30 menit",
                    metode: "Lakukan gerakan dinamis yang melibatkan rotasi panggul, peregangan paha depan, dan pembukaan dada.",
                    tujuan: "Menjaga elastisitas fasia tubuh dan kesegaran sirkulasi darah wajah."
                },
                {
                    nama: "Stomach Vacuum",
                    porsi: "5 set x 20 detik",
                    metode: "Tingkatkan durasi tahanan menjadi 20 detik dengan pengosongan paru-paru penuh.",
                    tujuan: "Mengencangkan korset perut secara mendalam."
                }
            ]
        },
        {
            hari: "Minggu",
            sesi: "Istirahat Total: Rekonstruksi Seluler & Tulang",
            fokusOtot: "Sistem pemulihan, Sintesis kolagen, Remodeling osteoblas tulang",
            waktu: "Sepanjang Hari",
            intensitas: "Istirahat Total (Tanpa Beban)",
            gerakan: [
                {
                    nama: "Peregangan Bangun Tidur (Cat-Cow & Stomach Vacuum)",
                    porsi: "5 menit saja",
                    metode: "Lakukan secara santai setelah bangun pagi dan minum air hangat garam.",
                    tujuan: "Membangunkan organ dalam dan mempersiapkan postur hari istirahat."
                },
                {
                    nama: "Istirahat Total & Tidur Nyenyak",
                    porsi: "8 Jam Penuh",
                    metode: "Tidur sebelum jam 22.00 untuk memaksimalkan siklus anabolik peremajaan sel.",
                    tujuan: "Mengunci seluruh adaptasi latihan dan nutrisi selama sepekan."
                }
            ]
        }
    ],

    // 5. Panduan Teknis 3 Gerakan Kunci & Batas Medis
    gerakanKunci: [
        {
            nama: "Stomach Vacuum (Pengempes Perut Buncit)",
            tujuan: "Mengaktifkan otot korset dalam (Transversus Abdominis) untuk meratakan perut buncit dan mengambil alih beban punggung bawah.",
            instruksi: "1. Berdiri tegak atau posisi merangkak.\n2. Buang napas sampai benar-benar habis melalui mulut.\n3. Tarik pusar sedalam mungkin ke arah tulang belakang (seolah menempelkan perut ke punggung).\n4. Tahan selama 15–20 detik sambil tetap bernapas tipis dan dangkal di dada.\n5. Lepaskan perlahan dan ambil 2 napas normal sebelum memulai set berikutnya.",
            target: "5 set x 15–20 detik (setiap pagi saat perut kosong)"
        },
        {
            nama: "Dead Hang (Penghilang Pegal & Pembuka Sayap)",
            tujuan: "Mendekompresi bantalan tulang belakang (intervertebral discs), meredakan pegal punggung, dan mengaktifkan otot sayap (lats).",
            instruksi: "1. Bergantung dengan kedua tangan di pull-up bar atau kusen pintu yang kokoh.\n2. Buka tangan selebar bahu dengan telapak menghadap ke depan.\n3. Biarkan beban tubuh bagian bawah menarik tulang punggung ke bawah secara alami.\n4. Rilekskan bahu, atur napas perut yang panjang dan teratur selama 20–30 detik.",
            target: "3 set x 30 detik (sore hari atau setelah latihan)"
        },
        {
            nama: "Prone Y-T-W Raises (Pengunci Postur Gagah)",
            tujuan: "Memperkuat erector spinae, rhomboids, dan rotator cuff untuk mempertahankan postur dada bidang otomatis.",
            instruksi: "1. Berbaring tengkurap di matras, angkat sedikit dada dari lantai.\n2. Posisi Y: Rentangkan kedua lengan ke depan membentuk huruf Y (jempol menghadap ke atas), tahan 2 detik.\n3. Posisi T: Geser kedua lengan lurus ke samping membentuk huruf T, tahan 2 detik.\n4. Posisi W: Tarik kedua siku ke bawah ke arah pinggang membentuk huruf W sambil merapatkan tulang belikat sekuat tenaga, tahan 2 detik.\n5. Kembali ke posisi awal. Itu dihitung 1 repetisi.",
            target: "3 set x 8–10 repetisi"
        }
    ],

    // 6. Indikator Keberhasilan & Batas Aman Medis (Red Flags)
    batasMedis: {
        tandaTuntas: "Rasa lapar dan haus kembali tenang/normal, rasa pegal/panas di punggung hilang sepenuhnya, lingkar perut menyusut, postur tegak secara otomatis, dan kesegaran wajah bertahan stabil (~30% tampak lebih muda).",
        redFlags: "Segera lakukan evaluasi medis ke dokter apabila muncul: 1) Demam tinggi, 2) Nyeri tajam menjalar ke kaki/tangan (indikasi saraf terjepit), 3) Sesak napas, atau 4) Rasa haus ekstrem yang disertai buang air kecil terus-menerus di malam hari dan tubuh lemas setelah makan (evaluasi profil gula darah).",
        penangananPunggung: "Sensasi panas, kencang, dan pegal di punggung adalah tanda peningkatan vaskularisasi dan termogenesis otot postural yang sedang bekerja ekstra menyeimbangkan beban perut (anterior pelvic tilt). Hindari kerokan terlalu keras agar tidak merusak kapiler permukaan. Gunakan peregangan dekompresi (Dead Hang & Child's Pose) serta mandi/kompres air hangat."
    },

    // 7. Pilihan Terstandarisasi Metode Latihan & Prinsip Eksekusi (PDF Catatan Kesehatan)
    metodeLatihanPilihan: [
        {
            id: "adaptasi_70",
            nama: "Adaptasi 70% Kemampuan (Minggu I - Hindari Failure)",
            kategori: "Adaptasi Fisiologis",
            badgeClass: "badge-warning",
            tempo: "2-1-1 (Terkontrol)",
            istirahat: "60 - 90 detik antar-set",
            deskripsi: "Intensitas dibatasi pada 70% batas kemampuan maksimal. Menghindari kelelahan ekstrem hingga otot gemetar hebat untuk mencegah peradangan fasia berlebih pada minggu permulaan."
        },
        {
            id: "tempo_terkontrol",
            nama: "Tempo Terkontrol 2-1-1 (Mind-Muscle Connection)",
            kategori: "Hipertrofi & Pembentukan",
            badgeClass: "badge-primary",
            tempo: "2 detik turun, 1 detik tahan, 1 detik naik",
            istirahat: "60 detik antar-set",
            deskripsi: "Fase negatif (eksentrik) 2 detik, jeda kontraksi 1 detik di dasar/puncak, fase positif (konsentrik) 1 detik. Menjaga tegangan mekanis otot tanpa momentum."
        },
        {
            id: "isometrik_korset",
            nama: "Isometrik Korset Perut (Transversus Abdominis)",
            kategori: "Pengencangan Inti & V-Taper",
            badgeClass: "badge-success",
            tempo: "Kontraksi Statis (15 - 60 detik)",
            istirahat: "30 - 45 detik antar-set",
            deskripsi: "Stomach Vacuum & Forearm Plank dengan menarik pusar sedalam mungkin ke arah tulang belakang. Mengencangkan dinding dalam perut untuk meratakan perut buncit."
        },
        {
            id: "dekompresi_pasif",
            nama: "Dekompresi Pasif Fasia & Tulang Belakang (Dead Hang)",
            kategori: "Dekompresi Postural",
            badgeClass: "badge-info",
            tempo: "Relaksasi Gravitasi Alami (30 detik)",
            istirahat: "45 detik antar-set",
            deskripsi: "Bergantung pasif di pull-up bar (Dead Hang 3x30s) dan Child's Pose. Meregangkan bantalan antar-tulang belakang, membuka lebar sayap lats, dan menghilangkan pegal punggung."
        },
        {
            id: "zone2_recovery",
            nama: "Zone 2 Pemulihan Aktif & Drainase Limfatik",
            kategori: "Regenerasi & Kardio Ringan",
            badgeClass: "badge-secondary",
            tempo: "Irama Statis Santai (30 - 45 menit)",
            istirahat: "Tanpa henti (Heart Rate 60-70%)",
            deskripsi: "Jalan santai/cepat 30-45 menit dengan pernapasan hidung tenang. Membantu pembersihan asam laktat, membakar lemak visceral, dan melancarkan sirkulasi cairan wajah tanpa memicu hormon stres kortisol."
        },
        {
            id: "beban_penuh_100",
            nama: "Porsi Penuh 100% & Beban Progresif (Progresi Lanjutan)",
            kategori: "Hipertrofi Maksimal",
            badgeClass: "badge-danger",
            tempo: "2-1-1 Kuat Bertenaga",
            istirahat: "60 - 90 detik antar-set",
            deskripsi: "Eksekusi seluruh set dan repetisi penuh setelah fase adaptasi terlewati. Memaksimalkan stimulus penebalan otot dada bidang dan sayap punggung V-Taper."
        },
        {
            id: "mobilitas_fasia",
            nama: "Mobilitas Dinamis & Peregangan Sendi (Cobra & Rotasi)",
            kategori: "Kelenturan & Stabilitas",
            badgeClass: "badge-warning",
            tempo: "Peregangan Berirama Halus",
            istirahat: "Sesuai ritme napas",
            deskripsi: "Cat-Cow, Cobra Stretch, rotasi panggul, dan peregangan paha depan untuk memulihkan kelenturan tulang belakang serta meluruskan kemiringan panggul (anterior pelvic tilt)."
        },
        {
            id: "tanpa_latihan",
            nama: "Non-Latihan Fisik (Aktivitas Kerja / Harian)",
            kategori: "Umum",
            badgeClass: "badge-outline",
            tempo: "-",
            istirahat: "-",
            deskripsi: "Digunakan untuk aktivitas pekerjaan rutin, rapat, riset, atau hari istirahat total di mana tidak ada sesi olah tubuh yang dilakukan."
        }
    ]
};

window.MASTER_PROTOKOL = MASTER_PROTOKOL;
