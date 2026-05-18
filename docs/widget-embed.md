# RAGaaS Chat Widget Embed

Use the script embed when the widget should be hideable and expandable. It starts as a compact launcher, opens the iframe on click, expands to a larger popup from the widget header, and restores the launcher when the widget close button is pressed.

```html
<!-- RAGaaS Chat Widget -->
<script>
  (function () {
    var side = 'right';
    var widgetUrl = 'https://ragaasa.wonderfulgrass-8f1852aa.eastasia.azurecontainerapps.io/widget.html?projectId=98216fc0-28f6-4ee1-848a-da0079830c4b&tenant=TQU3HC&title=Application+Support+Chatbot+Agent&primaryColor=%2318837e&welcomeMessage=%F0%9F%91%8B+Hello%21+How+can+I+help+you+today%3F&showTeamTag=true';
    var widgetTitle = 'Application Support Chatbot Agent';
    var iframe;
    var launcher;
    var expanded = false;

    function createLauncher() {
      launcher = document.createElement('button');
      launcher.type = 'button';
      launcher.setAttribute('aria-label', 'Open ' + widgetTitle);
      launcher.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path fill="currentColor" d="M4 5.5C4 4.12 5.12 3 6.5 3h11C18.88 3 20 4.12 20 5.5v7c0 1.38-1.12 2.5-2.5 2.5H10l-4.4 3.3c-.66.5-1.6.03-1.6-.8V5.5Zm2.5-.5a.5.5 0 0 0-.5.5v10l3.33-2.5h8.17a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5h-11Z"/></svg>';
      launcher.style.cssText = [
        'position: fixed',
        side + ': 20px',
        'bottom: 20px',
        'width: 44px',
        'height: 44px',
        'padding: 0',
        'border: 0',
        'border-radius: 50%',
        'background: #18837e',
        'color: #fff',
        'display: flex',
        'align-items: center',
        'justify-content: center',
        'box-shadow: 0 8px 32px rgba(0,0,0,0.28)',
        'cursor: pointer',
        'z-index: 9999'
      ].join('; ');
      launcher.onclick = openWidget;
      document.body.appendChild(launcher);
    }

    function openWidget() {
      if (launcher) launcher.style.display = 'none';
      if (iframe) {
        iframe.style.display = 'block';
        applyIframeSize();
        return;
      }
      iframe = document.createElement('iframe');
      iframe.src = widgetUrl;
      iframe.title = widgetTitle;
      iframe.allow = 'clipboard-write';
      iframe.style.cssText = [
        'position: fixed',
        side + ': 20px',
        'bottom: 20px',
        'border: 0',
        'border-radius: 16px',
        'box-shadow: 0 8px 32px rgba(0,0,0,0.3)',
        'z-index: 9999',
        'background: transparent',
        'transition: width 180ms ease, height 180ms ease'
      ].join('; ');
      applyIframeSize();
      document.body.appendChild(iframe);
    }

    function applyIframeSize() {
      if (!iframe) return;
      iframe.style.width = expanded
        ? 'min(900px, calc(100vw - 32px))'
        : 'min(400px, calc(100vw - 32px))';
      iframe.style.height = expanded
        ? 'min(760px, calc(100vh - 32px))'
        : 'min(600px, calc(100vh - 32px))';
    }

    window.addEventListener('message', function (event) {
      if (event.data && event.data.type === 'ragaas-widget:close') {
        expanded = false;
        if (iframe) iframe.style.display = 'none';
        if (launcher) launcher.style.display = 'block';
      }
      if (event.data && event.data.type === 'ragaas-widget:resize') {
        expanded = !!event.data.expanded;
        applyIframeSize();
      }
    });

    createLauncher();
  })();
</script>
```

Branding notes:

- The widget header shows only the configured title. It no longer renders the `RAGaaS assistant` eyebrow.
- The header mark uses the Bosch logo treatment instead of the previous plus icon.
- `showTeamTag=true` still controls the footer attribution tag.
