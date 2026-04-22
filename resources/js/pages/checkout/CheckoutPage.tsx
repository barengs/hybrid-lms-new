import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Building2,
  Smartphone,
  ShieldCheck,
  Tag,
  Lock,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { MainLayout } from '@/components/layouts';
import { Card, Button } from '@/components/ui';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency, cn } from '@/lib/utils';

type PaymentMethod = 'credit_card' | 'bank_transfer' | 'e_wallet' | 'virtual_account';
type EWallet = 'gopay' | 'ovo' | 'dana' | 'linkaja' | 'shopeepay';
type Bank = 'bca' | 'mandiri' | 'bni' | 'bri' | 'cimb';

export function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [selectedEWallet, setSelectedEWallet] = useState<EWallet>('gopay');
  const [selectedBank, setSelectedBank] = useState<Bank>('bca');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Billing form state
  const [billingForm, setBillingForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: 'Indonesia',
    address: '',
    city: '',
    postalCode: '',
  });

  // Card form state
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
  });

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if cart is empty
  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.course.price, 0);
  const discount = items.reduce((sum, item) => sum + (item.course.price - (item.course.discountPrice || item.course.price)), 0);
  const promoDiscountAmount = promoApplied ? promoDiscount : 0;
  const tax = (totalPrice - promoDiscountAmount) * 0.11; // 11% PPN
  const finalTotal = totalPrice - promoDiscountAmount + tax;

  const handleApplyPromo = () => {
    // Mock promo code validation
    if (promoCode.toUpperCase() === 'WELCOME10') {
      setPromoApplied(true);
      setPromoDiscount(totalPrice * 0.1); // 10% discount
    } else {
      setErrors({ ...errors, promo: 'Kode promo tidak valid' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Billing validation
    if (!billingForm.fullName.trim()) newErrors.fullName = 'Nama lengkap wajib diisi';
    if (!billingForm.email.trim()) newErrors.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingForm.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    if (!billingForm.phone.trim()) newErrors.phone = 'Nomor telepon wajib diisi';

    // Payment method validation
    if (paymentMethod === 'credit_card') {
      if (!cardForm.cardNumber.replace(/\s/g, '')) newErrors.cardNumber = 'Nomor kartu wajib diisi';
      else if (cardForm.cardNumber.replace(/\s/g, '').length < 16) {
        newErrors.cardNumber = 'Nomor kartu tidak valid';
      }
      if (!cardForm.cardholderName.trim()) newErrors.cardholderName = 'Nama pemegang kartu wajib diisi';
      if (!cardForm.expiryDate) newErrors.expiryDate = 'Tanggal kadaluarsa wajib diisi';
      if (!cardForm.cvv) newErrors.cvv = 'CVV wajib diisi';
      else if (cardForm.cvv.length < 3) newErrors.cvv = 'CVV tidak valid';
    }

    // Terms validation
    if (!agreedToTerms) {
      newErrors.terms = 'Anda harus menyetujui syarat dan ketentuan';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    // Mock payment processing
    setTimeout(() => {
      // Clear cart and navigate to success page
      clearCart();
      navigate('/payment/success', {
        state: {
          transactionId: 'TRX-' + Date.now(),
          amount: finalTotal,
          paymentMethod,
          courses: items.map(item => item.course),
        },
      });
    }, 2000);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const eWallets = [
    { id: 'gopay' as EWallet, name: 'GoPay', logo: '🟢' },
    { id: 'ovo' as EWallet, name: 'OVO', logo: '🟣' },
    { id: 'dana' as EWallet, name: 'DANA', logo: '🔵' },
    { id: 'linkaja' as EWallet, name: 'LinkAja', logo: '🔴' },
    { id: 'shopeepay' as EWallet, name: 'ShopeePay', logo: '🟠' },
  ];

  const banks = [
    { id: 'bca' as Bank, name: 'BCA' },
    { id: 'mandiri' as Bank, name: 'Mandiri' },
    { id: 'bni' as Bank, name: 'BNI' },
    { id: 'bri' as Bank, name: 'BRI' },
    { id: 'cimb' as Bank, name: 'CIMB Niaga' },
  ];

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'id' ? 'Checkout' : 'Checkout'}
            </h1>
            <p className="text-gray-600 mt-1">
              {language === 'id'
                ? 'Lengkapi informasi untuk menyelesaikan pembayaran'
                : 'Complete your information to finish payment'}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Billing Information */}
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'id' ? 'Informasi Tagihan' : 'Billing Information'}
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'id' ? 'Nama Lengkap' : 'Full Name'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={billingForm.fullName}
                      onChange={(e) => setBillingForm({ ...billingForm, fullName: e.target.value })}
                      className={cn(
                        'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      )}
                      placeholder="John Doe"
                    />
                    {errors.fullName && <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={billingForm.email}
                      onChange={(e) => setBillingForm({ ...billingForm, email: e.target.value })}
                      className={cn(
                        'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      )}
                      placeholder="john@example.com"
                    />
                    {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'id' ? 'Nomor Telepon' : 'Phone Number'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={billingForm.phone}
                      onChange={(e) => setBillingForm({ ...billingForm, phone: e.target.value })}
                      className={cn(
                        'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      )}
                      placeholder="+62 812-3456-7890"
                    />
                    {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'id' ? 'Negara' : 'Country'}
                    </label>
                    <select
                      value={billingForm.country}
                      onChange={(e) => setBillingForm({ ...billingForm, country: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Indonesia">Indonesia</option>
                      <option value="Malaysia">Malaysia</option>
                      <option value="Singapore">Singapore</option>
                    </select>
                  </div>
                </div>
              </Card>

              {/* Payment Method */}
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'id' ? 'Metode Pembayaran' : 'Payment Method'}
                </h2>

                {/* Payment Method Selection */}
                <div className="grid md:grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={() => setPaymentMethod('credit_card')}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-lg border-2 transition-all',
                      paymentMethod === 'credit_card'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <CreditCard className={cn(
                      'w-6 h-6',
                      paymentMethod === 'credit_card' ? 'text-blue-600' : 'text-gray-400'
                    )} />
                    <span className="font-medium text-gray-900">
                      {language === 'id' ? 'Kartu Kredit/Debit' : 'Credit/Debit Card'}
                    </span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-lg border-2 transition-all',
                      paymentMethod === 'bank_transfer'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <Building2 className={cn(
                      'w-6 h-6',
                      paymentMethod === 'bank_transfer' ? 'text-blue-600' : 'text-gray-400'
                    )} />
                    <span className="font-medium text-gray-900">
                      {language === 'id' ? 'Transfer Bank' : 'Bank Transfer'}
                    </span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('e_wallet')}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-lg border-2 transition-all',
                      paymentMethod === 'e_wallet'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <Smartphone className={cn(
                      'w-6 h-6',
                      paymentMethod === 'e_wallet' ? 'text-blue-600' : 'text-gray-400'
                    )} />
                    <span className="font-medium text-gray-900">E-Wallet</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('virtual_account')}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-lg border-2 transition-all',
                      paymentMethod === 'virtual_account'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <Building2 className={cn(
                      'w-6 h-6',
                      paymentMethod === 'virtual_account' ? 'text-blue-600' : 'text-gray-400'
                    )} />
                    <span className="font-medium text-gray-900">Virtual Account</span>
                  </button>
                </div>

                {/* Credit Card Form */}
                {paymentMethod === 'credit_card' && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'id' ? 'Nomor Kartu' : 'Card Number'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={cardForm.cardNumber}
                        onChange={(e) => setCardForm({ ...cardForm, cardNumber: formatCardNumber(e.target.value) })}
                        maxLength={19}
                        className={cn(
                          'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                          errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                        )}
                        placeholder="1234 5678 9012 3456"
                      />
                      {errors.cardNumber && <p className="text-sm text-red-500 mt-1">{errors.cardNumber}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'id' ? 'Nama Pemegang Kartu' : 'Cardholder Name'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={cardForm.cardholderName}
                        onChange={(e) => setCardForm({ ...cardForm, cardholderName: e.target.value.toUpperCase() })}
                        className={cn(
                          'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                          errors.cardholderName ? 'border-red-500' : 'border-gray-300'
                        )}
                        placeholder="JOHN DOE"
                      />
                      {errors.cardholderName && <p className="text-sm text-red-500 mt-1">{errors.cardholderName}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {language === 'id' ? 'Tanggal Kadaluarsa' : 'Expiry Date'} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={cardForm.expiryDate}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '');
                            if (value.length >= 2) {
                              value = value.slice(0, 2) + '/' + value.slice(2, 4);
                            }
                            setCardForm({ ...cardForm, expiryDate: value });
                          }}
                          maxLength={5}
                          className={cn(
                            'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                            errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                          )}
                          placeholder="MM/YY"
                        />
                        {errors.expiryDate && <p className="text-sm text-red-500 mt-1">{errors.expiryDate}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CVV <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={cardForm.cvv}
                          onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '') })}
                          maxLength={4}
                          className={cn(
                            'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                            errors.cvv ? 'border-red-500' : 'border-gray-300'
                          )}
                          placeholder="123"
                        />
                        {errors.cvv && <p className="text-sm text-red-500 mt-1">{errors.cvv}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* E-Wallet Selection */}
                {paymentMethod === 'e_wallet' && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-3">
                      {language === 'id' ? 'Pilih E-Wallet Anda:' : 'Select your E-Wallet:'}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {eWallets.map((wallet) => (
                        <button
                          key={wallet.id}
                          onClick={() => setSelectedEWallet(wallet.id)}
                          className={cn(
                            'flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all',
                            selectedEWallet === wallet.id
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          )}
                        >
                          <span className="text-2xl">{wallet.logo}</span>
                          <span className="font-medium text-sm">{wallet.name}</span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        {language === 'id'
                          ? 'Anda akan diarahkan ke aplikasi ' + eWallets.find(w => w.id === selectedEWallet)?.name + ' untuk menyelesaikan pembayaran.'
                          : 'You will be redirected to ' + eWallets.find(w => w.id === selectedEWallet)?.name + ' app to complete payment.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Bank Transfer / Virtual Account */}
                {(paymentMethod === 'bank_transfer' || paymentMethod === 'virtual_account') && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-3">
                      {language === 'id' ? 'Pilih Bank:' : 'Select Bank:'}
                    </p>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value as Bank)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {banks.map((bank) => (
                        <option key={bank.id} value={bank.id}>
                          {bank.name}
                        </option>
                      ))}
                    </select>
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium mb-1">
                            {language === 'id' ? 'Instruksi Pembayaran' : 'Payment Instructions'}
                          </p>
                          <p>
                            {language === 'id'
                              ? 'Nomor virtual account akan muncul setelah Anda mengklik tombol "Selesaikan Pembayaran". Lakukan transfer sesuai nominal yang tertera.'
                              : 'Virtual account number will appear after you click "Complete Payment" button. Transfer the exact amount shown.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Terms and Conditions */}
              <Card>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    {language === 'id' ? 'Saya menyetujui ' : 'I agree to the '}
                    <a href="#" className="text-blue-600 hover:underline">
                      {language === 'id' ? 'Syarat dan Ketentuan' : 'Terms and Conditions'}
                    </a>
                    {language === 'id' ? ' dan ' : ' and '}
                    <a href="#" className="text-blue-600 hover:underline">
                      {language === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy'}
                    </a>
                  </label>
                </div>
                {errors.terms && <p className="text-sm text-red-500 mt-2">{errors.terms}</p>}
              </Card>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'id' ? 'Ringkasan Pesanan' : 'Order Summary'}
                </h2>

                {/* Course List */}
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.courseId} className="flex gap-3">
                      <img
                        src={item.course.thumbnail}
                        alt={item.course.title}
                        className="w-16 h-12 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                          {item.course.title}
                        </h4>
                        <p className="text-sm text-gray-900 mt-1">
                          {formatCurrency(item.course.discountPrice || item.course.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code */}
                <div className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      disabled={promoApplied}
                      placeholder={language === 'id' ? 'Kode promo' : 'Promo code'}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                    {!promoApplied ? (
                      <Button variant="outline" size="sm" onClick={handleApplyPromo}>
                        <Tag className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPromoApplied(false);
                          setPromoDiscount(0);
                          setPromoCode('');
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {errors.promo && <p className="text-xs text-red-500 mt-1">{errors.promo}</p>}
                  {promoApplied && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                      <Check className="w-3 h-3" />
                      <span>{language === 'id' ? 'Kode promo berhasil diterapkan!' : 'Promo code applied!'}</span>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{language === 'id' ? 'Subtotal' : 'Subtotal'}</span>
                    <span className="text-gray-900">{formatCurrency(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{language === 'id' ? 'Diskon Kursus' : 'Course Discount'}</span>
                      <span className="text-green-600">-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  {promoApplied && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{language === 'id' ? 'Diskon Promo' : 'Promo Discount'}</span>
                      <span className="text-green-600">-{formatCurrency(promoDiscountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{language === 'id' ? 'Pajak (PPN 11%)' : 'Tax (VAT 11%)'}</span>
                    <span className="text-gray-900">{formatCurrency(tax)}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between mb-6">
                  <span className="text-lg font-semibold text-gray-900">{language === 'id' ? 'Total' : 'Total'}</span>
                  <span className="text-xl font-bold text-gray-900">{formatCurrency(finalTotal)}</span>
                </div>

                {/* Payment Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span>{language === 'id' ? 'Memproses...' : 'Processing...'}</span>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      {language === 'id' ? 'Selesaikan Pembayaran' : 'Complete Payment'}
                    </>
                  )}
                </Button>

                {/* Security Badge */}
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span>{language === 'id' ? 'Pembayaran aman dengan enkripsi SSL' : 'Secure payment with SSL encryption'}</span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
