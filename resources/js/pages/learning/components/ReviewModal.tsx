import { useState } from 'react';
import { Modal, Button, Textarea } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { useSubmitCourseReviewMutation } from '@/store/features/student/studentApiSlice';
import toast from 'react-hot-toast';
import { Star } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseSlug: string;
}

export function ReviewModal({ isOpen, onClose, courseSlug }: ReviewModalProps) {
  const { language } = useLanguage();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  
  const [submitReview, { isLoading }] = useSubmitCourseReviewMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error(language === 'id' ? 'Silakan pilih rating' : 'Please select a rating');
      return;
    }

    try {
      await submitReview({ slug: courseSlug, rating, comment }).unwrap();
      toast.success(
        language === 'id' ? 'Ulasan berhasil dikirim!' : 'Review submitted successfully!'
      );
      onClose();
    } catch (err: any) {
      toast.error(
        err?.data?.message || (language === 'id' ? 'Gagal mengirim ulasan' : 'Failed to submit review')
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={language === 'id' ? 'Tulis Ulasan Kursus' : 'Write Course Review'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
            {language === 'id' ? 'Bagaimana pengalaman Anda?' : 'How was your experience?'}
          </label>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`w-10 h-10 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === 'id' ? 'Komentar (Opsional)' : 'Comment (Optional)'}
          </label>
          <Textarea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              language === 'id'
                ? 'Ceritakan pengalaman Anda mengikuti kursus ini...'
                : 'Tell us about your experience taking this course...'
            }
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            {language === 'id' ? 'Batal' : 'Cancel'}
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={rating === 0}>
            {language === 'id' ? 'Kirim Ulasan' : 'Submit Review'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
