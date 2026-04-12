import React, { useState } from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';
import RatingStars from './RatingStars';

// 🚨 PRODUCTION FIX: Get API URL without localhost fallback
const getApiUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    throw new Error('🚨 VITE_API_URL environment variable is required in production');
  }
  return apiUrl;
};

const ReviewForm = ({ 
  serviceId, 
  bookingId = null, 
  existingReview = null,
  onSubmit,
  onCancel 
}) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [reviewText, setReviewText] = useState(existingReview?.review_text || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const savedUser = localStorage.getItem('isafari_user');
      if (!savedUser) {
        throw new Error('Please login to submit a review');
      }
      
      const userData = JSON.parse(savedUser);
      const token = userData.token;
      
      const url = existingReview 
        ? `${getApiUrl()}/api/reviews/${existingReview.id}`
        : `${getApiUrl()}/api/reviews/service/${serviceId}`;
      
      const method = existingReview ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating,
          comment: reviewText.trim() || null
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to submit review');
      }
      
      if (onSubmit) {
        onSubmit(data.review);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Your Rating *
        </label>
        <RatingStars
          rating={rating}
          interactive={true}
          onChange={setRating}
          size={32}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Your Review (Optional)
        </label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your experience with this service..."
          rows={4}
          className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground resize-none"
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {reviewText.length}/1000 characters
        </p>
      </div>
      
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <Icon name="AlertCircle" size={18} className="text-red-500" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      
      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={loading || rating === 0}
          className="flex items-center gap-2"
        >
          {loading ? (
            <>
              <Icon name="Loader2" size={18} className="animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Icon name="Send" size={18} />
              {existingReview ? 'Update Review' : 'Submit Review'}
            </>
          )}
        </Button>
        
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default ReviewForm;
