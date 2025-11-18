import { useState, useEffect } from 'react';
import { projectId } from '../utils/supabase/info';
import { fetchWithAuth } from '../utils/sessionManager';
import { 
  Upload, 
  Check, 
  X, 
  Eye, 
  Edit, 
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Palette,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  Trash2,
  Download,
  RotateCcw,
  Plus,
  Calendar,
  Maximize2,
  ExternalLink,
  Move
} from 'lucide-react';
import { EmailComposer } from './EmailComposer';
import { IssuePublisher } from './IssuePublisher';
import { MultiDocumentUpload } from './MultiDocumentUpload';
import { EditableSubmissionFields } from './EditableSubmissionFields';

interface EnhancedSubmissionManagerProps {
  authToken: string;
  onUpdate: () => void;
}

export function EnhancedSubmissionManager({ authToken, onUpdate }: EnhancedSubmissionManagerProps) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [editorNotes, setEditorNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedIssue, setSelectedIssue] = useState('');
  const [pageNumber, setPageNumber] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedSubmission, setEditedSubmission] = useState<any>(null);
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [uploadingReplacement, setUploadingReplacement] = useState(false);
  const [showManualUpload, setShowManualUpload] = useState(false);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [emailType, setEmailType] = useState<'acknowledgement' | 'accepted' | 'declined'>('acknowledgement');
  const [showPublisher, setShowPublisher] = useState(false);
  const [selectedIssueForPublishing, setSelectedIssueForPublishing] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'inbox' | 'trash'>('inbox');
  const [showQuickIssueCreate, setShowQuickIssueCreate] = useState(false);
  const [quickIssue, setQuickIssue] = useState({
    title: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    description: ''
  });
  const [isSubmissionEditMode, setIsSubmissionEditMode] = useState(false);
  const [hasAuthor, setHasAuthor] = useState(true);

  const [manualSubmission, setManualSubmission] = useState({
    type: '',
    title: '',
    content: '',
    fileUrl: '',
    imageUrl: '',
    authorName: '',
    authorEmail: '',
    contributorStatus: ''
  });
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [contributorStatuses, setContributorStatuses] = useState<Array<{ value: string; label: string }>>([]);
  const [contentTypes, setContentTypes] = useState<Array<{ value: string; label: string }>>([]);
  
  // Modal dragging state
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchSubmissions();
    fetchIssues();
    fetchContributorStatuses();
    fetchContentTypes();
  }, [viewMode]); // Re-fetch when switching between inbox and trash

  const fetchContributorStatuses = async () => {
    try {
      const response = await fetchWithAuth(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/contributor-statuses`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );

      const data = await response.json();

      if (response.ok && data.statuses) {
        const statuses = data.statuses.map((s: any) => ({
          value: s.value,
          label: s.label
        }));
        setContributorStatuses(statuses);
        
        // Set first status as default for manual submission
        if (statuses.length > 0 && !manualSubmission.contributorStatus) {
          setManualSubmission(prev => ({ ...prev, contributorStatus: statuses[0].value }));
        }
      }
    } catch (err) {
      console.error('Error fetching contributor statuses:', err);
      // Fallback to default statuses
      setContributorStatuses([
        { value: 'student', label: 'Student' },
        { value: 'teacher', label: 'Teacher' }
      ]);
      setManualSubmission(prev => ({ ...prev, contributorStatus: 'student' }));
    }
  };

  const fetchContentTypes = async () => {
    try {
      const response = await fetchWithAuth(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/content-types`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );

      const data = await response.json();

      if (response.ok && data.types) {
        const types = data.types.map((t: any) => ({
          value: t.value,
          label: t.label
        }));
        setContentTypes(types);
        
        // Set first type as default for manual submission
        if (types.length > 0 && !manualSubmission.type) {
          setManualSubmission(prev => ({ ...prev, type: types[0].value }));
        }
      }
    } catch (err) {
      console.error('Error fetching content types:', err);
      // Fallback to default types
      setContentTypes([
        { value: 'writing', label: 'Writing' },
        { value: 'poem', label: 'Poem' }
      ]);
      setManualSubmission(prev => ({ ...prev, type: 'writing' }));
    }
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      // Add query parameter to show trash or inbox based on viewMode
      const trashParam = viewMode === 'trash' ? '?trash=true' : '';
      const response = await fetchWithAuth(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/submissions${trashParam}`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );
      const data = await response.json();
      if (response.ok) {
        setSubmissions(data.submissions || []);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchIssues = async () => {
    try {
      console.log('[EnhancedSubmissionManager] Fetching issues...');
      const response = await fetchWithAuth(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/issues`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );
      const data = await response.json();
      console.log('[EnhancedSubmissionManager] Issues response:', { status: response.status, data });
      
      if (response.ok) {
        setIssues(data.issues || []);
      } else {
        console.error('[EnhancedSubmissionManager] Error fetching issues:', {
          status: response.status,
          error: data.error,
          details: data.details,
          fullResponse: data
        });
      }
    } catch (err) {
      console.error('[EnhancedSubmissionManager] Network error fetching issues:', err);
    }
  };

  const handleUpdateSubmission = async () => {
    if (!selectedSubmission) return;

    try {
      const updateData: any = {
        status: selectedStatus || selectedSubmission.status,
        editorNotes,
        issueId: selectedIssue || selectedSubmission.issueId,
        documents: selectedSubmission.documents || []
      };

      // If accepted, include issue metadata
      if (selectedStatus === 'accepted' && selectedIssue) {
        updateData.issueMetadata = {
          issueNumber: issues.find(i => i.id === selectedIssue)?.number,
          pageNumber: pageNumber || null,
          shortDescription: shortDescription || null
        };
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/submissions/${selectedSubmission.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(updateData)
        }
      );

      if (response.ok) {
        // Auto-open email composer based on status change
        const oldStatus = selectedSubmission.status;
        const newStatus = selectedStatus || oldStatus;
        
        if (oldStatus === 'pending' && newStatus === 'under_review') {
          setEmailType('acknowledgement');
          setShowEmailComposer(true);
          return; // Keep modal open for email
        } else if (newStatus === 'accepted' && oldStatus !== 'accepted') {
          setEmailType('accepted');
          setShowEmailComposer(true);
          return; // Keep modal open for email
        } else if (newStatus === 'declined' && oldStatus !== 'declined') {
          setEmailType('declined');
          setShowEmailComposer(true);
          return; // Keep modal open for email
        }

        // If no email needed, close modal
        closeModal();
        fetchSubmissions();
        onUpdate();
      }
    } catch (err) {
      console.error('Error updating submission:', err);
      alert('Failed to update submission. Please try again.');
    }
  };

  const handleSendEmail = async (emailContent: { subject: string; body: string }) => {
    if (!selectedSubmission) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/submissions/${selectedSubmission.id}/send-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            ...emailContent,
            recipientEmail: selectedSubmission.authorEmail || `${selectedSubmission.authorName}@nycstudents.net`,
            recipientName: selectedSubmission.authorName
          })
        }
      );

      if (response.ok) {
        alert('Email sent successfully!');
        setShowEmailComposer(false);
        closeModal();
        fetchSubmissions();
        onUpdate();
      } else {
        const error = await response.json();
        alert(`Failed to send email: ${error.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error sending email:', err);
      throw err;
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Document file must be less than 10MB');
      return;
    }

    setDocumentFile(file);
    setUploadingDoc(true);

    try {
      console.log('[Document Upload] Starting upload, file:', file.name, 'authToken length:', authToken?.length);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'document');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/upload-file`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          body: formData
        }
      );

      const data = await response.json();
      
      console.log('Document upload response:', response.status, data);

      if (response.ok && data.url) {
        setManualSubmission({ ...manualSubmission, fileUrl: data.url });
        setDocumentPreviewUrl(data.url);
        setShowDocumentPreview(true);
      } else {
        let errorMsg = data.message || data.error || data.details || 'Upload failed';
        // Provide helpful message for auth errors
        if (response.status === 401) {
          console.error('Auth error details:', data);
          errorMsg = 'Your session has expired. Please log out and log in again.';
          alert(errorMsg + '\n\nYou will be redirected to the login page.');
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.reload();
          return;
        }
        console.error('Document upload failed:', { status: response.status, error: errorMsg, data });
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error('Document upload error:', err);
      // Don't show alert if we're already redirecting
      if (!err.message.includes('redirected')) {
        alert('Failed to upload document: ' + err.message);
      }
      setDocumentFile(null);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file must be less than 5MB');
      return;
    }

    setImageFile(file);
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'image');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/upload-file`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          body: formData
        }
      );

      const data = await response.json();
      
      console.log('Image upload response:', response.status, data);

      if (response.ok && data.url) {
        // Store cell image URL separately from document URL
        setManualSubmission({ ...manualSubmission, imageUrl: data.url });
      } else {
        let errorMsg = data.message || data.error || data.details || 'Upload failed';
        // Provide helpful message for auth errors
        if (response.status === 401) {
          console.error('Auth error details:', data);
          errorMsg = 'Your session has expired. Please log out and log in again.';
          alert(errorMsg + '\n\nYou will be redirected to the login page.');
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.reload();
          return;
        }
        console.error('Image upload failed:', { status: response.status, error: errorMsg, data });
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error('Image upload error:', err);
      // Don't show alert if we're already redirecting
      if (!err.message.includes('redirected')) {
        alert('Failed to upload image: ' + err.message);
      }
      setImageFile(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleManualUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/submissions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            ...manualSubmission,
            status: 'pending'
          })
        }
      );

      if (response.ok) {
        setManualSubmission({ 
          type: contentTypes.length > 0 ? contentTypes[0].value : '', 
          title: '', 
          content: '', 
          fileUrl: '',
          imageUrl: '',
          authorName: '',
          authorEmail: '',
          contributorStatus: contributorStatuses.length > 0 ? contributorStatuses[0].value : ''
        });
        setDocumentFile(null);
        setImageFile(null);
        setHasAuthor(true); // Reset to default
        setShowManualUpload(false);
        fetchSubmissions();
        onUpdate();
        alert('Manual submission added successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to add submission'}`);
      }
    } catch (err) {
      console.error('Error uploading submission:', err);
      alert('Failed to upload submission. Please try again.');
    }
  };

  const handleMoveToTrash = async (submissionId: string) => {
    if (!confirm('Move this submission to trash? You can restore it later.')) {
      return;
    }

    try {
      console.log('🗑️ Moving submission to trash:', submissionId);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/submissions/${submissionId}/trash`,
        {
          method: 'POST',  // ✅ Changed from PUT to POST to match server endpoint
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      console.log('🗑️ Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🗑️ Success:', data);
        
        // Close modal by resetting state (complete inline from closeModal)
        try {
          console.log('🗑️ Step 1: Resetting modal state...');
          setSelectedSubmission(null);
          setEditorNotes('');
          setSelectedStatus('');
          setSelectedIssue('');
          setPageNumber('');
          setShortDescription('');
          setIsEditMode(false);
          setEditedSubmission(null);
          setReplacementFile(null);
          
          console.log('🗑️ Step 2: Resetting modal position...');
          setModalPosition({ x: 0, y: 0 });
          
          console.log('🗑️ Step 3: Resetting submission edit mode...');
          setIsSubmissionEditMode(false);
          
          console.log('🗑️ Step 4: Fetching submissions...');
          fetchSubmissions();
          
          console.log('🗑️ Step 5: Calling onUpdate...');
          onUpdate();
          
          console.log('🗑️ Step 6: Showing alert...');
          alert('Submission moved to trash');
        } catch (innerErr) {
          console.error('❌ Error in success handler:', innerErr);
          throw innerErr;
        }
      } else {
        const error = await response.json();
        console.error('🗑️ Error response:', error);
        alert(`Error: ${error.error || 'Failed to move to trash'}`);
      }
    } catch (err) {
      console.error('❌ Error moving to trash:', err);
      alert('Failed to move to trash. Please try again.');
    }
  };

  const handleRestoreFromTrash = async (submissionId: string) => {
    if (!confirm('Restore this submission to inbox?')) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/submissions/${submissionId}/restore`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (response.ok) {
        closeModal();
        fetchSubmissions();
        onUpdate();
        alert('Submission restored to inbox');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to restore'}`);
      }
    } catch (err) {
      console.error('Error restoring submission:', err);
      alert('Failed to restore. Please try again.');
    }
  };

  const handlePermanentDelete = async (submissionId: string) => {
    if (!confirm('⚠�� PERMANENTLY DELETE this submission? This action CANNOT be undone!')) {
      return;
    }

    if (!confirm('Are you absolutely sure? This will delete the submission forever.')) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/submissions/${submissionId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (response.ok) {
        closeModal();
        fetchSubmissions();
        onUpdate();
        alert('Submission permanently deleted');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to delete'}`);
      }
    } catch (err) {
      console.error('Error deleting submission:', err);
      alert('Failed to delete. Please try again.');
    }
  };

  const handleEmptyTrash = async () => {
    const trashedCount = submissions.filter(s => s.status === 'deleted').length;
    
    if (trashedCount === 0) {
      alert('Trash is already empty');
      return;
    }

    if (!confirm(`⚠️ EMPTY TRASH: Permanently delete all ${trashedCount} submissions in trash? This action CANNOT be undone!`)) {
      return;
    }

    if (!confirm('Are you absolutely sure? This will delete ALL trashed submissions forever.')) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/submissions/empty-trash`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        fetchSubmissions();
        onUpdate();
        alert(`✓ Trash emptied: ${data.count} submission(s) permanently deleted`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to empty trash'}`);
      }
    } catch (err) {
      console.error('Error emptying trash:', err);
      alert('Failed to empty trash. Please try again.');
    }
  };

  const handleDownloadFile = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Failed to download file. Please try again.');
    }
  };

  const closeModal = () => {
    setSelectedSubmission(null);
    setEditorNotes('');
    setSelectedStatus('');
    setSelectedIssue('');
    setPageNumber('');
    setShortDescription('');
    setIsEditMode(false);
    setEditedSubmission(null);
    setReplacementFile(null);
    setModalPosition({ x: 0, y: 0 }); // Reset modal position
    setIsSubmissionEditMode(false);
  };

  const handleDetachMainFile = async () => {
    if (!selectedSubmission) return;

    if (window.confirm('Are you sure you want to detach this file? This action cannot be undone.')) {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/submissions/${selectedSubmission.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
              ...selectedSubmission,
              fileUrl: null
            })
          }
        );

        if (response.ok) {
          alert('File detached successfully!');
          setSelectedSubmission({
            ...selectedSubmission,
            fileUrl: null
          });
          fetchSubmissions();
          onUpdate();
        } else {
          const error = await response.json();
          alert(`Error: ${error.error || 'Failed to detach file'}`);
        }
      } catch (err) {
        console.error('Error detaching file:', err);
        alert('Failed to detach file. Please try again.');
      }
    }
  };

  // Modal dragging handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow dragging from the header area
    if ((e.target as HTMLElement).closest('.modal-header')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - modalPosition.x,
        y: e.clientY - modalPosition.y
      });
    }
  };

  // Add and remove event listeners for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setModalPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart.x, dragStart.y]);

  const enterEditMode = () => {
    setIsEditMode(true);
    setEditedSubmission({
      title: selectedSubmission.title,
      authorName: selectedSubmission.authorName,
      authorEmail: selectedSubmission.authorEmail || '',
      contributorStatus: selectedSubmission.contributorStatus || 'student',
      type: selectedSubmission.type,
      content: selectedSubmission.content || ''
    });
  };

  const handleReplacementFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File must be less than 10MB');
      return;
    }

    setReplacementFile(file);
    setUploadingReplacement(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', file.type.startsWith('image/') ? 'image' : 'document');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/upload-file`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          body: formData
        }
      );

      const data = await response.json();
      
      if (response.ok && data.url) {
        setEditedSubmission({ ...editedSubmission, fileUrl: data.url });
        alert('File uploaded successfully!');
      } else {
        throw new Error(data.message || data.error || 'Upload failed');
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      alert('Failed to upload file: ' + err.message);
      setReplacementFile(null);
    } finally {
      setUploadingReplacement(false);
    }
  };

  const saveSubmissionEdits = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/submissions/${selectedSubmission.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            title: editedSubmission.title,
            authorName: editedSubmission.authorName,
            authorEmail: editedSubmission.authorEmail,
            contributorStatus: editedSubmission.contributorStatus,
            type: editedSubmission.type,
            content: editedSubmission.content,
            fileUrl: editedSubmission.fileUrl || selectedSubmission.fileUrl
          })
        }
      );

      if (response.ok) {
        alert('Submission updated successfully!');
        setIsEditMode(false);
        setEditedSubmission(null);
        setReplacementFile(null);
        fetchSubmissions();
        onUpdate();
        closeModal();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to update submission'}`);
      }
    } catch (err) {
      console.error('Error updating submission:', err);
      alert('Failed to update submission. Please try again.');
    }
  };

  const openEmailComposer = (type: 'acknowledgement' | 'accepted' | 'declined') => {
    setEmailType(type);
    setShowEmailComposer(true);
  };

  const handleQuickCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/issues`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(quickIssue)
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert(`Issue #${data.issue.number} created successfully!`);
        setQuickIssue({
          title: '',
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          description: ''
        });
        setShowQuickIssueCreate(false);
        fetchIssues();
        onUpdate();
      } else {
        const error = await response.json();
        alert(`Failed to create issue: ${error.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error creating issue:', err);
      alert('Failed to create issue. Please try again.');
    }
  };

  const handleQuickAssignIssue = async (submissionId: string, issueId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/submissions/${submissionId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ issueId: issueId || null })
        }
      );

      if (response.ok) {
        fetchSubmissions();
        onUpdate();
      } else {
        const error = await response.json();
        alert(`Failed to assign issue: ${error.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error assigning issue:', err);
      alert('Failed to assign issue. Please try again.');
    }
  };

  const getMonthName = (month: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || '';
  };

  const getTypeIcon = (type: string) => {
    if (type === 'photo' || type === 'art' || type === 'crafts') return <ImageIcon className="w-4 h-4" />;
    if (type === 'poem' || type === 'writing' || type === 'story') return <FileText className="w-4 h-4" />;
    return <Palette className="w-4 h-4" />;
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-700',
      under_review: 'bg-blue-100 text-blue-700',
      accepted: 'bg-green-100 text-green-700',
      declined: 'bg-red-100 text-red-700',
      published: 'bg-purple-100 text-purple-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    const labels: any = {
      pending: 'Pending',
      under_review: 'Under Review',
      accepted: 'Accepted',
      declined: 'Declined',
      published: 'Published',
      deleted: 'Deleted'
    };
    return labels[status] || status;
  };

  const filteredSubmissions = submissions.filter(s => {
    // Backend now handles inbox/trash filtering via ?trash=true parameter
    // Only filter by status here
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    
    return true;
  });

  if (loading) {
    return <div className="text-center py-12">Loading submissions...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-display">Submissions</h2>
          
          {/* Inbox/Trash Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                setViewMode('inbox');
                setFilterStatus('all');
              }}
              className={`px-4 py-2 rounded-md text-sm font-sans-modern transition-colors ${
                viewMode === 'inbox'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Inbox ({submissions.filter(s => s.status !== 'deleted').length})
            </button>
            <button
              onClick={() => {
                setViewMode('trash');
                setFilterStatus('all');
              }}
              className={`px-4 py-2 rounded-md text-sm font-sans-modern transition-colors flex items-center gap-2 ${
                viewMode === 'trash'
                  ? 'bg-white text-red-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              Trash ({submissions.filter(s => s.status === 'deleted').length})
            </button>
          </div>

          {viewMode === 'inbox' && (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-600 focus:border-transparent font-sans-modern"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
              <option value="published">Published</option>
            </select>
          )}
        </div>

        {/* Action Buttons */}
        {viewMode === 'inbox' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQuickIssueCreate(!showQuickIssueCreate)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-sans-modern"
            >
              <Plus className="w-4 h-4" />
              Create Issue
            </button>
            <button
              onClick={() => setShowManualUpload(!showManualUpload)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-sans-modern"
            >
              <Upload className="w-4 h-4" />
              Manual Upload
            </button>
          </div>
        )}

        {viewMode === 'trash' && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleEmptyTrash}
              disabled={submissions.filter(s => s.status === 'deleted').length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-sans-modern disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              Empty Trash
            </button>
          </div>
        )}
      </div>

      {/* Quick Issue Creation Form */}
      {showQuickIssueCreate && viewMode === 'inbox' && (
        <form onSubmit={handleQuickCreateIssue} className="mb-6 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border-2 border-amber-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-serif-warm text-amber-900">Create New Issue</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowQuickIssueCreate(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm mb-2 text-gray-700 font-sans-modern font-semibold">Issue Title</label>
              <input
                type="text"
                value={quickIssue.title}
                onChange={(e) => setQuickIssue({ ...quickIssue, title: e.target.value })}
                required
                className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                placeholder="e.g., November 2025 Edition"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700 font-sans-modern font-semibold">Month</label>
              <select
                value={quickIssue.month}
                onChange={(e) => setQuickIssue({ ...quickIssue, month: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-600"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {getMonthName(i + 1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700 font-sans-modern font-semibold">Year</label>
              <input
                type="number"
                value={quickIssue.year}
                onChange={(e) => setQuickIssue({ ...quickIssue, year: parseInt(e.target.value) })}
                required
                min="2020"
                max="2100"
                className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm mb-2 text-gray-700 font-sans-modern font-semibold">Description (optional)</label>
              <textarea
                value={quickIssue.description}
                onChange={(e) => setQuickIssue({ ...quickIssue, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-600"
                placeholder="Brief description of this issue..."
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-sans-modern"
            >
              <Plus className="w-4 h-4" />
              Create Issue
            </button>
            <button
              type="button"
              onClick={() => setShowQuickIssueCreate(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-sans-modern"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Issue Publisher Buttons - Only show in inbox mode */}
      {viewMode === 'inbox' && (
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          {issues.filter(i => i.status === 'draft').map(issue => (
            <button
              key={issue.id}
              onClick={() => {
                setSelectedIssueForPublishing(issue);
                setShowPublisher(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-sans-modern text-sm"
            >
              <BookOpen className="w-4 h-4" />
              Publish Issue #{issue.number}
            </button>
          ))}
        </div>
      )}

      {showManualUpload && viewMode === 'inbox' && (
        <form onSubmit={handleManualUpload} className="mb-6 p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
          <h3 className="text-lg mb-4 font-serif-warm">Upload Submission Manually</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2 text-gray-700 font-sans-modern">Type</label>
              <select
                value={manualSubmission.type}
                onChange={(e) => setManualSubmission({ ...manualSubmission, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                required
              >
                {contentTypes.length === 0 ? (
                  <option value="">Loading types...</option>
                ) : (
                  contentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700 font-sans-modern">Title</label>
              <input
                type="text"
                value={manualSubmission.title}
                onChange={(e) => setManualSubmission({ ...manualSubmission, title: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              />
            </div>

            {/* Has Author Toggle */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={hasAuthor}
                    onChange={(e) => {
                      setHasAuthor(e.target.checked);
                      // Clear author fields if "No Author" is selected
                      if (!e.target.checked) {
                        setManualSubmission({ 
                          ...manualSubmission, 
                          authorName: 'N/A',
                          authorEmail: '',
                          contributorStatus: contributorStatuses.length > 0 ? contributorStatuses[0].value : 'student'
                        });
                      } else {
                        setManualSubmission({ 
                          ...manualSubmission, 
                          authorName: '',
                          authorEmail: ''
                        });
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-purple-600 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                </div>
                <span className="text-sm text-gray-700 font-sans-modern font-semibold">
                  Has Author? <span className="text-gray-500 font-normal">(For credits, staff pages, etc. toggle off if no specific author)</span>
                </span>
              </label>
            </div>

            {hasAuthor && (
              <>
                <div>
                  <label className="block text-sm mb-2 text-gray-700 font-sans-modern">Author Name</label>
                  <input
                    type="text"
                    value={manualSubmission.authorName}
                    onChange={(e) => setManualSubmission({ ...manualSubmission, authorName: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700 font-sans-modern">Author Email</label>
                  <input
                    type="email"
                    value={manualSubmission.authorEmail}
                    onChange={(e) => setManualSubmission({ ...manualSubmission, authorEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </>
            )}

            {hasAuthor && (
              <div className="md:col-span-2">
                <label className="block text-sm mb-2 text-gray-700 font-sans-modern">Contributor Status</label>
                <select
                  value={manualSubmission.contributorStatus}
                  onChange={(e) => setManualSubmission({ ...manualSubmission, contributorStatus: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  required
                >
                  {contributorStatuses.length === 0 ? (
                    <option value="">Loading statuses...</option>
                  ) : (
                    contributorStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm mb-2 text-gray-700 font-sans-modern">Content</label>
              <textarea
                value={manualSubmission.content}
                onChange={(e) => setManualSubmission({ ...manualSubmission, content: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              />
            </div>

            {/* Document Upload */}
            <div className="md:col-span-2 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <label className="block text-sm mb-2 text-gray-700 font-sans-modern font-semibold">Upload Document or Image (Optional)</label>
              <p className="text-xs text-gray-600 mb-3">Upload Word, PDF, text file, or image (max 10MB). PDF preview will appear below.</p>
              
              {!documentFile && (
                <input
                  type="file"
                  onChange={handleDocumentUpload}
                  accept=".doc,.docx,.pdf,.txt,image/*"
                  className="w-full text-sm"
                  disabled={uploadingDoc}
                />
              )}
              
              {uploadingDoc && (
                <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Uploading document...</span>
                </div>
              )}
              
              {documentFile && !uploadingDoc && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-300">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Check className="w-4 h-4" />
                      <span className="font-medium">Uploaded: {documentFile.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={documentPreviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Open in New Tab
                      </a>
                      <button
                        onClick={() => {
                          setDocumentFile(null);
                          setDocumentPreviewUrl('');
                          setShowDocumentPreview(false);
                          setManualSubmission({ ...manualSubmission, fileUrl: '' });
                        }}
                        className="p-1.5 hover:bg-red-50 rounded transition-colors"
                        title="Remove file"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Embedded PDF Preview */}
                  {showDocumentPreview && documentFile.type === 'application/pdf' && (
                    <div className="bg-white rounded-lg border-2 border-blue-300 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <FileText className="w-4 h-4" />
                          <span>PDF Preview - View content to add accurate title & description</span>
                        </div>
                        <button
                          onClick={() => window.open(documentPreviewUrl, '_blank')}
                          className="flex items-center gap-1 px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs transition-colors"
                        >
                          <Maximize2 className="w-3 h-3" />
                          Full Screen
                        </button>
                      </div>
                      <div 
                        className="cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(documentPreviewUrl, '_blank')}
                        title="Click to open in new tab"
                      >
                        <iframe
                          src={`${documentPreviewUrl}#toolbar=0&navpanes=0&view=FitH`}
                          className="w-full border-0"
                          style={{ height: '600px' }}
                          title="Document Preview"
                        />
                      </div>
                      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-600 border-t border-gray-200">
                        💡 <strong>Tip:</strong> Click anywhere on the preview to open in a new tab for better viewing
                      </div>
                    </div>
                  )}
                  
                  {/* Image Preview */}
                  {documentFile.type.startsWith('image/') && (
                    <div className="bg-white rounded-lg border-2 border-blue-300 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <ImageIcon className="w-4 h-4" />
                          <span>Image Preview</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <img 
                          src={documentPreviewUrl} 
                          alt="Preview" 
                          className="max-w-full h-auto rounded border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(documentPreviewUrl, '_blank')}
                          title="Click to open in new tab"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cell Image Upload */}
            <div className="md:col-span-2 bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
              <label className="block text-sm mb-2 text-gray-700 font-sans-modern font-semibold">Upload Cell Image (Optional)</label>
              <p className="text-xs text-gray-600 mb-3">Featured image for magazine layout (max 5MB)</p>
              <input
                type="file"
                onChange={handleImageUpload}
                accept="image/*"
                className="w-full text-sm"
                disabled={uploadingImage}
              />
              {uploadingImage && (
                <p className="text-sm text-purple-600 mt-2">Uploading image...</p>
              )}
              {imageFile && !uploadingImage && (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                  <Check className="w-4 h-4" />
                  <span>Uploaded: {imageFile.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-sans-modern"
            >
              Upload Submission
            </button>
            <button
              type="button"
              onClick={() => setShowManualUpload(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-sans-modern"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-gray-700 font-sans-modern">Type</th>
                <th className="text-left py-3 px-4 text-gray-700 font-sans-modern">Title</th>
                <th className="text-left py-3 px-4 text-gray-700 font-sans-modern">Author</th>
                <th className="text-left py-3 px-4 text-gray-700 font-sans-modern">Role</th>
                <th className="text-left py-3 px-4 text-gray-700 font-sans-modern">Status</th>
                <th className="text-left py-3 px-4 text-gray-700 font-sans-modern">Issue</th>
                <th className="text-left py-3 px-4 text-gray-700 font-sans-modern">Date</th>
                <th className="text-left py-3 px-4 text-gray-700 font-sans-modern">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((submission) => (
                <tr key={submission.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(submission.type)}
                      <span className="text-sm">{submission.type}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-serif-warm">{submission.title}</td>
                  <td className="py-3 px-4 text-gray-600 text-sm">{submission.authorName}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-sans-modern capitalize">
                      {submission.contributorStatus === 'hi-staff' ? 'HI Staff' : (submission.contributorStatus || 'N/A')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-sans-modern ${getStatusColor(submission.status)}`}>
                      {getStatusLabel(submission.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {viewMode === 'inbox' ? (
                      <select
                        value={submission.issueId || ''}
                        onChange={(e) => handleQuickAssignIssue(submission.id, e.target.value)}
                        className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                        <option value="">No Issue</option>
                        {issues.map(issue => (
                          <option key={issue.id} value={issue.id}>
                            #{issue.number} - {getMonthName(issue.month)} {issue.year} {issue.status === 'published' ? '(Published)' : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm text-gray-600">
                        {submission.issueId ? 
                          `#${issues.find(i => i.id === submission.issueId)?.number || '?'}` 
                          : 'None'}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    {new Date(submission.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    {viewMode === 'inbox' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedSubmission(submission);
                            setEditorNotes(submission.editorNotes || '');
                            setSelectedStatus(submission.status);
                            setSelectedIssue(submission.issueId || '');
                            setPageNumber(submission.issueMetadata?.pageNumber || '');
                            setShortDescription(submission.issueMetadata?.shortDescription || '');
                          }}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                          title="Review"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {submission.fileUrl && (
                          <button
                            onClick={() => handleDownloadFile(submission.fileUrl, `${submission.title}.pdf`)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Download File"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedSubmission(submission);
                            openEmailComposer('acknowledgement');
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Send Email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveToTrash(submission.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Move to Trash"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedSubmission(submission);
                            setEditorNotes(submission.editorNotes || '');
                            setSelectedStatus(submission.status);
                            setSelectedIssue(submission.issueId || '');
                            setPageNumber(submission.issueMetadata?.pageNumber || '');
                            setShortDescription(submission.issueMetadata?.shortDescription || '');
                          }}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {submission.fileUrl && (
                          <button
                            onClick={() => handleDownloadFile(submission.fileUrl, `${submission.title}.pdf`)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Download File"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleRestoreFromTrash(submission.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Restore to Inbox"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(submission.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Permanently"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSubmissions.length === 0 && (
          <div className="text-center py-12 text-gray-500 font-sans-modern">
            No submissions found
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedSubmission && !showEmailComposer && (
        <div className="fixed inset-0 bg-black/30 z-50 pointer-events-none">
          <div 
            className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl pointer-events-auto"
            style={{
              position: 'fixed',
              left: modalPosition.x === 0 ? '50%' : `${modalPosition.x}px`,
              top: modalPosition.y === 0 ? '50%' : `${modalPosition.y}px`,
              transform: modalPosition.x === 0 && modalPosition.y === 0 ? 'translate(-50%, -50%)' : 'none',
              cursor: isDragging ? 'grabbing' : 'default'
            }}
            onMouseDown={handleMouseDown}
          >
            <div className="modal-header p-6 border-b bg-gradient-to-r from-purple-50 to-amber-50 cursor-grab active:cursor-grabbing flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Move className="w-5 h-5 text-gray-400" />
                <h3 className="text-2xl font-display">Review Submission</h3>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="p-6 space-y-6">
                <EditableSubmissionFields
                  submission={selectedSubmission}
                  authToken={authToken}
                  onUpdate={() => {
                    fetchSubmissions();
                    onUpdate();
                  }}
                  onClose={closeModal}
                  onEditModeChange={setIsSubmissionEditMode}
                  onFileDetach={handleDetachMainFile}
                />

              {selectedSubmission.fileUrl && (
                <div>
                  <p className="text-sm text-gray-600 font-sans-modern mb-2">Attached File</p>
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <div className="flex-1">
                      <p className="text-sm font-sans-modern text-gray-900">Document attached</p>
                      <p className="text-xs text-gray-500">Click to view or download</p>
                    </div>
                    <div className="flex gap-2">
                      <a 
                        href={selectedSubmission.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-sans-modern"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </a>
                      <button
                        onClick={() => handleDownloadFile(selectedSubmission.fileUrl, `${selectedSubmission.title}.pdf`)}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-sans-modern"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      {isSubmissionEditMode && (
                        <button
                          onClick={handleDetachMainFile}
                          className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 border-2 border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors text-sm font-sans-modern"
                          title="Remove attached file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Multi-Document Upload Section */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-700 font-sans-modern font-semibold">Documents & Pages</p>
                    <p className="text-xs text-gray-500">Upload multiple PDFs to add all 40 pages to this submission</p>
                  </div>
                </div>
                <MultiDocumentUpload
                  submissionId={selectedSubmission.id}
                  authToken={authToken}
                  initialDocuments={selectedSubmission.documents || []}
                  onDocumentsChange={(docs) => {
                    // Update the local state immediately for UI responsiveness
                    setSelectedSubmission({
                      ...selectedSubmission,
                      documents: docs
                    });
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700 font-sans-modern font-semibold">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    disabled={viewMode === 'trash'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 disabled:bg-gray-100"
                  >
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="accepted">Accepted</option>
                    <option value="declined">Declined</option>
                    <option value="published">Published</option>
                    <option value="deleted">Deleted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700 font-sans-modern font-semibold">Assign to Issue</label>
                  <select
                    value={selectedIssue}
                    onChange={(e) => setSelectedIssue(e.target.value)}
                    disabled={viewMode === 'trash'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 disabled:bg-gray-100"
                  >
                    <option value="">✓ No Issue</option>
                    {issues.map(issue => (
                      <option key={issue.id} value={issue.id}>
                        Issue #{issue.number} - {issue.title} ({issue.status})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Publication Metadata - Always visible */}
              <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200 space-y-4">
                <h4 className="font-sans-modern font-semibold text-green-900">Publication Metadata</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700 font-sans-modern">Page Number (optional)</label>
                    <input
                      type="number"
                      value={pageNumber}
                      onChange={(e) => setPageNumber(e.target.value)}
                      placeholder="e.g., 3"
                      disabled={viewMode === 'trash'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700 font-sans-modern">Issue Number</label>
                    <select
                      value={selectedIssue}
                      onChange={(e) => setSelectedIssue(e.target.value)}
                      disabled={viewMode === 'trash'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 disabled:bg-gray-100"
                    >
                      <option value="">Select Issue</option>
                      {issues.map(issue => (
                        <option key={issue.id} value={issue.id}>
                          Issue #{issue.number} - {issue.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700 font-sans-modern">Short Description (optional)</label>
                  <textarea
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    rows={3}
                    placeholder="Brief description for the issue..."
                    disabled={viewMode === 'trash'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700 font-sans-modern font-semibold">Editor Notes</label>
                <textarea
                  value={editorNotes}
                  onChange={(e) => setEditorNotes(e.target.value)}
                  rows={4}
                  disabled={viewMode === 'trash'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 disabled:bg-gray-100"
                  placeholder="Add notes for the author..."
                />
              </div>

              {viewMode === 'inbox' && (
                <div className="flex items-center gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      openEmailComposer('acknowledgement');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-sans-modern"
                  >
                    <Mail className="w-4 h-4" />
                    Send Acknowledgement
                  </button>
                  {selectedStatus === 'accepted' && (
                    <button
                      onClick={() => {
                        openEmailComposer('accepted');
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-sans-modern"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Send Acceptance
                    </button>
                  )}
                  {selectedStatus === 'declined' && (
                    <button
                      onClick={() => {
                        openEmailComposer('declined');
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-sans-modern"
                    >
                      <XCircle className="w-4 h-4" />
                      Send Decline Notice
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-between">
              <button
                onClick={closeModal}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-sans-modern"
              >
                Close
              </button>
              {viewMode === 'inbox' ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleMoveToTrash(selectedSubmission.id)}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-sans-modern"
                  >
                    <Trash2 className="w-4 h-4" />
                    Move to Trash
                  </button>
                  <button
                    onClick={handleUpdateSubmission}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-sans-modern"
                  >
                    Update Submission
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => handlePermanentDelete(selectedSubmission.id)}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-sans-modern"
                  >
                    <X className="w-4 h-4" />
                    Delete Permanently
                  </button>
                  <button
                    onClick={() => handleRestoreFromTrash(selectedSubmission.id)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-sans-modern"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restore to Inbox
                  </button>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Composer */}
      {showEmailComposer && selectedSubmission && (
        <EmailComposer
          submission={selectedSubmission}
          emailType={emailType}
          onSend={handleSendEmail}
          onClose={() => setShowEmailComposer(false)}
        />
      )}

      {/* Issue Publisher */}
      {showPublisher && selectedIssueForPublishing && (
        <IssuePublisher
          issue={selectedIssueForPublishing}
          authToken={authToken}
          onClose={() => {
            setShowPublisher(false);
            setSelectedIssueForPublishing(null);
          }}
          onUpdate={() => {
            fetchSubmissions();
            fetchIssues();
            onUpdate();
          }}
        />
      )}
    </div>
  );
}