export default function ConnectionStatus({ status, error }) {
  if (status === 'live') {
    return (
      <div className="connection-status connection-live">
        ● Live — Firebase Realtime Database
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="connection-status connection-error">
        ● Offline — {error || 'Firebase error'}.
        Check Realtime Database rules (read/write must be allowed).
      </div>
    )
  }

  return (
    <div className="connection-status connection-connecting">
      ● Connecting to Firebase…
    </div>
  )
}
