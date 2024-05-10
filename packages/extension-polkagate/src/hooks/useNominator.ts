// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { NominatorInfo } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';
import { BN } from '@polkadot/util';

import { useInfo, useStashId } from '.';

export default function useNominator (address: string): NominatorInfo | undefined {
  const { endpoint, formatted } = useInfo(address);
  const stashId = useStashId(formatted);

  const [nominatorInfo, setNominatorInfo] = useState<NominatorInfo | undefined>();

  const getNominatorInfo = useCallback((endpoint: string, stakerAddress: AccountId | string) => {
    const getNominatorInfoWorker: Worker = new Worker(new URL('../util/workers/getNominatorInfo.js', import.meta.url));

    getNominatorInfoWorker.postMessage({ endpoint, stakerAddress });

    getNominatorInfoWorker.onerror = (err) => {
      console.log(err);
    };

    getNominatorInfoWorker.onmessage = (e: MessageEvent<any>) => {
      const nominatorInfo = e.data as NominatorInfo;

      nominatorInfo.minNominated = new BN(nominatorInfo.minNominated);

      setNominatorInfo(nominatorInfo);
      getNominatorInfoWorker.terminate();
    };
  }, []);

  useEffect(() => {
    stashId && endpoint && getNominatorInfo(endpoint, stashId);
  }, [stashId, endpoint, getNominatorInfo]);

  return nominatorInfo;
}
