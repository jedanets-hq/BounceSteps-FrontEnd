import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BusinessAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    revenue: { total: 0, growth: 0, trend: 'neutral' },
    bookings: { total: 0, growth: 0, trend: 'neutral' },
    customers: { total: 0, growth: 0, trend: 'neutral' },
    rating: { average: 0, total: 0, growth: 0, trend: 'neutral' }
  });
  const [topServices, setTopServices] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [topCountries, setTopCountries] = useState([]);

  // Fetch real analytics from backend
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const userString = localStorage.getItem('isafari_user');
        if (!userString) {
          console.error('No auth token found');
          setLoading(false);
          return;
        }

        const user = JSON.parse(userString);
        const token = user.token;

        const response = await fetch(
          `https://backend-bncb.onrender.com/api/bookings/provider-analytics?timeRange=${timeRange}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const data = await response.json();
        
        if (data.success) {
          setAnalyticsData(data.analytics);
          setTopServices(data.topServices || []);
          setMonthlyData(data.monthlyData || []);
          setTopCountries(data.topCountries || []);
        } else {
          console.error('Failed to fetch analytics:', data.message);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  const handleExportReport = () => {
    const csvData = [
      ['iSafari Business Analytics Report'],
      ['Period:', timeRange],
      ['Generated:', new Date().toLocaleDateString()],
      [''],
      ['SUMMARY'],
      ['Total Revenue', `$${analyticsData.revenue.total}`],
      ['Total Bookings', analyticsData.bookings.total],
      ['Unique Customers', analyticsData.customers.total],
      ['Average Rating', analyticsData.rating.average],
      ['Total Reviews', analyticsData.rating.total],
      [''],
      ['TOP SERVICES'],
      ['Service Name', 'Bookings', 'Revenue', 'Rating'],
      ...topServices.map(s => [s.name, s.bookings, `$${s.revenue}`, s.rating])
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${timeRange}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-medium">Business Analytics</h3>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="1year">Last year</option>
          </select>
          <Button variant="outline" size="sm" onClick={handleExportReport}>
            <Icon name="Download" size={16} />
            Export Report
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      {/* No Data State */}
      {!loading && analyticsData.bookings.total === 0 && (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Icon name="BarChart" size={48} className="mx-auto text-muted-foreground/50 mb-4" />
          <h4 className="text-lg font-medium text-foreground mb-2">No Analytics Data Yet</h4>
          <p className="text-muted-foreground">
            Start receiving bookings to see your business analytics and insights here.
          </p>
        </div>
      )}

      {/* Analytics Content */}
      {!loading && analyticsData.bookings.total > 0 && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="DollarSign" size={24} className="text-primary" />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${
                  analyticsData.revenue.trend === 'up' ? 'text-green-600' : 
                  analyticsData.revenue.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
                }`}>
                  <Icon name={
                    analyticsData.revenue.trend === 'up' ? 'TrendingUp' : 
                    analyticsData.revenue.trend === 'down' ? 'TrendingDown' : 'Minus'
                  } size={16} />
                  <span>{Math.abs(analyticsData.revenue.growth)}%</span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">${analyticsData.revenue.total}</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Icon name="Calendar" size={24} className="text-secondary" />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${
                  analyticsData.bookings.trend === 'up' ? 'text-green-600' : 
                  analyticsData.bookings.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
                }`}>
                  <Icon name={
                    analyticsData.bookings.trend === 'up' ? 'TrendingUp' : 
                    analyticsData.bookings.trend === 'down' ? 'TrendingDown' : 'Minus'
                  } size={16} />
                  <span>{Math.abs(analyticsData.bookings.growth)}%</span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{analyticsData.bookings.total}</p>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Icon name="Users" size={24} className="text-accent" />
                </div>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Icon name="Minus" size={16} />
                  <span>0%</span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{analyticsData.customers.total}</p>
                <p className="text-sm text-muted-foreground">Unique Customers</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Icon name="Star" size={24} className="text-yellow-600" />
                </div>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Icon name="Minus" size={16} />
                  <span>0</span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{analyticsData.rating.average || 0}</p>
                <p className="text-sm text-muted-foreground">{analyticsData.rating.total} Reviews</p>
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h4 className="font-medium text-foreground mb-6">Revenue Trend</h4>
            {monthlyData.length > 0 ? (
              <div className="space-y-4">
                {monthlyData.map((data, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-12 text-sm text-muted-foreground">{data.month}</div>
                    <div className="flex-1 bg-muted rounded-full h-2 relative">
                      <div 
                        className="bg-primary rounded-full h-2 transition-all duration-300"
                        style={{ width: `${Math.min((data.revenue / Math.max(...monthlyData.map(m => m.revenue))) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="w-20 text-sm font-medium text-foreground text-right">${data.revenue}</div>
                    <div className="w-16 text-sm text-muted-foreground text-right">{data.bookings} bookings</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No revenue data available</p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Services */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-medium text-foreground mb-6">Top Performing Services</h4>
              {topServices.length > 0 ? (
                <div className="space-y-4">
                  {topServices.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{service.name}</p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span>{service.bookings} bookings</span>
                            <span>•</span>
                            <div className="flex items-center space-x-1">
                              <Icon name="Star" size={12} className="text-yellow-500" />
                              <span>{service.rating || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">${service.revenue}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No service data available</p>
              )}
            </div>

            {/* Customer Demographics */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-medium text-foreground mb-6">Customer Insights</h4>
              
              <div className="mb-6">
                <h5 className="text-sm font-medium text-foreground mb-3">Top Countries</h5>
                {topCountries.length > 0 ? (
                  <div className="space-y-3">
                    {topCountries.map((country, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <span className="text-sm text-foreground">{country.country}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-muted rounded-full h-1.5">
                            <div 
                              className="bg-primary rounded-full h-1.5 transition-all duration-300"
                              style={{ width: `${country.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8">{country.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No customer data available</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BusinessAnalytics;
