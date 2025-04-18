// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, IconButton, Typography, useTheme } from '@mui/material';
import React, { } from 'react';

interface Props {
  title: string;
  icon: any;
  divider?: boolean;
  onClick: () => void;
  exceptionWidth?: number;
  textDisabled?: boolean;
  iconMarginTop?: string;
  labelMarginTop?: string;
  titleFontSize?: number;
  titleLineHeight?: number;
  dividerHeight?: number;
  textSelected?: boolean;
}

export default function HorizontalMenuItem({ divider = false, dividerHeight = 30, exceptionWidth = 0, icon, iconMarginTop, labelMarginTop = '0px', onClick, textDisabled, textSelected, title, titleFontSize = 12, titleLineHeight = 1.5 }: Props): React.ReactElement {
  const theme = useTheme();

  return (
    <>
      <Grid container direction='column' item justifyContent='center' maxWidth={exceptionWidth !== 0 ? `${exceptionWidth}px` : 'fit-content'} onClick={!textDisabled && onClick} sx={{ cursor: 'pointer' }}>
        <Grid container item justifyContent='center'>
          <IconButton sx={{ alignSelf: 'center', m: iconMarginTop ? `${iconMarginTop} 0 0 0` : 'auto', p: 0, transform: 'scale(0.9)', width: 'fit-content', opacity: textDisabled && 0.7 }}>
            {icon}
          </IconButton>
        </Grid>
        <Grid item textAlign='center'>
          <Typography fontSize={`${titleFontSize}px`} fontWeight={theme.palette.mode === 'dark' ? 300 : 400} lineHeight={titleLineHeight} sx={{ color: textSelected && 'secondary.light', pt: '3px', mt: labelMarginTop, opacity: textDisabled && 0.7 }}>
            {title}
          </Typography>
        </Grid>
      </Grid>
      {divider &&
        <Grid alignItems='center' item justifyContent='center'>
          <Divider orientation='vertical' sx={{ bgcolor: 'text.primary', height: `${dividerHeight}px`, m: '7px 2px 0', width: '2px' }} />
        </Grid>
      }
    </>
  );
}
