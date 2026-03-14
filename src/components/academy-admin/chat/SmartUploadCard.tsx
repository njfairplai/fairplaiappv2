'use client'

import React, { useState, useRef, useCallback } from 'react'
import { COLORS, RADIUS, SHADOWS } from '@/lib/constants'
import { useCommandCentre } from '@/contexts/CommandCentreContext'
import { Upload, FileText, Image, CheckCircle, AlertCircle, Loader, X, Edit3 } from 'lucide-react'

interface ParsedPlayer {
  firstName: string
  lastName: string
  guardianEmail: string
  position?: string
  jerseyNumber?: string
  error?: string
}

interface SmartUploadCardProps {
  context: 'add_player' | 'add_program'
  messageId: string
}

/* ── CSV Parser (reused from CsvBulkImportCard pattern) ─── */
function parseCSV(text: string): ParsedPlayer[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  const firstNameIdx = headers.findIndex(h => ['firstname', 'first_name', 'first name', 'first'].includes(h))
  const lastNameIdx = headers.findIndex(h => ['lastname', 'last_name', 'last name', 'last', 'surname'].includes(h))
  const emailIdx = headers.findIndex(h => ['guardianemail', 'guardian_email', 'guardian email', 'email', 'parent email'].includes(h))
  const posIdx = headers.findIndex(h => h === 'position')
  const jerseyIdx = headers.findIndex(h => ['jerseynumber', 'jersey_number', 'jersey number', 'jersey', 'number'].includes(h))

  return lines.slice(1).filter(l => l.trim()).map(line => {
    const cols = line.split(',').map(c => c.trim())
    const firstName = firstNameIdx >= 0 ? cols[firstNameIdx] || '' : ''
    const lastName = lastNameIdx >= 0 ? cols[lastNameIdx] || '' : ''
    const guardianEmail = emailIdx >= 0 ? cols[emailIdx] || '' : ''
    const position = posIdx >= 0 ? cols[posIdx] || '' : ''
    const jerseyNumber = jerseyIdx >= 0 ? cols[jerseyIdx] || '' : ''

    let error: string | undefined
    if (!firstName || !lastName) error = 'Missing name'
    else if (!guardianEmail) error = 'Missing email'
    else if (guardianEmail && !guardianEmail.includes('@')) error = 'Invalid email'

    return { firstName, lastName, guardianEmail, position, jerseyNumber, error }
  })
}

