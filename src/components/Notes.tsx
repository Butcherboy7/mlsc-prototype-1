
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { StudyNote } from '@/types';
import { FileText, Plus, Search, Tag, Sparkles, Download } from 'lucide-react';
import { storageUtils } from '@/utils/storage';
import { openAIService } from '@/lib/openai';
import { exportToPDF } from '@/lib/pdf';

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [generateTopic, setGenerateTopic] = useState('');
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    tagInput: ''
  });

  useEffect(() => {
    const loadedNotes = storageUtils.loadNotes();
    setNotes(loadedNotes);
  }, []);

  useEffect(() => {
    storageUtils.saveNotes(notes);
  }, [notes]);

  const handleCreateNote = () => {
    if (!newNote.title || !newNote.content) return;

    const note: StudyNote = {
      id: crypto.randomUUID(),
      title: newNote.title,
      content: newNote.content,
      summary: newNote.content.slice(0, 100) + (newNote.content.length > 100 ? '...' : ''),
      mode: 'maths',
      tags: newNote.tags,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setNotes(prev => [...prev, note]);
    setNewNote({ title: '', content: '', tags: [], tagInput: '' });
    setIsCreating(false);
  };

  const handleGenerateNote = async () => {
    if (!generateTopic.trim() || !openAIService.getApiKey()) return;

    setIsGenerating(true);
    try {
      const { title, content } = await openAIService.generateNote(generateTopic);
      setNewNote({ title, content, tags: ['AI Generated'], tagInput: '' });
      setGenerateTopic('');
      setIsCreating(true);
    } catch (error) {
      console.error('Error generating note:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddTag = () => {
    if (newNote.tagInput.trim() && !newNote.tags.includes(newNote.tagInput.trim())) {
      setNewNote(prev => ({
        ...prev,
        tags: [...prev.tags, prev.tagInput.trim()],
        tagInput: ''
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewNote(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
  };

  const exportNote = (note: StudyNote) => {
    exportToPDF(note.content, `${note.title}.pdf`);
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addNoteFromExternal = (title: string, content: string, tags: string[] = []) => {
    const note: StudyNote = {
      id: crypto.randomUUID(),
      title,
      content,
      summary: content.slice(0, 100) + (content.length > 100 ? '...' : ''),
      mode: 'maths',
      tags,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setNotes(prev => [...prev, note]);
  };

  React.useEffect(() => {
    (window as any).addNoteFromAIChat = addNoteFromExternal;
  }, []);

  return (
    <div className="space-y-6">
      {/* AI Generate Section */}
      {!isCreating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Note with AI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter a topic (e.g., 'Photosynthesis', 'React Hooks', 'Marketing Strategy')"
                value={generateTopic}
                onChange={(e) => setGenerateTopic(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGenerateNote()}
                disabled={isGenerating}
              />
              <Button 
                onClick={handleGenerateNote} 
                disabled={!generateTopic.trim() || isGenerating || !openAIService.getApiKey()}
              >
                {isGenerating ? 'Generating...' : 'Generate'}
              </Button>
            </div>
            {!openAIService.getApiKey() && (
              <p className="text-sm text-muted-foreground">
                Configure your OpenAI API key in the AI Chat section to use this feature.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Note */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="Enter note title"
                value={newNote.title}
                onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea
                placeholder="Write your notes here..."
                value={newNote.content}
                onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag"
                  value={newNote.tagInput}
                  onChange={(e) => setNewNote(prev => ({ ...prev, tagInput: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button variant="outline" onClick={handleAddTag}>
                  <Tag className="w-4 h-4" />
                </Button>
              </div>
              
              {newNote.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newNote.tags.map(tag => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateNote} disabled={!newNote.title || !newNote.content}>
                Create Note
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreating(false);
                  setNewNote({ title: '', content: '', tags: [], tagInput: '' });
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Actions */}
      {!isCreating && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Note
          </Button>
        </div>
      )}

      {/* Notes Grid */}
      {!isCreating && (
        <>
          {filteredNotes.length === 0 && notes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No notes yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first note, generate one with AI, or save one from AI Chat
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setIsCreating(true)}>
                    Create Note
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : filteredNotes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No matching notes</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map(note => (
                <Card key={note.id} className="h-fit">
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
                    <div className="text-xs text-muted-foreground">
                      {note.createdAt.toLocaleDateString()}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                      {note.content}
                    </p>
                    
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {note.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportNote(note)}
                        className="flex-1"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Export PDF
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNote(note.id)}
                        className="flex-1 text-destructive hover:text-destructive"
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Notes;
