// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AccountWithChildren } from '@polkadot/extension-base/background/types';

import { Container, Grid } from '@mui/material';
import React, { useMemo } from 'react';

import { useTranslation } from '../../hooks';
import getParentNameSuri from '../../util/getParentNameSuri';
import AccountPreview from './AccountPreview';

interface Props extends AccountWithChildren {
  parentName?: string;
}

export default function AccountsTree({ parentName, suri, ...account }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const parentNameSuri = getParentNameSuri(parentName, suri);

  const label = useMemo(
    (): string | undefined => {
      if (account?.isHardware) {
        return t('Ledger');
      }

      if (account?.isExternal) {
        return t('Address only');
      }

      if (account?.parentAddress) {
        return t('Derived from {{parentNameSuri}}', { replace: { parentNameSuri } });
      }

      return undefined;
    },
    [account, parentNameSuri, t]
  );

  return (
    <>
      <Container className='tree' disableGutters sx={{ borderColor: 'secondary.light', borderTopStyle: account?.parentAddress ? 'dashed' : 'solid', borderTopWidth: '1px', position: 'relative' }}      >
        <Grid item sx={{ bgcolor: '#454545', color: 'white', fontSize: '10px', ml: 3, position: 'absolute', px: 1, width: 'fit-content' }}>
          {label}
        </Grid>
        <AccountPreview
          {...account}
          parentName={parentName}
          suri={suri}
        />
      </Container>
      {account?.children?.map((child, index) => (
        <AccountsTree
          key={`${index}:${child.address}`}
          {...child}
          parentName={account.name}
        />
      ))}
    </>
  );
}
