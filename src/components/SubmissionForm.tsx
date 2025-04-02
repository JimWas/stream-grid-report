
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isValidUrl } from '@/utils/validation';
import { toast } from '@/components/ui/use-toast';
import { Livestream } from '@/types/livestream';

interface SubmissionFormProps {
  onSubmit: (livestream: Omit<Livestream, 'id' | 'timestamp'>) => void;
}

const SubmissionForm: React.FC<SubmissionFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        description: "Please enter a title for the livestream.",
        variant: "destructive"
      });
      return;
    }

    if (!isValidUrl(url)) {
      toast({
        description: "Please enter a valid URL starting with http:// or https://",
        variant: "destructive"
      });
      return;
    }

    onSubmit({ title, url });
    setTitle('');
    setUrl('');
    
    toast({
      description: "Livestream added successfully!",
    });
  };

  return (
    <div className="max-w-md mx-auto my-6 p-4 border border-black">
      <h2 className="text-xl font-bold font-mono uppercase mb-4 text-center">SUBMIT A LIVESTREAM</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block mb-1 font-mono">TITLE:</label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-black font-mono"
            placeholder="Enter livestream title"
          />
        </div>
        <div>
          <label htmlFor="url" className="block mb-1 font-mono">URL:</label>
          <Input
            id="url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full border-black font-mono"
            placeholder="https://example.com/stream"
          />
        </div>
        <Button 
          type="submit" 
          className="w-full bg-black text-white hover:bg-gray-800 font-mono uppercase"
        >
          SUBMIT
        </Button>
      </form>
    </div>
  );
};

export default SubmissionForm;
