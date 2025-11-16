/**
 * Example component demonstrating API client usage
 * This shows how to interact with the backend database
 */

import { useState, useEffect } from 'react';
import { apiClient, Document, ProcessingJob } from '@/lib/api';

export function DatabaseExample() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
    fetchJobs();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getDocuments({ limit: 10 });
      setDocuments(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const data = await apiClient.getJobs({ limit: 10 });
      setJobs(data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleParseDocument = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Parse the document
      const result = await apiClient.parseDocument(selectedFile);

      // Create a document record in the database
      if (result.success) {
        await apiClient.createDocument({
          filename: selectedFile.name,
          file_type: selectedFile.name.split('.').pop() || 'unknown',
          task_type: 'parse',
          content: result.content,
          metadata: {
            files: result.files,
            output_dir: result.output_dir,
          },
          output_path: result.output_dir,
          status: 'completed',
        });

        // Refresh the documents list
        await fetchDocuments();
        setSelectedFile(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse document');
      console.error('Error parsing document:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (id: number) => {
    try {
      await apiClient.deleteDocument(id);
      await fetchDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
    }
  };

  const checkHealth = async () => {
    try {
      const result = await apiClient.healthCheck();
      alert(`Database Health: ${result.message}`);
    } catch (err) {
      alert(`Database connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Database API Example</h1>

      {/* Health Check Button */}
      <div className="mb-6">
        <button
          onClick={checkHealth}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Check Database Health
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* File Upload Section */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Upload & Parse Document</h2>
        <div className="flex items-center gap-4">
          <input
            type="file"
            onChange={handleFileSelect}
            accept=".pdf,.jpg,.jpeg,.png"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleParseDocument}
            disabled={!selectedFile || loading}
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Parse Document'}
          </button>
        </div>
        {selectedFile && (
          <p className="mt-2 text-sm text-gray-600">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
          </p>
        )}
      </div>

      {/* Documents List */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Documents</h2>
          <button
            onClick={fetchDocuments}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : documents.length === 0 ? (
          <p className="text-gray-500">No documents found</p>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="p-4 bg-white rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">{doc.filename}</h3>
                    <p className="text-sm text-gray-600">
                      Type: {doc.file_type} | Task: {doc.task_type} | Status: {doc.status}
                    </p>
                    {doc.created_at && (
                      <p className="text-xs text-gray-400 mt-1">
                        Created: {new Date(doc.created_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
                {doc.content && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-blue-600">
                      View Content
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-40">
                      {doc.content.substring(0, 500)}...
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Processing Jobs List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Processing Jobs</h2>
          <button
            onClick={fetchJobs}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Refresh
          </button>
        </div>

        {jobs.length === 0 ? (
          <p className="text-gray-500">No jobs found</p>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <div key={job.id} className="p-4 bg-white rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">Job ID: {job.job_id}</h3>
                    <p className="text-sm text-gray-600">
                      Type: {job.job_type} | Status: {job.status} | Progress: {job.progress}%
                    </p>
                    <p className="text-xs text-gray-500">Input: {job.input_file}</p>
                    {job.created_at && (
                      <p className="text-xs text-gray-400 mt-1">
                        Created: {new Date(job.created_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                {job.progress > 0 && job.progress < 100 && (
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DatabaseExample;

