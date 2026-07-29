export default function ConnectionStatus({ status, error }) {
  if (status === 'live') {
    return (
      <div className="connection-status connection-live animate-in">
        <span className="pulse-dot" />
        Live · Firebase
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="connection-status connection-error animate-in">
        Offline · {error || 'Check database rules'}
      </div>
    )
  }

  return (
    <div className="connection-status connection-connecting animate-in">
      Connecting…
    </div>
  )
}
