<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    /**
     * Process checkout and create order.
     */
    public function processCheckout(Request $request): JsonResponse
    {
        $cart = $request->user()->cart;
        
        if (!$cart || $cart->items->isEmpty()) {
            return response()->json([
                'message' => 'Your cart is empty.',
            ], 422);
        }

        // Validate that all courses are still available and prices haven't changed
        $validationErrors = [];
        foreach ($cart->items as $item) {
            $course = $item->course;
            
            if (!$course || $course->status !== 'published') {
                $validationErrors[] = "Course '{$course->title}' is no longer available.";
                continue;
            }

            // Check if price matches current course price
            if ($item->price != $course->effective_price) {
                // Update cart item price to current price
                $item->update(['price' => $course->effective_price]);
            }
        }

        if (!empty($validationErrors)) {
            return response()->json([
                'message' => 'Some items in your cart are no longer available.',
                'errors' => $validationErrors,
            ], 422);
        }

        // Begin transaction
        DB::beginTransaction();

        try {
            $isFree = $cart->total <= 0;
            $simulatePayment = $request->boolean('payment_simulation', false);
            $isPaid = $isFree || $simulatePayment;
            
            // Create order
            $order = Order::create([
                'user_id' => $request->user()->id,
                'subtotal' => $cart->subtotal,
                'discount' => $cart->discount,
                'total' => $cart->total,
                'tax' => 0, // Default tax
                'status' => $isPaid ? 'paid' : 'pending',
                'paid_at' => $isPaid ? now() : null,
            ]);

            // Create order items
            foreach ($cart->items as $cartItem) {
                $course = $cartItem->course;
                
                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'course_id' => $course->id,
                    'course_title' => $course->title,
                    'price' => $cartItem->price,
                    'discount_price' => $course->discount_price,
                ]);

                // Create enrollment record if doesn't exist
                $existingEnrollment = Enrollment::where('user_id', $request->user()->id)
                    ->where('course_id', $course->id)
                    ->first();

                if (!$existingEnrollment) {
                    Enrollment::create([
                        'user_id' => $request->user()->id,
                        'course_id' => $course->id,
                        'order_item_id' => $orderItem->id,
                        'enrolled_at' => $isPaid ? now() : null,
                    ]);

                    // If paid, increment enrollment count
                    if ($isPaid) {
                        $course->increment('total_enrollments');
                    }
                } else if ($isPaid && !$existingEnrollment->enrolled_at) {
                    // Update existing enrollment if it was pending
                    $existingEnrollment->update([
                        'order_item_id' => $orderItem->id,
                        'enrolled_at' => now(),
                    ]);
                    $course->increment('total_enrollments');
                }
            }

            // Clear cart
            $cart->items()->delete();
            $cart->update([
                'subtotal' => 0,
                'total' => 0,
            ]);

            DB::commit();

            if ($isFree) {
                return response()->json([
                    'success' => true,
                    'message' => 'Pendaftaran berhasil! Kursus telah ditambahkan ke dashboard Anda.',
                    'data' => [
                        'order' => $order->load('items.course'),
                        'is_free' => true,
                    ],
                ], 201);
            }

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully. Please proceed to payment.',
                'data' => [
                    'order' => $order->load('items.course'),
                    'is_free' => false,
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            \Log::error('Checkout processing failed: ' . $e->getMessage(), [
                'user_id' => $request->user()->id,
                'exception' => $e
            ]);
            
            return response()->json([
                'message' => 'An error occurred while processing your order.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get order details.
     */
    public function getOrder(Request $request, string $orderNumber): JsonResponse
    {
        $order = Order::where('order_number', $orderNumber)
            ->where('user_id', $request->user()->id)
            ->with(['items.course', 'payments'])
            ->firstOrFail();

        return response()->json([
            'data' => $order,
        ]);
    }

    /**
     * Get user's order history.
     */
    public function getOrderHistory(Request $request): JsonResponse
    {
        $orders = $request->user()->orders()
            ->with(['items.course', 'payments'])
            ->latest()
            ->paginate($request->per_page ?? 10);

        return response()->json($orders);
    }

    /**
     * Get order receipt.
     */
    public function getReceipt(Request $request, string $orderNumber): JsonResponse
    {
        $order = Order::where('order_number', $orderNumber)
            ->where('user_id', $request->user()->id)
            ->with([
                'user:id,name,email',
                'items.course:id,title,thumbnail,instructor_id',
                'items.course.instructor:id,name',
            ])
            ->firstOrFail();

        $receiptData = [
            'order' => $order,
            'billing_info' => [
                'name' => $order->user->name,
                'email' => $order->user->email,
            ],
            'items' => $order->items->map(function ($item) {
                return [
                    'course_title' => $item->course_title,
                    'price' => $item->price,
                    'discount_price' => $item->discount_price,
                    'effective_price' => $item->effective_price,
                ];
            }),
            'summary' => [
                'subtotal' => $order->subtotal,
                'discount' => $order->discount,
                'tax' => $order->tax,
                'total' => $order->total,
                'paid_amount' => $order->total_paid,
                'due_amount' => $order->total - $order->total_paid,
            ],
        ];

        return response()->json([
            'data' => $receiptData,
        ]);
    }
}
