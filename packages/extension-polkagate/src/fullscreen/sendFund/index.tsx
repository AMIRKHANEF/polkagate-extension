// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AnyTuple } from '@polkadot/types/types';

import { Grid } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';

import { SubmittableExtrinsicFunction } from '@polkadot/api/types';
import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { BN } from '@polkadot/util';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { useBalances, useChain, useFullscreen } from '../../hooks';
import { FullScreenHeader } from '../governance/FullScreenHeader';
import InputPage from './InputPage';
import Review from './Review';

export const STEPS = {
  INDEX: 0,
  REVIEW: 1,
  WAIT_SCREEN: 2,
  CONFIRM: 3,
  PROXY: 100
};

export interface Inputs {
  amount: string | undefined;
  call: SubmittableExtrinsicFunction<'promise', AnyTuple> | undefined;
  params: unknown[] | (() => unknown[]);
  recipientAddress: string | undefined;
  recipientGenesisHashOrParaId: string | undefined;
  totalFee?: BN;
  recipientChainName: string | undefined;
}
type StepsType = typeof STEPS[keyof typeof STEPS];

export default function SendFund (): React.ReactElement {
  useFullscreen();
  const { address, assetId } = useParams<{ address: string, assetId: string }>();
  const chain = useChain(address);
  const ref = useRef(chain);
  const history = useHistory();

  const parsedAssetId = assetId === undefined || assetId === 'undefined' ? undefined : parseInt(assetId);
  const [refresh, setRefresh] = useState<boolean>(false);
  const balances = useBalances(address, refresh, setRefresh, undefined, parsedAssetId);

  const [step, setStep] = useState<StepsType>(STEPS.INDEX);
  const [inputs, setInputs] = useState<Inputs>();

  useEffect(() => {
    cryptoWaitReady().then(() => keyring.loadAll({ store: new AccountsStore() })).catch(() => null);
  }, []);

  useEffect(() => {
    /** To remove assetId from the url when chain has changed */
    if (!chain) {
      return;
    }

    if (ref.current && ref.current !== chain) {
      history.push({
        pathname: `/send/${address}`
      });
      setInputs(undefined);
      setStep(STEPS.INDEX); // to return back to index when change is changed on review of confirm page!
    }

    ref.current = chain;
  }, [address, chain, history]);

  return (
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader page='send' />
      <Grid container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', height: 'calc(100vh - 70px)', maxWidth: '840px', overflow: 'scroll' }}>
        {(step === STEPS.INDEX) &&
          <InputPage
            address={address}
            assetId={parsedAssetId}
            balances={balances}
            inputs={inputs}
            setInputs={setInputs}
            setStep={setStep}
          />
        }
        {(step === STEPS.REVIEW || step === STEPS.WAIT_SCREEN || step === STEPS.CONFIRM || step === STEPS.PROXY) &&
          <Review
            address={address}
            balances={balances}
            inputs={inputs}
            setRefresh={setRefresh}
            setStep={setStep}
            step={step}
          />
        }
      </Grid>
    </Grid>
  );
}
