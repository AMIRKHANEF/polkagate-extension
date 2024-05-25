// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';

import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon } from '@mui/icons-material';
import { Divider, Grid, IconButton, Theme, Typography } from '@mui/material';
import React from 'react';

import { noop } from '@polkadot/extension-polkagate/src/util/utils';
import { BN } from '@polkadot/util';

import { FormatPrice, ShowBalance } from '../../../components';

interface DisplayBalanceProps {
  amount: BN | Balance | undefined;
  title: string;
  token: string | undefined;
  decimal: number | undefined;
  price: number | undefined;
  onClick?: () => void;
  theme?: Theme;
  disabled?: boolean;
}

export default function DisplayBalance ({ amount, decimal, disabled, onClick, price, theme, title, token }: DisplayBalanceProps): React.ReactElement {
  return (
    <Grid alignItems='center' container item justifyContent='space-between' sx={{ bgcolor: 'background.paper', borderRadius: '5px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', p: '15px 40px' }}>
      <Typography fontSize='18px' fontWeight={400}>
        {title}
      </Typography>
      <Grid alignItems='center' container item width='fit-content'>
        <Grid item sx={{ fontSize: '22px', fontWeight: 600 }}>
          <ShowBalance
            balance={amount}
            decimal={decimal}
            decimalPoint={3}
            token={token}
            withCurrency
          />
        </Grid>
        <Divider orientation='vertical' sx={{ backgroundColor: 'text.primary', height: '35px', mx: '10px', my: 'auto' }} />
        <Grid item sx={{ '> div span': { display: 'block' }, fontSize: '22px', fontWeight: 400 }}>
          <FormatPrice
            amount={amount}
            decimals={decimal}
            price={price}
            skeletonHeight={20}
          />
        </Grid>
        {onClick && theme &&
          <Grid item m='auto' pl='8px'>
            <IconButton
              onClick={disabled ? noop : onClick}
              sx={{ p: '8px' }}
            >
              <ArrowForwardIosRoundedIcon
                sx={{
                  color: disabled ? 'text,disabled' : 'secondary.light',
                  fontSize: '24px',
                  stroke: `${disabled ? theme.palette.text.disabled : theme.palette.secondary.light}`,
                  strokeWidth: 1.5
                }}
              />
            </IconButton>
          </Grid>
        }
      </Grid>
    </Grid>
  );
}
