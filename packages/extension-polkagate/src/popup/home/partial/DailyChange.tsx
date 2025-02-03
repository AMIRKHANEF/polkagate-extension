// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Container, Skeleton, type SxProps, type Theme, Typography } from '@mui/material';
import { ArrowDown2, ArrowUp2 } from 'iconsax-react';
import React, { memo, useCallback, useMemo } from 'react';

import { FormatPrice } from '../../../components';
import { PORTFOLIO_CHANGE_DECIMAL } from '../../../fullscreen/homeFullScreen/partials/TotalBalancePieChart';
import { useIsHideNumbers, useYouHave } from '../../../hooks';
import { COIN_GECKO_PRICE_CHANGE_DURATION } from '../../../util/api/getPrices';
import { formatDecimal } from '../../../util/utils';

const RenderSkeleton = memo(function RenderSkeleton() {
  return (
    <Skeleton
      animation='wave'
      height='20px'
      sx={{ fontWeight: 'bold', transform: 'none', width: '122px' }}
      variant='text'
    />
  );
});

function DailyChange (): React.ReactElement {
  const youHave = useYouHave();
  const { isHideNumbers } = useIsHideNumbers();

  const portfolioChange = useMemo(() => {
    if (youHave?.change === undefined) {
      return undefined;
    }

    const value = formatDecimal(youHave.change, PORTFOLIO_CHANGE_DECIMAL, false, true);

    return parseFloat(value);
  }, [youHave?.change]);

  const containerStyle: SxProps<Theme> = {
    alignItems: 'center',
    bgcolor: portfolioChange && portfolioChange > 0
      ? '#FF165C26'
      : portfolioChange && portfolioChange < 0
        ? '#82FFA526'
        : '#AA83DC26',
    borderRadius: '9px',
    columnGap: '3px',
    display: 'flex',
    m: 0,
    p: '3px 6px',
    width: 'fit-content'
  };

  const color = useCallback((change: number | undefined) => {
    return !change
      ? '#AA83DC'
      : change > 0
        ? '#82FFA5'
        : '#FF165C';
  }, []);

  if (portfolioChange === undefined) {
    return <RenderSkeleton />;
  }

  return (
    <Container disableGutters sx={containerStyle}>
      {youHave?.change && youHave.change > 0
        ? <ArrowUp2 color={color(youHave?.change)} size='15' variant='Bold' />
        : youHave?.change && youHave.change < 0
          ? <ArrowDown2 color={color(youHave?.change)} size='15' variant='Bold' />
          : null
      }
      <FormatPrice
        commify
        fontFamily='Inter'
        fontSize={'13px'}
        fontWeight={500}
        num={portfolioChange}
        skeletonHeight={14}
        textColor={color(youHave?.change)}
        width='fit-content'
      />
      {!isHideNumbers &&
        <Typography style={{ color: color(youHave?.change), fontFamily: 'Inter', fontSize: '14px', fontWeight: 900, lineHeight: '15px' }}>
          •
        </Typography>}
      <Typography style={{ color: color(youHave?.change), lineHeight: '15px' }} variant='B-1'>
        {`${COIN_GECKO_PRICE_CHANGE_DURATION}h`}
      </Typography>
    </Container>
  );
}

export default DailyChange;
