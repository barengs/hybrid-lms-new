<?php

namespace App\Services;

use App\Models\User;
use App\Models\OrderItem;
use App\Models\InstructorPayout;
use App\Services\AppSettingService;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class InstructorFinancialService
{
    protected $settingService;

    public function __construct(AppSettingService $settingService)
    {
        $this->settingService = $settingService;
    }

    /**
     * Get financial settings for instructor earnings.
     */
    public function getFinancialSettings(): array
    {
        return [
            'commission_rate' => (float) $this->settingService->get('platform_commission', 20),
            'tax_rate' => (float) $this->settingService->get('tax_withholding', 5),
            'payout_delay_days' => (int) $this->settingService->get('payout_delay_days', 7),
            'minimum_payout' => (float) $this->settingService->get('minimum_payout', 100000),
        ];
    }

    /**
     * Get earnings summary for an instructor.
     */
    public function getEarningsSummary(User $instructor): array
    {
        $settings = $this->getFinancialSettings();
        $commissionRate = $settings['commission_rate'] / 100;
        $taxRate = $settings['tax_rate'] / 100;
        $payoutDelayDays = $settings['payout_delay_days'];

        // Get all paid order items for courses owned by this instructor
        $query = OrderItem::whereHas('course', function ($q) use ($instructor) {
                $q->where('instructor_id', $instructor->id);
            })
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', 'paid')
            ->select('order_items.*', 'orders.paid_at');

        $items = $query->get();

        $totalGross = $items->sum('price');
        $totalNet = $totalGross * (1 - $commissionRate - $taxRate);

        // Monthly stats
        $thisMonthItems = $items->filter(fn($item) => Carbon::parse($item->paid_at)->isCurrentMonth());
        $monthlyGross = $thisMonthItems->sum('price');
        $monthlyNet = $monthlyGross * (1 - $commissionRate - $taxRate);

        // Calculate available vs pending
        $delayDate = Carbon::now()->subDays($payoutDelayDays);
        
        $availableNet = $items->filter(fn($item) => Carbon::parse($item->paid_at)->lte($delayDate))
            ->sum('price') * (1 - $commissionRate - $taxRate);

        $pendingNet = $items->filter(fn($item) => Carbon::parse($item->paid_at)->gt($delayDate))
            ->sum('price') * (1 - $commissionRate - $taxRate);

        // Total Withdrawn (Completed Payouts)
        $totalWithdrawn = InstructorPayout::where('instructor_id', $instructor->id)
            ->where('status', 'completed')
            ->sum('amount');

        // Current Available for Withdrawal (Available Net - Total Withdrawn)
        // Ensure it doesn't go below 0
        $currentAvailable = max(0, $availableNet - $totalWithdrawn);

        return [
            'total_revenue' => round($totalNet, 2),
            'monthly_revenue' => round($monthlyNet, 2),
            'available_for_withdraw' => round($currentAvailable, 2),
            'pending_clearance' => round($pendingNet, 2),
            'total_students' => $items->count(),
            'avg_revenue_per_student' => $items->count() > 0 ? round($totalNet / $items->count(), 2) : 0,
            'settings' => $settings,
        ];
    }

    /**
     * Get revenue by course for an instructor.
     */
    public function getRevenueByCourse(User $instructor): array
    {
        $settings = $this->getFinancialSettings();
        $commissionRate = $settings['commission_rate'] / 100;
        $taxRate = $settings['tax_rate'] / 100;

        $courses = DB::table('courses')
            ->where('instructor_id', $instructor->id)
            ->whereNull('deleted_at')
            ->select('id', 'title', 'thumbnail', 'price')
            ->get();

        return $courses->map(function ($course) use ($commissionRate, $taxRate) {
            $items = OrderItem::where('course_id', $course->id)
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.status', 'paid')
                ->select('order_items.price', 'orders.paid_at')
                ->get();

            $totalGross = $items->sum('price');
            $totalNet = $totalGross * (1 - $commissionRate - $taxRate);
            $monthlyNet = $items->filter(fn($item) => Carbon::parse($item->paid_at)->isCurrentMonth())
                ->sum('price') * (1 - $commissionRate - $taxRate);

            return [
                'courseId' => (string) $course->id,
                'courseTitle' => $course->title,
                'courseThumbnail' => $course->thumbnail,
                'price' => (float) $course->price,
                'totalStudents' => $items->count(),
                'totalRevenue' => (float) $totalGross,
                'netRevenue' => round($totalNet, 2),
                'monthlyRevenue' => round($monthlyNet, 2),
                'commission' => $items->count() > 0 ? (int) ($commissionRate * 100) : 0,
                'growthPercentage' => 0, // Placeholder
            ];
        })->toArray();
    }

    /**
     * Get recent transactions for an instructor.
     */
    public function getRecentTransactions(User $instructor, int $limit = 10): array
    {
        $settings = $this->getFinancialSettings();
        $commissionRate = $settings['commission_rate'] / 100;
        $taxRate = $settings['tax_rate'] / 100;

        $transactions = OrderItem::whereHas('course', function ($q) use ($instructor) {
                $q->where('instructor_id', $instructor->id);
            })
            ->with(['course', 'order.user'])
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', 'paid')
            ->orderBy('orders.paid_at', 'desc')
            ->limit($limit)
            ->get();

        return $transactions->map(function ($item) use ($commissionRate, $taxRate) {
            $gross = $item->price;
            $net = $gross * (1 - $commissionRate - $taxRate);

            return [
                'id' => (string) $item->id,
                'studentName' => $item->order->user->name ?? 'Student',
                'studentAvatar' => $item->order->user->profile->avatar ?? null,
                'courseTitle' => $item->course_title,
                'amount' => (float) $gross,
                'netAmount' => round($net, 2),
                'status' => 'completed',
                'date' => $item->order->paid_at,
            ];
        })->toArray();
    }
}
