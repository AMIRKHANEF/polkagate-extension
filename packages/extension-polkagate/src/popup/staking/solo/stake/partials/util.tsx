// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SoloSettings } from '../../../../../util/types';

export default function getPayee(settings: SoloSettings): string | undefined {
  if (settings.payee === 'Stash') {
    return String(settings.stashId);
  }

  if (settings.payee === 'Controller') {
    return String(settings.controllerId);
  }

  return settings.payee?.Account ? String(settings.payee.Account) : undefined;
}