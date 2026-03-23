import React, { useState, useEffect } from 'react';
import Icon from './AppIcon';
import RatingStars from './RatingStars';
import Button from './ui/Button';

const ReviewsList = ({ serviceId, showAddReview = false, onAddReview = null }) => {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (serviceId) {
      fetchReviews();
      fetchSummary();
    }
  }, [serviceId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reviews/service/${serviceId}`
      );
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reviews/service/${serviceId}/summary`
      );
      const data = await response.json();
      
      if (data.success) {
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Icon name="Loader2" size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <Icon name="AlertCircle" size={18} className="text-red-500" />
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {summary && parseInt(summary.total_reviews) > 0 && (
        <div className="bg-muted/50 rounded-lg p-6">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground">
                {parseFloat(summary.average_rating).toFixed(1)}
              </div>
              <RatingStars rating={parseFloat(summary.average_rating)} size={20} />
              <p className="text-sm text-muted-foreground mt-1">
                {summary.total_reviews} {parseInt(summary.total_reviews) === 1 ? 'review' : 'reviews'}
              </p>
            </div>
            
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = parseInt(summary[`${['five', 'four', 'three', 'two', 'one'][5 - star]}_star`] || 0);
                const percentage = parseInt(summary.total_reviews) > 0 
                  ? (count / parseInt(summary.total_reviews)) * 100 
                  : 0;
                
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-sm text-foreground w-8">{star}★</span>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add Review Button */}
      {showAddReview && onAddReview && (
        <div className="flex justify-end">
          <Button
            onClick={onAddReview}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Icon name="Plus" size={18} />
            Write a Review
          </Button>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="MessageSquare" size={24} className="text-muted-foreground" />
          </div>
          <h4 className="font-medium text-foreground mb-2">No reviews yet</h4>
          <p className="text-sm text-muted-foreground">
            Be the first to share your experience with this service
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div 
              key={review.id} 
              className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* User Avatar */}
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  {review.avatar_url ? (
                    <img 
                      src={review.avatar_url} 
                      alt={`${review.first_name} ${review.last_name}`}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Icon name="User" size={20} className="text-primary" />
                  )}
                </div>
                
                {/* Review Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-foreground">
                        {review.first_name} {review.last_name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(review.created_at)}
                      </p>
                    </div>
                    <RatingStars rating={review.rating} size={16} />
                  </div>
                  
                  {review.review_text && (
                    <p className="text-sm text-foreground leading-relaxed">
                      {review.review_text}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsList;
