import React, { useState } from 'react';

interface Props {
  onSend: (text: string, attachment?: File) => Promise<void>;
}

export const MessageComposer: React.FC<Props> = ({ onSend }) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && !file) || isSending) return;

    setIsSending(true);
    try {
      await onSend(text.trim(), file || undefined);
      setText('');
      setFile(null);
    } catch (err) {
      console.error(err);
      alert('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', padding: '1rem', borderTop: '1px solid #eee', background: 'white' }}>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {file && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: '#e3f2fd', borderRadius: '4px', fontSize: '0.85rem' }}>
            <span>{file.name} ({(file.size/1024/1024).toFixed(2)} MB)</span>
            <button type="button" onClick={() => setFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d32f2f' }}>X</button>
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="file" 
            id="attachment-input" 
            style={{ display: 'none' }} 
            onChange={e => setFile(e.target.files?.[0] || null)}
          />
          <button 
            type="button"
            onClick={() => document.getElementById('attachment-input')?.click()}
            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', background: '#f5f5f5' }}
            disabled={isSending}
            title="Attach file (Max 5MB)"
          >
            📎
          </button>
          <input 
            type="text" 
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type a message..."
            style={{ flex: 1, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            disabled={isSending}
          />
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isSending || (!text.trim() && !file)}
        style={{ padding: '0 1rem', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        Send
      </button>
    </form>
  );
};
