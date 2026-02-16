import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Navbar */}
      <header className="fixed w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              KostKu
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
            <Link href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Fitur
            </Link>
            <Link href="#pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Harga
            </Link>
            <Link href="#contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Kontak
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors shadow-lg shadow-blue-600/20"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="container mx-auto px-4 flex flex-col items-center text-center z-10 relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-6 animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Solusi Manajemen Kost #1 di Indonesia
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-b from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent max-w-4xl mx-auto">
              Kost Nyaman, <br />
              <span className="text-blue-600 dark:text-blue-500">Hidup Aman,</span> Cuan Lancar.
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Platform all-in-one untuk pencari kost dan pemilik kost. Booking kamar, bayar sewa, hingga laporan maintenance dalam satu genggaman.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                href="/cari-kost"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                Cari Kost
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold text-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                Gabung Jadi Mitra
              </Link>
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-[100px] -z-10 pointer-events-none" />
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 bg-white dark:bg-black/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Fitur Unggulan</h2>
              <p className="text-slate-600 dark:text-slate-400">Dirancang khusus untuk kebutuhan anak kost dan pemilik.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Smart Search & 360° Tour</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Cari kost impian dengan filter lengkap dan lihat kondisi kamar secara detail lewat tur virtual.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Digital Contract & Sign</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Tanda tangan kontrak sewa secara digital, aman, dan sah secara hukum tanpa ribet kertas.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">One-Tap Payment</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Bayar sewa pakai Qris, VA, atau E-wallet. Tersedia fitur Split Bill untuk kamar berdua.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto rounded-3xl bg-blue-600 dark:bg-blue-700 p-8 md:p-16 text-center text-white relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">Siap Cari Tempat Tinggal Baru?</h2>
                <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
                  Atau Anda pemilik kost yang ingin pengelolaan lebih mudah? Gabung dengan ribuan pengguna KostKu sekarang.
                </p>
                <Link
                  href="/register"
                  className="inline-block px-8 py-4 rounded-full bg-white text-blue-600 font-bold text-lg hover:bg-slate-100 transition-colors"
                >
                  Mulai Sekarang - Gratis
                </Link>
              </div>

              {/* Decorative circles */}
              <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-10 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-black text-slate-600 dark:text-slate-400">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-4">&copy; {new Date().getFullYear()} KostKu. All rights reserved.</p>
          <div className="flex justify-center gap-6 text-sm">
            <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
