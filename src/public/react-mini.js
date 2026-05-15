(function () {
  var rootElement = document.getElementById('reactMiniRoot');
  if (!rootElement || typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
    return;
  }

  var e = React.createElement;

  function MiniReactBanner() {
    return e(
      'div',
      {
        style: {
          border: '1px solid rgba(115, 146, 63, 0.28)',
          background: 'rgba(138, 170, 79, 0.1)',
          color: '#355015',
          borderRadius: '999px',
          padding: '8px 12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.82rem',
          fontWeight: '600'
        }
      },
      e('span', { 'aria-hidden': 'true' }, 'React ready:'),
      e('strong', null, 'No-build root mounted on this page')
    );
  }

  ReactDOM.createRoot(rootElement).render(e(MiniReactBanner));
})();
