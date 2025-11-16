import { ArrowLeft, User, Calendar, Clock, BookOpen, MessageSquare, Heart, FileText } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { PDFViewer } from './PDFViewer';
import { useState } from 'react';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  category: string;
  readTime: string;
  imageUrl?: string;
  page: number;
  fileUrl?: string;
  documents?: Array<{
    id: string;
    url: string;
    fileName: string;
    type: string;
    metadata?: any;
  }>;
}

interface ArticleViewerProps {
  article: Article;
  onBack: () => void;
  user: any;
  authToken: string;
}

export function ArticleViewer({ article, onBack, user, authToken }: ArticleViewerProps) {
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // Generate dummy full content based on category
  const getFullContent = () => {
    const paragraphs: string[] = [];
    
    if (article.category === 'Poetry') {
      paragraphs.push(
        'Spring arrives on whispered winds,\nBringing hope that never ends,\nPetals dance in morning light,\nChasing shadows of the night.',
        '\n',
        'In the garden, colors bloom,\nDispelling winter\'s lingering gloom,\nBirds sing songs of sweet rebirth,\nCelebrating life on Earth.',
        '\n',
        'Dreams take flight on gentle breeze,\nRustling through awakened trees,\nEvery moment, fresh and new,\nSpring\'s eternal promise true.'
      );
    } else if (article.category === 'Fiction') {
      paragraphs.push(
        'The train car rattled through the tunnel, its fluorescent lights flickering with each bump in the tracks. Maya checked her phone for the hundredth time—11:47 PM. She should have been home hours ago.',
        'Across from her sat an elderly woman with kind eyes and a worn leather satchel. The woman smiled, and Maya found herself smiling back despite her exhaustion.',
        '"Late night?" the woman asked, her voice carrying the warmth of someone who genuinely cared about the answer.',
        '"You could say that," Maya replied, surprised by her own willingness to engage. "Missed my usual train. Now I\'m on the last one heading home."',
        'The woman nodded knowingly. "Sometimes the wrong train takes us exactly where we need to be."',
        'Maya pondered this as the train emerged from the tunnel. Through the window, the city lights sparkled like stars reflected in water. Perhaps tonight\'s delay wasn\'t a mistake after all.',
        'They talked for the next twenty minutes—about dreams, about courage, about the beautiful unpredictability of life. When the woman stood to leave at her stop, she pressed something into Maya\'s hand.',
        'It was a business card for an art studio. "I saw your sketchbook," the woman said. "We\'re always looking for talent. Come visit us." She winked and stepped off the train.',
        'Maya looked at the card, then at her sketchbook. Maybe missing that train was the best thing that could have happened.'
      );
    } else {
      paragraphs.push(
        article.excerpt,
        '\n',
        'This story begins with a simple observation: students today are more creative, more engaged, and more capable than ever before. What they need is a platform to showcase their talents and a community that believes in their potential.',
        'Throughout my research and conversations with dozens of students across different grade levels, a common theme emerged. Young people today are hungry for authentic connection and meaningful ways to express themselves.',
        '"We want our voices to be heard," one sophomore told me. "Not just in assignments, but in ways that matter to our community." This sentiment was echoed by nearly every student I interviewed.',
        'The data supports these qualitative observations. Student engagement in extracurricular activities focused on creative expression has increased by 45% over the past three years. School clubs dedicated to writing, art, photography, and digital media have seen record membership numbers.',
        'But engagement is only one part of the equation. The quality of work being produced is truly remarkable. From sophisticated photo essays exploring social justice themes to original musical compositions that rival professional work, students are creating at unprecedented levels.',
        'What makes this possible? A combination of access to technology, supportive mentorship from dedicated teachers, and perhaps most importantly, a peer community that celebrates creativity rather than diminishing it.',
        'Looking forward, the question isn\'t whether students have important things to say—they clearly do. The question is how we can better amplify their voices and provide more opportunities for them to share their work with wider audiences.',
        'As we continue this conversation, I\'m reminded of what one senior told me: "Our stories matter. Our perspectives are valid. And when you give us the chance to share them, amazing things happen."',
        'She\'s absolutely right. The future is being written by these young voices, and it\'s our privilege to read, listen, and learn from them.'
      );
    }
    
    return paragraphs;
  };

  const content = getFullContent();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Issue</span>
          </button>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* Meta Info */}
        <div className="mb-8">
          <div className="flex items-center gap-4 text-xs uppercase tracking-wider text-gray-500 mb-6">
            <span>{article.category}</span>
            <span className="text-gray-300">•</span>
            <span>Page {article.page}</span>
            <span className="text-gray-300">•</span>
            <span>{article.readTime} read</span>
          </div>

          <h1 className="text-5xl mb-6 leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center gap-6 text-sm text-gray-600 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>April 2024</span>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {article.imageUrl && (
          <div className="aspect-[16/9] overflow-hidden rounded-sm mb-12">
            <ImageWithFallback
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Body */}
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-700 leading-relaxed mb-8">
            {article.excerpt}
          </p>

          {content.map((paragraph, index) => {
            if (paragraph === '\n') {
              return <div key={index} className="h-6" />;
            }
            
            // Check if poetry (has line breaks)
            if (paragraph.includes('\n')) {
              return (
                <div key={index} className="my-8 pl-8 border-l-2 border-gray-200">
                  {paragraph.split('\n').map((line, i) => (
                    <p key={i} className="text-gray-700 leading-relaxed italic">
                      {line}
                    </p>
                  ))}
                </div>
              );
            }
            
            return (
              <p key={index} className="text-gray-700 leading-relaxed mb-6">
                {paragraph}
              </p>
            );
          })}
        </div>

        {/* Article Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLiked(!liked)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
                  liked
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                <span className="text-sm">{liked ? 'Liked' : 'Like'}</span>
              </button>

              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-gray-600 hover:border-gray-300 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">Comment</span>
              </button>
            </div>

            <div className="text-sm text-gray-500">
              Page {article.page} of 27
            </div>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-8 p-6 bg-gray-50 rounded-sm">
            <h3 className="text-sm mb-4">Comments</h3>
            <textarea
              placeholder="Share your thoughts on this article..."
              className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
              rows={4}
            />
            <div className="flex justify-end mt-3">
              <button className="px-6 py-2 bg-purple-600 text-white rounded-sm hover:bg-purple-700 transition-colors text-sm">
                Post Comment
              </button>
            </div>

            {/* Sample Comments */}
            <div className="mt-6 space-y-4">
              <div className="bg-white p-4 rounded-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm">Emily Johnson</p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700">
                  This is such an inspiring piece! Really makes me think about my own creative journey.
                </p>
              </div>

              <div className="bg-white p-4 rounded-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm">Mr. Thompson</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700">
                  Excellent work, {article.author}! Your perspective adds so much value to our school community.
                </p>
              </div>
            </div>
          </div>
        )}
      </article>

      {/* Related Articles Footer */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-6">
            More from this issue
          </h3>
          <div className="text-sm text-gray-600">
            <button 
              onClick={onBack}
              className="text-purple-600 hover:text-purple-700 transition-colors"
            >
              Return to full issue overview →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
