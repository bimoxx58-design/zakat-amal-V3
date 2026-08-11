# ZakatMaal AI Proxy (opsional)

GitHub Pages tidak boleh menyimpan `ANTHROPIC_API_KEY` di `index.html`.
Folder ini adalah proxy backend opsional untuk menghubungkan Tanya AI ke Anthropic secara aman.

## Setelah Worker aktif

Tambahkan ini ke `index.html` sebelum script aplikasi:

```html
<script>
window.ZAKAT_AI_PROXY = 'https://ALAMAT-WORKER-KAMU.workers.dev';
</script>
```

Jika proxy belum dipasang, ZakatMaal tetap berjalan dengan Asisten Lokal/offline.
