import { useState, useRef } from 'react'
import axios from 'axios'

const DEFAULT_SUBJECT = 'MERN Full Stack Developer 3+ Years Experience (React.js, Node.js and React Native)'

const DEFAULT_BODY = `Dear Hiring Team,

Please find my details below:
✓ 𝐅𝐢𝐫𝐬𝐭 𝐍𝐚𝐦𝐞 : Shubham
✓ 𝐋𝐚𝐬𝐭 𝐍𝐚𝐦𝐞 : Jadhav
✓ 𝐒𝐤𝐢𝐥𝐥𝐬 : MERN Stack (MongoDB, Express.js, React.js, Node.js), Next.js, Firebase, React Native, JavaScript, TypeScript
✓ 𝐄𝐱𝐩 : 3+ Years
✓ 𝐄𝐦𝐚𝐢𝐥 : shubhamjadhav5842@gmail.com
✓ 𝐏𝐡𝐨𝐧𝐞 𝐍𝐨. : +919552885037
✓ 𝐋𝐨𝐜𝐚𝐭𝐢𝐨𝐧 : Pune, Maharashtra, India
✓ 𝐏𝐫𝐞𝐯. 𝐎𝐫𝐠 : NDSoftTech Solutions (Software Development Engineer – Team Lead)
✓ 𝐍𝐏 : Immediate Joiner
✓ 𝐏𝐨𝐫𝐭𝐟𝐨𝐥𝐢𝐨 : jadhavshubham.in
✓ 𝐑𝐞𝐬𝐮𝐦𝐞 : Attached

I recently worked as a Team Lead at NDSoftTech Solutions, where I led the development of scalable web and mobile applications using MERN stack technologies.

Kindly review my profile and let me know if there are any suitable opportunities.

Thanks & Regards,
Shubham Jadhav
+919552885037
shubhamjadhav5842@gmail.com
jadhavshubham.in`

// Parse comma-separated or single email string into valid addresses
function parseEmailString(raw) {
    return raw
        .split(/[,\n]+/)
        .map(e => e.trim().toLowerCase())
        .filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
}

