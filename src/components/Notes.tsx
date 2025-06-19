import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  FileText, 
  Edit, 
  Trash2, 
  Download, 
  Save,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { openAIService } from '@/lib/openai';
import { exportToPDF } from '@/lib/pdf';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface NotesProps {
  onBack: () => void;
}

const Notes: React.FC<NotesProps> = ({ onBack }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateTopic, setGenerateTopic] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = () => {
    const savedNotes = localStorage.getItem('mentora_notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  };

  const saveNotes = (updatedNotes: Note[]) => {
    localStorage.setItem('mentora_notes', JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  const createNewNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: 'New Note',
      content: '',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedNotes = [newNote, ...notes];
    saveNotes(updatedNotes);
    setSelectedNote(newNote);
    setIsEditing(true);
    setEditTitle(newNote.title);
    setEditContent(newNote.content);
    setEditTags('');
  };

  const generateAINote = async () => {
    if (!generateTopic.trim()) return;

    setIsGenerating(true);
    try {
      const result = await openAIService.generateNote(generateTopic);
      
      const newNote: Note = {
        id: crypto.randomUUID(),
        title: result.title,
        content: result.content,
        tags: ['AI Generated'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedNotes = [newNote, ...notes];
      saveNotes(updatedNotes);
      setSelectedNote(newNote);
      setGenerateTopic('');
    } catch (error) {
      console.error('Error generating note:', error);
      alert('Failed to generate note. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveNote = () => {
    if (!selectedNote) return;

    const updatedNote: Note = {
      ...selectedNote,
      title: editTitle,
      content: editContent,
      tags: editTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      updatedAt: new Date().toISOString()
    };

    const updatedNotes = notes.map(note => 
      note.id === selectedNote.id ? updatedNote : note
    );

    saveNotes(updatedNotes);
    setSelectedNote(updatedNote);
    setIsEditing(false);
  };

  const deleteNote = (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      const updatedNotes = notes.filter(note => note.id !== noteId);
      saveNotes(updatedNotes);
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
        setIsEditing(false);
      }
    }
  };

  const exportNoteToPDF = (note: Note) => {
    exportToPDF(note.content, `${note.title}.pdf`);
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto flex h-[calc(100vh-100px)] gap-6">
      {/* Notes List */}
      <div className="w-1/3 space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Notes
              </CardTitle>
              <Button variant="outline" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* AI Generate */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Topic for AI-generated notes..."
                  value={generateTopic}
                  onChange={(e) => setGenerateTopic(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && generateAINote()}
                />
                <Button 
                  onClick={generateAINote} 
                  disabled={isGenerating || !generateTopic.trim()}
                  size="sm"
                >
                  {isGenerating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Create New Note */}
            <Button onClick={createNewNote} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
          </CardContent>
        </Card>

        {/* Notes List */}
        <Card className="flex-1 overflow-hidden">
          <CardContent className="p-0 h-full overflow-y-auto">
            {filteredNotes.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                {searchTerm ? 'No notes found' : 'No notes yet. Create your first note!'}
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {filteredNotes.map(note => (
                  <div
                    key={note.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedNote?.id === note.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted'
                    }`}
                    onClick={() => {
                      setSelectedNote(note);
                      setIsEditing(false);
                    }}
                  >
                    <h3 className="font-medium truncate">{note.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {note.content.substring(0, 100)}...
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Note Editor */}
      <div className="flex-1">
        {selectedNote ? (
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="truncate">
                  {isEditing ? 'Edit Note' : selectedNote.title}
                </CardTitle>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button onClick={saveNote} size="sm">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)} 
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsEditing(true);
                          setEditTitle(selectedNote.title);
                          setEditContent(selectedNote.content);
                          setEditTags(selectedNote.tags.join(', '));
                        }} 
                        size="sm"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => exportNoteToPDF(selectedNote)} 
                        size="sm"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={() => deleteNote(selectedNote.id)} 
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-full space-y-4">
              {isEditing ? (
                <>
                  <Input
                    placeholder="Note title..."
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <Input
                    placeholder="Tags (comma-separated)..."
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                  />
                  <Textarea
                    placeholder="Write your note..."
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[400px] resize-none"
                  />
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-sm">
                      {selectedNote.content}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full">
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4" />
                <p>Select a note to view or edit</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Notes;
