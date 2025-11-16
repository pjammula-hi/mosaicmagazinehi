import { useState } from 'react';
import { projectId } from '../utils/supabase/info';
import { Upload, Download, CheckCircle, AlertCircle, X, Users, FileSpreadsheet } from 'lucide-react';

interface BulkUserUploadProps {
  authToken: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface UploadResult {
  success: boolean;
  email: string;
  fullName: string;
  role: string;
  error?: string;
}

export function BulkUserUpload({ authToken, onClose, onSuccess }: BulkUserUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [error, setError] = useState('');

  const downloadTemplate = () => {
    const csvContent = 'fullName,email,role\nJohn Doe,student@nycstudents.net,student\nJane Smith,teacher@schools.nyc.gov,teacher\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please upload a CSV file');
        return;
      }
      setFile(selectedFile);
      setError('');
      setResults([]);
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const users = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length === headers.length) {
        const user: any = {};
        headers.forEach((header, index) => {
          user[header] = values[index];
        });
        users.push(user);
      }
    }
    return users;
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');
    setResults([]);

    try {
      // Read and parse CSV
      const text = await file.text();
      const users = parseCSV(text);

      if (users.length === 0) {
        throw new Error('No valid users found in CSV file');
      }

      // Validate CSV structure
      const requiredFields = ['fullName', 'email', 'role'];
      const firstUser = users[0];
      const missingFields = requiredFields.filter(field => !firstUser[field]);
      if (missingFields.length > 0) {
        throw new Error(`CSV is missing required columns: ${missingFields.join(', ')}`);
      }

      // Upload users
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/admin/bulk-create-users`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ users })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload users');
      }

      setResults(data.results || []);
      
      // If all successful, close after a delay
      const allSuccess = data.results.every((r: UploadResult) => r.success);
      if (allSuccess) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (err: any) {
      console.error('Bulk upload error:', err);
      setError(err.message || 'Failed to upload users');
    } finally {
      setUploading(false);
    }
  };

  const successCount = results.filter(r => r.success).length;
  const errorCount = results.filter(r => !r.success).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-50 to-blue-50 p-6 border-b z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-8 h-8 text-purple-600" />
              <div>
                <h2 className="text-2xl">Bulk User Upload</h2>
                <p className="text-sm text-gray-600 mt-1">Upload multiple users via CSV file</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <h3 className="text-lg mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Instructions
            </h3>
            <ol className="space-y-2 text-sm text-gray-700">
              <li>1. Download the CSV template to see the required format</li>
              <li>2. Fill in user information: <strong>fullName</strong>, <strong>email</strong>, <strong>role</strong></li>
              <li>3. Valid roles: student, teacher, guardian, editor, admin</li>
              <li>4. Upload your completed CSV file</li>
              <li>5. Review results and any errors</li>
            </ol>
            <div className="mt-4">
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download CSV Template
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-900">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* File Upload */}
          <div>
            <label className="block text-sm mb-3 text-gray-700">
              Upload CSV File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer text-purple-600 hover:text-purple-700"
              >
                Click to select CSV file
              </label>
              {file && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>{file.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Upload Button */}
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Users className="w-5 h-5" />
              {uploading ? 'Uploading...' : 'Upload Users'}
            </button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg">Upload Results</h3>
                <div className="flex items-center gap-4 text-sm">
                  {successCount > 0 && (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      {successCount} successful
                    </span>
                  )}
                  {errorCount > 0 && (
                    <span className="flex items-center gap-1 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      {errorCount} failed
                    </span>
                  )}
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto border rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left py-2 px-4 text-sm text-gray-700">Status</th>
                      <th className="text-left py-2 px-4 text-sm text-gray-700">Name</th>
                      <th className="text-left py-2 px-4 text-sm text-gray-700">Email</th>
                      <th className="text-left py-2 px-4 text-sm text-gray-700">Role</th>
                      <th className="text-left py-2 px-4 text-sm text-gray-700">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr key={index} className="border-t">
                        <td className="py-2 px-4">
                          {result.success ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          )}
                        </td>
                        <td className="py-2 px-4 text-sm">{result.fullName}</td>
                        <td className="py-2 px-4 text-sm text-gray-600">{result.email}</td>
                        <td className="py-2 px-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${
                            result.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            result.role === 'editor' ? 'bg-blue-100 text-blue-700' :
                            result.role === 'teacher' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {result.role}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-sm text-gray-600">
                          {result.error || 'Created successfully'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
