'use client'

import { useState, useRef } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { COLORS } from '@/lib/constants'
import { Upload, Download, CheckCircle, AlertCircle } from 'lucide-react'

interface CsvImportModalProps {
  open: boolean
  onClose: () => void
}

interface ParsedRow {
  firstName: string
  lastName: string
  dateOfBirth: string
  position: string
  jerseyNumber: string
  dominantFoot: string
  errors: string[]
}

type Step = 'upload' | 'preview' | 'success'

const TEMPLATE_HEADERS = 'firstName,lastName,dateOfBirth,position,jerseyNumber,dominantFoot'
const TEMPLATE_SAMPLE = `${TEMPLATE_HEADERS}\nJohn,Smith,2014-03-15,CM,7,right\nSarah,Jones,2014-06-22,ST,9,left`

export default function CsvImportModal({ open, onClose }: CsvImportModalProps) {
  const [step, setStep] = useState<Step>('upload')
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function reset() {
    setStep('upload')
    setRows([])
    setFileName('')
    setDragOver(false)
  }

  function handleClose() {
    reset()
    onClose()
  }

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE_SAMPLE], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'fairplai_player_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function parseCsv(text: string) {
    const lines = text.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0)
    if (lines.length < 2) return

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const firstNameIdx = headers.indexOf('firstname')
    const lastNameIdx = headers.indexOf('lastname')
    const dobIdx = headers.indexOf('dateofbirth')
    const posIdx = headers.indexOf('position')
    const jerseyIdx = headers.indexOf('jerseynumber')
    const footIdx = headers.indexOf('dominantfoot')

    const parsed: ParsedRow[] = []

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim())
      const errors: string[] = []

      const firstName = firstNameIdx >= 0 ? cols[firstNameIdx] || '' : ''
      const lastName = lastNameIdx >= 0 ? cols[lastNameIdx] || '' : ''
      const dateOfBirth = dobIdx >= 0 ? cols[dobIdx] || '' : ''
      const position = posIdx >= 0 ? cols[posIdx] || '' : ''
      const jerseyNumber = jerseyIdx >= 0 ? cols[jerseyIdx] || '' : ''
      const dominantFoot = footIdx >= 0 ? cols[footIdx] || '' : ''

      if (!firstName) errors.push('Missing first name')
      if (!lastName) errors.push('Missing last name')

      parsed.push({ firstName, lastName, dateOfBirth, position, jerseyNumber, dominantFoot, errors })
    }

    setRows(parsed)
    setStep('preview')
  }

  function handleFileSelect(file: File) {
    if (!file.name.endsWith('.csv')) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      if (text) parseCsv(text)
    }
    reader.readAsText(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  function handleImport() {
    const validRows = rows.filter(r => r.errors.length === 0)
    const importedPlayers = validRows.map((r, i) => ({
      id: `imported_${Date.now()}_${i}`,
      academyId: 'academy_001',
      firstName: r.firstName,
      lastName: r.lastName,
      dateOfBirth: r.dateOfBirth,
      position: r.position ? [r.position] : ['TBD'],
      jerseyNumber: parseInt(r.jerseyNumber) || 0,
      dominantFoot: r.dominantFoot || 'right',
      status: 'active',
      parentIds: [],
    }))

    const existing = localStorage.getItem('fairplai_imported_players')
    const list = existing ? JSON.parse(existing) : []
    list.push(...importedPlayers)
    localStorage.setItem('fairplai_imported_players', JSON.stringify(list))

    setStep('success')
    setTimeout(() => {
      handleClose()
    }, 2000)
  }

  const errorCount = rows.filter(r => r.errors.length > 0).length
  const validCount = rows.filter(r => r.errors.length === 0).length

  return (
    <Modal open={open} onClose={handleClose} title={step === 'success' ? undefined : 'Import Players from CSV'} maxWidth={560}>
      {/* ─── UPLOAD STEP ─── */}
      {step === 'upload' && (
        <div>
          {/* Template download */}
          <button
            onClick={downloadTemplate}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', color: COLORS.primary,
              fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0,
              marginBottom: 16,
            }}
          >
            <Download size={14} /> Download CSV Template
          </button>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? COLORS.primary : COLORS.border}`,
              borderRadius: 12,
              padding: '40px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragOver ? `${COLORS.primary}08` : '#F9FAFB',
              transition: 'all 0.15s ease',
            }}
          >
            <Upload size={32} color={COLORS.muted} style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy, margin: '0 0 4px' }}>
              Drop your CSV file here or click to browse
            </p>
            <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>
              Accepts .csv files only
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileSelect(file)
            }}
            style={{ display: 'none' }}
          />

          {/* Instructions */}
          <p style={{ fontSize: 12, color: COLORS.muted, marginTop: 16, lineHeight: 1.6 }}>
            Upload a CSV file with player data. Download the template above for the correct format. Required columns: firstName, lastName.
          </p>
        </div>
      )}

      {/* ─── PREVIEW STEP ─── */}
      {step === 'preview' && (
        <div>
          {/* Summary */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <span style={{
              fontSize: 13, fontWeight: 600, color: COLORS.success,
              background: `${COLORS.success}1A`, padding: '4px 10px', borderRadius: 8,
            }}>
              {validCount} valid
            </span>
            {errorCount > 0 && (
              <span style={{
                fontSize: 13, fontWeight: 600, color: COLORS.error,
                background: `${COLORS.error}1A`, padding: '4px 10px', borderRadius: 8,
              }}>
                {errorCount} with errors
              </span>
            )}
            <span style={{ fontSize: 12, color: COLORS.muted, alignSelf: 'center' }}>
              from {fileName}
            </span>
          </div>

          {/* Preview table */}
          <div style={{ overflowX: 'auto', marginBottom: 20 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${COLORS.border}` }}>
                  {['', 'First Name', 'Last Name', 'DOB', 'Position', 'Jersey', 'Foot'].map(h => (
                    <th key={h} style={{ padding: '8px 8px', textAlign: 'left', fontWeight: 700, color: COLORS.muted, fontSize: 11, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const hasError = r.errors.length > 0
                  return (
                    <tr key={i} style={{
                      borderBottom: `1px solid ${COLORS.border}`,
                      background: hasError ? `${COLORS.error}08` : 'transparent',
                    }}>
                      <td style={{ padding: '8px 8px', width: 24 }}>
                        {hasError ? (
                          <AlertCircle size={14} color={COLORS.error} />
                        ) : (
                          <CheckCircle size={14} color={COLORS.success} />
                        )}
                      </td>
                      <td style={{ padding: '8px 8px', fontWeight: 600, color: hasError && !r.firstName ? COLORS.error : COLORS.navy }}>
                        {r.firstName || '—'}
                      </td>
                      <td style={{ padding: '8px 8px', fontWeight: 600, color: hasError && !r.lastName ? COLORS.error : COLORS.navy }}>
                        {r.lastName || '—'}
                      </td>
                      <td style={{ padding: '8px 8px', color: COLORS.muted }}>{r.dateOfBirth || '—'}</td>
                      <td style={{ padding: '8px 8px', color: COLORS.muted }}>{r.position || '—'}</td>
                      <td style={{ padding: '8px 8px', color: COLORS.muted }}>{r.jerseyNumber || '—'}</td>
                      <td style={{ padding: '8px 8px', color: COLORS.muted }}>{r.dominantFoot || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => { setStep('upload'); setRows([]) }}>Back</Button>
            <Button onClick={handleImport} disabled={validCount === 0}>
              Import {validCount} Player{validCount !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      )}

      {/* ─── SUCCESS STEP ─── */}
      {step === 'success' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: `${COLORS.success}1A`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <CheckCircle size={28} color={COLORS.success} />
          </div>
          <p style={{ fontSize: 18, fontWeight: 800, color: COLORS.navy, margin: '0 0 6px' }}>
            {validCount} player{validCount !== 1 ? 's' : ''} imported
          </p>
          <p style={{ fontSize: 13, color: COLORS.muted, margin: 0 }}>
            Successfully added to your academy
          </p>
          <div style={{ marginTop: 20 }}>
            <Button onClick={handleClose}>Done</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
