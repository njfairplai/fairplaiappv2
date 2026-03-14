'use client'

import { useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { COLORS } from '@/lib/constants'
import { Check, ArrowLeft, ArrowRight, Eye, EyeOff, Camera } from 'lucide-react'

type Step = 'guardian' | 'player' | 'additional' | 'consent' | 'account' | 'success'
const STEPS: Step[] = ['guardian', 'player', 'additional', 'consent', 'account']
const STEP_LABELS: Record<Step, string> = {
  guardian: 'Your Details',
  player: 'Player Details',
  additional: 'Additional Info',
  consent: 'Consent',
  account: 'Account Setup',
  success: 'Complete',
}

export default function OnboardPage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  const [step, setStep] = useState<Step>('guardian')
  const [showPassword, setShowPassword] = useState(false)

  // Guardian fields
  const [guardian, setGuardian] = useState({ fullName: '', phone: '', relationship: 'parent' })
  // Player fields
  const [player, setPlayer] = useState({ dateOfBirth: '', dominantFoot: 'right', nationality: '', passportId: '' })
  const [playerPhoto, setPlayerPhoto] = useState<string | null>(null)
  const photoRef = useRef<HTMLInputElement>(null)
  // Additional fields
  const [additional, setAdditional] = useState({ schoolName: '', previousClub: '', kitSize: '', medicalNotes: '', emergencyName: '', emergencyPhone: '' })
  // Consent
  const [consent, setConsent] = useState({ dataProcessing: false, mediaRelease: false, medicalConsent: false })
  // Account
  const [account, setAccount] = useState({ password: '', confirmPassword: '' })

  const hasMinLength = account.password.length >= 8
  const hasNumber = /\d/.test(account.password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(account.password)
  const passwordValid = hasMinLength && hasNumber && hasSpecial
  const passwordsMatch = account.password === account.confirmPassword

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 15,
    outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 600, color: '#9DA2B3', display: 'block', marginBottom: 6,
  }
  const selectStyle: React.CSSProperties = {
    ...inputStyle, cursor: 'pointer', appearance: 'none' as const,
  }

  const stepIndex = STEPS.indexOf(step)

  function canProceed(): boolean {
    switch (step) {
      case 'guardian': return !!guardian.fullName && !!guardian.phone
      case 'player': return !!player.dateOfBirth && !!playerPhoto
      case 'additional': return true // all optional
      case 'consent': return consent.dataProcessing && consent.medicalConsent
      case 'account': return passwordValid && passwordsMatch
      default: return false
    }
  }

  function handleNext() {
    if (step === 'account') {
      // Save all data to localStorage
      try {
        const onboardData = {
          token,
          guardian,
          player: { ...player, photo: playerPhoto },
          additional,
          consent,
          completedAt: new Date().toISOString(),
        }
        const existing = JSON.parse(localStorage.getItem('fairplai_onboard_data') || '[]')
        existing.push(onboardData)
        localStorage.setItem('fairplai_onboard_data', JSON.stringify(existing))
      } catch { /* ignore */ }
      setStep('success')
      setTimeout(() => router.push('/login'), 3000)
      return
    }
    const nextIdx = stepIndex + 1
    if (nextIdx < STEPS.length) setStep(STEPS[nextIdx])
  }

  function handleBack() {
    const prevIdx = stepIndex - 1
    if (prevIdx >= 0) setStep(STEPS[prevIdx])
  }

  if (step === 'success') {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.darkBg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${COLORS.success}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Check size={24} color={COLORS.success} strokeWidth={2.5} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>You&apos;re All Set!</h2>
        <p style={{ fontSize: 14, color: '#9DA2B3', textAlign: 'center', maxWidth: 320 }}>
          Your account has been created and your child&apos;s profile is complete. Redirecting to login...
        </p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.darkBg, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo + Academy info */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Image src="/logo-white.png" alt="FairplAI" width={120} height={36} style={{ height: 36, width: 'auto', objectFit: 'contain', marginBottom: 16 }} />
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 20px', border: '1px solid rgba(255,255,255,0.1)', display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <Image src="/logos/mak-academy.jpeg" alt="MAK Academy" width={36} height={36} style={{ borderRadius: 8, height: 36, width: 36, objectFit: 'contain' }} />
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>MAK Academy</p>
              <p style={{ fontSize: 12, color: '#9DA2B3', margin: 0 }}>Player onboarding</p>
            </div>
          </div>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: i < stepIndex ? COLORS.success : i === stepIndex ? COLORS.primary : 'rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#fff',
                transition: 'background 0.3s ease',
              }}>
                {i < stepIndex ? <Check size={14} strokeWidth={3} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: 24, height: 2, background: i < stepIndex ? COLORS.success : 'rgba(255,255,255,0.1)', borderRadius: 1 }} />
              )}
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#9DA2B3', margin: '0 0 20px' }}>
          Step {stepIndex + 1} of {STEPS.length}: {STEP_LABELS[step]}
        </p>

        {/* Form card */}
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.08)' }}>

          {/* Step 1: Guardian Details */}
          {step === 'guardian' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>Your Details</h3>
              <p style={{ fontSize: 13, color: '#9DA2B3', margin: 0 }}>Tell us about yourself as the player&apos;s guardian.</p>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input style={inputStyle} placeholder="e.g. Tariq Makkawi" value={guardian.fullName} onChange={e => setGuardian(p => ({ ...p, fullName: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Phone Number *</label>
                <input style={inputStyle} type="tel" placeholder="e.g. +971 50 123 4567" value={guardian.phone} onChange={e => setGuardian(p => ({ ...p, phone: e.target.value }))} />
                <span style={{ fontSize: 11, color: '#6E7180', marginTop: 4, display: 'block' }}>Used for WhatsApp match notifications</span>
              </div>
              <div>
                <label style={labelStyle}>Relationship to Player</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['parent', 'legal_guardian'] as const).map(r => (
                    <button key={r} onClick={() => setGuardian(p => ({ ...p, relationship: r }))}
                      style={{
                        flex: 1, padding: '10px', borderRadius: 8,
                        border: `1.5px solid ${guardian.relationship === r ? COLORS.primary : 'rgba(255,255,255,0.15)'}`,
                        background: guardian.relationship === r ? `${COLORS.primary}20` : 'transparent',
                        color: guardian.relationship === r ? COLORS.primary : '#9DA2B3',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                      }}
                    >
                      {r.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Player Details */}
          {step === 'player' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>Player Details</h3>
              <p style={{ fontSize: 13, color: '#9DA2B3', margin: 0 }}>Essential information about the player.</p>

              {/* Photo upload */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div
                  onClick={() => photoRef.current?.click()}
                  style={{
                    width: 88, height: 88, borderRadius: '50%',
                    border: `2px dashed ${playerPhoto ? COLORS.primary : 'rgba(255,255,255,0.2)'}`,
                    background: playerPhoto ? 'transparent' : 'rgba(255,255,255,0.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', overflow: 'hidden', position: 'relative',
                    transition: 'border-color 0.2s',
                  }}
                >
                  {playerPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={playerPhoto} alt="Player" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Camera size={28} color="rgba(255,255,255,0.3)" />
                  )}
                </div>
                <span style={{ fontSize: 12, color: '#6E7180' }}>
                  {playerPhoto ? 'Tap to change photo' : 'Upload player photo *'}
                </span>
                <input
                  ref={photoRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = ev => setPlayerPhoto(ev.target?.result as string)
                      reader.readAsDataURL(file)
                    }
                  }}
                />
              </div>

              <div>
                <label style={labelStyle}>Date of Birth *</label>
                <input style={inputStyle} type="date" value={player.dateOfBirth} onChange={e => setPlayer(p => ({ ...p, dateOfBirth: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Dominant Foot</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['left', 'right', 'both'] as const).map(f => (
                    <button key={f} onClick={() => setPlayer(p => ({ ...p, dominantFoot: f }))}
                      style={{
                        flex: 1, padding: '10px', borderRadius: 8,
                        border: `1.5px solid ${player.dominantFoot === f ? COLORS.primary : 'rgba(255,255,255,0.15)'}`,
                        background: player.dominantFoot === f ? `${COLORS.primary}20` : 'transparent',
                        color: player.dominantFoot === f ? COLORS.primary : '#9DA2B3',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Nationality</label>
                <input style={inputStyle} placeholder="e.g. Saudi Arabian" value={player.nationality} onChange={e => setPlayer(p => ({ ...p, nationality: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Passport / ID Number</label>
                <input style={inputStyle} placeholder="For tournament registration" value={player.passportId} onChange={e => setPlayer(p => ({ ...p, passportId: e.target.value }))} />
              </div>
            </div>
          )}

          {/* Step 3: Additional Info */}
          {step === 'additional' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>Additional Information</h3>
              <p style={{ fontSize: 13, color: '#9DA2B3', margin: 0 }}>All fields are optional but help the academy provide the best experience.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>School Name</label>
                  <input style={inputStyle} placeholder="e.g. Al Noor Academy" value={additional.schoolName} onChange={e => setAdditional(p => ({ ...p, schoolName: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Previous Club/Academy</label>
                  <input style={inputStyle} placeholder="e.g. Aspire FC" value={additional.previousClub} onChange={e => setAdditional(p => ({ ...p, previousClub: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Kit / T-shirt Size</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['XS', 'S', 'M', 'L', 'XL'].map(s => (
                    <button key={s} onClick={() => setAdditional(p => ({ ...p, kitSize: s }))}
                      style={{
                        flex: 1, padding: '10px', borderRadius: 8,
                        border: `1.5px solid ${additional.kitSize === s ? COLORS.primary : 'rgba(255,255,255,0.15)'}`,
                        background: additional.kitSize === s ? `${COLORS.primary}20` : 'transparent',
                        color: additional.kitSize === s ? COLORS.primary : '#9DA2B3',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Medical / Health Notes</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
                  placeholder="Allergies, conditions, medications..."
                  value={additional.medicalNotes}
                  onChange={e => setAdditional(p => ({ ...p, medicalNotes: e.target.value }))}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Emergency Contact Name</label>
                  <input style={inputStyle} placeholder="If different from you" value={additional.emergencyName} onChange={e => setAdditional(p => ({ ...p, emergencyName: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Emergency Contact Phone</label>
                  <input style={inputStyle} type="tel" placeholder="+971..." value={additional.emergencyPhone} onChange={e => setAdditional(p => ({ ...p, emergencyPhone: e.target.value }))} />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Consent */}
          {step === 'consent' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>Consent</h3>
              <p style={{ fontSize: 13, color: '#9DA2B3', margin: 0 }}>As the player is under 18, we need your consent for the following.</p>
              {[
                { key: 'dataProcessing' as const, label: 'Data Processing Consent', desc: 'I consent to the collection and processing of my child\'s personal data and performance metrics for the purposes of player development and academy operations.', required: true },
                { key: 'mediaRelease' as const, label: 'Media & Photo Release', desc: 'I consent to photos and video footage of my child being used for training analysis, highlight reels, and academy communications.', required: false },
                { key: 'medicalConsent' as const, label: 'Medical Consent', desc: 'I consent to the academy providing first aid and seeking emergency medical treatment if necessary during training and matches.', required: true },
              ].map(item => (
                <label key={item.key} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer',
                  padding: 14, borderRadius: 10,
                  border: `1px solid ${consent[item.key] ? COLORS.primary : 'rgba(255,255,255,0.1)'}`,
                  background: consent[item.key] ? `${COLORS.primary}10` : 'transparent',
                }}>
                  <input type="checkbox" checked={consent[item.key]} onChange={e => setConsent(p => ({ ...p, [item.key]: e.target.checked }))}
                    style={{ marginTop: 3, accentColor: COLORS.primary }} />
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                      {item.label} {item.required && <span style={{ color: COLORS.error }}>*</span>}
                    </span>
                    <p style={{ fontSize: 12, color: '#9DA2B3', margin: '4px 0 0', lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Step 5: Account Setup */}
          {step === 'account' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>Create Your Account</h3>
              <p style={{ fontSize: 13, color: '#9DA2B3', margin: 0 }}>Set a password to access the parent portal and view your child&apos;s performance.</p>
              <div style={{ position: 'relative' }}>
                <label style={labelStyle}>Password *</label>
                <input
                  style={inputStyle}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={account.password}
                  onChange={e => setAccount(p => ({ ...p, password: e.target.value }))}
                />
                <button onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: 36, background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPassword ? <EyeOff size={18} color="#9DA2B3" /> : <Eye size={18} color="#9DA2B3" />}
                </button>
              </div>

              {account.password && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[
                    { ok: hasMinLength, label: 'At least 8 characters' },
                    { ok: hasNumber, label: 'Contains a number' },
                    { ok: hasSpecial, label: 'Contains a special character' },
                  ].map(rule => (
                    <div key={rule.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 16, height: 16, borderRadius: '50%',
                        background: rule.ok ? `${COLORS.success}20` : 'rgba(255,255,255,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {rule.ok && <Check size={10} color={COLORS.success} strokeWidth={3} />}
                      </div>
                      <span style={{ fontSize: 12, color: rule.ok ? COLORS.success : '#6E7180' }}>{rule.label}</span>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label style={labelStyle}>Confirm Password *</label>
                <input
                  style={inputStyle}
                  type="password"
                  placeholder="Confirm your password"
                  value={account.confirmPassword}
                  onChange={e => setAccount(p => ({ ...p, confirmPassword: e.target.value }))}
                />
                {account.confirmPassword && !passwordsMatch && (
                  <span style={{ fontSize: 12, color: COLORS.error, marginTop: 4, display: 'block' }}>Passwords do not match</span>
                )}
              </div>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ marginTop: 3, accentColor: COLORS.primary }} />
                <span style={{ fontSize: 13, color: '#9DA2B3' }}>
                  I agree to the <span style={{ color: COLORS.primary }}>Terms of Service</span> and <span style={{ color: COLORS.primary }}>Privacy Policy</span>
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          {stepIndex > 0 && (
            <button onClick={handleBack} style={{
              flex: 1, padding: '14px', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.15)', background: 'transparent',
              color: '#9DA2B3', fontSize: 15, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <button onClick={handleNext} disabled={!canProceed()} style={{
            flex: 2, padding: '14px', borderRadius: 10,
            border: 'none',
            background: canProceed() ? COLORS.primary : 'rgba(255,255,255,0.06)',
            color: canProceed() ? '#fff' : '#6E7180',
            fontSize: 15, fontWeight: 700, cursor: canProceed() ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            {step === 'account' ? 'Create Account' : 'Continue'} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
