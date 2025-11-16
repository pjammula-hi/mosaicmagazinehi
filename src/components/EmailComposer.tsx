import { useState } from 'react';
import { X, Send, Mail } from 'lucide-react';

interface EmailComposerProps {
  submission: any;
  emailType: 'acknowledgement' | 'accepted' | 'declined';
  onSend: (emailContent: { subject: string; body: string }) => Promise<void>;
  onClose: () => void;
}

export function EmailComposer({ submission, emailType, onSend, onClose }: EmailComposerProps) {
  const getDefaultTemplate = () => {
    const templates = {
      acknowledgement: {
        subject: `Submission Received: "${submission.title}"`,
        body: `Dear ${submission.authorName},

Thank you for submitting your ${submission.type} titled "${submission.title}" to Mosaic Magazine HI.

We have received your submission and it is currently under review by our editorial team. We appreciate your patience as we carefully consider each submission.

You will receive further communication from us within 2-3 weeks regarding the status of your submission.

If you have any questions, please feel free to reach out.

Best regards,
The Mosaic Magazine Editorial Team
NYC Home Instruction Schools

---
Submission Details:
Title: ${submission.title}
Type: ${submission.type}
Submitted: ${new Date(submission.createdAt).toLocaleDateString()}
Submission ID: ${submission.id}`
      },
      accepted: {
        subject: `Congratulations! Your Submission Has Been Accepted - "${submission.title}"`,
        body: `Dear ${submission.authorName},

We are delighted to inform you that your ${submission.type} titled "${submission.title}" has been accepted for publication in Mosaic Magazine HI!

Your work stood out for its creativity, quality, and contribution to our school community magazine. We are excited to feature your submission in an upcoming issue.

Publication Details:
- Your submission will appear in Issue #[ISSUE NUMBER]
- Scheduled publication: [PUBLICATION DATE]
- You will receive a copy of the published issue

Next Steps:
We may reach out with minor editorial suggestions or questions. Please keep an eye on your email for any follow-up communication.

Thank you for sharing your talent with the Mosaic Magazine community. We look forward to showcasing your work!

Congratulations once again!

Best regards,
The Mosaic Magazine Editorial Team
NYC Home Instruction Schools

---
Submission Details:
Title: ${submission.title}
Type: ${submission.type}
Submission ID: ${submission.id}`
      },
      declined: {
        subject: `Update on Your Submission - "${submission.title}"`,
        body: `Dear ${submission.authorName},

Thank you for submitting your ${submission.type} titled "${submission.title}" to Mosaic Magazine HI.

After careful review by our editorial team, we regret to inform you that we are unable to accept your submission for publication at this time. Please know that this decision does not reflect on your talent or potential as a writer/artist.

Due to space constraints and the high volume of quality submissions we receive, we must make difficult editorial decisions. We encourage you to:
- Continue creating and refining your work
- Submit to future issues of Mosaic Magazine
- Explore other creative outlets in our school community

We appreciate your contribution and hope you will consider submitting to us again in the future.

Best regards,
The Mosaic Magazine Editorial Team
NYC Home Instruction Schools

---
Submission Details:
Title: ${submission.title}
Type: ${submission.type}
Submission ID: ${submission.id}`
      }
    };

    return templates[emailType];
  };

  const defaultTemplate = getDefaultTemplate();
  const [subject, setSubject] = useState(defaultTemplate.subject);
  const [body, setBody] = useState(defaultTemplate.body);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    try {
      await onSend({ subject, body });
      onClose();
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const getEmailTypeColor = () => {
    const colors = {
      acknowledgement: 'bg-blue-50 border-blue-200',
      accepted: 'bg-green-50 border-green-200',
      declined: 'bg-orange-50 border-orange-200'
    };
    return colors[emailType];
  };

  const getEmailTypeLabel = () => {
    const labels = {
      acknowledgement: 'Acknowledgement Email',
      accepted: 'Acceptance Notification',
      declined: 'Decline Notification'
    };
    return labels[emailType];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className={`p-6 border-b-2 ${getEmailTypeColor()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="text-2xl font-serif-warm">{getEmailTypeLabel()}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  To: {submission.authorEmail || `${submission.authorName}@nycstudents.net`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Subject */}
          <div>
            <label className="block text-sm font-sans-modern font-semibold text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent font-sans-modern"
              placeholder="Email subject..."
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-sans-modern font-semibold text-gray-700 mb-2">
              Message Body
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={16}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent font-serif-warm text-sm leading-relaxed"
              placeholder="Email message..."
            />
            <p className="text-xs text-gray-500 mt-2 font-sans-modern">
              You can edit this template before sending. The email will be sent to the contributor's registered email address.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-sans-modern"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending || !subject.trim() || !body.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-sans-modern"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Sending...' : 'Send Email'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
