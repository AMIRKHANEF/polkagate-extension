// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';

import Sparkles from '../components/SVG/Sparkles';
import { useManifest, useTranslation } from '../hooks';
import { GradientDivider } from '../style';

export default function Version (): React.ReactElement {
  const { t } = useTranslation();
  const version = useManifest()?.version;

  const [hovered, setHovered] = useState<boolean>(false);

  const toggleHovered = useCallback(() => setHovered((isHovered) => !isHovered), []);

  return (
    <Grid alignItems='center' container item justifyContent='center' sx={{ columnGap: '5px', py: '24px' }}>
      <Typography color='#BEAAD880' fontFamily='Inter' fontSize='13px' fontWeight={500} lineHeight='18.2px'>
        {t('Version')}
      </Typography>
      <Typography color='#BEAAD880' fontFamily='Inter' fontSize='13px' fontWeight={500} lineHeight='18.2px'>
        {version}
      </Typography>
      <GradientDivider orientation='vertical' />
      <Sparkles color={hovered ? '#AA83DC' : '#FF4FB9'} height={12} width={12} />
      <Typography color={hovered ? '#AA83DC' : '#BEAAD8'} fontFamily='Inter' fontSize='13px' fontWeight={500} lineHeight='18.2px' onMouseEnter={toggleHovered} onMouseLeave={toggleHovered} sx={{ cursor: 'pointer', textDecoration: hovered ? 'underline' : 'none' }}>
        {t('What’s new page')}
      </Typography>
    </Grid>
  );
}
