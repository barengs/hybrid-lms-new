import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Video, 
  FileText, 
  Lock,
  ArrowRight,
  ChevronRight,
  Clock,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Card, Badge, Button, Progress } from '@/components/ui';
import { formatDate, getTimeAgo } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { useToggleActivityCompleteMutation } from '@/store/features/student/studentApiSlice';
import type { ClassTimelineItem } from '@/store/features/classes/classesApiSlice';
import toast from 'react-hot-toast';

interface LearningTimelineProps {
  activities: ClassTimelineItem[];
  language: string;
  onOpenSession?: (sessionId: number) => void;
  classId?: string | number;
}

export const LearningTimeline: React.FC<LearningTimelineProps> = ({ activities, language, onOpenSession, classId }) => {
  const navigate = useNavigate();
  const [toggleComplete, { isLoading: isToggling }] = useToggleActivityCompleteMutation();

  const handleToggle = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleComplete(id).unwrap();
      toast.success(language === 'id' ? 'Status diperbarui' : 'Status updated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'course': return <BookOpen className="w-5 h-5" />;
      case 'session': return <Video className="w-5 h-5" />;
      case 'assignment': return <FileText className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const getColorClass = (type: string, isCompleted: boolean) => {
    if (isCompleted) return 'bg-green-100 text-green-600 border-green-200';
    switch (type) {
      case 'course': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'session': return 'bg-red-100 text-red-600 border-red-200';
      case 'assignment': return 'bg-purple-100 text-purple-600 border-purple-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getLink = (item: ClassTimelineItem) => {
    switch (item.type) {
      case 'course': return `/learn/${item.slug}${classId ? `?fromClass=${classId}` : ''}`;
      case 'assignment': return `/student/assignments/${item.reference_id}${classId ? `?fromClass=${classId}` : ''}`;
      default: return null;
    }
  };

  const handleOpen = (item: ClassTimelineItem) => {
    if (item.type === 'session' && onOpenSession) {
      onOpenSession(item.reference_id);
    } else {
      const link = getLink(item);
      if (link) navigate(link);
    }
  };


  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:ml-[2.25rem] md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
      {activities.map((item, index) => {
        const itemLink = getLink(item);
        const isActive = index === 0 || activities[index - 1].is_completed;
        
        return (
          <div key={item.id} className={`relative flex items-start gap-4 md:gap-8 transition-all ${!isActive ? 'opacity-60 grayscale' : ''}`}>
            {/* Timeline Connector & Icon */}
            <div className="relative flex flex-col items-center flex-shrink-0">
              <div 
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center z-10 transition-all shadow-sm ${
                  item.is_completed 
                    ? 'bg-green-600 border-green-600 text-white' 
                    : isActive 
                      ? 'bg-white border-blue-600 text-blue-600'
                      : 'bg-white border-gray-200 text-gray-400'
                }`}
              >
                {item.is_completed ? <CheckCircle2 className="w-6 h-6" /> : getIcon(item.type)}
              </div>
            </div>

            {/* Content Card */}
            <Card 
              hover={isActive}
              className={`flex-1 p-4 md:p-6 border-none shadow-sm transition-all duration-300 ${
                isActive ? 'hover:shadow-lg' : 'cursor-not-allowed'
              } ${item.is_completed ? 'bg-green-50/30' : ''}`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" size="sm" className={`capitalize ${getColorClass(item.type, item.is_completed)}`}>
                      {item.type}
                    </Badge>
                    {item.is_required && (
                      <Badge variant="secondary" size="sm" className="bg-red-50 text-red-600 border-none text-[10px]">
                        REQUIRED
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className={`text-lg font-bold transition-colors ${item.is_completed ? 'text-green-800' : 'text-gray-900'}`}>
                    {item.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    {item.meta?.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(item.meta.date)}
                      </span>
                    )}
                    {item.meta?.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {item.meta.duration}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2 md:mt-0">
                  <Button
                    size="sm"
                    variant={item.is_completed ? 'success' : 'outline'}
                    onClick={(e) => handleToggle(e, item.id)}
                    disabled={isToggling || !isActive}
                    className="rounded-full transition-all"
                  >
                    {item.is_completed ? (
                       language === 'id' ? 'Selesai' : 'Completed'
                    ) : (
                       language === 'id' ? 'Tandai Selesai' : 'Mark Done'
                    )}
                  </Button>
                  
                  {(itemLink || item.type === 'session') && (
                    <Button
                      size="sm"
                      onClick={() => handleOpen(item)}
                      disabled={!isActive}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5"
                    >
                      {language === 'id' ? 'Buka' : 'Open'}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
};
