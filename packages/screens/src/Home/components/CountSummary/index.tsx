import { faBell } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActiveCount, CountGroup, NotifyCount } from './Wrappers';
import type { ChainEventSubscription } from '@polkadot-live/types';

export const CountSummary = ({
  subs,
  badgeColor,
}: {
  subs: ChainEventSubscription[];
  badgeColor: string;
}) => {
  const activeCount = subs.filter((s) => s.enabled).length;
  const notifyCount = subs.filter((s) => s.enabled && s.osNotify).length;

  return (
    <CountGroup>
      <ActiveCount $color={badgeColor} $active={activeCount > 0}>
        {activeCount}
      </ActiveCount>

      <NotifyCount $color={badgeColor} $active={notifyCount > 0}>
        <FontAwesomeIcon
          icon={faBell}
          style={{ marginRight: '6px', fontSize: '0.9rem' }}
        />
        <span>{notifyCount}</span>
      </NotifyCount>
    </CountGroup>
  );
};
