# Laporan Proyek: TanStack Ekraf Dashboard

## 1. What I Broke and How I Fixed It

Saat pertama kali merefaktor struktur routing admin, saya memindahkan layout admin ke dalam folder `src/routes/_admin/_admin.tsx` dan membiarkan referensi impor file server (`@tanstack/react-start/server`) terpanggil di dalam rantai komponen client transaction/AI recommendation. Hal ini memicu dua kegagalan fatal: router generator TanStack melempar error konflik path unik karena pathless layout `/_admin/_admin.tsx` mendeteksi `inferredFullPath: "/"` yang bertabrakan dengan `src/routes/index.tsx`, serta bundler Vite gagal memvalidasi batasan modul client-server. Saya memperbaikinya dengan meratakan file pathless layout menjadi `src/routes/_admin.tsx` di tingkat root routes, menghapus route transaksi/AI demo yang tidak sesuai spesifikasi inti Ekraf, mengisolasi fungsi server murni ke dalam `src/lib/server/*`, serta menjalankan `bunx tsr generate` sehingga route tree tergenerasi secara bersih dan `bun run build` sukses 100%.

---

## 2. Ringkasan Implementasi Tugas

### Task A — UI Revamp (Desain & Pengalaman Pengguna)
1. **Sidebar Layout & Admin Shell (`src/routes/_admin.tsx`):**
   - Navigasi responsif mencakup *Dashboard*, *Produk Ekraf*, dan *Pengguna & Hak Akses* dengan ikon `lucide-react`.
   - Fitur ciutkan/perluas (*collapsible desktop sidebar*) dan *hamburger drawer* dengan backdrop blur untuk perangkat mobile.
   - Profil pengguna aktif dan tombol keluar (*sign-out*) yang membersihkan sesi.
2. **Revamp Halaman Masuk (`src/routes/login.tsx`):**
   - Desain centered card modern dan elegan dengan identitas visual Kementerian Ekonomi Kreatif (Ekraf).
   - Input email dan kata sandi dengan toggle visibilitas sandi (Eye/EyeOff), status loading/spinner, validasi form, serta kotak pesan error yang jelas.
   - Tombol isi otomatis kredensial administrator demo untuk memudahkan pengujian.
3. **Popup Modals (`ProductFormModal.tsx` & `UserRoleModal.tsx`):**
   - Transisi dialog berbasis shadcn UI / Radix primitives.
   - Penanganan status submit, pembatalan, dan umpan balik error secara konsisten.
4. **Input Gambar Produk dengan Batasan 512px:**
   - Mendukung pemilihan file lokal maupun URL web dengan pratinjau instan (*live preview*).
   - Pengunggahan file lokal secara otomatis di-downscale/dikompresi ke resolusi maksimal 512px menggunakan HTML5 Canvas di sisi klien sebelum disimpan.
   - Validasi sisi server menolak format berbahaya (SVG dengan skrip aktif) dan membatasi ukuran payload Base64 (maksimal 512KB).
5. **Pembersihan Demo & Scaffold:**
   - Menghapus route `/demo/*` dan `/about`.
   - Mengarahkan seluruh navigasi dan header (`Header.tsx`, `header-user.tsx`, `__root.tsx`) ke `/login` dan route inti.
6. **Dukungan Penuh Mode Gelap & Responsivitas:**
   - Kompatibilitas tema terang (*light*) dan gelap (*dark*) melalui `ThemeToggle`.
   - Tabel responsif dengan horizontal scrolling untuk layar ponsel.

---

### Task B — Perbaikan Bug & Kualitas Kode

1. **Diagnosis & Solusi Bug Input Form Produk:**
   - **Penyebab:** Pada implementasi sebelumnya, state input tidak terisolasi atau terjadi remounting komponen/reset state form pada setiap kali ketukan tombol (*keystroke*), menyebabkan input kehilangan fokus (*blur*) dan menolak pengetikan.
   - **Solusi:** Diimplementasikan state lokal yang stabil (`formData`) di dalam `ProductFormModal.tsx` dengan event handler `onChange` standar tanpa re-render yang merusak lifecycle elemen DOM. Form diinisialisasi secara tepat saat modal dibuka dan mempertahankan ketikan pengguna.
