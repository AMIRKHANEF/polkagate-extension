// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @description
 * this component shows ..
 * */

import '@vaadin/icons';

import type { ApiPromise } from '@polkadot/api';
import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { Balance } from '@polkadot/types/interfaces';

import { Grid, SxProps, Theme, useTheme } from '@mui/material';
import React from 'react';

import { BN } from '@polkadot/util';

import { ChainLogo } from '../../../components';
import { useTranslation } from '../../../hooks';
import BalanceFee from './BalanceFee';

interface Props {
  balanceLabel: string;
  balanceType?: string;
  balances?: DeriveBalancesAll | null | undefined;
  genesisHash: string | undefined;
  api: ApiPromise | undefined;
  fee: Balance | undefined;
  balance?: BN;
  style?: SxProps<Theme> | undefined;
}

export default function Asset({ api, balance, balanceLabel, balanceType, balances, fee, genesisHash, style = { pt: '10px' } }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Grid
      container
      item
      sx={style}
      xs={12}
    >
      <div style={{ fontSize: '16px', fontWeight: 300, letterSpacing: '-0.015em' }}>
        {t('Asset')}
      </div>
      <Grid
        alignItems='center'
        container
        item
        justifyContent='space-between'
        sx={{ border: 1, borderColor: 'primary.main', borderRadius: '5px', background: `${theme.palette.background.paper}`, p: '5px 10px' }}
      >
        <Grid
          container
          item
          xs={1.5}
        >
          <ChainLogo
            genesisHash={genesisHash}
            size={31}
          />
        </Grid>
        <Grid
          container
          item
          sx={{ fontSize: '16px', fontWeight: 300 }}
          xs={5}
        >
          <Grid item>
            {balanceLabel}
            <br />
            {t('Fee')}
          </Grid>
        </Grid>
        <Grid
          container
          item
          justifyContent='flex-end'
          xs
        >
          <BalanceFee
            api={api}
            balance={balance}
            balances={balances}
            fee={fee}
            type={balanceType}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}