export default function Dashboard() {
    const [emails, setEmails] = useState([])
    const [emailInput, setEmailInput] = useState('')
    const [subject, setSubject] = useState(DEFAULT_SUBJECT)
    const [body, setBody] = useState(DEFAULT_BODY)
    const [resume, setResume] = useState(null)
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const fileRef = useRef()

    const addEmails = () => {
        const trimmed = emailInput.trim()
        if (!trimmed) return

        const parsed = parseEmailString(trimmed)
        if (parsed.length === 0) { setError('No valid email addresses found.'); return }

        // Deduplicate against already-added list
        const newOnes = parsed.filter(e => !emails.includes(e))
        const skipped = parsed.length - newOnes.length

        if (newOnes.length === 0) { setError('All emails are already added.'); return }

        setEmails(prev => [...prev, ...newOnes])
        setEmailInput('')
        setError(skipped > 0 ? `Added ${newOnes.length}. Skipped ${skipped} duplicate(s).` : '')
    }

    const removeEmail = (email) => setEmails(prev => prev.filter(e => e !== email))

    const clearAll = () => { setEmails([]); setResults([]) }

    const handleKeyDown = (e) => { if (e.key === 'Enter') { e.preventDefault(); addEmails() } }

    // Also support pasting directly into the field — parse on paste event
    const handlePaste = (e) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text')
        setEmailInput(prev => prev + pasted)
        // Let the user review then click Add, or auto-add if it looks like a bulk paste
        const parsed = parseEmailString(pasted)
        if (parsed.length > 1) {
            // Bulk paste — add immediately
            const newOnes = parsed.filter(em => !emails.includes(em))
            if (newOnes.length > 0) {
                setEmails(prev => [...prev, ...newOnes])
                setEmailInput('')
                const skipped = parsed.length - newOnes.length
                setError(skipped > 0 ? `Added ${newOnes.length}. Skipped ${skipped} duplicate(s).` : '')
            }
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file && file.type === 'application/pdf') { setResume(file); setError('') }
        else setError('Please upload a PDF file.')
    }

    const handleSend = async () => {
        setError('')
        if (emails.length === 0) { setError('Add at least one email.'); return }
        if (!subject.trim()) { setError('Subject is required.'); return }
        if (!body.trim()) { setError('Body is required.'); return }

        setLoading(true)
        setResults([])

        const formData = new FormData()
        // Send as raw comma-joined string — backend handles both formats
        formData.append('emails', emails.join(','))
        formData.append('subject', subject)
        formData.append('body', body)
        if (resume) formData.append('resume', resume)

        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/send-emails`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )
            setResults(data.results)
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong.')
        } finally {
            setLoading(false)
        }
    }

    const sentCount = results.filter(r => r.status === 'sent').length
    const failedCount = results.filter(r => r.status === 'failed').length

    const s = { // shared inline styles
        card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' },
        label: { fontWeight: 600, marginBottom: 10, fontSize: 14 },
        input: { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit' },
        pill: { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 20, padding: '4px 10px 4px 12px', fontSize: 12 },
        removeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 15, lineHeight: 1, padding: 0 },
        badge: (color, bg) => ({ background: bg, color, borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 500 }),
    }

    return (
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'sans-serif', color: '#111' }}>

            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>HR Mailer Dashboard</h1>
                <p style={{ color: '#64748b', fontSize: 14 }}>Each recipient gets a completely separate email — no shared addresses</p>
            </div>

            {/* Recipients */}
            <section style={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <p style={s.label}>Recipients</p>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {emails.length > 0 && (
                            <span style={s.badge('#1e40af', '#dbeafe')}>{emails.length} added</span>
                        )}
                        {emails.length > 0 && (
                            <button onClick={clearAll}
                                style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 10px', fontSize: 12, cursor: 'pointer', color: '#64748b' }}>
                                Clear all
                            </button>
                        )}
                    </div>
                </div>

                {/* Pill tags */}
                {emails.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10, maxHeight: 160, overflowY: 'auto', padding: '4px 0' }}>
                        {emails.map(email => (
                            <span key={email} style={s.pill}>
                                {email}
                                <button onClick={() => removeEmail(email)} style={s.removeBtn} title="Remove">×</button>
                            </span>
                        ))}
                    </div>
                )}

                {/* Input row */}
                <div style={{ display: 'flex', gap: 8 }}>
                    <input
                        type="text"
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        placeholder="Paste comma-separated emails or type one and press Enter…"
                        style={{ ...s.input, flex: 1 }}
                    />
                    <button onClick={addEmails}
                        style={{ background: '#1e40af', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        + Add
                    </button>
                </div>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
                    Tip: Paste a whole comma-separated list — they are added all at once automatically.
                </p>
            </section>

            {/* Subject */}
            <section style={s.card}>
                <p style={s.label}>Subject</p>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} style={s.input} />
            </section>

            {/* Body */}
            <section style={s.card}>
                <p style={s.label}>Email Body</p>
                <textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    rows={18}
                    style={{ ...s.input, lineHeight: 1.7, resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }}
                />
            </section>

            {/* Resume */}
            <section style={s.card}>
                <p style={s.label}>Resume (PDF)</p>

                {/* Server-side asset notice */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', marginBottom: 10 }}>
                    <span style={{ fontSize: 18 }}>📄</span>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#15803d', margin: 0 }}>Shubham_Jadhav_29_05_2026.pdf</p>
                        <p style={{ fontSize: 12, color: '#16a34a', margin: 0 }}>Attached from <code>backend/assets/</code> — used automatically if no file is uploaded below</p>
                    </div>
                    <span style={{ color: '#16a34a', fontSize: 18 }}>✓</span>
                </div>

                {/* Optional override upload */}
                <div
                    onClick={() => fileRef.current.click()}
                    style={{ border: '1.5px dashed #cbd5e1', borderRadius: 10, padding: '0.875rem', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📎</div>
                    <div>
                        <p style={{ fontWeight: 500, fontSize: 13, margin: 0 }}>{resume ? resume.name : 'Upload a different PDF (optional)'}</p>
                        <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{resume ? `${(resume.size / 1024).toFixed(0)} KB · will override the server file` : 'Click to browse'}</p>
                    </div>
                    {resume && (
                        <button onClick={e => { e.stopPropagation(); setResume(null); fileRef.current.value = '' }}
                            style={{ marginLeft: 'auto', background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 10px', fontSize: 12, cursor: 'pointer', color: '#64748b' }}>
                            Remove
                        </button>
                    )}
                </div>
                <input ref={fileRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handleFileChange} />
            </section>

            {/* Error / info message */}
            {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: '1rem', color: '#dc2626', fontSize: 14 }}>
                    {error}
                </div>
            )}

            {/* Send button */}
            <button
                onClick={handleSend}
                disabled={loading || emails.length === 0}
                style={{
                    width: '100%', background: loading || emails.length === 0 ? '#93c5fd' : '#1e40af',
                    color: '#fff', border: 'none', borderRadius: 10, padding: '14px',
                    fontSize: 15, fontWeight: 600, cursor: loading || emails.length === 0 ? 'not-allowed' : 'pointer'
                }}>
                {loading
                    ? `Sending… (${results.length} / ${emails.length})`
                    : `Send to ${emails.length} recipient${emails.length !== 1 ? 's' : ''}`}
            </button>

            {/* Results */}
            {results.length > 0 && (
                <section style={{ marginTop: '1.5rem', ...s.card }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <p style={s.label}>Send Results</p>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {sentCount > 0 && <span style={s.badge('#15803d', '#dcfce7')}>✓ {sentCount} sent</span>}
                            {failedCount > 0 && <span style={s.badge('#dc2626', '#fee2e2')}>✗ {failedCount} failed</span>}
                        </div>
                    </div>
                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                        {results.map(r => (
                            <div key={r.email} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '7px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13
                            }}>
                                <span style={{ color: '#374151' }}>{r.email}</span>
                                <span style={{ color: r.status === 'sent' ? '#16a34a' : '#dc2626', fontWeight: 500, whiteSpace: 'nowrap', marginLeft: 8 }}>
                                    {r.status === 'sent' ? '✓ Sent' : `✗ ${r.error}`}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}