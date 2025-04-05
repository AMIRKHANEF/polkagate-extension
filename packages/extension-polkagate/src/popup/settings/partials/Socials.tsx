// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, type SxProps, Typography, useTheme } from '@mui/material';
import React from 'react';

import { useIsDark } from '../../../hooks';
import { Discord, Docs, Email, Github, Web, XIcon, YoutubeIcon } from '../icons';
import SocialIcon from './SocialIcon';

interface Props {
  short?: boolean;
  label?: string;
  buttonSize?: number;
  iconSize?: number;
  style?: SxProps;
}

export default function Socials ({ buttonSize, iconSize = 18, label, short, style = {} }: Props): React.ReactElement {
  const theme = useTheme();
  const isDark = useIsDark();

  const bgColor = short && !isDark ? '#CCD2EA' : undefined;

  return (
    <Grid container item sx={{ ...style }}>
      {label &&
        <Typography
          color='label.secondary'
          mb='8px'
          mt='10px'
          sx={{ display: 'block', textAlign: short ? 'left' : 'center' }}
          variant='H-4'
        >
          {label}
        </Typography>}
      <Grid columnGap='8px' container item justifyContent={short ? 'flex-start' : 'center'}>
        <SocialIcon Icon={<YoutubeIcon color={theme.palette.icon.secondary} width={`${iconSize}px`} />} bgColor={bgColor} link='https://www.youtube.com/@polkagate' size={buttonSize} />
        <SocialIcon Icon={<XIcon color={theme.palette.icon.secondary} width={`${iconSize - 2}px`} />} bgColor={bgColor} link='https://x.com/polkagate' size={buttonSize} />
        <SocialIcon Icon={<Discord color={theme.palette.icon.secondary} width={`${iconSize}px`} />} bgColor={bgColor} link='https://discord.gg/gsUrreJh' size={buttonSize} />
        <SocialIcon Icon={<Github color={theme.palette.icon.secondary} width={`${iconSize}px`} />} bgColor={bgColor} link='https://github.com/PolkaGate/' size={buttonSize} />
        {!short && <>
          <SocialIcon Icon={<Email color={theme.palette.icon.secondary} width={`${iconSize}px`} />} link='mailto:support@polkagate.xyz' size={buttonSize} />
          <SocialIcon Icon={<Docs color={theme.palette.icon.secondary} width={`${iconSize}px`} />} link='https://docs.polkagate.xyz/' size={buttonSize} />
          <SocialIcon Icon={<Web color={theme.palette.icon.secondary} width={`${iconSize}px`} />} link='https://polkagate.xyz/' size={buttonSize} />
        </>
        }
      </Grid>
    </Grid>
  );
}