export default function SmartUploadCard({ context, messageId }: SmartUploadCardProps) {
  const { executeAction } = useCommandCentre()
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [status, setStatus] = useState<'idle' | 'processing' | 'preview' | 'done' | 'error'>('idle')
  const [parsedRows, setParsedRows] = useState<ParsedPlayer[]>([])
  const [programData, setProgramData] = useState<Record<string, unknown> | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [fileName, setFileName] = useState('')
  const [editIdx, setEditIdx] = useState<number | null>(null)

  const isSubmitted = typeof window !== 'undefined' && localStorage.getItem(`fairplai_upload_done_${messageId}`)

  const processFile = useCallback(async (file: File) => {
    setFileName(file.name)
    setStatus('processing')
    setErrorMsg('')

    const ext = file.name.toLowerCase().split('.').pop() || ''

    try {
      // CSV files — parse client-side
      if (ext === 'csv') {
        const text = await file.text()
        const rows = parseCSV(text)
        if (rows.length === 0) {
          setErrorMsg('No valid rows found. Make sure the CSV has headers (firstName, lastName, guardianEmail).')
          setStatus('error')
          return
        }
        setParsedRows(rows)
        setStatus('preview')
        return
      }

      // Images / PDFs — send to AI extraction endpoint
      if (['jpg', 'jpeg', 'png', 'pdf', 'webp'].includes(ext)) {
        const base64 = await fileToBase64(file)
        const mediaType = ext === 'pdf' ? 'application/pdf'
          : ext === 'webp' ? 'image/webp'
          : `image/${ext === 'jpg' ? 'jpeg' : ext}`

        const resp = await fetch('/api/extract-from-image', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ image: base64, mediaType, type: context === 'add_player' ? 'players' : 'program' }),
        })

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({ error: 'Failed to process image' }))
          setErrorMsg(err.error || 'Failed to process image')
          setStatus('error')
          return
        }

        const data = await resp.json()

        if (context === 'add_player' && Array.isArray(data.players)) {
          const rows: ParsedPlayer[] = data.players.map((p: Record<string, string>) => ({
            firstName: p.firstName || '',
            lastName: p.lastName || '',
            guardianEmail: p.guardianEmail || p.email || '',
            position: p.position || '',
            jerseyNumber: p.jerseyNumber || '',
            error: (!p.firstName || !p.lastName) ? 'Missing name' : undefined,
          }))
          setParsedRows(rows)
          setStatus('preview')
        } else if (context === 'add_program' && data.program) {
          setProgramData(data.program)
          setStatus('preview')
        } else {
          setErrorMsg('Could not extract data from this image. Try a clearer photo or use CSV.')
          setStatus('error')
        }
        return
      }

      setErrorMsg(`Unsupported file type: .${ext}. Use CSV, JPG, PNG, or PDF.`)
      setStatus('error')
    } catch {
      setErrorMsg('Failed to process file. Please try again.')
      setStatus('error')
    }
  }, [context])

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Strip the data:... prefix to get raw base64
        const base64 = result.includes(',') ? result.split(',')[1] : result
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  function confirmPlayers() {
    const valid = parsedRows.filter(r => !r.error)
    if (valid.length === 0) return

    // Store all valid players
    try {
      const existing = JSON.parse(localStorage.getItem('fairplai_imported_players') || '[]')
      for (const p of valid) {
        existing.push({
          id: `player_custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          academyId: 'academy_001',
          firstName: p.firstName,
          lastName: p.lastName,
          guardianEmail: p.guardianEmail,
          position: p.position ? [p.position] : [],
          jerseyNumber: parseInt(p.jerseyNumber || '0') || 0,
          dateOfBirth: '',
          dominantFoot: 'right',
          status: 'active',
          parentIds: [],
          inviteStatus: 'pending',
          inviteToken: `onboard_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        })
      }
      localStorage.setItem('fairplai_imported_players', JSON.stringify(existing))
    } catch { /* ignore */ }

    executeAction('bulk_import', { count: valid.length })
    localStorage.setItem(`fairplai_upload_done_${messageId}`, 'true')
    setStatus('done')
  }

  function confirmProgram() {
    if (!programData) return
    executeAction('add_program', programData)
    localStorage.setItem(`fairplai_upload_done_${messageId}`, 'true')
    setStatus('done')
  }

  function updateRow(idx: number, field: keyof ParsedPlayer, value: string) {
    setParsedRows(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      // Re-validate
      const r = next[idx]
      r.error = (!r.firstName || !r.lastName) ? 'Missing name' : (!r.guardianEmail ? 'Missing email' : (r.guardianEmail && !r.guardianEmail.includes('@') ? 'Invalid email' : undefined))
      return next
    })
  }

  if (isSubmitted || status === 'done') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px',
        borderRadius: RADIUS.card, background: 'rgba(16,185,129,0.06)',
        border: '1px solid rgba(16,185,129,0.2)',
      }}>
        <CheckCircle size={16} color="#10B981" />
        <span style={{ fontSize: 13, color: COLORS.navy, fontWeight: 600 }}>Upload processed successfully</span>
      </div>
    )
  }

  /* ── Processing state ─── */
  if (status === 'processing') {
    return (
      <div style={{
        padding: 24, borderRadius: RADIUS.card, background: '#fff',
        border: `1px solid ${COLORS.border}`, textAlign: 'center',
      }}>
        <Loader size={28} color={COLORS.primary} style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: 13, color: COLORS.navy, fontWeight: 600, margin: '12px 0 4px' }}>Processing {fileName}...</p>
        <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>Extracting data with AI</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  /* ── Error state ─── */
  if (status === 'error') {
    return (
      <div style={{
        padding: 20, borderRadius: RADIUS.card, background: '#fff',
        border: '1px solid rgba(239,68,68,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <AlertCircle size={16} color="#EF4444" />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#EF4444' }}>Upload failed</span>
        </div>
        <p style={{ fontSize: 12, color: COLORS.muted, margin: '0 0 12px' }}>{errorMsg}</p>
        <button
          onClick={() => { setStatus('idle'); setErrorMsg('') }}
          style={{
            padding: '8px 16px', borderRadius: 8, border: `1px solid ${COLORS.border}`,
            background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: COLORS.navy,
          }}
        >
          Try again
        </button>
      </div>
    )
  }

  /* ── Preview state (players) ─── */
  if (status === 'preview' && context === 'add_player') {
    const valid = parsedRows.filter(r => !r.error)
    const invalid = parsedRows.filter(r => r.error)

    return (
      <div style={{
        borderRadius: RADIUS.card, background: '#fff', overflow: 'hidden',
        border: `1px solid ${COLORS.border}`, boxShadow: SHADOWS.card,
      }}>
        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.navy }}>Preview — {parsedRows.length} players found</span>
            <span style={{ fontSize: 11, color: COLORS.muted, marginLeft: 8 }}>
              {valid.length} valid{invalid.length > 0 ? `, ${invalid.length} with issues` : ''}
            </span>
          </div>
          <span style={{ fontSize: 11, color: COLORS.muted }}>{fileName}</span>
        </div>

        <div style={{ maxHeight: 280, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                {['', 'First', 'Last', 'Email', 'Pos', '#'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: COLORS.muted, fontSize: 10, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parsedRows.map((row, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}`, background: row.error ? 'rgba(239,68,68,0.04)' : undefined }}>
                  <td style={{ padding: '6px 10px', width: 28 }}>
                    {row.error
                      ? <AlertCircle size={14} color="#EF4444" />
                      : <CheckCircle size={14} color="#10B981" />
                    }
                  </td>
                  {editIdx === i ? (
                    <>
                      <td style={{ padding: '4px 4px' }}><input value={row.firstName} onChange={e => updateRow(i, 'firstName', e.target.value)} style={editInput} /></td>
                      <td style={{ padding: '4px 4px' }}><input value={row.lastName} onChange={e => updateRow(i, 'lastName', e.target.value)} style={editInput} /></td>
                      <td style={{ padding: '4px 4px' }}><input value={row.guardianEmail} onChange={e => updateRow(i, 'guardianEmail', e.target.value)} style={editInput} /></td>
                      <td style={{ padding: '4px 4px' }}><input value={row.position || ''} onChange={e => updateRow(i, 'position', e.target.value)} style={{ ...editInput, width: 40 }} /></td>
                      <td style={{ padding: '4px 4px', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <input value={row.jerseyNumber || ''} onChange={e => updateRow(i, 'jerseyNumber', e.target.value)} style={{ ...editInput, width: 30 }} />
                        <button onClick={() => setEditIdx(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                          <CheckCircle size={14} color={COLORS.primary} />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={cellStyle}>{row.firstName}</td>
                      <td style={cellStyle}>{row.lastName}</td>
                      <td style={{ ...cellStyle, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.guardianEmail}</td>
                      <td style={cellStyle}>{row.position || '—'}</td>
                      <td style={{ ...cellStyle, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {row.jerseyNumber || '—'}
                        <button onClick={() => setEditIdx(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, opacity: 0.4 }}>
                          <Edit3 size={12} color={COLORS.navy} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '12px 16px', borderTop: `1px solid ${COLORS.border}`, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={() => { setStatus('idle'); setParsedRows([]) }}
            style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${COLORS.border}`, background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: COLORS.muted }}
          >
            Cancel
          </button>
          <button
            onClick={confirmPlayers}
            disabled={valid.length === 0}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none', cursor: valid.length > 0 ? 'pointer' : 'default',
              background: valid.length > 0 ? COLORS.primary : COLORS.border,
              color: '#fff', fontSize: 12, fontWeight: 700,
            }}
          >
            Import {valid.length} player{valid.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    )
  }

  /* ── Preview state (program) ─── */
  if (status === 'preview' && context === 'add_program' && programData) {
    return (
      <div style={{
        borderRadius: RADIUS.card, background: '#fff', overflow: 'hidden',
        border: `1px solid ${COLORS.border}`, boxShadow: SHADOWS.card,
      }}>
        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${COLORS.border}` }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.navy }}>Program extracted from {fileName}</span>
        </div>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Object.entries(programData).map(([key, val]) => (
            <div key={key} style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, minWidth: 100, textTransform: 'capitalize' }}>
                {key.replace(/([A-Z])/g, ' $1').trim()}:
              </span>
              <span style={{ fontSize: 12, color: COLORS.navy }}>
                {Array.isArray(val) ? val.join(', ') : String(val)}
              </span>
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${COLORS.border}`, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={() => { setStatus('idle'); setProgramData(null) }}
            style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${COLORS.border}`, background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: COLORS.muted }}
          >
            Cancel
          </button>
          <button
            onClick={confirmProgram}
            style={{ padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', background: COLORS.primary, color: '#fff', fontSize: 12, fontWeight: 700 }}
          >
            Create program
          </button>
        </div>
      </div>
    )
  }

  /* ── Idle / drop zone ─── */
  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => fileRef.current?.click()}
      style={{
        padding: 32, borderRadius: RADIUS.card,
        background: dragOver ? `${COLORS.primary}08` : '#fff',
        border: `2px dashed ${dragOver ? COLORS.primary : COLORS.border}`,
        textAlign: 'center', cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      <input
        ref={fileRef}
        type="file"
        accept=".csv,.xlsx,.xls,.jpg,.jpeg,.png,.pdf,.webp"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <div style={{
        width: 52, height: 52, borderRadius: 14, margin: '0 auto 14px',
        background: `${COLORS.primary}10`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Upload size={24} color={COLORS.primary} />
      </div>

      <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, margin: '0 0 6px' }}>
        Drop a file here or click to browse
      </p>
      <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>
        Supports CSV, JPG, PNG, PDF
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FileText size={14} color={COLORS.muted} />
          <span style={{ fontSize: 11, color: COLORS.muted }}>CSV / Excel</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Image size={14} color={COLORS.muted} />
          <span style={{ fontSize: 11, color: COLORS.muted }}>Photo / PDF</span>
        </div>
      </div>
    </div>
  )
}

const cellStyle: React.CSSProperties = { padding: '6px 10px', color: COLORS.navy, whiteSpace: 'nowrap' }
const editInput: React.CSSProperties = {
  width: '100%', padding: '4px 6px', borderRadius: 4,
  border: `1px solid ${COLORS.primary}40`, fontSize: 12, outline: 'none',
  boxSizing: 'border-box',
}
