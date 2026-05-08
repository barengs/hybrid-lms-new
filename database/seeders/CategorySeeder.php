<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Web Development',
                'description' => 'Learn how to build modern websites using HTML, CSS, JavaScript, React, and more.',
                'icon' => 'code',
                'children' => [
                    ['name' => 'Frontend Development'],
                    ['name' => 'Backend Development'],
                    ['name' => 'Fullstack Development'],
                ]
            ],
            [
                'name' => 'Mobile Development',
                'description' => 'Build cross-platform and native mobile applications for iOS and Android.',
                'icon' => 'smartphone',
                'children' => [
                    ['name' => 'Flutter'],
                    ['name' => 'React Native'],
                    ['name' => 'Swift & iOS'],
                    ['name' => 'Android (Kotlin)'],
                ]
            ],
            [
                'name' => 'Data Science',
                'description' => 'Analyze data and build machine learning models using Python, R, and SQL.',
                'icon' => 'database',
                'children' => [
                    ['name' => 'Machine Learning'],
                    ['name' => 'Data Visualization'],
                    ['name' => 'Big Data'],
                ]
            ],
            [
                'name' => 'Design',
                'description' => 'Master UI/UX design, graphic design, and video editing tools.',
                'icon' => 'palette',
                'children' => [
                    ['name' => 'UI/UX Design'],
                    ['name' => 'Graphic Design'],
                    ['name' => 'Motion Graphics'],
                ]
            ],
            [
                'name' => 'Business & Marketing',
                'description' => 'Grow your business with digital marketing, SEO, and entrepreneurship skills.',
                'icon' => 'trending-up',
                'children' => [
                    ['name' => 'Digital Marketing'],
                    ['name' => 'SEO'],
                    ['name' => 'Social Media Management'],
                ]
            ],
        ];

        foreach ($categories as $index => $catData) {
            $parent = Category::updateOrCreate(
                ['slug' => Str::slug($catData['name'])],
                [
                    'name' => $catData['name'],
                    'description' => $catData['description'],
                    'icon' => $catData['icon'],
                    'sort_order' => $index,
                    'is_active' => true,
                ]
            );

            if (isset($catData['children'])) {
                foreach ($catData['children'] as $childIndex => $childData) {
                    Category::updateOrCreate(
                        ['slug' => Str::slug($childData['name'])],
                        [
                            'name' => $childData['name'],
                            'parent_id' => $parent->id,
                            'sort_order' => $childIndex,
                            'is_active' => true,
                        ]
                    );
                }
            }
        }
    }
}
