<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class OnboardingQuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $questions = [
            [
                'slug' => 'interest',
                'question' => 'Topik apa yang paling membuatmu bersemangat untuk dipelajari?',
                'options' => [
                    ['value' => 'programming', 'label' => 'Pemrograman & Teknologi', 'icon' => 'Code'],
                    ['value' => 'business', 'label' => 'Bisnis & Entrepreneurship', 'icon' => 'Briefcase'],
                    ['value' => 'design', 'label' => 'Desain & Kreatif', 'icon' => 'Palette'],
                    ['value' => 'marketing', 'label' => 'Digital Marketing', 'icon' => 'Target'],
                    ['value' => 'finance', 'label' => 'Keuangan & Investasi', 'icon' => 'Coins'],
                ],
                'sort_order' => 1,
            ],
            [
                'slug' => 'learning_style',
                'question' => 'Gaya belajar seperti apa yang paling efektif untukmu?',
                'options' => [
                    ['value' => 'visual', 'label' => 'Menonton Video Visual', 'icon' => 'Play'],
                    ['value' => 'practical', 'label' => 'Praktek Langsung (Hands-on)', 'icon' => 'Wrench'],
                    ['value' => 'reading', 'label' => 'Membaca Modul & Artikel', 'icon' => 'Book'],
                    ['value' => 'discussion', 'label' => 'Diskusi & Tanya Jawab', 'icon' => 'MessageSquare'],
                ],
                'sort_order' => 2,
            ],
            [
                'slug' => 'goal',
                'question' => 'Apa target utamamu belajar di platform ini?',
                'options' => [
                    ['value' => 'career_switch', 'label' => 'Persiapan Ganti Karir', 'icon' => 'RefreshCw'],
                    ['value' => 'upskilling', 'label' => 'Meningkatkan Skill di Pekerjaan', 'icon' => 'TrendingUp'],
                    ['value' => 'hobby', 'label' => 'Eksplorasi Hobi Baru', 'icon' => 'Heart'],
                    ['value' => 'certification', 'label' => 'Mendapatkan Sertifikat Resmi', 'icon' => 'Award'],
                ],
                'sort_order' => 3,
            ],
            [
                'slug' => 'experience',
                'question' => 'Seberapa familiar kamu dengan topik yang kamu pilih?',
                'options' => [
                    ['value' => 'beginner', 'label' => 'Benar-benar Pemula', 'icon' => 'Zap'],
                    ['value' => 'intermediate', 'label' => 'Punya Sedikit Pengalaman', 'icon' => 'Activity'],
                    ['value' => 'expert', 'label' => 'Sudah Mengetahui Dasar-dasarnya', 'icon' => 'Cpu'],
                ],
                'sort_order' => 4,
            ],
            [
                'slug' => 'time_commitment',
                'question' => 'Berapa banyak waktu yang bisa kamu dedikasikan per minggu?',
                'options' => [
                    ['value' => 'low', 'label' => '< 3 Jam / Minggu', 'icon' => 'Clock'],
                    ['value' => 'medium', 'label' => '3 - 7 Jam / Minggu', 'icon' => 'Calendar'],
                    ['value' => 'high', 'label' => '> 7 Jam / Minggu', 'icon' => 'Zap'],
                ],
                'sort_order' => 5,
            ],
            [
                'slug' => 'career_industry',
                'question' => 'Industri mana yang paling menarik minat karirmu?',
                'options' => [
                    ['value' => 'fintech', 'label' => 'Fintech & Perbankan', 'icon' => 'Coins'],
                    ['value' => 'ecommerce', 'label' => 'E-commerce & Retail', 'icon' => 'ShoppingCart'],
                    ['value' => 'edutech', 'label' => 'Pendidikan & Edutech', 'icon' => 'GraduationCap'],
                    ['value' => 'creative', 'label' => 'Agensi Kreatif', 'icon' => 'Palette'],
                ],
                'sort_order' => 6,
            ],
            [
                'slug' => 'motivation',
                'question' => 'Apa motivasi terbesarmu untuk terus belajar?',
                'options' => [
                    ['value' => 'salary', 'label' => 'Menaikkan Standar Gaji', 'icon' => 'TrendingUp'],
                    ['value' => 'problem_solving', 'label' => 'Senang Memecahkan Masalah', 'icon' => 'Lightbulb'],
                    ['value' => 'networking', 'label' => 'Mencari Relasi Baru', 'icon' => 'Users'],
                    ['value' => 'impact', 'label' => 'Memberikan Dampak Sosial', 'icon' => 'Globe'],
                ],
                'sort_order' => 7,
            ],
        ];

        foreach ($questions as $q) {
            \App\Models\OnboardingQuestion::updateOrCreate(['slug' => $q['slug']], $q);
        }
    }
}
