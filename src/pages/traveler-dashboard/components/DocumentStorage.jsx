import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DocumentStorage = ({ documents, onUploadDocuments }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Documents', icon: 'FileText' },
    { id: 'passport', name: 'Passport', icon: 'BookOpen' },
    { id: 'visa', name: 'Visas', icon: 'Stamp' },
    { id: 'insurance', name: 'Insurance', icon: 'Shield' },
    { id: 'booking', name: 'Bookings', icon: 'Ticket' },
    { id: 'health', name: 'Health', icon: 'Heart' }
  ];

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'passport': return 'BookOpen';
      case 'visa': return 'Stamp';
      case 'insurance': return 'Shield';
      case 'booking': return 'Ticket';
      case 'health': return 'Heart';
      default: return 'FileText';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'valid': return 'text-success bg-success/10';
      case 'expiring': return 'text-warning bg-warning/10';
      case 'expired': return 'text-error bg-error/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const filteredDocuments = selectedCategory === 'all' 
    ? documents 
    : documents?.filter(doc => doc?.category === selectedCategory);

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
            <Icon name="FolderOpen" size={20} className="text-secondary" />
          </div>
          <div>
            <h3 className="font-display text-lg font-medium">Document Storage</h3>
            <p className="text-sm text-muted-foreground">Secure access to all your travel documents</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onUploadDocuments}>
          <Icon name="Upload" size={16} />
          Upload
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {categories?.map((category) => (
          <button
            key={category?.id}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedCategory(category?.id);
            }}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedCategory === category?.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Icon name={category?.icon} size={16} />
            <span>{category?.name}</span>
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filteredDocuments?.map((document) => (
          <div key={document?.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors duration-200">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <Icon name={getDocumentIcon(document?.category)} size={20} className="text-muted-foreground" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-1">
                  <h4 className="font-medium text-foreground">{document?.name}</h4>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document?.status)}`}>
                    {document?.status}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>Expires: {document?.expiryDate}</span>
                  <span>•</span>
                  <span>Updated: {document?.lastUpdated}</span>
                  {document?.offlineAccess && (
                    <>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Icon name="Download" size={12} />
                        <span>Offline</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Icon name="Eye" size={16} />
              </Button>
              <Button variant="ghost" size="sm">
                <Icon name="Download" size={16} />
              </Button>
              <Button variant="ghost" size="sm">
                <Icon name="Share2" size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>
      {filteredDocuments?.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="FileText" size={24} className="text-muted-foreground" />
          </div>
          <h4 className="font-medium text-foreground mb-2">No documents found</h4>
          <p className="text-sm text-muted-foreground mb-4">Upload your travel documents for secure storage</p>
          <Button variant="default" onClick={onUploadDocuments}>
            <Icon name="Upload" size={16} />
            Upload Document
          </Button>
        </div>
      )}
    </div>
  );
};

export default DocumentStorage;