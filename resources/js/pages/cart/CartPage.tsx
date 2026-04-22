import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { MainLayout } from '@/components/layouts';
import { Card, Button, Badge, Rating } from '@/components/ui';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';

export function CartPage() {
  const { items, removeFromCart, clearCart, totalPrice } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Keranjang Anda Kosong</h1>
          <p className="text-gray-600 mb-6">
            Jelajahi kursus-kursus menarik kami dan mulai belajar sekarang!
          </p>
          <Link to="/courses">
            <Button size="lg">
              Jelajahi Kursus
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Keranjang Belanja ({items.length} item)
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.courseId} className="flex gap-4">
                <Link to={`/course/${item.course.slug}`} className="flex-shrink-0">
                  <img
                    src={item.course.thumbnail}
                    alt={item.course.title}
                    className="w-32 h-24 object-cover rounded-lg"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/course/${item.course.slug}`}>
                    <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                      {item.course.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500 mb-1">{item.course.instructor?.name}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <Rating value={item.course.rating} size="sm" />
                    <span className="text-xs text-gray-500">
                      ({item.course.totalRatings} ulasan)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge size="sm">
                      {item.course.type === 'self-paced' ? 'Mandiri' : 'Kelas'}
                    </Badge>
                    <Badge variant="default" size="sm">
                      {item.course.totalLessons} pelajaran
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <div className="text-right">
                    {item.course.discountPrice ? (
                      <>
                        <p className="font-bold text-gray-900">
                          {formatCurrency(item.course.discountPrice)}
                        </p>
                        <p className="text-sm text-gray-400 line-through">
                          {formatCurrency(item.course.price)}
                        </p>
                      </>
                    ) : (
                      <p className="font-bold text-gray-900">
                        {formatCurrency(item.course.price)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.courseId)}
                    className="text-red-500 hover:text-red-700 p-2"
                    aria-label="Remove from cart"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </Card>
            ))}

            <div className="flex justify-end">
              <button
                onClick={clearCart}
                className="text-sm text-gray-500 hover:text-red-600"
              >
                Kosongkan Keranjang
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">
                    {formatCurrency(items.reduce((sum, item) => sum + item.course.price, 0))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Diskon</span>
                  <span className="text-green-600">
                    -{formatCurrency(items.reduce((sum, item) => sum + (item.course.price - (item.course.discountPrice || item.course.price)), 0))}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Kode promo"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button variant="outline" size="sm">
                    <Tag className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={() => navigate('/checkout')}>
                Checkout
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Pembayaran aman dengan enkripsi SSL
              </p>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
