// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DropdownOption } from '@polkadot/extension-polkagate/util/types';

import { useEffect, useRef } from 'react';
import { shallowEqual } from 'react-redux';

import { useGenesisHashOptions } from '@polkadot/extension-polkagate/src/hooks';
import { useAppDispatch } from '@polkadot/extension-polkagate/src/store/hooks';
import { setGenesisHashOptions } from '@polkadot/extension-polkagate/src/store/slices/genesisHashOptionsSlice';

export default function GenesisHashOptionsBridge() {
  const dispatch = useAppDispatch();
  const options = useGenesisHashOptions();

  const prev = useRef<DropdownOption[]>([]);

  useEffect(() => {
    if (!prev.current || !shallowEqual(prev.current, options)) {
      prev.current = options;
      dispatch(setGenesisHashOptions(options));
    }
  }, [options, dispatch]);

  return null;
}
