import React, { useState } from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';

const DocumentUploadModal = ({ isOpen, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});

  const documentTypes = [
    { id: 'passport', name: 'Passport', required: true },
    { id: 'visa', name: 'Visa', required: true },
    { id: 'insurance', name: 'Travel Insurance', required: false },
    { id: 'vaccination', name: 'Vaccination Certificate', required: true },
    { id: 'license', name: 'Driver\'s License', required: false },
    { id: 'other', name: 'Other Documents', required: false }
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        const fileId = Date.now() + Math.random();
        const newFile = {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          file: file,
          uploadDate: new Date().toISOString()
        };
        
        setUploadedFiles(prev => [...prev, newFile]);
        
        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 30;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
          }
          setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
        }, 200);
      } else {
        alert('Please upload only images (JPG, PNG) or PDF files');
      }
    });
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold">Upload Travel Documents</h2>
            <p className="text-muted-foreground">Keep your important documents safe and accessible</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Area */}
            <div>
              <h3 className="text-lg font-medium mb-4">Upload New Documents</h3>
              
              {/* Drag & Drop Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Icon name="Upload" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h4 className="text-lg font-medium mb-2">Drop files here</h4>
                <p className="text-muted-foreground mb-4">
                  or click to browse your files
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={(e) => handleFiles(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer">
                    <Icon name="FolderOpen" size={16} />
                    Browse Files
                  </Button>
                </label>
                <p className="text-xs text-muted-foreground mt-2">
                  Supported formats: JPG, PNG, PDF (Max 10MB each)
                </p>
              </div>

              {/* Document Types */}
              <div className="mt-6">
                <h4 className="font-medium mb-3">Document Types</h4>
                <div className="space-y-2">
                  {documentTypes.map((docType) => (
                    <div key={docType.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Icon name="FileText" size={16} className="text-muted-foreground" />
                        <span className="text-sm">{docType.name}</span>
                        {docType.required && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Required</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {uploadedFiles.filter(file => file.name.toLowerCase().includes(docType.id)).length > 0 
                          ? '✓ Uploaded' 
                          : 'Not uploaded'
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Uploaded Files */}
            <div>
              <h3 className="text-lg font-medium mb-4">
                Uploaded Documents ({uploadedFiles.length})
              </h3>
              
              {uploadedFiles.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Icon name="FileText" size={48} className="mx-auto mb-4" />
                  <p>No documents uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <Icon 
                            name={file.type === 'application/pdf' ? 'FileText' : 'Image'} 
                            size={20} 
                            className="text-muted-foreground" 
                          />
                          <div>
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)} • {new Date(file.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                      
                      {/* Progress Bar */}
                      {uploadProgress[file.id] < 100 && (
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress[file.id] || 0}%` }}
                          ></div>
                        </div>
                      )}
                      
                      {uploadProgress[file.id] >= 100 && (
                        <div className="flex items-center space-x-2 text-green-600">
                          <Icon name="CheckCircle" size={16} />
                          <span className="text-sm">Upload complete</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {uploadedFiles.length} documents uploaded
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  alert(`${uploadedFiles.length} documents saved successfully!`);
                  onClose();
                }}
                disabled={uploadedFiles.length === 0}
              >
                Save Documents
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadModal;