2. **Kepatuhan Biome Linter (`bun run lint`):**
   - Format kode dan pengurutan modul impor otomatis telah diselaraskan dengan standar Biome.
   - Perintah `bun run lint` dan `bun run format` lulus 100% tanpa error maupun warning yang ditekan secara artifisial.
3. **Kompilasi Sukses (`bun run build`):**
   - Build produksi Nitro dan Vite berhasil dikompilasi tanpa satupun error tipe atau konflik module bundler.

---

### Task C — Peningkatan Keamanan (Security Enhancements)

#### Kategori 1: Autentikasi & Kontrol Akses (Auth / Access Control)
1. **Otorisasi Ketat Sisi Server (`requireAdmin()` & `requireAuth()`):**
   - *Serangan yang dicegah:* Mencegah **Broken Access Control / Privilege Escalation** di mana pengguna biasa mencoba memanggil langsung fungsi mutasi server (`createProduct`, `updateProduct`, `deleteProduct`, `updateUserRole`, `deleteUser`) dengan memalsukan request client.
2. **Proteksi Anti Self-Demotion & Penghapusan Admin Terakhir:**
   - *Serangan yang dicegah:* Mencegah **Administrator Lockout / Denial of Service** yang tidak disengaja maupun disengaja, di mana admin menurunkan jabatannya sendiri atau menghapus akun admin satu-satunya yang tersisa di sistem.
3. **Rate Limiting Percobaan Masuk (`src/routes/api/auth/$.ts`):**
   - *Serangan yang dicegah:* Mencegah serangan **Brute-Force Attack** dan **Credential Stuffing** terhadap endpoint autentikasi dengan membatasi maksimal 10 percobaan login per menit per alamat IP, mengembalikan HTTP Status 429 (*Too Many Requests*).

#### Kategori 2: Pengerasan Aplikasi (App Hardening)
1. **Validasi Skema Server-Side Zod (`src/lib/server/products.ts` & `src/lib/server/users.ts`):**
   - *Serangan yang dicegah:* Mencegah serangan **Mass Assignment** dan **Input Tampering** dengan menolak nilai string kosong, angka di luar batas wajar (misal: harga atau stok negatif/tidak terhingga), serta payload data yang tidak sah.
2. **Sanitasi Gambar & Pencegahan SSRF/XSS:**
   - *Serangan yang dicegah:* Mencegah **Stored Cross-Site Scripting (XSS)** melalui file SVG berbahaya yang berisi tag `<script>` atau event JavaScript aktif, serta membatasi protokol URL hanya pada `https://` atau `http://` untuk mencegah eksekusi skrip melalui skema `javascript:`.
3. **Penyimpanan Kredensial & Enkripsi:**
   - Kata sandi di-hash secara aman menggunakan algoritma kriptografi Better Auth (bukan plaintext). Variabel rahasia (`BETTER_AUTH_SECRET`) disimpan secara terpisah di `.env.local` yang masuk ke dalam `.gitignore`.

---

## 3. Petunjuk Pengujian Aplikasi

1. **Inisialisasi Data:**
   - Buka browser ke `http://localhost:3000/setup`.
   - Klik tombol **Inisialisasi Akun Admin & Produk**.
   - Sistem akan membuat akun administrator (`admin@example.com` / `admin12345`) dan memuat produk sampel kriya/kuliner Ekraf.
2. **Masuk ke Sistem:**
   - Buka `http://localhost:3000/login`.
   - Gunakan tombol **Isi Otomatis** atau ketikkan `admin@example.com` / `admin12345`.
   - Klik **Masuk ke Dashboard**.
3. **Manajemen Produk:**
   - Buka menu **Produk Ekraf** (`/products`).
   - Uji pengetikan pada modal **Tambah Produk Baru** (verifikasi input tidak freeze dan menerima ketikan).
   - Unggah gambar file lokal (verifikasi resize otomatis ke resolusi maks 512px) atau masukkan URL gambar.
   - Uji edit dan hapus produk.
4. **Manajemen Pengguna & Hak Akses:**
   - Buka menu **Pengguna & Hak Akses** (`/users`).
   - Coba ubah role admin yang sedang login menjadi `user` (sistem akan menolak dengan proteksi self-demotion).
   - Coba hapus admin terakhir (sistem akan menolak dengan proteksi last-admin lockout).
5. **Verifikasi Kualitas:**
   ```bash
   bun run lint    # Lulus tanpa error (Biome clean)
   bun run build   # Lulus kompilasi produksi
   ```

