import { supabase } from '../../supabaseClient';
import { User, BugReport, Suggestion } from '../../types';

interface MissionsHookProps {
    user: User | null;
    uploadFile: (file: File, folder: string) => Promise<string | null>;
    setBugReports: React.Dispatch<React.SetStateAction<BugReport[]>>;
    setSuggestions: React.Dispatch<React.SetStateAction<Suggestion[]>>;
    playSound?: (type: any) => void;
}

export const useMissions = ({ user, uploadFile, setBugReports, setSuggestions, playSound }: MissionsHookProps) => {
  const reportBug = async (description: string, screenshot?: File) => {
      if (!user) return false;
      try {
          let screenshotUrl = '';
          if (screenshot) {
              const resUrl = await uploadFile(screenshot, 'bugs');
              if (resUrl) screenshotUrl = resUrl;
          }
          const newReport = { 
              id: crypto.randomUUID(),
              user_id: user.id, 
              user_name: user.name, 
              description, 
              screenshot: screenshotUrl, 
              timestamp: Date.now(), 
              status: 'OPEN' 
          };
          const { data, error } = await supabase.from('bug_reports').insert(newReport).select().single();
          if (error) throw error;
          
          if (playSound) playSound('SUCCESS');

          setBugReports(prev => [{ id: data.id, userId: data.user_id, userName: data.user_name, description: data.description, screenshot: data.screenshot, timestamp: data.timestamp, status: data.status }, ...prev]);
          
          return true;
      } catch (err) {
          if (playSound) playSound('ERROR');
          return false;
      }
  };

  const submitSuggestion = async (title: string, description: string) => {
      if (!user) return false;
      try {
          const newSuggestion = { 
              id: crypto.randomUUID(),
              user_id: user.id, 
              user_name: user.name, 
              title, 
              description, 
              timestamp: Date.now() 
          };
          const { data, error } = await supabase.from('suggestions').insert(newSuggestion).select().single();
          if (error) throw error;

          if (playSound) playSound('SUCCESS');

          setSuggestions(prev => [{ id: data.id, userId: data.user_id, userName: data.user_name, title: data.title, description: data.description, timestamp: data.timestamp }, ...prev]);
          
          return true;
      } catch (err) {
          if (playSound) playSound('ERROR');
          return false;
      }
  };

  return { reportBug, submitSuggestion };
};