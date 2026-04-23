<x-mail::message>
# Halo {{ $user->name }},

Selamat bergabung di **HybridLMS**! Akun Anda telah berhasil dibuat oleh administrator.

Berikut adalah detail login Anda untuk mengakses platform:

<x-mail::panel>
**Email:** {{ $user->email }}
**Password:** {{ $password }}
</x-mail::panel>

Harap segera mengganti password Anda setelah berhasil masuk pertama kali melalui menu pengaturan profil.

<x-mail::button :url="config('app.url') . '/login'">
Login Sekarang
</x-mail::button>

Terima kasih,<br>
Tim {{ config('app.name') }}
</x-mail::message>
