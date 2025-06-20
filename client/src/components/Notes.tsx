import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
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
import { geminiService } from '@/lib/gemini';
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
      const result = await geminiService.generateNote(generateTopic);
      
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background dark:bg-background"
    >
      {/* Header with Back Button */}
      <div className="px-4 py-6 md:px-8 lg:px-12 xl:px-16">
        <div className="flex items-center justify-between mb-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center"
          >
            <Button variant="outline" size="sm" onClick={onBack} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center">
              <FileText className="w-6 h-6 mr-3 text-primary" />
              <h1 className="text-2xl font-bold text-foreground dark:text-foreground">Notes</h1>
            </div>
          </motion.div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8">
          {/* Left Panel - Note Input and Search */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* AI Note Generation */}
            <Card className="rounded-xl shadow-md bg-card dark:bg-card border-border dark:border-border">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <Sparkles className="w-5 h-5 mr-2 text-primary" />
                  AI Note Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Input
                    placeholder="Enter a topic for AI-generated notes..."
                    value={generateTopic}
                    onChange={(e) => setGenerateTopic(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && generateAINote()}
                    className="rounded-lg bg-background dark:bg-background border-input dark:border-input h-11"
                  />
                  <Button 
                    onClick={generateAINote} 
                    disabled={isGenerating || !generateTopic.trim()}
                    className="w-full h-11 rounded-lg"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Search and New Note */}
            <Card className="rounded-xl shadow-md bg-card dark:bg-card border-border dark:border-border">
              <CardContent className="p-6 space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search your notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 rounded-lg bg-background dark:bg-background border-input dark:border-input h-11"
                  />
                </div>

                {/* Create New Note */}
                <Button onClick={createNewNote} className="w-full h-11 rounded-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Note
                </Button>
              </CardContent>
            </Card>

            {/* Notes List */}
            <Card className="rounded-xl shadow-md bg-card dark:bg-card border-border dark:border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Your Notes ({filteredNotes.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  <AnimatePresence>
                    {filteredNotes.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-6 text-center text-muted-foreground"
                      >
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>{searchTerm ? 'No notes found' : 'No notes yet. Create your first note!'}</p>
                      </motion.div>
                    ) : (
                      <div className="space-y-2 p-4">
                        {filteredNotes.map((note, index) => (
                          <motion.div
                            key={note.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm ${
                              selectedNote?.id === note.id 
                                ? 'bg-primary/10 dark:bg-primary/20 border border-primary/30 shadow-sm' 
                                : 'hover:bg-muted dark:hover:bg-muted/50'
                            }`}
                            onClick={() => {
                              setSelectedNote(note);
                              setIsEditing(false);
                            }}
                          >
                            <h3 className="font-medium truncate text-foreground dark:text-foreground">{note.title}</h3>
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {note.content.substring(0, 80)}...
                            </p>
                            <div className="flex flex-wrap gap-1 mt-3">
                              {note.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs rounded-md">
                                  {tag}
                                </Badge>
                              ))}
                              {note.tags.length > 2 && (
                                <Badge variant="secondary" className="text-xs rounded-md">
                                  +{note.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(note.updatedAt).toLocaleDateString()}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Panel - Note Editor */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <AnimatePresence mode="wait">
              {selectedNote ? (
                <motion.div
                  key={selectedNote.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="rounded-xl shadow-md bg-card dark:bg-card border-border dark:border-border min-h-[70vh]">
                    <CardHeader className="pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <CardTitle className="truncate text-xl text-foreground dark:text-foreground">
                          {isEditing ? 'Edit Note' : selectedNote.title}
                        </CardTitle>
                        <div className="flex gap-2 flex-wrap">
                          {isEditing ? (
                            <>
                              <Button onClick={saveNote} size="sm" className="rounded-lg">
                                <Save className="w-4 h-4 mr-2" />
                                Save
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => setIsEditing(false)} 
                                size="sm"
                                className="rounded-lg"
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
                                className="rounded-lg"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => exportNoteToPDF(selectedNote)} 
                                size="sm"
                                className="rounded-lg"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                onClick={() => deleteNote(selectedNote.id)} 
                                size="sm"
                                className="rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {isEditing ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-4"
                        >
                          <Input
                            placeholder="Note title..."
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="rounded-lg bg-background dark:bg-background border-input dark:border-input h-11"
                          />
                          <Input
                            placeholder="Tags (comma-separated)..."
                            value={editTags}
                            onChange={(e) => setEditTags(e.target.value)}
                            className="rounded-lg bg-background dark:bg-background border-input dark:border-input h-11"
                          />
                          <Textarea
                            placeholder="Write your note..."
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-[400px] resize-none rounded-lg bg-background dark:bg-background border-input dark:border-input"
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-6"
                        >
                          <div className="flex flex-wrap gap-2">
                            {selectedNote.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="rounded-md">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <div className="whitespace-pre-wrap text-foreground dark:text-foreground leading-relaxed">
                              {selectedNote.content}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="rounded-xl shadow-md bg-card dark:bg-card border-border dark:border-border min-h-[70vh]">
                    <CardContent className="flex items-center justify-center h-full">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-center text-muted-foreground"
                      >
                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">Welcome to your Notes</p>
                        <p className="text-sm">Select a note from the sidebar to view or edit, or create a new one to get started.</p>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Notes;
