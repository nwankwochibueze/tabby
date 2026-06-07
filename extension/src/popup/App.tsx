import { useState, useEffect } from 'react';
import type { TabGroup } from '@tabby/types';
import { SquaresFour } from '@phosphor-icons/react';
import ContextIcon from '../components/ContextIcon';
import CountBadge from '../components/CountBadge';
import CTAButton from '../components/CTAButton';

// ─── Component ───────────────────────────────────────────────

const App = () => {
  const [groups, setGroups] = useState<TabGroup[]>([]);


  useEffect(() => {
    chrome.storage.local.get(['groups'], (result) => {
      setGroups((result['groups'] as TabGroup[]) ?? []);
    });

    const handleStorageChange = (
      changes: Record<string, chrome.storage.StorageChange>
    ) => {
      if (changes['groups']) {
        setGroups((changes['groups'].newValue as TabGroup[]) ?? []);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  // ── Total tab count ──────────────────────────────────────
  const totalTabs = groups.reduce((sum, g) => sum + g.tabs.length, 0);

  const openSidePanel = () => {
    chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
    window.close();
  };

  // ── Render ───────────────────────────────────────────────

  return (
    <div style={{
      width: 'var(--popup-width)',
      background: 'var(--bg-base)',
      fontFamily: 'var(--font-family)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
        padding: '12px var(--spacing-lg)',
        borderBottom: '1px solid var(--border-default)',
      }}>
        {/* Logo mark */}
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: 'var(--radius-sm)',
          background: 'linear-gradient(135deg, var(--context-work), var(--context-research))',
          flexShrink: 0,
        }} />
        <span style={{
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--text-primary)',
          flex: 1,
        }}>
          Tabby
        </span>
        <CountBadge count={totalTabs} />
      </div>

      {/* Body */}
      <div style={{
        padding: 'var(--spacing-md) var(--spacing-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md)',
      }}>

        {/* Distribution bar */}
      
        {totalTabs > 0 && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 'var(--spacing-sm)',
            }}>
              <span style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                Tab Distribution
              </span>
              <span style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--text-secondary)',
              }}>
                Active Session
              </span>
            </div>

            {/* Segments */}
            <div style={{
              display: 'flex',
              gap: '2px',
              height: '6px',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
            }}>
              {groups.map((group) => (
                <div
                  key={group.id}
                  style={{
                    flex: group.tabs.length,
                    background: group.color,
                    borderRadius: 'var(--radius-full)',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Context list */}
       
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-xs)',
        }}>
          {groups.map((group) => (
            <div
              key={group.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
                padding: '8px var(--spacing-md)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              <ContextIcon context={group.context} size={16} />
              <span style={{
                flex: 1,
                fontSize: 'var(--font-size-md)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--text-primary)',
              }}>
                {group.label}
              </span>
              <CountBadge count={group.tabs.length} />
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--border-default)' }} />

        {/* CTA Button */}
        <CTAButton
          onClick={openSidePanel}
          icon={<SquaresFour size={16} color="white" weight="fill" />}
        >
          Open Tab Map
        </CTAButton>

        {/* Last sync */}
        <div style={{
          textAlign: 'center',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--text-muted)',
          fontWeight: 'var(--font-weight-regular)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          Last Sync: Just now
        </div>

      </div>
    </div>
  );
};

export default App;