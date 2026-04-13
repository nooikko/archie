'use client';

import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CATEGORY_GAME_OPTIONAL, CATEGORY_REQUIRES_GAME, FEEDBACK_CATEGORIES, type FeedbackCategory } from '@/lib/feedback/schema';
import type { Game } from '@/lib/search';
import { GameCombobox } from './game-combobox';

interface FeedbackFormProps {
  allGames: readonly Game[];
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const DESCRIPTION_PLACEHOLDER: Record<FeedbackCategory, string> = {
  'data-correction': "Describe what's incorrect and what it should be...",
  'new-game': 'Tell us about this game and why it should be listed...',
  'missing-info': 'Describe what information is missing or incomplete...',
  'community-feedback': 'Share your thoughts, suggestions, or questions...',
  other: 'Describe your feedback...',
};

export function FeedbackForm({ allGames }: FeedbackFormProps) {
  const [category, setCategory] = useState<FeedbackCategory | ''>('');
  const [gameName, setGameName] = useState('');
  const [newGameName, setNewGameName] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [description, setDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [issueUrl, setIssueUrl] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleCategoryChange = (value: string) => {
    setCategory(value as FeedbackCategory);
    setGameName('');
    setNewGameName('');
    setDownloadUrl('');
    setFieldErrors({});
  };

  const resolvedGameName = category === 'new-game' ? newGameName : gameName;

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!category) {
      errors.category = 'Please select a type';
    }
    if (category && CATEGORY_REQUIRES_GAME.has(category as FeedbackCategory)) {
      if (!resolvedGameName.trim()) {
        errors.gameName = 'Game name is required';
      }
    }
    if (category === 'new-game' && downloadUrl && !/^https?:\/\//i.test(downloadUrl)) {
      errors.downloadUrl = 'Must be a valid URL starting with http:// or https://';
    }
    if (!description.trim()) {
      errors.description = 'Description is required';
    } else if (description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('idle');
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setStatus('submitting');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          gameName: resolvedGameName,
          downloadUrl: downloadUrl || undefined,
          description,
          contactInfo: contactInfo || undefined,
          honeypot,
        }),
      });

      if (res.status === 429) {
        setErrorMessage('Please wait a few minutes before submitting again.');
        setStatus('error');
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setFieldErrors(data.errors);
          setStatus('idle');
        } else {
          setErrorMessage(data.error ?? 'Something went wrong. Please try again later.');
          setStatus('error');
        }
        return;
      }

      setIssueUrl(data.issueUrl ?? null);
      setStatus('success');
    } catch {
      setErrorMessage('Something went wrong. Please try again later.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <Alert className='border-foreground/30 bg-background'>
        <AlertDescription className='space-y-2'>
          <p className='font-mono text-sm font-semibold'>Thank you — your feedback has been submitted.</p>
          <p className='font-mono text-xs text-muted-foreground'>
            Your report will be reviewed and any changes applied manually. This is not an automated process.
          </p>
          {issueUrl && (
            <a
              href={issueUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-block font-mono text-xs text-foreground underline decoration-dotted underline-offset-2 hover:no-underline'
            >
              View your submission on GitHub →
            </a>
          )}
          <div className='pt-2'>
            <Button
              variant='outline'
              size='sm'
              className='font-mono text-xs'
              onClick={() => {
                setCategory('');
                setGameName('');
                setNewGameName('');
                setDownloadUrl('');
                setDescription('');
                setContactInfo('');
                setIssueUrl(null);
                setStatus('idle');
              }}
            >
              Submit another
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6' noValidate>
      {status === 'error' && (
        <Alert variant='destructive'>
          <AlertDescription className='font-mono text-sm'>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Type — always first */}
      <div className='space-y-2'>
        <Label htmlFor='category' className='font-mono text-xs uppercase tracking-wider'>
          Type <span className='text-muted-foreground'>(required)</span>
        </Label>
        <Select value={category} onValueChange={handleCategoryChange}>
          <SelectTrigger id='category' className='w-full font-mono text-sm'>
            <SelectValue placeholder='What kind of feedback is this?' />
          </SelectTrigger>
          <SelectContent>
            {FEEDBACK_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value} className='font-mono text-sm'>
                <span className='font-medium'>{c.label}</span>
                <span className='ml-2 text-muted-foreground text-xs'>— {c.description}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors.category && <p className='font-mono text-xs text-destructive'>{fieldErrors.category}</p>}
      </div>

      {/* Contextual fields — only shown once a category is selected */}
      {category && (
        <>
          {/* New game: plain text input */}
          {category === 'new-game' && (
            <div className='space-y-2'>
              <Label htmlFor='newGameName' className='font-mono text-xs uppercase tracking-wider'>
                Game Name <span className='text-muted-foreground'>(required)</span>
              </Label>
              <Input
                id='newGameName'
                value={newGameName}
                onChange={(e) => setNewGameName(e.target.value)}
                placeholder='Name of the game to add'
                className='font-mono text-sm'
                maxLength={200}
              />
              {fieldErrors.gameName && <p className='font-mono text-xs text-destructive'>{fieldErrors.gameName}</p>}
            </div>
          )}

          {/* New game: download URL */}
          {category === 'new-game' && (
            <div className='space-y-2'>
              <Label htmlFor='downloadUrl' className='font-mono text-xs uppercase tracking-wider'>
                APWorld / Download URL <span className='text-muted-foreground'>(optional)</span>
              </Label>
              <Input
                id='downloadUrl'
                type='url'
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                placeholder='https://...'
                className='font-mono text-sm'
                maxLength={500}
              />
              {fieldErrors.downloadUrl && <p className='font-mono text-xs text-destructive'>{fieldErrors.downloadUrl}</p>}
            </div>
          )}

          {/* Data correction / missing info: pick from existing games */}
          {CATEGORY_REQUIRES_GAME.has(category as FeedbackCategory) && category !== 'new-game' && (
            <div className='space-y-2'>
              <Label htmlFor='gameName' className='font-mono text-xs uppercase tracking-wider'>
                Game <span className='text-muted-foreground'>(required)</span>
              </Label>
              <GameCombobox id='gameName' allGames={allGames} value={gameName} onChange={setGameName} />
              {fieldErrors.gameName && <p className='font-mono text-xs text-destructive'>{fieldErrors.gameName}</p>}
            </div>
          )}

          {/* Community feedback / other: game is optional */}
          {CATEGORY_GAME_OPTIONAL.has(category as FeedbackCategory) && (
            <div className='space-y-2'>
              <Label htmlFor='gameName' className='font-mono text-xs uppercase tracking-wider'>
                Game <span className='text-muted-foreground'>(optional)</span>
              </Label>
              <GameCombobox id='gameName' allGames={allGames} value={gameName} onChange={setGameName} />
            </div>
          )}

          {/* Description */}
          <div className='space-y-2'>
            <Label htmlFor='description' className='font-mono text-xs uppercase tracking-wider'>
              Description <span className='text-muted-foreground'>(required)</span>
            </Label>
            <Textarea
              id='description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={DESCRIPTION_PLACEHOLDER[category as FeedbackCategory]}
              className='font-mono text-sm min-h-30 resize-y'
              maxLength={2000}
            />
            <div className='flex justify-between'>
              {fieldErrors.description ? <p className='font-mono text-xs text-destructive'>{fieldErrors.description}</p> : <span />}
              <p className='font-mono text-xs text-muted-foreground'>{description.length}/2000</p>
            </div>
          </div>

          {/* Contact info */}
          <div className='space-y-2'>
            <Label htmlFor='contactInfo' className='font-mono text-xs uppercase tracking-wider'>
              Contact Info <span className='text-muted-foreground'>(optional)</span>
            </Label>
            <Input
              id='contactInfo'
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder='Email or Discord handle so we can follow up'
              className='font-mono text-sm'
              maxLength={200}
            />
            {fieldErrors.contactInfo && <p className='font-mono text-xs text-destructive'>{fieldErrors.contactInfo}</p>}
          </div>

          {/* Honeypot — hidden from real users */}
          <div className='absolute opacity-0 h-0 w-0 overflow-hidden' aria-hidden='true'>
            <input type='text' name='website' value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete='off' />
          </div>

          <Button type='submit' disabled={status === 'submitting'} className='font-mono text-xs uppercase tracking-wider'>
            {status === 'submitting' ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </>
      )}
    </form>
  );
}
