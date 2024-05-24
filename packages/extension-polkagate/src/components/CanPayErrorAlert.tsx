// Copyright 2019-2024 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, useTheme } from '@mui/material';
import React from 'react';

import { useTranslation } from '../hooks';
import { CanPayStatements } from '../util/types';
import { Warning } from '.';

export default function CanPayErrorAlert ({ canPayStatements }: { canPayStatements: CanPayStatements }): React.ReactElement {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Grid alignItems='center' container height='35px'>
      <Warning
        fontWeight={400}
        isDanger
        marginTop={0}
        theme={theme}
      >
        {canPayStatements === CanPayStatements.CAN_NOT_PAY_FEE && t<string>('Insufficient balance to cover transaction fee.')}
        {canPayStatements === CanPayStatements.PROXY_CAN_PAY_FEE && t<string>('Selected proxy account lacks funds for the fee.')}
        {canPayStatements === CanPayStatements.CAN_NOT_PAY && t<string>('Insufficient balance to complete the transaction.')}
        {canPayStatements === CanPayStatements.CAN_NOT_PAY_DEPOSIT && t<string>('Insufficient balance for transaction deposit.')}
      </Warning>
    </Grid>
  );
}
