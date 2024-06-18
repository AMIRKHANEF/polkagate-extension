// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { useTranslation } from '../../../hooks';
import type { AccountsOrder } from '..';
import { getStorage, setStorage, watchStorage } from '../../../components/Loading';

interface Props {
  orderedAccounts: AccountsOrder[] | undefined;
}

interface TabProps {
  text: string;
  onClick: (event: any) => void;
}

function Tab({ text, onClick }: TabProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const [profile, setProfile] = useState<string>();

  useEffect(() => {
    getStorage('profile').then((res) => {
      setProfile(res as string || t('All'));
    }).catch(console.error);

    watchStorage('profile', setProfile).catch(console.error);
  }, []);

  return (
    <Grid item onClick={onClick}
      sx={{
        cursor: 'pointer',
        mx: '1px',
        pb: '2px',
        px: '20px',
        bgcolor: 'background.paper',
        borderBottomLeftRadius: '12px',
        WebkitBorderBottomRightRadius: '12px',
        minWidth: '100px',
        borderBottom: profile === text ?`1.5px solid ${theme.palette.secondary.light}`: undefined
      }}>
      <Typography color={'text.primary'} fontSize='14px' fontWeight={400} textAlign='center'>
        {text}
      </Typography>
    </Grid>
  );
}

export default function ProfileTabs({ orderedAccounts }: Props): React.ReactElement {
  const { t } = useTranslation();

  const hasLocal = useMemo(() =>
    orderedAccounts?.find(({ account }) => !account.isExternal)
    , [orderedAccounts]);

  const hasWatchOnly = useMemo(() =>
    orderedAccounts?.find(({ account }) => account.isExternal && !account.isQR && !account.isHardware)
    , [orderedAccounts]);

  const hasQrAttached = useMemo(() =>
    orderedAccounts?.find(({ account: { isQR } }) => isQR)
    , [orderedAccounts]);

  const onTabClick = useCallback((event: any) => {
    setStorage('profile', event.target.innerText);
  }, []);

  return (
    <Grid container item justifyContent='left' sx={{ bgcolor: 'backgroundFL.secondary', maxWidth: '1282px', px: '20px' }}>
      <Tab
        text={t('All')}
        onClick={onTabClick}
      />
      {hasLocal &&
        <Tab
          text={t('Local')}
          onClick={onTabClick}
        />
      }
      {hasWatchOnly &&
        <Tab
          text={t('Watch Only')}
          onClick={onTabClick}
        />
      }
      {hasQrAttached &&
        <Tab
          text={t('QR-attached')}
          onClick={onTabClick}
        />
      }
    </Grid>
  );
}

