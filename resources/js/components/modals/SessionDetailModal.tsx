import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Link as LinkIcon, 
  Video, 
  Send, 
  MessageSquare,
  Clock,
  ExternalLink,
  User
} from 'lucide-react';
import { 
  Modal, 
  Button, 
  Card, 
  Badge,
  Input,
  Avatar
} from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface Comment {
  id: number;
  comment: string;
  created_at: string;
  user: {
    name: string;
    avatar: string | null;
  };
  replies?: Comment[];
}

interface SessionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: any;
  onPostComment: (comment: string, parentId?: number) => Promise<void>;
}

export function SessionDetailModal({ isOpen, onClose, session, onPostComment }: SessionDetailModalProps) {
  const { language } = useLanguage();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!session) return null;

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      await onPostComment(newComment);
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOnlineClass = session.type === 'online_class';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Badge variant={isOnlineClass ? 'danger' : 'primary'}>
              {isOnlineClass 
                ? (language === 'id' ? 'Kelas Online' : 'Online Class')
                : (language === 'id' ? 'Materi' : 'Material')
              }
            </Badge>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{session.title}</h2>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {format(new Date(session.sessionDate), 'PPPP p', { locale: language === 'id' ? localeId : undefined })}
            </span>
            {session.duration && (
              <span>• {session.duration}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Online Class / Video Embed */}
            {isOnlineClass ? (
              <div className="aspect-video bg-black rounded-xl overflow-hidden relative group">
                <iframe
                  src={`https://meet.jit.si/${session.meetingUrl || `MolangSession_${session.id}`}`}
                  allow="camera; microphone; fullscreen; display-capture; autoplay"
                  className="w-full h-full border-0"
                />
              </div>
            ) : session.materials?.some((m: any) => m.type === 'youtube') ? (
              <div className="aspect-video bg-black rounded-xl overflow-hidden">
                 {/* Logic to find first youtube and embed */}
                 {(() => {
                   const yt = session.materials.find((m: any) => m.type === 'youtube');
                   return (
                    <iframe
                      src={`https://www.youtube.com/embed/${yt.url}`}
                      className="w-full h-full border-0"
                      allowFullScreen
                    />
                   );
                 })()}
              </div>
            ) : null}

            {/* Description */}
            <div className="prose prose-sm max-w-none">
              <h3 className="text-lg font-semibold mb-2">{language === 'id' ? 'Deskripsi' : 'Description'}</h3>
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {session.description || (language === 'id' ? 'Tidak ada deskripsi.' : 'No description provided.')}
              </div>
            </div>

            {/* Resources / Materials */}
            {session.materials && session.materials.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">{language === 'id' ? 'Sumber Belajar' : 'Learning Resources'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {session.materials.map((item: any, idx: number) => (
                    <Card key={idx} className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                          {item.type === 'file' ? <FileText className="w-4 h-4 text-blue-600" /> : <ExternalLink className="w-4 h-4 text-blue-600" />}
                        </div>
                        <span className="text-sm font-medium truncate max-w-[150px]">{item.title}</span>
                      </div>
                      <a href={item.url} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="ghost">
                          {item.type === 'file' ? <Download className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                        </Button>
                      </a>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comment Section */}
          <div className="lg:col-span-1 flex flex-col h-[500px] bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-sm">{language === 'id' ? 'Komentar Kelas' : 'Class Comments'}</h3>
              <Badge variant="outline" size="sm">{session.comments?.length || 0}</Badge>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {session.comments && session.comments.length > 0 ? (
                session.comments.map((comment: Comment) => (
                  <div key={comment.id} className="space-y-2">
                    <div className="flex gap-3">
                      <Avatar src={comment.user.avatar || undefined} name={comment.user.name} className="w-8 h-8" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{comment.user.name}</span>
                          <span className="text-[10px] text-gray-400">{format(new Date(comment.created_at), 'HH:mm')}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{comment.comment}</p>
                      </div>
                    </div>
                    {/* Replies can be added here */}
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <MessageSquare className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-xs text-gray-400">
                    {language === 'id' ? 'Belum ada komentar. Mulai diskusi!' : 'No comments yet. Start the discussion!'}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="relative">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={language === 'id' ? 'Tambahkan komentar...' : 'Add a comment...'}
                  className="pr-10"
                  onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                />
                <button 
                  onClick={handlePostComment}
                  disabled={isSubmitting || !newComment.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-blue-600 disabled:text-gray-300"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
