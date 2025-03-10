// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import type { SoloSettings } from '../../../../../util/types';

export default function getPayee(settings: SoloSettings): string | undefined {
  if (settings.payee === 'Stash') {
    return settings?.stashId && String(settings.stashId);
  }

  if (settings.payee === 'Controller') {
    return settings?.controllerId && String(settings.controllerId);
  }

  return settings.payee?.Account ? String(settings.payee.Account) : undefined;
}
