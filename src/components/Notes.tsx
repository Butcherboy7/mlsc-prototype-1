
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { StudyMode, StudyNote } from '@/types';
import { FileText, Upload, Sparkles, Search, Edit, Trash2, Mic, Volume2 } from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { useVoice } from '@/hooks/useVoice';
import StudyModeSelector from './StudyModeSelector';

interface NotesProps {
  selectedMode: StudyMode;
  onModeChange: (mode: StudyMode) => void;
}

const Notes: React.FC<NotesProps> = ({ selectedMode, onModeChange }) => {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<StudyNote | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: '' });
  const [pdfText, setPdfText] = useState('');

  const { isLoading, generateNotes, summarizePDF } = useAI();
  const { transcript, isListening, startListening, stopListening, speak, resetTranscript } = useVoice();

  React.useEffect(() => {
    if (transcript && isCreating) {
      setNewNote(prev => ({ ...prev, content: prev.content + ' ' + transcript }));
      resetTranscript();
    }
  }, [transcript, isCreating, resetTranscript]);

  const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Simple text extraction (in a real app, use a proper PDF library)
    const text = `Extracted text from ${file.name}. This is a mock extraction for demo purposes.`;
    setPdfText(text);

    try {
      const response = await summarizePDF(text, selectedMode);
      setNewNote({
        title: `Summary: ${file.name}`,
        content: response.content,
        tags: selectedMode
      });
      setIsCreating(true);
    } catch (error) {
      console.error('PDF processing error:', error);
    }
  };

  const handleGenerateNotes = async () => {
    if (!newNote.title) return;

    try {
      const response = await generateNotes(newNote.title, selectedMode);
      setNewNote(prev => ({ ...prev, content: response.content }));
    } catch (error) {
      console.error('Note generation error:', error);
    }
  };

  const handleSaveNote = () => {
    if (!newNote.title || !newNote.content) return;

    const note: StudyNote = {
      id: crypto.randomUUID(),
      title: newNote.title,
      content: newNote.content,
      summary: newNote.content.slice(0, 150) + '...',
      mode: selectedMode,
      tags: newNote.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (editingNote) {
      setNotes(prev => prev.map(n => n.id === editingNote.id ? { ...note, id: editingNote.id } : n));
      setEditingNote(null);
    } else {
      setNotes(prev => [...prev, note]);
    }

    setNewNote({ title: '', content: '', tags: '' });
    setIsCreating(false);
  };

  const handleEditNote = (note: StudyNote) => {
    setEditingNote(note);
    setNewNote({
      title: note.title,
      content: note.content,
      tags: note.tags.join(', ')
    });
    setIsCreating(true);
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const filteredNotes = notes.filter(note =>
    note.mode === selectedMode &&
    (note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
     note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const renderMarkdown = (content: string) => {
    // Simple markdown rendering for demo
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="space-y-6">
      <StudyModeSelector selectedMode={selectedMode} onModeChange={onModeChange} />

      {/* Create/Edit Note */}
      {isCreating && (
        <Card className="mentora-card">
          <CardHeader>
            <CardTitle>{editingNote ? 'Edit Note' : 'Create New Note'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Note title"
              value={newNote.title}
              onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
            />
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateNotes}
                disabled={isLoading || !newNote.title}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate with AI
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={isListening ? stopListening : startListening}
              >
                <Mic className="w-4 h-4 mr-2" />
                {isListening ? 'Stop' : 'Voice Input'}
              </Button>
            </div>

            <Textarea
              placeholder="Note content (supports markdown)"
              value={newNote.content}
              onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
              rows={10}
              className="font-mono text-sm"
            />

            <Input
              placeholder="Tags (comma-separated)"
              value={newNote.tags}
              onChange={(e) => setNewNote(prev => ({ ...prev, tags: e.target.value }))}
            />

            <div className="flex gap-2">
              <Button onClick={handleSaveNote} disabled={!newNote.title || !newNote.content}>
                Save Note
              </Button>
              <Button variant="outline" onClick={() => {
                setIsCreating(false);
                setEditingNote(null);
                setNewNote({ title: '', content: '', tags: '' });
              }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {!isCreating && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2">
            <Button onClick={() => setIsCreating(true)}>
              <FileText className="w-4 h-4 mr-2" />
              New Note
            </Button>
            
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".pdf"
                onChange={handlePDFUpload}
                className="hidden"
              />
              <Button variant="outline" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload PDF
                </span>
              </Button>
            </label>
          </div>

          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map(note => (
          <Card key={note.id} className="mentora-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speak(note.content)}
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditNote(note)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className="text-sm text-muted-foreground mb-3 line-clamp-3"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(note.summary) }}
              />
              
              <div className="flex flex-wrap gap-1 mb-3">
                {note.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <p className="text-xs text-muted-foreground">
                {new Date(note.updatedAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotes.length === 0 && !isCreating && (
        <Card className="mentora-card">
          <CardContent className="text-center py-8">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No notes yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first note or upload a PDF to get started
            </p>
            <Button onClick={() => setIsCreating(true)}>
              Create Note
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Notes;
