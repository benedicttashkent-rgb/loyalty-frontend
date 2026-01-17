import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import ModalOverlay from '../../../components/navigation/ModalOverlay';
import Button from '../../../components/ui/Button';
import { getApiUrl } from '../../../config/api';

const RatingModal = ({ isOpen, onClose, orderNumber, items, onRatingSubmitted }) => {
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && items) {
      // Initialize ratings for all items
      const initialRatings = {};
      items.forEach(item => {
        initialRatings[item.id || item.name] = 0;
      });
      setRatings(initialRatings);
      setComments({});
    }
  }, [isOpen, items]);

  const handleRatingClick = (itemId, rating) => {
    setRatings(prev => ({
      ...prev,
      [itemId]: rating
    }));
  };

  const handleCommentChange = (itemId, comment) => {
    setComments(prev => ({
      ...prev,
      [itemId]: comment
    }));
  };

  const handleSubmit = async () => {
    // Check if all items are rated
    const allRated = items.every(item => {
      const itemId = item.id || item.name;
      return ratings[itemId] && ratings[itemId] > 0;
    });

    if (!allRated) {
      alert('Пожалуйста, оцените все блюда');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      const ratingsArray = items.map(item => {
        const itemId = item.id || item.name;
        return {
          itemId: item.id,
          itemName: item.name,
          rating: ratings[itemId],
          comment: comments[itemId] || null
        };
      });

      const response = await fetch(getApiUrl(`orders/${orderNumber}/rating`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ ratings: ratingsArray })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (onRatingSubmitted) {
          onRatingSubmitted();
        }
        onClose();
      } else {
        alert(data.error || 'Ошибка при сохранении рейтинга');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Ошибка при сохранении рейтинга. Попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !items || items.length === 0) return null;

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="p-6 max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Оцените ваши блюда</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
            aria-label="Закрыть"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {items.map((item) => {
            const itemId = item.id || item.name;
            const rating = ratings[itemId] || 0;
            const comment = comments[itemId] || '';

            return (
              <div key={itemId} className="bg-card rounded-lg p-4 border border-border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Количество: {item.quantity} × {item.price?.toLocaleString('ru-RU')} сум
                    </p>
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="mb-3">
                  <p className="text-sm text-muted-foreground mb-2">Оценка:</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRatingClick(itemId, star)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          star <= rating
                            ? 'bg-yellow-500 text-white'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        <Icon name="Star" size={20} fill={star <= rating ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Комментарий (необязательно):
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => handleCommentChange(itemId, e.target.value)}
                    placeholder="Ваш отзыв о блюде..."
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={2}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isSubmitting}
          >
            Пропустить
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
};

export default RatingModal;
