// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import settings from '@polkadot/ui-settings';

import { useTranslation } from '../../../../components/translate';
import MySwitch from '../components/Switch';

export default function EnableCamera (): React.ReactElement {
  const { t } = useTranslation();

  const onChange = useCallback((_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    settings.set({ camera: checked ? 'on' : 'off' });
  }, []);

  return (
    <Stack direction='column'>
      <Typography
        color='rgba(190, 170, 216, 1)'
        mb='5px'
        mt='15px'
        sx={{ display: 'block', textAlign: 'left' }}
        variant='H-4'
      >
        CAMERA ACCESS
      </Typography>
      <Grid
        alignItems='center'
        columnGap='8px'
        container
        justifyContent='flex-start'
        pt='7px'
      >
        <MySwitch
          checked={settings.camera === 'on'}
          onChange={onChange}
        />
        <Typography
          variant='B-1'
        >
          {t('Enable Camera Access')}
        </Typography>
      </Grid>
    </Stack>
  );
}
