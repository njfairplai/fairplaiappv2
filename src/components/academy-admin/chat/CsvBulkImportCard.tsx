'use client'

import React, { useState, useRef } from 'react'
import { COLORS, RADIUS, SHADOWS } from '@/lib/constants'
import { useCommandCentre } from '@/contexts/CommandCentreContext'
import { Upload, Download, AlertCircle, CheckCircle, X } from 'lucide-react'

interface ParsedRow {
  firstName: string
  lastName: string
  guardianEmail: string
  position?: string
  jerseyNumber?: string
  error?: string
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  const firstNameIdx = headers.findIndex(h => h === 'firstname' || h === 'first_name' || h === 'first name')
  const lastNameIdx = headers.findIndex(h => h === 'lastname' || h === 'last_name' || h === 'last name')
  const emailIdx = headers.findIndex(h => h === 'guardianemail' || h === 'guardian_email' || h === 'guardian email' || h === 'email')
  const posIdx = headers.findIndex(h => h === 'position')
  const jerseyIdx = headers.findIndex(h => h === 'jerseynumber' || h === 'jersey_number' || h === 'jersey number' || h === 'jersey')

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
    else if (!guardianEmail.includes('@')) error = 'Invalid email'

    return { firstName, lastName, guardianEmail, position, jerseyNumber, error }
  })
}

function downloadTemplate() {
  const csv = 'firstName,lastName,guardianEmail,position,jerseyNumber\nAhmed,Hassan,parent@email.com,CM,7\n'
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'fairplai_player_template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

type Step = 'upload' | 'preview' | 'done'

export default function CsvBulkImportCard({ messageId }: { messageId?: string }) {
  const { executeAction } = useCommandCentre()
  const [step, setStep] = useState<Step>('upload')
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const storageKey = messageId ? `fairplai_form_submitted_${messageId}_csv` : null
  const [submitted, setSubmitted] = useState(() => {
    if (!storageKey) return false
    try { return localStorage.getItem(storageKey) === '1' } catch { return false }
  })

  if (submitted) return null

  const validRows = rows.filter(r => !r.error)
  const errorRows = rows.filter(r => r.error)

  function handleFile(file: File) {
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const parsed = parseCSV(text)
      setRows(parsed)
      setStep('preview')
    }
    reader.readAsText(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.csv') || file.type === 'text/csv')) handleFile(file)
  }

  function handleSubmit() {
    // Save all valid players to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('fairplai_imported_players') || '[]')
      for (const row of validRows) {
        existing.push({
          id: `player_csv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          academyId: 'academy_001',
          firstName: row.firstName,
          lastName: row.lastName,
          guardianEmail: row.guardianEmail,
          position: row.position ? [row.position] : [],
          jerseyNumber: parseInt(row.jerseyNumber || '0') || 0,
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

    executeAction('bulk_import', { count: validRows.length })
    setStep('done')
    setSubmitted(true)
    if (storageKey) try { localStorage.setItem(storageKey, '1') } catch { /* ignore */ }
  }

  return (
    <div style={{
      background: '#fff', borderRadius: RADIUS.card, padding: 16,
      boxShadow: SHADOWS.card, border: `1px solid ${COLORS.border}`,
      borderLeft: `3px solid ${COLORS.periwinkle}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.navy }}>Import Players via CSV</span>
        {step === 'preview' && (
          <button onClick={() => { setStep('upload'); setRows([]); setFileName('') }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.muted, fontSize: 12 }}>
            <X size={14} /> Change file
          </button>
        )}
      </div>

      {step === 'upload' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={downloadTemplate} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: `1px dashed ${COLORS.primary}`, borderRadius: RADIUS.input,
            padding: '8px 12px', color: COLORS.primary, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>
            <Download size={14} /> Download CSV Template
          </button>

          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${COLORS.border}`, borderRadius: RADIUS.input,
              padding: '24px 16px', textAlign: 'center', cursor: 'pointer',
              background: COLORS.lightBg, transition: 'border-color 0.15s',
            }}
            onDragEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = COLORS.primary }}
            onDragLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = COLORS.border }}
          >
            <Upload size={20} color={COLORS.muted} style={{ marginBottom: 6 }} />
            <p style={{ fontSize: 13, color: COLORS.muted, margin: 0 }}>
              Drop your CSV here or <span style={{ color: COLORS.primary, fontWeight: 600 }}>browse</span>
            </p>
            <p style={{ fontSize: 11, color: '#9DA2B3', margin: '4px 0 0' }}>
              Required: firstName, lastName, guardianEmail
            </p>
          </div>
          <input ref={fileRef} type="file" accept=".csv" hidden onChange={e => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }} />
        </div>
      )}

      {step === 'preview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12 }}>
            <span style={{ color: COLORS.navy, fontWeight: 600 }}>{fileName}</span>
            <span style={{ color: COLORS.success, fontWeight: 600 }}>
              <CheckCircle size={12} style={{ verticalAlign: 'middle', marginRight: 2 }} />
              {validRows.length} valid
            </span>
            {errorRows.length > 0 && (
              <span style={{ color: COLORS.error, fontWeight: 600 }}>
                <AlertCircle size={12} style={{ verticalAlign: 'middle', marginRight: 2 }} />
                {errorRows.length} errors
              </span>
            )}
          </div>

          {/* Preview table */}
          <div style={{ maxHeight: 200, overflowY: 'auto', borderRadius: RADIUS.input, border: `1px solid ${COLORS.border}` }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: COLORS.lightBg }}>
                  <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, color: COLORS.muted }}>Name</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, color: COLORS.muted }}>Guardian Email</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, color: COLORS.muted }}>Pos</th>
                  <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 600, color: COLORS.muted, width: 30 }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 20).map((row, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${COLORS.border}`, background: row.error ? `${COLORS.error}08` : undefined }}>
                    <td style={{ padding: '6px 8px', color: COLORS.navy }}>{row.firstName} {row.lastName}</td>
                    <td style={{ padding: '6px 8px', color: COLORS.muted }}>{row.guardianEmail}</td>
                    <td style={{ padding: '6px 8px', color: COLORS.muted }}>{row.position || '—'}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                      {row.error ? (
                        <span title={row.error}><AlertCircle size={13} color={COLORS.error} /></span>
                      ) : (
                        <CheckCircle size={13} color={COLORS.success} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 20 && (
              <div style={{ padding: 8, textAlign: 'center', fontSize: 11, color: COLORS.muted }}>
                ...and {rows.length - 20} more rows
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={validRows.length === 0}
            style={{
              width: '100%', padding: '10px', borderRadius: RADIUS.input,
              background: validRows.length > 0 ? COLORS.primary : COLORS.cloud,
              color: validRows.length > 0 ? '#fff' : COLORS.muted,
              border: 'none', fontSize: 13, fontWeight: 600,
              cursor: validRows.length > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            Import {validRows.length} Players & Send Invites
          </button>
        </div>
      )}
    </div>
  )
}
